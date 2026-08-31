import { useState } from "react";
import { C, MONO, SANS } from "../theme.js";
import { generateDialogueFromContext, localAiStatus } from "../dialogue/dialogueManager.js";

// DEV-ONLY test panel for the dialogue system (F0 item 29 — "a way to test
// dialogue without playing a full call... a developer should be able to
// hand-supply a simulated context and see the system's response"). Never
// mounted outside import.meta.env.DEV (checked by the caller in Shell.jsx,
// the same gate every other dev-only hook in this codebase uses), so it
// never reaches a production/itch.io build.
//
// This deliberately does NOT touch real game state (g/s) — it builds a
// synthetic dialogue context by hand and runs it through the exact same
// tier2/tier1 chain the real game uses (dialogueManager's
// generateDialogueFromContext), so what you see here is what a real call
// would render for that context, not a reimplementation.

const EVENTS = [
  "pain_unprompted",
  "anxious_unprompted",
  "deterioration_unprompted",
  "procedure_discomfort",
  "treatment_improving",
  "crew_seizure_reaction",
  "crew_unresponsive_reaction",
  "crew_seizure_ended_reaction",
  "crew_recovery_reaction",
  "order_ack",
];

// Presets matching item 29's own named cases (normal / anxious / agitated /
// deteriorating / improving patient; during a procedure; crew dialogue).
// "LLM unavailable / model-load failure / slow inference" aren't separately
// testable here — there is no real backend yet (LocalLLMProvider.isAvailable()
// is always false), so every one of these presets already exercises the
// "LLM unavailable, fell back to template/deterministic" path honestly,
// which is the actual current behavior of the shipped game.
const PRESETS = {
  normal: { bucket: "calm", painLevel: 2, distress: 0.15, consciousness: "awake" },
  anxious: { bucket: "anxious", painLevel: 4, distress: 0.6, consciousness: "awake" },
  agitated: { bucket: "irritable", painLevel: 7, distress: 0.8, consciousness: "awake" },
  deteriorating: { bucket: "anxious", painLevel: 8, distress: 0.9, consciousness: "drowsy" },
  improving: { bucket: "calm", painLevel: 1, distress: 0.1, consciousness: "awake" },
};

function buildCtx(presetKey, name) {
  const p = PRESETS[presetKey] || PRESETS.normal;
  return {
    patient: {
      name: name || "the patient",
      age: 54,
      consciousness: p.consciousness,
      painLevel: p.painLevel,
      distress: p.distress,
      personality: { anxious: p.bucket === "anxious" ? 0.8 : 0.3, cooperative: 0.6,
        talkative: 0.5, irritable: p.bucket === "irritable" ? 0.8 : 0.2, trusting: 0.5 },
    },
    situation: { phase: "scene", scenarioTitle: "dev-test", elapsedMin: 3 },
    player: { level: "paramedic" },
    crew: [{ id: "dev-crew", name: "Dev Crew", level: "emt" }],
    recentEvents: [],
  };
}

export default function DialogueDevPanel() {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState("normal");
  const [event, setEvent] = useState("pain_unprompted");
  const [name, setName] = useState("the patient");
  const [result, setResult] = useState(null);
  const [ran, setRan] = useState(false);

  const run = () => {
    const ctx = buildCtx(preset, name);
    const bucketOverride = event.startsWith("crew_") ? { bucket: "calm" } : {};
    setResult(generateDialogueFromContext({ type: event, ...bucketOverride }, ctx));
    setRan(true);
  };

  const status = localAiStatus();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ position: "fixed", right: 10, bottom: 10, zIndex: 60,
        fontFamily: MONO, fontSize: 9, letterSpacing: ".08em", padding: "5px 8px", borderRadius: 6,
        background: C.panel, color: C.dim, border: `1px solid ${C.line}`, cursor: "pointer" }}>
        DIALOGUE DEV
      </button>
    );
  }

  return (
    <div style={{ position: "fixed", right: 10, bottom: 10, zIndex: 60, width: 280, fontFamily: SANS,
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: 10, color: C.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".08em", color: C.dim }}>DIALOGUE DEV MODE</span>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 12 }}>✕</button>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: C.faint, marginBottom: 8 }}>
        backend: {status.tier} {status.available ? "(available)" : "(fallback)"}
      </div>
      <label style={{ display: "block", fontSize: 10, color: C.dim, marginBottom: 2 }}>Patient state</label>
      <select value={preset} onChange={(e) => setPreset(e.target.value)}
        style={{ width: "100%", marginBottom: 6, fontFamily: MONO, fontSize: 11, background: C.bg, color: C.text, border: `1px solid ${C.line}`, borderRadius: 4, padding: 4 }}>
        {Object.keys(PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <label style={{ display: "block", fontSize: 10, color: C.dim, marginBottom: 2 }}>Event</label>
      <select value={event} onChange={(e) => setEvent(e.target.value)}
        style={{ width: "100%", marginBottom: 6, fontFamily: MONO, fontSize: 11, background: C.bg, color: C.text, border: `1px solid ${C.line}`, borderRadius: 4, padding: 4 }}>
        {EVENTS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <label style={{ display: "block", fontSize: 10, color: C.dim, marginBottom: 2 }}>Patient name</label>
      <input value={name} onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 8, fontFamily: MONO, fontSize: 11, background: C.bg, color: C.text, border: `1px solid ${C.line}`, borderRadius: 4, padding: 4 }} />
      <button onClick={run} style={{ width: "100%", marginBottom: 8, fontFamily: MONO, fontSize: 10, letterSpacing: ".06em",
        padding: 6, borderRadius: 5, background: C.blue, color: "#fff", border: "none", cursor: "pointer" }}>
        GENERATE
      </button>
      {result && (
        <div style={{ fontSize: 12, lineHeight: 1.35, padding: 8, borderRadius: 6, background: C.panelHi, border: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: result.speaker === "crew" ? C.blue : C.hr, marginRight: 6 }}>
            {(result.speaker || "?").toUpperCase()} · {result.tier}
          </span>
          {result.text}
        </div>
      )}
      {ran && result === null && <div style={{ fontSize: 11, color: C.faint }}>no line defined for this event/state</div>}
    </div>
  );
}
