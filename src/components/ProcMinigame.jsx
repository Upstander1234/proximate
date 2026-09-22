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
//   directPressure  bleeding control: right dressing, then sustained firm pressure
//   pack            wound packing: gauze to the base of the cavity, then hold on top
//   fundalMassage   postpartum hemorrhage: locate the fundus, firm circular massage
//   recovery        recovery position: roll, brace with arm/knee, tilt the head to drain
//   abdThrust       Heimlich: position, hand placement, five thrusts
//   traction        traction splint: align, ankle hitch, ratchet to a real force
//   ultrasound      eFAST: four real windows, each read against live physiology (App.jsx)
//   cardiovert      synchronized cardioversion: SYNC mode, confirm markers, clear, energy, shock
//   pacing          transcutaneous pacing: pad placement, rate, mA to electrical AND mechanical capture
//   icdMagnet       locate the device, seat the magnet to suspend shock therapy
//   chestTube       triangle of safety, blunt dissection over the rib, finger sweep, insert and confirm
//   lucas           mechanical CPR device: back plate, center the piston, secure the straps, start
//   pelvicBinder    level at the greater trochanters, tension to a stable (not crushing) pelvis
//   artLine         Allen's test, shallow angle into the radial artery, thread on a pulsatile flash
//   reboa           femoral access, advance to the correct zone, inflate to occlude
//   paCath          float the balloon through the right heart to a wedge tracing, then deflate
//   cpap / vent     mask seal or airway confirmed, then a real pressure/volume target
//   mouthMask / mouthMouth   seal, then a real breath volume/rate — no bag valve to check instead
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

// A compact scene per procedure, reflecting the state the player is actually
// setting (windlass tightness, needle depth, breathing phase, head tilt
// angle, flow rate...) rather than a static diagram for every one of them.
function ProcScene({ procId, tight, twist, rib, depth, phase, wiped, ext, headPos, snug, drift, held, flow, tankOpen, bagFilled, suctionOn, suctionT,
  pressing, dpHeld, opened, packDepth, packPressing, massaging, firm,
  rollSide, armSet, kneeSet, stance, handPos, thrusts, aligned, hitch, tractionForce, usIdx, usFine }) {
  const box = { viewBox: "0 0 200 100", style: { width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 } };
  if (procId === "tq") {
    const w = 14 + tight * 10;
    return (
      <svg {...box}>
        <rect x={10} y={40} width={180} height={22} rx={11} fill="#D9A98A" opacity={0.85} />
        <rect x={90 - w / 2} y={34} width={w} height={34} rx={5} fill={tight > 0.5 ? "#7A1E1E" : C.amber} opacity={0.85} />
        <circle cx={90} cy={51} r={4} fill="#16202A" transform={twist ? "rotate(45 90 51)" : "rotate(0 90 51)"} />
        <line x1={78} y1={51} x2={102} y2={51} stroke="#C8D3D9" strokeWidth={2} transform={twist ? "rotate(45 90 51)" : "rotate(0 90 51)"} />
      </svg>
    );
  }
  if (procId === "needleD") {
    const x = 60 + (rib / 100) * 90, y = 25 + depth * 45;
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={80} ry={38} fill="#D9A98A" opacity={0.8} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={40} y1={30 + i * 14} x2={160} y2={30 + i * 14} stroke="#B98A6A" strokeWidth={3} opacity={0.5} />)}
        <line x1={x - 22} y1={y - 22} x2={x} y2={y} stroke="#C8D3D9" strokeWidth={2.5} />
        <circle cx={x} cy={y} r={2.6} fill={depth > 0.4 ? "#7CD68A" : "#8A9AA2"} />
      </svg>
    );
  }
  if (procId === "chestSeal") {
    const exhaling = phase > 0.5;
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={78} ry={40} fill="#D9A98A" opacity={0.8} />
        <ellipse cx={100} cy={55} rx={12 + (exhaling ? 3 : 0)} ry={9 + (exhaling ? 2 : 0)} fill={wiped ? "#8A1F2A" : "#5C1219"} opacity={0.85} />
        {wiped && <rect x={82} y={40} width={36} height={30} rx={4} fill={C.amber} opacity={exhaling ? 0.55 : 0.2} stroke={C.line} strokeWidth={1} />}
      </svg>
    );
  }
  if (procId === "defib" || procId === "aedShock" || procId === "cardiovert" || procId === "pacing") {
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={78} ry={40} fill="#D9A98A" opacity={0.8} />
        <rect x={62} y={30} width={24} height={16} rx={3} fill={C.amber} opacity={0.6} />
        <rect x={114} y={62} width={24} height={16} rx={3} fill={C.amber} opacity={0.6} />
      </svg>
    );
  }
  if (procId === "headTilt" || procId === "jawThrust") {
    const rot = procId === "headTilt" ? (ext - 65) * 0.35 : 0;
    const jaw = procId === "jawThrust" ? Math.max(0, (ext - 30) * 0.3) : 0;
    return (
      <svg {...box}>
        <g transform={`translate(100,55) rotate(${rot})`}>
          <ellipse cx={0} cy={0} rx={44} ry={36} fill="#D9A98A" opacity={0.85} />
          <path d={`M-20,26 Q0,${40 + jaw} 24,20`} fill="none" stroke="#8A5E45" strokeWidth={2.4} />
        </g>
        {procId === "jawThrust" && <circle cx={100 + (headPos - 50) * 0.6} cy={16} r={3} fill={Math.abs(headPos - 50) > 15 ? C.red : C.hr} />}
      </svg>
    );
  }
  if (procId === "cCollar" || procId === "cspine") {
    const x = 100 + ((procId === "cspine" ? drift : 50) - 50) * 0.9;
    return (
      <svg {...box}>
        <rect x={70} y={30} width={60} height={50} rx={10} fill="#D9A98A" opacity={0.85} />
        <rect x={40} y={58} width={120} height={30} rx={8} fill="#16202A" opacity={0.7} />
        <line x1={100} y1={30} x2={x} y2={12} stroke={procId === "cspine" && held ? (Math.abs(drift - 50) <= 18 ? C.hr : C.red) : "#8A9AA2"} strokeWidth={3} />
        {procId === "cCollar" && <rect x={70} y={58} width={60} height={12 + snug * 0.15} rx={6} fill={C.amber} opacity={0.55} />}
      </svg>
    );
  }
  if (procId === "opa" || procId === "npa") {
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={60} ry={44} fill="#D9A98A" opacity={0.85} />
        <path d="M60,55 Q100,80 140,55 Q100,100 60,55 Z" fill="#7A3A3A" />
        <line x1={70} y1={60} x2={130} y2={40} stroke="#C8D3D9" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
      </svg>
    );
  }
  if (procId === "suction") {
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={60} ry={44} fill="#D9A98A" opacity={0.85} />
        <path d="M60,55 Q100,80 140,55 Q100,100 60,55 Z" fill="#7A3A3A" />
        <line x1={130} y1={40} x2={80} y2={60} stroke={suctionOn ? C.hr : "#C8D3D9"} strokeWidth={4} />
        {suctionOn && [0, 1].map((i) => <circle key={i} cx={82 - i * 6} cy={62 + i * 3} r={2} fill="#7A1E1E" opacity={0.6} />)}
        <text x={100} y={16} textAnchor="middle" fontSize={9} fill={C.faint}>{suctionT.toFixed(1)}s</text>
      </svg>
    );
  }
  if (procId === "o2nc" || procId === "o2nrb") {
    const nrb = procId === "o2nrb";
    const mist = Math.max(0, Math.min(1, flow / 12));
    return (
      <svg {...box}>
        <rect x={10} y={20} width={24} height={60} rx={5} fill={tankOpen ? "#2A6B4A" : "#3A4A54"} stroke={C.line} strokeWidth={1} />
        <circle cx={22} cy={26} r={5} fill="#16202A" />
        <ellipse cx={110} cy={55} rx={60} ry={40} fill="#D9A98A" opacity={0.85} />
        {nrb ? (
          <ellipse cx={110} cy={62} rx={16} ry={12} fill={bagFilled ? "#BFD8E0" : "#16202A"} opacity={0.8} stroke={C.line} strokeWidth={1} />
        ) : (
          <path d="M90,62 Q110,52 130,62" fill="none" stroke="#C8D3D9" strokeWidth={2.5} />
        )}
        {mist > 0.15 && [0, 1].map((i) => <circle key={i} cx={104 + i * 12} cy={38 - i * 4} r={2 + mist * 2} fill="#BFE3F2" opacity={0.5 * mist} />)}
      </svg>
    );
  }
  if (procId === "directPressure") {
    const held = Math.min(1, (dpHeld || 0) / 8);
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={78} ry={40} fill="#D9A98A" opacity={0.8} />
        <ellipse cx={100} cy={55} rx={11} ry={8} fill="#7A1E1E" opacity={Math.max(0.12, 1 - held * 0.85)} />
        {pressing && <ellipse cx={100} cy={55} rx={22} ry={17} fill="#E9EDE6" opacity={0.55} stroke={C.line} strokeWidth={1} />}
      </svg>
    );
  }
  if (procId === "pack") {
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={78} ry={40} fill="#D9A98A" opacity={0.8} />
        <ellipse cx={100} cy={55} rx={17} ry={13} fill="#5C1219" />
        {opened && <rect x={91} y={55 - (packDepth / 100) * 12} width={18} height={(packDepth / 100) * 12} fill="#E9EDE6" opacity={0.85} />}
        {packPressing && <ellipse cx={100} cy={55} rx={24} ry={18} fill="#E9EDE6" opacity={0.4} stroke={C.line} strokeWidth={1} />}
      </svg>
    );
  }
  if (procId === "fundalMassage") {
    const r = 22 - (firm || 0) * 8;
    return (
      <svg {...box}>
        <ellipse cx={100} cy={62} rx={80} ry={34} fill="#D9A98A" opacity={0.8} />
        <circle cx={100} cy={56} r={r} fill={(firm || 0) >= 0.8 ? "#7A3B3B" : "#B85C5C"} opacity={0.85} stroke="#5C2A38" strokeWidth={1.4} />
        {massaging && [0, 1, 2].map((i) => (
          <circle key={i} cx={100} cy={56} r={r + 6 + i * 5} fill="none" stroke={C.amber} strokeWidth={1} opacity={Math.max(0, 0.4 - i * 0.12)} />
        ))}
      </svg>
    );
  }
  if (procId === "recovery") {
    const onSide = rollSide === "side";
    const rot = onSide ? -70 : 0;
    return (
      <svg {...box}>
        <g transform={`translate(100,55) rotate(${rot})`}>
          <ellipse cx={0} cy={0} rx={54} ry={26} fill="#D9A98A" opacity={0.85} />
          <circle cx={-46} cy={0} r={16} fill="#D9A98A" opacity={0.85} />
          {onSide && kneeSet && <ellipse cx={30} cy={20} rx={22} ry={9} fill="#D9A98A" opacity={0.7} transform="rotate(35 30 20)" />}
          {onSide && armSet && <rect x={-70} y={-6} width={30} height={10} rx={5} fill="#D9A98A" opacity={0.7} />}
        </g>
      </svg>
    );
  }
  if (procId === "abdThrust") {
    const inPos = stance === "behind";
    const grip = handPos === "navel";
    return (
      <svg {...box}>
        <ellipse cx={100} cy={60} rx={30} ry={40} fill="#D9A98A" opacity={0.85} />
        {inPos && <ellipse cx={100} cy={30} rx={26} ry={20} fill="#C89578" opacity={0.65} />}
        {inPos && grip && <circle cx={100} cy={52 - Math.min(10, thrusts * 2)} r={8} fill="#E8C9A8" stroke="#8A5E45" strokeWidth={1} />}
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx={70 + i * 15} cy={95} r={4} fill={i < thrusts ? C.hr : "#1B242B"} />
        ))}
      </svg>
    );
  }
  if (procId === "traction") {
    const kink = aligned ? 0 : 22;
    const stretch = hitch ? tractionForce * 0.25 : 0;
    return (
      <svg {...box}>
        <rect x={10} y={44} width={60} height={16} rx={6} fill="#D9A98A" opacity={0.85} />
        <rect x={70} y={44} width={70 + stretch} height={16} rx={6} fill="#D9A98A" opacity={0.85} transform={`rotate(${kink} 70 52)`} />
        {hitch && <rect x={70 + stretch + 66} y={40} width={14} height={24} rx={3} fill="#8A9AA2" opacity={0.7} />}
        {hitch && <line x1={70 + stretch + 66} y1={52} x2={170} y2={52} stroke={C.hr} strokeWidth={2} strokeDasharray="3,2" />}
      </svg>
    );
  }
  if (procId === "icdMagnet") {
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={78} ry={40} fill="#D9A98A" opacity={0.8} />
        <circle cx={82} cy={36} r={7} fill="#8A9AA2" opacity={0.6} />
        {held && <circle cx={82} cy={36} r={10} fill="none" stroke={C.hr} strokeWidth={2} opacity={0.85} />}
      </svg>
    );
  }
  if (procId === "chestTube") {
    const x = 130, y = 30 + (rib / 100) * 40;
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={80} ry={38} fill="#D9A98A" opacity={0.8} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={40} y1={30 + i * 14} x2={160} y2={30 + i * 14} stroke="#B98A6A" strokeWidth={3} opacity={0.5} />)}
        <line x1={x - 20} y1={y - 18} x2={x} y2={y} stroke="#C8D3D9" strokeWidth={2.5} />
        <circle cx={x} cy={y + depth * 12} r={2.6} fill={depth > 0.5 ? "#7CD68A" : "#8A9AA2"} />
      </svg>
    );
  }
  if (procId === "lucas") {
    const x = 60 + (rib / 100) * 80;
    return (
      <svg {...box}>
        <ellipse cx={100} cy={62} rx={78} ry={34} fill="#D9A98A" opacity={0.8} />
        <rect x={x - 14} y={28} width={28} height={30} rx={4} fill="#3A4A54" opacity={0.35 + Math.min(1, dpHeld / 5) * 0.5} stroke={C.line} strokeWidth={1.2} />
        <rect x={x - 5} y={50} width={10} height={14} rx={2} fill={pressing ? C.hr : "#8A9AA2"} />
      </svg>
    );
  }
  if (procId === "pelvicBinder") {
    const s = Math.max(0.15, snug / 100);
    return (
      <svg {...box}>
        <rect x={45} y={35} width={110} height={40} rx={20} fill="#D9A98A" opacity={0.85} />
        <rect x={45} y={45 - s * 4} width={110} height={10 + s * 12} rx={6} fill={C.amber} opacity={0.55} />
      </svg>
    );
  }
  if (procId === "artLine" || procId === "reboa" || procId === "paCath") {
    const x = 60 + (rib / 100) * 100, y = 55;
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={80} ry={22} fill="#D9A98A" opacity={0.8} />
        <line x1={x - 20} y1={y - 18} x2={x} y2={y} stroke="#C8D3D9" strokeWidth={2.5} />
        <circle cx={x} cy={y} r={2.6} fill={depth > 0.5 ? "#7CD68A" : "#8A9AA2"} />
        <line x1={30} y1={55} x2={170} y2={55} stroke="#7A1E1E" strokeWidth={4} opacity={0.4 + depth * 0.4} />
      </svg>
    );
  }
  if (procId === "cpap" || procId === "vent") {
    const fillPct = procId === "cpap" ? Math.min(1, flow / 12) : depth;
    return (
      <svg {...box}>
        <ellipse cx={110} cy={55} rx={60} ry={40} fill="#D9A98A" opacity={0.85} />
        <ellipse cx={100} cy={58} rx={24} ry={18} fill={wiped ? "#BFD8E0" : "#16202A"} opacity={0.4 + fillPct * 0.5} stroke={C.line} strokeWidth={1} />
      </svg>
    );
  }
  if (procId === "mouthMask" || procId === "mouthMouth") {
    const chest = Math.max(0.15, ext / 100);
    return (
      <svg {...box}>
        <ellipse cx={100} cy={55} rx={60} ry={44} fill="#D9A98A" opacity={0.85} />
        <ellipse cx={100} cy={55} rx={12} ry={8} fill={wiped ? "#8A1F2A" : "#5C1219"} opacity={0.85} />
        <ellipse cx={100} cy={20} rx={40 + chest * 20} ry={5} fill={C.amber} opacity={0.35 + chest * 0.35} />
      </svg>
    );
  }
  if (procId === "ultrasound") {
    const SPOT = [[100, 32], [130, 54], [70, 54], [100, 82]];
    const [px, py] = SPOT[usIdx] || SPOT[0];
    return (
      <svg {...box}>
        <ellipse cx={100} cy={58} rx={78} ry={38} fill="#D9A98A" opacity={0.8} />
        <rect x={px - 10} y={py - 6} width={20} height={12} rx={2} fill="#16202A" stroke={C.hr} strokeWidth={1.4} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${px - 8 + i * 8},${py + 6} L${px - 14 + i * 8},${py + 6 + usFine * 0.25} L${px - 2 + i * 8},${py + 6 + usFine * 0.25} Z`}
            fill={C.hr} opacity={0.18} />
        ))}
      </svg>
    );
  }
  return null;
}

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
  // direct pressure
  const [dressing, setDressing] = useState("");
  const [pressing, setPressing] = useState(false);
  const [dpHeld, setDpHeld] = useState(0);
  // wound packing
  const [opened, setOpened] = useState(false);
  const [packDepth, setPackDepth] = useState(0);
  const [packPressing, setPackPressing] = useState(false);
  const [packHeld, setPackHeld] = useState(0);
  // fundal massage
  const [located, setLocated] = useState("");
  const [massaging, setMassaging] = useState(false);
  const [firm, setFirm] = useState(0);
  // recovery position
  const [rollSide, setRollSide] = useState("");
  const [armSet, setArmSet] = useState(false);
  const [kneeSet, setKneeSet] = useState(false);
  // abdominal thrusts (Heimlich)
  const [stance, setStance] = useState("");
  const [handPos, setHandPos] = useState("");
  const [thrusts, setThrusts] = useState(0);
  // traction splint
  const [aligned, setAligned] = useState(false);
  const [hitch, setHitch] = useState(false);
  const [tractionForce, setTractionForce] = useState(0);
  // eFAST ultrasound
  const US_WINDOWS = ["Subxiphoid (pericardial)", "Right upper quadrant (Morison's pouch)", "Left upper quadrant (splenorenal)", "Suprapubic (pelvis)"];
  const [usIdx, setUsIdx] = useState(0);
  const [usFine, setUsFine] = useState(20);
  const [usFindings, setUsFindings] = useState([]);
  // cardioversion / transcutaneous pacing
  const [energy, setEnergy] = useState(50);
  const [paceRate, setPaceRate] = useState(70);
  const [mA, setMa] = useState(0);
  const [captureOk, setCaptureOk] = useState(false);
  // ICD/pacemaker magnet and chest tube
  const [magnetSecured, setMagnetSecured] = useState(false);
  const [ctSwept, setCtSwept] = useState(false);

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
  // Direct pressure: cumulative seconds under sustained hold.
  useEffect(() => {
    if (!(pressing && procId === "directPressure")) return undefined;
    const id = setInterval(() => setDpHeld((t) => t + 0.1), 100);
    return () => clearInterval(id);
  }, [pressing, procId]);
  // Wound packing's own post-pack hold, same shape as direct pressure's.
  useEffect(() => {
    if (!(packPressing && procId === "pack")) return undefined;
    const id = setInterval(() => setPackHeld((t) => t + 0.1), 100);
    return () => clearInterval(id);
  }, [packPressing, procId]);
  // Fundal massage: firmness rises while actively massaged, relaxes (atony)
  // when you stop — a real uterus doesn't stay firm on its own until the
  // uterotonic response is established, so letting go too early costs ground.
  useEffect(() => {
    if (procId !== "fundalMassage") return undefined;
    const id = setInterval(() => setFirm((f) => Math.max(0, Math.min(1, f + (massaging ? 0.035 : -0.012)))), 100);
    return () => clearInterval(id);
  }, [massaging, procId]);

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
      case "directPressure": {
        if (step === 0) return (<><Line>1. Get a barrier between you and the wound before you touch it.</Line>
          <Choice value={dressing} onChange={setDressing} placeholder="Choose what you press with..." options={[["gauze", "A gauze pad or trauma dressing"], ["bareHand", "Your bare gloved hand, no dressing"], ["occlusive", "An occlusive (vented) seal"]]} /><Gap />
          <button style={GO} disabled={!dressing} onClick={() => (dressing === "gauze" ? setStep(1)
            : fail(dressing === "bareHand" ? "You can press without a dressing, but a bare glove gives you nothing to bulk the pressure with and no way to keep the wound clean. Grab a dressing."
              : "An occlusive seal is for a sucking chest wound, not a bleeding one. It won't tamponade anything here."))}>Place the dressing</button></>);
        return (<><Line>2. Push down firm and hold. Don't peek, don't let up, don't check it early — lifting the dressing breaks the seal and the bleeding restarts.</Line>
          <Bar v={Math.min(1, dpHeld / 8)} lo={0.75} hi={1} />
          <button style={GO} onPointerDown={() => setPressing(true)} onPointerUp={() => setPressing(false)} onPointerLeave={() => setPressing(false)}>Hold firm pressure</button><Gap />
          <button style={NEUTRAL} onClick={() => (dpHeld < 6 ? fail("You let up too soon. Direct, firm, continuous pressure needs real time to work — keep holding.")
            : win("Bleeding has slowed to a trickle. Keep the dressing in place and secure it with a wrap."))}>Check the wound</button></>);
      }
      case "pack": {
        if (step === 0) return (<><Line>1. Open the gauze and get the packing ready. Pack the wound itself, not just the entrance.</Line>
          <button style={opened ? NEUTRAL : GO} onClick={() => setOpened(true)}>{opened ? "Gauze open, ready to pack" : "Open the gauze"}</button><Gap />
          <button style={GO} disabled={!opened} onClick={() => setStep(1)}>Continue</button></>);
        if (step === 1) return (<><Line>2. Pack it in, layer by layer, all the way to the base of the wound: {Math.round(packDepth)}% (aim for at least 85 — dead space left unpacked keeps bleeding).</Line>
          <Slider value={packDepth} onChange={setPackDepth} />
          <button style={GO} onClick={() => (packDepth < 70 ? fail("Only the surface is packed. There's dead space below and the bleeding continues from down there.") : setStep(2))}>Pack it to the base</button></>);
        return (<><Line>3. Hold firm pressure directly on top of the packed gauze so it tamponades against the bleeding vessel.</Line>
          <Bar v={Math.min(1, packHeld / 5)} lo={0.6} hi={1} />
          <button style={GO} onPointerDown={() => setPackPressing(true)} onPointerUp={() => setPackPressing(false)} onPointerLeave={() => setPackPressing(false)}>Hold pressure on top</button><Gap />
          <button style={NEUTRAL} onClick={() => (packHeld < 3 ? fail("The gauze is packed but nothing held it in place under pressure. Hold firmly on top before you let go.")
            : win("Packed to the base and held firm. Bleeding controlled."))}>Finish the pack</button></>);
      }
      case "fundalMassage": {
        if (step === 0) return (<><Line>1. Find the fundus. Immediately postpartum it sits right at the level of the umbilicus.</Line>
          <Choice value={located} onChange={setLocated} placeholder="Palpate and choose..." options={[["umbilicus", "Firm mass at the level of the umbilicus"], ["pubis", "Down near the pubic bone"], ["ribs", "Up under the ribs"]]} /><Gap />
          <button style={GO} disabled={!located} onClick={() => (located === "umbilicus" ? setStep(1)
            : fail(located === "pubis" ? "Too low. You'd feel the bladder, not the fundus, and you'd miss it entirely." : "Too high. That's not where the fundus sits right after delivery."))}>Cup your hand over it</button></>);
        return (<><Line>2. Massage in firm, circular motions until it firms up like a grapefruit. Ease off and it goes soft (boggy) again, so keep at it.</Line>
          <Bar v={firm} lo={0.8} hi={1} />
          <button style={GO} onPointerDown={() => setMassaging(true)} onPointerUp={() => setMassaging(false)} onPointerLeave={() => setMassaging(false)}>Massage the fundus</button><Gap />
          <button style={NEUTRAL} onClick={() => (firm < 0.8 ? fail("Still soft and boggy. Keep massaging — a boggy uterus is an actively bleeding one.")
            : win("The fundus is firm now. Bleeding is slowing."))}>Check the fundus</button></>);
      }
      case "recovery": {
        if (step === 0) return (<><Line>1. Roll them. Away from you, onto their side — never flat on the back or face-down.</Line>
          <Choice value={rollSide} onChange={setRollSide} placeholder="Choose the position..." options={[["side", "Onto their side"], ["back", "Leave them on their back"], ["stomach", "Onto their stomach"]]} /><Gap />
          <button style={GO} disabled={!rollSide} onClick={() => (rollSide === "side" ? setStep(1)
            : fail(rollSide === "back" ? "Flat on the back, an unconscious airway can obstruct and vomit pools in the throat." : "Face down makes it impossible to watch their breathing or clear the airway if they vomit."))}>Roll them</button></>);
        if (step === 1) return (<><Line>2. Stabilize them so they don't roll back: the lower arm out in front for support, the upper knee bent to prop the body.</Line>
          <button style={armSet ? NEUTRAL : GO} onClick={() => setArmSet(true)}>{armSet ? "Lower arm extended" : "Extend the lower arm in front"}</button><Gap />
          <button style={kneeSet ? NEUTRAL : GO} onClick={() => setKneeSet(true)}>{kneeSet ? "Upper knee bent" : "Bend the upper knee forward"}</button><Gap />
          <button style={GO} onClick={() => (armSet && kneeSet ? setStep(2) : fail("Without both points of support, they roll right back onto their back (or face) the moment you let go."))}>Continue</button></>);
        return (<><Line>3. Tilt the head back slightly so secretions and vomit drain out instead of pooling: {ext}% (aim for about 55).</Line>
          <Slider value={ext} onChange={setExt} />
          <button style={GO} onClick={() => (ext < 55 - 20 * tol ? fail("Barely tilted. Fluid still pools at the back of the throat instead of draining.")
            : ext > 55 + 20 * tol ? fail("Over-tilted for a passive position like this — ease off.") : win("On their side, braced, head tilted to drain. Airway protected."))}>Finish positioning</button></>);
      }
      case "abdThrust": {
        if (step === 0) return (<><Line>1. Get into position behind them.</Line>
          <Choice value={stance} onChange={setStance} placeholder="Choose your position..." options={[["behind", "Stand behind, arms around the waist"], ["front", "Face them, push on the chest"], ["side", "Beside them, one arm over the shoulder"]]} /><Gap />
          <button style={GO} disabled={!stance} onClick={() => (stance === "behind" ? setStep(1)
            : fail(stance === "front" ? "Pushing on the chest from the front doesn't generate the subdiaphragmatic thrust that expels the obstruction." : "You can't get a real thrust from the side. Get directly behind them."))}>Take your position</button></>);
        if (step === 1) return (<><Line>2. Make a fist, thumb side in, and place it in the right spot.</Line>
          <Choice value={handPos} onChange={setHandPos} placeholder="Choose where..." options={[["navel", "Above the navel, below the xiphoid process"], ["sternum", "On the sternum"], ["ribs", "Over the lower ribs"]]} /><Gap />
          <button style={GO} disabled={!handPos} onClick={() => (handPos === "navel" ? setStep(2)
            : fail(handPos === "sternum" ? "That's a chest-compression landmark, not an abdominal-thrust one." : "Thrusting on the ribs risks fracturing them without generating the right force vector."))}>Set your grip</button></>);
        return (<><Line>3. Grab your fist with the other hand and give quick inward-and-upward thrusts. {thrusts} of 5.</Line>
          <button style={GO} disabled={thrusts >= 5} onClick={() => setThrusts((t) => Math.min(5, t + 1))}>Give a thrust</button><Gap />
          <button style={NEUTRAL} onClick={() => (thrusts < 5 ? fail("You stopped early. Keep alternating thrusts (and back blows) until it clears or they go unresponsive.") : win("Five thrusts delivered. Check the airway."))}>Check the airway</button></>);
      }
      case "traction": {
        if (step === 0) return (<><Line>1. Align the limb: gentle, steady manual traction to bring it back in line before the device goes on.</Line>
          <button style={aligned ? NEUTRAL : GO} onClick={() => setAligned(true)}>{aligned ? "Limb aligned" : "Apply manual in-line traction"}</button><Gap />
          <button style={GO} disabled={!aligned} onClick={() => setStep(1)}>Continue</button></>);
        if (step === 1) return (<><Line>2. Apply the ankle hitch and seat the device against the ischial tuberosity, not the groin.</Line>
          <button style={hitch ? NEUTRAL : GO} onClick={() => setHitch(true)}>{hitch ? "Ankle hitch on, device seated" : "Apply the ankle hitch"}</button><Gap />
          <button style={GO} disabled={!hitch} onClick={() => setStep(2)}>Continue</button></>);
        return (<><Line>3. Ratchet to a real traction force: enough to relieve the muscle spasm and pain, not enough to overdistract the fracture: {tractionForce}% (aim for about 50).</Line>
          <Slider value={tractionForce} onChange={setTractionForce} />
          <button style={GO} onClick={() => (tractionForce < 30 - 15 * tol ? fail("Not enough traction. The spasm keeps pulling the fragments and it still hurts.")
            : tractionForce > 70 + 15 * tol ? fail("Over-distracted. That can separate the fracture site rather than align it.") : win("Aligned, hitched and traction set. Pain eases and the limb is stable."))}>Lock the ratchet</button></>);
      }
      case "cardiovert": {
        if (step === 0) return (<><Line>1. This is cardioversion, not defibrillation — the patient still has a pulse. The shock must be SYNCHRONIZED to fire on the R wave, never during the vulnerable T wave, or you risk inducing VF.</Line>
          <Choice value={grip} onChange={setGrip} placeholder="Choose a mode..." options={[["sync", "Enable SYNC mode"], ["async", "Leave it in standard (unsynchronized) mode"]]} /><Gap />
          <button style={GO} disabled={!grip} onClick={() => (grip === "sync" ? setStep(1) : fail("You shocked asynchronously on a patient with a pulse. An unsynchronized shock can land on the T wave and induce VF, exactly what cardioversion exists to avoid."))}>Set the mode</button></>);
        if (step === 1) return (<><Line>2. Watch the monitor: a sync marker should land on top of every QRS complex before you charge. If it isn't marking every beat, the device may not fire at all.</Line>
          <button style={GO} onClick={() => setStep(2)}>Sync markers tracking every QRS, charge</button></>);
        return (<><Line>3. Select your energy, then make sure everyone is clear — same as a defibrillation, and expect a short delay while it waits for the next R wave.</Line>
          <Line>Energy: {energy} J (start low, about 50 to 100, and escalate if it doesn't convert).</Line>
          <Slider value={energy} onChange={setEnergy} max={200} />
          {[["hands", "Hands off. Nobody touching the patient or the stretcher"], ["o2", "Oxygen moved away from the chest"], ["call", "Call it: \"I'm clear, you're clear, everybody clear\""]].map(([k, l]) => (
            <div key={k} style={{ marginBottom: 6 }}>
              <button style={clear[k] ? NEUTRAL : GO} onClick={() => setClear({ ...clear, [k]: true })}>{clear[k] ? `Done: ${l}` : l}</button>
            </div>))}
          <Gap />
          <button style={DANGER} onClick={() => (!(clear.hands && clear.o2 && clear.call) ? fail("You shocked before clearing everyone. That shock could have hurt a rescuer.")
            : energy < 30 ? fail("Too little energy to reliably convert this rhythm. Go higher.")
            : win(`Synchronized shock delivered at ${energy} J. The monitor waited for the R wave and fired cleanly.`))}>Deliver the synchronized shock</button></>);
      }
      case "pacing": {
        if (step === 0) return (<><Line>1. Place the pacing pads anterior-posterior, one over the left precordium, one on the back below the left scapula. Anterior-lateral (the defib placement) captures less reliably for pacing.</Line>
          <Choice value={grip} onChange={setGrip} placeholder="Choose pad placement..." options={[["ap", "Anterior-posterior"], ["al", "Anterior-lateral, same as defib pads"]]} /><Gap />
          <button style={GO} disabled={!grip} onClick={() => (grip === "ap" ? setStep(1) : fail("Anterior-lateral placement is fine for a shock, but it captures less reliably for transcutaneous pacing. Use anterior-posterior."))}>Place the pads</button></>);
        if (step === 1) return (<><Line>2. Set the pacing rate: {paceRate} bpm (aim for about 70 to 80, a normal rate that gives real cardiac output).</Line>
          <Slider value={paceRate} onChange={setPaceRate} min={40} max={120} />
          <button style={GO} onClick={() => (paceRate < 60 ? fail("Too slow. That barely improves on the bradycardia you're trying to fix.") : paceRate > 100 ? fail("Faster than this needs to be. This is a bridge back to a normal rate, not an emergency override.") : setStep(2))}>Set the rate</button></>);
        return (<><Line>3. Increase the current (mA) from zero until you see electrical capture, a pacer spike followed by a wide QRS, then confirm MECHANICAL capture with a pulse check — electrical capture alone can be misread on the monitor.</Line>
          <Line>Current: {mA} mA</Line>
          <Slider value={mA} onChange={setMa} max={140} /><Gap />
          <button style={captureOk ? NEUTRAL : GO} onClick={() => setCaptureOk(mA >= 50)}>
            {captureOk ? "Pulse confirmed at the paced rate" : "Check for a pulse matching the paced rate"}
          </button><Gap />
          <button style={GO} onClick={() => (mA < 50 ? fail("No capture yet at this current. Every pacer spike is followed by a flat line, not a QRS. Turn it up.")
            : !captureOk ? fail("You never confirmed a pulse. Electrical capture on the monitor doesn't guarantee the heart is actually contracting. Check mechanically before you trust it.")
            : win(`Capturing at ${mA} mA, ${paceRate} bpm, with a palpable pulse to match. Leave a margin above threshold.`))}>Confirm and hold</button></>);
      }
      case "icdMagnet": {
        if (step === 0) return (<><Line>1. Find the device. It sits in a subcutaneous pocket, usually upper chest, left or right of the sternum, feel for a firm, coin-sized lump.</Line>
          <Choice value={site} onChange={setSite} placeholder="Palpate and choose..." options={[["found", "Firm generator felt under the skin, upper chest"], ["notFound", "Nothing palpable, check the abdomen instead"]]} /><Gap />
          <button style={GO} disabled={!site} onClick={() => (site === "found" ? setStep(1) : fail("Most ICDs and pacemakers sit in a subcutaneous pocket on the upper chest, not the abdomen. Recheck there."))}>Locate the device</button></>);
        return (<><Line>2. Place the magnet directly over the center of the device and hold it there. This suspends SHOCK therapy on an ICD (it does not stop pacing on a pacemaker) — the real fix for a device firing inappropriately.</Line>
          <button style={held ? NEUTRAL : GO} onPointerDown={() => setHeld(true)} onPointerUp={() => setMagnetSecured(true)} onPointerLeave={() => setHeld(false)}>
            {held ? "Holding it centered" : "Place the magnet over the device"}
          </button><Gap />
          <button style={GO} disabled={!magnetSecured} onClick={() => win("Magnet seated over the device. Shock therapy is suspended for as long as it stays in place.")}>Confirm it's seated</button></>);
      }
      case "chestTube": {
        if (step === 0) return (<><Line>1. Landmark the triangle of safety on the affected side: 5th intercostal space, between the anterior and mid-axillary lines.</Line>
          <Choice value={site} onChange={setSite} placeholder="Choose a site..." options={[["safety", "5th ICS, anterior to mid-axillary line"], ["mcl2", "2nd ICS, midclavicular line"], ["nipple", "Directly at the nipple line, posterior"]]} /><Gap />
          <button style={GO} disabled={!site} onClick={() => (site === "safety" ? setStep(1) : fail(site === "mcl2" ? "That's the needle decompression landmark, not a chest tube. Too high and too medial for a tube." : "Too far posterior. You risk the latissimus and the long thoracic nerve. Stay in the triangle of safety."))}>Mark the site</button></>);
        if (step === 1) return (<><Line>2. Bluntly dissect down, over the TOP of the rib to stay clear of the neurovascular bundle on its lower border: position {rib}% (aim for about 60).</Line>
          <Slider value={rib} onChange={setRib} />
          <button style={GO} onClick={() => (Math.abs(rib - 60) > 20 * tol ? fail("You tracked along the lower rib border and risk the intercostal vessels and nerve. Stay over the top of the rib.") : setStep(2))}>Dissect to the pleura</button></>);
        if (step === 2) return (<><Line>3. Sweep a finger through the tract to confirm you're truly in the pleural space, and clear of adhesions or organs, before the tube goes in blind.</Line>
          <button style={ctSwept ? NEUTRAL : GO} onClick={() => setCtSwept(true)}>{ctSwept ? "Pleural space confirmed, no adhesions felt" : "Sweep a finger through the tract"}</button><Gap />
          <button style={GO} disabled={!ctSwept} onClick={() => setStep(3)}>Continue</button></>);
        return (<><Line>4. Direct the tube posteriorly and superiorly for a pneumothorax, then advance: {Math.round(depth * 100)}% (aim for at least 80. A side hole left outside the chest wall leaks air around it).</Line>
          <Slider value={depth * 100} onChange={(v) => setDepth(v / 100)} />
          <button style={GO} onClick={() => (depth < 0.6 ? fail("Not far enough in. One of the tube's side holes is still outside the chest wall, and it leaks air around it instead of draining.")
            : win("Tube in, all side holes inside the chest, and it's swinging (fogging) with respiration. Connect the drainage system and secure it."))}>Advance and secure the tube</button></>);
      }
      case "lucas": {
        if (step === 0) return (<><Line>1. Position the back plate under the patient, centered under the torso, then bring the piston arm down over the chest.</Line>
          <button style={GO} onClick={() => setStep(1)}>Slide the back plate into place</button></>);
        if (step === 1) return (<><Line>2. Center the piston pad over the lower half of the sternum, the same landmark as manual compressions: {rib}% (aim for about 50, centered).</Line>
          <Slider value={rib} onChange={setRib} />
          <button style={GO} onClick={() => (Math.abs(rib - 50) > 20 * tol ? fail("Off-center. Too high risks the airway and clavicle, too low risks the xiphoid and abdominal organs.") : setStep(2))}>Lock the piston arm</button></>);
        return (<><Line>3. Secure the straps snug so the device can't shift during compressions, then start it.</Line>
          <Bar v={Math.min(1, dpHeld / 5)} lo={0.6} hi={1} />
          <button style={GO} onPointerDown={() => setPressing(true)} onPointerUp={() => setPressing(false)} onPointerLeave={() => setPressing(false)}>Hold to tighten the straps</button><Gap />
          <button style={NEUTRAL} onClick={() => (dpHeld < 3 ? fail("The straps are loose. The device shifts off the sternum with the first compression.") : win("Straps secure, piston centered. Start the device, compressions are automatic and your hands are free."))}>Start the device</button></>);
      }
      case "pelvicBinder": {
        if (step === 0) return (<><Line>1. Position the binder level with the greater trochanters, not up at the iliac crests, too high and it can't close the pelvic ring.</Line>
          <Choice value={site} onChange={setSite} placeholder="Choose the level..." options={[["troch", "At the level of the greater trochanters"], ["crest", "Higher, at the iliac crests"], ["thigh", "Lower, across the mid-thighs"]]} /><Gap />
          <button style={GO} disabled={!site} onClick={() => (site === "troch" ? setStep(1) : fail(site === "crest" ? "Too high. At the iliac crests it can't close the pelvic ring the way this injury needs." : "Too low. Across the thighs it does nothing for a pelvic fracture."))}>Slide it into place</button></>);
        return (<><Line>2. Tighten until the pelvis feels stable, not until it's crushing: {snug}% (aim for about 55).</Line>
          <Slider value={snug} onChange={setSnug} />
          <button style={GO} onClick={() => (snug < 55 - 18 * tol ? fail("Too loose. The pelvic ring can still open and the bleeding continues.") : snug > 55 + 18 * tol ? fail("Overtightened. That can worsen a lateral-compression fracture and injure the skin.") : win("Binder seated at the trochanters and snugged to a stable pelvis."))}>Secure the binder</button></>);
      }
      case "artLine": {
        if (step === 0) return (<><Line>1. Before you cannulate the radial artery, check collateral flow with an Allen's test: occlude both radial and ulnar arteries, have them make a fist, then release the ulnar only and watch the hand flush.</Line>
          <button style={site === "allen" ? NEUTRAL : GO} onClick={() => setSite("allen")}>{site === "allen" ? "Hand flushes pink within 7 seconds, ulnar collateral confirmed" : "Perform the Allen's test"}</button><Gap />
          <button style={GO} disabled={site !== "allen"} onClick={() => setStep(1)}>Continue</button></>);
        if (step === 1) return (<><Line>2. Palpate the pulse and enter at a shallow angle, bevel up: angle {rib}% (aim for about 30 to 40, much shallower than a venipuncture).</Line>
          <Slider value={rib} onChange={setRib} />
          <button style={GO} onClick={() => (rib > 60 * tol ? fail("Too steep. An artery sits shallow and you'll blow through the back wall.") : setStep(2))}>Advance toward the vessel</button></>);
        return (<><Line>3. Watch for a brisk, pulsatile flash of bright red blood, then thread the catheter: depth {Math.round(depth * 100)}%.</Line>
          <Slider value={depth * 100} onChange={(v) => setDepth(v / 100)} />
          <button style={GO} onClick={() => (depth < 0.35 ? fail("Not far enough. You saw the flash but pulled out before the catheter was fully in the vessel.")
            : depth > 0.85 ? fail("Advanced too far and transfixed the artery, through the back wall.") : win("Pulsatile flash, catheter threaded, and a real arterial waveform is up on the monitor."))}>Thread the catheter and connect</button></>);
      }
      case "reboa": {
        if (step === 0) return (<><Line>1. Access the common femoral artery below the inguinal ligament, then advance the sheath over a wire, Seldinger technique.</Line>
          <button style={site === "cfa" ? NEUTRAL : GO} onClick={() => setSite("cfa")}>{site === "cfa" ? "Sheath in, wire withdrawn" : "Access the common femoral artery"}</button><Gap />
          <button style={GO} disabled={site !== "cfa"} onClick={() => setStep(1)}>Continue</button></>);
        if (step === 1) return (<><Line>2. Advance the catheter to the right zone for this injury: Zone 1 (above the celiac axis) for intra-abdominal hemorrhage, Zone 3 (above the aortic bifurcation) for pelvic hemorrhage.</Line>
          <Choice value={grip} onChange={setGrip} placeholder="Choose the zone..." options={[["z1", "Zone 1, above the celiac axis"], ["z3", "Zone 3, above the aortic bifurcation"], ["z2", "Zone 2, between the renal arteries"]]} /><Gap />
          <button style={GO} disabled={!grip} onClick={() => (grip === "z2" ? fail("Zone 2 sits between the renal arteries. Never inflate there, it has no defined occlusion zone and risks the kidneys.") : setStep(2))}>Advance to the marked depth</button></>);
        return (<><Line>3. Inflate the balloon slowly under landmark guidance until you lose the distal pulse and the proximal pressure rises: inflation {Math.round(depth * 100)}%.</Line>
          <Slider value={depth * 100} onChange={(v) => setDepth(v / 100)} />
          <button style={GO} onClick={() => (depth < 0.6 ? fail("Underinflated. The balloon isn't fully occluding, and hemorrhage continues past it.")
            : depth > 0.95 ? fail("Overinflated. You risk rupturing the aortic wall.") : win(`Balloon inflated in ${grip === "z1" ? "Zone 1" : "Zone 3"}. Proximal pressure is up, distal flow occluded. Note the time, this is a very limited window.`))}>Inflate the balloon</button></>);
      }
      case "paCath": {
        if (step === 0) return (<><Line>1. The introducer is in the central vein. Inflate the balloon before you advance, so the catheter floats with venous flow through the right heart.</Line>
          <button style={site === "balloon" ? NEUTRAL : GO} onClick={() => setSite("balloon")}>{site === "balloon" ? "Balloon inflated, advancing" : "Inflate the balloon before advancing"}</button><Gap />
          <button style={GO} disabled={site !== "balloon"} onClick={() => setStep(1)}>Continue</button></>);
        return (<><Line>2. Watch the pressure waveform as it floats: right atrium, right ventricle, pulmonary artery, then a wedge tracing. Advance until you see the wedge, then stop and deflate: {Math.round(depth * 100)}%.</Line>
          <Slider value={depth * 100} onChange={(v) => setDepth(v / 100)} />
          <button style={GO} onClick={() => (depth < 0.7 ? fail("The waveform still shows right ventricle or pulmonary artery, not a wedge. Keep advancing gently.")
            : depth > 0.95 ? fail("Advanced past the wedge position, you risk perforating a distal pulmonary artery. Withdraw slightly.") : win("A clean wedge tracing. Deflate the balloon, advancing further with it still up would perforate the vessel."))}>Confirm the wedge and deflate</button></>);
      }
      case "cpap": {
        if (step === 0) return (<><Line>1. Fit the mask over the nose and mouth and check the seal. A leaking mask can't build the pressure this depends on.</Line>
          <button style={wiped ? NEUTRAL : GO} onClick={() => setWiped(true)}>{wiped ? "Good seal, no audible leak" : "Fit and seal the mask"}</button><Gap />
          <button style={GO} disabled={!wiped} onClick={() => setStep(1)}>Continue</button></>);
        return (<><Line>2. Set the pressure: {flow} cmH2O (start low, about 5, and titrate up as tolerated. Too high and an awake patient fights the mask).</Line>
          <Slider value={flow} onChange={setFlow} max={20} />
          <button style={GO} onClick={() => (flow < 3 ? fail("Too little pressure to do anything for this patient's work of breathing.")
            : flow > 12 && awake ? fail("That's a lot of pressure to start an awake patient on. They're fighting the mask instead of breathing with it, start lower.") : win(`CPAP running at ${flow} cmH2O with a good seal. Watch their work of breathing improve.`))}>Start CPAP</button></>);
      }
      case "vent": {
        if (step === 0) return (<><Line>1. Confirm the airway is secured, then connect the ventilator circuit.</Line>
          <button style={GO} onClick={() => setStep(1)}>Connect the circuit</button></>);
        return (<><Line>2. Set a lung-protective tidal volume for this patient's size: {Math.round(depth * 100)}% of target (aim for about 100%, close to 6 to 8 mL/kg. Too high risks barotrauma).</Line>
          <Slider value={depth * 100} onChange={(v) => setDepth(v / 100)} />
          <button style={GO} onClick={() => (depth < 0.6 ? fail("Too low a volume. This patient hypoventilates and retains CO2.") : depth > 1.3 ? fail("Too high a volume for a lung-protective strategy, that risks volutrauma, especially in ARDS or a stiff chest.") : win("Ventilator set to a lung-protective volume and rate. Watch EtCO2 and chest rise to confirm."))}>Set volume and start</button></>);
      }
      case "mouthMask":
      case "mouthMouth": {
        const withMask = procId === "mouthMask";
        if (step === 0) return (<><Line>1. {withMask ? "Seat the pocket mask over the nose and mouth, one-way valve toward you, and seal it with both hands." : "Pinch the nose closed and seal your mouth fully over theirs."}</Line>
          <button style={wiped ? NEUTRAL : GO} onClick={() => setWiped(true)}>{wiped ? "Seal confirmed, no leak" : "Get a good seal"}</button><Gap />
          <button style={GO} disabled={!wiped} onClick={() => setStep(1)}>Continue</button></>);
        return (<><Line>2. Give a slow breath over about one second, just enough to see the chest rise, one every 6 seconds: {ext}% (aim for about 50. Too little and the chest never rises, too much forces air into the stomach).</Line>
          <Slider value={ext} onChange={setExt} />
          <button style={GO} onClick={() => (ext < 35 * tol ? fail("Too little volume. The chest never actually rose.")
            : ext > 65 * (2 - tol) ? fail("Too much, too fast. That's forcing air into the stomach instead of the lungs, and risks vomiting.") : win("Chest rising with each breath, good rate and volume."))}>Deliver the breath</button></>);
      }
      case "ultrasound": {
        const w = US_WINDOWS[usIdx];
        if (step === 0 && usIdx === 0) return (<><Line>eFAST — a focused ultrasound for free fluid and pneumothorax. Four windows, in order.</Line>
          <button style={GO} onClick={() => setStep(1)}>Start with the subxiphoid view</button></>);
        return (<><Line>{usIdx + 1} of 4 — {w}. Fan the probe until you get a clear window: {usFine}% (aim for about 50).</Line>
          <Slider value={usFine} onChange={setUsFine} />
          <button style={GO} onClick={() => {
            if (Math.abs(usFine - 50) > 28 * tol) return fail("Rib shadow or gas is obscuring the view. Reangle the probe and try again.");
            const next = usIdx + 1;
            if (next < 4) { setUsFindings((f) => [...f, w]); setUsIdx(next); setUsFine(20); return; }
            return win(`All four windows captured (${[...usFindings, w].join(", ")}). Read the result on the monitor.`);
          }}>Capture this window</button></>);
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
        {!flash && (
          <ProcScene procId={procId} tight={tight} twist={twist} rib={rib} depth={depth} phase={phase} wiped={wiped}
            ext={ext} headPos={headPos} snug={snug} drift={drift} held={held} flow={flow}
            tankOpen={tankOpen} bagFilled={bagFilled} suctionOn={suctionOn} suctionT={suctionT}
            pressing={pressing} dpHeld={dpHeld} opened={opened} packDepth={packDepth} packPressing={packPressing}
            massaging={massaging} firm={firm}
            rollSide={rollSide} armSet={armSet} kneeSet={kneeSet} stance={stance} handPos={handPos} thrusts={thrusts}
            aligned={aligned} hitch={hitch} tractionForce={tractionForce} usIdx={usIdx} usFine={usFine} />
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
