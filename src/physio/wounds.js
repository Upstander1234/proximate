// wounds.js — the wound/injury library. A condition (see conditions.js) can
// attach a wound to a limb or the torso via:
//   wounds: { legL: {type:"laceration", severity:"major"}, ... }
//
// Each type+severity carries:
//   desc  — what the exam reveals once the area is exposed
//   bleed — added to the patient's background bleed rate at construction
//   pain  — added to baseline pain at construction
//
// Color is NOT authored per wound — it's derived from whether the wound is
// actively bleeding. That's the "yellow scrape, red bleeding puncture" rule:
// anything with bleed > 0 reads red on the body map once exposed; anything
// else (closed injuries, dry burns, bruising) reads yellow.
export const WOUND_TYPES = {
  deformity: {label: "Deformity", severities: {
    closed: {bleed: 0, pain: 3, desc: "Angulated, skin intact — a closed deformity, no external wound."},
    open: {bleed: 0.12, pain: 5, desc: "Bone or wound bed visible through broken skin — an open deformity, actively bleeding."},
  }},
  contusion: {label: "Contusion", severities: {
    mild: {bleed: 0, pain: 1, desc: "Bruising, skin intact."},
    severe: {bleed: 0, pain: 3, desc: "Deep bruising with significant underlying swelling."},
  }},
  abrasion: {label: "Abrasion", severities: {
    mild: {bleed: 0, pain: 1, desc: "Superficial scrape, minimal ooze."},
    severe: {bleed: 0.01, pain: 2, desc: "Wide road-rash, slow diffuse ooze."},
  }},
  puncture: {label: "Puncture/penetration", severities: {
    minor: {bleed: 0.08, pain: 3, desc: "Small penetrating wound, actively bleeding."},
    severe: {bleed: 0.25, pain: 5, desc: "Deep penetrating wound, brisk bleeding."},
  }},
  burn: {label: "Burn", severities: {
    superficial: {bleed: 0, pain: 2, desc: "Superficial — red, dry, painful (1st-degree)."},
    partial: {bleed: 0, pain: 4, desc: "Partial-thickness — blistered, weeping (2nd-degree)."},
    full: {bleed: 0, pain: 1, desc: "Full-thickness — leathery, insensate despite the severity (3rd-degree)."},
  }},
  tenderness: {label: "Tenderness", severities: {
    mild: {bleed: 0, pain: 1, desc: "Tender to palpation, nothing visible."},
  }},
  laceration: {label: "Laceration", severities: {
    minor: {bleed: 0.02, pain: 2, desc: "Shallow cut, clean edges, minor ooze."},
    major: {bleed: 0.15, pain: 4, desc: "Deep laceration, steady active bleeding."},
  }},
  swelling: {label: "Swelling", severities: {
    mild: {bleed: 0, pain: 1, desc: "Mild soft-tissue swelling."},
    severe: {bleed: 0, pain: 2, desc: "Marked swelling, skin taut and shiny."},
  }},
};

export const woundDef = (w) => (w && WOUND_TYPES[w.type]?.severities[w.severity]) || null;
export const woundColor = (w) => { const d = woundDef(w); return d ? (d.bleed > 0 ? "red" : "yellow") : null; };
