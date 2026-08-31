// The default scope — nominally the US National EMS Scope of Practice Model
// 2019 (+CN 1.0/2.0), but per operator note this is being corrected by hand:
// this file used to be COMPUTED from drugs.js/procedures.js's own `.lvl`
// fields; it's now a real, independent, editable table (matching how every
// other scope file in this folder works) so it can be fixed directly here
// without touching the drug/procedure data files at all. Every drug and
// procedure action in the game reads its required level through
// effectiveLvl(id, baseLvl, scope) (scopes/engine.js), which checks THIS
// table first — editing a number below takes effect immediately, the next
// time the app reloads.
//
// 0 = Layperson   1 = EMR   2 = EMT   3 = AEMT   4 = Paramedic   5 = Unlimited
export default {
  id: "national2019",
  name: "National Model 2019 (default)",
  levels: {
    // ── MEDICATIONS ──
    naloxone_in: 0,        // Naloxone (IN)
    naloxone_im: 1,        // Naloxone (IM)
    naloxone_iv: 2,        // Naloxone (IV)
    epiAuto: 1,           // Epinephrine auto-injector
    duodote: 1,           // DuoDote auto-injector
    aspirin: 2,           // Aspirin 324 mg
    oralGlucose: 2,       // Oral Glucose 15 g
    albuterol: 2,         // Albuterol 5 mg
    ipratropium: 2,       // Ipratropium 0.5 mg
    epiIM: 3,             // Epinephrine 0.5 mg (1:1000)
    nebEpi: 3,            // Epinephrine (nebulized) 5 mg (1:1000) — queue item 60, same tier as epiIM
    nitroOwn: 2,          // Nitroglycerin — patient's own
    nitrous: 2,           // Nitrous oxide (Entonox)
    otcAnalgesic: 2,      // OTC analgesic (paracetamol/ibuprofen)
    nitro: 3,             // Nitroglycerin 0.4 mg
    saline: 3,            // Normal Saline 500 mL
    d10: 3,               // Dextrose 10% 125 mL
    glucagon: 3,          // Glucagon 1 mg
    fentanyl: 3,          // Fentanyl 50 mcg
    morphine: 3,          // Morphine 4 mg
    ondansetron: 3,       // Ondansetron 4 mg
    epiIV: 3,             // Epinephrine 1 mg (0.1 mg/mL)
    ketamine: 4,          // Ketamine
    ketorolac: 4,         // Ketorolac 15 mg
    acetaminophenIV: 4,   // Acetaminophen 1 g
    amiodarone: 4,        // Amiodarone 300 mg
    lidocaine: 4,         // Lidocaine
    atropine: 4,          // Atropine 1 mg
    adenosine: 4,         // Adenosine 12 mg
    diltiazem: 4,         // Diltiazem 20 mg
    metoprolol: 4,        // Metoprolol 5 mg
    calcium: 4,           // Calcium Chloride 1 g
    bicarb: 4,            // Sodium Bicarbonate 50 mEq
    vasopressin: 4,       // Vasopressin 40 U
    pushEpi: 4,           // Push-dose Epinephrine
    dexamethasone: 4,     // Dexamethasone 10 mg
    diphen: 4,            // Diphenhydramine 50 mg
    metoclopramide: 4,    // Metoclopramide 10 mg (queue item 66)
    midazolam: 4,         // Midazolam 5 mg
    magnesium: 4,         // Magnesium Sulfate 4 g
    txa: 4,               // Tranexamic Acid 1 g
    hydroxo: 4,           // Hydroxocobalamin 5 g
    oxytocin: 4,          // Oxytocin 10 U
    heparin: 4,           // Heparin
    thrombolytic: 4,      // Thrombolytic (alteplase)
    norepi: 5,            // Norepinephrine infusion
    phenylephrine: 5,     // Phenylephrine
    blood: 5,             // Whole Blood 500 mL
    plasma: 5,            // Plasma 500 mL
    plasmalyte: 5,        // Plasma-Lyte 500 mL
    etomidate: 5,         // Etomidate 20 mg
    rocuronium: 5,        // Rocuronium 100 mg

    // ── PROCEDURES ──
    headTilt: 0,          // Head-tilt / chin-lift
    jawThrust: 0,         // Jaw-thrust
    mouthMask: 0,         // Mouth-to-mask (pocket mask)
    mouthMouth: 0,        // Mouth-to-mouth / barrier
    cpr: 0,               // Chest compressions
    lucas: 2,             // Mechanical CPR device (LUCAS)
    pads: 0,              // Apply defib/AED pads
    aedAnalyze: 0,        // AED — analyze rhythm
    aedShock: 0,          // AED — deliver shock
    recovery: 0,          // Recovery position
    abdThrust: 0,         // Back blows / abdominal thrusts
    directPressure: 0,    // Direct pressure
    tq: 0,                // Tourniquet
    pack: 0,              // Wound packing
    opa: 1,                // Oropharyngeal airway
    bvm: 1,                // Bag-valve-mask
    o2nc: 1,               // Oxygen — nasal cannula
    o2nrb: 1,              // Oxygen — NRB 15 L/min
    suction: 1,            // Suction — upper airway
    manualBP: 1,           // Blood pressure — manual
    cCollar: 1,            // Cervical collar
    splint: 1,             // Extremity splinting
    chestSeal: 1,          // Vented chest seal
    pelvicBinder: 1,       // Pelvic binder
    warm: 1,               // Active warming
    npa: 2,                // Nasopharyngeal airway
    sga: 3,                // Supraglottic airway (i-gel / King LT)
    cpap: 2,               // CPAP
    pulseox: 2,            // Pulse oximeter
    autoBP: 2,             // Blood pressure — automated (background)
    glucometer: 2,         // Blood glucose
    ecgAcquire: 2,         // 12-lead — acquire and transmit
    traction: 2,           // Traction splint
    iv: 3,                 // IV — 18g antecubital
    io: 3,                 // IO — humeral head
    etco2: 3,              // Waveform capnography
    ecgRead: 4,            // 12-lead — INTERPRET
    defib: 4,              // Defibrillate 200 J (manual)
    cardiovert: 4,         // Synchronised cardioversion
    pacing: 4,             // Transcutaneous pacing
    ett: 4,                // Endotracheal intubation
    laryngoscopy: 4,       // Direct laryngoscopy — Magill forceps
    cric: 4,               // Cricothyrotomy
    needleD: 4,            // Needle decompression
    valsalva: 4,           // Valsalva maneuver
    chestTube: 5,          // Tube thoracostomy
    vent: 5,               // Transport ventilator
    ultrasound: 5,         // Ultrasound (eFAST)
    reboa: 5,              // REBOA
    paCath: 5,             // Pulmonary artery catheter
    artLine: 5,            // Arterial line
  },
};
