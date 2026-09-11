import { useEffect, useMemo, useState } from "react";
import { LEVELS, DOMAINS_BY_LEVEL } from "./questions.js";
import { getQuestionPool, poolByLevel } from "./questionPool.js";
import { blankCardState, schedule, isDue, previewIntervals, RATING } from "./srs.js";
import {
  getItemStats,
  recordResponse,
  recordSrsSignal,
  choicePercentages,
  difficultyBand,
  MIN_RESPONSES_FOR_DISPLAY,
} from "./itemStats.js";
import { difficultyFromStats } from "./adaptiveEngine.js";
import { randomizePresentation } from "./randomize.js";
import { ensureExposed } from "./exposure.js";
import { reportingEnabled, submitReport, REPORT_REASONS } from "./reports.js";
import { estimatePredictedProb, recordPrediction } from "./predictions.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MCQPracticeTab({ progress, onUpdateCard, user }) {
  const [view, setView] = useState("level"); // level | dashboard | practice
  const [level, setLevel] = useState("EMT");
  const [domainFilter, setDomainFilter] = useState("All"); // "All" = entire bank, else one topic
  const [pool, setPool] = useState(null);

  useEffect(() => {
    getQuestionPool().then(setPool);
  }, []);

  if (!pool) return <div className="text-slate-400 text-center py-20">Loading question bank…</div>;

  if (view === "level") {
    return (
      <LevelSelect
        pool={pool}
        onPick={(lvl) => {
          setLevel(lvl);
          setDomainFilter("All");
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "practice") {
    return (
      <Practice
        pool={pool}
        progress={progress}
        level={level}
        domainFilter={domainFilter}
        onUpdateCard={onUpdateCard}
        onDone={() => setView("dashboard")}
        user={user}
      />
    );
  }

  return (
    <Dashboard
      pool={pool}
      progress={progress}
      level={level}
      domainFilter={domainFilter}
      setDomainFilter={setDomainFilter}
      onStart={() => setView("practice")}
      onChangeLevel={() => setView("level")}
    />
  );
}

function levelQuestions(pool, level) {
  return poolByLevel(pool, level);
}

function dueQuestions(pool, progress, level, domainFilter) {
  const now = Date.now();
  const due = levelQuestions(pool, level)
    .filter((q) => domainFilter === "All" || q.domain === domainFilter)
    .filter((q) => isDue(progress[q.id], now));
  // Randomize order so a bank-wide session interleaves topics instead of
  // walking through the underlying array's own domain-grouped order — SRS
  // due-ness doesn't require any particular sequence among due cards.
  return shuffle(due);
}

function LevelSelect({ pool, onPick }) {
  const counts = useMemo(() => {
    const m = {};
    for (const q of pool) m[q.level] = (m[q.level] || 0) + 1;
    return m;
  }, [pool]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">MCQ Practice</h1>
        <p className="text-slate-400 mt-2">
          Anki-style spaced-repetition practice. Choose which certification level you're studying for.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => onPick(lvl)}
            className="text-left rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-700 transition p-5"
          >
            <div className="text-xl font-semibold">{lvl}</div>
            <div className="text-sm text-slate-400 mt-1">
              {counts[lvl] || 0} question{counts[lvl] === 1 ? "" : "s"} available
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ pool, progress, level, domainFilter, setDomainFilter, onStart, onChangeLevel }) {
  const levelPool = levelQuestions(pool, level);
  const total = levelPool.length;
  const seen = levelPool.filter((q) => progress[q.id]).length;
  const due = dueQuestions(pool, progress, level, domainFilter).length;
  const mastered = levelPool.filter((q) => (progress[q.id]?.repetition || 0) >= 3).length;
  const domains = DOMAINS_BY_LEVEL[level] || [];

  const domainCounts = useMemo(() => {
    const m = {};
    for (const q of levelPool) m[q.domain] = (m[q.domain] || 0) + 1;
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, pool]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">MCQ Practice</h1>
        <button
          onClick={onChangeLevel}
          className="shrink-0 text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300"
        >
          Level: <span className="font-semibold">{level}</span> · change
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Due now" value={due} accent />
        <Stat label="Seen" value={`${seen}/${total}`} />
        <Stat label="Mastered" value={mastered} />
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          No questions are tagged <code className="text-slate-300">level: "{level}"</code> yet.
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Study the entire bank, or pick a topic</label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
            >
              <option value="All">Entire bank — mixed topics ({total})</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d} ({domainCounts[d] || 0})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onStart}
            disabled={due === 0}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-lg font-semibold transition"
          >
            {due === 0 ? "Nothing due right now — nice work" : `Start review (${due} due)`}
          </button>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-emerald-700 bg-emerald-950/40" : "border-slate-800 bg-slate-900"}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function Practice({ pool, progress, level, domainFilter, onUpdateCard, onDone, user }) {
  const [queue] = useState(() => dueQuestions(pool, progress, level, domainFilter));
  const [idx, setIdx] = useState(0);
  const [statsSum, setStatsSum] = useState({ correct: 0, wrong: 0 });

  const q = queue[idx];

  if (!q) {
    return (
      <div className="text-center space-y-4 py-16">
        <div className="text-2xl font-semibold">Session complete</div>
        <div className="text-slate-400">
          {statsSum.correct} correct, {statsSum.wrong} to review again.
        </div>
        <button onClick={onDone} className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <QuestionView
      key={q.id}
      q={q}
      progress={progress}
      onUpdateCard={onUpdateCard}
      position={`${idx + 1} / ${queue.length}`}
      onAnswered={(correct) => setStatsSum((s) => (correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 }))}
      onRated={() => setIdx((i) => i + 1)}
      onExit={onDone}
      user={user}
    />
  );
}

function QuestionView({ q, progress, onUpdateCard, position, onAnswered, onRated, onExit, user }) {
  const display = useMemo(() => randomizePresentation(q), [q]);
  const [stats, setStats] = useState(null);
  const [selectedDisplayIdx, setSelectedDisplayIdx] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    ensureExposed(progress, q.id, onUpdateCard);
    getItemStats(q).then(setStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  const predictedPct = useMemo(() => estimatePredictedProb(stats, null), [stats]);

  const choose = (i) => {
    if (revealed) return;
    setSelectedDisplayIdx(i);
    setRevealed(true);
    const canonicalIdx = display.toCanonical[i];
    const correct = canonicalIdx === q.answerIndex;
    onAnswered(correct);
    recordResponse(q, canonicalIdx, correct, user);
    recordPrediction(user, {
      questionId: q.id,
      domain: q.domain,
      level: q.level,
      predictedPct,
      actualCorrect: correct,
    });
  };

  const cardState = progress[q.id] || blankCardState();
  const preview = useMemo(
    () => (revealed ? previewIntervals(cardState) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revealed, q.id]
  );

  const rate = (rating) => {
    const nextState = schedule(cardState, rating);
    onUpdateCard(q.id, { ...nextState, exposed: true });
    recordSrsSignal(q, rating, user);
    onRated();
  };

  const enoughData = (stats?.attempts || 0) >= MIN_RESPONSES_FOR_DISPLAY;
  const pcts = revealed && stats ? choicePercentages(stats, q.choices.length) : null;
  const difficulty = stats ? difficultyFromStats(stats) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <button onClick={onExit} className="hover:text-white underline underline-offset-4">
          ← End session
        </button>
        <span>{q.domain}</span>
        <div className="flex items-center gap-3">
          <span>{position}</span>
          {reportingEnabled && (
            <button
              onClick={() => setReportOpen(true)}
              className="text-xs text-slate-500 hover:text-amber-400 underline underline-offset-4"
              title="Report a problem with this question"
            >
              Report
            </button>
          )}
        </div>
      </div>

      {reportOpen && <ReportQuestionModal q={q} user={user} onClose={() => setReportOpen(false)} />}

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex items-center justify-between gap-3 mb-3 text-xs">
          {!revealed && (
            <span className="text-sky-400">Proximate predicts: {predictedPct}% chance correct</span>
          )}
          {stats && (
            <span className="text-slate-500 ml-auto">
              Difficulty: {difficultyBand(difficulty?.b)} ·{" "}
              {Math.round((difficulty?.confidence || 0) * 100)}% confidence
            </span>
          )}
        </div>
        <div className="text-lg font-medium mb-4">{q.question}</div>
        <div className="space-y-2">
          {display.displayChoices.map((c, i) => {
            let cls = "border-slate-700 hover:border-slate-500";
            if (revealed) {
              if (i === display.displayAnswerIndex) cls = "border-emerald-500 bg-emerald-950/40";
              else if (i === selectedDisplayIdx) cls = "border-red-500 bg-red-950/30";
              else cls = "border-slate-800 opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${cls}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span>{c}</span>
                  {revealed && (
                    <span className="text-xs text-slate-400 shrink-0">
                      {enoughData ? `${pcts[display.toCanonical[i]]}%` : "—"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {revealed && !enoughData && (
          <div className="text-xs text-slate-500 mt-2">
            Answer-choice percentages are based on limited data for this question so far.
          </div>
        )}
      </div>

      {revealed && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-4">
          <div className="text-sm text-slate-300">{q.explanation}</div>
          {cardState.leech && (
            <div className="text-xs text-amber-400">
              This card keeps coming back wrong — it's a "leech." Consider reviewing the explanation more closely.
            </div>
          )}
          <div className="flex gap-2">
            <RateButton
              label="Again"
              sub={preview?.again.label}
              color="bg-red-700 hover:bg-red-600"
              onClick={() => rate(RATING.AGAIN)}
            />
            <RateButton
              label="Hard"
              sub={preview?.hard.label}
              color="bg-amber-700 hover:bg-amber-600"
              onClick={() => rate(RATING.HARD)}
            />
            <RateButton
              label="Good"
              sub={preview?.good.label}
              color="bg-sky-700 hover:bg-sky-600"
              onClick={() => rate(RATING.GOOD)}
            />
            <RateButton
              label="Easy"
              sub={preview?.easy.label}
              color="bg-emerald-700 hover:bg-emerald-600"
              onClick={() => rate(RATING.EASY)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ReportQuestionModal({ q, user, onClose }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState(null); // null | "submitting" | "done" | error string

  const submit = async () => {
    setStatus("submitting");
    try {
      await submitReport(user, q, reason, details);
      setStatus("done");
    } catch (e) {
      setStatus(e.message || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report this question</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {!user || user.isGuest ? (
          <div className="text-sm text-slate-400">Sign in to report a question.</div>
        ) : status === "done" ? (
          <div className="text-sm text-emerald-300">
            Thanks, this has been sent to an admin for review.
            <button onClick={onClose} className="block mt-3 text-slate-300 underline underline-offset-4">
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Details (optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
                placeholder="What's wrong with this question?"
              />
            </div>
            {typeof status === "string" && status !== "submitting" && (
              <div className="text-sm text-red-400">{status}</div>
            )}
            <button
              onClick={submit}
              disabled={status === "submitting"}
              className="w-full py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:opacity-50 font-medium"
            >
              {status === "submitting" ? "Submitting…" : "Submit report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RateButton({ label, sub, color, onClick }) {
  return (
    <button onClick={onClick} className={`flex-1 py-3 rounded-lg font-medium text-sm ${color}`}>
      <div>{label}</div>
      <div className="text-xs opacity-75 font-normal">{sub}</div>
    </button>
  );
}
