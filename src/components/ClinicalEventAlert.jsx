import { useEffect } from "react";
import { C, MONO } from "../theme.js";

// A visible, emergent clinical event just happened — the patient vomited,
// started seizing, or went unresponsive — and the player should not have to
// be staring at the scrolling log to catch it. Fed by g.eventAlertQueue
// (App.jsx's tick loop, both the scenario-scripted `events` mechanism and
// the general physiology edge-detection block), the same one-shot-queue
// shape g.toastQueue/AchievementToast.jsx already established. Mounted
// globally from Shell.jsx so it renders regardless of phase.
//
// Deliberately a longer, more insistent duration than the achievement
// toast (4.2s) — this is a clinical finding the player needs to actually
// register, not a decorative unlock — but still non-blocking: it does not
// stop the player from clicking through the scene underneath it.
const ALERT_MS = 6500;

export default function ClinicalEventAlert({ g, setG }) {
  const current = g?.eventAlertQueue?.[0];
  useEffect(() => {
    if (!current) return;
    const id = setTimeout(() => {
      setG((s) => ({ ...s, eventAlertQueue: (s.eventAlertQueue || []).slice(1) }));
    }, ALERT_MS);
    return () => clearTimeout(id);
  }, [current, setG]);

  if (!current) return null;
  const dismiss = () => setG((s) => ({ ...s, eventAlertQueue: (s.eventAlertQueue || []).slice(1) }));

  return (
    <div onClick={dismiss} role="alert" style={{ position: "fixed", top: 74, left: "50%", transform: "translateX(-50%)",
      zIndex: 80, display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 9,
      background: "#2A1414", border: `1px solid ${C.red}`, boxShadow: "0 6px 24px rgba(0,0,0,.5)",
      cursor: "pointer", maxWidth: "min(92vw, 34rem)" }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>⚠</span>
      <div>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".12em", color: C.red }}>PATIENT — VISIBLE CHANGE</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{current.text}</div>
      </div>
    </div>
  );
}
