import { useState, useRef, useEffect } from "react";
import { C, MONO } from "../theme.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";
import ChestBody from "./ChestBody.jsx";
import { AuscultationPlayer } from "../audio/auscultationPlayer.js";
import { chestSpec, CHEST_VIEWBOX } from "../physio/auscultation.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";

// Stethoscope exam on a bare chest. Nothing on the body is labeled: hover to line
// the chestpiece up (mouse), click to place it, and hold and drag to slide it
// across the chest; the sound changes with where you are, from the live physiology
// (physio/auscultation.js), at the patient's exact heart and respiratory rate. The
// chest is only reachable once the shirt is off (the UI and start() enforce that).
// There is nothing to pass or fail: you listen, then write what you heard and what
// you think it is and tell the crew, or just finish.
const { w: VW, h: VH } = CHEST_VIEWBOX;
const box = { background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "6px 8px", fontSize: 12.5, width: "100%", fontFamily: "inherit" };
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12.5, cursor: "pointer", width: "100%" });

function Chestpiece({ x, y, placed }) {
  return (
    <g transform={`translate(${x} ${y})`} style={{ pointerEvents: "none" }}>
      {/* rubber tubing running up and off the chest */}
      <path d={`M0 -12 C 6 -46 40 -60 70 -104 S 96 -170 96 -190`} fill="none" stroke="#1B1F24" strokeWidth={placed ? 5 : 4} strokeLinecap="round" opacity={placed ? 1 : 0.7} />
      {!placed && <ellipse cx="4" cy="8" rx="15" ry="5" fill="#000" opacity=".25" />}
      <g transform={placed ? "" : "translate(-2 -6) scale(1.12)"} opacity={placed ? 1 : 0.7}>
        <circle r="15" fill="#B9C2C9" stroke="#39434B" strokeWidth="2" />
        <circle r="10.5" fill="#DDE3E8" stroke="#8B979F" strokeWidth="1.4" />
        <circle r="4" fill="#59646D" />
        {placed && <circle r="19" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="3" />}
      </g>
    </g>
  );
}

export default function AuscultationMinigame({ open, kind, mode, pat, aspirated, sex, interrupted, onResolve }) {
  const [view, setView] = useState("front");
  const [hover, setHover] = useState(null);      // chestpiece floating above the chest (mouse)
  const [placed, setPlaced] = useState(null);    // chestpiece on the skin: { x, y }
  const [hear, setHear] = useState("");
  const [think, setThink] = useState("");
  const [err, setErr] = useState(null);
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const playerRef = useRef(null);
  const lastKey = useRef("");

  // Live physiology: read every render so the sound follows the patient.
  let v; try { v = pat?.vitals?.(); } catch { v = undefined; }
  const lungs = mode === "lungs";
  const spec = open && kind === "auscultate" && placed && v ? chestSpec(pat, v, view, placed.x, placed.y, { aspirated }) : null;
  const layers = spec ? spec.layers : [];
  const level = layers.reduce((m, l) => Math.max(m, l.gain), 0);
  // Re-sync the sound when the position, the physiology, or a rate/rhythm changes.
  const key = JSON.stringify(layers.map((l) => [l.key, l.rate, l.pattern?.kind, l.pattern?.every, l.shape?.insp, l.shape?.exp, l.lowpass, Math.round(l.gain * 40)]));

  useEffect(() => {
    if (!open || kind !== "auscultate") return;
    if (key === lastKey.current) return;
    lastKey.current = key;
    if (!layers.length && !playerRef.current) return;
    if (!playerRef.current) playerRef.current = new AuscultationPlayer();
    playerRef.current.setMix(layers).catch((e) => setErr(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, open, kind]);
  // Release the audio device when the exam closes.
  useEffect(() => () => { if (playerRef.current) { playerRef.current.close(); playerRef.current = null; } }, []);
  // Escape lifts the stethoscope.
  useEffect(() => {
    if (!open || kind !== "auscultate") return undefined;
    const on = (e) => { if (e.key === "Escape") setPlaced(null); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, kind]);

  if (!open || kind !== "auscultate") return null;

  const toBody = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: Math.max(0, Math.min(VW, ((e.clientX - r.left) / r.width) * VW)), y: Math.max(0, Math.min(VH, ((e.clientY - r.top) / r.height) * VH)) };
  };
  const down = (e) => {
    e.preventDefault();
    try { svgRef.current.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    dragging.current = true;
    setPlaced(toBody(e));
    setHover(null);
  };
  const move = (e) => {
    const p = toBody(e);
    if (dragging.current) setPlaced(p);
    else if (e.pointerType !== "touch") setHover(p);
  };
  const up = () => { dragging.current = false; };
  const leave = () => { if (!dragging.current) setHover(null); };

  const finish = () => {
    const h = hear.trim(), t = think.trim();
    onResolve(PROCEDURE_OUTCOME.SUCCESS, h || t ? { hear: h, think: t, what: lungs ? "Lungs" : "Heart" } : null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "12px 0" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 18, width: "min(520px,94vw)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 14, color: C.amber }}>{lungs ? "Listen to the lungs" : "Listen to the heart"}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["front", "Front"], ["back", "Back"]].map(([k, t]) => (
              <button key={k} onClick={() => { setView(k); setPlaced(null); setHover(null); }}
                style={{ background: view === k ? "#1B2A20" : "#10151A", border: `1px solid ${view === k ? C.hr : C.line}`, color: view === k ? C.hr : C.dim, borderRadius: 6, padding: "4px 10px", fontSize: 11.5, cursor: "pointer" }}>{t}</button>))}
          </div>
        </div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 6 }}>
          Move over the chest, click to place the stethoscope, and hold and drag to slide it. Press Escape to lift it.
        </div>
        <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Bare torso, ${view} view`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave}
          style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto", background: "#0E1418", borderRadius: 8, touchAction: "none", cursor: "none", userSelect: "none" }}>
          <ChestBody view={view} sex={sex}>
            {hover && !placed && <Chestpiece x={hover.x} y={hover.y} placed={false} />}
            {hover && placed && <Chestpiece x={hover.x} y={hover.y} placed={false} />}
            {placed && <Chestpiece x={placed.x} y={placed.y} placed />}
          </ChestBody>
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0", fontFamily: MONO, fontSize: 11, color: C.dim }}>
          <span>{placed ? "Listening" : "Stethoscope lifted"}</span>
          <div style={{ flex: 1, height: 6, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${Math.round(level * 100)}%`, height: "100%", background: C.hr, transition: "width 120ms" }} />
          </div>
          {placed && <button onClick={() => setPlaced(null)} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 11, textDecoration: "underline" }}>Lift</button>}
        </div>
        {err && <div style={{ color: C.red, fontSize: 11.5, marginBottom: 6 }}>{err}</div>}

        <div style={{ fontSize: 12, color: C.faint, marginBottom: 3 }}>What do you hear?</div>
        <textarea value={hear} onChange={(e) => setHear(e.target.value)} rows={2} placeholder="e.g. clear on the right, quiet at the left base" style={{ ...box, resize: "vertical", marginBottom: 8 }} />
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 3 }}>What do you think it is?</div>
        <input value={think} onChange={(e) => setThink(e.target.value)} placeholder="e.g. a pneumothorax on the left" style={{ ...box, marginBottom: 10 }} />
        <button onClick={finish} style={btn("#122A18", C.hr, C.hr)}>{hear.trim() || think.trim() ? "Tell the crew" : "Finish listening"}</button>
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <button onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          {interrupted && <button onClick={() => onResolve(PROCEDURE_OUTCOME.ABORTED)} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon and attend to the patient</button>}
        </div>
      </div>
    </div>
  );
}
