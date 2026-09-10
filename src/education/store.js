import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

const LS_PREFIX = "nremt_progress_";

function lsKey(uid) {
  return LS_PREFIX + uid;
}

function loadLocal(uid) {
  try {
    const raw = localStorage.getItem(lsKey(uid));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocal(uid, progress) {
  try {
    localStorage.setItem(lsKey(uid), JSON.stringify(progress));
  } catch {
    /* storage full/unavailable — silently drop, nothing else to do here */
  }
}

// progress shape: { [questionId]: cardState }  (see srs.js's blankCardState)
export async function loadProgress(user) {
  if (!user) return {};
  if (user.isGuest || !firebaseConfigured) return loadLocal(user.uid);
  try {
    const db = await getFirebaseDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "nremtProgress", user.uid));
    return snap.exists() ? snap.data().cards || {} : {};
  } catch (e) {
    console.error("loadProgress: falling back to local cache", e);
    return loadLocal(user.uid);
  }
}

let saveTimer = null;
let pending = null;

export function saveProgress(user, progress) {
  if (!user) return;
  // Always keep a local mirror, even for signed-in users — an offline
  // save should never be silently lost.
  saveLocal(user.uid, progress);
  if (user.isGuest || !firebaseConfigured) return;

  pending = { user, progress };
  if (saveTimer) return;
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    const { user: u, progress: p } = pending;
    pending = null;
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "nremtProgress", u.uid), {
        cards: p,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error("saveProgress: cloud save failed, local copy is intact", e);
    }
  }, 800); // debounce so rapid rating clicks don't spam writes
}
