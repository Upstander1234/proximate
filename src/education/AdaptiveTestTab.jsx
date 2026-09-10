import { useMemo, useState } from "react";
import { getQuestionPool, poolByLevel } from "./questionPool.js";
import { getItemStats, recordResponse, choicePercentages, MIN_RESPONSES_FOR_DISPLAY } from "./itemStats.js";
import { randomizePresentation } from "./randomize.js";
import { ensureExposed, isExposed } from "./exposure.js";
import { schedule } from "./srs.js";
import {
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  itemParams,
  estimateAbility,
  readinessFromTheta,
  meetsStoppingConfidence,
  selectNextItem,
} from "./adaptiveEngine.js";
import { BLUEPRINT_CATEGORIES, blueprintCategoryOf } from "./contentBlueprint.js";

const LEVEL = "EMT"; // EMT-B only, this release

// Pure decision function: given the exam's current state, decide what
// happens next — stop with results, notify the bank is exhausted, or
// select and return the next question. Kept free of React state so it can
// be called both right after a fresh load (before setState has committed)
// and from ordinary event handlers (after it has) without ever reading a
// stale closure.
function computeNext({ pool, itemStatsById, administered, ability, domainCounts, exhaustedNoticeShown, everSeen }) {
  const administeredIds = new Set(administered.map((a) => a.question.id));
  const n = administered.length;

  if (n >= MAX_QUESTIONS) return { type: "results", reason: "max" };
  if (n >= MIN_QUESTIONS && meetsStoppingConfidence(ability.se)) return { type: "results", reason: "confidence" };

  const neverSeenAvailable = pool.some((q) => !administeredIds.has(q.id) && !everSeen.has(q.id));
  if (!neverSeenAvailable && !exhaustedNoticeShown) return { type: "exhausted" };

  const q = selectNextItem({
    pool,
    itemStatsById,
    administeredIds,
    everSeenIds: everSeen,
    theta: ability.theta,
    domainCounts,
    questionNumber: n + 1,
    allowReuse: true,
  });

  if (!q) return { type: "results", reason: n >= MIN_QUESTIONS ? "confidence" : "max" };

  const stats = itemStatsById.get(q.id);
  const params = itemParams(q, stats);
  const display = randomizePresentation(q);
  return { type: "question", current: { question: q, display, params, statsSnapshot: stats } };
}

export default function AdaptiveTestTab({ progress, onUpdateCard, onOpenMethods }) {
  const [phase, setPhase] = useState("intro"); // intro | loading | exam | exhaustedNotice | results | review
  const [pool, setPool] = useState(null);
  const [itemStatsById, setItemStatsById] = useState(null);
  const [administered, setAdministered] = useState([]); // full record per item, for review
  const [ability, setAbility] = useState({ theta: 0, se: 1 });
  const [domainCounts, setDomainCounts] = useState({});
  const [current, setCurrent] = useState(null); // { question, display, params }
  const [selectedDisplayIdx, setSelectedDisplayIdx] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [exhaustedNoticeShown, setExhaustedNoticeShown] = useState(false);
  const [stoppedReason, setStoppedReason] = useState(null); // "confidence" | "max"
  const [reviewIdx, setReviewIdx] = useState(0);

  function everSeenIds(administeredList) {
    const s = new Set(administeredList.map((a) => a.question.id));
    for (const id in progress) if (isExposed(progress, id)) s.add(id);
    return s;
  }

  function applyNext(action) {
    if (action.type === "results") {
      setStoppedReason(action.reason);
      setPhase("results");
    } else if (action.type === "exhausted") {
      setExhaustedNoticeShown(true);
      setPhase("exhaustedNotice");
    } else {
      setCurrent(action.current);
      setSelectedDisplayIdx(null);
      setRevealed(false);
      ensureExposed(progress, action.current.question.id, onUpdateCard);
    }
  }

  const startExam = async () => {
    setPhase("loading");
    const full = await getQuestionPool();
    const levelPool = poolByLevel(full, LEVEL);
    const statsMap = new Map();
    for (const q of levelPool) {
      statsMap.set(q.id, await getItemStats(q));
    }
    setPool(levelPool);
    setItemStatsById(statsMap);
    setAdministered([]);
    setAbility({ theta: 0, se: 1 });
    setDomainCounts({});
    setExhaustedNoticeShown(false);
    setStoppedReason(null);
    setPhase("exam");
    applyNext(
      computeNext({
        pool: levelPool,
        itemStatsById: statsMap,
        administered: [],
        ability: { theta: 0, se: 1 },
        domainCounts: {},
        exhaustedNoticeShown: false,
        everSeen: everSeenIds([]),
      })
    );
  };

  function choose(displayIdx) {
    if (revealed || !current) return;
    setSelectedDisplayIdx(displayIdx);
    setRevealed(true);

    const canonicalIdx = current.display.toCanonical[displayIdx];
    const correct = canonicalIdx === current.question.answerIndex;

    recordResponse(current.question, canonicalIdx, correct);

    const prevCard = progress[current.question.id];
    const nextCard = schedule(prevCard, correct ? 4 : 1);
    onUpdateCard(current.question.id, { ...nextCard, exposed: true });

    const record = {
      question: current.question,
      display: current.display,
      params: current.params,
      statsSnapshot: current.statsSnapshot,
      selectedCanonicalIndex: canonicalIdx,
      correct,
      category: blueprintCategoryOf(current.question),
    };

    const newAdministered = [...administered, record];
    const responses = newAdministered.map((r) => ({ a: r.params.a, b: r.params.b, correct: r.correct }));
    const nextAbility = estimateAbility(responses);
    const nextDomainCounts = { ...domainCounts, [record.category]: (domainCounts[record.category] || 0) + 1 };

    setAdministered(newAdministered);
    setAbility(nextAbility);
    setDomainCounts(nextDomainCounts);
  }

  function continueAfterExhausted() {
    setPhase("exam");
    applyNext(
      computeNext({ pool, itemStatsById, administered, ability, domainCounts, exhaustedNoticeShown, everSeen: everSeenIds(administered) })
    );
  }

  function next() {
    setCurrent(null);
    applyNext(
      computeNext({ pool, itemStatsById, administered, ability, domainCounts, exhaustedNoticeShown, everSeen: everSeenIds(administered) })
    );
  }

  if (phase === "intro") return <Intro onStart={startExam} onOpenMethods={onOpenMethods} />;
  if (phase === "loading") return <Centered>Loading the question bank…</Centered>;

  if (phase === "exhaustedNotice") {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="text-2xl font-semibold">You've completed the available question bank!</div>
        <p className="text-slate-400 max-w-md mx-auto">
          Nice work — you've now seen every eligible question currently in Proximate's bank. The exam will
          continue using the best available questions, some of which you may see again, so it can keep
          measuring your ability accurately. New questions (including manually-approved community
          submissions) will show up automatically in future exams as the bank grows.
        </p>
        <button
          onClick={continueAfterExhausted}
          className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium"
        >
          Continue the exam
        </button>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <Results
        administered={administered}
        ability={ability}
        stoppedReason={stoppedReason}
        onReview={() => {
          setReviewIdx(0);
          setPhase("review");
        }}
        onRestart={() => setPhase("intro")}
        onOpenMethods={onOpenMethods}
      />
    );
  }

  if (phase === "review") {
    return (
      <Review
        administered={administered}
        idx={reviewIdx}
        setIdx={setReviewIdx}
        onDone={() => setPhase("results")}
      />
    );
  }

  // phase === "exam"
  if (!current) return <Centered>Selecting the next question…</Centered>;

  return (
    <ExamQuestion
      current={current}
      questionNumber={administered.length + 1}
      selectedDisplayIdx={selectedDisplayIdx}
      revealed={revealed}
      onChoose={choose}
      onNext={next}
    />
  );
}

function Centered({ children }) {
  return <div className="text-slate-400 text-center py-20">{children}</div>;
}

function Intro({ onStart, onOpenMethods }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Adaptive Practice Exam</h1>
        <p className="text-slate-400 mt-2">
          An NREMT-inspired computerized adaptive practice exam for EMT-B. Questions are selected one at a
          time based on your estimated ability, so far-too-easy or far-too-hard questions are avoided
          automatically.
        </p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3 text-sm text-slate-300">
        <Row label={`${MIN_QUESTIONS}–${MAX_QUESTIONS} questions`}>
          The exam never ends before {MIN_QUESTIONS} questions and never exceeds {MAX_QUESTIONS}.
        </Row>
        <Row label="Confidence-based length">
          Once {MIN_QUESTIONS} questions are answered, the exam may end early if your ability estimate has
          reached a 99% confidence threshold — tighter than the 95% band often associated with NREMT-style
          CAT, since Proximate's questions aren't guaranteed equivalent to real NREMT items.
        </Row>
        <Row label="Full review afterward">
          You'll be able to review every question you saw, not just the ones you missed.
        </Row>
        <Row label="An educational estimate, not an official score">
          Your result is Proximate's own estimated EMT readiness — not an NREMT score, prediction, or
          guarantee of passing.
        </Row>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={onOpenMethods}
          className="text-sm text-slate-400 hover:text-white underline underline-offset-4"
        >
          How does this work?
        </button>
        <button
          onClick={onStart}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold"
        >
          Start adaptive exam
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <div className="font-medium text-slate-100">{label}</div>
      <div className="text-slate-400">{children}</div>
    </div>
  );
}

function ExamQuestion({ current, questionNumber, selectedDisplayIdx, revealed, onChoose, onNext }) {
  const { question, display, statsSnapshot } = current;
  const stats = statsSnapshot;
  const enoughData = (stats?.attempts || 0) >= MIN_RESPONSES_FOR_DISPLAY;
  const pcts = revealed ? choicePercentages(stats, question.choices.length) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Question {questionNumber} <span className="text-slate-600">·</span> {question.domain}
        </span>
        <span>
          {questionNumber >= MIN_QUESTIONS ? "eligible to conclude" : `min. ${MIN_QUESTIONS} questions`}
        </span>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="text-lg font-medium mb-4">{question.question}</div>
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
                onClick={() => onChoose(i)}
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
          <div className="text-sm text-slate-300">{question.explanation}</div>
          <button onClick={onNext} className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium">
            Next question
          </button>
        </div>
      )}
    </div>
  );
}

function Results({ administered, ability, stoppedReason, onReview, onRestart, onOpenMethods }) {
  const correct = administered.filter((a) => a.correct).length;
  const total = administered.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const readiness = readinessFromTheta(ability.theta);
  const ciHalfwidth = (2.576 * ability.se).toFixed(2);

  const byCategory = useMemo(() => {
    const m = {};
    for (const cat of BLUEPRINT_CATEGORIES) m[cat.key] = { correct: 0, total: 0, label: cat.label };
    for (const a of administered) {
      const c = m[a.category];
      if (!c) continue;
      c.total += 1;
      if (a.correct) c.correct += 1;
    }
    return m;
  }, [administered]);

  const domainStats = Object.values(byCategory)
    .filter((c) => c.total > 0)
    .map((c) => ({ ...c, pct: Math.round((c.correct / c.total) * 100) }))
    .sort((x, y) => x.pct - y.pct);

  const weakest = domainStats.slice(0, Math.min(2, domainStats.length));
  const strongest = domainStats.slice(-Math.min(2, domainStats.length)).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam complete</h1>
        <p className="text-slate-400 mt-1">
          {stoppedReason === "max"
            ? `Reached the maximum of ${MAX_QUESTIONS} questions without a stable 99% confidence estimate — this is a normal outcome, not an error.`
            : "Ended once your ability estimate reached Proximate's 99% confidence threshold."}
        </p>
      </div>

      <div className="rounded-xl border border-emerald-700 bg-emerald-950/40 p-5 text-center">
        <div className="text-4xl font-bold">{readiness}%</div>
        <div className="text-sm text-emerald-300 mt-1">Estimated EMT Readiness</div>
        <div className="text-xs text-slate-400 mt-2">
          Proximate's own educational practice metric — not an official NREMT score, prediction, or
          guarantee of passing.
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <Stat label="Questions" value={total} />
        <Stat label="Correct" value={correct} />
        <Stat label="Incorrect" value={total - correct} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        <div>
          Ability estimate (theta): <span className="font-mono">{ability.theta.toFixed(2)}</span>
        </div>
        <div>
          99% confidence interval: ± <span className="font-mono">{ciHalfwidth}</span>
        </div>
      </div>

      {domainStats.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="font-semibold">Performance by domain</div>
          {domainStats.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{d.label}</span>
              <span className="text-slate-400">
                {d.correct}/{d.total} · {d.pct}%
              </span>
            </div>
          ))}
        </div>
      )}

      {(weakest.length > 0 || strongest.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="font-semibold text-emerald-400 mb-1">Strongest areas</div>
            {strongest.map((d) => (
              <div key={d.label} className="text-sm text-slate-300">
                {d.label} ({d.pct}%)
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="font-semibold text-amber-400 mb-1">Recommended for further study</div>
            {weakest.map((d) => (
              <div key={d.label} className="text-sm text-slate-300">
                {d.label} ({d.pct}%)
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={onReview} className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium">
          Review every question
        </button>
        <button onClick={onRestart} className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium">
          New exam
        </button>
        <button
          onClick={onOpenMethods}
          className="px-5 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300"
        >
          How this was calculated
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function Review({ administered, idx, setIdx, onDone }) {
  const r = administered[idx];
  if (!r) return null;
  const stats = r.statsSnapshot;
  const enoughData = (stats?.attempts || 0) >= MIN_RESPONSES_FOR_DISPLAY;
  const pcts = choicePercentages(stats, r.question.choices.length);
  const difficultyLabel = r.params.b < -0.4 ? "Easier" : r.params.b > 0.4 ? "Harder" : "Medium";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onDone} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
          ← Back to results
        </button>
        <div className="text-sm text-slate-400">
          {idx + 1} / {administered.length}
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{r.question.domain}</span>
          <span className={r.correct ? "text-emerald-400" : "text-red-400"}>
            {r.correct ? "Correct" : "Incorrect"} · {difficultyLabel} · community difficulty
          </span>
        </div>
        <div className="text-lg font-medium">{r.question.question}</div>
        <div className="space-y-2">
          {r.question.choices.map((c, canonicalIdx) => {
            const isCorrect = canonicalIdx === r.question.answerIndex;
            const wasSelected = canonicalIdx === r.selectedCanonicalIndex;
            let cls = "border-slate-800 opacity-60";
            if (isCorrect) cls = "border-emerald-500 bg-emerald-950/40";
            else if (wasSelected) cls = "border-red-500 bg-red-950/30";
            return (
              <div key={canonicalIdx} className={`px-4 py-3 rounded-lg border ${cls} flex items-center justify-between gap-4`}>
                <span>{c}</span>
                <span className="text-xs text-slate-400 shrink-0">{enoughData ? `${pcts[canonicalIdx]}%` : "—"}</span>
              </div>
            );
          })}
        </div>
        {!enoughData && (
          <div className="text-xs text-slate-500">Answer-choice percentages are based on limited data.</div>
        )}
        <div className="text-sm text-slate-300 border-t border-slate-800 pt-3">{r.question.explanation}</div>
      </div>

      <div className="flex gap-2">
        <button
          disabled={idx === 0}
          onClick={() => setIdx((i) => i - 1)}
          className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 font-medium"
        >
          ← Previous
        </button>
        <button
          disabled={idx === administered.length - 1}
          onClick={() => setIdx((i) => i + 1)}
          className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
