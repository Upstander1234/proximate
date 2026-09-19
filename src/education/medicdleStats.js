// Education Medicdle — community statistics.
//
// The per-user Medicdle log (eduMedicdle.js) already records, for every
// completed case, the stage the player solved it at (or null), the number
// of guesses, the clues required, and the player's own provider level.
// That is enough to answer the spec's community questions, but only if the
// ATTEMPTS are aggregated across users rather than left in each user's own
// document — which is what this module does.
//
// Shape (parallel to itemStats.js, same discipline):
//   - the pure part (contributionFor / summarize) is what a verification
//     script can exercise with synthetic data
//   - the impure part (recordMedicdleStatContribution / loadMedicdleStats)
//     is the only thing that touches Firestore
//   - an aggregate document is ONLY ever incremented from a real, completed
//     attempt. Nothing here invents a value, and no number is ever
//     displayed from an aggregate smaller than MIN_ATTEMPTS_FOR_DISPLAY —
//     callers get `sufficient: false` and must say so.
//
// Required Firestore security rules (same convention as globalStats.js's
// own documented shape — counters only, no per-user content):
//
//   match /medicdleStats/{caseId} {
//     allow read: if request.auth != null;
//     allow write: if request.auth != null;
//   }

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";
import { STAGES } from "./medicdleData.js";

// Below this many COMPLETED attempts, no percentage is shown at all — the
// UI says there isn't enough data instead. Deliberately the same order of
// magnitude as adaptiveEngine.js's own RELIABLE_N reliability floor.
export const MIN_ATTEMPTS_FOR_DISPLAY = 10;

// A provider level needs this many completed attempts of its own before its
// row is shown as a percentage, for the same reason.
export const MIN_LEVEL_ATTEMPTS_FOR_DISPLAY = 5;

function blankStageCounts() {
  return Object.fromEntries(STAGES.map((_, i) => [String(i + 1), 0]));
}

// Firestore field paths can't contain "." or "/", and a provider level is a
// free-form string chosen at signup. Percent-encoding keeps every level
// addressable as its own map key without a lossy slug.
export function keyOf(providerLevel) {
  if (!providerLevel) return null;
  return encodeURIComponent(String(providerLevel));
}

function safeDecode(key) {
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

// What ONE "started today's case" event adds to an aggregate. Tracked
// separately from completions so completion rate is a real ratio
// (completed / started) rather than a number that is 100% by construction.
export function startContribution(providerLevel) {
  const payload = { started: 1, updatedAt: Date.now() };
  const level = keyOf(providerLevel);
  if (level) payload[`byLevel.${level}.started`] = 1;
  return payload;
}

// What ONE completed attempt adds. `stageSolved` is the stage the player
// SOLVED the case at (1-5), or null when they never identified it — a real
// and meaningful distinction, so an unsolved attempt is counted in `total`
// and never in any stage bucket.
export function contributionFor(attempt) {
  const stageKey = attempt.solved && attempt.stageSolved ? String(attempt.stageSolved) : null;
  const clues = attempt.cluesRequired || attempt.stageReached || 1;
  const payload = {
    total: 1,
    solved: attempt.solved ? 1 : 0,
    cluesUsedSum: clues,
    [`stage.${stageKey || "unsolved"}`]: 1,
    updatedAt: Date.now(),
  };
  const level = keyOf(attempt.providerLevel);
  if (level) {
    payload[`byLevel.${level}.total`] = 1;
    payload[`byLevel.${level}.solved`] = attempt.solved ? 1 : 0;
    payload[`byLevel.${level}.cluesUsedSum`] = clues;
    payload[`byLevel.${level}.stage.${stageKey || "unsolved"}`] = 1;
  }
  return payload;
}

// PURE aggregation of a raw aggregate document into display values. Any
// rate whose denominator is zero is `null`, never 0 — "no data" and "0%"
// are different claims and the UI must be able to tell them apart.
export function summarize(agg) {
  const a = agg || {};
  const total = a.total || 0;
  const started = a.started || 0;
  const solved = a.solved || 0;
  const stage = { ...blankStageCounts(), ...(a.stage || {}) };
  const stagePct = {};
  for (const key of Object.keys(stage)) {
    stagePct[key] = total ? Math.round((stage[key] / total) * 100) : null;
  }
  return {
    started,
    total,
    solved,
    unsolved: total - solved,
    sufficient: total >= MIN_ATTEMPTS_FOR_DISPLAY,
    // Completion rate: of the players who opened this case, how many
    // finished it (solved or not). Needs the start counter, so it is null
    // rather than a misleading 100% when no start was ever recorded.
    completionRatePct: started ? Math.min(100, Math.round((total / started) * 100)) : null,
    // Success rate: of those who finished, how many identified it.
    successRatePct: total ? Math.round((solved / total) * 100) : null,
    averageClues: total ? Number(((a.cluesUsedSum || 0) / total).toFixed(2)) : null,
    stagePct,
    stageCounts: stage,
  };
}

// Per-provider-level breakdown, each row summarized the same way the
// overall figure is. A level under MIN_LEVEL_ATTEMPTS_FOR_DISPLAY keeps its
// real counts but reports `displaySufficient: false`, so the UI can show a
// raw number instead of a percentage it has not earned.
export function summarizeByLevel(agg) {
  const byLevel = agg?.byLevel || {};
  return Object.entries(byLevel)
    .map(([key, value]) => {
      const summary = summarize(value);
      return {
        levelKey: key,
        providerLevel: safeDecode(key),
        completed: summary.total,
        ...summary,
        displaySufficient: summary.total >= MIN_LEVEL_ATTEMPTS_FOR_DISPLAY,
      };
    })
    .sort((a, b) => b.completed - a.completed);
}

// The row for the player's OWN provider level, so it can be highlighted in
// a comparison list. Returns null when that level has no recorded attempts
// at all — in which case there is nothing to highlight, and the UI must not
// imply otherwise.
export function findLevelRow(rows, providerLevel) {
  if (!providerLevel) return null;
  const key = keyOf(providerLevel);
  return rows.find((r) => r.levelKey === key) || null;
}

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

const COLLECTION = "medicdleStats";

// Fire-and-forget, exactly like globalStats.js's incrementGlobalCounter: a
// failed statistics write must never interrupt or fail the real attempt the
// player just made. Only ever called for a real, completed attempt.
export function recordMedicdleStatContribution(caseId, payload) {
  if (!firebaseConfigured || !caseId || !payload) return;
  (async () => {
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc, increment } = await import("firebase/firestore");
      const update = {};
      for (const [path, value] of Object.entries(payload)) {
        if (path === "updatedAt") {
          update[path] = value;
        } else if (typeof value === "number") {
          update[path] = increment(value);
        }
      }
      await setDoc(doc(db, COLLECTION, caseId), update, { merge: true });
    } catch (e) {
      console.error(`recordMedicdleStatContribution(${caseId}) failed`, e);
    }
  })();
}

// Returns { overall, byLevel, raw } for one case, or null when community
// statistics are simply not available (Firebase not configured, or the read
// failed). A missing document is NOT an error and NOT "0%" — it returns a
// real all-zero aggregate whose summarize() reports sufficient: false, so
// the UI says "not enough data yet" rather than showing a percentage.
export async function loadMedicdleStats(caseId) {
  if (!firebaseConfigured || !caseId) return null;
  try {
    const db = await getFirebaseDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, COLLECTION, caseId));
    const raw = snap.exists() ? snap.data() : null;
    return {
      overall: summarize(raw),
      byLevel: summarizeByLevel(raw),
      raw,
    };
  } catch (e) {
    console.error(`loadMedicdleStats(${caseId}) failed`, e);
    return null;
  }
}