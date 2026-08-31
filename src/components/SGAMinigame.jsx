import { useState } from "react";
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
export default function SGAMinigame({ open, kind, pat, assist, interrupted, onResolve, onDialogue }) {
  const [angle, setAngle] = useState(45);
  const [depth, setDepth] = useState(0);
  const [flash, setFlash] = useState(null);

  if (!open || kind !== "sga") return null;

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
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Follow the curve of the palate; insertion angle.</div>
            <input type="range" min={20} max={90} value={angle} onChange={(e) => setAngle(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>Advance until you feel it seat.</div>
            <input type="range" min={0} max={1} step={0.01} value={depth} onChange={(e) => setDepth(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
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
