// Question-exposure tracking, built on top of the SAME per-user progress
// store every other part of Education mode already uses (store.js /
// srs.js's card state) rather than a second, parallel history system.
//
// A question counts as "seen" the moment it is PRESENTED to the user, not
// only once they've answered it — MCQ Practice Mode, Adaptive Test Mode,
// and any future presentation context all write into this same progress
// object, so exposure is shared automatically across every mode.

import { blankCardState } from "./srs.js";

export function isExposed(progress, questionId) {
  return Boolean(progress && progress[questionId]);
}

// Call as soon as a question is shown on screen (before the user answers).
// If the question has no card state yet, this creates one with `exposed`/
// `firstSeenAt` set, so the exposure is recorded even if the user never
// answers (closes the tab, abandons the session, etc). If a card state
// already exists (from a prior exposure or a prior answer), this is a
// harmless no-op — it never resets SRS scheduling.
export function ensureExposed(progress, questionId, onUpdateCard) {
  if (isExposed(progress, questionId)) return;
  const state = { ...blankCardState(), exposed: true, firstSeenAt: Date.now() };
  onUpdateCard(questionId, state);
}
