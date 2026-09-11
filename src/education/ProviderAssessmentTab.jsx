import { useEffect, useMemo, useState } from "react";
import { getQuestionPool } from "./questionPool.js";
import { buildAssessmentSet, computeAssessmentResult, DISCLAIMER } from "./assessment.js";
import { randomizePresentation } from "./randomize.js";
import { recordResponse } from "./itemStats.js";

export default function ProviderAssessmentTab({ user }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | results
  const [pool, setPool] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    getQuestionPool().then(setPool);
  }, []);

  const start = () => {
    const set = buildAssessmentSet(pool);
    setQuiz(set);
    setIdx(0);
    setResponses([]);
    setPhase("quiz");
  };

  if (phase === "intro") {
    return (
      <div className="max-w-xl mx-auto space-y-5 text-center py-10">
        <h1 className="text-3xl font-bold">Provider Level Assessment</h1>
        <p className="text-slate-400">
          A quick, adaptive-feeling quiz across EMR through Paramedic content. See where your knowledge
          currently sits, with a confidence score and a breakdown by domain.
        </p>
        <div className="text-xs text-amber-400 border border-amber-900 bg-amber-950/30 rounded-lg p-3 text-left">
          {DISCLAIMER}
        </div>
        <button
          onClick={start}
          disabled={!pool}
          className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 font-semibold"
        >
          {pool ? "Start assessment" : "Loading…"}
        </button>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = quiz[idx];
    if (!q) {
      const result = computeAssessmentResult(responses);
      return <Results result={result} onRestart={() => setPhase("intro")} />;
    }
    return (
      <AssessmentQuestion
        key={q.id}
        q={q}
        position={`${idx + 1} / ${quiz.length}`}
        user={user}
        onAnswered={(correct) => {
          setResponses((r) => [...r, { question: q, correct }]);
          setIdx((i) => i + 1);
        }}
      />
    );
  }

  return null;
}

function AssessmentQuestion({ q, position, user, onAnswered }) {
  const display = useMemo(() => randomizePresentation(q), [q]);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const choose = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    const canonicalIdx = display.toCanonical[i];
    const correct = canonicalIdx === q.answerIndex;
    recordResponse(q, canonicalIdx, correct, user);
    setTimeout(() => onAnswered(correct), 550);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{q.level}</span>
        <span>{position}</span>
      </div>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="text-lg font-medium mb-4">{q.question}</div>
        <div className="space-y-2">
          {display.displayChoices.map((c, i) => {
            let cls = "border-slate-700 hover:border-slate-500";
            if (revealed) {
              if (i === display.displayAnswerIndex) cls = "border-emerald-500 bg-emerald-950/40";
              else if (i === selected) cls = "border-red-500 bg-red-950/30";
              else cls = "border-slate-800 opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${cls}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Results({ result, onRestart }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="text-sm text-slate-400">Estimated level</div>
        <div className="text-4xl font-bold text-sky-400">{result.estimatedLevel}</div>
        <div className="text-slate-400">
          Confidence: <span className="text-slate-200 font-medium">{result.confidence}%</span>
        </div>
      </div>

      <div className="text-xs text-amber-400 border border-amber-900 bg-amber-950/30 rounded-lg p-3">
        {DISCLAIMER}
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="font-semibold mb-2">Performance by provider level</div>
        <div className="space-y-1.5">
          {Object.entries(result.perLevel).map(([lvl, v]) => (
            <div key={lvl} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{lvl}</span>
              <span className="text-slate-400">
                {v.correct}/{v.total} ({Math.round((v.correct / v.total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {(result.aboveAreas.length > 0 || result.belowAreas.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {result.aboveAreas.length > 0 && (
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-900 p-4">
              <div className="font-semibold text-emerald-300 mb-1">Above your estimated level</div>
              <div className="text-sm text-slate-300">{result.aboveAreas.join(", ")}</div>
            </div>
          )}
          {result.belowAreas.length > 0 && (
            <div className="rounded-xl bg-red-950/30 border border-red-900 p-4">
              <div className="font-semibold text-red-300 mb-1">Below your estimated level</div>
              <div className="text-sm text-slate-300">{result.belowAreas.join(", ")}</div>
            </div>
          )}
        </div>
      )}

      <button onClick={onRestart} className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium">
        Take it again
      </button>
    </div>
  );
}
