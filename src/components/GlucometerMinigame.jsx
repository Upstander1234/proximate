import { useState, useEffect, useRef } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Fingerstick glucose: strip in, clean the site and let it dry, lance the side
// of the fingertip, squeeze a good drop (too little gives an error, too hard
// dilutes it with tissue fluid), apply it to the strip, wait for the reading.
// SUCCESS re-enters start() with _skipMinigame, so the real reading still comes
// from the existing "Blood glucose" action.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);

export default function GlucometerMinigame({ open, kind, pat, assist, interrupted, onResolve }) {
  const [step, setStep] = useState(0);
  const [cleaned, setCleaned] = useState(false);
  const [dry, setDry] = useState(false);
  const [drop, setDrop] = useState(0);
  const [hold, setHold] = useState(false);
  const [wait, setWait] = useState(0);
  const [flash, setFlash] = useState(null);
  const timer = useRef(null);

  // Squeeze meter: fills while held. Releasing locks in the drop size.
  useEffect(() => {
    if (!hold) return undefined;
    const id = setInterval(() => setDrop((d) => Math.min(1, d + 0.04)), 80);
    return () => clearInterval(id);
  }, [hold]);
  // Reading countdown.
  useEffect(() => {
    if (step !== 5) return undefined;
    timer.current = setInterval(() => setWait((w) => w + 1), 1000);
    return () => clearInterval(timer.current);
  }, [step]);

  if (!open || kind !== "gluc") return null;
  const tol = assistToleranceMult(assist);
  const lo = 0.4 - 0.1 * (tol - 1), hi = 0.8 + 0.1 * (tol - 1);
  const fail = (why) => setFlash({ ok: false, why });
  const line = (t) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{t}</div>;

  const view = () => {
    if (step === 0) return (<>{line("1. Insert a test strip into the meter and check the code and expiry.")}
      <button style={GO} onClick={() => setStep(1)}>Insert strip</button></>);
    if (step === 1) return (<>{line("2. Clean the side of a fingertip with an alcohol pad, then let it dry. Wet alcohol skews the reading.")}
      <button style={cleaned ? NEUTRAL : GO} onClick={() => setCleaned(true)}>{cleaned ? "Site cleaned" : "Wipe the fingertip"}</button>
      <div style={{ height: 8 }} />
      <button style={dry ? NEUTRAL : GO} onClick={() => setDry(true)} disabled={!cleaned}>{dry ? "Dry" : "Let it dry"}</button>
      <div style={{ height: 8 }} />
      <button style={GO} onClick={() => (!cleaned ? fail("You never cleaned the site. Residue on the finger, e.g. sugar, gives a false reading.")
        : !dry ? fail("You lanced through wet alcohol. It dilutes the sample and gives a false reading.") : setStep(2))}>Continue</button></>);
    if (step === 2) return (<>{line("3. Lance the side of the fingertip, not the pad. It hurts less and bleeds better.")}
      <button style={GO} onClick={() => setStep(3)}>Lance the side of the finger</button></>);
    if (step === 3) return (<>{line("4. Hold to squeeze a drop. Enough to fill the strip, not so hard you dilute it with tissue fluid.")}
      <div style={{ position: "relative", height: 14, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
        <div style={{ position: "absolute", left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />
        <div style={{ width: `${drop * 100}%`, height: "100%", background: drop >= lo && drop <= hi ? C.hr : C.amber, borderRadius: 4 }} />
      </div>
      <button style={GO} onPointerDown={() => setHold(true)} onPointerUp={() => setHold(false)} onPointerLeave={() => setHold(false)}>Hold to squeeze</button>
      <div style={{ height: 8 }} />
      <button style={NEUTRAL} onClick={() => (drop < lo ? fail("Not enough blood. The meter throws an error, start again with a fresh strip.")
        : drop > hi ? fail("You milked it too hard. Tissue fluid dilutes the drop and reads falsely low.") : setStep(4))}>Use this drop</button></>);
    if (step === 4) return (<>{line("5. Touch the edge of the strip to the drop. It wicks in.")}
      <button style={GO} onClick={() => setStep(5)}>Apply the drop to the strip</button></>);
    return (<>{line("Reading...")}
      <div style={{ fontSize: 22, textAlign: "center", color: C.text, margin: "6px 0 12px" }}>{wait >= 5 ? "Done" : `${5 - wait}`}</div>
      <button style={wait >= 5 ? GO : NEUTRAL} disabled={wait < 5} onClick={() => setFlash({ ok: true, why: "The meter beeps and shows a result." })}>Read the result</button></>);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Check blood glucose</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && view()}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash.ok ? "#7CD68A" : C.red, marginBottom: 10 }}>{flash.why}</div>
            <button style={NEUTRAL} onClick={() => (flash.ok ? onResolve(PROCEDURE_OUTCOME.SUCCESS) : onResolve(PROCEDURE_OUTCOME.FAILED, flash.why))}>Continue</button>
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
