import { useEffect, useMemo, useState } from "react";
import { fetchPendingQuestions, reviewQuestion, exportApprovedAsCode } from "./crowdsource.js";
import { fetchPendingReports, resolveReport } from "./reports.js";
import { fetchPendingClipReports, resolveClipReport } from "./soundClipReports.js";
import { validateItemTypeShape, itemTypeOf } from "./itemTypes.js";
import MedicdleReviewPanel from "./MedicdleReviewPanel.jsx";
import { QUESTIONS } from "./questions.js";
import { fetchAllItemStats, pctCorrect, difficultyBand, MIN_RESPONSES_FOR_DISPLAY } from "./itemStats.js";
import { difficultyFromStats } from "./adaptiveEngine.js";
import { AUDIT_FLAGS } from "../data/auscultationAuditFlags.js";
import { AUSC_BASE } from "../data/auscultationSounds.js";

export default function AdminReviewTab({ user }) {
  const [tab, setTab] = useState("submissions"); // submissions | reports | medicdles | difficulty | clipReports | clipAudit

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Review</h1>
      <nav className="flex gap-1.5 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTab("submissions")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "submissions" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Question Submissions
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "reports" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Reported Questions
        </button>
<button
          onClick={() => setTab("medicdles")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "medicdles" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Medicdle Submissions
        </button>
        <button
          onClick={() => setTab("difficulty")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "difficulty" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Difficulty Ratings
        </button>
        <button
          onClick={() => setTab("clipReports")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "clipReports" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Sound Clip Reports
        </button>
        <button
          onClick={() => setTab("clipAudit")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === "clipAudit" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Clip Audit
        </button>
      </nav>

      {tab === "submissions" && <SubmissionsReview user={user} />}
      {tab === "reports" && <ReportsReview user={user} />}
      {tab === "medicdles" && <MedicdleReviewPanel user={user} />}
      {tab === "difficulty" && <DifficultyRatings />}
      {tab === "clipReports" && <ClipReportsReview user={user} />}
      {tab === "clipAudit" && <ClipAuditReview />}
    </div>
  );
}

function SubmissionsReview({ user }) {
  const [pending, setPending] = useState(null);
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    fetchPendingQuestions().then(setPending);
  };

  useEffect(() => {
    fetchPendingQuestions().then(setPending);
  }, []);

  const decide = async (q, decision) => {
    setBusyId(q.id);
    try {
      await reviewQuestion(q, decision, user, notes[q.id] || "");
      setPending((p) => p.filter((x) => x.id !== q.id));
    } catch (e) {
      alert(e.message || "Review failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (pending === null) return <div className="text-slate-400 text-center py-20">Loading pending submissions…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4">
        <button
          onClick={async () => {
            const code = await exportApprovedAsCode();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
            a.download = "questionsCrowdsourced.js";
            a.click();
            URL.revokeObjectURL(a.href);
          }}
          title="Download approved questions as source for src/education/questionsCrowdsourced.js"
          className="text-sm text-slate-400 hover:text-white underline underline-offset-4"
        >
          Export approved as code
        </button>
        <button onClick={refresh} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
          Refresh
        </button>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Nothing pending review right now.
        </div>
      ) : (
        pending.map((q) => {
          const shapeCheck = validateItemTypeShape(q);
          return (
            <div key={q.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{itemTypeOf(q)}</span>
                <span>
                  {q.domain} · submitted by {q.submittedByName || "unknown"}
                </span>
              </div>
              <div className="font-medium">{q.question}</div>

              <QuestionPreview q={q} />

              <div className="text-sm text-slate-400">{q.explanation}</div>

              {!shapeCheck.valid && (
                <div className="rounded-lg border border-red-700 bg-red-950/30 p-3 text-xs text-red-300">
                  <div className="font-semibold mb-1">Not well-formed — cannot approve:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {shapeCheck.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <textarea
                placeholder="Review notes (optional)"
                value={notes[q.id] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
                rows={2}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  disabled={busyId === q.id || !shapeCheck.valid}
                  title={!shapeCheck.valid ? "Fix or reject — this submission isn't well-formed" : undefined}
                  onClick={() => decide(q, "approved")}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-medium disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={busyId === q.id}
                  onClick={() => decide(q, "rejected")}
                  className="flex-1 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// A lightweight, non-interactive answer-key preview per item type — an
// admin needs to see what the correct answer(s) actually are, not play
// through the item the way a candidate would. multiple_choice keeps the
// original rich preview; every other type gets a compact but real (not a
// raw JSON dump) summary of its own answer key.
function QuestionPreview({ q }) {
  const type = itemTypeOf(q);
  if (type === "multiple_choice") {
    if (!Array.isArray(q.choices)) return null;
    return (
      <div className="space-y-1">
        {q.choices.map((c, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg border text-sm ${i === q.answerIndex ? "border-emerald-600 bg-emerald-950/30" : "border-slate-800"}`}>
            {c}
          </div>
        ))}
      </div>
    );
  }
  if (type === "multiple_response") {
    if (!Array.isArray(q.choices)) return null;
    const correct = new Set(q.correctIndices || []);
    return (
      <div className="space-y-1">
        {q.choices.map((c, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg border text-sm ${correct.has(i) ? "border-emerald-600 bg-emerald-950/30" : "border-slate-800"}`}>
            {c}
          </div>
        ))}
      </div>
    );
  }
  if (type === "build_list") {
    if (!Array.isArray(q.steps) || !Array.isArray(q.correctOrder)) return null;
    return (
      <div className="space-y-1">
        {q.correctOrder.map((stepIdx, i) => (
          <div key={i} className="px-3 py-2 rounded-lg border border-slate-800 text-sm">
            {i + 1}. {q.steps[stepIdx]}
          </div>
        ))}
      </div>
    );
  }
  if (type === "drag_drop") {
    if (!Array.isArray(q.categories) || !Array.isArray(q.items)) return null;
    return (
      <div className="grid sm:grid-cols-2 gap-2">
        {q.categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border border-slate-800 p-2">
            <div className="text-xs font-semibold text-slate-400 mb-1">{cat.label}</div>
            {q.items.filter((it) => it.correctCategory === cat.id).map((it) => (
              <div key={it.id} className="text-xs px-2 py-1 rounded border border-emerald-700 bg-emerald-950/20 mb-1">
                {it.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (type === "options_table") {
    if (!Array.isArray(q.rows)) return null;
    return (
      <div className="space-y-1">
        {q.rows.map((row) => {
          const options = row.options || q.options || [];
          return (
            <div key={row.id} className="px-3 py-2 rounded-lg border border-slate-800 text-sm flex justify-between gap-3">
              <span>{row.finding}</span>
              <span className="text-emerald-400 shrink-0">{options[row.correctOptionIndex]}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

function ReportsReview({ user }) {
  const [pending, setPending] = useState(null);
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    fetchPendingReports().then(setPending);
  };

  useEffect(() => {
    fetchPendingReports().then(setPending);
  }, []);

  const decide = async (r, decision) => {
    const note = notes[r.id] || "";
    if (!note.trim()) {
      alert("Give a reason before approving or denying this report — it's shown to explain the decision.");
      return;
    }
    setBusyId(r.id);
    try {
      await resolveReport(r.id, decision, user, note);
      setPending((p) => p.filter((x) => x.id !== r.id));
    } catch (e) {
      alert(e.message || "Review failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (pending === null) return <div className="text-slate-400 text-center py-20">Loading reported questions…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={refresh} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
          Refresh
        </button>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          No open reports right now.
        </div>
      ) : (
        pending.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="text-xs text-slate-500">
              Reported by {r.reportedByName || "unknown"} · {r.questionDomain}
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-700 text-amber-300 text-xs">
              {r.reason}
            </div>
            {r.details && <div className="text-sm text-slate-300">"{r.details}"</div>}

            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2">
              <div className="text-sm font-medium">{r.questionText}</div>
              <div className="space-y-1">
                {(r.questionChoices || []).map((c, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-lg border text-xs ${
                      i === r.questionAnswerIndex ? "border-emerald-600 bg-emerald-950/30" : "border-slate-800"
                    }`}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Reason for approving or denying this report (required, shown as the resolution note)"
              value={notes[r.id] || ""}
              onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
              rows={2}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r, "approved")}
                className="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-medium disabled:opacity-50"
              >
                Approve report (issue confirmed)
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r, "denied")}
                className="flex-1 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 font-medium disabled:opacity-50"
              >
                Deny report
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ClipReportsReview({ user }) {
  const [pending, setPending] = useState(null);
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    fetchPendingClipReports().then(setPending);
  };

  useEffect(() => {
    fetchPendingClipReports().then(setPending);
  }, []);

  const decide = async (r, decision) => {
    const note = notes[r.id] || "";
    if (!note.trim()) {
      alert("Give a reason before approving or denying this report — it's shown to explain the decision.");
      return;
    }
    setBusyId(r.id);
    try {
      await resolveClipReport(r.id, decision, user, note);
      setPending((p) => p.filter((x) => x.id !== r.id));
    } catch (e) {
      alert(e.message || "Review failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (pending === null) return <div className="text-slate-400 text-center py-20">Loading reported clips…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={refresh} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
          Refresh
        </button>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          No open sound clip reports right now.
        </div>
      ) : (
        pending.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="text-xs text-slate-500">
              Reported by {r.reportedByName || "unknown"} · {r.clipKind} · {r.clipSrc}
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-700 text-amber-300 text-xs">
              {r.reason}
            </div>
            {r.details && <div className="text-sm text-slate-300">"{r.details}"</div>}

            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2">
              <div className="text-sm font-medium">
                Labeled: {r.clipCategory}
                {r.clipLoc && r.clipLoc !== "any" ? ` · ${r.clipLoc}` : ""}
              </div>
              <div className="text-xs text-slate-500 font-mono">{r.clipId}</div>
              {r.clipUrl && <audio controls src={r.clipUrl} className="w-full" />}
            </div>

            <textarea
              placeholder="Reason for approving or denying this report (required, shown as the resolution note)"
              value={notes[r.id] || ""}
              onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
              rows={2}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r, "approved")}
                className="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-medium disabled:opacity-50"
              >
                Approve report (issue confirmed)
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => decide(r, "denied")}
                className="flex-1 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 font-medium disabled:opacity-50"
              >
                Deny report
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Every recording, sorted by an acoustic "suspicion score" (see
// genAusculAuditFlags.mjs) — a triage order for a human ear, not a verdict.
// Positive score means the clip's spectral/periodicity profile resembles
// the OTHER instrument's clips more than its own category's, which is worth
// listening to but is routinely true of legitimate broadband lung sounds
// (rhonchi, crackles, wheeze) too.
function ClipAuditReview() {
  const [filter, setFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("all"); // all | heart | lung
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [reportedIds, setReportedIds] = useState(null);

  useEffect(() => {
    fetchPendingClipReports().then((rows) => setReportedIds(new Set(rows.map((r) => r.clipId))));
  }, []);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return AUDIT_FLAGS.filter((c) => {
      if (kindFilter !== "all" && c.kind !== kindFilter) return false;
      if (flaggedOnly && c.susScore <= 0) return false;
      if (!q) return true;
      return (
        c.category.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.src || "").toLowerCase().includes(q) ||
        (c.loc || "").toLowerCase().includes(q)
      );
    });
  }, [filter, kindFilter, flaggedOnly]);

  const flaggedTotal = useMemo(() => AUDIT_FLAGS.filter((c) => c.susScore > 0).length, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400 space-y-1">
        <div>
          Every heart and lung recording ({AUDIT_FLAGS.length} clips), sorted by how much its spectral/timing
          profile resembles the OTHER instrument's clips rather than its own category's ({flaggedTotal} score
          above zero). This is a triage order, not a verdict — listen and judge for yourself.
        </div>
        <div>Already-reported clips (open player reports) are marked so you don't duplicate that work.</div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by category, id, source, location…"
          className="flex-1 min-w-[220px] rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
        />
        <div className="flex gap-1.5">
          {["all", "heart", "lung"].map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                kindFilter === k ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFlaggedOnly((v) => !v)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            flaggedOnly ? "bg-amber-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Flagged only
        </button>
        <span className="text-xs text-slate-500">{rows.length} shown</span>
      </div>

      <div className="rounded-xl border border-slate-800 divide-y divide-slate-800 max-h-[70vh] overflow-y-auto">
        {rows.map((c) => (
          <div key={`${c.kind}:${c.id}`} className="p-3 flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-mono shrink-0 ${
                c.kind === "heart" ? "bg-rose-950/60 text-rose-300 border border-rose-800" : "bg-sky-950/60 text-sky-300 border border-sky-800"
              }`}
            >
              {c.kind}
            </span>
            <span className="text-sm font-medium w-48 shrink-0 truncate">{c.category}</span>
            <audio controls src={`${AUSC_BASE}/${c.dir}/${c.id}.wav`} className="h-8 flex-1 min-w-[220px]" />
            <span
              className={`text-xs w-16 shrink-0 text-right font-mono ${c.susScore > 0 ? "text-amber-400" : "text-slate-600"}`}
              title="Suspicion score — margin toward the other instrument's acoustic profile"
            >
              {c.susScore > 0 ? "+" : ""}
              {c.susScore}
            </span>
            <span className="text-xs text-slate-500 w-28 shrink-0">{c.src}</span>
            <span className="text-xs text-slate-600 w-16 shrink-0">{c.loc !== "any" ? c.loc : ""}</span>
            <span className="text-xs text-slate-700 font-mono w-40 shrink-0 truncate" title={c.id}>
              {c.id}
            </span>
            {reportedIds?.has(c.id) && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-900/60 border border-amber-700 text-amber-300 shrink-0">
                reported
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

function DifficultyRatings() {
  const [rows, setRows] = useState(null);
  const [sort, setSort] = useState("attempts"); // attempts | pct

  const load = () => {
    fetchAllItemStats().then((all) =>
      setRows(
        all.map((s) => {
          const q = QUESTION_BY_ID.get(s.id);
          return {
            ...s,
            text: q?.question || "(not in built-in bank)",
            domain: q?.domain || "",
            pct: pctCorrect(s),
            band: difficultyBand(difficultyFromStats(s).b),
            rated: s.attempts >= MIN_RESPONSES_FOR_DISPLAY,
          };
        })
      )
    );
  };
  useEffect(load, []);

  if (rows === null) return <div className="text-slate-400 text-center py-20">Loading difficulty ratings…</div>;

  const sorted = [...rows].sort((a, b) =>
    sort === "pct" ? (a.pct ?? 101) - (b.pct ?? 101) : b.attempts - a.attempts
  );
  const ratedCount = rows.filter((r) => r.rated).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {rows.length} of {QUESTIONS.length} built-in questions have responses · {ratedCount} have at least{" "}
          {MIN_RESPONSES_FOR_DISPLAY} (rated)
        </span>
        <span className="flex gap-3">
          <button onClick={() => setSort(sort === "attempts" ? "pct" : "attempts")} className="underline underline-offset-4 hover:text-white">
            Sort: {sort === "attempts" ? "most responses" : "hardest first"}
          </button>
          <button onClick={load} className="underline underline-offset-4 hover:text-white">
            Refresh
          </button>
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          No questions have any responses yet.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800">
          {sorted.map((r) => (
            <div key={r.id} className="p-3 flex items-start gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <div className="truncate">{r.text}</div>
                <div className="text-xs text-slate-500">
                  {r.id}
                  {r.domain && ` · ${r.domain}`}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={r.rated ? "font-medium" : "text-slate-500"}>
                  {r.rated ? r.band : "Provisional"} · {r.pct ?? "-"}% correct
                </div>
                <div className="text-xs text-slate-500">{r.attempts} responses</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
