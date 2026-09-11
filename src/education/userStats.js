// Aggregates persistent, personal education statistics from data this
// module already exists elsewhere (SRS progress, the question pool,
// prediction log) — a pure function, no new storage of its own.

import { isDue } from "./srs.js";
import { calibrationCurve, overallCalibrationBias } from "./predictions.js";

// The accuracy threshold used by `questionsToReachTarget` and the "consider
// completing N questions" suggestion below. 80% is the conventional mastery
// cut used in Bloom's mastery-learning framework (Bloom, 1968, "Learning
// for Mastery") and in most criterion-referenced classroom testing since.
export const TARGET_ACCURACY = 0.8;

// Estimates how many MORE questions in a domain a player would need to
// answer for their CUMULATIVE (running-average) accuracy in that domain to
// reach `target`, as displayed (rounded to the nearest whole percent, the
// same rounding every accuracy number on this page already uses).
//
// The model: Carroll's time-based formulation of mastery learning ("A Model
// of School Learning," 1963) frames mastery as a function of how much
// further practice, at the learner's achievable performance level, it takes
// to bring cumulative performance up to a criterion — translated here from
// Carroll's original TIME axis to a QUESTION-COUNT axis, the natural unit
// for a spaced-repetition question bank. It assumes the player performs at
// EXACTLY the target rate on every future question in this domain (the
// best-case, "you can sustain competency from here on" assumption, not a
// prediction that their underlying skill will spontaneously improve) and
// solves for the smallest number of additional questions m such that
//   (correct + target*m) / (seen + m)  rounds to  target*100
//
// If the player is ALREADY at or above target, this returns 0. If seen is
// 0, there is nothing to project from and this returns null. There is no
// solution in finite m if a player's CURRENT rate already exceeds target by
// itself (handled by the early return) — below target, the running average
// approaches target asymptotically from below as m grows, so this solves
// for the point where the DISPLAYED (rounded) percentage first reaches it,
// not the unreachable exact real-number limit.
export function questionsToReachTarget(seen, correct, target = TARGET_ACCURACY) {
  const n = seen || 0;
  const s = correct || 0;
  if (n === 0) return null;
  const targetPct = Math.round(target * 100);
  if (Math.round((s / n) * 100) >= targetPct) return 0;
  // Smallest m with (s + target*m)/(n + m) >= displayThreshold, where
  // displayThreshold is the exact rate whose rounded percent first equals
  // targetPct (half a percentage point below the round-numbered target).
  const displayThreshold = (targetPct - 0.5) / 100;
  const m = (displayThreshold * n - s) / (target - displayThreshold);
  return Math.max(1, Math.ceil(m));
}

// progress: { [questionId]: cardState } (srs.js shape)
// pool: full question array (questionPool.js)
// predictionLog: predictions.js log array
export function computeUserStats(progress, pool, predictionLog) {
  const byId = new Map(pool.map((q) => [q.id, q]));

  let questionsAnswered = 0;
  let totalCorrect = 0;
  let totalSeen = 0;
  let dueCount = 0;
  let masteredCount = 0;
  let leechCount = 0;
  const byDomain = {};
  const byLevel = {};

  for (const [qid, card] of Object.entries(progress || {})) {
    const q = byId.get(qid);
    if (!q || !card) continue;
    const seen = card.seen || 0;
    if (seen === 0) continue;

    // Accuracy must come from `answered`/`answeredCorrect` — the real,
    // ground-truth record of which MCQ choice the player picked — not
    // `seen`/`correct`, which are the Anki-style self-graded recall rating
    // (Again/Hard/Good/Easy). A player can pick the wrong answer and still
    // rate their own recall "Good" after reading the explanation, so the
    // SRS fields alone were making every session look like 100% correct.
    const answered = card.answered || 0;
    if (answered === 0) continue;

    questionsAnswered += 1;
    totalSeen += answered;
    totalCorrect += card.answeredCorrect || 0;
    if (isDue(card)) dueCount += 1;
    if ((card.repetition || 0) >= 3) masteredCount += 1;
    if (card.leech) leechCount += 1;

    const d = (byDomain[q.domain] ||= { seen: 0, correct: 0, questions: 0 });
    d.seen += answered;
    d.correct += card.answeredCorrect || 0;
    d.questions += 1;

    const l = (byLevel[q.level] ||= { seen: 0, correct: 0, questions: 0 });
    l.seen += answered;
    l.correct += card.answeredCorrect || 0;
    l.questions += 1;
  }

  const accuracy = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : null;

  const domainAccuracy = Object.entries(byDomain)
    .map(([domain, d]) => ({ domain, accuracy: d.seen ? Math.round((d.correct / d.seen) * 100) : null, ...d }))
    .filter((d) => d.accuracy !== null);

  const weakestDomain = domainAccuracy.length
    ? [...domainAccuracy].filter((d) => d.seen >= 3).sort((a, b) => a.accuracy - b.accuracy)[0] || null
    : null;
  const strongestDomain = domainAccuracy.length
    ? [...domainAccuracy].filter((d) => d.seen >= 3).sort((a, b) => b.accuracy - a.accuracy)[0] || null
    : null;

  const needsReview = Object.entries(progress || {})
    .filter(([qid, card]) => byId.has(qid) && card && isDue(card) && (card.seen || 0) > 0)
    .map(([qid]) => byId.get(qid))
    .filter(Boolean);

  const recentActivity = (predictionLog || [])
    .slice(-10)
    .reverse()
    .map((e) => ({
      questionId: e.questionId,
      domain: e.domain,
      correct: e.actualCorrect,
      predictedPct: e.predictedPct,
      ts: e.ts,
    }));

  const calibration = calibrationCurve(predictionLog || []);
  const calibrationBias = overallCalibrationBias(predictionLog || []);

  const weakestDomainTarget = weakestDomain
    ? questionsToReachTarget(weakestDomain.seen, weakestDomain.correct)
    : null;

  const suggestion = weakestDomain
    ? weakestDomainTarget > 0
      ? `${weakestDomain.domain} is currently your weakest domain. As of now, Proximate predicts your accuracy in ${weakestDomain.domain} is ~${weakestDomain.accuracy}%. Assuming you keep answering ${weakestDomain.domain} questions at an ${Math.round(TARGET_ACCURACY * 100)}% clip, it would take roughly ${weakestDomainTarget} more ${weakestDomain.domain} questions for your recorded accuracy in this domain to reach ${Math.round(TARGET_ACCURACY * 100)}%.`
      : `${weakestDomain.domain} is currently your weakest domain, but your accuracy there (~${weakestDomain.accuracy}%) is already at or above the ${Math.round(TARGET_ACCURACY * 100)}% target. It's your weakest only relative to your other domains.`
    : null;

  return {
    questionsAnswered,
    accuracy,
    totalSeen,
    totalCorrect,
    dueCount,
    masteredCount,
    leechCount,
    byDomain,
    byLevel,
    domainAccuracy,
    weakestDomain,
    weakestDomainTarget,
    strongestDomain,
    needsReview,
    recentActivity,
    calibration,
    calibrationBias,
    suggestion,
  };
}
