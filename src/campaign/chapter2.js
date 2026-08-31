// campaign/chapter2.js — Chapter 2: EMR School: "The First Step" (§1.9's
// fixed cast, minus the literal names — see core.js's name-generation note).
// classmateEmr reuses the id relationships.js already reserved; instructor
// reuses the SAME "instructor" identity Ch.4/Ch.6 also draw on (§1.9: "one
// recurring person across all three classroom chapters") — whichever
// chapter's App.jsx phase runs first creates the relationship, every later
// chapter reads it back via the same relId. Its name slot is declared once
// here (Ch.2 is chronologically first); chapter4.js/chapter6.js just reuse
// the id without redeclaring the slot.
export const CH2_CAST = {
  classmateEmr: { relId: "classmate_emr", role: "EMR classmate", gender: "male" },
  instructor: { relId: "instructor", role: "EMR instructor", gender: "female" },
};
export const CH2_NAME_SLOTS = {
  classmate_emr: { gender: "male" },
  instructor: { gender: "female" },
};
