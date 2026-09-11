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
//     allow read, write: if request.auth != null;
//   }

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

const COLLECTION = "eduGlobalStats";
const DOC_ID = "summary";

// Fire-and-forget by design — a failed counter increment should never
// interrupt the real action (answering a question, saving a profile) that
// triggered it.
export function incrementGlobalCounter(field, by = 1) {
  if (!firebaseConfigured) return;
  (async () => {
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc, increment } = await import("firebase/firestore");
      await setDoc(doc(db, COLLECTION, DOC_ID), { [field]: increment(by), updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.error(`incrementGlobalCounter(${field}) failed`, e);
    }
  })();
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
