// ============================================================================
// NREMT PRACTICE QUESTION BANK
// ============================================================================
// To add a question, just push another object onto QUESTIONS below. Shape:
//
// {
//   id: "unique-string-id",       // never reuse/change once a card exists,
//                                  // it's the key progress is tracked under.
//                                  // Must be unique across ALL level files
//                                  // (questionsEMR.js, questionsEMT.js,
//                                  // questionsAEMT.js, questionsParamedic.js,
//                                  // questionsOther.js combined), not just
//                                  // within one file -- QUESTIONS below is
//                                  // their concatenation, and a duplicate id
//                                  // in two files makes those cards share
//                                  // progress state. Prefix ids with the
//                                  // level (e.g. "emr-airway-001") if there's
//                                  // any chance another file reuses the same
//                                  // domain-based scheme.
//   domain: "Airway",              // must be one of DOMAINS_BY_LEVEL[level] below
//   level: "EMT",                  // one of LEVELS below: EMR, EMT, AEMT, Paramedic, Other
//   question: "...",
//   choices: ["A answer", "B answer", "C answer", "D answer"],
//   answerIndex: 0,                 // index into choices
//   explanation: "Why the answer is correct, and why the others are wrong.",
// }
//
// The dashboard first asks which certification level (EMR/EMT/AEMT/
// Paramedic/Other) to study, then shows that level's domain buttons (see
// DOMAINS_BY_LEVEL below) and only that level's questions.
// ============================================================================

// The four core EMS certification exams — the progression every
// diagnostic/adaptive-exam/campaign mechanic assumes a straight ladder
// through (EMR -> EMT -> AEMT -> Paramedic). Never add a non-core level to
// this array — see OTHER_PROVIDER_LEVELS below for anything else.
export const CORE_LEVELS = ["EMR", "EMT", "AEMT", "Paramedic"];

// Real, recognizable EMS/prehospital provider levels and certification
// exams OUTSIDE the core EMR->EMT->AEMT->Paramedic ladder — grouped
// separately in the UI as "Other Provider Practice" (never treated as a
// single undifferentiated "Other" bucket, and never mixed into the core
// ladder above). Each is its own selectable level with its own question
// pool, even while that pool is empty (see EducationApp/MCQPracticeTab's
// "no questions available yet — submit some" empty-state handling).
export const OTHER_PROVIDER_LEVELS = [
  "Wilderness First Responder",
  "Critical Care Paramedic",
  "Flight/Transport Medic",
  "Tactical EMS",
  "Community Paramedicine",
];

// The full flat list — most of the codebase (question pool filtering,
// level dropdowns, etc.) only needs "every level that exists" and doesn't
// care about the core/other distinction; CORE_LEVELS/OTHER_PROVIDER_LEVELS
// above are for the two UI spots that must visually separate them.
export const LEVELS = [...CORE_LEVELS, ...OTHER_PROVIDER_LEVELS];

// Which domain buttons show up on the dashboard for a given certification
// level. EMT is split exactly as requested: Airway, Cardiology, Trauma,
// Medical + OBGYN, EMS Operations. Every other level (core or Other
// Provider Practice) defaults to the same five until level-specific
// content/splits are added — extend this map (and add questions tagged
// with that `level`) whenever that's wanted.
const DEFAULT_DOMAINS = ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"];
export const DOMAINS_BY_LEVEL = Object.fromEntries(LEVELS.map((lvl) => [lvl, DEFAULT_DOMAINS]));

// Back-compat flat list (union of every level's domains), still useful for
// anything that wants "every domain that exists" regardless of level.
export const DOMAINS = [...new Set(Object.values(DOMAINS_BY_LEVEL).flat())];

// ----------------------------------------------------------------------------
// TEMPLATE — copy this block, fill it in, and paste it into QUESTIONS below.
// ----------------------------------------------------------------------------
// {
//   id: "domain-prefix-###",        // e.g. "airway-012", "ops-007" — pick the
//                                    // next unused number for that domain's
//                                    // prefix (see the existing entries below
//                                    // for the prefix each domain uses)
//   domain: "Airway",                // must match a value in DOMAINS_BY_LEVEL
//   level: "EMT",                    // EMR, EMT, AEMT, Paramedic, or Other
//   blueprintCategory: "primaryAssessment", //One of the keys in
//                                    // contentBlueprint.js's BLUEPRINT_CATEGORIES
//                                    // (sceneSafety/primaryAssessment/
//                                    // secondaryAssessment/treatmentTransport/
//                                    // operations). Overrides the domain-based
//                                    // heuristic default when the heuristic
//                                    // would miscategorize this specific
//                                    // question (e.g. a Cardiology question
//                                    // that's actually testing scene safety).
//                                    // Omit to fall back to the heuristic.
//   clinicalJudgment: true,          // optional, AEMT/Paramedic only — a
//                                    // CROSS-CUTTING attribute, not a
//                                    // category of its own (see
//                                    // contentBlueprint.js's header
//                                    // comment). Set true only if the
//                                    // question genuinely requires
//                                    // interpreting a presentation,
//                                    // prioritizing findings, choosing the
//                                    // next action, recognizing
//                                    // deterioration, integrating multiple
//                                    // findings, distinguishing competing
//                                    // diagnoses/actions, or making a
//                                    // transport/disposition decision —
//                                    // NOT simple factual recall. Set
//                                    // false if you've reviewed it and it
//                                    // is plain recall. Omit entirely if
//                                    // you aren't sure — an omitted value
//                                    // is treated as "unclassified," never
//                                    // guessed at or defaulted to false.
//   question:
//     "Full text of the question stem goes here.",
//   choices: [
//     "Choice A",
//     "Choice B",
//     "Choice C",
//     "Choice D",
//   ],
//   answerIndex: 0,                  // 0 = Choice A, 1 = Choice B, etc.
//   explanation:
//     "Explain why the correct answer is right and, briefly, why the other " +
//     "choices are wrong. This is shown to the user after they answer.",
// },
// ----------------------------------------------------------------------------
//
// NON-MULTIPLE-CHOICE ITEM TYPES — full field reference in
// src/education/itemTypes.js. Add `itemType` (omit for plain multiple
// choice) plus the fields that type needs. Every base-schema field above
// (id/domain/level/blueprintCategory/clinicalJudgment/explanation) still
// applies unchanged.
//
// DO NOT force a question into one of these just for format variety — use
// the type that actually measures the competency:
//   sequencing            -> build_list
//   categorization         -> drag_drop
//   classifying several findings at once -> options_table
//   "select all that apply" -> multiple_response
//   waveform/image interpretation -> graphical (a MODIFIER, see below)
//   evolving multi-step reasoning -> scenario (scenarioId/scenarioStage)
// If plain multiple choice already measures it, leave itemType out.
//
// --- multiple_response: 5 or 6 choices, 2 or 3 correct, no partial credit.
// {
//   ...base fields...,
//   itemType: "multiple_response",
//   question: "Which findings require immediate intervention?",
//   choices: ["Choice A", "Choice B", "Choice C", "Choice D", "Choice E"],
//   correctIndices: [0, 2],           // 2 or 3 of the 0-based choice indices
//   explanation: "...",
// },
//
// --- build_list: ordering/sequencing. Exact sequence required.
// {
//   ...base fields...,
//   itemType: "build_list",
//   question: "Place the following actions in the order they should be performed.",
//   steps: ["First step", "Second step", "Third step"],   // authored, canonical order
//   correctOrder: [0, 1, 2],          // usually [0,1,2,...] if steps is already
//                                      // written in the correct order — the UI
//                                      // shuffles the DISPLAY order, not this array
//   explanation: "...",
// },
//
// --- drag_drop: categorization into 2+ named categories. No partial credit.
// {
//   ...base fields...,
//   itemType: "drag_drop",
//   question: "Place each finding into the correct category.",
//   categories: [
//     { id: "immediate", label: "Immediate Life Threat" },
//     { id: "nonImmediate", label: "Non-Immediate Finding" },
//   ],
//   items: [
//     { id: "unique-item-id", label: "Finding text", correctCategory: "immediate" },
//     { id: "unique-item-id-2", label: "Finding text", correctCategory: "nonImmediate" },
//   ],
//   explanation: "...",
// },
//
// --- options_table: a row-by-row classification table. Dichotomous overall
//     (every row must be correct).
// {
//   ...base fields...,
//   itemType: "options_table",
//   question: "For each finding, identify whether it represents X or Y.",
//   options: ["Classification A", "Classification B"],   // shared by every row
//   rows: [
//     { id: "row-1", finding: "Finding text", correctOptionIndex: 0 },
//     { id: "row-2", finding: "Finding text", correctOptionIndex: 1 },
//   ],
//   explanation: "...",
// },
//
// --- graphical: a MODIFIER, composed with any type above (never standalone).
//     Add a `graphic` field to a multiple_choice/multiple_response/
//     options_table/etc. question — do not set itemType to "graphical".
// {
//   ...base fields..., itemType: "multiple_choice" (or any other type),
//   graphic: {
//     kind: "ecg" | "capnography" | "image" | "chart" | "label",
//     src: "/assets/education/graphics/....svg",   // a reference, not inline
//                                                    // image data
//     alt: "A plain-text description of what the graphic shows, for a11y "
//        + "and for any text-only fallback.",
//   },
//   choices: [...], answerIndex: 0,
//   explanation: "...",
// },
//
// --- scenario: links several items (any of the types above, mixed) under
//     one shared clinical case. Every linked item gets the SAME scenarioId;
//     scenarioStage marks where in the call this item occurs.
// {
//   ...base fields..., itemType: "multiple_choice" (or any other type),
//   scenarioId: "scenario-short-name-001",   // shared across every item in
//                                             // this case
//   scenarioStage: "en_route" | "scene" | "post_scene",
//   question: "...",   // include enough of the scenario's shared context
//                       // (dispatch info, findings so far) that this item
//                       // stands on its own
//   choices: [...], answerIndex: 0,
//   explanation: "...",
// },
//
// --- clinical judgment framework (AEMT/Paramedic-focused, optional, ADDS
//     to any item type above — never its own itemType):
//   clinicalJudgment: true,           // see the CROSS-CUTTING note further
//                                      // above in this comment
//   clinicalJudgmentStep:             // one of the six NREMT steps, only
//                                      // when the question maps cleanly
//                                      // onto one:
//     "recognize_cues" | "analyze_cues" | "define_hypothesis"
//     | "generate_solutions" | "take_action" | "evaluation"
// A genuine clinical-judgment item requires the candidate to INTEGRATE
// information and DECIDE, not just recall a fact — see this file's own
// `clinicalJudgment` guidance above. It can be multiple_choice,
// multiple_response, build_list, drag_drop, or options_table; it is a tag
// on top of one of those, not a sixth format.
// ----------------------------------------------------------------------------

import { EMR_QUESTIONS } from "./questionsEMR.js";
import { EMT_QUESTIONS } from "./questionsEMT.js";
import { AEMT_QUESTIONS } from "./questionsAEMT.js";
import { PARAMEDIC_QUESTIONS } from "./questionsParamedic.js";
import { OTHER_QUESTIONS } from "./questionsOther.js";

// The combined bank, unchanged in shape from before the split — every
// consumer (`import { QUESTIONS } from "./questions.js"`) keeps working with
// no changes. Order is grouped by level rather than by original authoring
// order; nothing reads QUESTIONS positionally, so this is safe.
export const QUESTIONS = [
  ...EMR_QUESTIONS,
  ...EMT_QUESTIONS,
  ...AEMT_QUESTIONS,
  ...PARAMEDIC_QUESTIONS,
  ...OTHER_QUESTIONS,
];




