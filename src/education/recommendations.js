// Personalized study recommendations for Education Mode.
//
// Every recommendation is derived from data the player actually has. A rule
// whose inputs are missing contributes nothing at all — there is no default
// "study more!" filler, and no recommendation is ever generated from a
// provider level, domain, or difficulty the player has no real data behind.
// That is the whole point: a recommendation the player cannot act on, or
// that pretends to know something about them, is worse than none.
//
// Inputs are exactly the stores Education Mode already keeps:
//   diagnostics   diagnosticStore.js  (provider-level assessment results)
//   stats         userStats.js        (accuracy, weakest/strongest domain, due count)
//   analytics     analytics.js        (retention, recurring errors, quiz results)
//   profile       profile.js          (the player's own provider level)
//   studyLog      studyLog.js         (recent activity)
//   qotdLog       qotd.js             (daily question participation)
//   medicdleLog   eduMedicdle.js      (daily Medicdle participation)
//
// Each returned item carries an `action` that EducationApp.jsx can dispatch:
//   { kind: "study", mode, level, domain }  -> launches that Study session
//   { kind: "tab", tab }                    -> navigates to that tab
//   { kind: "tab", tab: "daily", challenge }// -> opens Daily Challenge on that game
// so a recommendation is always actionable, never just a suggestion in prose.

import { LEVELS } from "./questions.js";
import { modeLabel } from "./studyLog.js";
import { computeStreak } from "./qotd.js";

// Display order: the more actionable/urgent a signal is, the earlier it
// shows. Purely informational items sort last.
const SEVERITY_RANK = { high: 0, medium: 1, info: 2 };

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_RECOMMENDATIONS = 6;

// A real question-bank level to aim a session at. Prefers the player's own
// saved provider level (their stated goal), then the most recent
// diagnostic's own estimate — and only falls back to EMT when neither is a
// level this question bank actually has, so a filter never targets a level
// with no questions behind it.
function preferredLevel({ profile, diagnostics }) {
  const latest = diagnostics.length ? diagnostics[diagnostics.length - 1] : null;
  const candidates = [profile?.providerLevel, latest?.estimatedLevel];
  for (const c of candidates) {
    if (c && LEVELS.includes(c)) return c;
  }
  return "EMT";
}

function todayKey(now) {
  return new Date(now).toISOString().slice(0, 10);
}

export function buildRecommendations({
  diagnostics = [],
  stats = null,
  analytics = null,
  profile = null,
  studyLog = [],
  qotdLog = [],
  medicdleLog = [],
  now = Date.now(),
  limit = MAX_RECOMMENDATIONS,
} = {}) {
  const out = [];
  const latestDiagnostic = diagnostics.length ? diagnostics[diagnostics.length - 1] : null;
  const level = preferredLevel({ profile, diagnostics });

  // 1. Diagnostic feed-forward: a domain the diagnostic placed BELOW the
  // player's estimated level is the single most specific thing Proximate
  // knows about them, so it leads.
  if (latestDiagnostic?.belowAreas?.length) {
    const domain = latestDiagnostic.belowAreas[0];
    out.push({
      id: `diagnostic-focus:${domain}`,
      severity: "high",
      title: `Review recommended: ${domain}`,
      detail: `Your most recent assessment (${latestDiagnostic.estimatedLevel}, ${latestDiagnostic.confidence}% confidence) placed ${domain} below your estimated level.`,
      action: { kind: "study", mode: "custom", level, domain },
      actionLabel: `Start a ${domain} review`,
    });
  }

  // 2. Weakest domain by real answered-question accuracy (userStats.js
  // already computes this with its own >=3-attempt floor).
  if (stats?.weakestDomain?.domain) {
    const d = stats.weakestDomain;
    out.push({
      id: `weakest-domain:${d.domain}`,
      severity: "high",
      title: `Recommended: 10-question ${d.domain} review`,
      detail: `${d.domain} is your lowest-accuracy domain at ${d.accuracy}% across ${d.seen} answered question${d.seen === 1 ? "" : "s"}.`,
      action: { kind: "study", mode: "weakest", level, domain: d.domain },
      actionLabel: "Start Weakest-Area Quiz",
    });
  }

  // 3. Questions that keep coming back wrong (leeches / repeated misses).
  const recurring = analytics?.recurringErrors?.byDomain?.[0];
  if (recurring) {
    const total = analytics.recurringErrors.questions.length;
    out.push({
      id: `recurring:${recurring.domain}`,
      severity: "medium",
      title: `Your retention is dropping: revisit ${recurring.domain}`,
      detail: `${recurring.count} question${recurring.count === 1 ? "" : "s"} in ${recurring.domain} keep coming back wrong (${total} across all domains).`,
      action: { kind: "study", mode: "custom", level, domain: recurring.domain },
      actionLabel: `Review ${recurring.domain}`,
    });
  }

  // 4. SRS retention itself, once there are enough ratings to mean
  // something. srs.js's own `seen` counts every rating given.
  const retention = analytics?.retention;
  if (retention && retention.srsRetentionPct != null && retention.reviews >= 10 && retention.srsRetentionPct < 80) {
    out.push({
      id: "srs-retention",
      severity: "medium",
      title: "Your retention is dropping",
      detail: `${100 - retention.srsRetentionPct}% of your recorded reviews were rated "Again" (${retention.reviews} reviews total). Re-reading the explanations on these may help.`,
      action: { kind: "study", mode: "weakest", level },
      actionLabel: "Review what is slipping",
    });
  }

  // 5. A recent quiz result that came in under target, at the level it was
  // actually taken at.
  const weakSession = (analytics?.quizResults || []).find(
    (r) => r.accuracyPct != null && r.accuracyPct < 70 && r.answered >= 5
  );
  if (weakSession) {
    out.push({
      id: `quiz-result:${weakSession.ts}`,
      severity: "medium",
      title: `Your last ${modeLabel(weakSession.mode)} scored ${weakSession.accuracyPct}%`,
      detail: `${weakSession.correct}/${weakSession.answered} correct at ${weakSession.level}. A Quick 10 at the same level is a fast way to check whether that was a bad day or a real gap.`,
      action: { kind: "study", mode: "quick10", level: weakSession.level },
      actionLabel: `Take a Quick 10 (${weakSession.level})`,
    });
  }

  // 6. Predicted vs actual, only when the log is long enough for
  // predictions.js's own bias number to be non-null.
  if (typeof analytics?.calibrationBias === "number" && analytics.calibrationBias > 5) {
    out.push({
      id: "calibration-overconfident",
      severity: "info",
      title: "Proximate has been overestimating your odds",
      detail: `Predictions have run about ${analytics.calibrationBias} points higher than your actual results. Harder questions are where that gap usually lives.`,
      action: { kind: "study", mode: "custom", level },
      actionLabel: "Build a custom quiz",
    });
  }

  // 7. A backlog of due reviews belongs in SRS review, not a quiz.
  if ((stats?.dueCount || 0) >= 10) {
    out.push({
      id: "due-backlog",
      severity: "medium",
      title: `${stats.dueCount} cards are due for review`,
      detail: "Spaced review is what keeps mastered material mastered. Clearing the due queue is the highest-value thing to do right now.",
      action: { kind: "tab", tab: "mcq" },
      actionLabel: "Go to MCQ Practice",
    });
  }

  // 8. Recent study activity: a real gap since the last recorded session.
  const lastSession = [...(studyLog || [])]
    .filter((e) => typeof e.ts === "number")
    .sort((a, b) => b.ts - a.ts)[0];
  if (lastSession && now - lastSession.ts > 7 * DAY_MS) {
    const days = Math.round((now - lastSession.ts) / DAY_MS);
    out.push({
      id: "inactivity",
      severity: "info",
      title: `It has been ${days} days since your last study session`,
      detail: "A Quick 10 is the smallest useful thing to restart with.",
      action: { kind: "study", mode: "quick10", level },
      actionLabel: `Take a Quick 10 (${level})`,
    });
  }

  // 9. Daily Question of the Day, once the player has a streak to keep or
  // has shown they play it at all — never for someone with no log.
  if (qotdLog.length > 0) {
    const streak = computeStreak(qotdLog);
    const playedToday = qotdLog.some((e) => e.dateKey === todayKey(now));
    if (!playedToday) {
      out.push({
        id: "qotd-today",
        severity: "info",
        title: streak.current > 0 ? `Keep your ${streak.current}-day streak going` : "Today's Question of the Day is ready",
        detail: "One question, the same for everyone, once a day.",
        action: { kind: "tab", tab: "daily", challenge: "qotd" },
        actionLabel: "Answer today's question",
      });
    }
  }

  // 10. Medicdle, same rule — only for a player with real Medicdle history.
  if (medicdleLog.length > 0) {
    const playedToday = medicdleLog.some((e) => e.dateKey === todayKey(now));
    if (!playedToday) {
      out.push({
        id: "medicdle-today",
        severity: "info",
        title: "Today's Education Medicdle is available",
        detail: "Reach a working diagnosis with as little information as possible.",
        action: { kind: "tab", tab: "daily", challenge: "medicdle" },
        actionLabel: "Play Education Medicdle",
      });
    }
  }

  const seen = new Set();
  return out
    .filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, limit);
}