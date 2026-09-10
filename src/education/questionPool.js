// The unified, runtime question pool: Proximate's own original questions
// (questions.js) plus any manually-approved crowdsourced questions
// (crowdsource.js). This is the ONE place both MCQ Practice Mode and
// Adaptive Test Mode should pull questions from, so neither can
// accidentally use a pending/rejected crowdsourced question, and so a
// newly-approved question becomes available to both immediately.

import { QUESTIONS } from "./questions.js";
import { fetchApprovedCrowdsourced } from "./crowdsource.js";

let cached = null;
let cachedAt = 0;
const CACHE_MS = 60_000;

export async function getQuestionPool({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cached && now - cachedAt < CACHE_MS) return cached;
  const approvedQuestions = QUESTIONS.map((q) => ({ ...q, source: q.source || "official", approved: true }));
  const crowdsourced = await fetchApprovedCrowdsourced();
  cached = [...approvedQuestions, ...crowdsourced];
  cachedAt = now;
  return cached;
}

export function poolByLevel(pool, level) {
  return pool.filter((q) => q.level === level && q.approved);
}
