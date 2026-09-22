// NREMT-aligned item types — the smallest addition needed to let a
// question be something other than a 4-choice MCQ, reusing the existing
// question schema (id/domain/level/blueprintCategory/clinicalJudgment/
// explanation) rather than duplicating it. See questions.js's own template
// comment for the base schema; this file only documents the NEW,
// item-type-specific fields layered on top of it.
//
// Every question keeps working with ZERO changes: `itemType` defaults to
// "multiple_choice" wherever it's read (see evaluateResponse.js), so the
// entire existing questionsEMT.js bank (1509 questions, no itemType field
// at all) is unaffected.
//
// ---------------------------------------------------------------------
// ITEM TYPE — one new field, added to the base schema:
//
//   itemType: "multiple_choice"   // default if omitted — every existing
//                                  // question is implicitly this
//            | "multiple_response"
//            | "build_list"
//            | "drag_drop"
//            | "options_table"
//            | "graphical"        // NOT standalone — always paired with
//                                  // one of the above via a `graphic` field
//            | "scenario"         // a scenario STAGE — see scenarioId/
//                                  // scenarioStage below; the stage's own
//                                  // itemType is still one of the above
//
// Clinical judgment is NOT its own itemType (per the NREMT framework — a
// clinical-judgment item can be MCQ, multiple-response, build-list,
// drag-drop, or options-table). It stays exactly what it already was: the
// existing cross-cutting `clinicalJudgment` boolean, now optionally paired
// with `clinicalJudgmentStep` below for AEMT/Paramedic content.
//
// ---------------------------------------------------------------------
// SHAPE PER ITEM TYPE (fields beyond the base schema):
//
// multiple_choice (default, unchanged):
//   choices: [4 strings], answerIndex: number
//
// multiple_response:
//   choices: [5 or 6 strings], correctIndices: [2 or 3 numbers]
//   Scoring is all-or-nothing — the full correct set, no partial credit.
//
// build_list:
//   steps: [string, ...]           // presented shuffled
//   correctOrder: [number, ...]    // canonical (0-based) index order
//   Scoring: exact sequence required, no partial credit.
//
// drag_drop:
//   categories: [{ id, label }, ...]
//   items: [{ id, label, correctCategory }, ...]   // correctCategory is a
//                                                    // categories[].id
//   Scoring: every item placed in its correct category, no partial credit.
//
// options_table:
//   rows: [{ id, finding, options: [string,...], correctOptionIndex }, ...]
//   Every row shares the same `options` list unless a row supplies its own.
//   Scoring: dichotomous overall — every row correct, no partial credit
//   (matches NREMT's own item-level scoring for this format).
//
// graphical (a MODIFIER, composed with any of the above, never alone):
//   graphic: { kind: "ecg"|"capnography"|"image"|"chart"|"label", src, alt }
//   or, for a rhythm drawn from the game's own monitor waveforms (src/ecg.js):
//   graphic: { kind: "ecg", rhythm: "VT", alt }   // no src needed
//   e.g. { itemType: "multiple_choice", graphic: {...}, choices: [...] }
//
// scenario (a linking field set, not its own answer shape):
//   scenarioId: string             // groups several items under one case
//   scenarioStage: "en_route" | "scene" | "post_scene"
//   The item's own itemType/choices/etc. are still whichever real format
//   (mcq/multiple_response/build_list/...) that stage actually uses.
//
// ---------------------------------------------------------------------
// CLINICAL JUDGMENT FRAMEWORK (AEMT/Paramedic-focused, optional):
//
//   clinicalJudgment: true,           // unchanged, cross-cutting (existing)
//   clinicalJudgmentStep:             // optional, one of the six NREMT
//     "recognize_cues"                // clinical-judgment-model steps
//     | "analyze_cues"
//     | "define_hypothesis"
//     | "generate_solutions"
//     | "take_action"
//     | "evaluation"
// ---------------------------------------------------------------------

import { BEATS } from "../ecg.js";

export const ITEM_TYPES = [
  "multiple_choice",
  "multiple_response",
  "build_list",
  "drag_drop",
  "options_table",
];

export const CLINICAL_JUDGMENT_STEPS = [
  "recognize_cues",
  "analyze_cues",
  "define_hypothesis",
  "generate_solutions",
  "take_action",
  "evaluation",
];

export const SCENARIO_STAGES = ["en_route", "scene", "post_scene"];

export function itemTypeOf(question) {
  return question.itemType || "multiple_choice";
}

// ---------------------------------------------------------------------
// Validation — the same "never silently corrupt downstream logic" posture
// contentBlueprint.js's own validateBlueprintQuestion uses. Called by the
// review/approval workflow (item 21 of the spec) and by the importer
// (item 22) before a question ever reaches a player.
// ---------------------------------------------------------------------
export function validateItemTypeShape(question) {
  const errors = [];
  const t = itemTypeOf(question);
  if (!ITEM_TYPES.includes(t)) {
    errors.push(`unknown itemType: ${JSON.stringify(question.itemType)}`);
    return { valid: false, errors };
  }

  if (question.graphic) {
    const g = question.graphic;
    if (g.kind === "ecg" && g.rhythm) {
      if (!Object.prototype.hasOwnProperty.call(BEATS, g.rhythm)) {
        errors.push(`ecg graphic rhythm ${JSON.stringify(g.rhythm)} is not a key of BEATS in ecg.js`);
      }
    } else if (!g.kind || !g.src) {
      errors.push("graphic requires both kind and src (or kind \"ecg\" with a rhythm)");
    }
  }

  if (question.scenarioId && question.scenarioStage && !SCENARIO_STAGES.includes(question.scenarioStage)) {
    errors.push(`invalid scenarioStage: ${JSON.stringify(question.scenarioStage)}`);
  }
  if (question.clinicalJudgmentStep && !CLINICAL_JUDGMENT_STEPS.includes(question.clinicalJudgmentStep)) {
    errors.push(`invalid clinicalJudgmentStep: ${JSON.stringify(question.clinicalJudgmentStep)}`);
  }
  if (question.clinicalJudgmentStep && question.clinicalJudgment !== true) {
    errors.push("clinicalJudgmentStep set without clinicalJudgment:true");
  }

  switch (t) {
    case "multiple_choice": {
      if (!Array.isArray(question.choices) || question.choices.length !== 4) {
        errors.push("multiple_choice requires exactly 4 choices");
      }
      if (typeof question.answerIndex !== "number" || question.answerIndex < 0 || question.answerIndex > 3) {
        errors.push("multiple_choice requires answerIndex in [0,3]");
      }
      break;
    }
    case "multiple_response": {
      const n = Array.isArray(question.choices) ? question.choices.length : 0;
      if (n !== 5 && n !== 6) errors.push("multiple_response requires 5 or 6 choices");
      const correct = question.correctIndices;
      if (!Array.isArray(correct) || correct.length < 2 || correct.length > 3) {
        errors.push("multiple_response requires 2 or 3 correctIndices");
      } else {
        if (new Set(correct).size !== correct.length) errors.push("multiple_response correctIndices has duplicates");
        if (correct.some((i) => i < 0 || i >= n)) errors.push("multiple_response correctIndices out of range");
      }
      break;
    }
    case "build_list": {
      const steps = question.steps;
      const order = question.correctOrder;
      if (!Array.isArray(steps) || steps.length < 3) errors.push("build_list requires at least 3 steps");
      if (!Array.isArray(order) || order.length !== (steps || []).length) {
        errors.push("build_list correctOrder must match steps length");
      } else if (new Set(order).size !== order.length || order.some((i) => i < 0 || i >= steps.length)) {
        errors.push("build_list correctOrder must be a permutation of the step indices");
      }
      break;
    }
    case "drag_drop": {
      const cats = question.categories;
      const items = question.items;
      if (!Array.isArray(cats) || cats.length < 2) errors.push("drag_drop requires at least 2 categories");
      if (!Array.isArray(items) || items.length < 2) {
        errors.push("drag_drop requires at least 2 items");
      } else if (Array.isArray(cats)) {
        const catIds = new Set(cats.map((c) => c.id));
        for (const it of items) {
          if (!it.id || !it.label) errors.push(`drag_drop item missing id/label: ${JSON.stringify(it)}`);
          if (!catIds.has(it.correctCategory)) errors.push(`drag_drop item ${it.id} has unknown correctCategory ${it.correctCategory}`);
        }
        if (new Set(items.map((i) => i.id)).size !== items.length) errors.push("drag_drop items have duplicate ids");
      }
      break;
    }
    case "options_table": {
      const rows = question.rows;
      if (!Array.isArray(rows) || rows.length < 2) {
        errors.push("options_table requires at least 2 rows");
      } else {
        for (const row of rows) {
          const opts = row.options || question.options;
          if (!row.id || !row.finding) errors.push(`options_table row missing id/finding: ${JSON.stringify(row)}`);
          if (!Array.isArray(opts) || opts.length < 2) errors.push(`options_table row ${row.id} needs at least 2 options`);
          if (typeof row.correctOptionIndex !== "number" || row.correctOptionIndex < 0 || row.correctOptionIndex >= (opts || []).length) {
            errors.push(`options_table row ${row.id} has invalid correctOptionIndex`);
          }
        }
        if (new Set(rows.map((r) => r.id)).size !== rows.length) errors.push("options_table rows have duplicate ids");
      }
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}
