// Answer-choice randomization. The canonical order a question is authored
// in (questions.js's `choices`/`answerIndex`) never changes — only the
// DISPLAY order does, freshly and independently for every presentation.
//
// Every consumer must grade/record against the CANONICAL index a display
// index maps back to, never the display index itself, so correctness and
// community stats stay correctly associated with the underlying choice
// regardless of how it happened to be shuffled for this particular viewer.

function shuffledIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Returns { displayChoices, displayAnswerIndex, toCanonical }.
// `toCanonical[displayIndex]` gives the canonical choice index.
// `displayAnswerIndex` is which display slot now holds the correct answer
// (handy for render-time checks; grading should still go through
// `toCanonical`, not this, to keep the "canonical is authoritative" rule
// in exactly one place).
export function randomizePresentation(question) {
  const order = shuffledIndices(question.choices.length);
  return {
    displayChoices: order.map((canonicalIdx) => question.choices[canonicalIdx]),
    toCanonical: order,
    displayAnswerIndex: order.indexOf(question.answerIndex),
  };
}

// multiple_response uses the identical mechanism as multiple_choice — same
// `choices` array, same canonical-index grading contract — just with
// several correct answers instead of one. Reused here rather than
// duplicated so the two item types can never drift apart in how they
// shuffle.
export function randomizeMultipleResponsePresentation(question) {
  const order = shuffledIndices(question.choices.length);
  return {
    displayChoices: order.map((canonicalIdx) => question.choices[canonicalIdx]),
    toCanonical: order,
  };
}

// build_list: shuffles which on-screen SLOT each step starts in. A player
// then reorders the displayed steps; grading must map the player's
// resulting display-order sequence back through `toCanonical` before
// comparing against `question.correctOrder` (evaluateResponse.js expects
// canonical indices, not display positions).
export function randomizeBuildListPresentation(question) {
  const order = shuffledIndices(question.steps.length);
  return {
    displaySteps: order.map((canonicalIdx) => question.steps[canonicalIdx]),
    toCanonical: order,
  };
}

// drag_drop: only the ITEMS need shuffling (categories stay in their
// authored order — they're the fixed targets, not the things being
// classified). Returns items in canonical order already; a UI wanting a
// shuffled item tray should permute this array's own presentation, but the
// items themselves (id/label/correctCategory) are never display-indexed,
// so there is no toCanonical mapping needed here — grading in
// evaluateResponse.js keys by item.id directly.
export function randomizeDragDropItemOrder(question) {
  const order = shuffledIndices(question.items.length);
  return order.map((i) => question.items[i]);
}

// options_table: shuffles row order (findings are id-keyed, so no mapping
// is needed for grading) and, optionally, the shared option-column order
// when every row uses the same `question.options` list. Per-row option
// lists are left in their authored order — remapping a per-row
// correctOptionIndex through a shuffle isn't worth the complexity for a
// table where the columns are usually a fixed, named classification set
// (e.g. "Immediate life threat / Not immediate") rather than arbitrary
// choices.
export function randomizeOptionsTableRowOrder(question) {
  const order = shuffledIndices(question.rows.length);
  return order.map((i) => question.rows[i]);
}
