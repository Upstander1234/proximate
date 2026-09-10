// Player-submitted question reports (typo, wrong answer, unclear wording,
// etc.) plus the admin review/resolution workflow for them.
//
// Mirrors crowdsource.js's own shape: requires Firebase to be configured
// (a report queue only makes sense with a shared backend an admin can
// actually see), disabled with a clear message otherwise.
//
// Required Firestore security rules (same convention as crowdsource.js):
//
//   match /questionReports/{id} {
//     allow create: if request.auth != null
//       && request.resource.data.status == "pending"
//       && request.resource.data.reportedBy == request.auth.uid;
//     allow read: if request.auth != null;
//     allow update: if request.auth != null && request.auth.token.admin == true;
//   }

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

export const reportingEnabled = firebaseConfigured;

export const REPORT_REASONS = [
  "Wrong answer marked correct",
  "Typo or unclear wording",
  "Outdated or inaccurate information",
  "Duplicate question",
  "Other",
];

export async function submitReport(user, question, reason, details) {
  if (!firebaseConfigured) throw new Error("Reporting requires sign-in to be configured.");
  if (!user || user.isGuest) throw new Error("Sign in to report a question.");
  const db = await getFirebaseDb();
  const { collection, addDoc } = await import("firebase/firestore");
  const doc = {
    questionId: question.id,
    questionText: question.question,
    questionChoices: question.choices,
    questionAnswerIndex: question.answerIndex,
    questionDomain: question.domain || "",
    reason,
    details: (details || "").trim(),
    status: "pending",
    reportedBy: user.uid,
    reportedByName: user.name,
    reportedAt: Date.now(),
  };
  return addDoc(collection(db, "questionReports"), doc);
}

export async function fetchPendingReports() {
  if (!firebaseConfigured) return [];
  const db = await getFirebaseDb();
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const q = query(collection(db, "questionReports"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// decision: "approved" (report was valid, action taken) | "denied" (report was not actionable)
export async function resolveReport(id, decision, admin, notes) {
  if (!firebaseConfigured) throw new Error("Review requires Firebase to be configured.");
  const db = await getFirebaseDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  return updateDoc(doc(db, "questionReports", id), {
    status: decision,
    reviewedBy: admin.uid,
    reviewedByName: admin.name,
    reviewedAt: Date.now(),
    reviewNotes: notes || "",
  });
}
