// Non-browser automated test for the new NREMT item-type schema/scoring
// layer (src/education/itemTypes.js, evaluateResponse.js, randomize.js's
// new type-aware helpers). Run: node src/scripts/verifyItemTypes.mjs
//
// Covers every item type's scoring per queue item 23: correct answer,
// incorrect answer, and the type-specific edge cases the spec calls out
// (missing-one-correct-answer for multiple_response, wrong order for
// build_list, one-wrong-placement for drag_drop/options_table), plus
// schema validation and randomization round-trips. Every check confirms
// the normalized { correct: boolean } contract adaptive engines consume.

import { validateItemTypeShape, itemTypeOf } from "../education/itemTypes.js";
import { evaluateQuestionResponse, isResponseComplete } from "../education/evaluateResponse.js";
import {
  randomizePresentation,
  randomizeMultipleResponsePresentation,
  randomizeBuildListPresentation,
  randomizeDragDropItemOrder,
  randomizeOptionsTableRowOrder,
} from "../education/randomize.js";
import { EXAMPLE_ITEM_TYPE_QUESTIONS } from "../education/exampleItemTypeQuestions.js";

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

function byId(id) {
  const q = EXAMPLE_ITEM_TYPE_QUESTIONS.find((x) => x.id === id);
  if (!q) throw new Error(`fixture missing: ${id}`);
  return q;
}

// ---------------------------------------------------------------------
// Schema validation — every shipped example must be well-formed, and a
// deliberately-broken clone of each must be rejected.
// ---------------------------------------------------------------------
for (const q of EXAMPLE_ITEM_TYPE_QUESTIONS) {
  const result = validateItemTypeShape(q);
  assert(`schema valid: ${q.id} (${itemTypeOf(q)}) — ${result.errors.join("; ")}`, result.valid);
}

{
  const broken = { ...byId("itemtype-mr-001"), correctIndices: [0] }; // needs 2-3
  assert("multiple_response rejects a single correctIndex", !validateItemTypeShape(broken).valid);
}
{
  const broken = { ...byId("itemtype-bl-001"), correctOrder: [0, 1, 2] }; // length mismatch
  assert("build_list rejects a correctOrder length mismatch", !validateItemTypeShape(broken).valid);
}
{
  const q = byId("itemtype-dd-001");
  const broken = { ...q, items: [...q.items, { id: "bad", label: "x", correctCategory: "nope" }] };
  assert("drag_drop rejects an item with an unknown correctCategory", !validateItemTypeShape(broken).valid);
}
{
  const q = byId("itemtype-ot-001");
  const broken = { ...q, rows: [{ ...q.rows[0], correctOptionIndex: 99 }, ...q.rows.slice(1)] };
  assert("options_table rejects an out-of-range correctOptionIndex", !validateItemTypeShape(broken).valid);
}
assert("unknown itemType is rejected", !validateItemTypeShape({ itemType: "essay", choices: [] }).valid);

// ---------------------------------------------------------------------
// multiple_choice — unchanged behavior (every existing question in the
// real bank has no itemType field at all; itemTypeOf must default it).
// ---------------------------------------------------------------------
{
  const q = { id: "mc-plain", choices: ["a", "b", "c", "d"], answerIndex: 2 };
  assert("multiple_choice defaults itemType when absent", itemTypeOf(q) === "multiple_choice");
  assert("multiple_choice: correct answer scores correct", evaluateQuestionResponse(q, 2).correct === true);
  assert("multiple_choice: incorrect answer scores incorrect", evaluateQuestionResponse(q, 0).correct === false);
  assert("multiple_choice: no response scores incorrect", evaluateQuestionResponse(q, undefined).correct === false);

  const { displayChoices, toCanonical, displayAnswerIndex } = randomizePresentation(q);
  assert("multiple_choice randomize: same choices, different order allowed", displayChoices.length === 4);
  assert("multiple_choice randomize: toCanonical maps display->canonical correctly", toCanonical[displayAnswerIndex] === 2);
}

// ---------------------------------------------------------------------
// multiple_response
// ---------------------------------------------------------------------
{
  const q = byId("itemtype-mr-001");
  assert("multiple_response: exact correct set scores correct", evaluateQuestionResponse(q, [0, 2, 4]).correct === true);
  assert(
    "multiple_response: exact correct set, different order, scores correct",
    evaluateQuestionResponse(q, [4, 0, 2]).correct === true
  );
  assert("multiple_response: missing one correct answer scores incorrect", evaluateQuestionResponse(q, [0, 2]).correct === false);
  assert(
    "multiple_response: selecting an incorrect answer scores incorrect",
    evaluateQuestionResponse(q, [0, 2, 4, 1]).correct === false
  );
  assert(
    "multiple_response: selecting all answers scores incorrect (not the correct set)",
    evaluateQuestionResponse(q, [0, 1, 2, 3, 4, 5]).correct === false
  );
  assert("multiple_response: empty response scores incorrect", evaluateQuestionResponse(q, []).correct === false);
  assert("multiple_response: isResponseComplete false on empty", isResponseComplete(q, []) === false);
  assert("multiple_response: isResponseComplete true once something is picked", isResponseComplete(q, [0]) === true);

  const { displayChoices, toCanonical } = randomizeMultipleResponsePresentation(q);
  assert("multiple_response randomize: preserves choice count", displayChoices.length === q.choices.length);
  assert("multiple_response randomize: toCanonical is a permutation", new Set(toCanonical).size === q.choices.length);
}

// ---------------------------------------------------------------------
// build_list
// ---------------------------------------------------------------------
{
  const q = byId("itemtype-bl-001");
  assert("build_list: correct order scores correct", evaluateQuestionResponse(q, [0, 1, 2, 3, 4]).correct === true);
  assert("build_list: incorrect order scores incorrect", evaluateQuestionResponse(q, [1, 0, 2, 3, 4]).correct === false);
  assert("build_list: one swap scores incorrect (no partial credit)", evaluateQuestionResponse(q, [0, 1, 2, 4, 3]).correct === false);
  assert("build_list: short response scores incorrect", evaluateQuestionResponse(q, [0, 1, 2]).correct === false);

  const { displaySteps, toCanonical } = randomizeBuildListPresentation(q);
  assert("build_list randomize: starting order is shuffled/mapped consistently", displaySteps.length === q.steps.length);
  const reconstructed = toCanonical.map((canonicalIdx) => q.steps[canonicalIdx]);
  assert(
    "build_list randomize: toCanonical correctly reconstructs displaySteps from canonical steps",
    reconstructed.every((s, i) => s === displaySteps[i])
  );
}

// ---------------------------------------------------------------------
// drag_drop
// ---------------------------------------------------------------------
{
  const q = byId("itemtype-dd-001");
  const allCorrect = { "tension-pneumo": "immediate", "open-fracture": "nonImmediate", "flail-chest": "immediate", abrasion: "nonImmediate" };
  assert("drag_drop: all correct scores correct", evaluateQuestionResponse(q, allCorrect).correct === true);

  const oneWrong = { ...allCorrect, abrasion: "immediate" };
  assert("drag_drop: one incorrect placement scores incorrect", evaluateQuestionResponse(q, oneWrong).correct === false);

  const multipleWrong = { ...allCorrect, abrasion: "immediate", "open-fracture": "immediate" };
  assert("drag_drop: multiple incorrect placements scores incorrect", evaluateQuestionResponse(q, multipleWrong).correct === false);

  const missingOne = { "tension-pneumo": "immediate", "open-fracture": "nonImmediate", "flail-chest": "immediate" };
  assert("drag_drop: an unplaced item scores incorrect", evaluateQuestionResponse(q, missingOne).correct === false);

  const shuffledItems = randomizeDragDropItemOrder(q);
  assert("drag_drop randomize: item order is a permutation of the same items", new Set(shuffledItems.map((i) => i.id)).size === q.items.length);
}

// ---------------------------------------------------------------------
// options_table
// ---------------------------------------------------------------------
{
  const q = byId("itemtype-ot-001");
  const allCorrect = { "row-hr": 0, "row-neck": 1, "row-skin": 0, "row-loc": 1 };
  assert("options_table: all correct scores correct", evaluateQuestionResponse(q, allCorrect).correct === true);

  const oneWrong = { ...allCorrect, "row-neck": 0 };
  assert("options_table: one incorrect row scores incorrect", evaluateQuestionResponse(q, oneWrong).correct === false);

  const shuffledRows = randomizeOptionsTableRowOrder(q);
  assert("options_table randomize: row order is a permutation of the same rows", new Set(shuffledRows.map((r) => r.id)).size === q.rows.length);
}

// ---------------------------------------------------------------------
// graphical — a modifier composed with another type, not a standalone type.
// ---------------------------------------------------------------------
{
  const q = byId("itemtype-graphic-001");
  assert("graphical: itemType is the underlying type, not 'graphical'", itemTypeOf(q) === "multiple_choice");
  assert("graphical: scores via the underlying type's evaluator", evaluateQuestionResponse(q, 0).correct === true);
  assert("graphical: missing graphic src is rejected", !validateItemTypeShape({ ...q, graphic: { kind: "ecg" } }).valid);

  const noGraphicClone = { id: "mc-no-graphic", choices: q.choices, answerIndex: q.answerIndex };
  assert("graphical: absence of a graphic is valid for a plain multiple_choice item", validateItemTypeShape(noGraphicClone).valid);
}

// ---------------------------------------------------------------------
// scenario — multiple items sharing one scenarioId, different item types
// and stages, each still scores via its own real itemType.
// ---------------------------------------------------------------------
{
  const stage1 = byId("itemtype-scn-001a");
  const stage2 = byId("itemtype-scn-001b");
  assert("scenario: both stages share the same scenarioId", stage1.scenarioId === stage2.scenarioId);
  assert("scenario: stages carry distinct scenarioStage values", stage1.scenarioStage !== stage2.scenarioStage);
  assert("scenario: stages carry distinct itemTypes (not forced identical)", itemTypeOf(stage1) !== itemTypeOf(stage2));
  assert("scenario stage 1 (multiple_choice) scores correctly", evaluateQuestionResponse(stage1, 1).correct === true);
  assert(
    "scenario stage 2 (multiple_response) scores correctly",
    evaluateQuestionResponse(stage2, [0, 2, 3]).correct === true
  );
  assert("scenario: invalid scenarioStage is rejected", !validateItemTypeShape({ ...stage1, scenarioStage: "mid_call" }).valid);
}

// ---------------------------------------------------------------------
// evaluateQuestionResponse never throws on malformed input.
// ---------------------------------------------------------------------
{
  assert("evaluate: unknown itemType never throws", evaluateQuestionResponse({ itemType: "essay" }, "anything").correct === false);
  assert("evaluate: null question fields never throw", evaluateQuestionResponse({}, null).correct === false);
  assert(
    "evaluate: multiple_response with a garbage response never throws",
    evaluateQuestionResponse(byId("itemtype-mr-001"), "not an array").correct === false
  );
  assert(
    "evaluate: drag_drop with a garbage response never throws",
    evaluateQuestionResponse(byId("itemtype-dd-001"), "not an object").correct === false
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:\n  " + failures.join("\n  "));
  process.exit(1);
}
