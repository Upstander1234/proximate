// A single component that renders any supported itemType and reports back
// through the SAME normalized contract every consumer already expects:
// onAnswered(correct, response) — response is whatever shape
// evaluateResponse.js's evaluator for that type reads (canonical index,
// array of canonical indices, ordered array of canonical step indices, a
// {itemId: categoryId} map, or a {rowId: optionIndex} map). The adaptive
// engine and SRS/stats code never need to know which of these rendered.
//
// Interaction model, per item 20 of the NREMT item-type spec (obvious
// selected/unselected state, touch support, keyboard accessibility, no
// accidental submission): every non-MCQ type uses TAP-TO-SELECT /
// TAP-TARGET-TO-PLACE rather than native HTML5 drag-and-drop, which is
// unreliable on touch devices and needs no extra library — a plain button
// click resolves identically for mouse, touch, and keyboard (Enter/Space
// on a focused button). Multiple choice keeps its existing
// click-immediately-scores behavior (MCQPracticeTab.jsx's own pattern);
// every other type requires an explicit Submit so a multi-step response
// can't be accidentally committed on the first tap.

import { useMemo, useState } from "react";
import { itemTypeOf } from "./itemTypes.js";
import EcgStrip from "./EcgStrip.jsx";
import { evaluateQuestionResponse } from "./evaluateResponse.js";
import {
  randomizePresentation,
  randomizeMultipleResponsePresentation,
  randomizeBuildListPresentation,
  randomizeDragDropItemOrder,
  randomizeOptionsTableRowOrder,
} from "./randomize.js";

const CARD = "rounded-xl bg-slate-900 border border-slate-800 p-5";

function GraphicPanel({ graphic }) {
  if (!graphic) return null;
  // ECGs drawn from the game's own waveform table (src/ecg.js). The visible
  // caption is deliberately not `alt`, which would describe the answer.
  if (graphic.kind === "ecg" && graphic.rhythm) {
    return (
      <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950 p-2">
        <EcgStrip rhythm={graphic.rhythm} alt={graphic.alt} />
      </div>
    );
  }
  return (
    <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950 p-2">
      <img src={graphic.src} alt={graphic.alt || ""} className="w-full max-h-80 object-contain rounded" />
      {graphic.alt && <div className="text-xs text-slate-500 mt-1 px-1">{graphic.alt}</div>}
    </div>
  );
}

function SubmitBar({ canSubmit, onSubmit, hint }) {
  return (
    <div className="flex items-center justify-between gap-3 mt-4">
      <span className="text-xs text-slate-500">{hint}</span>
      <button
        data-testid="submit-answer"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 font-medium transition"
      >
        Submit answer
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// multiple_choice — click-to-answer, matches MCQPracticeTab.jsx's existing
// visual language exactly (instant reveal, no separate submit step).
// ---------------------------------------------------------------------
function MultipleChoiceItem({ question, revealed, showCorrectness, onCommit }) {
  const display = useMemo(() => randomizePresentation(question), [question]);
  const [selected, setSelected] = useState(null);

  const choose = (i) => {
    if (revealed) return;
    setSelected(i);
    const canonicalIdx = display.toCanonical[i];
    const result = evaluateQuestionResponse(question, canonicalIdx);
    onCommit(result.correct, canonicalIdx);
  };

  return (
    <div className="space-y-2">
      {display.displayChoices.map((c, i) => {
        let cls = "border-slate-700 hover:border-slate-500";
        if (revealed && !showCorrectness) {
          // deferred mode (e.g. the adaptive exam's "don't show correctness
          // until the exam ends" setting): acknowledge the pick, no color.
          cls = i === selected ? "border-slate-400 bg-slate-800" : "border-slate-800 opacity-50";
        } else if (showCorrectness) {
          if (i === display.displayAnswerIndex) cls = "border-emerald-500 bg-emerald-950/40";
          else if (i === selected) cls = "border-red-500 bg-red-950/30";
          else cls = "border-slate-800 opacity-60";
        }
        return (
          <button
            key={i}
            data-testid={`mc-option-${i}`}
            onClick={() => choose(i)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition ${cls}`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// multiple_response — checkboxes, explicit submit, dichotomous scoring.
// ---------------------------------------------------------------------
function MultipleResponseItem({ question, revealed, showCorrectness, onCommit }) {
  const display = useMemo(() => randomizeMultipleResponsePresentation(question), [question]);
  const [selected, setSelected] = useState(() => new Set());

  const toggle = (i) => {
    if (revealed) return;
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const submit = () => {
    if (revealed || selected.size === 0) return;
    const canonical = Array.from(selected).map((i) => display.toCanonical[i]);
    const result = evaluateQuestionResponse(question, canonical);
    onCommit(result.correct, canonical);
  };

  const correctDisplaySet = useMemo(
    () => new Set(question.correctIndices.map((canon) => display.toCanonical.indexOf(canon))),
    [question, display]
  );

  return (
    <div>
      <div className="text-xs text-sky-400 mb-3 font-medium">
        Select all that apply ({question.correctIndices.length} correct answers)
      </div>
      <div className="space-y-2">
        {display.displayChoices.map((c, i) => {
          const isSelected = selected.has(i);
          let cls = isSelected ? "border-sky-500 bg-sky-950/30" : "border-slate-700 hover:border-slate-500";
          if (revealed && !showCorrectness) {
            cls = isSelected ? "border-slate-400 bg-slate-800" : "border-slate-800 opacity-50";
          } else if (showCorrectness) {
            const isCorrectChoice = correctDisplaySet.has(i);
            if (isCorrectChoice && isSelected) cls = "border-emerald-500 bg-emerald-950/40";
            else if (isCorrectChoice && !isSelected) cls = "border-emerald-700 bg-emerald-950/10";
            else if (!isCorrectChoice && isSelected) cls = "border-red-500 bg-red-950/30";
            else cls = "border-slate-800 opacity-60";
          }
          return (
            <button
              key={i}
              data-testid={`mr-option-${i}`}
              onClick={() => toggle(i)}
              disabled={revealed}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg border transition ${cls}`}
            >
              <span
                className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                  isSelected ? "bg-sky-500 border-sky-400" : "border-slate-600"
                }`}
              >
                {isSelected ? "✓" : ""}
              </span>
              <span>{c}</span>
            </button>
          );
        })}
      </div>
      {!revealed && <SubmitBar canSubmit={selected.size > 0} onSubmit={submit} hint={`${selected.size} selected`} />}
    </div>
  );
}

// ---------------------------------------------------------------------
// build_list — tap an unplaced step to append it; tap a placed step to
// remove it back to the pool; up/down buttons fix ordering without a
// full remove/re-add cycle. No native drag — see file header.
// ---------------------------------------------------------------------
function BuildListItem({ question, revealed, showCorrectness, onCommit }) {
  const display = useMemo(() => randomizeBuildListPresentation(question), [question]);
  const [placed, setPlaced] = useState([]); // array of display indices, in chosen order

  const unplacedIdxs = display.displaySteps.map((_, i) => i).filter((i) => !placed.includes(i));

  const place = (displayIdx) => {
    if (revealed) return;
    setPlaced((p) => [...p, displayIdx]);
  };
  const unplace = (displayIdx) => {
    if (revealed) return;
    setPlaced((p) => p.filter((i) => i !== displayIdx));
  };
  const move = (pos, dir) => {
    if (revealed) return;
    setPlaced((p) => {
      const next = [...p];
      const swapWith = pos + dir;
      if (swapWith < 0 || swapWith >= next.length) return p;
      [next[pos], next[swapWith]] = [next[swapWith], next[pos]];
      return next;
    });
  };

  const submit = () => {
    if (revealed || placed.length !== display.displaySteps.length) return;
    const canonicalOrder = placed.map((displayIdx) => display.toCanonical[displayIdx]);
    const result = evaluateQuestionResponse(question, canonicalOrder);
    onCommit(result.correct, canonicalOrder);
  };

  const canonicalCorrectOrder = showCorrectness
    ? question.correctOrder.map((canonIdx) => question.steps[canonIdx])
    : null;

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500">Tap steps below, in order, to build the sequence.</div>

      <div>
        <div className="text-xs text-slate-500 mb-1">Your sequence</div>
        <div className="space-y-1.5 min-h-[2.5rem]">
          {placed.length === 0 && <div className="text-sm text-slate-600 italic px-2 py-2">Nothing placed yet</div>}
          {placed.map((displayIdx, pos) => (
            <div
              key={displayIdx}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-sky-700 bg-sky-950/20"
            >
              <span className="text-xs text-slate-500 w-5 shrink-0">{pos + 1}.</span>
              <span className="flex-1 text-sm">{display.displaySteps[displayIdx]}</span>
              {!revealed && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => move(pos, -1)}
                    disabled={pos === 0}
                    aria-label="Move up"
                    className="w-7 h-7 rounded border border-slate-700 hover:border-slate-500 disabled:opacity-30 text-xs"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(pos, 1)}
                    disabled={pos === placed.length - 1}
                    aria-label="Move down"
                    className="w-7 h-7 rounded border border-slate-700 hover:border-slate-500 disabled:opacity-30 text-xs"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => unplace(displayIdx)}
                    aria-label="Remove"
                    className="w-7 h-7 rounded border border-slate-700 hover:border-red-500 hover:text-red-400 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {!revealed && unplacedIdxs.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-1">Available steps</div>
          <div className="space-y-1.5">
            {unplacedIdxs.map((displayIdx) => (
              <button
                key={displayIdx}
                data-testid={`bl-unplaced-${displayIdx}`}
                onClick={() => place(displayIdx)}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-sm"
              >
                {display.displaySteps[displayIdx]}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCorrectness && (
        <div>
          <div className="text-xs text-slate-500 mb-1">Correct sequence</div>
          <div className="space-y-1.5">
            {canonicalCorrectOrder.map((s, i) => (
              <div key={i} className="px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-950/20 text-sm">
                {i + 1}. {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {!revealed && <SubmitBar canSubmit={placed.length === display.displaySteps.length} onSubmit={submit} hint={`${placed.length}/${display.displaySteps.length} placed`} />}
    </div>
  );
}

// ---------------------------------------------------------------------
// drag_drop — tap an item to select it, tap a category to place the
// selected item there. Tap a placed item to unplace it.
// ---------------------------------------------------------------------
function DragDropItem({ question, revealed, showCorrectness, onCommit }) {
  const items = useMemo(() => randomizeDragDropItemOrder(question), [question]);
  const [placement, setPlacement] = useState({}); // itemId -> categoryId
  const [selectedItemId, setSelectedItemId] = useState(null);

  const selectItem = (itemId) => {
    if (revealed) return;
    setSelectedItemId((cur) => (cur === itemId ? null : itemId));
  };
  const placeSelected = (categoryId) => {
    if (revealed || !selectedItemId) return;
    setPlacement((p) => ({ ...p, [selectedItemId]: categoryId }));
    setSelectedItemId(null);
  };
  const unplace = (itemId) => {
    if (revealed) return;
    setPlacement((p) => {
      const next = { ...p };
      delete next[itemId];
      return next;
    });
  };

  const submit = () => {
    if (revealed || Object.keys(placement).length !== items.length) return;
    const result = evaluateQuestionResponse(question, placement);
    onCommit(result.correct, placement);
  };

  const unplacedItems = items.filter((it) => !(it.id in placement));

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500">
        {selectedItemId ? "Now tap a category to place it." : "Tap an item, then tap the category it belongs in."}
      </div>

      {unplacedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {unplacedItems.map((it) => (
            <button
              key={it.id}
              data-testid={`dd-item-${it.id}`}
              onClick={() => selectItem(it.id)}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                selectedItemId === it.id ? "border-sky-400 bg-sky-950/40 ring-1 ring-sky-500" : "border-slate-700 hover:border-slate-500"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {question.categories.map((cat) => {
          const inCat = items.filter((it) => placement[it.id] === cat.id);
          const wrong = showCorrectness && inCat.some((it) => it.correctCategory !== cat.id);
          return (
            <div
              key={cat.id}
              className={`rounded-lg border p-3 min-h-[5rem] transition ${
                showCorrectness ? (wrong ? "border-red-600 bg-red-950/10" : "border-emerald-700 bg-emerald-950/10") : "border-slate-700"
              }`}
            >
              {/* A SEPARATE element from the placed-item chips below, on
                  purpose — nesting an item's own unplace click target
                  inside the same button used to PLACE a new item let a
                  tap near an existing chip accidentally hit the category's
                  own onClick and re-place/unplace the wrong thing (found
                  via a real automated click-through, not theorized). */}
              <button
                data-testid={`dd-category-${cat.id}`}
                onClick={() => placeSelected(cat.id)}
                disabled={revealed || !selectedItemId}
                className={`w-full text-left text-sm font-semibold mb-2 pb-1 border-b transition ${
                  !revealed && selectedItemId ? "border-sky-600 text-sky-300" : "border-slate-700"
                }`}
              >
                {cat.label}
                {!revealed && selectedItemId && <span className="ml-2 text-xs font-normal text-sky-400">tap to place here</span>}
              </button>
              <div className="space-y-1">
                {inCat.map((it) => {
                  const itemWrong = showCorrectness && it.correctCategory !== cat.id;
                  return (
                    <button
                      key={it.id}
                      data-testid={`dd-placed-${it.id}`}
                      onClick={() => unplace(it.id)}
                      disabled={revealed}
                      className={`block w-full text-left text-xs px-2 py-1.5 rounded border ${
                        showCorrectness
                          ? itemWrong
                            ? "border-red-600 bg-red-950/30 text-red-300"
                            : "border-emerald-700 bg-emerald-950/30 text-emerald-200"
                          : revealed
                          ? "border-slate-800 bg-slate-800/60 opacity-60"
                          : "border-slate-600 bg-slate-800 hover:border-red-500"
                      }`}
                      title={revealed ? undefined : "Tap to move back"}
                    >
                      {it.label}
                      {itemWrong && <span className="ml-1 text-red-400">(belongs in {question.categories.find((c) => c.id === it.correctCategory)?.label})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!revealed && <SubmitBar canSubmit={Object.keys(placement).length === items.length} onSubmit={submit} hint={`${Object.keys(placement).length}/${items.length} placed`} />}
    </div>
  );
}

// ---------------------------------------------------------------------
// options_table — per-row radio-style option pick.
// ---------------------------------------------------------------------
function OptionsTableItem({ question, revealed, showCorrectness, onCommit }) {
  const rows = useMemo(() => randomizeOptionsTableRowOrder(question), [question]);
  const [picks, setPicks] = useState({}); // rowId -> optionIndex

  const pick = (rowId, optionIndex) => {
    if (revealed) return;
    setPicks((p) => ({ ...p, [rowId]: optionIndex }));
  };

  const submit = () => {
    if (revealed || Object.keys(picks).length !== rows.length) return;
    const result = evaluateQuestionResponse(question, picks);
    onCommit(result.correct, picks);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1.5">
          <tbody>
            {rows.map((row) => {
              const options = row.options || question.options;
              const picked = picks[row.id];
              return (
                <tr key={row.id}>
                  <td className="pr-3 py-2 align-middle">{row.finding}</td>
                  {options.map((opt, oi) => {
                    const isPicked = picked === oi;
                    const isCorrect = row.correctOptionIndex === oi;
                    let cls = isPicked ? "border-sky-500 bg-sky-950/30" : "border-slate-700 hover:border-slate-500";
                    if (showCorrectness) {
                      if (isCorrect) cls = "border-emerald-500 bg-emerald-950/40";
                      else if (isPicked) cls = "border-red-500 bg-red-950/30";
                      else cls = "border-slate-800 opacity-50";
                    } else if (revealed) {
                      cls = isPicked ? "border-slate-400 bg-slate-800" : "border-slate-800 opacity-50";
                    }
                    return (
                      <td key={oi} className="px-1 py-2 align-middle">
                        <button
                          data-testid={`ot-option-${row.id}-${oi}`}
                          onClick={() => pick(row.id, oi)}
                          disabled={revealed}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-lg border text-xs transition ${cls}`}
                        >
                          {opt}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!revealed && <SubmitBar canSubmit={Object.keys(picks).length === rows.length} onSubmit={submit} hint={`${Object.keys(picks).length}/${rows.length} answered`} />}
    </div>
  );
}

const RENDERERS = {
  multiple_choice: MultipleChoiceItem,
  multiple_response: MultipleResponseItem,
  build_list: BuildListItem,
  drag_drop: DragDropItem,
  options_table: OptionsTableItem,
};

// ---------------------------------------------------------------------
// Public component. `onAnswered(correct, response)` fires exactly once,
// the moment the item is scored (MCQ: on click; every other type: on
// Submit). After that this component switches to its own revealed state
// and shows the explanation — the caller decides what happens next
// (SRS scheduling, advancing to the next item, etc.), same division of
// responsibility MCQPracticeTab.jsx's own QuestionView already uses.
// ---------------------------------------------------------------------
// `deferred`: when true (the adaptive exam's "deferred" reveal-mode
// setting — see AdaptiveTestTab.jsx), the response still commits and
// scores immediately (onAnswered still fires right away, exactly as it
// always does — the exam's own ability estimate can't wait), but the
// player sees a neutral "answer recorded" acknowledgment instead of
// correct/incorrect coloring or the explanation, matching the native MCQ
// path's own existing deferred behavior in both MCQPracticeTab.jsx-style
// tabs. `showCorrectness` (revealed && !deferred) is threaded down to
// every per-type renderer so ITS OWN choice/placement coloring respects
// the same rule, not just this wrapper's own summary block.
export default function QuestionRenderer({ question, onAnswered, showExplanation = true, deferred = false, children }) {
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(null);
  const showCorrectness = revealed && !deferred;

  const Renderer = RENDERERS[itemTypeOf(question)];
  if (!Renderer) {
    return <div className={CARD}>Unsupported item type: {String(question.itemType)}</div>;
  }

  const commit = (correct, response) => {
    setWasCorrect(correct);
    setRevealed(true);
    onAnswered?.(correct, response);
  };

  return (
    <div className={CARD} data-testid="question-renderer" data-item-type={itemTypeOf(question)}>
      <GraphicPanel graphic={question.graphic} />
      <div className="text-lg font-medium mb-4">{question.question}</div>
      <Renderer question={question} revealed={revealed} showCorrectness={showCorrectness} onCommit={commit} />
      {revealed && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          {deferred ? (
            <div data-testid="question-result" className="text-sm text-slate-400">
              Answer recorded. You'll see how you did once the exam is over.
            </div>
          ) : (
            <>
              <div data-testid="question-result" className={`text-sm font-semibold ${wasCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {wasCorrect ? "Correct" : "Incorrect"}
              </div>
              {showExplanation && <div className="text-sm text-slate-300">{question.explanation}</div>}
            </>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
