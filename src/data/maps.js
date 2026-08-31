// maps.js — the three real geographic maps (urban/suburban/rural) that back
// dispatch, travel time, and the Sandbox map screen. See CLAUDE.md's
// map-expansion plan for the full design rationale.
//
// World-space coordinates are meters; +x = east, +y = NORTH (up on a
// north-up map). CityMap.jsx's SVG renderer is the only place that flips y
// for screen space — mapGraph.js's distance/routing math reads these raw.
//
// `mapId` is a separate concept from `g.mode` (city/suburban/rural) — g.mode
// still carries unit-availability/medic-probability flavor (fleet.js's
// MODES), unrelated to which physical map is loaded. MODE_DEFAULT_MAP is
// the (currently 1:1) lookup every read site resolves through, so a future
// batch can point a mode at a different map id without touching g.mode's
// own meaning.

// --- small authoring helpers (grid layout only, not part of the runtime
// schema consumed by mapGraph.js/CityMap.jsx — every map below ends up as
// plain nodes/edges/buildings) -----------------------------------------

function gridNodes(prefix, cols, rows, spacing) {
  const nodes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // y flipped from authoring row order so row 0 (top of the grid as
      // written below) reads as the northernmost row, matching +y=north.
      nodes.push({ id: `${prefix}${r}-${c}`, x: c * spacing, y: (rows - 1 - r) * spacing });
    }
  }
  return nodes;
}

// arterialRow(s)/arterialCol(s) accept either a single index (SUBURBAN_MAP's
// original single-arterial-cross call) or an array of indices (CITY_MAP's
// multi-arterial grid, added when the city grid grew past 5x5 — a bigger
// grid at the same spacing needs more than one fast through-street per axis
// to keep the "dense urban, fast response" travel-time character the
// original 5x5/single-arterial map had). Both forms normalize to a Set here
// so the row/col loops below don't care which form was passed.
function gridEdges(prefix, cols, rows, { localSpeed, arterialSpeed, arterialRow, arterialCol, rowNames, colNames }) {
  const arterialRows = new Set(Array.isArray(arterialRow) ? arterialRow : [arterialRow]);
  const arterialCols = new Set(Array.isArray(arterialCol) ? arterialCol : [arterialCol]);
  const edges = [];
  const id = (r, c) => `${prefix}${r}-${c}`;
  const push = (a, b, type, name, speed) => {
    edges.push({ id: `${a}>${b}`, from: a, to: b, type, name, speedMph: speed });
    edges.push({ id: `${b}>${a}`, from: b, to: a, type, name, speedMph: speed });
  };
  for (let r = 0; r < rows; r++) {
    const arterial = arterialRows.has(r);
    for (let c = 0; c < cols - 1; c++) {
      push(id(r, c), id(r, c + 1), arterial ? "arterial" : "local", rowNames[r], arterial ? arterialSpeed : localSpeed);
    }
  }
  for (let c = 0; c < cols; c++) {
    const arterial = arterialCols.has(c);
    for (let r = 0; r < rows - 1; r++) {
      push(id(r, c), id(r + 1, c), arterial ? "arterial" : "local", colNames[c], arterial ? arterialSpeed : localSpeed);
    }
  }
  return edges;
}

// --- Predetermined building addresses -----------------------------------
// A real numbered street address per building, computed once here from
// static node/offset data rather than hand-authored per entry (over 100
// buildings across the three maps) or generated at runtime (which would
// mean a fresh address every session — the opposite of "predetermined").
// Every `house`-type building already carries a real address AS its own
// `name` (e.g. "104 Oak St", authored when the map was built) — those are
// left alone rather than double-computed. Every other type (hospitals,
// schools, stations, the campus cluster, etc.) gets a genuine new
// `address` field alongside its institutional `name`, wired into the real
// "Dispatched to ___" line (mapGraph.js's describeIncidentLocation) so
// this isn't a decorative field nothing reads.
//
// The fronting street is picked by whichever axis the building's own
// offset leans on more (an east/west-leaning offset sets a building back
// from the north-south column street passing through its node; a
// north/south-leaning offset sets it back from the east-west row street) —
// the same "offset direction implies which street" convention this file's
// own hand-authored house addresses already follow. The block number
// scales with position along the OTHER axis, with the offset's sign
// picking a stable odd/even side — deterministic, not random.
function gridAddress(nodeIndex, off, cols, rowNames, colNames) {
  const r = Math.floor(nodeIndex / cols), c = nodeIndex % cols;
  if (Math.abs(off.dx) >= Math.abs(off.dy)) {
    return `${(r + 1) * 100 + (off.dy >= 0 ? 4 : 8)} ${colNames[c]}`;
  }
  return `${(c + 1) * 100 + (off.dx >= 0 ? 2 : 6)} ${rowNames[r]}`;
}
// Rural buildings sit on a sparse, non-grid road graph — the fronting
// "street" is just whichever real named edge actually touches the
// building's own node (every rural node has exactly one, since the road
// graph is a tree of branches off the highway spine), and the number is a
// stable mile-marker-style figure derived from the node's own fixed
// world position, not a grid block index.
function ruralAddress(map, node) {
  const edge = map.edges.find((e) => e.from === node.id || e.to === node.id);
  if (!edge) return null;
  const num = Math.max(1, Math.round(Math.abs(node.x) / 100) * 10 + Math.round(Math.abs(node.y) / 200));
  return `${num} ${edge.name}`;
}
function applyGridAddresses(map, nodes, cols, rowNames, colNames) {
  for (const b of map.buildings) {
    if (b.type === "house") { b.address = b.name; continue; }
    const idx = nodes.findIndex((n) => n.id === b.node);
    b.address = idx >= 0 ? gridAddress(idx, b.offset || { dx: 0, dy: 0 }, cols, rowNames, colNames) : b.name;
  }
}

// --- Urban — "Northwood City" ------------------------------------------
// Dense 7x7 grid (grown from an original 5x5 — see the map-expansion
// content pass), tight spacing, low speed limits. Short distances, slow
// speeds — this is what makes urban response times fast despite the
// heaviest call volume in the game. TWO arterial rows and TWO arterial
// columns (not one of each, like the original 5x5 or SUBURBAN_MAP below)
// — a bigger grid at the same spacing needs a denser fast-street network to
// keep that same "no point in the city is far from a fast road" property;
// measured via mapGraphValidate.mjs's own reachability pass plus a direct
// shortestPath probe before shipping (see the map-expansion plan's own
// rebalancing note) rather than assumed from the size change alone.
// MEASURED (not assumed): average node-to-node shortestPath rose from
// 21.9s (old 5x5, single arterial) to 28.4s (this 7x7, double arterial) —
// a real ~30% increase, not fully absorbed by the double-arterial fix, but
// deliberately left as-is rather than tuned further (a third arterial, a
// smaller grid, etc.) per explicit operator direction: real traffic
// density/flow is a separate, not-yet-built system that will be the real
// pacing lever for city response times later, so precisely matching the
// old baseline here would be tuning against a number that's about to
// become obsolete anyway. Worst-case pairwise time rose 52.5s -> 69.2s.

const CITY_COLS = 7, CITY_ROWS = 7, CITY_SPACING = 80;
// Row 6 (the southernmost avenue — row 0 is northernmost, see gridNodes's
// own y-flip comment) is reclassified below from "6th Ave" to Route 9, a
// real highway skirting the city's southern edge rather than cutting
// through downtown — the same numbered-highway naming RURAL_MAP's own
// spine ("County Highway 9") already establishes, read as the same real
// road continuing from the rural county into the city limits.
const CITY_ROW_NAMES = ["1st Ave", "2nd Ave", "3rd Ave", "4th Ave", "5th Ave", "6th Ave", "Route 9"];
const CITY_COL_NAMES = ["Elm St", "Oak St", "Main St", "Pine St", "Cedar St", "Birch St", "Walnut St"];

const cityNodes = gridNodes("u", CITY_COLS, CITY_ROWS, CITY_SPACING);
const cityEdges = gridEdges("u", CITY_COLS, CITY_ROWS, {
  // 3rd/5th Ave and Main/Cedar St — two evenly-spaced through-corridors per
  // axis instead of one, the density fix described above.
  localSpeed: 25, arterialSpeed: 30, arterialRow: [2, 4], arterialCol: [2, 4],
  rowNames: CITY_ROW_NAMES, colNames: CITY_COL_NAMES,
});
// Route 9 — the southern-edge highway. Reclassifies row 6's own edges
// (already built above as "local" by gridEdges, since row 6 isn't one of
// the arterial rows) up to a real highway type/speed, rather than
// authoring separate bypass geometry — this literally IS the city's own
// southernmost street, just a faster-classed one, matching how a real
// numbered highway often runs along a city's edge as an ordinary-looking
// street with a different speed limit and classification, not a walled-off
// freeway. mapGraphValidate.mjs's reverse-pair check exempts "highway"
// edges from its warning (see that script's own comment) so this doesn't
// need special handling there.
for (const e of cityEdges) {
  if (e.name === "Route 9") { e.type = "highway"; e.speedMph = 45; }
}

export const CITY_MAP = {
  id: "city",
  name: "Northwood City",
  version: 1,
  units: "meters",
  bounds: { width: (CITY_COLS - 1) * CITY_SPACING + 60, height: (CITY_ROWS - 1) * CITY_SPACING + 60 },
  nodes: cityNodes,
  edges: cityEdges,
  buildings: [
    // Four hospitals (the "urban" density — see CLAUDE.md's plan), each with
    // a real `designations` object (ACS Trauma Center Level I-IV, stroke
    // center tier, STEMI-receiving, pediatric/burn/psych) alongside the
    // existing `capabilities` array hospitals.js's chooseDestination()
    // already filters on — designations is what lets chooseDestination
    // pick BETWEEN qualifying hospitals now that there's more than one
    // (hospitals.js's own tie-break logic), not just find the first match.
    { id: "northwood-trauma", type: "hospital", name: "Northwood Trauma Center", node: "u0-5",
      capabilities: ["trauma", "cardiac", "stroke"],
      designations: { traumaLevel: 1, stroke: "comprehensive", stemi: true, pediatric: true, burn: true },
      offset: { dx: 14, dy: 10 } },
    { id: "northwood-general-downtown", type: "hospital", name: "Northwood General — Downtown", node: "u4-5",
      capabilities: ["trauma", "cardiac", "stroke"],
      designations: { traumaLevel: 3, stroke: "primary", stemi: true },
      offset: { dx: 14, dy: -8 } },
    { id: "northwood-community-north", type: "hospital", name: "Northwood Community North", node: "u1-2",
      capabilities: ["cardiac", "stroke"],
      designations: { stroke: "acute-ready", stemi: true },
      offset: { dx: -10, dy: 12 } },
    { id: "northwood-behavioral-peds", type: "hospital", name: "Northwood Behavioral & Pediatric", node: "u6-4",
      capabilities: [],
      designations: { pediatric: true, psych: true },
      offset: { dx: 10, dy: 12 } },
    { id: "b-clinic1", type: "clinic", name: "Northwood Urgent Care", node: "u6-2", offset: { dx: -12, dy: -8 } },
    { id: "b-clinic2", type: "clinic", name: "Elm Street Family Clinic", node: "u1-0", offset: { dx: 10, dy: 8 } },
    // Three schools (was one) — a real district-forming detail across the
    // bigger grid: an elementary, a middle, and a high school, not three
    // copies of the same type.
    { id: "b-school", type: "school", name: "Northwood Elementary", node: "u0-2", offset: { dx: 8, dy: 12 } },
    { id: "b-school2", type: "school", name: "Northwood Middle School", node: "u2-5", offset: { dx: -8, dy: 10 } },
    { id: "b-school3", type: "school", name: "Northwood High School", node: "u5-4", offset: { dx: 10, dy: -10 } },
    // Four parks (was two).
    { id: "b-park1", type: "park", name: "Riverside Park", node: "u3-2", offset: { dx: -10, dy: -10 } },
    { id: "b-park2", type: "park", name: "City Green", node: "u2-6", offset: { dx: 12, dy: -6 } },
    { id: "b-park3", type: "park", name: "Founders Park", node: "u5-6", offset: { dx: -10, dy: 8 } },
    { id: "b-park4", type: "park", name: "Lakeview Park", node: "u0-4", offset: { dx: 10, dy: -10 } },
    // Northwood City Hall — the civic building the operator specifically
    // asked for, previously entirely absent (no "cityHall" type existed
    // anywhere in this codebase before this batch). Placed at the downtown
    // arterial cross alongside the Sheriff's Office and Downtown Bank, the
    // real civic/financial cluster a real city's core reads as. Needs a
    // matching `sizeFor`/`BUILDING_MODEL_URL` entry in DrivingScene.jsx
    // (added alongside this).
    { id: "b-cityhall", type: "cityHall", name: "Northwood City Hall", node: "u3-4", offset: { dx: -12, dy: 10 } },
    // 11 ordinary businesses (was 6) plus 2 "skyscraper" — a new type,
    // downtown high-rises visibly taller than an ordinary `business`
    // building, using the previously-unused spare skyscraper mesh (see
    // DrivingScene.jsx/public/models/buildings/README.md) — this is the
    // real answer to "do we have skyscrapers for the city": before this
    // batch, only the trauma-center hospital read as tall; now downtown
    // has its own distinct high-rise cluster.
    { id: "b-biz1", type: "business", name: "Corner Market", node: "u2-3", offset: { dx: -14, dy: 6 } },
    { id: "b-biz2", type: "business", name: "5th Ave Diner", node: "u4-6", offset: { dx: 10, dy: -8 } },
    { id: "b-biz3", type: "business", name: "Downtown Bank", node: "u3-3", offset: { dx: -8, dy: -10 } },
    { id: "b-biz4", type: "business", name: "Northwood Auto Shop", node: "u6-5", offset: { dx: 14, dy: 8 } },
    { id: "b-biz5", type: "business", name: "Hardware & Home", node: "u0-1", offset: { dx: -10, dy: 12 } },
    { id: "b-biz6", type: "business", name: "Northwood Mall", node: "u2-0", offset: { dx: 16, dy: 0 } },
    { id: "b-biz7", type: "business", name: "Northwood Public Library", node: "u4-1", offset: { dx: -10, dy: -8 } },
    { id: "b-biz8", type: "business", name: "Northwood Post Office", node: "u2-1", offset: { dx: 10, dy: 8 } },
    { id: "b-biz9", type: "business", name: "Northwood Cinema", node: "u4-0", offset: { dx: -12, dy: 8 } },
    { id: "b-biz10", type: "business", name: "Northwood Gas & Go", node: "u6-4", offset: { dx: 10, dy: -10 } }, // by Route 9, a real gas-station-near-the-highway detail
    { id: "b-biz11", type: "business", name: "Northwood Pharmacy", node: "u1-6", offset: { dx: -8, dy: 10 } },
    // Apartments — a real multi-unit residential type (was entirely
    // absent — every prior residential building was a single-family
    // `house`). DrivingScene.jsx gives this type a genuine two-floor
    // interior (a ground-floor lobby and an upper-floor unit, connected by
    // a real staircase) rather than the one-room box every other type
    // gets — the real "interiors and stairs" payoff, not just a bigger box.
    { id: "b-apt1", type: "apartment", name: "Cedar Court Apartments", node: "u5-2", offset: { dx: 10, dy: -10 } },
    { id: "b-apt2", type: "apartment", name: "Birchwood Flats", node: "u4-3", offset: { dx: -10, dy: 10 } },
    { id: "b-apt3", type: "apartment", name: "Main Street Lofts", node: "u4-1", offset: { dx: 12, dy: 10 } },
    { id: "b-sky1", type: "skyscraper", name: "Northwood Tower", node: "u3-4", offset: { dx: 14, dy: -10 } },
    { id: "b-sky2", type: "skyscraper", name: "Northwood Grand Hotel", node: "u3-2", offset: { dx: 12, dy: 10 } },
    // 20 addressed houses (was 12), filling out the bigger grid at the same
    // density-per-block the original 12 established — real street
    // addresses across all 7 named streets, including the two new ones
    // (Birch/Walnut St) the grid growth added.
    { id: "b-h1", type: "house", name: "104 Oak St", node: "u0-1", offset: { dx: 10, dy: -8 } },
    { id: "b-h2", type: "house", name: "212 Main St", node: "u0-3", offset: { dx: -10, dy: 8 } },
    { id: "b-h3", type: "house", name: "318 Cedar St", node: "u1-2", offset: { dx: 12, dy: 10 } },
    { id: "b-h4", type: "house", name: "406 Elm St", node: "u1-4", offset: { dx: -8, dy: -10 } },
    { id: "b-h5", type: "house", name: "512 Oak St", node: "u2-0", offset: { dx: 10, dy: 10 } },
    { id: "b-h6", type: "house", name: "603 Pine St", node: "u2-1", offset: { dx: -12, dy: -6 } },
    { id: "b-h7", type: "house", name: "701 Cedar St", node: "u3-0", offset: { dx: 8, dy: -10 } },
    { id: "b-h8", type: "house", name: "815 Elm St", node: "u3-1", offset: { dx: -10, dy: 8 } },
    { id: "b-h9", type: "house", name: "902 Main St", node: "u3-3", offset: { dx: 12, dy: -8 } },
    { id: "b-h10", type: "house", name: "1010 Pine St", node: "u4-0", offset: { dx: -8, dy: 10 } },
    { id: "b-h11", type: "house", name: "1118 Oak St", node: "u4-2", offset: { dx: 10, dy: 8 } },
    { id: "b-h12", type: "house", name: "1204 Main St", node: "u4-4", offset: { dx: -12, dy: -8 } },
    { id: "b-h13", type: "house", name: "1310 Birch St", node: "u1-5", offset: { dx: 10, dy: -8 } },
    { id: "b-h14", type: "house", name: "1416 Walnut St", node: "u1-6", offset: { dx: -10, dy: 8 } },
    { id: "b-h15", type: "house", name: "1502 Birch St", node: "u2-5", offset: { dx: 12, dy: 8 } },
    { id: "b-h16", type: "house", name: "1608 Walnut St", node: "u3-6", offset: { dx: -8, dy: -10 } },
    { id: "b-h17", type: "house", name: "1704 Birch St", node: "u5-0", offset: { dx: 10, dy: 10 } },
    { id: "b-h18", type: "house", name: "1810 Walnut St", node: "u5-6", offset: { dx: -12, dy: -6 } },
    { id: "b-h19", type: "house", name: "1902 Oak St", node: "u6-2", offset: { dx: 8, dy: 10 } },
    { id: "b-h20", type: "house", name: "2004 Pine St", node: "u6-6", offset: { dx: -10, dy: 8 } },

    // Station buildings — one per fleet.js DEPARTMENT_ORDER entry, sized to
    // this map's own "urban" density (4 of each multi-substation department,
    // 1 each of the single-institution ones). `vehicles` is a real, read
    // field (mapGraph.js's nearestStation()) — not every station of a given
    // department carries every kind that department owns; a rarer kind
    // (ladder, battalion, criticalCare, criticalCareChase, sergeant)
    // concentrates at one station instead of all four, echoing that kind's
    // own low baseChance/high etaTier in fleet.js. Repositioned onto the
    // bigger 7x7 grid (spread to genuinely cover the larger area) — same
    // ids/names/departments/vehicles as before the grid grew, just moved.
    //
    // The university is deliberately URBAN-ONLY — not authored on
    // SUBURBAN_MAP/RURAL_MAP at all (see their own comments) — matching
    // fleet.js's own MODES.city.units already being the only mode that
    // lists "pso" among its responding units. mapGraphValidate.mjs knows
    // about this one intentional exception; don't "fix" it by adding a
    // university back to the other two maps.
    { id: "fs1", type: "fireStation", name: "Northwood Fire Co. 1", department: "Fire Dept", node: "u0-0", vehicles: { engine: 1, squad: 1 }, offset: { dx: 16, dy: -16 } },
    { id: "fs2", type: "fireStation", name: "Northwood Fire Co. 2", department: "Fire Dept", node: "u0-6", vehicles: { engine: 1, squad: 1 }, offset: { dx: -16, dy: -16 } },
    { id: "fs3", type: "fireStation", name: "Northwood Fire Co. 3 (HQ)", department: "Fire Dept", node: "u6-0", vehicles: { engine: 2, rescue: 1, ladder: 1, battalion: 1 }, offset: { dx: 16, dy: 16 } },
    { id: "fs4", type: "fireStation", name: "Northwood Fire Co. 4", department: "Fire Dept", node: "u6-6", vehicles: { engine: 1 }, offset: { dx: -16, dy: 16 } },
    { id: "es1", type: "emsStation", name: "Northwood County EMS Station 1", department: "County EMS", node: "u0-3", vehicles: { ambALS: 2 }, offset: { dx: -8, dy: -16 } },
    { id: "es2", type: "emsStation", name: "Northwood County EMS Station 2", department: "County EMS", node: "u3-0", vehicles: { ambALS: 2, supervisor: 1 }, offset: { dx: -10, dy: -10 } },
    { id: "es3", type: "emsStation", name: "Northwood County EMS Station 3", department: "County EMS", node: "u3-6", vehicles: { ambALS: 1, criticalCare: 1, criticalCareChase: 1 }, offset: { dx: -16, dy: 6 } },
    { id: "es4", type: "emsStation", name: "Northwood County EMS Station 4", department: "County EMS", node: "u6-3", vehicles: { ambALS: 1 }, offset: { dx: -10, dy: -8 } },
    { id: "pes1", type: "privateEmsStation", name: "Crosswind Medical Transport", department: "Private EMS", node: "u1-1", vehicles: { ambBLS: 2 }, offset: { dx: -10, dy: -8 } },
    { id: "pes2", type: "privateEmsStation", name: "Crosswind Medical Transport — East Depot", department: "Private EMS", node: "u1-5", vehicles: { ambBLS: 1 }, offset: { dx: 8, dy: 10 } },
    { id: "pes3", type: "privateEmsStation", name: "Crosswind Medical Transport — South Depot", department: "Private EMS", node: "u5-1", vehicles: { ambBLS: 1 }, offset: { dx: -8, dy: 10 } },
    { id: "pes4", type: "privateEmsStation", name: "Crosswind Medical Transport — West Depot", department: "Private EMS", node: "u5-5", vehicles: { ambBLS: 1 }, offset: { dx: -14, dy: -8 } },
    { id: "ps1", type: "policeStation", name: "Northwood PD Precinct 1", department: "Police Dept", node: "u2-2", vehicles: { pd: 2, pdMoto: 1 }, offset: { dx: 8, dy: 10 } },
    { id: "ps2", type: "policeStation", name: "Northwood PD Precinct 2", department: "Police Dept", node: "u2-4", vehicles: { pd: 1 }, offset: { dx: 0, dy: 0 } },
    { id: "ps3", type: "policeStation", name: "Northwood PD Precinct 3", department: "Police Dept", node: "u4-2", vehicles: { pd: 1, sergeant: 1 }, offset: { dx: -8, dy: -10 } },
    { id: "ps4", type: "policeStation", name: "Northwood PD Precinct 4", department: "Police Dept", node: "u4-4", vehicles: { pd: 1, pdMoto: 1 }, offset: { dx: -8, dy: 10 } },
    { id: "vs1", type: "volunteerStation", name: "Northwood Volunteer Rescue 1", department: "Volunteer Agency", node: "u1-3", vehicles: { volunteer: 1 }, offset: { dx: -10, dy: 10 } },
    { id: "vs2", type: "volunteerStation", name: "Northwood Volunteer Rescue 2", department: "Volunteer Agency", node: "u3-1", vehicles: { volunteer: 1, volBLS: 1 }, offset: { dx: 10, dy: -10 } },
    { id: "vs3", type: "volunteerStation", name: "Northwood Volunteer Rescue 3", department: "Volunteer Agency", node: "u3-5", vehicles: { volunteer: 1 }, offset: { dx: -8, dy: -10 } },
    { id: "vs4", type: "volunteerStation", name: "Northwood Volunteer Rescue 4", department: "Volunteer Agency", node: "u5-3", vehicles: { volBLS: 1 }, offset: { dx: -8, dy: 12 } },
    { id: "sheriff1", type: "sheriffOffice", name: "Northwood County Sheriff's Office", department: "Sheriff's Office", node: "u3-3", vehicles: { sheriff: 1 }, offset: { dx: 14, dy: -8 } },
    // Northwood University — was a single bare marker (no building cluster
    // at all, just one house-sized box). Now a real campus: a landmark hall
    // fronting an open quad, ringed by a library, a student union, a
    // science building, and a dining hall. `id: "university"` stays the
    // ONLY entry with `department`/`vehicles` — dispatch/nearestStation
    // still resolves off that one record exactly as before; the four
    // siblings share `campus: "northwood"` (DrivingScene.jsx groups any
    // buildings with a matching `campus` id and draws a real quad/lawn/
    // pathways around their centroid) and no `department`/`vehicles` field,
    // so they're purely decorative and invisible to dispatch — confirmed
    // safe against mapGraph.js/mapGraphValidate.mjs before adding (neither
    // requires one building per department, per node, or a pre-registered
    // `type`). Offsets are hand-spaced (not auto-laid-out) to keep real
    // clearance from the pre-existing "406 Elm St" house at this same node.
    { id: "university", type: "university", name: "Northwood University", department: "Campus PD", node: "u1-4", vehicles: { pso: 1, patrol: 1, campusEmr: 1 }, campus: "northwood", offset: { dx: 6, dy: 26 } },
    { id: "university-library", type: "universityLibrary", name: "Northwood University Library", node: "u1-4", campus: "northwood", offset: { dx: -22, dy: 10 } },
    { id: "university-union", type: "universityUnion", name: "Northwood University Student Union", node: "u1-4", campus: "northwood", offset: { dx: 24, dy: 6 } },
    { id: "university-science", type: "universityScience", name: "Northwood University Science Hall", node: "u1-4", campus: "northwood", offset: { dx: 10, dy: -24 } },
    { id: "university-dining", type: "universityDining", name: "Northwood University Dining Hall", node: "u1-4", campus: "northwood", offset: { dx: -14, dy: -24 } },
    { id: "airport1", type: "airport", name: "Northwood Regional Airport", department: "Flight EMS", node: "u6-1", vehicles: { flight: 1 }, offset: { dx: -14, dy: -12 } }, // near Route 9, a real airport-by-the-highway detail
  ],
  // Downtown center node — the arterial cross closest to the civic/
  // financial cluster (Sheriff's Office/City Hall/Downtown Bank/Northwood
  // Tower all sit at or near u3-3/u3-4), same role the old 5x5 grid's
  // "u2-0" fallback point played.
  station: "u3-3",
};
applyGridAddresses(CITY_MAP, cityNodes, CITY_COLS, CITY_ROW_NAMES, CITY_COL_NAMES);

// --- Suburban — "Northwood Heights" -------------------------------------
// Looser 4x4 grid, wider spacing, plus a couple of cul-de-sacs hanging off
// the perimeter — real dead-end streets, not just a scaled-up city grid.

const SUB_COLS = 4, SUB_ROWS = 4, SUB_SPACING = 180;
const SUB_ROW_NAMES = ["Aspen Way", "Birchwood Rd", "Chestnut Dr", "Dogwood Ln"];
const SUB_COL_NAMES = ["Heights Blvd", "Maple Ct", "Ridgeline Ave", "Sycamore Rd"];

const subNodes = gridNodes("s", SUB_COLS, SUB_ROWS, SUB_SPACING);
const subEdges = gridEdges("s", SUB_COLS, SUB_ROWS, {
  localSpeed: 30, arterialSpeed: 35, arterialRow: 1, arterialCol: 0,
  rowNames: SUB_ROW_NAMES, colNames: SUB_COL_NAMES,
});

// Cul-de-sacs — one dead-end node each, hung off a perimeter grid node by a
// single two-way local street.
const CULDESACS = [
  { id: "s-cds1", from: "s0-3", name: "Wrenfield Ct", x: (SUB_COLS - 1) * SUB_SPACING + 70, y: (SUB_ROWS - 1) * SUB_SPACING + 30 },
  { id: "s-cds2", from: "s3-0", name: "Hollow Bend", x: -70, y: -30 },
];
const culdesacNodes = CULDESACS.map((c) => ({ id: c.id, x: c.x, y: c.y }));
const culdesacEdges = CULDESACS.flatMap((c) => ([
  { id: `${c.from}>${c.id}`, from: c.from, to: c.id, type: "local", name: c.name, speedMph: 25 },
  { id: `${c.id}>${c.from}`, from: c.id, to: c.from, type: "local", name: c.name, speedMph: 25 },
]));

export const SUBURBAN_MAP = {
  id: "suburban",
  name: "Northwood Heights",
  version: 1,
  units: "meters",
  bounds: { width: (SUB_COLS - 1) * SUB_SPACING + 160, height: (SUB_ROWS - 1) * SUB_SPACING + 120 },
  nodes: [...subNodes, ...culdesacNodes],
  edges: [...subEdges, ...culdesacEdges],
  buildings: [
    // Two hospitals (the "suburban" density) — see CITY_MAP's own comment
    // for why `designations` exists.
    { id: "heights-community", type: "hospital", name: "Northwood Heights Community Hospital", node: "s0-3",
      capabilities: ["trauma", "cardiac", "stroke"],
      designations: { traumaLevel: 3, stroke: "primary", stemi: true },
      offset: { dx: 20, dy: -14 } },
    { id: "ridgeline-urgent-care", type: "hospital", name: "Ridgeline Urgent Care & Med Center", node: "s2-1",
      capabilities: ["stroke"],
      designations: { stroke: "acute-ready" },
      offset: { dx: 18, dy: -12 } },
    { id: "b-clinic1", type: "clinic", name: "Heights Family Practice", node: "s2-2", offset: { dx: -16, dy: 12 } },
    { id: "b-school", type: "school", name: "Ridgeline Middle School", node: "s1-1", offset: { dx: 14, dy: 16 } },
    { id: "b-park1", type: "park", name: "Sycamore Commons", node: "s2-0", offset: { dx: -18, dy: -14 } },
    { id: "b-biz1", type: "business", name: "Heights Plaza Grocery", node: "s1-2", offset: { dx: 16, dy: -12 } },
    { id: "b-biz2", type: "business", name: "Corner Pharmacy", node: "s2-3", offset: { dx: -14, dy: 14 } },
    { id: "b-apt1", type: "apartment", name: "Ridgeline Court Apartments", node: "s0-3", offset: { dx: -16, dy: 14 } },
    { id: "b-cds1", type: "house", name: "3 Wrenfield Ct", node: "s-cds1", offset: { dx: 0, dy: 0 } },
    { id: "b-cds2", type: "house", name: "7 Hollow Bend", node: "s-cds2", offset: { dx: 0, dy: 0 } },
    { id: "b-h1", type: "house", name: "22 Aspen Way", node: "s0-0", offset: { dx: 16, dy: -12 } },
    { id: "b-h2", type: "house", name: "48 Aspen Way", node: "s0-1", offset: { dx: -14, dy: 14 } },
    { id: "b-h3", type: "house", name: "63 Aspen Way", node: "s0-2", offset: { dx: 16, dy: 12 } },
    { id: "b-h4", type: "house", name: "8 Birchwood Rd", node: "s1-0", offset: { dx: -16, dy: -14 } },
    { id: "b-h5", type: "house", name: "44 Birchwood Rd", node: "s1-3", offset: { dx: 14, dy: -16 } },
    { id: "b-h6", type: "house", name: "12 Chestnut Dr", node: "s2-1", offset: { dx: 16, dy: 14 } },
    { id: "b-h7", type: "house", name: "9 Dogwood Ln", node: "s3-0", offset: { dx: -14, dy: 16 } },
    { id: "b-h8", type: "house", name: "31 Dogwood Ln", node: "s3-1", offset: { dx: 14, dy: -14 } },
    { id: "b-h9", type: "house", name: "58 Dogwood Ln", node: "s3-2", offset: { dx: -16, dy: -12 } },
    { id: "b-h10", type: "house", name: "70 Dogwood Ln", node: "s3-3", offset: { dx: 16, dy: 16 } },

    // Station buildings — "suburban" density: 2 of each multi-substation
    // department, 1 each of the single-institution ones EXCEPT the
    // university — Campus PD (pso/patrol/campusEmr) is urban-only, matching
    // fleet.js's own MODES.city.units already listing "pso" and no other
    // mode doing so. A Campus PD dispatch on this map falls back to the
    // map's flat legacy station node (mapGraph.js's nearestStation()), not
    // a dedicated building. See CITY_MAP's own comment for why `vehicles`
    // matters otherwise.
    { id: "fs1", type: "fireStation", name: "Northwood Heights Fire Co. 1", department: "Fire Dept", node: "s0-0", vehicles: { engine: 1 }, offset: { dx: -18, dy: 14 } },
    { id: "fs2", type: "fireStation", name: "Northwood Heights Fire Co. 2 (HQ)", department: "Fire Dept", node: "s3-3", vehicles: { engine: 1, rescue: 1, ladder: 1, battalion: 1, squad: 1 }, offset: { dx: -16, dy: -16 } },
    { id: "es1", type: "emsStation", name: "Northwood Heights EMS Station 1", department: "County EMS", node: "s1-0", vehicles: { ambALS: 1, supervisor: 1 }, offset: { dx: 16, dy: 14 } },
    { id: "es2", type: "emsStation", name: "Northwood Heights EMS Station 2", department: "County EMS", node: "s2-3", vehicles: { ambALS: 1, criticalCare: 1, criticalCareChase: 1 }, offset: { dx: 14, dy: -14 } },
    { id: "pes1", type: "privateEmsStation", name: "Crosswind Medical Transport", department: "Private EMS", node: "s1-2", vehicles: { ambBLS: 1 }, offset: { dx: -16, dy: 12 } },
    { id: "pes2", type: "privateEmsStation", name: "Crosswind Medical Transport — Heights Depot", department: "Private EMS", node: "s3-0", vehicles: { ambBLS: 1 }, offset: { dx: 14, dy: -16 } },
    { id: "ps1", type: "policeStation", name: "Northwood Heights PD Precinct 1", department: "Police Dept", node: "s0-2", vehicles: { pd: 1, pdMoto: 1 }, offset: { dx: -16, dy: -12 } },
    { id: "ps2", type: "policeStation", name: "Northwood Heights PD Precinct 2", department: "Police Dept", node: "s2-1", vehicles: { pd: 1, sergeant: 1 }, offset: { dx: -16, dy: -14 } },
    { id: "vs1", type: "volunteerStation", name: "Northwood Heights Volunteer Rescue 1", department: "Volunteer Agency", node: "s0-1", vehicles: { volunteer: 1 }, offset: { dx: 14, dy: -14 } },
    { id: "vs2", type: "volunteerStation", name: "Northwood Heights Volunteer Rescue 2", department: "Volunteer Agency", node: "s3-1", vehicles: { volunteer: 1, volBLS: 1 }, offset: { dx: -14, dy: 14 } },
    { id: "sheriff1", type: "sheriffOffice", name: "Northwood County Sheriff's Office — Heights Substation", department: "Sheriff's Office", node: "s2-0", vehicles: { sheriff: 1 }, offset: { dx: 18, dy: 14 } },
    { id: "airport1", type: "airport", name: "Northwood Heights Airfield", department: "Flight EMS", node: "s3-2", vehicles: { flight: 1 }, offset: { dx: 16, dy: -12 } },
  ],
  station: "s1-0",
};
applyGridAddresses(SUBURBAN_MAP, subNodes, SUB_COLS, SUB_ROW_NAMES, SUB_COL_NAMES);

// --- Rural — "Northwood County" -----------------------------------------
// Sparse road graph, deliberately NOT a grid. One highway spine plus several
// long farm-road branches — the slowness is real multi-hop distance
// (station -> highway -> farm road -> house), not one inflated edge.

const spine = [
  { id: "r-town", x: 0, y: 0 },          // small town — station, clinic
  { id: "r-hwy1", x: 900, y: 120 },
  { id: "r-hwy2", x: 1900, y: 200 },
  { id: "r-hwy3", x: 2900, y: 100 },     // county seat — hospital
  { id: "r-hwy4", x: 3900, y: 260 },
  { id: "r-hwy5", x: 4800, y: 480 },
];
const spineEdges = [];
for (let i = 0; i < spine.length - 1; i++) {
  const a = spine[i].id, b = spine[i + 1].id;
  spineEdges.push({ id: `${a}>${b}`, from: a, to: b, type: "highway", name: "County Highway 9", speedMph: 55 });
  spineEdges.push({ id: `${b}>${a}`, from: b, to: a, type: "highway", name: "County Highway 9", speedMph: 55 });
}

// Farm-road branches — 2-3 nodes each, hanging off spine nodes, gravel-flavor
// speed (paved-vs-gravel `edge.surface` distinction is reserved for a future
// batch — see CLAUDE.md; every edge here defaults to "paved" implicitly).
// `surface:"gravel"` — every one of these farm/side roads is an unpaved
// rural branch off the paved spine (see maps.js's own top-of-file note),
// the real-world reason a rural incident far down one of these takes
// longer in bad weather than the same distance on the spine does. Read by
// mapGraph.js's edgeSeconds (optional `weather` param, default "clear" —
// see that function's own comment) — city/suburban edges stay implicitly
// paved (no field needed) and are never multiplied regardless of weather.
const branch = (fromId, ids, dxs, dys, name) => {
  const nodes = [], edges = [];
  const base = spine.find((n) => n.id === fromId);
  let prev = fromId, px = base.x, py = base.y;
  ids.forEach((id, i) => {
    const x = px + dxs[i], y = py + dys[i];
    nodes.push({ id, x, y });
    edges.push({ id: `${prev}>${id}`, from: prev, to: id, type: "local", name, speedMph: 35, surface: "gravel" });
    edges.push({ id: `${id}>${prev}`, from: id, to: prev, type: "local", name, speedMph: 35, surface: "gravel" });
    prev = id; px = x; py = y;
  });
  return { nodes, edges };
};

const branchA = branch("r-town", ["r-fa1", "r-fa2"], [-500, -450], [650, 1300], "Millbrook Farm Rd");
const branchB = branch("r-hwy1", ["r-fb1", "r-fb2"], [400, 750], [-700, -1300], "Silo Rd");
const branchC = branch("r-hwy3", ["r-fc1"], [700], [900], "Quarry Rd");
const branchD = branch("r-hwy4", ["r-fd1", "r-fd2"], [600, 1150], [750, 1250], "Pinehollow Rd");
const branchE = branch("r-hwy5", ["r-fe1"], [-600], [850], "Old Creek Rd");

export const RURAL_MAP = {
  id: "rural",
  name: "Northwood County",
  version: 1,
  units: "meters",
  bounds: { width: 5600, height: 2200 },
  nodes: [...spine, ...branchA.nodes, ...branchB.nodes, ...branchC.nodes, ...branchD.nodes, ...branchE.nodes],
  edges: [...spineEdges, ...branchA.edges, ...branchB.edges, ...branchC.edges, ...branchD.edges, ...branchE.edges],
  buildings: [
    // One hospital (the "rural" density) — deliberately Level IV trauma
    // only, no stroke center, NO STEMI receiving (many real rural hospitals
    // lack a cath lab). Northwood County Regional Airport (this map's own
    // Flight EMS station, added in the prior batch) is the honest answer
    // for a patient this hospital genuinely can't take — see hospitals.js's
    // chooseDestination for how that shows up as a real, not decorative,
    // consequence.
    { id: "county-general", type: "hospital", name: "Northwood County General", node: "r-hwy3",
      capabilities: ["trauma"], designations: { traumaLevel: 4 }, offset: { dx: 40, dy: -30 } },
    { id: "b-clinic1", type: "clinic", name: "Millbrook Community Clinic", node: "r-town", offset: { dx: -40, dy: 30 } },
    { id: "b-biz1", type: "business", name: "County Feed & Supply", node: "r-hwy1", offset: { dx: 30, dy: -40 } },
    { id: "b-biz2", type: "business", name: "Crossroads Gas & Diner", node: "r-hwy2", offset: { dx: -30, dy: 40 } },
    { id: "b-h1", type: "house", name: "Millbrook Farmhouse", node: "r-fa1", offset: { dx: 0, dy: 0 } },
    { id: "b-h2", type: "house", name: "End of Millbrook Farm Rd", node: "r-fa2", offset: { dx: 0, dy: 0 } },
    { id: "b-h3", type: "house", name: "Silo Rd Farmstead", node: "r-fb1", offset: { dx: 0, dy: 0 } },
    { id: "b-h4", type: "house", name: "End of Silo Rd", node: "r-fb2", offset: { dx: 0, dy: 0 } },
    { id: "b-h5", type: "house", name: "Quarry Rd House", node: "r-fc1", offset: { dx: 0, dy: 0 } },
    { id: "b-h6", type: "house", name: "Pinehollow Farmstead", node: "r-fd1", offset: { dx: 0, dy: 0 } },
    { id: "b-h7", type: "house", name: "End of Pinehollow Rd", node: "r-fd2", offset: { dx: 0, dy: 0 } },
    { id: "b-h8", type: "house", name: "Old Creek Rd House", node: "r-fe1", offset: { dx: 0, dy: 0 } },
    { id: "b-h9", type: "house", name: "Town Row House", node: "r-hwy4", offset: { dx: -30, dy: 40 } },
    { id: "b-h10", type: "house", name: "Route 9 Roadhouse", node: "r-hwy5", offset: { dx: 30, dy: -30 } },

    // Station buildings — "rural" density: exactly 1 of every department,
    // including the multi-substation ones (this is the map's one and only
    // station of each, so it must carry EVERY vehicle kind that department
    // owns — see maps.js's header/CLAUDE.md's plan for why this differs
    // from city/suburban, where a rarer kind concentrates at just one of
    // several stations instead) — EXCEPT the university, which is
    // urban-only (see SUBURBAN_MAP's own comment; a Campus PD dispatch here
    // falls back to the flat legacy station node instead of a dedicated
    // building). Most cluster at the small town (r-town, already the
    // general station); Sheriff/airport are spread to the county seat and
    // along the highway, matching real rural county-government/
    // infrastructure placement.
    { id: "fs1", type: "fireStation", name: "Millbrook Volunteer Fire Co.", department: "Fire Dept", node: "r-town", vehicles: { engine: 1, rescue: 1, ladder: 1, battalion: 1, squad: 1 }, offset: { dx: 40, dy: -30 } },
    { id: "es1", type: "emsStation", name: "Northwood County EMS — Millbrook Station", department: "County EMS", node: "r-town", vehicles: { ambALS: 1, criticalCare: 1, criticalCareChase: 1, supervisor: 1 }, offset: { dx: -40, dy: -30 } },
    { id: "pes1", type: "privateEmsStation", name: "Crosswind Medical Transport — County Depot", department: "Private EMS", node: "r-hwy2", vehicles: { ambBLS: 1 }, offset: { dx: 30, dy: -40 } },
    { id: "ps1", type: "policeStation", name: "Northwood County PD — Millbrook Station", department: "Police Dept", node: "r-town", vehicles: { pd: 1, pdMoto: 1, sergeant: 1 }, offset: { dx: 0, dy: 40 } },
    { id: "vs1", type: "volunteerStation", name: "Millbrook Volunteer Rescue Squad", department: "Volunteer Agency", node: "r-town", vehicles: { volunteer: 1, volBLS: 1 }, offset: { dx: 40, dy: 30 } },
    { id: "sheriff1", type: "sheriffOffice", name: "Northwood County Sheriff's Office", department: "Sheriff's Office", node: "r-hwy3", vehicles: { sheriff: 1 }, offset: { dx: -40, dy: 30 } },
    { id: "airport1", type: "airport", name: "Northwood County Regional Airport", department: "Flight EMS", node: "r-hwy5", vehicles: { flight: 1 }, offset: { dx: -30, dy: 30 } },
  ],
  station: "r-town",
};
for (const b of RURAL_MAP.buildings) {
  if (b.type === "house") { b.address = b.name; continue; } // already location-named (farmstead/road-end flavor)
  const node = RURAL_MAP.nodes.find((n) => n.id === b.node);
  b.address = node ? ruralAddress(RURAL_MAP, node) : b.name;
}

export const MAPS = { city: CITY_MAP, suburban: SUBURBAN_MAP, rural: RURAL_MAP };
export const MODE_DEFAULT_MAP = { city: "city", suburban: "suburban", rural: "rural" };

// Resolve which map a save should use — explicit g.mapId wins (unset for
// every save this batch produces), otherwise fall back through g.mode.
export function mapIdFor(g) {
  return g?.mapId || MODE_DEFAULT_MAP[g?.mode] || "suburban";
}
export function mapFor(g) {
  return MAPS[mapIdFor(g)] || SUBURBAN_MAP;
}
