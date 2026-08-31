// clothing.js — what a patient is wearing, and how it gates procedures
// until the relevant area is exposed.
//
// A scenario sets `clothing` to one of:
//   { top: "short"|"long", bottom: "pants"|"shorts", shoes: true|false }
//   { dress: true, shoes: true|false }
//
// Short sleeves / shorts start already exposed — nothing to do there. A
// dress is treated as sleeveless (arms already exposed, nothing to remove)
// and doesn't cover the torso enough to block auscultation, but it does
// cover the legs down past the knee, same as long pants.
//
// Three ways to expose a locked area (durations set by the caller, not
// here): remove the garment entirely, roll/lift it out of the way, or cut
// it open with trauma shears. All three reach the same end state.

// Which action ids are blocked, per region, until that region is exposed.
export const CLOTH_LOCK = {
  armR: ["iv", "io", "artLine"], armL: ["iv", "io", "artLine"],
  legR: ["iv", "io", "reboa"], legL: ["iv", "io", "reboa"],
  // attach_leads was a real, previously-uncaught gap: a player (or a
  // crew member ordered to do it) could stick ECG leads on a fully-clothed
  // chest, same as heart/lungs auscultation and ecgAcquire already can't.
  torso: ["heart", "lungs", "ecgAcquire", "attach_leads"],
};

export const REGION_LABEL = {armR: "right arm", armL: "left arm", legR: "right leg", legL: "left leg", torso: "chest"};

// Which regions need an exposure action for a given outfit, and what to
// call the garment there (drives the action labels: "sleeve", "pant leg",
// "dress", "shirt").
export function lockedRegions(clothing) {
  const out = {};
  if (!clothing) return out;
  if (clothing.dress) {
    out.legR = "dress"; out.legL = "dress";
    // torso is accessible at the neckline; arms are bare — nothing locked there.
  } else {
    out.torso = "shirt";
    if (clothing.top === "long") { out.armR = "sleeve"; out.armL = "sleeve"; }
    if (clothing.bottom === "pants") { out.legR = "pant leg"; out.legL = "pant leg"; }
  }
  return out;
}

export function initialExposure(clothing) {
  const locked = lockedRegions(clothing);
  const exposed = {};
  ["armR", "armL", "legR", "legL", "torso"].forEach(r => { exposed[r] = locked[r] ? 0 : 1; });
  return exposed;
}

// Shoes are independent of pants/dress — they only block the pedal pulse
// check, and only need a single "take it off" step (no roll-up/shears).
export function initialShoes(clothing) {
  const on = !!(clothing && clothing.shoes);
  return {legR: on ? 0 : 1, legL: on ? 0 : 1}; // 1 = not an issue (off, or never worn)
}
