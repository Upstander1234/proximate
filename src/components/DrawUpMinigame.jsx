import { useState } from "react";
import { C } from "../theme.js";
import { DRUGS } from "../data/drugs.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Drawing up a medication: read the order, pick the matching vial out of a
// small tray (the "right drug" check), pull the plunger to the ordered volume
// (the "right dose" check), then flick out the air bubble. Replaces the flat
// 25s busy-timer on the player's "Draw up the next drug" action. A success
// still just sets `prepped` (via start()'s own re-entry), so every existing
// pre-drawn-drug rule in App.jsx is untouched.
//
// The order is random and the volumes are gameplay-only (drugs.js carries a
// dose in mg, not a concentration), so the volume is a training target, not a
// pharmacy-accurate mL figure.
const INJECTABLE = () => Object.entries(DRUGS)
  .filter(([, d]) => /IV|IO|IM/.test(d.route) && !/NEB|PO|INH/.test(d.route))
  .map(([id, d]) => ({ id, name: d.name }));

function pick(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

export default function DrawUpMinigame({ open, kind, pat, assist, interrupted, onResolve }) {
  const [setup] = useState(() => {
    const four = pick(INJECTABLE(), 4);
    return { vials: four, order: four[Math.floor(Math.random() * four.length)], mL: (Math.floor(Math.random() * 9) + 2) / 2 };
  });
  const [vial, setVial] = useState(null);
  const [vol, setVol] = useState(0);
  const [bubble, setBubble] = useState(true);
  const [flash, setFlash] = useState(null);

  if (!open || kind !== "prep") return null;

  const tol = 0.25 * assistToleranceMult(assist);
  // A drawn syringe carries an air bubble that scales with how far past the
  // ordered volume you overshoot the pull; flicking it clears it.
  const draw = () => {
    if (!vial) { setFlash("novial"); return; }
    if (vial !== setup.order.id) { setFlash("wrongdrug"); return; }
    if (Math.abs(vol - setup.mL) > tol) { setFlash("wrongdose"); return; }
    if (bubble) { setFlash("bubble"); return; }
    setFlash("success");
  };
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      wrongdrug: `Wrong vial. The order was ${setup.order.name}. Caught it before it reached the patient, redraw.`,
      wrongdose: `Wrong volume. The order was ${setup.mL.toFixed(1)} mL, waste it and redraw.`,
      bubble: "Air left in the syringe. Discard it and draw again.",
      novial: "No vial selected.",
    }[flash] || "Missed the draw.");
  };
  const msg = {
    success: "Drawn, labeled, and in your hand.",
    wrongdrug: "That is not the ordered drug.",
    wrongdose: "That is not the ordered volume.",
    bubble: "There is still an air bubble in the barrel.",
    novial: "Pick a vial first.",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>Draw up medication</div>
        <div style={{ fontSize: 12, color: C.text, marginBottom: 12 }}>
          Order: <b>{setup.order.name}</b>, {setup.mL.toFixed(1)} mL
        </div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>1. Pick the vial. Read the label.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              {setup.vials.map((v) => (
                <button key={v.id} onClick={() => setVial(v.id)} style={{ padding: "8px 6px", fontSize: 11.5, borderRadius: 6, cursor: "pointer",
                  background: vial === v.id ? "#1B2A20" : "#10151A", border: `1px solid ${vial === v.id ? C.hr : C.line}`, color: C.text }}>{v.name}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>2. Pull the plunger: {vol.toFixed(1)} mL</div>
            <input type="range" min={0} max={6} step={0.1} value={vol} onChange={(e) => setVol(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: C.faint, marginBottom: 12 }}>
              <input type="checkbox" checked={!bubble} onChange={(e) => setBubble(!e.target.checked)} />
              3. Tap the barrel and expel the air
            </label>
            <button onClick={draw} className="px-3 py-2 rounded w-full" style={{ background: "#122A18", border: `1px solid ${C.hr}`, color: C.hr }}>Confirm and cap</button>
          </>
        )}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>{msg[flash]}</div>
            <button onClick={flash === "novial" ? () => setFlash(null) : finish} className="px-3 py-2 rounded w-full"
              style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>{flash === "novial" ? "Back" : "Continue"}</button>
          </div>
        )}
        {!flash && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
            {interrupted && <button onClick={() => onResolve(PROCEDURE_OUTCOME.ABORTED)} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon and attend to the patient</button>}
          </div>
        )}
      </div>
    </div>
  );
}
