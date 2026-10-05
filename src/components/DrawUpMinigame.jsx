import { useState } from "react";
import { C } from "../theme.js";
import { DRUGS } from "../data/drugs.js";
import { DRUG_UNITS, drawVolumeMl } from "../data/drugUnits.js";
import { resolveDoseMg } from "../physio/pk.js";
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
// The order is random but the numbers are real: the ordered amount is the
// patient's own dose (weight-resolved, so a child gets mg/kg), every vial shows
// its real concentration (data/drugUnits.js), and the volume to pull is
// amount / concentration. The DRAWN amount (volume x concentration), not the
// ordered amount, is what the patient receives; the order only scores the draw.
// Push-dose epinephrine has no vial of its own: it is mixed from the 0.1 mg/mL
// cardiac epinephrine (see the dilution steps below), so it never sits in the tray.
const INJECTABLE = () => Object.keys(DRUG_UNITS)
  .filter(id => id !== "pushEpi" && DRUGS[id] && /IV|IO|IM/.test(DRUGS[id].route) && DRUGS[id].pkModel !== "fluid")
  .map(id => ({ id, name: DRUGS[id].name, conc: DRUG_UNITS[id].conc, unit: DRUG_UNITS[id].unit }));

const SYRINGES = [1, 3, 5, 10, 20, 60];
const fmt = (n) => (n >= 100 ? n.toFixed(0) : n >= 1 ? n.toFixed(1) : n.toPrecision(2));

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
function Vial({ name, cap, conc, selected, active, onClick }) {
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
      <span style={{ fontSize: 9.5, color: selected ? C.text : C.faint, textAlign: "center", maxWidth: 66, lineHeight: 1.2 }}>{name}<br />{conc}</span>
    </button>
  );
}

// The syringe itself: barrel graduated to 6 mL, plunger position driven live
// by `vol`, and an air bubble at the tip that only clears once flicked. A
// tinted fill (the vial's own cap color) shows what's actually in it.
function Syringe({ vol, max, cap, bubble, hasVial, onFlick, flicks }) {
  const bx = 20, bw = 220, by = 40, bh = 26;
  const fillW = Math.max(0, Math.min(bw - 6, (vol / max) * (bw - 6)));
  const canFlick = hasVial && bubble && vol > 0.15;
  return (
    <svg viewBox="0 0 280 90" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
      {/* needle */}
      <line x1={bx - 14} y1={by + bh / 2} x2={bx} y2={by + bh / 2} stroke="#B9C4C9" strokeWidth={2} />
      {/* barrel, clear plastic with a light sheen rather than flat black */}
      <rect x={bx} y={by} width={bw} height={bh} rx={4} fill="#161F26" stroke={C.line} strokeWidth={1.5} opacity={0.9} />
      <rect x={bx + 2} y={by + 2} width={bw - 4} height={4} rx={2} fill="#FFFFFF" opacity={0.06} />
      {hasVial && <rect x={bx + 3} y={by + 3} width={fillW} height={bh - 6} rx={2} fill={cap} opacity={0.55} />}
      {/* graduation marks, one per mL */}
      {Array.from({ length: Math.min(max, 12) + 1 }, (_, k) => { const i = max <= 12 ? k : (k * max) / 12; return (
        <line key={k} x1={bx + 3 + (i / max) * (bw - 6)} y1={by} x2={bx + 3 + (i / max) * (bw - 6)} y2={by + bh}
          stroke="#3A4A54" strokeWidth={k % 2 === 0 ? 1 : 0.6} />); })}
      {/* plunger */}
      <rect x={bx + fillW - 2} y={by - 4} width={6} height={bh + 8} rx={1.5} fill="#C8D3D9" />
      <rect x={bx + fillW + 4} y={by + bh / 2 - 3} width={30} height={6} fill="#C8D3D9" />
      {/* bubble, trapped near the needle end — click/tap directly on it to
          flick it up the barrel, a real repeated tap gesture rather than a
          "mark as done" checkbox */}
      {canFlick && (
        <g onClick={onFlick} style={{ cursor: "pointer" }}>
          <circle cx={bx + 9} cy={by + bh / 2} r={3.4} fill="#0B0F12" stroke="#5C6E78" strokeWidth={1}
            transform={flicks ? `translate(0,${-flicks * 1.5})` : undefined} />
          <circle cx={bx + 9} cy={by + bh / 2} r={10} fill="transparent" />
        </g>
      )}
      {vol >= max - 0.05 && <text x={bx + bw / 2} y={by + bh + 14} textAnchor="middle" fontSize={8} fill={C.amber}>full barrel</text>}
    </svg>
  );
}

export default function DrawUpMinigame({ open, kind, pat, assist, interrupted, onResolve }) {
  const [setup] = useState(() => {
    const pool = INJECTABLE();
    let four = pick(pool, 4);
    let order = four[Math.floor(Math.random() * four.length)];
    // Sometimes the order is push-dose epinephrine, which must be mixed: the
    // tray then has to hold the 0.1 mg/mL epinephrine it is made from.
    if (Math.random() < 0.15 && DRUG_UNITS.pushEpi && DRUGS.pushEpi) {
      const src = pool.find(v => v.id === "epiIV");
      if (src && !four.some(v => v.id === "epiIV")) four = [...four.slice(0, 3), src];
      order = { id: "pushEpi", name: DRUGS.pushEpi.name, conc: DRUG_UNITS.pushEpi.conc, unit: DRUG_UNITS.pushEpi.unit };
    }
    // The ordered amount is this patient's own dose (a child gets mg/kg, capped at the adult dose).
    const amount = resolveDoseMg(DRUGS[order.id], pat?.ageProfile?.weight, order.id);
    const mL = order.id === "pushEpi" ? 10 : drawVolumeMl(order.id, amount);
    const syringe = SYRINGES.find(s => s >= mL * 1.25) || 60;
    return { vials: four, order, amount, mL, syringe };
  });
  const [vial, setVial] = useState(null);
  const [vol, setVol] = useState(0);
  const [bubble, setBubble] = useState(true);
  const [flicks, setFlicks] = useState(0);
  const [flash, setFlash] = useState(null);
  // Push-dose epinephrine mixing: total volume after adding saline to the drawn
  // epinephrine, and the volume of that mix pushed as one dose.
  const [mixTotal, setMixTotal] = useState(0);
  const [pushVol, setPushVol] = useState(0);
  // A real repeated-tap gesture directly on the bubble, not a checkbox —
  // three taps to work it up the barrel and out, same idea as this
  // project's other "hold/press to do the physical motion" minigames.
  const onFlick = () => {
    const n = flicks + 1;
    if (n >= 3) { setBubble(false); setFlicks(0); } else setFlicks(n);
  };

  if (!open || kind !== "prep") return null;

  // Tolerance on the DRAWN AMOUNT: 10% of the order (widened or narrowed by the assist setting).
  const tolAmt = 0.10 * setup.amount * assistToleranceMult(assist);
  const mixing = setup.order.id === "pushEpi";
  // When mixing, the drug in the syringe is diluted to (epi drawn) / (total volume),
  // and one dose is pushVol of that mix. No saline added (total at or below the drawn
  // volume) means the mix IS the vial, the classic 10x push-dose error.
  const mixConc = vial ? (vol * (DRUG_UNITS[vial]?.conc || 0)) / Math.max(vol, mixTotal, 1e-6) : 0;
  const drawnAmount = !vial ? 0 : mixing ? pushVol * mixConc : vol * (DRUG_UNITS[vial]?.conc || 0);
  const vialOk = mixing ? vial === "epiIV" : vial === setup.order.id;
  // A drawn syringe carries an air bubble that scales with how far past the
  // ordered volume you overshoot the pull; flicking it clears it.
  const draw = () => {
    if (!vial) { setFlash("novial"); return; }
    if (!vialOk) { setFlash("wrongdrug"); return; }
    if (Math.abs(drawnAmount - setup.amount) > tolAmt) { setFlash("wrongdose"); return; }
    if (bubble) { setFlash("bubble"); return; }
    setFlash("success");
  };
  // The syringe holds what was actually drawn: a wrong vial used anyway gives the
  // patient THAT drug under the ordered drug's label (`label`), and the give path
  // delivers the actual contents.
  const actualId = mixing && vial === "epiIV" ? "pushEpi" : vial;
  const useAnyway = () => onResolve(PROCEDURE_OUTCOME.SUCCESS, { drugId: actualId, label: setup.order.id, amount: mixing && vial !== "epiIV" ? vol * (DRUG_UNITS[vial]?.conc || 0) : drawnAmount, ordered: setup.amount });
  const finish = () => {
    if (flash === "success") { onResolve(PROCEDURE_OUTCOME.SUCCESS, { drugId: setup.order.id, amount: drawnAmount, ordered: setup.amount }); return; }
    onResolve(PROCEDURE_OUTCOME.FAILED, {
      wrongdrug: `Wrong vial. The order was ${setup.order.name}. Caught it before it reached the patient, redraw.`,
      wrongdose: `Wrong dose. The order was ${fmt(setup.amount)} ${setup.order.unit}, you drew ${fmt(drawnAmount)}. Waste it and redraw.`,
      bubble: "Air left in the syringe. Discard it and draw again.",
      novial: "No vial selected.",
    }[flash] || "Missed the draw.");
  };
  const msg = {
    success: "Drawn, labeled, and in your hand.",
    wrongdrug: "That is not the ordered drug. You can waste it and redraw, or use it anyway.",
    wrongdose: `That is not the ordered dose: ordered ${fmt(setup.amount)} ${setup.order.unit}, drawn ${fmt(drawnAmount)} (${(drawnAmount / setup.amount).toFixed(1)}x). You can waste it and redraw, or use it anyway.`,
    bubble: "There is still an air bubble in the barrel.",
    novial: "Pick a vial first.",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 4 }}>Draw up medication</div>
        <div style={{ fontSize: 12, color: C.text, marginBottom: 12 }}>
          Order: <b>{setup.order.name}</b>, {fmt(setup.amount)} {setup.order.unit}
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
                <Vial key={v.id} name={v.name} conc={`${v.conc} ${v.unit}/mL`} cap={capColorFor(v.id)} selected={vial === v.id} active={vial === v.id} onClick={() => setVial(v.id)} />
              ))}
            </div>
            <Syringe vol={vol} max={setup.syringe} cap={vial ? capColorFor(vial) : "#5C6E78"} bubble={bubble} hasVial={!!vial} onFlick={onFlick} flicks={flicks} />
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>2. Pull the plunger: {vol.toFixed(setup.syringe <= 3 ? 2 : 1)} mL{vial ? ` (${fmt(vol * DRUG_UNITS[vial].conc)} ${DRUG_UNITS[vial].unit})` : ""}</div>
            <input type="range" min={0} max={setup.syringe} step={setup.syringe / 200} value={vol} onChange={(e) => setVol(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
            {mixing && (<>
              <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>2b. Add saline to a total of {mixTotal.toFixed(1)} mL{vial ? ` (${fmt(mixConc * 1000)} mcg/mL)` : ""}</div>
              <input type="range" min={0} max={10} step={0.1} value={mixTotal} onChange={(e) => setMixTotal(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
              <div style={{ fontSize: 12, color: C.faint, marginBottom: 6 }}>2c. One dose: push {pushVol.toFixed(1)} mL of the mix{vial ? ` (${fmt(drawnAmount * 1000)} mcg)` : ""}</div>
              <input type="range" min={0} max={5} step={0.1} value={pushVol} onChange={(e) => setPushVol(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
            </>)}
            <div style={{ fontSize: 12, color: bubble ? C.faint : C.hr, marginBottom: 12 }}>
              3. {bubble ? "Tap the bubble in the barrel above to flick it out." : "Air expelled."}
            </div>
            <button onClick={draw} className="px-3 py-2 rounded w-full" style={{ background: "#122A18", border: `1px solid ${C.hr}`, color: C.hr }}>Confirm and cap</button>
          </>
        )}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash === "success" ? "#7CD68A" : C.red, marginBottom: 10 }}>{msg[flash]}</div>
            <button onClick={flash === "novial" ? () => setFlash(null) : finish} className="px-3 py-2 rounded w-full"
              style={{ background: C.panelHi || "#1B232B", border: `1px solid ${C.line}`, color: C.text }}>{flash === "novial" ? "Back" : "Continue"}</button>
            {(flash === "wrongdose" || flash === "wrongdrug") && (
              <button onClick={flash === "wrongdrug" ? useAnyway : () => onResolve(PROCEDURE_OUTCOME.SUCCESS, { drugId: setup.order.id, amount: drawnAmount, ordered: setup.amount })} className="px-3 py-2 rounded w-full" style={{ marginTop: 8, background: "#2A1418", border: `1px solid ${C.red}`, color: C.red }}>Use it anyway</button>
            )}
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
