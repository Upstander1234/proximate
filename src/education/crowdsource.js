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
import { validateItemTypeShape, itemTypeOf } from "./itemTypes.js";
import { LEVELS } from "./questions.js";

export const crowdsourceEnabled = firebaseConfigured;

// Generic across every itemType — SubmitQuestionForm.jsx today only
// authors multiple_choice (see that file's own header), but this function
// itself makes no such assumption, so a future non-MCQ authoring UI (or a
// direct API caller) can submit any shape this schema supports without
// this function needing to change. `draft` is trimmed/normalized per its
// own itemType rather than assuming `choices`/`answerIndex` exist.
export async function submitQuestion(user, draft) {
  if (!firebaseConfigured) throw new Error("Crowdsourced submissions require sign-in to be configured.");
  if (!user || user.isGuest) throw new Error("Sign in to submit a question.");

  const itemType = itemTypeOf(draft);
  const doc = {
    ...draft,
    itemType,
    question: (draft.question || "").trim(),
    explanation: (draft.explanation || "").trim(),
    domain: draft.domain,
    // Any real level the form offers (core EMS or an Other Provider
    // Practice level) — validated here rather than trusted from the
    // client, same discipline as validateItemTypeShape below. Falls back
    // to EMT if the client somehow sent something unrecognized rather than
    // silently accepting an arbitrary string into the pool filters.
    level: LEVELS.includes(draft.level) ? draft.level : "EMT",
    status: "pending",
    submittedBy: user.uid,
    submittedByName: user.name,
    submittedAt: Date.now(),
  };
  if (Array.isArray(doc.choices)) doc.choices = doc.choices.map((c) => (typeof c === "string" ? c.trim() : c));

  // Reject a malformed submission at the door rather than letting it sit
  // in the pending queue for an admin to discover is unscoreable — see
  // this file's own header on the shared quality gate questionPool.js
  // relies on.
  const result = validateItemTypeShape(doc);
  if (!result.valid) {
    throw new Error(`This question isn't well-formed: ${result.errors.join("; ")}`);
  }

  const db = await getFirebaseDb();
  const { collection, addDoc } = await import("firebase/firestore");
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

// Passes through EVERY question field the doc actually has (itemType,
// choices/answerIndex, correctIndices, steps/correctOrder, categories/
// items, rows/options, graphic, scenarioId/scenarioStage,
// clinicalJudgment/clinicalJudgmentStep — whatever this question's own
// itemType needs), not a hand-picked MCQ-only allowlist. The old version
// of this function only ever forwarded domain/level/question/choices/
// answerIndex/explanation, which would have silently dropped every
// itemType-specific field (correctIndices, steps, items, rows...) the
// moment a non-MCQ question was ever approved — invisible until a real
// multiple_response submission reached a player with no correctIndices at
// all. Bookkeeping fields (status/submittedBy/submittedAt/reviewedBy/...)
// are stripped since a runtime consumer has no use for them.
const BOOKKEEPING_FIELDS = new Set(["status", "submittedBy", "submittedByName", "submittedAt", "reviewedBy", "reviewedByName", "reviewedAt", "reviewNotes"]);

export async function fetchApprovedCrowdsourced() {
  if (!firebaseConfigured) return [];
  try {
    const db = await getFirebaseDb();
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const q = query(collection(db, "crowdsourcedQuestions"), where("status", "==", "approved"));
    const snap = await getDocs(q);
    const out = [];
    for (const d of snap.docs) {
      const data = d.data();
      const question = { id: `cs-${d.id}`, source: "crowdsourced", approved: true };
      for (const [k, v] of Object.entries(data)) {
        if (!BOOKKEEPING_FIELDS.has(k)) question[k] = v;
      }
      // A question that was somehow approved despite being malformed (a
      // manual Firestore edit, a client bypassing reviewQuestion's own
      // gate) must never reach a real practice/exam session — excluded
      // here rather than crashing whatever tries to render/score it,
      // mirroring contentBlueprint.js's filterValidForBlueprint posture.
      const result = validateItemTypeShape(question);
      if (result.valid) {
        out.push(question);
      } else {
        console.warn(`[crowdsource] excluding approved question ${question.id} — malformed: ${result.errors.join("; ")}`);
      }
    }
    return out;
  } catch (e) {
    console.error("fetchApprovedCrowdsourced: failed, continuing with built-in bank only", e);
    return [];
  }
}

// `question` is the full pending-submission object (as AdminReviewTab
// already has in scope from fetchPendingQuestions), not just its id — an
// "approved" decision is validated against the ACTUAL shape being
// approved before the write happens, per the spec's own "an invalid TEI
// should never enter the approved question pool" requirement. A
// "rejected" decision needs no such check — a malformed submission is a
// perfectly good thing to reject.
export async function reviewQuestion(question, decision, admin, notes) {
  if (!firebaseConfigured) throw new Error("Review requires Firebase to be configured.");
  if (decision === "approved") {
    const result = validateItemTypeShape(question);
    if (!result.valid) {
      throw new Error(`Cannot approve — this question is not well-formed: ${result.errors.join("; ")}`);
    }
  }
  const db = await getFirebaseDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  return updateDoc(doc(db, "crowdsourcedQuestions", question.id), {
    status: decision, // "approved" | "rejected"
    reviewedBy: admin.uid,
    reviewedByName: admin.name,
    reviewedAt: Date.now(),
    reviewNotes: notes || "",
  });
}
