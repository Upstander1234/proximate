import { C, MONO } from "../theme.js";
import { CREDITS } from "../credits.js";

// Credits. `firstRun` is the very first screen of a fresh session (a single
// Continue button); otherwise it's reached from the title screen (Back button).
export default function CreditsScreen({ firstRun, onDone }) {
  return (
    <div style={{ minHeight: "100dvh", background: C.bg, color: C.text, display: "flex", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ width: "min(640px,100%)" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".3em", color: C.amber, marginBottom: 6 }}>CREDITS</div>
        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 24 }}>
          Proximate is made possible by the people and projects below.
        </div>
        {CREDITS.map((sec) => (
          <div key={sec.title} style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", color: C.dim, marginBottom: 8 }}>{sec.title.toUpperCase()}</div>
            {sec.entries.map((e) => (
              <div key={e.name} style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 4 }}>
                {e.source ? <a href={e.source} target="_blank" rel="noreferrer" style={{ color: C.spo2 }}>{e.name}</a> : e.name}
                {e.license && <span style={{ color: C.faint }}>{`  ·  ${e.license}`}</span>}
                {e.changes && <span style={{ color: C.faint }}>{`  ·  ${e.changes}`}</span>}
              </div>
            ))}
          </div>
        ))}
        <button onClick={onDone} className="px-7 py-3 rounded" autoFocus
          style={{ marginTop: 12, background: C.panelHi, border: `1px solid ${C.line}`, color: C.text, fontSize: 14, cursor: "pointer" }}>
          {firstRun ? "Continue" : "Back"}
        </button>
      </div>
    </div>
  );
}
