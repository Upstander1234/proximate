import { useEffect, useMemo, useState } from "react";
import { blankCardState, schedule, previewIntervals, RATING } from "./srs.js";
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
import { itemTypeOf } from "./itemTypes.js";
import QuestionRenderer from "./QuestionRenderer.jsx";

// Renders a single question and everything a study session needs around
// it — SRS rating, community answer-choice stats, prediction recording,
// and reporting — shared by every study mode (MCQ Practice's SRS review,
// Quick 10, Timed Quiz, Custom Quiz, Weakest-Area Quiz). Answering a
// question here always records the same real signals (SRS schedule,
// itemStats, the prediction log) regardless of which mode launched it, so
// every mode automatically feeds the same analytics/weak-area/
// recommendation calculations MCQ Practice already did.
export default function QuestionSessionView({ q, progress, onUpdateCard, position, onAnswered, onRated, onExit, user }) {
  const itemType = itemTypeOf(q);
  const isMcq = itemType === "multiple_choice";
  const display = useMemo(() => (isMcq ? randomizePresentation(q) : null), [q, isMcq]);
  const [stats, setStats] = useState(null);
  const [selectedDisplayIdx, setSelectedDisplayIdx] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    ensureExposed(progress, q.id, onUpdateCard);
    if (Array.isArray(q.choices)) getItemStats(q).then(setStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  const predictedPct = useMemo(() => estimatePredictedProb(stats, null), [stats]);

  const commitAnswer = (correct, response) => {
    onAnswered(correct);
    const cs = progress[q.id] || blankCardState();
    onUpdateCard(q.id, {
      ...cs,
      answered: (cs.answered || 0) + 1,
      answeredCorrect: (cs.answeredCorrect || 0) + (correct ? 1 : 0),
    });
    recordResponse(q, response, correct, user);
    recordPrediction(user, {
      questionId: q.id,
      domain: q.domain,
      level: q.level,
      predictedPct,
      actualCorrect: correct,
    });
  };

  const choose = (i) => {
    if (revealed) return;
    setSelectedDisplayIdx(i);
    setRevealed(true);
    const canonicalIdx = display.toCanonical[i];
    const correct = canonicalIdx === q.answerIndex;
    commitAnswer(correct, canonicalIdx);
  };

  const onNonMcqAnswered = (correct, response) => {
    setRevealed(true);
    commitAnswer(correct, response);
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
  const pcts = isMcq && revealed && stats ? choicePercentages(stats, q.choices.length) : null;
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
        {isMcq ? (
          <>
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
          </>
        ) : (
          <QuestionRenderer question={q} showExplanation={false} onAnswered={onNonMcqAnswered} />
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
  const [status, setStatus] = useState(null);

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
