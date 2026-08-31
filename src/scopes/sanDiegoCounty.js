// San Diego County, CA — converted from the county's own scope-of-practice
// documents (src/scopes/Raw Scope Sources/San Diego County/):
//   B-450, EMT Scope of Practice (rev. 7/1/2025)
//   B-451, Advanced EMT Scope of Practice (rev. 7/1/2026)
//   P-401, Paramedic Scope of Practice (rev. 7/1/2026)
//   P-115, Medication List (rev. 7/1/2026) — a complete, per-drug
//     RED/YELLOW/GREEN table naming exactly which of EMT/AEMT/Paramedic may
//     administer each medication (28 pages, ends at Tranexamic Acid).
//   S-104, Skills List (rev. 7/1/2026) — the same RED/YELLOW/GREEN
//     treatment for every procedure/skill (22 pages, ends at AV Shunt/Graft).
//
// P-115/S-104 are unusually exhaustive — every drug/skill this county
// actually authorizes appears somewhere in one of them. Because of that
// completeness, an item never named in either document is treated strictly
// per this folder's own convention: set to 5 (Unlimited/not authorized),
// not guessed at. GREEN and YELLOW both mean "authorized" for the
// listed level(s) — YELLOW is a LEMSA-Medical-Director/LOSOP grant rather
// than a straight state-regulation one, but it's still real, adopted county
// scope today, not a hypothetical.
//
// Universally-recognized bystander/Stop-the-Bleed/hands-only-CPR/public-AED
// skills are kept at Layperson (0), matching this project's own
// national2019.js baseline and the same reasoning used in losAngelesCounty.js
// — B-450 explicitly grants these to EMTs but never frames its own list as
// EMT-exclusive.
//
// 0 = Layperson   1 = EMR   2 = EMT   3 = AEMT   4 = Paramedic   5 = Unlimited
export default {
  id: "san_diego_county_ca",
  name: "San Diego County, CA",
  levels: {
    // ── MEDICATIONS (P-115) ──
    naloxone_in: 2,        // EMT (yellow) — B-450 §III.B.3, IN route only
    naloxone_im: 3,        // AEMT — P-115 note: "AEMT authorized via IN/IM only"
    naloxone_iv: 3,        // AEMT — B-451 §III.B.3.c lists naloxone as an AEMT IV medication
    epiAuto: 2,            // EMT (yellow) — B-450 §III.B.4, auto-injector only
    duodote: 5,            // no DuoDote / pralidoxime chloride anywhere in P-115
    aspirin: 2,            // EMT (yellow) — P-115: "assist patient to self-medicate own prescribed aspirin"
    oralGlucose: 2,        // EMT — B-450 §III.A.8.g
    albuterol: 3,          // AEMT — P-115 green; B-451 §III.B.7.d "inhaled beta-2 agonists"
    ipratropium: 4,        // Paramedic — P-115 red/red/green (NOT granted to AEMT, unlike albuterol)
    epiIM: 3,              // AEMT — B-451 §III.B.7.g "epinephrine" (non-auto-injector, non-IV route)
    nitroOwn: 2,           // EMT — P-115: "assist patient to self-medicate own prescribed NTG only"
    nitrous: 5,            // not named
    otcAnalgesic: 5,       // not named
    nitro: 3,              // AEMT — B-451 §III.B.7.a "sublingual nitroglycerin"; P-115 green at AEMT
    saline: 3,             // AEMT — B-451 §III.B.3.b "isotonic balanced salt solutions"
    d10: 3,                // AEMT — B-451 §III.B.3.a "glucose solutions"
    glucagon: 3,           // AEMT — B-451 §III.B.7.c; P-115: "AEMT authorized to administer via IM only"
    fentanyl: 4,           // Paramedic
    morphine: 4,           // Paramedic — "morphine sulfate"
    ondansetron: 4,        // Paramedic
    epiIV: 4,              // Paramedic — epinephrine 1:10,000, cardiac arrest/bradycardia dosing
    ketamine: 4,           // Paramedic
    ketorolac: 5,          // not in the P-115 medication list at all
    acetaminophenIV: 4,    // Paramedic
    amiodarone: 4,         // Paramedic
    lidocaine: 4,          // Paramedic
    atropine: 4,           // Paramedic — "atropine sulfate"
    adenosine: 4,          // Paramedic
    diltiazem: 5,          // not named
    metoprolol: 5,         // not named
    calcium: 4,            // Paramedic — "calcium chloride"
    bicarb: 4,             // Paramedic — "sodium bicarbonate"
    vasopressin: 5,        // not named
    pushEpi: 4,            // Paramedic — epinephrine 1:100,000, push-dose
    dexamethasone: 5,      // not named
    diphen: 4,             // Paramedic — "diphenhydramine hydrochloride"
    midazolam: 4,          // Paramedic
    magnesium: 4,          // Paramedic — "magnesium sulfate"
    txa: 4,                // Paramedic — "tranexamic acid"
    hydroxo: 5,            // not named anywhere in P-115
    oxytocin: 5,           // not named
    heparin: 5,            // not named as a drug (only "heparin lock" as a device, elsewhere)
    thrombolytic: 5,       // not named
    norepi: 5,             // not named
    phenylephrine: 5,      // not named
    blood: 5,              // no blood-product transfusion mechanism anywhere in these documents
    plasma: 5,             // not named
    plasmalyte: 5,         // only "isotonic balanced salt solutions including Ringer's lactate" is named
    etomidate: 5,          // not named
    rocuronium: 5,         // not named — no RSI in this scope

    // ── PROCEDURES (S-104 unless noted) ──
    headTilt: 0,           // basic airway positioning — publicly-taught BLS
    jawThrust: 0,
    mouthMask: 0,
    mouthMouth: 0,
    cpr: 0,                // B-450 §III.A.4 — also a real, widely-taught public skill
    lucas: 2,              // EMT — B-450 §III.A.4, "mechanical adjuncts to basic CPR"
    pads: 0,               // public-access AED (B-450 §III.A.8.m is the EMS-context grant)
    aedAnalyze: 0,
    aedShock: 0,
    recovery: 0,
    abdThrust: 0,
    directPressure: 0,
    tq: 0,                 // B-450 §III.A.8.a — also a real, publicly-taught Stop-the-Bleed skill
    pack: 0,               // hemostatic gauze (S-104, green/green/green) — same reasoning as tq
    opa: 2,                // EMT — B-450 §III.A.6.a
    bvm: 2,                // EMT — B-450 §III.A.6.e
    o2nc: 2,               // EMT — B-450 §III.A.5/6.d
    o2nrb: 2,
    suction: 2,            // EMT — B-450 §III.A.6.c
    manualBP: 2,           // EMT — B-450 §III.A.3, diagnostic sign
    cCollar: 2,            // EMT — spinal motion restriction (S-104, green/green/green)
    splint: 2,             // EMT — B-450 §III.A.8.e "extremity splinting"
    chestSeal: 2,          // EMT — S-104, green/green/green
    pelvicBinder: 5,       // never named in either document — a real, meaningful gap given how exhaustive S-104 otherwise is
    warm: 5,               // never named
    npa: 2,                // EMT — B-450 §III.A.6.b
    sga: 4,                // Paramedic — S-104 "Intubation — PAA (i-gel)", red/red/green
    cpap: 2,               // EMT — B-450 §III.A.6.e; S-104 green/green/green
    pulseox: 2,            // EMT — S-104, green/green/green
    autoBP: 2,             // EMT — same diagnostic-sign authority as manual BP
    glucometer: 2,         // EMT (yellow) — S-104 "Glucose Monitoring"
    ecgAcquire: 4,         // Paramedic — S-104 "ECG Monitoring" / "12-Lead ECG," red/red/green
    traction: 2,           // EMT — B-450 §III.A.8.f "traction splinting"
    iv: 3,                 // AEMT — S-104 "Vascular Access — Extremity," red/green/green
    io: 4,                 // Paramedic (general/adult) — B-451 grants AEMT IO in pediatric patients ONLY
    etco2: 4,              // Paramedic — S-104 EtCO2 capnography, red/red/green
    ecgRead: 4,            // Paramedic — 12-lead interpretation
    defib: 4,              // Paramedic — S-104 "Manual Defibrillation," red/red/green
    cardiovert: 4,         // Paramedic — S-104 "Synchronized Cardioversion," red/red/green
    pacing: 4,             // Paramedic — S-104 "External Cardiac Pacing," red/red/green
    ett: 4,                // Paramedic — S-104 "Intubation — ET/Stomal," red/red/green
    laryngoscopy: 4,       // Paramedic — S-104 "Magill Forceps," red/red/green
    cric: 5,               // surgical cricothyrotomy not named anywhere in this scope
    needleD: 4,            // Paramedic — S-104 "Needle Thoracostomy," red/red/green
    valsalva: 4,           // Paramedic — S-104 "Valsalva Maneuver," red/red/green
    chestTube: 5,          // only "monitor thoracostomy tubes" is granted (P-401 §III.C.14), not insertion
    vent: 5,               // not named
    ultrasound: 5,         // not named
    reboa: 5,              // not named
    paCath: 5,             // not named
    artLine: 5,            // not named — no arterial-line access anywhere in the vascular-access sections
  },
};
