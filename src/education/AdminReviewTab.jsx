import { useEffect, useState } from "react";
import { fetchPendingQuestions, reviewQuestion } from "./crowdsource.js";
import { fetchPendingReports, resolveReport } from "./reports.js";

export default function AdminReviewTab({ user }) {
  const [tab, setTab] = useState("submissions"); // submissions | reports

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
      </nav>

      {tab === "submissions" ? <SubmissionsReview user={user} /> : <ReportsReview user={user} />}
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
      await reviewQuestion(q.id, decision, user, notes[q.id] || "");
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
      <div className="flex justify-end">
        <button onClick={refresh} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
          Refresh
        </button>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Nothing pending review right now.
        </div>
      ) : (
        pending.map((q) => (
          <div key={q.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="text-xs text-slate-500">
              {q.domain} · submitted by {q.submittedByName || "unknown"}
            </div>
            <div className="font-medium">{q.question}</div>
            <div className="space-y-1">
              {q.choices.map((c, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    i === q.answerIndex ? "border-emerald-600 bg-emerald-950/30" : "border-slate-800"
                  }`}
                >
                  {c}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-400">{q.explanation}</div>
            <textarea
              placeholder="Review notes (optional)"
              value={notes[q.id] || ""}
              onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
              rows={2}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                disabled={busyId === q.id}
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
        ))
      )}
    </div>
  );
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
