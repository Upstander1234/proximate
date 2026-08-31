// mapGraph.js — pathfinding and location-picking over the real street graphs
// in src/data/maps.js. Sibling to scope.js/fleet.js: small, dependency-free,
// no React/UI concerns.
//
// RoutingPoint is the one shared shape every location in this codebase
// speaks — g.locations (App.jsx), shortestPath's own endpoints, CityMap's
// markers:
//   { type:"node", nodeId }
//   { type:"edge", edgeId, t }        // t in [0,1], 0=edge.from, 1=edge.to
//
// Coordinate convention (see CLAUDE.md's map-expansion plan): world space is
// meters, +x = east, +y = NORTH (up on a north-up map). CityMap.jsx is the
// only place that flips y for SVG/screen space — nothing in this file needs
// to know about that flip.

export const MPH_TO_MPS = 0.44704;
export const mphToMps = (mph) => mph * MPH_TO_MPS;

const nodeById = (map, id) => map.nodes.find((n) => n.id === id);
const edgeById = (map, id) => map.edges.find((e) => e.id === id);

export function euclideanDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Authored `edge.length` wins (supports future curved/non-straight roads);
// falls back to the straight-line distance between its two nodes.
export function edgeLength(map, edge) {
  if (edge.length != null) return edge.length;
  const a = nodeById(map, edge.from), b = nodeById(map, edge.to);
  return a && b ? euclideanDist(a, b) : 0;
}

// A modest, stated approximation — unpaved (gravel) surfaces lose more
// traction/speed in wet or snowy conditions than paved ones do. Not fitted
// to a specific dataset, said honestly (see CLAUDE.md's "identify numbers,
// do not tune them" discipline). Paved edges (the implicit default — no
// `edge.surface` field needed for them) get no multiplier here: this is
// specifically about UNPAVED surface degradation, not a general
// weather-slows-everyone effect — that's App.jsx's own WEATHER_MULT/
// TOD_MULT, which already applies to every OTHER responding unit's
// dramatized ETA. Same `g.weather` vocabulary as WEATHER_MULT
// (clear/rain/fog/snow/heat) — reused, not reinvented.
const GRAVEL_WEATHER_MULT = { clear: 1, rain: 1.35, snow: 1.7, fog: 1.05, heat: 1 };

// Real drive time for one directed edge, in seconds. `weather` is optional
// and defaults to "clear" — every existing call site that doesn't pass it
// is byte-for-byte unchanged, since GRAVEL_WEATHER_MULT.clear is 1 and
// paved edges are never multiplied regardless.
function edgeSeconds(map, edge, weather = "clear") {
  const mps = mphToMps(edge.speedMph || 25);
  if (mps <= 0) return Infinity;
  const base = edgeLength(map, edge) / mps;
  if (edge.surface === "gravel") return base * (GRAVEL_WEATHER_MULT[weather] ?? 1);
  return base;
}

// World-space {x,y} for any RoutingPoint — a node's own coords, or a lerp
// along its edge's two endpoints at `t`.
export function routingPointToWorld(map, rp) {
  if (!rp) return null;
  if (rp.type === "node") {
    const n = nodeById(map, rp.nodeId);
    return n ? { x: n.x, y: n.y } : null;
  }
  if (rp.type === "edge") {
    const e = edgeById(map, rp.edgeId);
    if (!e) return null;
    const a = nodeById(map, e.from), b = nodeById(map, e.to);
    if (!a || !b) return null;
    const t = Math.max(0, Math.min(1, rp.t ?? 0.5));
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  return null;
}

// For callers that only make sense at an intersection (e.g. picking the
// station) — the nearer of a node RoutingPoint's own node, or an edge
// RoutingPoint's nearer endpoint.
export function routingPointToNearestNode(map, rp) {
  if (!rp) return null;
  if (rp.type === "node") return rp.nodeId;
  if (rp.type === "edge") {
    const e = edgeById(map, rp.edgeId);
    if (!e) return null;
    return (rp.t ?? 0.5) <= 0.5 ? e.from : e.to;
  }
  return null;
}

// Plain array-based Dijkstra over the DIRECTED edge list — these maps are
// small (<=~50 directed edges), so no priority-queue library is needed.
// Returns { seconds, path:[nodeId...] } from a given start node to every
// reachable node, or a lookup for one specific target.
function dijkstraFrom(map, startNodeId, weather = "clear") {
  const dist = new Map(), prev = new Map(), visited = new Set();
  map.nodes.forEach((n) => dist.set(n.id, Infinity));
  dist.set(startNodeId, 0);
  while (true) {
    let u = null, best = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) { best = d; u = id; }
    }
    if (u == null) break;
    visited.add(u);
    for (const e of map.edges) {
      if (e.from !== u) continue;
      const alt = dist.get(u) + edgeSeconds(map, e, weather);
      if (alt < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, alt);
        prev.set(e.to, { node: u, edge: e.id });
      }
    }
  }
  return { dist, prev };
}

function reconstructPath(prev, targetNodeId) {
  const path = [targetNodeId];
  let cur = targetNodeId;
  while (prev.has(cur)) { cur = prev.get(cur).node; path.unshift(cur); }
  return path;
}

// shortestPath(map, fromPoint, toPoint, weather) — both RoutingPoints. A
// node endpoint is the ordinary Dijkstra case. An edge endpoint is handled
// without pre-snapping to the nearest intersection: the search considers
// both directions off the edge's own two endpoints, each seeded with the
// real partial-edge time from the `t` point to that endpoint, and the
// cheaper of the two resulting paths wins. Returns { seconds, path }, or
// { seconds:Infinity, path:[] } if unreachable. `weather` is optional and
// defaults to "clear" — every existing call site that doesn't pass it is
// unaffected (see edgeSeconds's own comment).
export function shortestPath(map, fromPoint, toPoint, weather = "clear") {
  const fromCandidates = expandEndpoint(map, fromPoint, weather);
  const toNodeId = toPoint.type === "node" ? toPoint.nodeId : null;
  const toEdge = toPoint.type === "edge" ? edgeById(map, toPoint.edgeId) : null;

  let best = { seconds: Infinity, path: [] };
  for (const { nodeId: startNode, headSeconds } of fromCandidates) {
    const { dist, prev } = dijkstraFrom(map, startNode, weather);
    if (toNodeId) {
      const total = headSeconds + (dist.get(toNodeId) ?? Infinity);
      if (total < best.seconds) {
        best = { seconds: total, path: [...reconstructPath(prev, startNode === toNodeId ? startNode : toNodeId)] };
      }
    } else if (toEdge) {
      const t = Math.max(0, Math.min(1, toPoint.t ?? 0.5));
      const tailA = t * edgeSeconds(map, toEdge, weather);       // arriving via toEdge.from, driving partway down
      const tailB = (1 - t) * edgeSeconds(map, toEdge, weather);  // arriving via toEdge.to, driving back up
      const viaA = headSeconds + (dist.get(toEdge.from) ?? Infinity) + tailA;
      const viaB = headSeconds + (dist.get(toEdge.to) ?? Infinity) + tailB;
      if (viaA < best.seconds) best = { seconds: viaA, path: reconstructPath(prev, toEdge.from) };
      if (viaB < best.seconds) best = { seconds: viaB, path: reconstructPath(prev, toEdge.to) };
    }
  }
  return best;
}

// A start RoutingPoint expands into one or two graph-search starting nodes,
// each carrying the real partial-edge time already spent getting there.
function expandEndpoint(map, point, weather = "clear") {
  if (point.type === "node") return [{ nodeId: point.nodeId, headSeconds: 0 }];
  const e = edgeById(map, point.edgeId);
  if (!e) return [];
  const t = Math.max(0, Math.min(1, point.t ?? 0.5));
  const secs = edgeSeconds(map, e, weather);
  return [
    { nodeId: e.from, headSeconds: t * secs },
    { nodeId: e.to, headSeconds: (1 - t) * secs },
  ];
}

// Nearest point ON THE GRAPH to an arbitrary world {x,y} — a node, or a
// mid-edge {edgeId,t}. Authoring/debug tooling only; the dispatch flow
// always places incidents already-on-graph via the pickers below.
export function nearestRoutingPoint(map, point) {
  let best = null, bestDist = Infinity;
  for (const n of map.nodes) {
    const d = euclideanDist(n, point);
    if (d < bestDist) { bestDist = d; best = { type: "node", nodeId: n.id }; }
  }
  for (const e of map.edges) {
    const a = nodeById(map, e.from), b = nodeById(map, e.to);
    if (!a || !b) continue;
    const t = projectOntoSegment(point, a, b);
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    const d = euclideanDist(p, point);
    if (d < bestDist) { bestDist = d; best = { type: "edge", edgeId: e.id, t }; }
  }
  return best;
}

function projectOntoSegment(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return 0;
  const t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
  return Math.max(0, Math.min(1, t));
}

// --- Deterministic-friendly random location picking ------------------------
// Both pickers take an injected `rng` (a ()=>number-in-[0,1) function) rather
// than calling Math.random() directly, so a seeded PRNG makes a pick
// reproducible for debugging/tests. Real game code passes Math.random by
// default.

// A tiny seeded PRNG (mulberry32) for reproducible picks from a persisted
// integer seed (g.locations.seed) — not cryptographic, just deterministic.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Weighted-random building pick, honoring a scenario's locConstraints (hard
// allow-list, filters the candidate set) and locWeights (soft bias among
// what's left). No locConstraints/locWeights => flat weight across every
// building on the map (today's effective behavior).
export function pickIncidentBuilding(map, scen, rng = Math.random) {
  const allow = scen?.locConstraints;
  const pool = allow ? map.buildings.filter((b) => allow.includes(b.type)) : map.buildings;
  const candidates = pool.length ? pool : map.buildings;
  const weights = scen?.locWeights;
  const weighted = candidates.map((b) => ({ b, w: weights ? (weights[b.type] ?? 1) : 1 }));
  const total = weighted.reduce((s, x) => s + x.w, 0);
  let r = rng() * total;
  for (const { b, w } of weighted) { r -= w; if (r <= 0) return b; }
  return weighted[weighted.length - 1]?.b || null;
}

// --- Department-aware station selection -----------------------------------
// Every station-type building in maps.js carries a `department` (one of
// fleet.js's DEPARTMENT_ORDER strings) and a `vehicles` map ({kindKey:
// count}) of which specific fleet.js KINDS are actually based there — not
// every station of a department has every kind that department owns (e.g.
// only one of a city's four firehouses has the ladder truck). These two
// functions are what make that real: a vehicle kind resolves to the
// NEAREST station that genuinely has it, not just the nearest building
// tagged with the right department.

// Stations carrying `vehicleKind` win if any exist; otherwise any station
// of the right department; otherwise null (caller falls back to
// map.station). vehicleKind is optional — omit it for a department-only
// lookup (e.g. a generic preview with no specific vehicle chosen yet).
export function stationsForDepartment(map, department, vehicleKind) {
  const withKind = vehicleKind
    ? map.buildings.filter((b) => b.department === department && (b.vehicles?.[vehicleKind] ?? 0) > 0)
    : [];
  if (withKind.length) return withKind;
  const anyDept = map.buildings.filter((b) => b.department === department);
  return anyDept.length ? anyDept : null;
}

// The real station a given department/vehicleKind dispatches from for a
// given incident — nearest by actual drive time (shortestPath), not just
// straight-line distance, since a station across a highway can be closer
// in time than one a shorter line-distance away on local streets.
export function nearestStation(map, department, vehicleKind, incidentPoint) {
  const stations = stationsForDepartment(map, department, vehicleKind);
  if (!stations) return { type: "node", nodeId: map.station };
  let best = null, bestSeconds = Infinity;
  for (const b of stations) {
    const rp = { type: "node", nodeId: b.node };
    const { seconds } = shortestPath(map, rp, incidentPoint);
    if (seconds < bestSeconds) { bestSeconds = seconds; best = rp; }
  }
  return best || { type: "node", nodeId: map.station };
}

// pathToWaypoints(map, path) — a plain node-id path (shortestPath's own
// `path` field) resolved into real WORLD-SPACE {x,y} points (meters, same
// +x=east/+y=north convention this whole file uses) — the shared building
// block behind any real-route rendering (DrivingScene.jsx's driving scene;
// CityMap.jsx could adopt this too instead of its own inline `nodePos`
// mapping, though that one also needs SVG projection, so wasn't switched
// over as part of this batch). Missing node ids are silently dropped
// (defensive only — shortestPath never actually returns an unknown id).
export function pathToWaypoints(map, path) {
  return (path || []).map((id) => nodeById(map, id)).filter(Boolean).map((n) => ({ x: n.x, y: n.y, nodeId: n.id }));
}

// Every edge touching a real map node — used to derive TRUE intersection
// geometry (how many roads actually meet there, in which real directions),
// not just where a route polyline happens to bend. Driving-scene
// consumer: DrivingScene.jsx's real cross-street rendering.
export function edgesAtNode(map, nodeId) {
  return (map?.edges || []).filter((e) => e.from === nodeId || e.to === nodeId);
}

// Weighted-random point along a street edge, for locOnStreet scenarios —
// weighted toward arterial/highway edges for MVC-scale mechanisms.
const STREET_TYPE_WEIGHT = { local: 1, arterial: 3, highway: 4 };
export function pickPointOnStreet(map, rng = Math.random) {
  const weighted = map.edges.map((e) => ({ e, w: STREET_TYPE_WEIGHT[e.type] ?? 1 }));
  const total = weighted.reduce((s, x) => s + x.w, 0);
  let r = rng() * total, edge = weighted[weighted.length - 1]?.e;
  for (const { e, w } of weighted) { r -= w; if (r <= 0) { edge = e; break; } }
  if (!edge) return null;
  return { type: "edge", edgeId: edge.id, t: rng() };
}

// A real, player-facing dispatch address/location line for an incident's
// own RoutingPoint — the map-expansion content pass's answer to this
// project's real names/addresses (maps.js) never having reached the
// player before (only CityMap.jsx's debug overlay ever showed them). Does
// NOT store any new state: reconstructs the same deterministic pick
// dispatch itself made, from the persisted seed — the identical
// "seed once, reconstruct on demand" idiom App.jsx's own walkMapData
// (Coop3DWalk target/layout) already established for this exact reason.
// Returns null if reconstruction fails (defensive only — a real dispatch's
// own seed/point always resolves) rather than a placeholder string, so a
// caller can choose to render nothing instead of a broken-looking line.
export function describeIncidentLocation(map, scen, seed, incidentPoint) {
  if (!map || !incidentPoint) return null;
  if (incidentPoint.type === "edge") {
    const e = edgeById(map, incidentPoint.edgeId);
    if (!e) return null;
    // Nearest endpoint to the point's own t, so the cross-street lookup
    // reflects whichever intersection the incident is actually closer to.
    const nearNode = (incidentPoint.t ?? 0.5) <= 0.5 ? e.from : e.to;
    const cross = edgesAtNode(map, nearNode).find((x) => x.name && x.name !== e.name);
    return cross ? `corner of ${e.name} and ${cross.name}` : `on ${e.name}`;
  }
  if (incidentPoint.type === "node") {
    // A locOnStreet scenario whose own pickPointOnStreet draw came back
    // null (map.edges empty — practically never happens, but App.jsx's own
    // dispatch handler has a real fallback for it) lands here with the
    // map's flat station node, NOT a pickIncidentBuilding() pick — running
    // that reconstruction anyway would return an unrelated building's name.
    // Correctly say nothing rather than guess.
    if (scen?.locOnStreet) return null;
    // Ordinary building incidents only ever carry the bare node id (see
    // App.jsx's own dispatch-handler comment) — re-running the SAME
    // weighted pick against the persisted seed reproduces the exact
    // building drawn, the same reconstruct-on-demand idiom App.jsx's own
    // walkMapData already established for this exact reason.
    const building = pickIncidentBuilding(map, scen, mulberry32(seed ?? 0));
    if (!building) return null;
    // maps.js now computes a real, predetermined street `address` for every
    // building (previously only `house`-type buildings had one, doubling as
    // their own `name`) — a genuine EMS dispatch line gives both the
    // institution's name AND its street address ("123 Main St — Northwood
    // Elementary"), not just one. For a house, `address === name` already
    // (maps.js's own applyGridAddresses), so this collapses to the exact
    // unchanged single-line address it always showed.
    if (building.address && building.address !== building.name) return `${building.address} — ${building.name}`;
    return building.name || building.address || null;
  }
  return null;
}
