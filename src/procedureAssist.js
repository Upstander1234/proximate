// Player-facing accessibility setting for the interactive procedure
// mini-games (IV/IO, laryngoscopy/ETT, cric, SGA) — "Procedure Gameplay"
// spec 2.9's "Assisted / Standard / Advanced" difficulty tiers.
//
// Deliberately kept OUT of access.js: that module's own standing constraint
// is that mini-game difficulty must derive ENTIRELY from real physiology
// fields, with zero other input, so a difficulty/target-band calculation
// there is never allowed to read anything but `pat`. This is not a
// physiology signal at all — it's a player-CHOSEN assistance level, applied
// ON TOP of the physiology-derived difficulty the same way a colorblind
// palette or font size would be. accessDifficulty()'s own output (and
// therefore what a given patient's real difficulty band reads as) is
// completely unaffected by this setting; only how FORGIVING the on-screen
// target margin is gets scaled.
export const ASSIST_LEVELS = ["assisted", "standard", "advanced"];
export const ASSIST_LABELS = { assisted: "Assisted", standard: "Standard", advanced: "Advanced" };

// Multiplies every tolerance/target-band width a mini-game computes before
// checking the player's own angle/depth/position against it. >1 widens the
// forgiving zone (assisted); <1 narrows it (advanced); 1 changes nothing
// (standard — the default, and the only tier that shipped before this
// setting existed, so an existing save picks it up with zero behavior
// change). Deliberately does not move the TARGET itself (the real anatomic
// position doesn't shift for an accessibility setting) — only the margin
// of error around it.
export function assistToleranceMult(level) {
  if (level === "assisted") return 1.6;
  if (level === "advanced") return 0.65;
  return 1;
}
