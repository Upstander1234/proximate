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

// Crowdsourced questions are a real network fetch (Firestore) and are
// never load-bearing for the pool itself — the built-in bank always works
// standalone. If the fetch is slow or the network is unreachable, don't
// let it hang the whole pool (and therefore every screen that awaits it)
// forever; time it out and fall back to the built-in bank alone.
const CROWDSOURCE_TIMEOUT_MS = 6000;

function withTimeout(promise, ms, fallback) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

export async function getQuestionPool({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cached && now - cachedAt < CACHE_MS) return cached;
  const approvedQuestions = QUESTIONS.map((q) => ({ ...q, source: q.source || "official", approved: true }));
  const crowdsourced = await withTimeout(fetchApprovedCrowdsourced(), CROWDSOURCE_TIMEOUT_MS, []);
  cached = [...approvedQuestions, ...crowdsourced];
  cachedAt = now;
  return cached;
}

export function poolByLevel(pool, level) {
  return pool.filter((q) => q.level === level && q.approved);
}
