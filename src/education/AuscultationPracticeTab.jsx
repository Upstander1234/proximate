import { useMemo, useState } from "react";
import { HEART_SOUNDS, LUNG_SOUNDS, AUSC_BASE } from "../data/auscultationSounds.js";
import { reportingEnabled, submitClipReport, CLIP_REPORT_REASONS } from "./soundClipReports.js";

// Every recording the game's own stethoscope exam draws from (heart + lung,
// every category, every source), flattened into one quiz-able list. Built
// once from the same manifest the real AuscultationMinigame plays from —
// add a clip to genAusculManifest.mjs's output and it shows up here too,
// nothing to keep in sync by hand.
function buildAllClips() {
  const clips = [];
  for (const [category, list] of Object.entries(HEART_SOUNDS)) {
    for (const c of list) {
      clips.push({
        kind: "heart",
        category,
        id: c.id,
        loc: c.loc,
        src: c.src,
        url: `${AUSC_BASE}/${c.dir || "heart"}/${c.id}.wav`,
      });
    }
  }
  for (const [category, list] of Object.entries(LUNG_SOUNDS)) {
    for (const c of list) {
      clips.push({
        kind: "lung",
        category,
        id: c.id,
        loc: c.loc,
        src: c.src,
        url: `${AUSC_BASE}/${c.dir || "lung"}/${c.id}.wav`,
      });
    }
  }
  return clips;
}

const ALL_CLIPS = buildAllClips();
const HEART_CATEGORIES = Object.keys(HEART_SOUNDS);
const LUNG_CATEGORIES = Object.keys(LUNG_SOUNDS);

function shuffledOrder(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 4-choice MCQ: the real category plus 3 distractors drawn from the SAME
// instrument (heart vs lung) so the choices are never a trivial "is this
// even a heart sound" giveaway.
function buildChoices(clip) {
  const pool = (clip.kind === "heart" ? HEART_CATEGORIES : LUNG_CATEGORIES).filter((c) => c !== clip.category);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...shuffled, clip.category].sort(() => Math.random() - 0.5);
  return choices;
}

export default function AuscultationPracticeTab({ user }) {
  const [mode, setMode] = useState("quiz"); // "quiz" | "browse"
  const [order, setOrder] = useState(() => shuffledOrder(ALL_CLIPS.length));
  const [pos, setPos] = useState(0);
  const [pass, setPass] = useState(1);
  const [choices, setChoices] = useState(() => buildChoices(ALL_CLIPS[order[0]]));
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [reportClip, setReportClip] = useState(null);
  const [browseFilter, setBrowseFilter] = useState("");

  const clip = ALL_CLIPS[order[pos]];

  const choose = (c) => {
    if (revealed) return;
    setSelected(c);
    setRevealed(true);
    setScore((s) => ({ correct: s.correct + (c === clip.category ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    let nextPos = pos + 1;
    let nextOrder = order;
    if (nextPos >= order.length) {
      // A full pass through every clip is complete — reshuffle and start
      // over rather than stopping, so practice is an unbounded session.
      nextOrder = shuffledOrder(ALL_CLIPS.length);
      nextPos = 0;
      setOrder(nextOrder);
      setPass((p) => p + 1);
    }
    setPos(nextPos);
    setChoices(buildChoices(ALL_CLIPS[nextOrder[nextPos]]));
    setSelected(null);
    setRevealed(false);
  };

  const clipsPracticedThisPass = pos + (revealed ? 1 : 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auscultation Practice</h1>
        <p className="text-slate-400 text-sm mt-1">
          Real heart and lung recordings from {ALL_CLIPS.length} clips, pulled from the same library the game's own
          stethoscope exam uses. Listen, guess the finding, and report anything that sounds off.
        </p>
      </div>

      <nav className="flex gap-1.5 border-b border-slate-800 pb-3">
        <button
          onClick={() => setMode("quiz")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            mode === "quiz" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Quiz
        </button>
        <button
          onClick={() => setMode("browse")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            mode === "browse" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Browse all {ALL_CLIPS.length} clips
        </button>
      </nav>

      {mode === "quiz" ? (
        <QuizMode
          clip={clip}
          choices={choices}
          selected={selected}
          revealed={revealed}
          onChoose={choose}
          onNext={next}
          score={score}
          pass={pass}
          clipsPracticedThisPass={clipsPracticedThisPass}
          totalClips={ALL_CLIPS.length}
          onReport={() => setReportClip(clip)}
        />
      ) : (
        <BrowseMode filter={browseFilter} onFilterChange={setBrowseFilter} onReport={setReportClip} />
      )}

      {reportClip && (
        <ReportClipModal clip={reportClip} user={user} onClose={() => setReportClip(null)} />
      )}
    </div>
  );
}

function QuizMode({
  clip,
  choices,
  selected,
  revealed,
  onChoose,
  onNext,
  score,
  pass,
  clipsPracticedThisPass,
  totalClips,
  onReport,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Pass {pass} · {clipsPracticedThisPass} / {totalClips} clips
        </span>
        <span>
          Score: {score.correct} / {score.total}
          {score.total > 0 ? ` (${Math.round((score.correct / score.total) * 100)}%)` : ""}
        </span>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-5">
        <div className="text-center space-y-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {clip.kind === "heart" ? "Heart sound" : "Lung sound"}
          </div>
          {/* key forces a fresh <audio> element per clip so autoplay-adjacent
              browser caching never carries over a stale src */}
          <audio key={clip.url} controls src={clip.url} className="mx-auto w-full max-w-sm" />
          <div className="text-xs text-slate-500">What finding is this?</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {choices.map((c) => {
            const isCorrect = c === clip.category;
            const isSelected = c === selected;
            let cls = "border-slate-700 bg-slate-950 hover:bg-slate-800";
            if (revealed && isCorrect) cls = "border-emerald-600 bg-emerald-950/60 text-emerald-200";
            else if (revealed && isSelected && !isCorrect) cls = "border-red-600 bg-red-950/60 text-red-200";
            else if (revealed) cls = "border-slate-800 bg-slate-950/50 text-slate-500";
            return (
              <button
                key={c}
                onClick={() => onChoose(c)}
                disabled={revealed}
                className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${cls}`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-sm">
              {selected === clip.category ? (
                <span className="text-emerald-400">Correct — {clip.category}.</span>
              ) : (
                <span className="text-red-400">
                  Not quite — this was <span className="font-semibold">{clip.category}</span>.
                </span>
              )}
              <span className="text-slate-500 ml-2 text-xs">
                {clip.src}
                {clip.loc && clip.loc !== "any" ? ` · ${clip.loc}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {reportingEnabled && (
                <button onClick={onReport} className="text-xs text-slate-500 hover:text-amber-400 underline underline-offset-4">
                  Report this clip
                </button>
              )}
              <button onClick={onNext} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BrowseMode({ filter, onFilterChange, onReport }) {
  const rows = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const filtered = f
      ? ALL_CLIPS.filter(
          (c) =>
            c.category.toLowerCase().includes(f) ||
            c.kind.includes(f) ||
            c.id.toLowerCase().includes(f) ||
            (c.src || "").toLowerCase().includes(f)
        )
      : ALL_CLIPS;
    return filtered;
  }, [filter]);

  return (
    <div className="space-y-3">
      <input
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Filter by finding, source, or clip id…"
        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
      />
      <div className="text-xs text-slate-500">
        {rows.length} of {ALL_CLIPS.length} clips
      </div>
      <div className="rounded-xl border border-slate-800 divide-y divide-slate-800 max-h-[70vh] overflow-y-auto">
        {rows.map((c) => (
          <div key={`${c.kind}:${c.id}`} className="p-3 flex items-center gap-3 flex-wrap">
            <span
              className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${
                c.kind === "heart" ? "border-rose-700 text-rose-300 bg-rose-950/40" : "border-sky-700 text-sky-300 bg-sky-950/40"
              }`}
            >
              {c.kind}
            </span>
            <span className="text-sm font-medium w-48 shrink-0">{c.category}</span>
            <audio controls src={c.url} className="h-8 flex-1 min-w-[220px]" />
            <span className="text-xs text-slate-500 w-28 shrink-0">{c.src}</span>
            <span className="text-xs text-slate-600 w-16 shrink-0">{c.loc && c.loc !== "any" ? c.loc : ""}</span>
            {reportingEnabled && (
              <button
                onClick={() => onReport(c)}
                className="text-xs text-slate-500 hover:text-amber-400 underline underline-offset-4 shrink-0"
              >
                Report
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportClipModal({ clip, user, onClose }) {
  const [reason, setReason] = useState(CLIP_REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState(null);

  const submit = async () => {
    setStatus("submitting");
    try {
      await submitClipReport(user, clip, reason, details);
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
          <h2 className="text-lg font-semibold">Report this clip</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-400 space-y-1">
          <div>
            <span className="text-slate-500">Labeled as:</span> {clip.category} ({clip.kind})
          </div>
          <div>
            <span className="text-slate-500">Source:</span> {clip.src}
          </div>
          <audio controls src={clip.url} className="w-full mt-2" />
        </div>

        {!user || user.isGuest ? (
          <div className="text-sm text-slate-400">Sign in to report a sound clip.</div>
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
                {CLIP_REPORT_REASONS.map((r) => (
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
                placeholder="What's wrong with this clip?"
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
