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
// anticholinergics), catecholLevel (sympathetic surge), icp/strokeSide (rising
// intracranial pressure blows the ipsilateral pupil), cerebral perfusion and
// pulse (arrest gives fixed, dilated pupils), consciousness, age.
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export function pupilState(pat, v) {
  const age = pat?.ageProfile?.age ?? pat?.age ?? 35;
  let mm = age >= 65 ? 3.0 : 3.5;

  mm -= clamp(pat?.opioidMiosis ?? 0, 0, 1) * 2.0;
  mm -= clamp((pat?.cholinergicVagalTone ?? 0) / 0.85, 0, 1) * 2.0;
  mm += clamp(pat?.vagalBlock ?? 0, 0, 1) * 3.0;
  mm += clamp(((pat?.catecholLevel ?? 1) - 1) / 2, 0, 1) * 1.5;
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
