// ─── SCOPE AUTHORING TEMPLATE ──────────────────────────────────────────────
// Copy this file to a new name in this same folder (e.g. `texasEms.js`) and
// fill in `levels`. Any file in src/scopes/ that default-exports
// {id, name, levels} is picked up automatically — dropping the file in is
// the whole installation step. Files starting with "_" (like this one) and
// engine.js/index.js are the only names that don't get auto-registered.
//
// ── THE SHAPE, EXACTLY ─────────────────────────────────────────────────────
//   export default {
//     id:     "unique_snake_case_id",   // used as the Settings selection key
//     name:   "Human-Readable Name",    // shown in the Settings picker
//     levels: {
//       itemId: lvl,                    // the level THIS scope requires —
//       ...                             // list EVERY item, not just the ones
//     }                                 // that differ from some other scope
//   };
//
// ── EVERY SCOPE IS INDEPENDENT — THIS IS NOT A DIFF ────────────────────────
// A scope file does NOT inherit from national2019.js or lean on it as a
// fallback for anything you didn't get around to listing. It is a complete,
// standalone statement of what THIS jurisdiction actually allows, at every
// level, for every item — written from the real document you're converting,
// not from what the National Model happens to say. Two scope files should be
// able to disagree about an item completely and neither is "wrong" for not
// matching the other. (There is one narrow crash-safety fallback in
// engine.js for a genuinely missing id — see its own comment — but treat
// that as a bug to fix in your table, not a feature to author against.)
//
// `newLvl`/`lvl` is the certification level THIS scope requires for that
// item, matching scope.js's LEVELS:
//   0 = Layperson   1 = EMR   2 = EMT   3 = AEMT   4 = Paramedic   5 = Unlimited
//
// ── EVERY ITEM ID IN THE GAME, RIGHT NOW ───────────────────────────────────
// These are pulled directly from src/data/drugs.js and src/data/procedures.js
// — use these exact ids. If this list is ever out of date (a future session
// added a new drug/procedure after this template was last regenerated),
// prefer the real files over this comment, but this should cover everything
// as of when this template was written.
//
// MEDICATIONS (id — name — National Model 2019 default level):
//   naloxone_in (Naloxone IN, 0) · naloxone_im (Naloxone IM, 1) ·
//   naloxone_iv (Naloxone IV, 2) · epiAuto (Epinephrine auto-injector, 1) ·
//   duodote (DuoDote auto-injector, 1) · aspirin (Aspirin 324 mg, 2) ·
//   oralGlucose (Oral Glucose 15 g, 2) · albuterol (Albuterol 5 mg, 2) ·
//   ipratropium (Ipratropium 0.5 mg, 2) · epiIM (Epinephrine 0.5 mg 1:1000, 2) ·
//   nitroOwn (Nitroglycerin — patient's own, 2) · nitrous (Nitrous oxide/Entonox, 2) ·
//   otcAnalgesic (OTC analgesic — paracetamol/ibuprofen, 2) ·
//   nitro (Nitroglycerin 0.4 mg, 3) · saline (Normal Saline 500 mL, 3) ·
//   d10 (Dextrose 10% 125 mL, 3) · glucagon (Glucagon 1 mg, 3) ·
//   fentanyl (Fentanyl 50 mcg, 3) · morphine (Morphine 4 mg, 3) ·
//   ondansetron (Ondansetron 4 mg, 3) · epiIV (Epinephrine 1 mg 0.1 mg/mL, 3) ·
//   ketamine (Ketamine, 4) · ketorolac (Ketorolac 15 mg, 4) ·
//   acetaminophenIV (Acetaminophen 1 g, 4) · amiodarone (Amiodarone 300 mg, 4) ·
//   lidocaine (Lidocaine, 4) · atropine (Atropine 1 mg, 4) ·
//   adenosine (Adenosine 12 mg, 4) · diltiazem (Diltiazem 20 mg, 4) ·
//   metoprolol (Metoprolol 5 mg, 4) · calcium (Calcium Chloride 1 g, 4) ·
//   bicarb (Sodium Bicarbonate 50 mEq, 4) · vasopressin (Vasopressin 40 U, 4) ·
//   pushEpi (Push-dose Epinephrine, 4) · dexamethasone (Dexamethasone 10 mg, 4) ·
//   diphen (Diphenhydramine 50 mg, 4) · midazolam (Midazolam 5 mg, 4) ·
//   magnesium (Magnesium Sulfate 4 g, 4) · txa (Tranexamic Acid 1 g, 4) ·
//   hydroxo (Hydroxocobalamin 5 g, 4) · oxytocin (Oxytocin 10 U, 4) ·
//   heparin (Heparin, 4) · thrombolytic (Thrombolytic/alteplase, 4) ·
//   norepi (Norepinephrine infusion, 5) · phenylephrine (Phenylephrine, 5) ·
//   blood (Whole Blood 500 mL, 5) · plasma (Plasma 500 mL, 5) ·
//   plasmalyte (Plasma-Lyte 500 mL, 5) · etomidate (Etomidate 20 mg, 5) ·
//   rocuronium (Rocuronium 100 mg, 5)
//
// PROCEDURES (id — name — National Model 2019 default level):
//   headTilt (Head-tilt/chin-lift, 0) · jawThrust (Jaw-thrust, 0) ·
//   mouthMask (Mouth-to-mask, 0) · mouthMouth (Mouth-to-mouth/barrier, 0) ·
//   cpr (Chest compressions, 0) · lucas (Mechanical CPR device/LUCAS, 1) ·
//   pads (Apply defib/AED pads, 0) ·
//   aedAnalyze (AED — analyze rhythm, 0) · aedShock (AED — deliver shock, 0) ·
//   recovery (Recovery position, 0) · abdThrust (Back blows/abdominal thrusts, 0) ·
//   directPressure (Direct pressure, 0) · tq (Tourniquet, 0) ·
//   pack (Wound packing, 0) · opa (Oropharyngeal airway, 1) ·
//   bvm (Bag-valve-mask, 1) · o2nc (Oxygen — nasal cannula, 1) ·
//   o2nrb (Oxygen — NRB 15 L/min, 1) · suction (Suction — upper airway, 1) ·
//   manualBP (Blood pressure — manual, 1) · cCollar (Cervical collar, 1) ·
//   splint (Extremity splinting, 1) · chestSeal (Vented chest seal, 1) ·
//   pelvicBinder (Pelvic binder, 1) · warm (Active warming, 1) ·
//   npa (Nasopharyngeal airway, 2) · sga (Supraglottic airway, 2) ·
//   cpap (CPAP, 2) · pulseox (Pulse oximeter, 2) ·
//   autoBP (Blood pressure — automated, 2) · glucometer (Blood glucose, 2) ·
//   ecgAcquire (12-lead — acquire/transmit, 2) · traction (Traction splint, 2) ·
//   iv (IV — 18g antecubital, 3) · io (IO — humeral head, 3) ·
//   etco2 (Waveform capnography, 3) · ecgRead (12-lead — INTERPRET, 4) ·
//   defib (Defibrillate 200 J manual, 4) · cardiovert (Synchronised cardioversion, 4) ·
//   pacing (Transcutaneous pacing, 4) · ett (Endotracheal intubation, 4) ·
//   laryngoscopy (Direct laryngoscopy/Magill forceps, 4) ·
//   cric (Cricothyrotomy, 4) · needleD (Needle decompression, 4) ·
//   valsalva (Valsalva maneuver, 4) · chestTube (Tube thoracostomy, 5) ·
//   vent (Transport ventilator, 5) · ultrasound (Ultrasound/eFAST, 5) ·
//   reboa (REBOA, 5) · paCath (Pulmonary artery catheter, 5) ·
//   artLine (Arterial line, 5)
//
// The level numbers above are the NATIONAL MODEL's own defaults, given only
// as a reference point for how the game currently categorizes each item —
// your scope should still be authored independently from the real document
// you're converting, not copied from this list.
//
// ── VERIFYING IT ACTUALLY CHANGED SOMETHING ────────────────────────────────
// A scope that changes nothing observable is worse than no scope at all — it
// looks authored but does nothing. Before trusting a new scope file: select
// it in Settings → Scope of Practice, open the item grid there for something
// you set differently than National, and confirm it now locks/unlocks at the
// level you specified — not just that the file loads.
//
// ── READY-TO-PASTE AI PROMPT ────────────────────────────────────────────────
// If you have a real, written EMS scope-of-practice document (a state
// protocol manual, a regional formulary, a personal cheat sheet of what your
// service actually allows at each level) and want it turned into a file in
// this exact format, paste the document text into an AI assistant together
// with the block below.
//
// """
// Convert the EMS scope-of-practice document I'm about to paste into a
// JavaScript module in this EXACT shape:
//
//   export default {
//     id: "snake_case_id",
//     name: "Human-Readable Region/Agency Name",
//     levels: {
//       "itemId": lvl,
//       ...
//     }
//   };
//
// Rules:
// - This scope must be a COMPLETE, INDEPENDENT table. List EVERY item id
//   from the list below with the level THIS document actually requires for
//   it — do not omit an item just because it happens to match the US
//   National EMS Scope of Practice Model 2019, and do not treat the National
//   Model as a fallback or default this table can lean on. Every entry
//   should come from what the pasted document says, not from what you
//   assume is standard.
// - `lvl` must be one of: 0 (Layperson), 1 (EMR), 2 (EMT), 3 (AEMT),
//   4 (Paramedic), 5 (Unlimited/physician). Use the closest match to what the
//   document actually says; if a level in the document doesn't map cleanly
//   (e.g. an "Advanced EMT" tier that only partially matches AEMT), pick the
//   nearest US equivalent and don't invent a new numeric level.
// - Use EXACTLY these ids — do not invent new ones or rename them:
//   MEDICATIONS: naloxone_in, naloxone_im, naloxone_iv, epiAuto, duodote, aspirin, oralGlucose, albuterol,
//   ipratropium, epiIM, nitroOwn, nitrous, otcAnalgesic, nitro, saline, d10,
//   glucagon, fentanyl, morphine, ondansetron, epiIV, ketamine, ketorolac,
//   acetaminophenIV, amiodarone, lidocaine, atropine, adenosine, diltiazem,
//   metoprolol, calcium, bicarb, vasopressin, pushEpi, dexamethasone, diphen,
//   midazolam, magnesium, txa, hydroxo, oxytocin, heparin, thrombolytic,
//   norepi, phenylephrine, blood, plasma, plasmalyte, etomidate, rocuronium.
//   PROCEDURES: headTilt, jawThrust, mouthMask, mouthMouth, cpr, lucas, pads,
//   aedAnalyze, aedShock, recovery, abdThrust, directPressure, tq, pack, opa,
//   bvm, o2nc, o2nrb, suction, manualBP, cCollar, splint, chestSeal,
//   pelvicBinder, warm, npa, sga, cpap, pulseox, autoBP, glucometer,
//   ecgAcquire, traction, iv, io, etco2, ecgRead, defib, cardiovert, pacing,
//   ett, laryngoscopy, cric, needleD, valsalva, chestTube, vent, ultrasound,
//   reboa, paCath, artLine.
// - If the pasted document does not mention a drug/procedure from that list
//   at all (silent on it, not explicitly restricting it), set that item's
//   level to 5 (Unlimited) rather than guessing a level for it — an item the
//   document never addresses should default to the MOST restrictive
//   selectable level, not the National Model's level, so nothing is
//   accidentally granted that the source document never actually authorized.
// - If the document names a real drug/procedure not on that list at all,
//   still include it under its own descriptive snake_case id — a human can
//   reconcile it with the game's data files afterward if it doesn't line up
//   with anything that exists yet.
// - Only emit the module — no explanation, no markdown fences, just the
//   JavaScript.
//
// Here is the scope-of-practice document to convert:
// <PASTE YOUR AGENCY/STATE SCOPE DOCUMENT HERE>
// """
//
// Save the AI's output as a new file in src/scopes/ and it will appear in
// Settings the next time the app reloads.

export default {
  id:"_template_example", name:"Template Example (not a real scope)",
  levels:{
    // A real scope lists EVERY item — this template only shows two, to
    // illustrate both directions a level can move relative to the National
    // Model's own default (shown in the reference list above), NOT because a
    // short table is an acceptable submission.
    epiAuto:0,   // National default is 1 (EMR); this fictional scope LOWERS
                 // it to 0 — a bystander may assist with a patient's OWN
                 // prescribed auto-injector.
    ett:5,       // National default is 4 (Paramedic); this fictional scope
                 // RAISES it to 5 — intubation reserved for a CCP/physician
                 // in this jurisdiction.
    // ...every other item id from the list above belongs here too.
  },
};
