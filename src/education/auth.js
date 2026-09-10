import { firebaseConfigured, getFirebaseAuth } from "./firebase.js";

const GUEST_KEY = "nremt_guest_id";

function guestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = "guest-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

// user shape: { uid, name, isGuest }
export function guestUser() {
  return { uid: guestId(), name: "Guest", isGuest: true };
}

export async function subscribeAuth(cb) {
  if (!firebaseConfigured) {
    cb(guestUser());
    return () => {};
  }
  const auth = await getFirebaseAuth();
  const { onAuthStateChanged } = await import("firebase/auth");
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      cb({
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email || "Signed in",
        isGuest: false,
      });
    } else {
      cb(guestUser());
    }
  });
}

export async function signUp(email, password, displayName) {
  const auth = await getFirebaseAuth();
  const { createUserWithEmailAndPassword, updateProfile } = await import(
    "firebase/auth"
  );
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function signIn(email, password) {
  const auth = await getFirebaseAuth();
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  const auth = await getFirebaseAuth();
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutUser() {
  const auth = await getFirebaseAuth();
  const { signOut } = await import("firebase/auth");
  return signOut(auth);
}
