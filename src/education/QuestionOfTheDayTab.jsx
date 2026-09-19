import { useEffect, useMemo, useState } from "react";
import { getQuestionPool } from "./questionPool.js";
import { randomizePresentation } from "./randomize.js";
import { recordResponse } from "./itemStats.js";
import { questionForDate, todaysQotdAttempt, recordQotdAttempt, computeStreak, loadQotdLog } from "./qotd.js";

export default function QuestionOfTheDayTab({ user }) {
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priorAttempt, setPriorAttempt] = useState(null);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    getQuestionPool().then(setPool);
  }, []);

  useEffect(() => {
    Promise.all([todaysQotdAttempt(user), loadQotdLog(user)]).then(([attempt, log]) => {
      setPriorAttempt(attempt);
      setStreak(computeStreak(log));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todaysQuestion = useMemo(() => (pool ? questionForDate(pool) : null), [pool]);
  const display = useMemo(() => (todaysQuestion ? randomizePresentation(todaysQuestion) : null), [todaysQuestion]);

  if (!pool || loading) return <div className="text-slate-400 text-center py-20">Loading…</div>;

  if (!todaysQuestion) {
    return <div className="text-slate-400 text-center py-20">No question bank available yet.</div>;
  }

  const finished = !!priorAttempt || revealed;

  const choose = (i) => {
    if (revealed || priorAttempt) return;
    setSelectedIdx(i);
    setRevealed(true);
    const canonicalIdx = display.toCanonical[i];
    const isCorrect = canonicalIdx === todaysQuestion.answerIndex;
    setCorrect(isCorrect);
    recordResponse(todaysQuestion, canonicalIdx, isCorrect, user);
    recordQotdAttempt(user, { questionId: todaysQuestion.id, correct: isCorrect }).then(() => {
      loadQotdLog(user).then((log) => setStreak(computeStreak(log)));
    });
  };

  const alreadyCorrect = priorAttempt ? priorAttempt.correct : correct;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Question of the Day</h1>
        <p className="text-slate-400 mt-1">One question, the same for everyone, once a day.</p>
      </div>

      <div className="flex justify-center gap-4 text-center">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
          <div className="text-xl font-bold">{streak.current}</div>
          <div className="text-xs text-slate-500">Current streak</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
          <div className="text-xl font-bold">{streak.best}</div>
          <div className="text-xs text-slate-500">Best streak</div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="text-xs text-slate-500 mb-2">{todaysQuestion.domain}</div>
        <div className="text-lg font-medium mb-4">{todaysQuestion.question}</div>
        <div className="space-y-2">
          {display.displayChoices.map((c, i) => {
            let cls = "border-slate-700 hover:border-slate-500";
            if (finished) {
              if (i === display.displayAnswerIndex) cls = "border-emerald-500 bg-emerald-950/40";
              else if (!priorAttempt && i === selectedIdx) cls = "border-red-500 bg-red-950/30";
              else cls = "border-slate-800 opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={finished}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${cls}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {finished && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className={`text-lg font-semibold ${alreadyCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {alreadyCorrect ? "Correct!" : "Not quite."}
          </div>
          <div className="text-sm text-slate-300">{todaysQuestion.explanation}</div>
          <div className="text-xs text-slate-500">
            {priorAttempt
              ? "You already answered today's question. Come back tomorrow for a new one."
              : "Come back tomorrow for a new question."}
          </div>
        </div>
      )}
    </div>
  );
}
