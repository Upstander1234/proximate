// Minimal admin allowlist for the crowdsourced-question review queue.
//
// Set VITE_EDUCATION_ADMIN_UIDS in .env.local to a comma-separated list of
// Firebase Auth uids that should see the Admin Review tab, e.g.:
//   VITE_EDUCATION_ADMIN_UIDS=abc123,def456
//
// This is a client-side visibility gate only (it hides/shows the tab) —
// it is NOT a security boundary. Real enforcement of who may write an
// "approved"/"rejected" status must happen in Firestore security rules
// (see crowdsource.js's own header comment for the rule shape), the same
// way every other piece of this module already treats client code as
// untrusted for anything that matters.
const ADMIN_UIDS = (import.meta.env.VITE_EDUCATION_ADMIN_UIDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function isAdminUser(user) {
  if (!user || user.isGuest) return false;
  return ADMIN_UIDS.includes(user.uid);
}
