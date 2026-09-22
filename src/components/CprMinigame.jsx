import { useState, useRef, useEffect } from "react";
import { C, MONO } from "../theme.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";
import HandoffRow from "./HandoffRow.jsx";

// Hands-on CPR, continuous. One click on the chest is one compression, delivered
// at the depth set on the slider (adult target 5 to 6 cm) and the rate you click
// at (target 100 to 120 a minute). It runs live: App.jsx's onProgress feeds a
// rolling quality score into pat.cprQuality every few compressions and keeps the
// compression dose fresh, and you stop whenever you choose (a real pause).
//
// STAMINA. Each compression drains a stamina bar; how fast depends on the
// player's fitness (campaign stat, maxed in Medical Simulation). Past half
// stamina your compressions get shallower and weaker than the depth you set,
// and it only recovers while you rest. Hand off to a crew member before it
// runs out.
const DEPTH_LO = 5, DEPTH_HI = 6;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const depthScore = (d) => (d >= DEPTH_LO && d <= DEPTH_HI ? 1 : clamp01(1 - (d < DEPTH_LO ? DEPTH_LO - d : d - DEPTH_HI) / 2));
const rateScore = (r) => (r == null ? 1 : r < 100 ? clamp01(1 - (100 - r) / 40) : r > 120 ? clamp01(1 - (r - 120) / 40) : 1);
const REGEN_PER_SEC = 100 / 60;   // a full bar back in a minute of rest

export default function CprMinigame({ open, kind, pat, fitness, crew, interrupted, onProgress, onFinish, onAbort, onHandoff }) {
  const [depth, setDepth] = useState(4);
  const [count, setCount] = useState(0);
  const [rate, setRate] = useState(null);
  const [last, setLast] = useState(null);
  const [stamina, setStamina] = useState(100);
  const [pressed, setPressed] = useState(false);
  const stamps = useRef([]);
  const scores = useRef([]);
  const depths = useRef([]);
  const lastPress = useRef(0);
  const staminaRef = useRef(100);

  // Recover stamina while resting (no press for 1.5 s).
  useEffect(() => {
    if (!open || kind !== "cpr") return undefined;
    const id = setInterval(() => {
      if (performance.now() - lastPress.current > 1500 && staminaRef.current < 100) {
        staminaRef.current = Math.min(100, staminaRef.current + REGEN_PER_SEC * 0.25);
        setStamina(staminaRef.current);
      }
    }, 250);
    return () => clearInterval(id);
  }, [open, kind]);

  if (!open || kind !== "cpr") return null;

  const drain = 100 / (120 + 12 * (fitness ?? 10));
  // 1 above half stamina, falling to 0.55 when empty.
  const fatigueMult = (st) => (st >= 50 ? 1 : 0.55 + 0.45 * (st / 50));
  const fm = fatigueMult(stamina);
  const delivered = depth * fm;

  const press = () => {
    const now = performance.now();
    lastPress.current = now;
    const st = stamps.current;
    st.push(now);
    if (st.length > 6) st.shift();
    let r = null;
    if (st.length >= 3) r = Math.round(60000 / ((st[st.length - 1] - st[0]) / (st.length - 1)));
    if (st.length >= 2 && now - st[st.length - 2] > 3000) { stamps.current = [now]; r = null; }
    const fmNow = fatigueMult(staminaRef.current);
    const d = depth * fmNow;
    const s = (0.6 * depthScore(d) + 0.4 * rateScore(r)) * (0.7 + 0.3 * fmNow);
    scores.current.push(s);
    depths.current.push(d);
    staminaRef.current = Math.max(0, staminaRef.current - drain);
    setStamina(staminaRef.current);
    const n = scores.current.length;
    const recent = scores.current.slice(-10);
    const q = recent.reduce((a, b) => a + b, 0) / recent.length;
    setCount(n); setRate(r);
    setLast(d < DEPTH_LO ? "Too shallow" : d > DEPTH_HI ? "Too deep" : "Good depth");
    setPressed(true); setTimeout(() => setPressed(false), 90);
    if (n === 1 || n % 4 === 0) onProgress(q, n);
  };

  const summary = () => {
    const n = scores.current.length;
    if (!n) return null;
    const avgDepth = depths.current.reduce((a, b) => a + b, 0) / n;
    const good = depths.current.filter((d) => d >= DEPTH_LO && d <= DEPTH_HI).length / n;
    return { count: n, avgDepth, goodDepth: good, rate, quality: scores.current.reduce((a, b) => a + b, 0) / n };
  };
  const finish = () => { const sm = summary(); if (!sm) { onAbort(); return; } onFinish(sm); };
  const handoff = (cid) => onHandoff(cid, summary());

  const depthColor = delivered >= DEPTH_LO && delivered <= DEPTH_HI ? C.hr : C.amber;
  const rateColor = rate == null ? C.faint : rate >= 100 && rate <= 120 ? C.hr : C.amber;
  const stColor = stamina > 50 ? C.hr : stamina > 25 ? C.amber : C.red;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{"@keyframes cprBeat{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}"}</style>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Chest compressions</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Keep going or stop and attend to them.
          </div>
        )}
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>
          Set the depth, then click the chest once per compression. Aim for {DEPTH_LO} to {DEPTH_HI} cm at 100 to 120 a minute. Stop whenever you like.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: C.faint }}>Depth you set</span>
          <span style={{ color: C.text, fontFamily: MONO }}>{depth.toFixed(1)} cm</span>
        </div>
        <input type="range" min={2} max={8} step={0.1} value={depth} onChange={(e) => setDepth(Number(e.target.value))} style={{ width: "100%", marginBottom: 6 }} />
        <div style={{ position: "relative", height: 6, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 3, marginBottom: 8 }}>
          <div style={{ position: "absolute", left: `${((DEPTH_LO - 2) / 6) * 100}%`, width: `${((DEPTH_HI - DEPTH_LO) / 6) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
          <span style={{ color: C.faint }}>Depth you are actually delivering</span>
          <span style={{ color: depthColor, fontFamily: MONO }}>{delivered.toFixed(1)} cm{fm < 1 ? " (tiring)" : ""}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.faint, marginBottom: 3 }}>
          <span>Stamina</span><span style={{ color: stColor, fontFamily: MONO }}>{Math.round(stamina)}%</span>
        </div>
        <div style={{ height: 10, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ width: `${stamina}%`, height: "100%", background: stColor, transition: "width 120ms" }} />
        </div>
        {stamina < 40 && (
          <div style={{ fontSize: 11.5, color: stColor, marginBottom: 6 }}>
            {stamina < 15 ? "You are exhausted and your compressions are weak. Hand off now." : "You are tiring, and quality is dropping. Consider swapping compressors."}
          </div>
        )}

        <button onClick={press} aria-label="Compress the chest"
          style={{ width: "100%", height: 100, borderRadius: 10, cursor: "pointer", fontSize: 15, letterSpacing: ".1em", marginTop: 4,
            background: pressed ? "#3A1418" : "#2A1418", border: `2px solid ${C.red}`, color: C.red,
            transform: pressed ? `scale(${1 - delivered * 0.012})` : "none", transition: "transform 60ms" }}>
          PUSH
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontFamily: MONO, fontSize: 12 }}>
          <span style={{ color: C.text }}>Compressions {count}</span>
          <span style={{ color: rateColor }}>{rate == null ? "Rate --" : `${rate}/min`}</span>
          <span style={{ color: last === "Good depth" ? C.hr : C.amber }}>{last || "--"}</span>
          <span title="110 per minute" style={{ width: 12, height: 12, borderRadius: "50%", background: C.hr, animation: "cprBeat 0.545s infinite" }} />
        </div>

        <HandoffRow crew={crew} verb="compressions" onHandoff={handoff} />
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button onClick={finish} style={{ background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>
            Stop compressions</button>
        </div>
      </div>
    </div>
  );
}
