// Education Mode analytics — the derived, player-facing views the Progress
// tab shows on top of the per-question signals Education Mode already
// stores. Nothing here tracks anything new: every number is computed from
// data that already exists in
//   - progress (store.js/srs.js)      per-card SRS state
//   - predictionLog (predictions.js)  per-answer predicted vs actual
//   - studyLog (studyLog.js)          completed quiz sessions
//   - diagnostics (diagnosticStore.js) provider-level assessment results
//   - userStats.js's computeUserStats weakest/strongest domain, accuracy
//
// Deliberately pure and dependency-light so it can be verified without a
// browser (see src/scripts/verifyEducationAnalytics.mjs) and so there is
// exactly ONE implementation of each statistic (this file), never a second
// parallel one in a component.
//
// Honesty rules baked in, not just documented:
//   - every rate carries the sample size it was computed from, and is
//     `null` (not 0, not a guess) when there is no data behind it
//   - a "change over time" is only reported for a domain that has enough
//     entries in BOTH windows being compared, otherwise it is omitted
//   - nothing is inferred from a level/provider the player has no data for

import { LEECH_THRESHOLD } from "./srs.js";
import { LADDER } from "./assessment.js";

// Minimum entries behind a rate before it is shown at all. Matches the
// >=3 convention quizSessions.js already uses for a "real" weak area.
export const MIN_ENTRIES_FOR_RATE = 3;
// Minimum per-domain entries in EACH of two windows before a change over
// time is reported for that domain.
export const MIN_ENTRIES_FOR_TREND = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

function pct(numerator, denominator) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

function levelIndex(level) {
  const i = LADDER.indexOf(level);
  return i < 0 ? null : i;
}

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------

// SRS retention, from the self-graded Anki-style ratings on real cards:
// `seen` counts every rating given, `correct` every non-Again rating. This
// is a RETENTION measure (did the player still hold the material well
// enough not to rate it "Again"), deliberately distinct from
// `answeredCorrect`/`answered`, which is the ground-truth MCQ answer
// accuracy userStats.js already reports. Both are returned, never merged.
export function computeRetention(progress, pool) {
  const byId = new Map((pool || []).map((q) => [q.id, q]));
  let reviews = 0;
  let recalled = 0;
  let lapses = 0;
  let lapsedCards = 0;
  let easeSum = 0;
  let easeCount = 0;
  let matureCards = 0;

  for (const [qid, card] of Object.entries(progress || {})) {
    if (!card || !byId.has(qid)) continue;
    const seen = card.seen || 0;
    if (seen === 0) continue;
    reviews += seen;
    recalled += card.correct || 0;
    const cardLapses = card.lapses || 0;
    lapses += cardLapses;
    if (cardLapses > 0) lapsedCards += 1;
    if ((card.repetition || 0) >= 3) matureCards += 1;
    if (typeof card.easeFactor === "number") {
      easeSum += card.easeFactor;
      easeCount += 1;
    }
  }

  return {
    reviews,
    recalled,
    srsRetentionPct: reviews ? pct(recalled, reviews) : null,
    lapses,
    lapsedCards,
    matureCards,
    averageEase: easeCount ? Number((easeSum / easeCount).toFixed(2)) : null,
  };
}

// Recall performance over time, bucketed into fixed-width windows ending
// now, oldest first. Each bucket reports the ACTUAL accuracy of the answers
// given inside it plus how many were predicted, so a drop is visible as a
// real change in the underlying answers, not a change in what was asked.
// Buckets with no answers at all are omitted rather than shown as 0%.
export function computeRecallTrend(predictionLog, { now = Date.now(), bucketDays = 7, buckets = 4 } = {}) {
  const width = bucketDays * DAY_MS;
  const out = [];
  for (let i = buckets - 1; i >= 0; i -= 1) {
    const end = now - i * width;
    const start = end - width;
    const entries = (predictionLog || []).filter((e) => typeof e.ts === "number" && e.ts > start && e.ts <= end);
    if (entries.length === 0) continue;
    const correct = entries.filter((e) => e.actualCorrect).length;
    const predictedSum = entries.reduce((s, e) => s + (e.predictedPct || 0), 0);
    out.push({
      start,
      end,
      daysAgo: i * bucketDays,
      label: i === 0 ? "Last 7 days" : `${i * bucketDays + 1}-${(i + 1) * bucketDays} days ago`,
      n: entries.length,
      accuracyPct: pct(correct, entries.length),
      predictedPct: Math.round(predictedSum / entries.length),
      sufficient: entries.length >= MIN_ENTRIES_FOR_RATE,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Weak areas / recurring errors
// ---------------------------------------------------------------------------

// Domains whose accuracy moved meaningfully between the recent window and
// the window before it. Only domains with at least MIN_ENTRIES_FOR_TREND
// answers in BOTH windows are reported — a domain the player just started
// has no trend to report, and saying otherwise would be fabrication.
export function computeDomainTrends(predictionLog, { now = Date.now(), windowDays = 14 } = {}) {
  const width = windowDays * DAY_MS;
  const recentStart = now - width;
  const previousStart = now - 2 * width;
  const recent = {};
  const previous = {};

  for (const e of predictionLog || []) {
    if (typeof e.ts !== "number" || !e.domain) continue;
    const target = e.ts > recentStart ? recent : e.ts > previousStart ? previous : null;
    if (!target) continue;
    const d = (target[e.domain] ||= { n: 0, correct: 0 });
    d.n += 1;
    if (e.actualCorrect) d.correct += 1;
  }

  return Object.keys(recent)
    .filter((domain) => recent[domain].n >= MIN_ENTRIES_FOR_TREND && previous[domain]?.n >= MIN_ENTRIES_FOR_TREND)
    .map((domain) => {
      const r = recent[domain];
      const p = previous[domain];
      const recentPct = pct(r.correct, r.n);
      const previousPct = pct(p.correct, p.n);
      return {
        domain,
        recentPct,
        previousPct,
        change: recentPct - previousPct,
        recentN: r.n,
        previousN: p.n,
        direction: recentPct < previousPct ? "down" : recentPct > previousPct ? "up" : "flat",
      };
    })
    .sort((a, b) => a.change - b.change);
}

// Questions that keep going wrong, grouped by domain. Two real signals:
// an SRS leech flag (lapses crossed srs.js's own threshold), and a card the
// player has answered wrong at least twice with an accuracy at or below
// 50%. Uses `answered`/`answeredCorrect` (real answer correctness), never
// the self-graded `correct`/`wrong` ratings.
export function computeRecurringErrors(progress, pool) {
  const byId = new Map((pool || []).map((q) => [q.id, q]));
  const byDomain = new Map();
  const questions = [];

  for (const [qid, card] of Object.entries(progress || {})) {
    const q = byId.get(qid);
    if (!q || !card) continue;
    const answered = card.answered || 0;
    const answeredCorrect = card.answeredCorrect || 0;
    const missed = answered - answeredCorrect;
    const leech = !!card.leech;
    const repeated = answered >= 3 && missed >= 2 && answeredCorrect / answered <= 0.5;
    if (!leech && !repeated) continue;
    questions.push({
      id: qid,
      domain: q.domain,
      level: q.level,
      answered,
      answeredCorrect,
      lapses: card.lapses || 0,
      leech,
      reason: leech ? "leech" : "repeated",
    });
    const d = byDomain.get(q.domain) || { domain: q.domain, count: 0, leechCount: 0 };
    d.count += 1;
    if (leech) d.leechCount += 1;
    byDomain.set(q.domain, d);
  }

  return {
    questions: questions.sort((a, b) => b.answered - a.answered),
    byDomain: [...byDomain.values()].sort((a, b) => b.count - a.count),
    leechThreshold: LEECH_THRESHOLD,
  };
}

// ---------------------------------------------------------------------------
// Progress: quiz results, diagnostic progress
// ---------------------------------------------------------------------------

export function computeQuizResults(studyLog, limit = 10) {
  const entries = [...(studyLog || [])]
    .filter((e) => e && typeof e.ts === "number")
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit);
  return entries.map((e) => ({
    ts: e.ts,
    mode: e.mode,
    level: e.level,
    total: e.total || 0,
    answered: e.answered || 0,
    correct: e.correct || 0,
    unanswered: e.unanswered || 0,
    timedOut: !!e.timedOut,
    accuracyPct: pct(e.correct || 0, e.answered || 0),
    byDomain: e.byDomain || {},
  }));
}

// Diagnostic progress: each stored result, oldest first, plus how the
// estimate moved between consecutive results. A movement is only reported
// when both results are on the known ladder — an unrecognized level string
// yields `null` movement rather than a made-up step count.
export function computeDiagnosticProgress(diagnostics) {
  const results = [...(diagnostics || [])].filter(Boolean);
  return results.map((r, i) => {
    const prev = i > 0 ? results[i - 1] : null;
    const from = prev ? levelIndex(prev.estimatedLevel) : null;
    const to = levelIndex(r.estimatedLevel);
    return {
      completedAt: r.completedAt || null,
      estimatedLevel: r.estimatedLevel,
      confidence: r.confidence ?? null,
      total: r.total ?? null,
      totalCorrect: r.totalCorrect ?? null,
      belowAreas: r.belowAreas || [],
      aboveAreas: r.aboveAreas || [],
      levelChange: from != null && to != null ? to - from : null,
      confidenceChange:
        prev && typeof prev.confidence === "number" && typeof r.confidence === "number"
          ? r.confidence - prev.confidence
          : null,
    };
  });
}

// ---------------------------------------------------------------------------
// One-call composition used by the Progress tab
// ---------------------------------------------------------------------------

export function computeAnalytics({ progress, pool, predictionLog, studyLog, diagnostics, stats, now = Date.now() }) {
  return {
    retention: computeRetention(progress, pool),
    recallTrend: computeRecallTrend(predictionLog, { now }),
    domainTrends: computeDomainTrends(predictionLog, { now }),
    recurringErrors: computeRecurringErrors(progress, pool),
    quizResults: computeQuizResults(studyLog),
    diagnosticProgress: computeDiagnosticProgress(diagnostics),
    // Passed through from userStats.js rather than recomputed here, so the
    // weakest-domain number on this page can never disagree with the one the
    // dashboard shows.
    weakestDomain: stats?.weakestDomain || null,
    strongestDomain: stats?.strongestDomain || null,
    calibrationBias: stats?.calibrationBias ?? null,
    calibration: stats?.calibration || [],
  };
}
