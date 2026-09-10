import { useState } from "react";
import { DOMAINS_BY_LEVEL } from "./questions.js";
import { crowdsourceEnabled, submitQuestion } from "./crowdsource.js";

const EMPTY = { question: "", choices: ["", "", "", ""], answerIndex: 0, explanation: "", domain: DOMAINS_BY_LEVEL.EMT[0] };

export default function SubmitQuestionForm({ user }) {
  const [draft, setDraft] = useState(EMPTY);
  const [status, setStatus] = useState(null); // null | "submitting" | "done" | error string

  if (!crowdsourceEnabled) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Submit a Question</h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Question submissions require sign-in to be configured for this deployment (see
          <code className="text-slate-300"> src/education/firebase.js</code>). Ask the site operator to
          set it up if you'd like to contribute questions.
        </div>
      </div>
    );
  }

  if (!user || user.isGuest) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Submit a Question</h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Sign in to submit a question for review. Every submission is manually reviewed by an admin before
          it's usable by anyone — nothing you submit becomes live on its own.
        </div>
      </div>
    );
  }

  const valid =
    draft.question.trim().length > 10 &&
    draft.choices.every((c) => c.trim().length > 0) &&
    draft.explanation.trim().length > 10;

  const submit = async () => {
    setStatus("submitting");
    try {
      await submitQuestion(user, draft);
      setStatus("done");
      setDraft(EMPTY);
    } catch (e) {
      setStatus(e.message || "Something went wrong.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Submit a Question</h1>
        <p className="text-slate-400 mt-2">
          EMT-B only for this release. Your question enters a pending queue and is reviewed by an admin for
          medical accuracy, correct-answer correctness, EMT-B appropriateness, and coherent answer choices
          before it's usable by anyone.
        </p>
      </div>

      {status === "done" ? (
        <div className="rounded-xl border border-emerald-700 bg-emerald-950/40 p-5 text-sm text-emerald-300">
          Submitted — thank you. It's now pending admin review.
          <button onClick={() => setStatus(null)} className="block mt-3 text-slate-300 underline underline-offset-4">
            Submit another
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Topic">
            <select
              value={draft.domain}
              onChange={(e) => setDraft((d) => ({ ...d, domain: e.target.value }))}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
            >
              {DOMAINS_BY_LEVEL.EMT.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Question stem">
            <textarea
              value={draft.question}
              onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
              rows={3}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
            />
          </Field>

          <Field label="Answer choices — select the correct one">
            <div className="space-y-2">
              {draft.choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={draft.answerIndex === i}
                    onChange={() => setDraft((d) => ({ ...d, answerIndex: i }))}
                  />
                  <input
                    value={c}
                    onChange={(e) =>
                      setDraft((d) => {
                        const choices = [...d.choices];
                        choices[i] = e.target.value;
                        return { ...d, choices };
                      })
                    }
                    placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
                  />
                </div>
              ))}
            </div>
          </Field>

          <Field label="Explanation">
            <textarea
              value={draft.explanation}
              onChange={(e) => setDraft((d) => ({ ...d, explanation: e.target.value }))}
              rows={3}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
            />
          </Field>

          {typeof status === "string" && status !== "submitting" && (
            <div className="text-sm text-red-400">{status}</div>
          )}

          <button
            onClick={submit}
            disabled={!valid || status === "submitting"}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold"
          >
            {status === "submitting" ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      )}
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
