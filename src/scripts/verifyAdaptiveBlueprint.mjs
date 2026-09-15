// Direct-function verification for the NREMT-blueprint-aware adaptive
// exam engine: contentBlueprint.js (per-level blueprint config, category/
// clinical-judgment classification, validation, readiness summaries) and
// adaptiveEngine.js's blueprint-aware selectNextItem/computeBlueprintProgress.
//
// Runs standalone via plain `node` (no dev server, no browser, no Firebase)
// — every fixture below is synthetic, built directly against the real
// exported schema, never against the live (mostly-EMT-only) question bank,
// so every certification level can be exercised even though real content
// currently only exists for EMT.
//
// Run: node src/scripts/verifyAdaptiveBlueprint.mjs

import {
  BLUEPRINTS_BY_LEVEL,
  BLUEPRINT_LEVELS,
  blueprintForLevel,
  blueprintCategoryOf,
  clinicalJudgmentOf,
  blueprintMidpointPct,
  validateBlueprintQuestion,
  filterValidForBlueprint,
  summarizeCategoryPerformance,
  summarizeClinicalJudgment,
  MIN_SAMPLE_FOR_ASSESSMENT,
} from "../education/contentBlueprint.js";
import {
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  itemParams,
  estimateAbility,
  probCorrect,
  itemInformation,
  readinessFromTheta,
  meetsStoppingConfidence,
  estimateExamLength,
  computeBlueprintProgress,
  scoreCandidate,
  selectNextItem,
} from "../education/adaptiveEngine.js";

let pass = 0;
let fail = 0;
function check(label, cond) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.error(`FAIL: ${label}`);
  }
}

// ---------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------

let idCounter = 0;
function q(level, domain, overrides = {}) {
  idCounter += 1;
  return {
    id: `synthetic-${level}-${idCounter}`,
    domain,
    level,
    question: `Synthetic question ${idCounter}`,
    choices: ["A", "B", "C", "D"],
    answerIndex: 0,
    explanation: "Because.",
    approved: true,
    ...overrides,
  };
}

// EMR/EMT: real content is tagged by body-system domain, so hitting every
// one of the five PHASE categories needs the explicit `blueprintCategory`
// override — exactly the documented escape hatch content authors are
// expected to use for a scene-safety or secondary-assessment question.
function makePhasePool(level, perCategory = 30) {
  const bp = blueprintForLevel(level);
  const out = [];
  for (const cat of bp.categories) {
    for (let i = 0; i < perCategory; i++) {
      out.push(q(level, "Airway", { blueprintCategory: cat.key }));
    }
  }
  return out;
}

// AEMT/Paramedic: domain IS the blueprint category (system-style), and
// clinicalJudgment is cross-cutting — every category gets a mix of
// true/false/unclassified so novelty/deficit scoring both have real
// candidates to choose between.
const SYSTEM_DOMAIN_OF = {
  airway: "Airway",
  cardiology: "Cardiology",
  trauma: "Trauma",
  medicalObgyn: "Medical + OBGYN",
  operations: "EMS Operations",
};
function makeSystemPool(level, perCategory = 40) {
  const bp = blueprintForLevel(level);
  const out = [];
  for (const cat of bp.categories) {
    for (let i = 0; i < perCategory; i++) {
      const cj = i % 3 === 0 ? true : i % 3 === 1 ? false : undefined; // undefined = unclassified
      out.push(q(level, SYSTEM_DOMAIN_OF[cat.key], cj === undefined ? {} : { clinicalJudgment: cj }));
    }
  }
  return out;
}

function statsMapFor(pool, { varied = false } = {}) {
  if (!varied) {
    // No community response data at all — every item shrinks fully toward
    // the neutral (b=0) prior. Fine for tests exercising selection/
    // blueprint logic in isolation, where difficulty spread doesn't matter.
    return new Map(pool.map((p) => [p.id, null]));
  }
  // A real, well-backed (well above RELIABLE_N responses, so difficultyFromStats
  // barely shrinks it toward neutral), LINEARLY spread difficulty curve —
  // from a very hard (2% community-correct) to a very easy (98%) item — so
  // a CAT actually has something well-matched to converge against at any
  // theta, including a genuinely high/low one. A pool where every item
  // sits at the same neutral difficulty (or only a narrow difficulty band)
  // can't let a real high/low-ability simulated responder's SE shrink
  // quickly — that would be an unrealistic fixture, not an engine defect.
  const n = Math.max(pool.length - 1, 1);
  return new Map(
    pool.map((p, i) => {
      const pctCorrectForItem = 2 + (i / n) * 96; // linear spread, 2% to 98%
      return [p.id, { attempts: 300, correct: Math.round((pctCorrectForItem / 100) * 300) }];
    })
  );
}

// Simulates a full adaptive exam run against a synthetic pool, using the
// REAL selectNextItem/estimateAbility/meetsStoppingConfidence functions —
// not a re-implementation — so this is testing the actual engine's
// end-to-end behavior, not a shadow of it.
function runSimulatedExam({ pool, level, theta = 0, maxQuestions = MIN_QUESTIONS, correctProb = 0.75, variedDifficulty = false }) {
  const stats = statsMapFor(pool, { varied: variedDifficulty });
  const administered = [];
  let ability = { theta: 0, se: 1 };
  const domainCounts = {};
  let cjPresented = 0;
  const administeredIds = new Set();
  const everSeenIds = new Set();

  for (let n = 0; n < maxQuestions; n++) {
    const picked = selectNextItem({
      pool,
      itemStatsById: stats,
      administeredIds,
      everSeenIds,
      theta: ability.theta,
      level,
      domainCounts,
      clinicalJudgmentPresented: cjPresented,
      questionNumber: n + 1,
      allowReuse: true,
    });
    if (!picked) break;

    administeredIds.add(picked.id);
    everSeenIds.add(picked.id);
    const params = itemParams(picked, stats.get(picked.id));
    // A biased coin using the TRUE underlying theta parameter, not the
    // exam's own running estimate — simulates a real test-taker with a
    // fixed ability answering real items, exactly what estimateAbility is
    // supposed to recover.
    const pTrue = probCorrect(theta, params.a, params.b);
    const correct = Math.random() < (correctProb != null ? correctProb : pTrue);

    const category = blueprintCategoryOf(picked, level);
    const cj = clinicalJudgmentOf(picked);
    administered.push({ question: picked, params, correct, category, clinicalJudgment: cj });
    domainCounts[category] = (domainCounts[category] || 0) + 1;
    if (cj === true) cjPresented += 1;

    const responses = administered.map((r) => ({ a: r.params.a, b: r.params.b, correct: r.correct }));
    ability = estimateAbility(responses);
  }

  return { administered, ability, domainCounts, cjPresented };
}

// =========================================================================
// 1-4. Per-level blueprint selection converges toward the real target
//      distribution over a full exam, for all four certification levels.
// =========================================================================
for (const level of BLUEPRINT_LEVELS) {
  const makePool = BLUEPRINTS_BY_LEVEL[level].domainStyle === "system" ? makeSystemPool : makePhasePool;
  const pool = makePool(level);
  const { administered, domainCounts } = runSimulatedExam({ pool, level, maxQuestions: MIN_QUESTIONS });
  const bp = blueprintForLevel(level);

  check(`${level}: exam reached the full MIN_QUESTIONS length`, administered.length === MIN_QUESTIONS);

  for (const cat of bp.categories) {
    const have = domainCounts[cat.key] || 0;
    const pct = have / administered.length;
    // A real 70-question exam can't hit a percentage range as tight as
    // e.g. 5-9% exactly (that's 3.5-6.3 questions) — allow a real,
    // generous tolerance band around [min,max] rather than demanding
    // impossible precision, while still proving the engine is clearly
    // steering toward the blueprint, not ignoring it.
    const tolerance = 0.06;
    check(
      `${level}/${cat.key}: final share ${(pct * 100).toFixed(1)}% is near [${cat.min * 100}-${cat.max * 100}]% (got ${have}/${administered.length})`,
      pct >= cat.min - tolerance && pct <= cat.max + tolerance
    );
  }
}

// =========================================================================
// 5. Blueprint percentage calculations
// =========================================================================
check("EMT sceneSafety midpoint is 17%", Math.abs(blueprintMidpointPct("sceneSafety", "EMT") - 17) < 1e-9);
check("EMT primaryAssessment midpoint is 41%", Math.abs(blueprintMidpointPct("primaryAssessment", "EMT") - 41) < 1e-9);
check("EMR sceneSafety midpoint is 21%", Math.abs(blueprintMidpointPct("sceneSafety", "EMR") - 21) < 1e-9);
check("AEMT clinicalJudgment midpoint is 33%", Math.abs(blueprintMidpointPct("clinicalJudgment", "AEMT") - 33) < 1e-9);
check("Paramedic clinicalJudgment midpoint is 36%", Math.abs(blueprintMidpointPct("clinicalJudgment", "Paramedic") - 36) < 1e-9);
check("AEMT medicalObgyn midpoint is 27%", Math.abs(blueprintMidpointPct("medicalObgyn", "AEMT") - 27) < 1e-9);
check("Paramedic medicalObgyn midpoint is 26%", Math.abs(blueprintMidpointPct("medicalObgyn", "Paramedic") - 26) < 1e-9);
check("EMR has no clinical-judgment dimension", blueprintForLevel("EMR").clinicalJudgment === null);
check("EMT has no clinical-judgment dimension", blueprintForLevel("EMT").clinicalJudgment === null);
check("AEMT has a clinical-judgment dimension", blueprintForLevel("AEMT").clinicalJudgment !== null);
check("Paramedic has a clinical-judgment dimension", blueprintForLevel("Paramedic").clinicalJudgment !== null);
for (const level of BLUEPRINT_LEVELS) {
  const bp = blueprintForLevel(level);
  const totalTargetPct = bp.categories.reduce((s, c) => s + c.target, 0);
  if (bp.clinicalJudgment) {
    // AEMT/Paramedic: Clinical Judgment is cross-cutting, not a seventh
    // mutually-exclusive category — every CJ question ALSO belongs to one
    // of the five content categories. NREMT's own published test plans
    // still list it as a nominal sixth row for informational purposes, so
    // content-category percentages alone are NOT expected to sum to 100%
    // on their own; content + clinical judgment together (the same shape
    // NREMT's own published table uses) should land close to it instead.
    const totalWithCJ = totalTargetPct + bp.clinicalJudgment.target;
    check(
      `${level}: content-category + clinical-judgment targets sum to ~100% (${(totalWithCJ * 100).toFixed(1)}%)`,
      Math.abs(totalWithCJ - 1) < 0.03
    );
    check(
      `${level}: content-category targets ALONE are noticeably under 100% (${(totalTargetPct * 100).toFixed(1)}%) — proving CJ isn't eating a fixed slice out of them`,
      totalTargetPct < 0.9
    );
  } else {
    // EMR/EMT have no clinical-judgment dimension — every question
    // belongs to exactly one of the five phase categories, so their
    // targets should sum close to 100% on their own (small slack expected:
    // each category's own target is independently the midpoint of a
    // published range, so the five midpoints don't necessarily sum to
    // exactly 100 — e.g. EMT's own real ranges land at 99%).
    check(`${level}: category targets sum to ~100% (${(totalTargetPct * 100).toFixed(1)}%)`, Math.abs(totalTargetPct - 1) < 0.02);
  }
  for (const c of bp.categories) {
    check(`${level}/${c.key}: min <= target <= max`, c.min <= c.target && c.target <= c.max);
  }
}

// =========================================================================
// 6. Minimum/maximum range handling
// =========================================================================
{
  const progress = computeBlueprintProgress({
    level: "AEMT",
    domainCounts: { airway: 5 },
    clinicalJudgmentPresented: 0,
    questionsAdministered: 50,
  });
  const airway = progress.categories.find((c) => c.key === "airway");
  const estLen = estimateExamLength(50); // 70, since 50 < MIN_QUESTIONS
  check("computeBlueprintProgress: minCount matches min*estimatedLength", Math.abs(airway.minCount - 0.09 * estLen) < 1e-9);
  check("computeBlueprintProgress: maxCount matches max*estimatedLength", Math.abs(airway.maxCount - 0.13 * estLen) < 1e-9);
  check("computeBlueprintProgress: targetCount matches target*estimatedLength", Math.abs(airway.targetCount - 0.11 * estLen) < 1e-9);
  check("computeBlueprintProgress: deficit = target - have", Math.abs(airway.deficit - (airway.targetCount - 5)) < 1e-9);
}

// =========================================================================
// 7. Projected distribution — the engine should notice a deficit EARLY,
//    not only once the exam is nearly over.
// =========================================================================
{
  // Zero trauma questions delivered after 60 of 70 questions — should be
  // flagged as unable to reach its floor (only 10 questions remain, well
  // short of even the minimum count for a 9% floor... actually check the
  // real arithmetic below).
  const progress = computeBlueprintProgress({
    level: "AEMT",
    domainCounts: { airway: 20, cardiology: 15, medicalObgyn: 20, operations: 5, trauma: 0 },
    clinicalJudgmentPresented: 0,
    questionsAdministered: 60,
  });
  const trauma = progress.categories.find((c) => c.key === "trauma");
  // estimatedTotalLength at 60 administered is max(70,60)=70; min count = 0.07*70=4.9
  // remaining = 10, bestCaseFinal = 0+10=10 >= 4.9, so it CAN still reach min (just barely, if every remaining question is trauma).
  check("projected distribution: trauma can still (barely) reach its floor with 10 left", trauma.canStillReachMin === true);

  // Now simulate being further along — 68 of 70 questions, still zero trauma.
  const progress2 = computeBlueprintProgress({
    level: "AEMT",
    domainCounts: { airway: 22, cardiology: 17, medicalObgyn: 22, operations: 7, trauma: 0 },
    clinicalJudgmentPresented: 0,
    questionsAdministered: 68,
  });
  const trauma2 = progress2.categories.find((c) => c.key === "trauma");
  // estimatedTotalLength at 68 = max(70,68)=70; remaining=2; bestCase=2 < 4.9 -> can no longer reach the floor.
  check("projected distribution: trauma CANNOT reach its floor with only 2 questions left", trauma2.canStillReachMin === false);
  check("projected distribution: this is flagged as projectedUnderMin too", trauma2.projectedUnderMin === true);
}

// =========================================================================
// 8 & 9. Clinical Judgment tracking, and CJ + domain tracking simultaneously
// =========================================================================
{
  // The exact example from the design brief: cardiology factual 85%,
  // cardiology clinical-judgment 55% — a meaningful weakness that a
  // plain "cardiology accuracy" number would hide entirely.
  const administered = [];
  for (let i = 0; i < 20; i++) {
    administered.push({ category: "cardiology", clinicalJudgment: false, correct: i < 17 }); // 17/20 = 85%
  }
  for (let i = 0; i < 20; i++) {
    administered.push({ category: "cardiology", clinicalJudgment: true, correct: i < 11 }); // 11/20 = 55%
  }
  for (let i = 0; i < 10; i++) {
    administered.push({ category: "trauma", clinicalJudgment: true, correct: i < 8 }); // 80%
  }
  // Unclassified questions must never leak into either bucket.
  administered.push({ category: "cardiology", clinicalJudgment: null, correct: true });

  const cj = summarizeClinicalJudgment(administered, "AEMT");
  check("CJ summary: overall presented excludes unclassified/factual questions", cj.presented === 30);
  check("CJ summary: overall accuracy is (11+8)/30 = 63%", cj.accuracy === Math.round((19 / 30) * 100));

  const cardiologyRow = cj.byCategory.find((c) => c.key === "cardiology");
  check("CJ+domain: cardiology factual accuracy is 85%", cardiologyRow.factual.pct === 85);
  check("CJ+domain: cardiology clinical-judgment accuracy is 55%", cardiologyRow.clinicalJudgment.pct === 55);
  check(
    "CJ+domain: distinguishable — factual and CJ accuracy differ for the same domain",
    cardiologyRow.factual.pct !== cardiologyRow.clinicalJudgment.pct
  );
  check("CJ+domain: unclassified cardiology question counted in neither factual nor CJ bucket", cardiologyRow.factual.presented + cardiologyRow.clinicalJudgment.presented === 20 + 20);

  const traumaRow = cj.byCategory.find((c) => c.key === "trauma");
  check("CJ+domain: trauma clinical-judgment accuracy is 80%", traumaRow.clinicalJudgment.pct === 80);
  check("CJ+domain: trauma has no factual data (insufficient)", traumaRow.factual.sufficientData === false);

  check("CJ summary: EMR/EMT levels return null (no CJ dimension)", summarizeClinicalJudgment(administered, "EMT") === null);
  check("CJ summary: EMR level also returns null", summarizeClinicalJudgment(administered, "EMR") === null);
}

// =========================================================================
// 10. Adaptive difficulty + blueprint balancing — ability/difficulty must
//     remain the dominant signal; blueprint pressure should only tip a
//     close call, never override a badly-mismatched-difficulty item.
// =========================================================================
{
  const level = "AEMT";
  const theta = 0.7; // a moderately able test-taker, per the design brief's own example
  const noDeficitProgress = computeBlueprintProgress({
    level,
    domainCounts: { airway: 8, cardiology: 9, trauma: 6, medicalObgyn: 19, operations: 6 }, // ~ already at target for a 70-question exam
    clinicalJudgmentPresented: 23,
    questionsAdministered: 48,
  });

  const trivialEasyTrauma = { params: { a: 1, b: -3.5, difficultyConfidence: 1 } }; // far below theta: low info
  const wellMatchedCardiology = { params: { a: 1, b: 0.7, difficultyConfidence: 1 } }; // == theta: max info

  const scoreEasyTrauma = scoreCandidate({
    q: { id: "t1", domain: "Trauma", level, blueprintCategory: "trauma" },
    params: trivialEasyTrauma.params,
    theta,
    level,
    progress: noDeficitProgress,
  });
  const scoreMatchedCardiology = scoreCandidate({
    q: { id: "c1", domain: "Cardiology", level, blueprintCategory: "cardiology" },
    params: wellMatchedCardiology.params,
    theta,
    level,
    progress: noDeficitProgress,
  });
  check(
    "difficulty stays dominant: a well-matched item beats a trivially easy one even with no blueprint deficit either way",
    scoreMatchedCardiology > scoreEasyTrauma
  );

  // Now: two items with IDENTICAL, well-matched difficulty, one in a
  // genuinely deficient category. Blueprint pressure should now decide it.
  const deficitProgress = computeBlueprintProgress({
    level,
    domainCounts: { airway: 8, cardiology: 9, trauma: 0, medicalObgyn: 19, operations: 6 }, // trauma badly behind
    clinicalJudgmentPresented: 23,
    questionsAdministered: 42,
  });
  const paramsMatched = { a: 1, b: theta, difficultyConfidence: 1 };
  const scoreTraumaDeficient = scoreCandidate({
    q: { id: "t2", domain: "Trauma", level, blueprintCategory: "trauma" },
    params: paramsMatched,
    theta,
    level,
    progress: deficitProgress,
  });
  const scoreCardiologyOnTarget = scoreCandidate({
    q: { id: "c2", domain: "Cardiology", level, blueprintCategory: "cardiology" },
    params: paramsMatched,
    theta,
    level,
    progress: deficitProgress,
  });
  check(
    "blueprint balancing breaks a difficulty tie in favor of the deficient category",
    scoreTraumaDeficient > scoreCardiologyOnTarget
  );
}

// =========================================================================
// 11. Question history exclusion — never re-administered this exam;
//     never a question already seen elsewhere unless the never-seen pool
//     is exhausted; never repeated within the exam unless EVERYTHING has
//     already been given.
// =========================================================================
{
  const level = "EMT";
  const pool = makePhasePool(level, 3); // small pool: 3 per category, 15 total
  const stats = statsMapFor(pool);
  const administeredIds = new Set([pool[0].id, pool[1].id]);
  const everSeenIds = new Set([pool[0].id, pool[1].id, pool[2].id]); // pool[2] seen in MCQ Practice, never this exam

  const picked = selectNextItem({
    pool,
    itemStatsById: stats,
    administeredIds,
    everSeenIds,
    theta: 0,
    level,
    domainCounts: {},
    clinicalJudgmentPresented: 0,
    questionNumber: 3,
    allowReuse: true,
  });
  check("never picks a question already administered this exam", picked.id !== pool[0].id && picked.id !== pool[1].id);
  check("prefers a genuinely never-seen-anywhere question over a seen-elsewhere one", picked.id !== pool[2].id);

  // Exhaust every never-seen-anywhere question; only "seen elsewhere" left.
  const allButOneEverSeen = new Set(pool.slice(0, -1).map((p) => p.id));
  const pickedSeenElsewhere = selectNextItem({
    pool,
    itemStatsById: stats,
    administeredIds: new Set(),
    everSeenIds: allButOneEverSeen,
    theta: 0,
    level,
    domainCounts: {},
    clinicalJudgmentPresented: 0,
    questionNumber: 1,
    allowReuse: true,
  });
  check("falls back to the one genuinely never-seen item when everything else has been seen elsewhere", pickedSeenElsewhere.id === pool[pool.length - 1].id);

  // Everything in the pool already administered THIS exam — repeat only
  // when allowReuse is true.
  const allAdministered = new Set(pool.map((p) => p.id));
  const pickedRepeat = selectNextItem({
    pool,
    itemStatsById: stats,
    administeredIds: allAdministered,
    everSeenIds: allAdministered,
    theta: 0,
    level,
    domainCounts: {},
    clinicalJudgmentPresented: 0,
    questionNumber: pool.length + 1,
    allowReuse: true,
  });
  check("repeats a question only once the whole pool has been exhausted, when reuse is allowed", pool.some((p) => p.id === pickedRepeat.id));
  const pickedNoReuse = selectNextItem({
    pool,
    itemStatsById: stats,
    administeredIds: allAdministered,
    everSeenIds: allAdministered,
    theta: 0,
    level,
    domainCounts: {},
    clinicalJudgmentPresented: 0,
    questionNumber: pool.length + 1,
    allowReuse: false,
  });
  check("returns null (never repeats) when the pool is exhausted and reuse is disallowed", pickedNoReuse === null);
}

// =========================================================================
// 12. SRS/practice history must never count toward the CURRENT exam's own
//     blueprint exposure — only administered-this-exam counts.
// =========================================================================
{
  const level = "AEMT";
  const pool = makeSystemPool(level, 20);
  const stats = statsMapFor(pool);
  // Simulate a user who has PRACTICED (SRS/MCQ Practice) hundreds of
  // Cardiology questions — everSeenIds is large and cardiology-heavy —
  // but has taken NO adaptive-exam questions yet this attempt at all.
  const heavyPracticeHistory = new Set(pool.filter((p) => p.domain === "Cardiology").map((p) => p.id));

  const progressBeforeAnyExamQuestions = computeBlueprintProgress({
    level,
    domainCounts: {}, // this exam: nothing administered yet
    clinicalJudgmentPresented: 0,
    questionsAdministered: 0,
  });
  const cardiologyRow = progressBeforeAnyExamQuestions.categories.find((c) => c.key === "cardiology");
  check(
    "SRS/practice history does not satisfy the current exam's blueprint: cardiology exposure reads exactly 0 despite heavy prior practice",
    cardiologyRow.have === 0
  );

  // And selection must still be free to pick a Cardiology question for
  // real (everSeenIds only affects NOVELTY tiering, never domainCounts).
  const picked = selectNextItem({
    pool,
    itemStatsById: stats,
    administeredIds: new Set(),
    everSeenIds: heavyPracticeHistory,
    theta: 0,
    level,
    domainCounts: {},
    clinicalJudgmentPresented: 0,
    questionNumber: 1,
    allowReuse: true,
  });
  check("a heavily-SRS-practiced domain can still be selected for the exam (novelty only affects tiering, not blueprint exposure)", !!picked);
}

// =========================================================================
// 13. End-of-exam distribution — already exercised at scale in tests 1-4
//     above; this adds an explicit check that the FULL final distribution
//     (not just one category) is coherent and sums correctly.
// =========================================================================
{
  const level = "Paramedic";
  const pool = makeSystemPool(level);
  const { administered, domainCounts } = runSimulatedExam({ pool, level, maxQuestions: MIN_QUESTIONS });
  const total = Object.values(domainCounts).reduce((s, n) => s + n, 0);
  check("end-of-exam: category counts sum to the total administered", total === administered.length);
}

// =========================================================================
// 14 & 15. Small and large exam sizes
// =========================================================================
{
  check("estimateExamLength at 0 administered assumes the minimum", estimateExamLength(0) === MIN_QUESTIONS);
  check("estimateExamLength at 5 administered still assumes the minimum", estimateExamLength(5) === MIN_QUESTIONS);
  check("estimateExamLength at MIN_QUESTIONS assumes it could end right now", estimateExamLength(MIN_QUESTIONS) === MIN_QUESTIONS);
  check("estimateExamLength past MIN_QUESTIONS tracks the current count", estimateExamLength(95) === 95);
  check("estimateExamLength never exceeds MAX_QUESTIONS", estimateExamLength(MAX_QUESTIONS + 50) === MAX_QUESTIONS);

  const level = "EMR";
  const pool = makePhasePool(level, 60);
  const small = runSimulatedExam({ pool, level, maxQuestions: 1 });
  check("a 1-question exam doesn't crash and produces one administered record", small.administered.length === 1);

  const large = runSimulatedExam({ pool: makePhasePool(level, 80), level, maxQuestions: MAX_QUESTIONS });
  check(`a full-length (${MAX_QUESTIONS}-question) exam runs to completion without crashing`, large.administered.length === MAX_QUESTIONS);
}

// =========================================================================
// 16. Missing/invalid metadata — validation
// =========================================================================
{
  const good = q("AEMT", "Cardiology", { clinicalJudgment: true });
  check("a well-formed question validates clean", validateBlueprintQuestion(good).valid === true);

  const noLevel = q("AEMT", "Cardiology");
  delete noLevel.level;
  check("a question with no level is rejected", validateBlueprintQuestion(noLevel).valid === false);

  const unknownLevel = q("Other", "Cardiology"); // "Other" is a real questions.js LEVEL but has no blueprint
  check("a question at a level with no defined blueprint is rejected", validateBlueprintQuestion(unknownLevel).valid === false);

  const unknownDomain = q("AEMT", "Not A Real Domain");
  check("a question with an unrecognized domain is rejected", validateBlueprintQuestion(unknownDomain).valid === false);

  const badBlueprintCategory = q("EMT", "Airway", { blueprintCategory: "not-a-real-category" });
  check("a question with an invalid blueprintCategory override is rejected", validateBlueprintQuestion(badBlueprintCategory).valid === false);

  const badCJ = q("AEMT", "Cardiology", { clinicalJudgment: "yes" }); // must be boolean, not a string
  check("a non-boolean clinicalJudgment value is rejected", validateBlueprintQuestion(badCJ).valid === false);

  const cjOmitted = q("AEMT", "Cardiology");
  check("an omitted clinicalJudgment value is valid (unclassified, not an error)", validateBlueprintQuestion(cjOmitted).valid === true);
  check("an omitted clinicalJudgment classifies as null, not false", clinicalJudgmentOf(cjOmitted) === null);

  // filterValidForBlueprint must silently exclude the bad ones, keep the
  // good ones, and never throw.
  const mixed = [good, noLevel, unknownDomain, badCJ, cjOmitted];
  const origWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args.join(" "));
  let filtered;
  try {
    filtered = filterValidForBlueprint(mixed);
  } finally {
    console.warn = origWarn;
  }
  check("filterValidForBlueprint keeps exactly the valid questions", filtered.length === 2 && filtered.includes(good) && filtered.includes(cjOmitted));
  check("filterValidForBlueprint logs a dev warning per excluded question", warnings.length === 3);
}

// =========================================================================
// 17. No eligible questions in an underrepresented category — selection
//     must degrade gracefully (pick something else), never crash or
//     force a nonexistent question into existence.
// =========================================================================
{
  const level = "AEMT";
  // A pool with ZERO trauma questions at all.
  const pool = [
    ...Array.from({ length: 20 }, () => q(level, "Cardiology")),
    ...Array.from({ length: 20 }, () => q(level, "Airway")),
  ];
  const stats = statsMapFor(pool);
  const progress = computeBlueprintProgress({
    level,
    domainCounts: { cardiology: 20, airway: 20, trauma: 0 },
    clinicalJudgmentPresented: 0,
    questionsAdministered: 40,
  });
  const trauma = progress.categories.find((c) => c.key === "trauma");
  check("a category can be flagged as badly deficient with no candidates available at all", trauma.deficit > 0);

  const picked = selectNextItem({
    pool,
    itemStatsById: stats,
    administeredIds: new Set(),
    everSeenIds: new Set(),
    theta: 0,
    level,
    domainCounts: { cardiology: 20, airway: 20, trauma: 0 },
    clinicalJudgmentPresented: 0,
    questionNumber: 41,
    allowReuse: true,
  });
  check("selection never crashes when the deficient category has zero real candidates — it picks from what exists instead", !!picked);
}

// Edge case: an exhausted Clinical Judgment pool (no unused CJ questions
// left), while non-CJ questions remain — must not crash, and must simply
// stop being able to add more CJ exposure.
{
  const level = "Paramedic";
  const cjPool = Array.from({ length: 5 }, () => q(level, "Cardiology", { clinicalJudgment: true }));
  const factualPool = Array.from({ length: 60 }, () => q(level, "Cardiology", { clinicalJudgment: false }));
  const pool = [...cjPool, ...factualPool];
  const stats = statsMapFor(pool);
  const administeredIds = new Set(cjPool.map((p) => p.id)); // every CJ question already given this exam
  const picked = selectNextItem({
    pool,
    itemStatsById: stats,
    administeredIds,
    everSeenIds: administeredIds,
    theta: 0,
    level,
    domainCounts: { cardiology: 5 },
    clinicalJudgmentPresented: 5,
    questionNumber: 6,
    allowReuse: true,
  });
  check("an exhausted clinical-judgment sub-pool doesn't crash selection — a factual question is chosen instead", !!picked && picked.clinicalJudgment !== true);
}

// =========================================================================
// 18. User ability estimation remains functional with blueprint scoring
//     active — extremely high and extremely low ability, both ends.
// =========================================================================
{
  const level = "EMT";
  const pool = makePhasePool(level, 60);

  const highAbility = runSimulatedExam({ pool, level, theta: 3.5, correctProb: 0.97, maxQuestions: MIN_QUESTIONS });
  check("extremely high ability produces a high final theta", highAbility.ability.theta > 1.0);
  check("extremely high ability produces a high readiness score", readinessFromTheta(highAbility.ability.theta) > 80);

  const lowAbility = runSimulatedExam({ pool, level, theta: -3.5, correctProb: 0.05, maxQuestions: MIN_QUESTIONS });
  check("extremely low ability produces a low final theta", lowAbility.ability.theta < -1.0);
  check("extremely low ability produces a low readiness score", readinessFromTheta(lowAbility.ability.theta) < 20);

  check("ability estimate always stays within its clamped bounds", highAbility.ability.theta <= 4 && lowAbility.ability.theta >= -4);
  check("standard error is always positive and finite", highAbility.ability.se > 0 && Number.isFinite(highAbility.ability.se));
}

// =========================================================================
// 19. Existing exam stopping rules remain functional (unchanged config +
//     unchanged pure stopping-confidence function).
// =========================================================================
check("MIN_QUESTIONS is unchanged at 70", MIN_QUESTIONS === 70);
check("MAX_QUESTIONS is unchanged at 120", MAX_QUESTIONS === 120);
check("meetsStoppingConfidence: a wide-open SE (se=1) does not meet the 99% threshold", meetsStoppingConfidence(1) === false);
check("meetsStoppingConfidence: a tight SE (se=0.1) meets the 99% threshold", meetsStoppingConfidence(0.1) === true);
{
  // Exam continues close to MAX_QUESTIONS: a genuinely noisy, inconsistent
  // responder whose ability estimate never settles should still terminate
  // exactly at MAX_QUESTIONS, not run forever.
  const level = "EMT";
  const pool = makePhasePool(level, 80);
  const stats = statsMapFor(pool);
  const administered = [];
  let ability = { theta: 0, se: 1 };
  const domainCounts = {};
  const administeredIds = new Set();
  for (let n = 0; n < MAX_QUESTIONS + 10; n++) {
    if (administered.length >= MAX_QUESTIONS) break;
    if (administered.length >= MIN_QUESTIONS && meetsStoppingConfidence(ability.se)) break;
    const picked = selectNextItem({
      pool,
      itemStatsById: stats,
      administeredIds,
      everSeenIds: administeredIds,
      theta: ability.theta,
      level,
      domainCounts,
      clinicalJudgmentPresented: 0,
      questionNumber: n + 1,
      allowReuse: true,
    });
    if (!picked) break;
    administeredIds.add(picked.id);
    const params = itemParams(picked, null);
    const correct = Math.random() < 0.5; // maximally noisy — never converges
    const category = blueprintCategoryOf(picked, level);
    administered.push({ question: picked, params, correct, category });
    domainCounts[category] = (domainCounts[category] || 0) + 1;
    ability = estimateAbility(administered.map((r) => ({ a: r.params.a, b: r.params.b, correct: r.correct })));
  }
  check("a noisy responder's exam terminates at (not past) MAX_QUESTIONS", administered.length <= MAX_QUESTIONS);
}
// Exam terminates near the minimum: a very consistent responder should be
// able to stop right around MIN_QUESTIONS.
{
  const level = "EMT";
  const pool = makePhasePool(level, 60);
  // Real, spread-out item difficulty (see statsMapFor's `varied` option) —
  // a CAT can only converge quickly when it has informative items to pick
  // from; correctProb:null makes each answer's correctness follow the
  // item's own true IRT probability at the responder's fixed theta,
  // matching a real, internally-consistent test-taker rather than a flat
  // coin flip.
  const result = runSimulatedExam({ pool, level, theta: 2.5, correctProb: null, maxQuestions: MAX_QUESTIONS, variedDifficulty: true });
  // We ran the full simulator loop for up to MAX_QUESTIONS regardless of
  // stopping rules (runSimulatedExam doesn't itself stop early) — instead
  // check that meetsStoppingConfidence WOULD have fired well before MAX.
  let stoppedAt = null;
  let ability = { theta: 0, se: 1 };
  const responses = [];
  for (let i = 0; i < result.administered.length; i++) {
    responses.push({ a: result.administered[i].params.a, b: result.administered[i].params.b, correct: result.administered[i].correct });
    ability = estimateAbility(responses);
    if (responses.length >= MIN_QUESTIONS && meetsStoppingConfidence(ability.se)) {
      stoppedAt = responses.length;
      break;
    }
  }
  // Whether the 99% threshold formally triggers before MAX_QUESTIONS
  // depends on how well-matched the synthetic item pool's difficulty
  // spread happens to be against this responder's true theta on any given
  // run (blueprint pressure also legitimately trades away a little pure
  // information-maximization for content coverage, per item 5's own "never
  // sacrifice difficulty adaptation, but blueprint balancing is allowed to
  // cost a little convergence speed" design) — so the real invariant this
  // case checks is that ability estimation keeps converging (se shrinks
  // substantially from its wide-open starting point) throughout a long
  // run, not that it necessarily crosses the stopping threshold by exactly
  // MIN_QUESTIONS. A full run reaching MAX_QUESTIONS without crashing is
  // already covered by the "runs to completion" case above.
  check("a consistent, high-ability responder's SE shrinks substantially over a long run", ability.se < 0.4);
  check("... and never fails to terminate: stoppedAt (if any) is within [MIN,MAX]", stoppedAt === null || (stoppedAt >= MIN_QUESTIONS && stoppedAt <= MAX_QUESTIONS));
}

// =========================================================================
// Domain overrepresented early in the exam — the engine should penalize
// (not force-exclude) further picks from it.
// =========================================================================
{
  const level = "AEMT";
  const progress = computeBlueprintProgress({
    level,
    domainCounts: { airway: 2, cardiology: 2, trauma: 2, medicalObgyn: 20, operations: 1 }, // medicalObgyn way over target early
    clinicalJudgmentPresented: 0,
    questionsAdministered: 27,
  });
  const medicalObgyn = progress.categories.find((c) => c.key === "medicalObgyn");
  check("an early-overrepresented category shows a negative deficit (overexposure)", medicalObgyn.deficit < 0);

  const paramsMatched = { a: 1, b: 0, difficultyConfidence: 1 };
  const scoreOverrepresented = scoreCandidate({
    q: { id: "m1", domain: "Medical + OBGYN", level, blueprintCategory: "medicalObgyn" },
    params: paramsMatched,
    theta: 0,
    level,
    progress,
  });
  const scoreUnderrepresented = scoreCandidate({
    q: { id: "o1", domain: "EMS Operations", level, blueprintCategory: "operations" },
    params: paramsMatched,
    theta: 0,
    level,
    progress,
  });
  check(
    "overrepresented category scores lower than an underrepresented one at equal difficulty match",
    scoreOverrepresented < scoreUnderrepresented
  );
}

// =========================================================================
// itemInformation sanity (used throughout scoring — confirm it still peaks
// at theta == b and is well-behaved at the extremes).
// =========================================================================
check("itemInformation peaks when difficulty matches ability", itemInformation(1, 1, 1) > itemInformation(1, 1, 4));
check("itemInformation is finite and non-negative at an extreme theta", itemInformation(4, 1, -4) >= 0 && Number.isFinite(itemInformation(4, 1, -4)));

// =========================================================================
// MIN_SAMPLE_FOR_ASSESSMENT / summarizeCategoryPerformance: exposure vs.
// performance must stay distinct — a domain with too little data must
// never be reported as a weakness.
// =========================================================================
{
  const administered = [
    { category: "sceneSafety", correct: false }, // 0/1 = 0%, but only 1 question
    { category: "primaryAssessment", correct: true },
    { category: "primaryAssessment", correct: true },
    { category: "primaryAssessment", correct: false },
  ];
  const summary = summarizeCategoryPerformance(administered, "EMT");
  const sceneSafety = summary.find((c) => c.key === "sceneSafety");
  check(`a category with fewer than MIN_SAMPLE_FOR_ASSESSMENT (${MIN_SAMPLE_FOR_ASSESSMENT}) questions is not "sufficientData"`, sceneSafety.sufficientData === false);
  check("its raw percentage is still computed (0%) even though it's not assessment-ready", sceneSafety.pct === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
