// Spaced repetition scheduling — an Anki-style SM-2 variant.
//
// A card moves through three phases:
//   "new"        — never successfully reviewed; walks a short NEW_STEPS
//                   ladder (minutes/hours) before graduating into "review".
//   "review"      — the normal long-run SM-2 interval*ease growth.
//   "relearning"  — a graduated card that was just rated Again (a "lapse");
//                   walks a short RELEARN_STEPS ladder before returning to
//                   "review" at a reduced interval.
//
// Card state shape:
//   {
//     phase: "new" | "review" | "relearning",
//     step: 0,             // index into the current phase's step ladder
//                            // (meaningful only while phase is "new"/"relearning")
//     priorInterval: 0,     // the review interval in effect right before the
//                            // most recent lapse — relearning graduates back
//                            // off THIS, not the short relearn-step interval
//     easeFactor: 2.5,
//     interval: 0,          // days (fractional while in a learning/relearning step)
//     due: 0,               // ms timestamp; 0 = never scheduled, always due
//     repetition: 0,        // consecutive non-Again ratings since the last Again
//     lapses: 0,            // total times a graduated card has been rated Again
//     leech: false,         // true once lapses crosses LEECH_THRESHOLD
//     seen: 0, correct: 0, wrong: 0,
//     answered: 0, answeredCorrect: 0,
//                            // real MCQ-answer accuracy — "correct"/"wrong"
//                            // above are the Anki-style self-graded RECALL
//                            // rating (Again/Hard/Good/Easy), not whether the
//                            // player actually picked the right choice. A
//                            // player can pick the wrong answer and still
//                            // rate their recall "Good" once they've read the
//                            // explanation, so `correct` alone is not a valid
//                            // accuracy signal. These two fields are the
//                            // untouched, ground-truth answer-correctness
//                            // count and are what personal-stats accuracy
//                            // must be computed from.
//   }

export const DAY_MS = 24 * 60 * 60 * 1000;

// The four Anki-style ratings. Numerically compatible with the project's
// original 1/3/5 SM-2 quality scale (see normalizeRating below), so old
// persisted card state and old call sites keep working unmodified.
export const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 };

// New-card learning ladder: 10 minutes, then 1 day, before graduating.
const NEW_STEPS_DAYS = [10 / 1440, 1];
// Relearning ladder for a lapsed (previously graduated) card: 10 minutes.
const RELEARN_STEPS_DAYS = [10 / 1440];

const GRADUATE_GOOD_DAYS = 3; // interval assigned when graduating via Good
const GRADUATE_EASY_DAYS = 4; // interval assigned when graduating via Easy (skips remaining steps)
const LAPSE_INTERVAL_MULT = 0.5; // relearning graduates back to priorInterval * this
const MIN_REVIEW_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 365 * 50; // a practical ceiling, not a claimed real one
const HARD_STEP_MULT = 1.5; // Hard during learning/relearning: repeat the step, a bit slower
const HARD_MULT = 1.2; // Hard on a review card
const EASY_BONUS = 1.3;
const EASE_MIN = 1.3;
const EASE_HARD_PENALTY = 0.15;
const EASE_AGAIN_PENALTY = 0.2;
const EASE_EASY_BONUS = 0.15;
export const LEECH_THRESHOLD = 8; // lapses at which a card is (re-)flagged as a leech

export function blankCardState() {
  return {
    phase: "new",
    step: 0,
    priorInterval: 0,
    easeFactor: 2.5,
    interval: 0,
    due: 0, // 0 = never scheduled, always due
    repetition: 0,
    lapses: 0,
    leech: false,
    seen: 0,
    correct: 0,
    wrong: 0,
    answered: 0,
    answeredCorrect: 0,
  };
}

function clampEase(e) {
  return Math.max(EASE_MIN, e);
}

function clampInterval(days) {
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1 / 1440, days));
}

// Pure: computes the next state for one (state, rating) pair without
// mutating the input. Both `schedule()` (apply + persist) and
// `previewIntervals()` (show all four outcomes on the rating buttons,
// without persisting) share this single implementation, so the time a
// player sees on a button is never able to diverge from what actually gets
// scheduled once they press it.
function nextState(state, rating, now) {
  const s = { ...blankCardState(), ...state };
  s.seen += 1;

  if (rating === RATING.AGAIN) {
    s.wrong += 1;
    s.repetition = 0;
    if (s.phase === "review") {
      s.priorInterval = s.interval;
      s.lapses += 1;
      s.leech = s.lapses > 0 && s.lapses % LEECH_THRESHOLD === 0;
      s.easeFactor = clampEase(s.easeFactor - EASE_AGAIN_PENALTY);
      s.phase = "relearning";
    }
    // "new" stays "new"; "relearning" just restarts its own short ladder.
    s.step = 0;
    const steps = s.phase === "new" ? NEW_STEPS_DAYS : RELEARN_STEPS_DAYS;
    s.interval = steps[0];
    s.due = now + s.interval * DAY_MS;
    return s;
  }

  s.correct += 1;
  s.repetition += 1;

  if (s.phase === "new" || s.phase === "relearning") {
    const steps = s.phase === "new" ? NEW_STEPS_DAYS : RELEARN_STEPS_DAYS;

    if (rating === RATING.HARD) {
      // Repeat the same step, but wait a little longer than last time.
      s.interval = steps[s.step] * HARD_STEP_MULT;
      s.due = now + s.interval * DAY_MS;
      return s;
    }

    if (rating === RATING.GOOD && s.step + 1 < steps.length) {
      s.step += 1;
      s.interval = steps[s.step];
      s.due = now + s.interval * DAY_MS;
      return s;
    }

    // GOOD on the last step, or EASY at any step: graduate into "review".
    const relearn = s.phase === "relearning";
    const base = relearn ? s.priorInterval * LAPSE_INTERVAL_MULT : 0;
    const graduated =
      rating === RATING.EASY
        ? relearn
          ? base * EASY_BONUS
          : GRADUATE_EASY_DAYS
        : relearn
        ? base
        : GRADUATE_GOOD_DAYS;
    s.phase = "review";
    s.step = 0;
    s.interval = clampInterval(Math.max(MIN_REVIEW_INTERVAL_DAYS, Math.round(graduated)));
    s.due = now + s.interval * DAY_MS;
    return s;
  }

  // phase === "review": the long-run SM-2 growth.
  if (rating === RATING.HARD) {
    s.easeFactor = clampEase(s.easeFactor - EASE_HARD_PENALTY);
    s.interval = clampInterval(Math.max(s.interval * HARD_MULT, s.interval + 1));
  } else if (rating === RATING.GOOD) {
    s.interval = clampInterval(Math.max(s.interval * s.easeFactor, s.interval + 1));
  } else {
    // EASY
    s.easeFactor = clampEase(s.easeFactor + EASE_EASY_BONUS);
    s.interval = clampInterval(Math.max(s.interval * s.easeFactor * EASY_BONUS, s.interval + 1));
  }
  s.interval = Math.round(s.interval);
  s.due = now + s.interval * DAY_MS;
  return s;
}

// Accepts either the new 1(Again)/2(Hard)/3(Good)/4(Easy) RATING scale or
// the project's original 1/3/5 SM-2 quality scale — both collapse onto the
// same four buckets, so old callers and old persisted state keep working.
function normalizeRating(quality) {
  if (quality <= 1) return RATING.AGAIN;
  if (quality === 2) return RATING.HARD;
  if (quality <= 3) return RATING.GOOD;
  return RATING.EASY;
}

export function schedule(state, quality, now = Date.now()) {
  return nextState(state, normalizeRating(quality), now);
}

// Returns the interval/due/label for all four ratings against the CURRENT
// state, without mutating or persisting anything — this is what drives the
// "Again / Hard / Good / Easy" buttons' own time labels, the same way
// Anki's reviewer shows the resulting wait time on each button before you
// pick one.
export function previewIntervals(state, now = Date.now()) {
  const out = {};
  for (const [name, rating] of Object.entries(RATING)) {
    const result = nextState(state, rating, now);
    out[name.toLowerCase()] = {
      interval: result.interval,
      due: result.due,
      label: formatInterval(result.interval),
    };
  }
  return out;
}

// A short relative-time label ("10m", "3h", "4d", "2mo", "1.5y") for an
// interval expressed in days — deliberately a TIME, not a calendar date,
// matching what Anki shows on its own rating buttons.
export function formatInterval(days) {
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 1440))}m`;
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
  if (days < 30) return `${Math.max(1, Math.round(days))}d`;
  if (days < 365) return `${Math.max(1, Math.round(days / 30))}mo`;
  const y = days / 365;
  return `${y < 10 ? y.toFixed(1) : Math.round(y)}y`;
}

export function isDue(state, now = Date.now()) {
  if (!state) return true;
  return (state.due || 0) <= now;
}

export function isLeech(state) {
  return !!state?.leech;
}
