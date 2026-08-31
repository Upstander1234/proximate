// Medical Education Mode (Sandbox) only — a toggleable option on the case-
// select screen ("cat" phase, App.jsx) that, when on, rolls a physical
// limitation onto one of your recruited partners for the case you're about
// to run. This is a genuine task-availability gate, not decoration: a
// limited partner's blocked tasks are removed from BOTH the player-directed
// order list and the protocol-driven autonomous crew-direction hand-finder
// (App.jsx), so the limitation actually changes who can do what on scene —
// it teaches working a call with a partner who can't do everything, which
// real partners sometimes can't.
//
// `blocks` is a list of gear.js TASKS ids. Keep every key here matched
// against a real task id — an entry that blocks a task id that doesn't
// exist would be exactly the decorative-field class CLAUDE.md forbids.
export const LIMITATIONS = {
  brokenLeg: {
    name: "Broken leg — in a walking boot",
    note: "Can't kneel, can't run, can't chase down bystanders.",
    blocks: ["cpr", "cspine", "fetch", "crowd"],
  },
  pregnant: {
    name: "Pregnant, third trimester",
    note: "No sustained heavy exertion — sitting/standing tasks are fine.",
    blocks: ["cpr", "cspine", "fetch"],
  },
  wristSplint: {
    name: "Wrist injury — in a splint",
    note: "Can't do fine-motor or needle work with that hand.",
    blocks: ["iv", "tq", "leads", "prep"],
  },
};
export const LIMITATION_KEYS = Object.keys(LIMITATIONS);

// True if the given crew member is blocked from a given TASKS id by their
// own rolled limitation (no limitation = never blocked).
export function isTaskBlocked(crewMember, taskId) {
  const lim = crewMember && crewMember.limitation && LIMITATIONS[crewMember.limitation];
  return !!(lim && lim.blocks.includes(taskId));
}

// Rolls a limitation onto one random eligible crew member (never the pilot —
// they're not a medical provider and can't be reassigned tasks anyway).
// Returns the crew array unchanged if there's nobody eligible to roll onto.
export function rollPartnerLimitation(crew) {
  const eligible = (crew || []).filter((c) => !c.pilot);
  if (!eligible.length) return crew;
  const pick = eligible[Math.floor(Math.random() * eligible.length)];
  const key = LIMITATION_KEYS[Math.floor(Math.random() * LIMITATION_KEYS.length)];
  return crew.map((c) => (c.id === pick.id ? { ...c, limitation: key } : c));
}
