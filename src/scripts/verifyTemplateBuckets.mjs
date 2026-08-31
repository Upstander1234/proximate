// Direct-function verification for the Tier-2 template-bucket expansion
// (F0 item 17 depth follow-up). Proves each newly-added emotional-state
// bucket produces real, distinct template text for the same event, not
// just a distinguishable internal enum value that collapses at render
// time — the exact gap the prior session's own "10 states -> 3 buckets"
// note flagged.
import { TemplateProvider } from "../dialogue/dialogueProvider.js";

let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) { pass++; }
  else { fail++; console.error(`FAIL: ${label}`); }
}

const tp = new TemplateProvider();

function textsFor(eventType, state, n = 40) {
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    const line = tp.generate({ type: eventType }, { patient: { emotionalState: state, personality: {} } });
    if (line) seen.add(line.text);
  }
  return seen;
}

const cases = [
  ["pain_unprompted", "calm", "in pain"],
  ["pain_unprompted", "calm", "exhausted"],
  ["anxious_unprompted", "anxious", "frightened"],
  ["deterioration_unprompted", "calm", "frightened"],
  ["deterioration_unprompted", "calm", "agitated"],
  ["deterioration_unprompted", "calm", "confused"],
  ["procedure_discomfort", "calm", "in pain"],
  ["treatment_improving", "calm", "reassured"],
  ["treatment_improving", "calm", "exhausted"],
  ["airway_stimulation_reaction", "calm", "confused"],
  ["procedure_success_relief", "anxious", "reassured"],
];

for (const [eventType, baseState, newState] of cases) {
  const baseTexts = textsFor(eventType, baseState);
  const newTexts = textsFor(eventType, newState);
  const overlap = [...newTexts].some((t) => baseTexts.has(t));
  check(`${eventType}: "${newState}" text differs from "${baseState}" text`, newTexts.size > 0 && !overlap);
}

// The 10-states-collapse-to-3-buckets fallback must still hold for a pool
// that was NOT enriched this batch (e.g. no direct "angry" key exists
// anywhere) — bucketForEmotionalState should still route it to "irritable".
{
  const line = tp.generate({ type: "pain_unprompted" }, { patient: { emotionalState: "angry", personality: {} } });
  const irritableTexts = new Set(["Yeah, it still hurts. I told you that.", "How many times do I have to say it hurts?"]);
  check("unenriched state ('angry' on pain_unprompted) still falls back to the irritable bucket", irritableTexts.has(line.text));
}

// embarrassed: only reachable via an explicit event.bucket override, per
// the exposure_reaction pool wired from App.jsx's torso-exposure actions.
{
  const line = tp.generate({ type: "exposure_reaction", bucket: "embarrassed" }, { patient: { personality: {} } });
  check("exposure_reaction/embarrassed override produces real text", !!line && line.text.length > 0);
  const noOverride = tp.generate({ type: "pain_unprompted" }, { patient: { emotionalState: "embarrassed", personality: {} } });
  // embarrassed still collapses to "calm" for pools that don't define it directly.
  const calmTexts = new Set(["It hurts, but I'm okay.", "Still hurts some right there."]);
  check("embarrassed still collapses to calm on an unenriched pool", calmTexts.has(noOverride.text));
}

// No em dashes in any newly-authored line (project-wide rule, section 4).
{
  const allNew = [
    ...textsFor("pain_unprompted", "in pain"), ...textsFor("pain_unprompted", "exhausted"),
    ...textsFor("anxious_unprompted", "frightened"),
    ...textsFor("deterioration_unprompted", "frightened"), ...textsFor("deterioration_unprompted", "agitated"),
    ...textsFor("deterioration_unprompted", "confused"),
    ...textsFor("procedure_discomfort", "in pain"),
    ...textsFor("treatment_improving", "reassured"), ...textsFor("treatment_improving", "exhausted"),
    ...textsFor("airway_stimulation_reaction", "confused"),
    ...textsFor("procedure_success_relief", "reassured"),
  ];
  const withEmDash = allNew.filter((t) => t.includes("—"));
  check(`no em dashes in newly-authored template text (found ${withEmDash.length})`, withEmDash.length === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
