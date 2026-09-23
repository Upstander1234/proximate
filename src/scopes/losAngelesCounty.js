// Los Angeles County, CA — converted from the county's own scope-of-practice
// documents (src/scopes/Raw Scope Sources/Los Angeles County/):
//   Ref. No. 802, EMT Scope of Practice (rev. 07-01-24)
//   Ref. No. 803, Paramedic Scope of Practice (rev. 07-01-26)
//
// LA County has no separate AEMT-tier scope document — Ref. 802's own
// PRINCIPLES §1 lists AEMT alongside EMT/Paramedic as a certification that
// lets someone "function as an EMT," and Ref. 803 §3 says a paramedic "may
// perform any activity identified in... EMT Scope of Practice" and then adds
// the paramedic-only list on top. There is no intermediate AEMT-specific
// grant anywhere in either document, so no item below lands on level 3
// (AEMT) — everything is either EMT (2) or Paramedic (4).
//
// Universally-recognized bystander/Stop-the-Bleed/hands-only-CPR/public-AED
// skills (CPR, AED, tourniquet, direct pressure, wound packing, basic airway
// positioning) are kept at Layperson (0), matching this project's own
// national2019.js baseline — neither document restricts these to certified
// personnel, and both frame their own EMT section as "authorized to do,"
// never "the only ones authorized to do."
//
// Everything Ref. 802/803 doesn't mention at all is set to 5 (Unlimited),
// per this folder's own authoring convention — an item this county's own
// documents never address should default to the MOST restrictive
// selectable level, not silently inherit the National Model's grant.
//
// 0 = Layperson   1 = EMR   2 = EMT   3 = AEMT   4 = Paramedic   5 = Unlimited
export default {
  id: "la_county_ca",
  name: "Los Angeles County, CA",
  levels: {
    // ── MEDICATIONS ──
    // Ref. 802 §III.A: EMT naloxone (incl. Leave Behind Naloxone, Ref. 1337)
    // is the county's own IN-route program; Ref. 803's paramedic route list
    // (IV/IO/IM/SC among others) is where IM/IV naloxone actually appears.
    naloxone_in: 2,        // EMT — Leave Behind Naloxone program, IN route
    naloxone_im: 4,        // Paramedic — "naloxone hydrochloride," IM route
    naloxone_iv: 4,        // Paramedic — IV route
    epiAuto: 2,            // EMT — assist patient's own + county-approved additional scope (Ref. 802 §I.E/§III.A)
    duodote: 4,            // Paramedic — nearest match to "pralidoxime chloride (2-PAMCl)"
    aspirin: 2,            // EMT — Ref. 802 §I.E.2 / §III.A
    oralGlucose: 2,        // EMT — Ref. 802 §I.B.5
    albuterol: 4,          // Paramedic — Ref. 803 "aerosolized/nebulized albuterol" (standalone, non-patient-owned)
    ipratropium: 5,        // not named anywhere in either document
    epiIM: 4,              // Paramedic — "epinephrine," IM route
    nebEpi: 5,             // not named anywhere in either document (queue item 60)
    nitroOwn: 2,           // EMT — assist patient's own SL nitroglycerin (Ref. 802 §I.E.1)
    nitrous: 5,            // not named
    otcAnalgesic: 5,       // not named
    nitro: 4,              // Paramedic — EMS-supplied "nitroglycerin tablet or spray"
    saline: 4,             // Paramedic — EMT can only monitor/maintain a preset rate (Ref. 802 §II.C), not initiate
    d10: 4,                // Paramedic — "10%, 25%, and 50% dextrose"
    glucagon: 4,           // Paramedic
    fentanyl: 4,           // Paramedic
    morphine: 4,           // Paramedic — "morphine sulfate"
    ondansetron: 4,        // Paramedic
    epiIV: 4,              // Paramedic — "epinephrine," IV route
    ketamine: 5,           // not in the Ref. 803 medication list at all
    ketorolac: 4,          // Paramedic
    acetaminophenIV: 5,    // not named
    amiodarone: 4,         // Paramedic
    lidocaine: 4,          // Paramedic
    atropine: 4,           // Paramedic — "atropine sulfate"
    adenosine: 4,          // Paramedic
    diltiazem: 5,          // not named
    metoprolol: 5,         // not named
    calcium: 4,            // Paramedic — "calcium chloride"
    bicarb: 4,             // Paramedic — "sodium bicarbonate"
    vasopressin: 5,        // not named
    pushEpi: 4,            // Paramedic — "epinephrine" (push-dose technique)
    dexamethasone: 5,      // not named
    diphen: 4,             // Paramedic — "diphenhydramine hydrochloride"
    metoclopramide: 4,     // Paramedic — queue item 66, "Reglan" antiemetic
    midazolam: 4,          // Paramedic
    magnesium: 4,          // Paramedic — "magnesium sulfate"
    txa: 4,                // Paramedic — "tranexamic acid"
    hydroxo: 4,            // Paramedic — "hydroxocobalamin"
    oxytocin: 5,           // not named
    heparin: 5,            // not named
    thrombolytic: 5,       // not named
    norepi: 5,             // not named
    phenylephrine: 5,      // not named
    blood: 4,              // Paramedic — "monitor blood product transfusions" (Ref. 803 §C.7 / med list "blood products")
    plasma: 4,             // Paramedic — same "blood products" category
    plasmalyte: 5,         // only "normal saline solution" is specifically named
    etomidate: 5,          // not named
    rocuronium: 5,         // not named — no RSI in this scope

    // ── PROCEDURES ──
    headTilt: 0,           // basic airway positioning — publicly-taught BLS
    jawThrust: 0,
    mouthMask: 0,
    mouthMouth: 0,
    cpr: 0,                // Ref. 802 §I.B.2 — also a real, widely-taught public skill
    lucas: 2,              // EMT — "mechanical adjuncts for basic CPR," requires EMS Agency approval
    pads: 0,               // public-access AED
    aedAnalyze: 0,
    aedShock: 0,
    recovery: 0,
    abdThrust: 0,
    directPressure: 0,
    tq: 0,                 // Ref. 802 §I.D.1.a — also a real, publicly-taught Stop-the-Bleed skill
    pack: 0,               // hemostatic dressings (Ref. 802 §I.D.1.b) — same reasoning as tq
    opa: 2,                // EMT — Ref. 802 §I.C.1
    bvm: 2,                // EMT — Ref. 802 §I.C.3.a
    o2nc: 2,               // EMT — Ref. 802 §I.C.2
    o2nrb: 2,
    suction: 2,            // EMT — Ref. 802 §I.C.1/§I.C.5
    manualBP: 2,           // EMT — Ref. 802 §I.A.2.d
    cCollar: 2,            // EMT — spinal motion restriction devices (Ref. 802 §I.D.2)
    splint: 2,             // EMT — Ref. 802 §I.D.1.c
    chestSeal: 2,          // EMT — trauma care, "not limited to" (Ref. 802 §I.D.1)
    pelvicBinder: 2,       // EMT — trauma care, "not limited to"
    warm: 2,               // EMT — basic emergency care
    npa: 2,                // EMT — Ref. 802 §I.C.1
    sga: 4,                // Paramedic — insertion (EMT only ventilates through an already-placed device)
    cpap: 2,               // EMT — requires EMS Agency approval (Ref. 802 §I.C.3.b)
    pulseox: 2,            // EMT — Ref. 802 §I.A.2.h
    autoBP: 2,             // EMT — same diagnostic-sign authority as manual BP
    glucometer: 2,         // EMT — county-approved additional scope (Ref. 802 §III.A.4)
    ecgAcquire: 4,         // Paramedic — Ref. 803 §II.A.2
    traction: 2,           // EMT — Ref. 802 §I.D.1.d
    iv: 4,                 // Paramedic — Ref. 803 §II.D
    io: 4,                 // Paramedic
    etco2: 4,              // Paramedic — capnometry (Ref. 803 §II.A.1)
    defib: 4,              // Paramedic — Ref. 803 §II.C.2
    cardiovert: 4,         // Paramedic — Ref. 803 §II.C.3
    pacing: 4,             // Paramedic — Ref. 803 §II.C.4
    ett: 4,                // Paramedic — "advanced airway maneuvers" (Ref. 1302)
    laryngoscopy: 4,       // Paramedic — same "advanced airway maneuvers" grant
    cric: 5,               // surgical cricothyrotomy not authorized in this scope
    needleD: 4,            // Paramedic — Ref. 803 §II.C.1
    valsalva: 4,           // Paramedic — Ref. 803 §II.C.5
    chestTube: 5,          // only "monitor thoracostomy tubes" is granted (Ref. 803 §II.C.6), not insertion
    vent: 5,               // not named
    ultrasound: 5,         // not named
    reboa: 5,              // not named
    paCath: 5,             // not named
    artLine: 5,            // not named — only monitoring pre-existing vascular access is granted to EMTs
  },
};
