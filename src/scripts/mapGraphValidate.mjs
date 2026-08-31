// mapGraphValidate.mjs — static analysis over src/data/maps.js, in the same
// spirit as scenarioSweep.mjs's field-presence checks: run whenever the 3
// maps are edited, before trusting them. Checks, per map:
//   - every edge's from/to references a real node id
//   - every building's node references a real node id
//   - every edge id is unique
//   - the declared `station` node exists
//   - the graph is fully connected FROM the station (BFS reachability) —
//     the check that actually catches a broken map, not just a typo
//   - a local/arterial edge missing its expected reverse pair is flagged as
//     a WARNING (a plausible copy-paste mistake), not an error, since a
//     future batch may intentionally author one-way streets
//   - every fleet.js department has at least one station building on the
//     map, and every vehicle kind that department owns is authored in at
//     least one station's `vehicles` object somewhere on the map — the
//     real regression guard against mapGraph.js's nearestStation() silently
//     falling back to a department-only (or the flat legacy map.station)
//     match because a kind was never actually assigned to any building.
//     Campus PD is a deliberate, documented exception to this one check —
//     see URBAN_ONLY_DEPARTMENTS below.
//
// Usage: node src/scripts/mapGraphValidate.mjs

import { MAPS } from "../data/maps.js";
import { DEPARTMENT_ORDER, DEPARTMENT_KINDS } from "../fleet.js";

// Campus PD (Northwood University) is intentionally urban-only — see
// CITY_MAP's own comment in maps.js — matching fleet.js's own
// MODES.city.units already being the only mode that lists "pso" among its
// responding units. Any map whose id is NOT in this set is expected to have
// zero Campus PD stations, not flagged as a coverage gap.
const URBAN_ONLY_DEPARTMENTS = { "Campus PD": new Set(["city"]) };

let errors = 0, warnings = 0;

function fail(msg) { console.error(`  FAIL  ${msg}`); errors++; }
function warn(msg) { console.warn(`  WARN  ${msg}`); warnings++; }
function pass(msg) { console.log(`  PASS  ${msg}`); }

for (const map of Object.values(MAPS)) {
  console.log(`\n=== ${map.id} (${map.name}) ===`);
  const nodeIds = new Set(map.nodes.map((n) => n.id));
  const edgeIds = new Set();

  let ok = true;
  for (const e of map.edges) {
    if (edgeIds.has(e.id)) { fail(`duplicate edge id "${e.id}"`); ok = false; }
    edgeIds.add(e.id);
    if (!nodeIds.has(e.from)) { fail(`edge "${e.id}" references missing node "${e.from}"`); ok = false; }
    if (!nodeIds.has(e.to)) { fail(`edge "${e.id}" references missing node "${e.to}"`); ok = false; }
  }
  if (ok) pass(`all ${map.edges.length} edges reference real, unique-id nodes`);

  let buildingsOk = true;
  for (const b of map.buildings) {
    if (!nodeIds.has(b.node)) { fail(`building "${b.id}" references missing node "${b.node}"`); buildingsOk = false; }
  }
  if (buildingsOk) pass(`all ${map.buildings.length} buildings reference real nodes`);

  if (!nodeIds.has(map.station)) fail(`station node "${map.station}" does not exist`);
  else pass(`station node "${map.station}" exists`);

  // Reachability from the station — plain BFS over the directed edge list.
  const adj = new Map();
  map.nodes.forEach((n) => adj.set(n.id, []));
  map.edges.forEach((e) => { if (adj.has(e.from)) adj.get(e.from).push(e.to); });
  const seen = new Set([map.station]);
  const queue = [map.station];
  while (queue.length) {
    const cur = queue.shift();
    for (const next of adj.get(cur) || []) {
      if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  const unreachableNodes = map.nodes.filter((n) => !seen.has(n.id));
  if (unreachableNodes.length) {
    fail(`${unreachableNodes.length} node(s) unreachable from station: ${unreachableNodes.map((n) => n.id).join(", ")}`);
  } else {
    pass(`all ${map.nodes.length} nodes reachable from station "${map.station}"`);
  }
  const unreachableBuildings = map.buildings.filter((b) => !seen.has(b.node));
  if (unreachableBuildings.length) {
    fail(`${unreachableBuildings.length} building(s) unreachable from station: ${unreachableBuildings.map((b) => b.id).join(", ")}`);
  } else {
    pass(`all ${map.buildings.length} buildings reachable from station`);
  }

  // Missing-reverse-pair warning — local/arterial edges are assumed two-way
  // unless a future batch intentionally authors a one-way street.
  let missingReverse = 0;
  for (const e of map.edges) {
    if (e.type === "highway") continue; // spine edges checked separately below only if needed
    const hasReverse = map.edges.some((r) => r.from === e.to && r.to === e.from);
    if (!hasReverse) { warn(`edge "${e.id}" (${e.name}) has no reverse pair — intentional one-way, or a typo?`); missingReverse++; }
  }
  if (!missingReverse) pass(`every local/arterial edge has a reverse pair`);

  // Every department must have at least one station, and every kind that
  // department owns must be authored on at least one of its stations —
  // otherwise nearestStation() would silently fall back to a
  // department-only or flat-legacy match for that kind, defeating the
  // whole point of per-station vehicle rosters.
  let deptOk = true, exemptCount = 0;
  for (const dep of DEPARTMENT_ORDER) {
    const restrictedTo = URBAN_ONLY_DEPARTMENTS[dep];
    if (restrictedTo && !restrictedTo.has(map.id)) {
      const stray = map.buildings.filter((b) => b.department === dep);
      if (stray.length) { fail(`department "${dep}" is restricted to ${[...restrictedTo].join("/")} but has ${stray.length} station(s) on "${map.id}" — remove them or update URBAN_ONLY_DEPARTMENTS`); deptOk = false; }
      else exemptCount++;
      continue;
    }
    const stations = map.buildings.filter((b) => b.department === dep);
    if (!stations.length) { fail(`department "${dep}" has no station building on this map`); deptOk = false; continue; }
    const coveredKinds = new Set(stations.flatMap((b) => Object.keys(b.vehicles || {})));
    for (const kind of DEPARTMENT_KINDS[dep] || []) {
      if (!coveredKinds.has(kind)) { fail(`department "${dep}"'s kind "${kind}" is not authored at any station on this map`); deptOk = false; }
    }
  }
  if (deptOk) pass(`all ${DEPARTMENT_ORDER.length - exemptCount} applicable departments have a station, every owned vehicle kind covered${exemptCount ? ` (${exemptCount} urban-only department(s) correctly absent here)` : ""}`);
}

console.log(`\n${errors} error(s), ${warnings} warning(s) across ${Object.keys(MAPS).length} maps.`);
if (errors) process.exit(1);
