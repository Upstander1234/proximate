// Spaced repetition scheduling (SM-2 algorithm).
//
// A card's state is: { repetition, easeFactor, interval, due, seen, correct, wrong }
// `due` is a millisecond timestamp. A card with no state yet is treated as
// immediately due (new).

export const DAY_MS = 24 * 60 * 60 * 1000;

export function blankCardState() {
  return {
    repetition: 0,
    easeFactor: 2.5,
    interval: 0,
    due: 0, // 0 = never scheduled, always due
    seen: 0,
    correct: 0,
    wrong: 0,
  };
}

// quality: 1 = Again (wrong / forgot), 3 = Good, 5 = Easy
export function schedule(state, quality, now = Date.now()) {
  const s = { ...blankCardState(), ...state };
  s.seen += 1;
  if (quality < 3) {
    s.wrong += 1;
    s.repetition = 0;
    s.interval = 1 / 24; // retry within the hour
  } else {
    s.correct += 1;
    s.repetition += 1;
    if (s.repetition === 1) s.interval = 1;
    else if (s.repetition === 2) s.interval = 6;
    else s.interval = Math.round(s.interval * s.easeFactor);
    s.easeFactor = Math.max(
      1.3,
      s.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  }
  s.due = now + s.interval * DAY_MS;
  return s;
}

export function isDue(state, now = Date.now()) {
  if (!state) return true;
  return (state.due || 0) <= now;
}
