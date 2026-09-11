// Predicted-probability-of-correctness tracking for MCQ Practice.
//
// Before a user answers a question, Proximate estimates a % chance they'll
// get it right (from the question's own community difficulty, blended with
// the user's own recent accuracy). After they answer, that prediction and
// the real outcome are both recorded, so calibration (is Proximate over- or
// under-confident, and where) can be measured over time.
//
// Same local-mirror + debounced-cloud-sync shape as store.js/examStore.js —
// works offline and in guest mode too. The log is capped so it can't grow
// unboundedly; only the most recent entries matter for calibration.

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";
import { pctCorrect } from "./itemStats.js";

const LS_PREFIX = "nremt_predictions_";
const MAX_LOG = 500;

function lsKey(uid) {
  return LS_PREFIX + uid;
}

function loadLocal(uid) {
  try {
    const raw = localStorage.getItem(lsKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(uid, log) {
  try {
    localStorage.setItem(lsKey(uid), JSON.stringify(log));
  } catch {
    /* ignore */
  }
}

// Estimates the % chance (0-100 integer) a user answers this question
// correctly, before they see it. Blends the question's own community
// difficulty (`stats`) with the user's own recent overall accuracy
// (`userAccuracyPct`, from userStats.js) — either input may be missing
// (a fresh question with no community data yet, or a user with no answer
// history yet), in which case the estimate falls back to whichever real
// input is available, or a neutral 65% default.
export function estimatePredictedProb(stats, userAccuracyPct) {
  const communityP = pctCorrect(stats);
  if (communityP == null && userAccuracyPct == null) return 65;
  if (communityP == null) return Math.round(userAccuracyPct);
  if (userAccuracyPct == null) return communityP;
  return Math.round(communityP * 0.6 + userAccuracyPct * 0.4);
}

const cache = new Map();

export async function loadPredictionLog(user) {
  if (!user) return [];
  if (cache.has(user.uid)) return cache.get(user.uid);
  let log = null;
  if (!user.isGuest && firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "nremtPredictions", user.uid));
      if (snap.exists()) log = snap.data().log || [];
    } catch (e) {
      console.error("loadPredictionLog: falling back to local cache", e);
    }
  }
  if (!log) log = loadLocal(user.uid);
  cache.set(user.uid, log);
  return log;
}

let saveTimer = null;
let pending = null;

// entry: { questionId, domain, level, predictedPct, actualCorrect, ts }
export async function recordPrediction(user, entry) {
  if (!user) return;
  const log = [...(cache.get(user.uid) || (await loadPredictionLog(user)))];
  log.push({ ...entry, ts: Date.now() });
  while (log.length > MAX_LOG) log.shift();
  cache.set(user.uid, log);
  saveLocal(user.uid, log);
  if (user.isGuest || !firebaseConfigured) return;

  pending = { user, log };
  if (saveTimer) return;
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    const { user: u, log: l } = pending;
    pending = null;
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "nremtPredictions", u.uid), { log: l, updatedAt: Date.now() });
    } catch (e) {
      console.error("recordPrediction: cloud save failed, local copy is intact", e);
    }
  }, 800);
}

// Buckets predictions into deciles (0-10%, 10-20%, ...) and compares each
// bucket's mean predicted probability against its own actual accuracy —
// the standard calibration-curve shape. A bucket with too little data
// (<3 entries) is dropped rather than shown as a misleadingly precise
// point.
export function calibrationCurve(log) {
  const buckets = Array.from({ length: 10 }, () => ({ predictedSum: 0, correctSum: 0, n: 0 }));
  for (const e of log) {
    const idx = Math.min(9, Math.floor(e.predictedPct / 10));
    const b = buckets[idx];
    b.predictedSum += e.predictedPct;
    b.correctSum += e.actualCorrect ? 1 : 0;
    b.n += 1;
  }
  return buckets
    .map((b, i) => ({
      bucketLabel: `${i * 10}-${i * 10 + 10}%`,
      n: b.n,
      predictedPct: b.n ? Math.round(b.predictedSum / b.n) : null,
      actualPct: b.n ? Math.round((b.correctSum / b.n) * 100) : null,
    }))
    .filter((b) => b.n >= 3);
}

// A single overconfidence/underconfidence number: mean(predicted - actual)
// across the whole log. Positive = overconfident (predicts higher than it
// delivers), negative = underconfident. null if there's not enough data.
export function overallCalibrationBias(log) {
  if (!log || log.length < 5) return null;
  const sum = log.reduce((acc, e) => acc + (e.predictedPct - (e.actualCorrect ? 100 : 0)), 0);
  return Math.round(sum / log.length);
}
