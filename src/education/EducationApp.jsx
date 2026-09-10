import { useEffect, useState } from "react";
import { subscribeAuth, signOutUser } from "./auth.js";
import { loadProgress, saveProgress } from "./store.js";
import { firebaseConfigured } from "./firebase.js";
import { isAdminUser } from "./adminConfig.js";
import { loadProfile } from "./profile.js";
import AuthScreen from "./AuthScreen.jsx";
import MCQPracticeTab from "./MCQPracticeTab.jsx";
import AdaptiveTestTab from "./AdaptiveTestTab.jsx";
import LecturesTab from "./LecturesTab.jsx";
import MethodsPage from "./MethodsPage.jsx";
import SubmitQuestionForm from "./SubmitQuestionForm.jsx";
import AdminReviewTab from "./AdminReviewTab.jsx";
import ProfileSettings from "./ProfileSettings.jsx";

const TABS = [
  { key: "mcq", label: "MCQ Practice" },
  { key: "adaptive", label: "Adaptive Exam" },
  { key: "lectures", label: "Lectures", badge: "WIP" },
  { key: "submit", label: "Submit a Question" },
];

export default function EducationApp({ onExit }) {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null); // null = loading
  const [tab, setTab] = useState("mcq");
  const [showAuth, setShowAuth] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    let unsub = () => {};
    subscribeAuth((u) => setUser(u)).then((fn) => (unsub = fn));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    loadProgress(user).then((p) => {
      if (active) setProgress(p);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const updateCard = (id, state) => {
    setProgress((prev) => {
      const next = { ...(prev || {}), [id]: state };
      saveProgress(user, next);
      return next;
    });
  };

  if (!user || progress === null) {
    return (
      <ScreenShell onExit={onExit}>
        <div className="text-slate-400 text-center py-20">Loading…</div>
      </ScreenShell>
    );
  }

  if (showAuth) {
    return (
      <ScreenShell onExit={onExit}>
        <AuthScreen onDone={() => setShowAuth(false)} />
      </ScreenShell>
    );
  }

  if (showMethods) {
    return (
      <ScreenShell onExit={onExit}>
        <MethodsPage onBack={() => setShowMethods(false)} />
      </ScreenShell>
    );
  }

  if (showProfile) {
    return (
      <ScreenShell onExit={onExit}>
        <ProfileSettings
          user={user}
          onBack={() => {
            setShowProfile(false);
            setProfileVersion((v) => v + 1); // let UserBar re-fetch in case it changed
          }}
        />
      </ScreenShell>
    );
  }

  const admin = isAdminUser(user);
  const tabs = admin ? [...TABS, { key: "admin", label: "Admin Review" }] : TABS;

  return (
    <ScreenShell onExit={onExit}>
      <UserBar
        user={user}
        onAuth={() => setShowAuth(true)}
        onProfile={() => setShowProfile(true)}
        profileVersion={profileVersion}
      />
      <nav className="flex flex-wrap gap-1.5 mb-6 border-b border-slate-800 pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
              tab === t.key ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {t.label}
            {t.badge && (
              <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab === "mcq" && <MCQPracticeTab progress={progress} onUpdateCard={updateCard} user={user} />}
      {tab === "adaptive" && (
        <AdaptiveTestTab progress={progress} onUpdateCard={updateCard} onOpenMethods={() => setShowMethods(true)} user={user} />
      )}
      {tab === "lectures" && <LecturesTab onOpenPractice={() => setTab("mcq")} />}
      {tab === "submit" && <SubmitQuestionForm user={user} />}
      {tab === "admin" && admin && <AdminReviewTab user={user} />}
    </ScreenShell>
  );
}

function UserBar({ user, onAuth, onProfile, profileVersion }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;
    loadProfile(user).then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, [user, profileVersion]);

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between mb-4">
      <div>
        <div className="text-sm text-slate-400">Signed in as</div>
        <div className="font-medium flex items-center gap-2">
          {user.name}
          {profile?.isStudent && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-sky-900/60 text-sky-300 border border-sky-700">
              Student
            </span>
          )}
        </div>
        {profile?.providerLevel && <div className="text-xs text-slate-500 mt-0.5">{profile.providerLevel}</div>}
        {user.isGuest && (
          <div className="text-xs text-amber-400 mt-1">
            Guest mode — progress is saved on this device only.
            {!firebaseConfigured && " (Sign-in isn't configured yet — see src/education/firebase.js)"}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onProfile}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
        >
          Profile
        </button>
        {firebaseConfigured &&
          (user.isGuest ? (
            <button onClick={onAuth} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium">
              Sign in / Create account
            </button>
          ) : (
            <button onClick={() => signOutUser()} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">
              Sign out
            </button>
          ))}
      </div>
    </div>
  );
}

function ScreenShell({ children, onExit }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-400">Proximate Education</div>
          <button onClick={onExit} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
            ← Back to home
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

