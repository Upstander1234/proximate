import { useState, useEffect, useRef } from "react";
import { C, MONO } from "../theme.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { ecgPoints } from "../ecg.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// A real device screen for AED/defibrillator/cardioversion/pacing, replacing
// ProcMinigame's old shared "torso + two amber rectangles" scene for these
// five procedures — which had no rhythm display, no charge/energy readout,
// and (despite the cardioversion step's own text telling the player to
// "watch for the sync marker") never actually drew one.
//
// screenType distinguishes real equipment tiers rather than treating every
// shock delivery as the same device:
//   "aedBasic"  — a screenless AED (BLS/Layperson/EMT scope): voice-prompt
//                 banner text only, no waveform. Real basic AEDs have no
//                 display at all — the device talks, it doesn't show.
//   "aedScreen" — a paramedic's cardiac monitor running in AED/semi-auto
//                 mode: the same voice-prompt flow, plus the live rhythm.
//   "monitorDefib" — full manual mode (defib/cardiovert/pacing, all
//                 paramedic-scope already): live rhythm, energy/charge
//                 readout, a real SYNC marker overlay for cardioversion,
//                 and pacer spikes + a capture indicator for pacing.
//
// The rhythm trace reuses ecg.js's own ecgPoints() — the SAME synthesis the
// rest of the game (the Monitor tab's waveform strip) already renders, not a
// second implementation that could drift from it.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);
const DANGER = btn("#2A1418", C.red, C.red);
const Line = ({ children }) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{children}</div>;
const Slider = ({ value, onChange, min = 0, max = 100 }) => (
  <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
);

// Finds local-maximum (and, for a downward-deflecting lead, minimum) points
// in a rendered trace to place QRS markers — reusing the ACTUAL drawn
// samples rather than inventing separate peak-timing math, so a marker is
// always exactly where the trace really peaks, not a plausible guess.
function findPeaks(pts, { min = false } = {}) {
  const peaks = [];
  const mid = pts.length ? pts[0][1] : 0;
  for (let i = 4; i < pts.length - 4; i++) {
    const y = pts[i][1];
    const isExtreme = min ? y < mid - 8 : y > mid + 8;
    if (!isExtreme) continue;
    const isLocalExtreme = min
      ? y <= pts[i - 3][1] && y <= pts[i + 3][1]
      : y >= pts[i - 3][1] && y >= pts[i + 3][1];
    if (isLocalExtreme && (!peaks.length || pts[i][0] - peaks[peaks.length - 1] > 30)) peaks.push(pts[i][0]);
  }
  return peaks;
}

// The device screen face itself: dark LCD, rhythm trace, optional sync
// markers (cardioversion) or pacer spikes + capture flag (pacing), plus a
// small energy/charge readout row.
function DeviceScreen({ ecgKind, w = 340, h = 90, sync, pacing, paceRate, mA, captured, energyLabel, statusLine, statusColor }) {
  const pts = ecgPoints(ecgKind, w, h, 0);
  const peaks = sync ? findPeaks(pts) : [];
  // A pacer spike is a device artifact, not a cardiac deflection — drawn at
  // the SET pacing interval (independent of the underlying rhythm), which is
  // the real, distinguishing look of a paced trace.
  const spikeInterval = pacing && paceRate ? Math.max(14, Math.round(1800 / paceRate)) : null;
  const spikes = [];
  if (spikeInterval) for (let x = 6; x < w; x += spikeInterval) spikes.push(x);
  return (
    <div style={{ background: "#04140A", border: `1px solid #1B3A24`, borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".14em", color: "#3FA65A" }}>ECG II {sync ? "· SYNC" : ""}</span>
        {energyLabel && <span style={{ fontFamily: MONO, fontSize: 9, color: C.amber }}>{energyLabel}</span>}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 64, display: "block" }}>
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#3FA65A" strokeWidth="1.3" />
        {sync && peaks.map((x) => (
          <polygon key={x} points={`${x - 4},4 ${x + 4},4 ${x},12`} fill={C.amber} />
        ))}
        {pacing && spikes.map((x) => (
          <line key={x} x1={x} y1={6} x2={x} y2={h - 6} stroke={mA >= 10 ? "#E9C24C" : "#3A4A2A"} strokeWidth="1.6" />
        ))}
      </svg>
      {pacing && (
        <div style={{ fontFamily: MONO, fontSize: 9, color: captured ? C.hr : C.faint, marginTop: 2 }}>
          {paceRate} PPM · {mA} mA {captured ? "· CAPTURED" : mA > 0 ? "· NO CAPTURE" : ""}
        </div>
      )}
      {statusLine && <div style={{ fontFamily: MONO, fontSize: 11, color: statusColor || "#3FA65A", marginTop: 4, letterSpacing: ".04em" }}>{statusLine}</div>}
    </div>
  );
}

export default function MonitorScreenMinigame({ open, kind, procId, pat, screenType, energyJ, assist, interrupted, onResolve }) {
  const [phase, setPhase] = useState("ready");           // aedAnalyze: ready -> analyzing -> result
  const [clear, setClear] = useState({ hands: false, o2: false, call: false });
  const [sync, setSync] = useState(procId === "cardiovert" ? null : true); // cardiovert: null until chosen
  const [energy, setEnergy] = useState(100);
  const [padPlacement, setPadPlacement] = useState("");
  const [paceRate, setPaceRate] = useState(70);
  const [mA, setMa] = useState(0);
  const [captureOk, setCaptureOk] = useState(false);
  const [flash, setFlash] = useState(null);
  const analyzeTimer = useRef(null);

  useEffect(() => () => { if (analyzeTimer.current) clearTimeout(analyzeTimer.current); }, []);

  if (!open || kind !== "monitor") return null;
  const tol = assistToleranceMult(assist);
  const v = pat?.vitals ? (() => { try { return pat.vitals(); } catch { return null; } })() : null;
  const ecgKind = v?.ecg || "sinus";
  const shockable = v?.rhythm === "VF" || v?.rhythm === "VT" || v?.ecg === "VF" || v?.ecg === "VT";
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why) => setFlash({ ok: true, why });
  const hasMonitorScreen = screenType !== "aedBasic";
  const allClear = clear.hands && clear.o2 && clear.call;

  const ClearChecklist = () => (
    <>{[["hands", "Hands off. Nobody touching the patient or the stretcher"], ["o2", "Oxygen moved away from the chest"], ["call", "Call it: \"I'm clear, you're clear, everybody clear\""]].map(([k, l]) => (
      <div key={k} style={{ marginBottom: 6 }}>
        <button style={clear[k] ? NEUTRAL : GO} onClick={() => setClear({ ...clear, [k]: true })}>{clear[k] ? `Done: ${l}` : l}</button>
      </div>))}</>
  );

  const body = () => {
    if (procId === "aedAnalyze") {
      if (phase === "ready") return (<><Line>Stand clear and start the rhythm analysis. Nobody should be touching the patient — motion defeats the analysis.</Line>
        <button style={GO} onClick={() => { setPhase("analyzing"); analyzeTimer.current = setTimeout(() => setPhase("result"), 1500); }}>Start analysis</button></>);
      if (phase === "analyzing") return (<><DeviceScreen ecgKind={ecgKind} statusLine={hasMonitorScreen ? undefined : undefined} />
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 13, color: C.amber, letterSpacing: ".1em" }}>ANALYZING — DO NOT TOUCH PATIENT</div></>);
      return (<>{hasMonitorScreen && <DeviceScreen ecgKind={ecgKind} statusLine={shockable ? "SHOCK ADVISED" : "NO SHOCK ADVISED"} statusColor={shockable ? C.red : "#3FA65A"} />}
        {!hasMonitorScreen && <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 15, color: shockable ? C.red : "#3FA65A", letterSpacing: ".08em", margin: "10px 0" }}>
          {shockable ? "SHOCK ADVISED" : "NO SHOCK ADVISED"}</div>}
        <button style={GO} onClick={() => win(shockable ? "Analysis complete. Shock advised." : "Analysis complete. No shock advised.")}>Continue</button></>);
    }
    if (procId === "aedShock") return (<>
      <DeviceScreen ecgKind={ecgKind} statusLine={hasMonitorScreen ? "SHOCK ADVISED — CHARGING" : undefined} statusColor={C.red} />
      <Line>Clear the patient before you shock.</Line>
      <ClearChecklist />
      <button style={DANGER} disabled={!allClear} onClick={() => (!allClear ? fail("You shocked before clearing everyone. That shock could have hurt a rescuer.") : win("Clear. Shock delivered."))}>
        DELIVER SHOCK</button></>);
    if (procId === "defib") return (<>
      <DeviceScreen ecgKind={ecgKind} energyLabel={energyJ ? `CHARGED — ${energyJ} J` : "SELECT ENERGY ON MONITOR"} />
      <Line>Clear the patient before you shock.</Line>
      <ClearChecklist />
      <button style={DANGER} disabled={!allClear} onClick={() => (!allClear ? fail("You shocked before clearing everyone. That shock could have hurt a rescuer.") : win("Clear. Shock delivered."))}>
        DELIVER SHOCK</button></>);
    if (procId === "cardiovert") {
      if (sync == null) return (<><Line>This is cardioversion, not defibrillation — the patient still has a pulse. The shock must be SYNCHRONIZED to fire on the R wave, never during the vulnerable T wave, or you risk inducing VF.</Line>
        <DeviceScreen ecgKind={ecgKind} />
        <button style={GO} onClick={() => setSync(true)}>Enable SYNC mode</button>
        <div style={{ height: 8 }} />
        <button style={NEUTRAL} onClick={() => fail("You shocked asynchronously on a patient with a pulse. An unsynchronized shock can land on the T wave and induce VF, exactly what cardioversion exists to avoid.")}>Leave in standard (unsynchronized) mode</button></>);
      return (<><DeviceScreen ecgKind={ecgKind} sync energyLabel={`${energy} J`} />
        <Line>A sync marker should land on every QRS before you charge — watch it track on the trace above. Energy: start low (about 50-100 J) and escalate if it doesn't convert.</Line>
        <Slider value={energy} onChange={setEnergy} max={200} />
        <Line>Clear the patient, same as a defibrillation — expect a short delay while it waits for the next R wave.</Line>
        <ClearChecklist />
        <button style={DANGER} disabled={!allClear} onClick={() => (!allClear ? fail("You shocked before clearing everyone. That shock could have hurt a rescuer.")
          : energy < 30 / tol ? fail("Too little energy to reliably convert this rhythm. Go higher.")
          : win(`Synchronized shock delivered at ${energy} J. The monitor waited for the R wave and fired cleanly.`))}>
          DELIVER SYNCHRONIZED SHOCK</button></>);
    }
    if (procId === "pacing") {
      if (!padPlacement) return (<><Line>Place the pacing pads anterior-posterior, one over the left precordium, one on the back below the left scapula. Anterior-lateral (the defib placement) captures less reliably for pacing.</Line>
        <button style={GO} onClick={() => setPadPlacement("ap")}>Anterior-posterior</button>
        <div style={{ height: 8 }} />
        <button style={NEUTRAL} onClick={() => fail("Anterior-lateral placement is fine for a shock, but it captures less reliably for transcutaneous pacing. Use anterior-posterior.")}>Anterior-lateral, same as defib pads</button></>);
      return (<><DeviceScreen ecgKind={ecgKind} pacing paceRate={paceRate} mA={mA} captured={captureOk} />
        <Line>Rate: {paceRate} bpm (aim for about 70-80).</Line>
        <Slider value={paceRate} onChange={setPaceRate} min={40} max={120} />
        <Line>Current: {mA} mA — increase from zero until a pacer spike is followed by a wide QRS (electrical capture), then confirm MECHANICAL capture with a pulse check.</Line>
        <Slider value={mA} onChange={setMa} max={140} />
        <button style={captureOk ? NEUTRAL : GO} onClick={() => setCaptureOk(mA >= 50 / tol)}>
          {captureOk ? "Pulse confirmed at the paced rate" : "Check for a pulse matching the paced rate"}</button>
        <div style={{ height: 8 }} />
        <button style={GO} onClick={() => (mA < 50 / tol ? fail("No capture yet at this current. Every pacer spike is followed by a flat line, not a QRS. Turn it up.")
          : !captureOk ? fail("You never confirmed a pulse. Electrical capture on the monitor doesn't guarantee the heart is actually contracting. Check mechanically before you trust it.")
          : win(`Capturing at ${mA} mA, ${paceRate} bpm, with a palpable pulse to match.`))}>Confirm and hold</button></>);
    }
    return null;
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>
          {screenType === "aedBasic" ? "AED (no screen)" : screenType === "aedScreen" ? "AED — monitor mode" : "Cardiac monitor / defibrillator"}</div>
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
