// Real units and vial concentrations for drugs that are drawn up and injected.
// Used by the draw-up minigame, the drip minigame, dose confirmation text and
// the amount handling in pk.js (a drawn amount is authoritative; the order is
// for scoring only).
//
//   unit  : "mg" | "mcg" | "U" | "mEq" | "g"  (what `std` and `conc` are in)
//   std   : the usual adult dose in `unit` (what a correct draw delivers)
//   conc  : concentration of the vial or syringe, `unit` per mL
//   drip  : for infusions, the standard bag { mlBag, amountInBag } in `unit`
//
// Concentrations are the common US prehospital presentations. `std` for a
// two-compartment drug equals the drug's own `dose` in drugs.js (mg); for a
// curve drug it is the reference dose that the amount scaling in pk.js is
// relative to. Fluids, oral, sublingual, nebulized and inhaled drugs are not
// listed: they are not drawn into a syringe.
export const DRUG_UNITS = {
  naloxone_iv:   { unit: "mg",  std: 0.4,  conc: 0.4 },
  naloxone_im:   { unit: "mg",  std: 0.4,  conc: 0.4 },
  naloxone_in:   { unit: "mg",  std: 0.4,  conc: 1 },       // atomizer, 1 mg/mL
  epiAuto:       { unit: "mg",  std: 0.3,  conc: 0.3 },     // fixed-dose device, 0.3 mL
  epiIM:         { unit: "mg",  std: 0.5,  conc: 1 },       // 1 mg/mL (1:1000)
  epiIV:         { unit: "mg",  std: 1,    conc: 0.1 },     // 0.1 mg/mL (1:10,000), 10 mL
  pushEpi:       { unit: "mg",  std: 0.02, conc: 0.01 },    // 10 mcg/mL, diluted
  fentanyl:      { unit: "mg",  std: 0.05, conc: 0.05 },    // 50 mcg/mL
  morphine:      { unit: "mg",  std: 4,    conc: 10 },
  ketamine:      { unit: "mg",  std: 100,  conc: 50 },
  ketorolac:     { unit: "mg",  std: 15,   conc: 30 },
  acetaminophenIV: { unit: "mg", std: 1000, conc: 10 },     // 100 mL bag
  amiodarone:    { unit: "mg",  std: 300,  conc: 50 },
  amiodarone2:   { unit: "mg",  std: 150,  conc: 50 },
  lidocaine:     { unit: "mg",  std: 100,  conc: 20 },      // 2%
  lidocaineBlock:{ unit: "mg",  std: 120,  conc: 10 },      // 1%
  atropine:      { unit: "mg",  std: 1,    conc: 0.1 },     // 1 mg/10 mL syringe
  adenosine:     { unit: "mg",  std: 12,   conc: 3 },
  diltiazem:     { unit: "mg",  std: 20,   conc: 5 },
  metoprolol:    { unit: "mg",  std: 5,    conc: 1 },
  calcium:       { unit: "mg",  std: 1000, conc: 100 },     // calcium chloride 10%
  bicarb:        { unit: "mEq", std: 50,   conc: 1 },       // 8.4%
  vasopressin:   { unit: "U",   std: 40,   conc: 20, drip: { mlBag: 100, amountInBag: 20 } },   // 20 U / 100 mL = 0.2 U/mL
  hydrocortisone:{ unit: "mg",  std: 100,  conc: 50 },
  dexamethasone: { unit: "mg",  std: 10,   conc: 10 },
  diphen:        { unit: "mg",  std: 50,   conc: 50 },
  midazolam:     { unit: "mg",  std: 5,    conc: 5 },
  magnesium:     { unit: "mg",  std: 4000, conc: 500 },     // 50%
  txa:           { unit: "mg",  std: 1000, conc: 100 },
  hydroxo:       { unit: "mg",  std: 5000, conc: 25 },      // reconstituted
  oxytocin:      { unit: "U",   std: 10,   conc: 10 },
  heparin:       { unit: "U",   std: 5000, conc: 1000 },
  glucagon:      { unit: "mg",  std: 1,    conc: 1 },
  ondansetron:   { unit: "mg",  std: 4,    conc: 2 },
  metoclopramide:{ unit: "mg",  std: 10,   conc: 5 },
  etomidate:     { unit: "mg",  std: 20,   conc: 2 },
  rocuronium:    { unit: "mg",  std: 100,  conc: 10 },
  phenylephrine: { unit: "mg",  std: 0.1,  conc: 0.1, drip: { mlBag: 250, amountInBag: 10 } },   // 10 mg / 250 mL = 40 mcg/mL     // 100 mcg/mL syringe
  norepi:        { unit: "mg",  std: 1,    conc: 1, drip: { mlBag: 250, amountInBag: 4 } },   // 4 mg / 250 mL = 16 mcg/mL
  thrombolytic:  { unit: "mg",  std: 50,   conc: 1 },
};

// Volume (mL) to draw for a wanted amount, and the amount a drawn volume delivers.
export const drawVolumeMl = (id, amount) => {
  const u = DRUG_UNITS[id];
  return u ? amount / u.conc : null;
};
export const amountFromDraw = (id, mL) => {
  const u = DRUG_UNITS[id];
  return u ? mL * u.conc : null;
};
// Infusion rate in the drug's own amount per minute from a pump rate in mL/h and the
// bag concentration actually hung (amountInBag / mlBag, `unit` per mL).
export const infusionAmountPerMin = (id, mlPerHour, bagAmount, bagMl) => {
  const u = DRUG_UNITS[id];
  if (!u) return null;
  return (mlPerHour / 60) * (bagAmount / bagMl);
};

// Human-readable infusion rate from the pump's amount per minute (in the drug's own unit):
// units per minute for U drugs, mcg/kg/min for mass drugs.
export const pumpRateLabel = (id, amountPerMin, weightKg) => {
  const u = DRUG_UNITS[id];
  if (!u) return "";
  if (u.unit === "U") return `${+amountPerMin.toFixed(3)} U/min`;
  return `${+((amountPerMin * 1000) / (weightKg || 74)).toFixed(2)} mcg/kg/min`;
};
