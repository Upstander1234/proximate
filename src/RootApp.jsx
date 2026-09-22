import { useEffect, useState } from "react";
import App from "./App.jsx";
import EducationApp from "./education/EducationApp.jsx";
import { subscribeAuth, signOutUser } from "./education/auth.js";
import { firebaseConfigured } from "./education/firebase.js";
import AuthScreen from "./education/AuthScreen.jsx";

export default function RootApp() {
  const [mode, setMode] = useState(null); // null | "game" | "education"
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    subscribeAuth((u) => setUser(u)).then((fn) => (unsub = fn));
    return () => unsub();
  }, []);

  if (mode === "game") return <App onHome={() => setMode(null)} />;
  if (mode === "education") return <EducationApp onExit={() => setMode(null)} />;
  return (
    <HomePage
      onPick={setMode}
      user={user}
      showAuth={showAuth}
      onShowAuth={() => setShowAuth(true)}
      onCloseAuth={() => setShowAuth(false)}
    />
  );
}

function HomePage({ onPick, user, showAuth, onShowAuth, onCloseAuth }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center space-y-10">
        <AccountBar user={user} onShowAuth={onShowAuth} />

        {showAuth ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left">
            <button
              onClick={onCloseAuth}
              className="text-sm text-slate-400 hover:text-white underline underline-offset-4 mb-2"
            >
              ← Back
            </button>
            <AuthScreen onDone={onCloseAuth} allowGuest={false} />
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-5xl font-bold tracking-tight">Proximate</h1>
              <p className="text-slate-400 mt-3">Pick a mode to get started.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Tile
                title="Game"
                badge="VERY WIP"
                badgeClass="bg-amber-900/60 text-amber-300 border border-amber-700"
                description="The prehospital-care physiology simulator. Diagnose and treat patients in real scenarios."
                cta="Play"
                onClick={() => onPick("game")}
              />
              <Tile
                title="Education"
                badge="NREMT Prep"
                badgeClass="bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                description="Spaced-repetition practice questions for the NREMT exam. Free, sign in to save your progress."
                cta="Study"
                onClick={() => onPick("education")}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AccountBar({ user, onShowAuth }) {
  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      {user && !user.isGuest ? (
        <>
          <span className="text-slate-400">
            Signed in as <span className="text-slate-200 font-medium">{user.name}</span>
          </span>
          <button
            onClick={() => signOutUser()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          {user?.isGuest && <span className="text-slate-500">Playing as guest</span>}
          <button
            onClick={onShowAuth}
            disabled={!firebaseConfigured}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            title={firebaseConfigured ? undefined : "Sign-in isn't configured yet"}
          >
            Sign in / Create account
          </button>
        </>
      )}
    </div>
  );
}

function Tile({ title, badge, badgeClass, description, cta, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-700 transition p-6 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-slate-400 flex-1">{description}</p>
      <div className="text-sm font-medium text-sky-400 group-hover:text-sky-300">
        {cta} →
      </div>
    </button>
  );
}
