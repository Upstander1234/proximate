import { useState, useRef, useEffect } from "react";
import { C, MONO } from "../theme.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";
import HandoffRow from "./HandoffRow.jsx";

// Bag-valve-mask ventilation, continuous. Get a mask seal, then squeeze once per
// breath: how long you hold sets the volume (aim for visible chest rise, the
// green band), and the gap between squeezes sets the rate (aim for one every 5
// to 6 seconds, 10 a minute). It runs live: every second onProgress pushes the
// current volume and rate factors into pat.bvmVolQ / bvmRateQ, which scale the
// engine's assisted ventilation. Stop bagging whenever you choose, or hand it
// to another provider.
const VOL_LO = 0.4, VOL_HI = 0.7;
const TARGET_RATE = 10;

// The bag itself: mask sealed over the face, self-inflating bag that
// compresses live with the squeeze (`vol`), and a chest that visibly rises
// once a breath lands in-band — the same visual cue "chest rise" trains a
// provider to watch for at the real bedside.
function BagScene({ sealed, vol, msg }) {
  const squeeze = 1 - vol * 0.45; // bag narrows as it's squeezed
  const rose = msg && msg.startsWith("Good");
  return (
    <svg viewBox="0 0 200 110" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
      <defs>
        <linearGradient id="bvmSkinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3AE87" />
          <stop offset="100%" stopColor="#B87A54" />
        </linearGradient>
        <radialGradient id="bvmBagGrad" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3F8A5F" />
          <stop offset="100%" stopColor="#1E4A32" />
        </radialGradient>
        <linearGradient id="bvmMaskGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D7EBF0" />
          <stop offset="100%" stopColor="#9FC2CC" />
        </linearGradient>
      </defs>
      {/* chest, rising visibly on a good breath */}
      <path d={`M${100 - (rose ? 48 : 42)},96 Q100,${rose ? 76 : 88} ${100 + (rose ? 48 : 42)},96 L${100 + (rose ? 48 : 42)},110 L${100 - (rose ? 48 : 42)},110 Z`}
        fill="url(#bvmSkinGrad)" />
      {rose && <path d={`M${100 - 48},96 Q100,76 ${100 + 48},96`} fill="none" stroke="#F3CBA8" strokeWidth={1.5} opacity={0.5} />}
      {/* head, shaded rather than a flat oval */}
      <ellipse cx={38} cy={62} rx={22} ry={18} fill="url(#bvmSkinGrad)" />
      <path d="M22,52 Q34,42 50,50" fill="none" stroke="#F3CBA8" strokeWidth={1.2} opacity={0.4} />
      {sealed && (
        <>
          <ellipse cx={48} cy={62} rx={16} ry={14} fill="url(#bvmMaskGrad)" opacity={0.85} stroke={C.line} strokeWidth={1} />
          <ellipse cx={44} cy={57} rx={5} ry={3} fill="#FFFFFF" opacity={0.35} />
          <circle cx={48} cy={62} r={4} fill="#5C7A85" opacity={0.5} />
        </>
      )}
      <line x1={64} y1={62} x2={82} y2={62} stroke="#8A9AA2" strokeWidth={4} />
      {/* self-inflating bag, compressing with the squeeze */}
      <ellipse cx={82 + 32 * squeeze} cy={62} rx={32 * squeeze} ry={26} fill="url(#bvmBagGrad)" stroke={C.hr} strokeWidth={1.4} />
      <ellipse cx={72 + 20 * squeeze} cy={52} rx={10 * squeeze} ry={7} fill="#FFFFFF" opacity={0.12} />
      <rect x={82} y={44} width={8} height={36} fill="#16202A" />
      <rect x={78} y={40} width={16} height={6} rx={2} fill="#22303A" />
    </svg>
  );
}

export default function BvmMinigame({ open, kind, pat, crew, interrupted, onProgress, onStop, onHandoff }) {
  const [sealed, setSealed] = useState(false);
  const [vol, setVol] = useState(0);
  const [squeezing, setSqueezing] = useState(false);
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState(null);
  const [rateNow, setRateNow] = useState(null);
  const breaths = useRef([]);     // {t, v}
  const startedAt = useRef(0);
  // Keep the latest callback in a ref: App re-renders every tick, and a changing
  // callback in the effect deps below would restart the 1 s interval each time.
  const progressRef = useRef(onProgress);
  useEffect(() => { progressRef.current = onProgress; });

  // Squeeze meter fills while held.
  useEffect(() => {
    if (!squeezing) return undefined;
    const id = setInterval(() => setVol((v) => Math.min(1, v + 0.05)), 80);
    return () => clearInterval(id);
  }, [squeezing]);

  // Live push, once a second. Rate is the breath rate over the last few breaths,
  // and it falls the longer you go without squeezing.
  useEffect(() => {
    if (!open || kind !== "bvm" || !sealed) return undefined;
    const id = setInterval(() => {
      const now = performance.now();
      const b = breaths.current;
      if (!b.length) return;
      const recent = b.slice(-4);
      const sinceLast = (now - recent[recent.length - 1].t) / 1000;
      let bpm = 0;
      if (recent.length >= 2) bpm = 60 / ((recent[recent.length - 1].t - recent[0].t) / 1000 / (recent.length - 1));
      // No squeeze for longer than two intervals: ventilation is stopping.
      const cap = sinceLast > 0 ? 60 / sinceLast : bpm;
      const eff = recent.length >= 2 ? Math.min(bpm, Math.max(cap, 0)) : Math.min(TARGET_RATE, cap);
      const vols = recent.map((x) => x.v);
      const avgV = vols.reduce((a, c) => a + c, 0) / vols.length;
      const volQ = avgV >= VOL_LO ? 1 : Math.max(0.2, avgV / VOL_LO);
      const rateQ = Math.max(0, Math.min(2, eff / TARGET_RATE));
      setRateNow(Math.round(eff));
      progressRef.current(volQ, rateQ);
    }, 1000);
    return () => clearInterval(id);
  }, [open, kind, sealed]);

  if (!open || kind !== "bvm") return null;

  const release = () => {
    if (!squeezing) return;
    setSqueezing(false);
    const now = performance.now();
    const v = vol;
    setVol(0);
    breaths.current.push({ t: now, v });
    setCount(breaths.current.length);
    const b = breaths.current;
    const gap = b.length >= 2 ? (now - b[b.length - 2].t) / 1000 : null;
    if (v > VOL_HI) setMsg("Too much air. Big breaths force air into the stomach.");
    else if (v < VOL_LO) setMsg("Too shallow. The chest didn't rise.");
    else if (gap != null && gap < 3) setMsg("Too fast. Let them exhale between breaths.");
    else if (gap != null && gap > 9) setMsg("Too slow. Keep a breath every 5 to 6 seconds.");
    else setMsg("Good breath, chest rose.");
  };

  const setSeal = () => { setSealed(true); startedAt.current = performance.now(); };
  const rateColor = rateNow == null ? C.faint : rateNow >= 8 && rateNow <= 12 ? C.hr : C.amber;
  const msgColor = msg && msg.startsWith("Good") ? C.hr : C.amber;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Bag-valve-mask ventilation</div>
        <MinigameVitalsStrip pat={pat} />
        <BagScene sealed={sealed} vol={squeezing ? vol : 0} msg={msg} />
        {interrupted && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Keep bagging or stop and attend to them.
          </div>
        )}
        {!sealed ? (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>
              Get a seal with the C-E grip: thumb and finger make a C over the mask, the other three fingers lift the jaw.
            </div>
            <button onClick={setSeal} style={{ width: "100%", background: "#122A18", border: `1px solid ${C.hr}`, color: C.hr, borderRadius: 6, padding: "9px 10px", fontSize: 12.5, cursor: "pointer" }}>
              Set the C-E grip and start bagging</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>
              Hold to squeeze and release to give a breath. Aim for visible chest rise, about one breath every 5 to 6 seconds. Stop whenever you like.
            </div>
            <div style={{ position: "relative", height: 16, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 10 }}>
              <div style={{ position: "absolute", left: `${VOL_LO * 100}%`, width: `${(VOL_HI - VOL_LO) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />
              <div style={{ width: `${vol * 100}%`, height: "100%", borderRadius: 4, background: vol >= VOL_LO && vol <= VOL_HI ? C.hr : C.amber }} />
            </div>
            <button onPointerDown={() => { setVol(0); setSqueezing(true); }} onPointerUp={release} onPointerLeave={release}
              style={{ width: "100%", height: 90, borderRadius: 10, cursor: "pointer", fontSize: 14, letterSpacing: ".08em",
                background: squeezing ? "#1B3A24" : "#122A18", border: `2px solid ${C.hr}`, color: C.hr }}>
              HOLD TO SQUEEZE
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: MONO, fontSize: 12 }}>
              <span style={{ color: C.text }}>Breaths {count}</span>
              <span style={{ color: rateColor }}>{rateNow == null ? "Rate --" : `${rateNow}/min`}</span>
              <span style={{ color: msgColor }}>{msg || "--"}</span>
            </div>
            <HandoffRow crew={crew} verb="bagging" onHandoff={onHandoff} />
          </>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button onClick={() => onStop(count)} style={{ background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>
            {sealed ? "Stop bagging" : "Cancel"}</button>
        </div>
      </div>
    </div>
  );
}
