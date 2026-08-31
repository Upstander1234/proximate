// campaign/chapter5.js — Chapter 5: Employment: IFT, 911, or Event EMT
// (§1.6.6, §1.9), minus literal names — see core.js's name-generation note.
// `job_supervisor` is one relationship id shared by two different possible
// employers (ift/county911) — only one is ever active per playthrough, but
// since the underlying person differs (a different gender each time), its
// name slot allows either gender rather than picking one at campaign start.
import { NINE11_HIRE_IMMEDIATE, NINE11_HIRE_CONDITIONAL } from "./core.js";
export const CH5_EMPLOYERS = {
  ift: {
    id: "ift", jobType: "ift", name: "Crosswind Medical Transport", orgType: "private",
    blurb: "Reliable, unglamorous, chronically hiring. Interfacility transfers — nursing homes, dialysis runs, hospital-to-hospital.",
    exam: null,
    supervisorRelId: "job_supervisor",
    partnerRelId: "ift_partner", partnerGender: "male", partnerRole: "IFT partner",
  },
  event: {
    id: "event", jobType: "event", name: "EventMed", orgType: "private",
    blurb: "Stadiums, concerts, festivals. Part-time, chronically short-staffed, real pay but inconsistent shifts.",
    exam: null,
    supervisorRelId: "event_coord",
    partnerRelId: null,
  },
  county911: {
    id: "county911", jobType: "county911", name: "Northwood County EMS", orgType: "county",
    blurb: "The county 911 provider. Civil-service-flavored stability once hired — but hiring itself is genuinely competitive.",
    exam: "911",
    supervisorRelId: "job_supervisor",
    partnerRelId: null,
  },
  fire911: {
    id: "fire911", jobType: "fire911", name: "City of Northwood Fire-Rescue", orgType: "city",
    blurb: "Paid career fire-EMS. Famously competitive nationally, even with a volunteer department's internal-hire advantage.",
    exam: "fire",
    requiresChapter3Path: "fire",
    supervisorRelId: null,
  },
};
export const CH5_NAME_SLOTS = {
  job_supervisor: { genders: ["male", "female"] },
  ift_partner: { gender: "male" },
  event_coord: { gender: "female" },
};

export function canCombineEmployers(a, b) {
  const s = new Set([a, b]);
  return s.size === 2 && s.has("ift") && s.has("event");
}

export function resolveEntranceOutcome(score) {
  if (score >= NINE11_HIRE_IMMEDIATE) return "hire";
  if (score >= NINE11_HIRE_CONDITIONAL) return "conditional";
  return "rejected";
}

export function nine11Shortfall(score) {
  return Math.max(1, Math.ceil(NINE11_HIRE_IMMEDIATE - score));
}

export const CH5_REAPPLY_COOLDOWN_SHIFTS = 5;
