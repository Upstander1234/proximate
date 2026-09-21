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
import { incrementGlobalCounter } from "./globalStats.js";

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

// A slow or unreachable connection must never hang the caller forever — an
// exam load that awaits this for hundreds of questions in a row (or in
// parallel) needs a hard ceiling per read, after which it just falls back
// to local/blank stats for that one question rather than blocking everyone
// behind it.
const FIRESTORE_READ_TIMEOUT_MS = 8000;

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

export async function getItemStats(question) {
  if (cache.has(question.id)) return cache.get(question.id);
  // choiceCounts is a per-choice-index array — only meaningful for
  // itemTypes with a `choices` array (multiple_choice/multiple_response).
  // build_list/drag_drop/options_table have no such array at all; sizing
  // it to 0 rather than crashing lets ANY question flow through this
  // function safely (community stats for those types are real future
  // work — see itemTypes.js's own header — not a reason to make loading
  // the exam bank/practice pool a hard crash in the meantime).
  const numChoices = question.choices?.length || 0;
  let stats = null;
  if (firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await withTimeout(getDoc(doc(db, "questionStats", question.id)), FIRESTORE_READ_TIMEOUT_MS);
      if (snap.exists()) {
        const d = snap.data();
        stats = {
          attempts: d.attempts || 0,
          correct: d.correct || 0,
          choiceCounts: d.choiceCounts || new Array(numChoices).fill(0),
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
    const s = local[question.id] || blankStats(numChoices);
    stats = { ...s, source: firebaseConfigured ? "community" : "local" };
  }
  cache.set(question.id, stats);
  return stats;
}

// Extracts every CANONICAL choice index a response touches, for the
// per-choice `choiceCounts` breakdown — never the randomized display
// index, so stats stay correctly associated with the underlying choice
// regardless of how any individual presentation was shuffled. Returns []
// for an item type with no natural "which choice(s) did they pick"
// concept (build_list/drag_drop/options_table) — attempts/correct are
// still recorded for those (see recordResponse below), just not a
// per-choice breakdown.
function canonicalIndicesTouched(response) {
  if (typeof response === "number") return [response]; // multiple_choice
  if (Array.isArray(response) && response.every((v) => typeof v === "number")) return response; // multiple_response
  return [];
}

// Records one real response against a question's community stats. `response`
// is whatever evaluateResponse.js's own canonical response shape is for
// this question's itemType (a single canonical index, an array of
// canonical indices, or a non-index shape like a drag_drop placement map —
// see canonicalIndicesTouched above for how each is handled). attempts/
// correct are recorded for EVERY item type — this is the one thing
// adaptiveEngine.js's IRT difficulty estimation (itemParams/
// difficultyFromStats, both itemType-agnostic already) actually needs;
// the per-choice `choiceCounts` breakdown is the smaller, MCQ/
// multiple_response-specific extra on top.
//
// `user`, if given, supplies the responder's provider level so the
// contribution can be weighted per weightFor() above (see that function's
// own comment for the full rule). No user / no saved provider level / a
// guest with nothing set all fall back to weightFor's "unknown" treatment.
export async function recordResponse(question, response, wasCorrect, user) {
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
  // The global "questions answered" counter is a plain engagement count,
  // not a difficulty-calibration signal — it must fire for every real
  // response, including one that weightFor() below defines as contributing
  // nothing to community difficulty (no provider level set, "Other
  // Healthcare Professional", etc). Firing it here, before that weighting
  // is even computed, keeps the two concerns from being silently conflated.
  if (firebaseConfigured) incrementGlobalCounter("totalQuestionsAnswered");

  const { attemptsWeight, correctWeight } = weightFor(responderLevel, question.level, wasCorrect);
  if (attemptsWeight === 0) return; // this response is defined to count for nothing

  const touchedIndices = canonicalIndicesTouched(response);

  if (firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc, increment } = await import("firebase/firestore");
      const update = {
        attempts: increment(attemptsWeight),
        correct: increment(correctWeight),
        updatedAt: Date.now(),
      };
      // One increment() per touched index — real for both a single MCQ
      // pick and a multiple_response set (2-3 indices at once); a plain
      // object literal happily takes several `choiceCounts.N` field paths
      // in one setDoc call, so a multi-select response updates every
      // selected choice's own count atomically alongside attempts/correct.
      for (const idx of touchedIndices) update[`choiceCounts.${idx}`] = increment(attemptsWeight);
      await setDoc(doc(db, "questionStats", question.id), update, { merge: true });
      return;
    } catch (e) {
      console.error("recordResponse: Firestore write failed, recording locally", e);
    }
  }

  const local = loadLocal();
  const s = local[question.id] || blankStats(question.choices?.length || 0);
  s.attempts += attemptsWeight;
  s.correct += correctWeight;
  for (const idx of touchedIndices) {
    if (!s.choiceCounts) s.choiceCounts = [];
    s.choiceCounts[idx] = (s.choiceCounts[idx] || 0) + attemptsWeight;
  }
  s.updatedAt = Date.now();
  local[question.id] = s;
  saveLocal(local);
}

// Maps an SRS rating (srs.js's RATING: 1=Again, 2=Hard, 3=Good, 4=Easy) to
// how much of a "was this correct" signal it represents for DIFFICULTY
// purposes — distinct from whether the quiz answer itself was right. A
// user marking "Again" after a technically-correct answer means the
// question was hard to retain, which should still push its difficulty
// estimate up; "Easy" reinforces that it was genuinely easy.
const SRS_GRADE_FACTOR = { 1: 0, 2: 0.35, 3: 0.7, 4: 1 };

// Records the SRS rating a user gave a card as an ADDITIONAL, separate
// behavioral signal feeding the same community attempts/correct totals
// recordResponse() writes to — not a replacement for the raw correct/
// incorrect signal, an addition to it (see itemParams()/difficultyFromStats
// in adaptiveEngine.js, which read attempts/correct without caring which
// signal contributed them). Weighted at half of an ordinary response's
// weight so a single SRS rating can't dominate the estimate the way the
// underlying quiz answer does.
export async function recordSrsSignal(question, ratingValue, user) {
  cache.delete(question.id);

  let responderLevel;
  if (user) {
    try {
      const profile = await loadProfile(user);
      responderLevel = profile?.providerLevel;
    } catch {
      /* fall through with an unknown level */
    }
  }
  const base = weightFor(responderLevel, question.level, true);
  if (base.attemptsWeight === 0) return;

  const grade = SRS_GRADE_FACTOR[ratingValue] ?? 0.5;
  const attemptsWeight = base.attemptsWeight * 0.5;
  const correctWeight = attemptsWeight * grade;

  if (firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc, increment } = await import("firebase/firestore");
      await setDoc(
        doc(db, "questionStats", question.id),
        { attempts: increment(attemptsWeight), correct: increment(correctWeight), updatedAt: Date.now() },
        { merge: true }
      );
      incrementGlobalCounter("totalSrsReviews");
      return;
    } catch (e) {
      console.error("recordSrsSignal: Firestore write failed, recording locally", e);
    }
  }

  const local = loadLocal();
  const s = local[question.id] || blankStats(question.choices?.length || 0);
  s.attempts += attemptsWeight;
  s.correct += correctWeight;
  s.updatedAt = Date.now();
  local[question.id] = s;
  saveLocal(local);
}

// A plain 0-1 difficulty logit `b` (adaptiveEngine.js's own scale, higher =
// harder) bucketed into a player-facing label.
export function difficultyBand(b) {
  if (b == null) return "Unknown";
  if (b < -0.4) return "Easy";
  if (b > 0.4) return "Hard";
  return "Medium";
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

// Every question that has any community stats yet, for the admin
// "Difficulty Ratings" view. One collection read, not one per question.
export async function fetchAllItemStats() {
  if (!firebaseConfigured) return [];
  try {
    const db = await getFirebaseDb();
    const { collection, getDocs } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, "questionStats"));
    return snap.docs.map((d) => {
      const x = d.data();
      return { id: d.id, attempts: x.attempts || 0, correct: x.correct || 0, updatedAt: x.updatedAt || 0 };
    });
  } catch (e) {
    console.error("fetchAllItemStats failed", e);
    return [];
  }
}
