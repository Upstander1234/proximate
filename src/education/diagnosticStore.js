import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

const PREFIX = "nremt_diagnostic_results_";
const MAX_RESULTS = 20;
const cache = new Map();
const key = (uid) => PREFIX + uid;
function localLoad(uid) { try { return JSON.parse(localStorage.getItem(key(uid)) || "[]"); } catch { return []; } }
function localSave(uid, results) { try { localStorage.setItem(key(uid), JSON.stringify(results)); } catch { /* local storage unavailable */ } }

export async function loadDiagnosticResults(user) {
  if (!user) return [];
  if (cache.has(user.uid)) return cache.get(user.uid);
  let results = null;
  if (!user.isGuest && firebaseConfigured) {
    try { const db = await getFirebaseDb(); const { doc, getDoc } = await import("firebase/firestore"); const snap = await getDoc(doc(db, "nremtDiagnosticResults", user.uid)); if (snap.exists()) results = snap.data().results || []; } catch { /* local storage unavailable */ }
  }
  results ||= localLoad(user.uid); cache.set(user.uid, results); return results;
}

export async function recordDiagnosticResult(user, result) {
  if (!user) return;
  const results = [...await loadDiagnosticResults(user), { ...result, completedAt: Date.now() }].slice(-MAX_RESULTS);
  cache.set(user.uid, results); localSave(user.uid, results);
  if (user.isGuest || !firebaseConfigured) return;
  try { const db = await getFirebaseDb(); const { doc, setDoc } = await import("firebase/firestore"); await setDoc(doc(db, "nremtDiagnosticResults", user.uid), { results, updatedAt: Date.now() }); } catch { /* local storage unavailable */ }
}