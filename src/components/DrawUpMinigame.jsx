import { useState } from "react";
import { C } from "../theme.js";
import { DRUGS } from "../data/drugs.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Drawing up a medication: read the order, pick the matching vial out of a
// small tray (the "right drug" check), pull the plunger to the ordered volume
// (the "right dose" check), then flick out the air bubble. Replaces the flat
// 25s busy-timer on the player's "Draw up the next drug" action. A success
// still just sets `prepped` (via start()'s own re-entry), so every existing
// pre-drawn-drug rule in App.jsx is untouched.
//
// The order is random and the volumes are gameplay-only (drugs.js carries a
// dose in mg, not a concentration), so the volume is a training target, not a
// pharmacy-accurate mL figure.
const INJECTABLE = () => Object.entries(DRUGS)
  .filter(([, d]) => /IV|IO|IM/.test(d.route) && !/NEB|PO|INH/.test(d.route))
  .map(([id, d]) => ({ id, name: d.name }));

function pick(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

// A stable, per-vial cap color so the same drug always draws the same way
// within one minigame instance, without needing per-drug art.
const CAP_COLORS = ["#D65D5D", "#5DA3D6", "#5DD68C", "#D6B95D", "#B15DD6"];
function capColorFor(id) {
  let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CAP_COLORS[h % CAP_COLORS.length];
}

// A small glass vial: rubber stopper, flip-off cap, and a label band with the
// drug's own name so the "read the label" step is a real reading task, not a
// button pick. `active` is the vial currently mounted on the syringe.
function Vial({ name, cap, selected, active, onClick }) {
  return (
    <button onClick={onClick} aria-label={`Select vial: ${name}`}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg viewBox="0 0 60 90" width={54} height={81} style={{ filter: selected ? `drop-shadow(0 0 5px ${cap})` : "none" }}>
        <defs>
          <linearGradient id={`vialGlass-${name.replace(/\W/g, "")}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D8E5E4" />
            <stop offset="20%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#EFF6F5" />
            <stop offset="100%" stopColor="#C7D6D5" />
          </linearGradient>
        </defs>
        <rect x={22} y={2} width={16} height={8} rx={2} fill={cap} />
        <rect x={24} y={8} width={12} height={7} fill="#C9C2B8" />
        <rect x={10} y={15} width={40} height={62} rx={6} fill={`url(#vialGlass-${name.replace(/\W/g, "")})`}
          stroke={selected ? cap : "#3A4A54"} strokeWidth={selected ? 2.5 : 1.5} opacity={0.94} />
        {/* glass-glint highlight */}
        <rect x={14} y={19} width={4} height={54} rx={2} fill="#FFFFFF" opacity={0.5} />
        <rect x={13} y={34} width={34} height={20} fill={cap} opacity={0.22} />
        <rect x={13} y={34} width={34} height={20} fill="none" stroke={cap} strokeWidth={1} opacity={0.6} />
        <text x={30} y={46} textAnchor="middle" fontSize={6} fill="#1B242B" fontWeight={700}
          style={{ fontFamily: "ui-monospace,monospace" }}>{name.split(" ")[0].slice(0, 9).toUpperCase()}</text>
        <rect x={13} y={58} width={34} height={2} fill="#B7C2C8" opacity={0.5} />
        <rect x={13} y={64} width={26} height={2} fill="#B7C2C8" opacity={0.5} />
        {active && <circle cx={30} cy={12} r={2.2} fill="#7CD68A" />}
      </svg>
      <span style={{ fontSize: 9.5, color: selected ? C.text : C.faint, textAlign: "center", maxWidth: 60, lineHeight: 1.2 }}>{name}</span>
    </button>
  );
}

// The syringe itself: barrel graduated to 6 mL, plunger position driven live
// by `vol`, and an air bubble at the tip that only clears once flicked. A
// tinted fill (the vial's own cap color) shows what's actually in it.
function Syringe({ vol, max, cap, bubble, hasVial }) {
  const bx = 20, bw = 220, by = 40, bh = 26;
  const fillW = Math.max(0, Math.min(bw - 6, (vol / max) * (bw - 6)));
  return (
    <svg viewBox="0 0 280 90" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
      {/* needle */}
      <line x1={bx - 14} y1={by + bh / 2} x2={bx} y2={by + bh / 2} stroke="#B9C4C9" strokeWidth={2} />
      {/* barrel, clear plastic with a light sheen rather than flat black */}
      <rect x={bx} y={by} width={bw} height={bh} rx={4} fill="#161F26" stroke={C.line} strokeWidth={1.5} opacity={0.9} />
      <rect x={bx + 2} y={by + 2} width={bw - 4} height={4} rx={2} fill="#FFFFFF" opacity={0.06} />
      {hasVial && <rect x={bx + 3} y={by + 3} width={fillW} height={bh - 6} rx={2} fill={cap} opacity={0.55} />}
      {/* graduation marks, one per mL */}
      {Array.from({ length: max + 1 }, (_, i) => (
        <line key={i} x1={bx + 3 + (i / max) * (bw - 6)} y1={by} x2={bx + 3 + (i / max) * (bw - 6)} y2={by + (i % 1 === 0 ? bh : bh * 0.5)}
          stroke="#3A4A54" strokeWidth={i % 2 === 0 ? 1 : 0.6} />
      ))}
      {/* plunger */}
      <rect x={bx + fillW - 2} y={by - 4} width={6} height={bh + 8} rx={1.5} fill="#C8D3D9" />
      <rect x={bx + fillW + 4} y={by + bh / 2 - 3} width={30} height={6} fill="#C8D3D9" />
      {/* bubble, trapped near the needle end until flicked out */}
      {hasVial && bubble && vol > 0.15 && <circle cx={bx + 9} cy={by + bh / 2} r={3.4} fill="#0B0F12" stroke="#5C6E78" strokeWidth={1} />}
      {vol >= max - 0.05 && <text x={bx + bw / 2} y={by + bh + 14} textAnchor="middle" fontSize={8} fill={C.amber}>full barrel</text>}
    </svg>
  );
}

export default function DrawUpMinigame({ open, kind, pat, assist, interrupted, onResolve }) {
  const [setup] = useState(() => {
    const four = pick(INJECTABLE(), 4);
    return { vials: four, order: four[Math.floor(Math.random() * four.length)], mL: (Math.floor(Math.random() * 9) + 2) / 2 };
  });
  const [vial, setVial] = useState(null);
  const [vol, setVol] = useState(0);
  const [bubble, setBubble] = useState(true);
  const [flash, setFlash] = useState(null);

  if (!open || kind !== "prep") return null;

  const tol = 0.25 * assistToleranceMult(assist);
  // A drawn syringe carries an air bubble that scales with how far past the
  // ordered volume you overshoot the pull; flicking it clears it.
  const draw = () => {
    if (!vial) { setFlash("novial"); return; }
    if (vial !== setup.order.id) { setFlash("wrongdrug"); return; }
    if (Math.abs(vol - setup.mL) > tol) { setFlash("wrongdose"); return; }
    if (bubble) { setFlash("bubble"); return; }
    setFlash("success");
  };
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      wrongdrug: `Wrong vial. The order was ${setup.order.name}. Caught it before it reached the patient, redraw.`,
      wrongdose: `Wrong volume. The order was ${setup.mL.toFixed(1)} mL, waste it and redraw.`,
      bubble: "Air left in the syringe. Discard it and draw again.",
      novial: "No vial selected.",
    }[flash] || "Missed the draw.");
  };
  const msg = {
    success: "Drawn, labeled, and in your hand.",
    wrongdrug: "That is not the ordered drug.",
    wrongdose: "That is not the ordered volume.",
    bubble: "There is still an air bubble in the barrel.",
    novial: "Pick a vial first.",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>Draw up medication</div>
        <div style={{ fontSize: 12, color: C.text, marginBottom: 12 }}>
          Order: <b>{setup.order.name}</b>, {setup.mL.toFixed(1)} mL
        </div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && (
          <>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>1. Pick the vial. Read the label.</div>
            <div style={{ display: "flex", justifyContent: "space-around", gap: 4, marginBottom: 12 }}>
              {setup.vials.map((v) => (
                <Vial key={v.id} name={v.name} cap={capColorFor(v.id)} selected={vial === v.id} active={vial === v.id} onClick={() => setVial(v.id)} />
              ))}
            </div>
            <Syringe vol={vol} max={6} cap={vial ? capColorFor(vial) : "#5C6E78"} bubble={bubble} hasVial={!!vial} />
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>2. Pull the plunger: {vol.toFixed(1)} mL</div>
            <input type="range" min={0} max={6} step={0.1} value={vol} onChange={(e) => setVol(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: C.faint, marginBottom: 12 }}>
              <input type="checkbox" checked={!bubble} onChange={(e) => setBubble(!e.target.checked)} />
              3. Tap the barrel and expel the air
            </label>
            <button onClick={draw} className="px-3 py-2 rounded w-full" style={{ background: "#122A18", border: `1px solid ${C.hr}`, color: C.hr }}>Confirm and cap</button>
          </>
        )}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>{msg[flash]}</div>
            <button onClick={flash === "novial" ? () => setFlash(null) : finish} className="px-3 py-2 rounded w-full"
              style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>{flash === "novial" ? "Back" : "Continue"}</button>
          </div>
        )}
        {!flash && (
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={() => onResolve(PROCEDURE_OUTCOME.CANCELLED)} style={{ fontSize: 11, color: C.faint, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
            {interrupted && <button onClick={() => onResolve(PROCEDURE_OUTCOME.ABORTED)} style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Abandon and attend to the patient</button>}
          </div>
        )}
      </div>
    </div>
  );
}
