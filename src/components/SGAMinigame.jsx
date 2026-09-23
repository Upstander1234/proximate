import { useState, useRef } from "react";
import { C } from "../theme.js";
import { accessDifficulty } from "../access.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// SGA (supraglottic airway) — deliberately the simplest of the four airway
// mini-games, matching its real "blind technique" character: angle and
// insertion depth only, with NO visual target rendered (unlike ETT/
// laryngoscopy, there is genuinely nothing to see for a blind-insertion
// device — that's the actual clinical point of an SGA). Success feedback is
// a felt-resistance/seating cue rather than a visual confirmation, standing
// in for the real tactile "give" a provider feels at correct depth.
//
// The scene below is an OUTSIDE view of the head/device (what a provider
// standing over the patient actually sees), not an inside/glottic view —
// it tracks the same angle/depth the player is dialing in, without
// revealing anything about whether the blind seat is correct.
function HeadProfile({ angle, depth, svgRef, onGrabDown, onGrabMove, onGrabUp, dragging }) {
  const rad = (angle * Math.PI) / 180;
  const tipX = 128 - Math.cos(rad) * (18 + depth * 58);
  const tipY = 62 - Math.sin(rad) * (10 + depth * 30);
  return (
    <svg ref={svgRef} viewBox="0 0 200 110" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10, touchAction: "none" }}
      onPointerMove={onGrabMove} onPointerUp={onGrabUp} onPointerLeave={onGrabUp}>
      <defs>
        <linearGradient id="sgaFaceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3AE87" />
          <stop offset="60%" stopColor="#D19972" />
          <stop offset="100%" stopColor="#B87A54" />
        </linearGradient>
      </defs>
      {/* head/face in profile, shaded rather than a flat tan silhouette */}
      <path d="M40,90 Q20,50 55,25 Q90,4 120,20 Q140,30 138,55 Q150,58 148,66 Q145,72 136,70 Q132,90 100,96 Q60,100 40,90 Z"
        fill="url(#sgaFaceGrad)" stroke="#8A5E45" strokeWidth={1} />
      {/* forehead/nose bridge highlight */}
      <path d="M60,28 Q80,10 110,18" fill="none" stroke="#F3CBA8" strokeWidth={1.5} opacity={0.5} />
      {/* nostril */}
      <ellipse cx={115} cy={44} rx={4} ry={2.5} fill="#00000030" />
      {/* lips, parted for the device */}
      <path d="M118,58 Q128,66 133,58" fill="none" stroke="#7A3B3B" strokeWidth={2} opacity={0.7} strokeLinecap="round" />
      <path d="M118,52 Q128,50 134,53" fill="none" stroke="#5C3A2A" strokeWidth={1.2} opacity={0.5} />
      {/* ear */}
      <ellipse cx={44} cy={60} rx={7} ry={11} fill="#00000018" />
      {/* chin/jaw shading */}
      <path d="M60,88 Q90,98 132,86" fill="none" stroke="#00000018" strokeWidth={2} />
      <line x1={128} y1={62} x2={tipX} y2={tipY} stroke="#DCE6EA" strokeWidth={5} strokeLinecap="round" style={{ pointerEvents: "none" }} />
      <line x1={128} y1={62} x2={tipX} y2={tipY} stroke="#8FA8B5" strokeWidth={1.5} strokeLinecap="round" opacity={0.6} style={{ pointerEvents: "none" }} />
      {/* the device tip itself — press and drag it to set angle/depth
          together, the real motion of guiding it along the palate, rather
          than two separate sliders */}
      <circle cx={tipX} cy={tipY} r={3} fill="#7CD68A" opacity={0.8} style={{ pointerEvents: "none" }} />
      <circle cx={tipX} cy={tipY} r={12} fill="transparent" onPointerDown={onGrabDown} style={{ cursor: dragging ? "grabbing" : "grab" }} />
      <rect x={130} y={54} width={24} height={16} rx={3} fill="#0E1518" stroke={C.line} strokeWidth={1} style={{ pointerEvents: "none" }} />
    </svg>
  );
}
export default function SGAMinigame({ open, kind, pat, assist, interrupted, onResolve, onDialogue }) {
  const [angle, setAngle] = useState(45);
  const [depth, setDepth] = useState(0);
  const [flash, setFlash] = useState(null);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef(null);

  if (!open || kind !== "sga") return null;

  // Dragging the device tip sets angle/depth together from its position
  // relative to the mouth origin (128,62) — one gesture, not two sliders.
  const dragTo = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) / rect.width) * 200, ly = ((e.clientY - rect.top) / rect.height) * 110;
    const dx = 128 - lx, dy = 62 - ly;
    const rad = Math.atan2(dy, dx);
    setAngle(Math.max(20, Math.min(90, (rad * 180) / Math.PI)));
    const reach = Math.hypot(dx, dy);
    setDepth(Math.max(0, Math.min(1, (reach - 18) / 58)));
  };
  const onGrabDown = (e) => { setDragging(true); dragTo(e); };
  const onGrabMove = (e) => { if (dragging) dragTo(e); };
  const onGrabUp = () => setDragging(false);

  const diff = accessDifficulty("airway", pat);
  // Spec 2.9's accessibility multiplier — see AccessMinigame.jsx's own
  // comment at the identical site. 1 at "standard" (unchanged behavior).
  const assistMult = assistToleranceMult(assist);
  const angleTol = Math.max(8, 20 - (diff.score - 1) * 8) * assistMult;
  const targetAngle = 55; // real SGA insertion follows the palate curve, steeper than a laryngoscope angle
  const seatDepth = 0.55 + (diff.score - 1) * 0.08;
  const seatBand = 0.14 * assistMult;

  const attemptSeat = () => {
    // F0 item 23 / F3 spec 2.7: the real blind-insertion moment — same
    // airway gag/cough template and probability as the laryngoscopy/ETT
    // trigger (AirwayMinigame.jsx), reused rather than a new mechanism;
    // fireMinigameDialogue itself is silent for a non-awake patient.
    if (onDialogue && Math.random() < 0.45) onDialogue("airway_stimulation_reaction");
    if (Math.abs(angle - targetAngle) > angleTol) { setFlash("resistance"); return; }
    if (depth < seatDepth - seatBand / 2) { setFlash("shallow"); return; }
    if (depth > seatDepth + seatBand) { setFlash("curled"); return; }
    setFlash("success");
  };
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      resistance: "Met firm resistance early; wrong angle, redirect and retry.",
      shallow: "Doesn't feel seated; likely still in the oropharynx.",
      curled: "Advanced too far; tip may have curled back on itself.",
    }[flash] || "Missed.");
  };
  const cancel = () => onResolve(PROCEDURE_OUTCOME.CANCELLED);
  const abandon = () => onResolve(PROCEDURE_OUTCOME.ABORTED);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10,
        padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>Supraglottic airway: blind insertion</div>
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>
          Difficulty: {diff.band}{diff.band !== "routine" ? ": distorted airway anatomy" : ""}
        </div>
        <MinigameVitalsStrip pat={pat} />
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 10, fontStyle: "italic" }}>
          No view here; this is a blind technique. Go by feel and the midline curve of the palate.
        </div>
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`,
            borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed — check the alert once you're done, or abandon now.
          </div>
        )}

        {!flash && (
          <>
            <HeadProfile angle={angle} depth={depth} svgRef={svgRef} dragging={dragging}
              onGrabDown={onGrabDown} onGrabMove={onGrabMove} onGrabUp={onGrabUp} />
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>
              Drag the device tip along the curve of the palate until you feel it seat.</div>
            <button onClick={attemptSeat} className="px-3 py-2 rounded w-full" style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Advance</button>
          </>
        )}

        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>
              {flash === "success" ? "A real give; it's seated." :
                { resistance: "Firm resistance, wrong angle.", shallow: "Doesn't feel seated.", curled: "Advanced too far." }[flash]}
            </div>
            <button onClick={finish} className="px-3 py-2 rounded w-full" style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Continue</button>
          </div>
        )}
        {!flash && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={cancel} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel attempt</button>
            {interrupted && <button onClick={abandon} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon — attend to the patient</button>}
          </div>
        )}
      </div>
    </div>
  );
}
