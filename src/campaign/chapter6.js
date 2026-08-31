// campaign/chapter6.js — Chapter 6: AEMT School ("Going Advanced"), design
// doc §1.6.7 (+§1.6.8.1's "optional, not mandatory" revision). Pure
// content-and-mechanics helpers only — no scene/dialogue text lives here.
// Moved verbatim from the old src/campaignChapter6.js as part of the
// campaign/ folder split; only the import path changed (../campaign.js ->
// ./core.js).
//
// The exam itself reuses core.js's SHARED, tier-agnostic exam-roll
// placeholders (rollExamFieldScore/rollWrittenQuiz/EXAM_WRITTEN_QUESTIONS/
// EXAM_FIELD_SCENARIOS, all already keyed by "aemt").
//
// Reached from campaignCh5End (App.jsx) once Chapter 5 has secured at least
// one job. §1.6.8.1 makes this chapter SKIPPABLE.
import { scholarshipEligible, scholarshipCoverage, TUITION } from "./core.js";

export function aemtTenureCalls(employerId, g) {
  if (employerId === "ift") return g.iftCalls || 0;
  if (employerId === "county911") return g.calls911 || 0;
  if (employerId === "event") return g.eventCalls || 0;
  return 0;
}

export function aemtTuitionQuote(g) {
  const employerId = (g.jobs || [])[0] || null;
  const tenureCalls = aemtTenureCalls(employerId, g);
  const eligible = scholarshipEligible(employerId, tenureCalls, g.reputation);
  const coveragePct = eligible ? scholarshipCoverage(g.reputation) : 0;
  const full = TUITION.aemt;
  const effective = eligible ? Math.round(full * (1 - coveragePct / 100)) : full;
  return { full, effective, eligible, coveragePct: Math.round(coveragePct), employerId };
}

export const AEMT_SERVICE_COMMITMENT_MONTHS = 12;
export const AEMT_SCHEDULE_CONFLICT_ROUNDS = 3;
export const AEMT_REPUTATION_FLOOR = 10;
