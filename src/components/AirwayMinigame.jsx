import { useState } from "react";
import { C } from "../theme.js";
import { accessDifficulty } from "../access.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Real, interactive airway mini-games — laryngoscopy and ETT (which reuses
// laryngoscopy's own view step rather than duplicating it) for now; cric
// and SGA are their own separate sub-batch. Each tests a genuinely
// different real skill, per the approved plan, rather than one shared
// generic interaction reused across all four.
//
// onResolve(outcome, detail) — same PROCEDURE_OUTCOME contract as
// AccessMinigame.jsx's; see that file's own comment for the full rationale.
export default function AirwayMinigame({ open, kind, pat, assist, interrupted, onResolve, onDialogue }) {
  const [step, setStep] = useState("view");
  const [lift, setLift] = useState(50);       // laryngoscope lift/angle, 0-100
  const [locked, setLocked] = useState(false); // view confirmed for this attempt
  const [tubeOffset, setTubeOffset] = useState(0); // ETT tube alignment, -1..1
  const [tubeDepth, setTubeDepth] = useState(0);
  const [flash, setFlash] = useState(null);

  if (!open || (kind !== "laryngoscopy" && kind !== "ett")) return null;

  const diff = accessDifficulty("airway", pat);
  // Spec 2.9's accessibility multiplier — see AccessMinigame.jsx's own
  // comment at the identical site. 1 at "standard" (unchanged behavior).
  const assistMult = assistToleranceMult(assist);
  // Harder airway (edema/upperAirwayObstruction): narrower lift window that
  // actually brings the cords into view — a real anterior/obstructed airway
  // needing more precise positioning, not just "more force."
  const liftTol = Math.max(6, 18 - (diff.score - 1) * 8) * assistMult;
  const targetLift = 50;
  const viewGrade = Math.min(4, 1 + Math.floor(Math.abs(lift - targetLift) / liftTol));
  const viewOk = viewGrade <= 2;

  const confirmView = () => {
    // F0 item 23 / F3 spec 2.7: the real blade insertion/laryngoscopy
    // moment — a genuinely different physical stimulus than a needle stick,
    // so it fires the airway-specific gag/cough template
    // (dialogueProvider.js's airway_stimulation_reaction), not
    // procedure_discomfort. Same 45% chance as the access mini-game's
    // stick, reused rather than a new probability invented here; the
    // fireMinigameDialogue helper (App.jsx) itself only speaks for an
    // AWAKE patient, so this is silent (correctly) for the sedated/
    // unconscious intubations this procedure is usually performed on.
    if (onDialogue && Math.random() < 0.45) onDialogue("airway_stimulation_reaction");
    setLocked(true);
    if (!viewOk) { setFlash("noview"); return; }
    if (kind === "laryngoscopy") { setFlash("success"); return; }
    setStep("pass");
  };

  const cordTol = Math.max(0.1, 0.3 - (diff.score - 1) * 0.12) * assistMult;
  // Real depth target sits at the midpoint of the old fixed 0.4-0.85 band
  // (0.625, half-width 0.225) — the anatomy doesn't move for accessibility,
  // only how forgiving the margin either side of it is.
  const depthTarget = 0.625, depthHalf = 0.225 * assistMult;
  const attemptPass = () => {
    if (Math.abs(tubeOffset) > cordTol) { setFlash("esophageal"); return; }
    if (tubeDepth < depthTarget - depthHalf) { setFlash("shallow"); return; }
    if (tubeDepth > depthTarget + depthHalf) { setFlash("mainstem"); return; }
    setFlash("success");
  };

  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      noview: `Grade ${viewGrade} view; cords not adequately visualized.`,
      esophageal: "Tube passed posterior to the cords: esophageal intubation.",
      shallow: "Tube not advanced far enough; cuff still above the cords.",
      mainstem: "Advanced too far: right mainstem intubation.",
    }[flash] || "Missed.");
  };
  const cancel = () => onResolve(PROCEDURE_OUTCOME.CANCELLED);
  const abandon = () => onResolve(PROCEDURE_OUTCOME.ABORTED);

  const title = kind === "laryngoscopy" ? "Laryngoscopy: direct view" : "Endotracheal intubation";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10,
        padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>
          Difficulty: {diff.band}{diff.band !== "routine" ? ": anterior/obstructed airway" : ""}
        </div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`,
            borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed — check the alert once you're done, or abandon now.
          </div>
        )}

        {/* First-person laryngoscope view: a mouth opening, epiglottis, and
            the cords sliding into frame as lift approaches the target. */}
        <svg viewBox="0 0 200 120" style={{ width: "100%", background: "#0C0505", borderRadius: 6, marginBottom: 12 }}>
          <defs>
            <radialGradient id="oralCavityGrad" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#3A1A1A" />
              <stop offset="100%" stopColor="#100707" />
            </radialGradient>
            <linearGradient id="tongueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9636F" />
              <stop offset="100%" stopColor="#8C3B45" />
            </linearGradient>
            <linearGradient id="epiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8555F" />
              <stop offset="100%" stopColor="#7A3B3B" />
            </linearGradient>
          </defs>
          {/* oral cavity, vignetted so the scope's own "view cone" reads naturally */}
          <ellipse cx={100} cy={60} rx={92} ry={54} fill="url(#oralCavityGrad)" />
          {/* tongue mass filling the lower field, pushed down by blade lift */}
          <path d={`M -10 ${118 - lift * 0.15} Q 100 ${100 - lift * 0.1} 210 ${118 - lift * 0.15} L 210 130 L -10 130 Z`}
            fill="url(#tongueGrad)" opacity={0.9} />
          {(() => {
            const closeness = Math.max(0, 1 - Math.abs(lift - targetLift) / 50);
            const epY = 60 - closeness * 30;
            return (
              <>
                {/* epiglottis, a leaf-shaped flap lifting out of the way as
                    blade lift approaches the correct amount */}
                <path d={`M ${100 - 26} ${epY + 4} Q 100 ${epY - 14 - closeness * 8} ${100 + 26} ${epY + 4} Q 100 ${epY + 20} ${100 - 26} ${epY + 4} Z`}
                  fill="url(#epiGrad)" opacity={0.55 + closeness * 0.4} />
                {closeness > 0.5 && (
                  <>
                    {/* arytenoids + glottic opening, only visible once the
                        epiglottis is lifted enough — the real "grade 1" view */}
                    <ellipse cx={92} cy={epY + 22} rx={6} ry={5} fill="#D8B8AE" opacity={(closeness - 0.5) * 2} />
                    <ellipse cx={108} cy={epY + 22} rx={6} ry={5} fill="#D8B8AE" opacity={(closeness - 0.5) * 2} />
                    <path d={`M 88 ${epY + 20} L 100 ${epY + 34} L 112 ${epY + 20} Z`}
                      fill="#2B1414" opacity={(closeness - 0.5) * 2} />
                    <ellipse cx={100} cy={epY + 20} rx={20} ry={9} fill="none" stroke="#F0D8CE"
                      strokeWidth={1.2} opacity={(closeness - 0.5) * 1.6} />
                  </>
                )}
              </>
            );
          })()}
          {step === "pass" && (
            <line x1={100 + tubeOffset * 60} y1={6} x2={100 + tubeOffset * 60} y2={16 + tubeDepth * 74}
              stroke="#E8E4D8" strokeWidth={4} strokeLinecap="round" />
          )}
          {step === "pass" && (
            <circle cx={100 + tubeOffset * 60} cy={16 + tubeDepth * 74} r={5} fill="none" stroke="#7CB3D6" strokeWidth={1.5} opacity={0.8} />
          )}
        </svg>

        {step === "view" && !locked && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>
              Adjust blade lift to bring the cords into view (grade {viewGrade}).
            </div>
            <input type="range" min={0} max={100} value={lift}
              onChange={(e) => setLift(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
            <button onClick={confirmView} className="px-3 py-2 rounded w-full"
              style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>
              Confirm view
            </button>
          </>
        )}

        {step === "pass" && !flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>
              Align the tube with the cord opening and pass it through.
            </div>
            <input type="range" min={-1} max={1} step={0.02} value={tubeOffset}
              onChange={(e) => setTubeOffset(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
            <input type="range" min={0} max={1} step={0.01} value={tubeDepth}
              onChange={(e) => setTubeDepth(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
            <button onClick={attemptPass} className="px-3 py-2 rounded w-full"
              style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>
              Pass the tube
            </button>
          </>
        )}

        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>
              {flash === "success" ? (kind === "laryngoscopy" ? "Cords visualized." : "Tube through the cords, depth confirmed.") :
                flash === "noview" ? `Grade ${viewGrade} view; cords not adequately visualized.` :
                flash === "esophageal" ? "Esophageal intubation; no tracheal placement." :
                flash === "shallow" ? "Not advanced far enough." : "Advanced too far: right mainstem."}
            </div>
            <button onClick={finish} className="px-3 py-2 rounded w-full"
              style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>
              Continue
            </button>
          </div>
        )}

        {!flash && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={cancel} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>
              Cancel attempt
            </button>
            {interrupted && (
              <button onClick={abandon} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>
                Abandon — attend to the patient
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
