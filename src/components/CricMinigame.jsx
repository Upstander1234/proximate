import { useState, useRef, useEffect } from "react";
import { C } from "../theme.js";
import { accessDifficulty } from "../access.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Cricothyrotomy — a discrete, SEQUENCED procedure rather than a
// continuous-drag interaction, matching its real step structure: locate
// the cricothyroid membrane landmark, incise along it, then hook-and-tube.
// No BMI/obesity field exists in this physiology engine (confirmed during
// design) — anatomical difficulty is represented honestly via the edema/
// upperAirwayObstruction fields that DO exist (accessDifficulty("airway",...),
// the same signal laryngoscopy/ETT use), not a fabricated obesity scale.
export default function CricMinigame({ open, kind, pat, assist, interrupted, onResolve, onDialogue }) {
  const [step, setStep] = useState("landmark");
  const [x, setX] = useState(0.5); // 0-1 across the neck midline
  const [y, setY] = useState(0.5); // 0-1 down toward the sternal notch
  const [cutDir, setCutDir] = useState(0.5); // 0-1, vertical incision alignment
  const [depth, setDepth] = useState(0);
  const [flash, setFlash] = useState(null);
  const svgRef = useRef(null);
  const advancing = useRef(false);

  // Advancing the tube is a real, continuous press on the neck, not a
  // slider — matches AccessMinigame's needle-advance pattern.
  useEffect(() => {
    if (step !== "tube") return undefined;
    const id = setInterval(() => { if (advancing.current) setDepth((d) => Math.min(1, d + 0.03)); }, 60);
    return () => clearInterval(id);
  }, [step]);

  if (!open || kind !== "cric") return null;

  // Client (screen) pixel -> the SVG's own 0..200 x 0..160 viewBox space.
  const toLocal = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { lx: ((e.clientX - rect.left) / rect.width) * 200, ly: ((e.clientY - rect.top) / rect.height) * 160 };
  };
  const onNeckDown = (e) => {
    const { lx, ly } = toLocal(e);
    if (step === "landmark") { setX(Math.max(0, Math.min(1, lx / 200))); setY(Math.max(0, Math.min(1, ly / 160))); }
    else if (step === "incise") { setCutDir(Math.max(0, Math.min(1, 0.5 + (lx - 100) / 60))); }
    else if (step === "tube") { advancing.current = true; }
  };
  const onNeckMove = (e) => {
    if (step === "landmark" && e.buttons === 1) {
      const { lx, ly } = toLocal(e);
      setX(Math.max(0, Math.min(1, lx / 200))); setY(Math.max(0, Math.min(1, ly / 160)));
    } else if (step === "incise" && e.buttons === 1) {
      const { lx } = toLocal(e);
      setCutDir(Math.max(0, Math.min(1, 0.5 + (lx - 100) / 60)));
    }
  };
  const onNeckUp = () => { advancing.current = false; };

  const diff = accessDifficulty("airway", pat);
  // Spec 2.9's accessibility multiplier — see AccessMinigame.jsx's own
  // comment at the identical site. 1 at "standard" (unchanged behavior).
  const assistMult = assistToleranceMult(assist);
  const landmarkTol = Math.max(0.06, 0.16 - (diff.score - 1) * 0.07) * assistMult;
  const targetX = 0.5, targetY = 0.42; // cricothyroid membrane, real anatomic position
  const onLandmark = Math.hypot(x - targetX, y - targetY) <= landmarkTol;

  const confirmLandmark = () => {
    if (!onLandmark) { setFlash("landmark"); return; }
    setStep("incise");
  };
  const cutTol = Math.max(0.08, 0.2 - (diff.score - 1) * 0.08) * assistMult;
  const confirmIncision = () => {
    // F0 item 23 / F3 spec 2.7: the actual incision through skin, this
    // procedure's real analog of a needle stick — reuses procedure_
    // discomfort (a sharp local pain reaction), not the airway gag/cough
    // template, since this is a cutaneous incision, not airway
    // instrumentation. fireMinigameDialogue only speaks for an awake
    // patient (the usual real-world case: a surgical airway means every
    // less-invasive option already failed on a still-conscious patient).
    if (onDialogue && Math.random() < 0.45) onDialogue("procedure_discomfort");
    if (Math.abs(cutDir - 0.5) > cutTol) { setFlash("wrongplane"); return; }
    setStep("tube");
  };
  // Real depth target sits at the midpoint of the old fixed 0.35-0.75 band
  // (0.55, half-width 0.20) — the anatomy doesn't move for accessibility,
  // only how forgiving the margin either side of it is.
  const tubeDepthTarget = 0.55, tubeDepthHalf = 0.2 * assistMult;
  const confirmTube = () => {
    if (depth < tubeDepthTarget - tubeDepthHalf) { setFlash("shallow"); return; }
    if (depth > tubeDepthTarget + tubeDepthHalf) { setFlash("posterior"); return; }
    setFlash("success");
  };
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      landmark: "Missed the membrane; cut too high or too low.",
      wrongplane: "Incision off the midline: wrong tissue plane.",
      shallow: "Tube not seated; still in subcutaneous tissue.",
      posterior: "Advanced too far: posterior tracheal wall risk.",
    }[flash] || "Missed.");
  };
  const cancel = () => onResolve(PROCEDURE_OUTCOME.CANCELLED);
  const abandon = () => onResolve(PROCEDURE_OUTCOME.ABORTED);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10,
        padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>Surgical cricothyrotomy</div>
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>
          Difficulty: {diff.band}{diff.band !== "routine" ? ": landmarks obscured by swelling" : ""}
        </div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`,
            borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed — check the alert once you're done, or abandon now.
          </div>
        )}

        <svg ref={svgRef} viewBox="0 0 200 160" style={{ width: "100%", background: "#150A0A", borderRadius: 6, marginBottom: 12, touchAction: "none",
            cursor: flash ? "default" : step === "tube" ? "grab" : "crosshair" }}
          onPointerDown={flash ? undefined : onNeckDown} onPointerMove={flash ? undefined : onNeckMove}
          onPointerUp={flash ? undefined : onNeckUp} onPointerLeave={flash ? undefined : onNeckUp}>
          <defs>
            <linearGradient id="neckSkinGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B87A54" />
              <stop offset="50%" stopColor="#E3AE87" />
              <stop offset="100%" stopColor="#B87A54" />
            </linearGradient>
          </defs>
          {/* neck, tapered like a real throat rather than a flat rounded
              rectangle, with the cartilage landmarks drawn in relief so the
              player can see why the membrane sits where it does */}
          <path d="M 55 10 Q 100 2 145 10 L 155 150 Q 100 160 45 150 Z" fill="url(#neckSkinGrad)" />
          {/* thyroid cartilage ("Adam's apple") prominence above the membrane */}
          <path d="M 78 38 L 100 20 L 122 38 L 116 60 L 100 66 L 84 60 Z" fill="#00000022" />
          <path d="M 78 38 L 100 20 L 122 38" fill="none" stroke="#F3CBA8" strokeWidth={1.5} opacity={0.5} />
          {/* cricoid ring, below the membrane */}
          <ellipse cx={100} cy={targetY * 160 + 22} rx={22} ry={7} fill="#00000018" />
          {/* tracheal rings continuing down toward the sternal notch */}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={78} y1={targetY * 160 + 34 + i * 14} x2={122} y2={targetY * 160 + 34 + i * 14}
              stroke="#00000014" strokeWidth={3} />
          ))}
          <circle cx={100} cy={targetY * 160} r={landmarkTol * 160} fill={C.amber} opacity={0.25} />
          {step === "landmark" && <circle cx={x * 200} cy={y * 160} r={5} fill={C.text} stroke="#000" strokeWidth={1} />}
          {step === "incise" && <line x1={100} y1={targetY * 160 - 12} x2={100 + (cutDir - 0.5) * 60} y2={targetY * 160 + 12}
            stroke={C.red} strokeWidth={2.5} strokeLinecap="round" />}
          {step === "tube" && <line x1={100} y1={targetY * 160 - 10} x2={100} y2={targetY * 160 + depth * 60}
            stroke="#E8E4D8" strokeWidth={4} strokeLinecap="round" />}
        </svg>

        {step === "landmark" && !flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Click and drag directly on the neck to find the cricothyroid membrane.</div>
            <button onClick={confirmLandmark} className="px-3 py-2 rounded w-full" style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Mark it</button>
          </>
        )}
        {step === "incise" && !flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Drag across the membrane above to make a vertical incision.</div>
            <button onClick={confirmIncision} className="px-3 py-2 rounded w-full" style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Incise</button>
          </>
        )}
        {step === "tube" && !flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Press and hold on the neck above to hook the trachea open and advance the tube: {Math.round(depth * 100)}%.</div>
            <button onClick={confirmTube} className="px-3 py-2 rounded w-full" style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Seat the tube</button>
          </>
        )}

        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>
              {flash === "success" ? "Airway secured surgically." :
                { landmark: "Missed the membrane.", wrongplane: "Wrong tissue plane.", shallow: "Tube not seated.", posterior: "Too deep, posterior wall risk." }[flash]}
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
