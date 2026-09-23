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

// A real eye, socketed, not a stack of flat CSS circles: lidded sclera with
// faint vessels, a radial-gradient iris with real fiber texture, a pupil
// that actually constricts on the same timescale `st.react` describes (a
// sluggish reaction visibly takes longer to close than a brisk one, not
// just a smaller end size), and a genuine corneal light reflex (the small
// bright glint every real penlight exam produces) rather than a CSS glow.
function Eye({ side, st, lit, onLight }) {
  const px = lit ? Math.max(2.5, st.size - st.size * 0.55 * st.react) : st.size;
  const uid = side === "Right" ? "R" : "L";
  return (
    <button onClick={onLight} aria-label={`Shine light in ${side} eye`}
      style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", padding: 0 }}>
      <svg viewBox="0 0 100 76" width={100} height={76}>
        <defs>
          <radialGradient id={`eyeSocket${uid}`} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#E3AE87" />
            <stop offset="100%" stopColor="#B87A54" />
          </radialGradient>
          <radialGradient id={`eyeSclera${uid}`} cx="42%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#F5F2E6" />
            <stop offset="75%" stopColor="#E8E0CC" />
            <stop offset="100%" stopColor="#C9BFA0" />
          </radialGradient>
          <radialGradient id={`eyeIris${uid}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#7B9AAE" />
            <stop offset="55%" stopColor="#5B7F95" />
            <stop offset="100%" stopColor="#324656" />
          </radialGradient>
        </defs>
        {/* socket / lid shading */}
        <ellipse cx={50} cy={38} rx={48} ry={30} fill={`url(#eyeSocket${uid})`} opacity={0.9} />
        <path d="M6,36 Q50,4 94,36 Q50,20 6,36 Z" fill="#00000022" />
        <path d="M6,40 Q50,68 94,40 Q50,54 6,40 Z" fill="#00000018" />
        {/* sclera */}
        <ellipse cx={50} cy={38} rx={34} ry={20} fill={`url(#eyeSclera${uid})`} stroke="#00000030" strokeWidth={1} />
        {/* faint vessels */}
        <path d="M20,38 Q30,34 40,37" fill="none" stroke="#C2596A" strokeWidth={0.6} opacity={0.35} />
        <path d="M80,40 Q70,44 60,39" fill="none" stroke="#C2596A" strokeWidth={0.6} opacity={0.35} />
        {/* iris */}
        <circle cx={50} cy={38} r={st.size + 4} fill={`url(#eyeIris${uid})`} />
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const r1 = (st.size + 4) * 0.35, r2 = st.size + 3.5;
          return <line key={i} x1={50 + Math.cos(a) * r1} y1={38 + Math.sin(a) * r1} x2={50 + Math.cos(a) * r2} y2={38 + Math.sin(a) * r2}
            stroke="#1B2A33" strokeWidth={0.5} opacity={0.4} />;
        })}
        {/* pupil, its own transition duration keyed to reactivity — sluggish
            really does take visibly longer to close, not just end smaller */}
        <circle cx={50} cy={38} r={px} fill="#050505" style={{ transition: `r ${0.35 / Math.max(st.react, 0.12)}s ease-out` }} />
        {/* corneal light reflex, the real penlight-exam glint */}
        <circle cx={50 - px * 0.4} cy={38 - px * 0.4} r={Math.max(1, px * 0.28)} fill="#FFFFFF" opacity={lit ? 0.9 : 0.35} />
        {/* upper lid */}
        <path d="M6,36 Q50,2 94,36 L94,30 Q50,-2 6,30 Z" fill={`url(#eyeSocket${uid})`} />
        {lit && <ellipse cx={50} cy={38} rx={40} ry={26} fill="#FFF6B0" opacity={0.22} />}
      </svg>
      <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{side} · tap to light</div>
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
