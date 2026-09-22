// src/dialogue/characterBrain.js — a real per-NPC "brain": for any given
// speaker in a dialogue event, builds the SMALL, SCOPED slice of knowledge
// that character could actually have, and nothing else. This is the piece
// F0 item 15 ("no character may know something they couldn't reasonably
// know") originally only enforced with one hand-written prompt sentence per
// speaker type — this module makes it a real, shared, per-CHARACTER (not
// just per-speaker-TYPE) construct: two different crew members on the same
// call now have their own name, their own stable personality, and their own
// knowledge slice, instead of every "crew" line coming from one
// interchangeable, anonymous voice.
//
// buildCharacterBrain() itself is a pure, synchronous FILTER: given the full
// dialogue context (dialogueContext.js) and which character is about to
// speak, return only the fields that character's own vantage point could
// contain. Nothing here writes back into physiology or game state (item
// 21) — every value returned is read-only text/numbers for a prompt or a
// template pick.
//
// SEPARATE PER-NPC MEMORY (real, persistent for the call, wiped for the
// next one). `dialogueManager.js`'s own bounded `dialogueMemory` window is
// a single SHARED scrollback of every recent line, from every speaker —
// useful as scene-wide "recent moments" grounding, but it is not what any
// one character would call their OWN memory. This file also owns a genuinely
// separate store, keyed by a stable per-NPC id (npcId() below), of just the
// lines THAT character has personally said this call — the closest thing
// this engine has to an independent conversation thread per NPC, without
// building N separate model sessions: each generation call is still a
// single one-shot prompt (see dialogueProvider.js), but that prompt is now
// seeded with "what I, this specific character, already said" rather than
// a scene-wide shared log. The store itself lives on the live game-state
// object (`s.npcBrains`, initialized in App.jsx's blank()) — not a module
// singleton — so it is naturally scoped to one call/save and is wiped the
// instant a new call starts (the same `{...blank(),...carry(s)}` reset
// every other per-call dialogue field, like dialogueMemory, already goes
// through). Medical Simulation Mode has no reason to keep it any longer
// than that, per explicit product direction.

const OWN_MEMORY_CAP = 4;

// A stable id for "which NPC is this," independent of which TYPE they are —
// two different crew members must never share one memory bucket. Patient
// and bystander are both effectively singletons per call (this engine
// spawns at most one bystander voice per scenario today), so a fixed id is
// honest for them; a crew member's own roster id is already unique and
// stable for the life of the call.
export function npcId(speaker, actingCrewId) {
  if (speaker === "crew") return actingCrewId || "crew";
  if (speaker === "bystander") return "bystander";
  return "patient";
}

// Returns a NEW store (never mutates the one passed in) with `text`
// appended to that one NPC's own bounded memory — the same
// "return a new bounded array" shape dialogueManager.js's own
// pushDialogueMemory already uses, applied per-id instead of scene-wide.
export function rememberNpcLine(store, id, type, name, text) {
  if (!id || !text) return store || {};
  const prev = (store || {})[id];
  const sayLines = [...(prev?.sayLines || []), text].slice(-OWN_MEMORY_CAP);
  return { ...(store || {}), [id]: { id, type, name: name || prev?.name || null, sayLines } };
}

// What this ONE character has personally already said this call, oldest
// first — never another character's lines, never lines from a prior call
// (the store itself was wiped at blank()).
function recallOwnLines(store, id) {
  return (store || {})[id]?.sayLines || [];
}

import { mulberry32 } from "../mapGraph.js";

function strHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Crew members get their own stable personality the same way patients do
// (personality.js's own pattern, reused rather than duplicated) — seeded off
// the crew member's own id, so "Paramedic Ali" is consistently the same
// voice across an entire shift, and a different crew member on the next call
// draws a genuinely different one. Traits are named for what a CREW member's
// register would actually vary by (terse vs. talkative, calm vs. rattled
// under pressure, blunt vs. reassuring), not reused wholesale from the
// patient's own five traits, since a professional's bedside manner isn't the
// same axis as a patient's anxiety about their own body.
export function crewMemberPersonality(crewId) {
  const rng = mulberry32(strHash(`crew|${crewId || "unknown"}`));
  return {
    terse: rng(), // short/clipped vs. talkative under pressure
    steady: rng(), // stays calm vs. audibly rattled when things get bad
    blunt: rng(), // matter-of-fact vs. softer/reassuring toward the patient
  };
}

// Which crew member is actually SPEAKING for a given crew-voiced event.
// Deliberately simple and deterministic, not random per call: prefers
// whoever the event itself names (event.crewId, set by the caller when it
// already knows who's handling the moment — e.g. whichever crew member is
// mid-task), falling back to the highest-scope non-pilot crew member present
// (the one most likely to be the one narrating a clinical reaction), then
// simply the first crew member on scene. Returns null if nobody is present
// — callers already gate crew-voiced events on `s.crew.length`, so this is
// only a fallback, never the primary gate.
export function resolveActingCrew(crewList, event) {
  const list = Array.isArray(crewList) ? crewList : [];
  if (!list.length) return null;
  if (event?.crewId) {
    const named = list.find((c) => c.id === event.crewId);
    if (named) return named;
  }
  const nonPilots = list.filter((c) => !c.pilot);
  const pool = nonPilots.length ? nonPilots : list;
  // Highest LEVELS[level].n first, if a level is present on the object —
  // this module doesn't import LEVELS (a front-end/App.jsx concept) to stay
  // a small, dependency-free dialogue-layer file, so it sorts by a crude,
  // already-comparable proxy instead: level strings this project uses are
  // ranked consistently enough (e.g. "medic" > "emt" > "layperson" in every
  // roster this game builds) that picking the LONGEST level string as a
  // tie-break is not reliable — so this deliberately does NOT try to rank
  // by scope at all, and just takes the first present crew member, which is
  // simple, stable across a call (no flicker between different "actors" for
  // the same kind of event), and good enough for a voice pick that only
  // affects which NAME/PERSONALITY narrates a reaction, not any mechanic.
  return pool[0];
}

// The three real speaker TYPES this game's dialogue system supports, and
// exactly what each one's "brain" is allowed to see. This is the boundary
// enforced both in the LLM prompt (dialogueProvider.js's buildPrompt/
// buildWasmPrompt, which now call this instead of re-deriving the same
// rules inline) and, implicitly, in what ctx fields ever get formatted into
// a template pool.
//
//  patient   — knows their OWN body (how they feel: pain, consciousness,
//              their own personality/emotional state), who is present
//              (crew/bystander by name/role, not by clinical level or
//              scope), and roughly how long this has been going on. Does
//              NOT know any number a monitor would show (no raw hr/spo2/sbp
//              — a real patient reports symptoms, not vitals) and does not
//              know another character's own inner state.
//  crew      — knows their OWN name/role/personality, what is CLINICALLY
//              OBSERVABLE about the patient (consciousness, a plain-language
//              severity read of pain/distress — not the patient's private
//              personality traits, which a provider can't see into), who
//              else is on scene, and the event that just happened. Does NOT
//              know the patient's own internal emotionalState label (a crew
//              member infers behavior, they don't read a diagnosis off the
//              patient's mind) — only a plain description of what's visibly
//              happening.
//  bystander — knows their OWN relationship to the patient and what they
//              personally witnessed (the event type, in plain terms). Does
//              NOT know vitals, diagnoses, lab results, or crew
//              names/roles/levels — a non-medical person on scene has none
//              of that, and is explicitly told so in the resulting prompt.
export function buildCharacterBrain(speaker, ctx, event) {
  const p = ctx?.patient || {};
  const crewList = ctx?.crew || [];
  const store = ctx?.npcBrains;
  if (speaker === "crew") {
    const acting = resolveActingCrew(crewList, event);
    const id = npcId("crew", acting?.id);
    const others = crewList.filter((c) => c.id !== acting?.id).map((c) => c.name).filter(Boolean);
    return {
      type: "crew",
      id,
      name: acting?.name || "a crew member",
      level: acting?.level || null,
      personality: crewMemberPersonality(acting?.id || "unknown"),
      ownRecentLines: recallOwnLines(store, id),
      knows: {
        // A plain, non-numeric read of the patient's state — the same
        // register a real provider narrates out loud, never a raw vitals
        // number (a crew member SEES a monitor, but this game's dialogue
        // layer never hands the LLM a number to read back verbatim, which
        // is what keeps this from ever contradicting the real vitals panel
        // the player is already looking at).
        patientConsciousness: p.consciousness || "awake",
        patientVisiblyInDistress: (p.painLevel ?? 0) >= 6 || p.emotionalState === "frightened" || p.emotionalState === "agitated",
        othersOnScene: others,
        elapsedMin: ctx?.situation?.elapsedMin ?? 0,
        eventType: event?.type || null,
      },
      mustNotKnow: ["the patient's own private personality traits or internal emotional-state label", "any lab value or diagnosis not yet confirmed on scene"],
    };
  }
  if (speaker === "bystander") {
    const role = ctx?.bystander?.role || "bystander";
    const id = npcId("bystander");
    return {
      type: "bystander",
      id,
      name: role,
      level: null,
      personality: null,
      ownRecentLines: recallOwnLines(store, id),
      knows: {
        relationship: role,
        eventType: event?.type || null,
      },
      mustNotKnow: ["vitals", "diagnoses", "lab results", "crew names, roles, or clinical levels"],
    };
  }
  // Default / "patient" brain.
  const patientId = npcId("patient");
  return {
    type: "patient",
    id: patientId,
    name: p.name || null,
    level: null,
    personality: p.personality || {},
    ownRecentLines: recallOwnLines(store, patientId),
    knows: {
      age: p.age ?? null,
      consciousness: p.consciousness || "awake",
      painLevel: p.painLevel ?? 0,
      emotionalState: p.emotionalState || "calm",
      crewPresentNames: crewList.map((c) => c.name).filter(Boolean),
      elapsedMin: ctx?.situation?.elapsedMin ?? 0,
    },
    mustNotKnow: ["any monitor reading (heart rate, blood pressure, oxygen saturation, ECG) as a number", "a diagnosis nobody on scene has told them"],
  };
}
