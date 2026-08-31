import { useState } from "react";
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

  if (!open || kind !== "cric") return null;

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

        <svg viewBox="0 0 200 160" style={{ width: "100%", background: "#150A0A", borderRadius: 6, marginBottom: 12 }}>
          <rect x={40} y={10} width={120} height={140} fill="#C9987A" opacity={0.3} rx={30} />
          <circle cx={100} cy={targetY * 160} r={landmarkTol * 160} fill={C.amber} opacity={0.25} />
          {step === "landmark" && <circle cx={x * 200} cy={y * 160} r={5} fill={C.text} />}
          {step === "incise" && <line x1={100} y1={targetY * 160 - 12} x2={100 + (cutDir - 0.5) * 60} y2={targetY * 160 + 12}
            stroke={C.red} strokeWidth={2.5} strokeLinecap="round" />}
          {step === "tube" && <line x1={100} y1={targetY * 160 - 10} x2={100} y2={targetY * 160 + depth * 60}
            stroke={C.text} strokeWidth={3} strokeLinecap="round" />}
        </svg>

        {step === "landmark" && !flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Find the cricothyroid membrane.</div>
            <input type="range" min={0} max={1} step={0.02} value={x} onChange={(e) => setX(Number(e.target.value))} style={{ width: "100%", marginBottom: 6 }} />
            <input type="range" min={0} max={1} step={0.02} value={y} onChange={(e) => setY(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
            <button onClick={confirmLandmark} className="px-3 py-2 rounded w-full" style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Mark it</button>
          </>
        )}
        {step === "incise" && !flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Make a vertical incision through the membrane.</div>
            <input type="range" min={0} max={1} step={0.02} value={cutDir} onChange={(e) => setCutDir(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
            <button onClick={confirmIncision} className="px-3 py-2 rounded w-full" style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Incise</button>
          </>
        )}
        {step === "tube" && !flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Hook the trachea open and seat the tube.</div>
            <input type="range" min={0} max={1} step={0.01} value={depth} onChange={(e) => setDepth(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
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
