// campaign/chapter8.js — Chapter 8: Paramedic School (§1.6.8.2), minus
// literal names — see core.js's name-generation note. Preceptors here are
// flavor identities (not full g.relationships entries), so each gets a
// standalone slotId rather than a relId.
export const CH8_ROTATIONS = [
  // ED's own preceptor is resolved at the App.jsx call site (whichever the
  // game hasn't already leaned on more of the two ER-physician candidates
  // ADVOCATE_POOL also draws from) rather than a fixed name here.
  { id: "ed", label: "Emergency Department", fixedPreceptor: null },
  { id: "icu", label: "ICU", fixedPreceptor: { slotId: "ch8IcuPreceptor", gender: "male" } },
  { id: "obgyn", label: "L&D / OB", fixedPreceptor: { slotId: "ch8ObgynPreceptor", gender: "female" } },
  { id: "or", label: "OR / Anesthesia — Intubation Rotation",
    fixedPreceptor: { slotId: "ch8OrPreceptor", gender: "male" }, intubationTarget: 5 },
  { id: "psych", label: "Psychiatric", fixedPreceptor: { slotId: "ch8PsychPreceptor", gender: "female" } },
];
export const CH8_FTO = { slotId: "ch8Fto", gender: "male" };
export const CH8_INTERNSHIP_CALLS_REQUIRED = 5;

export const CH8_NAME_SLOTS = {
  ch8IcuPreceptor: { gender: "male" },
  ch8ObgynPreceptor: { gender: "female" },
  ch8OrPreceptor: { gender: "male" },
  ch8PsychPreceptor: { gender: "female" },
  ch8Fto: { gender: "male" },
};
