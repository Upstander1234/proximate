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

const LS_KEY = "nremt_local_item_stats";

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
export async function recordResponse(question, canonicalChoiceIndex, wasCorrect) {
  cache.delete(question.id); // force a fresh read next time it's needed

  if (firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc, increment } = await import("firebase/firestore");
      const choiceField = `choiceCounts.${canonicalChoiceIndex}`;
      await setDoc(
        doc(db, "questionStats", question.id),
        {
          attempts: increment(1),
          correct: increment(wasCorrect ? 1 : 0),
          [choiceField]: increment(1),
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
  s.attempts += 1;
  if (wasCorrect) s.correct += 1;
  s.choiceCounts[canonicalChoiceIndex] = (s.choiceCounts[canonicalChoiceIndex] || 0) + 1;
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
