// Session builders for the study modes that sit alongside ordinary SRS
// review — Quick 10, Timed Quiz, Custom Quiz, Weakest-Area Quiz. Every
// builder here returns a plain array of questions (or a {questions,
// available, requested} shape when a filter can legitimately come up
// short); QuizRunner.jsx renders whatever list it's handed through the
// same QuestionSessionView every other study mode already uses, so an
// answer given in any of these modes updates the same SRS/itemStats/
// prediction-log signals ordinary practice does.

import { poolByLevel } from "./questionPool.js";
import { itemTypeOf } from "./itemTypes.js";
import { isDue } from "./srs.js";

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Quick 10 — exactly 10 questions from the player's selected provider
// level, drawn from that level's own question pool.
export function buildQuickTen(pool, level) {
  const levelPool = poolByLevel(pool, level);
  return shuffle(levelPool).slice(0, 10);
}

// Timed Quiz — the player picks provider level, question count, and a
// time limit; the runner (QuizRunner) owns the countdown and auto-submit.
export function buildTimedQuiz(pool, level, count) {
  const levelPool = poolByLevel(pool, level);
  return shuffle(levelPool).slice(0, Math.max(1, count));
}

// Custom Quiz — every filter is optional ("All"/"any" means unfiltered).
// `seenFilter`: "any" | "seen" | "unseen" (seen = has any progress at all).
// `itemType`: "any" or a real itemTypeOf() value.
// `difficultyBand`: "any" or one of itemStats.js's difficultyBand() labels
//   — only applied when `bandByQid` is supplied (question id -> band label,
//   populated ONLY for questions with enough real community responses to
//   trust — see StudyTab's own reliability check), since difficulty is only
//   meaningful once real data exists (the spec's own "when reliable
//   difficulty data exists" requirement). A question with no entry in
//   bandByQid is excluded from a non-"any" difficulty filter rather than
//   silently guessed into a bucket.
export function buildCustomQuiz(pool, progress, { level, domain, count, seenFilter, itemType, difficultyBand: diffFilter, bandByQid }) {
  let candidates = poolByLevel(pool, level);
  if (domain && domain !== "All") candidates = candidates.filter((q) => q.domain === domain);
  if (itemType && itemType !== "any") candidates = candidates.filter((q) => itemTypeOf(q) === itemType);
  if (seenFilter === "seen") candidates = candidates.filter((q) => (progress[q.id]?.seen || 0) > 0);
  else if (seenFilter === "unseen") candidates = candidates.filter((q) => !(progress[q.id]?.seen > 0));
  if (diffFilter && diffFilter !== "any" && bandByQid) {
    candidates = candidates.filter((q) => bandByQid[q.id] === diffFilter);
  }

  const available = candidates.length;
  const requested = Math.max(1, count || 10);
  const questions = shuffle(candidates).slice(0, requested);
  return { questions, available, requested };
}

// Weakest-Area Quiz — built from ACTUAL performance data (per-domain
// accuracy, attempt counts, leech flags, and due-for-review status), never
// the player's own guess about what they're weak at. A domain only counts
// as a real weak area once it has enough attempts to be meaningful (>=3),
// so a domain the player has barely touched isn't mistaken for a weak one.
const MIN_ATTEMPTS_FOR_WEAKNESS = 3;

export function domainWeaknessForLevel(pool, progress, level) {
  const levelPool = poolByLevel(pool, level);
  const byDomain = new Map();
  for (const q of levelPool) {
    const card = progress[q.id];
    const answered = card?.answered || 0;
    if (answered === 0) continue;
    const d = byDomain.get(q.domain) || { domain: q.domain, seen: 0, correct: 0, leechCount: 0, dueCount: 0 };
    d.seen += answered;
    d.correct += card.answeredCorrect || 0;
    if (card.leech) d.leechCount += 1;
    byDomain.set(q.domain, d);
  }
  for (const q of levelPool) {
    const card = progress[q.id];
    if (card && (card.seen || 0) > 0 && isDue(card)) {
      const d = byDomain.get(q.domain);
      if (d) d.dueCount += 1;
    }
  }

  return [...byDomain.values()]
    .filter((d) => d.seen >= MIN_ATTEMPTS_FOR_WEAKNESS)
    .map((d) => {
      const accuracy = d.correct / d.seen;
      const leechFrac = d.leechCount / Math.max(1, d.seen);
      const dueFrac = d.dueCount / Math.max(1, d.seen);
      // Weakness score: mostly driven by low accuracy, with real weight
      // added for repeated-incorrect ("leech") questions and for a build-up
      // of due-for-review cards in the same domain — the three real signals
      // the spec asks for beyond raw accuracy alone.
      const weaknessScore = (1 - accuracy) * 2 + leechFrac * 1.5 + dueFrac * 0.5;
      return { ...d, accuracy, weaknessScore };
    })
    .sort((a, b) => b.weaknessScore - a.weaknessScore);
}

export function buildWeakestAreaQuiz(pool, progress, level, count = 10) {
  const levelPool = poolByLevel(pool, level);
  const ranking = domainWeaknessForLevel(pool, progress, level);

  if (ranking.length === 0) {
    // No real performance data yet at this level — fall back to whatever
    // is due for review, then fill with fresh questions, rather than
    // guessing at a "weak area" with no evidence behind it.
    const due = levelPool.filter((q) => {
      const c = progress[q.id];
      return c && (c.seen || 0) > 0 && isDue(c);
    });
    const rest = levelPool.filter((q) => !due.includes(q));
    return { questions: [...shuffle(due), ...shuffle(rest)].slice(0, count), ranking: [] };
  }

  const weakDomains = new Set(ranking.slice(0, Math.max(1, Math.ceil(ranking.length / 2))).map((d) => d.domain));
  const inWeakDomains = levelPool.filter((q) => weakDomains.has(q.domain));

  const leeches = inWeakDomains.filter((q) => progress[q.id]?.leech);
  const due = inWeakDomains.filter((q) => {
    const c = progress[q.id];
    return c && (c.seen || 0) > 0 && isDue(c) && !leeches.includes(q);
  });
  const rest = inWeakDomains.filter((q) => !leeches.includes(q) && !due.includes(q));
  const outsideWeak = levelPool.filter((q) => !weakDomains.has(q.domain));

  const ordered = [...shuffle(leeches), ...shuffle(due), ...shuffle(rest), ...shuffle(outsideWeak)];
  return { questions: ordered.slice(0, count), ranking };
}
