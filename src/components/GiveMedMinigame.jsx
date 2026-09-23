import { useState, useEffect, useRef } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Giving a medication, shaped by ROUTE. App.jsx's start() opens this for any
// drug action and passes `mode` (from the drug's route) and `access` ("IV" or
// "IO" for line drugs):
//   line  IV/IO: scrub the hub, attach the syringe, confirm patency (blood
//         flash / marrow), push at a controlled rate, then flush.
//   im    pinch the muscle, needle at ~90 degrees, inject slowly, release.
//   in    seat the atomizer snug in a nostril, push half per nostril.
//   oral  PO/SL/ODT: check they are awake enough to take it, then place it.
//   neb   NEB/INH: attach the mask and set the flow.
// SUCCESS re-enters start() with _skipMinigame, so the dose, contraindication
// hold and max-dose logic stay exactly where they were.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);

// A drawn scene keyed to the current route, reflecting the state the player
// is actually manipulating (scrub, patency, pinch depth, needle angle,
// nostril side, flow rate) rather than a static diagram — so the same
// picture that was drawn up in DrawUpMinigame reappears here going in.
function Scene({ mode, access, scrubbed, patent, pinch, angle, nostril, flow, step }) {
  if (mode === "line") {
    const armY = 60;
    return (
      <svg viewBox="0 0 240 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <rect x={10} y={armY - 16} width={220} height={32} rx={14} fill="#D9A98A" opacity={0.85} />
        {scrubbed && <ellipse cx={access === "IO" ? 60 : 120} cy={armY} rx={16} ry={10} fill="#8FD0E8" opacity={0.35} />}
        {access === "IO" ? (
          <g>
            <rect x={48} y={armY - 6} width={24} height={12} rx={2} fill="#B9C4C9" />
            <rect x={58} y={armY - 4} width={16} height={8} fill="#7A8890" />
          </g>
        ) : (
          <g>
            <rect x={108} y={armY - 5} width={24} height={10} rx={2} fill="#C8D3D9" />
            <line x1={132} y1={armY} x2={150} y2={armY} stroke="#8FA0A8" strokeWidth={3} />
          </g>
        )}
        {patent && <circle cx={access === "IO" ? 60 : 120} cy={armY} r={3} fill="#8A1F2A" opacity={0.7} />}
        {step >= 2 && (
          <g>
            <rect x={150} y={armY - 9} width={64} height={18} rx={4} fill="#0E1518" stroke={C.line} strokeWidth={1.2} />
            <rect x={152} y={armY - 7} width={30} height={14} rx={1} fill={C.hr} opacity={0.5} />
            <rect x={182} y={armY - 12} width={6} height={24} rx={1.5} fill="#C8D3D9" />
          </g>
        )}
      </svg>
    );
  }
  if (mode === "im") {
    const rad = (angle * Math.PI) / 180;
    const nx = 100 - Math.cos(rad) * 46, ny = 76 - Math.sin(rad) * 46;
    return (
      <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <ellipse cx={100} cy={84} rx={pinch ? 46 : 58} ry={pinch ? 20 : 14} fill="#D9A98A" opacity={0.85} />
        {pinch && <ellipse cx={100} cy={84} rx={30} ry={16} fill="#C89578" opacity={0.5} />}
        <line x1={nx} y1={ny} x2={100} y2={76} stroke="#B9C4C9" strokeWidth={2.5} />
        <circle cx={nx} cy={ny} r={2.4} fill="#8A9AA2" />
        <text x={100} y={16} textAnchor="middle" fontSize={9} fill={Math.abs(angle - 90) <= 15 ? C.hr : C.amber}>{angle}°</text>
      </svg>
    );
  }
  if (mode === "in") {
    return (
      <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <path d="M60,70 Q100,10 140,70 Q140,95 100,95 Q60,95 60,70 Z" fill="#D9A98A" opacity={0.85} />
        <ellipse cx={nostril === 0 ? 84 : 116} cy={68} rx={6} ry={8} fill="#7A5240" />
        <rect x={nostril === 0 ? 62 : 118} y={58} width={22} height={9} rx={4} fill="#C8D3D9" transform={`rotate(${nostril === 0 ? -20 : 20} ${nostril === 0 ? 73 : 129} 62)`} />
      </svg>
    );
  }
  if (mode === "oral") {
    return (
      <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <ellipse cx={100} cy={55} rx={55} ry={40} fill="#D9A98A" opacity={0.85} />
        <path d="M65,60 Q100,80 135,60 Q100,95 65,60 Z" fill="#7A3A3A" />
        <ellipse cx={100} cy={40} rx={5} ry={3.5} fill="#E8E8E0" />
      </svg>
    );
  }
  // neb: mask over the face with mist scaled to flow
  const mist = Math.max(0, Math.min(1, (flow - 2) / 12));
  return (
    <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
      <ellipse cx={100} cy={55} rx={55} ry={42} fill="#D9A98A" opacity={0.85} />
      <path d="M65,45 Q100,32 135,45 Q140,78 100,86 Q60,78 65,45 Z" fill="#BFD8E0" opacity={0.75} stroke={C.line} strokeWidth={1} />
      <circle cx={100} cy={40} r={7} fill="#0E1518" stroke={C.line} strokeWidth={1} />
      {mist > 0.1 && [0, 1, 2].map((i) => (
        <circle key={i} cx={90 + i * 10} cy={22 - i * 3} r={2 + mist * 2} fill="#BFE3F2" opacity={0.5 * mist} />
      ))}
    </svg>
  );
}

// Hold-to-push bar. Holding advances the plunger at `speed`. By default a
// push faster than `maxSpeed` counts as too fast (`onDone(violated)` when it
// completes) — the real teaching point for nearly every IV push drug (push
// too fast, risk a reaction). `invert` flips that to a MINIMUM speed instead
// — adenosine's own real technique (GiveMedMinigame's own pushRate:"fast"
// check below): its plasma half-life is under 10 seconds, so a slow push
// never reaches the AV node, and the failure mode is pushing too SLOWLY.
function PushBar({ label, speed, maxSpeed, invert, onDone }) {
  const [p, setP] = useState(0);
  const bad = useRef(0);
  const timer = useRef(null);
  const doneRef = useRef(false);
  const violating = invert ? speed < maxSpeed : speed > maxSpeed;
  const stop = () => { clearInterval(timer.current); timer.current = null; };
  const start = () => {
    if (timer.current || doneRef.current) return;
    timer.current = setInterval(() => {
      setP((x) => {
        const n = Math.min(1, x + speed * 0.02);
        if (violating) bad.current += 1;
        if (n >= 1 && !doneRef.current) { doneRef.current = true; stop(); setTimeout(() => onDone(bad.current > 3), 0); }
        return n;
      });
    }, 100);
  };
  useEffect(() => stop, []);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>{label}</div>
      <div style={{ height: 10, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: violating ? C.red : C.hr }} />
      </div>
      <button onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} style={GO}>Hold to push</button>
    </div>
  );
}

export default function GiveMedMinigame({ open, kind, drugName, mode, access: accessProp, accessOptions, pushRate, warnings, pat, assist, interrupted, onResolve }) {
  const [step, setStep] = useState(0);
  const [scrubbed, setScrubbed] = useState(false);
  const [patent, setPatent] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [pinch, setPinch] = useState(false);
  const [angle, setAngle] = useState(45);
  const [nostril, setNostril] = useState(0);
  const [flow, setFlow] = useState(2);
  const [fast, setFast] = useState(false);
  const [flash, setFlash] = useState(null);
  const [ack, setAck] = useState(false);
  const [picked, setPicked] = useState(null);

  if (!open || kind !== "give") return null;

  // A limb can carry both an IV and an IO; the player chooses which one the
  // syringe goes on.
  const both = mode === "line" && accessOptions && accessOptions.length > 1;
  const access = picked || accessProp;
  const tol = assistToleranceMult(assist);
  const fastPush = pushRate === "fast";
  // A fast-push drug's threshold isn't a wider version of the slow-push
  // one — it's the opposite direction, so it gets its own real minimum
  // rather than reusing maxSpeed's own scale inverted.
  const maxSpeed = fastPush ? 8 / tol : 5 * tol;
  const awake = !pat?.consciousness || pat.consciousness === "awake";
  const title = { line: `Push ${drugName} via ${access}`, im: `Inject ${drugName} IM`, in: `${drugName} intranasal`, oral: `Give ${drugName}`, neb: `Set up ${drugName}` }[mode] || `Give ${drugName}`;
  const fail = (why) => setFlash({ ok: false, why });
  const win = (msg) => setFlash({ ok: true, why: msg });

  const stepView = () => {
    if (mode === "line") {
      const port = access === "IO" ? "IO hub (sternal)" : "IV hub";
      if (step === 0) return (<>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>1. Scrub the {port}, then attach the syringe.</div>
        <button style={scrubbed ? NEUTRAL : GO} onClick={() => setScrubbed(true)}>{scrubbed ? "Hub scrubbed" : "Scrub the hub"}</button>
        <div style={{ height: 8 }} />
        <button style={GO} onClick={() => setStep(1)}>Attach syringe to the {access}</button></>);
      if (step === 1) return (<>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>2. Confirm the line works before anything goes in.</div>
        <button style={patent ? NEUTRAL : GO} onClick={() => setPatent(true)}>{patent ? (access === "IO" ? "Marrow aspirated, flushes easily" : "Flash of blood, flushes clean") : (access === "IO" ? "Aspirate and flush 10 mL" : "Aspirate and flush 5 mL")}</button>
        <div style={{ height: 8 }} />
        <button style={GO} onClick={() => { if (!patent) return fail(`You pushed without confirming the ${access} was patent. It could be infiltrated.`); setStep(2); }}>Continue to push</button></>);
      if (step === 2) return (<>
        <div style={{ fontSize: 12, color: C.faint }}>
          3. Push rate: {speed}{fastPush ? (speed < maxSpeed ? " (too slow)" : "") : (speed > maxSpeed ? " (too fast)" : "")}
        </div>
        {fastPush && <div style={{ fontSize: 11, color: C.amber, marginBottom: 6 }}>Rapid IV push — this drug's half-life is under 10 seconds. A slow push never reaches the AV node.</div>}
        <input type="range" min={1} max={10} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
        <PushBar label={fastPush ? "Push it in fast, in 1 to 3 seconds." : "Steady pressure on the plunger."} speed={speed} maxSpeed={maxSpeed} invert={fastPush}
          onDone={(f) => { setFast(f); setStep(3); }} /></>);
      return (<>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>
          4. {fastPush ? "Flush hard and fast right behind it, before it clears the line." : "Flush the line so the drug reaches the patient."}
        </div>
        <button style={GO} onClick={() => (!scrubbed ? fail("The hub was never scrubbed. Contaminated line, redo it clean.")
          : fast ? fail(fastPush ? "You pushed too slowly. Adenosine's half-life is under 10 seconds — a slow push never reaches the AV node before it's metabolized. It won't work." : "You pushed too fast. Rapid push risks a reaction, slow it down.")
          : win(fastPush ? "Pushed fast and flushed hard right behind it — that's the only way this drug reaches the AV node intact." : "Pushed, flushed, and the line is still good."))}>Flush and finish</button></>);
    }
    if (mode === "im") {
      if (step === 0) return (<>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>1. Pinch a bunch of muscle at the site to give the needle something to enter.</div>
        <button style={pinch ? NEUTRAL : GO} onClick={() => setPinch(!pinch)}>{pinch ? "Muscle pinched (tap to release)" : "Pinch the muscle"}</button>
        <div style={{ height: 8 }} />
        <div style={{ fontSize: 12, color: C.faint }}>2. Needle angle: {angle} degrees (aim for 90)</div>
        <input type="range" min={20} max={110} value={angle} onChange={(e) => setAngle(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
        <button style={GO} onClick={() => (!pinch ? fail("You didn't pinch first. Poor grip on the muscle, redo it.")
          : Math.abs(angle - 90) > 15 * tol ? fail("The needle went in at the wrong angle. Aim square to the skin.") : setStep(1))}>Insert the needle</button></>);
      if (step === 1) return (<>
        <div style={{ fontSize: 12, color: C.faint }}>3. Inject rate: {speed}{speed > maxSpeed ? " (too fast)" : ""}</div>
        <input type="range" min={1} max={10} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
        <PushBar label="Inject steadily, no jerking." speed={speed} maxSpeed={maxSpeed} onDone={(f) => { setFast(f); setStep(2); }} /></>);
      return (<>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>4. Withdraw the needle, release the pinch and press the site.</div>
        <button style={GO} onClick={() => (fast ? fail("Injected too fast. It hurt and the site will bruise. Slower next time.") : win("Injected, needle out, site pressed."))}>Withdraw and release</button></>);
    }
    if (mode === "in") return (<>
      <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>Seat the atomizer snug in the {nostril === 0 ? "first" : "second"} nostril. Half the dose goes in each side.</div>
      <PushBar key={nostril} label={`Push half the dose (${nostril + 1} of 2)`} speed={3} maxSpeed={9}
        onDone={() => (nostril === 0 ? setNostril(1) : win("Both nostrils done, it's absorbing."))} /></>);
    if (mode === "oral") return (<>
      <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>They need to be awake enough to swallow it safely.</div>
      <button style={GO} onClick={() => (!awake ? fail("They can't protect their airway. Nothing by mouth for a patient who isn't awake.") : win("Placed and taken."))}>Give it by mouth or under the tongue</button></>);
    return (<>
      <div style={{ fontSize: 12, color: C.faint }}>Attach the mask, then set the oxygen flow: {flow} L/min (aim for 6 to 10)</div>
      <input type="range" min={0} max={15} value={flow} onChange={(e) => setFlow(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
      <button style={GO} onClick={() => (flow < 6 - 2 * tol || flow > 10 + 2 * tol ? fail("The flow was wrong, the mist wasn't aerosolizing properly. Reset it.") : win("Mist is flowing, patient is breathing it in."))}>Start the treatment</button></>);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>{title}</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!ack && warnings && warnings.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Warning</div>
              {warnings.map((w) => <div key={w} style={{ marginBottom: 4 }}>{w}</div>)}
            </div>
            <button style={btn("#2A1418", C.red, C.red)} onClick={() => setAck(true)}>Give it anyway</button>
            <div style={{ height: 8 }} />
            <button style={NEUTRAL} onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)}>Don't give it</button>
          </div>
        )}
        {(ack || !warnings || warnings.length === 0) && both && !picked && !flash && (
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>This limb has more than one line. Which one are you hooking up?</div>
            {accessOptions.map((t) => (
              <div key={t} style={{ marginBottom: 8 }}>
                <button style={GO} onClick={() => setPicked(t)}>{t === "IO" ? "IO (intraosseous)" : "IV (peripheral)"}</button>
              </div>
            ))}
          </div>
        )}
        {(ack || !warnings || warnings.length === 0) && (!both || picked) && !flash && (
          <>
            <Scene mode={mode} access={access} scrubbed={scrubbed} patent={patent} pinch={pinch} angle={angle} nostril={nostril} flow={flow} step={step} />
            {stepView()}
          </>
        )}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash.ok ? "#7CD68A" : C.red, marginBottom: 10 }}>{flash.why}</div>
            <button style={NEUTRAL} onClick={() => (flash.ok ? onResolve(PROCEDURE_OUTCOME.SUCCESS) : onResolve(PROCEDURE_OUTCOME.FAILED, flash.why))}>Continue</button>
          </div>
        )}
        {!flash && (ack || !warnings || warnings.length === 0) && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
            {interrupted && <button onClick={() => onResolve(PROCEDURE_OUTCOME.ABORTED)} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon and attend to the patient</button>}
          </div>
        )}
      </div>
    </div>
  );
}
