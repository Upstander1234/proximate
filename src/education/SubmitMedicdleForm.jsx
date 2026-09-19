import { useMemo, useState } from "react";
import { STAGES } from "./medicdleData.js";
import {
  medicdleSubmissionsEnabled,
  MEDICDLE_CONDITION_OPTIONS,
  conditionDisplayName,
  blankMedicdleDraft,
  validateMedicdleDraft,
  submitMedicdle,
  fetchMyMedicdleSubmissions,
  MEDICDLE_STATUS_LABELS,
} from "./medicdleSubmissions.js";

// "Submit a Medicdle" — the contributor side of the review workflow.
//
// The condition picker is built from MEDICDLE_CONDITION_OPTIONS, which is
// the canonical condition registry (data/customScenario.js ->
// physio/conditions.js), so a submission can only ever reference a
// condition that already exists. The picker auto-fills the diagnosis field
// from it, because a mismatch between the two is rejected.
//
// After submitting, the author sees their own submissions with their real
// stored status, so "pending review" is visible rather than assumed.
export default function SubmitMedicdleForm({ user }) {
  const [draft, setDraft] = useState(() => blankMedicdleDraft());
  const [status, setStatus] = useState(null); // null | "submitting" | error string
  const [mine, setMine] = useState(null); // null = not loaded yet
  const check = useMemo(() => validateMedicdleDraft(draft), [draft]);

  if (!medicdleSubmissionsEnabled) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Submit a Medicdle</h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Medicdle submissions require sign-in to be configured for this deployment, so that a submission can reach a
          shared review queue. Ask the site operator to set it up if you&apos;d like to contribute.
        </div>
      </div>
    );
  }

  if (!user || user.isGuest) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Submit a Medicdle</h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Sign in to submit a Medicdle. Every submission is reviewed for medical accuracy, clue progression,
          answer validity, and references before it can ever appear to another player.
        </div>
      </div>
    );
  }

  const submit = async () => {
    setStatus("submitting");
    try {
      await submitMedicdle(user, draft);
      setDraft(blankMedicdleDraft());
      setStatus(null);
      setMine(await fetchMyMedicdleSubmissions(user));
    } catch (e) {
      setStatus(e.message || "Something went wrong.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Submit a Medicdle</h1>
        <p className="text-slate-400 mt-2">
          A Medicdle is a five-stage diagnostic-reasoning case. Your submission enters a pending queue and is reviewed
          for medical accuracy, clue progression, answer validity, and supporting references. Nothing you submit
          becomes public on its own.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <Field label="Condition (must already exist in the condition library)">
          <select
            value={draft.conditionKey}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                conditionKey: e.target.value,
                correctDiagnosis: e.target.value ? conditionDisplayName(e.target.value) : "",
              }))
            }
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2"
          >
            <option value="">Select a condition…</option>
            {MEDICDLE_CONDITION_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Conditions come from the same library the physiology engine uses. A condition that isn&apos;t in that
            library needs separate condition-content review first, so it can&apos;t be submitted here.
          </p>
        </Field>

        <Field label="Correct diagnosis">
          <input
            value={draft.correctDiagnosis}
            onChange={(e) => setDraft((d) => ({ ...d, correctDiagnosis: e.target.value }))}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2"
          />
        </Field>

        {STAGES.map((stage, i) => (
          <Field key={stage} label={`${stage} clue`}>
            <textarea
              value={draft.stageClues[i]}
              onChange={(e) =>
                setDraft((d) => {
                  const stageClues = [...d.stageClues];
                  stageClues[i] = e.target.value;
                  return { ...d, stageClues };
                })
              }
              rows={3}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
            />
          </Field>
        ))}

        <Field label="Explanation (shown once the case is solved)">
          <textarea
            value={draft.explanation}
            onChange={(e) => setDraft((d) => ({ ...d, explanation: e.target.value }))}
            rows={3}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
          />
        </Field>

        <References draft={draft} setDraft={setDraft} />
        <Contributor draft={draft} setDraft={setDraft} />
      </div>

      {!check.valid && <ValidationErrors errors={check.errors} />}
      {typeof status === "string" && status !== "submitting" && <ValidationErrors errors={[status]} tone="red" />}

      <button
        onClick={submit}
        disabled={!check.valid || status === "submitting"}
        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold"
      >
        {status === "submitting" ? "Submitting…" : "Submit for review"}
      </button>

      <MySubmissions mine={mine} loadMine={() => fetchMyMedicdleSubmissions(user).then(setMine)} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function References({ draft, setDraft }) {
  const setRef = (i, patch) =>
    setDraft((d) => {
      const references = d.references.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
      return { ...d, references };
    });
  const addRef = () => setDraft((d) => ({ ...d, references: [...d.references, { label: "", url: "" }] }));
  const removeRef = (i) =>
    setDraft((d) => ({ ...d, references: d.references.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">
        Supporting references (a reviewer checks these against the case)
      </label>
      <div className="space-y-2">
        {draft.references.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={r.label}
              onChange={(e) => setRef(i, { label: e.target.value })}
              placeholder="Title or source (e.g. textbook chapter, guideline section)"
              className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
            />
            <input
              value={r.url}
              onChange={(e) => setRef(i, { url: e.target.value })}
              placeholder="https://… (optional)"
              className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
            />
            {draft.references.length > 1 && (
              <button onClick={() => removeRef(i)} className="text-xs text-slate-500 hover:text-red-400 px-2">
                Remove
              </button>
            )}
          </div>
        ))}
        <button onClick={addRef} className="text-sm text-sky-400 hover:text-sky-300">
          + Add a reference
        </button>
      </div>
    </div>
  );
}

function Contributor({ draft, setDraft }) {
  return (
    <>
      <Field label="Contributor name (shown to reviewers, and credited if the case is published)">
        <input
          value={draft.contributorName}
          onChange={(e) => setDraft((d) => ({ ...d, contributorName: e.target.value }))}
          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2"
        />
      </Field>
      <Field label="Notes for the reviewer (optional)">
        <textarea
          value={draft.contributorNotes}
          onChange={(e) => setDraft((d) => ({ ...d, contributorNotes: e.target.value }))}
          rows={2}
          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
        />
      </Field>
    </>
  );
}

function ValidationErrors({ errors, tone = "amber" }) {
  const cls =
    tone === "red"
      ? "border-red-800 bg-red-950/30 text-red-300"
      : "border-amber-800 bg-amber-950/30 text-amber-300";
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${cls}`}>
      <ul className="list-disc list-inside space-y-0.5">
        {errors.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

// The author's own submissions, with their real stored status. Loaded on
// demand rather than automatically, so opening the form never costs a
// Firestore read for someone who is only drafting.
function MySubmissions({ mine, loadMine }) {
  if (mine === null) {
    return (
      <button onClick={loadMine} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
        Show my submissions
      </button>
    );
  }
  if (mine.length === 0) {
    return <div className="text-sm text-slate-500">You haven&apos;t submitted a Medicdle yet.</div>;
  }
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <div className="font-semibold text-sm">Your submissions</div>
      {mine.map((s) => (
        <div key={s.id} className="rounded-lg border border-slate-800 p-3 space-y-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-200">{s.conditionName || s.conditionKey}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                s.status === "approved"
                  ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                  : s.status === "rejected"
                  ? "border-red-800 bg-red-950/30 text-red-300"
                  : s.status === "revision_requested"
                  ? "border-amber-800 bg-amber-950/30 text-amber-300"
                  : "border-slate-700 text-slate-400"
              }`}
            >
              {MEDICDLE_STATUS_LABELS[s.status] || s.status}
            </span>
          </div>
          {s.reviewNotes && <div className="text-xs text-slate-400">Reviewer: {s.reviewNotes}</div>}
          {s.submittedAt && (
            <div className="text-[10px] text-slate-500">
              Submitted {new Date(s.submittedAt).toLocaleDateString()} ·{" "}
              {s.revisionHistory?.length || 1} revision{(s.revisionHistory?.length || 1) === 1 ? "" : "s"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}