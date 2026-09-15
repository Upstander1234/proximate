// Non-browser automated test for the multi-type question submission
// form's own draft-shaping logic (submitQuestionDrafts.js). Exists
// because the real form is gated behind a signed-in, non-guest Firebase
// user (crowdsource.js) — a flow this environment has no credentials to
// script headlessly through a browser — so the pure logic driving what
// gets submitted is verified directly here instead, the same "the pure
// logic is the real coverage, browser E2E isn't reachable for this one"
// posture used elsewhere for local-LLM/WebGPU-gated features.
//
// Run: node src/scripts/verifySubmitQuestionDrafts.mjs

import { blankDraftFor, textFieldsFilled, finalizeDraft, ITEM_TYPE_LABELS } from "../education/submitQuestionDrafts.js";
import { ITEM_TYPES, validateItemTypeShape } from "../education/itemTypes.js";
import { evaluateQuestionResponse } from "../education/evaluateResponse.js";

let passed = 0;
let failed = 0;
const failures = [];

function assert(label, cond) {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(label);
    console.error(`FAIL: ${label}`);
  }
}

// A real, filled-in draft per type — mirrors what a real author would
// produce by typing into the form's own fields, not a synthetic edge case.
function filledDraftFor(itemType) {
  const d = blankDraftFor(itemType);
  d.question = "A patient presents with a chief complaint requiring assessment.";
  d.explanation = "This is the reasoning a reviewer would read to judge medical accuracy.";
  switch (itemType) {
    case "multiple_response":
      d.choices = ["Finding A", "Finding B", "Finding C", "Finding D", "Finding E"];
      d.correctIndices = [0, 2];
      break;
    case "build_list":
      d.steps = ["First action", "Second action", "Third action"];
      break;
    case "drag_drop":
      d.categories = [
        { id: "cat-0", label: "Immediate" },
        { id: "cat-1", label: "Non-Immediate" },
      ];
      d.items = [
        { id: "item-0", label: "Item one", correctCategory: "cat-0" },
        { id: "item-1", label: "Item two", correctCategory: "cat-1" },
      ];
      break;
    case "options_table":
      d.options = ["Expected", "Abnormal"];
      d.rows = [
        { id: "row-0", finding: "Finding one", correctOptionIndex: 0 },
        { id: "row-1", finding: "Finding two", correctOptionIndex: 1 },
      ];
      break;
    default:
      d.choices = ["Choice A", "Choice B", "Choice C", "Choice D"];
      d.answerIndex = 1;
  }
  return d;
}

// ---------------------------------------------------------------------
// ITEM_TYPE_LABELS covers exactly the real item types (no stray/missing
// entries) — a mismatch here would leave the form's own type picker
// either offering a type it can't build a draft for, or missing one.
// ---------------------------------------------------------------------
assert(
  "ITEM_TYPE_LABELS has exactly one entry per real item type, no more no less",
  ITEM_TYPES.every((t) => typeof ITEM_TYPE_LABELS[t] === "string") && Object.keys(ITEM_TYPE_LABELS).length === ITEM_TYPES.length
);

// ---------------------------------------------------------------------
// Per item type: blank draft is real (has itemType set correctly),
// blank draft correctly fails textFieldsFilled, a real filled-in draft
// passes it, and finalizeDraft's OUTPUT passes the actual, real
// validateItemTypeShape — the same validator crowdsource.js/
// AdminReviewTab.jsx use, so this is proof the form can produce
// something that will actually be ACCEPTED for submission and approval,
// not just something that looks plausible.
// ---------------------------------------------------------------------
for (const itemType of ITEM_TYPES) {
  const blank = blankDraftFor(itemType);
  assert(`${itemType}: blankDraftFor sets the correct itemType`, blank.itemType === itemType);
  assert(`${itemType}: blank draft fails textFieldsFilled (nothing typed yet)`, textFieldsFilled(blank) === false);

  const filled = filledDraftFor(itemType);
  assert(`${itemType}: filled draft passes textFieldsFilled`, textFieldsFilled(filled) === true);

  const finalized = finalizeDraft(filled);
  const result = validateItemTypeShape(finalized);
  assert(`${itemType}: finalized draft passes validateItemTypeShape — ${result.errors.join("; ")}`, result.valid);

  // A short question/explanation (<=10 chars) must correctly block
  // submission for every type, not just the default (multiple_choice).
  const tooShort = { ...filled, question: "Short?", explanation: "Too short." };
  assert(`${itemType}: a too-short question stem fails textFieldsFilled`, textFieldsFilled(tooShort) === false);
}

// ---------------------------------------------------------------------
// build_list: correctOrder is DERIVED from authoring order, and a
// finalized draft actually SCORES correctly through the real evaluator
// (proof the derivation is right, not just shaped right) — an author
// who reorders steps before finalizing gets a correctOrder that matches.
// ---------------------------------------------------------------------
{
  const draft = filledDraftFor("build_list");
  draft.steps = ["Confirm safety", "Assess responsiveness", "Open airway", "Check pulse"];
  const finalized = finalizeDraft(draft);
  assert("build_list: correctOrder is the identity permutation of the authored steps", finalized.correctOrder.every((v, i) => v === i));
  assert(
    "build_list: submitting the SAME order as authored scores correct via the real evaluator",
    evaluateQuestionResponse(finalized, [0, 1, 2, 3]).correct === true
  );
  assert(
    "build_list: a shuffled response scores incorrect via the real evaluator",
    evaluateQuestionResponse(finalized, [1, 0, 2, 3]).correct === false
  );
}

// ---------------------------------------------------------------------
// multiple_response: correctIndices survive finalizeDraft unchanged, and
// the finalized draft scores correctly both ways via the real evaluator.
// ---------------------------------------------------------------------
{
  const draft = filledDraftFor("multiple_response");
  const finalized = finalizeDraft(draft);
  assert(
    "multiple_response: submitting exactly the authored correct set scores correct",
    evaluateQuestionResponse(finalized, finalized.correctIndices).correct === true
  );
  assert(
    "multiple_response: submitting only PART of the correct set scores incorrect",
    evaluateQuestionResponse(finalized, [finalized.correctIndices[0]]).correct === false
  );
}

// ---------------------------------------------------------------------
// drag_drop: a finalized draft scores correctly through the real
// evaluator using the exact correctCategory values the author picked via
// the dropdown (id-based, never the display label).
// ---------------------------------------------------------------------
{
  const draft = filledDraftFor("drag_drop");
  const finalized = finalizeDraft(draft);
  const correctPlacement = Object.fromEntries(finalized.items.map((it) => [it.id, it.correctCategory]));
  assert(
    "drag_drop: placing every item in its authored correct category scores correct",
    evaluateQuestionResponse(finalized, correctPlacement).correct === true
  );
  const wrongPlacement = { ...correctPlacement, [finalized.items[0].id]: finalized.categories[1].id === finalized.items[0].correctCategory ? finalized.categories[0].id : finalized.categories[1].id };
  assert(
    "drag_drop: one wrong placement scores incorrect",
    evaluateQuestionResponse(finalized, wrongPlacement).correct === false
  );
}

// ---------------------------------------------------------------------
// options_table: a finalized draft scores correctly through the real
// evaluator using the row ids and correctOptionIndex values the author
// picked via the dropdown.
// ---------------------------------------------------------------------
{
  const draft = filledDraftFor("options_table");
  const finalized = finalizeDraft(draft);
  const correctPicks = Object.fromEntries(finalized.rows.map((r) => [r.id, r.correctOptionIndex]));
  assert(
    "options_table: picking every row's authored correct option scores correct",
    evaluateQuestionResponse(finalized, correctPicks).correct === true
  );
  const wrongPicks = { ...correctPicks, [finalized.rows[0].id]: (finalized.rows[0].correctOptionIndex + 1) % finalized.options.length };
  assert(
    "options_table: one wrong pick scores incorrect",
    evaluateQuestionResponse(finalized, wrongPicks).correct === false
  );
}

// ---------------------------------------------------------------------
// multiple_choice: unchanged baseline behavior, still correct after the
// extraction into submitQuestionDrafts.js.
// ---------------------------------------------------------------------
{
  const draft = filledDraftFor("multiple_choice");
  const finalized = finalizeDraft(draft);
  assert("multiple_choice: the authored answerIndex scores correct", evaluateQuestionResponse(finalized, finalized.answerIndex).correct === true);
  assert("multiple_choice: any other index scores incorrect", evaluateQuestionResponse(finalized, (finalized.answerIndex + 1) % 4).correct === false);
}

// ---------------------------------------------------------------------
// Text trimming — an author pasting from a word processor with stray
// whitespace should not have it silently ship into a real question.
// ---------------------------------------------------------------------
{
  const draft = filledDraftFor("multiple_choice");
  draft.question = "  Leading and trailing whitespace in the stem.  ";
  draft.explanation = "  Leading and trailing whitespace in the explanation.  ";
  draft.choices = draft.choices.map((c) => `  ${c}  `);
  const finalized = finalizeDraft(draft);
  assert("trimming: question stem has no leading/trailing whitespace", finalized.question === finalized.question.trim());
  assert("trimming: explanation has no leading/trailing whitespace", finalized.explanation === finalized.explanation.trim());
  assert("trimming: every choice has no leading/trailing whitespace", finalized.choices.every((c) => c === c.trim()));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:\n  " + failures.join("\n  "));
  process.exit(1);
}
