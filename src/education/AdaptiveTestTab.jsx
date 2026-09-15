import { useEffect, useMemo, useState } from "react";
import { getQuestionPool, poolByLevel } from "./questionPool.js";
import { getItemStats, recordResponse, choicePercentages, MIN_RESPONSES_FOR_DISPLAY } from "./itemStats.js";
import { randomizePresentation } from "./randomize.js";
import { ensureExposed, isExposed } from "./exposure.js";
import { schedule, RATING } from "./srs.js";
import { loadExamState, saveExamState } from "./examStore.js";
import { loadProfile } from "./profile.js";
import {
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  itemParams,
  estimateAbility,
  readinessFromTheta,
  meetsStoppingConfidence,
  selectNextItem,
  computeBlueprintProgress,
} from "./adaptiveEngine.js";
import {
  BLUEPRINT_LEVELS,
  blueprintCategoryOf,
  clinicalJudgmentOf,
  filterValidForBlueprint,
  summarizeCategoryPerformance,
  summarizeClinicalJudgment,
} from "./contentBlueprint.js";
import { incrementGlobalCounter } from "./globalStats.js";
import { itemTypeOf } from "./itemTypes.js";
import QuestionRenderer from "./QuestionRenderer.jsx";

// Which certification level's blueprint governs the exam. Selected from
// the user's own saved provider level (profile.js) — see resolveExamLevel
// below — falling back to EMT for anyone without one of the four levels
// this project has a real NREMT blueprint for (a Layperson/RN/Physician/
// etc. profile, or no profile at all, e.g. a guest). This is a genuinely
// different concept from itemStats.js's own LEVEL_RUNG (which weights
// COMMUNITY response data by provider level) — this one selects WHICH
// question bank and WHICH blueprint the adaptive exam itself uses.
const SUPPORTED_EXAM_LEVELS = BLUEPRINT_LEVELS; // ["EMR","EMT","AEMT","Paramedic"]
const DEFAULT_EXAM_LEVEL = "EMT";

function resolveExamLevel(profile) {
  return SUPPORTED_EXAM_LEVELS.includes(profile?.providerLevel) ? profile.providerLevel : DEFAULT_EXAM_LEVEL;
}

// Clinical-judgment exposure count, derived ENTIRELY from this exam's own
// administered-item records — never from SRS/practice history. Returns 0
// for a level with no clinical-judgment dimension, which is harmless
// (computeBlueprintProgress simply won't have a clinicalJudgment row to
// compare it against).
function cjPresentedCount(administeredList) {
  return administeredList.reduce((n, r) => n + (r.clinicalJudgment === true ? 1 : 0), 0);
}

// Fetches community item stats for every question in the pool concurrently
// rather than one at a time — sequential awaits here used to mean one full
// round trip per question (over a thousand for the EMT bank), which is
// slow even on a healthy connection and can hang the whole exam load if
// any single request is slow.
async function loadStatsMap(levelPool) {
  const entries = await Promise.all(levelPool.map(async (q) => [q.id, await getItemStats(q)]));
  return new Map(entries);
}

// Pure decision function: given the exam's current state, decide what
// happens next — stop with results, notify the bank is exhausted, or
// select and return the next question. Kept free of React state so it can
// be called both right after a fresh load (before setState has committed)
// and from ordinary event handlers (after it has) without ever reading a
// stale closure.
function computeNext({ pool, itemStatsById, administered, ability, level, domainCounts, exhaustedNoticeShown, everSeen }) {
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
    level,
    domainCounts,
    clinicalJudgmentPresented: cjPresentedCount(administered),
    questionNumber: n + 1,
    allowReuse: true,
  });

  if (!q) return { type: "results", reason: n >= MIN_QUESTIONS ? "confidence" : "max" };

  const stats = itemStatsById.get(q.id);
  const params = itemParams(q, stats);
  // Only multiple_choice needs a pre-computed display order here — its
  // shuffle has to stay identical across a save/resume round-trip
  // (persisted below in snapshotForSave). Every other item type's own
  // QuestionRenderer randomizes its own presentation independently on
  // mount, so `display` is simply unused for those (a fresh shuffle on
  // resume is a harmless cosmetic difference, not a correctness one).
  const display = itemTypeOf(q) === "multiple_choice" ? randomizePresentation(q) : null;
  // `attemptSeq` is frozen at SELECTION time (administered.length is a
  // snapshot here, not a live reference) — it must NOT be re-derived from
  // `administered.length` at render time, since that count changes the
  // MOMENT this very question gets answered (commitAnswer pushes the new
  // record before the player advances), which would change a key derived
  // from it mid-flight and remount the question out from under its own
  // just-set reveal state. See the ExamQuestion key comment at its call
  // site for the full trace of the bug this fixes.
  return { type: "question", current: { question: q, display, params, statsSnapshot: stats, attemptSeq: n } };
}

// A plain, JSON-serializable snapshot of everything needed to resume this
// exact attempt later — reconstructed against a freshly-loaded pool/stats
// map on resume, never trusted as-is (a question could theoretically have
// been retired from the bank between sessions).
function snapshotForSave({ revealMode, administered, ability, level, domainCounts, exhaustedNoticeShown, current, selectedDisplayIdx, answered, revealed }) {
  return {
    v: 2,
    revealMode,
    level,
    administered: administered.map((r) => ({
      questionId: r.question.id,
      display: r.display,
      params: r.params,
      // `selectedCanonicalIndex` (multiple_choice-only, kept for saved-
      // snapshot backward compatibility) and `response` (every item
      // type's own generic response shape — see evaluateResponse.js — for
      // multiple_choice these are literally the same value) are both
      // stored; resumeExam reads response first, falling back to
      // selectedCanonicalIndex for an older saved attempt that predates
      // this field.
      selectedCanonicalIndex: r.selectedCanonicalIndex,
      response: r.response,
      correct: r.correct,
      category: r.category,
      clinicalJudgment: r.clinicalJudgment ?? null,
    })),
    ability,
    domainCounts,
    exhaustedNoticeShown,
    current: current
      ? { questionId: current.question.id, display: current.display, params: current.params, attemptSeq: current.attemptSeq }
      : null,
    selectedDisplayIdx,
    answered,
    revealed,
    savedAt: Date.now(),
  };
}

export default function AdaptiveTestTab({ progress, onUpdateCard, onOpenMethods, user }) {
  const [phase, setPhase] = useState("intro"); // intro | loading | exam | exhaustedNotice | results | review
  const [pool, setPool] = useState(null);
  const [itemStatsById, setItemStatsById] = useState(null);
  const [administered, setAdministered] = useState([]); // full record per item, for review
  const [ability, setAbility] = useState({ theta: 0, se: 1 });
  const [domainCounts, setDomainCounts] = useState({});
  const [current, setCurrent] = useState(null); // { question, display, params }
  const [selectedDisplayIdx, setSelectedDisplayIdx] = useState(null);
  const [answered, setAnswered] = useState(false); // a choice has been locked in for the CURRENT question
  const [revealed, setRevealed] = useState(false); // correctness is actually being SHOWN right now
  const [revealMode, setRevealMode] = useState("immediate"); // "immediate" | "deferred"
  const [exhaustedNoticeShown, setExhaustedNoticeShown] = useState(false);
  const [stoppedReason, setStoppedReason] = useState(null); // "confidence" | "max"
  const [reviewIdx, setReviewIdx] = useState(0);
  const [savedExam, setSavedExam] = useState(null);
  const [examLevel, setExamLevel] = useState(null); // locked in at start/resume; null before then
  const [profileLevel, setProfileLevel] = useState(DEFAULT_EXAM_LEVEL); // detected only, for the Intro screen

  // Check for a saved in-progress attempt once, on mount / when the user
  // changes (e.g. guest -> signed in) — surfaced as a "Resume" option on
  // the intro screen rather than silently auto-resumed, since the player
  // may genuinely want a fresh attempt instead.
  useEffect(() => {
    if (!user) return;
    let active = true;
    loadExamState(user).then((s) => {
      if (active) setSavedExam(s);
    });
    return () => {
      active = false;
    };
  }, [user]);

  // Which certification level's blueprint the NEXT new exam would use —
  // shown on the Intro screen so the player knows what they're about to
  // start. The level actually locked in for a given attempt (examLevel) is
  // resolved fresh at startExam()/resumeExam() time and doesn't change
  // mid-attempt even if the player's profile changes later.
  useEffect(() => {
    let active = true;
    // loadProfile(null) safely resolves to null, so no branching is needed
    // here — resolveExamLevel already falls back to DEFAULT_EXAM_LEVEL for
    // a null/guest/unsupported profile.
    loadProfile(user).then((p) => {
      if (active) setProfileLevel(resolveExamLevel(p));
    });
    return () => {
      active = false;
    };
  }, [user]);

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
      setAnswered(false);
      setRevealed(false);
      ensureExposed(progress, action.current.question.id, onUpdateCard);
    }
  }

  const startExam = async () => {
    setPhase("loading");
    const profile = user ? await loadProfile(user).catch(() => null) : null;
    const level = resolveExamLevel(profile);
    const full = await getQuestionPool();
    // filterValidForBlueprint excludes anything the blueprint engine can't
    // safely reason about (unknown domain for this level, malformed
    // clinicalJudgment value, etc.) — see contentBlueprint.js. It never
    // touches MCQ Practice's own pool, only the adaptive exam's.
    const levelPool = filterValidForBlueprint(poolByLevel(full, level));
    const statsMap = await loadStatsMap(levelPool);
    setExamLevel(level);
    setPool(levelPool);
    setItemStatsById(statsMap);
    setAdministered([]);
    setAbility({ theta: 0, se: 1 });
    setDomainCounts({});
    setExhaustedNoticeShown(false);
    setStoppedReason(null);
    if (user) saveExamState(user, null); // starting fresh discards any old saved attempt
    setSavedExam(null);
    setPhase("exam");
    applyNext(
      computeNext({
        pool: levelPool,
        itemStatsById: statsMap,
        administered: [],
        ability: { theta: 0, se: 1 },
        level,
        domainCounts: {},
        exhaustedNoticeShown: false,
        everSeen: everSeenIds([]),
      })
    );
  };

  // Reconstructs a saved attempt against a freshly-loaded pool. A question
  // that's since been retired from the bank is simply dropped from the
  // rebuilt `administered` list (its answer no longer means anything
  // without the question itself) — a rare, honest degradation rather than
  // a crash.
  const resumeExam = async (saved) => {
    setPhase("loading");
    // A pre-blueprint (v1) saved attempt has no `level` field — fall back
    // to EMT, the only level any pre-existing saved attempt could ever
    // have been (adaptive exam was EMT-only before this feature).
    const level = SUPPORTED_EXAM_LEVELS.includes(saved.level) ? saved.level : DEFAULT_EXAM_LEVEL;
    const full = await getQuestionPool();
    const levelPool = filterValidForBlueprint(poolByLevel(full, level));
    const byId = new Map(levelPool.map((q) => [q.id, q]));
    const statsMap = await loadStatsMap(levelPool);

    const rebuilt = [];
    for (const r of saved.administered) {
      const q = byId.get(r.questionId);
      if (!q) continue;
      rebuilt.push({
        question: q,
        display: r.display,
        params: r.params,
        statsSnapshot: statsMap.get(q.id),
        selectedCanonicalIndex: r.selectedCanonicalIndex,
        response: r.response ?? r.selectedCanonicalIndex,
        correct: r.correct,
        category: r.category,
        clinicalJudgment: r.clinicalJudgment ?? clinicalJudgmentOf(q),
      });
    }

    setExamLevel(level);
    setPool(levelPool);
    setItemStatsById(statsMap);
    setAdministered(rebuilt);
    setAbility(saved.ability);
    setDomainCounts(saved.domainCounts);
    setExhaustedNoticeShown(saved.exhaustedNoticeShown);
    setRevealMode(saved.revealMode === "deferred" ? "deferred" : "immediate");
    setStoppedReason(null);

    // If the in-flight question was ALREADY committed to `administered`
    // before the save happened (answered but not yet advanced past —
    // reachable for a non-MCQ item, whose QuestionRenderer resets to a
    // fresh, unanswered UI state on remount regardless of the parent's own
    // `answered`/`revealed` flags, unlike the native MCQ path's disabled
    // buttons), restoring it as `current` would let the player submit it
    // a SECOND time and double-count it in the ability/blueprint totals.
    // Treat it the same as a retired question — already accounted for,
    // fall through to picking a fresh one.
    const alreadyAdministered = saved.current && rebuilt.some((r) => r.question.id === saved.current.questionId);
    const savedCurrentQ = saved.current && !alreadyAdministered ? byId.get(saved.current.questionId) : null;
    if (savedCurrentQ) {
      setCurrent({
        question: savedCurrentQ,
        display: saved.current.display,
        params: saved.current.params,
        statsSnapshot: statsMap.get(savedCurrentQ.id),
        // `rebuilt.length` at this point is exactly how many questions
        // were already administered before this still-in-progress one —
        // the same frozen-at-selection-time semantics computeNext's own
        // `attemptSeq` uses.
        attemptSeq: saved.current.attemptSeq ?? rebuilt.length,
      });
      setSelectedDisplayIdx(saved.selectedDisplayIdx);
      setAnswered(!!saved.answered);
      setRevealed(!!saved.revealed);
      setPhase("exam");
    } else {
      // The in-flight question is gone (or there wasn't one) — pick a new one.
      setPhase("exam");
      applyNext(
        computeNext({
          pool: levelPool,
          itemStatsById: statsMap,
          administered: rebuilt,
          ability: saved.ability,
          level,
          domainCounts: saved.domainCounts,
          exhaustedNoticeShown: saved.exhaustedNoticeShown,
          everSeen: everSeenIds(rebuilt),
        })
      );
    }
  };

  const discardSavedExam = () => {
    if (user) saveExamState(user, null);
    setSavedExam(null);
  };

  // Autosave: debounced inside examStore.js itself, so this just needs to
  // fire on every state change that matters while an attempt is actually
  // in progress. Runs during "exam" and "exhaustedNotice" only — nothing
  // to save before a question has been selected, and results/review are
  // terminal states with the saved attempt already cleared below.
  useEffect(() => {
    if (!user) return;
    if (phase !== "exam" && phase !== "exhaustedNotice") return;
    if (!current && administered.length === 0) return; // nothing has happened yet
    saveExamState(
      user,
      snapshotForSave({ revealMode, administered, ability, level: examLevel, domainCounts, exhaustedNoticeShown, current, selectedDisplayIdx, answered, revealed })
    );
  }, [phase, administered, ability, examLevel, domainCounts, exhaustedNoticeShown, current, selectedDisplayIdx, answered, revealed, revealMode, user]);

  // Shared by every item type: SRS scheduling, the administered-record
  // ledger, and the running IRT ability estimate. recordResponse
  // (itemStats.js) is itemType-aware — it records attempts/correct for
  // EVERY type (the one thing adaptiveEngine.js's own IRT difficulty
  // estimation, itemParams/difficultyFromStats, actually needs — both are
  // already itemType-agnostic) and only adds a per-choice breakdown where
  // `response` maps to real canonical choice indices.
  function commitAnswer(correct, response, canonicalIdx) {
    if (!current) return;
    recordResponse(current.question, response, correct, user);

    const prevCard = progress[current.question.id];
    // The adaptive test only knows right/wrong, not the player's own felt
    // difficulty, so it maps onto Good/Again rather than ever claiming Easy.
    const nextCard = schedule(prevCard, correct ? RATING.GOOD : RATING.AGAIN);
    onUpdateCard(current.question.id, {
      ...nextCard,
      exposed: true,
      // Real answer-correctness ledger, independent of the SRS rating above
      // — see srs.js's own header note on why `correct`/`wrong` alone are
      // not a valid personal-accuracy signal.
      answered: (prevCard?.answered || 0) + 1,
      answeredCorrect: (prevCard?.answeredCorrect || 0) + (correct ? 1 : 0),
    });

    const record = {
      question: current.question,
      display: current.display,
      params: current.params,
      statsSnapshot: current.statsSnapshot,
      selectedCanonicalIndex: typeof canonicalIdx === "number" ? canonicalIdx : null,
      response,
      correct,
      category: blueprintCategoryOf(current.question, examLevel),
      // true/false/null (unclassified) — see contentBlueprint.js's own
      // clinicalJudgmentOf docs. Captured at answer time so the results
      // screen never has to re-derive it from a possibly-since-changed
      // question object.
      clinicalJudgment: clinicalJudgmentOf(current.question),
    };

    const newAdministered = [...administered, record];
    const responses = newAdministered.map((r) => ({ a: r.params.a, b: r.params.b, correct: r.correct }));
    const nextAbility = estimateAbility(responses);
    const nextDomainCounts = { ...domainCounts, [record.category]: (domainCounts[record.category] || 0) + 1 };

    setAdministered(newAdministered);
    setAbility(nextAbility);
    setDomainCounts(nextDomainCounts);
  }

  // multiple_choice — the native inline UI's own click handler (unchanged
  // interaction, still index-based since it drives selectedDisplayIdx/
  // revealed for the existing immediate-vs-deferred styling below).
  function choose(displayIdx) {
    if (answered || !current) return;
    setSelectedDisplayIdx(displayIdx);
    setAnswered(true);
    setRevealed(revealMode === "immediate");
    const canonicalIdx = current.display.toCanonical[displayIdx];
    const correct = canonicalIdx === current.question.answerIndex;
    commitAnswer(correct, canonicalIdx, canonicalIdx);
  }

  // Every non-MCQ item type — QuestionRenderer already resolved
  // correctness and its own canonical response shape internally.
  function answerGeneric(correct, response) {
    if (answered) return;
    setAnswered(true);
    commitAnswer(correct, response, undefined);
  }

  function finish(reason) {
    if (user) saveExamState(user, null); // the attempt is over — clear the saved snapshot
    incrementGlobalCounter("totalExamsCompleted");
    setStoppedReason(reason);
    setPhase("results");
  }

  function continueAfterExhausted() {
    setPhase("exam");
    const action = computeNext({ pool, itemStatsById, administered, ability, level: examLevel, domainCounts, exhaustedNoticeShown, everSeen: everSeenIds(administered) });
    if (action.type === "results") finish(action.reason);
    else applyNext(action);
  }

  function next() {
    setCurrent(null);
    const action = computeNext({ pool, itemStatsById, administered, ability, level: examLevel, domainCounts, exhaustedNoticeShown, everSeen: everSeenIds(administered) });
    if (action.type === "results") finish(action.reason);
    else applyNext(action);
  }

  if (phase === "intro") {
    return (
      <Intro
        onStart={startExam}
        onOpenMethods={onOpenMethods}
        revealMode={revealMode}
        setRevealMode={setRevealMode}
        savedExam={savedExam}
        profileLevel={profileLevel}
        onResume={() => savedExam && resumeExam(savedExam)}
        onDiscardSaved={discardSavedExam}
      />
    );
  }
  if (phase === "loading") return <Centered>Loading the question bank…</Centered>;

  if (phase === "exhaustedNotice") {
    return (
      <ExamShell
        questionNumber={administered.length}
        onSaveExit={() => setPhase("intro")}
      >
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
      </ExamShell>
    );
  }

  if (phase === "results") {
    return (
      <Results
        administered={administered}
        ability={ability}
        level={examLevel || profileLevel}
        stoppedReason={stoppedReason}
        revealMode={revealMode}
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
  return (
    <ExamShell questionNumber={administered.length + (current ? 1 : 0)} onSaveExit={() => setPhase("intro")}>
      {!current ? (
        <Centered>Selecting the next question…</Centered>
      ) : (
        <ExamQuestion
          // A real bug, found via live click-through (not theorized): React
          // 18 batches `next()`'s setCurrent(null) + setCurrent(newQuestion)
          // into a single commit, so this component never actually
          // unmounts between questions — without a key tied to the
          // question itself, QuestionRenderer's own internal `revealed`
          // state (and every subtype's own selection state) LEAKED from
          // the just-answered question into the next one, rendering it
          // already "revealed"/incorrect before the player touched
          // anything. MCQPracticeTab.jsx never hit this because its own
          // <QuestionView key={q.id}> already keys one level up. Matches
          // that same precedent here.
          // Keyed on question id ALONE is not enough: a long exam
          // legitimately REUSES the same question id more than once
          // (selectNextItem's own three-tier never-seen/seen-elsewhere/
          // in-exam-repeat fallback), and a repeat with the SAME id would
          // keep the SAME key, so the stale "already revealed/answered"
          // state from its first encounter would leak into the second
          // encounter the same way. Folding in `administered.length` (a
          // fresh, ever-increasing count at the moment each new question
          // is selected) guarantees a distinct key for every
          // ADMINISTRATION, not just every distinct question — found via
          // live click-through hitting this exact repeat case, not
          // theorized.
          key={`${current.question.id}-${current.attemptSeq}`}
          current={current}
          questionNumber={administered.length + 1}
          selectedDisplayIdx={selectedDisplayIdx}
          answered={answered}
          revealed={revealed}
          revealMode={revealMode}
          onChoose={choose}
          onAnswerGeneric={answerGeneric}
          onNext={next}
        />
      )}
      {import.meta.env.DEV && examLevel && (
        <BlueprintDebugPanel
          level={examLevel}
          domainCounts={domainCounts}
          clinicalJudgmentPresented={cjPresentedCount(administered)}
          questionsAdministered={administered.length}
          ability={ability}
        />
      )}
    </ExamShell>
  );
}

// Development-only: exposes the raw blueprint/ability state driving
// selection — target/current/min/max per category, projected final
// distribution, clinical-judgment target/current/projected, and the
// running ability/difficulty estimate. Never rendered outside DEV builds
// (see import.meta.env.DEV above) — this is deliberately NOT surfaced to
// normal users, per the "a developer/debug view is sufficient" requirement.
function BlueprintDebugPanel({ level, domainCounts, clinicalJudgmentPresented, questionsAdministered, ability }) {
  const [open, setOpen] = useState(false);
  const progress = useMemo(
    () => computeBlueprintProgress({ level, domainCounts, clinicalJudgmentPresented, questionsAdministered }),
    [level, domainCounts, clinicalJudgmentPresented, questionsAdministered]
  );
  const pct = (x) => `${Math.round(x * 100)}%`;
  return (
    <div className="mt-4 rounded-lg border border-amber-800 bg-amber-950/20 text-xs text-amber-200">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left px-3 py-2 font-mono">
        [DEV] blueprint debug ({level}) {open ? "▲" : "▼"}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 font-mono">
          <div>ability theta={ability.theta.toFixed(3)} se={ability.se.toFixed(3)}</div>
          <div>assumed final exam length: {progress.estimatedTotalLength}</div>
          <table className="w-full text-left">
            <thead className="text-amber-400/70">
              <tr>
                <th className="pr-2">category</th>
                <th className="pr-2">have</th>
                <th className="pr-2">min/target/max</th>
                <th className="pr-2">projected</th>
                <th>status</th>
              </tr>
            </thead>
            <tbody>
              {progress.categories.map((c) => (
                <tr key={c.key}>
                  <td className="pr-2">{c.label}</td>
                  <td className="pr-2">
                    {c.have} ({pct(c.havePct)})
                  </td>
                  <td className="pr-2">
                    {pct(c.min)}/{pct(c.target)}/{pct(c.max)}
                  </td>
                  <td className="pr-2">{pct(c.projectedPct)}</td>
                  <td className={c.projectedUnderMin || c.projectedOverMax ? "text-red-400" : "text-emerald-400"}>
                    {!c.canStillReachMin ? "URGENT" : c.projectedUnderMin ? "under" : c.projectedOverMax ? "over" : "ok"}
                  </td>
                </tr>
              ))}
              {progress.clinicalJudgment && (
                <tr className="border-t border-amber-900/50">
                  <td className="pr-2">{progress.clinicalJudgment.label}</td>
                  <td className="pr-2">
                    {progress.clinicalJudgment.have} ({pct(progress.clinicalJudgment.havePct)})
                  </td>
                  <td className="pr-2">
                    {pct(progress.clinicalJudgment.min)}/{pct(progress.clinicalJudgment.target)}/{pct(progress.clinicalJudgment.max)}
                  </td>
                  <td className="pr-2">{pct(progress.clinicalJudgment.projectedPct)}</td>
                  <td
                    className={
                      progress.clinicalJudgment.projectedUnderMin || progress.clinicalJudgment.projectedOverMax
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  >
                    {!progress.clinicalJudgment.canStillReachMin
                      ? "URGENT"
                      : progress.clinicalJudgment.projectedUnderMin
                        ? "under"
                        : progress.clinicalJudgment.projectedOverMax
                          ? "over"
                          : "ok"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Centered({ children }) {
  return <div className="text-slate-400 text-center py-20">{children}</div>;
}

// A full-viewport overlay so the in-progress exam reads as its own
// dedicated, distraction-free session rather than one more tab inside the
// study app — the same "feels like an exam" request this shell exists to
// satisfy. Progress is autosaved continuously (see the effect in the
// parent), so "Save & exit" never needs to warn about losing anything —
// it just leaves; the intro screen will offer to resume next time.
function ExamShell({ children, questionNumber, onSaveExit }) {
  const pct = Math.min(100, Math.round((questionNumber / MIN_QUESTIONS) * 100));
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 min-h-full flex flex-col">
        <div className="flex items-center justify-between gap-4 mb-3">
          <button
            onClick={onSaveExit}
            className="text-sm text-slate-400 hover:text-white underline underline-offset-4 shrink-0"
          >
            ← Save &amp; exit
          </button>
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-sky-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 shrink-0">Autosaved</div>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

function Intro({ onStart, onOpenMethods, revealMode, setRevealMode, savedExam, profileLevel, onResume, onDiscardSaved }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Adaptive Practice Exam</h1>
        <p className="text-slate-400 mt-2">
          An NREMT-inspired computerized adaptive practice exam for {profileLevel}. Questions are selected
          one at a time based on your estimated ability and how well the exam so far matches the real
          NREMT {profileLevel} content blueprint, so far-too-easy or far-too-hard questions, and badly
          lopsided content coverage, are both avoided automatically.
        </p>
      </div>

      {savedExam && (
        <div className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-medium text-amber-300">You have an exam in progress</div>
            <div className="text-sm text-slate-400">
              {savedExam.administered.length} question{savedExam.administered.length === 1 ? "" : "s"} answered so
              far · saved {timeAgo(savedExam.savedAt)}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onDiscardSaved} className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white">
              Discard
            </button>
            <button onClick={onResume} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-medium text-sm">
              Resume exam
            </button>
          </div>
        </div>
      )}

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
        <Row label="Saves automatically">
          Your attempt is saved as you go. Close the tab or hit "Save &amp; exit" any time — it'll be waiting
          for you here.
        </Row>
        <Row label="An educational estimate, not an official score">
          Your result is Proximate's own estimated EMT readiness — not an NREMT score, prediction, or
          guarantee of passing.
        </Row>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="font-medium text-slate-100">When should you see whether you got a question right?</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <RevealOption
            active={revealMode === "immediate"}
            onClick={() => setRevealMode("immediate")}
            title="Show answers immediately"
            desc="See whether you were correct, the explanation, and community answer stats right after each question."
          />
          <RevealOption
            active={revealMode === "deferred"}
            onClick={() => setRevealMode("deferred")}
            title="Save answers until the end"
            desc="Answer every question in a row, exam-style, with no feedback — then review everything at once when you're done."
          />
        </div>
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
          Start {savedExam ? "new " : ""}adaptive exam
        </button>
      </div>
    </div>
  );
}

function RevealOption({ active, onClick, title, desc }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border p-3 transition ${
        active ? "border-sky-500 bg-sky-950/40" : "border-slate-700 hover:border-slate-500"
      }`}
    >
      <div className={`font-medium ${active ? "text-sky-300" : "text-slate-200"}`}>{title}</div>
      <div className="text-xs text-slate-400 mt-1">{desc}</div>
    </button>
  );
}

function timeAgo(ts) {
  if (!ts) return "recently";
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) === 1 ? "" : "s"} ago`;
}

function Row({ label, children }) {
  return (
    <div>
      <div className="font-medium text-slate-100">{label}</div>
      <div className="text-slate-400">{children}</div>
    </div>
  );
}

function ExamQuestion({ current, questionNumber, selectedDisplayIdx, answered, revealed, revealMode, onChoose, onAnswerGeneric, onNext }) {
  const { question, display, statsSnapshot } = current;
  const stats = statsSnapshot;
  const isMcq = itemTypeOf(question) === "multiple_choice";
  const enoughData = (stats?.attempts || 0) >= MIN_RESPONSES_FOR_DISPLAY;
  const pcts = isMcq && revealed ? choicePercentages(stats, question.choices.length) : null;
  const deferred = revealMode === "deferred";

  const header = (
    <div className="flex items-center justify-between text-sm text-slate-400">
      <span>Question {questionNumber}</span>
      <span>
        {questionNumber >= MIN_QUESTIONS ? "eligible to conclude" : `min. ${MIN_QUESTIONS} questions`}
      </span>
    </div>
  );

  if (!isMcq) {
    // Non-MCQ item types render through the shared QuestionRenderer,
    // which handles its own submit/scoring flow and deferred-mode
    // correctness suppression internally (see its own header) — this
    // component only supplies the "Next question" button as its children,
    // the same shared-control-flow division MCQPracticeTab.jsx already
    // uses.
    return (
      <div className="space-y-5" data-testid="exam-question">
        {header}
        <QuestionRenderer question={question} deferred={deferred} onAnswered={onAnswerGeneric}>
          <button onClick={onNext} className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium">
            Next question
          </button>
        </QuestionRenderer>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="exam-question">
      {header}

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="text-lg font-medium mb-4">{question.question}</div>
        <div className="space-y-2">
          {display.displayChoices.map((c, i) => {
            let cls = "border-slate-700 hover:border-slate-500";
            if (revealed) {
              if (i === display.displayAnswerIndex) cls = "border-emerald-500 bg-emerald-950/40";
              else if (i === selectedDisplayIdx) cls = "border-red-500 bg-red-950/30";
              else cls = "border-slate-800 opacity-60";
            } else if (answered) {
              // Deferred mode: acknowledge the pick without giving away
              // correctness — a neutral "this is what you chose" state.
              cls = i === selectedDisplayIdx ? "border-slate-400 bg-slate-800" : "border-slate-800 opacity-50";
            }
            return (
              <button
                key={i}
                data-testid={`exam-mc-option-${i}`}
                onClick={() => onChoose(i)}
                disabled={answered}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${cls} ${answered ? "cursor-default" : ""}`}
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

      {answered && deferred && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="text-sm text-slate-400">Answer recorded. You'll see how you did once the exam is over.</div>
          <button onClick={onNext} className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium">
            Next question
          </button>
        </div>
      )}
    </div>
  );
}

function Results({ administered, ability, level, stoppedReason, revealMode, onReview, onRestart, onOpenMethods }) {
  const correct = administered.filter((a) => a.correct).length;
  const total = administered.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const readiness = readinessFromTheta(ability.theta);
  const ciHalfwidth = (2.576 * ability.se).toFixed(2);

  // Performance by content category — computed from THIS exam's own
  // administered records only (never SRS/practice history). Only a
  // category with enough administered questions (MIN_SAMPLE_FOR_ASSESSMENT)
  // is eligible to be called "weakest"/"strongest" — a category simply
  // getting fewer questions must never, on its own, read as a weakness.
  // Exposure (how many questions) and performance (accuracy on them) are
  // reported as two separate things throughout.
  const domainStats = useMemo(() => summarizeCategoryPerformance(administered, level), [administered, level]);
  const assessable = domainStats.filter((c) => c.sufficientData).sort((x, y) => x.pct - y.pct);
  const weakest = assessable.slice(0, Math.min(2, assessable.length));
  const strongest = assessable.slice(-Math.min(2, assessable.length)).reverse();
  const lowExposure = domainStats.filter((c) => c.total > 0 && !c.sufficientData);

  const cj = useMemo(() => summarizeClinicalJudgment(administered, level), [administered, level]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam complete</h1>
        <p className="text-slate-400 mt-1">
          {stoppedReason === "max"
            ? `Reached the maximum of ${MAX_QUESTIONS} questions without a stable 99% confidence estimate — this is a normal outcome, not an error.`
            : "Ended once your ability estimate reached Proximate's 99% confidence threshold."}
        </p>
        {revealMode === "deferred" && (
          <p className="text-slate-400 mt-1">You chose to save answers until the end — that's below, in review.</p>
        )}
      </div>

      <div className="rounded-xl border border-emerald-700 bg-emerald-950/40 p-5 text-center">
        <div className="text-4xl font-bold">{readiness}%</div>
        <div className="text-sm text-emerald-300 mt-1">Estimated {level} Readiness</div>
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

      {domainStats.some((c) => c.total > 0) && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="font-semibold">Performance by content area ({level} blueprint)</div>
          {domainStats
            .filter((c) => c.total > 0)
            .map((d) => (
              <div key={d.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{d.label}</span>
                <span className="text-slate-400">
                  {d.correct}/{d.total} questions{d.sufficientData ? ` · ${d.pct}% correct` : " · not enough data yet"}
                </span>
              </div>
            ))}
        </div>
      )}

      {cj && cj.presented > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="font-semibold">Clinical Judgment</div>
          <p className="text-xs text-slate-500">
            A cross-cutting skill, not a content area — every Clinical Judgment question below still also
            counted toward its own content area's exposure above.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Overall</span>
            <span className="text-slate-400">
              {cj.correct}/{cj.presented} questions{cj.sufficientData ? ` · ${cj.accuracy}% correct` : " · not enough data yet"}
            </span>
          </div>
          {cj.byCategory
            .filter((c) => c.clinicalJudgment.presented > 0 && c.factual.presented > 0)
            .map((c) => (
              <div key={c.key} className="text-sm">
                <div className="text-slate-300">{c.label}</div>
                <div className="text-slate-500 text-xs mt-0.5">
                  Factual: {c.factual.sufficientData ? `${c.factual.pct}%` : "limited data"} · Clinical Judgment:{" "}
                  {c.clinicalJudgment.sufficientData ? `${c.clinicalJudgment.pct}%` : "limited data"}
                  {c.factual.sufficientData &&
                    c.clinicalJudgment.sufficientData &&
                    c.factual.pct - c.clinicalJudgment.pct >= 15 && (
                      <span className="text-amber-400"> — strong recall, weaker clinical judgment here</span>
                    )}
                </div>
              </div>
            ))}
        </div>
      )}

      {(weakest.length > 0 || strongest.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="font-semibold text-emerald-400 mb-1">Strongest areas</div>
            {strongest.map((d) => (
              <div key={d.key} className="text-sm text-slate-300">
                {d.label} ({d.pct}%)
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="font-semibold text-amber-400 mb-1">Recommended for further study</div>
            {weakest.map((d) => (
              <div key={d.key} className="text-sm text-slate-300">
                {d.label} ({d.pct}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {lowExposure.length > 0 && (
        <p className="text-xs text-slate-500">
          {lowExposure.map((d) => d.label).join(", ")} {lowExposure.length === 1 ? "had" : "each had"} too few
          questions this attempt to fairly judge as a strength or weakness — that's a difference in exposure, not a
          sign of poor performance.
        </p>
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
  const isMcq = itemTypeOf(r.question) === "multiple_choice";
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
          <span>
            {r.question.domain}
            {r.clinicalJudgment === true && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                Clinical Judgment
              </span>
            )}
          </span>
          <span className={r.correct ? "text-emerald-400" : "text-red-400"}>
            {r.correct ? "Correct" : "Incorrect"} · {difficultyLabel} · community difficulty
          </span>
        </div>
        <div className="text-lg font-medium">{r.question.question}</div>
        {isMcq ? <McqReviewAnswers r={r} /> : <GenericReviewAnswers r={r} />}
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

// The original MCQ review view, unchanged — community answer-choice
// percentages, colored correct/incorrect.
function McqReviewAnswers({ r }) {
  const stats = r.statsSnapshot;
  const enoughData = (stats?.attempts || 0) >= MIN_RESPONSES_FOR_DISPLAY;
  const pcts = choicePercentages(stats, r.question.choices.length);
  return (
    <>
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
      {!enoughData && <div className="text-xs text-slate-500">Answer-choice percentages are based on limited data.</div>}
    </>
  );
}

// Non-MCQ review — community per-choice stats aren't generalized to these
// types yet (see itemStats.js's own remaining-work note, same limitation
// MCQPracticeTab.jsx already documents), so this shows the answer key
// itself: the correct answer plus, where the candidate's own response
// diverged from it, what they actually picked. `r.response` is the
// canonical response evaluateResponse.js scored this record against —
// see AdaptiveTestTab.jsx's own commitAnswer/snapshotForSave.
function GenericReviewAnswers({ r }) {
  const { question: q, response } = r;
  const type = itemTypeOf(q);

  if (type === "multiple_response") {
    const correct = new Set(q.correctIndices || []);
    const picked = new Set(Array.isArray(response) ? response : []);
    return (
      <div className="space-y-2">
        {q.choices.map((c, i) => {
          const isCorrect = correct.has(i);
          const wasPicked = picked.has(i);
          let cls = "border-slate-800 opacity-60";
          if (isCorrect) cls = "border-emerald-500 bg-emerald-950/40";
          else if (wasPicked) cls = "border-red-500 bg-red-950/30";
          return (
            <div key={i} className={`px-4 py-3 rounded-lg border ${cls} flex items-center justify-between gap-2`}>
              <span>{c}</span>
              {wasPicked && !isCorrect && <span className="text-xs text-red-400 shrink-0">your answer</span>}
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "build_list") {
    const respOrder = Array.isArray(response) ? response : [];
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">Correct sequence</div>
          <div className="space-y-1.5">
            {q.correctOrder.map((stepIdx, i) => (
              <div key={i} className="px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-950/20 text-sm">
                {i + 1}. {q.steps[stepIdx]}
              </div>
            ))}
          </div>
        </div>
        {!r.correct && respOrder.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 mb-1">Your sequence</div>
            <div className="space-y-1.5">
              {respOrder.map((stepIdx, i) => (
                <div key={i} className="px-3 py-2 rounded-lg border border-red-700 bg-red-950/10 text-sm">
                  {i + 1}. {q.steps[stepIdx]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "drag_drop") {
    const placement = response && typeof response === "object" ? response : {};
    return (
      <div className="grid sm:grid-cols-2 gap-2">
        {q.categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border border-slate-800 p-2">
            <div className="text-xs font-semibold text-slate-400 mb-1">{cat.label}</div>
            {q.items
              .filter((it) => it.correctCategory === cat.id)
              .map((it) => {
                const wasWrong = placement[it.id] && placement[it.id] !== it.correctCategory;
                return (
                  <div
                    key={it.id}
                    className={`text-xs px-2 py-1 rounded border mb-1 ${wasWrong ? "border-red-600 bg-red-950/20 text-red-300" : "border-emerald-700 bg-emerald-950/20"}`}
                  >
                    {it.label}
                    {wasWrong && (
                      <span className="ml-1 text-red-400">
                        (you placed in {q.categories.find((c) => c.id === placement[it.id])?.label})
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    );
  }

  if (type === "options_table") {
    const picks = response && typeof response === "object" ? response : {};
    return (
      <div className="space-y-2">
        {q.rows.map((row) => {
          const options = row.options || q.options || [];
          const yourPick = picks[row.id];
          const wasWrong = yourPick !== row.correctOptionIndex;
          return (
            <div key={row.id} className="px-4 py-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-sm">
              <span>{row.finding}</span>
              <span className={wasWrong ? "text-red-400" : "text-emerald-400"}>
                {options[row.correctOptionIndex]}
                {wasWrong && typeof yourPick === "number" && (
                  <span className="text-slate-500"> (you: {options[yourPick]})</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
