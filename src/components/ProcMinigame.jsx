import { useState, useEffect, useRef } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Hands-on procedures, one short sequence each:
//   tq          tourniquet: high on the limb, twist until the bleeding stops
//   needleD     needle decompression: landmark, over the top of the rib, depth
//   chestSeal   vented chest seal: dry, apply on the exhale
//   defib/aedShock  shock: clear the patient, oxygen away, then deliver
//   headTilt / jawThrust / cCollar / cspine   airway opening and spinal control
//   opa / npa / suction / o2nc / o2nrb        airway adjuncts and oxygen
// (BVM and CPR are continuous, live sessions: BvmMinigame / CprMinigame.)
// SUCCESS re-enters start() with _skipMinigame so each procedure's real effect
// (in procActs()) is unchanged; failure costs a retry delay like the others.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);
const DANGER = btn("#2A1418", C.red, C.red);
const sel = { background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "6px 8px", fontSize: 12, width: "100%" };
const Gap = () => <div style={{ height: 8 }} />;
const Line = ({ children }) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{children}</div>;
const Bar = ({ v, lo, hi }) => (
  <div style={{ position: "relative", height: 14, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
    {lo != null && <div style={{ position: "absolute", left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />}
    <div style={{ width: `${Math.min(1, v) * 100}%`, height: "100%", background: lo != null && v >= lo && v <= hi ? C.hr : C.amber, borderRadius: 4 }} />
  </div>
);
const Slider = ({ value, onChange, min = 0, max = 100 }) => (
  <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
);
const Choice = ({ value, onChange, placeholder, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={sel}>
    <option value="">{placeholder}</option>
    {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
  </select>
);

export default function ProcMinigame({ open, kind, procId, procName, pat, assist, suspectSpine, interrupted, onResolve }) {
  const [step, setStep] = useState(0);
  const [flash, setFlash] = useState(null);
  const tol = assistToleranceMult(assist);
  const awake = !pat?.consciousness || pat.consciousness === "awake";
  const skullRisk = (pat?.brainInjury ?? 0) > 0.5;
  // shared single-choice / slider state
  const [grip, setGrip] = useState("");
  const [ext, setExt] = useState(15);
  // tourniquet
  const [tqPos, setTqPos] = useState("");
  const [tight, setTight] = useState(0);
  const [twist, setTwist] = useState(false);
  const [timed, setTimed] = useState(false);
  // needle decompression
  const [site, setSite] = useState("");
  const [rib, setRib] = useState(20);
  const [depth, setDepth] = useState(0);
  // chest seal
  const [wiped, setWiped] = useState(false);
  const [phase, setPhase] = useState(0);
  // defib
  const [clear, setClear] = useState({ hands: false, o2: false, call: false });
  // airway / spine / oxygen
  const [headPos, setHeadPos] = useState(() => (Math.random() < 0.5 ? 15 : 85));
  const [neckIdx] = useState(() => Math.floor(Math.random() * 3));
  const [collarSize, setCollarSize] = useState("");
  const [snug, setSnug] = useState(20);
  const [held, setHeld] = useState(false);
  const [drift, setDrift] = useState(50);
  const [heldMs, setHeldMs] = useState(0);
  const driftRef = useRef(50);
  const bandRef = useRef(0);
  const [needIdx] = useState(() => Math.floor(Math.random() * 3));
  const [adjSize, setAdjSize] = useState("");
  const [lube, setLube] = useState(false);
  const [tankOpen, setTankOpen] = useState(false);
  const [bagFilled, setBagFilled] = useState(false);
  const [flow, setFlow] = useState(0);
  const [suctionOn, setSuctionOn] = useState(false);
  const [suctionT, setSuctionT] = useState(0);

  useEffect(() => {
    if (!(twist && procId === "tq")) return undefined;
    const id = setInterval(() => setTight((t) => Math.min(1, t + 0.03)), 80);
    return () => clearInterval(id);
  }, [twist, procId]);
  useEffect(() => {
    if (procId !== "chestSeal") return undefined;
    const id = setInterval(() => setPhase((p) => (p + 0.04) % 1), 100);
    return () => clearInterval(id);
  }, [procId]);
  // Manual C-spine: the head drifts and you nudge it back; scored over 12 s.
  useEffect(() => {
    if (!(held && procId === "cspine")) return undefined;
    const id = setInterval(() => {
      driftRef.current = Math.max(0, Math.min(100, driftRef.current + (Math.random() - 0.5) * 9));
      if (Math.abs(driftRef.current - 50) <= 18) bandRef.current += 1;
      setDrift(driftRef.current);
      setHeldMs((m) => m + 100);
    }, 100);
    return () => clearInterval(id);
  }, [held, procId]);
  const nudge = (dx) => { driftRef.current = Math.max(0, Math.min(100, driftRef.current + dx)); setDrift(driftRef.current); };
  // Suction: hold to suction, the bar is how long you've been on.
  useEffect(() => {
    if (!(suctionOn && procId === "suction")) return undefined;
    const id = setInterval(() => setSuctionT((t) => t + 0.1), 100);
    return () => clearInterval(id);
  }, [suctionOn, procId]);

  if (!open || kind !== "proc") return null;
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why) => setFlash({ ok: true, why });

  const body = () => {
    switch (procId) {
      case "tq": {
        if (step === 0) return (<><Line>1. Place the tourniquet 2 to 3 inches above the wound, on bare limb and never over a joint.</Line>
          <Choice value={tqPos} onChange={setTqPos} placeholder="Choose a position..." options={[["high", "2 to 3 inches above the wound, on the limb"], ["wound", "Directly on the wound"], ["joint", "Over the elbow or knee"], ["below", "Below the wound"]]} /><Gap />
          <button style={GO} disabled={!tqPos} onClick={() => (tqPos === "high" ? setStep(1) : fail({ wound: "Placing it on the wound crushes the injury and doesn't compress the artery.",
            joint: "A tourniquet over a joint can't occlude the artery against the bone.", below: "Below the wound it does nothing for the bleeding." }[tqPos]))}>Slide it into place</button></>);
        if (step === 1) return (<><Line>2. Hold to twist the windlass until the bleeding just stops. Too little leaves a venous tourniquet that bleeds more, too much is needless pain.</Line>
          <Bar v={tight} lo={0.55 - 0.1 * (tol - 1)} hi={0.85 + 0.1 * (tol - 1)} />
          <button style={GO} onPointerDown={() => setTwist(true)} onPointerUp={() => setTwist(false)} onPointerLeave={() => setTwist(false)}>Hold to twist</button><Gap />
          <button style={NEUTRAL} onClick={() => (tight < 0.55 - 0.1 * (tol - 1) ? fail("Not tight enough. It's venous only and the limb bleeds more. Tighten until the bleeding stops.")
            : tight > 0.9 + 0.1 * (tol - 1) ? fail("Far tighter than needed. Loosen and reset it, since over-tightening injures the limb.") : setStep(2))}>Lock the windlass</button></>);
        return (<><Line>3. Note the time it went on, since the clock matters at the hospital.</Line>
          <button style={timed ? NEUTRAL : GO} onClick={() => setTimed(true)}>{timed ? "Time written on it" : "Write the time on the tourniquet"}</button><Gap />
          <button style={GO} onClick={() => (timed ? win("Bleeding controlled and the time is marked.") : win("Bleeding controlled, but you never marked the time. Say it aloud at handoff."))}>Done</button></>);
      }
      case "needleD": {
        if (step === 0) return (<><Line>1. Find your landmark for the affected side.</Line>
          <Choice value={site} onChange={setSite} placeholder="Choose a site..." options={[["mcl2", "2nd intercostal space, midclavicular line"], ["aal5", "4th to 5th intercostal space, anterior axillary line"], ["low", "8th intercostal space, posterior"], ["abd", "Upper abdomen"]]} /><Gap />
          <button style={GO} disabled={!site} onClick={() => (site === "mcl2" || site === "aal5" ? setStep(1)
            : fail("That isn't a decompression site. Use the 2nd ICS midclavicular or the 4th to 5th ICS anterior axillary line."))}>Mark the site</button></>);
        if (step === 1) return (<><Line>2. Insert just over the TOP of the rib, since the nerve and vessels run under its lower border: needle at {rib}% (aim over the top, about 60).</Line>
          <Slider value={rib} onChange={setRib} />
          <button style={GO} onClick={() => (Math.abs(rib - 60) > 20 * tol ? fail("You caught the lower rib border and the neurovascular bundle. Redirect over the top of the rib.") : setStep(2))}>Position the needle</button></>);
        return (<><Line>3. Advance until you feel a pop and hear the air hiss out, then stop: depth {Math.round(depth * 100)}%.</Line>
          <Slider value={depth * 100} onChange={(v) => setDepth(v / 100)} />
          <button style={GO} onClick={() => (depth < 0.4 ? fail("Not through the pleura. There's no hiss, so go deeper.")
            : depth > 0.85 ? fail("Too deep. You risk the lung and mediastinum. Withdraw and redo.") : win("Pop, then a rush of air. The catheter is in and the needle is out."))}>Withdraw the needle, leave the catheter</button></>);
      }
      case "chestSeal": {
        if (step === 0) return (<><Line>1. Wipe blood and moisture off the skin so the seal will stick.</Line>
          <button style={wiped ? NEUTRAL : GO} onClick={() => setWiped(true)}>{wiped ? "Wound wiped dry" : "Wipe the skin"}</button><Gap />
          <button style={GO} onClick={() => setStep(1)}>Continue</button></>);
        const exhaling = phase > 0.5;
        return (<><Line>2. Apply the seal as the patient breathes OUT so you don't trap air.</Line>
          <div style={{ textAlign: "center", fontSize: 13, color: exhaling ? C.hr : C.amber, marginBottom: 8 }}>{exhaling ? "Breathing out" : "Breathing in"}</div>
          <Bar v={phase} lo={0.5} hi={1} /><Gap />
          <button style={GO} onClick={() => (!wiped ? fail("The skin was wet and the seal slides off. Wipe it dry first.")
            : !exhaling ? fail("You sealed it on the inhale and trapped air. Apply it as they breathe out.") : win("Sealed on the exhale, and the vent is working."))}>Apply the seal</button></>);
      }
      case "defib":
      case "aedShock":
        return (<><Line>Before you shock, make sure everyone is clear.</Line>
          {[["hands", "Hands off. Nobody touching the patient or the stretcher"], ["o2", "Oxygen moved away from the chest"], ["call", "Call it: \"I'm clear, you're clear, everybody clear\""]].map(([k, l]) => (
            <div key={k} style={{ marginBottom: 6 }}>
              <button style={clear[k] ? NEUTRAL : GO} onClick={() => setClear({ ...clear, [k]: true })}>{clear[k] ? `Done: ${l}` : l}</button>
            </div>))}
          <Gap />
          <button style={DANGER} onClick={() => (!(clear.hands && clear.o2 && clear.call) ? fail("You shocked before clearing everyone. That shock could have hurt a rescuer.") : win("Clear. Shock delivered."))}>Deliver the shock</button></>);
      case "headTilt": {
        if (step === 0) return (<><Line>1. One hand on the forehead, two fingers under the BONY part of the chin, never the soft tissue under the jaw.</Line>
          {suspectSpine && <div style={{ fontSize: 12, color: C.amber, marginBottom: 8 }}>Suspected spinal injury on this patient. A jaw thrust is the safer opener.</div>}
          <Choice value={grip} onChange={setGrip} placeholder="Choose your grip..." options={[["bony", "Fingers on the bony chin, palm on the forehead"], ["soft", "Fingers on the soft tissue under the jaw"], ["neck", "Hand behind the neck, lifting"]]} /><Gap />
          <button style={GO} disabled={!grip} onClick={() => (grip === "bony" ? setStep(1) : fail(grip === "soft" ? "Pressing the soft tissue under the jaw pushes the tongue back and closes the airway." : "Lifting the neck flexes it and worsens the obstruction."))}>Take the grip</button></>);
        return (<><Line>2. Tilt the head back and lift the chin until the airway lines up: extension {ext}% (aim for about 65).</Line>
          <Slider value={ext} onChange={setExt} />
          <button style={GO} onClick={() => (ext < 65 - 15 * tol ? fail("Not enough extension. The tongue still blocks the airway.")
            : ext > 65 + 20 * tol ? fail("Over-extended. That closes the airway and strains the neck.") : win(suspectSpine ? "Airway opened, but you tilted a patient with a possible spinal injury. Use a jaw thrust next time." : "Airway open, chin lifted."))}>Hold the position</button></>);
      }
      case "jawThrust": {
        if (step === 0) return (<><Line>1. Fingers behind the angle of the jaw on BOTH sides, thumbs on the cheekbones, without moving the neck.</Line>
          <Choice value={grip} onChange={setGrip} placeholder="Choose your grip..." options={[["angle", "Behind the angles of the jaw, both hands"], ["chin", "Under the chin, one hand"], ["neck", "Behind the neck"]]} /><Gap />
          <button style={GO} disabled={!grip} onClick={() => (grip === "angle" ? setStep(1) : fail("That isn't a jaw thrust. Both hands go behind the angles of the jaw."))}>Take the grip</button></>);
        return (<><Line>2. Keep the head in line: position {headPos}% (centre it at 50).</Line>
          <Slider value={headPos} onChange={setHeadPos} />
          <Line>Now thrust the jaw forward: {ext}% (aim for about 65).</Line>
          <Slider value={ext} onChange={setExt} />
          <button style={GO} onClick={() => (Math.abs(headPos - 50) > 15 * tol ? fail("The head drifted out of line. That's exactly what a jaw thrust is meant to avoid.")
            : Math.abs(ext - 65) > 18 * tol ? fail(ext < 65 ? "Not enough forward lift. The tongue still falls back." : "Too much force. Ease the jaw back.") : win("The jaw is forward with the head in line. Airway open."))}>Hold the thrust</button></>);
      }
      case "cCollar": {
        const sizes = ["short", "regular", "tall"], fingers = [2, 3, 4];
        if (step === 0) return (<><Line>1. Someone must hold manual in-line stabilization first. You can't collar a moving head.</Line>
          <button style={held ? NEUTRAL : GO} onClick={() => setHeld(true)}>{held ? "Head held in line" : "Have the head held in line"}</button><Gap />
          <button style={GO} onClick={() => (held ? setStep(1) : fail("You went for the collar without stabilizing the head. The neck moved."))}>Continue</button></>);
        if (step === 1) return (<><Line>2. Measure: {fingers[neckIdx]} fingers fit between the chin and the top of the shoulder. Pick the size.</Line>
          <Choice value={collarSize} onChange={setCollarSize} placeholder="Choose a size..." options={sizes.map((z) => [z, z])} /><Gap />
          <button style={GO} disabled={!collarSize} onClick={() => (collarSize === sizes[neckIdx] ? setStep(2)
            : fail(sizes.indexOf(collarSize) > neckIdx ? "Too big. It lets the chin drop and hyperextends the neck." : "Too small. It pushes the head into extension and can compress the airway."))}>Slide it into place</button></>);
        return (<><Line>3. Secure the strap snug, not tight: {snug}% (aim for about 55). Two fingers should still fit under.</Line>
          <Slider value={snug} onChange={setSnug} />
          <button style={GO} onClick={() => (snug < 55 - 18 * tol ? fail("Too loose, so the neck still moves inside it.")
            : snug > 55 + 18 * tol ? fail("Too tight. It compresses the neck veins and the airway.") : win("Collar sized, seated and snug. The head is still held until the board."))}>Secure it</button></>);
      }
      case "cspine": {
        const secs = Math.floor(heldMs / 1000);
        return (<><Line>Hold the head in neutral in-line alignment. It drifts, so nudge it back to the centre. Hold for 12 seconds.</Line>
          <div style={{ position: "relative", height: 24, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 6, marginBottom: 8 }}>
            <div style={{ position: "absolute", left: "32%", width: "36%", top: 0, bottom: 0, background: "#1B3A24" }} />
            <div style={{ position: "absolute", left: `${drift}%`, top: 3, width: 14, height: 18, marginLeft: -7, borderRadius: 7, background: Math.abs(drift - 50) <= 18 ? C.hr : C.red }} />
          </div>
          {!held ? <button style={GO} onClick={() => setHeld(true)}>Take the head</button> : (<>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button style={NEUTRAL} onClick={() => nudge(-8)}>Nudge left</button>
              <button style={NEUTRAL} onClick={() => nudge(8)}>Nudge right</button></div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{secs} of 12 seconds</div>
            <button style={GO} disabled={heldMs < 12000} onClick={() => (bandRef.current / Math.max(1, heldMs / 100) >= 0.75 ? win("You held neutral alignment steadily.")
              : fail("The head wandered out of line too often. That is unsafe movement of the spine."))}>Finish the hold</button></>)}</>);
      }
      case "opa":
      case "npa": {
        const sizes = ["small", "medium", "large"], isOpa = procId === "opa";
        if (step === 0) return (<><Line>1. Measure: {isOpa ? "corner of the mouth to the earlobe" : "tip of the nose to the earlobe"} matches a {sizes[needIdx]} airway.</Line>
          <Choice value={adjSize} onChange={setAdjSize} placeholder="Choose a size..." options={sizes.map((z) => [z, z])} /><Gap />
          <button style={GO} disabled={!adjSize} onClick={() => (adjSize === sizes[needIdx] ? setStep(1)
            : fail(sizes.indexOf(adjSize) > needIdx ? "Too long. It can push the epiglottis down and block the airway." : "Too short. It doesn't hold the tongue off the pharynx."))}>Use this size</button></>);
        if (isOpa) return (<><Line>2. Check the gag reflex. An OPA in a patient who gags triggers vomiting.</Line>
          <button style={GO} onClick={() => (awake ? fail("They gag on it. An awake patient with a gag reflex needs an NPA, not an OPA.") : win("Inserted, flange at the lips. No gag, and the tongue is held forward."))}>Insert with the tip up, rotate 180 degrees</button></>);
        if (step === 1) return (<><Line>2. Lubricate the tip so it slides in and doesn't tear the nasal lining.</Line>
          <button style={lube ? NEUTRAL : GO} onClick={() => setLube(true)}>{lube ? "Lubricated" : "Lubricate the airway"}</button><Gap />
          <button style={GO} onClick={() => (lube ? setStep(2) : fail("Dry insertion tears the nasal mucosa and causes a nosebleed."))}>Continue</button></>);
        return (<><Line>3. Insert straight back along the floor of the nose with the bevel toward the septum, not upward.</Line>
          {skullRisk && <div style={{ fontSize: 12, color: C.amber, marginBottom: 8 }}>Significant head injury. A basilar skull fracture makes a nasal airway risky here.</div>}
          <Choice value={grip} onChange={setGrip} placeholder="Choose a direction..." options={[["floor", "Straight back along the floor, bevel to the septum"], ["up", "Angled upward"]]} /><Gap />
          <button style={GO} disabled={!grip} onClick={() => (grip === "floor" ? win(skullRisk ? "Seated, but with this head injury you took a real risk with a nasal airway." : "Seated with the flange at the nostril.") : fail("Angling upward can tear the turbinates and cause bleeding."))}>Insert</button></>);
      }
      case "suction": {
        if (step === 0) return (<><Line>1. Measure the catheter from the corner of the mouth to the earlobe. Insert with suction OFF and stay in the mouth, no deeper than you can see.</Line>
          <button style={GO} onClick={() => setStep(1)}>Insert the tip with suction off</button></>);
        return (<><Line>2. Hold to suction as you withdraw. Keep each pass short, since every second you suction, the patient isn't getting oxygen.</Line>
          <Bar v={Math.min(1, suctionT / 5)} lo={0.25} hi={0.75} />
          <button style={GO} onPointerDown={() => setSuctionOn(true)} onPointerUp={() => setSuctionOn(false)} onPointerLeave={() => setSuctionOn(false)}>Hold to suction</button><Gap />
          <button style={NEUTRAL} onClick={() => (suctionT < 1.2 ? fail("Barely any suction. The airway isn't cleared.")
            : suctionT > 4 ? fail("Too long on suction. The patient went without oxygen. Keep passes short and reoxygenate.") : win("Cleared in a short pass."))}>Finish the pass</button></>);
      }
      case "o2nc":
      case "o2nrb": {
        const nrb = procId === "o2nrb", lo = nrb ? 10 : 2, hi = nrb ? 15 : 6;
        if (step === 0) return (<><Line>1. Open the cylinder valve and check the gauge.</Line>
          <button style={tankOpen ? NEUTRAL : GO} onClick={() => setTankOpen(true)}>{tankOpen ? "Cylinder open" : "Open the tank"}</button><Gap />
          <button style={GO} onClick={() => setStep(nrb ? 1 : 2)}>Continue</button></>);
        if (step === 1) return (<><Line>2. Pre-fill the reservoir bag with your thumb over the valve until it's inflated, so the patient can draw from it.</Line>
          <button style={bagFilled ? NEUTRAL : GO} onClick={() => setBagFilled(true)}>{bagFilled ? "Reservoir inflated" : "Fill the reservoir bag"}</button><Gap />
          <button style={GO} onClick={() => setStep(2)}>Continue</button></>);
        return (<><Line>{nrb ? "3" : "2"}. Set the flow: {flow} L/min (aim for {lo} to {hi}).</Line>
          <Slider value={flow} onChange={setFlow} max={15} />
          <button style={GO} onClick={() => (!tankOpen ? fail("The cylinder valve is closed. No oxygen is flowing.")
            : nrb && !bagFilled ? fail("The reservoir bag is empty, so the patient collapses it and gets far less oxygen. Pre-fill it.")
            : flow < lo ? fail(nrb ? "Too low. A non-rebreather needs 10 to 15 L/min or the bag collapses." : "Too little flow to matter. Turn it up.")
            : flow > hi ? fail(nrb ? "That's past the regulator's range." : "Above 6 L/min a nasal cannula dries and irritates the nose and adds nothing. Use a mask.") : win("Oxygen is flowing and the patient is breathing it."))}>Put it on the patient</button></>);
      }
      default: return (<button style={GO} onClick={() => win("Done.")}>Do it</button>);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>{procName}</div>
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
