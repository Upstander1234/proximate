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
