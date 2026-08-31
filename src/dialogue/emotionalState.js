// src/dialogue/emotionalState.js — F0 item 17: a structured emotional state,
// distinct from static personality (item 16, personality.js), that the
// SIMULATION determines from real physiology/events. The dialogue layer
// (templates and the tier-3 prompt) may only READ this and express it —
// nothing here, or in dialogueProvider.js's providers, ever writes back into
// a physiology field. This module itself touches no `pat.*` field either; it
// only reads values the physio tick loop already computed (v.pain, v._cons)
// plus the already-real personality draw, so it is expression, not
// simulation, per this project's own physiology/dialogue boundary.
//
// Ten canonical states, per the spec's own list. `embarrassed` is
// deliberately NOT reachable through the general derivation below — no
// signal in this engine currently distinguishes an embarrassment-appropriate
// moment (e.g. clothing removal, incontinence) from ordinary distress, and
// inventing one to fill out the list would be exactly the decorative-field
// pattern this project's conventions forbid. It stays in the enum so a
// future call site with a real trigger (e.g. an `expose@` scenario beat) can
// pass it as an explicit override the same way crew events already override
// TemplateProvider's bucket selection — see dialogueProvider.js.
export const EMOTIONAL_STATES = [
  "calm", "anxious", "frightened", "confused", "agitated",
  "angry", "embarrassed", "in pain", "reassured", "exhausted",
];

// Real, simulation-driven inputs only:
//   consciousness — v._cons, the physio tick's own classification.
//   painLevel     — v.pain (0-10), the physio tick's own pain field.
//   personality   — the five static traits (personality.js), read-only here.
//   trend         — "worsening" | "improving" | "stable", derived in
//                   dialogueContext.js from real pain/consciousness deltas
//                   across ticks (see computeTrend there) — a real vitals-
//                   trend signal, not narrated.
//   elapsedMin    — real scene-clock minutes (s.t), used only for the
//                   "exhausted" case (a long call wears a patient down).
export function deriveEmotionalState({ consciousness, painLevel, personality, trend, elapsedMin }) {
  const p = personality || {};
  const anxious = p.anxious ?? 0;
  const irritable = p.irritable ?? 0;
  const pain = painLevel ?? 0;

  // Altered consciousness overrides everything else — a drowsy/obtunded
  // patient isn't reliably "anxious" or "calm," they're confused, matching
  // the real clinical presentation this engine's own consciousness ladder
  // (neuro.js) already classifies as altered.
  if (consciousness && consciousness !== "awake") return "confused";

  // A real, physiology-driven deterioration in the last few ticks (rising
  // pain or falling consciousness) — how it reads depends on the patient's
  // own anxiety trait, the same "two patients don't sound identical" idea
  // item 16 already establishes for templates, now applied to the
  // simulation-determined state itself.
  if (trend === "worsening") return anxious > 0.55 ? "frightened" : "agitated";
  if (trend === "improving") return "reassured";

  // Severe, sustained pain with no active trend either way.
  if (pain >= 7) return "in pain";

  // A high-irritability patient in real, meaningful pain reads as angry,
  // not merely anxious — a distinct clinical presentation template dialogue
  // already distinguishes via the "irritable" bucket (dialogueProvider.js);
  // this makes the SAME distinction at the simulation-state level instead of
  // only the wording level.
  if (irritable > 0.66 && pain >= 4) return "angry";

  // A long call with ongoing, if modest, pain — real fatigue, not narrated.
  if ((elapsedMin ?? 0) >= 20 && pain >= 3) return "exhausted";

  if (anxious > 0.66) return "anxious";
  return "calm";
}

// Maps a derived (or overridden) emotional state onto TemplateProvider's
// existing 3-way template bucket (calm/anxious/irritable) — kept small on
// purpose (item 3's "small, hand-authored" Tier-2 pool) rather than writing
// 10 parallel template sets for a first pass. Any state not listed falls
// back to "calm".
const STATE_TO_BUCKET = {
  calm: "calm", reassured: "calm", confused: "calm", exhausted: "calm", embarrassed: "calm",
  anxious: "anxious", frightened: "anxious",
  agitated: "irritable", angry: "irritable",
  "in pain": "calm",
};

export function bucketForEmotionalState(state) {
  return STATE_TO_BUCKET[state] || "calm";
}
