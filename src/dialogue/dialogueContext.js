// src/dialogue/dialogueContext.js — builds a compact, purpose-built dialogue
// context from real game state (F0 items 13-15). Deliberately NOT the whole
// `s`/`g` object: only the fields a speaker could plausibly need are pulled
// out, and only what a given SPEAKER could reasonably know is exposed to the
// template/provider layer (item 15) — the patient slice never includes crew-
// only facts, the crew slice never includes the patient's own internal pain
// score, etc.
//
// Called once per dialogue-generation event, not on every tick — this file
// has no state of its own and does no I/O.

import { patientPersonality, patientSeedKey } from "./personality.js";
import { deriveEmotionalState } from "./emotionalState.js";
import { SCEN } from "../data/scenarios.js";

// F0 item 15's third character class: "A family/bystander can know what
// they personally witnessed, their relationship to the patient, their own
// emotional state." Every real scenario in this game already declares a
// free-text `bystanders` field (data/scenarios.js) — a spouse, a neighbor, a
// coworker, etc — previously pure flavor text, read only once for the
// scene-arrival log line (App.jsx). This is the smallest real structured
// signal worth pulling out of it: a coarse ROLE label (matched against
// common relationship words in the free text) and a PRESENCE flag. No
// scenario in this codebase models a bystander leaving or arriving mid-call
// (confirmed by reading every `bystanders` string — none reference the
// bystander stepping out), so presence is simply "the scenario declares a
// non-empty bystanders string," true for the whole call rather than tracked
// per-tick.
const BYSTANDER_ROLE_PATTERNS = [
  [/\bhusband\b/i, "husband"], [/\bwife\b/i, "wife"], [/\bspouse\b/i, "spouse"],
  [/\bgirlfriend\b/i, "girlfriend"], [/\bboyfriend\b/i, "boyfriend"],
  [/\bmother\b/i, "mother"], [/\bfather\b/i, "father"], [/\bparents?\b/i, "parent"],
  [/\bdaughter\b/i, "daughter"], [/\bson\b/i, "son"],
  [/\bsister\b/i, "sister"], [/\bbrother\b/i, "brother"],
  [/\broommate\b/i, "roommate"], [/\bneighbou?r\b/i, "neighbor"],
  [/\bfriend/i, "friend"], [/\bcoworker|colleague|workmate/i, "coworker"],
];
function bystanderRole(text) {
  for (const [re, role] of BYSTANDER_ROLE_PATTERNS) if (re.test(text)) return role;
  return "bystander";
}

// The custom-scenario builder (data/customScenario.js) always returns the
// SAME fixed bystanders string regardless of the chosen condition/age/
// gender, so this reads that constant directly rather than paying the cost
// of running buildCustomScenario() (which recomputes a whole scenario
// object) on every dialogue-context build just to read one unchanging field.
const CUSTOM_BYSTANDERS_TEXT = "A bystander flagged you down and is standing back now, watching.";
function scenarioBystanderText(s) {
  if (!s) return null;
  if (s.scen === "custom") return CUSTOM_BYSTANDERS_TEXT;
  return SCEN[s.scen]?.bystanders || null;
}

// A real vitals-TREND signal (F0 item 17's "vitals trend" input), derived
// from actual pain/consciousness/vitals deltas across ticks — never
// narrated. State is kept on `s` itself (the same "small `_`-prefixed
// bookkeeping field on the live game-state draft" idiom App.jsx's own
// `_analgesiaCheckAt` already uses), guarded by `s.t` so calling
// buildDialogueContext more than once for the SAME tick (a real, existing
// pattern — see dialogueManager.js's generateDialogueSync followed by
// requestLocalUpgrade for one event) reads back the same trend rather than
// comparing a snapshot against itself.
//
// Originally tracked only pain/consciousness (a real, previously-documented
// F0 gap — CLAUDE.md's own F0 status paragraph named it directly). Now also
// reads hr/spo2/sbp — the same three vitals actions.js's own default exam
// findings (`heart`/pulse checks, the O2-sat display, `skin`/`capRefill`)
// already treat as the bedside signs of a deteriorating or stabilizing
// patient, so a patient trending tachycardic/hypoxic/hypotensive can push
// toward "agitated"/"frightened" even when pain/consciousness alone
// wouldn't trigger it (e.g. compensated shock, early respiratory failure)
// and a patient trending back toward normal vitals can support "reassured"
// even without a pain change (e.g. albuterol relieving tachypnea/hypoxia
// before pain, which many of these patients never had, changes at all).
// Thresholds are deliberately generous deltas (not "any change") so normal
// per-tick monitor noise (vitals() itself adds jitter — see patient.js's own
// `filter()` helper) can't spuriously flip the trend every tick.
function computeTrend(s, painNow, consNow, vNow) {
  if (!s) return "stable";
  const tNow = s.t || 0;
  const prev = s._emoTrendPrev;
  if (prev && prev.t === tNow) return prev.trend;
  const hrNow = vNow?.hr;
  const spo2Now = vNow?.spo2;
  const sbpNow = vNow?.sbp;
  let trend = "stable";
  if (prev) {
    if (painNow - prev.pain >= 2) trend = "worsening";
    else if (prev.pain - painNow >= 2) trend = "improving";
    else if (prev.cons === "awake" && consNow !== "awake") trend = "worsening";
    else if (prev.cons !== "awake" && consNow === "awake") trend = "improving";
    // Falling SpO2 is checked first among the vitals signals: hypoxia is the
    // single most urgent bedside sign a trend signal can carry, ahead of an
    // isolated HR/BP move which can have many benign explanations (anxiety,
    // exertion, a monitor artifact) on its own.
    else if (prev.spo2 != null && spo2Now != null && prev.spo2 - spo2Now >= 4) trend = "worsening";
    else if (prev.spo2 != null && spo2Now != null && spo2Now - prev.spo2 >= 4 && prev.spo2 < 94) trend = "improving";
    // Tachycardia trending further up/down — gated on the patient actually
    // being tachycardic (not just noisy movement inside a normal range), the
    // same "graded, not any change" idiom the pain branch above already
    // uses at its own >=2-point threshold.
    else if (prev.hr != null && hrNow != null && hrNow - prev.hr >= 15 && hrNow > 100) trend = "worsening";
    else if (prev.hr != null && hrNow != null && prev.hr - hrNow >= 15 && prev.hr > 100) trend = "improving";
    // Falling SBP trending toward hypotension, or climbing back out of it.
    else if (prev.sbp != null && sbpNow != null && prev.sbp - sbpNow >= 15 && sbpNow < 100) trend = "worsening";
    else if (prev.sbp != null && sbpNow != null && sbpNow - prev.sbp >= 15 && prev.sbp < 100) trend = "improving";
  }
  s._emoTrendPrev = { t: tNow, pain: painNow, cons: consNow, hr: hrNow, spo2: spo2Now, sbp: sbpNow, trend };
  return trend;
}

// v is physio(s) — already computed by the caller (the tick loop always has
// one in scope from arrestWarning()/etc, so this never re-runs the engine).
export function buildDialogueContext(s, v) {
  if (!s || !v) return null;
  const personality = patientPersonality(patientSeedKey(s));
  const consciousness = v._cons || "awake";
  const painLevel = Math.round(v.pain || 0);
  const distress = clamp01((v.pain || 0) / 10 * 0.6 + personality.anxious * 0.4
    + (consciousness !== "awake" ? 0.2 : 0));
  const elapsedMin = Math.round((s.t || 0) / 60 * 10) / 10;
  const trend = computeTrend(s, painLevel, consciousness, v);
  // The SIMULATION-determined state (F0 item 17) — derived here from real
  // physio fields and never writable by any dialogue provider; see
  // emotionalState.js's own header for the one-way boundary this enforces.
  const emotionalState = deriveEmotionalState({ consciousness, painLevel, personality, trend, elapsedMin });
  const bystanderText = scenarioBystanderText(s);

  return {
    patient: {
      name: s.patientName || null,
      age: s.patient?.age ?? null,
      consciousness,
      painLevel,
      distress,
      personality,
      emotionalState,
    },
    situation: {
      phase: s.phase || null,
      scenarioTitle: s.scen || null,
      elapsedMin: Math.round((s.t || 0) / 60 * 10) / 10,
    },
    // F0 item 15's bystander/family slice — see bystanderRole()'s own header
    // above. `role` is null when nobody is present so a template pool never
    // accidentally fires off a stale/default role.
    bystander: bystanderText ? { present: true, role: bystanderRole(bystanderText) } : { present: false, role: null },
    player: { level: s.level || null },
    crew: (s.crew || []).map((c) => ({ id: c.id, name: c.name, level: c.level })),
    // A short, bounded rolling summary rather than the full g.log — item 14's
    // "keep context small." Callers pass in whatever short memory they're
    // already carrying (dialogueManager owns that array); this function just
    // shapes it, it doesn't own or grow it.
    recentEvents: Array.isArray(s.dialogueMemory) ? s.dialogueMemory.slice(-4) : [],
    // The real, per-NPC memory store (characterBrain.js) — a separate,
    // wiped-per-call bucket of what EACH character has personally already
    // said, distinct from the scene-wide recentEvents above. Passed through
    // as-is; characterBrain.js's buildCharacterBrain() is the only place
    // that reads out of it (per npcId()), so the scoping/knowledge-boundary
    // logic stays in one file.
    npcBrains: s.npcBrains || {},
  };
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }
