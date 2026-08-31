// src/dialogue/personality.js — deterministic per-patient personality, so
// two patients with the same condition don't sound identical (F0 item 16).
//
// Traits are derived, not stored: seeded from stable identity the game
// already carries (patient name + scenario key + age), reusing mapGraph.js's
// existing mulberry32 PRNG rather than inventing a second one. Same patient,
// same scenario, same shift -> same personality every time; a different
// dispatch draws a different one, with no new persisted field required.

import { mulberry32 } from "../mapGraph.js";

function strHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Five 0-1 traits, matching F0 item 16's own worked example
// (anxious/cooperative/talkative/irritable/trusting). Each trait is an
// independent draw from the same seeded stream, not correlated with the
// others — a patient can be both anxious AND cooperative.
export function patientPersonality(seedKey) {
  const rng = mulberry32(strHash(String(seedKey || "default")));
  return {
    anxious: rng(),
    cooperative: rng(),
    talkative: rng(),
    irritable: rng(),
    trusting: rng(),
  };
}

// A stable seed key for a dispatched patient — name if one has been drawn
// (g.patientName), otherwise scenario+age (still stable for the life of one
// dispatch, just not distinguishable from another patient with the same
// scenario/age drawn later in the same shift, which is an acceptable, honest
// simplification rather than inventing a new per-patient id field).
export function patientSeedKey(s) {
  return s?.patientName ? `${s.patientName}|${s.scen || ""}` : `${s?.scen || "unknown"}|${s?.patient?.age ?? "?"}`;
}
