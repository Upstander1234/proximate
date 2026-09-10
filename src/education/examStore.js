import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

// Persists an in-progress adaptive-exam attempt so a player can leave
// (intentionally, via "Save & exit," or just by closing the tab) and pick
// up exactly where they left off — the same local-mirror-plus-debounced-
// cloud-sync shape store.js already uses for SRS progress, kept as its own
// key/collection since an exam attempt is a different kind of state (one
// in-progress attempt, not per-question cards) that should never merge
// into the same document.

const LS_PREFIX = "nremt_examstate_";

function lsKey(uid) {
  return LS_PREFIX + uid;
}

function loadLocal(uid) {
  try {
    const raw = localStorage.getItem(lsKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(uid, state) {
  try {
    if (state) localStorage.setItem(lsKey(uid), JSON.stringify(state));
    else localStorage.removeItem(lsKey(uid));
  } catch {
    /* storage full/unavailable — silently drop, nothing else to do here */
  }
}

// Only ever one saved attempt per user, at a time — starting a new exam or
// finishing one clears it.
export async function loadExamState(user) {
  if (!user) return null;
  if (user.isGuest || !firebaseConfigured) return loadLocal(user.uid);
  try {
    const db = await getFirebaseDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "nremtExamState", user.uid));
    return snap.exists() ? snap.data().state || null : null;
  } catch (e) {
    console.error("loadExamState: falling back to local cache", e);
    return loadLocal(user.uid);
  }
}

let saveTimer = null;
let pending = null;

// `state` is a plain, JSON-serializable snapshot of the in-progress exam,
// or `null` to clear it (a finished/abandoned/restarted attempt).
export function saveExamState(user, state) {
  if (!user) return;
  saveLocal(user.uid, state);
  if (user.isGuest || !firebaseConfigured) return;

  pending = { user, state };
  if (saveTimer) return;
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    const { user: u, state: s } = pending;
    pending = null;
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc, deleteDoc } = await import("firebase/firestore");
      if (s) await setDoc(doc(db, "nremtExamState", u.uid), { state: s, updatedAt: Date.now() });
      else await deleteDoc(doc(db, "nremtExamState", u.uid));
    } catch (e) {
      console.error("saveExamState: cloud save failed, local copy is intact", e);
    }
  }, 600); // debounce so rapid answer clicks don't spam writes
}
