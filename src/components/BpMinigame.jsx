import { useState, useEffect, useRef } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Manual blood pressure by auscultation. A real arm with a real cuff and a
// real manometer needle, not a label. Placing the stethoscope wrong (over
// the biceps tendon instead of the brachial artery) makes the sounds
// unusable, exactly like the real exam. Inflating too little doesn't fail
// outright, it does what it does in life: the cuff is already at or below
// systolic when release starts, so a sound is audible from the very first
// tick and the player's own "systolic" mark reads falsely low — an emergent
// consequence of the same pressure math, not a scripted penalty. Deflating
// past a mark without releasing it is simply never marked, same as missing
// a beat for real.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);
const Line = ({ children }) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{children}</div>;

const SPOTS = [
  { id: "brachial", x: 100, y: 62, label: "Medial antecubital fossa (brachial artery)", ok: true },
  { id: "tendon", x: 118, y: 58, label: "Center of the fossa, over the biceps tendon", ok: false },
  { id: "wrist", x: 100, y: 92, label: "Down at the wrist", ok: false },
];

// The dial, plus (when relevant) a real squeeze bulb or release valve
// rendered right below it — the player pumps/releases by pressing directly
// on that piece of equipment, not a button with no equipment behind it.
function Gauge({ pressure, pumpable, releasable, pumping, releasing, onPumpDown, onPumpUp, onReleaseDown, onReleaseUp }) {
  const pct = Math.max(0, Math.min(1, pressure / 300));
  const ang = -120 + pct * 240;
  const rad = (ang * Math.PI) / 180;
  const cx = 60, cy = 60, r = 40;
  const nx = cx + r * Math.sin(rad), ny = cy - r * Math.cos(rad);
  return (
    <svg viewBox="0 0 120 150" style={{ width: 110, height: 137, touchAction: "none" }}>
      <path d="M20,66 A40,40 0 1 1 100,66" fill="none" stroke={C.line} strokeWidth={3} />
      {[0, 60, 120, 180, 240, 300].map((v) => {
        const a = ((-120 + (v / 300) * 240) * Math.PI) / 180;
        const x1 = cx + (r - 4) * Math.sin(a), y1 = cy - (r - 4) * Math.cos(a);
        const x2 = cx + r * Math.sin(a), y2 = cy - r * Math.cos(a);
        return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.faint} strokeWidth={1.5} />;
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.red} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3.5} fill={C.text} />
      <text x={cx} y={82} textAnchor="middle" fontSize="11" fill={C.text} fontWeight="700">{Math.round(pressure)}</text>
      {pumpable && (
        <g onPointerDown={onPumpDown} onPointerUp={onPumpUp} onPointerLeave={onPumpUp} style={{ cursor: pumping ? "grabbing" : "grab" }}>
          <line x1={cx} y1={100} x2={cx} y2={110} stroke="#8A9AA2" strokeWidth={2.5} />
          <ellipse cx={cx} cy={pumping ? 128 : 124} rx={pumping ? 20 : 17} ry={pumping ? 16 : 19} fill={pumping ? "#3A4A54" : "#4D5F6A"} stroke={C.line} strokeWidth={1.4} />
          <text x={cx} y={128} textAnchor="middle" fontSize="8" fill={C.faint}>squeeze</text>
        </g>
      )}
      {releasable && (
        <g onPointerDown={onReleaseDown} onPointerUp={onReleaseUp} onPointerLeave={onReleaseUp} style={{ cursor: releasing ? "grabbing" : "grab" }}>
          <line x1={cx} y1={100} x2={cx} y2={112} stroke="#8A9AA2" strokeWidth={2.5} />
          <circle cx={cx} cy={122} r={13} fill={releasing ? C.amber : "#4D5F6A"} opacity={releasing ? 0.7 : 1} stroke={C.line} strokeWidth={1.4} />
          <line x1={cx - 8} y1={122} x2={cx + 8} y2={122} stroke="#16202A" strokeWidth={2.5} strokeLinecap="round" />
          <text x={cx} y={142} textAnchor="middle" fontSize="8" fill={C.faint}>valve</text>
        </g>
      )}
    </svg>
  );
}

function Arm({ onPick, chosen, cuffPressure, inflated }) {
  const w = 20 + Math.min(14, cuffPressure / 20);
  return (
    <svg viewBox="0 0 200 110" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
      <defs>
        <linearGradient id="bpArmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3AE87" />
          <stop offset="55%" stopColor="#CD9068" />
          <stop offset="100%" stopColor="#B87A54" />
        </linearGradient>
        <linearGradient id="bpCuffGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6690F2" />
          <stop offset="100%" stopColor="#3E5FBF" />
        </linearGradient>
      </defs>
      <rect x={26} y={40} width={90} height={44} rx={20} fill="url(#bpArmGrad)" />
      <rect x={106} y={44} width={80} height={36} rx={16} fill="url(#bpArmGrad)" transform="rotate(-6 106 62)" />
      {/* elbow crease and forearm highlight, so this reads as a real limb */}
      <path d="M100,42 Q110,62 100,82" fill="none" stroke="#8A5E45" strokeWidth={1.4} opacity={0.35} />
      <path d="M30,44 Q60,38 110,46" fill="none" stroke="#F3CBA8" strokeWidth={1.2} opacity={0.4} />
      {inflated && <rect x={40} y={30} width={70} height={64} rx={16} fill="url(#bpCuffGrad)" opacity={0.55} stroke={C.line} strokeWidth={1} />}
      {inflated && <rect x={44} y={34} width={62} height={w} rx={10} fill="#3E68D6" opacity={0.35} />}
      {inflated && [0.3, 0.5, 0.7].map((f) => (
        <line key={f} x1={44} y1={30 + 64 * f} x2={110} y2={30 + 64 * f} stroke="#1B2A5C" strokeWidth={0.6} opacity={0.3} />
      ))}
      {SPOTS.map((s) => (
        <circle key={s.id} cx={s.x} cy={s.y} r={7}
          fill={chosen === s.id ? (s.ok ? "#7CD68A" : C.red) : "#16202A"}
          opacity={chosen ? (chosen === s.id ? 0.9 : 0.25) : 0.4}
          stroke={C.line} strokeWidth={1}
          onClick={() => !chosen && onPick(s.id)} style={{ cursor: chosen ? "default" : "pointer" }} />
      ))}
    </svg>
  );
}

export default function BpMinigame({ open, kind, pat, assist, interrupted, onResolve }) {
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [pressure, setPressure] = useState(0);
  const [pumping, setPumping] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [sysMark, setSysMark] = useState(null);
  const [diaMark, setDiaMark] = useState(null);
  const [flash, setFlash] = useState(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!pumping) return undefined;
    const id = setInterval(() => setPressure((p) => Math.min(300, p + 6)), 90);
    return () => clearInterval(id);
  }, [pumping]);

  useEffect(() => {
    if (!releasing) return undefined;
    const id = setInterval(() => setPressure((p) => Math.max(0, p - 2)), 110);
    return () => clearInterval(id);
  }, [releasing]);

  // Close the AudioContext on unmount so a closed/resolved minigame doesn't
  // leave a live context running in the background.
  useEffect(() => () => { try { ctxRef.current?.close(); } catch { /* already closed */ } }, []);

  // v/audible are computed here, ABOVE the early return below, purely so the
  // Korotkoff-tap effect right after can read them — every hook in this
  // component has to run every render regardless of `open`/`kind`, so
  // nothing that feeds a hook can live after the early return.
  let v; try { v = pat?.vitals ? pat.vitals() : null; } catch { v = null; }
  const trueSbp = v?.sbp ?? 118, trueDbp = v?.dbp ?? 76;
  const goodSpot = chosen === "brachial";
  const audible = goodSpot && pressure <= trueSbp && pressure > trueDbp;

  // A short, low-pitched thump synthesized on the fly (no audio file) — the
  // same "no external files to fetch" approach this project's siren/voice
  // already use. Created lazily and unlocked from a real pointerdown (the
  // bulb/valve buttons), since some browsers refuse to start audio that
  // wasn't triggered directly by a user gesture.
  const ensureCtx = () => {
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no audio available */ }
    }
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume?.();
    return ctxRef.current;
  };
  const tap = () => {
    const ctx = ensureCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(85, t); osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.12);
  };

  // Korotkoff sounds happen once per heartbeat, so the tap plays on the
  // patient's own rate while the cuff pressure sits between diastolic and
  // systolic — silent outside that band, same as the visual indicator.
  useEffect(() => {
    if (!open || kind !== "bp" || step !== 2 || !audible) return undefined;
    const hr = v?.hr > 0 ? v.hr : 80;
    tap();
    const id = setInterval(tap, 60000 / hr);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind, step, audible, v?.hr]);

  if (!open || kind !== "bp") return null;
  const tol = assistToleranceMult(assist);
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why) => setFlash({ ok: true, why });

  const mark = (which) => {
    const rd = Math.round(pressure / 2) * 2;
    if (which === "sys") setSysMark(rd); else setDiaMark(rd);
  };

  const finish = () => {
    const loS = trueSbp - 6 * tol, hiS = trueSbp + 6 * tol;
    const loD = trueDbp - 6 * tol, hiD = trueDbp + 6 * tol;
    if (sysMark == null || diaMark == null) { fail("You let the cuff run all the way down without marking both sounds. No reading."); return; }
    if (diaMark >= sysMark) { fail("That diastolic mark is at or above the systolic mark. Something was heard out of order — redo it."); return; }
    const sysOk = sysMark >= loS && sysMark <= hiS, diaOk = diaMark >= loD && diaMark <= hiD;
    if (sysOk && diaOk) { win(`${sysMark} over ${diaMark}, by auscultation. Clear first sound, clear disappearance.`); return; }
    if (!sysOk && sysMark < loS) fail(`Systolic reads low (${sysMark}). The cuff likely wasn't inflated high enough before you started listening — the first beats were already there when you began.`);
    else if (!sysOk) fail(`Systolic reads high (${sysMark}). You marked it before the sound was really there.`);
    else fail(`Diastolic reads off (${diaMark}). You marked it before the sound actually disappeared, or after you'd already stopped listening closely.`);
  };

  const body = () => {
    if (step === 0) return (<>
      <Line>1. Place the stethoscope over the brachial artery, medial side of the antecubital fossa.</Line>
      {!chosen ? <Line>Click a spot on the arm.</Line> : (
        <Line>{goodSpot ? "Good pulse under the diaphragm." : "Weak or no pulse here. Wrong spot."}</Line>
      )}
      {chosen && (<button style={goodSpot ? GO : NEUTRAL} onClick={() => (goodSpot ? setStep(1) : (setChosen(null)))}>
        {goodSpot ? "Continue" : "Try again"}</button>)}
    </>);
    if (step === 1) {
      const canRelease = pressure >= 40;
      return (<>
        <Line>2. Press and hold the bulb to inflate the cuff. Go well past where you'd expect the pulse to disappear.</Line>
        <button style={canRelease ? GO : NEUTRAL} disabled={!canRelease} onClick={() => setStep(2)}>Start releasing the valve</button>
      </>);
    }
    // step 2: deflate and auscultate
    return (<>
      <Line>3. Press and hold the valve to crack it open and let the pressure fall slowly. Mark the first sound, then mark where it disappears.</Line>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: audible ? C.hr : "#16202A", border: `1px solid ${audible ? C.hr : C.line}`,
          boxShadow: audible ? `0 0 8px ${C.hr}` : "none" }} />
        <span style={{ fontSize: 12, color: audible ? C.hr : C.faint }}>{audible ? "Tapping sound, clear." : "Silence."}</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button style={sysMark != null ? NEUTRAL : GO} onClick={() => mark("sys")}>
          {sysMark != null ? `Systolic marked: ${sysMark}` : "Mark: first sound"}</button>
        <button style={diaMark != null ? NEUTRAL : GO} disabled={sysMark == null} onClick={() => mark("dia")}>
          {diaMark != null ? `Diastolic marked: ${diaMark}` : "Mark: sound gone"}</button>
      </div>
      <button style={GO} disabled={diaMark == null && pressure > 0} onClick={finish}>Finish and report</button>
    </>);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Manual blood pressure</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <Arm onPick={setChosen} chosen={chosen} cuffPressure={pressure} inflated={step >= 1} />
            </div>
            <Gauge pressure={pressure}
              pumpable={step === 1} pumping={pumping} onPumpDown={() => { ensureCtx(); setPumping(true); }} onPumpUp={() => setPumping(false)}
              releasable={step === 2} releasing={releasing} onReleaseDown={() => { ensureCtx(); setReleasing(true); }} onReleaseUp={() => setReleasing(false)} />
          </div>
        )}
        {!flash && body()}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash.ok ? "#7CD68A" : C.red, marginBottom: 10 }}>{flash.why}</div>
            <button style={NEUTRAL} onClick={() => (flash.ok ? onResolve(PROCEDURE_OUTCOME.SUCCESS, { sbp: sysMark, dbp: diaMark }) : onResolve(PROCEDURE_OUTCOME.FAILED, flash.why))}>Continue</button>
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
