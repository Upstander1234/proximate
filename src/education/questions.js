// ============================================================================
// NREMT PRACTICE QUESTION BANK
// ============================================================================
// To add a question, just push another object onto QUESTIONS below. Shape:
//
// {
//   id: "unique-string-id",       // never reuse/change once a card exists,
//                                  // it's the key progress is tracked under
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

export const LEVELS = ["EMR", "EMT", "AEMT", "Paramedic", "Other"];

// Which domain buttons show up on the dashboard for a given certification
// level. EMT is split exactly as requested: Airway, Cardiology, Trauma,
// Medical + OBGYN, EMS Operations. Other levels default to the same five
// until level-specific content/splits are added — extend this map (and add
// questions tagged with that `level`) whenever that's wanted.
export const DOMAINS_BY_LEVEL = {
  EMR: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  EMT: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  AEMT: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  Paramedic: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  Other: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
};

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
//   blueprintCategory: "primaryAssessment", // optional — one of the keys in
//                                    // contentBlueprint.js's BLUEPRINT_CATEGORIES
//                                    // (sceneSafety/primaryAssessment/
//                                    // secondaryAssessment/treatmentTransport/
//                                    // operations). Overrides the domain-based
//                                    // heuristic default when the heuristic
//                                    // would miscategorize this specific
//                                    // question (e.g. a Cardiology question
//                                    // that's actually testing scene safety).
//                                    // Omit to fall back to the heuristic.
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




