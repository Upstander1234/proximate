import { useMemo, useState } from "react";
import { DOMAINS_BY_LEVEL } from "./questions.js";
import { crowdsourceEnabled, submitQuestion } from "./crowdsource.js";
import { ITEM_TYPES, validateItemTypeShape } from "./itemTypes.js";
import { ITEM_TYPE_LABELS, blankDraftFor, textFieldsFilled, finalizeDraft } from "./submitQuestionDrafts.js";

export default function SubmitQuestionForm({ user }) {
  const [draft, setDraft] = useState(() => blankDraftFor("multiple_choice"));
  const [status, setStatus] = useState(null); // null | "submitting" | "done" | error string
  // Hooks must run unconditionally (before either early return below), per
  // React's own rules-of-hooks — harmless to compute even when the form
  // itself won't render, since finalizeDraft/validateItemTypeShape are
  // both pure and cheap.
  const finalized = useMemo(() => finalizeDraft(draft), [draft]);
  const shapeCheck = useMemo(() => validateItemTypeShape(finalized), [finalized]);

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

  const filled = textFieldsFilled(draft);
  const valid = filled && shapeCheck.valid;

  const changeItemType = (itemType) => {
    if (itemType === draft.itemType) return;
    setDraft((d) => ({ ...blankDraftFor(itemType), domain: d.domain }));
  };

  const submit = async () => {
    setStatus("submitting");
    try {
      await submitQuestion(user, finalized);
      setStatus("done");
      setDraft(blankDraftFor("multiple_choice"));
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
          medical accuracy, correct-answer correctness, EMT-B appropriateness, and a well-formed answer key
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
          <Field label="Question type">
            <select
              value={draft.itemType}
              onChange={(e) => changeItemType(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
            >
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ITEM_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>

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

          {draft.itemType === "multiple_choice" && <MultipleChoiceFields draft={draft} setDraft={setDraft} />}
          {draft.itemType === "multiple_response" && <MultipleResponseFields draft={draft} setDraft={setDraft} />}
          {draft.itemType === "build_list" && <BuildListFields draft={draft} setDraft={setDraft} />}
          {draft.itemType === "drag_drop" && <DragDropFields draft={draft} setDraft={setDraft} />}
          {draft.itemType === "options_table" && <OptionsTableFields draft={draft} setDraft={setDraft} />}

          <Field label="Explanation">
            <textarea
              value={draft.explanation}
              onChange={(e) => setDraft((d) => ({ ...d, explanation: e.target.value }))}
              rows={3}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
            />
          </Field>

          {filled && !shapeCheck.valid && (
            <div className="rounded-lg border border-amber-700 bg-amber-950/30 p-3 text-xs text-amber-300">
              <div className="font-semibold mb-1">Not quite ready to submit:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {shapeCheck.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

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

// ---------------------------------------------------------------------
// multiple_choice — unchanged from the original single-type form.
// ---------------------------------------------------------------------
function MultipleChoiceFields({ draft, setDraft }) {
  return (
    <Field label="Answer choices — select the correct one">
      <div className="space-y-2">
        {draft.choices.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" checked={draft.answerIndex === i} onChange={() => setDraft((d) => ({ ...d, answerIndex: i }))} />
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
  );
}

// ---------------------------------------------------------------------
// multiple_response — 5 or 6 choices, check the boxes that are correct
// (2 or 3 of them, per itemTypes.js's own shape rule).
// ---------------------------------------------------------------------
function MultipleResponseFields({ draft, setDraft }) {
  const toggleCorrect = (i) => {
    setDraft((d) => {
      const has = d.correctIndices.includes(i);
      const correctIndices = has ? d.correctIndices.filter((x) => x !== i) : [...d.correctIndices, i].sort((a, b) => a - b);
      return { ...d, correctIndices };
    });
  };
  const addChoice = () => {
    if (draft.choices.length >= 6) return;
    setDraft((d) => ({ ...d, choices: [...d.choices, ""] }));
  };
  const removeChoice = (i) => {
    if (draft.choices.length <= 5) return;
    setDraft((d) => ({
      ...d,
      choices: d.choices.filter((_, idx) => idx !== i),
      correctIndices: d.correctIndices.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)),
    }));
  };

  return (
    <Field label={`Answer choices — check every correct one (2 or 3 of ${draft.choices.length})`}>
      <div className="space-y-2">
        {draft.choices.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="checkbox" checked={draft.correctIndices.includes(i)} onChange={() => toggleCorrect(i)} />
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
            {draft.choices.length > 5 && (
              <button onClick={() => removeChoice(i)} className="text-xs text-slate-500 hover:text-red-400 px-2">
                Remove
              </button>
            )}
          </div>
        ))}
        {draft.choices.length < 6 && (
          <button onClick={addChoice} className="text-sm text-sky-400 hover:text-sky-300">
            + Add a 6th choice
          </button>
        )}
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------------
// build_list — author the steps directly IN the correct order (see
// finalizeDraft's own comment: correctOrder is derived from this order,
// not entered separately — the player-facing shuffle happens later, not
// here).
// ---------------------------------------------------------------------
function BuildListFields({ draft, setDraft }) {
  const setStep = (i, value) =>
    setDraft((d) => {
      const steps = [...d.steps];
      steps[i] = value;
      return { ...d, steps };
    });
  const move = (i, dir) =>
    setDraft((d) => {
      const steps = [...d.steps];
      const j = i + dir;
      if (j < 0 || j >= steps.length) return d;
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...d, steps };
    });
  const addStep = () => setDraft((d) => ({ ...d, steps: [...d.steps, ""] }));
  const removeStep = (i) => {
    if (draft.steps.length <= 3) return;
    setDraft((d) => ({ ...d, steps: d.steps.filter((_, idx) => idx !== i) }));
  };

  return (
    <Field label="Steps, written in the CORRECT order (this is the answer key — the player sees them shuffled)">
      <div className="space-y-2">
        {draft.steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-5 shrink-0">{i + 1}.</span>
            <input
              value={s}
              onChange={(e) => setStep(i, e.target.value)}
              placeholder={`Step ${i + 1}`}
              className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
            />
            <button onClick={() => move(i, -1)} disabled={i === 0} className="text-xs px-2 py-1 rounded border border-slate-700 disabled:opacity-30">
              ↑
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === draft.steps.length - 1}
              className="text-xs px-2 py-1 rounded border border-slate-700 disabled:opacity-30"
            >
              ↓
            </button>
            {draft.steps.length > 3 && (
              <button onClick={() => removeStep(i)} className="text-xs text-slate-500 hover:text-red-400 px-1">
                Remove
              </button>
            )}
          </div>
        ))}
        <button onClick={addStep} className="text-sm text-sky-400 hover:text-sky-300">
          + Add a step
        </button>
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------------
// drag_drop — categories (the buckets) plus items, each item assigned to
// its correct category via a dropdown of the authored category labels.
// Category/item ids are auto-generated (cat-N/item-N) and never shown —
// they only need to be internally consistent, not author-facing.
// ---------------------------------------------------------------------
function DragDropFields({ draft, setDraft }) {
  const setCategoryLabel = (i, value) =>
    setDraft((d) => {
      const categories = [...d.categories];
      categories[i] = { ...categories[i], label: value };
      return { ...d, categories };
    });
  const addCategory = () =>
    setDraft((d) => ({ ...d, categories: [...d.categories, { id: `cat-${d.categories.length}`, label: "" }] }));
  const removeCategory = (i) => {
    if (draft.categories.length <= 2) return;
    setDraft((d) => {
      const removedId = d.categories[i].id;
      const categories = d.categories.filter((_, idx) => idx !== i);
      const fallback = categories[0]?.id;
      const items = d.items.map((it) => (it.correctCategory === removedId ? { ...it, correctCategory: fallback } : it));
      return { ...d, categories, items };
    });
  };

  const setItemLabel = (i, value) =>
    setDraft((d) => {
      const items = [...d.items];
      items[i] = { ...items[i], label: value };
      return { ...d, items };
    });
  const setItemCategory = (i, categoryId) =>
    setDraft((d) => {
      const items = [...d.items];
      items[i] = { ...items[i], correctCategory: categoryId };
      return { ...d, items };
    });
  const addItem = () =>
    setDraft((d) => ({
      ...d,
      items: [...d.items, { id: `item-${d.items.length}`, label: "", correctCategory: d.categories[0]?.id }],
    }));
  const removeItem = (i) => {
    if (draft.items.length <= 2) return;
    setDraft((d) => ({ ...d, items: d.items.filter((_, idx) => idx !== i) }));
  };

  return (
    <>
      <Field label="Categories (the buckets a player drags items into)">
        <div className="space-y-2">
          {draft.categories.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                value={c.label}
                onChange={(e) => setCategoryLabel(i, e.target.value)}
                placeholder={`Category ${i + 1}`}
                className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              />
              {draft.categories.length > 2 && (
                <button onClick={() => removeCategory(i)} className="text-xs text-slate-500 hover:text-red-400 px-2">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button onClick={addCategory} className="text-sm text-sky-400 hover:text-sky-300">
            + Add a category
          </button>
        </div>
      </Field>

      <Field label="Items — each one assigned to its correct category">
        <div className="space-y-2">
          {draft.items.map((it, i) => (
            <div key={it.id} className="flex items-center gap-2">
              <input
                value={it.label}
                onChange={(e) => setItemLabel(i, e.target.value)}
                placeholder={`Item ${i + 1}`}
                className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              />
              <select
                value={it.correctCategory}
                onChange={(e) => setItemCategory(i, e.target.value)}
                className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-2 text-sm"
              >
                {draft.categories.map((c, ci) => (
                  <option key={c.id} value={c.id}>
                    {c.label.trim() || `Category ${ci + 1}`}
                  </option>
                ))}
              </select>
              {draft.items.length > 2 && (
                <button onClick={() => removeItem(i)} className="text-xs text-slate-500 hover:text-red-400 px-1">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button onClick={addItem} className="text-sm text-sky-400 hover:text-sky-300">
            + Add an item
          </button>
        </div>
      </Field>
    </>
  );
}

// ---------------------------------------------------------------------
// options_table — a shared classification-option list (the column
// headers), plus rows, each assigned its correct option via a dropdown.
// ---------------------------------------------------------------------
function OptionsTableFields({ draft, setDraft }) {
  const setOption = (i, value) =>
    setDraft((d) => {
      const options = [...d.options];
      options[i] = value;
      return { ...d, options };
    });
  const addOption = () => setDraft((d) => ({ ...d, options: [...d.options, ""] }));
  const removeOption = (i) => {
    if (draft.options.length <= 2) return;
    setDraft((d) => {
      const options = d.options.filter((_, idx) => idx !== i);
      const rows = d.rows.map((r) => (r.correctOptionIndex === i ? { ...r, correctOptionIndex: 0 } : r.correctOptionIndex > i ? { ...r, correctOptionIndex: r.correctOptionIndex - 1 } : r));
      return { ...d, options, rows };
    });
  };

  const setRowFinding = (i, value) =>
    setDraft((d) => {
      const rows = [...d.rows];
      rows[i] = { ...rows[i], finding: value };
      return { ...d, rows };
    });
  const setRowCorrect = (i, optionIndex) =>
    setDraft((d) => {
      const rows = [...d.rows];
      rows[i] = { ...rows[i], correctOptionIndex: optionIndex };
      return { ...d, rows };
    });
  const addRow = () => setDraft((d) => ({ ...d, rows: [...d.rows, { id: `row-${d.rows.length}`, finding: "", correctOptionIndex: 0 }] }));
  const removeRow = (i) => {
    if (draft.rows.length <= 2) return;
    setDraft((d) => ({ ...d, rows: d.rows.filter((_, idx) => idx !== i) }));
  };

  return (
    <>
      <Field label="Classification options (shared column headers, e.g. Immediate / Non-Immediate)">
        <div className="space-y-2">
          {draft.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={o}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              />
              {draft.options.length > 2 && (
                <button onClick={() => removeOption(i)} className="text-xs text-slate-500 hover:text-red-400 px-2">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button onClick={addOption} className="text-sm text-sky-400 hover:text-sky-300">
            + Add an option
          </button>
        </div>
      </Field>

      <Field label="Rows — each finding, with its correct classification">
        <div className="space-y-2">
          {draft.rows.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2">
              <input
                value={r.finding}
                onChange={(e) => setRowFinding(i, e.target.value)}
                placeholder={`Finding ${i + 1}`}
                className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              />
              <select
                value={r.correctOptionIndex}
                onChange={(e) => setRowCorrect(i, Number(e.target.value))}
                className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-2 text-sm"
              >
                {draft.options.map((o, oi) => (
                  <option key={oi} value={oi}>
                    {o.trim() || `Option ${oi + 1}`}
                  </option>
                ))}
              </select>
              {draft.rows.length > 2 && (
                <button onClick={() => removeRow(i)} className="text-xs text-slate-500 hover:text-red-400 px-1">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button onClick={addRow} className="text-sm text-sky-400 hover:text-sky-300">
            + Add a row
          </button>
        </div>
      </Field>
    </>
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
