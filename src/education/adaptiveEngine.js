// Adaptive Test Mode's item-response engine: a real, if intentionally
// simple, IRT-style (2-parameter logistic) computerized-adaptive-testing
// implementation, inspired by publicly described CAT principles and the
// publicly described structure of NREMT's own certification exams. It is
// NOT a reproduction of NREMT's own proprietary scoring/selection
// algorithm — Proximate has no access to that and doesn't claim to.
//
// Core concepts, kept explicitly distinct throughout (never conflated —
// see contentBlueprint.js's own header comment for the blueprint/clinical-
// judgment half of this same discipline):
//   - user ABILITY estimate (theta) + its standard error — this file
//   - item DIFFICULTY (b) and DISCRIMINATION (a) — derived from community
//     response data (itemStats.js), never from one user's own performance
//   - item DIFFICULTY CONFIDENCE — how much community data backs that b
//   - question QUALITY — a manual approval decision (crowdsource.js),
//     unrelated to any of the above
//   - NREMT BLUEPRINT — a content-distribution CONSTRAINT (contentBlueprint.js)
//   - CLINICAL JUDGMENT — a cross-cutting cognitive dimension, AEMT/
//     Paramedic only (contentBlueprint.js)
//   - SRS / practice history — longitudinal learning data (srs.js,
//     userStats.js); contributes to question NOVELTY (everSeenIds) but
//     never to this exam's own blueprint exposure counts, which are always
//     derived from THIS exam's administered-item list alone
//
// See MethodsPage.jsx for the player-facing explanation of all of this.

import { pctCorrect } from "./itemStats.js";
import { blueprintForLevel, blueprintCategoryOf, clinicalJudgmentOf } from "./contentBlueprint.js";

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

// ---------------------------------------------------------------------
// Blueprint-aware selection support
// ---------------------------------------------------------------------

// How long the exam is assumed to run, FOR PLANNING PURPOSES ONLY, as of
// `questionsAdministered` questions in. Deliberately conservative rather
// than optimistic: while under the hard minimum, assume the exam ends at
// exactly that minimum (the earliest it legally can) — the worst case for
// "do I still have room to fix a deficit" — so blueprint pressure starts
// building from question 1, not only once the exam is already running
// long. Once past the minimum, assume the exam could end on the VERY NEXT
// question (questionsAdministered itself), which is again the worst case:
// it forces the engine to treat every remaining pick as possibly the last
// chance to correct course, exactly the "don't discover a bad distribution
// near the end" behavior this system exists to prevent. This never
// prevents the exam from actually running past MIN_QUESTIONS when the
// ability estimate needs more data — it only governs how urgently
// blueprint balancing behaves while that's happening.
export function estimateExamLength(questionsAdministered) {
  return clamp(Math.max(MIN_QUESTIONS, questionsAdministered), MIN_QUESTIONS, MAX_QUESTIONS);
}

// For one blueprint row (a content category OR the clinical-judgment
// dimension), computes: target/min/max question counts for the assumed
// final exam length, how many have actually been delivered so far, the
// deficit (positive = underrepresented, negative = overrepresented), the
// PROJECTED final count/pct if the current per-question rate continues for
// the rest of the exam, and whether the category can still possibly reach
// its floor at all (the "if I continue selecting this way, can I still
// finish within the blueprint?" question) even in the best case where
// every single remaining question goes to it.
function blueprintRow(rangeDef, have, questionsAdministered, estimatedTotalLength) {
  const targetCount = rangeDef.target * estimatedTotalLength;
  const minCount = rangeDef.min * estimatedTotalLength;
  const maxCount = rangeDef.max * estimatedTotalLength;
  const deficit = targetCount - have;

  const remaining = Math.max(estimatedTotalLength - questionsAdministered, 0);
  const rateSoFar = questionsAdministered > 0 ? have / questionsAdministered : rangeDef.target;
  const projectedFinal = have + rateSoFar * remaining;
  const projectedPct = estimatedTotalLength > 0 ? projectedFinal / estimatedTotalLength : 0;

  const bestCaseFinal = have + remaining; // every remaining question goes to this category
  const canStillReachMin = bestCaseFinal >= minCount - 1e-9;

  return {
    key: rangeDef.key,
    label: rangeDef.label,
    min: rangeDef.min,
    target: rangeDef.target,
    max: rangeDef.max,
    have,
    havePct: questionsAdministered > 0 ? have / questionsAdministered : 0,
    targetCount,
    minCount,
    maxCount,
    deficit,
    projectedFinal,
    projectedPct,
    projectedUnderMin: projectedFinal < minCount - 0.5,
    projectedOverMax: projectedFinal > maxCount + 0.5,
    canStillReachMin,
  };
}

// The full, per-category (and, where applicable, clinical-judgment)
// snapshot the selection algorithm and any debug/dev UI both read from —
// see item 14's dev-panel requirement and item 7's "answer the question:
// if I continue selecting this way, can I still finish within the
// blueprint?" requirement. `domainCounts` and `clinicalJudgmentPresented`
// must be derived from THIS EXAM's own administered-item list only — never
// from SRS/practice history (see this file's own header note).
export function computeBlueprintProgress({ level, domainCounts, clinicalJudgmentPresented, questionsAdministered }) {
  const bp = blueprintForLevel(level);
  const estimatedTotalLength = estimateExamLength(questionsAdministered);

  const categories = bp.categories.map((c) =>
    blueprintRow(c, domainCounts?.[c.key] || 0, questionsAdministered, estimatedTotalLength)
  );

  const clinicalJudgment = bp.clinicalJudgment
    ? blueprintRow(bp.clinicalJudgment, clinicalJudgmentPresented || 0, questionsAdministered, estimatedTotalLength)
    : null;

  return { level, estimatedTotalLength, questionsAdministered, categories, clinicalJudgment };
}

// Proximate's own selection-weight constants (design choices, not
// published NREMT values). Kept small relative to Fisher information's
// typical range (0 to ~0.25 at a=1) so ability/difficulty targeting always
// remains the dominant signal — blueprint and clinical-judgment pressure
// only tip the balance between otherwise-similarly-informative candidates,
// never override a badly-mismatched-difficulty item just to hit a quota.
const BLUEPRINT_DEFICIT_WEIGHT = 0.12;
const BLUEPRINT_URGENT_BONUS = 0.35; // added only when the category can no longer reach its floor any other way
const CLINICAL_JUDGMENT_DEFICIT_WEIGHT = 0.1;
const CLINICAL_JUDGMENT_URGENT_BONUS = 0.25;
const DIFFICULTY_CONFIDENCE_BONUS = 0.05; // small, soft preference for well-calibrated items over untested ones

// questionPriority (conceptually, per the project's own design brief):
//   abilityNeed + difficultyAppropriateness   -> itemInformation(theta,a,b)
//                                                 (the standard IRT
//                                                 selection criterion
//                                                 already blends both: it
//                                                 peaks exactly at b=theta
//                                                 and falls off the more
//                                                 mismatched the item is)
//   + blueprintDeficit                        -> deficit-weighted, with an
//                                                 urgency bonus only when
//                                                 the category can no
//                                                 longer be salvaged any
//                                                 other way
//   + clinicalJudgmentDeficit                 -> same shape, applied only
//                                                 to questions with a
//                                                 KNOWN (non-null)
//                                                 clinicalJudgment value,
//                                                 and only for levels whose
//                                                 blueprint has that
//                                                 dimension at all
//   - overexposurePenalty                     -> falls out for free: a
//                                                 negative deficit (already
//                                                 over target) makes the
//                                                 deficit term itself
//                                                 negative
//   + novelty                                 -> handled upstream by the
//                                                 never-seen/seen-elsewhere
//                                                 tiering in selectNextItem,
//                                                 which is a STRONGER
//                                                 guarantee than a soft
//                                                 bonus would be (novelty
//                                                 must never be traded away
//                                                 for a blueprint deficit —
//                                                 see item 13)
export function scoreCandidate({ q, params, theta, level, progress }) {
  const info = itemInformation(theta, params.a, params.b);

  const category = blueprintCategoryOf(q, level);
  const catRow = progress.categories.find((c) => c.key === category);
  let blueprintScore = 0;
  if (catRow) {
    blueprintScore = catRow.deficit * BLUEPRINT_DEFICIT_WEIGHT;
    if (!catRow.canStillReachMin) blueprintScore += BLUEPRINT_URGENT_BONUS;
  }

  let cjScore = 0;
  if (progress.clinicalJudgment) {
    const cj = clinicalJudgmentOf(q);
    if (cj !== null) {
      const cjRow = progress.clinicalJudgment;
      // A clinical-judgment question is pulled toward the CJ deficit
      // exactly like a content-category question is pulled toward its own
      // deficit. A KNOWN non-clinical-judgment question gets the mirrored,
      // smaller pull: choosing it is slightly LESS attractive while CJ is
      // underrepresented, and slightly MORE attractive once CJ is already
      // over target — a soft push toward balance without ever excluding
      // the vast majority of ordinary factual questions.
      cjScore = (cj ? cjRow.deficit : -cjRow.deficit) * CLINICAL_JUDGMENT_DEFICIT_WEIGHT;
      if (cj && !cjRow.canStillReachMin) cjScore += CLINICAL_JUDGMENT_URGENT_BONUS;
    }
  }

  const confidenceBonus = params.difficultyConfidence >= 0.5 ? DIFFICULTY_CONFIDENCE_BONUS : 0;

  return info + blueprintScore + cjScore + confidenceBonus;
}

// Picks the next item to administer.
//   pool             — full eligible question objects (approved, this level)
//   itemStatsById    — Map<questionId, communityStats>
//   administeredIds  — Set of question ids already given THIS exam
//   everSeenIds      — Set of question ids the user has ever seen (any mode)
//   theta            — running ability estimate
//   level            — certification level being tested (EMR/EMT/AEMT/Paramedic)
//   domainCounts     — { [blueprintCategoryKey]: countSoFarThisExam } —
//                       THIS EXAM ONLY, never SRS/practice history
//   clinicalJudgmentPresented — count of clinical-judgment questions
//                       presented THIS EXAM ONLY (0 for a level with no
//                       clinical-judgment dimension; harmless either way)
//   questionNumber   — 1-indexed number of the item about to be picked
//   allowReuse       — once the never-seen pool is exhausted, allow re-picking
//                       an already-seen-by-this-user question
export function selectNextItem({
  pool,
  itemStatsById,
  administeredIds,
  everSeenIds,
  theta,
  level,
  domainCounts,
  clinicalJudgmentPresented,
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
  // cut short by running out of "fresh" candidates. This tiering is NEVER
  // overridden by blueprint/clinical-judgment scoring below (see item 13:
  // novelty/exclusion rules must not be defeated by blueprint balancing).
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

  const progress = computeBlueprintProgress({
    level,
    domainCounts,
    clinicalJudgmentPresented,
    questionsAdministered: Math.max(questionNumber - 1, 0),
  });

  // Soft, weighted scoring across the WHOLE eligible candidate set — never
  // a hard filter down to "the one deficient category." An underrepresented
  // category gets a higher chance of winning, never a guarantee that
  // overrides a badly-mismatched-difficulty item; see scoreCandidate's own
  // comment for exactly how ability/difficulty stay dominant.
  const scored = candidates.map((q) => {
    const stats = itemStatsById.get(q.id);
    const params = itemParams(q, stats);
    const priority = scoreCandidate({ q, params, theta, level, progress });
    return { q, params, priority };
  });

  scored.sort((x, y) => y.priority - x.priority);
  return scored[0].q;
}
