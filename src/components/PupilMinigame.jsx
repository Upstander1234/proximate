import { useState } from "react";
import { C } from "../theme.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Checking pupils with a penlight: shine each eye in turn, watch the pupil
// respond, then call what you saw. Both the drawing and the answer key come
// from pupilState() (physio/pupils.js), which is derived live from the
// physiology engine, so the eyes change as the patient does. A scenario that
// overrides probes.pupils still supplies the log text after a correct call.
import { pupilState } from "../physio/pupils.js";
const toPx = (mm) => Math.round(mm * 3);
const CHOICES = [
  { key: "perrl", label: "Equal and reactive" },
  { key: "sluggish", label: "Equal, sluggish" },
  { key: "blown", label: "Unequal, one blown" },
  { key: "pinpoint", label: "Pinpoint" },
  { key: "dilated", label: "Dilated" },
  { key: "fixed", label: "Fixed and dilated" },
];

function Eye({ side, st, lit, onLight }) {
  const px = lit ? Math.max(3, st.size - st.size * 0.55 * st.react) : st.size;
  return (
    <button onClick={onLight} aria-label={`Shine light in ${side} eye`}
      style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
      <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#D9D4C7", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: lit ? "0 0 22px #FFF6B0" : "none", border: `2px solid ${C.line}` }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#5B7F95", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: px * 2, height: px * 2, borderRadius: "50%", background: "#050505", transition: `all ${0.25 / Math.max(st.react, 0.1)}s` }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>{side} · tap to light</div>
    </button>
  );
}

export default function PupilMinigame({ open, kind, pat, interrupted, onResolve }) {
  const [lit, setLit] = useState(null);
  const [seen, setSeen] = useState({ L: false, R: false });
  const [flash, setFlash] = useState(null);

  if (!open || kind !== "pupils") return null;
  let v; try { v = pat?.vitals?.(); } catch { v = undefined; }
  const ps = pupilState(pat, v);
  const st = { key: ps.key, L: { size: toPx(ps.L.mm), react: ps.L.react }, R: { size: toPx(ps.R.mm), react: ps.R.react } };
  const light = (side) => { setLit(side); setSeen((s) => ({ ...s, [side]: true })); setTimeout(() => setLit(null), 900); };
  const call = (key) => setFlash(key === st.key ? "success" : "wrong");
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, "You misread the pupils. Recheck them with the light.");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Check pupils</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>Shine the penlight into each eye and watch the response. Then call it.</div>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12 }}>
              <Eye side="Right" st={st.R} lit={lit === "R"} onLight={() => light("R")} />
              <Eye side="Left" st={st.L} lit={lit === "L"} onLight={() => light("L")} />
            </div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>{seen.L && seen.R ? "What did you see?" : "Check both eyes before you call it."}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {CHOICES.map((c) => (
                <button key={c.key} disabled={!(seen.L && seen.R)} onClick={() => call(c.key)}
                  style={{ padding: "8px 6px", fontSize: 11.5, borderRadius: 6, cursor: seen.L && seen.R ? "pointer" : "not-allowed", opacity: seen.L && seen.R ? 1 : 0.45,
                    background: "#10151A", border: `1px solid ${C.line}`, color: C.text }}>{c.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
              {interrupted && <button onClick={() => onResolve(PROCEDURE_OUTCOME.ABORTED)} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon and attend to the patient</button>}
            </div>
          </>
        )}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>
              {flash === "success" ? "That matches what the light showed." : "That doesn't match what the light showed."}
            </div>
            <button onClick={finish} className="px-3 py-2 rounded w-full" style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}
