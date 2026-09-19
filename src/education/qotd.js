// Question of the Day: one designated MCQ per calendar day, the same for
// every player, answerable once. Deliberately separate from ordinary quiz
// generation (Quick 10 / Timed / Custom / Weakest-Area, quizSessions.js) —
// it draws from a fixed, deterministic daily index rather than any
// filtered/randomized session pool, and its own attempt log tracks
// participation and a daily streak independently of SRS progress.
//
// Same local-mirror + debounced-cloud-sync shape as eduMedicdle.js.

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";
import { incrementGlobalCounter } from "./globalStats.js";

const LS_PREFIX = "nremt_qotd_";
const MAX_LOG = 400;

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

// Deterministic day-of-year-ish index so every player sees the SAME
// question on the same calendar day — the same convention Medicdle's own
// `caseForDate` already uses, applied here to the ordinary approved
// question pool instead of a bespoke case bank.
export function questionForDate(pool, date = new Date()) {
  const eligible = pool.filter((q) => q.approved !== false);
  if (eligible.length === 0) return null;
  const dayNumber = Math.floor(date.getTime() / 86400000);
  return eligible[dayNumber % eligible.length];
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

export async function loadQotdLog(user) {
  if (!user) return [];
  if (cache.has(user.uid)) return cache.get(user.uid);
  let log = null;
  if (!user.isGuest && firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "nremtQotd", user.uid));
      if (snap.exists()) log = snap.data().log || [];
    } catch (e) {
      console.error("loadQotdLog: falling back to local cache", e);
    }
  }
  if (!log) log = loadLocal(user.uid);
  cache.set(user.uid, log);
  return log;
}

export async function todaysQotdAttempt(user) {
  const log = await loadQotdLog(user);
  const today = dateKey();
  return log.find((e) => e.dateKey === today) || null;
}

// A streak counts consecutive CALENDAR DAYS with a recorded attempt
// (correct or not — participation is what keeps a streak alive, matching
// most real daily-puzzle streak conventions), broken by any gap of more
// than one day between attempts.
export function computeStreak(log) {
  if (!log || log.length === 0) return { current: 0, best: 0 };
  const days = [...new Set(log.map((e) => e.dateKey))].sort();
  let current = 1;
  let best = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00Z").getTime();
    const cur = new Date(days[i] + "T00:00:00Z").getTime();
    const gapDays = Math.round((cur - prev) / 86400000);
    if (gapDays === 1) current += 1;
    else current = 1;
    best = Math.max(best, current);
  }
  // If the most recent attempt isn't today or yesterday, the streak is over.
  const today = dateKey();
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  const lastDay = days[days.length - 1];
  if (lastDay !== today && lastDay !== yesterday) current = 0;
  return { current, best };
}

let saveTimer = null;
let pending = null;

// entry: { questionId, correct }
export async function recordQotdAttempt(user, entry) {
  if (!user) return;
  const log = [...(cache.get(user.uid) || (await loadQotdLog(user)))];
  const full = { ...entry, dateKey: dateKey(), completedAt: Date.now() };
  log.push(full);
  while (log.length > MAX_LOG) log.shift();
  cache.set(user.uid, log);
  saveLocal(user.uid, log);
  incrementGlobalCounter("totalQotdPlays");
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
      await setDoc(doc(db, "nremtQotd", u.uid), { log: l, updatedAt: Date.now() });
    } catch (e) {
      console.error("recordQotdAttempt: cloud save failed, local copy is intact", e);
    }
  }, 800);
}
