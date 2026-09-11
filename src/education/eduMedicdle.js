// Persistence for the Education Medicdle daily diagnostic-reasoning game —
// tracks per-day completion (so a player can't replay the same day's case
// for a better score) and a log of past attempts (info revealed before
// diagnosis, guess count, time, correct/not) for personal stats.
//
// Same local-mirror + debounced-cloud-sync shape as predictions.js.

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";
import { incrementGlobalCounter } from "./globalStats.js";
import { dateKey } from "./medicdleData.js";

const LS_PREFIX = "nremt_medicdle_";
const MAX_LOG = 200;

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

export async function loadMedicdleLog(user) {
  if (!user) return [];
  if (cache.has(user.uid)) return cache.get(user.uid);
  let log = null;
  if (!user.isGuest && firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "nremtMedicdle", user.uid));
      if (snap.exists()) log = snap.data().log || [];
    } catch (e) {
      console.error("loadMedicdleLog: falling back to local cache", e);
    }
  }
  if (!log) log = loadLocal(user.uid);
  cache.set(user.uid, log);
  return log;
}

export async function todaysAttempt(user) {
  const log = await loadMedicdleLog(user);
  const today = dateKey();
  return log.find((e) => e.dateKey === today) || null;
}

let saveTimer = null;
let pending = null;

// entry: { caseId, guesses: [{text,correct}], cluesRevealed, solved, timeMs }
export async function recordMedicdleAttempt(user, entry) {
  if (!user) return;
  const log = [...(cache.get(user.uid) || (await loadMedicdleLog(user)))];
  const full = { ...entry, dateKey: dateKey(), completedAt: Date.now() };
  log.push(full);
  while (log.length > MAX_LOG) log.shift();
  cache.set(user.uid, log);
  saveLocal(user.uid, log);
  incrementGlobalCounter("totalMedicdlePlays");
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
      await setDoc(doc(db, "nremtMedicdle", u.uid), { log: l, updatedAt: Date.now() });
    } catch (e) {
      console.error("recordMedicdleAttempt: cloud save failed, local copy is intact", e);
    }
  }, 800);
}
