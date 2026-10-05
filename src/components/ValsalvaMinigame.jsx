import { useState, useRef, useEffect } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Valsalva maneuver technique. The effect on the AV node scales with how well the strain is done:
// real technique is a forced expiration against a closed glottis at about 40 mmHg for 15 seconds.
// Hold the button to build pressure, keep the needle in the green band, and keep it going for the
// full 15 s. Quality (0 to 1) is the fraction of those 15 s spent in the band. Afterward the
// modified maneuver (lay the patient flat and raise the legs for a minute) can be chosen, which
// raises the vagal response further (REVERT trial, Lancet 2015: 43 percent vs 17 percent conversion).
const STRAIN_S = 15, LO = 30, HI = 50, MAX_P = 70;
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);

export default function ValsalvaMinigame({ open, kind, pat, assist, interrupted, onResolve }) {
  const [phase, setPhase] = useState("strain");   // strain | done
  const [p, setP] = useState(0);                  // pressure, mmHg
  const [t, setT] = useState(0);                  // seconds strained
  const [good, setGood] = useState(0);            // seconds in the band
  const [holding, setHolding] = useState(false);
  const [leg, setLeg] = useState(false);
  const ref = useRef({ p: 0, t: 0, good: 0, holding: false });
  const tol = assistToleranceMult(assist);

  useEffect(() => {
    if (!open || kind !== "valsalva" || phase !== "strain") return undefined;
    const id = setInterval(() => {
      const r = ref.current, dt = 0.1;
      r.p = r.holding ? Math.min(MAX_P, r.p + 28 * dt) : Math.max(0, r.p - 40 * dt);
      if (r.holding) {
        r.t += dt;
        if (r.p >= LO / tol && r.p <= HI * tol) r.good += dt;
      }
      setP(r.p); setT(r.t); setGood(r.good);
      if (r.t >= STRAIN_S) setPhase("done");
    }, 100);
    return () => clearInterval(id);
  }, [open, kind, phase, tol]);

  if (!open || kind !== "valsalva") return null;
  const quality = Math.max(0, Math.min(1, good / STRAIN_S));
  const inBand = p >= LO && p <= HI;
  const hold = (v) => { ref.current.holding = v; setHolding(v); };
  const finishEarly = () => setPhase("done");

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Valsalva maneuver</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && phase === "strain" && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Stop now and attend to it, or abandon.
          </div>
        )}
        {phase === "strain" ? (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>
              Have the patient bear down hard, as if straining, and hold it. Hold the button to build pressure and keep the needle in the green band ({LO} to {HI} mmHg) for {STRAIN_S} seconds.
            </div>
            <div style={{ position: "relative", height: 16, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
              <div style={{ position: "absolute", left: `${(LO / MAX_P) * 100}%`, width: `${((HI - LO) / MAX_P) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />
              <div style={{ width: `${(p / MAX_P) * 100}%`, height: "100%", background: inBand ? C.hr : C.amber, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{p.toFixed(0)} mmHg · {t.toFixed(0)} / {STRAIN_S} s · in the band {good.toFixed(1)} s</div>
            <button style={holding ? NEUTRAL : GO} onPointerDown={() => hold(true)} onPointerUp={() => hold(false)} onPointerLeave={() => hold(false)}>Hold to strain</button>
            <div style={{ height: 8 }} />
            <button style={NEUTRAL} onClick={finishEarly}>Release and stop here</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: quality >= 0.7 ? "#7CD68A" : quality >= 0.35 ? C.amber : C.red, marginBottom: 10 }}>
              {quality >= 0.7 ? "A solid strain, held in the band." : quality >= 0.35 ? "A partial strain. Some of it was off target." : "A weak strain. It barely loaded the baroreceptors."} ({Math.round(quality * 100)} percent of the time in the band)
            </div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>
              Modified maneuver: right after the strain, lay the patient flat and raise the legs. It roughly doubles the chance of converting the rhythm.
            </div>
            <button style={leg ? GO : NEUTRAL} onClick={() => setLeg(!leg)}>{leg ? "Lay flat and raise the legs (selected)" : "Lay flat and raise the legs"}</button>
            <div style={{ height: 8 }} />
            <button style={GO} onClick={() => onResolve(PROCEDURE_OUTCOME.SUCCESS, { quality, legRaise: leg })}>Finish</button>
          </>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <button onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          {interrupted && <button onClick={() => onResolve(PROCEDURE_OUTCOME.ABORTED)} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon and attend to the patient</button>}
        </div>
      </div>
    </div>
  );
}
