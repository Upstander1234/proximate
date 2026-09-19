import { useEffect, useMemo, useState } from "react";
import { caseForDate, dropdownOptionsFor, matchesCondition, conditionName, STAGES } from "./medicdleData.js";
import { todaysAttempt, recordMedicdleAttempt, recordMedicdleStart } from "./eduMedicdle.js";
import { fetchApprovedMedicdleCases } from "./medicdleSubmissions.js";
import { loadProfile } from "./profile.js";
import DiagnosisCombobox from "./DiagnosisCombobox.jsx";
import MedicdleCommunityStats from "./MedicdleCommunityStats.jsx";

// Earlier correct identification scores better. Stage 1 (Scene Size-Up) is
// worth the most; Stage 5 (In-Hospital Treatment) the least; an unsolved
// case scores 0.
const STAGE_POINTS = [5, 4, 3, 2, 1];

export default function MedicdleTab({ user, onOpenSubmit }) {
  const [loading, setLoading] = useState(true);
  const [todaysCase, setTodaysCase] = useState(null);
  const [providerLevel, setProviderLevel] = useState(null);
  const [priorAttempt, setPriorAttempt] = useState(null);
  const [stage, setStage] = useState(1); // 1-indexed, matches STAGES
  const [guesses, setGuesses] = useState([]); // [{stage, key, name, correct}]
  const [selectedKey, setSelectedKey] = useState("");
  const [solved, setSolved] = useState(false);
  const [solvedStage, setSolvedStage] = useState(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const options = useMemo(() => (todaysCase ? dropdownOptionsFor(todaysCase) : []), [todaysCase]);

  // The day's case is drawn from the built-in bank plus any APPROVED
  // community cases (medicdleSubmissions.js). Only approved submissions are
  // ever fetchable, so a pending or rejected one cannot reach this screen.
  useEffect(() => {
    let active = true;
    (async () => {
      const [communityCases, attempt, profile] = await Promise.all([
        fetchApprovedMedicdleCases(),
        todaysAttempt(user),
        loadProfile(user).catch(() => null),
      ]);
      if (!active) return;
      const c = caseForDate(new Date(), communityCases);
      setTodaysCase(c);
      setPriorAttempt(attempt);
      setProviderLevel(profile?.providerLevel || null);
      // A real "started" marker, once per player per day — this is what the
      // community completion rate is computed against. Never recorded for a
      // day the player has already finished.
      if (!attempt) recordMedicdleStart(user, c.id);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !todaysCase) return <div className="text-slate-400 text-center py-20">Loading…</div>;

  if (priorAttempt) {
    return (
      <AlreadyPlayed
        caseObj={todaysCase}
        attempt={priorAttempt}
        providerLevel={providerLevel}
        onOpenSubmit={onOpenSubmit}
      />
    );
  }

  const finished = solved || gaveUp;

  const submitGuess = () => {
    if (!selectedKey) return;
    const opt = options.find((o) => o.key === selectedKey);
    const correct = matchesCondition(selectedKey, todaysCase);
    const nextGuesses = [...guesses, { stage, key: selectedKey, name: opt?.name || selectedKey, correct }];
    setGuesses(nextGuesses);
    setSelectedKey("");

    if (correct) {
      setSolved(true);
      setSolvedStage(stage);
      recordMedicdleAttempt(user, {
        caseId: todaysCase.conditionKey,
        guesses: nextGuesses,
        stageSolved: stage,
        stageReached: stage,
        solved: true,
        timeMs: Date.now() - startedAt,
      });
      return;
    }

    if (stage >= STAGES.length) {
      // Final stage's guess was wrong — the case is over, unsolved.
      setGaveUp(true);
      recordMedicdleAttempt(user, {
        caseId: todaysCase.conditionKey,
        guesses: nextGuesses,
        stageSolved: null,
        stageReached: stage,
        solved: false,
        timeMs: Date.now() - startedAt,
      });
      return;
    }

    // Wrong guess, more clues remain — reveal the next stage.
    setStage((s) => s + 1);
  };

  const giveUp = () => {
    setGaveUp(true);
    recordMedicdleAttempt(user, {
      caseId: todaysCase.conditionKey,
      guesses,
      stageSolved: null,
      stageReached: stage,
      solved: false,
      timeMs: Date.now() - startedAt,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Education Medicdle</h1>
        <p className="text-slate-400 mt-1">
          Reach a working diagnosis with as little information as possible.
        </p>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        {STAGES.slice(0, finished ? STAGES.length : stage).map((label, i) => {
          const stageNum = i + 1;
          const revealed = finished || stageNum <= stage;
          if (!revealed) return null;
          return (
            <div key={label}>
              <div className="text-xs uppercase tracking-wide text-sky-500 font-semibold mb-1">
                Stage {stageNum}: {label}
              </div>
              <div className="text-sm text-slate-200">{todaysCase.stageClues[i]}</div>
            </div>
          );
        })}
      </div>

      {guesses.length > 0 && (
        <div className="space-y-1.5">
          {guesses.map((g, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-lg border ${
                g.correct
                  ? "border-emerald-600 bg-emerald-950/30 text-emerald-300"
                  : "border-slate-800 text-slate-400"
              }`}
            >
              Stage {g.stage}: {g.name} {g.correct ? "✓" : "✗"}
            </div>
          ))}
        </div>
      )}

      {!finished ? (
        <div className="flex gap-2">
          <DiagnosisCombobox key={stage} options={options} value={selectedKey} onChange={setSelectedKey} />
          <button
            onClick={submitGuess}
            disabled={!selectedKey}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-sm font-medium"
          >
            Guess
          </button>
          <button onClick={giveUp} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">
            Give up
          </button>
        </div>
      ) : (
        <Solution
          caseObj={todaysCase}
          guesses={guesses}
          solvedStage={solvedStage}
          providerLevel={providerLevel}
          onOpenSubmit={onOpenSubmit}
        />
      )}
    </div>
  );
}

function Solution({ caseObj, guesses, solvedStage, providerLevel, onOpenSubmit }) {
  const gotIt = solvedStage != null;
  const points = gotIt ? STAGE_POINTS[solvedStage - 1] : 0;
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        <div className="text-lg font-semibold">
          {gotIt ? "Correct — " : "The diagnosis was — "}
          <span className="text-sky-400">{conditionName(caseObj.conditionKey)}</span>
        </div>
        <div className="text-sm text-slate-300">{caseObj.explanation}</div>
        <div className="text-xs text-slate-500">
          {gotIt
            ? `Identified at Stage ${solvedStage} (${STAGES[solvedStage - 1]}) in ${guesses.length} guess${
                guesses.length === 1 ? "" : "es"
              } — ${points} point${points === 1 ? "" : "s"}.`
            : `Not identified in ${guesses.length} guess${guesses.length === 1 ? "" : "es"}. Come back tomorrow for a new case.`}
        </div>
        {caseObj.source === "community" && (
          <div className="text-xs text-emerald-400/80">
            Community-submitted case (reviewed and approved){caseObj.contributor ? ` — contributed by ${caseObj.contributor}` : ""}.
          </div>
        )}
      </div>

      <MedicdleCommunityStats
        caseId={caseObj.conditionKey}
        providerLevel={providerLevel}
        onOpenSubmit={onOpenSubmit}
      />
    </div>
  );
}

function AlreadyPlayed({ caseObj, attempt, providerLevel, onOpenSubmit }) {
  return (
    <div className="max-w-xl mx-auto space-y-5 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Education Medicdle</h1>
        <p className="text-slate-400">You've already played today's case. Come back tomorrow for a new one.</p>
      </div>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        <div className="text-lg font-semibold">
          {attempt.solved ? "Solved — " : "Not solved — "}
          <span className="text-sky-400">{conditionName(caseObj.conditionKey)}</span>
        </div>
        <div className="text-sm text-slate-300">{caseObj.explanation}</div>
        <div className="text-xs text-slate-500">
          {attempt.solved
            ? `Identified at Stage ${attempt.stageSolved} (${STAGES[attempt.stageSolved - 1]}) in ${
                attempt.guesses.length
              } guess${attempt.guesses.length === 1 ? "" : "es"}.`
            : `${attempt.guesses.length} guess${attempt.guesses.length === 1 ? "" : "es"} made.`}
        </div>
      </div>

      <MedicdleCommunityStats
        caseId={caseObj.conditionKey}
        providerLevel={providerLevel}
        onOpenSubmit={onOpenSubmit}
      />
    </div>
  );
}
