import { useMemo, useState } from "react";
import { C, MONO } from "../theme.js";
import { twelveLead, LEAD_NAMES } from "../twelveLead.js";
import { ecgReadout, ECG_READ } from "../ecg.js";

// A printed 12-lead on standard ECG paper (25 mm/s, 10 mm/mV) for interpretation
// practice. The tracing is synthesized from the physiology snapshot taken at the
// moment of printing (twelveLead.js); the player reads it, commits an
// interpretation, and is then shown the key.
const PX_S = 100;   // px per second (25 mm/s at 4 px/mm)
const PX_MV = 40;   // px per mV (10 mm/mV at 4 px/mm)
const ROW_H = 150;

const RHYTHMS = [
  ["sinus", "Normal sinus rhythm"], ["sinusTach", "Sinus tachycardia"], ["sinusBrad", "Sinus bradycardia"],
  ["afib", "Atrial fibrillation"], ["svt", "SVT"], ["junctional", "Junctional rhythm"],
  ["firstDegreeBlock", "Sinus with first-degree AV block"], ["chb", "Complete heart block"],
  ["sinusPVC", "Sinus with PVCs"], ["sinusPAC", "Sinus with PACs"], ["wideQRS", "Wide-complex rhythm"],
  ["VT", "Ventricular tachycardia"], ["torsades", "Torsades de pointes"], ["VF", "Ventricular fibrillation"],
  ["asystole", "Asystole"], ["PEA", "PEA (organized, pulseless)"],
];
// ST/T findings the player can call. The key for a snapshot is derived below.
const FINDINGS = [
  ["none", "No acute ST/T change"], ["inferior", "ST elevation: inferior (II, III, aVF)"],
  ["anterior", "ST elevation: anterior (V1-V4)"], ["septal", "ST elevation: septal (V1-V2)"],
  ["lateral", "ST elevation: lateral (I, aVL, V5-V6)"], ["anterolateral", "ST elevation: anterolateral"],
  ["posterior", "ST depression V1-V3 (posterior)"], ["peakedT", "Peaked T waves (hyperkalemia)"], ["osborn", "J (Osborn) waves"],
];

// Rhythm answer key. A few kinds share a family on the strip, so the printed
// rhythm is compared by its own kind, with STEMI and peaked-T reading as sinus.
const rhythmKey = (s) => (["stemi", "peakedT", "osborn"].includes(s.ecg) ? (s.hr > 100 ? "sinusTach" : s.hr < 60 ? "sinusBrad" : "sinus") : s.ecg);
const findingKey = (s) => (s.ecg === "stemi" ? (s.infarctTerritory || "inferior") : s.ecg === "peakedT" ? "peakedT" : s.ecg === "osborn" ? "osborn" : "none");

function Trace({ pts, x, y }) {
  const d = pts.map(([t, v], i) => `${i ? "L" : "M"}${(x + t * PX_S).toFixed(1)},${(y - v * PX_MV).toFixed(1)}`).join("");
  return <path d={d} fill="none" stroke="#1a1a1a" strokeWidth="1.1" />;
}

export default function TwelveLeadPrint({ snap, onClose }) {
  const tr = useMemo(() => (snap ? twelveLead(snap) : null), [snap]);
  const [rhythm, setRhythm] = useState("");
  const [finding, setFinding] = useState("");
  const [shown, setShown] = useState(false);
  if (!snap || !tr) return null;

  const W = 1018, H = ROW_H * 4 - 26, X0 = 18;
  const rOk = rhythm === rhythmKey(snap), fOk = finding === findingKey(snap);
  const sel = { background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "6px 8px", fontSize: 12, width: "100%", marginBottom: 8 };
  const info = snap.info || {};
  const clock = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  return (
    <div style={{ marginTop: 12, background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 8, padding: 12 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", color: C.amber }}>12-LEAD ECG PRINTOUT {snap.n ? `#${snap.n}` : ""}</span>
          {onClose && <button onClick={onClose} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 11 }}>Discard</button>}
        </div>
        <div style={{ overflowX: "auto", background: "#FFF5F5", borderRadius: 4, border: "1px solid #E6B8B8" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 760, display: "block" }}>
            <defs>
              <pattern id="ecgSmall" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="#F3CFCF" strokeWidth="0.5" /></pattern>
              <pattern id="ecgBig" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="url(#ecgSmall)" /><path d="M20 0H0V20" fill="none" stroke="#E29A9A" strokeWidth="0.8" /></pattern>
            </defs>
            <rect width={W} height={H} fill="url(#ecgBig)" />
            <text x="8" y="13" fontSize="10" fontFamily="monospace" fill="#442">
              {`${info.name || "UNKNOWN"}   Age ${info.age ?? "-"}   ${info.sex ? "Sex " + info.sex + "   " : ""}ID ${info.id || "-"}   ${clock(snap.t || 0)} on scene`}
            </text>
            <text x="8" y="26" fontSize="10" fontFamily="monospace" fill="#442">
              {`Vent rate ${tr.meta.rate} bpm   PR ${tr.meta.pr} ms   QRS ${tr.meta.qrs} ms   QT/QTc ${tr.meta.qt}/${tr.meta.qtc} ms   P-QRS-T axes ${tr.meta.axes}`}
            </text>
            <text x="8" y="39" fontSize="10" fontFamily="monospace" fill="#442">
              {`BP ${info.bp || "-"}   SpO2 ${info.spo2 ?? "-"}%   25 mm/s   10 mm/mV   0.05-150 Hz   UNCONFIRMED, NOT A DIAGNOSIS`}
            </text>
            {LEAD_NAMES.map((name, i) => {
              const row = Math.floor(i / 4), col = i % 4;
              const x = X0 + col * 250, y = ROW_H * row + ROW_H / 2 + 34;
              return (<g key={name}>
                <text x={x + 6} y={y - ROW_H / 2 + 20} fontSize="12" fontWeight="700" fontFamily="monospace" fill="#222">{name}</text>
                <Trace pts={tr.leads[name]} x={x} y={y} />
              </g>);
            })}
            <text x={X0 + 6} y={ROW_H * 3 + 38} fontSize="12" fontWeight="700" fontFamily="monospace" fill="#222">II (rhythm)</text>
            <Trace pts={tr.rhythm} x={X0} y={ROW_H * 3 + ROW_H / 2 + 34} />
            {[0, 1, 2, 3].map((r) => { const y0 = ROW_H * r + ROW_H / 2 + 34; return (
              <path key={r} d={`M2,${y0}H5V${y0 - PX_MV}H15V${y0}H18`} fill="none" stroke="#1a1a1a" strokeWidth="1.1" />); })}
          </svg>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 4 }}>Rhythm</div>
            <select value={rhythm} onChange={(e) => setRhythm(e.target.value)} disabled={shown} style={sel}>
              <option value="">Select a rhythm...</option>
              {RHYTHMS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 4 }}>ST / T findings</div>
            <select value={finding} onChange={(e) => setFinding(e.target.value)} disabled={shown} style={sel}>
              <option value="">Select a finding...</option>
              {FINDINGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
        {!shown && (
          <button disabled={!rhythm || !finding} onClick={() => setShown(true)}
            style={{ background: "#122A18", border: `1px solid ${C.hr}`, color: C.hr, borderRadius: 6, padding: "8px 14px", fontSize: 12.5, cursor: rhythm && finding ? "pointer" : "not-allowed", opacity: rhythm && finding ? 1 : 0.5 }}>
            Check my read</button>
        )}
        {shown && (
          <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>
            <div style={{ color: rOk && fOk ? "#7CD68A" : C.amber, marginBottom: 4 }}>
              {rOk && fOk ? "Correct read." : `Rhythm ${rOk ? "correct" : "missed"}, ST/T ${fOk ? "correct" : "missed"}.`}
            </div>
            <div style={{ color: C.dim }}>Key: {ecgReadout(snap.ecg, snap) || ECG_READ[snap.ecg]}</div>
          </div>
        )}
      </div>
    </div>
  );
}
