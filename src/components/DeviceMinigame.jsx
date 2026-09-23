import { useState } from "react";
import { C } from "../theme.js";
import { assistToleranceMult } from "../procedureAssist.js";
import { PROCEDURE_OUTCOME } from "../procedureOutcome.js";
import MinigameVitalsStrip from "./MinigameVitalsStrip.jsx";

// Applying a monitoring device, one short procedure per device: pulse oximeter
// (pick a good finger, seat the sensor), ECG leads (each electrode on the right
// limb), defib pads (position and skin prep), capnography (connect, cannula,
// zero), BP cuff (right size, on the artery), arterial line (level and zero).
// SUCCESS re-enters start() with _skipMinigame, so the real "attach" logic in
// deviceActs() (the live monitor readings) is unchanged.
const btn = (bg, bd, col) => ({ background: bg, border: `1px solid ${bd}`, color: col, borderRadius: 6, padding: "8px 10px", fontSize: 12, cursor: "pointer", width: "100%" });
const GO = btn("#122A18", C.hr, C.hr);
const NEUTRAL = btn("#10151A", C.line, C.text);
const Gap = () => <div style={{ height: 8 }} />;
const Line = ({ children }) => <div style={{ fontSize: 12, color: C.faint, marginBottom: 8 }}>{children}</div>;

// A torso/hand silhouette that reflects whichever device is actually being
// applied and where the player has actually placed it — an electrode lands
// where the dropdown says, a pad sits where it was clicked, the pulse-ox
// clip sits on the chosen finger, so the picture is real feedback, not
// decoration.
const SPOT_XY = { RA: [58, 30], LA: [142, 30], RL: [72, 96], LL: [128, 96],
  rightUpper: [70, 24], leftApex: [128, 66], leftPrecordium: [110, 44], leftBack: [90, 50], sternum: [100, 40], abdomen: [130, 90] };
// A shared skin gradient/highlight, defined once per rendered <svg> (only one
// of these ever mounts at a time, so the id is never duplicated in the DOM) —
// the same gradient-over-flat-fill treatment every other minigame's own body
// art already uses, so a device application doesn't read a visual step down
// from the procedure mini-games around it.
function SkinDefs() {
  return (
    <defs>
      <linearGradient id="devSkinGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E3AE87" />
        <stop offset="55%" stopColor="#CD9068" />
        <stop offset="100%" stopColor="#B87A54" />
      </linearGradient>
    </defs>
  );
}
function Torso({ deviceId, site, finger, align, earringOff, strap, place, p1, p2, dry, peeled, prepped, size, artery, level, zeroed, connected, armed, onPlace, onRedo, onPadClick }) {
  if (deviceId === "pulseox") {
    if (site === "toe") {
      const fx = 40 + (finger ?? 1) * 20;
      return (
        <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
          <SkinDefs />
          <path d="M30,80 Q20,45 55,30 L150,30 Q180,45 170,80 Z" fill="url(#devSkinGrad)" opacity={0.5} />
          {TOES.map((tname, i) => (
            <rect key={tname} x={34 + i * 20} y={16} width={14} height={22} rx={5} fill={i === (finger ?? -1) ? "#E4C4B0" : "#C89578"} opacity={i === (finger ?? -1) ? 1 : 0.5} />
          ))}
          {finger != null && <rect x={fx - 6} y={12 + (align / 100) * 16} width={16} height={9} rx={2} fill="#16202A" stroke={C.hr} strokeWidth={1.4} />}
        </svg>
      );
    }
    if (site === "earlobe") {
      return (
        <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
          <SkinDefs />
          <ellipse cx={100} cy={40} rx={46} ry={38} fill="url(#devSkinGrad)" opacity={0.55} />
          <path d="M118,58 Q132,66 128,82 Q122,94 108,88 Q100,84 104,70 Z" fill="#C89578" opacity={earringOff ? 0.6 : 0.85} />
          {!earringOff && <circle cx={118} cy={80} r={4} fill="#D2A24C" />}
          <circle cx={118} cy={78} r={9} fill="none" stroke={C.hr} strokeWidth={2} opacity={earringOff ? 1 : 0.25} />
        </svg>
      );
    }
    if (site === "forehead") {
      return (
        <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
          <SkinDefs />
          <ellipse cx={100} cy={55} rx={58} ry={44} fill="url(#devSkinGrad)" opacity={0.55} />
          <rect x={60} y={30 - (strap ?? 20) * 0.15} width={80} height={16} rx={4} fill="#16202A" stroke={C.hr} strokeWidth={1.4} opacity={0.85} />
          <circle cx={100} cy={30 - (strap ?? 20) * 0.15 + 8} r={5} fill={C.hr} opacity={0.8} />
        </svg>
      );
    }
    const fx = 40 + (finger ?? 2) * 16;
    return (
      <svg viewBox="0 0 200 100" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <SkinDefs />
        <path d="M40,90 Q30,50 60,30 L140,30 Q170,50 160,90 Z" fill="url(#devSkinGrad)" opacity={0.55} />
        {FINGERS.map((f, i) => (
          <rect key={f} x={32 + i * 16} y={20} width={12} height={28} rx={5} fill={i === (finger ?? -1) ? "#E4C4B0" : "#C89578"} opacity={i === (finger ?? -1) ? 1 : 0.5} />
        ))}
        {finger != null && <rect x={fx - 6} y={16 + (align / 100) * 20} width={16} height={10} rx={2} fill="#16202A" stroke={C.hr} strokeWidth={1.4} />}
      </svg>
    );
  }
  if (deviceId === "leads") {
    return (
      <svg viewBox="0 0 200 130" onClick={armed ? onPlace : undefined}
        style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10, cursor: armed ? "crosshair" : "default" }}>
        <SkinDefs />
        <ellipse cx={100} cy={64} rx={54} ry={54} fill="url(#devSkinGrad)" opacity={prepped ? 0.9 : 0.6} />
        <circle cx={40} cy={40} r={10} fill="url(#devSkinGrad)" /><circle cx={160} cy={40} r={10} fill="url(#devSkinGrad)" />
        <rect x={30} y={90} width={16} height={30} rx={4} fill="url(#devSkinGrad)" /><rect x={154} y={90} width={16} height={30} rx={4} fill="url(#devSkinGrad)" />
        {ELECTRODES.map(([k]) => {
          const p = place[k]; if (!p) return null;
          return <circle key={k} cx={p.x} cy={p.y} r={6} fill={LEAD_COLOR[k]} stroke={armed === k ? C.amber : "#16202A"}
            strokeWidth={armed === k ? 2 : 1} onClick={(e) => { e.stopPropagation(); onRedo && onRedo(k); }} style={{ cursor: "pointer" }} />;
        })}
      </svg>
    );
  }
  if (deviceId === "pads") {
    return (
      <svg viewBox="0 0 200 130" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <SkinDefs />
        <ellipse cx={100} cy={64} rx={54} ry={54} fill="url(#devSkinGrad)" opacity={dry ? 0.9 : 0.6} />
        {[p1, p2].filter(Boolean).map((p, i) => {
          const [x, y] = SPOT_XY[p] || [100, 64];
          return <rect key={i} x={x - 14} y={y - 10} width={28} height={20} rx={3} fill={C.amber} opacity={peeled ? 0.75 : 0.35} stroke={C.line} strokeWidth={1} style={{ pointerEvents: "none" }} />;
        })}
        {/* real click-on-torso pad placement (step 2 only), reusing the
            same landmark set PAD_SPOTS already named for the dropdowns */}
        {onPadClick && PAD_SPOTS.filter(([v]) => v).map(([key, label]) => {
          const [x, y] = SPOT_XY[key];
          const on = p1 === key || p2 === key;
          return (
            <g key={key} onClick={() => onPadClick(key)} style={{ cursor: "pointer" }}>
              <rect x={x - 16} y={y - 11} width={32} height={22} rx={4} fill={C.amber} opacity={on ? 0.25 : 0.08} stroke={C.amber} strokeWidth={1} strokeDasharray={on ? undefined : "2,2"} />
              <text x={x} y={y + 2} textAnchor="middle" fontSize={4.4} fill={C.amber} opacity={0.85} style={{ pointerEvents: "none" }}>{label.split(",")[0]}</text>
            </g>
          );
        })}
      </svg>
    );
  }
  if (deviceId === "bpcuff") {
    const w = size === "child" ? 22 : size === "large" ? 38 : 30;
    return (
      <svg viewBox="0 0 200 90" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <SkinDefs />
        <rect x={20} y={30} width={160} height={30} rx={14} fill="url(#devSkinGrad)" opacity={0.8} />
        {size && <rect x={70} y={30 - w / 2 + 15} width={60} height={w} rx={6} fill="#4D7CFF" opacity={0.6} stroke={C.line} strokeWidth={1} />}
        <circle cx={20 + (artery / 100) * 160} cy={45} r={4} fill="#8A1F2A" opacity={0.7} />
      </svg>
    );
  }
  if (deviceId === "capno") {
    return (
      <svg viewBox="0 0 200 90" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <SkinDefs />
        <ellipse cx={100} cy={50} rx={52} ry={38} fill="url(#devSkinGrad)" opacity={0.85} />
        <path d="M65,42 Q100,30 135,42" fill="none" stroke={connected ? C.hr : "#5C6E78"} strokeWidth={2} />
        <circle cx={165} cy={44} r={7} fill="#16202A" stroke={C.line} strokeWidth={1} />
      </svg>
    );
  }
  if (deviceId === "artline") {
    return (
      <svg viewBox="0 0 200 90" style={{ width: "100%", background: "#0B0F12", borderRadius: 6, marginBottom: 10 }}>
        <SkinDefs />
        <rect x={10} y={38} width={180} height={16} rx={8} fill="url(#devSkinGrad)" opacity={0.75} />
        <circle cx={30} cy={46} r={4} fill="#8A1F2A" />
        <line x1={34} y1={46} x2={170} y2={46} stroke={zeroed ? C.hr : "#8A9AA2"} strokeWidth={2} />
        <rect x={160} y={90 - (level / 100) * 70} width={16} height={6} fill={C.amber} />
        <line x1={160} y1={46} x2={168} y2={93 - (level / 100) * 70} stroke="#5C6E78" strokeWidth={1} strokeDasharray="2,2" />
      </svg>
    );
  }
  return null;
}

const FINGERS = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const TOES = ["Big toe", "2nd toe", "3rd toe"];
const PULSEOX_SITES = [["finger", "Finger"], ["toe", "Toe"], ["earlobe", "Earlobe"], ["forehead", "Forehead"]];
const ELECTRODES = [["RA", "Right arm (white)"], ["LA", "Left arm (black)"], ["RL", "Right leg (green)"], ["LL", "Left leg (red)"]];
const LEAD_COLOR = { RA: "#E9EDE6", LA: "#3A3F45", RL: "#3FA65A", LL: "#C23B3B" };
const ELECTRODE_XY = { RA: SPOT_XY.RA, LA: SPOT_XY.LA, RL: SPOT_XY.RL, LL: SPOT_XY.LL };
// The real, click-precision tolerance a limb electrode can be off its
// textbook landmark by before contact quality genuinely suffers — a generous
// margin (roughly a third of the torso's own radius in this SVG's units),
// since real skin isn't a single point either.
const LEAD_TOL = 32;
const PAD_SPOTS = [["", "Choose a spot..."], ["rightUpper", "Right upper chest, below the collarbone"], ["leftApex", "Left lower chest, mid-axillary line"],
  ["leftPrecordium", "Left chest, over the heart"], ["leftBack", "Left mid-back, behind the heart"], ["sternum", "Center of the sternum"], ["abdomen", "Right abdomen"]];

export default function DeviceMinigame({ open, kind, deviceId, deviceName, pat, assist, interrupted, onResolve }) {
  const [step, setStep] = useState(0);
  const [flash, setFlash] = useState(null);
  // pulse ox — the site itself is a real choice, and each site's own physical
  // constraints (a nail vs. a lobe vs. a strap) make the follow-on steps
  // genuinely different, not the same finger-picker relabeled.
  const [site, setSite] = useState(null);
  const [polish] = useState(() => 1 + Math.floor(Math.random() * 4));
  const [finger, setFinger] = useState(null);
  const [align, setAlign] = useState(20);
  const [earring] = useState(() => Math.random() < 0.4);
  const [earringOff, setEarringOff] = useState(false);
  const [strap, setStrap] = useState(20);
  // leads — place holds {x,y} click coordinates once set, not a dropdown pick,
  // so precision (how close to the real landmark) is a real, measured quantity.
  const [prepped, setPrepped] = useState(false);
  const [place, setPlace] = useState({ RA: null, LA: null, RL: null, LL: null });
  const [armed, setArmed] = useState("RA");
  const [leadsQuality, setLeadsQuality] = useState(1);
  // pads
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [dry, setDry] = useState(false);
  const [peeled, setPeeled] = useState(false);
  // capno / art line
  const [kinked] = useState(() => Math.random() < 0.3);
  const [fixedKink, setFixedKink] = useState(false);
  const [connected, setConnected] = useState(false);
  const [zeroed, setZeroed] = useState(false);
  const [level, setLevel] = useState(20);
  // bp cuff
  const [size, setSize] = useState("");
  const [artery, setArtery] = useState(15);

  if (!open || kind !== "device") return null;
  const tol = assistToleranceMult(assist);
  const wt = pat?.ageProfile?.weight ?? 75;
  const rightCuff = wt < 40 ? "child" : wt > 100 ? "large" : "adult";
  const fail = (why) => setFlash({ ok: false, why });
  const win = (why) => setFlash({ ok: true, why });

  // Real click coordinates, not a snapped grid — converts a pointer event
  // into the SVG's own 200x130 viewBox space regardless of how big it's
  // rendered on screen.
  const clickBody = (e) => {
    if (!armed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 130;
    setPlace((pl) => {
      const next = { ...pl, [armed]: { x, y } };
      const remaining = ELECTRODES.map(([k]) => k).find((k) => !next[k]);
      setArmed(remaining || null);
      return next;
    });
  };
  const redoLead = (k) => { setPlace((pl) => ({ ...pl, [k]: null })); setArmed(k); };
  // Clicking a placed pad's own zone again removes it; clicking a new zone
  // fills p1 first, then p2 — the same two-pad slots the old dropdowns set.
  const onPadClick = (key) => {
    if (p1 === key) { setP1(""); return; }
    if (p2 === key) { setP2(""); return; }
    if (!p1) { setP1(key); return; }
    if (!p2) { setP2(key); return; }
    setP1(key); setP2("");
  };

  const body = () => {
    switch (deviceId) {
      case "pulseox": {
        if (step === 0) return (<><Line>1. Pick a site. A finger is fastest, but not every patient has one free to use.</Line>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: 8 }}>
            {PULSEOX_SITES.map(([k, l]) => (
              <button key={k} onClick={() => { setSite(k); setStep(1); }} style={{ padding: "9px 8px", fontSize: 12, borderRadius: 6, cursor: "pointer",
                background: "#10151A", border: `1px solid ${C.line}`, color: C.text }}>{l}</button>))}
          </div></>);
        if (site === "finger") {
          if (step === 1) return (<><Line>2. Pick a finger. Avoid nail polish and a thumb (poor signal). One nail is painted.</Line>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 8 }}>
              {FINGERS.map((f, i) => (
                <button key={f} onClick={() => setFinger(i)} style={{ padding: "8px 2px", fontSize: 11, borderRadius: 6, cursor: "pointer",
                  background: finger === i ? "#1B2A20" : "#10151A", border: `1px solid ${finger === i ? C.hr : C.line}`, color: C.text }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, margin: "0 auto 4px", background: i === polish ? "#D2557E" : "#E4C4B0" }} />{f}</button>))}
            </div>
            <button style={GO} disabled={finger == null} onClick={() => (finger === polish ? fail("Nail polish blocks the light and the signal is unreliable. Use a clean nail.")
              : finger === 0 ? fail("The thumb gives a poor waveform. Use the index, middle or ring finger.") : setStep(2))}>Clip on this finger</button></>);
          return (<><Line>3. Seat the sensor over the nail bed: {align}%. (aim for about 60)</Line>
            <input type="range" min={0} max={100} value={align} onChange={(e) => setAlign(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
            <button style={GO} onClick={() => (Math.abs(align - 60) > 18 * tol ? fail("The emitter and detector aren't lined up. No usable signal, reseat it.") : win("Good pleth waveform."))}>Check the signal</button></>);
        }
        if (site === "toe") {
          if (step === 1) return (<><Line>2. Both hands are occupied with a line and a splint. Clip the probe on a toe instead.</Line>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
              {TOES.map((f, i) => (
                <button key={f} onClick={() => setFinger(i)} style={{ padding: "8px 2px", fontSize: 11, borderRadius: 6, cursor: "pointer",
                  background: finger === i ? "#1B2A20" : "#10151A", border: `1px solid ${finger === i ? C.hr : C.line}`, color: C.text }}>{f}</button>))}
            </div>
            <button style={GO} disabled={finger == null} onClick={() => setStep(2)}>Clip on this toe</button></>);
          // Toe beds are a thicker, cooler perfusion bed than a fingertip, so
          // the usable alignment band is genuinely narrower than the finger's
          // own — the same sensor, a less forgiving site.
          return (<><Line>3. Seat the sensor over the nail bed: {align}%. (aim for about 60)</Line>
            <input type="range" min={0} max={100} value={align} onChange={(e) => setAlign(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
            <button style={GO} onClick={() => (Math.abs(align - 60) > 12 * tol ? fail("Toe perfusion runs cooler than a fingertip and the margin is tighter. No usable signal, reseat it.") : win("Good pleth waveform, a little weaker than a finger site but usable."))}>Check the signal</button></>);
        }
        if (site === "earlobe") {
          return (<><Line>2. Clip the sensor onto the earlobe.{earring ? " There's an earring in the way." : ""}</Line>
            {earring && <button style={earringOff ? NEUTRAL : GO} onClick={() => setEarringOff(true)}>{earringOff ? "Earring removed" : "Remove the earring first"}</button>}
            {earring && <Gap />}
            <button style={GO} onClick={() => (earring && !earringOff ? fail("The earring blocks the clip from seating flush. No usable signal.") : win("Good pleth waveform. An ear clip reacts to central perfusion changes faster than a finger does."))}>Clip it on</button></>);
        }
        if (site === "forehead") {
          // A reflectance sensor, not a transmittance clip — it reads well
          // even in a shut-down peripheral shock patient, but only if the
          // strap is snug; too loose and ambient light and motion wreck it.
          return (<><Line>2. Strap the reflectance sensor across the forehead: {strap}%. (aim for about 55, snug but not tight)</Line>
            <input type="range" min={0} max={100} value={strap} onChange={(e) => setStrap(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
            <button style={GO} onClick={() => (Math.abs(strap - 55) > 16 * tol ? fail(strap < 55 - 16 * tol ? "Too loose — ambient light and motion are corrupting the signal." : "Too tight — you're compressing the tissue bed you're trying to read.") : win("Good waveform. Useful here even with poor peripheral perfusion, since it reads centrally."))}>Check the signal</button></>);
        }
        return null;
      }
      case "leads": {
        if (step === 0) return (<><Line>1. Prep the skin: dry it, clip or shave hair, and rub lightly so the electrodes stick.</Line>
          <button style={prepped ? NEUTRAL : GO} onClick={() => setPrepped(true)}>{prepped ? "Skin prepped" : "Prep the skin"}</button><Gap />
          <button style={GO} onClick={() => setStep(1)}>Continue</button></>);
        return (<><Line>2. Pick a lead below, then click on the body where it goes: white right shoulder/arm, black left shoulder/arm, green right lower torso/leg, red left lower torso/leg. Click a placed dot to redo it.</Line>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: 8 }}>
            {ELECTRODES.map(([k, l]) => (
              <button key={k} onClick={() => setArmed(k)} style={{ padding: "7px 8px", fontSize: 11, borderRadius: 6, cursor: "pointer", textAlign: "left",
                background: armed === k ? "#1B2A20" : "#10151A", border: `1px solid ${armed === k ? C.hr : C.line}`, color: C.text }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: LEAD_COLOR[k], marginRight: 6, verticalAlign: "middle", border: "1px solid #16202A" }} />
                {l}{place[k] ? " ✓" : ""}
              </button>))}
          </div>
          <button style={GO} onClick={() => {
            if (ELECTRODES.some(([k]) => !place[k])) return fail("An electrode is still unplaced.");
            if (!prepped) return fail("The skin wasn't prepped. The electrodes won't hold and the trace will be noisy.");
            const nearestKey = (p) => ELECTRODES.map(([k2]) => k2).reduce((best, k2) => {
              const d = Math.hypot(p.x - ELECTRODE_XY[k2][0], p.y - ELECTRODE_XY[k2][1]);
              return d < best.d ? { k: k2, d } : best;
            }, { k: null, d: Infinity }).k;
            const bad = ELECTRODES.filter(([k]) => nearestKey(place[k]) !== k).map(([k]) => k);
            if (bad.length) return fail(`Leads misplaced (${bad.join(", ")}). Reversed limb leads invert the tracing and can mimic a rhythm change. Redo it.`);
            // Real, measured click precision — not just "right zone" — decides
            // how clean the trace actually is: dead on the landmark reads full
            // quality, near the edge of the tolerance still passes but noisier.
            const quality = ELECTRODES.reduce((sum, [k]) => {
              const [tx, ty] = ELECTRODE_XY[k]; const p = place[k];
              return sum + Math.max(0, 1 - Math.hypot(p.x - tx, p.y - ty) / LEAD_TOL);
            }, 0) / ELECTRODES.length;
            setLeadsQuality(quality);
            return win(quality >= 0.75 ? "All four leads placed correctly, right over the landmarks. Clean trace."
              : quality >= 0.4 ? "All four leads placed correctly, but a bit off the exact landmark. Expect some baseline artifact until they're redone."
                : "All four leads are on the right limbs but poorly seated. Expect persistent artifact on the monitor until they're reapplied.");
          }}>Connect and check the trace</button></>);
      }
      case "pads": {
        if (step === 0) return (<><Line>1. Prep: dry the chest, remove any medication patch and shave heavy hair, then peel the backing.</Line>
          <button style={dry ? NEUTRAL : GO} onClick={() => setDry(true)}>{dry ? "Chest dry and clear" : "Dry and clear the chest"}</button><Gap />
          <button style={peeled ? NEUTRAL : GO} onClick={() => setPeeled(true)}>{peeled ? "Backing peeled" : "Peel the backing"}</button><Gap />
          <button style={GO} onClick={() => setStep(1)}>Continue</button></>);
        return (<><Line>2. Click directly on the torso above to place the two pads: right upper chest with left lateral, or front with back.</Line>
          <button style={GO} onClick={() => {
            const set = [p1, p2].sort().join("+");
            if (!p1 || !p2) return fail("Both pads need a position.");
            if (!dry) return fail("The chest was wet. Pads won't stick and you risk arcing.");
            if (!peeled) return fail("You never peeled the backing. There is no contact.");
            const ok = set === ["rightUpper", "leftApex"].sort().join("+") || set === ["leftPrecordium", "leftBack"].sort().join("+");
            return ok ? win("Pads seated with good contact.") : fail("Those positions don't put the heart between the pads. Reposition them.");
          }}>Press them down</button></>);
      }
      case "capno": {
        if (step === 0) return (<><Line>1. Connect the sampling line to the monitor's capnography port.</Line>
          <button style={GO} onClick={() => { setConnected(true); setStep(1); }}>Connect the line</button></>);
        if (step === 1) return (<><Line>2. Check the tubing. {kinked ? "It has a kink in it." : "It runs straight."}</Line>
          <button style={kinked && !fixedKink ? GO : NEUTRAL} onClick={() => setFixedKink(true)}>{kinked ? (fixedKink ? "Straightened" : "Straighten the kink") : "Line is fine"}</button><Gap />
          <button style={GO} onClick={() => (kinked && !fixedKink ? fail("The kinked line blocks sampling. You get a flat trace.") : setStep(2))}>Continue</button></>);
        return (<><Line>3. Place the cannula with the prongs curving into the nostrils, then let the sensor warm up and zero.</Line>
          <button style={GO} onClick={() => (!connected ? fail("The line isn't connected.") : win("Waveform is coming up."))}>Place the cannula and zero</button></>);
      }
      case "bpcuff": {
        if (step === 0) return (<><Line>1. Pick a cuff size from the arm. Bladder should cover about 80% of the arm's circumference.</Line>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
            {["child", "adult", "large"].map((s) => (
              <button key={s} onClick={() => setSize(s)} style={{ padding: "8px", fontSize: 12, borderRadius: 6, cursor: "pointer",
                background: size === s ? "#1B2A20" : "#10151A", border: `1px solid ${size === s ? C.hr : C.line}`, color: C.text }}>{s}</button>))}</div>
          <button style={GO} disabled={!size} onClick={() => (size !== rightCuff ? fail(`Wrong cuff. This patient needs a ${rightCuff} cuff. A cuff that is too ${size === "child" || (size === "adult" && rightCuff === "large") ? "small reads falsely high" : "large reads falsely low"}.`) : setStep(1))}>Wrap this cuff</button></>);
        return (<><Line>2. Line the artery mark up over the brachial artery: {artery}%. (aim for about 50)</Line>
          <input type="range" min={0} max={100} value={artery} onChange={(e) => setArtery(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
          <button style={GO} onClick={() => (Math.abs(artery - 50) > 20 * tol ? fail("The artery mark is off the artery. You'll get a poor or no reading.") : win("Cuff is snug and on the artery."))}>Secure it</button></>);
      }
      case "artline": {
        if (step === 0) return (<><Line>1. Prime the transducer line and flush out all the air.</Line>
          <button style={GO} onClick={() => setStep(1)}>Prime and flush</button></>);
        if (step === 1) return (<><Line>2. Level the transducer at the phlebostatic axis (4th intercostal space, midaxillary): {level}%. (aim for about 50)</Line>
          <input type="range" min={0} max={100} value={level} onChange={(e) => setLevel(Number(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
          <button style={GO} onClick={() => setStep(2)}>Set level</button></>);
        return (<><Line>3. Zero to atmosphere, then open the stopcock to the patient.</Line>
          <button style={zeroed ? NEUTRAL : GO} onClick={() => setZeroed(true)}>{zeroed ? "Zeroed" : "Zero the transducer"}</button><Gap />
          <button style={GO} onClick={() => (!zeroed ? fail("You opened to the patient without zeroing. Every reading is offset.")
            : Math.abs(level - 50) > 15 * tol ? fail("The transducer is off level, so pressures read falsely high or low. Re-level it.") : win("Clean arterial waveform with a sharp upstroke."))}>Open to the patient</button></>);
      }
      default: return (<><Line>Apply the device.</Line><button style={GO} onClick={() => win("Applied.")}>Apply</button></>);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000C", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.panel || "#141A1F", border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, width: "min(480px,92vw)" }}>
        <div style={{ fontSize: 14, color: C.amber, marginBottom: 10 }}>{deviceName}</div>
        <MinigameVitalsStrip pat={pat} />
        {interrupted && !flash && (
          <div style={{ fontSize: 12, color: C.red, background: "#2A1418", border: `1px solid ${C.red}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            The patient's condition just changed. Check the alert once you're done, or abandon now.
          </div>
        )}
        {!flash && (
          <Torso deviceId={deviceId} site={site} finger={finger} align={align} earringOff={earringOff} strap={strap} place={place} p1={p1} p2={p2}
            dry={dry} peeled={peeled} prepped={prepped} size={size} artery={artery} level={level} zeroed={zeroed} connected={connected}
            armed={armed} onPlace={clickBody} onRedo={redoLead}
            onPadClick={(deviceId === "pads" && step === 1) ? onPadClick : undefined} />
        )}
        {!flash && body()}
        {flash && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: flash.ok ? "#7CD68A" : C.red, marginBottom: 10 }}>{flash.why}</div>
            <button style={NEUTRAL} onClick={() => (flash.ok
              ? onResolve(PROCEDURE_OUTCOME.SUCCESS, deviceId === "leads" ? { quality: leadsQuality } : undefined)
              : onResolve(PROCEDURE_OUTCOME.FAILED, flash.why))}>Continue</button>
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
