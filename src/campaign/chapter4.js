// campaign/chapter4.js — Chapter 4: EMT School: "It Gets Real" (§1.6.5,
// §1.6.12, Ch.4 script), minus literal names — see core.js's name-generation
// note. instructor reuses the SAME identity chapter2.js's own slot already
// declares (one recurring person across all three classroom chapters) — not
// redeclared here. rivalClassmate has no relId (flavor-only, per §1.9's own
// "not relationship-tracked" note) but still gets a real drawn name via its
// own standalone slot key.
export const CH4_CAST = {
  classmateEmt: { relId: "classmate_emt", role: "EMT classmate", gender: "female" },
  instructor: { relId: "instructor", role: "EMT instructor", gender: "female" },
  rivalClassmate: { slotId: "ch4RivalClassmate" },
};
export const CH4_NAME_SLOTS = {
  classmate_emt: { gender: "female" },
  ch4RivalClassmate: { gender: "male" },
};

// §1.6.12 Financial Strain — the Funding-Cut Incident. Trigger chances by
// chapter, checked only if it hasn't already fired anywhere.
export const FUNDING_CUT_CHANCE = { ch2: 0.25, ch3: 0.35, ch4: 0.45 };

export function balanceBothSuccessChance(ambition, fitness, confidence, fatigue) {
  const raw = 40 + ((ambition ?? 10) - 10) * 2 + ((fitness ?? 10) - 10) * 1
    + ((confidence ?? 10) - 10) * 0.5 - (fatigue ?? 0) * 0.3;
  return Math.max(5, Math.min(90, raw));
}
