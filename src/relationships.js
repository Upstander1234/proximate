// relationships.js — §1.4 Generalized Relationship System (Zero-To-Hero
// campaign design doc). Data-only helpers, same convention as campaign.js/
// downtimeEvents.js: plain pure functions, no component code, consumed
// directly by App.jsx.
//
// Shape of one entry in g.relationships (keyed by a freeform string id —
// §1.4.4: "so new relationships can be added at any time without
// restructuring"):
//   { name, friendship (-100..100), romance (0..100, NEVER displayed),
//     met (bool), role, gender, pronouns }
// `gender`/`pronouns` are beyond the doc's literal four fields but exist for
// the same reason fleet.js's roster entries carry them — dialogue text needs
// a pronoun, and this is a real, read consumer (App.jsx's tone-branched
// dialogue), not a decorative addition.
//
// The full id list from §1.4.4 (partner_patrol, supervisor, radio_crew,
// fire_partner, classmate_emr, classmate_emt, ift_partner, event_coord,
// instructor, shitty_supervisor) is intentionally NOT enumerated as a table
// here — most have no NPC behind them yet (no supervisor character, no
// Chapter 1 classmates/instructor content), and a registry of ids nothing
// reads would be exactly the decorative-field pattern this project forbids.
// Only `partner_patrol` is wired this batch (App.jsx's campaignIntro); the
// rest are filed as CLAUDE.md queue item F23, to be created the same way —
// via createRelationship(), on first meeting — once their owning content
// exists.

import { pronounForGender } from "./names.js";

// Game-balance bands (tuned for feel, not a physiology-identified constant —
// same footing as campaign.js's campaignFumbleChance). Checked top-to-bottom;
// first match wins.
export const FRIENDSHIP_TIERS = [
  { min: -100, max: -50, label: "Hostile" },
  { min: -49, max: -1, label: "Cold" },
  { min: 0, max: 29, label: "Neutral" },
  { min: 30, max: 59, label: "Friendly" },
  { min: 60, max: 89, label: "Close" },
  { min: 90, max: 100, label: "Best Friend" },
];

export function friendshipTier(score) {
  const v = score ?? 0;
  return (FRIENDSHIP_TIERS.find(t => v >= t.min && v <= t.max) || FRIENDSHIP_TIERS[2]).label;
}

// Coarser grouping than the six display tiers — the doc only asks that
// dialogue TONE reflect the tier (§1.4.1/§1.4.3: "cold responses" below 0),
// not that every one of the six labels get its own hand-written variant.
export function toneBucket(score) {
  const v = score ?? 0;
  if (v < 0) return "cold";
  if (v >= 60) return "warm";
  return "neutral";
}

export function clampFriendship(v) { return Math.max(-100, Math.min(100, Math.round(v))); }
export function clampRomance(v) { return Math.max(0, Math.min(100, Math.round(v))); }

// startFriendship defaults to 0 (a true stranger, first meeting). Pass an
// explicit value for an NPC the player canonically already knows (e.g. a
// backstory PATROL partner) — see App.jsx's campaignIntro for the one real
// call site this batch.
export function createRelationship({ name, role, gender, startFriendship = 0 }) {
  return {
    name, role, gender, pronouns: pronounForGender(gender),
    friendship: clampFriendship(startFriendship), romance: 0, met: true,
  };
}

export function adjustFriendship(rel, delta) {
  return { ...rel, met: true, friendship: clampFriendship((rel.friendship ?? 0) + (delta || 0)) };
}

export function adjustRomance(rel, delta) {
  return { ...rel, met: true, romance: clampRomance((rel.romance ?? 0) + (delta || 0)) };
}

// §1.4.2's milestone check: friendship>=90 AND romance>=90. Pure predicate —
// callers diff before/after a delta to fire a one-time moment exactly once,
// rather than this function having any side effect of its own. Deliberately
// hard to reach (romance only trickles +1 per genuinely thoughtful choice,
// per the doc's own "very hard to achieve") and never gates anything else —
// it's a reward, not a route.
export function wasQuietMomentEligible(rel) {
  return (rel?.friendship ?? 0) >= 90 && (rel?.romance ?? 0) >= 90;
}
