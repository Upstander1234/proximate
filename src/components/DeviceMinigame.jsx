import { useState } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Applying a monitoring device, one short procedure per device: pulse oximeter
// (pick a good finger, seat the sensor), ECG leads (each electrode on the right
// limb), defib pads (position and skin prep), capnography (connect, cannula,
// zero), BP cuff (right size, on the artery), arterial line (level and zero).
// SUCCESS re-enters start() with _skipMinigame, so the real "attach" logic in
// deviceActs() (the live monitor readings) is unchanged.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);
const sel = { background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "6px 8px", fontSize: 12, width: "100%" };
const Gap = () => <div style={{ height: 8 }} />;
const Line = ({ children }) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{children}</div>;

const FINGERS = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const ELECTRODES = [["RA", "Right arm (white)"], ["LA", "Left arm (black)"], ["RL", "Right leg (green)"], ["LL", "Left leg (red)"]];
const PLACES = [["", "Place on..."], ["RA", "Right shoulder / arm"], ["LA", "Left shoulder / arm"], ["RL", "Right lower torso / leg"], ["LL", "Left lower torso / leg"]];
const PAD_SPOTS = [["", "Choose a spot..."], ["rightUpper", "Right upper chest, below the collarbone"], ["leftApex", "Left lower chest, mid-axillary line"],
  ["leftPrecordium", "Left chest, over the heart"], ["leftBack", "Left mid-back, behind the heart"], ["sternum", "Center of the sternum"], ["abdomen", "Right abdomen"]];

export default function DeviceMinigame({ open, kind, deviceId, deviceName, pat, assist, interrupted, onResolve }) {
  const [step, setStep] = useState(0);
  const [flash, setFlash] = useState(null);
  // pulse ox
  const [polish] = useState(() => 1 + Math.floor(Math.random() * 4));
  const [finger, setFinger] = useState(null);
  const [align, setAlign] = useState(20);
  // leads
  const [prepped, setPrepped] = useState(false);
  const [place, setPlace] = useState({ RA: "", LA: "", RL: "", LL: "" });
  // pads
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [dry, setDry] = useState(false);
  const [peeled, setPeeled] = useState(false);
  // capno / art line
  const [kinked] = useState(() => Math.random() < 0.3);
  const [fixedKink, setFixedKink] = useState(false);
  const [connected, setConnected] = useState(false);
  const [zeroed, setZeroed] = useState(false);
  const [level, setLevel] = useState(20);
  // bp cuff
  const [size, setSize] = useState("");
  const [artery, setArtery] = useState(15);

  if (!open || kind !== "device") return null;
  const tol = assistToleranceMult(assist);
  const wt = pat?.ageProfile?.weight ?? 75;
  const rightCuff = wt < 40 ? "child" : wt > 100 ? "large" : "adult";
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why) => setFlash({ ok: true, why });

  const body = () => {
    switch (deviceId) {
      case "pulseox": {
        if (step === 0) return (<><Line>1. Pick a finger. Avoid nail polish and a thumb (poor signal). One nail is painted.</Line>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 8 }}>
            {FINGERS.map((f, i) => (
              <button key={f} onClick={() => setFinger(i)} style={{ padding: "8px 2px", fontSize: 11, borderRadius: 6, cursor: "pointer",
                background: finger === i ? "#1B2A20" : "#10151A", border: `1px solid ${finger === i ? C.hr : C.line}`, color: C.text }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, margin: "0 auto 4px", background: i === polish ? "#D2557E" : "#E4C4B0" }} />{f}</button>))}
          </div>
          <button style={GO} disabled={finger == null} onClick={() => (finger === polish ? fail("Nail polish blocks the light and the signal is unreliable. Use a clean nail.")
            : finger === 0 ? fail("The thumb gives a poor waveform. Use the index, middle or ring finger.") : setStep(1))}>Clip on this finger</button></>);
        return (<><Line>2. Seat the sensor over the nail bed: {align}%. (aim for about 60)</Line>
          <input type="range" min={0} max={100} value={align} onChange={(e) => setAlign(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
          <button style={GO} onClick={() => (Math.abs(align - 60) > 18 * tol ? fail("The emitter and detector aren't lined up. No usable signal, reseat it.") : win("Good pleth waveform."))}>Check the signal</button></>);
      }
      case "leads": {
        if (step === 0) return (<><Line>1. Prep the skin: dry it, clip or shave hair, and rub lightly so the electrodes stick.</Line>
          <button style={prepped ? NEUTRAL : GO} onClick={() => setPrepped(true)}>{prepped ? "Skin prepped" : "Prep the skin"}</button><Gap />
          <button style={GO} onClick={() => setStep(1)}>Continue</button></>);
        return (<><Line>2. Place each electrode on its own limb: white right, black left, green right leg, red left leg.</Line>
          {ELECTRODES.map(([k, l]) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ width: 130, fontSize: 12, color: C.text }}>{l}</span>
              <select value={place[k]} onChange={(e) => setPlace({ ...place, [k]: e.target.value })} style={sel}>
                {PLACES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
            </div>))}
          <button style={GO} onClick={() => {
            if (ELECTRODES.some(([k]) => !place[k])) return fail("An electrode is still unplaced.");
            const bad = ELECTRODES.filter(([k]) => place[k] !== k).map(([k]) => k);
            if (bad.length) return fail(`Leads misplaced (${bad.join(", ")}). Reversed limb leads invert the tracing and can mimic a rhythm change. Redo it.`);
            if (!prepped) return fail("The skin wasn't prepped. The electrodes won't hold and the trace will be noisy.");
            return win("All four leads placed correctly.");
          }}>Connect and check the trace</button></>);
      }
      case "pads": {
        if (step === 0) return (<><Line>1. Prep: dry the chest, remove any medication patch and shave heavy hair, then peel the backing.</Line>
          <button style={dry ? NEUTRAL : GO} onClick={() => setDry(true)}>{dry ? "Chest dry and clear" : "Dry and clear the chest"}</button><Gap />
          <button style={peeled ? NEUTRAL : GO} onClick={() => setPeeled(true)}>{peeled ? "Backing peeled" : "Peel the backing"}</button><Gap />
          <button style={GO} onClick={() => setStep(1)}>Continue</button></>);
        return (<><Line>2. Place the two pads: right upper chest with left lateral, or front with back.</Line>
          <select value={p1} onChange={(e) => setP1(e.target.value)} style={sel}>{PAD_SPOTS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select><Gap />
          <select value={p2} onChange={(e) => setP2(e.target.value)} style={sel}>{PAD_SPOTS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select><Gap />
          <button style={GO} onClick={() => {
            const set = [p1, p2].sort().join("+");
            if (!p1 || !p2) return fail("Both pads need a position.");
            if (!dry) return fail("The chest was wet. Pads won't stick and you risk arcing.");
            if (!peeled) return fail("You never peeled the backing. There is no contact.");
            const ok = set === ["rightUpper", "leftApex"].sort().join("+") || set === ["leftPrecordium", "leftBack"].sort().join("+");
            return ok ? win("Pads seated with good contact.") : fail("Those positions don't put the heart between the pads. Reposition them.");
          }}>Press them down</button></>);
      }
      case "capno": {
        if (step === 0) return (<><Line>1. Connect the sampling line to the monitor's capnography port.</Line>
          <button style={GO} onClick={() => { setConnected(true); setStep(1); }}>Connect the line</button></>);
        if (step === 1) return (<><Line>2. Check the tubing. {kinked ? "It has a kink in it." : "It runs straight."}</Line>
          <button style={kinked && !fixedKink ? GO : NEUTRAL} onClick={() => setFixedKink(true)}>{kinked ? (fixedKink ? "Straightened" : "Straighten the kink") : "Line is fine"}</button><Gap />
          <button style={GO} onClick={() => (kinked && !fixedKink ? fail("The kinked line blocks sampling. You get a flat trace.") : setStep(2))}>Continue</button></>);
        return (<><Line>3. Place the cannula with the prongs curving into the nostrils, then let the sensor warm up and zero.</Line>
          <button style={GO} onClick={() => (!connected ? fail("The line isn't connected.") : win("Waveform is coming up."))}>Place the cannula and zero</button></>);
      }
      case "bpcuff": {
        if (step === 0) return (<><Line>1. Pick a cuff size from the arm. Bladder should cover about 80% of the arm's circumference.</Line>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
            {["child", "adult", "large"].map((s) => (
              <button key={s} onClick={() => setSize(s)} style={{ padding: "8px", fontSize: 12, borderRadius: 6, cursor: "pointer",
                background: size === s ? "#1B2A20" : "#10151A", border: `1px solid ${size === s ? C.hr : C.line}`, color: C.text }}>{s}</button>))}</div>
          <button style={GO} disabled={!size} onClick={() => (size !== rightCuff ? fail(`Wrong cuff. This patient needs a ${rightCuff} cuff. A cuff that is too ${size === "child" || (size === "adult" && rightCuff === "large") ? "small reads falsely high" : "large reads falsely low"}.`) : setStep(1))}>Wrap this cuff</button></>);
        return (<><Line>2. Line the artery mark up over the brachial artery: {artery}%. (aim for about 50)</Line>
          <input type="range" min={0} max={100} value={artery} onChange={(e) => setArtery(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
          <button style={GO} onClick={() => (Math.abs(artery - 50) > 20 * tol ? fail("The artery mark is off the artery. You'll get a poor or no reading.") : win("Cuff is snug and on the artery."))}>Secure it</button></>);
      }
      case "artline": {
        if (step === 0) return (<><Line>1. Prime the transducer line and flush out all the air.</Line>
          <button style={GO} onClick={() => setStep(1)}>Prime and flush</button></>);
        if (step === 1) return (<><Line>2. Level the transducer at the phlebostatic axis (4th intercostal space, midaxillary): {level}%. (aim for about 50)</Line>
          <input type="range" min={0} max={100} value={level} onChange={(e) => setLevel(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
          <button style={GO} onClick={() => setStep(2)}>Set level</button></>);
        return (<><Line>3. Zero to atmosphere, then open the stopcock to the patient.</Line>
          <button style={zeroed ? NEUTRAL : GO} onClick={() => setZeroed(true)}>{zeroed ? "Zeroed" : "Zero the transducer"}</button><Gap />
          <button style={GO} onClick={() => (!zeroed ? fail("You opened to the patient without zeroing. Every reading is offset.")
            : Math.abs(level - 50) > 15 * tol ? fail("The transducer is off level, so pressures read falsely high or low. Re-level it.") : win("Clean arterial waveform with a sharp upstroke."))}>Open to the patient</button></>);
      }
      default: return (<><Line>Apply the device.</Line><button style={GO} onClick={() => win("Applied.")}>Apply</button></>);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>{deviceName}</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && body()}
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
