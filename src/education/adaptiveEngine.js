// Adaptive Test Mode's item-response engine: a real, if intentionally
// simple, IRT-style (2-parameter logistic) computerized-adaptive-testing
// implementation, inspired by publicly described CAT principles and the
// publicly described structure of the NREMT EMT cognitive exam. It is NOT
// a reproduction of NREMT's own proprietary scoring/selection algorithm —
// Proximate has no access to that and doesn't claim to.
//
// Core concepts, kept explicitly distinct throughout (never conflated):
//   - user ABILITY estimate (theta) + its standard error — this file
//   - item DIFFICULTY (b) and DISCRIMINATION (a) — derived from community
//     response data (itemStats.js), never from one user's own performance
//   - item DIFFICULTY CONFIDENCE — how much community data backs that b
//   - question QUALITY — a manual approval decision (crowdsource.js),
//     unrelated to any of the above
//
// See MethodsPage.jsx for the player-facing explanation of all of this.

import { pctCorrect } from "./itemStats.js";
import { BLUEPRINT_CATEGORIES, blueprintCategoryOf } from "./contentBlueprint.js";

export const MIN_QUESTIONS = 70;
export const MAX_QUESTIONS = 120;

// An item's community difficulty estimate isn't treated as "reliable"
// until at least this many responses back it. Below that, its estimate is
// shrunk heavily toward the neutral (medium-difficulty) prior rather than
// trusted outright — this is what lets Proximate ship with a large,
// freshly-written bank and have it become more precisely calibrated as
// real response data accumulates, without ever pretending a 3-response
// item's difficulty is well known.
const RELIABLE_N = 20;
const PRIOR_WEIGHT = 8; // pseudo-observations pulling a fresh item toward neutral

// Default discrimination for every item. A real per-item discrimination
// estimate would need paired ability/response data across many users
// (e.g. an item-total point-biserial correlation) that this project does
// not yet compute — stated honestly rather than fabricated. Every item
// currently uses this same default; the architecture (item.a below) is
// ready to consume a real per-item estimate the moment one exists.
const DEFAULT_DISCRIMINATION = 1.0;

// Proximate's own 99% confidence stopping criterion, expressed as a
// maximum allowed half-width (in logit units) of the 99% CI around the
// running ability estimate. 2.576 is the z-score for a 99% CI. This
// half-width threshold is Proximate's own design choice (not published by
// NREMT) — chosen so a well-behaved test can plausibly converge within the
// 70-120 item range, not derived from any external source. Documented
// plainly as such on the Methods page.
const CI_Z = 2.576;
const CI_MAX_HALFWIDTH = 0.55;

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function logit(p) {
  const pc = clamp(p, 0.02, 0.98);
  return Math.log(pc / (1 - pc));
}

// Derives this item's difficulty (b) and a 0-1 confidence score from its
// community response stats, shrinking toward the neutral prior (b=0, i.e.
// "medium difficulty") in proportion to how little data backs it.
export function difficultyFromStats(stats) {
  const attempts = stats?.attempts || 0;
  const pCorrect = pctCorrect(stats);
  const rawB = pCorrect === null ? 0 : -logit(pCorrect / 100); // harder items = lower p(correct) = higher b
  const weight = attempts / (attempts + PRIOR_WEIGHT);
  const b = rawB * weight; // shrink toward 0 when data is thin
  const confidence = clamp(attempts / RELIABLE_N, 0, 1);
  return { b, confidence, attempts };
}

export function itemParams(question, stats) {
  const { b, confidence, attempts } = difficultyFromStats(stats);
  return { a: DEFAULT_DISCRIMINATION, b, difficultyConfidence: confidence, responseCount: attempts };
}

export function probCorrect(theta, a, b) {
  return 1 / (1 + Math.exp(-a * (theta - b)));
}

export function itemInformation(theta, a, b) {
  const p = probCorrect(theta, a, b);
  return a * a * p * (1 - p);
}

// MAP ability estimate (Newton-Raphson) over the full administered-item
// history, regularized with a weak N(0,1) prior so ability doesn't diverge
// to +/-infinity on an early all-correct or all-wrong streak — the
// standard, well-understood way to keep a CAT stable in exactly that
// situation.
export function estimateAbility(responses) {
  // responses: [{ a, b, correct }]
  let theta = 0;
  for (let iter = 0; iter < 25; iter++) {
    let grad = -theta; // d/dtheta of the N(0,1) log-prior
    let info = 1; // prior precision
    for (const r of responses) {
      const p = probCorrect(theta, r.a, r.b);
      grad += r.a * ((r.correct ? 1 : 0) - p);
      info += r.a * r.a * p * (1 - p);
    }
    const step = grad / info;
    theta += step;
    if (Math.abs(step) < 1e-5) break;
  }
  let info = 1;
  for (const r of responses) {
    const p = probCorrect(theta, r.a, r.b);
    info += r.a * r.a * p * (1 - p);
  }
  const se = 1 / Math.sqrt(info);
  return { theta: clamp(theta, -4, 4), se };
}

// Readiness score for the results screen: a 0-100 educational metric
// derived from the ability estimate, NOT a raw percent-correct and NOT an
// NREMT score. theta=0 (medium ability) maps to 50%; the mapping is a
// plain logistic curve over theta, Proximate's own scale.
export function readinessFromTheta(theta) {
  const pct = 100 / (1 + Math.exp(-1.1 * theta));
  return Math.round(pct);
}

export function meetsStoppingConfidence(se) {
  return CI_Z * se <= CI_MAX_HALFWIDTH;
}

// Picks the next item to administer.
//   pool            — full eligible question objects (approved, level EMT)
//   itemStatsById    — Map<questionId, communityStats>
//   administeredIds — Set of question ids already given THIS exam
//   everSeenIds      — Set of question ids the user has ever seen (any mode)
//   theta            — running ability estimate
//   domainCounts     — { [blueprintKey]: countSoFarThisExam }
//   questionNumber   — 1-indexed number of the item about to be picked
//   allowReuse       — once the never-seen pool is exhausted, allow re-picking
//                       an already-seen-by-this-user question
export function selectNextItem({
  pool,
  itemStatsById,
  administeredIds,
  everSeenIds,
  theta,
  domainCounts,
  questionNumber,
  allowReuse,
}) {
  if (pool.length === 0) return null;

  // Three tiers, tried in order. Never-administered-this-exam is always
  // preferred; a real exam whose bank is smaller than MAX_QUESTIONS (or
  // even smaller than MIN_QUESTIONS) MUST still be able to reach the
  // required question count, which means eventually allowing a question
  // to be repeated within the SAME exam, not only reused from a different
  // session — the min-70 floor is a hard requirement and must never be
  // cut short by running out of "fresh" candidates.
  const neverSeenAnywhere = pool.filter((q) => !administeredIds.has(q.id) && !everSeenIds.has(q.id));
  const seenElsewhereNotThisExam = pool.filter((q) => !administeredIds.has(q.id) && everSeenIds.has(q.id));

  let candidates;
  if (neverSeenAnywhere.length > 0) {
    candidates = neverSeenAnywhere;
  } else if (!allowReuse) {
    candidates = [];
  } else if (seenElsewhereNotThisExam.length > 0) {
    candidates = seenElsewhereNotThisExam;
  } else {
    candidates = pool; // everything has already been given this exam — repeat is unavoidable
  }
  if (candidates.length === 0) return null;

  // Content-blueprint targeting: pick the category with the largest
  // deficit relative to its proportional target for a test of this length
  // so far, then restrict candidates to that category if any exist there.
  const targetLen = MAX_QUESTIONS; // normalize proportional targets against the max possible length
  let bestCategory = null;
  let bestDeficit = -Infinity;
  for (const cat of BLUEPRINT_CATEGORIES) {
    const targetPct = (cat.minPct + cat.maxPct) / 2;
    const target = (targetPct / 100) * Math.max(questionNumber, targetLen * 0.1);
    const have = domainCounts[cat.key] || 0;
    const deficit = target - have;
    if (deficit > bestDeficit) {
      bestDeficit = deficit;
      bestCategory = cat.key;
    }
  }
  let scoped = candidates.filter((q) => blueprintCategoryOf(q) === bestCategory);
  if (scoped.length === 0) scoped = candidates; // that category has nothing eligible right now — don't block the exam over it

  // Among the scoped candidates: prefer items with reliable difficulty
  // data, then maximize Fisher information at the current ability
  // estimate (the actual "target useful information, not blind
  // hardest/easiest" selection rule) — never seen first (already
  // enforced above), reliable-difficulty next, information last.
  const withParams = scoped.map((q) => {
    const stats = itemStatsById.get(q.id);
    const params = itemParams(q, stats);
    return { q, params, info: itemInformation(theta, params.a, params.b) };
  });

  const reliable = withParams.filter((x) => x.params.difficultyConfidence >= 0.5);
  const rankPool = reliable.length > 0 ? reliable : withParams;
  rankPool.sort((x, y) => y.info - x.info);
  return rankPool[0].q;
}
