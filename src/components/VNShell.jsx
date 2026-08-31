// Visual-novel presentation layer for the Zero-To-Hero campaign (F31).
// Three small, composable pieces rather than one big component, so a phase
// can mix a scripted VNDialogue with an ordinary interactive form (the
// character-customization chips, the reflection prompts) inside the same
// VNBox without fighting the dialogue-advance mechanic.
//
// Deliberately NOT a local useState inside App.jsx's giant phase-branching
// component — these are their OWN real components (mounted via JSX, not
// called as plain functions), so hooks here are unconditional per React's
// own rules and don't need the "funnel everything through setG" workaround
// App.jsx's inline phase branches use for the same reason.
import { useState, useEffect } from "react";
import { C, MONO } from "../theme.js";
import { onImgError, posePath } from "../assets.js";

// Full-viewport background art. Renders position:fixed so it fills the
// screen regardless of Shell's own padding/max-width container — VN
// content (VNBox below) still renders in normal flow on top of it, so it
// gets Shell's usual margins without needing its own layout system.
export function VNBackdrop({ bg, dim = 0.32 }) {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <img src={bg} onError={onImgError} alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(6,8,10,${dim}) 0%, rgba(6,8,10,${dim * 0.6}) 35%, rgba(6,8,10,0.88) 78%, rgba(4,5,6,0.96) 100%)` }} />
    </div>
  );
}

// The bottom-anchored dialogue-box panel every VN scene's content sits
// inside — a full-width strip that runs edge to edge (the actual visual-
// novel convention: a text box spanning the bottom of the screen, not a
// floating centered card), with an inner max-width so long lines of text
// stay readable. `label` is the small mono header (a speaker name, or a
// scene slug like "NORTHWOOD PATROL STATION"); children is arbitrary
// content — a VNDialogue, a form, choice buttons, or several of these
// stacked.
export function VNBox({ label, children, wide, style }) {
  return (
    <div style={{ position: "relative", zIndex: 2, width: "100%",
      background: "rgba(10,9,8,0.93)", borderTop: `1px solid ${C.line}`,
      padding: "20px clamp(16px,4vw,56px) 22px", boxShadow: "0 -10px 36px rgba(0,0,0,0.55)", ...style }}>
      <div style={{ maxWidth: wide ? 780 : 620, margin: "0 auto" }}>
        {label && <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".2em", color: C.amber, marginBottom: 10 }}>{label}</div>}
        {children}
      </div>
    </div>
  );
}

// A character standing in the scene, above the dialogue box — the sprite
// half of the VN composition (backgrounds + a docked text box alone read
// as a slideshow, not a visual novel; a character actually present in
// frame is what sells it). `side` offsets a sprite left/right so two
// characters (e.g. a supervisor AND a partner) can share one scene without
// overlapping; "center" (default) for a one-person scene. Silently renders
// nothing if `src` is falsy, so a caller with no resolvable portrait for a
// speaker degrades to the plain dialogue box rather than a broken image.
// `pose` is what a character is DOING right now (a key into assets.js's
// POSES) — dialogue text should never carry a stage direction like
// "(kneeling)" or "hands you a clipboard" ahead of a quote; that action
// belongs here, on the character's own sprite, instead. Rendered as a
// badge layered onto the portrait rather than swapping it outright, since
// POSES are shared/generic images (assets.js), not per-character rigged art.
//
// `layers` (F8) is an alternative to `src` for the PLAYER's own portrait,
// which — unlike an NPC's single flat `portraitFor()` image — is composited
// from several stacked transparent-PNG layers (assets.js's
// playerPortraitLayers(): base body, outfit, hair, eyes). When given a
// non-empty array, it's rendered as that stack instead of a single `<img>`;
// `src` is ignored in that case. Every existing NPC call site is unaffected
// — none of them pass `layers`, so they all still take the plain `src` path
// exactly as before.
export function VNSprite({ src, layers, side = "center", faded = false, pose = null }) {
  const layerSrcs = Array.isArray(layers) ? layers.filter(Boolean) : [];
  if (!src && !layerSrcs.length) return null;
  const justify = side === "left" ? "flex-start" : side === "right" ? "flex-end" : "center";
  const filterStyle = { filter: faded ? "brightness(0.55) saturate(0.65)" : "drop-shadow(0 14px 30px rgba(0,0,0,0.55))",
    opacity: faded ? 0.7 : 1, transition: "filter .25s, opacity .25s" };
  return (
    <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: justify,
      padding: "0 clamp(8px,6vw,90px)", pointerEvents: "none" }}>
      <div style={{ position: "relative" }}>
        {layerSrcs.length
          // The wrapper has no explicit width, only children — a naive
          // "every layer position:absolute" stack collapses to zero width
          // (absolutely-positioned elements don't establish an ancestor's
          // box size), rendering nothing despite the <img> tags being
          // correctly present in the DOM. Fixed by letting the FIRST layer
          // render in normal flow (so its own height+objectFit+intrinsic
          // aspect ratio gives the wrapper a real size), then stacking the
          // rest on top via inset:0 at 100%/100% — safe since every layer
          // shares the same underlying canvas dimensions by design (assets.js's
          // playerPortraitLayers() comment).
          ? <div style={{ position: "relative", ...filterStyle }}>
              <img src={layerSrcs[0]} onError={onImgError} alt=""
                style={{ display: "block", height: "min(50vh,460px)", maxWidth: "44vw", objectFit: "contain" }} />
              {layerSrcs.slice(1).map((l) => (
                <img key={l} src={l} onError={onImgError} alt=""
                  style={{ position: "absolute", inset: 0, height: "100%", width: "100%", objectFit: "contain" }} />
              ))}
            </div>
          : <img src={src} onError={onImgError} alt="" style={{ height: "min(50vh,460px)", maxWidth: "44vw", objectFit: "contain", ...filterStyle }} />}
        {pose && <img src={posePath(pose)} onError={onImgError} alt={pose} title={pose}
          style={{ position: "absolute", bottom: 6, right: "8%", width: 58, height: 58,
            borderRadius: 10, border: `2px solid ${C.line}`, background: "#0A0A0A",
            objectFit: "cover", boxShadow: "0 4px 14px rgba(0,0,0,0.55)" }} />}
      </div>
    </div>
  );
}

// Small full-width strip above the dialogue box — a section title and/or a
// back button, rendered as its own thin bar rather than crammed inside
// VNBox's own label row. Its own child of VNScene's bottom-stacked flex
// column, so it renders directly above VNBox as a nameplate/back-nav strip
// — the same "narrow header bar sitting right on top of the textbox"
// composition real VN UIs use, rather than a page-top header disconnected
// from the box it belongs to.
export function VNHeader({ title, onBack, backLabel = "← Back" }) {
  return (
    <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex",
      justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      padding: "10px clamp(16px,4vw,56px)", fontFamily: MONO, fontSize: 11,
      letterSpacing: ".24em", color: C.amber }}>
      <span>{title}</span>
      {onBack && <button onClick={onBack} style={{ background: "rgba(20,26,31,0.85)",
        border: `1px solid ${C.line}`, color: C.dim, fontSize: 12, padding: "6px 12px",
        borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
        letterSpacing: "normal" }}>{backLabel}</button>}
    </div>
  );
}

// The full scene frame: backdrop + a flex column that pins its children
// (typically VNSprite then VNBox, in that order) to the true bottom edge
// of the viewport — full height, not a 70vh mid-page island, so the
// background actually reads as a place the scene is happening IN, with
// the dialogue box docked at the screen's bottom edge the way an actual
// visual novel's textbox is, not floating as a centered card.
export function VNScene({ bg, dim, topPad = 40, children }) {
  return (<>
    <VNBackdrop bg={bg} dim={dim} />
    <div style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 40px)", display: "flex",
      flexDirection: "column", justifyContent: "flex-end", paddingTop: topPad, paddingBottom: 0 }}>
      {children}
    </div>
  </>);
}

// One-click-one-line dialogue advancer — "one click is one line," per the
// operator's explicit ask. `lines` is [{speaker?, pose?, text}] — `pose` is
// what `speaker` is doing on THIS line (a VNSprite pose key), so an action
// can be attached to a line without writing it into `text` itself. Clicking
// anywhere in the box reveals the next line; clicking past the last one
// calls onDone(). Pass a stable `key` from the caller whenever the SAME call
// site might render different `lines` across renders (e.g. the tutorial
// interludes, which share one branch for two different scripts) so React
// remounts instead of preserving a stale line index.
// `onLineChange(line, index)`, if given, is called once on mount (line 0)
// and again every time the player actually clicks to advance — always from
// a synchronous event (the mount effect runs once; every later call is
// inside the click handler that changes `i`), never a useEffect deriving
// state from `line` on every render, so a parent driving a VNSprite's pose
// off this never gets an extra render-and-resync pass.
export function VNDialogue({ lines, onDone, doneLabel = "Continue", onLineChange }) {
  const [i, setI] = useState(0);
  const line = lines[i];
  const isLast = i >= lines.length - 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: see comment above
  useEffect(() => { onLineChange && onLineChange(lines[0], 0); }, []);
  const advance = () => {
    if (!isLast) { const next = i + 1; setI(next); onLineChange && onLineChange(lines[next], next); }
    else onDone && onDone();
  };
  return (
    <div onClick={advance} style={{ cursor: "pointer", userSelect: "none" }}>
      {line.speaker && <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".08em",
        color: C.amber, fontWeight: 700, marginBottom: 6 }}>{line.speaker.toUpperCase()}</div>}
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: "#EDE7DA", minHeight: "3.2em", whiteSpace: "pre-line" }}>{line.text}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.spo2 }}>{isLast ? `▶ ${doneLabel}` : "▶ click to continue"}</span>
      </div>
    </div>
  );
}
