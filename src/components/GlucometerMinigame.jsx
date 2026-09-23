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

// A drawn fingertip that tracks every step: an alcohol sheen while it's wet,
// a lancet mark once lanced, and a blood drop that grows live with `drop`
// (the same hold-to-squeeze fraction the meter reads) and a strip alongside
// it once one's inserted.
function Finger({ step, cleaned, dry, lanced, drop, squeezable, onSqueezeDown, onSqueezeUp, glu, ready }) {
  const wet = cleaned && !dry;
  const dropR = 2 + drop * 7;
  return (
    <svg viewBox="0 0 200 120" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10, touchAction: "none" }}
      onPointerUp={squeezable ? onSqueezeUp : undefined} onPointerLeave={squeezable ? onSqueezeUp : undefined}>
      <defs>
        <linearGradient id="glucFingerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B87A54" />
          <stop offset="50%" stopColor="#E3AE87" />
          <stop offset="100%" stopColor="#C9987A" />
        </linearGradient>
        <linearGradient id="glucMeterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#222E38" />
          <stop offset="100%" stopColor="#131A20" />
        </linearGradient>
      </defs>
      {/* meter body + strip slot */}
      <rect x={116} y={14} width={72} height={44} rx={5} fill="url(#glucMeterGrad)" stroke={C.line} strokeWidth={1.5} />
      <rect x={119} y={17} width={66} height={4} rx={2} fill="#FFFFFF" opacity={0.06} />
      <rect x={122} y={20} width={60} height={14} rx={2} fill="#0B0F12" />
      <text x={152} y={30} textAnchor="middle" fontSize={ready ? 10 : 7} fontWeight={ready ? 700 : 400} fill={ready ? C.hr : step >= 5 ? C.hr : C.faint} style={{ fontFamily: "ui-monospace,monospace" }}>
        {ready ? glu : step >= 5 ? "reading" : step >= 4 ? "sample" : "-- --"}</text>
      <rect x={130} y={38} width={16} height={16} rx={1.5} fill={step >= 1 ? "#E9EDE6" : "#1B242B"} stroke={C.line} strokeWidth={1} />
      {step >= 1 && <rect x={134} y={40} width={8} height={12} fill={step >= 4 ? "#8A1F2A" : "#D8DAD1"} opacity={step >= 4 ? 0.85 : 1} />}
      {/* fingertip */}
      <g transform="translate(20,20)" onPointerDown={squeezable ? onSqueezeDown : undefined}
        style={{ cursor: squeezable ? "pointer" : "default" }}>
        <path d="M40,90 L40,30 Q40,4 58,4 Q76,4 76,30 L76,90 Z" fill="url(#glucFingerGrad)" stroke="#8A5E45" strokeWidth={1.2} />
        {/* fingernail */}
        <path d="M48,14 Q58,6 68,14 L66,28 Q58,32 50,28 Z" fill="#F0DCC8" opacity={0.55} />
        <ellipse cx={58} cy={90} rx={18} ry={6} fill="#C89578" opacity={0.6} />
        {wet && <ellipse cx={58} cy={40} rx={14} ry={22} fill="#BFE3F2" opacity={0.35} />}
        {lanced && <line x1={58} y1={26} x2={58} y2={31} stroke="#7A1E1E" strokeWidth={1.6} />}
        {lanced && drop > 0 && (
          <circle cx={58} cy={31 + dropR * 0.4} r={dropR} fill="#8A1F2A" stroke="#5C1219" strokeWidth={0.6} />
        )}
        {squeezable && <circle cx={58} cy={50} r={22} fill="transparent" />}
      </g>
      {step === 2 && <line x1={98} y1={30} x2={112} y2={46} stroke="#B9C4C9" strokeWidth={2} />}
    </svg>
  );
}

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
  // The real glucose value, read the same way MinigameVitalsStrip already
  // does — shown directly on the drawn meter's own LCD once the read
  // finishes, instead of only appearing in a separate log line afterward.
  let meterGlu = null; try { const raw = pat?.vitals?.().glu; meterGlu = raw == null ? null : Math.round(raw); } catch { meterGlu = null; }
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
    if (step === 3) return (<>{line("4. Press and hold on the fingertip to squeeze a drop. Enough to fill the strip, not so hard you dilute it with tissue fluid.")}
      <div style={{ position: "relative", height: 14, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
        <div style={{ position: "absolute", left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />
        <div style={{ width: `${drop * 100}%`, height: "100%", background: drop >= lo && drop <= hi ? C.hr : C.amber, borderRadius: 4 }} />
      </div>
      <button style={NEUTRAL} onClick={() => (drop < lo ? fail("Not enough blood. The meter throws an error, start again with a fresh strip.")
        : drop > hi ? fail("You milked it too hard. Tissue fluid dilutes the drop and reads falsely low.") : setStep(4))}>Use this drop</button></>);
    if (step === 4) return (<>{line("5. Touch the edge of the strip to the drop. It wicks in.")}
      <button style={GO} onClick={() => setStep(5)}>Apply the drop to the strip</button></>);
    return (<>{line(wait >= 5 ? "Reading on the meter's own screen." : "Reading...")}
      {wait < 5 && <div style={{ fontSize: 22, textAlign: "center", color: C.text, margin: "6px 0 12px" }}>{5 - wait}</div>}
      <button style={wait >= 5 ? GO : NEUTRAL} disabled={wait < 5}
        onClick={() => setFlash({ ok: true, why: `${meterGlu} mg/dL. The meter beeps.` })}>Confirm the reading</button></>);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Check blood glucose</div>
        <MinigameVitalsStrip pat={pat} />
        {!flash && <Finger step={step} cleaned={cleaned} dry={dry} lanced={step >= 2} drop={step === 3 ? drop : step > 3 ? 0.55 : 0}
          squeezable={step === 3} onSqueezeDown={() => setHold(true)} onSqueezeUp={() => setHold(false)}
          glu={meterGlu} ready={step === 5 && wait >= 5} />}
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
