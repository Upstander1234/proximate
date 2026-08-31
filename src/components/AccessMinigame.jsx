import { useState, useEffect, useRef } from "react";
import { C } from "../theme.js";
import { accessDifficulty, veinVisibility } from "../access.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// A real, interactive replacement for the flat "click IV/IO, roll a die"
// procedures — uncap, position/angle, insert slowly, watch for the real
// clinical confirmation sign (flash for IV, a "pop" through the cortex for
// IO). Difficulty (vein/landmark tolerance, angle/depth bands) is driven
// entirely by accessDifficulty() — real physiology fields, not a hidden
// probability roll. IV and IO share this shell (uncap -> position/angle ->
// insert -> result) since the real skill shape is the same; the visual
// metaphor and target bands differ, computed per-kind below. Airway
// procedures (ETT/laryngoscopy/cric/SGA) are their own, structurally
// different mini-games — not a variant of this component.
//
// onResolve(outcome, detail) — a PROCEDURE_OUTCOME value plus an optional
// detail string (a miss reason for FAILED, unused for the others). App.jsx's
// resolveAccessMinigame() does everything after that: re-invokes the
// original action on SUCCESS (so PK/IV-line, artificialAirway, etc. effects
// land exactly as they always did), charges a real, escalating retry cost on
// FAILED, or closes for free (but now visibly, via the same resolver) on
// CANCELLED. This is the single entry point every mini-game resolves
// through — there is no separate onCancel prop anymore.

const IV_SITE_LABEL = { armR: "right antecubital", armL: "left antecubital", legR: "right saphenous", legL: "left saphenous" };
const IO_SITE_LABEL = { armR: "right proximal humerus", armL: "left proximal humerus", legR: "right proximal tibia", legL: "left proximal tibia", torso: "sternal (manubrium)" };

export default function AccessMinigame({ open, kind, site, attempts, pat, assist, interrupted, onResolve, onDialogue }) {
  const [step, setStep] = useState("uncap");
  const [angle, setAngle] = useState(kind === "io" ? 90 : 20);
  const [offset, setOffset] = useState(0); // IO landmark position, -1..1
  const [depth, setDepth] = useState(0);
  const [holding, setHolding] = useState(false);
  const [flash, setFlash] = useState(null); // outcome key | null
  const angleRef = useRef(angle);
  const depthRef = useRef(depth);
  useEffect(() => { angleRef.current = angle; }, [angle]);
  useEffect(() => { depthRef.current = depth; }, [depth]);

  // IV, reworked per operator instruction: click-and-hold to advance the
  // needle (a continuous press, not a slider drag) while arrow keys adjust
  // insertion angle live mid-advance — matches how a real stick actually
  // feels (one hand holding steady pressure in, the other/wrist fine-tuning
  // angle), rather than two separate discrete slider steps.
  useEffect(() => {
    if (kind !== "iv" || step !== "insert" || flash) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { setAngle(a => Math.max(0, a - 1)); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setAngle(a => Math.min(60, a + 1)); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kind, step, flash]);

  useEffect(() => {
    if (!holding || flash) return;
    const iv = setInterval(() => setDepth(d => Math.min(1, d + 0.02)), 30);
    return () => clearInterval(iv);
  }, [holding, flash]);

  if (!open || (kind !== "iv" && kind !== "io")) return null;

  const diff = accessDifficulty(kind, pat);
  // Spec 2.9: a player-chosen margin-of-error multiplier, applied ON TOP of
  // the physiology-derived difficulty above — the real vein position/size
  // doesn't move for an accessibility setting, only how forgiving the
  // acceptance band around it is. 1 at "standard" (unchanged behavior).
  const assistMult = assistToleranceMult(assist);

  if (kind === "iv") {
    const veinVis = veinVisibility(pat);
    const angleTol = Math.max(3, 10 - (diff.score - 1) * 5) * assistMult;
    const targetAngle = 22; // real peripheral-IV insertion angle, ~15-30 deg
    const rawVeinTop = 0.34 + (diff.score - 1) * 0.16;
    const rawVeinWidth = Math.max(0.06, 0.16 - (diff.score - 1) * 0.06);
    const veinCenter = rawVeinTop + rawVeinWidth / 2;
    const veinWidth = Math.min(0.5, rawVeinWidth * assistMult);
    const veinTop = Math.max(0, veinCenter - veinWidth / 2);
    const veinBottom = veinTop + veinWidth;

    const releaseNeedle = () => {
      setHolding(false);
      if (flash) return;
      // F0 item 23 / F3 spec 2.7: the real needle stick itself, not a
      // slider tick — same 45% chance the flat busy-timer path already
      // uses for procedure_discomfort (App.jsx's start()), reused here
      // rather than a new probability invented for this component. Fires
      // regardless of whether the stick lands, since a real IV/IO attempt
      // hurts whether or not it's in the vein.
      if (onDialogue && Math.random() < 0.45) onDialogue("procedure_discomfort");
      const a = angleRef.current, d = depthRef.current;
      if (Math.abs(a - targetAngle) > angleTol) { setFlash("angle"); return; }
      if (d < veinTop) { setFlash("shallow"); return; }
      if (d > veinBottom) { setFlash("blown"); return; }
      setFlash("success");
    };
    const finish = () => {
      if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
      onResolve(PROCEDURE_OUTCOME.FAILED, {
        angle: "Wrong angle. Missed the vein entirely.",
        shallow: "Too shallow, no flash; needle's still subcutaneous.",
        blown: "In too deep; blew through the back wall of the vein.",
      }[flash] || "Missed.");
    };
    const cancel = () => onResolve(PROCEDURE_OUTCOME.CANCELLED);
    const abandon = () => onResolve(PROCEDURE_OUTCOME.ABORTED);

    return (
      <MinigameShell title={`IV: ${IV_SITE_LABEL[site] || "the site"}`} attempts={attempts} diff={diff} pat={pat} interrupted={interrupted}
        diffNote={diff.band !== "routine" ? "vein is smaller/deeper than usual" : ""} onCancel={cancel} onAbandon={abandon} flash={flash} finish={finish}
        resultText={flash === "success" ? "Flash! You're in the vein." : flash === "angle" ? "Wrong angle, missed the vein." :
          flash === "shallow" ? "Too shallow, no flash." : flash === "blown" ? "Blew through the back wall." : ""}>
        <svg viewBox="0 0 200 120" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 12 }}>
          <rect x={0} y={0} width={200} height={30} fill="#C9987A" opacity={0.35} />
          <line x1={0} y1={30} x2={200} y2={30} stroke="#C9987A" strokeWidth={2} />
          <rect x={0} y={30 + veinTop * 80} width={200} height={Math.max(4, veinWidth * 80)}
            fill={C.hr || "#B33"} opacity={0.25 + veinVis * 0.55} rx={4} />
          {step !== "uncap" && <NeedleLine angle={angle} depth={depth} pivotY={30} depthScale={80} />}
          {flash === "success" && <circle cx={100} cy={30 + (veinTop + veinWidth / 2) * 80} r={5} fill={C.red || "#E33"} />}
        </svg>
        {step === "uncap" && <StepButton onClick={() => setStep("insert")}>Uncap the needle</StepButton>}
        {step === "insert" && !flash && (
          <>
            <Hint>Angle {angle.toFixed(0)}° (◀ ▶ arrow keys, or the buttons below, to adjust); press and hold to advance ({(depth * 100).toFixed(0)}%).</Hint>
            {/* Spec 2.14: the arrow-key listener above has no touch
                equivalent — on a phone there was no way to correct angle
                at all mid-advance. Plain onClick buttons work identically
                via a tap's synthetic click event, no separate touch
                handling needed, and don't interfere with the Hold button's
                own mouse/touch handlers since they're a separate element. */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={() => setAngle(a => Math.max(0, a - 1))} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>◀ Angle</button>
              <button onClick={() => setAngle(a => Math.min(60, a + 1))} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Angle ▶</button>
            </div>
            <button
              onMouseDown={() => setHolding(true)}
              onMouseUp={releaseNeedle}
              onMouseLeave={() => { if (holding) releaseNeedle(); }}
              onTouchStart={(e) => { e.preventDefault(); setHolding(true); }}
              onTouchEnd={(e) => { e.preventDefault(); releaseNeedle(); }}
              className="px-3 py-2 rounded w-full"
              style={{ background: holding ? "#3A1A20" : "#2A1418", border: `1px solid ${C.red}`, color: C.red, userSelect: "none" }}>
              {holding ? "Advancing… release to stick" : "Hold to advance the needle"}
            </button>
          </>
        )}
      </MinigameShell>
    );
  }

  // ---- IO: uncap the driver -> find the landmark -> perpendicular angle
  // is fixed for this shell (real IO technique is perpendicular to the
  // bone; the SKILL is landmark position, not angle hunting the way IV
  // is), then advance until a real "pop" through the cortex — the actual
  // tactile confirmation sign, standing in for IV's flash. Overshooting
  // past the pop depth is a real, distinct failure (through-and-through,
  // past the far cortex), not just "less correct."
  const landmarkTol = Math.max(0.08, 0.32 - (diff.score - 1) * 0.14) * assistMult;
  const popDepth = 0.55 + (diff.score - 1) * 0.1;
  const popBand = 0.08 * assistMult;

  const attemptDrive = () => {
    // Same real-stick moment/probability as the IV path above — the IO
    // driver's own "drive to pop" is this procedure's equivalent physical
    // event, not a separate mechanism.
    if (onDialogue && Math.random() < 0.45) onDialogue("procedure_discomfort");
    if (Math.abs(offset) > landmarkTol) { setFlash("landmark"); return; }
    if (depth < popDepth - popBand / 2) { setFlash("shallow"); return; }
    if (depth > popDepth + popBand) { setFlash("through"); return; }
    setFlash("success");
  };
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      landmark: "Off the landmark; needle skated off the bone.",
      shallow: "No pop yet, still in the periosteum.",
      through: "Drove through the far cortex.",
    }[flash] || "Missed.");
  };
  const cancel = () => onResolve(PROCEDURE_OUTCOME.CANCELLED);
  const abandon = () => onResolve(PROCEDURE_OUTCOME.ABORTED);

  return (
    <MinigameShell title={`IO: ${IO_SITE_LABEL[site] || "the site"}`} attempts={attempts} diff={diff} pat={pat} interrupted={interrupted}
      diffNote={diff.band !== "routine" ? "landmark obscured, soft tissue swelling" : ""} onCancel={cancel} onAbandon={abandon} flash={flash} finish={finish}
      resultText={flash === "success" ? "Pop! You're through the cortex." : flash === "landmark" ? "Off the landmark." :
        flash === "shallow" ? "No pop yet." : flash === "through" ? "Drove through the far cortex." : ""}>
      <svg viewBox="0 0 200 120" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 12 }}>
        <rect x={0} y={0} width={200} height={20} fill="#C9987A" opacity={0.3} />
        <rect x={0} y={20} width={200} height={12} fill="#E8DCC8" opacity={0.85} /> {/* cortex */}
        <rect x={0} y={32} width={200} height={70} fill="#8A7A5C" opacity={0.35} /> {/* medullary cavity */}
        <rect x={100 + (0 - landmarkTol) * 90} y={20} width={landmarkTol * 2 * 90} height={12}
          fill={C.amber} opacity={0.35} />
        {step !== "uncap" && <NeedleLine angle={angle} depth={depth} pivotY={20} depthScale={70} xOffset={offset * 90} vertical />}
        {flash === "success" && <circle cx={100 + offset * 90} cy={20 + popDepth * 70} r={4} fill={C.red || "#E33"} />}
      </svg>
      {step === "uncap" && <StepButton onClick={() => setStep("position")}>Ready the IO driver</StepButton>}
      {step === "position" && (
        <>
          <Hint>Find the landmark: flat, wide part of the bone, perpendicular.</Hint>
          <Slider min={-1} max={1} step={0.02} value={offset} onChange={setOffset} />
          <StepButton onClick={() => setStep("insert")}>Position set, advance</StepButton>
        </>
      )}
      {step === "insert" && !flash && (
        <>
          <Hint>Advance with steady pressure until you feel a give ({(depth * 100).toFixed(0)}%).</Hint>
          <Slider min={0} max={1} step={0.01} value={depth} onChange={setDepth} />
          <StickButton onClick={attemptDrive}>Drive</StickButton>
        </>
      )}
    </MinigameShell>
  );
}

function MinigameShell({ title, attempts, diff, diffNote, pat, interrupted, onCancel, onAbandon, flash, finish, resultText, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10,
        padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>
          {title}{attempts > 0 ? ` (attempt ${attempts + 1})` : ""}
        </div>
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>
          Difficulty: {diff.band}{diffNote ? `: ${diffNote}` : ""}
        </div>
        <MinigameVitalsStrip pat={pat} />
        {/* Spec 2.5: sim time keeps running underneath this modal now, so
            the vitals strip above is genuinely live, not a snapshot — and
            when the patient's real condition changes enough to fire a
            visible clinical event (ClinicalEventAlert's own edge-detection,
            App.jsx), this banner and the Abandon button below surface it
            here too, instead of the player only finding out after they
            close the mini-game. */}
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`,
            borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed — check the alert once you're done, or abandon now.
          </div>
        )}
        {children}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>{resultText}</div>
            <StepButton onClick={finish}>Continue</StepButton>
          </div>
        )}
        {!flash && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={onCancel} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>
              Cancel attempt
            </button>
            {interrupted && (
              <button onClick={onAbandon} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>
                Abandon — attend to the patient
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NeedleLine({ angle, depth, pivotY, depthScale, xOffset = 0, vertical = false }) {
  const rad = (angle * Math.PI) / 180;
  const cx = 100 + xOffset;
  // Vertical travel now uses the SAME depth*depthScale the vein/pop-depth
  // target rectangles are drawn with (see the veinTop/veinWidth and
  // popDepth math above) — previously this used an unrelated sin(angle)-
  // scaled formula that reached barely a third of the vein rect's own
  // scale, so a needle at a genuinely winning depth visually stopped well
  // short of the vein. "Depth" now means the same thing visually as it
  // does in the win-condition check.
  const tipY = pivotY + depth * depthScale;
  // Horizontal reach follows from the vertical travel and the chosen
  // insertion angle (tipY-pivotY = tan(angle) * horizontal), so the drawn
  // needle actually points along the angle the player set, just anchored
  // to the correct depth. Guard near-zero angle so tan() doesn't blow the
  // line off-canvas.
  const tanA = Math.max(0.15, Math.tan(rad));
  const tipX = vertical ? cx : cx + Math.min(95, (depth * depthScale) / tanA);
  return (
    <line x1={vertical ? cx : cx - Math.cos(rad) * 40} y1={vertical ? pivotY - 20 : pivotY - Math.sin(rad) * 40}
      x2={tipX} y2={Math.max(pivotY, tipY)} stroke={C.text || "#DDE"} strokeWidth={2.5} strokeLinecap="round" />
  );
}

function Hint({ children }) { return <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>{children}</div>; }
function Slider({ min, max, step = 1, value, onChange }) {
  return <input type="range" min={min} max={max} step={step} value={value}
    onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />;
}
function StepButton({ onClick, children }) {
  return <button onClick={onClick} className="px-3 py-2 rounded w-full"
    style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>{children}</button>;
}
function StickButton({ onClick, children }) {
  return <button onClick={onClick} className="px-3 py-2 rounded w-full"
    style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>{children}</button>;
}
