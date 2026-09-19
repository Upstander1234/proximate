import { useEffect, useState } from "react";
import { STAGES } from "./medicdleData.js";
import {
  loadMedicdleStats,
  findLevelRow,
  MIN_ATTEMPTS_FOR_DISPLAY,
  MIN_LEVEL_ATTEMPTS_FOR_DISPLAY,
} from "./medicdleStats.js";
import { firebaseConfigured } from "./firebase.js";

// Community statistics for one Medicdle case, plus the "View Other Provider
// Levels" comparison.
//
// Three honesty rules are visible in the UI, not just in the data layer:
//   - a percentage is never rendered from an aggregate below the display
//     threshold; the sample size is shown instead, explicitly
//   - the comparison is described as performance ON THIS MEDICDLE, and the
//     copy never implies one provider level is inherently better
//   - the player's own provider level is labelled as such, and simply
//     absent (not shown as 0%) when it has no recorded attempts
export default function MedicdleCommunityStats({ caseId, providerLevel, onOpenSubmit }) {
  const [stats, setStats] = useState(undefined); // undefined = loading, null = unavailable
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    let active = true;
    // Wrapped in setTimeout, not called bare — this project's linter
    // (react-hooks/set-state-in-effect) flags a synchronous setState in an
    // effect body; same fix shape StudyTab.jsx already uses.
    setTimeout(() => setStats(undefined), 0);
    loadMedicdleStats(caseId).then((s) => {
      if (active) setStats(s);
    });
    return () => {
      active = false;
    };
  }, [caseId]);

  if (stats === undefined) {
    return <div className="text-sm text-slate-500">Loading community statistics…</div>;
  }

  if (stats === null) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-sm text-slate-400">
        Community statistics aren&apos;t available
        {firebaseConfigured ? " right now." : " — sign-in isn't configured on this deployment."}
      </div>
    );
  }

  const { overall, byLevel } = stats;
  const myRow = findLevelRow(byLevel, providerLevel);

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
      <div>
        <div className="font-semibold">How everyone did on this Medicdle</div>
        <div className="text-xs text-slate-500 mt-0.5">
          Aggregate results from every player who has finished this case. No individual player is identifiable.
        </div>
      </div>

      {!overall.sufficient ? (
        <div className="rounded-lg border border-amber-800 bg-amber-950/30 px-3 py-2 text-sm text-amber-300">
          Not enough data yet: {overall.total} completed attempt{overall.total === 1 ? "" : "s"} so far, and at least{" "}
          {MIN_ATTEMPTS_FOR_DISPLAY} are needed before these percentages would mean anything. No estimate is shown in
          the meantime.
        </div>
      ) : (
        <OverallStats overall={overall} />
      )}

      <div className="pt-3 border-t border-slate-800 space-y-3">
        <MyLevelRow myRow={myRow} providerLevel={providerLevel} />

        <button
          onClick={() => setShowComparison((v) => !v)}
          className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium"
        >
          {showComparison ? "Hide other provider levels" : "View Other Provider Levels"}
        </button>

        {showComparison && <LevelComparison byLevel={byLevel} myRow={myRow} />}

        {onOpenSubmit && (
          <button onClick={onOpenSubmit} className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-4">
            Think you can write a better one? Submit a Medicdle
          </button>
        )}
      </div>
    </div>
  );
}

function OverallStats({ overall }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <Figure
          label="Success rate"
          value={`${overall.successRatePct}%`}
          sub={`${overall.solved}/${overall.total} identified`}
        />
        <Figure
          label="Completion rate"
          value={overall.completionRatePct != null ? `${overall.completionRatePct}%` : "—"}
          sub={`${overall.total} finished of ${overall.started} started`}
        />
        <Figure label="Average clues" value={overall.averageClues} sub={`of ${STAGES.length} stages`} />
        <Figure label="Never solved" value={overall.unsolved} sub="players who ran out of clues" />
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Identified at each stage</div>
        <div className="space-y-1.5">
          {STAGES.map((stage, i) => {
            const key = String(i + 1);
            const pct = overall.stagePct[key];
            return (
              <div key={stage} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 text-slate-300">
                  {i + 1}. {stage}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-sky-600" style={{ width: `${pct || 0}%` }} />
                </div>
                <span className="w-20 text-right text-slate-400">
                  {pct}% ({overall.stageCounts[key] || 0})
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-slate-500 pt-2">
          Percentages are of all {overall.total} completed attempts, including the {overall.unsolved} that were never
          identified.
        </div>
      </div>
    </>
  );
}

function MyLevelRow({ myRow, providerLevel }) {
  if (!myRow) {
    return (
      <div className="text-sm text-slate-500">
        {providerLevel
          ? `No one has recorded a completed attempt at ${providerLevel} on this case yet.`
          : "You haven't saved a provider level, so your level can't be picked out of the community figures."}
      </div>
    );
  }
  return (
    <div>
      <div className="text-sm font-semibold mb-1">
        Your provider level: <span className="text-sky-400">{providerLevel}</span>
      </div>
      {myRow.displaySufficient ? (
        <div className="text-sm text-slate-400">
          {myRow.completed} completed · {myRow.successRatePct}% identified it ·{" "}
          {myRow.averageClues != null ? `average ${myRow.averageClues} clue${myRow.averageClues === 1 ? "" : "s"} used` : "average clues unavailable"}
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          {myRow.completed} completed attempt{myRow.completed === 1 ? "" : "s"} at {providerLevel} so far — at least{" "}
          {MIN_LEVEL_ATTEMPTS_FOR_DISPLAY} are needed before a percentage for this level is shown.
        </div>
      )}
    </div>
  );
}

function LevelComparison({ byLevel, myRow }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500">
        Performance on this same Medicdle, grouped by the provider level each player reported. The levels are shown
        separately because they have different training backgrounds — this describes how each group did on this one
        case, not which level is better.
      </div>
      {byLevel.length === 0 ? (
        <div className="text-sm text-slate-500">No provider-level data has been recorded for this case yet.</div>
      ) : (
        <div className="space-y-1.5">
          {byLevel.map((row) => {
            const mine = myRow && row.levelKey === myRow.levelKey;
            return (
              <div
                key={row.levelKey}
                className={`flex items-center justify-between gap-3 text-sm rounded-lg px-3 py-2 border ${
                  mine ? "border-sky-700 bg-sky-950/30" : "border-slate-800"
                }`}
              >
                <span className="text-slate-200">
                  {row.providerLevel}
                  {mine && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-sky-300">your level</span>
                  )}
                </span>
                <span className="text-slate-400 text-right">
                  {row.displaySufficient ? (
                    <>
                      {row.successRatePct}% identified · avg {row.averageClues} clue
                      {row.averageClues === 1 ? "" : "s"} · {row.completed} attempts
                    </>
                  ) : (
                    <>
                      {row.completed} attempt{row.completed === 1 ? "" : "s"} — not enough data yet (needs{" "}
                      {MIN_LEVEL_ATTEMPTS_FOR_DISPLAY})
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Figure({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}