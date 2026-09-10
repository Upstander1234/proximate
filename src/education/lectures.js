// Lectures — explicitly WIP. No lecture content ships in this release; this
// file exists so a real lecture can be added later (Lecture -> Key Concepts
// -> Practice Questions, connected to real questions/SRS material) without
// redesigning the feature or its data shape.
//
// A lecture belongs to one EMT-B category (reusing the same domain
// taxonomy questions.js already uses, not a competing one) and one
// specific condition/topic within it — e.g. category "Cardiology", topic
// "Acute Coronary Syndrome", not a giant general "Cardiology" textbook
// chapter.
//
// Shape once a lecture exists:
// {
//   id: "cardiology-acs",
//   category: "Cardiology",              // matches questions.js's `domain`
//   topic: "Acute Coronary Syndrome",     // the specific condition/topic
//   title: "Recognizing and Managing ACS in the Field",
//   content: "...",                       // the lecture body (markdown-ish plain text)
//   keyTakeaways: ["...", "...", "..."],
//   relatedQuestionIds: ["cardio-004", ...], // ids into QUESTIONS/crowdsourced pool
// }

export const LECTURES = [];

// The category list a future lecture library will organize around —
// reusing DOMAINS_BY_LEVEL.EMT from questions.js rather than a new list,
// so a lecture's `category` is always a value that also identifies real
// practice questions the player can be routed straight into.
export { DOMAINS_BY_LEVEL as LECTURE_CATEGORIES_BY_LEVEL } from "./questions.js";
