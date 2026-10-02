import { useState, useEffect, useRef } from "react";
import { C } from "../theme.js";
import { accessDifficulty, veinVisibility, veinPalpability } from "../access.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Real IV cannulation sub-sites within a limb the player has already
// selected from the main action menu (region stays the outer choice, so
// g.ivSites/dosing/labels — which key off region, not exact vein — are
// completely unaffected; this is purely the "give the player several real
// access points to choose from" layer the operator asked for, contained to
// this component). x is the horizontal fraction along the forearm SVG below
// (0 = wrist/hand end, 1 = elbow end); arteryNear gates the arterial-
// puncture failure mode (the brachial artery runs directly alongside the
// median cubital vein at the AC — it does not run near the hand or mid
// forearm superficial veins).
// Every peripheral vein drains proximally (toward the heart) — so the
// "correct" direction answer is always proximal, same as real anatomy.
// A wrong ("distal") guess is a genuine, real mistake, not a coin flip.
const ARM_SUBSITES = [
  { id: "hand", label: "dorsal hand", x: 0.12, visMod: -0.05, widthMod: 0.65, arteryNear: false, trueDirection: "proximal" },
  { id: "forearm", label: "forearm (cephalic)", x: 0.5, visMod: 0, widthMod: 1, arteryNear: false, trueDirection: "proximal" },
  { id: "ac", label: "antecubital (median cubital)", x: 0.86, visMod: 0.18, widthMod: 1.35, arteryNear: true, trueDirection: "proximal" },
];
const LEG_SUBSITES = [
  { id: "foot", label: "dorsal foot", x: 0.14, visMod: -0.05, widthMod: 0.65, arteryNear: false, trueDirection: "proximal" },
  { id: "saphenous", label: "saphenous", x: 0.6, visMod: 0.05, widthMod: 1, arteryNear: false, trueDirection: "proximal" },
];
const LIMBS_ARM = ["armR", "armL"];
const IV_SITE_LABEL_PREFIX = { armR: "right ", armL: "left ", legR: "right ", legL: "left " };
const GAUGES = [14, 16, 18, 20, 22, 24];

// A single generic hold-to-fill helper for the confirmation sequence's own
// two hold gestures (advance the catheter off the needle; flush the line) —
// reuses the exact same press-and-hold idiom the insert phase already
// established rather than inventing a second control scheme.
function useHoldFill(active, setter) {
  useEffect(() => {
    if (!active) return undefined;
    const iv = setInterval(() => setter(p => Math.min(1, p + 0.03)), 30);
    return () => clearInterval(iv);
  }, [active, setter]);
}

// A real, interactive replacement for the flat "click IV/IO, roll a die"
// procedures — uncap, position/angle, insert slowly, watch for the real
// clinical confirmation sign (flash for IV, a "pop" through the cortex for
// IO). Difficulty (vein/landmark tolerance, angle/depth bands) is driven
// entirely by accessDifficulty() — real physiology fields, not a hidden
// probability roll. IV and IO share this shell (uncap -> position/angle ->
// insert -> result) since the real skill shape is the same; the visual
// metaphor and target bands differ, computed per-kind below. Airway
// procedures (ETT/laryngoscopy/cric/SGA) are their own, structurally
// different mini-games — not a variant of this component.
//
// onResolve(outcome, detail) — a PROCEDURE_OUTCOME value plus an optional
// detail string (a miss reason for FAILED, unused for the others). App.jsx's
// resolveAccessMinigame() does everything after that: re-invokes the
// original action on SUCCESS (so PK/IV-line, artificialAirway, etc. effects
// land exactly as they always did), charges a real, escalating retry cost on
// FAILED, or closes for free (but now visibly, via the same resolver) on
// CANCELLED. This is the single entry point every mini-game resolves
// through — there is no separate onCancel prop anymore.

const IO_SITE_LABEL = { armR: "right proximal humerus", armL: "left proximal humerus", legR: "right proximal tibia", legL: "left proximal tibia", torso: "sternal (manubrium)" };

export default function AccessMinigame({ open, kind, site, attempts, pat, assist, interrupted, onResolve, onDialogue }) {
  // IV step sequence, matching the real 4-phase skill: "assess" (choose the
  // exact vein, inspect/palpate it, estimate its direction, pick a gauge) ->
  // "insert" (angle + lateral deviation + depth + advancement velocity, all
  // at once) -> a confirmation sequence ("flashCheck" -> "advance" ->
  // "withdraw" -> "occlude" -> "flush") that surfaces the real, distinct
  // failure taxonomy (infiltration/arterial puncture/blown vein/failed
  // attempt) instead of one instantaneous release->flash->done gesture. IO
  // keeps its original, simpler uncap->position->insert shape (a landmark-
  // and-drill skill, not a vein-finding one).
  const [step, setStep] = useState(kind === "io" ? "uncap" : "assess");
  const [subSite, setSubSite] = useState(null); // IV only: chosen ARM_SUBSITES/LEG_SUBSITES id
  const [inspected, setInspected] = useState(false);
  const [palpated, setPalpated] = useState(false);
  const [palpating, setPalpating] = useState(false);
  const [directionGuess, setDirectionGuess] = useState(null); // "proximal" | "distal" | null
  const [gauge, setGauge] = useState(18);
  const [angle, setAngle] = useState(kind === "io" ? 90 : 20);
  const [lateral, setLateral] = useState(0); // IV insert phase, -1..1
  const [offset, setOffset] = useState(0); // IO landmark position, -1..1
  const [depth, setDepth] = useState(0);
  const [holding, setHolding] = useState(false);
  const [flash, setFlash] = useState(null); // terminal outcome key | null (also used as "the stick landed, evaluating" gate for IV's confirm sequence)
  const [catheterAdv, setCatheterAdv] = useState(0);
  const [flushProg, setFlushProg] = useState(0);
  const [arterialCallout, setArterialCallout] = useState(null); // player's flashCheck judgment, IV only
  const angleRef = useRef(angle);
  const lateralRef = useRef(lateral);
  const depthRef = useRef(depth);
  const holdStartRef = useRef(0);
  useEffect(() => { angleRef.current = angle; }, [angle]);
  useEffect(() => { lateralRef.current = lateral; }, [lateral]);
  useEffect(() => { depthRef.current = depth; }, [depth]);

  // IV, reworked per operator instruction: click-and-hold to advance the
  // needle (a continuous press, not a slider drag) while arrow keys adjust
  // insertion angle live mid-advance — matches how a real stick actually
  // feels (one hand holding steady pressure in, the other/wrist fine-tuning
  // angle), rather than two separate discrete slider steps.
  useEffect(() => {
    if (kind !== "iv" || step !== "insert" || flash) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { setAngle(a => Math.max(0, a - 1)); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setAngle(a => Math.min(60, a + 1)); e.preventDefault(); }
      else if (e.key === "ArrowUp") { setLateral(l => Math.max(-1, l - 0.04)); e.preventDefault(); }
      else if (e.key === "ArrowDown") { setLateral(l => Math.min(1, l + 0.04)); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kind, step, flash]);

  useEffect(() => {
    if (!holding || flash) return;
    const iv = setInterval(() => setDepth(d => Math.min(1, d + 0.02)), 30);
    return () => clearInterval(iv);
  }, [holding, flash]);

  const [advancing, setAdvancing] = useState(false);
  const [flushing, setFlushing] = useState(false);
  useHoldFill(advancing, setCatheterAdv);
  useHoldFill(flushing, setFlushProg);

  if (!open || (kind !== "iv" && kind !== "io")) return null;

  const diff = accessDifficulty(kind, pat);
  // Spec 2.9: a player-chosen margin-of-error multiplier, applied ON TOP of
  // the physiology-derived difficulty above — the real vein position/size
  // doesn't move for an accessibility setting, only how forgiving the
  // acceptance band around it is. 1 at "standard" (unchanged behavior).
  const assistMult = assistToleranceMult(assist);

  if (kind === "iv") {
    const subsites = LIMBS_ARM.includes(site) ? ARM_SUBSITES : LEG_SUBSITES;
    const active = subsites.find(s2 => s2.id === subSite) || subsites[1] || subsites[0];
    // Gauge is threaded into the difficulty calc for THIS attempt only —
    // access.js's own bigBoreFactor makes this a no-op at the 18g default.
    const ivDiff = accessDifficulty("iv", pat, { gauge });
    const baseVis = veinVisibility(pat) + active.visMod;
    const basePalp = veinPalpability(pat) + active.visMod * 0.4;
    const veinVis = Math.max(0.15, Math.min(1, baseVis));
    const veinPalp = Math.max(0.25, Math.min(1, basePalp));
    // Palpation reveals a vein inspection alone under-reports (obesity/
    // dehydration bury it from the eye more than the finger, per access.js's
    // own veinPalpability comment) — so the RENDERED visibility, once
    // palpated, is the better of the two signals, not just the visual one.
    const revealedVis = palpated ? Math.max(veinVis, veinPalp * 0.85) : veinVis;
    const angleTol = Math.max(3, 10 - (ivDiff.score - 1) * 5) * assistMult;
    const targetAngle = 22; // real peripheral-IV insertion angle, ~15-30 deg
    // A correct direction estimate (Phase 2) widens the lateral band — the
    // player told the engine which way they think the vein runs, and a
    // right guess means they're genuinely aiming better, not being handed
    // a free pass; a wrong guess narrows it, the real cost of a bad read.
    const guessCorrect = directionGuess === active.trueDirection;
    const baseLateralTol = Math.max(0.12, 0.34 - (ivDiff.score - 1) * 0.12);
    const lateralTol = baseLateralTol * (directionGuess ? (guessCorrect ? 1.35 : 0.7) : 1) * assistMult;
    const rawVeinWidth = Math.max(0.06, 0.16 - (ivDiff.score - 1) * 0.06) * active.widthMod;
    const veinCenter = 0.34 + (ivDiff.score - 1) * 0.16 + rawVeinWidth / 2;
    const veinWidth = Math.min(0.5, rawVeinWidth * assistMult);
    const veinTop = Math.max(0, veinCenter - veinWidth / 2);
    const veinBottom = veinTop + veinWidth;

    const releaseNeedle = () => {
      setHolding(false);
      if (flash) return;
      if (onDialogue && Math.random() < 0.45) onDialogue("procedure_discomfort");
      const a = angleRef.current, lat = lateralRef.current, d = depthRef.current;
      const elapsedS = Math.max(0.15, (performance.now() - holdStartRef.current) / 1000);
      const velocity = d / elapsedS; // depth-fraction per second — a real "how fast did you push it in"

      if (Math.abs(a - targetAngle) > angleTol) { setFlash("angleMiss"); return; }
      if (Math.abs(lat) > lateralTol) { setFlash("lateralMiss"); return; }
      // Too slow on a fragile/hard vein: it rolls out of the way rather
      // than being pierced — a real, teachable distinct miss from angle.
      if (velocity < 0.4 && ivDiff.score > 1.3 && d < veinBottom) { setFlash("rolled"); return; }
      if (d < veinTop) { setFlash("shallow"); return; }
      // Too fast blows through the back wall even at an otherwise fine
      // angle/depth reading — advancement velocity mattering for real,
      // not just angle+depth in isolation.
      const overshoot = d > veinBottom || (velocity > 2.2 && d > veinTop + veinWidth * 0.6);
      if (overshoot) {
        if (active.arteryNear && (a > targetAngle + 7 || d > veinBottom + 0.06)) { setFlash("artery"); return; }
        setFlash("blown");
        return;
      }
      // A real placement — but how close to the boundary it landed decides
      // whether it holds up once flushed (infiltration) or is solid.
      const margin = Math.min(d - veinTop, veinBottom - d, angleTol - Math.abs(a - targetAngle), lateralTol - Math.abs(lat)) /
        Math.max(0.001, Math.min(veinWidth, angleTol, lateralTol));
      setFlash(margin < 0.22 ? "marginal" : "solid");
    };

    const advanceCatheter = () => { if (catheterAdv < 1) return; setStep("withdraw"); };
    // The real moment infiltration or an unrecognized arterial puncture
    // reveals itself — swelling/pulsatile backflow appearing only once
    // fluid is actually pushed through, not at the initial flash. Computed
    // once flush completes, then surfaced as an ordinary flash+Continue
    // result screen (same pattern every other outcome in this component
    // uses) rather than resolving instantly out from under the player.
    const finishFlush = () => {
      setFlushing(false);
      setStep("done");
      if (arterialCallout === "arterial" && flash === "artery") { setFlash("arteryCaught"); return; }
      if (arterialCallout === "arterial" && flash !== "artery") { setFlash("arteryFalseAlarm"); return; }
      if (flash === "artery") { setFlash("arteryMissed"); return; }
      if (flash === "marginal") { setFlash("infiltration"); return; }
      setFlash("success");
    };
    const finishTerminal = () => {
      if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS, { gauge }); return; }
      onResolve(PROCEDURE_OUTCOME.FAILED, {
        angleMiss: "Wrong angle. Missed the vein entirely — no flashback.",
        lateralMiss: "Off to the side of the vein — no flashback.",
        shallow: "Too shallow, no flash; needle's still subcutaneous.",
        blown: "In too deep; blew through the back wall of the vein.",
        rolled: "The vein rolled out from under the needle — too tentative an approach on a fragile vein.",
        arteryCaught: "Recognized the pulsatile, bright flashback as arterial — held pressure, no catheter advanced. Good catch; site is unusable, try elsewhere.",
        arteryFalseAlarm: "Second-guessed a good venous flash and pulled a working line for nothing.",
        arteryMissed: "Arterial puncture, missed on the flash — bright, pulsatile return once flushed, and a hematoma is already forming. Hold pressure, try another site.",
        infiltration: "Infiltration. The catheter tip was just outside the vein — it looked fine until you flushed, and the site is visibly swelling now.",
      }[flash] || "Missed.");
    };
    const cancel = () => onResolve(PROCEDURE_OUTCOME.CANCELLED);
    const abandon = () => onResolve(PROCEDURE_OUTCOME.ABORTED);
    const terminalMiss = ["angleMiss", "lateralMiss", "shallow", "blown", "rolled", "arteryCaught", "arteryFalseAlarm", "arteryMissed", "infiltration", "success"].includes(flash);

    const RESULT_TEXT = {
      angleMiss: "Wrong angle, no flashback.", lateralMiss: "Off to the side, no flashback.",
      shallow: "Too shallow, no flash.", blown: "Blew through the back wall.",
      rolled: "The vein rolled away.",
      arteryCaught: "Recognized arterial — pressure held, attempt aborted.",
      arteryFalseAlarm: "That was actually venous. Line pulled for nothing.",
      arteryMissed: "Arterial puncture, missed until flush.",
      infiltration: "Infiltration on flush — the tip wasn't in the lumen.",
      success: "Catheter secure, line flushes clean. IV established.",
    };

    const armSvg = (
      <svg viewBox="0 0 200 120" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 12, touchAction: "none",
          cursor: step === "insert" && !flash ? (holding ? "grabbing" : "grab") : "default" }}
        onPointerDown={() => { if (step === "insert" && !flash) { setHolding(true); holdStartRef.current = performance.now(); } }}
        onPointerUp={() => { if (holding) releaseNeedle(); }}
        onPointerLeave={() => { if (holding) releaseNeedle(); }}>
        <defs>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3AE87" />
            <stop offset="55%" stopColor="#CD9068" />
            <stop offset="100%" stopColor="#B87A54" />
          </linearGradient>
          <linearGradient id="veinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={flash === "artery" ? "#B23A2E" : "#7D3E52"} />
            <stop offset="100%" stopColor={flash === "artery" ? "#7A2119" : "#4A2436"} />
          </linearGradient>
        </defs>
        {/* forearm: a gently tapered limb, not a flat strip, so this
            reads as skin rather than an abstract cross-section bar */}
        <path d="M -10 -6 Q 100 -14 210 -6 L 210 34 Q 100 44 -10 34 Z" fill="url(#skinGrad)" />
        <path d="M -10 -6 Q 100 -14 210 -6" fill="none" stroke="#F3CBA8" strokeWidth={1.5} opacity={0.5} />
        {/* subtle skin texture / creases */}
        <path d="M 10 6 Q 100 -2 190 6" fill="none" stroke="#00000022" strokeWidth={1} />
        <path d="M 10 24 Q 100 32 190 24" fill="none" stroke="#00000022" strokeWidth={1} />
        {step === "assess" && subsites.map(s2 => (
          <g key={s2.id} role="button" aria-label={`Choose ${s2.label}`} onClick={() => setSubSite(s2.id)} style={{ cursor: "pointer" }}>
            <circle cx={s2.x * 200} cy={30} r={subSite === s2.id ? 10 : 7} fill={subSite === s2.id ? (C.amber || "#D9A441") : "#8A6A52"}
              opacity={subSite === s2.id ? 0.9 : 0.55} stroke="#000" strokeWidth={0.5} />
          </g>
        ))}
        {step !== "assess" && (
          <>
            {/* the vein itself, gently curved rather than a straight bar,
                with a soft glow scaled by how visible/palpated it is */}
            <path
              d={`M -5 ${30 + veinTop * 80 + veinWidth * 40} Q 60 ${30 + veinTop * 80 + veinWidth * 40 - 6} 100 ${30 + (veinTop + veinWidth / 2) * 80} T 205 ${30 + veinTop * 80 + veinWidth * 40 + 5}`}
              fill="none" stroke="url(#veinGrad)" strokeWidth={Math.max(5, veinWidth * 70)} strokeLinecap="round"
              opacity={0.22 + revealedVis * 0.6} />
            {active.arteryNear && <path
              d={`M -5 ${30 + veinTop * 80 + veinWidth * 40 - 14} Q 60 ${30 + veinTop * 80 + veinWidth * 40 - 18} 100 ${30 + (veinTop + veinWidth / 2) * 80 - 14} T 205 ${30 + veinTop * 80 + veinWidth * 40 - 9}`}
              fill="none" stroke="#8A2A24" strokeWidth={4} strokeLinecap="round" opacity={0.18} />}
          </>
        )}
        <line x1={0} y1={30} x2={200} y2={30} stroke="#A9714E" strokeWidth={1.5} opacity={0.6} style={{ pointerEvents: "none" }} />
        {(step === "insert" || step === "flashCheck" || step === "advance" || step === "withdraw" || step === "occlude" || step === "flush") &&
          <NeedleLine angle={angle} depth={depth} pivotY={30} depthScale={80} />}
        {flash === "solid" && <circle cx={100} cy={30 + (veinTop + veinWidth / 2) * 80} r={5} fill={C.red || "#E33"} />}
        {flash === "marginal" && <circle cx={100} cy={30 + (veinTop + veinWidth / 2) * 80} r={5} fill="#E3A33A" opacity={0.9} />}
        {flash === "artery" && <circle cx={100} cy={30 + (veinTop + veinWidth / 2) * 80} r={6} fill="#E33">
          <animate attributeName="r" values="5;7;5" dur="0.6s" repeatCount="indefinite" /></circle>}
      </svg>
    );

    return (
      <MinigameShell title={`IV: ${subSite ? `${(site && IV_SITE_LABEL_PREFIX[site]) || ""}${active.label}` : "choose a site"}`} attempts={attempts} diff={ivDiff} pat={pat} interrupted={interrupted}
        diffNote={ivDiff.band !== "routine" ? "vein is smaller/deeper/harder to find than usual" : ""} onCancel={cancel} onAbandon={abandon}
        flash={terminalMiss ? flash : null} finish={finishTerminal}
        resultText={RESULT_TEXT[flash] || ""}>
        {armSvg}

        {step === "assess" && (
          <>
            <Hint>{subSite ? `Selected: ${active.label}. ` : "Click a marked point on the arm to pick a vein to attempt."}</Hint>
            {subSite && (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <StepButton onClick={() => setInspected(true)}>{inspected ? `Looks ${veinVis > 0.6 ? "well-filled and easy to see" : veinVis > 0.4 ? "faint but visible" : "barely visible"}` : "Look closer"}</StepButton>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button onPointerDown={() => setPalpating(true)} onPointerUp={() => { setPalpating(false); setPalpated(true); }} onPointerLeave={() => setPalpating(false)}
                    className="px-3 py-2 rounded" style={{ flex: 1, background: palpating ? (C.amber || "#D9A441") : "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>
                    {palpated ? `Feels ${veinPalp > 0.55 ? "bouncy and full" : "thready, but there"}` : "Press and hold to palpate"}
                  </button>
                </div>
                <Hint>Which way does this vein drain?</Hint>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button onClick={() => setDirectionGuess("proximal")} className="px-3 py-2 rounded"
                    style={{ flex: 1, background: directionGuess === "proximal" ? (C.amber || "#D9A441") : "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Proximal (toward the heart)</button>
                  <button onClick={() => setDirectionGuess("distal")} className="px-3 py-2 rounded"
                    style={{ flex: 1, background: directionGuess === "distal" ? (C.amber || "#D9A441") : "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Distal (away from the heart)</button>
                </div>
                <Hint>Catheter gauge (smaller number = bigger bore, faster flow, harder to seat):</Hint>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {GAUGES.map(g => (
                    <button key={g} onClick={() => setGauge(g)} className="px-2 py-1 rounded"
                      style={{ flex: 1, minWidth: 44, background: gauge === g ? (C.amber || "#D9A441") : "#1B232B", border: `1px solid ${C.line}`, color: C.text, fontSize: 12 }}>{g}g</button>
                  ))}
                </div>
                <StepButton onClick={() => setStep("insert")}>Uncap the needle and start the stick</StepButton>
              </>
            )}
          </>
        )}

        {step === "insert" && !flash && (
          <>
            <Hint>Angle {angle.toFixed(0)}° (◀ ▶, or ←/→), lateral {(lateral * 100).toFixed(0)}% (↑/↓). Press and hold directly on the arm to advance the needle ({(depth * 100).toFixed(0)}%) — steady pressure, not a jab.</Hint>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <button onClick={() => setAngle(a => Math.max(0, a - 1))} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>◀ Angle</button>
              <button onClick={() => setAngle(a => Math.min(60, a + 1))} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Angle ▶</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <button onClick={() => setLateral(l => Math.max(-1, l - 0.04))} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>◀ Lateral</button>
              <button onClick={() => setLateral(l => Math.min(1, l + 0.04))} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Lateral ▶</button>
            </div>
          </>
        )}

        {(flash === "solid" || flash === "marginal" || flash === "artery") && step === "insert" && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 13, color: flash === "artery" ? "#E3A33A" : "#7CD68A", marginBottom: 10 }}>
              {flash === "artery" ? "A flash — bright red, and it pulses with the needle." : "Flash! You're in the vein."}
            </div>
            <Hint>Is this venous or arterial?</Hint>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={() => { setArterialCallout("venous"); setStep("flashCheck"); }} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>Looks venous — proceed</button>
              <button onClick={() => { setArterialCallout("arterial"); setStep("flashCheck"); }} className="px-3 py-2 rounded"
                style={{ flex: 1, background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Arterial — stop, hold pressure</button>
            </div>
          </div>
        )}

        {step === "flashCheck" && arterialCallout === "venous" && (
          <StepButton onClick={() => setStep("advance")}>Advance the catheter off the needle</StepButton>
        )}
        {step === "flashCheck" && arterialCallout === "arterial" && (
          <StepButton onClick={finishFlush}>Hold pressure and document a failed attempt</StepButton>
        )}

        {step === "advance" && (
          <>
            <Hint>Press and hold to slide the catheter forward off the needle ({(catheterAdv * 100).toFixed(0)}%).</Hint>
            <div style={{ height: 10, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
              <div style={{ width: `${catheterAdv * 100}%`, height: "100%", background: C.hr, borderRadius: 4 }} />
            </div>
            <button onPointerDown={() => setAdvancing(true)} onPointerUp={() => setAdvancing(false)} onPointerLeave={() => setAdvancing(false)}
              className="px-3 py-2 rounded w-full" style={{ background: "#1B232B", border: `1px solid ${C.line}`, color: C.text, marginBottom: 8 }}>
              Hold to advance
            </button>
            <StepButton onClick={advanceCatheter}>{catheterAdv >= 1 ? "Catheter fully advanced" : "Advance fully first"}</StepButton>
          </>
        )}
        {step === "withdraw" && <StepButton onClick={() => setStep("occlude")}>Withdraw the needle</StepButton>}
        {step === "occlude" && <StepButton onClick={() => setStep("flush")}>Apply occlusive pressure and connect the line</StepButton>}
        {step === "flush" && (
          <>
            <Hint>Press and hold to flush the line ({(flushProg * 100).toFixed(0)}%).</Hint>
            <div style={{ height: 10, background: "#10151A", border: `1px solid ${C.line}`, borderRadius: 5, marginBottom: 8 }}>
              <div style={{ width: `${flushProg * 100}%`, height: "100%", background: C.hr, borderRadius: 4 }} />
            </div>
            <button onPointerDown={() => setFlushing(true)} onPointerUp={() => setFlushing(false)} onPointerLeave={() => setFlushing(false)}
              className="px-3 py-2 rounded w-full" style={{ background: "#1B232B", border: `1px solid ${C.line}`, color: C.text, marginBottom: 8 }}>
              Hold to flush
            </button>
            <StepButton onClick={finishFlush}>{flushProg >= 1 ? "Flushed — confirm the line" : "Flush fully first"}</StepButton>
          </>
        )}
      </MinigameShell>
    );
  }

  // ---- IO: uncap the driver -> find the landmark -> perpendicular angle
  // is fixed for this shell (real IO technique is perpendicular to the
  // bone; the SKILL is landmark position, not angle hunting the way IV
  // is), then advance until a real "pop" through the cortex — the actual
  // tactile confirmation sign, standing in for IV's flash. Overshooting
  // past the pop depth is a real, distinct failure (through-and-through,
  // past the far cortex), not just "less correct."
  const landmarkTol = Math.max(0.08, 0.32 - (diff.score - 1) * 0.14) * assistMult;
  const popDepth = 0.55 + (diff.score - 1) * 0.1;
  const popBand = 0.08 * assistMult;

  const attemptDrive = () => {
    // Same real-stick moment/probability as the IV path above — the IO
    // driver's own "drive to pop" is this procedure's equivalent physical
    // event, not a separate mechanism.
    if (onDialogue && Math.random() < 0.45) onDialogue("procedure_discomfort");
    if (Math.abs(offset) > landmarkTol) { setFlash("landmark"); return; }
    if (depth < popDepth - popBand / 2) { setFlash("shallow"); return; }
    if (depth > popDepth + popBand) { setFlash("through"); return; }
    setFlash("success");
  };
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      landmark: "Off the landmark; needle skated off the bone.",
      shallow: "No pop yet, still in the periosteum.",
      through: "Drove through the far cortex.",
    }[flash] || "Missed.");
  };
  const cancel = () => onResolve(PROCEDURE_OUTCOME.CANCELLED);
  const abandon = () => onResolve(PROCEDURE_OUTCOME.ABORTED);

  return (
    <MinigameShell title={`IO: ${IO_SITE_LABEL[site] || "the site"}`} attempts={attempts} diff={diff} pat={pat} interrupted={interrupted}
      diffNote={diff.band !== "routine" ? "landmark obscured, soft tissue swelling" : ""} onCancel={cancel} onAbandon={abandon} flash={flash} finish={finish}
      resultText={flash === "success" ? "Pop! You're through the cortex." : flash === "landmark" ? "Off the landmark." :
        flash === "shallow" ? "No pop yet." : flash === "through" ? "Drove through the far cortex." : ""}>
      <svg viewBox="0 0 200 120" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 12 }}>
        <defs>
          <linearGradient id="ioSkinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3AE87" />
            <stop offset="100%" stopColor="#CD9068" />
          </linearGradient>
          <linearGradient id="ioCortexGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4EBDA" />
            <stop offset="100%" stopColor="#DCCBA6" />
          </linearGradient>
          <linearGradient id="ioMarrowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A6906A" />
            <stop offset="100%" stopColor="#7A6748" />
          </linearGradient>
        </defs>
        <path d="M -10 -8 Q 100 -16 210 -8 L 210 20 Q 100 26 -10 20 Z" fill="url(#ioSkinGrad)" />
        <rect x={0} y={20} width={200} height={12} fill="url(#ioCortexGrad)" /> {/* cortex */}
        <path d="M 0 20 Q 100 27 200 20" fill="none" stroke="#B8A27A" strokeWidth={1} opacity={0.6} />
        <rect x={0} y={32} width={200} height={70} fill="url(#ioMarrowGrad)" opacity={0.75} /> {/* medullary cavity */}
        {/* faint trabecular texture inside the marrow space */}
        {[18, 46, 74, 102, 130, 158, 186].map((x) => (
          <line key={x} x1={x} y1={34} x2={x + 6} y2={98} stroke="#00000018" strokeWidth={2} />
        ))}
        <rect x={100 + (0 - landmarkTol) * 90} y={20} width={landmarkTol * 2 * 90} height={12}
          fill={C.amber} opacity={0.35} />
        {step !== "uncap" && <NeedleLine angle={angle} depth={depth} pivotY={20} depthScale={70} xOffset={offset * 90} vertical />}
        {flash === "success" && <circle cx={100 + offset * 90} cy={20 + popDepth * 70} r={4} fill={C.red || "#E33"} />}
      </svg>
      {step === "uncap" && <StepButton onClick={() => setStep("position")}>Ready the IO driver</StepButton>}
      {step === "position" && (
        <>
          <Hint>Find the landmark: flat, wide part of the bone, perpendicular.</Hint>
          <Slider min={-1} max={1} step={0.02} value={offset} onChange={setOffset} />
          <StepButton onClick={() => setStep("insert")}>Position set, advance</StepButton>
        </>
      )}
      {step === "insert" && !flash && (
        <>
          <Hint>Advance with steady pressure until you feel a give ({(depth * 100).toFixed(0)}%).</Hint>
          <Slider min={0} max={1} step={0.01} value={depth} onChange={setDepth} />
          <StickButton onClick={attemptDrive}>Drive</StickButton>
        </>
      )}
    </MinigameShell>
  );
}

function MinigameShell({ title, attempts, diff, diffNote, pat, interrupted, onCancel, onAbandon, flash, finish, resultText, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10,
        padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>
          {title}{attempts > 0 ? ` (attempt ${attempts + 1})` : ""}
        </div>
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 12 }}>
          Difficulty: {diff.band}{diffNote ? `: ${diffNote}` : ""}
        </div>
        <MinigameVitalsStrip pat={pat} />
        {/* Spec 2.5: sim time keeps running underneath this modal now, so
            the vitals strip above is genuinely live, not a snapshot — and
            when the patient's real condition changes enough to fire a
            visible clinical event (ClinicalEventAlert's own edge-detection,
            App.jsx), this banner and the Abandon button below surface it
            here too, instead of the player only finding out after they
            close the mini-game. */}
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`,
            borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed — check the alert once you're done, or abandon now.
          </div>
        )}
        {children}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>{resultText}</div>
            <StepButton onClick={finish}>Continue</StepButton>
          </div>
        )}
        {!flash && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={onCancel} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>
              Cancel attempt
            </button>
            {interrupted && (
              <button onClick={onAbandon} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>
                Abandon — attend to the patient
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NeedleLine({ angle, depth, pivotY, depthScale, xOffset = 0, vertical = false }) {
  const rad = (angle * Math.PI) / 180;
  const cx = 100 + xOffset;
  // Vertical travel now uses the SAME depth*depthScale the vein/pop-depth
  // target rectangles are drawn with (see the veinTop/veinWidth and
  // popDepth math above) — previously this used an unrelated sin(angle)-
  // scaled formula that reached barely a third of the vein rect's own
  // scale, so a needle at a genuinely winning depth visually stopped well
  // short of the vein. "Depth" now means the same thing visually as it
  // does in the win-condition check.
  const tipY = pivotY + depth * depthScale;
  // Horizontal lean is a small, capped cosmetic tilt (shallower angle leans
  // more) — NOT the old tan(angle)-derived traversal of the full vertical
  // depth, which sent the tip up to ~200px sideways at a realistic ~22
  // degree insertion angle. That was invisible back when the vein was
  // drawn as a flat bar spanning the whole width, but the vein is now drawn
  // as a gentle curve that only actually passes through the win-condition
  // target at the fixed entry x (cx) — so the old formula dragged the
  // needle tip visibly away from where the vein bends, even on a
  // successful stick. Keep the tip anchored near the entry point instead.
  const LEAN_MAX = 16;
  const lean = vertical ? 0 : LEAN_MAX * Math.max(0, Math.min(1, 1 - angle / 60)) * depth;
  const tipX = vertical ? cx : cx + lean;
  const tipYClamped = Math.max(pivotY, tipY);
  // The hub (the external end of the needle, x1/y1) used to be pinned at a
  // fixed offset from the entry point regardless of depth, while only the
  // tip moved — so as depth grew, only one end of the line moved and the
  // needle visibly kinked/bent instead of sliding forward as one rigid
  // piece. Translate the WHOLE line by the same (lean, depth) vector the
  // tip moves by, so hub and tip stay a fixed distance apart along a
  // constant angle throughout the advance — it now slides straight in,
  // matching how a real needle only translates along its own axis.
  const translateX = tipX - cx;
  const translateY = tipYClamped - pivotY;
  const hubX = (vertical ? cx : cx - Math.cos(rad) * 40) + translateX;
  const hubY = (vertical ? pivotY - 20 : pivotY - Math.sin(rad) * 40) + translateY;
  return (
    <line x1={hubX} y1={hubY}
      x2={tipX} y2={tipYClamped} stroke={C.text || "#DDE"} strokeWidth={2.5} strokeLinecap="round" />
  );
}

function Hint({ children }) { return <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>{children}</div>; }
function Slider({ min, max, step = 1, value, onChange }) {
  return <input type="range" min={min} max={max} step={step} value={value}
    onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />;
}
function StepButton({ onClick, children }) {
  return <button onClick={onClick} className="px-3 py-2 rounded w-full"
    style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>{children}</button>;
}
function StickButton({ onClick, children }) {
  return <button onClick={onClick} className="px-3 py-2 rounded w-full"
    style={{ background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>{children}</button>;
}
