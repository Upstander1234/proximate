import { useEffect, useRef, useState } from "react";
import QuestionSessionView from "./QuestionSessionView.jsx";
import { recordStudySession } from "./studyLog.js";

// Runs any pre-built list of questions through QuestionSessionView in
// sequence, then shows a results screen — shared by Quick 10, Timed Quiz,
// Custom Quiz, and Weakest-Area Quiz so none of them has to reimplement
// sequencing, scoring, or the per-domain breakdown. Every question answered
// here goes through QuestionSessionView's own SRS/itemStats/prediction
// recording, so results are visible in Progress/analytics immediately.
//
// `timeLimitSec`, when given, ends the whole session the instant it
// expires — whatever hasn't been reached yet is recorded as unanswered.
export default function QuizRunner({ title, mode, level, queue, progress, onUpdateCard, user, onDone, timeLimitSec }) {
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]); // [{domain, correct}]
  const [startedAt] = useState(() => Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const [remainingSec, setRemainingSec] = useState(timeLimitSec || 0);
  const [finishedAt, setFinishedAt] = useState(null);

  const finished = timedOut || idx >= queue.length;

  // Date.now() can't be called during render (impure) — capture the finish
  // timestamp once, the instant the session actually finishes, rather than
  // recomputing "now" on every render of the results screen.
  useEffect(() => {
    if (!finished || finishedAt != null) return;
    const t = setTimeout(() => setFinishedAt(Date.now()), 0);
    return () => clearTimeout(t);
  }, [finished, finishedAt]);

  // One persisted summary per completed session (studyLog.js), so "quiz
  // results" exist over time instead of being recomputed and discarded by
  // this results screen. Guarded by a ref so a re-render of the finished
  // state can never record the same session twice.
  const recordedRef = useRef(false);
  useEffect(() => {
    if (!finished || recordedRef.current) return;
    recordedRef.current = true;
    const byDomain = {};
    for (const r of results) {
      const d = (byDomain[r.domain] ||= { total: 0, correct: 0 });
      d.total += 1;
      if (r.correct) d.correct += 1;
    }
    recordStudySession(user, {
      mode: mode || "custom",
      level: level || null,
      total: queue.length,
      answered: results.length,
      correct: results.filter((r) => r.correct).length,
      unanswered: queue.length - results.length,
      timedOut,
      timeLimitSec: timeLimitSec || null,
      byDomain,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => {
    if (!timeLimitSec) return;
    const t = setInterval(() => {
      setRemainingSec((s) => {
        if (s <= 1) {
          clearInterval(t);
          setTimedOut(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLimitSec]);

  const q = !timedOut ? queue[idx] : null;

  if (finished) {
    const answeredCount = results.length;
    const correctCount = results.filter((r) => r.correct).length;
    const unansweredCount = queue.length - answeredCount;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;
    const elapsedSec = finishedAt != null ? Math.round((finishedAt - startedAt) / 1000) : null;

    const byDomain = {};
    for (const r of results) {
      const d = (byDomain[r.domain] ||= { total: 0, correct: 0 });
      d.total += 1;
      if (r.correct) d.correct += 1;
    }

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{title} — results</h1>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Accuracy" value={accuracy != null ? `${accuracy}%` : "—"} accent />
          <Stat label="Correct" value={`${correctCount}/${answeredCount}`} />
          <Stat label="Time" value={elapsedSec != null ? fmtTime(elapsedSec) : "—"} />
        </div>
        {unansweredCount > 0 && (
          <div className="rounded-lg border border-amber-800 bg-amber-950/30 px-3 py-2 text-sm text-amber-300">
            {timedOut ? "Time expired — " : ""}
            {unansweredCount} question{unansweredCount === 1 ? "" : "s"} left unanswered.
          </div>
        )}
        {Object.keys(byDomain).length > 0 && (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-sm font-semibold mb-2">By domain</div>
            <div className="space-y-1.5">
              {Object.entries(byDomain).map(([domain, d]) => (
                <div key={domain} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{domain}</span>
                  <span className="text-slate-400">
                    {d.correct}/{d.total} ({Math.round((d.correct / d.total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={onDone} className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium">
          Done
        </button>
        <p className="text-xs text-slate-500 text-center">
          This session was saved to your Progress page — accuracy, timing, and per-domain results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{title}</div>
        {timeLimitSec ? (
          <div className={`text-sm font-mono ${remainingSec <= 30 ? "text-red-400" : "text-slate-400"}`}>
            {fmtTime(remainingSec)}
          </div>
        ) : null}
      </div>
      <QuestionSessionView
        key={q.id}
        q={q}
        progress={progress}
        onUpdateCard={onUpdateCard}
        position={`${idx + 1} / ${queue.length}`}
        onAnswered={(correct) => setResults((r) => [...r, { domain: q.domain, correct }])}
        onRated={() => setIdx((i) => i + 1)}
        onExit={onDone}
        user={user}
      />
    </div>
  );
}

function fmtTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Stat({ label, value, accent }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-emerald-700 bg-emerald-950/40" : "border-slate-800 bg-slate-900"}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
