import { useState, useEffect } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Hanging a bag: fluids (saline, blood, plasma, Plasma-Lyte, D10) and drip
// pressors (norepinephrine, phenylephrine) don't go in through a syringe
// push the way GiveMedMinigame's other line drugs do — you spike the bag,
// prime the drip chamber and tubing so no air goes in, connect to the
// already-established line, then set a real rate: gravity drip counted in
// gtt/min for a fluid, or a real "start low, titrate up" infusion dial for
// a pressor. App.jsx opens this instead of GiveMedMinigame whenever
// DRUGS[id].pkModel==="fluid" or DRUGS[id].drip is set.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);
const Gap = () => <div style={{ height: 8 }} />;
const Line = ({ children }) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{children}</div>;
const Bar = ({ v, lo, hi }) => (
  <div style={{ position: "relative", height: 14, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
    {lo != null && <div style={{ position: "absolute", left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />}
    <div style={{ width: `${Math.min(1, v) * 100}%`, height: "100%", background: lo != null && v >= lo && v <= hi ? C.hr : C.amber, borderRadius: 4 }} />
  </div>
);
const Slider = ({ value, onChange, min = 0, max = 100, step = 1 }) => (
  <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
);

// The bag, drip chamber and tubing, filling in step with what's actually
// been done — an empty chamber (air still going down the line), a partly
// filled one once primed, drops falling at a rate that visually tracks the
// gtt/min the player actually sets. Real plastic/liquid sheen via gradients
// rather than flat fills, matching the shading treatment every other
// minigame's own equipment art (DrawUpMinigame's vial/syringe, DeviceMinigame's
// leads/pads) already uses.
function BagScene({ spiked, primed, rate, running, fluidMode, primable, onPrimeDown, onPrimeUp, priming }) {
  const chamberFill = Math.min(1, primed) * 20;
  const bagFluid = fluidMode ? "#BFD8E0" : "#D6B95D";
  const dropColor = fluidMode ? "#7CB3D6" : "#D6B95D";
  return (
    <svg viewBox="0 0 160 140" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10, touchAction: "none" }}
      onPointerUp={primable ? onPrimeUp : undefined} onPointerLeave={primable ? onPrimeUp : undefined}>
      <defs>
        <linearGradient id="hangBagGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bagFluid} stopOpacity={0.95} />
          <stop offset="100%" stopColor={bagFluid} stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id="hangPlasticGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.18} />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.12} />
        </linearGradient>
      </defs>
      {/* the bag, a real hanging outline with corner ports, not a flat rect */}
      <path d="M42,4 L118,4 Q122,4 122,10 L122,44 Q122,50 116,50 L44,50 Q38,50 38,44 L38,10 Q38,4 42,4 Z"
        fill={spiked ? "url(#hangBagGrad)" : "#2A3138"} opacity={spiked ? 0.92 : 0.55} stroke={C.line} strokeWidth={1} />
      <path d="M42,4 L118,4 Q122,4 122,10 L122,44 Q122,50 116,50 L44,50 Q38,50 38,44 L38,10 Q38,4 42,4 Z" fill="url(#hangPlasticGrad)" />
      <text x={80} y={30} textAnchor="middle" fontSize={8} fill="#0B0F12" fontWeight={700} opacity={spiked ? 0.75 : 0.4}>
        {fluidMode ? "IV FLUID" : "INFUSION"}</text>
      {spiked && <line x1={80} y1={50} x2={80} y2={62} stroke="#8A9AA2" strokeWidth={3} />}
      {/* drip chamber, with a real meniscus rather than a flat-topped fill —
          squeezed directly, not via a separate button */}
      <g onPointerDown={primable ? onPrimeDown : undefined} style={{ cursor: primable ? (priming ? "grabbing" : "grab") : "default" }}>
        <rect x={66} y={60} width={28} height={34} fill="transparent" />
        <rect x={68} y={priming ? 64 : 62} width={24} height={priming ? 26 : 30} rx={3}
          fill="#0E1518" stroke={priming ? C.amber : C.line} strokeWidth={1} />
      </g>
      {primed > 0 && (
        <>
          <rect x={70} y={62 + (30 - chamberFill)} width={20} height={chamberFill} fill={bagFluid} opacity={0.65} />
          <ellipse cx={80} cy={62 + (30 - chamberFill)} rx={10} ry={1.6} fill="#FFFFFF" opacity={0.25} />
        </>
      )}
      {running && <circle cx={80} cy={70} r={2} fill={dropColor} opacity={0.85}>
        <animate attributeName="cy" values="66;90" dur={`${Math.max(0.15, 2 - rate / 60)}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0" dur={`${Math.max(0.15, 2 - rate / 60)}s`} repeatCount="indefinite" />
      </circle>}
      {/* tubing down to the hub, with a highlight down its length */}
      <line x1={80} y1={92} x2={80} y2={130} stroke={primed >= 0.6 ? "#8FA0A8" : "#3A4A54"} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={78.5} y1={92} x2={78.5} y2={130} stroke="#FFFFFF" strokeWidth={0.8} opacity={0.3} />
      <circle cx={80} cy={132} r={4.5} fill="#8A1F2A" opacity={running ? 0.75 : 0.3} stroke="#5C1219" strokeWidth={1} />
    </svg>
  );
}

export default function HangMinigame({ open, kind, drugName, fluidMode, access: accessProp, accessOptions, warnings, pat, assist, interrupted, onResolve }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [spiked, setSpiked] = useState(false);
  const [priming, setPriming] = useState(false);
  const [primed, setPrimed] = useState(0);
  const [scrubbed, setScrubbed] = useState(false);
  const [patent, setPatent] = useState(false);
  const [rate, setRate] = useState(0);
  const [flash, setFlash] = useState(null);
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (!priming) return undefined;
    const id = setInterval(() => setPrimed((p) => Math.min(1, p + 0.04)), 80);
    return () => clearInterval(id);
  }, [priming]);

  if (!open || kind !== "hang") return null;

  const both = accessOptions && accessOptions.length > 1;
  const access = picked || accessProp;
  const tol = assistToleranceMult(assist);
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why) => setFlash({ ok: true, why });

  let v; try { v = pat?.vitals ? pat.vitals() : null; } catch { v = null; }
  const shock = (v?.sbp ?? 120) < 90;

  // A real bag volume, parsed from the drug's own declared name (e.g.
  // "Normal Saline 500 mL") rather than a second, separately-maintained
  // number that could drift from it.
  const volMatch = /(\d+)\s*mL/.exec(drugName || "");
  const volumeML = volMatch ? Number(volMatch[1]) : 500;
  const DROP_FACTOR = 10; // gtt/mL, a standard macrodrip EMS administration set
  const targetMinutes = shock ? 10 : 30; // wide open for shock, controlled otherwise
  const targetGtt = Math.round((volumeML * DROP_FACTOR) / targetMinutes);
  const gttTol = Math.max(6, targetGtt * 0.22) * tol;

  // A drip pressor's real teaching point is "start low, titrate up" — the
  // dial is a normalized 0-100 infusion-rate proxy (this engine doesn't
  // track weight-based mcg/kg/min anywhere else either), banded low.
  const pressorLo = 12 * tol, pressorHi = 35 + 10 * (tol - 1);

  const confirmRate = () => {
    if (fluidMode) {
      if (rate < targetGtt - gttTol) { fail(shock
        ? `Too slow. This patient is hypotensive — run this bag wide open, not a slow drip.`
        : `Too slow to matter at that rate — open it up a bit more.`); return; }
      if (rate > targetGtt + gttTol) { fail(shock
        ? `Faster than it needs to be, but not dangerous for a shocky patient — still, count the drops, don't just crack it wide and walk away.`
        : `Too fast for a stable patient. Running crystalloid in that hard risks fluid overload for no reason here.`); return; }
      win(`Roller clamp set, ${rate} gtt/min — ${shock ? "wide open for a hypotensive patient" : "a controlled rate for a stable one"}. Running.`);
      return;
    }
    if (rate < pressorLo) { fail("Too low to have any measurable pressor effect. Dial it up and reassess in a couple of minutes."); return; }
    if (rate > pressorHi) { fail("Started too aggressive right out of the gate. Start low and titrate up to the target MAP, don't jump straight there."); return; }
    win(`Infusion started low. Titrate up from here, watching for MAP ≥ 65 mmHg.`);
  };

  const finish = () => {
    if (flash.ok) { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, flash.why);
  };

  const body = () => {
    if (step === 0) return (<>
      <Line>1. {fluidMode ? "Spike the bag with the drip-chamber spike, keeping the bag upright so it doesn't overflow." : "Spike the premixed infusion bag the same way."}</Line>
      <button style={spiked ? NEUTRAL : GO} onClick={() => setSpiked(true)}>{spiked ? "Bag spiked" : "Spike the bag"}</button><Gap />
      <button style={GO} disabled={!spiked} onClick={() => setStep(1)}>Continue</button>
    </>);
    if (step === 1) return (<>
      <Line>2. Press and hold the drip chamber above to squeeze it about a third full, then run fluid down the tubing until every air bubble is out.</Line>
      <Bar v={primed} lo={0.6} hi={1} />
      <button style={NEUTRAL} onClick={() => (primed < 0.6 ? fail("You connected it half-primed. Air went down the line right along with the fluid.") : setStep(2))}>Continue to the hub</button>
    </>);
    if (step === 2) return (<>
      <Line>3. Scrub the hub, then confirm the line is patent before you open the line to it.</Line>
      <button style={scrubbed ? NEUTRAL : GO} onClick={() => setScrubbed(true)}>{scrubbed ? "Hub scrubbed" : "Scrub the hub"}</button><Gap />
      <button style={patent ? NEUTRAL : GO} onClick={() => setPatent(true)}>{patent ? (access === "IO" ? "Marrow aspirated, flushes easily" : "Flash of blood, flushes clean") : (access === "IO" ? "Aspirate and flush 10 mL" : "Aspirate and flush 5 mL")}</button><Gap />
      <button style={GO} onClick={() => {
        if (!scrubbed) return fail("The hub was never scrubbed. Contaminated connection.");
        if (!patent) return fail(`You connected without confirming the ${access} was patent. It could be infiltrated.`);
        setStep(3);
      }}>Spike into the {access} hub</button>
    </>);
    return (<>
      <Line>4. {fluidMode
        ? `Count the drops falling in the chamber and adjust the roller clamp: ${rate} gtt/min ${shock ? "(this patient is hypotensive — run it wide open)" : "(a controlled maintenance rate is right here)"}.`
        : `Set the starting infusion rate: ${rate}. Start low, then titrate up watching the monitor — this is not a dose you push all at once.`}</Line>
      <Slider value={rate} onChange={setRate} max={fluidMode ? 250 : 100} />
      <button style={GO} onClick={confirmRate}>{fluidMode ? "Open the roller clamp" : "Start the infusion"}</button>
    </>);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Hang {drugName}</div>
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
            <button style={btn("#2A1418", C.red, C.red)} onClick={() => setAck(true)}>Hang it anyway</button>
            <div style={{ height: 8 }} />
            <button style={NEUTRAL} onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)}>Don't hang it</button>
          </div>
        )}
        {(ack || !warnings || warnings.length === 0) && both && !picked && !flash && (
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>This limb has more than one line. Which one is this going on?</div>
            {accessOptions.map((t) => (
              <div key={t} style={{ marginBottom: 8 }}>
                <button style={GO} onClick={() => setPicked(t)}>{t === "IO" ? "IO (intraosseous)" : "IV (peripheral)"}</button>
              </div>
            ))}
          </div>
        )}
        {(ack || !warnings || warnings.length === 0) && (!both || picked) && !flash && (
          <>
            <BagScene spiked={spiked} primed={step >= 1 ? primed : 0} rate={rate} running={step === 3 && rate > 0} fluidMode={fluidMode}
              primable={step === 1} priming={priming} onPrimeDown={() => setPriming(true)} onPrimeUp={() => setPriming(false)} />
            {body()}
          </>
        )}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash.ok ? "#7CD68A" : C.red, marginBottom: 10 }}>{flash.why}</div>
            <button style={NEUTRAL} onClick={finish}>Continue</button>
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
