// src/testerGate.js — the tester-only access gate shared between App.jsx
// (which enforces it — the gmodePick buttons, the testerGate phase, and the
// 3D-scene render conditions) and SettingsOverlay.jsx (which needs to know
// whether to show or lock the "DRIVING MODE" toggle). Split into its own
// tiny module rather than exported from App.jsx to avoid a circular import
// (App.jsx -> SettingsOverlay -> testerGate, not App.jsx -> SettingsOverlay
// -> App.jsx) — the same reason data/categories.js exists for
// DRUG_CATEGORIES/PROC_CATEGORIES.
//
// Career Mode, Co-op, and the real-time 3D scenes (DrivingScene/Coop3DWalk,
// including the 3D station room) are tester-only while under development;
// Medical Simulation (Sandbox) mode's plain 2D flow stays fully public and
// is never touched by this gate. One localStorage flag (browser-wide, not
// per-save — a tester who unlocks it once shouldn't have to re-enter the
// password for every save), one password check. Deliberately isolated so
// the whole gate can be removed cleanly later without touching any of the
// underlying Career/Co-op/3D-scene code it currently blocks.
export const TESTER_KEY = "proximate_tester_unlocked";
export const TESTER_PASSWORD = "proximate";
export const isTesterUnlocked = () => {
  try { return localStorage.getItem(TESTER_KEY) === "1"; } catch { return false; }
};
