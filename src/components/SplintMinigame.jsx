import { useState, useEffect } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Extremity splinting. Real content per limb (arm vs leg reads the correct
// pulse and joints, since "check the radial pulse" on a leg is just wrong)
// and per splint material — a rigid (cardboard) splint can't bend to the
// limb, so the limb has to be held steady while it goes on; a vacuum splint
// molds to whatever position the limb is already in, then a hand pump draws
// the air out to make it rigid. Same shared pre/post pulse-motor-sensation
// (PMS) check either way, since that's the one step every real splint job
// keeps regardless of the material — and it reads pat.limbDO2[site], the
// real per-limb perfusion signal (physiology queue item 74, Phase 2), not a
// scripted line, so a genuinely ischemic limb is genuinely reported as one.
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
const Slider = ({ value, onChange, min = 0, max = 100 }) => (
  <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
);

const LIMB_INFO = {
  armR: { name: "right forearm", limb: "arm", pulseName: "radial pulse", pulseSite: "the wrist", distalName: "fingers", jointAbove: "elbow", jointBelow: "wrist" },
  armL: { name: "left forearm", limb: "arm", pulseName: "radial pulse", pulseSite: "the wrist", distalName: "fingers", jointAbove: "elbow", jointBelow: "wrist" },
  legR: { name: "right lower leg", limb: "leg", pulseName: "pedal pulse", pulseSite: "the top of the foot", distalName: "toes", jointAbove: "knee", jointBelow: "ankle" },
  legL: { name: "left lower leg", limb: "leg", pulseName: "pedal pulse", pulseSite: "the top of the foot", distalName: "toes", jointAbove: "knee", jointBelow: "ankle" },
};

function pulseText(do2) {
  if (do2 == null) return { txt: "Strong and regular.", ok: true };
  if (do2 >= 0.75) return { txt: "Strong and regular.", ok: true };
  if (do2 >= 0.45) return { txt: "Present, but weak.", ok: true };
  if (do2 >= 0.15) return { txt: "Faint. Barely palpable.", ok: false };
  return { txt: "Absent. No pulse felt distal to the injury.", ok: false };
}

// A limb rendered as two segments meeting at the injury, angulated until a
// splint (of either material) is on. Cardboard shows as two flat rails
// strapped to the outside; vacuum shows as a bag that opacifies/stiffens as
// it's pumped down, and needs no separate padding step since it conforms.
function LimbScene({ limb, splintType, immobilizeVal, padded, strapped, snugBad, holdable, onHoldDown, onHoldUp, holding }) {
  const isArm = limb === "arm";
  const w = isArm ? 20 : 28;
  const x0 = 26, y = 52, midX = 104, endX = isArm ? 168 : 178;
  const splintOn = immobilizeVal >= 0.8;
  const kink = splintOn ? 0 : (isArm ? 10 : 8);
  const rigidity = Math.min(1, immobilizeVal);
  return (
    <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10, touchAction: "none",
        cursor: holdable ? (holding ? "grabbing" : "grab") : "default" }}
      onPointerDown={holdable ? onHoldDown : undefined} onPointerUp={holdable ? onHoldUp : undefined} onPointerLeave={holdable ? onHoldUp : undefined}>
      <defs>
        <linearGradient id="limbSkinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3AE87" />
          <stop offset="55%" stopColor="#D19972" />
          <stop offset="100%" stopColor="#B87A54" />
        </linearGradient>
      </defs>
      <rect x={x0} y={y - w / 2} width={midX - x0} height={w} rx={w / 2} fill="url(#limbSkinGrad)" />
      <rect x={midX} y={y - w / 2} width={endX - midX} height={w} rx={w / 2} fill="url(#limbSkinGrad)"
        transform={`rotate(${kink} ${midX} ${y})`} />
      {/* deformity swelling/bruising at the injury site, fading as it's stabilized */}
      <ellipse cx={midX} cy={y} rx={9 + (1 - rigidity) * 4} ry={w / 2 + 5} fill="#5C2A38"
        opacity={splintOn ? 0.12 : 0.4} />
      <ellipse cx={midX} cy={y} rx={5} ry={w / 2 + 2} fill="#7A1E1E" opacity={splintOn ? 0.15 : 0.45} />
      {padded && <circle cx={x0 + (midX - x0) * 0.85} cy={y} r={5} fill={C.amber} opacity={0.55} />}
      {padded && <circle cx={midX + (endX - midX) * 0.15} cy={y} r={5} fill={C.amber} opacity={0.55} />}
      {splintType === "cardboard" && immobilizeVal > 0.05 && (
        <g opacity={rigidity}>
          <rect x={x0 - 4} y={y - w / 2 - 7} width={endX - x0 + 8} height={5} rx={2} fill="#C9B896" />
          <rect x={x0 - 4} y={y + w / 2 + 2} width={endX - x0 + 8} height={5} rx={2} fill="#C9B896" />
        </g>
      )}
      {splintType === "vacuum" && immobilizeVal > 0.05 && (
        <rect x={x0 - 8} y={y - w / 2 - 10} width={endX - x0 + 16} height={w + 20} rx={12}
          fill="#3A4A54" opacity={0.25 + rigidity * 0.45} stroke={rigidity >= 0.8 ? C.hr : C.line} strokeWidth={1.2} />
      )}
      {strapped && [0.2, 0.82].map((f, i) => (
        <rect key={i} x={x0 + (endX - x0) * f - 3} y={y - w / 2 - (splintType === "vacuum" ? 13 : 10)}
          width={6} height={w + (splintType === "vacuum" ? 26 : 20)}
          fill={snugBad ? C.red : "#16202A"} opacity={0.9} />
      ))}
    </svg>
  );
}

export default function SplintMinigame({ open, kind, site, pat, assist, interrupted, onResolve }) {
  const info = LIMB_INFO[site] || LIMB_INFO.legR;
  const [step, setStep] = useState(0);
  const [splintType, setSplintType] = useState("");
  const [pulseChecked, setPulseChecked] = useState(false);
  const [pulseBefore, setPulseBefore] = useState(null);
  const [mvsChecked, setMvsChecked] = useState(false);
  const [immobilizeVal, setImmobilizeVal] = useState(0);
  const [holding, setHolding] = useState(false);
  const [padded, setPadded] = useState(false);
  const [anchors, setAnchors] = useState({ above: false, below: false, over: false });
  const [snug, setSnug] = useState(20);
  const [strapped, setStrapped] = useState(false);
  const [snugBad, setSnugBad] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!holding) return undefined;
    const rate = splintType === "vacuum" ? 0.05 : 0.06;
    const id = setInterval(() => setImmobilizeVal((v) => Math.min(1, v + rate)), 80);
    return () => clearInterval(id);
  }, [holding, splintType]);

  if (!open || kind !== "splint") return null;
  const tol = assistToleranceMult(assist);
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why) => setFlash({ ok: true, why });
  const do2 = pat?.limbDO2?.[site];
  const awake = !pat?.consciousness || pat.consciousness === "awake";

  const checkPulse = (isAfter) => {
    const p = pulseText(do2);
    if (!isAfter) setPulseBefore(p);
    setPulseChecked(true);
    return p;
  };

  const body = () => {
    if (step === 0) return (<>
      <Line>1. This is a closed limb deformity — pick the splint you have on hand.</Line>
      <button style={GO} onClick={() => setSplintType("cardboard")}>Rigid (cardboard) splint</button><Gap />
      <button style={GO} onClick={() => setSplintType("vacuum")}>Vacuum splint</button>
      {splintType && (<><Gap /><button style={NEUTRAL} onClick={() => setStep(1)}>
        Continue with the {splintType === "cardboard" ? "cardboard" : "vacuum"} splint</button></>)}
    </>);

    if (step === 1) {
      const p = pulseChecked ? pulseText(do2) : null;
      return (<>
        <Line>2. Check {info.pulseName} and motor/sensation in the {info.distalName} BEFORE you splint. Once it's on, you need this baseline to know if the splint made it worse.</Line>
        <button style={pulseChecked ? NEUTRAL : GO} onClick={() => checkPulse(false)}>
          {pulseChecked ? `${info.pulseName[0].toUpperCase()}${info.pulseName.slice(1)} at ${info.pulseSite}: ${p.txt}` : `Check the ${info.pulseName}`}
        </button><Gap />
        <button style={mvsChecked ? NEUTRAL : GO} onClick={() => setMvsChecked(true)}>
          {mvsChecked ? (awake ? `Moves the ${info.distalName}, sensation intact.` : "Can't assess — not responsive enough to ask.")
            : `Check movement and sensation in the ${info.distalName}`}
        </button><Gap />
        <button style={GO} disabled={!pulseChecked || !mvsChecked} onClick={() => setStep(2)}>Continue</button>
      </>);
    }

    if (step === 2) {
      const done = immobilizeVal >= 0.8;
      return (<>
        {splintType === "cardboard" ? (
          <Line>3. Cardboard can't bend to fit the limb. Press and hold directly on the limb above — don't try to straighten an angulated fracture — while the splint goes rigid against it.</Line>
        ) : (
          <Line>3. Wrap the vacuum splint around the limb in the position it's already in, then press and hold on it to draw the air out with the hand pump until it's rigid.</Line>
        )}
        <Bar v={immobilizeVal} lo={0.8} hi={1} /><Gap />
        <button style={done ? GO : NEUTRAL} disabled={!done}
          onClick={() => (immobilizeVal < 0.8
            ? fail(splintType === "cardboard" ? "You let go too soon. The limb shifted before the splint set and it has to be redone from the start."
              : "You stopped pumping too soon. It's still floppy and won't hold the position.")
            : setStep(splintType === "cardboard" ? 3 : 4))}>
          {splintType === "cardboard" ? "It's set" : "Lock the valve"}
        </button>
      </>);
    }

    // Cardboard only: padding, since it doesn't conform on its own.
    if (step === 3) return (<>
      <Line>4. Pad the {info.jointAbove} and {info.jointBelow} where the rigid rails will press against bone. A vacuum splint doesn't need this, it cushions on its own — cardboard does.</Line>
      <button style={padded ? NEUTRAL : GO} onClick={() => setPadded(true)}>{padded ? "Bony prominences padded" : "Pad the joints"}</button><Gap />
      <button style={GO} disabled={!padded} onClick={() => setStep(4)}>Continue</button>
    </>);

    if (step === 4) {
      const lo = 0.42 - 0.12 * (tol - 1), hi = 0.68 + 0.12 * (tol - 1);
      const picksOk = anchors.above && anchors.below && !anchors.over;
      return (<>
        <Line>5. Secure the splint proximal and distal to the injury — above the {info.jointAbove}, below the {info.jointBelow} — never directly over the deformity, and leave the {info.distalName} exposed so you can recheck circulation.</Line>
        <div style={{ marginBottom: 6 }}>
          <button style={anchors.above ? NEUTRAL : GO} onClick={() => setAnchors({ ...anchors, above: !anchors.above })}>
            {anchors.above ? "✓" : ""} Strap above the {info.jointAbove}</button></div>
        <div style={{ marginBottom: 6 }}>
          <button style={anchors.below ? NEUTRAL : GO} onClick={() => setAnchors({ ...anchors, below: !anchors.below })}>
            {anchors.below ? "✓" : ""} Strap below the {info.jointBelow}</button></div>
        <div style={{ marginBottom: 8 }}>
          <button style={anchors.over ? { ...NEUTRAL, borderColor: C.red, color: C.red } : GO} onClick={() => setAnchors({ ...anchors, over: !anchors.over })}>
            {anchors.over ? "✓" : ""} Strap directly over the deformity</button></div>
        <Line>Snug it down: {snug}% (aim for about 55, two fingers should still fit under).</Line>
        <Slider value={snug} onChange={setSnug} />
        <button style={GO} disabled={!anchors.above && !anchors.below && !anchors.over}
          onClick={() => {
            if (!picksOk) { fail(anchors.over ? "You strapped directly over the fracture site. That's painful and doesn't stabilize anything — the strap has to sit above and below the injury, not on it."
              : "You need a strap above and below the injury on both sides for this to actually immobilize it."); return; }
            const bad = snug < lo || snug > hi;
            setStrapped(true); setSnugBad(bad);
            if (snug < lo) fail("Too loose. The limb can still shift inside it, and that's exactly what you're trying to stop.");
            else if (snug > hi) fail(`Too tight. That's compressing the same ${info.pulseName} you just confirmed was there.`);
            else setStep(5);
          }}>Secure the straps</button>
      </>);
    }

    // step 5: recheck PMS after.
    const pAfter = pulseChecked ? pulseText(do2) : null;
    return (<>
      <Line>6. Recheck {info.pulseName} and motor/sensation in the {info.distalName} now that it's splinted, and compare to your baseline{pulseBefore ? ` ("${pulseBefore.txt}")` : ""}.</Line>
      <button style={NEUTRAL} onClick={() => checkPulse(true)}>
        {info.pulseName[0].toUpperCase() + info.pulseName.slice(1)} now: {pAfter ? pAfter.txt : "check again"}
      </button><Gap />
      <button style={GO} onClick={() => win(`Splinted (${splintType === "cardboard" ? "rigid" : "vacuum"}), ${info.pulseName} intact, ${info.distalName} pink and warm. Baseline recorded for reassessment.`)}>
        Finish and document the recheck</button>
    </>);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Splint the {info.name}</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && <LimbScene limb={info.limb} splintType={splintType} immobilizeVal={step >= 2 ? immobilizeVal : 0}
          padded={padded} strapped={strapped} snugBad={snugBad}
          holdable={step === 2} holding={holding} onHoldDown={() => setHolding(true)} onHoldUp={() => setHolding(false)} />}
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
