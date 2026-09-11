// Provider Level Assessment — a fun, adaptive-ish quiz that estimates the
// user's current knowledge level (Layperson -> EMR -> EMT -> AEMT ->
// Paramedic -> Other) by sampling real questions across every level in the
// existing question bank and measuring per-level, per-domain accuracy.
//
// This is explicitly NOT a certification exam and does NOT determine scope
// of practice — see DISCLAIMER below, always shown alongside results.
//
// Reuses the existing question pool/randomization/itemStats machinery —
// no separate question data, no new physiology/content.

import { LEVELS } from "./questions.js";
import { poolByLevel } from "./questionPool.js";

export const DISCLAIMER =
  "This is only a fun, educational estimate of where your knowledge currently sits. It is not a certification exam, not a substitute for accredited coursework, and it does not determine your legal scope of practice.";

// Ladder order for the OVERALL estimate. "Layperson" has no question-bank
// level of its own (nothing in the bank is authored below EMR) — it is
// only ever reported as the estimate when even EMR-level accuracy is too
// low to credit, i.e. "not there yet."
export const LADDER = ["Layperson", "EMR", "EMT", "AEMT", "Paramedic", "Other"];

const QUESTION_LEVELS = LEVELS.filter((l) => l !== "Other"); // "Other" has no bank questions today
const PER_LEVEL = 6;
const PASS_ACCURACY = 0.7;
const MIN_LEVEL_SAMPLE = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds a shuffled quiz set sampling PER_LEVEL questions from each
// question-bank level that actually has questions available (a level with
// fewer than PER_LEVEL just contributes what it has).
export function buildAssessmentSet(pool) {
  const set = [];
  for (const level of QUESTION_LEVELS) {
    const levelPool = poolByLevel(pool, level);
    if (levelPool.length === 0) continue;
    set.push(...shuffle(levelPool).slice(0, PER_LEVEL));
  }
  return shuffle(set);
}

// responses: [{ question, correct }]
export function computeAssessmentResult(responses) {
  const perLevel = {};
  const perDomain = {};
  let totalCorrect = 0;

  for (const { question, correct } of responses) {
    const lv = (perLevel[question.level] ||= { correct: 0, total: 0 });
    lv.total += 1;
    if (correct) lv.correct += 1;

    const dm = (perDomain[question.domain] ||= { correct: 0, total: 0 });
    dm.total += 1;
    if (correct) dm.correct += 1;

    if (correct) totalCorrect += 1;
  }

  const total = responses.length;
  const overallAccuracy = total ? totalCorrect / total : 0;

  // Walk the ladder from the bottom: the estimate is the highest bank
  // level with a passing, adequately-sampled accuracy AND every level
  // below it also passing (so a lucky Paramedic-question streak with a
  // failed EMR foundation doesn't outrank a solid EMT).
  let estimatedLevel = "Layperson";
  for (const level of QUESTION_LEVELS) {
    const lv = perLevel[level];
    if (!lv || lv.total < MIN_LEVEL_SAMPLE) break;
    const acc = lv.correct / lv.total;
    if (acc < PASS_ACCURACY) break;
    estimatedLevel = level;
  }

  // Confidence: more questions answered (up to the full set) and more
  // levels adequately sampled both raise confidence; a partial or
  // lopsided sample lowers it.
  const levelsAdequatelySampled = QUESTION_LEVELS.filter(
    (l) => perLevel[l] && perLevel[l].total >= MIN_LEVEL_SAMPLE
  ).length;
  const sampleConfidence = Math.min(1, total / (PER_LEVEL * QUESTION_LEVELS.length));
  const spreadConfidence = QUESTION_LEVELS.length ? levelsAdequatelySampled / QUESTION_LEVELS.length : 0;
  const confidence = Math.round(sampleConfidence * spreadConfidence * 100);

  // Domains where accuracy is notably above/below the overall average —
  // "areas above/below your estimated level."
  const aboveAreas = [];
  const belowAreas = [];
  for (const [domain, d] of Object.entries(perDomain)) {
    if (d.total < 2) continue;
    const acc = d.correct / d.total;
    if (acc >= overallAccuracy + 0.2) aboveAreas.push(domain);
    else if (acc <= overallAccuracy - 0.2) belowAreas.push(domain);
  }

  return {
    total,
    totalCorrect,
    overallAccuracy,
    estimatedLevel,
    confidence,
    perLevel,
    perDomain,
    aboveAreas,
    belowAreas,
  };
}
