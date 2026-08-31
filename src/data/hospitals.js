import { mapFor } from "./maps.js";
import { shortestPath } from "../mapGraph.js";

// hospitals.js — destination choice at the doors of the truck, before transport.
//
// A scenario opts into the "which hospital" teaching point by naming a
// `destSpecialty` ("trauma" | "cardiac" | "stroke") — the specialty center
// that is actually indicated for its condition. That is optional and
// additive: a
// scenario with no `destSpecialty` still gets the destination PICKER (every
// transport is a real destination decision), it just has no wrong-answer
// penalty attached, the same way most scenarios have no `probes.neuro` entry
// but the action still exists generically.
//
// Region (city/suburban/rural) is NOT a new concept here — fleet.js's MODES
// carries that distinction (g.mode, chosen at the "WHERE ARE YOU WORKING"
// screen). Since the map-expansion batch (see CLAUDE.md), the drive FROM the
// patient to whichever hospital gets picked is REAL road distance —
// src/mapGraph.js's shortestPath over the current map's own street graph
// (src/data/maps.js), from the incident's RoutingPoint to the chosen
// hospital building's node — not a flat regional scalar. A rural call's
// nearest trauma center is further out for the identical reason its nearest
// engine company is (thin, spread-out coverage), and that now shows up as
// genuinely more graph distance to drive, not a second number invented to
// say the same thing.
//
// `distMult` now survives only as a small RESIDUAL factor — the specialty
// center's own extra intake/workup time, not a stand-in for distance
// anymore (real geometry already accounts for a specialty center sitting
// further from a given incident than the nearest general ED).
export const HOSPITAL_TYPES = {
  community: {id: "community", name: "Nearest Community Hospital",
    tag: "General ED — no specialty team in-house", distMult: 1.0},
  trauma: {id: "trauma", name: "Regional Trauma Center",
    tag: "Trauma surgeons and OR in-house, team activates on your ETA", distMult: 1.4},
  cardiac: {id: "cardiac", name: "Cardiac Center",
    tag: "Cath lab, 24/7 STEMI activation", distMult: 1.3},
  // Comprehensive stroke centers and cardiac (STEMI) receiving centers are
  // real, separate designations in most EMS systems — kept as distinct
  // options rather than folded into one "cardiac & stroke" entry, even
  // though no scenario declares destSpecialty:"stroke" yet (stroke/CVA has
  // no physiology condition built — see queue item 23 — so there is nothing
  // to score against it today; the picker still offers it, same as any
  // other destSpecialty-less scenario).
  stroke: {id: "stroke", name: "Stroke Center",
    tag: "CT + tPA/thrombectomy team, 24/7 activation", distMult: 1.3},
};
export const HOSPITAL_ORDER = ["community", "trauma", "cardiac", "stroke"];

// Destination CHOICE is its own concern, kept separate from the time
// function below — nearest-hospital-THAT-QUALIFIES by default, then a real
// bypass tie-break (below) among whichever qualify, rather than
// effTransportTime silently assuming "nearest" is always the answer.
//
// `designations` (src/data/maps.js, on each hospital building) is the real
// ACS-style vocabulary this ties the bypass decision to: Trauma Center
// Level 1 (most capable) .. 4 (least), stroke center tier
// (comprehensive > primary > acute-ready), and a boolean `stemi` flag.
// Only hospitals.js reads it — a hospital with no `designations` object at
// all (nothing currently ships without one, but nothing requires it either)
// ranks as "no special capability," which is exactly right: it just won't
// win a tie-break against one that has the designation.
function designationRank(h, capability) {
  const d = h.designations || {};
  if (capability === "trauma") return d.traumaLevel ? 5 - d.traumaLevel : 0;
  if (capability === "stroke") return { comprehensive: 3, primary: 2, "acute-ready": 1 }[d.stroke] || 0;
  if (capability === "cardiac") return d.stemi ? 1 : 0;
  return 0;
}

// How much EXTRA real drive time (relative to the nearest qualifying
// hospital) this bypass logic will tolerate to reach a materially
// higher-designation facility. A reasonable, stated approximation of real
// regional trauma/stroke bypass protocols (which vary by state/EMS
// system) — not a specific jurisdiction's actual numbers, said honestly
// rather than presented as a literature citation it isn't.
const BYPASS_TOLERANCE = 1.5;

export function chooseDestination(map, incidentPoint, neededCapability, weather = "clear") {
  if (!map || !incidentPoint) return null;
  const hospitals = map.buildings.filter((b) => b.type === "hospital");
  if (!hospitals.length) return null;
  const qualifying = neededCapability
    ? hospitals.filter((h) => (h.capabilities || []).includes(neededCapability))
    : hospitals;
  const pool = qualifying.length ? qualifying : hospitals;

  const timed = pool
    .map((h) => ({ h, seconds: shortestPath(map, incidentPoint, { type: "node", nodeId: h.node }, weather).seconds }))
    .filter((x) => Number.isFinite(x.seconds))
    .sort((a, b) => a.seconds - b.seconds);
  const nearest = timed[0];
  if (!nearest) return null;

  // "community" (no capability requested) stays nearest-only — the closest
  // general ED has nothing to bypass FOR. Same for a request with only one
  // real candidate (the tie-break loop below would just re-pick it anyway,
  // but skip the work).
  if (!neededCapability || timed.length === 1) return nearest.h;

  const cap = BYPASS_TOLERANCE * nearest.seconds;
  let best = nearest.h, bestRank = designationRank(nearest.h, neededCapability), bestSeconds = nearest.seconds;
  for (const { h, seconds } of timed) {
    if (seconds > cap) continue;
    const rank = designationRank(h, neededCapability);
    if (rank > bestRank || (rank === bestRank && seconds < bestSeconds)) { best = h; bestRank = rank; bestSeconds = seconds; }
  }
  return best;
}

// A short, real designation summary for a hospital building — used by the
// transport-destination UI so a player sees what they're actually
// committing to (e.g. "Trauma Level I · Comprehensive Stroke · STEMI"),
// not just the generic archetype tag. Returns null for a hospital with no
// designations object (renders nothing extra, not an empty string).
const TRAUMA_NUMERAL = { 1: "I", 2: "II", 3: "III", 4: "IV" };
const STROKE_LABEL = { comprehensive: "Comprehensive Stroke", primary: "Primary Stroke", "acute-ready": "Acute Stroke-Ready" };
export function designationLabel(h) {
  const d = h?.designations;
  if (!d) return null;
  const parts = [];
  if (d.traumaLevel) parts.push(`Trauma Level ${TRAUMA_NUMERAL[d.traumaLevel] || d.traumaLevel}`);
  if (d.stroke) parts.push(STROKE_LABEL[d.stroke] || d.stroke);
  if (d.stemi) parts.push("STEMI");
  if (d.pediatric) parts.push("Pediatric");
  if (d.burn) parts.push("Burn");
  if (d.psych) parts.push("Psych");
  return parts.length ? parts.join(" · ") : null;
}

// Real road time from the incident to whichever hospital building
// chooseDestination lands on for this destType (community imposes no
// capability constraint, so it resolves to the nearest hospital regardless
// of specialty — the correct "closest general ED" reading). Threads
// state.weather through — a transport in the rain genuinely takes longer
// if the route runs over an unpaved rural branch road (see mapGraph.js's
// edgeSeconds/GRAVEL_WEATHER_MULT), same as the player's own response drive.
function transportDriveSeconds(state, destType) {
  if (!state?.locations?.incident) return 0;
  const map = mapFor(state);
  const weather = state.weather || "clear";
  const dest = chooseDestination(map, state.locations.incident, destType === "community" ? null : destType, weather);
  if (!dest) return 0;
  const { seconds } = shortestPath(map, state.locations.incident, { type: "node", nodeId: dest.node }, weather);
  return Number.isFinite(seconds) ? seconds : 0;
}

export function effTransportTime(scen, destType, state) {
  const base = (scen && scen.transport) || 600;
  const h = HOSPITAL_TYPES[destType] || HOSPITAL_TYPES.community;
  // No g.locations yet (a save mid-transition, or called before a dispatch
  // has ever seeded one) — fall back to the pre-batch flat-scalar shape so
  // nothing crashes; real geometry always wins once a dispatch has run.
  if (!state?.locations?.incident) return Math.round(base * h.distMult);
  const driveSeconds = transportDriveSeconds(state, destType);
  // `base*0.3` is a floor, not the driver of the number — even a very
  // close hospital still costs real time getting the patient packaged and
  // loaded. distMult is now only the residual specialty-center premium
  // (extra intake/workup), not a stand-in for distance.
  return Math.round(Math.max(driveSeconds, base * 0.3) + base * 0.15 * (h.distMult - 1));
}

// The debrief note for picking a destination that doesn't match the
// scenario's declared specialty need. Silent (returns null) whenever the
// scenario has no opinion (`destSpecialty` unset) or the player got it right
// — this is additive information, not a new pass/fail axis on its own.
export function destinationNote(scen, destType) {
  if (!scen || !scen.destSpecialty || !destType) return null;
  if (destType === scen.destSpecialty) return null;
  const wanted = HOSPITAL_TYPES[scen.destSpecialty];
  const got = HOSPITAL_TYPES[destType];
  return `Destination: you took this patient to the ${got.name.toLowerCase()}. `
    + `This presentation needed the ${wanted.name.toLowerCase()} — the extra transport time to get there is the tradeoff `
    + `"closest hospital" doesn't account for.`;
}
