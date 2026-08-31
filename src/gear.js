export const PI={
  CPMI:{n:"Chest Pain — STEMI"}, CPSC:{n:"Chest Pain — Suspected Cardiac",hint:"NSTEMI, pericarditis, DISSECTION"},
  CPNC:{n:"Chest Pain — Not Cardiac"}, CHFF:{n:"Pulmonary Edema / CHF"},
  SOBB:{n:"Respiratory Distress / Bronchospasm",hint:"asthma, COPD"},
  RDOT:{n:"Respiratory Distress / Other",hint:"pneumonia, PE, pneumothorax"},
  RARF:{n:"Respiratory Arrest / Failure",base:1},
  CHOK:{n:"Airway Obstruction",base:1}, DYSR:{n:"Cardiac Dysrhythmia"},
  CANT:{n:"Cardiac Arrest — Non-traumatic",base:1}, TRMA:{n:"Traumatic Injury"},
  ODPO:{n:"Overdose / Poisoning"}, HOTN:{n:"Hypotension",base:1},
  SHOK:{n:"Shock",base:1}, ALOC:{n:"ALOC",base:1},
  ANPH:{n:"Anaphylaxis",base:1}, ALRX:{n:"Allergic Reaction"},
  SEPS:{n:"Sepsis"}, FEVR:{n:"Fever"},
  ABDP:{n:"Abdominal Pain"}, SEIZ:{n:"Seizure"},
  // Found while auditing impressions for this batch's new scenarios: five
  // scenarios across at least two prior sessions (acquiredLongQT and others
  // predating this batch, plus this batch's own atrialFibrillationRVR/
  // atrialFlutter) already declared "ANXY" in their imps array, but no such
  // key ever existed in this registry — App.jsx's impression-picker reads
  // `PI[k].n` with no optional chaining, so picking this impression on any
  // of those five calls would throw (Cannot read properties of undefined)
  // and crash the impression screen. A real, previously-undiscovered,
  // crash-causing defect, not a decorative gap — fixed by adding the entry
  // those five scenarios were always assuming existed.
  ANXY:{n:"Anxiety / Panic Attack"},
  // The registry had no obstetric category at all, so a hypertensive disorder
  // of pregnancy could only be filed as a seizure or an altered mental status —
  // both of which are consequences of it rather than the impression.
  OBEM:{n:"Obstetrical Emergency",hint:"preeclampsia/eclampsia, hemorrhage, delivery"},
  // No existing code fit a severe, non-traumatic pain syndrome whose primary
  // teaching point IS the pain itself (sickle cell vaso-occlusive crisis) —
  // ABDP is abdomen-specific and this pain is often extremity/back/joint.
  PMGT:{n:"Pain Management — Non-Traumatic"},
  HEAT:{n:"Heat Illness / Hyperthermia"},
  // Deliberately NOT CHOK: croup/epiglottitis are infectious upper airway
  // obstructions, not a foreign body — treating one as a foreign body
  // obstruction (back blows/abdominal thrusts) would be actively wrong and
  // is a real, important distinction to keep separate in the picker.
  UAWI:{n:"Upper Airway Infection (Croup / Epiglottitis)"},
  // Neuro/endocrine batch (queue item 7). No existing code fit a focal
  // neurologic deficit (stroke screens are their own category, distinct
  // from generic ALOC) or a diabetic emergency spanning both hyper- and
  // hypoglycemic presentations.
  STRK:{n:"Stroke / Suspected CVA",base:1},
  DIAB:{n:"Diabetic Emergency"},
  // HEAT already covers hyperthermia; nothing in this registry covered the
  // opposite direction until accidentalHypothermia (queue item 7) needed it.
  HYTH:{n:"Hypothermia / Cold Exposure",base:1},
  // Queue item 57 (copperheadBite, ENV-014): no existing code fit an
  // envenomation — ODPO is toxin exposure generically but reads as
  // ingestion/overdose, not a bite with a real local-tissue-injury and
  // coagulopathy mechanism distinct from that. Found the same way ANXY's
  // own comment above already documented once: App.jsx's impression picker
  // reads `PI[k].n` with no optional chaining, so a scenario declaring an
  // undefined code crashes the picker on selection, not just displays
  // wrong — added before the scenario referencing it, not after.
  ENVN:{n:"Envenomation (Bite / Sting)"},
  // Queue item 66 (acuteDystonicReactionCall, TP 1239/1239-P): no existing
  // code fit a drug-induced dystonic reaction — ODPO reads as ingestion/
  // overdose, ALOC/SEIZ are both wrong (this patient is neither altered nor
  // seizing), and STRK is actively misleading, since the whole teaching
  // point is that a FAST-negative dystonic reaction is a stroke MIMIC, not a
  // stroke. Added before the scenario referencing it, per ENVN's own
  // precedent above (App.jsx's `PI[k].n` picker has no optional chaining).
  DYST:{n:"Dystonic Reaction (Drug-Induced)"},
};
export const POCKETS={shears:{name:"Trauma shears",note:"Cut to what you cannot see."},
  penlight:{name:"Penlight",note:"Pupils."},scope:{name:"Stethoscope",note:"Heart, lungs, manual BP."},
  marker:{name:"Sharpie",note:"Times and doses, on the patient."},tq:{name:"Tourniquet",note:"One, folded."},
  glucometer:{name:"Glucometer",note:"Sixty seconds to rule out the great mimic.",min:2},
  pocketMask:{name:"Pocket mask",note:"The one thing that lets a layperson ventilate."}};
export const BAGS={monitor:{name:"Monitor",carry:"hand",note:"12-lead, cuff, SpO₂, EtCO₂, pads"},
  drug:{name:"Drug box",carry:"hand",note:"IV/IO kit, fluids, formulary"},
  airway:{name:"Airway bag",carry:"back",note:"O₂, BVM, OPA/NPA, SGA, suction"},
  trauma:{name:"Trauma bag",carry:"back",note:"Dressings, TQs, seals, decompression"},
  // Chapter 1's foot-patrol Layperson kit — not a real EMS bag, a volunteer
  // patroller's basic kit. App.jsx forces this as the ONLY bagChoices entry
  // for that one context; every other consumer of BAGS is unaffected.
  backpack:{name:"Backpack",carry:"back",note:"Gloves, dressings, CPR mask, a tourniquet — a volunteer patroller's basic kit"}};
// Every real EMS bag EXCEPT "backpack" — the Layperson-only kit above.
// `bagsForVehicle()`'s own "null = unrestricted (full loadout)" fallback
// (fleet.js) used to resolve to plain `Object.keys(BAGS)`/`Object.entries(BAGS)`
// at every one of its call sites, which silently included "backpack" as a
// pickable/fetchable/mergeable bag for EVERY vehicle type fleet.js doesn't
// explicitly restrict — i.e. every ordinary BLS/ALS ambulance, fire engine,
// etc: any non-Layperson provider, not just the one Chapter-1 foot-patrol
// context this bag was actually built for. Use this instead of
// `Object.keys(BAGS)`/`Object.entries(BAGS)` wherever "the real EMS bag
// list" is meant, so the leak can't recur at a new call site either.
export const STANDARD_BAG_KEYS=Object.keys(BAGS).filter(k=>k!=="backpack");
export const RN={head:"Head & face",neck:"Neck",torso:"Chest",abdo:"Abdomen",armL:"Left arm",armR:"Right arm",legL:"Left leg",legR:"Right leg"};
export const TASKS=[
  {id:"cpr",name:"Compressions",lvl:0,dur:25,readback:'"Compressions, copy."',report:'"Compressions running. Good depth, minimal pauses."',dose:"cpr"},
  {id:"lucas",name:"Apply mechanical CPR device (LUCAS)",lvl:1,dur:45,readback:'"Applying the LUCAS."',report:'"LUCAS is on and cycling. Your hands are free."',dose:"lucas"},
  {id:"bvm",name:"Ventilate — one every six seconds",lvl:1,dur:25,readback:'"Bagging, one every six. Copy."',report:'"Chest is rising and falling. I am letting {obj} exhale."',dose:"bvm"},
  {id:"mouthMask",name:"Ventilate with the pocket mask",lvl:0,dur:25,readback:'"Pocket mask, copy."',report:'"I can see the chest going up."',dose:"mouthMask"},
  {id:"suction",name:"Suction the airway",lvl:1,dur:20,readback:'"Suctioning."',report:'"Clear."',sets:{suctioned:1}},
  {id:"vitals",name:"Full set of vitals",lvl:1,dur:25,readback:'"Full set, copy."',vitals:1},
  {id:"monitor",name:"Monitor vitals — continuous",lvl:1,dur:9999,monitor:true,readback:'"On the monitor. I will keep the numbers live and call out changes."'},
  // doneKey:"ecgAcquire" — a crew member acquiring the 12-lead needs to mark
  // the SAME s.done key the player's own ecgAcquire action sets (via the
  // generic start() handler in App.jsx), or any check that reads
  // s.done.ecgAcquire (e.g. scenarios.js's "No twelve-lead acquired" debrief
  // note) stays true even after the crew genuinely acquired one — the
  // crew-order path never went through start() at all.
  // attachDevice registers the SAME s.devices[id] entry the player's own
  // deviceActs() attach_<id> actions do (App.jsx) — a real, previously-
  // undiscovered gap this batch closes: applying leads used to only
  // acquire the 12-lead strip, never actually attaching the ECG-leads
  // device, so MONITOR_DEVICES (the prerequisite the "Monitor vitals" task
  // and the assess-before-treat gate both check) could never be satisfied
  // by a crew member — only the player's own hands could attach a device.
  {id:"leads",name:"Apply leads / acquire 12-lead",lvl:2,dur:25,readback:'"Leads on, acquiring."',report:'"Twelve-lead is on the screen."',attachDevice:"leads",sets:{leadsOn:1},doneKey:"ecgAcquire"},
  {id:"attachPulseOx",name:"Attach pulse oximeter",lvl:2,dur:12,readback:'"Pulse ox on."',report:'"Pulse ox is on and reading."',attachDevice:"pulseox"},
  {id:"attachBpCuff",name:"Apply the BP cuff",lvl:1,dur:12,readback:'"Cuff on."',report:'"Cuff is on, ready to cycle."',attachDevice:"bpcuff"},
  {id:"prep",name:"Draw up the next drug",lvl:2,dur:25,readback:'"Drawing up."',report:'"Drawn, labeled, and in your hand."',sets:{prepped:1}},
  {id:"cspine",name:"Hold manual C-spine",lvl:0,dur:9999,readback:'"I have the head."',report:""},
  {id:"fetch",name:"Fetch a bag from the truck",lvl:0,dur:25,readback:'"On my way."',fetch:1},
  {id:"iv",name:"Establish IV access",lvl:3,dur:25,readback:'"Getting a line."',report:'"No good site left — every limb already has a line."',ivAttempt:1},
  {id:"tq",name:"Tourniquet / pressure",lvl:0,dur:8,readback:'"Tourniquet, copy."',report:'"No good limb left — every limb already has one on."',tqAttempt:1},
  {id:"airwayKit",name:"Assemble the airway kit",lvl:1,dur:25,readback:'"Setting it out."',report:'"Bougie, tube, syringe, suction to hand."'},
  {id:"report",name:"Write the run sheet",lvl:2,dur:25,readback:'"I have the sheet."',report:'"Report is written. One less thing."'},
  {id:"crowd",name:"Move the bystanders back",lvl:0,dur:25,readback:'"On it."',report:'"They are behind the truck. You have room to work."'},
  // LA County Treatment Protocols implementation (src/protocols/laCounty.js).
  // These were added to let a protocol rule direct exactly the intervention
  // the real protocol names, rather than approximating it with the closest
  // pre-existing generic task. Each `dose` id below is a real key in
  // src/data/drugs.js or src/data/procedures.js — giveDose() looks the id up
  // directly (physio.js/pk.js), so a task that doesn't match a real drug/
  // procedure id would silently do nothing when a crew member "completed" it.
  {id:"o2",name:"Administer oxygen — NRB",lvl:1,dur:12,readback:'"High-flow O2, copy."',report:'"Non-rebreather on, fifteen liters."',dose:"o2nrb"},
  {id:"glucoseCheck",name:"Check blood glucose",lvl:2,dur:25,readback:'"Checking sugar."',glucoseCheck:1},
  {id:"oralGlucose",name:"Oral glucose",lvl:2,dur:25,readback:'"Glucose gel, copy."',report:'"He took it. Should come up in a few minutes."',dose:"oralGlucose"},
  {id:"dextrose",name:"Dextrose 10% IV/IO",lvl:3,dur:25,readback:'"D-ten, going in."',report:'"D-ten is in. Rechecking sugar."',dose:"d10"},
  {id:"glucagonIM",name:"Glucagon IM",lvl:3,dur:15,readback:'"Glucagon, IM, copy."',report:'"One milligram, IM. No line for D-ten."',dose:"glucagon"},
  {id:"ondansetron",name:"Ondansetron 4mg",lvl:3,dur:15,readback:'"Zofran, copy."',report:'"Four milligrams on board."',dose:"ondansetron"},
  {id:"salineBolus",name:"Normal saline — rapid infusion",lvl:3,dur:20,readback:'"Fluids wide open."',report:'"Bag is wide open, watching for overload."',dose:"saline"},
  // Queue item 69 (laCounty.js's own conservative-fluid TP 1244 rule):
  // a smaller, permissive-hypotension bolus, distinct task/dose id from
  // salineBolus above so the two can never be confused or double-counted.
  {id:"salineMinorTask",name:"Normal saline 250mL — permissive hypotension",lvl:3,dur:20,readback:'"Two-fifty of saline, slow and steady."',report:'"Two-fifty in. Watching pressure, not chasing a number."',dose:"salineMinor"},
  // Queue item 70 (laCounty.js's TP 1244/TP 1232 head-of-bed elevation
  // step, previously a documented no-op — no mechanism existed for it to
  // do anything). `dose:"headElevate"` reuses the same procedures.js entry
  // the player's own action registers, so a crew member and the player can
  // both raise the same real pat.headElevated flag.
  {id:"headElevateTask",name:"Elevate head of bed 30°",lvl:0,dur:10,readback:'"Raising the head of the bed."',report:'"Head of the bed is up thirty degrees."',dose:"headElevate"},
  // Batch 2 (TP 1204/1205/1207/1210). `warm`/`activeCooling` are real,
  // already-shipped procedures.js entries that feed thermo.js's heat
  // balance — reused here, not invented.
  {id:"warmBlanket",name:"Apply warming blanket",lvl:1,dur:15,readback:'"Blankets on."',report:'"Wrapped and warm. Watching for shivering."',dose:"warm"},
  {id:"activeCoolingTask",name:"Active cooling (ice packs / misting)",lvl:1,dur:15,readback:'"Cooling him down."',report:'"Ice packs on, misting and fanning."',dose:"activeCooling"},
  // Queue item 55 — a genuinely separate, milder task for TP 1204's fever-
  // without-sepsis step (mere undressing/blanket removal, not the ice-pack
  // protocol above) — see procedures.js's own `passiveCooling` entry for
  // the mechanism/magnitude reasoning.
  {id:"passiveCoolingTask",name:"Passive cooling (remove excess clothing/blankets)",lvl:1,dur:15,readback:'"Getting these blankets off him."',report:'"Blankets off, watching for shivering."',dose:"passiveCooling"},
  {id:"applyPads",name:"Apply defib pads",lvl:0,dur:15,readback:'"Pads on."',report:'"Pads placed."',dose:"pads",doneKey:"pads"},
  {id:"defibrillate",name:"Defibrillate — 200J",lvl:4,dur:10,readback:'"Clear! Shocking."',report:'"Shock delivered."',dose:"defib"},
  {id:"epiArrest",name:"Epinephrine 1mg IV/IO",lvl:3,dur:20,readback:'"Epi, one milligram, copy."',report:'"Epi is in."',dose:"epiIV"},
  {id:"amiodarone",name:"Amiodarone 300mg IV/IO",lvl:4,dur:20,readback:'"Amiodarone, three hundred, copy."',report:'"Amiodarone is in."',dose:"amiodarone"},
  {id:"calciumChloride",name:"Calcium chloride 1g IV/IO",lvl:4,dur:20,readback:'"Calcium chloride, copy."',report:'"One gram of calcium is in."',dose:"calcium"},
  {id:"sodiumBicarb",name:"Sodium bicarbonate 50mEq IV/IO",lvl:4,dur:20,readback:'"Bicarb, copy."',report:'"Fifty of bicarb is in."',dose:"bicarb"},
  {id:"pushEpi",name:"Push-dose epinephrine",lvl:4,dur:20,readback:'"Push-dose epi, copy."',report:'"Push-dose epi is in, watching the pressure."',dose:"pushEpi"},
  // Batch 3 (TP 1217-P/1219(-P)/1220(-P)/1221(-P)/1222(-P)/1223(-P)/1224(-P)/
  // 1225(-P)): Pregnancy Complication, Allergy, Burns, Electrocution,
  // Hyperthermia, Hypothermia, Stings, Submersion. Same discipline as
  // batches 1-2 — every `dose` id is a real drugs.js/procedures.js key.
  {id:"magnesiumSulfate",name:"Magnesium sulfate 4g IV",lvl:4,dur:20,readback:'"Mag sulfate, copy."',report:'"Four grams of mag is running in."',dose:"magnesium"},
  {id:"midazolamSeizure",name:"Midazolam 5mg IV/IM",lvl:4,dur:15,readback:'"Versed, copy."',report:'"Five of Versed is in."',dose:"midazolam"},
  // No dose/procedure id — sets the same `leftLateralTilt` session flag
  // conditions.js's own traumaPregnant already reads (its comment: "Keep the
  // supine mother's position tied to a session flag the UI/tilt procedure
  // can set"). This IS that procedure, previously missing entirely — the
  // mechanism (aortocaval-compression relief) already existed with no way
  // to trigger it from real play.
  {id:"leftTilt",name:"Displace uterus leftward",lvl:0,dur:10,readback:'"Tilting her left."',report:'"She is tilted, off her back."',sets:{leftLateralTilt:1}},
  {id:"fundalMassage",name:"Fundal massage",lvl:2,dur:20,readback:'"Massaging the fundus."',report:'"Uterus is firming up under my hand."',dose:"fundalMassage"},
  {id:"epiIM",name:"Epinephrine 0.5mg IM",lvl:2,dur:15,readback:'"Epi IM, copy."',report:'"Epi is in, lateral thigh."',dose:"epiIM"},
  {id:"albuterolNeb",name:"Albuterol neb",lvl:2,dur:20,readback:'"Albuterol, copy."',report:'"Neb is running."',dose:"albuterol"},
  // Queue item 60 (nebulized-epi slice) — TP 1234/1234-P and TP 1236/1236-P's
  // own nebulized-epi step for stridor. lvl:3 mirrors epiIM's own crew-task
  // level a few lines above (a route difference of the same drug/mechanism
  // family, not a different scope tier), same convention this file's own
  // naloxoneArrest comment documents for gating crew capability off a drug's
  // clinical note rather than its raw drugs.js `.lvl`.
  {id:"nebEpiTask",name:"Nebulized epinephrine",lvl:3,dur:20,readback:'"Neb epi, copy."',report:'"Neb epi is running."',dose:"nebEpi"},
  {id:"diphenhydramine",name:"Diphenhydramine 50mg",lvl:4,dur:15,readback:'"Benadryl, copy."',report:'"Fifty of Benadryl is in."',dose:"diphen"},
  // Queue item 66: metoclopramide had no gear entry at all (the drug did not
  // exist in drugs.js either) — kept available for manual crew ordering, no
  // automatic protocol rule, matching diphenhydramine's own precedent above.
  {id:"metoclopramide",name:"Metoclopramide 10mg",lvl:4,dur:15,readback:'"Reglan, copy."',report:'"Ten of Reglan is in."',dose:"metoclopramide"},
  // Kept available for manual crew ordering even though laCounty.js has no
  // automatic rule for it — this engine's `iv` task doesn't distinguish
  // IV from IO access, so there's no honest predicate for "an IO was just
  // placed" to gate this on automatically. See laCounty.js's own comment.
  {id:"lidocaineIO",name:"Lidocaine — IO infusion pain",lvl:4,dur:15,readback:'"Lidocaine for the IO."',report:'"Lidocaine is in, should take the edge off."',dose:"lidocaine"},
  // Batch 4 (final) — TP 1236(-P), Inhalation Injury. `cpap` is a real,
  // already-shipped procedures.js entry (its own hold() already declares
  // hypotension a contraindication for the player-facing action; the
  // laCounty.js rule that assigns this excludes shock independently, since
  // a crew-directed dose bypasses hold()).
  {id:"cpapTask",name:"Initiate CPAP",lvl:2,dur:25,readback:'"Starting CPAP."',report:'"Mask is sealed, pressure is on."',dose:"cpap"},
  // Batch 5 — TP 1210's own complete text (steps 12/26, previously received
  // only through step 21). `amiodarone2` is a real, new drugs.js entry
  // (see its own comment there); `naloxone_iv` already existed.
  {id:"amiodaroneRepeat",name:"Amiodarone 150mg IV/IO (repeat)",lvl:4,dur:20,readback:'"Amiodarone repeat, one-fifty, copy."',report:'"Second dose of amiodarone is in."',dose:"amiodarone2"},
  // lvl:3 (AEMT), matching naloxone_iv's own note ("AEMT/Paramedic scope")
  // rather than its raw drugs.js lvl:2 field, which gates the player's drug
  // MENU differently from how TASKS.lvl gates crew capability (established
  // convention throughout this file — see e.g. epiIM/albuterolNeb above).
  {id:"naloxoneArrest",name:"Naloxone IV/IO",lvl:3,dur:15,readback:'"Narcan, copy."',report:'"Narcan is in."',dose:"naloxone_iv"},
  // Batch 6 — TP 1211 (Cardiac Chest Pain), TP 1212(-P) (Bradycardia),
  // TP 1213(-P) (Tachycardia), TP 1214 (Pulmonary Edema/CHF).
  {id:"aspirinTask",name:"Aspirin 325mg PO",lvl:2,dur:15,readback:'"Aspirin, chewed, copy."',report:'"He chewed and swallowed the aspirin."',dose:"aspirin"},
  {id:"nitroTask",name:"Nitroglycerin 0.4mg SL",lvl:3,dur:10,readback:'"Nitro, copy."',report:'"Nitro under the tongue, dissolving."',dose:"nitro"},
  // Fentanyl picked over morphine as the one crew-directable pain-management
  // task — the protocol names both as equivalent first-line options
  // ("Morphine OR fentanyl is preferred"), so this reuses the same
  // one-representative-drug idiom already established elsewhere in this
  // file (e.g. epiIM for anaphylaxis) rather than adding two tasks for a
  // clinically interchangeable choice.
  {id:"fentanylPain",name:"Fentanyl 50mcg IV/IM/IN",lvl:3,dur:15,readback:'"Fentanyl, copy."',report:'"Fifty of fentanyl is in."',dose:"fentanyl"},
  {id:"atropineTask",name:"Atropine 1mg IV/IO",lvl:4,dur:15,readback:'"Atropine, copy."',report:'"One milligram of atropine is in."',dose:"atropine"},
  {id:"pacingTask",name:"Transcutaneous pacing",lvl:4,dur:20,readback:'"Pacing, copy."',report:'"Pads placed, pacer capturing."',dose:"pacing"},
  {id:"adenosineTask",name:"Adenosine 12mg rapid IV push",lvl:4,dur:10,readback:'"Adenosine, copy."',report:'"Twelve of adenosine, pushed fast, flushed."',dose:"adenosine"},
  {id:"cardiovertTask",name:"Synchronized cardioversion",lvl:4,dur:15,readback:'"Sync cardioversion, copy."',report:'"Cardioverted."',dose:"cardiovert"},
  // Batch 7 — TP 1215(-P) (Childbirth Mother), TP 1216-P (Newborn/Neonate
  // Resuscitation), TP 1217/1217-P's new TXA step.
  {id:"txaTask",name:"Tranexamic acid 1g IV/IO",lvl:4,dur:20,readback:'"TXA, copy."',report:'"One gram of TXA is running in over ten minutes."',dose:"txa"},
  // No `dose` id — these three drive App.jsx's new `t.neoAction` crewFn
  // branch, which sets the SAME bespoke `pat._neo` flags the pph
  // scenario's own player-facing nbDry/nbBag/nbComp actions already use
  // (see that branch's own comment). lvl:0 (any provider, including a
  // layperson bystander) since drying/stimulating/bagging a newborn is
  // explicitly Layperson-taught content per TP 1216-P's own framing (the
  // most important intervention is "dry, warm, stimulate").
  {id:"newbornDry",name:"Dry & stimulate the newborn",lvl:0,dur:15,readback:'"Drying and stimulating."',neoAction:"stimulate"},
  {id:"newbornPpv",name:"Bag the newborn (PPV)",lvl:0,dur:20,readback:'"Bagging the newborn."',neoAction:"ppv"},
  {id:"newbornCompressions",name:"Newborn chest compressions (3:1)",lvl:1,dur:20,readback:'"Newborn compressions."',neoAction:"compressions"},
  // Queue item 65 — real NRP epinephrine indication (HR<60 despite
  // effective PPV+compressions), weight-scaled against the newborn's own
  // weight rather than a flat adult dose. lvl:4 (paramedic/IV-IO scope),
  // matching epiIV's own AEMT-closed-list note.
  {id:"newbornEpi",name:"Newborn epinephrine (weight-scaled IV/IO)",lvl:4,dur:20,readback:'"Newborn epi, copy."',neoAction:"epi"},
  // Batch 8 — TP 1237(-P) (Respiratory Distress), TP 1238(-P) (Carbon
  // Monoxide Exposure — no new rules, see laCounty.js's own header note),
  // TP 1239(-P) (Dystonic Reaction — no automatic rule, see the same note).
  {id:"needleDecompTask",name:"Needle decompression",lvl:4,dur:15,readback:'"Needle decompression, copy."',report:'"In. Air rushed out — pressure is off."',dose:"needleD"},
  // Batch 9 — TP 1240(-P) (HAZMAT), TP 1241(-P) (Overdose/Poisoning/
  // Ingestion), TP 1242(-P) (Crush Injury/Syndrome).
  {id:"duodoteTask",name:"DuoDote auto-injector IM",lvl:1,dur:15,readback:'"DuoDote, copy."',report:'"DuoDote is in."',dose:"duodote"},
  // No automatic protocol rule reaches this one yet. NOTE (queue item 7,
  // cyanidePoisoning): the reason laCounty.js's own comment gives — that
  // cyanide exposure has no representable trigger — is no longer true at the
  // physiology layer. pat.cytochromeBlock (patient.js) is now a real,
  // readable cyanide-toxicity signal and this drug has a real antidote
  // mechanism acting on it (drugs.js's fx.cytoBlock). Writing the actual
  // protocol rule is deliberately left as separate protocol-content work
  // rather than bolted onto a condition batch. The task itself already
  // works for manual crew ordering, same footing as lidocaineIO.
  {id:"hydroxoTask",name:"Hydroxocobalamin 5g IV/IO",lvl:4,dur:20,readback:'"Hydroxocobalamin, copy."',report:'"Hydroxocobalamin is running in."',dose:"hydroxo"},
  // Batch 11 — TP 1244(-P) (Traumatic Injury). `chestSeal` (procedures.js)
  // is a real, already-shipped mechanism: sealing a simple/open
  // pneumothorax (pat.ptx==="ptx") sets pat.chestSealApplied, which
  // conditions.js's own tension-progression check already reads to STOP
  // that patient's pneumothorax from progressing to tension — a real
  // consumer that had no crew-directable task pointing at it until now.
  {id:"chestSealTask",name:"Apply vented chest seal",lvl:1,dur:15,readback:'"Chest seal, copy."',report:'"Vented seal is on."',dose:"chestSeal"},
  // Crew AI batch. Previously a crew member could be told to give a drug but
  // never to check a pupil, run a stroke screen, or count a respiratory
  // rate — every exam-only action in src/actions.js had no crew-directable
  // equivalent (CLAUDE.md's own queue item 62). `assessId` points at the
  // REAL player-facing action of the same name; App.jsx's crewFn reuses that
  // action's own run()/probe composition directly, so this is real,
  // scenario-specific findings text, not a duplicated or invented one.
  // `lvl`/`dur` mirror the wrapped action's own `lvl`/`cost` — the same
  // real-world scope requirement and time cost apply whether the player or
  // a crew member does it.
  {id:"assessLoc",name:"Assess level of consciousness (AVPU)",lvl:0,dur:10,readback:'"Checking responsiveness."',assessId:"loc"},
  {id:"assessSkin",name:"Assess skin — color, temp, moisture",lvl:0,dur:15,readback:'"Checking his skin."',assessId:"skin"},
  {id:"assessPupils",name:"Check pupils",lvl:0,dur:10,readback:'"Checking pupils."',assessId:"pupils"},
  {id:"assessStroke",name:"Run a stroke screen (FAST)",lvl:0,dur:15,readback:'"Running a stroke screen."',assessId:"strokeScreen"},
  {id:"assessJvd",name:"Check for jugular venous distension",lvl:1,dur:20,readback:'"Checking her neck veins."',assessId:"jvd"},
  {id:"assessBreathing",name:"Check breathing — present/absent, odor",lvl:0,dur:2,readback:'"Checking breathing."',assessId:"breathingCheck"},
  {id:"assessResp",name:"Count respirations",lvl:0,dur:20,readback:'"Counting his respirations."',assessId:"countRespirations"},
  {id:"assessCapRefill",name:"Check capillary refill",lvl:0,dur:2,readback:'"Checking cap refill."',assessId:"capRefill"},
  {id:"assessReflexes",name:"Check deep tendon reflexes",lvl:1,dur:20,readback:'"Checking her reflexes."',assessId:"reflexes"},
  // QUEUE ITEMS 51/52 — TP 1209 (Behavioral/Psychiatric Crisis)'s own two
  // real drug-administration branches, now that ctx.v.agitation (neuro.js)
  // gives the protocol engine a real severity to gate on. Olanzapine is the
  // oral, cooperative-patient-first-line option; midazolam reuses the exact
  // same drugs.js/dose id the seizure task above already points at (a
  // shared physical drug — the SAME administration mechanism, a different
  // clinical indication in the task's own label — matching how this file's
  // saline/atropine entries are already shared across several protocols).
  {id:"olanzapineOdt",name:"Olanzapine 10mg ODT (agitation)",lvl:4,dur:15,readback:'"Olanzapine, ODT, copy."',report:'"Olanzapine dissolving tablet is in."',dose:"olanzapine"},
  {id:"midazolamAgitation",name:"Midazolam 5mg IM/IN (severe agitation)",lvl:4,dur:15,readback:'"Versed for agitation, copy."',report:'"Five of Versed given for agitation."',dose:"midazolam"},
  // Queue item 60, part 3 — a real crew-directable FBAO-clearance task.
  // Before this, the fbao-clearance mechanism (App.jsx's s.cleared, keyed
  // to the literal condition "fbao") was reachable ONLY through the
  // player's own hands (a special-cased CPR/laryngoscopy check inside
  // start(), plus that scenario's own scripted Magill-forceps extra) — no
  // TASKS entry let a crew member be DIRECTED to clear it, so laCounty.js's
  // airway-obstruction protocol rules fell back to the generic airway/CPR/
  // BVM life-threat rules rather than a true FBAO-specific step. Both
  // entries below route through the SAME s.cleared resolution App.jsx's
  // crewFn already calls for the player's own action (see the fbaoClear/
  // fbaoMagill branch there) — this file supplies the crew-facing label/
  // scope tier only, not a second clearance mechanism.
  // BLS tier: real 2020 AHA/NREMT guidance for an unconscious complete
  // FBAO is chest compressions THEMSELVES (they generate the intrathoracic
  // pressure spike that dislodges the bolus) — not back blows/abdominal
  // thrusts, which only apply to a conscious, standing patient. dose:"cpr"
  // so a directed compressor genuinely doses CPR the same way the
  // existing "cpr" task does, in addition to clearing the airway.
  {id:"fbaoClearBls",name:"Clear obstructed airway (compressions / back blows)",lvl:0,dur:25,fbaoClear:true,dose:"cpr",readback:'"On it. Compressions."',report:'"Airway is clear. It came up."'},
  // ALS tier: direct laryngoscopy + Magill forceps under direct
  // visualization — the definitive removal, matching the scope tier
  // (bag:"airway", lvl 4) fbao's own scenario-local "clearFB" player extra
  // already requires.
  {id:"fbaoMagillClear",name:"Direct laryngoscopy + Magill forceps (visualized FBAO)",lvl:4,dur:30,fbaoMagill:true,readback:'"Laryngoscopy and forceps, copy."',report:'"Blade in, forceps out. It\'s clear."'},
];

// Concise, cumulative capability lists for the partner-select screen (§1).
export const CAPS={
  layperson:["Chest compressions (CPR)","AED — apply pads, analyze, shock","Pocket-mask ventilation","Direct pressure & tourniquet","Intranasal naloxone"],
  emr:["Everything a layperson can, plus:","BVM, OPA, suction, O₂","Manual blood pressure","IN naloxone","No IV line, no drugs from a box"],
  emt:["Everything an EMR can, plus:","NPA, SGA, CPAP","Pulse oximetry, glucometry","Nebulisers, aspirin, IM epinephrine","Acquire a 12-lead (may NOT interpret it)","Still no needle"],
  aemt:["Everything an EMT can, plus:","IV / IO access","IV fluids","Waveform capnography","A CLOSED list of IV drugs","Cannot interpret a monitor"],
  paramedic:["Everything an AEMT can, plus:","12-lead INTERPRETATION","Manual defibrillation & pacing","Intubation, cricothyrotomy","The full drug box"],
  unlimited:["Physician / CCP scope","Every drug, every procedure","Blood, RSI, thoracostomy, REBOA","No gates of any kind"],
};
