// Player-submitted reports on individual auscultation recordings (sounds
// unrealistic, too noisy, doesn't match the labeled finding, etc.) plus the
// admin review/resolution workflow for them.
//
// Mirrors reports.js's own shape exactly (same requires-Firebase gate, same
// pending/approved/denied lifecycle) — a second, parallel collection rather
// than overloading questionReports with a differently-shaped document,
// since a clip has no question text/choices/answerIndex to record.
//
// Required Firestore security rules (same convention as reports.js):
//
//   match /soundClipReports/{id} {
//     allow create: if request.auth != null
//       && request.resource.data.status == "pending"
//       && request.resource.data.reportedBy == request.auth.uid;
//     allow read: if request.auth != null;
//     allow update: if request.auth != null && request.auth.token.admin == true;
//   }

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

export const reportingEnabled = firebaseConfigured;

export const CLIP_REPORT_REASONS = [
  "Doesn't sound realistic",
  "Poor audio quality / too much noise",
  "Sounds like a different finding than labeled",
  "Too quiet to make out",
  "Other",
];

// clip: { kind: "heart"|"lung", category, id, loc, src, url }
export async function submitClipReport(user, clip, reason, details) {
  if (!firebaseConfigured) throw new Error("Reporting requires sign-in to be configured.");
  if (!user || user.isGuest) throw new Error("Sign in to report a sound clip.");
  const db = await getFirebaseDb();
  const { collection, addDoc } = await import("firebase/firestore");
  const doc = {
    clipId: clip.id,
    clipKind: clip.kind,
    clipCategory: clip.category,
    clipLoc: clip.loc || "",
    clipSrc: clip.src || "",
    clipUrl: clip.url,
    reason,
    details: (details || "").trim(),
    status: "pending",
    reportedBy: user.uid,
    reportedByName: user.name,
    reportedAt: Date.now(),
  };
  return addDoc(collection(db, "soundClipReports"), doc);
}

export async function fetchPendingClipReports() {
  if (!firebaseConfigured) return [];
  const db = await getFirebaseDb();
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const q = query(collection(db, "soundClipReports"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// decision: "approved" (report was valid, action taken) | "denied" (report was not actionable)
export async function resolveClipReport(id, decision, admin, notes) {
  if (!firebaseConfigured) throw new Error("Review requires Firebase to be configured.");
  const db = await getFirebaseDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  return updateDoc(doc(db, "soundClipReports", id), {
    status: decision,
    reviewedBy: admin.uid,
    reviewedByName: admin.name,
    reviewedAt: Date.now(),
    reviewNotes: notes || "",
  });
}
