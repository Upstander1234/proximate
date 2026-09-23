// Pupil state, DERIVED every read from the physiology engine's own live fields.
// Nothing here is scripted per scenario and nothing is stored: change the
// patient's physiology (give naloxone, atropine, rising ICP, arrest) and the
// pupils change with it. Shared by the "Pupils" exam action (actions.js) and
// the PupilMinigame, so the drawing and the narrated finding cannot disagree.
//
// HONEST LIMITATION: there is still no stored pupil-diameter state with its own
// dynamics (light-reflex latency, hippus, per-eye lesion side beyond
// strokeSide, sympathomimetic/serotonergic/alcohol/hypoglycemia effects). This
// is a read-out over the fields that DO exist; the dedicated mechanism is on
// CLAUDE.md's physiology queue.
//
// Sources: opioidMiosis (pk.js, opioid effect net of naloxone), cholinergic
// VagalTone (organophosphate/nerve agent), vagalBlock (atropine and other
// anticholinergics), catecholLevel (sympathetic surge), agitationBurden
// (sympathomimetic/serotonergic toxidromes — cocaine, excited delirium,
// serotonin syndrome, all of which already write this shared field for the
// VO2 mechanism, queue item 35 — real peripheral alpha-adrenergic iris
// dilator stimulation for cocaine/amphetamines, Wilkerson et al., J Emerg
// Med 2012's own description of sympathomimetic mydriasis as a classic
// exam finding distinct from opioid/cholinergic miosis; serotonin syndrome's
// own mydriasis is a well-documented Hunter Criteria-adjacent sign, Boyer &
// Shannon, NEJM 2005), coreTemp (severe accidental hypothermia below ~28C
// can present with fixed, dilated, minimally-reactive pupils indistinguishable
// from death on exam alone — Danzl & Pozos, NEJM 2012's own "no one is dead
// until warm and dead" teaching point, the real reason field pronouncement is
// withheld for a hypothermic arrest), icp/strokeSide (rising intracranial
// pressure blows the ipsilateral pupil), cerebral perfusion and pulse (arrest
// gives fixed, dilated pupils), consciousness, age.
//
// Deliberately NOT modeled here, and not a decorative omission: benzodiazepine
// and barbiturate sedation do NOT meaningfully change pupil size in humans
// (unlike opioids' pontine-nucleus-mediated miosis) — reading
// pat.respDriveSuppression or pat.sedationDepth as a miosis proxy would be a
// real clinical error, not a simplification, so those two sedative classes
// correctly leave pupil size untouched. Alcohol likewise has no consistent,
// clinically teachable pupil-diameter signature (its exam finding is
// nystagmus, a distinct mechanism this engine does not model) and hypoglycemia's
// real autonomic response is already captured through the SAME catecholLevel/
// sympathetic pathway every other adrenergic-surge state uses, not a second,
// separate glucose-specific term.
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export function pupilState(pat, v) {
  const age = pat?.ageProfile?.age ?? pat?.age ?? 35;
  let mm = age >= 65 ? 3.0 : 3.5;

  mm -= clamp(pat?.opioidMiosis ?? 0, 0, 1) * 2.0;
  mm -= clamp((pat?.cholinergicVagalTone ?? 0) / 0.85, 0, 1) * 2.0;
  mm += clamp(pat?.vagalBlock ?? 0, 0, 1) * 3.0;
  mm += clamp(((pat?.catecholLevel ?? 1) - 1) / 2, 0, 1) * 1.5;
  // Sympathomimetic/serotonergic mydriasis (cocaine, excited delirium,
  // serotonin syndrome): a real, DIRECT peripheral effect distinct from the
  // central catecholLevel pathway above, since e.g. cocaine's own condition
  // (conditions.js) drives hrBase/baseSVR directly without necessarily
  // moving neuralSymp/catecholLevel through the baroreflex loop — reusing
  // agitationBurden (already a real, wired field, not invented for this)
  // gives these toxidromes a real mydriasis signal they would otherwise lack.
  mm += clamp(pat?.agitationBurden ?? 0, 0, 1) * 1.5;
  mm = clamp(mm, 1.5, 8);

  let react = 1;
  const cons = pat?.consciousness || "awake";
  if (cons === "coma") react = 0.3;
  else if (cons !== "awake") react = 0.6;
  if ((pat?.sao2 ?? 98) < 80) react *= 0.5;

  const L = { mm, react }, R = { mm, react };

  // Rising ICP blows the ipsilateral pupil: larger and sluggish, then fixed.
  const icp = pat?.icp ?? 10;
  if (icp > 20) {
    const t = clamp((icp - 20) / 20, 0, 1);
    const side = pat?.strokeSide === "right" ? R : L;
    side.mm = clamp(side.mm + t * 4, 1.5, 8);
    side.react = Math.min(side.react, clamp(0.4 - t * 0.3, 0.05, 0.4));
  }

  // Severe accidental hypothermia mimics death on pupil exam alone (Danzl &
  // Pozos, NEJM 2012) — real and gradual below the ~28C threshold where
  // cold-induced conduction failure and CNS depression are severe enough to
  // abolish the light reflex, ramping to fully fixed/dilated by 24C (below
  // which this engine's own arrest-detection logic elsewhere already takes
  // over). This is checked BEFORE the arrest branch below so a hypothermic
  // patient who is not yet in cardiac arrest still shows a real, graded
  // sluggish-to-fixed exam, not just full pupillary reactivity until a
  // pulse is literally lost.
  const coreTemp = pat?.coreTemp ?? 37;
  if (coreTemp < 28) {
    const ht = clamp((28 - coreTemp) / 4, 0, 1);
    L.mm = R.mm = clamp(Math.max(L.mm, R.mm) + ht * 3, 1.5, 8);
    L.react = R.react = Math.min(L.react, clamp(0.3 - ht * 0.3, 0, 0.3));
  }

  // No pulse or collapsed cerebral perfusion: both fixed and dilated.
  const arrested = (v && v.hr <= 0) || (pat?.cpp != null && pat.cpp < 15);
  if (arrested) { L.mm = R.mm = 7.5; L.react = R.react = 0; }

  const avg = (L.mm + R.mm) / 2;
  let key = "perrl";
  if (arrested) key = "fixed";
  else if (Math.abs(L.mm - R.mm) >= 1.5) key = "blown";
  else if (avg <= 2.2) key = "pinpoint";
  else if (avg >= 6) key = "dilated";
  else if (Math.max(L.react, R.react) < 0.6) key = "sluggish";

  const label = {
    perrl: "Equal, round and reactive", sluggish: "Equal, sluggish", blown: "Unequal, one blown and sluggish",
    pinpoint: "Pinpoint", dilated: "Dilated", fixed: "Fixed and dilated",
  }[key];
  return { key, label, L, R };
}
