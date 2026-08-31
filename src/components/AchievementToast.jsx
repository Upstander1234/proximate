import { useEffect } from "react";
import { C, MONO } from "../theme.js";
import { ACHIEVEMENTS } from "../achievements.js";
import { ACHIEVEMENT_ART, onImgError } from "../assets.js";

// F7 — the "🏆 Achievement unlocked" line has always been written correctly
// into g.log (creditOutcome / the shift-end perfect_shift block) and read
// correctly by AchievementsOverlay's permanent list, but g.log itself is only
// ever rendered inside the scene/transport tabbed panel — every credit site
// switches phase to "debrief"/"shiftSummary" in the SAME update, so the toast
// had no phase left in which it could ever be seen. Mounted from Shell.jsx
// exactly like the other overlays, so it renders regardless of phase, and
// reads a separate one-shot queue (g.toastQueue) instead of g.log so it
// doesn't depend on whatever screen happens to render the narrative log.
const TOAST_MS = 4200;

export default function AchievementToast({ g, setG }) {
  const current = g?.toastQueue?.[0];
  useEffect(() => {
    if (!current) return;
    const id = setTimeout(() => {
      setG((s) => ({ ...s, toastQueue: (s.toastQueue || []).slice(1) }));
    }, TOAST_MS);
    return () => clearTimeout(id);
  }, [current, setG]);

  if (!current) return null;
  const a = ACHIEVEMENTS.find((x) => x.id === current.id);
  return (
    <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 80,
      display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 9,
      background: "#16241C", border: `1px solid ${C.hr}`, boxShadow: "0 6px 24px rgba(0,0,0,.45)" }}>
      <img src={ACHIEVEMENT_ART[current.id]} onError={onImgError} alt="" width={30} height={30}
        style={{ borderRadius: 6, objectFit: "cover", border: `1px solid ${C.line}`, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".12em", color: C.hr }}>ACHIEVEMENT UNLOCKED</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a?.name || current.id}</div>
      </div>
    </div>
  );
}
