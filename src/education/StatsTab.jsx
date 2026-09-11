import { useEffect, useState } from "react";
import { loadProgress } from "./store.js";
import { getQuestionPool } from "./questionPool.js";
import { loadPredictionLog } from "./predictions.js";
import { loadProfile } from "./profile.js";
import { computeUserStats } from "./userStats.js";

export default function StatsTab({ user }) {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([loadProgress(user), getQuestionPool(), loadPredictionLog(user), loadProfile(user)]).then(
      ([progress, pool, predictionLog, prof]) => {
        if (!active) return;
        setStats(computeUserStats(progress, pool, predictionLog));
        setProfile(prof);
      }
    );
    return () => {
      active = false;
    };
  }, [user]);

  if (!stats) return <div className="text-slate-400 text-center py-20">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Progress</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Questions answered" value={stats.questionsAnswered} />
        <Stat label="Overall accuracy" value={stats.accuracy != null ? `${stats.accuracy}%` : "—"} />
        <Stat label="Due for review" value={stats.dueCount} accent />
        <Stat label="Mastered" value={stats.masteredCount} />
      </div>

      {profile?.providerLevel && (
        <div className="text-sm text-slate-400">
          Studying for: <span className="text-slate-200 font-medium">{profile.providerLevel}</span>
        </div>
      )}

      {stats.suggestion && (
        <div className="rounded-xl bg-sky-950/30 border border-sky-900 p-4 text-sm text-sky-200">
          {stats.suggestion}
        </div>
      )}

      {stats.leechCount > 0 && (
        <div className="rounded-xl bg-amber-950/30 border border-amber-900 p-4 text-sm text-amber-200">
          {stats.leechCount} question{stats.leechCount === 1 ? "" : "s"} keep coming back wrong (leeches) — worth a
          closer look at the explanation next time you see them.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {stats.strongestDomain && (
          <div className="rounded-xl bg-emerald-950/30 border border-emerald-900 p-4">
            <div className="font-semibold text-emerald-300 mb-1">Strongest domain</div>
            <div className="text-sm text-slate-300">
              {stats.strongestDomain.domain} — {stats.strongestDomain.accuracy}%
            </div>
          </div>
        )}
        {stats.weakestDomain && (
          <div className="rounded-xl bg-red-950/30 border border-red-900 p-4">
            <div className="font-semibold text-red-300 mb-1">Weakest domain</div>
            <div className="text-sm text-slate-300">
              {stats.weakestDomain.domain} — {stats.weakestDomain.accuracy}%
            </div>
          </div>
        )}
      </div>

      {stats.domainAccuracy.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="font-semibold mb-2">Accuracy by domain</div>
          <div className="space-y-1.5">
            {stats.domainAccuracy
              .sort((a, b) => a.accuracy - b.accuracy)
              .map((d) => (
                <div key={d.domain} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{d.domain}</span>
                  <span className="text-slate-400">{d.accuracy}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {Object.keys(stats.byLevel).length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="font-semibold mb-2">Accuracy by question level</div>
          <div className="space-y-1.5">
            {Object.entries(stats.byLevel).map(([lvl, v]) => (
              <div key={lvl} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{lvl}</span>
                <span className="text-slate-400">
                  {v.seen ? Math.round((v.correct / v.seen) * 100) : "—"}% ({v.questions} question
                  {v.questions === 1 ? "" : "s"})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.calibrationBias != null && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="font-semibold mb-1">Predicted vs. actual performance</div>
          <div className="text-sm text-slate-400 mb-3">
            {stats.calibrationBias > 5
              ? `Proximate tends to overestimate your chances by about ${stats.calibrationBias} points.`
              : stats.calibrationBias < -5
              ? `Proximate tends to underestimate your chances by about ${Math.abs(stats.calibrationBias)} points.`
              : "Proximate's predictions are well-calibrated to your actual performance."}
          </div>
          {stats.calibration.length > 0 && (
            <div className="space-y-1">
              {stats.calibration.map((b) => (
                <div key={b.bucketLabel} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Predicted {b.bucketLabel}</span>
                  <span className="text-slate-400">
                    actual {b.actualPct}% ({b.n})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {stats.needsReview.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="font-semibold mb-1">Questions needing review</div>
          <div className="text-sm text-slate-400">{stats.needsReview.length} due right now — head to MCQ Practice.</div>
        </div>
      )}

      {stats.recentActivity.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="font-semibold mb-2">Recent activity</div>
          <div className="space-y-1.5">
            {stats.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-400">
                <span>{a.domain}</span>
                <span className={a.correct ? "text-emerald-400" : "text-red-400"}>
                  {a.correct ? "Correct" : "Incorrect"} (predicted {a.predictedPct}%)
                </span>
              </div>
            ))}
          </div>
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
