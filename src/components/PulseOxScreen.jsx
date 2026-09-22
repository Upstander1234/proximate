import { C, MONO } from "../theme.js";
import { plethPoints } from "../ecg.js";

// A dedicated finger pulse-oximeter readout, the way a real one actually
// looks: big SpO2 % in cyan, pulse rate underneath, a bar-graph "signal
// strength" ladder next to it (perfusion-scaled, same idea as the amplitude
// pulse-ox devices show), and the pleth trace running beneath — all driven
// by the same live vitals the generic waveform strip already reads, just
// laid out like the real device instead of a plain labeled line graph.
export default function PulseOxScreen({ spo2, pr, perf = 1 }) {
  const pts = plethPoints(pr, 340, 46, perf);
  const bars = 5;
  const lit = Math.max(1, Math.round(perf * bars));
  const spo2Col = spo2 == null ? C.faint : spo2 < 90 ? C.red : spo2 < 94 ? C.amber : C.spo2;
  return (
    <div style={{ background: "#020806", border: `1px solid ${C.line}`, borderRadius: 6, padding: "10px 12px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".14em", color: C.dim, marginBottom: 2 }}>SpO₂ %</div>
          <div style={{ fontFamily: MONO, fontSize: 40, lineHeight: 1, fontWeight: 700, color: spo2Col }}>
            {spo2 == null ? "--" : spo2}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".14em", color: C.dim, marginBottom: 2 }}>PULSE bpm</div>
          <div style={{ fontFamily: MONO, fontSize: 26, lineHeight: 1, fontWeight: 700, color: C.hr }}>
            {pr == null || pr <= 0 ? "--" : Math.round(pr)}
          </div>
          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", marginTop: 6 }}>
            {Array.from({ length: bars }, (_, i) => (
              <div key={i} style={{ width: 5, height: 5 + i * 3, background: i < lit ? spo2Col : "#122228", borderRadius: 1 }} />
            ))}
          </div>
        </div>
      </div>
      <svg viewBox="0 0 340 46" style={{ width: "100%", height: 40, marginTop: 6 }}>
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={spo2Col} strokeWidth="1.6" />
      </svg>
    </div>
  );
}
