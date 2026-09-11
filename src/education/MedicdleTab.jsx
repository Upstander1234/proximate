import { useEffect, useMemo, useState } from "react";
import { caseForDate, matchesDiagnosis } from "./medicdleData.js";
import { todaysAttempt, recordMedicdleAttempt } from "./eduMedicdle.js";

export default function MedicdleTab({ user }) {
  const todaysCase = useMemo(() => caseForDate(), []);
  const [loading, setLoading] = useState(true);
  const [priorAttempt, setPriorAttempt] = useState(null);
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [guesses, setGuesses] = useState([]);
  const [guessText, setGuessText] = useState("");
  const [solved, setSolved] = useState(false);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    todaysAttempt(user).then((a) => {
      setPriorAttempt(a);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="text-slate-400 text-center py-20">Loading…</div>;

  if (priorAttempt) {
    return <AlreadyPlayed caseObj={todaysCase} attempt={priorAttempt} />;
  }

  const revealMore = () => {
    setCluesRevealed((n) => Math.min(todaysCase.clues.length, n + 1));
  };

  const submitGuess = () => {
    const text = guessText.trim();
    if (!text) return;
    const correct = matchesDiagnosis(text, todaysCase);
    const nextGuesses = [...guesses, { text, correct }];
    setGuesses(nextGuesses);
    setGuessText("");
    if (correct) {
      setSolved(true);
      recordMedicdleAttempt(user, {
        caseId: todaysCase.id,
        guesses: nextGuesses,
        cluesRevealed,
        solved: true,
        timeMs: Date.now() - startedAt,
      });
    }
  };

  const giveUp = () => {
    setSolved(true);
    recordMedicdleAttempt(user, {
      caseId: todaysCase.id,
      guesses,
      cluesRevealed,
      solved: false,
      timeMs: Date.now() - startedAt,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Medicdle</h1>
        <p className="text-slate-400 mt-1">Reach a working diagnosis with as little information as possible.</p>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        {todaysCase.clues.slice(0, cluesRevealed).map((clue, i) => (
          <div key={i} className="text-sm text-slate-200">
            <span className="text-slate-500 mr-2">{i + 1}.</span>
            {clue}
          </div>
        ))}
        {!solved && cluesRevealed < todaysCase.clues.length && (
          <button
            onClick={revealMore}
            className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-4"
          >
            Reveal more information ({cluesRevealed}/{todaysCase.clues.length})
          </button>
        )}
      </div>

      {guesses.length > 0 && (
        <div className="space-y-1.5">
          {guesses.map((g, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-lg border ${
                g.correct ? "border-emerald-600 bg-emerald-950/30 text-emerald-300" : "border-slate-800 text-slate-400"
              }`}
            >
              {g.text} {g.correct ? "✓" : ""}
            </div>
          ))}
        </div>
      )}

      {!solved ? (
        <div className="flex gap-2">
          <input
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitGuess()}
            placeholder="Your working diagnosis…"
            className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
          />
          <button onClick={submitGuess} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium">
            Guess
          </button>
          <button onClick={giveUp} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">
            Give up
          </button>
        </div>
      ) : (
        <Solution caseObj={todaysCase} guesses={guesses} cluesRevealed={cluesRevealed} />
      )}
    </div>
  );
}

function Solution({ caseObj, guesses, cluesRevealed }) {
  const gotIt = guesses.some((g) => g.correct);
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
      <div className="text-lg font-semibold">
        {gotIt ? "Correct — " : "The diagnosis was — "}
        <span className="text-sky-400">{caseObj.diagnosis}</span>
      </div>
      <div className="text-sm text-slate-300">{caseObj.explanation}</div>
      <div className="text-xs text-slate-500">
        {gotIt
          ? `Solved with ${cluesRevealed}/${caseObj.clues.length} clues revealed, in ${guesses.length} guess${
              guesses.length === 1 ? "" : "es"
            }.`
          : "Come back tomorrow for a new case."}
      </div>
    </div>
  );
}

function AlreadyPlayed({ caseObj, attempt }) {
  return (
    <div className="max-w-xl mx-auto space-y-5 text-center py-10">
      <h1 className="text-3xl font-bold">Medicdle</h1>
      <p className="text-slate-400">You've already played today's case. Come back tomorrow for a new one.</p>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3 text-left">
        <div className="text-lg font-semibold">
          {attempt.solved ? "Solved — " : "Not solved — "}
          <span className="text-sky-400">{caseObj.diagnosis}</span>
        </div>
        <div className="text-sm text-slate-300">{caseObj.explanation}</div>
        <div className="text-xs text-slate-500">
          {attempt.solved
            ? `Solved with ${attempt.cluesRevealed}/${caseObj.clues.length} clues revealed, in ${attempt.guesses.length} guess${
                attempt.guesses.length === 1 ? "" : "es"
              }.`
            : `${attempt.guesses.length} guess${attempt.guesses.length === 1 ? "" : "es"} made.`}
        </div>
      </div>
    </div>
  );
}
