// categories.js — clinical groupings for drugs/procedures, shared by the
// in-call medications/procedures tabs (App.jsx) AND the scope editor
// (components/ScopeEditor.jsx). Split out from App.jsx so the scope editor
// doesn't have to import the App component module itself (which would be a
// circular import: App.jsx -> SettingsOverlay.jsx -> ScopeEditor.jsx -> App.jsx).
//
// F5: drug categorization. One primary clinical category per drug — several
// drugs are genuinely multi-purpose (dexamethasone treats both anaphylaxis
// and airway edema, magnesium is both cardiac and obstetric), so this picks
// the use the scenario library actually exercises most, not an exhaustive
// taxonomy.
export const DRUG_CATEGORIES={
  "Cardiac / rhythm":["aspirin","nitroOwn","nitro","amiodarone","lidocaine","atropine","adenosine","diltiazem",
    "metoprolol","calcium","bicarb","vasopressin","pushEpi","epiIV","norepi","phenylephrine","thrombolytic"],
  "Airway / RSI / sedation":["etomidate","rocuronium","ketamine","midazolam","nitrous"],
  "Respiratory":["albuterol","ipratropium"],
  "Allergy / anaphylaxis":["epiAuto","epiIM","diphen","dexamethasone"],
  "Analgesia":["fentanyl","morphine","ketorolac","acetaminophenIV","otcAnalgesic"],
  "Glucose / GI":["oralGlucose","d10","glucagon","ondansetron"],
  "Toxicology / antidotes":["naloxone_in","naloxone_im","naloxone_iv","duodote","hydroxo"],
  "Fluids / blood products":["saline","plasmalyte","blood","plasma"],
  "Hemorrhage / OB":["txa","oxytocin","heparin","magnesium"],
};
export const drugCategoryOf=(id)=>Object.entries(DRUG_CATEGORIES).find(([,ids])=>ids.includes(id))?.[0]||"Other";

// F5: procedure categorization. "assess" vs "procedures" (the action tab
// itself) is already the diagnostic/treatment split; this is the further
// treatment-side subcategorization.
export const PROC_CATEGORIES={
  "Airway / ventilation":["headTilt","jawThrust","mouthMask","mouthMouth","opa","npa","sga","ett","cric","laryngoscopy","bvm","cpap","vent","o2nc","o2nrb","suction"],
  "Circulation / rhythm":["cpr","lucas","pads","aedAnalyze","aedShock","defib","cardiovert","pacing","icdMagnet","valsalva","ecgAcquire","ecgRead","etco2","pulseox","manualBP","autoBP","glucometer"],
  "Access / volume":["iv","io","saline","plasmalyte","blood","plasma","artLine","paCath"],
  "Trauma":["tq","pack","directPressure","chestSeal","needleD","chestTube","pelvicBinder","splint","traction","cCollar","reboa","warm","moveToShade","activeCooling","ultrasound","fundalMassage"],
};
export const procCategoryOf=(id)=>Object.entries(PROC_CATEGORIES).find(([,ids])=>ids.includes(id))?.[0]||"Other";
