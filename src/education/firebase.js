// Firebase is OPTIONAL. If you don't configure it, the Education module
// still works fully in "guest mode" with progress saved to localStorage
// only (no cross-device sync, no real accounts).
//
// To turn on real sign-in + cross-device saved progress:
//   1. Create a free project at https://console.firebase.google.com
//   2. Enable Authentication -> Sign-in method -> Email/Password (and,
//      optionally, Google).
//   3. Enable Firestore Database (start in production mode; the security
//      rules below restrict each user to their own document).
//   4. Copy your project's web config into a `.env.local` file at the repo
//      root (Vite reads any VITE_-prefixed variable automatically):
//
//        VITE_FIREBASE_API_KEY=...
//        VITE_FIREBASE_AUTH_DOMAIN=...
//        VITE_FIREBASE_PROJECT_ID=...
//        VITE_FIREBASE_STORAGE_BUCKET=...
//        VITE_FIREBASE_MESSAGING_SENDER_ID=...
//        VITE_FIREBASE_APP_ID=...
//
//   5. In the Firestore console, set these security rules so each signed-in
//      user can only read/write their own progress document:
//
//        rules_version = '2';
//        service cloud.firestore {
//          match /databases/{database}/documents {
//            match /nremtProgress/{uid} {
//              allow read, write: if request.auth != null && request.auth.uid == uid;
//            }
//          }
//        }
//
// Restart `npm run dev` after adding the .env.local file.

// `import.meta.env` only exists under Vite. Node-based verification scripts
// import modules that (transitively) import this file — optional chaining
// keeps that working (no Firebase config under plain Node: guest/local mode).
const config = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let _auth = null;
let _db = null;
let _initPromise = null;

// Lazy-loaded so the (fairly large) firebase SDK is never fetched at all
// for a player who never configures it or never opens Education mode.
async function ensureInit() {
  if (!firebaseConfigured) return null;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const { initializeApp } = await import("firebase/app");
    const { getAuth } = await import("firebase/auth");
    const { getFirestore } = await import("firebase/firestore");
    const app = initializeApp(config);
    _auth = getAuth(app);
    _db = getFirestore(app);
    return { auth: _auth, db: _db };
  })();
  return _initPromise;
}

export async function getFirebaseAuth() {
  const r = await ensureInit();
  return r ? r.auth : null;
}

export async function getFirebaseDb() {
  const r = await ensureInit();
  return r ? r.db : null;
}
