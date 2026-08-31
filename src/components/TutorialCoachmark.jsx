import { useEffect, useState } from "react";
import { TUTORIAL_STEPS } from "../tutorialSteps.js";

// The interactive first-call tutorial's spotlight overlay. Highlights one
// real DOM element per step (found via a `data-tutorial-id` attribute
// already present on the scene UI's tabs/actions/busy-timer/crew/monitor/
// transport regions — no new elements were added for this, only the
// attribute) with a dimmed backdrop and a caption box explaining that part
// of the screen. If a step's target isn't currently on screen (e.g. the
// busy-timer step before the player has started any action yet), the
// backdrop still shows and the caption still explains the concept — it
// just has nothing to draw a highlight ring around, a deliberate, honest
// degradation rather than blocking the tutorial on scene state.

function useTargetRect(dataId, active) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    // Nothing to measure while inactive — the component itself never
    // renders anything using `rect` in that case (see the `!active` early
    // return below), so there's no need to reset it here, which avoids
    // calling setState synchronously in the effect body.
    if (!active) return;
    const measure = () => {
      const el = dataId ? document.querySelector(`[data-tutorial-id="${dataId}"]`) : null;
      setRect(el ? el.getBoundingClientRect() : null);
    };
    // Deferred a tick rather than measured synchronously here (same
    // react-hooks/set-state-in-effect fix shape as App.jsx's own tutorial
    // trigger effect) so the highlight appears almost immediately instead
    // of waiting for the first 250ms interval tick.
    const first = setTimeout(measure, 0);
    const iv = setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => { clearTimeout(first); clearInterval(iv); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [dataId, active]);
  return rect;
}

/** props: active (bool), step (0-based index into TUTORIAL_STEPS), onNext, onSkip */
export default function TutorialCoachmark({ active, step, onNext, onSkip }) {
  const cur = TUTORIAL_STEPS[step];
  const rect = useTargetRect(cur?.target, active);
  if (!active || !cur) return null;
  const pad = 8;
  const highlight = rect ? {
    position: "fixed", left: rect.left - pad, top: rect.top - pad,
    width: rect.width + pad * 2, height: rect.height + pad * 2,
    borderRadius: 10, boxShadow: "0 0 0 9999px rgba(0,0,0,.72)",
    border: "2px solid #E8B84B", pointerEvents: "none", zIndex: 9998,
    transition: "left .15s ease, top .15s ease, width .15s ease, height .15s ease",
  } : {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.72)", zIndex: 9998,
  };
  // Caption sits just under the highlight when there's room, otherwise
  // centered on screen (also the no-target fallback case).
  const captionTop = rect && rect.bottom + 140 < window.innerHeight ? rect.bottom + pad * 2 : null;
  const captionStyle = captionTop != null
    ? { position: "fixed", left: "50%", top: captionTop, transform: "translateX(-50%)" }
    : { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)" };
  return (<>
    <div style={highlight} />
    <div style={{ ...captionStyle, zIndex: 9999, width: "min(420px, 90vw)", background: "#15120C",
      border: "1px solid #E8B84B", borderRadius: 10, padding: "16px 18px", boxShadow: "0 8px 30px rgba(0,0,0,.5)" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: ".18em", color: "#E8B84B", marginBottom: 8 }}>
        TUTORIAL · {step + 1}/{TUTORIAL_STEPS.length}
      </div>
      <div style={{ fontSize: 14, color: "#EDE7DA", lineHeight: 1.55 }}>{cur.caption}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <button onClick={onSkip} style={{ background: "transparent", border: "1px solid #3A3226", color: "#8A8272",
          fontFamily: "monospace", fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>
          Skip tutorial
        </button>
        <button onClick={onNext} style={{ background: "#1A1510", border: "1px solid #E8B84B", color: "#E8B84B",
          fontFamily: "monospace", fontSize: 12, padding: "7px 14px", borderRadius: 6, cursor: "pointer" }}>
          {step + 1 < TUTORIAL_STEPS.length ? "Next →" : "Got it"}
        </button>
      </div>
    </div>
  </>);
}
