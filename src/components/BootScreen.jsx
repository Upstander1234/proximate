import { useEffect, useState } from "react";
import { C, MONO } from "../theme.js";
import Shell from "./Shell.jsx";
import { getLocalAiState, subscribeLocalAiProgress, preloadLocalAi } from "../dialogue/dialogueManager.js";
import { CONDITIONS } from "../physio/conditions.js";
import { SCEN } from "../data/scenarios.js";
import { MAPS } from "../data/maps.js";
import { BAGS } from "../gear.js";
import { aiStatusLine, continueHint } from "./bootScreenText.js";

// F0 item 4 — the boot/initialization screen. Two genuinely different
// things live on this screen, and they are kept visually and behaviorally
// separate on purpose:
//
// 1. CORE SYSTEMS checklist — medical database / map data / audio / UI
//    assets / scenario data. This is a Vite SPA: every one of these modules
//    is already imported and fully in memory by the time App() ever runs a
//    single render, so there is no real async load phase to hook into here
//    (confirmed by reading how CONDITIONS/SCEN/MAPS/BAGS are built — plain
//    module-level object literals, not lazy/fetched). Rather than fabricate
//    a fake progress bar/delay to make this "animate," this checklist reports
//    REAL counts pulled from the actual loaded data (condition count, map
//    count, scenario count) and shows them as ready immediately — an honest
//    "instant, always ready" design, not a simulated boot sequence.
//
// 2. LOCAL AI panel — the one section of this screen with real asynchronous
//    state. Backed by dialogueManager's getLocalAiState()/
//    subscribeLocalAiProgress()/preloadLocalAi(), which is real
//    navigator.gpu feature detection plus @mlc-ai/web-llm's own
//    initProgressCallback — never a fabricated percentage. preloadLocalAi()
//    is fired once, fire-and-forget, so a WebGPU-capable device starts the
//    real download/compile during boot instead of waiting for the first
//    dialogue line; a device without WebGPU (or the failure path) is
//    reported honestly as unsupported/unavailable.
//
// Per F0 item 9 ("never permanently AI-gated"), the "Continue" action below
// is ALWAYS available the instant this screen mounts — core assets are
// already ready by construction, and the AI panel's state, whatever it is,
// never blocks it.

const CORE_ITEMS = [
  { label: "Medical database", detail: () => `${Object.keys(CONDITIONS).length} conditions loaded` },
  { label: "Scenario data", detail: () => `${Object.keys(SCEN).length} scenarios loaded` },
  { label: "Map data", detail: () => `${Object.keys(MAPS).length} maps loaded` },
  { label: "UI assets", detail: () => `${Object.keys(BAGS).length} equipment bags loaded` },
  { label: "Audio", detail: () => "synthesized (siren, tones, voice) — no external files to fetch" },
];

// aiStatusLine()/continueHint() (F0 items 4/5's status + threshold-aware
// messaging) now live in ./bootScreenText.js — a plain .js module, not this
// .jsx file — so they can be `export`ed for a direct-function Playwright
// test without breaking this file's own single-default-export react-refresh
// contract. See that file's own header for why.

export default function BootScreen({ g, setG }) {
  const [ai, setAi] = useState(getLocalAiState());

  useEffect(() => {
    // Real, one-shot kickoff — never re-triggered by re-renders (empty dep
    // array), never awaited, never blocks the checklist below. preloadLocalAi
    // itself is a no-op unless g.localAiEnabled===true (opt-in default —
    // see dialogueManager.js's isLocalAiEnabled), so merely reaching the
    // boot screen no longer starts a download on its own.
    preloadLocalAi(g);
    const unsub = subscribeLocalAiProgress(setAi);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot kickoff by design, matching the empty-deps precedent this effect already used before g was read inside it
  }, []);

  const enter = () => setG((s) => ({ ...s, phase: "title" }));
  const line = aiStatusLine(ai);
  const aiReady = ai.status === "ready";

  return (<Shell g={g} setG={setG}>
    <div style={{ maxWidth: 560, margin: "0 auto", paddingTop: "clamp(40px,10vh,110px)", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 32, letterSpacing: ".35em", paddingLeft: ".35em" }}>PROXIMATE</div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".25em", color: C.faint, marginTop: 10 }}>
        INITIALIZING SIMULATION
      </div>

      <div style={{ marginTop: 34, textAlign: "left", border: `1px solid ${C.line}`, borderRadius: 8,
        background: C.panel, padding: "14px 18px" }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".18em", color: C.dim, marginBottom: 10 }}>
          CORE SYSTEMS
        </div>
        {CORE_ITEMS.map((it) => (
          <div key={it.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
            padding: "5px 0", borderTop: `1px solid ${C.line}` }}>
            <span style={{ fontSize: 13, color: C.text }}>
              <span style={{ color: C.hr, marginRight: 8, fontFamily: MONO }}>✓</span>{it.label}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: C.faint }}>{it.detail()}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, textAlign: "left", border: `1px solid ${C.line}`, borderRadius: 8,
        background: C.panel, padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".18em", color: C.dim }}>LOCAL AI DIALOGUE</span>
          <span style={{ fontFamily: MONO, fontSize: 9.5, color: line.color }}>{line.text}</span>
        </div>
        {ai.supported && (ai.status === "loading" || ai.status === "downloading" || ai.status === "loading-from-cache") && (
          <div style={{ height: 4, borderRadius: 2, background: C.line, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, background: C.amber,
              width: `${Math.round((ai.progress?.progress || 0) * 100)}%`, transition: "width .3s ease" }} />
          </div>
        )}
        <div style={{ fontSize: 11.5, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
          {ai.status === "failed"
            ? `This device reports ${ai.backend === "wasm" ? "WebAssembly" : "WebGPU"} support but local AI failed to load. Proximate uses contextual template dialogue instead — nothing about the simulation depends on this.`
            : ai.supported
            ? `Runs entirely on this device${ai.backend === "wasm" ? " via WebAssembly (broad-compatibility mode)" : ""}. No account, no API key, nothing about this call is ever sent anywhere.`
            : "This browser or device can't run local AI dialogue. Proximate uses contextual template dialogue instead — nothing about the simulation depends on this."}
        </div>
      </div>

      <button onClick={enter} className="px-8 py-3 rounded" style={{ marginTop: 26,
        background: aiReady ? "#122A20" : C.panelHi, border: `1px solid ${aiReady ? C.hr : C.line}`,
        color: aiReady ? C.hr : C.text, fontSize: 14, fontFamily: MONO, letterSpacing: ".05em" }}>
        {aiReady ? "▲ ENTER PROXIMATE — LOCAL AI READY" : "▲ CONTINUE WITHOUT AI"}
      </button>
      {!aiReady && ai.supported && ai.status !== "failed" && (
        <div style={{ fontSize: 10.5, color: C.faint, marginTop: 10, fontFamily: MONO }}>
          {continueHint(ai)}
        </div>
      )}
    </div>
  </Shell>);
}
