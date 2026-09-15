// Normalized scoring for every item type — the single boundary between
// "however this item's UI collected an answer" and "was it correct." The
// adaptive engine (adaptiveEngine.js) and every practice UI should call
// evaluateQuestionResponse(question, response) and consume ONLY its
// {correct:boolean} return value; nothing downstream needs to know or care
// whether the item was MCQ, multiple-response, build-list, drag-drop, or
// an options-table. Every item type is dichotomous — correct/incorrect,
// no partial credit — per the NREMT's own item-level scoring convention.
//
// `response` shape is intentionally the plainest possible value per type,
// matching what a UI component naturally produces:
//   multiple_choice   -> canonical choice index (number)
//   multiple_response -> array of canonical choice indices
//   build_list        -> array of step indices, in the order the player
//                        placed them
//   drag_drop         -> { [itemId]: categoryId, ... }
//   options_table     -> { [rowId]: optionIndex, ... }
//
// Randomized DISPLAY order (randomize.js) must already be resolved back to
// canonical indices/ids before calling this — this module only ever
// compares canonical values, the same "canonical is authoritative"
// discipline randomize.js's own header comment establishes for MCQ.

import { itemTypeOf } from "./itemTypes.js";

function sameSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const v of sa) if (!sb.has(v)) return false;
  return true;
}

function evalMultipleChoice(question, response) {
  return { correct: response === question.answerIndex };
}

function evalMultipleResponse(question, response) {
  const selected = Array.isArray(response) ? response : [];
  return { correct: sameSet(selected, question.correctIndices) };
}

function evalBuildList(question, response) {
  const order = Array.isArray(response) ? response : [];
  const correct = question.correctOrder;
  if (order.length !== correct.length) return { correct: false };
  return { correct: order.every((v, i) => v === correct[i]) };
}

function evalDragDrop(question, response) {
  const placement = response && typeof response === "object" ? response : {};
  const items = question.items || [];
  if (items.length === 0) return { correct: false };
  for (const it of items) {
    if (placement[it.id] !== it.correctCategory) return { correct: false };
  }
  // every declared item must actually have been placed, not just the ones
  // that happen to be right — an omitted item is not silently "correct"
  return { correct: items.every((it) => Object.prototype.hasOwnProperty.call(placement, it.id)) };
}

function evalOptionsTable(question, response) {
  const picks = response && typeof response === "object" ? response : {};
  const rows = question.rows || [];
  if (rows.length === 0) return { correct: false };
  for (const row of rows) {
    if (picks[row.id] !== row.correctOptionIndex) return { correct: false };
  }
  return { correct: true };
}

const EVALUATORS = {
  multiple_choice: evalMultipleChoice,
  multiple_response: evalMultipleResponse,
  build_list: evalBuildList,
  drag_drop: evalDragDrop,
  options_table: evalOptionsTable,
};

// Returns { correct: boolean } — the ONLY thing the adaptive engine or any
// scoring/stats consumer should read. Never throws on a malformed
// question/response; an unrecognized itemType or missing answer key is
// scored incorrect rather than crashing a live exam (the same
// fail-safe-not-fail-open posture contentBlueprint.js's own
// filterValidForBlueprint uses for a malformed question).
export function evaluateQuestionResponse(question, response) {
  const type = itemTypeOf(question);
  const fn = EVALUATORS[type];
  if (!fn) return { correct: false };
  try {
    return fn(question, response);
  } catch {
    return { correct: false };
  }
}

// A response is "complete" (every required part answered) vs. merely
// "non-empty" — useful for a UI's own submit-button gating, distinct from
// correctness itself.
export function isResponseComplete(question, response) {
  const type = itemTypeOf(question);
  switch (type) {
    case "multiple_choice":
      return typeof response === "number";
    case "multiple_response":
      return Array.isArray(response) && response.length > 0;
    case "build_list":
      return Array.isArray(response) && response.length === (question.steps || []).length;
    case "drag_drop":
      return !!response && (question.items || []).every((it) => Object.prototype.hasOwnProperty.call(response, it.id));
    case "options_table":
      return !!response && (question.rows || []).every((r) => Object.prototype.hasOwnProperty.call(response, r.id));
    default:
      return false;
  }
}
