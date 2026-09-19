// Persisted log of COMPLETED study sessions (Quick 10, Timed Quiz, Custom
// Quiz, Weakest-Area Quiz) — the one piece of quiz-result history nothing
// else in Education Mode kept. Every other analytics input already has a
// home: per-question SRS state (srs.js/store.js), per-answer predictions
// (predictions.js), diagnostic results (diagnosticStore.js), Medicdle/QOTD
// logs (eduMedicdle.js/qotd.js). QuizRunner's results screen used to be
// computed and thrown away, so "quiz results" could not be shown over time;
// this module records the same numbers that screen displays.
//
// It deliberately stores only a SUMMARY per session (counts, level, mode,
// timing, per-domain breakdown) — never a duplicate of the per-question
// signals, which live in the stores above and must stay the single source
// of truth for them.
//
// Same local-mirror + debounced-cloud-sync shape as predictions.js.

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

const LS_PREFIX = "nremt_study_log_";
const MAX_LOG = 200;

export const STUDY_MODES = {
  quick10: "Quick 10",
  timed: "Timed Quiz",
  custom: "Custom Quiz",
  weakest: "Weakest-Area Quiz",
};

export function modeLabel(mode) {
  return STUDY_MODES[mode] || mode || "Study session";
}

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

const cache = new Map();

export async function loadStudyLog(user) {
  if (!user) return [];
  if (cache.has(user.uid)) return cache.get(user.uid);
  let log = null;
  if (!user.isGuest && firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "nremtStudyLog", user.uid));
      if (snap.exists()) log = snap.data().log || [];
    } catch (e) {
      console.error("loadStudyLog: falling back to local cache", e);
    }
  }
  if (!log) log = loadLocal(user.uid);
  cache.set(user.uid, log);
  return log;
}

let saveTimer = null;
let pending = null;

// entry: { mode, level, total, answered, correct, unanswered, timedOut,
//          elapsedSec, timeLimitSec, byDomain: { [domain]: {total, correct} } }
export async function recordStudySession(user, entry) {
  if (!user) return;
  const log = [...(cache.get(user.uid) || (await loadStudyLog(user)))];
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
      await setDoc(doc(db, "nremtStudyLog", u.uid), { log: l, updatedAt: Date.now() });
    } catch (e) {
      console.error("recordStudySession: cloud save failed, local copy is intact", e);
    }
  }, 800);
}
