import { useEffect, useState } from "react";
import { fetchPendingQuestions, reviewQuestion } from "./crowdsource.js";

export default function AdminReviewTab({ user }) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Review</h1>
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
