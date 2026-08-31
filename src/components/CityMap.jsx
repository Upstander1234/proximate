import { useState } from "react";
import { C, MONO } from "../theme.js";
import { styleFor } from "../data/buildingStyles.js";
import { routingPointToWorld } from "../mapGraph.js";

// Landmark types get an always-visible name label (real map-expansion
// content pass) — the "anchor" buildings a player would actually navigate
// by. Houses (and every other type) stay unlabeled by default to avoid
// covering the map in address text; hovering/clicking ANY building still
// shows its name regardless of type (see the `hoverId` state below).
const ALWAYS_LABELED_TYPES = new Set([
  "hospital", "cityHall", "school", "university", "airport", "skyscraper",
  "fireStation", "emsStation", "policeStation", "sheriffOffice",
]);

// CityMap.jsx — a real top-down SVG rendering of one of src/data/maps.js's
// three maps: streets, buildings, the station, the current incident, and
// any hospital destinations. Replaces the old decorative percentage-pin
// overlay. See CLAUDE.md's map-expansion plan for the full design.
//
// Coordinate convention: map data is world-space meters, +x=east,
// +y=NORTH. SVG/screen space grows downward, so this component is the ONE
// place that flips y (`svgY = bounds.height - worldY`) — every other
// consumer (mapGraph.js, a future 3D scene) reads raw world coordinates.
//
// Props:
//   map          — a src/data/maps.js map object (required)
//   onBuildingClick(building) — optional click handler
//   station      — RoutingPoint to highlight as the station (defaults to map.station)
//   incident     — RoutingPoint to highlight as the current incident
//   destination  — RoutingPoint to highlight as the chosen hospital
//   routePath    — optional [nodeId...] to draw as a highlighted route
//   debug        — dev-only overlay: node/edge ids, weights, seed
//   seed         — shown by the debug overlay if provided

const PAD = 24;

function toSvg(map, x, y) {
  return { sx: x + PAD, sy: (map.bounds.height - y) + PAD };
}

function nodePos(map, id) {
  const n = map.nodes.find((n) => n.id === id);
  return n ? toSvg(map, n.x, n.y) : null;
}

function iconPath(icon, cx, cy, r) {
  switch (icon) {
    case "cross":
      return (<g>
        <rect x={cx - r} y={cy - r * 0.35} width={r * 2} height={r * 0.7} />
        <rect x={cx - r * 0.35} y={cy - r} width={r * 0.7} height={r * 2} />
      </g>);
    case "circle":
      return <circle cx={cx} cy={cy} r={r} />;
    case "triangle":
      return <polygon points={`${cx},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}`} />;
    default:
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} />;
  }
}

export default function CityMap({ map, onBuildingClick, station, incident, destination, routePath, debug, seed }) {
  // Hooks must run unconditionally on every render (rules of hooks) — this
  // has to sit above the `!map` early return below, even though it's only
  // meaningful once `map` is present.
  const [hoverId, setHoverId] = useState(null);
  if (!map) return null;
  const stationPt = station || { type: "node", nodeId: map.station };
  const vw = map.bounds.width + PAD * 2, vh = map.bounds.height + PAD * 2;

  // Stroke widths and icon radii are authored as absolute SVG user units,
  // but the viewBox spans a wildly different extent per map (city ~430
  // units wide, rural ~5600) while rendering into the SAME container width
  // — so a fixed pixel-ish constant that reads fine on the tight city grid
  // becomes nearly invisible once scaled down to fit rural's much larger
  // viewBox. `k` rescales every visual constant below relative to CITY's
  // own extent (the map this component was originally tuned against), so
  // on-screen line/icon size stays roughly constant across all 3 maps
  // instead of shrinking with map size. Found and fixed during this
  // batch's own live-browser verification — the rural map's real geometry
  // (a genuine design goal, see CLAUDE.md) exposed it immediately.
  const CITY_REFERENCE_VW = 428;
  const k = Math.max(vw, vh) / CITY_REFERENCE_VW;

  const routeSvgPts = (routePath || []).map((id) => nodePos(map, id)).filter(Boolean);

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 8, overflow: "hidden",
      border: `1px solid ${C.line}`, background: "#0E1417" }}>
      <svg viewBox={`0 0 ${vw} ${vh}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* streets */}
        {map.edges.map((e) => {
          const a = nodePos(map, e.from), b = nodePos(map, e.to);
          if (!a || !b) return null;
          const arterial = e.type === "arterial" || e.type === "highway";
          return (
            <line key={e.id} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
              stroke={arterial ? C.dim : C.line} strokeWidth={(arterial ? 3 : 1.5) * k} strokeLinecap="round" />
          );
        })}

        {/* highlighted route */}
        {routeSvgPts.length > 1 && (
          <polyline points={routeSvgPts.map((p) => `${p.sx},${p.sy}`).join(" ")}
            fill="none" stroke={C.spo2} strokeWidth={4 * k} strokeLinecap="round" strokeDasharray={`${2 * k} ${6 * k}`} opacity={0.85} />
        )}

        {/* buildings */}
        {map.buildings.map((b) => {
          const n = map.nodes.find((n) => n.id === b.node);
          if (!n) return null;
          const off = b.offset || { dx: 0, dy: 0 };
          const { sx, sy } = toSvg(map, n.x + off.dx, n.y - off.dy);
          const st = styleFor(b.type);
          const r = (b.type === "hospital" ? 9 : b.type === "clinic" ? 7 : 5) * k;
          // Real, non-debug name labels (map-expansion content pass) —
          // always on for landmark types, otherwise shown on hover so the
          // player can still identify any building without permanently
          // cluttering the map with every house's street address.
          const showLabel = debug || ALWAYS_LABELED_TYPES.has(b.type) || hoverId === b.id;
          return (
            <g key={b.id} onClick={() => onBuildingClick && onBuildingClick(b)}
              onMouseEnter={() => setHoverId(b.id)} onMouseLeave={() => setHoverId((cur) => (cur === b.id ? null : cur))}
              style={{ cursor: onBuildingClick ? "pointer" : "default" }} fill={st.color}>
              {iconPath(st.icon, sx, sy, r)}
              {showLabel && <text x={sx + r + 2} y={sy + 3} fontSize={7 * k} fill={debug ? C.faint : C.text} fontFamily={MONO}>{b.name}</text>}
            </g>
          );
        })}

        {/* debug overlay: node/edge ids + weights */}
        {debug && map.nodes.map((n) => {
          const { sx, sy } = toSvg(map, n.x, n.y);
          return (<g key={n.id}>
            <circle cx={sx} cy={sy} r={2 * k} fill={C.faint} />
            <text x={sx + 3 * k} y={sy - 3 * k} fontSize={6 * k} fill={C.faint} fontFamily={MONO}>{n.id}</text>
          </g>);
        })}
        {debug && map.edges.map((e) => {
          const a = nodePos(map, e.from), b = nodePos(map, e.to);
          if (!a || !b) return null;
          const mx = (a.sx + b.sx) / 2, my = (a.sy + b.sy) / 2;
          return (<text key={`lbl-${e.id}`} x={mx} y={my} fontSize={5.5 * k} fill={C.faint} fontFamily={MONO} opacity={0.7}>
            {e.speedMph}mph{e.length ? ` ${Math.round(e.length)}m` : ""}
          </text>);
        })}

        {/* station / incident / destination markers */}
        {[
          { rp: stationPt, color: C.hr, label: "STATION" },
          { rp: incident, color: C.red, label: "INCIDENT" },
          { rp: destination, color: C.spo2, label: "DESTINATION" },
        ].map(({ rp, color, label }) => {
          if (!rp) return null;
          const w = routingPointToWorld(map, rp);
          if (!w) return null;
          const { sx, sy } = toSvg(map, w.x, w.y);
          return (<g key={label}>
            <circle cx={sx} cy={sy} r={7 * k} fill="none" stroke={color} strokeWidth={2.5 * k} />
            <circle cx={sx} cy={sy} r={2.5 * k} fill={color} />
            {debug && <text x={sx + 9 * k} y={sy + 3 * k} fontSize={7 * k} fill={color} fontFamily={MONO}>{label}</text>}
          </g>);
        })}
      </svg>

      {debug && (
        <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(10,14,12,.85)",
          border: `1px solid ${C.line}`, borderRadius: 6, padding: "4px 8px", fontFamily: MONO, fontSize: 9.5, color: C.dim }}>
          {map.name} · v{map.version}{seed != null ? ` · seed ${seed}` : ""}
        </div>
      )}
    </div>
  );
}
