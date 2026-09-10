// Community item statistics: aggregate response data for every question,
// shared across all Proximate users. This is the single source of truth for
// "community difficulty" and answer-choice distributions — genuinely
// distinct from (and never conflated with) question QUALITY (a manual
// approval decision, see crowdsource.js) or an individual user's ABILITY
// estimate (see adaptiveEngine.js).
//
// Stats are keyed by the question's stable `id` and reference CANONICAL
// choice indices (the order the question is authored in), never the
// randomized on-screen order a given presentation used — see randomize.js.
//
// Requires Firestore to be genuinely "community" (shared across users). If
// Firebase isn't configured, stats are tracked in a local-only bucket for
// this device so the UI still has something to render, but this is
// explicitly labeled as device-local, not community, data.

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";
import { loadProfile } from "./profile.js";

const LS_KEY = "nremt_local_item_stats";

// Community difficulty is weighted by how the RESPONDER's provider level
// relates to the QUESTION's own level, not counted 1-for-1 the way a naive
// "attempts/correct" tally would. Ladder position, low to high:
//   - Registered Nurse sits on the SAME rung as Paramedic.
//   - Physician, Flight Medic, and APP all sit ONE rung above Paramedic
//     (they're not ranked against each other, just all "above").
//   - "Other Healthcare Professional" is deliberately left OFF the ladder
//     entirely and handled as its own special case below: it never counts
//     toward difficulty at all, in either direction, regardless of whether
//     the answer was right or wrong.
//   - An UNSET level (no profile saved at all — a guest, or an account
//     created before this existed) is a separate case too, and likewise
//     contributes nothing whatsoever.
const LEVEL_RUNG = {
  Layperson: 0,
  EMR: 1,
  EMT: 2,
  AEMT: 3,
  Paramedic: 4,
  "Registered Nurse": 4,
  Physician: 5,
  "Flight Medic": 5,
  APP: 5,
};

// Returns { attemptsWeight, correctWeight }, both added to the running
// totals a response contributes (never negative — "no penalty" means a
// contribution of 0, not a subtraction; "equivalent to N EMTs getting it
// wrong" means N is added to attempts with nothing added to correct, which
// drags the % down exactly the way N real missed EMT attempts would).
//
//   - no responder level saved, or the responder picked "Other Healthcare
//     Professional": contributes nothing, ever.
//   - same rung as the question: normal weight (1 either way).
//   - exactly one rung below: right answers count extra (1.5x), wrong
//     answers don't count against it at all.
//   - two or more rungs below: right answers count for even more (3x,
//     capped there rather than growing without bound), wrong still free.
//   - above the question's rung: a right answer proves nothing (0), a
//     wrong answer is weighted like 2 same-level misses.
// "Other" was this option's value before it was renamed to "Other
// Healthcare Professional." Any account that saved a profile under the old
// name (still sitting in Firestore/localStorage) must keep being treated
// exactly the way it always was — exempt from difficulty weighting — not
// silently reclassified as "above" just because the label changed later.
const NO_EFFECT_LEVELS = new Set(["Other Healthcare Professional", "Other"]);

export function weightFor(responderLevel, questionLevel, wasCorrect) {
  if (!responderLevel || NO_EFFECT_LEVELS.has(responderLevel)) {
    return { attemptsWeight: 0, correctWeight: 0 };
  }
  const qi = LEVEL_RUNG[questionLevel];
  const ri = LEVEL_RUNG[responderLevel];
  if (qi === undefined || ri === undefined || ri > qi) {
    // Above the question's own level (or the question's own level is
    // itself unrecognized): a right answer proves nothing; a wrong
    // answer counts like 2 same-level misses.
    return wasCorrect ? { attemptsWeight: 0, correctWeight: 0 } : { attemptsWeight: 2, correctWeight: 0 };
  }
  if (ri === qi) {
    // Same rung as the question: ordinary 1x weight either way.
    return { attemptsWeight: 1, correctWeight: wasCorrect ? 1 : 0 };
  }
  // Below the question's level: a right answer counts extra; a wrong one
  // never counts against the question at all.
  if (!wasCorrect) return { attemptsWeight: 0, correctWeight: 0 };
  const rungsBelow = qi - ri;
  return rungsBelow === 1 ? { attemptsWeight: 1.5, correctWeight: 1.5 } : { attemptsWeight: 3, correctWeight: 3 };
}

// A question's difficulty estimate isn't trusted at all until it has
// gathered at least this many responses; below that, item selection treats
// it as "provisional" (see adaptiveEngine.js's RELIABLE_N constant, which
// mirrors this).
export const MIN_RESPONSES_FOR_DISPLAY = 5;

function blankStats(numChoices) {
  return {
    attempts: 0,
    correct: 0,
    choiceCounts: new Array(numChoices).fill(0),
    updatedAt: 0,
  };
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocal(all) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

// In-memory cache so a single practice/exam session doesn't refetch the same
// question's stats from Firestore repeatedly.
const cache = new Map();

export async function getItemStats(question) {
  if (cache.has(question.id)) return cache.get(question.id);
  let stats = null;
  if (firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "questionStats", question.id));
      if (snap.exists()) {
        const d = snap.data();
        stats = {
          attempts: d.attempts || 0,
          correct: d.correct || 0,
          choiceCounts: d.choiceCounts || new Array(question.choices.length).fill(0),
          updatedAt: d.updatedAt || 0,
          source: "community",
        };
      }
    } catch (e) {
      console.error("getItemStats: Firestore read failed, falling back to local", e);
    }
  }
  if (!stats) {
    const local = loadLocal();
    const s = local[question.id] || blankStats(question.choices.length);
    stats = { ...s, source: firebaseConfigured ? "community" : "local" };
  }
  cache.set(question.id, stats);
  return stats;
}

// Records one real response against a question's community stats. Must be
// called with the CANONICAL choice index (never the randomized display
// index) so stats stay correctly associated with the underlying choice
// regardless of how any individual presentation was shuffled.
//
// `user`, if given, supplies the responder's provider level so the
// contribution can be weighted per weightFor() above (see that function's
// own comment for the full rule). No user / no saved provider level / a
// guest with nothing set all fall back to weightFor's "unknown" treatment.
export async function recordResponse(question, canonicalChoiceIndex, wasCorrect, user) {
  cache.delete(question.id); // force a fresh read next time it's needed

  let responderLevel;
  if (user) {
    try {
      const profile = await loadProfile(user);
      responderLevel = profile?.providerLevel;
    } catch {
      /* fall through with an unknown level */
    }
  }
  const { attemptsWeight, correctWeight } = weightFor(responderLevel, question.level, wasCorrect);
  if (attemptsWeight === 0) return; // this response is defined to count for nothing

  if (firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc, increment } = await import("firebase/firestore");
      const choiceField = `choiceCounts.${canonicalChoiceIndex}`;
      await setDoc(
        doc(db, "questionStats", question.id),
        {
          attempts: increment(attemptsWeight),
          correct: increment(correctWeight),
          [choiceField]: increment(attemptsWeight),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return;
    } catch (e) {
      console.error("recordResponse: Firestore write failed, recording locally", e);
    }
  }

  const local = loadLocal();
  const s = local[question.id] || blankStats(question.choices.length);
  s.attempts += attemptsWeight;
  s.correct += correctWeight;
  s.choiceCounts[canonicalChoiceIndex] = (s.choiceCounts[canonicalChoiceIndex] || 0) + attemptsWeight;
  s.updatedAt = Date.now();
  local[question.id] = s;
  saveLocal(local);
}

// Community difficulty, as a "% of attempts that were correct" figure for
// display (distinct from the IRT-style logit `b` used internally by the
// adaptive engine — see adaptiveEngine.js's `difficultyFromStats`).
export function pctCorrect(stats) {
  if (!stats || stats.attempts === 0) return null;
  return Math.round((stats.correct / stats.attempts) * 100);
}

// Per-choice selection percentages, safe against divide-by-zero and never
// fabricated when the sample is small — callers should also check
// `stats.attempts < MIN_RESPONSES_FOR_DISPLAY` and label accordingly rather
// than presenting these numbers as authoritative.
export function choicePercentages(stats, numChoices) {
  const counts = stats?.choiceCounts || new Array(numChoices).fill(0);
  const total = counts.reduce((a, b) => a + (b || 0), 0);
  return counts.map((c) => (total > 0 ? Math.round(((c || 0) / total) * 100) : 0));
}
