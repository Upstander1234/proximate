// Crowdsourced question submission + manual admin review workflow.
//
// A submitted question is NEVER usable by MCQ Practice or Adaptive Test
// Mode until an admin explicitly approves it — this is the manual quality
// gate the rest of the question-pool code (see questionPool.js) relies on:
// it only ever pulls questions with `status === "approved"`.
//
// This genuinely needs a shared backend to be "crowdsourced" at all (many
// users submitting into one shared review queue), so it requires Firebase
// to be configured — with Firebase absent, submission/review are disabled
// with a clear message rather than silently no-opping into a per-device
// fake queue that could never actually be reviewed by anyone.
//
// Required Firestore security rules (mirroring firebase.js's own
// documented shape): any signed-in user may CREATE a doc in
// `crowdsourcedQuestions` with status "pending" and their own uid as
// `submittedBy`; only an admin (checked server-side, e.g. via a custom
// claim or an allowlist collection — NOT the client-side adminConfig.js
// allowlist, which is a UI convenience only) may transition `status` to
// "approved"/"rejected":
//
//   match /crowdsourcedQuestions/{id} {
//     allow create: if request.auth != null
//       && request.resource.data.status == "pending"
//       && request.resource.data.submittedBy == request.auth.uid;
//     allow read: if request.auth != null;
//     allow update: if request.auth != null && request.auth.token.admin == true;
//   }

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

export const crowdsourceEnabled = firebaseConfigured;

export async function submitQuestion(user, draft) {
  if (!firebaseConfigured) throw new Error("Crowdsourced submissions require sign-in to be configured.");
  if (!user || user.isGuest) throw new Error("Sign in to submit a question.");
  const db = await getFirebaseDb();
  const { collection, addDoc } = await import("firebase/firestore");
  const doc = {
    question: draft.question.trim(),
    choices: draft.choices.map((c) => c.trim()),
    answerIndex: draft.answerIndex,
    explanation: draft.explanation.trim(),
    domain: draft.domain,
    level: "EMT", // EMT-B only for this release, regardless of what the form is later extended to accept
    status: "pending",
    submittedBy: user.uid,
    submittedByName: user.name,
    submittedAt: Date.now(),
  };
  return addDoc(collection(db, "crowdsourcedQuestions"), doc);
}

export async function fetchPendingQuestions() {
  if (!firebaseConfigured) return [];
  const db = await getFirebaseDb();
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const q = query(collection(db, "crowdsourcedQuestions"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchApprovedCrowdsourced() {
  if (!firebaseConfigured) return [];
  try {
    const db = await getFirebaseDb();
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const q = query(collection(db, "crowdsourcedQuestions"), where("status", "==", "approved"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: `cs-${d.id}`,
        domain: data.domain,
        level: data.level,
        question: data.question,
        choices: data.choices,
        answerIndex: data.answerIndex,
        explanation: data.explanation,
        source: "crowdsourced",
        approved: true,
      };
    });
  } catch (e) {
    console.error("fetchApprovedCrowdsourced: failed, continuing with built-in bank only", e);
    return [];
  }
}

export async function reviewQuestion(id, decision, admin, notes) {
  if (!firebaseConfigured) throw new Error("Review requires Firebase to be configured.");
  const db = await getFirebaseDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  return updateDoc(doc(db, "crowdsourcedQuestions", id), {
    status: decision, // "approved" | "rejected"
    reviewedBy: admin.uid,
    reviewedByName: admin.name,
    reviewedAt: Date.now(),
    reviewNotes: notes || "",
  });
}
