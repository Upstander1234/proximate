// Aggregate, non-identifying engagement counters for Education Mode as a
// whole — total users, total questions answered, total SRS reviews, total
// exams completed, total Medicdle plays. Never exposes anything about an
// individual user, only running sums.
//
// Requires Firebase to be genuinely "global" (shared across users). With
// Firebase absent, counters simply aren't tracked and loadGlobalStats()
// returns null — callers should show "not available" rather than a fake 0.
//
// Required Firestore security rules:
//
//   match /eduGlobalStats/{id} {
//     allow read: if true;
//     allow create, update: if request.auth != null; // + per-field increment bounds (see firestore.rules)
//   }

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

const COLLECTION = "eduGlobalStats";
const DOC_ID = "summary";

// Fire-and-forget by design — a failed counter increment should never
// interrupt the real action (answering a question, saving a profile) that
// triggered it.
// Counters are batched in memory and flushed as ONE write, so a burst of
// answers costs a write per FLUSH_MS instead of a write per answer, and the
// single summary document isn't hammered (Firestore sustains ~1 write/sec
// per document). At most MAX_PER_FLUSH is sent per field per write (the
// Firestore rules enforce the same cap); any remainder rolls to the next flush.
const FLUSH_MS = 30000;
const MAX_PER_FLUSH = 100;
const pending = {};
let flushTimer = null;
let listenersAttached = false;

async function flushGlobalCounters() {
  flushTimer = null;
  const fields = Object.keys(pending).filter((f) => pending[f] > 0);
  if (!fields.length) return;
  const sent = {};
  for (const f of fields) {
    sent[f] = Math.min(pending[f], MAX_PER_FLUSH);
    pending[f] -= sent[f];
  }
  try {
    const db = await getFirebaseDb();
    const { doc, setDoc, increment } = await import("firebase/firestore");
    const update = { updatedAt: Date.now() };
    for (const f of fields) update[f] = increment(sent[f]);
    await setDoc(doc(db, COLLECTION, DOC_ID), update, { merge: true });
  } catch (e) {
    console.error("flushGlobalCounters failed", e);
  }
  if (Object.values(pending).some((n) => n > 0)) scheduleFlush();
}

function scheduleFlush() {
  if (!flushTimer) flushTimer = setTimeout(flushGlobalCounters, FLUSH_MS);
}

// Fire-and-forget by design — a failed counter increment should never
// interrupt the real action (answering a question, saving a profile) that
// triggered it. Counts still pending when the tab is closed are flushed on
// a best-effort basis.
export function incrementGlobalCounter(field, by = 1) {
  if (!firebaseConfigured) return;
  pending[field] = (pending[field] || 0) + by;
  if (!listenersAttached && typeof document !== "undefined") {
    listenersAttached = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushGlobalCounters();
    });
    window.addEventListener("pagehide", flushGlobalCounters);
  }
  scheduleFlush();
}

const BLANK = {
  totalUsers: 0,
  totalQuestionsAnswered: 0,
  totalSrsReviews: 0,
  totalExamsCompleted: 0,
  totalMedicdlePlays: 0,
};

export async function loadGlobalStats() {
  if (!firebaseConfigured) return null;
  try {
    const db = await getFirebaseDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
    return snap.exists() ? { ...BLANK, ...snap.data() } : { ...BLANK };
  } catch (e) {
    console.error("loadGlobalStats failed", e);
    return null;
  }
}
