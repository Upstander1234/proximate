// Aggregates persistent, personal education statistics from data this
// module already exists elsewhere (SRS progress, the question pool,
// prediction log) — a pure function, no new storage of its own.

import { isDue } from "./srs.js";
import { calibrationCurve, overallCalibrationBias } from "./predictions.js";

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

    questionsAnswered += 1;
    totalSeen += seen;
    totalCorrect += card.correct || 0;
    if (isDue(card)) dueCount += 1;
    if ((card.repetition || 0) >= 3) masteredCount += 1;
    if (card.leech) leechCount += 1;

    const d = (byDomain[q.domain] ||= { seen: 0, correct: 0, questions: 0 });
    d.seen += seen;
    d.correct += card.correct || 0;
    d.questions += 1;

    const l = (byLevel[q.level] ||= { seen: 0, correct: 0, questions: 0 });
    l.seen += seen;
    l.correct += card.correct || 0;
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

  const suggestion = weakestDomain
    ? `${weakestDomain.domain} is currently your weakest domain. As of now, Proximate predicts your accuracy in ${weakestDomain.domain} is ~${weakestDomain.accuracy}%. Consider completing 15 ${weakestDomain.domain} questions.`
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
    strongestDomain,
    needsReview,
    recentActivity,
    calibration,
    calibrationBias,
    suggestion,
  };
}
