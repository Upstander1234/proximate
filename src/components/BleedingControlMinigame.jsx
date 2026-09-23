import { useState, useEffect, useRef } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Bleeding control, as one real sequence instead of three separate flat
// actions: direct pressure ALWAYS comes first (it's the immediate,
// zero-equipment response), then — only if the bleeding doesn't actually
// come under control — a real branch to wound packing or a tourniquet
// (tourniquet only offered on a limb). Escalating is done either
// one-handed (you keep pressure on with your free hand while you work,
// harder — a tighter tolerance on the next step) or two-handed (you direct
// a crew member to take over holding pressure so both your hands are free,
// easier — needs an idle crew member). Reuses the SAME real mechanisms the
// old separate tq/pack/directPressure minigame steps used (procedures.js:
// directPressure -.3 bleed, pack -.4 bleed, tq stopsBleed — Phase 1's
// location-aware tourniquet), just sequenced as one clinical decision.
//
// Per explicit direction: the physical actions themselves — pressing on the
// wound, pushing gauze in, twisting the windlass — happen as a continuous
// gesture directly on the rendered wound/limb, not as a separate labeled
// button below a static picture. Only genuine one-time DECISIONS (which
// dressing, which landmark, which escalation) stay as discrete choices,
// since those aren't physical motions to begin with.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);
const Gap = () => <div style={{ height: 8 }} />;
const Line = ({ children }) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{children}</div>;
const Bar = ({ v, lo, hi }) => (
  <div style={{ position: "relative", height: 14, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
    {lo != null && <div style={{ position: "absolute", left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`, top: 0, bottom: 0, background: "#1B3A24" }} />}
    <div style={{ width: `${Math.min(1, v) * 100}%`, height: "100%", background: lo != null && v >= lo && v <= hi ? C.hr : C.amber, borderRadius: 4 }} />
  </div>
);
const Choice = ({ value, onChange, placeholder, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{ background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "6px 8px", fontSize: 12, width: "100%" }}>
    <option value="">{placeholder}</option>
    {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
  </select>
);

const SITE_LABEL = { armR: "right arm", armL: "left arm", legR: "right leg", legL: "left leg", abdo: "abdomen", torso: "chest", neck: "neck", head: "scalp" };

// A crew member's hand, holding the dressing steady while the player's own
// hands are free to pack or apply the tourniquet — the visual payoff of the
// "two-handed" escalation choice. Hoisted to module scope (not declared
// inside Scene) — a component defined during render is a real
// react-hooks/static-components lint catch, the same fix already applied
// elsewhere in this project (see MinigameVitalsStrip.jsx's own comment).
function CrewHand() {
  return (
    <g transform="translate(150,18)" opacity={0.9}>
      <ellipse cx={0} cy={10} rx={12} ry={7} fill="#E8C9A8" stroke="#8A5E45" strokeWidth={1} />
      <line x1={0} y1={16} x2={0} y2={32} stroke="#8A5E45" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}
// The player's own hand, pressing down over the wound — visible for as long
// as a press/hold gesture is actually active, so the picture shows the real
// action instead of narrating it in text.
function PlayerHand({ x, y, active }) {
  if (!active) return null;
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: "none" }}>
      <ellipse cx={0} cy={0} rx={19} ry={14} fill="#E8C9A8" opacity={0.85} stroke="#8A5E45" strokeWidth={1} />
      {[-9, -3, 3, 9].map((dx) => <line key={dx} x1={dx} y1={-12} x2={dx} y2={-20} stroke="#8A5E45" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />)}
    </g>
  );
}

export default function BleedingControlMinigame({ open, kind, site, isLimb, pat, assist, availableCrew, onDirectCrew, onReleaseCrew, interrupted, onResolve }) {
  const [step, setStep] = useState(0); // 0 dressing, 1 hold, 2 reassess, 3 hands choice, 4 escalate detail
  const [flash, setFlash] = useState(null);
  const [dressing, setDressing] = useState("");
  const [pressing, setPressing] = useState(false);
  const [dpHeld, setDpHeld] = useState(0);
  const [hands, setHands] = useState(""); // "one" | "two"
  const [crewId, setCrewId] = useState("");
  const [escalate, setEscalate] = useState(""); // "pack" | "tq"
  // pack sub-state
  const [opened, setOpened] = useState(false);
  const [packingIn, setPackingIn] = useState(false); // actively pushing gauze into the wound
  const [packDepth, setPackDepth] = useState(0);
  const [packPressing, setPackPressing] = useState(false);
  const [packHeld, setPackHeld] = useState(0);
  // tq sub-state
  const [tqPos, setTqPos] = useState("");
  const [tight, setTight] = useState(0);
  const [twisting, setTwisting] = useState(false);
  const [tqLocked, setTqLocked] = useState(false);
  const [timed, setTimed] = useState(false);

  const svgRef = useRef(null);
  const dragRef = useRef({ dragging: false, lastAngle: null });

  const tol = assistToleranceMult(assist);
  const label = SITE_LABEL[site] || "wound";
  const severity = pat?.woundBleedByLocation?.[site] ?? pat?.activeBleedRate ?? 0.2;
  const SEVERE = severity > 0.12;
  const handsMult = hands === "one" ? 0.6 : hands === "two" ? 1.4 : 1;
  const crewHolding = hands === "two" && !!crewId;

  // Direct-pressure hold: pointer down/up directly on the wound.
  useEffect(() => {
    if (!pressing) return undefined;
    const id = setInterval(() => setDpHeld((t) => t + 0.1), 100);
    return () => clearInterval(id);
  }, [pressing]);
  // Pushing gauze into the wound: depth climbs while actively pressed in,
  // the same continuous-hold gesture as direct pressure, not a slider drag.
  useEffect(() => {
    if (!packingIn) return undefined;
    const id = setInterval(() => setPackDepth((d) => Math.min(100, d + 2.6)), 80);
    return () => clearInterval(id);
  }, [packingIn]);
  // Holding firm pressure on top of the packed gauze.
  useEffect(() => {
    if (!packPressing) return undefined;
    const id = setInterval(() => setPackHeld((t) => t + 0.1), 100);
    return () => clearInterval(id);
  }, [packPressing]);

  if (!open || kind !== "bleedingControl") return null;
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why, finalProc) => { setFlash({ ok: true, why, finalProc }); };

  const chooseHands = (h) => {
    setHands(h);
    if (h === "two" && crewId) onDirectCrew?.(crewId);
    setStep(4);
  };

  // Real pointer-to-viewBox conversion (the scene is 200x100 but rendered
  // at whatever size the panel actually is), shared by the wound press and
  // the windlass rotation below.
  const toLocal = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 200, y: ((e.clientY - rect.top) / rect.height) * 100 };
  };

  // Rotational drag on the windlass knob: track the angle from its center
  // and accumulate the REAL amount of rotation traveled into `tight`, so
  // "twist the windlass" is an actual circular drag gesture, not a hold.
  const knobDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = toLocal(e);
    dragRef.current = { dragging: true, lastAngle: Math.atan2(p.y - 51, p.x - 90) };
    setTwisting(true);
  };
  const knobMove = (e) => {
    if (!dragRef.current.dragging) return;
    const p = toLocal(e);
    const a = Math.atan2(p.y - 51, p.x - 90);
    let d = a - dragRef.current.lastAngle;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    dragRef.current.lastAngle = a;
    setTight((t) => Math.max(0, Math.min(1, t + Math.abs(d) * 0.32 * handsMult)));
  };
  const knobUp = () => { dragRef.current.dragging = false; setTwisting(false); };

  const woundLabel = () => {
    if (step === 1) return "Press directly on the wound to hold firm pressure.";
    if (escalate === "pack" && opened && packHeld === 0) return "Press and hold on the wound to push the gauze in, layer by layer.";
    if (escalate === "pack" && packHeld > 0) return "Press and hold directly on top of the packed gauze.";
    return null;
  };
  const onWoundDown = () => {
    if (step === 1) setPressing(true);
    else if (escalate === "pack" && opened && packHeld === 0) setPackingIn(true);
    else if (escalate === "pack" && packHeld > 0) setPackPressing(true);
  };
  const onWoundUp = () => { setPressing(false); setPackingIn(false); setPackPressing(false); };

  const body = () => {
    if (step === 0) return (<>
      <Line>1. Bleeding control starts with direct pressure. Get a barrier between you and the {label} wound before you touch it.</Line>
      <Choice value={dressing} onChange={setDressing} placeholder="Choose what you press with..." options={[["gauze", "A gauze pad or trauma dressing"], ["bareHand", "Your bare gloved hand, no dressing"], ["occlusive", "An occlusive (vented) seal"]]} /><Gap />
      <button style={GO} disabled={!dressing} onClick={() => (dressing === "gauze" ? setStep(1)
        : fail(dressing === "bareHand" ? "You can press without a dressing, but a bare glove gives you nothing to bulk the pressure with. Grab a dressing."
          : "An occlusive seal is for a sucking chest wound, not a bleeding one. It won't tamponade anything here."))}>Place the dressing</button>
    </>);
    if (step === 1) return (<>
      <Line>2. Don't peek, don't let up — lifting the dressing breaks the seal and the bleeding restarts.</Line>
      <Bar v={Math.min(1, dpHeld / 8)} lo={0.75} hi={1} />
      <button style={NEUTRAL} onClick={() => (dpHeld < 6 ? fail("You let up too soon. Direct, firm, continuous pressure needs real time to work — keep holding.") : setStep(2))}>Check the wound</button>
    </>);
    if (step === 2) return (<>
      <Line>3. Lift the edge just enough to look, without breaking the seal completely.</Line>
      {SEVERE ? (
        <Line>Blood is still coming through steadily. Direct pressure alone isn't enough here — this needs more.</Line>
      ) : (
        <Line>It's slowed to an ooze. Pressure is working.</Line>
      )}
      {!SEVERE && <><button style={GO} onClick={() => win(`Bleeding controlled with sustained direct pressure alone. Keep the dressing in place and secure it with a wrap.`, "directPressure")}>Keep holding — that's enough</button><Gap /></>}
      <button style={SEVERE ? GO : NEUTRAL} onClick={() => setStep(3)}>{SEVERE ? "Escalate" : "Escalate anyway"}</button>
    </>);
    if (step === 3 && !escalate) return (<>
      <Line>4. What are you escalating to?</Line>
      <button style={GO} onClick={() => setEscalate("pack")}>Pack the wound</button><Gap />
      {isLimb && <button style={GO} onClick={() => setEscalate("tq")}>Apply a tourniquet</button>}
    </>);
    if (step === 3) return (<>
      <Line>5. You need a free hand to {escalate === "tq" ? "apply a tourniquet" : "pack the wound"} — pick how.</Line>
      <button style={GO} onClick={() => chooseHands("one")}>One-handed — keep pressure on yourself while you work (harder)</button><Gap />
      {(availableCrew || []).length > 0 ? (<>
        <Choice value={crewId} onChange={setCrewId} placeholder="Which crew member..." options={(availableCrew || []).map((c) => [c.id, c.name])} /><Gap />
        <button style={crewId ? GO : NEUTRAL} disabled={!crewId} onClick={() => chooseHands("two")}>Two-handed — direct them to hold pressure, free your hands</button>
      </>) : (
        <Line>No idle crew member to direct right now.</Line>
      )}
    </>);
    // step 4: perform the chosen escalation
    if (escalate === "pack") {
      if (!opened) return (<>
        <Line>5. Open the gauze and get the packing ready. Pack the wound itself, not just the entrance.</Line>
        <button style={GO} onClick={() => setOpened(true)}>Open the gauze</button>
      </>);
      if (packHeld === 0) {
        const packTarget = hands === "one" ? 80 : 65;
        return (<>
          <Line>6. Pack it in, layer by layer, all the way to the base: {Math.round(packDepth)}% (aim for at least {packTarget}{hands === "one" ? " — one-handed, harder to feel the base" : ""}).</Line>
          <Bar v={packDepth / 100} lo={packTarget / 100} hi={1} />
          <button style={GO} disabled={packDepth < packTarget}
            onClick={() => (packDepth < packTarget ? fail("Only the surface is packed. There's dead space below and the bleeding continues from down there.") : setPackHeld(0.01))}>
            {packDepth < packTarget ? "Keep pressing it in above" : "Packed to the base"}
          </button>
        </>);
      }
      return (<>
        <Line>7. Hold firm pressure directly on top of the packed gauze so it tamponades against the bleeding vessel.</Line>
        <Bar v={Math.min(1, packHeld / 5)} lo={hands === "one" ? 0.75 : 0.55} hi={1} />
        <button style={NEUTRAL} onClick={() => (packHeld < (hands === "one" ? 4 : 3) ? fail("The gauze is packed but nothing held it in place under pressure. Hold firmly on top before you let go.")
          : win(`Packed to the base and held firm${hands === "two" ? ", with a crew member holding pressure while you worked" : ", one-handed"}. Bleeding controlled.`, "pack"))}>Check the pack</button>
      </>);
    }
    // escalate === "tq"
    if (!tqPos) return (<>
      <Line>6. Place the tourniquet 2 to 3 inches above the wound, on bare limb and never over a joint.</Line>
      <Choice value={tqPos} onChange={setTqPos} placeholder="Choose a position..." options={[["high", "2 to 3 inches above the wound, on the limb"], ["wound", "Directly on the wound"], ["joint", "Over the elbow or knee"], ["below", "Below the wound"]]} /><Gap />
      <button style={GO} disabled={!tqPos} onClick={() => (tqPos !== "high" ? fail({ wound: "Placing it on the wound crushes the injury and doesn't compress the artery.", joint: "A tourniquet over a joint can't occlude the artery against the bone.", below: "Below the wound it does nothing for the bleeding." }[tqPos]) : null)}>Slide it into place</button>
    </>);
    if (!tqLocked) return (<>
      <Line>7. Grab the windlass knob and drag in a circle to twist it until the bleeding just stops. {hands === "one" ? "One-handed and awkward — go slow." : "A crew member has your pressure covered, both hands free."}</Line>
      <Bar v={tight} lo={0.55 - 0.1 * (tol * handsMult - 1)} hi={0.85 + 0.1 * (tol * handsMult - 1)} />
      <button style={NEUTRAL} onClick={() => {
        const lo = 0.55 - 0.1 * (tol * handsMult - 1), hi = 0.9 + 0.1 * (tol * handsMult - 1);
        if (tight < lo) fail("Not tight enough. It's venous only and the limb bleeds more. Tighten until the bleeding stops.");
        else if (tight > hi) fail("Far tighter than needed. Loosen and reset it, since over-tightening injures the limb.");
        else setTqLocked(true);
      }}>Lock the windlass</button>
    </>);
    return (<>
      <Line>8. Note the time it went on, since the clock matters at the hospital.</Line>
      <button style={timed ? NEUTRAL : GO} onClick={() => setTimed(true)}>{timed ? "Time written on it" : "Write the time on the tourniquet"}</button><Gap />
      <button style={GO} onClick={() => (timed ? win(`Bleeding controlled with a tourniquet${hands === "two" ? ", crew held pressure while you applied it" : ", one-handed"}, and the time is marked.`, "tq")
        : win(`Bleeding controlled with a tourniquet${hands === "two" ? ", crew-assisted" : ", one-handed"}, but you never marked the time. Say it aloud at handoff.`, "tq"))}>Done</button>
    </>);
  };

  // ---- Scene: the wound/limb itself, with real pointer-driven interaction
  // (press-and-hold on the wound, drag-to-rotate the windlass) rather than a
  // static picture next to a row of buttons.
  const stage = step >= 4 ? escalate : "pressure";
  const held = Math.min(1, (dpHeld || 0) / 8);
  const woundPressable = step === 1 || (escalate === "pack" && opened && (packHeld === 0 || packHeld > 0));
  const box = { viewBox: "0 0 200 100", ref: svgRef, style: { width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 4, touchAction: "none" } };
  const defs = (
    <defs>
      <linearGradient id="bcSkinGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E3AE87" />
        <stop offset="55%" stopColor="#CD9068" />
        <stop offset="100%" stopColor="#B87A54" />
      </linearGradient>
      <radialGradient id="bcWoundGrad" cx="45%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#8A1F2A" />
        <stop offset="100%" stopColor="#4A1015" />
      </radialGradient>
      <linearGradient id="bcGauzeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F3F0E6" />
        <stop offset="100%" stopColor="#D8D2BE" />
      </linearGradient>
    </defs>
  );

  let scene;
  if (stage === "tq") {
    const w = 15 + tight * 11;
    const bandColor = tight > 0.5 ? "#7A1E1E" : C.amber;
    const rot = tight * 1080; // real, continuous spin — several full turns as it tightens
    scene = (
      <svg {...box} onPointerMove={knobMove} onPointerUp={knobUp} onPointerLeave={knobUp}>
        {defs}
        <path d="M -10 -6 Q 100 -14 210 -6 L 210 34 Q 100 44 -10 34 Z" fill="url(#bcSkinGrad)" transform="translate(0,30)" />
        <path d="M -10 -6 Q 100 -14 210 -6" fill="none" stroke="#F3CBA8" strokeWidth={1.5} opacity={0.5} transform="translate(0,30)" />
        <rect x={90 - w / 2} y={34} width={w} height={34} rx={5} fill={bandColor} opacity={0.88} />
        {[8, 16, 24].map((dy) => (
          <line key={dy} x1={90 - w / 2} y1={34 + dy} x2={90 + w / 2} y2={34 + dy} stroke="#00000030" strokeWidth={1} />
        ))}
        <g onPointerDown={knobDown} style={{ cursor: "grab" }}>
          <circle cx={90} cy={51} r={9} fill="transparent" />
          <circle cx={90} cy={51} r={4.5} fill={twisting ? C.amber : "#16202A"} transform={`rotate(${rot} 90 51)`} />
          <line x1={76} y1={51} x2={104} y2={51} stroke="#C8D3D9" strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${rot} 90 51)`} />
        </g>
        {crewHolding && <CrewHand />}
      </svg>
    );
  } else if (stage === "pack") {
    const depthPx = (packDepth / 100) * 14;
    scene = (
      <svg {...box} onPointerUp={onWoundUp} onPointerLeave={onWoundUp}>
        {defs}
        <ellipse cx={100} cy={55} rx={78} ry={40} fill="url(#bcSkinGrad)" />
        <ellipse cx={100} cy={55} rx={17} ry={13} fill="url(#bcWoundGrad)"
          onPointerDown={woundPressable ? onWoundDown : undefined} style={{ cursor: woundPressable ? "pointer" : "default" }} />
        {woundPressable && <circle cx={100} cy={55} r={26} fill="transparent" onPointerDown={onWoundDown} style={{ cursor: "pointer" }} />}
        {depthPx > 0 && <>
          <rect x={90} y={55 - depthPx} width={20} height={depthPx} rx={2} fill="url(#bcGauzeGrad)" opacity={0.9} style={{ pointerEvents: "none" }} />
          {[0.3, 0.55, 0.8].map((f) => (
            <line key={f} x1={90} y1={55 - depthPx * f} x2={110} y2={55 - depthPx * f} stroke="#B7B098" strokeWidth={0.8} opacity={0.5} style={{ pointerEvents: "none" }} />
          ))}
        </>}
        {(packPressing || packingIn) && <ellipse cx={100} cy={55} rx={25} ry={19} fill="#E9EDE6" opacity={0.4} stroke={C.line} strokeWidth={1} style={{ pointerEvents: "none" }} />}
        <PlayerHand x={100} y={55} active={packPressing || packingIn} />
        {crewHolding && <CrewHand />}
      </svg>
    );
  } else {
    scene = (
      <svg {...box} onPointerUp={onWoundUp} onPointerLeave={onWoundUp}>
        {defs}
        <ellipse cx={100} cy={55} rx={78} ry={40} fill="url(#bcSkinGrad)" />
        <ellipse cx={100} cy={55} rx={11} ry={8} fill="url(#bcWoundGrad)" opacity={Math.max(0.15, 1 - held * 0.8)}
          onPointerDown={step === 1 ? onWoundDown : undefined} style={{ cursor: step === 1 ? "pointer" : "default" }} />
        {step === 1 && <circle cx={100} cy={55} r={24} fill="transparent" onPointerDown={onWoundDown} style={{ cursor: "pointer" }} />}
        {held > 0 && (
          <ellipse cx={100} cy={55} rx={22} ry={17} fill="url(#bcGauzeGrad)" opacity={0.6} stroke={C.line} strokeWidth={1} style={{ pointerEvents: "none" }} />
        )}
        <PlayerHand x={100} y={55} active={pressing} />
        {crewHolding && <CrewHand />}
      </svg>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>Bleeding control — {label}</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && scene}
        {!flash && woundLabel() && <div style={{ fontSize: 11.5, color: C.amber, textAlign: "center", marginBottom: 10 }}>{woundLabel()}</div>}
        {!flash && stage === "tq" && !tqLocked && tqPos && (
          <div style={{ fontSize: 11.5, color: C.amber, textAlign: "center", marginBottom: 10 }}>Drag around the knob to twist it.</div>
        )}
        {!flash && body()}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash.ok ? "#7CD68A" : C.red, marginBottom: 10 }}>{flash.why}</div>
            <button style={NEUTRAL} onClick={() => {
              if (hands === "two") onReleaseCrew?.(crewId);
              if (flash.ok) onResolve(PROCEDURE_OUTCOME.SUCCESS, { finalProc: flash.finalProc, hands });
              else onResolve(PROCEDURE_OUTCOME.FAILED, flash.why);
            }}>Continue</button>
          </div>
        )}
        {!flash && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={() => { if (hands === "two") onReleaseCrew?.(crewId); onResolve(PROCEDURE_OUTCOME.CANCELLED); }} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
            {interrupted && <button onClick={() => { if (hands === "two") onReleaseCrew?.(crewId); onResolve(PROCEDURE_OUTCOME.ABORTED); }} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon and attend to the patient</button>}
          </div>
        )}
      </div>
    </div>
  );
}
