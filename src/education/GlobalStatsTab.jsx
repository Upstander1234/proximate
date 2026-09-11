import { useEffect, useState } from "react";
import { loadGlobalStats } from "./globalStats.js";
import { firebaseConfigured } from "./firebase.js";

export default function GlobalStatsTab() {
  const [stats, setStats] = useState(undefined); // undefined = loading

  useEffect(() => {
    loadGlobalStats().then(setStats);
  }, []);

  if (!firebaseConfigured) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-sm text-slate-400">
        Global statistics aren't available — sign-in isn't configured on this deployment.
      </div>
    );
  }

  if (stats === undefined) return <div className="text-slate-400 text-center py-10">Loading…</div>;
  if (!stats) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-sm text-slate-400">
        Global statistics are unavailable right now.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Proximate Education — community stats</h2>
        <p className="text-sm text-slate-500 mt-1">
          Aggregated, non-identifying engagement across every Education Mode user.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Total users" value={stats.totalUsers} />
        <Stat label="Questions answered" value={stats.totalQuestionsAnswered} />
        <Stat label="SRS reviews" value={stats.totalSrsReviews} />
        <Stat label="Exams completed" value={stats.totalExamsCompleted} />
        <Stat label="Medicdle plays" value={stats.totalMedicdlePlays} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
      <div className="text-xl font-bold">{(value || 0).toLocaleString()}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
