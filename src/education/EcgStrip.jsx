// Renders a rhythm strip for an MCQ from the SAME waveform table the game's
// cardiac monitor uses (src/ecg.js), so a question about VT or a STEMI shows
// the exact trace a player sees on the monitor in a scenario, instead of
// pointing at a separate static image file.
//
// A question opts in with:
//   graphic: { kind: "ecg", rhythm: "VT", alt: "..." }
// where `rhythm` is any key of BEATS in ecg.js (sinus, sinusTach, sinusBrad,
// stemi, peakedT, wideQRS, afib, svt, VT, junctional, chb, torsades, VF,
// asystole, PEA, sinusPVC, firstDegreeBlock, ...).
//
// The strip is schematic. ecg.js draws one beat shape per rhythm and has no
// notion of absolute rate, so no time scale is drawn and the stem must supply
// any rate the question depends on. `alt` is used only as the accessible
// label, never shown as a visible caption, because for an interpretation
// question the description would give the answer away.

import { useMemo } from "react";
import { ecgPoints } from "../ecg.js";

const W = 380;
const H = 70;
const MINOR = 5;
const MAJOR = 25;

function gridLines(size, step) {
  const out = [];
  for (let p = 0; p <= size; p += step) out.push({ p });
  return out;
}

export default function EcgStrip({ rhythm, alt }) {
  // Random rhythms (VF, AF spacing, asystole noise) must not reshuffle on
  // every re-render, so the points are computed once per rhythm.
  const points = useMemo(
    () => ecgPoints(rhythm, W, H).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "),
    [rhythm]
  );

  const vMinor = gridLines(W, MINOR);
  const hMinor = gridLines(H, MINOR);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={alt || "Lead II ECG rhythm strip"}
        className="w-full rounded bg-slate-950"
        preserveAspectRatio="none"
        style={{ height: "clamp(110px, 22vw, 170px)" }}
      >
        <g stroke="#14532d" strokeWidth="0.3" opacity="0.55">
          {vMinor.map(({ p }) => (
            <line key={`v${p}`} x1={p} y1={0} x2={p} y2={H} strokeWidth={p % MAJOR === 0 ? 0.7 : 0.3} />
          ))}
          {hMinor.map(({ p }) => (
            <line key={`h${p}`} x1={0} y1={p} x2={W} y2={p} strokeWidth={p % MAJOR === 0 ? 0.7 : 0.3} />
          ))}
        </g>
        <polyline
          points={points}
          fill="none"
          stroke="#4ade80"
          strokeWidth="1.3"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="text-xs text-slate-500 mt-1 px-1">
        Lead II rhythm strip (schematic). Use the heart rate given in the question.
      </figcaption>
    </figure>
  );
}
