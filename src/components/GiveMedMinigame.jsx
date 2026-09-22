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

// Hold-to-push bar. Holding advances the plunger at `speed`; a push faster
// than `maxSpeed` counts as too fast (`onDone(tooFast)` when it completes).
function PushBar({ label, speed, maxSpeed, onDone }) {
  const [p, setP] = useState(0);
  const fast = useRef(0);
  const timer = useRef(null);
  const doneRef = useRef(false);
  const stop = () => { clearInterval(timer.current); timer.current = null; };
  const start = () => {
    if (timer.current || doneRef.current) return;
    timer.current = setInterval(() => {
      setP((x) => {
        const n = Math.min(1, x + speed * 0.02);
        if (speed > maxSpeed) fast.current += 1;
        if (n >= 1 && !doneRef.current) { doneRef.current = true; stop(); setTimeout(() => onDone(fast.current > 3), 0); }
        return n;
      });
    }, 100);
  };
  useEffect(() => stop, []);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>{label}</div>
      <div style={{ height: 10, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: speed > maxSpeed ? C.red : C.hr }} />
      </div>
      <button onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} style={GO}>Hold to push</button>
    </div>
  );
}

export default function GiveMedMinigame({ open, kind, drugName, mode, access: accessProp, accessOptions, warnings, pat, assist, interrupted, onResolve }) {
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
  const maxSpeed = 5 * tol;
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
        <div style={{ fontSize: 12, color: C.faint }}>3. Push rate: {speed}{speed > maxSpeed ? " (too fast)" : ""}</div>
        <input type="range" min={1} max={10} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
        <PushBar label="Steady pressure on the plunger." speed={speed} maxSpeed={maxSpeed}
          onDone={(f) => { setFast(f); setStep(3); }} /></>);
      return (<>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>4. Flush the line so the drug reaches the patient.</div>
        <button style={GO} onClick={() => (!scrubbed ? fail("The hub was never scrubbed. Contaminated line, redo it clean.")
          : fast ? fail("You pushed too fast. Rapid push risks a reaction, slow it down.") : win("Pushed, flushed, and the line is still good."))}>Flush and finish</button></>);
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
        {(ack || !warnings || warnings.length === 0) && (!both || picked) && !flash && stepView()}
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
