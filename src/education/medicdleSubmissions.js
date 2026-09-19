// "Submit a Medicdle" — contributor-authored cases plus the review workflow
// that stands between a submission and the pool every player can see.
//
// Two hard rules from the Education Mode spec, both enforced here rather
// than left to the UI:
//
// 1. A submitted Medicdle NEVER becomes public on submission. It enters as
//    `pending` and only the explicit approval path below can move it to
//    `approved`. Contributors have no publishing privilege: `submitMedicdle`
//    writes status "pending" and `reviseMedicdleSubmission` writes it back
//    to "pending" — there is no code path a contributor can reach that
//    produces an approvable status.
//
// 2. The diagnosis must correspond to a condition that ALREADY EXISTS in
//    src/physio/conditions.js. That list is not re-declared here: it comes
//    from data/customScenario.js's CONDITION_LIST/CONDITION_META, which is
//    `Object.keys(CONDITIONS)` mapped through the project's own condition
//    metadata (the same vocabulary the Sandbox's custom-scenario builder
//    already offers). An unrecognized condition is REJECTED at the door,
//    never silently created, and never routed into a second condition
//    database. Anything that cannot be expressed as an existing condition
//    is content that needs separate condition-content review first — the
//    error message says exactly that.
//
// Shape and conventions follow crowdsource.js (the existing community
// submission/moderation module) deliberately, including its documented
// Firestore rules posture, so this is an extension of one moderation
// architecture rather than a second, unrelated one.
//
// Required Firestore security rules:
//
//   match /medicdleSubmissions/{id} {
//     allow create: if request.auth != null
//       && request.resource.data.status == "pending"
//       && request.resource.data.submittedBy == request.auth.uid;
//     allow read: if request.auth != null;
//     allow update: if request.auth != null && request.auth.token.admin == true;
//   }

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";
import { CONDITION_LIST, CONDITION_META } from "../data/customScenario.js";
import { STAGES } from "./medicdleData.js";

export const medicdleSubmissionsEnabled = firebaseConfigured;

export const MEDICDLE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REVISION_REQUESTED: "revision_requested",
};

export const MEDICDLE_STATUS_LABELS = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  revision_requested: "Revision requested",
};

// The four review gates the spec names, in order. Each is recorded
// separately (with its own reviewer and timestamp) so an approval can show
// WHICH gate was actually passed, rather than collapsing into one click.
export const MEDICDLE_REVIEW_STEPS = [
  { key: "medicalAccuracy", label: "Medical accuracy review" },
  { key: "clueProgression", label: "Clue progression review" },
  { key: "answerValidation", label: "Answer validation" },
  { key: "references", label: "Reference review" },
];

// Number of clue stages a complete Medicdle must supply. Taken from
// medicdleData.js's own STAGES so the two can never drift apart.
export const MEDICDLE_STAGE_COUNT = STAGES.length;

export function isKnownCondition(key) {
  return CONDITION_LIST.includes(key);
}

export function conditionDisplayName(key) {
  return CONDITION_META[key]?.name || key;
}

// Every condition a Medicdle may be submitted against, for the form's own
// picker. Alphabetical, and drawn from the canonical registry — the same
// list the diagnosis is validated against, so the picker can't offer
// something submission would then reject.
export const MEDICDLE_CONDITION_OPTIONS = [...CONDITION_LIST]
  .map((key) => ({ key, name: conditionDisplayName(key) }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ---------------------------------------------------------------------------
// Draft shape + validation (pure — exercised by
// src/scripts/verifyMedicdleSubmissions.mjs without a browser)
// ---------------------------------------------------------------------------

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ");

// stageClues is fixed at MEDICDLE_STAGE_COUNT entries, one per STAGES entry,
// so a submitted case can be rendered by the same Medicdle player every
// built-in case uses without a per-case shape branch.
export function blankMedicdleDraft() {
  return {
    conditionKey: "",
    correctDiagnosis: "",
    stageClues: Array.from({ length: MEDICDLE_STAGE_COUNT }, () => ""),
    explanation: "",
    references: [{ label: "", url: "" }],
    contributorName: "",
    contributorNotes: "",
  };
}

function validUrl(url) {
  if (!url) return true; // a reference may be a book/source with no link
  return /^https?:\/\/\S+$/i.test(url.trim());
}

// Returns { valid, errors: string[] }. Called both live in the form (so the
// author sees what is missing before submitting) and again inside
// submitMedicdle (so nothing unvalidated can reach Firestore, the same
// defence-in-depth crowdsource.js's submitQuestion uses).
export function validateMedicdleDraft(draft) {
  const errors = [];
  if (!draft || typeof draft !== "object") return { valid: false, errors: ["No submission draft."] };

  if (!draft.conditionKey) {
    errors.push("Pick a condition.");
  } else if (!isKnownCondition(draft.conditionKey)) {
    errors.push(
      `"${draft.conditionKey}" is not a condition in src/physio/conditions.js. Medicdle cases must reuse an existing condition — a genuinely new condition needs separate condition-content review first, so it cannot be submitted as a Medicdle.`
    );
  }

  if (!draft.correctDiagnosis || !String(draft.correctDiagnosis).trim()) {
    errors.push("Correct diagnosis is required.");
  } else if (isKnownCondition(draft.conditionKey) && norm(draft.correctDiagnosis) !== norm(conditionDisplayName(draft.conditionKey))) {
    errors.push(
      `Correct diagnosis must match the selected condition ("${conditionDisplayName(draft.conditionKey)}") — a case whose stated answer differs from its condition would be scored against the wrong key.`
    );
  }

  const clues = Array.isArray(draft.stageClues) ? draft.stageClues : [];
  if (clues.length !== MEDICDLE_STAGE_COUNT) {
    errors.push(`Provide exactly ${MEDICDLE_STAGE_COUNT} stage clues.`);
  } else {
    STAGES.forEach((stage, i) => {
      if (!String(clues[i] || "").trim()) errors.push(`${stage} clue is required.`);
    });
  }

  if (!draft.explanation || !String(draft.explanation).trim()) {
    errors.push("An explanation (shown once the case is solved) is required.");
  }

  const refs = (Array.isArray(draft.references) ? draft.references : []).filter(
    (r) => r && (String(r.label || "").trim() || String(r.url || "").trim())
  );
  if (refs.length === 0) {
    errors.push("At least one supporting reference is required.");
  }
  refs.forEach((r, i) => {
    if (!String(r.label || "").trim()) errors.push(`Reference ${i + 1} needs a title or source.`);
    if (!validUrl(r.url)) errors.push(`Reference ${i + 1} URL must start with http:// or https://.`);
  });

  if (!draft.contributorName || !String(draft.contributorName).trim()) {
    errors.push("Contributor name is required (it is shown internally to reviewers).");
  }

  return { valid: errors.length === 0, errors };
}

// Trims and normalizes a validated draft into exactly what gets stored —
// no `status`, no reviewer fields, no timestamps: those are set by the
// workflow functions below, never supplied by the author.
export function finalizeMedicdleDraft(draft) {
  return {
    conditionKey: draft.conditionKey,
    conditionName: conditionDisplayName(draft.conditionKey),
    correctDiagnosis: String(draft.correctDiagnosis || "").trim(),
    stageClues: draft.stageClues.map((c) => String(c || "").trim()),
    explanation: String(draft.explanation || "").trim(),
    references: (draft.references || [])
      .map((r) => ({ label: String(r.label || "").trim(), url: String(r.url || "").trim() }))
      .filter((r) => r.label || r.url),
    contributorName: String(draft.contributorName || "").trim(),
    contributorNotes: String(draft.contributorNotes || "").trim(),
  };
}

// ---------------------------------------------------------------------------
// Workflow: submit -> pending -> review -> approved | rejected | revision
// ---------------------------------------------------------------------------

function requireEnabled() {
  if (!firebaseConfigured) throw new Error("Medicdle submissions require sign-in to be configured.");
}

// Contributors can reach exactly three statuses, and none of them is
// "approved": a new submission is "pending", and a revision of an existing
// one goes back to "pending". Publishing is an admin action (review below).
export async function submitMedicdle(user, draft) {
  requireEnabled();
  if (!user || user.isGuest) throw new Error("Sign in to submit a Medicdle.");
  const check = validateMedicdleDraft(draft);
  if (!check.valid) throw new Error(check.errors.join(" "));

  const finalized = finalizeMedicdleDraft(draft);
  const db = await getFirebaseDb();
  const { collection, addDoc } = await import("firebase/firestore");
  const doc = {
    ...finalized,
    status: MEDICDLE_STATUS.PENDING,
    submittedBy: user.uid,
    submittedByName: user.name,
    submittedAt: Date.now(),
    // Revision history starts with the submission itself, so "revision 1"
    // is always the original text rather than an implicit gap.
    revisionHistory: [
      {
        revision: 1,
        at: Date.now(),
        by: user.uid,
        byName: user.name,
        kind: "submitted",
        note: "Initial submission",
      },
    ],
  };
  return addDoc(collection(db, "medicdleSubmissions"), doc);
}

// An author may revise their OWN submission while it is pending-revision or
// rejected — never after approval, and never someone else's. The revision
// is appended to the history (nothing is overwritten), the status returns
// to "pending", and any previous review decision is cleared so a stale
// approval can't carry over onto text a reviewer never saw.
export async function reviseMedicdleSubmission(user, submission, draft) {
  requireEnabled();
  if (!user || user.isGuest) throw new Error("Sign in to revise a Medicdle.");
  if (submission.submittedBy !== user.uid) throw new Error("You can only revise your own submission.");
  if (submission.status === MEDICDLE_STATUS.APPROVED) {
    throw new Error("An approved Medicdle can no longer be revised here. Submit a correction as a new case instead.");
  }
  const check = validateMedicdleDraft(draft);
  if (!check.valid) throw new Error(check.errors.join(" "));

  const finalized = finalizeMedicdleDraft(draft);
  const db = await getFirebaseDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  return updateDoc(doc(db, "medicdleSubmissions", submission.id), {
    ...finalized,
    status: MEDICDLE_STATUS.PENDING,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    reviewNotes: "",
    reviewChecks: null,
    revisionHistory: [
      ...(submission.revisionHistory || []),
      {
        revision: (submission.revisionHistory?.length || 1) + 1,
        at: Date.now(),
        by: user.uid,
        byName: user.name,
        kind: "revised",
        note: "Resubmitted after review feedback",
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Review decision rules (pure)
// ---------------------------------------------------------------------------

// The rules an admin's decision has to satisfy, kept pure and separate from
// the Firestore write so they are verifiable directly:
//   - approving requires ALL FOUR review gates passed, because an approval
//     is what publishes a case to every player
//   - rejecting and requesting a revision both require a written reason,
//     which is stored and shown back to the author
//   - "revision_requested" exists as its own outcome, so feedback that is
//     not a rejection doesn't have to be recorded as one
export function validateReviewDecision(decision, checks, notes) {
  const errors = [];
  const known = [MEDICDLE_STATUS.APPROVED, MEDICDLE_STATUS.REJECTED, MEDICDLE_STATUS.REVISION_REQUESTED];
  if (!known.includes(decision)) {
    errors.push(`Unknown decision "${decision}".`);
  }
  if (decision === MEDICDLE_STATUS.APPROVED) {
    const failed = MEDICDLE_REVIEW_STEPS.filter((s) => !checks?.[s.key]).map((s) => s.label);
    if (failed.length) errors.push(`Every review step must pass before approval. Outstanding: ${failed.join(", ")}.`);
  }
  if (
    (decision === MEDICDLE_STATUS.REJECTED || decision === MEDICDLE_STATUS.REVISION_REQUESTED) &&
    !String(notes || "").trim()
  ) {
    errors.push("A written reason is required when rejecting a submission or requesting a revision.");
  }
  return { valid: errors.length === 0, errors };
}

// A submission, once approved, in exactly the shape MedicdleTab's own case
// player consumes (see medicdleData.js's MEDICDLE_CASES) — id/conditionKey/
// stageClues/explanation. Returns null for a submission that is missing any
// of those, so a malformed approved document can never reach a player: the
// same "exclude rather than crash" posture crowdsource.js's
// fetchApprovedCrowdsourced already takes.
export function submissionToCase(submission) {
  if (!submission) return null;
  const clues = submission.stageClues;
  if (!submission.conditionKey || !isKnownCondition(submission.conditionKey)) return null;
  if (!Array.isArray(clues) || clues.length !== MEDICDLE_STAGE_COUNT || clues.some((c) => !String(c || "").trim())) return null;
  if (!String(submission.explanation || "").trim()) return null;
  return {
    id: `ms-${submission.id}`,
    conditionKey: submission.conditionKey,
    stageClues: clues.map((c) => String(c).trim()),
    explanation: String(submission.explanation).trim(),
    source: "community",
    contributor: submission.contributorName || submission.submittedByName || "anonymous",
  };
}

// ---------------------------------------------------------------------------
// Firestore reads + the admin review write
// ---------------------------------------------------------------------------

function withId(d) {
  return { id: d.id, ...d.data() };
}

export async function fetchMedicdleSubmissionsByStatus(status) {
  if (!firebaseConfigured) return [];
  try {
    const db = await getFirebaseDb();
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const snap = await getDocs(query(collection(db, "medicdleSubmissions"), where("status", "==", status)));
    return snap.docs.map(withId).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
  } catch (e) {
    console.error(`fetchMedicdleSubmissionsByStatus(${status}) failed`, e);
    return [];
  }
}

export function fetchPendingMedicdleSubmissions() {
  return fetchMedicdleSubmissionsByStatus(MEDICDLE_STATUS.PENDING);
}

export async function fetchMyMedicdleSubmissions(user) {
  if (!firebaseConfigured || !user || user.isGuest) return [];
  try {
    const db = await getFirebaseDb();
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const snap = await getDocs(query(collection(db, "medicdleSubmissions"), where("submittedBy", "==", user.uid)));
    return snap.docs.map(withId).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
  } catch (e) {
    console.error("fetchMyMedicdleSubmissions failed", e);
    return [];
  }
}

// The approved pool. This is the ONLY way an approved submission becomes
// playable, and it re-validates each document before handing it over.
export async function fetchApprovedMedicdleCases() {
  if (!firebaseConfigured) return [];
  const approved = await fetchMedicdleSubmissionsByStatus(MEDICDLE_STATUS.APPROVED);
  const out = [];
  for (const s of approved) {
    const c = submissionToCase(s);
    if (c) out.push(c);
    else console.warn(`[medicdleSubmissions] excluding approved submission ${s.id} — not a usable case shape`);
  }
  return out;
}

// The one and only publishing path. `checks` is the per-gate record from
// MEDICDLE_REVIEW_STEPS; `notes` is the reason shown to the author for a
// rejection or revision request. Nothing here is reachable by a contributor:
// the write is gated on the admin claim in the Firestore rules above, and
// adminConfig.js's allowlist is only what surfaces the UI.
export async function reviewMedicdleSubmission(submission, decision, admin, { notes = "", checks = {} } = {}) {
  requireEnabled();
  const check = validateReviewDecision(decision, checks, notes);
  if (!check.valid) throw new Error(check.errors.join(" "));

  const db = await getFirebaseDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  return updateDoc(doc(db, "medicdleSubmissions", submission.id), {
    status: decision,
    reviewedBy: admin.uid,
    reviewedByName: admin.name,
    reviewedAt: Date.now(),
    reviewNotes: notes || "",
    reviewChecks: decision === MEDICDLE_STATUS.APPROVED ? checks : null,
    revisionHistory: [
      ...(submission.revisionHistory || []),
      {
        revision: (submission.revisionHistory?.length || 0) + 1,
        at: Date.now(),
        by: admin.uid,
        byName: admin.name,
        kind: decision,
        note: notes || "",
        checks: decision === MEDICDLE_STATUS.APPROVED ? checks : null,
      },
    ],
  });
}
