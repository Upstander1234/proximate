// Centralized NREMT content-blueprint configuration, one per certification
// level (EMR/EMT/AEMT/Paramedic), used as the target content distribution
// for Adaptive Test Mode's item selection (adaptiveEngine.js).
//
// This is NOT the proprietary NREMT algorithm — it is Proximate's own
// adaptive-selection design, inspired by publicly available descriptions of
// NREMT's own certification-exam structure and general computerized-
// adaptive-testing (CAT) principles. See MethodsPage.jsx for the full,
// player-facing explanation.
//
// Every level stores THREE numbers per category — min, target, max — all
// expressed as fractions of the exam (0-1), not percentages, so callers
// never have to remember to divide by 100. `target` is always the midpoint
// of `min`/`max` for every level below; kept as its own field (rather than
// derived) so a future level could set a target that isn't the exact
// midpoint without changing every consumer's math.
//
// IMPORTANT ARCHITECTURAL DISTINCTION (do not blur this — see also
// adaptiveEngine.js's own header comment):
//   - a question's BLUEPRINT CATEGORY is a mutually-exclusive content-area
//     classification (one question, one category)
//   - CLINICAL JUDGMENT (AEMT/Paramedic only) is a CROSS-CUTTING boolean
//     attribute a question can carry IN ADDITION TO its category — never a
//     seventh category of its own. A Cardiology question can be a clinical-
//     judgment question or a factual-recall question; either way it still
//     counts toward the Cardiology content target.

import { DOMAINS_BY_LEVEL } from "./questions.js";

export const BLUEPRINT_LEVELS = ["EMR", "EMT", "AEMT", "Paramedic"];

function cat(key, label, min, target, max) {
  return { key, label, min, target, max };
}

// EMR — mirrors the EMT test plan's own five phase-based content domains
// (Scene Size-up and Safety / Primary Assessment / Secondary Assessment /
// Patient Treatment and Transport / Operations), the same content-area
// structure NREMT's Basic Level (EMR/EMT) practice-analysis-based test
// plans share, at EMR's own published percentage ranges.
const EMR_CATEGORIES = [
  cat("sceneSafety", "Scene Size-Up and Safety", 0.19, 0.21, 0.23),
  cat("primaryAssessment", "Primary Assessment", 0.37, 0.39, 0.41),
  cat("secondaryAssessment", "Secondary Assessment", 0.04, 0.06, 0.08),
  cat("treatmentTransport", "Patient Treatment and Transport", 0.2, 0.22, 0.24),
  cat("operations", "Operations", 0.1, 0.12, 0.14),
];

// EMT — verified 2026-09-10 directly against the National Registry's own
// published "National Registry Emergency Medical Technician Examination
// Specifications" (the EMT Certification Examination administered starting
// Spring 2025, content determined by the 2023 Basic Level Support Practice
// Analysis). The five content domains and percentage ranges below are
// quoted verbatim from that document's own "Content Distribution for the
// EMT Certification Examination" table — not carried forward from an
// older, unverified source. Domain categories such as Airway/Cardiology/
// Trauma/Medical+OBGYN are explicitly NOT part of this current EMT test
// plan (they were retired from the BLS exams as of the Spring 2025 update)
// — the five categories below are the only ones the real exam uses.
const EMT_CATEGORIES = [
  cat("sceneSafety", "Scene Size-Up and Safety", 0.15, 0.17, 0.19),
  cat("primaryAssessment", "Primary Assessment", 0.39, 0.41, 0.43),
  cat("secondaryAssessment", "Secondary Assessment", 0.05, 0.07, 0.09),
  cat("treatmentTransport", "Patient Treatment and Transport", 0.2, 0.22, 0.24),
  cat("operations", "Operations", 0.1, 0.12, 0.14),
];

// AEMT/Paramedic — the ALS-level test plans use body-system content
// domains instead of the BLS levels' phase-based ones, which is exactly
// the taxonomy Proximate's own existing question `domain` field already
// uses (Airway, Cardiology, Trauma, "Medical + OBGYN", "EMS Operations") —
// see SYSTEM_DOMAIN_TO_CATEGORY below for the direct mapping.
const AEMT_CATEGORIES = [
  cat("airway", "Airway, Respiration and Ventilation", 0.09, 0.11, 0.13),
  cat("cardiology", "Cardiology and Resuscitation", 0.11, 0.13, 0.15),
  cat("trauma", "Trauma", 0.07, 0.09, 0.11),
  cat("medicalObgyn", "Medical / OB-GYN", 0.25, 0.27, 0.29),
  cat("operations", "EMS Operations", 0.06, 0.08, 0.1),
];

const PARAMEDIC_CATEGORIES = [
  cat("airway", "Airway, Respiration and Ventilation", 0.08, 0.1, 0.12),
  cat("cardiology", "Cardiology and Resuscitation", 0.1, 0.12, 0.14),
  cat("trauma", "Trauma", 0.06, 0.08, 0.1),
  cat("medicalObgyn", "Medical / OB-GYN", 0.24, 0.26, 0.28),
  cat("operations", "EMS Operations", 0.08, 0.1, 0.12),
];

// Clinical Judgment: AEMT/Paramedic only, per NREMT's own ALS test plans.
// Deliberately NOT one of the arrays above — see this file's own header
// comment. `null` for EMR/EMT means "this level's blueprint has no
// clinical-judgment dimension at all," and every consumer in this file and
// in adaptiveEngine.js checks for that explicitly rather than assuming a
// clinicalJudgment object always exists.
const AEMT_CLINICAL_JUDGMENT = cat("clinicalJudgment", "Clinical Judgment", 0.31, 0.33, 0.35);
const PARAMEDIC_CLINICAL_JUDGMENT = cat("clinicalJudgment", "Clinical Judgment", 0.34, 0.36, 0.38);

// `domainStyle` records which heuristic (see blueprintCategoryOf below)
// should map this level's existing `question.domain` field onto a
// blueprint category: "phase" (EMR/EMT — body-system domain doesn't match
// the blueprint's own phase-of-care categories, so it's an approximation)
// or "system" (AEMT/Paramedic — domain and blueprint category are the same
// body-system taxonomy, so the mapping is closer to exact).
export const BLUEPRINTS_BY_LEVEL = {
  EMR: { level: "EMR", categories: EMR_CATEGORIES, clinicalJudgment: null, domainStyle: "phase" },
  EMT: { level: "EMT", categories: EMT_CATEGORIES, clinicalJudgment: null, domainStyle: "phase" },
  AEMT: { level: "AEMT", categories: AEMT_CATEGORIES, clinicalJudgment: AEMT_CLINICAL_JUDGMENT, domainStyle: "system" },
  Paramedic: {
    level: "Paramedic",
    categories: PARAMEDIC_CATEGORIES,
    clinicalJudgment: PARAMEDIC_CLINICAL_JUDGMENT,
    domainStyle: "system",
  },
};

export function blueprintForLevel(level) {
  return BLUEPRINTS_BY_LEVEL[level] || BLUEPRINTS_BY_LEVEL.EMT;
}

// EMR/EMT: existing question content is tagged with a body-system "domain"
// (Airway, Cardiology, Trauma, Medical + OBGYN, EMS Operations), not an
// NREMT blueprint phase category. Rather than inventing a second, competing
// taxonomy, a blueprint category is derived from the existing domain via
// this heuristic map, with an optional per-question `blueprintCategory`
// override for cases the heuristic gets wrong. This is an approximation,
// stated honestly on the Methods page — the real NREMT blueprint
// categorizes by assessment phase, not body system, and a question can
// genuinely belong to either depending on exactly what it's testing.
const PHASE_DOMAIN_DEFAULT_CATEGORY = {
  "EMS Operations": "operations",
  Airway: "primaryAssessment",
  Cardiology: "treatmentTransport",
  Trauma: "treatmentTransport",
  "Medical + OBGYN": "primaryAssessment",
  Medical: "primaryAssessment",
};

// AEMT/Paramedic: the existing domain taxonomy IS the blueprint taxonomy —
// a direct, non-heuristic map.
const SYSTEM_DOMAIN_TO_CATEGORY = {
  Airway: "airway",
  Cardiology: "cardiology",
  Trauma: "trauma",
  "Medical + OBGYN": "medicalObgyn",
  Medical: "medicalObgyn",
  "EMS Operations": "operations",
};

export function blueprintCategoryOf(question, level) {
  if (question.blueprintCategory) return question.blueprintCategory;
  const bp = blueprintForLevel(level || question.level || "EMT");
  const map = bp.domainStyle === "system" ? SYSTEM_DOMAIN_TO_CATEGORY : PHASE_DOMAIN_DEFAULT_CATEGORY;
  return map[question.domain] || bp.categories[0].key;
}

// Clinical Judgment classification — reads the question's own explicit
// `clinicalJudgment` metadata (see questions.js's template comment for the
// authoring guidance on when a question genuinely qualifies: interpreting
// a presentation, prioritizing findings, choosing the next action,
// recognizing deterioration, integrating multiple findings, distinguishing
// competing diagnoses/actions, or making a transport/disposition call —
// NOT simple factual recall). Returns:
//   true  — this question genuinely tests clinical judgment
//   false — this question has been explicitly reviewed and does NOT
//   null  — UNCLASSIFIED. Never invented/guessed; every consumer of this
//           value must treat null as "no data," not as false. This is the
//           deliberate backward-compatibility behavior for the entire
//           existing question bank, which predates this field.
export function clinicalJudgmentOf(question) {
  return typeof question.clinicalJudgment === "boolean" ? question.clinicalJudgment : null;
}

export function blueprintMidpointPct(key, level = "EMT") {
  const bp = blueprintForLevel(level);
  const c = bp.categories.find((c) => c.key === key) || (bp.clinicalJudgment?.key === key ? bp.clinicalJudgment : null);
  return c ? c.target * 100 : 100 / bp.categories.length;
}

// ---------------------------------------------------------------------
// Validation (queue: "malformed questions should never silently corrupt
// blueprint calculations"). A question failing this is excluded from
// adaptive selection by filterValidForBlueprint below — it can still be
// used elsewhere (MCQ Practice, etc.), this only gates the blueprint-aware
// adaptive exam.
// ---------------------------------------------------------------------
export function validateBlueprintQuestion(question) {
  const errors = [];
  if (!question || typeof question !== "object") {
    return { valid: false, errors: ["question is not an object"] };
  }
  const level = question.level;
  if (!BLUEPRINT_LEVELS.includes(level)) {
    errors.push(`unsupported/missing level: ${JSON.stringify(level)}`);
  } else {
    const validDomains = DOMAINS_BY_LEVEL[level] || [];
    if (!validDomains.includes(question.domain)) {
      errors.push(`domain ${JSON.stringify(question.domain)} is not valid for level "${level}"`);
    }
    if (question.blueprintCategory) {
      const validKeys = blueprintForLevel(level).categories.map((c) => c.key);
      if (!validKeys.includes(question.blueprintCategory)) {
        errors.push(`blueprintCategory ${JSON.stringify(question.blueprintCategory)} is not valid for level "${level}"`);
      }
    }
  }
  if (question.clinicalJudgment !== undefined && typeof question.clinicalJudgment !== "boolean") {
    errors.push(`clinicalJudgment must be a boolean or omitted, got ${typeof question.clinicalJudgment}`);
  }
  return { valid: errors.length === 0, errors };
}

// Filters a question pool down to only what the blueprint-aware adaptive
// engine can safely reason about, logging a dev-visible warning (never a
// thrown error — a malformed question must degrade the exam gracefully,
// not crash it) for anything excluded.
export function filterValidForBlueprint(pool, { warn = true } = {}) {
  const valid = [];
  for (const q of pool) {
    const result = validateBlueprintQuestion(q);
    if (result.valid) {
      valid.push(q);
    } else if (warn && typeof console !== "undefined") {
      console.warn(`[contentBlueprint] excluding question ${JSON.stringify(q?.id)} from adaptive selection: ${result.errors.join("; ")}`);
    }
  }
  return valid;
}

// ---------------------------------------------------------------------
// Readiness-report aggregation. Computed purely from THIS exam's own
// administered-item records (never SRS/practice history — see this
// project's own standing rule that exam blueprint percentages come from
// the current exam, not longitudinal practice data). `administered` is
// the same per-item record array AdaptiveTestTab.jsx already builds, each
// expected to carry `category` and `clinicalJudgment` (blueprintCategoryOf
// / clinicalJudgmentOf's own return value, captured at answer time) and
// `correct`.
// ---------------------------------------------------------------------

// A domain must have at least this many administered questions before its
// accuracy is treated as meaningful enough to call "weak" or "strong" —
// exposure and performance are different concepts, and a category that
// simply got fewer questions must never be reported as a weakness on that
// basis alone. Matches the sample-size floor userStats.js already uses
// elsewhere in this project for the identical reason.
export const MIN_SAMPLE_FOR_ASSESSMENT = 3;

export function summarizeCategoryPerformance(administered, level) {
  const bp = blueprintForLevel(level);
  const byKey = new Map(bp.categories.map((c) => [c.key, { key: c.key, label: c.label, correct: 0, total: 0 }]));
  for (const rec of administered) {
    const row = byKey.get(rec.category);
    if (!row) continue;
    row.total += 1;
    if (rec.correct) row.correct += 1;
  }
  return Array.from(byKey.values()).map((r) => ({
    ...r,
    pct: r.total > 0 ? Math.round((r.correct / r.total) * 100) : null,
    sufficientData: r.total >= MIN_SAMPLE_FOR_ASSESSMENT,
  }));
}

// Returns null for a level with no clinical-judgment dimension (EMR/EMT) —
// callers must check for that, not assume a report object always exists.
export function summarizeClinicalJudgment(administered, level) {
  const bp = blueprintForLevel(level);
  if (!bp.clinicalJudgment) return null;

  const overall = { presented: 0, correct: 0 };
  const byCategory = new Map(
    bp.categories.map((c) => [
      c.key,
      { key: c.key, label: c.label, cj: { presented: 0, correct: 0 }, factual: { presented: 0, correct: 0 } },
    ])
  );

  for (const rec of administered) {
    const cj = rec.clinicalJudgment;
    if (cj === true) {
      overall.presented += 1;
      if (rec.correct) overall.correct += 1;
    }
    const row = byCategory.get(rec.category);
    if (!row) continue;
    const bucket = cj === true ? row.cj : cj === false ? row.factual : null;
    if (!bucket) continue; // unclassified (cj === null) — not counted in either bucket, never guessed
    bucket.presented += 1;
    if (rec.correct) bucket.correct += 1;
  }

  const pctOf = (b) => (b.presented > 0 ? Math.round((b.correct / b.presented) * 100) : null);

  return {
    target: bp.clinicalJudgment,
    presented: overall.presented,
    correct: overall.correct,
    incorrect: overall.presented - overall.correct,
    accuracy: pctOf(overall),
    sufficientData: overall.presented >= MIN_SAMPLE_FOR_ASSESSMENT,
    byCategory: Array.from(byCategory.values()).map((v) => ({
      key: v.key,
      label: v.label,
      clinicalJudgment: { ...v.cj, pct: pctOf(v.cj), sufficientData: v.cj.presented >= MIN_SAMPLE_FOR_ASSESSMENT },
      factual: { ...v.factual, pct: pctOf(v.factual), sufficientData: v.factual.presented >= MIN_SAMPLE_FOR_ASSESSMENT },
    })),
  };
}

// ---------------------------------------------------------------------
// Back-compat: MethodsPage.jsx (and any other pre-existing caller) still
// imports the old, EMT-only, 0-100-scale {minPct,maxPct} shape. Derived
// from EMT_CATEGORIES rather than duplicated, so it can never drift out of
// sync with the verified EMT blueprint above.
// ---------------------------------------------------------------------
export const BLUEPRINT_CATEGORIES = EMT_CATEGORIES.map((c) => ({
  key: c.key,
  label: c.label,
  minPct: Math.round(c.min * 100),
  maxPct: Math.round(c.max * 100),
}));
