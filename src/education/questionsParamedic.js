// Paramedic-level questions, split out of questions.js. See questions.js's own
// header comment for the shared question-object shape and rules for adding one.
// This file holds only level: "Paramedic" entries.

import { BATCH as MEDIC_AIRWAY_BATCH } from "./_genbatch/medic_airway.js";
import { BATCH as MEDIC_OPS_BATCH } from "./_genbatch/medic_ops.js";

export const PARAMEDIC_QUESTIONS = [
  ...MEDIC_AIRWAY_BATCH,
  ...MEDIC_OPS_BATCH,
];
