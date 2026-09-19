// Synthetic-only calibration harness for Education Mode's production
// difficulty estimator. It never reads/writes question stats or Firebase.
// The synthetic responses are fed through difficultyFromStats(), the exact
// estimator used by the application, and compared to known latent difficulty.

import { difficultyFromStats, probCorrect } from "../education/adaptiveEngine.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Small deterministic PRNG: calibration checks must be reproducible, not
// occasionally fail just because random samples had an unlucky run.
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function normal(random, mean = 0, sd = 1) {
  const u = Math.max(random(), Number.MIN_VALUE);
  const v = random();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function syntheticStats({ difficulty, count, abilitySd = 1, seed }) {
  const random = rng(seed);
  let correct = 0;
  for (let i = 0; i < count; i += 1) {
    const ability = normal(random, 0, abilitySd);
    if (random() < probCorrect(ability, 1, difficulty)) correct += 1;
  }
  return { attempts: count, correct, choiceCounts: [] };
}

function meanEstimate({ difficulty, count, abilitySd = 1, runs = 80, seed = 1 }) {
  let total = 0;
  for (let i = 0; i < runs; i += 1) {
    total += difficultyFromStats(syntheticStats({ difficulty, count, abilitySd, seed: seed + i })).b;
  }
  return total / runs;
}

function estimateVariance({ difficulty, count, abilitySd = 1, runs = 100, seed = 1000 }) {
  const estimates = Array.from({ length: runs }, (_, i) =>
    difficultyFromStats(syntheticStats({ difficulty, count, abilitySd, seed: seed + i })).b
  );
  const average = estimates.reduce((sum, value) => sum + value, 0) / estimates.length;
  return estimates.reduce((sum, value) => sum + (value - average) ** 2, 0) / estimates.length;
}

const scenarios = [
  { name: "very easy", difficulty: -1.5 },
  { name: "easy", difficulty: -0.75 },
  { name: "medium", difficulty: 0 },
  { name: "hard", difficulty: 0.75 },
  { name: "very hard", difficulty: 1.5 },
];

// 1. Difficulty ordering must follow known synthetic difficulty under both a
// normally distributed and a deliberately broad learner-ability population.
for (const [label, abilitySd] of [["normal", 1], ["broad", 2.25]]) {
  const estimates = scenarios.map((scenario, index) => ({
    ...scenario,
    b: meanEstimate({ difficulty: scenario.difficulty, count: 2000, abilitySd, seed: index * 200 }),
  }));
  for (let i = 1; i < estimates.length; i += 1) {
    assert(estimates[i].b > estimates[i - 1].b, `${label} ratings did not preserve difficulty ordering`);
  }
}

// 2. Large samples must produce more stable estimates than small samples.
for (const scenario of scenarios) {
  const small = estimateVariance({ difficulty: scenario.difficulty, count: 5, seed: 300 });
  const large = estimateVariance({ difficulty: scenario.difficulty, count: 500, seed: 700 });
  assert(large < small, `${scenario.name}: 500 ratings were not more stable than 5 ratings`);
}

// 3. A single rating is substantially shrunk toward neutral and carries low
// confidence; the same known response rate with more ratings is trusted more.
const oneCorrect = difficultyFromStats({ attempts: 1, correct: 1, choiceCounts: [] });
const manyCorrect = difficultyFromStats({ attempts: 100, correct: 100, choiceCounts: [] });
assert(Math.abs(oneCorrect.b) < Math.abs(manyCorrect.b), "a single rating had disproportionate difficulty influence");
assert(oneCorrect.confidence === 0.05, "one rating did not receive low confidence");
assert(difficultyFromStats({ attempts: 4, correct: 2, choiceCounts: [] }).confidence < 0.25, "few ratings had excessive confidence");
assert(difficultyFromStats({ attempts: 20, correct: 10, choiceCounts: [] }).confidence === 1, "sufficient ratings did not reach full confidence");

// 4. Estimates should approach the known model direction as samples grow.
for (const scenario of scenarios) {
  const small = meanEstimate({ difficulty: scenario.difficulty, count: 10, seed: 1500 });
  const large = meanEstimate({ difficulty: scenario.difficulty, count: 3000, seed: 1800 });
  assert(Math.abs(large - scenario.difficulty) < Math.abs(small - scenario.difficulty) + 0.2,
    `${scenario.name}: large samples did not converge predictably`);
}

console.log("Synthetic difficulty calibration: 22 checks passed");