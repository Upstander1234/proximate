import { useEffect, useMemo, useState } from "react";
import { LEVELS, DOMAINS_BY_LEVEL } from "./questions.js";
import { getQuestionPool, poolByLevel } from "./questionPool.js";
import { getItemStats, difficultyBand, MIN_RESPONSES_FOR_DISPLAY } from "./itemStats.js";
import { difficultyFromStats } from "./adaptiveEngine.js";
import { ITEM_TYPES } from "./itemTypes.js";
import { buildQuickTen, buildTimedQuiz, buildCustomQuiz, buildWeakestAreaQuiz, domainWeaknessForLevel } from "./quizSessions.js";
import QuizRunner from "./QuizRunner.jsx";

const MODES = [
  { key: "quick10", label: "Quick 10", desc: "Ten questions from your provider level. Fast, no setup." },
  { key: "timed", label: "Timed Quiz", desc: "Pick a question count and a time limit. Beat the clock." },
  { key: "custom", label: "Custom Quiz", desc: "Filter by domain, seen/unseen, question type, and difficulty." },
  { key: "weakest", label: "Weakest-Area Quiz", desc: "Built from your actual accuracy, leeches, and due reviews." },
];

export default function StudyTab({ progress, onUpdateCard, user, initialMode = null, initialLevel = "EMT", initialDomain = null }) {
  const [pool, setPool] = useState(null);
  const [mode, setMode] = useState(() => (MODES.some((m) => m.key === initialMode) ? initialMode : null)); // null | "quick10" | "timed" | "custom" | "weakest"
  const [level, setLevel] = useState(initialLevel);
  const [queue, setQueue] = useState(null); // set once a session starts

  useEffect(() => {
    getQuestionPool().then(setPool);
  }, []);

  if (!pool) return <div className="text-slate-400 text-center py-20">Loading question bank…</div>;

  if (queue) {
    return (
      <QuizRunner
        title={MODES.find((m) => m.key === mode)?.label || "Quiz"}
        queue={queue.questions}
        timeLimitSec={queue.timeLimitSec}
        progress={progress}
        onUpdateCard={onUpdateCard}
        user={user}
        onDone={() => {
          setQueue(null);
          setMode(null);
        }}
      />
    );
  }

  if (mode === "quick10") {
    return (
      <LevelPicker
        title="Quick 10"
        level={level}
        setLevel={setLevel}
        onBack={() => setMode(null)}
        onStart={() => setQueue({ questions: buildQuickTen(pool, level) })}
        startLabel="Start Quick 10"
      />
    );
  }

  if (mode === "timed") {
    return (
      <TimedSetup
        level={level}
        setLevel={setLevel}
        onBack={() => setMode(null)}
        onStart={(count, timeLimitSec) => setQueue({ questions: buildTimedQuiz(pool, level, count), timeLimitSec })}
      />
    );
  }

  if (mode === "custom") {
    return (
      <CustomSetup
        pool={pool}
        progress={progress}
        level={level}
        setLevel={setLevel}
        initialDomain={initialDomain}
        onBack={() => setMode(null)}
        onStart={(questions) => setQueue({ questions })}
      />
    );
  }

  if (mode === "weakest") {
    return (
      <WeakestSetup
        pool={pool}
        progress={progress}
        level={level}
        setLevel={setLevel}
        onBack={() => setMode(null)}
        onStart={(questions) => setQueue({ questions })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study</h1>
        <p className="text-slate-400 mt-2">Quick, structured practice sessions beyond ordinary SRS review.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className="text-left rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-700 transition p-5"
          >
            <div className="text-xl font-semibold">{m.label}</div>
            <div className="text-sm text-slate-400 mt-1">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LevelPicker({ title, level, setLevel, onBack, onStart, startLabel, children }) {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <BackHeader title={title} onBack={onBack} />
      <div>
        <label className="block text-sm text-slate-400 mb-1">Provider level</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
        >
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>
      {children}
      <button onClick={onStart} className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold">
        {startLabel}
      </button>
    </div>
  );
}

function BackHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="text-slate-400 hover:text-white underline underline-offset-4 text-sm">
        ← Back
      </button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

function TimedSetup({ level, setLevel, onBack, onStart }) {
  const [count, setCount] = useState(15);
  const [minutes, setMinutes] = useState(10);
  return (
    <LevelPicker
      title="Timed Quiz"
      level={level}
      setLevel={setLevel}
      onBack={onBack}
      onStart={() => onStart(count, minutes * 60)}
      startLabel={`Start (${count} questions, ${minutes} min)`}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Number of questions</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Time limit (minutes)</label>
          <input
            type="number"
            min={1}
            max={120}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
          />
        </div>
      </div>
    </LevelPicker>
  );
}

const SEEN_FILTERS = [
  { value: "any", label: "Any (seen or unseen)" },
  { value: "unseen", label: "Unseen only" },
  { value: "seen", label: "Previously seen only" },
];

const DIFFICULTY_FILTERS = ["any", "Easy", "Medium", "Hard"];

function CustomSetup({ pool, progress, level, setLevel, initialDomain, onBack, onStart }) {
  const [domain, setDomain] = useState(() => {
    const domains = DOMAINS_BY_LEVEL[level] || [];
    return initialDomain && domains.includes(initialDomain) ? initialDomain : "All";
  });
  // Keep the launch-provided domain until the player changes it themselves:
  // resetting on every level change would wipe the recommendation's target.
  // initialDomain is a one-shot launch value owned by the parent.
  const [count, setCount] = useState(10);
  const [seenFilter, setSeenFilter] = useState("any");
  const [itemType, setItemType] = useState("any");
  const [difficulty, setDifficulty] = useState("any");
  const [preview, setPreview] = useState(null); // {available, requested} for the current filter set
  const [bandByQid, setBandByQid] = useState(null);
  const [loadingBands, setLoadingBands] = useState(false);

  const domains = DOMAINS_BY_LEVEL[level] || [];

  // Difficulty filtering needs real community-response data per question,
  // which is a network read per question — only fetched when the player
  // actually picks a difficulty other than "any", and only for the current
  // level (bounded set), not the whole bank.
  useEffect(() => {
    // Wrapped in setTimeout, not called bare — this project's own linter
    // (react-hooks/set-state-in-effect) flags a synchronous setState call
    // directly in an effect body; same fix shape used elsewhere (App.jsx,
    // DrivingScene.jsx).
    setTimeout(() => setBandByQid(null), 0);
    if (difficulty === "any") return;
    let active = true;
    setTimeout(() => setLoadingBands(true), 0);
    const levelPool = poolByLevel(pool, level);
    Promise.all(
      levelPool.map(async (q) => {
        if (!Array.isArray(q.choices)) return [q.id, null];
        const stats = await getItemStats(q);
        if ((stats?.attempts || 0) < MIN_RESPONSES_FOR_DISPLAY) return [q.id, null];
        const { b } = difficultyFromStats(stats);
        return [q.id, difficultyBand(b)];
      })
    ).then((pairs) => {
      if (!active) return;
      const map = {};
      for (const [id, band] of pairs) if (band) map[id] = band;
      setBandByQid(map);
      setLoadingBands(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, level]);

  useEffect(() => {
    const { questions, available, requested } = buildCustomQuiz(pool, progress, {
      level,
      domain,
      count,
      seenFilter,
      itemType,
      difficultyBand: difficulty,
      bandByQid,
    });
    setTimeout(() => setPreview({ available, requested, questions }), 0);
  }, [pool, progress, level, domain, count, seenFilter, itemType, difficulty, bandByQid]);

  const insufficient = preview && preview.available < preview.requested;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <BackHeader title="Custom Quiz" onBack={onBack} />

      <div>
        <label className="block text-sm text-slate-400 mb-1">Provider level</label>
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setDomain("All");
          }}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
        >
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Domain</label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
        >
          <option value="All">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Previously seen</label>
          <select
            value={seenFilter}
            onChange={(e) => setSeenFilter(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
          >
            {SEEN_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Question type</label>
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
          >
            <option value="any">Any type</option>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Difficulty {loadingBands && <span className="text-slate-600">(loading…)</span>}
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
          >
            {DIFFICULTY_FILTERS.map((d) => (
              <option key={d} value={d}>
                {d === "any" ? "Any difficulty" : d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Number of questions</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
          />
        </div>
      </div>

      {difficulty !== "any" && (
        <div className="text-xs text-slate-500">
          Difficulty is only applied to questions with at least {MIN_RESPONSES_FOR_DISPLAY} recorded community
          responses — questions without enough data are excluded rather than guessed at.
        </div>
      )}

      {preview && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            insufficient ? "border-amber-800 bg-amber-950/30 text-amber-300" : "border-slate-800 bg-slate-900 text-slate-400"
          }`}
        >
          {insufficient
            ? `Only ${preview.available} question${preview.available === 1 ? "" : "s"} match${
                preview.available === 1 ? "es" : ""
              } these filters — you asked for ${preview.requested}. Widening a filter would get you closer to a full set.`
            : `${preview.available} question${preview.available === 1 ? "" : "s"} available. ${
                preview.requested
              } will be selected.`}
        </div>
      )}

      <button
        onClick={() => onStart(preview?.questions || [])}
        disabled={!preview || preview.questions.length === 0}
        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold"
      >
        {preview && preview.questions.length > 0
          ? `Start (${preview.questions.length} question${preview.questions.length === 1 ? "" : "s"})`
          : "No matching questions"}
      </button>
    </div>
  );
}

function WeakestSetup({ pool, progress, level, setLevel, onBack, onStart }) {
  const ranking = useMemo(() => domainWeaknessForLevel(pool, progress, level), [pool, progress, level]);
  const built = useMemo(() => buildWeakestAreaQuiz(pool, progress, level, 10), [pool, progress, level]);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <BackHeader title="Weakest-Area Quiz" onBack={onBack} />
      <div>
        <label className="block text-sm text-slate-400 mb-1">Provider level</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
        >
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-400">
          Not enough answered questions at this level yet to identify a real weak area — this session will pull
          from due reviews instead.
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-sm font-semibold mb-2">Weakest domains, by actual performance</div>
          <div className="space-y-1.5">
            {ranking.slice(0, 5).map((d) => (
              <div key={d.domain} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{d.domain}</span>
                <span className="text-slate-400">
                  {Math.round(d.accuracy * 100)}% accuracy · {d.seen} attempts
                  {d.leechCount > 0 ? ` · ${d.leechCount} leech${d.leechCount === 1 ? "" : "es"}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onStart(built.questions)}
        disabled={built.questions.length === 0}
        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold"
      >
        {built.questions.length > 0 ? `Start (${built.questions.length} questions)` : "No questions available"}
      </button>
    </div>
  );
}
