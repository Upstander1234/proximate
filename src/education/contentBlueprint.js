// The NREMT EMT cognitive-exam content blueprint (publicly described category
// weights for the EMT-B computerized adaptive exam), used as the target
// content distribution for Adaptive Test Mode's item selection.
//
// This is NOT the proprietary NREMT algorithm — it is Proximate's own
// adaptive-selection design, inspired by publicly available descriptions of
// NREMT's EMT cognitive exam structure and general computerized-adaptive-
// testing (CAT) principles. See MethodsPage.jsx for the full, player-facing
// explanation.

export const BLUEPRINT_CATEGORIES = [
  { key: "sceneSafety", label: "Scene Size-Up and Safety", minPct: 15, maxPct: 19 },
  { key: "primaryAssessment", label: "Primary Assessment", minPct: 39, maxPct: 43 },
  { key: "secondaryAssessment", label: "Secondary Assessment", minPct: 5, maxPct: 9 },
  { key: "treatmentTransport", label: "Patient Treatment and Transport", minPct: 20, maxPct: 24 },
  { key: "operations", label: "Operations", minPct: 10, maxPct: 14 },
];

export function blueprintMidpointPct(key) {
  const c = BLUEPRINT_CATEGORIES.find((c) => c.key === key);
  return c ? (c.minPct + c.maxPct) / 2 : 100 / BLUEPRINT_CATEGORIES.length;
}

// Existing question content isn't individually tagged with an NREMT
// blueprint category — it's tagged with a body-system "domain" instead
// (Airway, Cardiology, Trauma, Medical + OBGYN, EMS Operations). Rather than
// inventing a second, competing taxonomy, we derive a blueprint category
// from the existing domain via this heuristic map, with an optional
// per-question `blueprintCategory` override for cases the heuristic gets
// wrong. This is an approximation, stated honestly on the Methods page —
// the real NREMT blueprint categorizes by cognitive/assessment phase, not
// body system, and a question can genuinely belong to either depending on
// exactly what it's testing.
const DOMAIN_DEFAULT_CATEGORY = {
  "EMS Operations": "operations",
  Airway: "primaryAssessment",
  Cardiology: "treatmentTransport",
  Trauma: "treatmentTransport",
  "Medical + OBGYN": "primaryAssessment",
  Medical: "primaryAssessment",
};

export function blueprintCategoryOf(question) {
  if (question.blueprintCategory) return question.blueprintCategory;
  return DOMAIN_DEFAULT_CATEGORY[question.domain] || "primaryAssessment";
}
