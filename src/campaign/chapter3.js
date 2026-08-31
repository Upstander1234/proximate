// campaign/chapter3.js — Chapter 3: Fork in the Road: PATROL or Volunteer
// Fire (§1.9), minus literal names — see core.js's name-generation note.
export const CH3_CAST = {
  supervisor: { relId: "supervisor" }, // identity already exists by Ch.3 (created in the Prologue, already dynamic — drawName())
  fireChief: { relId: "fire_chief", role: "Volunteer Fire chief", gender: "female" },
  firePartner: { relId: "fire_partner", role: "Fire partner", gender: "female" },
};
export const CH3_NAME_SLOTS = {
  fire_chief: { gender: "female" },
  fire_partner: { gender: "female" },
};
