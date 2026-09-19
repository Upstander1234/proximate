import { useEffect, useState } from "react";
import {
  fetchPendingMedicdleSubmissions,
  reviewMedicdleSubmission,
  validateReviewDecision,
  MEDICDLE_REVIEW_STEPS,
  MEDICDLE_STATUS,
  MEDICDLE_STATUS_LABELS,
} from "./medicdleSubmissions.js";
import { STAGES } from "./medicdleData.js";

// The Medicdle half of the existing Admin Review tab — same component, same
// admin gate, same list-and-decide shape as SubmissionsReview/ReportsReview,
// extended with the four review gates a Medicdle has to pass individually
// before it can be approved.
//
// Approval is only reachable with all four gates checked: that is enforced
// again inside reviewMedicdleSubmission (validateReviewDecision), so the
// disabled button below is a convenience, not the actual protection.
export default function MedicdleReviewPanel({ user }) {
  const [pending, setPending] = useState(null);
  const [notes, setNotes] = useState({});
  const [checks, setChecks] = useState({}); // { [id]: { medicalAccuracy: bool, ... } }
  const [busyId, setBusyId] = useState(null);

  const refresh = () => fetchPendingMedicdleSubmissions().then(setPending);

  useEffect(() => {
    refresh();
  }, []);

  const checksFor = (id) => checks[id] || Object.fromEntries(MEDICDLE_REVIEW_STEPS.map((s) => [s.key, false]));

  const toggleGate = (id, key) =>
    setChecks((c) => ({ ...c, [id]: { ...checksFor(id), [key]: !checksFor(id)[key] } }));

  const decide = async (sub, decision) => {
    const gateState = checksFor(sub.id);
    const note = notes[sub.id] || "";
    const check = validateReviewDecision(decision, gateState, note);
    if (!check.valid) {
      alert(check.errors.join(" "));
      return;
    }
    setBusyId(sub.id);
    try {
      await reviewMedicdleSubmission(sub, decision, user, { notes: note, checks: gateState });
      setPending((p) => p.filter((x) => x.id !== sub.id));
    } catch (e) {
      alert(e.message || "Review failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (pending === null) return <div className="text-slate-400 text-center py-20">Loading pending Medicdles…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-slate-500 max-w-xl">
          A submitted Medicdle stays out of every player&apos;s pool until it is approved here. Approving requires all
          four review steps; rejecting or requesting a revision requires a written reason, which is shown back to the
          author.
        </p>
        <button
          onClick={refresh}
          className="text-sm text-slate-400 hover:text-white underline underline-offset-4 shrink-0"
        >
          Refresh
        </button>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Nothing pending review right now.
        </div>
      ) : (
        pending.map((sub) => (
          <MedicdleReviewCard
            key={sub.id}
            sub={sub}
            gateState={checksFor(sub.id)}
            onToggleGate={(key) => toggleGate(sub.id, key)}
            note={notes[sub.id] || ""}
            onNote={(v) => setNotes((n) => ({ ...n, [sub.id]: v }))}
            busy={busyId === sub.id}
            onDecide={(decision) => decide(sub, decision)}
          />
        ))
      )}
    </div>
  );
}

function MedicdleReviewCard({ sub, gateState, onToggleGate, note, onNote, busy, onDecide }) {
  const allPassed = MEDICDLE_REVIEW_STEPS.every((s) => gateState[s.key]);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {sub.conditionName || sub.conditionKey} · submitted by {sub.submittedByName || "unknown"}
        </span>
        <span className="px-2 py-0.5 rounded-full border border-slate-700">
          {MEDICDLE_STATUS_LABELS[sub.status] || sub.status}
        </span>
      </div>

      <div className="text-xs text-slate-400">
        Correct diagnosis as submitted: <span className="text-slate-200">{sub.correctDiagnosis}</span>
      </div>

      <div className="space-y-2">
        {STAGES.map((stage, i) => (
          <div key={stage} className="rounded-lg border border-slate-800 p-3">
            <div className="text-xs uppercase tracking-wide text-sky-500 font-semibold mb-1">
              Stage {i + 1}: {stage}
            </div>
            <div className="text-sm text-slate-200">{sub.stageClues?.[i]}</div>
          </div>
        ))}
      </div>

      <div className="text-sm text-slate-400">{sub.explanation}</div>

      {(sub.references || []).length > 0 && (
        <div className="text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">References</div>
          <ul className="space-y-0.5">
            {sub.references.map((r, i) => (
              <li key={i}>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 underline underline-offset-4"
                  >
                    {r.label || r.url}
                  </a>
                ) : (
                  r.label
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sub.contributorNotes && <div className="text-xs text-slate-500">Contributor notes: {sub.contributorNotes}</div>}

      {(sub.revisionHistory || []).length > 1 && (
        <div className="text-xs text-slate-500">
          Revision history: {sub.revisionHistory.length} entries, latest first —{" "}
          {sub.revisionHistory
            .slice(-3)
            .reverse()
            .map((h) => `#${h.revision} ${h.kind}${h.byName ? ` by ${h.byName}` : ""}`)
            .join(" · ")}
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Review steps</div>
        {MEDICDLE_REVIEW_STEPS.map((step) => (
          <label key={step.key} className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={!!gateState[step.key]}
              onChange={() => onToggleGate(step.key)}
              className="accent-emerald-600"
            />
            {step.label} passed
          </label>
        ))}
      </div>

      <textarea
        placeholder="Review notes. Required when rejecting or requesting a revision; shown to the author."
        value={note}
        onChange={(e) => onNote(e.target.value)}
        rows={2}
        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
      />

      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy || !allPassed}
          title={allPassed ? undefined : "All four review steps must pass before approval"}
          onClick={() => onDecide(MEDICDLE_STATUS.APPROVED)}
          className="flex-1 min-w-32 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-medium disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => onDecide(MEDICDLE_STATUS.REVISION_REQUESTED)}
          className="flex-1 min-w-32 py-2.5 rounded-lg bg-amber-800 hover:bg-amber-700 font-medium disabled:opacity-50"
        >
          Request revision
        </button>
        <button
          disabled={busy}
          onClick={() => onDecide(MEDICDLE_STATUS.REJECTED)}
          className="flex-1 min-w-32 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 font-medium disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}