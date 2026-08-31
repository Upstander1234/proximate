import { C, MONO } from "../theme.js";

// Every interactive procedure mini-game (IV/IO, laryngoscopy/ETT, cric, SGA)
// used to be a fully opaque black modal with zero patient information —
// while fiddling with angle/depth sliders, a player had no way to check
// whether the patient they're working on is even still stable, directly
// contradicting the "Procedure Gameplay" spec's own worked example ("While
// performing the IV, the player may... Monitor SpO2... Watch the ECG...
// Reassess the patient") and its explicit intubation guidance ("Failure...
// may result in Hypoxemia" — which the player needs to be able to SEE
// developing, not just be told about after the fact).
//
// The sim clock is deliberately still paused while a mini-game is open (see
// App.jsx's tick-loop pause guard) — a real, separate design decision to
// avoid punishing a player for being slow with a mouse, not something this
// component changes. So these numbers are a real, accurate SNAPSHOT of
// exactly where the patient stands the instant the attempt began (or right
// after a prior failed attempt's own real, escalating retry-cost time
// elapsed) — not a live tick — which is still the actual information a real
// provider would be working from mid-procedure, glancing at a monitor they
// can't stare at while their hands are busy.
//
// Chip is hoisted to module scope (not declared inside the component body) —
// a component defined during render is a real react-hooks/static-components
// lint catch, the same class of fix SettingsOverlay.jsx's own hoisted Row
// already established for this project.
function Chip({ label, value, alarm }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "4px 2px", borderRadius: 5,
      background: alarm ? "#2A1414" : "#10151A", border: `1px solid ${alarm ? C.red : C.line}` }}>
      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: ".08em", color: alarm ? C.red : C.faint }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: alarm ? C.red : C.text }}>{value}</div>
    </div>
  );
}

export default function MinigameVitalsStrip({ pat }) {
  if (!pat) return null;
  let v; try { v = pat.vitals(); } catch { v = null; }
  if (!v) return null;
  const spo2Low = v.spo2 < 90, hrAbnormal = v.hr < 50 || v.hr > 130;
  const cons = pat.consciousness || "awake";
  const consAlarming = cons === "unconscious" || cons === "coma";
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
      <Chip label="SPO2" value={`${v.spo2}%`} alarm={spo2Low} />
      <Chip label="HR" value={v.hr} alarm={hrAbnormal} />
      <Chip label="RR" value={v.rr} alarm={v.rr < 8 || v.rr > 30} />
      <Chip label="LOC" value={consAlarming ? "unresp." : cons} alarm={consAlarming} />
    </div>
  );
}
