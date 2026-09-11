import { useEffect, useState } from "react";
import { loadProgress } from "./store.js";
import { getQuestionPool } from "./questionPool.js";
import { loadPredictionLog } from "./predictions.js";
import { computeUserStats } from "./userStats.js";
import { loadGlobalStats } from "./globalStats.js";
import { firebaseConfigured } from "./firebase.js";

const TILES = [
  { key: "mcq", label: "Practice Questions", desc: "Spaced-repetition MCQ practice by domain." },
  { key: "adaptive", label: "Adaptive Exam", desc: "A full-length, IRT-based practice exam." },
  { key: "assessment", label: "Provider Level Assessment", desc: "See where your knowledge currently sits." },
  { key: "daily", label: "Daily Challenge", desc: "Today's Medicdle and other quick games." },
  { key: "stats", label: "Progress & Statistics", desc: "Your accuracy, streaks, and suggested study areas." },
  { key: "lectures", label: "Lectures", desc: "WIP." },
  { key: "submit", label: "Submit a Question", desc: "Contribute to the crowdsourced question bank." },
  { key: "methods", label: "Methods", desc: "Every calculation behind these numbers, explained plainly." },
];

export default function EducationDashboard({ user, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [global, setGlobal] = useState(undefined);

  useEffect(() => {
    let active = true;
    Promise.all([loadProgress(user), getQuestionPool(), loadPredictionLog(user)]).then(
      ([progress, pool, predictionLog]) => {
        if (active) setStats(computeUserStats(progress, pool, predictionLog));
      }
    );
    loadGlobalStats().then((g) => active && setGlobal(g));
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Education Dashboard</h1>
        <p className="text-slate-400 mt-1">Pick where to go, or see what's worth focusing on below.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Answered" value={stats.questionsAnswered} />
          <Stat label="Accuracy" value={stats.accuracy != null ? `${stats.accuracy}%` : "—"} />
          <Stat label="Due for review" value={stats.dueCount} accent />
          <Stat label="Mastered" value={stats.masteredCount} />
        </div>
      )}

      {stats?.suggestion && (
        <div className="rounded-xl bg-sky-950/30 border border-sky-900 p-4 text-sm text-sky-200">
          {stats.suggestion}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {TILES.map((t) => (
          <button
            key={t.key}
            onClick={() => onNavigate(t.key)}
            className="text-left rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-700 transition p-4"
          >
            <div className="font-semibold">{t.label}</div>
            <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
          </button>
        ))}
      </div>

      {firebaseConfigured && global && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-sm text-slate-400 mb-2">Proximate Education, community-wide</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold">{(global.totalUsers || 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500">users</div>
            </div>
            <div>
              <div className="text-lg font-bold">{(global.totalQuestionsAnswered || 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500">questions answered</div>
            </div>
            <div>
              <div className="text-lg font-bold">{(global.totalExamsCompleted || 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500">exams completed</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("global")}
            className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-4 mt-2"
          >
            See more
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${accent ? "border-sky-700 bg-sky-950/40" : "border-slate-800 bg-slate-900"}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
