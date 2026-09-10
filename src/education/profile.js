// Per-user profile data — right now just the provider level a student
// selects at signup. Same local-mirror + debounced-cloud-sync pattern as
// store.js/examStore.js, so it works offline and in guest mode too.

import { firebaseConfigured, getFirebaseDb } from "./firebase.js";

const LS_PREFIX = "nremt_profile_";

// Every level a signup can pick. See itemStats.js's LEVEL_RUNG for how each
// one is ranked for community-difficulty weighting — that mapping (not this
// array's order) is what actually determines rank, so Physician/Flight
// Medic/APP/RN/Other Healthcare Professional don't need to sit in ladder
// order here.
export const PROVIDER_LEVELS = [
  "Layperson",
  "EMR",
  "EMT",
  "AEMT",
  "Paramedic",
  "Registered Nurse",
  "Physician",
  "Flight Medic",
  "APP",
  "Other Healthcare Professional",
];

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

function saveLocal(uid, profile) {
  try {
    localStorage.setItem(lsKey(uid), JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

const cache = new Map();

// profile shape: { providerLevel, isStudent }. `isStudent` is purely
// decorative — a "currently a student" flag with no gameplay/weighting
// consequence (see itemStats.js's weightFor, which never reads it) — kept
// here anyway since it's the same per-user record as providerLevel.
export async function loadProfile(user) {
  if (!user) return null;
  if (cache.has(user.uid)) return cache.get(user.uid);
  let profile = null;
  if (!user.isGuest && firebaseConfigured) {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "nremtProfiles", user.uid));
      if (snap.exists()) profile = snap.data();
    } catch (e) {
      console.error("loadProfile: falling back to local cache", e);
    }
  }
  if (!profile) profile = loadLocal(user.uid);
  cache.set(user.uid, profile);
  return profile;
}

// `patch` is merged onto whatever's already cached/stored, not a full
// replacement — a caller that only wants to change one field (e.g. just
// isStudent) never has to first re-fetch and re-send the rest.
export async function saveProfile(user, patch) {
  if (!user) return;
  const merged = { ...(cache.get(user.uid) || {}), ...patch };
  cache.set(user.uid, merged);
  saveLocal(user.uid, merged);
  if (user.isGuest || !firebaseConfigured) return;
  try {
    const db = await getFirebaseDb();
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "nremtProfiles", user.uid), patch, { merge: true });
  } catch (e) {
    console.error("saveProfile: cloud save failed, local copy is intact", e);
  }
}
