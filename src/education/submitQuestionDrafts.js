// Pure draft-shaping logic for SubmitQuestionForm.jsx, kept in its own
// plain (non-JSX) module so it can be covered by a real, non-browser
// automated test (src/scripts/verifySubmitQuestionDrafts.mjs) rather than
// only ever exercised live through a signed-in Firebase auth flow this
// environment has no way to script headlessly.

import { DOMAINS_BY_LEVEL } from "./questions.js";

export const ITEM_TYPE_LABELS = {
  multiple_choice: "Multiple Choice",
  multiple_response: "Multiple Response (select all that apply)",
  build_list: "Build List (put steps in order)",
  drag_drop: "Drag & Drop (categorize)",
  options_table: "Options Table (classify each row)",
};

const EMPTY_BASE = { domain: DOMAINS_BY_LEVEL.EMT[0], question: "", explanation: "" };

// One blank starting draft per item type — see itemTypes.js's own header
// for the full field reference each of these shapes follows.
export function blankDraftFor(itemType) {
  switch (itemType) {
    case "multiple_response":
      return { ...EMPTY_BASE, itemType, choices: ["", "", "", "", ""], correctIndices: [] };
    case "build_list":
      return { ...EMPTY_BASE, itemType, steps: ["", "", ""] };
    case "drag_drop":
      return {
        ...EMPTY_BASE,
        itemType,
        categories: [
          { id: "cat-0", label: "" },
          { id: "cat-1", label: "" },
        ],
        items: [
          { id: "item-0", label: "", correctCategory: "cat-0" },
          { id: "item-1", label: "", correctCategory: "cat-0" },
        ],
      };
    case "options_table":
      return {
        ...EMPTY_BASE,
        itemType,
        options: ["", ""],
        rows: [
          { id: "row-0", finding: "", correctOptionIndex: 0 },
          { id: "row-1", finding: "", correctOptionIndex: 0 },
        ],
      };
    default:
      return { ...EMPTY_BASE, itemType: "multiple_choice", choices: ["", "", "", ""], answerIndex: 0 };
  }
}

// Plain non-empty-text checks on top of validateItemTypeShape's own
// structural rules (which don't care whether a string is empty, only
// whether the right fields/shape exist) — the same ">10 characters"
// substance bar this form already held authors to before item types
// existed, now applied per-type rather than assuming `choices` is the
// only place free text lives.
export function textFieldsFilled(draft) {
  if (draft.question.trim().length <= 10) return false;
  if (draft.explanation.trim().length <= 10) return false;
  switch (draft.itemType) {
    case "multiple_response":
      return draft.choices.every((c) => c.trim().length > 0);
    case "build_list":
      return draft.steps.every((s) => s.trim().length > 0);
    case "drag_drop":
      return draft.categories.every((c) => c.label.trim().length > 0) && draft.items.every((i) => i.label.trim().length > 0);
    case "options_table":
      return draft.options.every((o) => o.trim().length > 0) && draft.rows.every((r) => r.finding.trim().length > 0);
    default:
      return draft.choices.every((c) => c.trim().length > 0);
  }
}

// Trims and, for build_list, derives correctOrder from the authored order
// (per questions.js's own template guidance: author the steps already in
// the correct sequence — the PLAYER'S display order is what gets
// shuffled later, not the authoring order).
export function finalizeDraft(draft) {
  const d = { ...draft, question: draft.question.trim(), explanation: draft.explanation.trim() };
  if (d.itemType === "build_list") {
    d.steps = d.steps.map((s) => s.trim());
    d.correctOrder = d.steps.map((_, i) => i);
  } else if (d.itemType === "multiple_response") {
    d.choices = d.choices.map((c) => c.trim());
  } else if (d.itemType === "drag_drop") {
    d.categories = d.categories.map((c) => ({ ...c, label: c.label.trim() }));
    d.items = d.items.map((it) => ({ ...it, label: it.label.trim() }));
  } else if (d.itemType === "options_table") {
    d.options = d.options.map((o) => o.trim());
    d.rows = d.rows.map((r) => ({ ...r, finding: r.finding.trim() }));
  } else {
    d.choices = d.choices.map((c) => c.trim());
  }
  return d;
}
