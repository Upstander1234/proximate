import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { C, MONO } from "../theme.js";
import { edgesAtNode } from "../mapGraph.js";

// DrivingScene.jsx — full rewrite. Previous version was a RAIL: the car's
// position/heading were sampled off the precomputed route's own arc-length
// and tangent every frame, so turning "happened" automatically at every
// bend and the player's A/D only nudged a lateral offset inside the lane.
// Arrival was gated by a fixed timer (scope.js travelTimes()' `drive`
// value) completely disconnected from where the car actually was. This
// version fixes both, plus adds: full-screen presentation (App.jsx renders
// this as a fixed overlay now, not an embedded panel), real free
// {x,z,yaw,speed} physics the player actually steers, a live GPS HUD, a
// per-vehicle-type interior/capability table (bikes/golf carts have no
// siren), look-and-press (mouse-look + E) dash controls for siren/horn
// with a real Doppler-shifted tone and a distance-falloff "other cars pull
// over" mechanic, real cross-street geometry at real map intersections,
// real building/sidewalk placement from the actual map data instead of
// decorative scattering, and a real, punishing crash sequence.
//
// Primitive Three.js geometry throughout (boxes/cylinders/planes, flat
// materials) — matches every other 3D scene already in this codebase, no
// textured/asset models.
const CODE_TUNING = {
  1: { spawnEvery: 1.6, pedChance: .5, label: "ROUTINE — NO LIGHTS, NO SIREN" },
  2: { spawnEvery: 1.3, pedChance: .35, label: "URGENT — LIGHTS, INTERMITTENT SIREN" },
  3: { spawnEvery: 1.05, pedChance: .2, label: "EMERGENCY — FULL LIGHTS AND SIREN" },
};
// Per-vehicle-type profile — keyed off fleet.js's own KINDS[...].vehicle.type
// strings. hasSiren:false (bike/golf cart) means the pull-over mechanic has
// nothing to trigger — an honest consequence of the real vehicle, not a
// special case. maxSpeed in m/s, turnRate in rad/s at full lock at rest.
const VEHICLE_PROFILES = {
  // maxSpeed raised so a car on dry pavement can genuinely reach highway
  // speed (chase/pdcar/shercar top out just over 100mph at 45 m/s); GRAVEL_
  // TRACTION/WEATHER_TRACTION above are what actually keep that realistic —
  // the number below is the DRY-PAVEMENT ceiling, not what you get everywhere.
  als: { maxSpeed: 40, accel: 9.5, turnRate: 2.0, hasSiren: true, cockpit: "ambulance" },
  bls: { maxSpeed: 37, accel: 9.0, turnRate: 2.0, hasSiren: true, cockpit: "ambulance" },
  engine: { maxSpeed: 29, accel: 6.5, turnRate: 1.2, hasSiren: true, cockpit: "truck" },
  rescue: { maxSpeed: 29, accel: 6.5, turnRate: 1.2, hasSiren: true, cockpit: "truck" },
  ladder: { maxSpeed: 25, accel: 5.5, turnRate: 1.0, hasSiren: true, cockpit: "truck" },
  chase: { maxSpeed: 45, accel: 11.5, turnRate: 2.4, hasSiren: true, cockpit: "sedan" },
  suv: { maxSpeed: 43, accel: 10.5, turnRate: 2.3, hasSiren: true, cockpit: "sedan" },
  pdcar: { maxSpeed: 46, accel: 12.0, turnRate: 2.4, hasSiren: true, cockpit: "sedan" },
  shercar: { maxSpeed: 46, accel: 12.0, turnRate: 2.4, hasSiren: true, cockpit: "sedan" },
  pickup: { maxSpeed: 40, accel: 9.0, turnRate: 1.8, hasSiren: false, cockpit: "sedan" },
  motorcycle: { maxSpeed: 48, accel: 13.5, turnRate: 3.0, hasSiren: true, cockpit: "moto" },
  bike: { maxSpeed: 9, accel: 3.2, turnRate: 3.4, hasSiren: false, cockpit: "bike" },
  golfcart: { maxSpeed: 11, accel: 3.6, turnRate: 2.6, hasSiren: false, cockpit: "cart" },
};
const DEFAULT_PROFILE = { maxSpeed: 24, accel: 7.5, turnRate: 2.0, hasSiren: true, cockpit: "sedan" };
// Item 1 (stretch goal) — real CC0 vehicle meshes (Kenney's Car Kit,
// public/models/vehicles/README.md has the full source/license note).
// Keyed by vehType first (a specific model beats a generic fallback), then
// by cockpit for any vehType the pack has no dedicated model for.
const VEHICLE_MODEL_URL = {
  als: "ambulance.glb", bls: "ambulance.glb",
  // engine/rescue/ladder used to all share one firetruck.glb — now three
  // real, visually distinct models (public/models/vehicles/README.md has
  // the full sourcing note): engine keeps the original Kenney pumper,
  // rescue gets a van (a heavy-rescue squad is commonly a walk-in box
  // van/truck, not a pumper), ladder gets the elongated truck-with-trailer
  // model as the visually "biggest" of the three.
  engine: "firetruck.glb", rescue: "rescue-van.glb", ladder: "firetruck-ladder.glb",
  // pdcar/shercar/chase likewise used to all share one police.glb — chase
  // (pursuit-rated) gets the muscle-car variant, shercar (Sheriff) gets the
  // SUV variant, pdcar keeps the original Kenney sedan.
  pdcar: "police.glb", shercar: "police-suv.glb", chase: "police-chase.glb",
  suv: "suv.glb", pickup: "truck.glb",
  // bike (pso/Campus PD's bike patrol) — a real e-bike, the literal match
  // for that vehType (see README's ebike.glb section). motorcycle — a real
  // CC0 motorcycle (OpenGameArt "Fancy Motorcycle"). golfcart — a real
  // golf-cart mesh, closing the last of the three vehTypes that used to
  // fall through to the primitive box.
  bike: "ebike.glb", motorcycle: "motorcycle.glb", golfcart: "golfcart.glb",
};
const VEHICLE_MODEL_URL_BY_COCKPIT = { ambulance: "ambulance.glb", truck: "firetruck.glb", sedan: "sedan.glb" };
// Item 7 (stretch goal) — real rigged CC0 pedestrian meshes (Kenney's
// Blocky Characters, public/models/people/README.md). Six variants for
// spawn-time variety; loaded once at mount, cloned per spawned pedestrian.
const PED_MODEL_FILES = ["character-a.glb", "character-b.glb", "character-c.glb", "character-d.glb", "character-e.glb", "character-f.glb"];
// Traffic obstacle cars used to always be a plain colored box (carGeo/
// carMat below) even though real sedan/SUV/pickup meshes were already
// shipped for the player's own vehicle (VEHICLE_MODEL_URL above, same
// public/models/vehicles/ folder) — reused here for ordinary road traffic
// via the identical load-once/clone-many idiom PED_MODEL_FILES already
// uses, not a new asset. police-sedan2/suv2/ambulance2 give real visual
// variety beyond the three base civilian types.
const TRAFFIC_CAR_MODEL_FILES = ["sedan.glb", "suv.glb", "truck.glb", "police-sedan2.glb", "suv2.glb"];
// Real CC0 building meshes (Kenney City Kit Commercial,
// public/models/buildings/README.md) — one per map building `type`. Chosen
// for rough silhouette fit against each type's own existing box size below,
// not a precise match (no hospital/school-specific model exists in this
// pack) — the goal is real architectural detail (windows, awnings, roofline)
// replacing a flat box, not a literal building-type match.
const BUILDING_MODEL_URL = {
  hospital: "building-skyscraper-a.glb",
  clinic: "building-c.glb",
  school: "building-e.glb",
  business: "building-b.glb",
  house: "building-d.glb",
  // cityHall reuses the same office-block mesh as `business` (no dedicated
  // civic/government model exists in this pack) at a taller size below — a
  // plausible mid-rise civic reading without sourcing a new asset.
  // skyscraper is the map-expansion content pass's real answer to "does the
  // city have skyscrapers" — `building-skyscraper-c.glb` was a spare,
  // previously-unused second skyscraper mesh already sitting in this folder
  // (see the buildings README), now given a real consumer distinct from
  // the hospital's own `-a` skyscraper.
  cityHall: "building-b.glb",
  skyscraper: "building-skyscraper-c.glb",
  // Campus buildout — reuses existing pack meshes by rough silhouette fit,
  // same reasoning as every other type above: no dedicated collegiate model
  // exists in this pack, so the real distinction is size/material (sizeFor/
  // bMats), not a bespoke mesh.
  university: "building-b.glb",
  universityLibrary: "building-c.glb",
  universityUnion: "building-b.glb",
  universityScience: "building-e.glb",
  universityDining: "building-d.glb",
  // Reuses the skyscraper silhouette at a much smaller sizeFor footprint —
  // no dedicated low/mid-rise apartment block model exists in this pack,
  // and a skyscraper's real massing (a plain vertical block) is a closer
  // match for a 2-story walk-up than any of the low, wide house/business
  // meshes would be.
  apartment: "building-skyscraper-a.glb",
  default: "building-a.glb",
};
// Real CC0 trees (Kenney Nature Kit, public/models/nature/README.md) —
// roadside decoration only, cosmetic, not collidable.
const TREE_MODEL_FILES = ["tree_default.glb", "tree_oak.glb", "tree_pineTallA.glb", "tree_thin.glb"];
// Real CC0 street props (Kenney City Kit Roads, public/models/props/README.md)
// — streetlights scattered along the sidewalk edge, cosmetic/not collidable,
// same no-fallback reasoning as trees above.
const STREETLIGHT_MODEL_FILES = ["light-curved.glb", "light-square.glb"];
const CODE_SPEED_MULT = { 1: 0.72, 2: 0.9, 3: 1.15 };
const BRAKE = 13, DRAG = 4.5;
// Damped steering-velocity model (the smoothing fix) — A/D accelerate a
// steerVel toward a per-vehicle max rate rather than snapping the yaw
// directly, and it decays back toward 0 on release, the same shape the
// pre-rewrite rail version used for its own lateral steering, carried over
// to real heading control this time.
const STEER_ACCEL = 3.6, STEER_DAMP = 7.5;
// Board/exit stages — a real "walk up to the rig, get in with your
// partner" beat bookending the drive, and a real "get out" on arrival
// instead of an instant cut.
const BOARD_WALK_SPEED = 3.2, BOARD_TURN_SPEED = 2.3, BOARD_DOOR_RADIUS = 2.4;
const PARTNER_BOARD_SECONDS = 2.6;
const ROAD_HALF = 5.4, SIDEWALK_W = 2.4;
const CAR_HALF_W = 0.95;
const DASH_SPACING = 6;
const OBSTACLE_AHEAD = 90, OBSTACLE_BEHIND = 12;
const FALLBACK_ROUTE_LEN = 2400;
const ARRIVE_RADIUS = 14;
const BUILDING_RANGE = 140;
const LOOK_YAW_MAX = 1.0, LOOK_PITCH_MAX = 0.5;
// A major crash (siren/lights don't help you here) freezes input, fades to
// black, and hands off to App.jsx's own hospital-VN beat via onCrash — a
// minor clip (low speed, or a pothole) stays a soft speed penalty.
const MAJOR_CRASH_SPEED = 8;
const DRIVE_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);

function tierMultipliers(mapId) {
  // Real per-map variety (CLAUDE.md item 8) — rural reads genuinely sparser
  // and less trafficked than urban, driven by which real map this is
  // (App.jsx's mapFor(g).id — "city"/"suburban"/"rural", the same ids
  // MODES already uses) rather than one fixed look reused everywhere.
  // `fillerSpacing`/`skyscraperChance` (below) drive the procedural
  // background-building infill: 0 spacing means "no filler at all," which
  // is the correct, honest look for rural (real rural roads don't have a
  // wall of buildings behind the ones that are actually there) rather than
  // an oversight.
  if (mapId === "rural") return { obstacleMult: 0.35, buildingRange: 90, fillerSpacing: 0, skyscraperChance: 0 };
  if (mapId === "suburban") return { obstacleMult: 0.65, buildingRange: 115, fillerSpacing: 26, skyscraperChance: 0 };
  return { obstacleMult: 1, buildingRange: BUILDING_RANGE, fillerSpacing: 15, skyscraperChance: 0.12 };
}

// Real road width by the underlying map edge's own real `type`
// ("highway"/"arterial"/"local", src/data/maps.js) — a multiplier on
// ROAD_HALF, not a new constant per type, so a 55mph county highway reads
// visibly wider than a 25mph residential street instead of every road in
// the game sharing one flat width. `local` (and any unresolved edge) stays
// at the current, unchanged 1.0.
const WIDTH_BY_TYPE = { highway: 1.5, arterial: 1.2 };
// Shared traffic-light cycle length, hoisted to module scope (not a local
// inside the render loop) specifically so the visual pole color and the
// obstacle-gating "is this red" check below can never drift apart — both
// read this exact constant, not two independently-tuned copies.
const LIGHT_CYCLE = 16; // seconds: 8 green / 8 red, per axis
// Deterministic per-node phase offset (NOT Math.random() — must be stable
// across re-renders/HMR) so real intersections aren't all synchronized on
// one city-wide clock, which would look artificial. A cheap string hash,
// not cryptographic — only needs to spread node ids across [0, LIGHT_CYCLE).
function hashOffset(nodeId) {
  let h = 0;
  for (let i = 0; i < nodeId.length; i++) h = (h * 31 + nodeId.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000 * LIGHT_CYCLE;
}

// Weather/time-of-day -> ambient sky color, fog color/distance, sun
// intensity and road-surface tuning. Read once at mount (this component is
// already "fixed for one call's whole life," same as vehType/map/route) —
// not reactive to a mid-drive weather change, matching that convention.
const WEATHER_LOOK = {
  clear: { sky: "#0c1114", fogNear: 40, fogFar: 220, sun: 0.8, roadRough: 0.95, roadColor: "#262E33" },
  rain: { sky: "#0a0d10", fogNear: 26, fogFar: 130, sun: 0.5, roadRough: 0.25, roadColor: "#161a1d" },
  fog: { sky: "#171c1f", fogNear: 14, fogFar: 70, sun: 0.4, roadRough: 0.9, roadColor: "#262E33" },
  snow: { sky: "#1a2024", fogNear: 30, fogFar: 150, sun: 0.7, roadRough: 0.7, roadColor: "#3a4249" },
};
// Real, if simple, road-condition friction: multiplies both effective top
// speed and acceleration. Gravel is the dominant factor (a real, mapped
// surface type — src/data/maps.js's edge.surface — not decorative), weather
// stacks on top of whatever surface the car is currently on. 1.0 = full dry
// pavement grip.
const GRAVEL_TRACTION = 0.55;
const WEATHER_TRACTION = { clear: 1, rain: 0.82, fog: 0.93, snow: 0.58 };
const TOD_LOOK = { day: { hemi: 0.9, sunCol: "#fff2d8" }, dawn: { hemi: 0.55, sunCol: "#f2a878" }, dusk: { hemi: 0.5, sunCol: "#d87858" }, night: { hemi: 0.22, sunCol: "#5a6a8c" } };

export default function DrivingScene({ code, vehType, vehName, map, paused, isDriver = true, driverName, sharedDrive, onFinish, onBroadcast, onCrash, route, mode = "drive", onOpenBoard, weather = "clear", timeOfDay = "day" }) {
  // mode: "drive" (default, unchanged station->board->drive->exit flow used
  // during response/approach) or "station" — a separate, self-contained
  // mount used during the pre-dispatch "station" phase: the player spawns
  // INSIDE the station room, can walk out to a small yard with a few
  // enterable ambient buildings, and interacts with a wall-mounted
  // whiteboard (E) to open the real call-picker UI (onOpenBoard) as an
  // overlay — no vehicle, no route, no drive physics in this mode.
  const codeTuning = CODE_TUNING[code] || CODE_TUNING[2];
  const profile = VEHICLE_PROFILES[vehType] || DEFAULT_PROFILE;
  const speedMult = CODE_SPEED_MULT[code] || 1;
  const maxSpeed = profile.maxSpeed * speedMult;
  const mountRef = useRef(null);
  const minimapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });
  const [hud, setHud] = useState({ mph: 0, crashes: 0, curbHits: 0, bearing: 0, dist: 0, arrived: false, sirenOn: false, lookPrompt: null, boardPrompt: null, stage: "board" });
  const [fade, setFade] = useState(0);
  const keysRef = useRef(new Set());
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  const sharedRef = useRef(sharedDrive);
  useEffect(() => { sharedRef.current = sharedDrive; }, [sharedDrive]);
  const isDriverRef = useRef(isDriver);
  useEffect(() => { isDriverRef.current = isDriver; }, [isDriver]);
  const mouseRef = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    // Weather/time-of-day look, read once at mount (item 1/3 of the
    // realism pass) — real values, not guesses: falls back to "clear"/"day"
    // for any weather string this table doesn't recognize.
    const look = WEATHER_LOOK[weather] || WEATHER_LOOK.clear;
    const todLook = TOD_LOOK[timeOfDay] || TOD_LOOK.day;

    const scene = new THREE.Scene();
    // Real loading gate (driving-mode root-cause pass): previously `ready`
    // flipped true synchronously right after the first requestAnimationFrame
    // was scheduled — before a single GLTF had actually loaded — so the
    // "Loading scene…" text vanished almost instantly regardless of asset
    // state and WASD/E input worked immediately against a scene that was
    // still mostly boxes-with-no-model. Every GLTFLoader.load() call in
    // this component runs through this ONE shared manager now, so
    // onLoad/onProgress reflect every real asset this mount actually
    // queued (buildings, trees, streetlights, pedestrians, the vehicle),
    // not a guess.
    const loadingManager = new THREE.LoadingManager();
    let queuedAnyLoad = false;
    loadingManager.onStart = () => { queuedAnyLoad = true; };
    loadingManager.onProgress = (url, loaded, total) => { setLoadProgress({ loaded, total }); };
    loadingManager.onError = () => { /* individual load failures already have a real fallback box per-asset below; onLoad still fires once every attempt (success or fail) resolves */ };
    const gltfLoader = new GLTFLoader(loadingManager);
    scene.background = new THREE.Color(look.sky);
    scene.fog = new THREE.Fog(look.sky, look.fogNear, look.fogFar);
    const camera = new THREE.PerspectiveCamera(68, el.clientWidth / (el.clientHeight || window.innerHeight), 0.1, 500);
    const CAM_Y = 1.15;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(el.clientWidth, el.clientHeight || window.innerHeight);
    // Item 1 — a real tone-mapping/color pipeline instead of raw linear
    // output: ACES filmic response (the standard "real camera" curve) plus
    // sRGB output, so bright surfaces (siren strobes, headlights) roll off
    // instead of clipping to flat white.
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = timeOfDay === "night" ? 1.15 : 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight("#8fb0c8", "#20242a", todLook.hemi));
    const sun = new THREE.DirectionalLight(todLook.sunCol, look.sun);
    sun.position.set(-30, 60, -20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 10; sun.shadow.camera.far = 220;
    sun.shadow.camera.left = -120; sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120; sun.shadow.camera.bottom = -120;
    sun.shadow.bias = -0.0015;
    scene.add(sun);

    // Everything "outside" (road, sidewalks, buildings, obstacles, the
    // parked vehicle) lives in one group so entering a building interior
    // can hide the whole outdoor world with one flag instead of tracking
    // every mesh individually — the same "swap which group is visible"
    // idiom used for interior rooms below.
    const outdoorGroup = new THREE.Group();
    scene.add(outdoorGroup);

    const tier = tierMultipliers(map?.id);
    const isStationMode = mode === "station";

    // --- Real route -> waypoints (relative to the first point) ----------
    const rawWp = route && route.length >= 2 ? route : null;
    const wp = rawWp
      ? rawWp.map((p) => ({ x: p.x - rawWp[0].x, z: -(p.y - rawWp[0].y) }))
      : [{ x: 0, z: 0 }, { x: 0, z: -FALLBACK_ROUTE_LEN }];
    const originWorld = rawWp ? rawWp[0] : null;

    const segs = [];
    let cum = 0;
    for (let i = 0; i < wp.length - 1; i++) {
      const a = wp[i], b = wp[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 0.001;
      const fx = dx / len, fz = dz / len;
      segs.push({ a, b, len, start: cum, fx, fz, rx: -fz, rz: fx });
      cum += len;
    }
    const totalLen = cum;
    const destPoint = wp[wp.length - 1];

    function sampleRoute(arc) {
      const a = Math.max(0, Math.min(totalLen, arc));
      let seg = segs[segs.length - 1];
      for (const s of segs) { if (a <= s.start + s.len) { seg = s; break; } }
      const t = seg.len > 0 ? (a - seg.start) / seg.len : 0;
      return {
        x: seg.a.x + (seg.b.x - seg.a.x) * t,
        z: seg.a.z + (seg.b.z - seg.a.z) * t,
        fx: seg.fx, fz: seg.fz, rx: seg.rx, rz: seg.rz,
      };
    }
    const yawFor = (fx, fz) => Math.atan2(-fx, -fz);

    // Board-stage geometry: the vehicle is parked just off the route's own
    // start point so it reads as distinct from the road itself, not
    // overlapping it. Player starts a short walk away; the partner NPC
    // starts on the opposite side and converges on the passenger door over
    // a fixed, deterministic duration (no pathfinding needed -- there's
    // only ever one destination). Declared here (ahead of the static
    // geometry below, which reads them) rather than near S's own
    // declaration further down, to avoid a temporal-dead-zone reference.
    const vehiclePos = { x: -9, z: 4 };
    const driverDoor = { x: vehiclePos.x + 1.1, z: vehiclePos.z + 0.2 };
    const passengerDoor = { x: vehiclePos.x - 1.1, z: vehiclePos.z + 0.2 };
    // Spawn FACING the driver door, not a fixed compass yaw — the on-screen
    // prompt says "W forward ... walk to the rig," so forward has to
    // actually point at it. A fixed yaw=0 here meant a player walking
    // straight forward as instructed would walk parallel to (or away from)
    // the vehicle whenever its real offset from spawn wasn't pure -z,
    // leaving them stranded in the dark street with the rig never in view
    // and no way to tell why "W" isn't working — confirmed live before this
    // fix (see the driving-mode root-cause pass this shipped under).
    const boardSpawn = { x: driverDoor.x + 6, z: driverDoor.z + 3 };
    // fx=-sin(yaw), fz=-cos(yaw) is this file's own forward-vector
    // convention (used throughout the board-stage walk loop below) — solve
    // it for the yaw whose forward vector points from spawn at the door.
    const boardYaw = Math.atan2(-(driverDoor.x - boardSpawn.x), -(driverDoor.z - boardSpawn.z));
    const P = { x: boardSpawn.x, z: boardSpawn.z, yaw: boardYaw };
    const partner = { x: passengerDoor.x - 5, z: passengerDoor.z - 4, t: 0, boarded: false };

    // --- Static route geometry (road, shoulder, sidewalk, dashes) --------
    // Item 3 — road material responds to the resolved weather look above:
    // rain/wet roads read darker and shinier (low roughness fakes a wet
    // specular response without a real reflection probe), snow reads
    // lighter/desaturated, clear/fog stay the original matte asphalt.
    const roadMat = new THREE.MeshStandardMaterial({ color: look.roadColor, roughness: look.roadRough, metalness: weather === "rain" ? 0.15 : 0 });
    const gravelMat = new THREE.MeshStandardMaterial({ color: "#4a4032" });
    const shoulderMat = new THREE.MeshStandardMaterial({ color: "#16211a" });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: "#4a4f54" });
    const edgeMat = new THREE.MeshBasicMaterial({ color: "#F2A33C" });
    const dashMat = new THREE.MeshBasicMaterial({ color: "#E8C24A" });
    const dashGeo = new THREE.PlaneGeometry(0.18, 2.4);
    // Real map edge lookup per segment — matches a segment's own midpoint
    // to its nearest real map edge (the route's own waypoints don't carry
    // per-edge type/surface today), the same nearest-midpoint idiom this
    // file already used for gravel-surface detection, now also driving
    // per-segment road WIDTH (a highway/arterial edge renders wider than a
    // local street — see WIDTH_BY_TYPE, module scope). No distance
    // threshold, matching the existing gravel lookup's own precedent: in
    // practice every real route segment corresponds to an actual map edge.
    function nearestMapEdge(seg) {
      if (!map?.edges || !originWorld) return null;
      const midWx = originWorld.x + (seg.a.x + seg.b.x) / 2, midWy = originWorld.y - (seg.a.z + seg.b.z) / 2;
      let best = null, bestD = Infinity;
      for (const e of map.edges) {
        const a = map.nodes.find((n) => n.id === e.from), b = map.nodes.find((n) => n.id === e.to);
        if (!a || !b) continue;
        const emx = (a.x + b.x) / 2, emy = (a.y + b.y) / 2;
        const d = Math.hypot(midWx - emx, midWy - emy);
        if (d < bestD) { bestD = d; best = e; }
      }
      return best;
    }
    for (const s of segs) {
      const edge = nearestMapEdge(s);
      s.gravel = edge?.surface === "gravel";
      s.halfW = edge ? ROAD_HALF * (WIDTH_BY_TYPE[edge.type] || 1) : ROAD_HALF; // fallback: today's flat constant
    }

    // --- Intersection/corner pads -----------------------------------------
    // Every route segment used to render as an independent rectangle with a
    // square-cut end — fine for a straight pass-through, but the city map
    // is a dense grid where almost every waypoint is a real 3-4 way
    // intersection, so nearly every turn showed a gap (outside the turn)
    // and an overlap (inside it). A "pad" is a single joined footprint at
    // any waypoint that's either a real turn or has real cross-street
    // edges — every connecting road/stub is trimmed to stop at the pad's
    // edge instead of running into the node center, which is what actually
    // removes the gap/overlap and joins a cross street to the main road.
    // Built BEFORE the road-mesh loop below, since that loop needs to know
    // each segment's own trim amount at both ends. Skipped for a plain
    // straight pass-through node (no turn, no cross street) — those
    // segments already join cleanly with no correction needed.
    const pads = new Map(); // waypointIndex -> {x,z,radius,touching,routeDir,crossDir,nodeId,arc}
    if (!isStationMode) for (let i = 0; i < wp.length; i++) {
      const nodeId = rawWp?.[i]?.nodeId;
      const incoming = segs[i - 1], outgoing = segs[i];
      const isTurn = !!(incoming && outgoing) && (incoming.fx * outgoing.fx + incoming.fz * outgoing.fz) < 0.999;
      // Real cross-street edges at this node — only ones that lead
      // somewhere NOT already the route's own immediate neighbor in either
      // direction (a genuine extra street, not the road the route itself
      // is already drawing).
      let touching = [];
      if (nodeId && map) {
        touching = edgesAtNode(map, nodeId).filter((e) => {
          const other = e.from === nodeId ? e.to : e.from;
          const prevNode = rawWp[i - 1]?.nodeId, nextNode = rawWp[i + 1]?.nodeId;
          return other !== prevNode && other !== nextNode;
        });
      }
      if (!isTurn && !touching.length) continue; // plain pass-through — nothing to fix here
      let radius = Math.max(incoming?.halfW ?? ROAD_HALF, outgoing?.halfW ?? ROAD_HALF);
      let crossDir = null;
      if (touching.length && map) {
        const firstOther = map.nodes.find((n) => n.id === (touching[0].from === nodeId ? touching[0].to : touching[0].from));
        if (firstOther) {
          const dx0 = firstOther.x - rawWp[i].x, dy0 = firstOther.y - rawWp[i].y;
          const len0 = Math.hypot(dx0, dy0) || 1;
          crossDir = { fx: dx0 / len0, fz: -dy0 / len0 };
        }
        for (const e of touching) radius = Math.max(radius, ROAD_HALF * (WIDTH_BY_TYPE[e.type] || 1));
      }
      radius += 0.6; // small overlap margin so trimmed roads meet the pad, not a hairline seam
      const routeDir = outgoing ? { fx: outgoing.fx, fz: outgoing.fz } : (incoming ? { fx: incoming.fx, fz: incoming.fz } : { fx: 0, fz: -1 });
      pads.set(i, { x: wp[i].x, z: wp[i].z, radius, touching, routeDir, crossDir, nodeId, arc: outgoing ? outgoing.start : totalLen });
    }

    // Roadside trees (stretch goal, real CC0 meshes) — cosmetic only, not
    // collidable, no primitive fallback needed since a failed load just
    // means no tree at that spot rather than a functional regression.
    // Positions are collected here (synchronous, at segment-build time) and
    // placed once the async model loads, below.
    const treeSpots = [];
    // Streetlight spots — coarser spacing than trees (~1 per 40m per side),
    // right at the sidewalk's outer edge rather than the shoulder, so poles
    // read as street furniture rather than roadside greenery.
    const lightSpots = [];
    // Real traffic lights, built per signalized pad further down (a
    // "signalized" pad is one with real cross-street edges — a plain
    // corner turn gets a pad but no signal). Each entry is one LENS PAIR
    // (one of 4 poles per signalized intersection — 2 governing the route
    // axis, 2 the cross axis), read every frame in the render loop below.
    const trafficLights = []; // {red, green, axis: "route"|"cross", cycleOffset}
    // One entry per SIGNALIZED intersection (not per pole) — the small,
    // arc-sorted list the per-frame obstacle-braking check below scans to
    // find the next red light ahead of a given traffic obstacle.
    const signalArcList = []; // {arc, cycleOffset, stopArc}
    const MIN_SPAN = 1; // floor on a trimmed segment's rendered length, for two pads on a very short block
    if (!isStationMode) for (let k = 0; k < segs.length; k++) {
      const s = segs[k];
      let ts = pads.get(k)?.radius ?? 0, te = pads.get(k + 1)?.radius ?? 0;
      if (s.len - ts - te < MIN_SPAN) {
        // Two pads closer together than their combined radii (a very short
        // block) — scale BOTH trims down proportionally rather than let the
        // rendered span go zero/negative.
        const totalTrim = ts + te, allowed = Math.max(0, s.len - MIN_SPAN);
        const scale = totalTrim > 0 ? allowed / totalTrim : 0;
        ts *= scale; te *= scale;
      }
      const spanLen = Math.max(MIN_SPAN, s.len - ts - te);
      const spanFrac = (ts + spanLen / 2) / s.len;
      const midX = s.a.x + (s.b.x - s.a.x) * spanFrac, midZ = s.a.z + (s.b.z - s.a.z) * spanFrac;
      const yaw = yawFor(s.fx, s.fz);
      const isGravel = s.gravel;
      const road = new THREE.Mesh(new THREE.PlaneGeometry(s.halfW * 2, spanLen), isGravel ? gravelMat : roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
      road.position.set(midX, 0, midZ);
      road.receiveShadow = true;
      outdoorGroup.add(road);
      for (const side of [-1, 1]) {
        const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(SIDEWALK_W, spanLen), sidewalkMat);
        sidewalk.rotation.x = -Math.PI / 2;
        sidewalk.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
        sidewalk.position.set(midX + s.rx * (s.halfW + SIDEWALK_W / 2) * side, 0.005, midZ + s.rz * (s.halfW + SIDEWALK_W / 2) * side);
        outdoorGroup.add(sidewalk);
        const shoulder = new THREE.Mesh(new THREE.PlaneGeometry(20, spanLen), shoulderMat);
        shoulder.rotation.x = -Math.PI / 2;
        shoulder.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
        shoulder.position.set(midX + s.rx * (s.halfW + SIDEWALK_W + 10) * side, -0.01, midZ + s.rz * (s.halfW + SIDEWALK_W + 10) * side);
        outdoorGroup.add(shoulder);
        if (!isGravel) {
          const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.16, spanLen), edgeMat);
          edge.rotation.x = -Math.PI / 2;
          edge.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
          edge.position.set(midX + s.rx * (s.halfW - 0.15) * side, 0.01, midZ + s.rz * (s.halfW - 0.15) * side);
          outdoorGroup.add(edge);
        }
        // A sparse, deterministic-per-segment tree spot beyond the sidewalk
        // (not on it), roughly every ~14m of segment length per side —
        // dense enough to read as roadside greenery, sparse enough not to
        // clutter the shoulder area buildings/obstacles also use. Uses the
        // segment's FULL length/endpoints (not the pad-trimmed span) —
        // trees sit well outside the road/pad footprint regardless.
        const spotCount = Math.max(1, Math.floor(s.len / 14));
        for (let i = 0; i < spotCount; i++) {
          const t = (i + 0.5) / spotCount;
          const px = s.a.x + (s.b.x - s.a.x) * t + s.rx * (s.halfW + SIDEWALK_W + 2) * side;
          const pz = s.a.z + (s.b.z - s.a.z) * t + s.rz * (s.halfW + SIDEWALK_W + 2) * side;
          treeSpots.push({ x: px, z: pz });
        }
        const lightCount = Math.max(1, Math.floor(s.len / 40));
        for (let i = 0; i < lightCount; i++) {
          const t = (i + 0.5) / lightCount;
          const px = s.a.x + (s.b.x - s.a.x) * t + s.rx * (s.halfW + SIDEWALK_W + 0.3) * side;
          const pz = s.a.z + (s.b.z - s.a.z) * t + s.rz * (s.halfW + SIDEWALK_W + 0.3) * side;
          lightSpots.push({ x: px, z: pz, yaw });
        }
      }
      if (!isGravel) {
        // Dashes only span the TRIMMED sub-span, so lane markings stop
        // short of an intersection instead of painting straight through it
        // — falls out of the same trim math as the road plane above, for
        // free.
        const dashCount = Math.max(0, Math.floor(spanLen / DASH_SPACING));
        for (let i = 0; i < dashCount; i++) {
          const arcT = ts + (i + 0.5) * (spanLen / dashCount);
          const frac = arcT / s.len;
          const px = s.a.x + (s.b.x - s.a.x) * frac;
          const pz = s.a.z + (s.b.z - s.a.z) * frac;
          const m = new THREE.Mesh(dashGeo, dashMat);
          m.rotation.x = -Math.PI / 2;
          m.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
          m.position.set(px, 0.01, pz);
          outdoorGroup.add(m);
        }
      }
    }
    // Load each tree variety once; on success, place it at every 4th spot
    // (offset by the variety's own index) so the 4 real varieties alternate
    // along the route rather than one repeating model. A failed/slow load
    // for one variety just skips its own spots — cosmetic, not blocking.
    TREE_MODEL_FILES.forEach((file, vi) => {
      gltfLoader.load(`${import.meta.env.BASE_URL}models/nature/${file}`, (gltf) => {
        for (let i = vi; i < treeSpots.length; i += TREE_MODEL_FILES.length) {
          const spot = treeSpots[i];
          const model = gltf.scene.clone();
          model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
          model.rotation.y = Math.random() * Math.PI * 2;
          model.position.set(spot.x, 0, spot.z);
          outdoorGroup.add(model);
        }
      }, undefined, () => { /* variety failed to load — its spots just stay empty */ });
    });
    // Same alternating-variety placement as trees, oriented to face the road
    // (yaw captured per spot above) rather than a random rotation, since a
    // streetlight pole reads wrong facing an arbitrary direction.
    STREETLIGHT_MODEL_FILES.forEach((file, vi) => {
      gltfLoader.load(`${import.meta.env.BASE_URL}models/props/${file}`, (gltf) => {
        for (let i = vi; i < lightSpots.length; i += STREETLIGHT_MODEL_FILES.length) {
          const spot = lightSpots[i];
          const model = gltf.scene.clone();
          model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
          model.rotation.y = spot.yaw;
          model.position.set(spot.x, 0, spot.z);
          outdoorGroup.add(model);
        }
      }, undefined, () => { /* variety failed to load — its spots just stay empty */ });
    });

    // --- Pad meshes, cross-street stubs, crosswalks, sidewalk corner fill,
    // and (for signalized pads) real traffic-light poles on both axes -----
    for (const [padIdx, pad] of pads) {
      const padMesh = new THREE.Mesh(new THREE.PlaneGeometry(pad.radius * 2, pad.radius * 2), roadMat);
      padMesh.rotation.x = -Math.PI / 2;
      padMesh.position.set(pad.x, 0.001, pad.z);
      padMesh.receiveShadow = true;
      outdoorGroup.add(padMesh);

      // Cross-street stubs, trimmed to start at the pad's own edge instead
      // of the node center — this is what actually joins a cross street to
      // the pad rather than overlapping raw pavement through it.
      for (const e of pad.touching) {
        const otherId = e.from === pad.nodeId ? e.to : e.from;
        const otherNode = map.nodes.find((n) => n.id === otherId);
        if (!otherNode) continue;
        const dirX = otherNode.x - rawWp[padIdx].x, dirY = otherNode.y - rawWp[padIdx].y;
        const len = Math.hypot(dirX, dirY) || 1;
        const ux = dirX / len, uz = -dirY / len;
        const stubHalfW = ROAD_HALF * (WIDTH_BY_TYPE[e.type] || 1);
        const fullStubLen = Math.min(40, len);
        const stubLen = Math.max(1, fullStubLen - pad.radius);
        const startArc = pad.radius;
        const mid = { x: pad.x + ux * (startArc + stubLen / 2), z: pad.z + uz * (startArc + stubLen / 2) };
        const stub = new THREE.Mesh(new THREE.PlaneGeometry(stubHalfW * 2, stubLen), e.surface === "gravel" ? gravelMat : roadMat);
        stub.rotation.x = -Math.PI / 2;
        stub.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yawFor(ux, uz));
        stub.position.set(mid.x, 0.002, mid.z);
        outdoorGroup.add(stub);
      }

      // Crosswalk stripes — a short row of stripes (reusing the existing
      // lane-dash geometry/material, elongated along travel direction, the
      // same as an ordinary dash) spaced laterally across each connecting
      // road, painted just outside the pad edge.
      const addCrosswalk = (dirX, dirZ, halfWidth) => {
        const yaw = yawFor(dirX, dirZ);
        const rx = -dirZ, rz = dirX;
        const arcOut = pad.radius + 0.4;
        const stripeCount = Math.max(3, Math.floor((halfWidth * 2) / 1.0));
        for (let kk = 0; kk < stripeCount; kk++) {
          const lat = ((kk + 0.5) / stripeCount - 0.5) * halfWidth * 2;
          const stripe = new THREE.Mesh(dashGeo, dashMat);
          stripe.rotation.x = -Math.PI / 2;
          stripe.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
          stripe.position.set(pad.x + dirX * arcOut + rx * lat, 0.012, pad.z + dirZ * arcOut + rz * lat);
          outdoorGroup.add(stripe);
        }
      };
      const incoming = segs[padIdx - 1], outgoing = segs[padIdx];
      if (outgoing) addCrosswalk(outgoing.fx, outgoing.fz, outgoing.halfW);
      if (incoming) addCrosswalk(-incoming.fx, -incoming.fz, incoming.halfW);
      for (const e of pad.touching) {
        const otherId = e.from === pad.nodeId ? e.to : e.from;
        const otherNode = map.nodes.find((n) => n.id === otherId);
        if (!otherNode) continue;
        const dirX = otherNode.x - rawWp[padIdx].x, dirY = otherNode.y - rawWp[padIdx].y;
        const len = Math.hypot(dirX, dirY) || 1;
        addCrosswalk(dirX / len, -dirY / len, ROAD_HALF * (WIDTH_BY_TYPE[e.type] || 1));
      }

      // Sidewalk corner fill — scoped to the simple 2-road-turn case only
      // (no cross street), the single most visible gap: a diagonal-outward
      // quad on the outer side of the turn. A 3/4-way pad's own square
      // footprint already reads as a continuous corner, so skipped there
      // rather than adding angle-sorted hull logic for a marginal gain.
      if (!pad.touching.length && incoming && outgoing) {
        const bx = -incoming.fx + outgoing.fx, bz = -incoming.fz + outgoing.fz;
        const blen = Math.hypot(bx, bz) || 1;
        const cornerDist = pad.radius + SIDEWALK_W / 2;
        const fill = new THREE.Mesh(new THREE.PlaneGeometry(SIDEWALK_W * 1.4, SIDEWALK_W * 1.4), sidewalkMat);
        fill.rotation.x = -Math.PI / 2;
        fill.position.set(pad.x + (bx / blen) * cornerDist, 0.005, pad.z + (bz / blen) * cornerDist);
        outdoorGroup.add(fill);
      }
    }
    // Real, FUNCTIONAL traffic-light poles — one signalized pad gets 4
    // poles (2 governing the route axis, 2 the cross axis), each axis'
    // green/red state read live in the render loop below via `axis` +
    // `cycleOffset` against the shared LIGHT_CYCLE. `signalArcList` is what
    // the per-frame obstacle-braking check further down scans to find the
    // next red light ahead of a given traffic obstacle — ordinary traffic
    // now genuinely stops for a red; the player's own vehicle stays exempt
    // (see that check's own comment).
    {
      const poleMat = new THREE.MeshStandardMaterial({ color: "#2a2f33", roughness: 0.7, metalness: 0.3 });
      const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, 4.6, 8);
      const boxGeo = new THREE.BoxGeometry(0.4, 0.9, 0.28);
      const boxMat = new THREE.MeshStandardMaterial({ color: "#15181a", roughness: 0.6 });
      const redMat = new THREE.MeshStandardMaterial({ color: "#3a1414", emissive: "#ff3b30", emissiveIntensity: 0 });
      const greenMat = new THREE.MeshStandardMaterial({ color: "#14301a", emissive: "#39d97a", emissiveIntensity: 0 });
      const buildPole = (x, z, yaw) => {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, 2.3, z);
        pole.castShadow = true;
        outdoorGroup.add(pole);
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(x, 4.2, z);
        box.rotation.y = yaw;
        outdoorGroup.add(box);
        const lox = Math.sin(yaw) * 0.15, loz = Math.cos(yaw) * 0.15;
        const redLens = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), redMat.clone());
        redLens.position.set(x + lox, 4.45, z + loz);
        outdoorGroup.add(redLens);
        const greenLens = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), greenMat.clone());
        greenLens.position.set(x + lox, 4.0, z + loz);
        outdoorGroup.add(greenLens);
        return { red: redLens.material, green: greenLens.material };
      };
      for (const pad of pads.values()) {
        if (!pad.touching.length || !pad.crossDir) continue; // only real cross-street intersections get a signal
        const cycleOffset = hashOffset(pad.nodeId);
        for (const sign of [-1, 1]) {
          const x = pad.x + pad.routeDir.fx * (pad.radius + 1.4) * sign, z = pad.z + pad.routeDir.fz * (pad.radius + 1.4) * sign;
          const lens = buildPole(x, z, yawFor(-pad.routeDir.fx * sign, -pad.routeDir.fz * sign));
          trafficLights.push({ ...lens, axis: "route", cycleOffset });
        }
        for (const sign of [-1, 1]) {
          const x = pad.x + pad.crossDir.fx * (pad.radius + 1.4) * sign, z = pad.z + pad.crossDir.fz * (pad.radius + 1.4) * sign;
          const lens = buildPole(x, z, yawFor(-pad.crossDir.fx * sign, -pad.crossDir.fz * sign));
          trafficLights.push({ ...lens, axis: "cross", cycleOffset });
        }
        signalArcList.push({ arc: pad.arc, cycleOffset, stopArc: pad.arc - pad.radius - 1.5 });
      }
      signalArcList.sort((a, b) => a.arc - b.arc);
    }

    // --- Real buildings from the actual map (CLAUDE.md item 7), now with
    // real doors: every rendered building gets a door marker and an entry
    // in enterableBuildings, used further down to give it a real interior. --
    const enterableBuildings = []; // {x,z,doorX,doorZ,type,label,w,d,seed}
    let buildingSeed = 1;
    // Real on-foot collision for the "board" free-walk stage — this scene
    // previously had none at all, by explicit prior design (see the old
    // comment this replaces): the player could walk straight through the
    // parked vehicle's own mesh to "enter" it, and through every building
    // footprint. Populated below (buildings as they're placed, the vehicle
    // once its box exists) and consumed by a simple circle-vs-AABB push-out
    // in the board-stage movement loop — cheap and sufficient at walking
    // speed, not a physics engine.
    const boardColliders = []; // {x,z,hw,hd}
    const PLAYER_RADIUS = 0.35;
    // Campus buildout — buildings sharing a `campus` id (maps.js) get a real
    // quad drawn around their centroid once all of them have been placed
    // below; declared out here so it survives the per-building loop.
    const campusBuildings = []; // {relX,relZ,w,d}
    if (!isStationMode && map?.buildings && originWorld) {
      // Item 1 — real roughness/metalness per facade type instead of the
      // default flat 0.5/0.5: "glassier" civic buildings (hospital/clinic)
      // read shinier, houses/business stay matte masonry/siding.
      const bMats = {
        hospital: new THREE.MeshStandardMaterial({ color: 0x5a6a78, roughness: 0.35, metalness: 0.15 }),
        clinic: new THREE.MeshStandardMaterial({ color: 0x4a6a70, roughness: 0.4, metalness: 0.1 }),
        school: new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 0.8, metalness: 0 }),
        park: null,
        business: new THREE.MeshStandardMaterial({ color: 0x435463, roughness: 0.55, metalness: 0.1 }),
        house: new THREE.MeshStandardMaterial({ color: 0x3a4652, roughness: 0.85, metalness: 0 }),
        // cityHall — a warmer stone-ish tone, distinct from the glassier
        // office-block business material it otherwise shares a mesh with.
        // skyscraper — the glassiest/shiniest facade in the city, real
        // downtown-high-rise reading.
        cityHall: new THREE.MeshStandardMaterial({ color: 0x6a6250, roughness: 0.6, metalness: 0.05 }),
        skyscraper: new THREE.MeshStandardMaterial({ color: 0x4a5868, roughness: 0.25, metalness: 0.25 }),
        // Campus buildout — the university node used to fall through to the
        // generic `default` house-sized box (a real "bare station marker"
        // gap, see CLAUDE.md's front-end queue). Five distinct facades now
        // give the quad real variety instead of five copies of one type:
        // `university` itself is the grand brick-and-terracotta hall
        // fronting the quad, the rest are its cosmetic siblings
        // (`campus: "northwood"` in maps.js, no department/vehicles —
        // decorative only, dispatch still resolves off the one `university`
        // record).
        university: new THREE.MeshStandardMaterial({ color: 0x8a4a3a, roughness: 0.75, metalness: 0.05 }),
        universityLibrary: new THREE.MeshStandardMaterial({ color: 0xa89a7c, roughness: 0.7, metalness: 0.02 }),
        universityUnion: new THREE.MeshStandardMaterial({ color: 0x7a4634, roughness: 0.78, metalness: 0.05 }),
        universityScience: new THREE.MeshStandardMaterial({ color: 0x4f6a72, roughness: 0.4, metalness: 0.15 }),
        universityDining: new THREE.MeshStandardMaterial({ color: 0x6a4230, roughness: 0.8, metalness: 0 }),
        // Apartments — a real multi-unit residential type, distinct from
        // both `house` (single-family) and `business` (commercial): a
        // warm, mid-rise masonry facade, taller than any ordinary business
        // but shorter than a downtown skyscraper. The real payoff is the
        // interior below (buildStairs) — two connected floors, not one box.
        apartment: new THREE.MeshStandardMaterial({ color: 0x5a4638, roughness: 0.7, metalness: 0.05 }),
        default: new THREE.MeshStandardMaterial({ color: 0x30414a, roughness: 0.8, metalness: 0 }),
      };
      const sizeFor = (type) => type === "skyscraper" ? { w: 22, h: 26, d: 22 } // tallest in the city — taller even than the trauma-center hospital
        : type === "hospital" ? { w: 34, h: 20, d: 24 }
        : type === "cityHall" ? { w: 26, h: 14, d: 20 }
        : type === "clinic" || type === "school" ? { w: 20, h: 12, d: 16 }
        : type === "business" ? { w: 12, h: 10, d: 10 }
        : type === "apartment" ? { w: 18, h: 15, d: 16 } // a real multi-story massing, not a house-sized box
        : type === "university" ? { w: 28, h: 17, d: 14 } // the campus's own landmark hall — taller/wider than any ordinary business
        : type === "universityLibrary" ? { w: 13, h: 13, d: 22 } // tall, narrow stack-building footprint
        : type === "universityUnion" ? { w: 14, h: 11, d: 20 }
        : type === "universityScience" ? { w: 18, h: 12, d: 13 }
        : type === "universityDining" ? { w: 14, h: 9, d: 12 }
        : { w: 9, h: 7, d: 9 }; // house/default
      // Load each unique building model file ONCE and clone it per building
      // instance — the same load-once/clone-many pattern trees/streetlights
      // already use (see TREE_MODEL_FILES above), rather than one
      // GLTFLoader.load() per building. Several building `type`s share the
      // same underlying .glb (business/cityHall both use building-b.glb —
      // see BUILDING_MODEL_URL above), so this can genuinely cut the number
      // of fetch+parse calls for a building-dense map, not just formally
      // match the tree/streetlight idiom.
      const pendingBuildings = []; // {b, relX, relZ, w, h, d, boxMesh, url}
      const buildingTemplates = {}; // url -> loaded gltf.scene (once)
      const buildingUrlLoading = new Set();
      function placeBuildingModel(entry, template) {
        const { relX, relZ, w, h, d, boxMesh } = entry;
        const model = template.clone();
        model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        // Scale each axis independently to the real box footprint/height
        // this building type already uses, rather than a single uniform
        // scale — the source models aren't all the same aspect ratio.
        model.scale.set(w / (size.x || 1), h / (size.y || 1), d / (size.z || 1));
        model.position.set(relX, -box.min.y * (h / (size.y || 1)), relZ);
        outdoorGroup.add(model);
        boxMesh.visible = false;
      }
      for (const b of map.buildings) {
        if (b.type === "park") continue; // open space, nothing to render
        const node = map.nodes.find((n) => n.id === b.node);
        if (!node) continue;
        const off = b.offset || { dx: 0, dy: 0 };
        let relX = node.x + off.dx - originWorld.x, relZ = -(node.y + off.dy - originWorld.y);
        // Real fix for "building on the road": a building's node is often
        // the SAME node the route passes through (its own dispatch address
        // sits ON a route waypoint), so a small/zero offset can place its
        // footprint centered on or straddling the road's own centerline.
        // Find the segment this building sits closest to (perpendicular
        // distance to the LINE, not the midpoint) and, if it's inside the
        // road+sidewalk band, push it straight out to just past the
        // sidewalk on whichever side it already leans — same nudge
        // direction as a real "building set back from the street," not a
        // random shove.
        let nearestSeg = null, nearestPerp = Infinity, nearestSide = 1;
        for (const s of segs) {
          const t = Math.max(0, Math.min(1, ((relX - s.a.x) * s.fx + (relZ - s.a.z) * s.fz) / (s.len || 1)));
          const px = s.a.x + (s.b.x - s.a.x) * t, pz = s.a.z + (s.b.z - s.a.z) * t;
          const perp = Math.hypot(relX - px, relZ - pz);
          if (perp < nearestPerp) {
            nearestPerp = perp; nearestSeg = s;
            nearestSide = ((relX - px) * s.rx + (relZ - pz) * s.rz) >= 0 ? 1 : -1;
          }
        }
        const clearBand = (nearestSeg?.halfW ?? ROAD_HALF) + SIDEWALK_W + Math.max(sizeFor(b.type).w, sizeFor(b.type).d) / 2 + 1;
        if (nearestSeg && nearestPerp < clearBand) {
          const t = Math.max(0, Math.min(1, ((relX - nearestSeg.a.x) * nearestSeg.fx + (relZ - nearestSeg.a.z) * nearestSeg.fz) / (nearestSeg.len || 1)));
          const px = nearestSeg.a.x + (nearestSeg.b.x - nearestSeg.a.x) * t, pz = nearestSeg.a.z + (nearestSeg.b.z - nearestSeg.a.z) * t;
          relX = px + nearestSeg.rx * clearBand * nearestSide;
          relZ = pz + nearestSeg.rz * clearBand * nearestSide;
        }
        // Rough distance-to-route check (cheap: distance to nearest segment
        // midpoint) so only buildings actually near the drive get rendered.
        let near = false;
        for (const s of segs) {
          const mx = (s.a.x + s.b.x) / 2, mz = (s.a.z + s.b.z) / 2;
          if (Math.hypot(relX - mx, relZ - mz) < tier.buildingRange) { near = true; break; }
        }
        if (!near) continue;
        const { w, h, d } = sizeFor(b.type);
        const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMats[b.type] || bMats.default);
        boxMesh.position.set(relX, h / 2, relZ);
        boxMesh.castShadow = true; boxMesh.receiveShadow = true;
        outdoorGroup.add(boxMesh);
        // Item "buildings" (stretch goal) — real CC0 mesh replaces the box
        // once its (shared, load-once) model has arrived; the box itself is
        // never removed from the scene graph, only hidden, so a slow/failed
        // fetch degrades to the box rather than leaving a hole — same
        // honest-fallback pattern as the vehicle/pedestrian models above.
        const bModelUrl = BUILDING_MODEL_URL[b.type] || BUILDING_MODEL_URL.default;
        const entry = { relX, relZ, w, h, d, boxMesh, url: bModelUrl };
        if (buildingTemplates[bModelUrl]) placeBuildingModel(entry, buildingTemplates[bModelUrl]);
        else {
          pendingBuildings.push(entry);
          if (!buildingUrlLoading.has(bModelUrl)) {
            buildingUrlLoading.add(bModelUrl);
            gltfLoader.load(`${import.meta.env.BASE_URL}models/buildings/${bModelUrl}`, (gltf) => {
              buildingTemplates[bModelUrl] = gltf.scene;
              for (const pending of pendingBuildings) {
                if (pending.url === bModelUrl) placeBuildingModel(pending, gltf.scene);
              }
            }, undefined, () => { /* load failed — every pending box for this url stays visible, the honest fallback */ });
          }
        }
        enterableBuildings.push({ x: relX, z: relZ, doorX: relX, doorZ: relZ + d / 2 + 0.4, type: b.type, label: b.name || b.type, w, d, seed: buildingSeed++ });
        boardColliders.push({ x: relX, z: relZ, hw: w / 2, hd: d / 2 });
        if (b.campus) campusBuildings.push({ relX, relZ, w, d });
      }
      // Campus buildout — a real quad, not just a cluster of boxes. Keyed
      // off `b.campus` (any map.buildings entries sharing the same campus
      // id, maps.js) rather than a hardcoded node check, so a future second
      // campus cluster on a different map gets a quad with zero changes
      // here. Only buildings that actually rendered (passed the `near`/
      // range cull above) contribute, so a quad never appears floating far
      // off the driven route. Purely cosmetic — no new collider beyond the
      // buildings' own (already pushed above); walking across the lawn is
      // intentionally free, same as every other sidewalk/lawn surface in
      // this scene.
      if (campusBuildings.length >= 2) {
        let cx = 0, cz = 0;
        for (const cb of campusBuildings) { cx += cb.relX; cz += cb.relZ; }
        cx /= campusBuildings.length; cz /= campusBuildings.length;
        let halfSpan = 10;
        for (const cb of campusBuildings) halfSpan = Math.max(halfSpan, Math.hypot(cb.relX - cx, cb.relZ - cz) - Math.max(cb.w, cb.d) / 2);
        const lawnMat = new THREE.MeshStandardMaterial({ color: "#3d6b3f", roughness: 0.95, metalness: 0 });
        const lawn = new THREE.Mesh(new THREE.PlaneGeometry(halfSpan * 1.7, halfSpan * 1.7), lawnMat);
        lawn.rotation.x = -Math.PI / 2;
        lawn.position.set(cx, 0.01, cz);
        outdoorGroup.add(lawn);
        // A real path from the quad's own center out to each building's
        // door — reuses the same sidewalk material every other pedestrian
        // surface in this scene already uses, just narrower, so it reads as
        // "part of the same city" rather than a separately-styled overlay.
        for (const cb of campusBuildings) {
          const dx = cb.relX - cx, dz = cb.relZ - cz;
          const len = Math.hypot(dx, dz) || 1;
          const path = new THREE.Mesh(new THREE.PlaneGeometry(2.2, len), sidewalkMat);
          path.rotation.x = -Math.PI / 2;
          path.rotation.z = Math.atan2(dx, dz);
          path.position.set(cx + dx / 2, 0.02, cz + dz / 2);
          outdoorGroup.add(path);
        }
        // A low pedestal + sphere centerpiece — a plausible quad monument/
        // fountain silhouette without sourcing a dedicated model, matching
        // this file's own header note that primitive geometry is the norm
        // and real meshes are an opportunistic upgrade, not a requirement.
        const pedestalMat = new THREE.MeshStandardMaterial({ color: "#8a8378", roughness: 0.7, metalness: 0 });
        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.6, 16), pedestalMat);
        pedestal.position.set(cx, 0.3, cz);
        outdoorGroup.add(pedestal);
        const statueMat = new THREE.MeshStandardMaterial({ color: "#5c7a6a", roughness: 0.5, metalness: 0.3 });
        const statue = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), statueMat);
        statue.position.set(cx, 1.4, cz);
        outdoorGroup.add(statue);
        // A handful of low hedge markers ringing the lawn — cheap boxes,
        // not a new model-loading system (trees/streetlights already have
        // their own route-relative placement pass elsewhere in this file;
        // duplicating that machinery just for the quad wasn't worth it).
        const hedgeMat = new THREE.MeshStandardMaterial({ color: "#2c4a2e", roughness: 0.9, metalness: 0 });
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2 + 0.4;
          const hx = cx + Math.cos(ang) * halfSpan * 0.75, hz = cz + Math.sin(ang) * halfSpan * 0.75;
          const hedge = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.6), hedgeMat);
          hedge.position.set(hx, 0.25, hz);
          hedge.rotation.y = ang;
          outdoorGroup.add(hedge);
        }
      }
      // Item "city density" (stretch goal) — procedural background infill.
      // The real, hand-placed dispatch-map buildings above are the only
      // ones with a door/interior/label that matters (they're real
      // addresses), but there are only ever a handful of them near any
      // stretch of route — a real city block has a near-continuous wall of
      // buildings behind them, which is exactly what was missing (the drive
      // read as sparse because it WAS sparse: only the named buildings
      // existed at all). These are pure background dressing — no door, no
      // `enterableBuildings` entry — but still get a real on-foot collider
      // (walking straight through a solid-looking wall of buildings would
      // be a worse, more visible bug than walking through one named one)
      // and reuse the SAME mesh/material/model-swap machinery
      // (bMats/sizeFor/placeBuildingModel/buildingTemplates) the real
      // buildings just used, so the skyline and the named buildings read as
      // one consistent city rather than two different rendering styles
      // glued together. `fillerSpacing===0` (rural — see tierMultipliers)
      // means this loop runs zero iterations, which is the deliberately
      // correct "no filler" behavior for a map that should stay sparse, not
      // a special-cased skip.
      const FILLER_TYPES = ["house", "business", "business", "school"];
      const FILLER_CAP = 500; // safety ceiling for a very long route
      let fillerCount = 0;
      if (tier.fillerSpacing > 0) {
        outer: for (const s of segs) {
          for (let along = 6; along < s.len; along += tier.fillerSpacing * (0.75 + Math.random() * 0.5)) {
            for (const side of [-1, 1]) {
              if (fillerCount >= FILLER_CAP) break outer;
              if (Math.random() < 0.15) continue; // real streets have gaps — driveways, lots, alleys
              const isSky = tier.skyscraperChance > 0 && Math.random() < tier.skyscraperChance;
              const type = isSky ? "skyscraper" : FILLER_TYPES[Math.floor(Math.random() * FILLER_TYPES.length)];
              const { w, h, d } = sizeFor(type);
              // One row back from the sidewalk, at a real, varied setback
              // (not perfectly flush) so the skyline reads as staggered
              // city blocks rather than a single straight wall.
              const rowOffset = (s.halfW ?? ROAD_HALF) + SIDEWALK_W + Math.max(w, d) / 2 + 6 + Math.random() * 10;
              const px = s.a.x + s.fx * along, pz = s.a.z + s.fz * along;
              const relX = px + s.rx * rowOffset * side;
              const relZ = pz + s.rz * rowOffset * side;
              // Skip if this would overlap a real, named building — a cheap
              // center-distance check against everything already placed,
              // not a full polygon overlap test (a filler plot nudged a
              // couple meters is invisible at driving speed; two buildings
              // genuinely overlapping is not).
              let conflict = false;
              for (const eb of enterableBuildings) {
                if (Math.hypot(relX - eb.x, relZ - eb.z) < (Math.max(w, d) + Math.max(eb.w, eb.d)) / 2 + 3) { conflict = true; break; }
              }
              if (conflict) continue;
              fillerCount++;
              const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMats[type] || bMats.default);
              boxMesh.position.set(relX, h / 2, relZ);
              boxMesh.castShadow = true; boxMesh.receiveShadow = true;
              outdoorGroup.add(boxMesh);
              const bModelUrl = BUILDING_MODEL_URL[type] || BUILDING_MODEL_URL.default;
              const entry = { relX, relZ, w, h, d, boxMesh, url: bModelUrl };
              if (buildingTemplates[bModelUrl]) placeBuildingModel(entry, buildingTemplates[bModelUrl]);
              else {
                pendingBuildings.push(entry);
                if (!buildingUrlLoading.has(bModelUrl)) {
                  buildingUrlLoading.add(bModelUrl);
                  gltfLoader.load(`${import.meta.env.BASE_URL}models/buildings/${bModelUrl}`, (gltf) => {
                    buildingTemplates[bModelUrl] = gltf.scene;
                    for (const pending of pendingBuildings) {
                      if (pending.url === bModelUrl) placeBuildingModel(pending, gltf.scene);
                    }
                  }, undefined, () => { /* load failed — box stays visible, same honest fallback */ });
                }
              }
              boardColliders.push({ x: relX, z: relZ, hw: w / 2, hd: d / 2 });
            }
          }
        }
      }
    }

    // --- Obstacles ---------------------------------------------------------
    const obstacles = []; // {mesh,arc,lat,hw,hit,isPed,heardAt,pulledOver}
    const pedGeo = new THREE.CapsuleGeometry(0.28, 0.9, 4, 6);
    const pedMat = new THREE.MeshStandardMaterial({ color: "#F2A33C" });
    const carGeo = new THREE.BoxGeometry(1.7, 1.15, 3.6);
    const carMat = new THREE.MeshStandardMaterial({ color: "#B3323E" });
    const pulledMat = new THREE.MeshStandardMaterial({ color: "#7a8a3a" });
    const holeGeo = new THREE.CircleGeometry(0.7, 16);
    const holeMat = new THREE.MeshBasicMaterial({ color: "#0D1113" });
    const LANE_X = [-1.6, 0, 1.6];
    // Item 7 (stretch goal) — preload the pedestrian model variants ONCE at
    // mount, not per spawn (spawning is continuous and frequent; a fresh
    // network load per pedestrian would be both slow and wasteful). Each
    // spawned pedestrian gets an independent SkeletonUtils clone (safe for
    // both skinned and node-hierarchy-animated rigs) plus its own
    // AnimationMixer so it can play its own walk cycle on its own clock.
    const pedTemplates = [];
    for (const file of PED_MODEL_FILES) {
      gltfLoader.load(`${import.meta.env.BASE_URL}models/people/${file}`, (gltf) => {
        pedTemplates.push(gltf);
      }, undefined, () => { /* this variant failed to load — fewer variants, not a crash */ });
    }
    // Same load-once idiom for traffic car obstacles — these are static
    // (unrigged) meshes, so a plain THREE.Object3D.clone() per spawn is
    // enough; no SkeletonUtils clone needed (that's only for the skinned
    // pedestrian rigs above).
    const carTemplates = [];
    for (const file of TRAFFIC_CAR_MODEL_FILES) {
      gltfLoader.load(`${import.meta.env.BASE_URL}models/vehicles/${file}`, (gltf) => {
        carTemplates.push(gltf);
      }, undefined, () => { /* this variant failed to load — fewer variants, not a crash */ });
    }
    let spawnTimer = 1.2, lastLane = 1;
    function spawnObstacle(currentArc) {
      let lane = Math.floor(Math.random() * 3);
      if (lane === lastLane && Math.random() < 0.7) lane = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
      lastLane = lane;
      const arc = currentArc + OBSTACLE_AHEAD + Math.random() * 20;
      if (arc > totalLen) return;
      const isPed = Math.random() < codeTuning.pedChance;
      const isHole = !isPed && Math.random() < 0.2;
      let mesh, pedMixer = null, usedPedModel = false, usedCarModel = false;
      if (isPed && pedTemplates.length) {
        const tmpl = pedTemplates[Math.floor(Math.random() * pedTemplates.length)];
        const model = cloneSkinned(tmpl.scene);
        model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        // Scale to a real, plausible adult height regardless of the
        // model's own native units — the same "measure, don't guess"
        // scaling approach the vehicle models use (vehExtSize.d above).
        const box = new THREE.Box3().setFromObject(model);
        const h = box.getSize(new THREE.Vector3()).y || 1;
        model.scale.setScalar(1.75 / h);
        model.position.y = -box.min.y * (1.75 / h); // feet on the ground
        model.rotation.y = Math.PI; // this file's own -Z-forward convention
        mesh = new THREE.Group();
        mesh.add(model);
        const walkClip = (tmpl.animations || []).find((a) => a.name === "walk") || (tmpl.animations || [])[0];
        if (walkClip) {
          pedMixer = new THREE.AnimationMixer(model);
          pedMixer.clipAction(walkClip).play();
        }
        usedPedModel = true;
      } else if (!isPed && !isHole && carTemplates.length) {
        const tmpl = carTemplates[Math.floor(Math.random() * carTemplates.length)];
        const model = tmpl.scene.clone(true);
        model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        // Same "measure, don't guess" scale-to-real-size approach the
        // player's own vehicle model uses (vehExtSize.d above) — scale to
        // carGeo's own declared length (3.6, the box this replaces) so a
        // real model and the box fallback occupy the same footprint.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = 3.6 / (size.z || 1);
        model.scale.setScalar(scale);
        model.position.y = -box.min.y * scale;
        model.rotation.y = Math.PI; // this file's own -Z-forward convention
        mesh = new THREE.Group();
        mesh.add(model);
        usedCarModel = true;
      } else {
        const geo = isPed ? pedGeo : (isHole ? holeGeo : carGeo);
        const mat = isPed ? pedMat : (isHole ? holeMat : carMat);
        mesh = new THREE.Mesh(geo, mat);
      }
      mesh.castShadow = !isHole; mesh.receiveShadow = true;
      // Pedestrians belong on the sidewalk (ROAD_HALF..ROAD_HALF+SIDEWALK_W
      // from centerline), not in a driving lane — same band the actual
      // sidewalk mesh above is placed in. Cars/potholes still use the
      // driving lanes. A pedestrian's own siren-reaction "step onto the
      // curb" logic elsewhere already targets this same band, so this just
      // makes their RESTING position consistent with where they react to.
      const pedSide = Math.random() < 0.5 ? -1 : 1;
      const lat = isPed
        ? pedSide * (ROAD_HALF + SIDEWALK_W * (0.25 + Math.random() * 0.5))
        : LANE_X[lane] + (Math.random() * 1.0 - 0.5);
      const y = isHole ? 0.02 : (isPed ? (usedPedModel ? 0 : 0.9) : (usedCarModel ? 0 : 0.6));
      if (isHole) mesh.rotation.x = -Math.PI / 2;
      outdoorGroup.add(mesh);
      // Item 5 — a real turn-signal tell: a small amber blinker riding on
      // top of a car obstacle, only ever lit while it's "reacting" to a
      // heard siren but hasn't yet committed to pulling over (below) —
      // the visual cue for the lane-change/shoulder move that's about to
      // happen, not decorative.
      let blinker = null;
      if (!isPed && !isHole) {
        blinker = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: "#3a3020", emissive: "#F2A33C", emissiveIntensity: 0 }));
        // Real car models sit at ground level locally (feet-on-ground, like
        // the pedestrian models above) rather than the old box's own
        // vertically-centered origin, so the blinker's local y needs to be
        // roof-height-from-ground for a real model instead of roof-height-
        // from-box-center for the primitive fallback.
        blinker.position.set(0.85, usedCarModel ? 1.4 : 0.35, -1.7);
        mesh.add(blinker);
      }
      // Item 5 — real traffic: a car obstacle has its own forward speed
      // along the route (ordinary city traffic, 6-13 m/s ≈ 22-47 km/h) with
      // small per-second variance (accelerating/decelerating toward a
      // periodically re-picked target, not a constant), instead of sitting
      // fixed at its spawn arc until the player's own motion "moves" it.
      const spd0 = !isPed && !isHole ? 6 + Math.random() * 7 : 0;
      // Item 7 (stretch goal) — ambient walking: a pedestrian who isn't yet
      // reacting to a siren isn't just standing there looping a walk clip in
      // place (the old behavior) — they actually stroll along the sidewalk,
      // a real walking pace (~1.0-1.4 m/s) in a persistent direction that
      // occasionally changes (real foot traffic isn't a metronome — people
      // pause at a corner, window-shop, double back), with the walk clip's
      // own timeScale zeroed while paused so the legs actually stop instead
      // of looping mid-stride on a stationary body.
      const walkDir = Math.random() < 0.5 ? -1 : 1;
      const walkSpd = isPed ? 1.0 + Math.random() * 0.4 : 0;
      obstacles.push({ mesh, blinker, arc, lat, y, hw: isPed ? 0.5 : (isHole ? 0.8 : 1.0), hit: false, isPed, isCar: !isPed && !isHole, isHole, pulledOver: false, hearAccum: 0, reacting: false, blinkT: 0,
        spd: spd0, targetSpd: spd0, retargetT: 2 + Math.random() * 4, pedMixer,
        walkDir, walkSpd, walkPaused: false, walkChangeT: 3 + Math.random() * 6 });
    }
    function placeObstacle(o) {
      const p = sampleRoute(o.arc);
      o.worldX = p.x + p.rx * o.lat;
      o.worldZ = p.z + p.rz * o.lat;
      o.mesh.position.set(o.worldX, o.y, o.worldZ);
      if (!o.isHole) {
        // A walking pedestrian faces the way they're actually walking
        // (forward or backward along the route arc), not always the
        // route's own forward direction the way a car obstacle does.
        const dir = o.isPed ? (o.walkDir || 1) : 1;
        o.mesh.rotation.y = yawFor(p.fx * dir, p.fz * dir);
      }
    }
    // Stops a despawning pedestrian's AnimationMixer instead of just
    // dropping the reference — real, if small, cleanup: once an obstacle is
    // spliced out of `obstacles` nothing calls `.update(dt)` on its mixer
    // again, but the mixer itself (and whatever internal property-binding
    // state it's still holding) otherwise lingers until GC gets to it.
    // Deliberately does NOT call geometry/material .dispose() here — a
    // GLTF-model pedestrian's mesh came from SkeletonUtils.clone(), which
    // shares geometry/material BY REFERENCE across every clone of the same
    // template (that's the whole point of a skinned clone — one geometry,
    // many independently-posable skeletons) — disposing them here would
    // corrupt every OTHER still-alive pedestrian sharing that same
    // template, a real regression, not a fix. The primitive fallback
    // obstacles (pedGeo/pedMat/carGeo/carMat/holeGeo, above) are shared
    // singletons for the same reason and were already correctly left alone.
    function despawnObstacle(o) {
      scene.remove(o.mesh);
      if (o.pedMixer) o.pedMixer.stopAllAction();
    }

    // --- Vehicle interior (per-type primitive cockpit, item 3) ------------
    const interiorGroup = new THREE.Group();
    camera.add(interiorGroup);
    const dashMatCol = new THREE.MeshStandardMaterial({ color: "#12171b" });
    const wheelMat = new THREE.MeshStandardMaterial({ color: "#1c2429" });
    let sirenSwitchMesh = null, hornButtonMesh = null;
    const cockpit = profile.cockpit;
    if (cockpit === "bike" || cockpit === "cart") {
      // Handlebars, no enclosed dash — low, minimal cockpit.
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), wheelMat);
      bar.rotation.z = Math.PI / 2; bar.position.set(0, -0.42, -0.5);
      interiorGroup.add(bar);
      if (profile.hasSiren === false) {
        hornButtonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 12), new THREE.MeshStandardMaterial({ color: "#E8C24A" }));
        hornButtonMesh.position.set(0.15, -0.4, -0.5);
        hornButtonMesh.rotation.x = Math.PI / 2;
        interiorGroup.add(hornButtonMesh);
      }
    } else {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 10, 20), wheelMat);
      wheel.position.set(0, -0.34, -0.55); wheel.rotation.x = Math.PI / 2.3;
      interiorGroup.add(wheel);
      const dashDepth = cockpit === "truck" ? 0.5 : 0.35;
      const dash = new THREE.Mesh(new THREE.BoxGeometry(cockpit === "truck" ? 1.3 : 0.9, 0.14, dashDepth), dashMatCol);
      dash.position.set(0, -0.46, -0.62);
      interiorGroup.add(dash);
      if (cockpit === "ambulance") {
        // A small radio/console box — the ambulance's own "console" flavor.
        const console_ = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.14), new THREE.MeshStandardMaterial({ color: "#20262b" }));
        console_.position.set(0.32, -0.42, -0.6);
        interiorGroup.add(console_);
      }
      if (cockpit === "truck") {
        const ceiling = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.9), dashMatCol);
        ceiling.position.set(0, 0.55, -0.5);
        interiorGroup.add(ceiling);
      }
      if (profile.hasSiren) {
        sirenSwitchMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: "#B3323E" }));
        sirenSwitchMesh.position.set(0.28, -0.42, -0.58);
        interiorGroup.add(sirenSwitchMesh);
        hornButtonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), new THREE.MeshStandardMaterial({ color: "#E8C24A" }));
        hornButtonMesh.position.set(0, -0.31, -0.56);
        hornButtonMesh.rotation.x = Math.PI / 2;
        interiorGroup.add(hornButtonMesh);
      }
    }
    const interactables = [sirenSwitchMesh, hornButtonMesh].filter(Boolean);
    const baseEmissive = new Map(interactables.map((m) => [m, m.material.color.getHex()]));
    // The cockpit is a permanent child of the camera, so without a
    // visibility flag it renders even during the on-foot board stage,
    // before the player has actually gotten in — the "you spawn with the
    // vehicle thingy already" bug. Starts hidden for a driver (who starts
    // outside, on foot); a co-op passenger, who starts already seated,
    // sees it immediately. Set to true the moment boarding completes
    // (onE()'s board branch, below).
    interiorGroup.visible = !isDriverRef.current;

    function makeAvatar(color) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.1, 4, 8), new THREE.MeshStandardMaterial({ color }));
      body.position.y = 0.95;
      g.add(body);
      return g;
    }

    // --- Board-stage exterior: a small ground patch, a parked vehicle
    // exterior box (sized per the same cockpit table above), and the
    // partner NPC — a simple capsule-plus-head avatar, the same primitive
    // idiom Coop3DWalk already uses for other players. Not built in
    // "station" mode, which has no vehicle to board yet (see the station
    // interior below instead). -------------------------------------------
    let partnerMesh = null, doorBeacon = null, seatedPartner = null;
    if (!isStationMode) {
      const yardGround = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: "#1c2429" }));
      yardGround.rotation.x = -Math.PI / 2;
      yardGround.position.set(vehiclePos.x, -0.02, vehiclePos.z);
      outdoorGroup.add(yardGround);
      const vehExtSize = cockpit === "truck" ? { w: 2.6, h: 2.8, d: 8.5 }
        : cockpit === "bike" ? { w: 0.7, h: 1.2, d: 1.8 }
        : cockpit === "cart" ? { w: 1.5, h: 1.7, d: 2.6 }
        // motorcycle — narrower and lower than a bicycle's box, longer for
        // the engine/wheelbase. No real model exists for the "moto" cockpit
        // itself (this is the same box VEHICLE_MODEL_URL.motorcycle's real
        // mesh scales against via Box3().setFromObject below).
        : cockpit === "moto" ? { w: 0.6, h: 1.1, d: 2.0 }
        : { w: 2.1, h: 2.0, d: 5.6 }; // ambulance/sedan
      const vehExtMesh = new THREE.Mesh(new THREE.BoxGeometry(vehExtSize.w, vehExtSize.h, vehExtSize.d), new THREE.MeshStandardMaterial({ color: "#B3323E" }));
      vehExtMesh.position.set(vehiclePos.x, vehExtSize.h / 2, vehiclePos.z);
      outdoorGroup.add(vehExtMesh);
      boardColliders.push({ x: vehiclePos.x, z: vehiclePos.z, hw: vehExtSize.w / 2, hd: vehExtSize.d / 2 });
      // Item 1 (stretch goal) — a real, sourced CC0 mesh (Kenney's Car
      // Kit, see public/models/vehicles/README.md) replaces the flat box
      // once it loads, keyed by vehType with a cockpit-level fallback for
      // any vehType this pack has no direct model for. The box is left in
      // place and only hidden on a SUCCESSFUL load — if the fetch fails
      // (offline, blocked, itch.io host without the models folder deployed)
      // the box silently remains the real fallback, not a broken scene.
      const modelUrl = VEHICLE_MODEL_URL[vehType] || VEHICLE_MODEL_URL_BY_COCKPIT[cockpit];
      if (modelUrl) {
        gltfLoader.load(`${import.meta.env.BASE_URL}models/vehicles/${modelUrl}`, (gltf) => {
          const model = gltf.scene;
          model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
          // Kenney's kit models are authored at real-world scale and face
          // +Z; this project's own vehicle heading convention (yawFor,
          // above) treats -Z as forward, so the model is turned to match
          // and scaled to this vehicle's own vehExtSize (computed above
          // from the SAME cockpit table every other vehicle-size reference
          // in this file already uses) rather than a guessed constant.
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const scale = vehExtSize.d / (size.z || 1);
          model.scale.setScalar(scale);
          model.rotation.y = Math.PI;
          model.position.set(vehiclePos.x, 0, vehiclePos.z);
          outdoorGroup.add(model);
          vehExtMesh.visible = false;
        }, undefined, () => { /* load failed — box stays visible, the honest fallback */ });
      }
      doorBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 8), new THREE.MeshBasicMaterial({ color: "#46E39B" }));
      doorBeacon.position.set(driverDoor.x, 1, driverDoor.z);
      outdoorGroup.add(doorBeacon);
      partnerMesh = makeAvatar("#4D7CFF");
      partnerMesh.position.set(partner.x, 0, partner.z);
      outdoorGroup.add(partnerMesh);
      // Once seated, the partner rides as a small NPC attached to the
      // camera/interior group (right side, driver's peripheral vision via
      // mouse-look) rather than a free-standing world mesh, since their
      // world position no longer means anything once they're "inside."
      seatedPartner = makeAvatar("#4D7CFF");
      seatedPartner.position.set(0.55, -0.55, -0.3);
      seatedPartner.visible = false;
      interiorGroup.add(seatedPartner);
    }

    // Item 2 — emergency-light illumination: real point lights riding with
    // the vehicle, alternating red/blue in step with the siren's own
    // sirenPhase (audio) so the flash actually lights nearby pavement/
    // building facades instead of only being a HUD/audio cue. Capped at 2
    // lights total (perf) and only exists for the player's own vehicle, not
    // every NPC obstacle. Added to outdoorGroup so it's hidden along with
    // the rest of the outdoor world while inside a building interior.
    const sirenLightA = new THREE.PointLight("#ff2d3a", 0, 26, 2);
    const sirenLightB = new THREE.PointLight("#2d7dff", 0, 26, 2);
    outdoorGroup.add(sirenLightA, sirenLightB);

    // Item 3/11 — real falling precipitation, not just a material/fog
    // shift. A camera-attached point cloud (so it always surrounds the
    // viewer regardless of world position, the standard cheap approach for
    // a driving scene) that recycles each particle through a box centered
    // on the camera as it falls below the floor. Rain falls fast and
    // straight; snow falls slower with a little horizontal drift and reads
    // as bigger, softer flakes — real, different physics per weather, not
    // the same system recolored.
    let precip = null;
    if (weather === "rain" || weather === "snow") {
      const isSnow = weather === "snow";
      const count = isSnow ? 400 : 700;
      const box = { x: 16, yTop: 14, z: 16 };
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() * 2 - 1) * box.x;
        positions[i * 3 + 1] = Math.random() * box.yTop;
        positions[i * 3 + 2] = (Math.random() * 2 - 1) * box.z;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: isSnow ? "#eef4f8" : "#a9c8d8",
        size: isSnow ? 0.09 : 0.035,
        transparent: true, opacity: isSnow ? 0.85 : 0.5, sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, mat);
      // Deliberately NOT a child of the camera: the camera rotates (mouse
      // look, roll from steering, accel/brake pitch), and a rotating parent
      // would tip "down" with it, making rain fall sideways whenever the
      // player looks around. This follows the camera's world XZ position
      // every frame (below) but keeps world-aligned axes, so gravity always
      // points the same way regardless of where the camera is looking.
      outdoorGroup.add(points);
      precip = { points, positions, count, box, fallSpeed: isSnow ? 1.6 : 11, drift: isSnow ? 0.6 : 0.15 };
    }

    scene.add(camera);

    function resize() {
      const w = el.clientWidth, h = el.clientHeight || window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // --- Real Doppler siren audio (self-contained: mirrors App.jsx's own
    // useSiren idiom — sawtooth oscillator through a lowpass filter — but
    // implemented locally since useSiren isn't exported and this needs a
    // per-frame-controllable playback rate for a real Doppler shift, not
    // a fixed 550ms wobble). ------------------------------------------------
    // Item 7 — real spatial audio. Both the siren and the horn now play
    // through a PannerNode instead of straight to destination, and the
    // AudioListener's position/orientation is updated every frame from the
    // camera (below, in the driving loop) — so a co-op passenger sitting a
    // few meters from the siren's own light position genuinely hears it
    // from the correct direction/distance, not identically to the driver.
    // "inverse" distance model + a real refDistance/rolloff are the
    // standard WebAudio approximation of physical sound falloff.
    let audioCtx = null, sirenOsc = null, sirenGain = null, sirenPanner = null, hornOsc = null;
    function ensureAudio() {
      if (audioCtx) return;
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no audio available */ }
    }
    function makePanner() {
      const p = audioCtx.createPanner();
      p.panningModel = "equalpower"; // HRTF is costlier and no more correct for a synth tone
      p.distanceModel = "inverse";
      p.refDistance = 8; p.maxDistance = 300; p.rolloffFactor = 1;
      return p;
    }
    function setSiren(on) {
      ensureAudio();
      if (!audioCtx) return;
      if (on && !sirenOsc) {
        sirenOsc = audioCtx.createOscillator();
        sirenGain = audioCtx.createGain();
        sirenPanner = makePanner();
        const filt = audioCtx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 1400;
        sirenOsc.type = "sawtooth";
        sirenGain.gain.value = 0.6; // panner's own distance falloff replaces the old flat 0.03 gain
        sirenOsc.connect(filt); filt.connect(sirenGain); sirenGain.connect(sirenPanner); sirenPanner.connect(audioCtx.destination);
        sirenOsc.start();
      } else if (!on && sirenOsc) {
        try { sirenOsc.stop(); } catch { /* already stopped */ }
        sirenOsc = null; sirenGain = null; sirenPanner = null;
      }
    }
    function playHorn(atX, atZ, atY) {
      ensureAudio();
      if (!audioCtx) return;
      hornOsc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const panner = makePanner();
      if (atX != null) panner.positionX ? panner.positionX.value = atX : panner.setPosition(atX, atY ?? 1.4, atZ);
      if (atZ != null && panner.positionZ) panner.positionZ.value = atZ;
      if (atY != null && panner.positionY) panner.positionY.value = atY;
      hornOsc.type = "square"; hornOsc.frequency.value = 340;
      g.gain.value = 0.7;
      hornOsc.connect(g); g.connect(panner); panner.connect(audioCtx.destination);
      hornOsc.start();
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      hornOsc.stop(audioCtx.currentTime + 0.45);
    }

    // --- Enterable buildings: a real interior room per building, built
    // once at mount and toggled visible/hidden on entry/exit — "one
    // continuous world," no new mount, no portal cut. Every interior room
    // lives at a large, unique offset far from the outdoor world and from
    // every other interior, so they never overlap each other visually even
    // though they're all in the same THREE.Scene. -------------------------
    let interiorSeed = 100;
    function makeInteriorRoom(w, d, h, type, seed, furnished) {
      const g = new THREE.Group();
      // Real interior lighting, not just whatever of the single outdoor
      // directional sun happens to reach in here. A sealed box has no
      // opening for outdoor light, and the sun's fixed world direction only
      // lights whichever walls happen to face it — every other surface
      // (including, in practice, the whiteboard itself) was reading as
      // near-black, ambient-only, regardless of time of day. Two ceiling
      // point lights (ordinary fluorescent-ish interior lighting, not
      // shadow-casting — this room can have up to ~11 instances live at
      // once via `portals`, so keeping every one of them shadowless keeps
      // this cheap) fix it for real, independent of the room's position or
      // the sun's angle.
      // Three.js (r155+, which this project is well past — package.json
      // pins ^0.185) made point/spot light intensity physically-scaled
      // (candela, real inverse-square falloff) — the old "intensity: 1-2"
      // convention that still works fine for DirectionalLight/
      // HemisphereLight above (those were never on that scale) reads as
      // essentially invisible for a PointLight. Measured directly against
      // this room's own real dimensions before picking a number, not
      // guessed: intensity 40 with the standard decay=2 physical falloff
      // is what actually reads as "a lit room" at this room's ~4m ceiling
      // height, confirmed via a live screenshot.
      const lampCol = "#e8eef2";
      const lamp1 = new THREE.PointLight(lampCol, 40, Math.max(w, d) * 1.8, 2);
      lamp1.position.set(-w / 4, h - 0.3, -d / 4);
      g.add(lamp1);
      const lamp2 = new THREE.PointLight(lampCol, 40, Math.max(w, d) * 1.8, 2);
      lamp2.position.set(w / 4, h - 0.3, d / 4);
      g.add(lamp2);
      const floorMat = new THREE.MeshStandardMaterial({ color: "#22262a" });
      const wallMat = new THREE.MeshStandardMaterial({ color: "#333c42" });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
      floor.rotation.x = -Math.PI / 2;
      g.add(floor);
      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
      ceiling.rotation.x = Math.PI / 2; ceiling.position.y = h;
      g.add(ceiling);
      const wallNS = new THREE.PlaneGeometry(w, h), wallEW = new THREE.PlaneGeometry(d, h);
      const addWall = (geo, x, z, ry) => { const m = new THREE.Mesh(geo, wallMat); m.position.set(x, h / 2, z); m.rotation.y = ry; g.add(m); };
      addWall(wallNS, 0, -d / 2, 0);
      // No physical doorway gap — on-foot movement in this scene has no
      // wall collision anywhere (matching the existing board-stage walk),
      // so the "door" is a logical E-press trigger zone near the front
      // wall, not a literal opening a player could otherwise walk through.
      addWall(wallEW, -w / 2, 0, Math.PI / 2);
      addWall(wallEW, w / 2, 0, -Math.PI / 2);
      const backWall = new THREE.Mesh(wallNS, wallMat);
      backWall.position.set(0, h / 2, d / 2); backWall.rotation.y = Math.PI;
      g.add(backWall);
      // A cheap seeded PRNG (not crypto-grade, doesn't need to be) so two
      // rooms of the same type don't render pixel-identical furniture.
      let s = seed || 1;
      const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      const furnMat = new THREE.MeshStandardMaterial({ color: "#4a4238" });
      const bedMat = new THREE.MeshStandardMaterial({ color: "#8f9aa3" });
      if (furnished) furnished(g, rng, w, d, h);
      else {
        // Generic per-type template — varied piece count/placement, not
        // hand-authored per building (see this file's own header comment
        // for why: primitive-only geometry, one session, dozens of
        // buildings on the map).
        const pieceCount = type === "clinic" || type === "school" ? 4 : type === "business" ? 3 : 2;
        for (let i = 0; i < pieceCount; i++) {
          const fw = 0.9 + rng() * 0.8, fd = 0.5 + rng() * 0.5, fh = 0.5 + rng() * 0.5;
          const piece = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), type === "clinic" && i === 0 ? bedMat : furnMat);
          piece.position.set((rng() - 0.5) * (w - fw - 1), fh / 2, (rng() - 0.5) * (d - fd - 1));
          g.add(piece);
        }
      }
      return g;
    }
    // portals: {doorX,doorZ (exterior-frame door position), exitX,exitZ
    // (exterior-frame spot to stand on when walking back out), interiorGroup,
    // entryX,entryZ,entryYaw (interior-local spawn point), doorHalfW (interior-
    // local exit-zone position), label}. `ox,oz,w,d,h` are also kept on the
    // returned portal (world-space room origin + real dimensions) so a
    // caller building a SECOND, upper-floor room (see buildStairs below) can
    // place its own staircase geometry/trigger point in exact alignment
    // with the room this portal describes, without re-deriving the offset
    // math `addPortal` already did internally.
    const portals = [];
    function addPortal(doorX, doorZ, w, d, h, type, label, seed, furnished) {
      const room = makeInteriorRoom(w, d, h, type, seed, furnished);
      const ox = 4000 + portals.length * 400, oz = 4000;
      room.position.set(ox, 0, oz);
      room.visible = false;
      scene.add(room);
      const p = {
        doorX, doorZ, exitX: doorX, exitZ: doorZ + 1.3,
        interiorGroup: room,
        // entryYaw=0: forward (fx=-sin(yaw),fz=-cos(yaw)) is then -z, i.e.
        // straight from the south-side spawn point toward the room's own
        // interior/north wall — matches the direction every portal's own
        // "inside" content (whiteboard, furniture) is placed in.
        entryX: ox, entryZ: oz + d / 2 - 1.2, entryYaw: 0,
        doorLocalX: ox, doorLocalZ: oz + d / 2 - 0.3,
        label,
        ox, oz, w, d, h,
        // stairsTargetIdx/stairsLocalX/stairsLocalZ/stairsEntryX/
        // stairsEntryZ/stairsEntryYaw — set by buildStairs() for any
        // multi-floor building; left undefined (a real absence, not a
        // decorative placeholder) for every single-floor portal, which is
        // still the overwhelming majority of buildings in the game.
      };
      portals.push(p);
      return p;
    }
    // Multi-floor interiors — a real, functional staircase connecting two
    // already-built portals (ground/upper), reusing the EXACT same
    // proximity-trigger E-press idiom every door/portal transition in this
    // scene already uses (see onE()'s door-exit check just below), rather
    // than inventing new continuous vertical movement physics: this scene's
    // whole walk stage is a flat plane (camera.position.set(P.x,1.6,P.z),
    // no y term anywhere) and giving stairs alone a smooth climb would mean
    // a bespoke physics case just for this one feature. A real, visible
    // staircase mesh (steps + railing) sits at both ends so the transition
    // reads as "you walked up the stairs," not a teleport — consistent
    // with how every other doorway in this game already works, just a new
    // place for that same interaction to happen.
    const stairMat = new THREE.MeshStandardMaterial({ color: "#5a5248", roughness: 0.7 });
    const railMat = new THREE.MeshStandardMaterial({ color: "#2c3238", roughness: 0.5, metalness: 0.2 });
    function buildStairVisual(g, x, z, dir, riseTo) {
      const STEPS = 10, stepRun = 0.32, stepW = 1.6, stepH = riseTo / STEPS;
      for (let i = 0; i < STEPS; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(stepW, stepH, stepRun), stairMat);
        step.position.set(x, stepH * (i + 0.5), z + dir * stepRun * i);
        g.add(step);
      }
      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, stepRun * STEPS), railMat);
        rail.position.set(x + side * stepW / 2, riseTo * 0.55, z + dir * stepRun * STEPS * 0.5);
        g.add(rail);
      }
    }
    function buildStairs(groundPortal, upperPortal) {
      const riseTo = upperPortal.h; // ground room's ceiling height == upper floor's own floor level
      // Ground-floor trigger, near the back-left corner, leading "up" —
      // local (room-relative) coordinates, converted to world via ox/oz.
      const glx = -groundPortal.w / 2 + 2.4, glz = -groundPortal.d / 2 + 2.4;
      buildStairVisual(groundPortal.interiorGroup, glx, glz, 1, riseTo);
      groundPortal.stairsTargetIdx = portals.indexOf(upperPortal);
      groundPortal.stairsLocalX = groundPortal.ox + glx;
      groundPortal.stairsLocalZ = groundPortal.oz + glz;
      groundPortal.stairsGoesUp = true;
      // Upper-floor landing sits at the TOP of a mirrored staircase visual
      // (steps descending back toward the ground-floor trigger's own
      // orientation), so arriving via the stairs puts the player right at
      // its top step, not floating mid-room.
      const ulx = -upperPortal.w / 2 + 2.4, ulz = -upperPortal.d / 2 + 2.4;
      buildStairVisual(upperPortal.interiorGroup, ulx, ulz, 1, riseTo);
      upperPortal.stairsTargetIdx = portals.indexOf(groundPortal);
      upperPortal.stairsLocalX = upperPortal.ox + ulx;
      upperPortal.stairsLocalZ = upperPortal.oz + ulz + 1.4;
      upperPortal.stairsGoesUp = false;
      groundPortal.stairsEntryX = upperPortal.ox + ulx;
      groundPortal.stairsEntryZ = upperPortal.oz + ulz + 1.4;
      groundPortal.stairsEntryYaw = 0;
      upperPortal.stairsEntryX = groundPortal.ox + glx;
      upperPortal.stairsEntryZ = groundPortal.oz + glz;
      upperPortal.stairsEntryYaw = 0;
    }
    let stationWhiteboardMesh = null;
    if (isStationMode) {
      // The station's own room — a garage bay: the parked vehicle silhouette
      // (a generic sedan-sized box; the real vehicle isn't picked yet at
      // this point in the flow), a desk, a locker row, and a wall-mounted
      // whiteboard (the actual call-picker trigger — see onOpenBoard below).
      const furnishStation = (g, rng, w, d) => {
        const rigMat = new THREE.MeshStandardMaterial({ color: "#8a2a32" });
        const rig = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 5.4), rigMat);
        rig.position.set(-w / 2 + 3.2, 1.05, -d / 2 + 4.5);
        g.add(rig);
        const deskMat = new THREE.MeshStandardMaterial({ color: "#4a4238" });
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 0.7), deskMat);
        desk.position.set(w / 2 - 2, 0.375, -d / 2 + 1.4);
        g.add(desk);
        const lockerMat = new THREE.MeshStandardMaterial({ color: "#2c3238" });
        for (let i = 0; i < 4; i++) {
          const locker = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.9, 0.5), lockerMat);
          locker.position.set(w / 2 - 0.4, 0.95, d / 2 - 1.5 - i * 0.8);
          g.add(locker);
        }
        // Centered on x (the entry point walks in facing straight at this
        // wall, per entryYaw=0 above), so a straight walk-forward from the
        // door lines the look-and-press raycast up with the board.
        const board = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshStandardMaterial({ color: "#EDEAE0" }));
        board.position.set(0, 1.6, -d / 2 + 0.05);
        g.add(board);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.36, 1.56, 0.04), new THREE.MeshStandardMaterial({ color: "#1c2429" }));
        frame.position.set(0, 1.6, -d / 2 + 0.02);
        g.add(frame);
        stationWhiteboardMesh = board;
      };
      addPortal(0, 8, 16, 12, 4.2, "station", "Northwood Station", 1, furnishStation);
      const stationPortal = portals[0];
      // Station-mode-only yard: a small patch outside the front door with a
      // couple of real, enterable ambient buildings for exploration — since
      // there's no dispatched route yet, these are placed nearby rather
      // than at real map coordinates (stated as a simplification in this
      // batch's own plan/report, not claimed as true geography).
      const yard = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: "#1c2429" }));
      yard.rotation.x = -Math.PI / 2; yard.position.set(0, -0.02, 20);
      outdoorGroup.add(yard);
      const doorMarker = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 8), new THREE.MeshBasicMaterial({ color: "#46E39B" }));
      doorMarker.position.set(0, 1, 9.3);
      outdoorGroup.add(doorMarker);
      const demoTypes = map?.buildings?.length ? [...new Set(map.buildings.map((b) => b.type))].filter((t) => t !== "park") : ["house", "business"];
      const demo = demoTypes.slice(0, 3);
      demo.forEach((type, i) => {
        const { w, h, d } = { hospital: { w: 24, h: 16, d: 18 }, clinic: { w: 16, h: 10, d: 14 }, school: { w: 16, h: 10, d: 14 }, business: { w: 10, h: 8, d: 9 } }[type] || { w: 8, h: 6, d: 8 };
        const bx = -18 + i * 18, bz = 26;
        const mat = new THREE.MeshStandardMaterial({ color: [0x5a6a78, 0x435463, 0x3a4652][i % 3] });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(bx, h / 2, bz);
        outdoorGroup.add(mesh);
        const dMarker = doorMarker.clone();
        dMarker.position.set(bx, 1, bz - d / 2 - 0.4);
        outdoorGroup.add(dMarker);
        addPortal(bx, bz - d / 2 - 0.6, w * 0.7, d * 0.6, h * 0.55, type, type.toUpperCase(), interiorSeed++);
      });
      // Start inside the station room; the yard/outdoorGroup is hidden
      // until the player walks out.
      outdoorGroup.visible = false;
      stationPortal.interiorGroup.visible = true;
    } else {
      // "drive" mode: every real building rendered near the route (already
      // built above into enterableBuildings) gets a real interior too —
      // hospitals get a hand-authored ER layout, everything else gets the
      // generic per-type template. Capped to keep mount cost bounded.
      for (const b of enterableBuildings.slice(0, 10)) {
        if (b.type === "hospital") {
          const furnishHospital = (g, rng, w, d) => {
            const deskMat = new THREE.MeshStandardMaterial({ color: "#4a4238" });
            const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.8), deskMat);
            desk.position.set(0, 0.45, -d / 2 + 1.6);
            g.add(desk);
            const curtainMat = new THREE.MeshStandardMaterial({ color: "#8fb0c8", transparent: true, opacity: 0.55 });
            for (let i = 0; i < 3; i++) {
              const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 2.1), curtainMat);
              curtain.position.set(-w / 2 + 4 + i * 5, 1.05, 1.5);
              g.add(curtain);
              const bed = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 3.4), new THREE.MeshStandardMaterial({ color: "#8f9aa3" }));
              bed.position.set(-w / 2 + 4 + i * 5, 0.3, 3);
              g.add(bed);
            }
          };
          addPortal(b.doorX, b.doorZ, Math.min(26, b.w * 0.75), Math.min(18, b.d * 0.7), 4.6, "hospital", b.label, b.seed, furnishHospital);
        } else if (b.type === "apartment") {
          // The multi-floor buildout: a real ground-floor lobby and a real
          // upper-floor unit, connected by an actual staircase (buildStairs
          // above) rather than one tall single-story box like every other
          // building type — the concrete "interiors and stairs" this
          // building type exists to deliver.
          const fw = Math.max(9, b.w * 0.7), fd = Math.max(8, b.d * 0.6);
          const furnishLobby = (g, rng, w, d) => {
            const mailMat = new THREE.MeshStandardMaterial({ color: "#8a8378" });
            const mail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 0.3), mailMat);
            mail.position.set(w / 2 - 1.4, 0.65, -d / 2 + 1.8);
            g.add(mail);
            const benchMat = new THREE.MeshStandardMaterial({ color: "#4a4238" });
            const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.6), benchMat);
            bench.position.set(-w / 2 + 2, 0.225, 0);
            g.add(bench);
          };
          const furnishUnit = (g, rng, w, d) => {
            const bedMat = new THREE.MeshStandardMaterial({ color: "#8f9aa3" });
            const bed = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 3), bedMat);
            bed.position.set(w / 2 - 2, 0.3, -d / 2 + 2.5);
            g.add(bed);
            const tableMat = new THREE.MeshStandardMaterial({ color: "#4a4238" });
            const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 1.4), tableMat);
            table.position.set(-w / 2 + 2.5, 0.35, d / 2 - 2.5);
            g.add(table);
            const couchMat = new THREE.MeshStandardMaterial({ color: "#5a4a52" });
            const couch = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.9), couchMat);
            couch.position.set(0, 0.3, d / 2 - 1.2);
            g.add(couch);
          };
          const ground = addPortal(b.doorX, b.doorZ, fw, fd, 3.4, "apartment", `${b.label} — Lobby`, b.seed, furnishLobby);
          const upper = addPortal(b.doorX, b.doorZ, fw, fd, 3.2, "apartment", `${b.label} — Unit 2B`, b.seed + 1, furnishUnit);
          buildStairs(ground, upper);
        } else {
          addPortal(b.doorX, b.doorZ, Math.max(5, b.w * 0.65), Math.max(4, b.d * 0.55), 3.6, b.type, b.label, b.seed);
        }
      }
    }

    const startYaw = yawFor(segs[0]?.fx ?? 0, segs[0]?.fz ?? -1);
    const S = {
      x: 0, z: 0, yaw: startYaw, speed: 0, steerVel: 0,
      odometer: 0, elapsed: 0, crashes: 0, curbHits: 0,
      sirenOn: false, sirenPhase: 0, crashed: false, arrived: false,
      lookYaw: 0, lookPitch: 0,
      _lastGravel: false, _lastOffroad: 0,
      // "board" -> "drive" -> "exit" -- co-op passengers skip straight to
      // "drive" (only the driver actually walks up and boards; a passenger
      // riding along has no vehicle of their own to approach).
      stage: isStationMode ? "board" : (isDriverRef.current ? "board" : "drive"),
      // Index into `portals` while inside a building interior; "station"
      // is the special station-room portal (index 0) in station mode;
      // null means "in the outdoor world."
      portalIdx: isStationMode ? 0 : null,
    };
    if (isStationMode) { P.x = portals[0].entryX; P.z = portals[0].entryZ; P.yaw = portals[0].entryYaw; }
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    let raf = null, hudTimer = 0, broadcastTimer = 0;

    function onE() {
      if (S.crashed || !assetsReady) return;
      if (S.stage === "board") {
        // Whiteboard (station room only) — the real call-picker trigger.
        // Checked first since it's a raycast (look-and-press), distinct
        // from the proximity-only door checks below.
        if (isStationMode && S.portalIdx === 0 && stationWhiteboardMesh) {
          raycaster.setFromCamera({ x: 0, y: 0 }, camera);
          const hit = raycaster.intersectObjects([stationWhiteboardMesh], false)[0];
          if (hit && hit.distance < 2.4) { onOpenBoard && onOpenBoard(); return; }
        }
        // Inside a building interior (portalIdx set) — near its own door
        // zone exits back to the outdoor/yard world; portals reuse the
        // same swap-visibility idiom "board" boarding uses below.
        if (S.portalIdx != null) {
          const p = portals[S.portalIdx];
          // A multi-floor building's stairs trigger — checked first, since
          // it's a real interior-to-interior transition (buildStairs
          // above), distinct from the exit-to-outdoors check right below.
          if (p.stairsTargetIdx != null) {
            const dStairs = Math.hypot(P.x - p.stairsLocalX, P.z - p.stairsLocalZ);
            if (dStairs < BOARD_DOOR_RADIUS) {
              p.interiorGroup.visible = false;
              const target = portals[p.stairsTargetIdx];
              target.interiorGroup.visible = true;
              P.x = p.stairsEntryX; P.z = p.stairsEntryZ; P.yaw = p.stairsEntryYaw ?? 0;
              S.portalIdx = p.stairsTargetIdx;
              return;
            }
          }
          const dExit = Math.hypot(P.x - p.doorLocalX, P.z - p.doorLocalZ);
          if (dExit < BOARD_DOOR_RADIUS) {
            p.interiorGroup.visible = false;
            outdoorGroup.visible = true;
            P.x = p.exitX; P.z = p.exitZ; P.yaw = 0;
            S.portalIdx = null;
          }
          return;
        }
        // Outside — near a building's real door: walk in.
        for (let i = 0; i < portals.length; i++) {
          const p = portals[i];
          if (Math.hypot(P.x - p.doorX, P.z - p.doorZ) < BOARD_DOOR_RADIUS) {
            p.interiorGroup.visible = true;
            outdoorGroup.visible = false;
            P.x = p.entryX; P.z = p.entryZ; P.yaw = p.entryYaw;
            S.portalIdx = i;
            return;
          }
        }
        // Board when near the driver door — bounded wait for the partner
        // NPC (flavor, not a puzzle: their own scripted approach always
        // finishes well inside PARTNER_BOARD_SECONDS). Not applicable in
        // station mode, which has no vehicle at this point in the flow.
        if (!isStationMode) {
          const dDoor = Math.hypot(P.x - driverDoor.x, P.z - driverDoor.z);
          if (dDoor > BOARD_DOOR_RADIUS) return;
          S.stage = "drive";
          S.x = 0; S.z = 0; S.yaw = startYaw; // real route coordinates now
          seatedPartner.visible = true;
          interiorGroup.visible = true;
        }
        return;
      }
      if (S.stage === "exit") return;
      if (S.arrived) {
        // Arrival prompt takes priority over the dash controls (both can
        // be near screen-center at once at low speed) — pressing E once
        // arrived always means "get out," matching the on-screen prompt.
        S.stage = "exit";
        return;
      }
      raycaster.setFromCamera({ x: 0, y: 0 }, camera);
      const hit = raycaster.intersectObjects(interactables, false)[0];
      if (!hit || hit.distance > 1.3) return;
      if (hit.object === sirenSwitchMesh) {
        S.sirenOn = !S.sirenOn;
        setSiren(S.sirenOn);
      } else if (hit.object === hornButtonMesh) {
        playHorn(S.x, S.z, 1.4);
      }
    }

    function step() {
      raf = requestAnimationFrame(step);
      const dt = Math.min(clock.getDelta(), 0.05);
      const running = !pausedRef.current && document.visibilityState !== "hidden" && !S.crashed && assetsReady;
      if (running && S.stage === "board") {
        // Free-walk physics toward the rig (same tank-control idiom
        // Coop3DWalk already established: W/S move along yaw, A/D turn).
        const has = (...ks) => ks.some((k) => keysRef.current.has(k));
        const w = has("w", "arrowup"), s = has("s", "arrowdown"), a = has("a", "arrowleft"), d = has("d", "arrowright");
        if (a) P.yaw += BOARD_TURN_SPEED * dt;
        if (d) P.yaw -= BOARD_TURN_SPEED * dt;
        const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
        let mv = 0; if (w) mv += 1; if (s) mv -= 1;
        if (mv !== 0) { P.x += fx * mv * BOARD_WALK_SPEED * dt; P.z += fz * mv * BOARD_WALK_SPEED * dt; }
        // Real collision, outdoors only — boardColliders holds world-space
        // building/vehicle footprints; interior room coordinates are a
        // different local space (portals swap P.x/P.z to entryX/entryZ),
        // so this only applies while S.portalIdx is null. Simple
        // circle(player)-vs-AABB(building/vehicle) push-out: clamp the
        // player's position to the box, measure the shortfall, and shove
        // straight back along that vector if it's inside the player's own
        // radius — cheap and sufficient at walking speed.
        if (S.portalIdx == null) {
          for (const c of boardColliders) {
            const cx = Math.max(c.x - c.hw, Math.min(c.x + c.hw, P.x));
            const cz = Math.max(c.z - c.hd, Math.min(c.z + c.hd, P.z));
            const dx = P.x - cx, dz = P.z - cz;
            const dist = Math.hypot(dx, dz);
            if (dist < PLAYER_RADIUS) {
              const push = dist > 0.0001 ? PLAYER_RADIUS - dist : PLAYER_RADIUS;
              const nx = dist > 0.0001 ? dx / dist : 1, nz = dist > 0.0001 ? dz / dist : 0;
              P.x += nx * push; P.z += nz * push;
            }
          }
        }
        camera.position.set(P.x, 1.6, P.z);
        camera.rotation.order = "YXZ";
        camera.rotation.y = P.yaw; camera.rotation.x = 0;

        // Building-portal / whiteboard proximity prompt — checked whether
        // inside a room (exit prompt) or outside (enter/board/whiteboard
        // prompts), same on-foot loop for both "drive" mode's board stage
        // and the whole of "station" mode.
        let prompt = null;
        if (S.portalIdx != null) {
          const p = portals[S.portalIdx];
          const dExit = Math.hypot(P.x - p.doorLocalX, P.z - p.doorLocalZ);
          if (dExit < BOARD_DOOR_RADIUS) prompt = "[E] Leave";
          if (p.stairsTargetIdx != null) {
            const dStairs = Math.hypot(P.x - p.stairsLocalX, P.z - p.stairsLocalZ);
            if (dStairs < BOARD_DOOR_RADIUS) prompt = p.stairsGoesUp ? "[E] Go upstairs" : "[E] Go downstairs";
          }
          if (isStationMode && S.portalIdx === 0 && stationWhiteboardMesh) {
            raycaster.setFromCamera({ x: 0, y: 0 }, camera);
            const hit = raycaster.intersectObjects([stationWhiteboardMesh], false)[0];
            if (hit && hit.distance < 2.4) prompt = "[E] Pick a call";
          }
        } else {
          for (const p of portals) {
            if (Math.hypot(P.x - p.doorX, P.z - p.doorZ) < BOARD_DOOR_RADIUS) { prompt = `[E] Enter ${p.label}`; break; }
          }
          if (!prompt && !isStationMode) {
            // Partner NPC's own deterministic walk to the passenger door.
            if (!partner.boarded) {
              partner.t = Math.min(1, partner.t + dt / PARTNER_BOARD_SECONDS);
              const startX = passengerDoor.x - 5, startZ = passengerDoor.z - 4;
              partner.x = startX + (passengerDoor.x - startX) * partner.t;
              partner.z = startZ + (passengerDoor.z - startZ) * partner.t;
              partnerMesh.position.set(partner.x, 0, partner.z);
              if (partner.t >= 1) { partner.boarded = true; partnerMesh.visible = false; }
            }
            const dDoor = Math.hypot(P.x - driverDoor.x, P.z - driverDoor.z);
            doorBeacon.rotation.y += dt * 1.4;
            (doorBeacon.material).color.set(dDoor < BOARD_DOOR_RADIUS ? "#46E39B" : "#2f6e56");
            if (dDoor < BOARD_DOOR_RADIUS) prompt = "[E] Get in";
          }
        }
        hudTimer -= dt;
        if (hudTimer <= 0) {
          hudTimer = 0.1;
          setHud((h) => ({ ...h, boardPrompt: prompt, stage: "board" }));
        }
        renderer.render(scene, camera);
        return;
      }
      if (running && S.stage === "exit") {
        // A short, honest hold before handing off — full exterior
        // re-staging (mirroring "board") was judged not worth the added
        // complexity for a few seconds of screen time; the fade (below)
        // is the real, visible "you got out" beat.
        S.exitTimer = (S.exitTimer ?? 0) + dt;
        setFade(Math.min(1, S.exitTimer / 0.6));
        if (S.exitTimer > 0.6 && isDriverRef.current && onFinish && !S._arrivalReported) {
          S._arrivalReported = true;
          const maxDist = maxSpeed * Math.max(1, S.elapsed);
          const ratio = S.elapsed > 0 ? Math.max(0, Math.min(1, S.odometer / maxDist)) : 0.5;
          const score = S.elapsed > 2 ? Math.max(0, Math.min(100, Math.round(ratio * 100 - S.crashes * 15 - S.curbHits * 3))) : 50;
          onFinish({ score, crashes: S.crashes, curbHits: S.curbHits, elapsed: S.elapsed });
        }
        renderer.render(scene, camera);
        return;
      }
      if (running) {
        if (isDriverRef.current) {
          const has = (...ks) => ks.some((k) => keysRef.current.has(k));
          const w = has("w", "arrowup"), s = has("s", "arrowdown"), a = has("a", "arrowleft"), d = has("d", "arrowright");
          // Real road-condition traction (lags one frame — S._lastGravel/
          // _lastOffroad are set below from THIS frame's position, read
          // next frame; negligible at 60fps). Gravel and off-road both cut
          // grip; weather stacks on top of whichever surface the car is on.
          const traction = (S._lastGravel ? GRAVEL_TRACTION : 1) *
            (S._lastOffroad > ROAD_HALF + 0.6 ? 0.65 : 1) *
            (WEATHER_TRACTION[weather] ?? 1);
          const effMaxSpeed = maxSpeed * (0.55 + 0.45 * traction);
          if (w) S.speed += profile.accel * traction * dt;
          if (s) S.speed -= BRAKE * Math.max(0.5, traction) * dt;
          if (!w && !s) { const drag = Math.min(Math.abs(S.speed), DRAG * dt); S.speed -= Math.sign(S.speed) * drag; }
          S.speed = Math.max(-effMaxSpeed * 0.4, Math.min(effMaxSpeed, S.speed));
          // Real steering: turn rate scales DOWN with speed (can't spin in
          // place at speed; a real turn radius) — the actual "no turning"
          // fix, since yaw now only ever changes from A/D input, never
          // automatically from the route. Low traction (gravel/rain/snow)
          // also costs steering authority, same as it costs top speed.
          const speedFrac = Math.min(1, Math.abs(S.speed) / Math.max(1, effMaxSpeed));
          const turnAuthority = (0.35 + 0.65 * (1 - speedFrac * 0.5)) * (0.55 + 0.45 * traction);
          const maxSteerVel = profile.turnRate * turnAuthority;
          if (Math.abs(S.speed) > 0.2) {
            if (a) S.steerVel += STEER_ACCEL * dt;
            if (d) S.steerVel -= STEER_ACCEL * dt;
            if (!a && !d) { const damp = Math.min(Math.abs(S.steerVel), STEER_DAMP * dt); S.steerVel -= Math.sign(S.steerVel) * damp; }
            S.steerVel = Math.max(-maxSteerVel, Math.min(maxSteerVel, S.steerVel));
          } else {
            // Stopped: bleed the steering wheel back to center quickly
            // rather than leaving it "wound up" for the next time the car
            // moves.
            const damp = Math.min(Math.abs(S.steerVel), STEER_DAMP * 2 * dt);
            S.steerVel -= Math.sign(S.steerVel) * damp;
          }
          S.yaw += S.steerVel * dt;
          const fx = -Math.sin(S.yaw), fz = -Math.cos(S.yaw);
          const nx = S.x + fx * S.speed * dt, nz = S.z + fz * S.speed * dt;
          S.x = nx; S.z = nz;
          S.odometer += Math.abs(S.speed) * dt;
          S.elapsed += dt;

          // Mild off-route drag (curb/shoulder friction), not a hard wall.
          // Nearest arc-length position to the car's real (x,z) — drives
          // obstacle spawn/despawn windows and the off-route drag below.
          // Not used to place the car itself (that's real free x/z motion
          // now, not a rail).
          { let bestArc = 0, bestD = Infinity, bestSeg = null;
            for (const seg of segs) {
              const t = Math.max(0, Math.min(1, ((S.x - seg.a.x) * seg.fx + (S.z - seg.a.z) * seg.fz) / (seg.len || 1)));
              const px = seg.a.x + (seg.b.x - seg.a.x) * t, pz = seg.a.z + (seg.b.z - seg.a.z) * t;
              const dd = Math.hypot(S.x - px, S.z - pz);
              if (dd < bestD) { bestD = dd; bestArc = seg.start + t * seg.len; bestSeg = seg; }
            }
            S._lastArc = bestArc; S._lastOffroad = bestD; S._lastGravel = !!bestSeg?.gravel;
          }
          if (S._lastOffroad > ROAD_HALF + 0.6) {
            const overBy = S._lastOffroad - (ROAD_HALF + 0.6);
            S.speed -= Math.sign(S.speed) * Math.min(Math.abs(S.speed), overBy * 1.8 * dt);
            // Count a curb hit once per real off-road excursion (rising
            // edge only), not every frame spent off-road.
            if (!S._offRoad && Math.abs(S.speed) > 1) { S.curbHits++; S._offRoad = true; }
          } else {
            S._offRoad = false;
          }

          spawnTimer -= dt;
          if (spawnTimer <= 0) { spawnObstacle(S._lastArc); spawnTimer = codeTuning.spawnEvery * (0.7 + Math.random() * 0.6) / Math.max(0.15, tier.obstacleMult); }
          for (let i = obstacles.length - 1; i >= 0; i--) {
            if (obstacles[i].arc < S._lastArc - OBSTACLE_BEHIND) { despawnObstacle(obstacles[i]); obstacles.splice(i, 1); }
          }
          for (const o of obstacles) {
            // Item 5 — real traffic motion: car obstacles accelerate/
            // decelerate toward a target speed (clamped to a plausible
            // ~2.5 m/s² for ordinary city driving) rather than sitting at a
            // constant velocity. The target itself drifts every few seconds
            // (real traffic doesn't hold one exact speed) UNLESS the car is
            // reacting to the player's siren — then the target drops to 0
            // (braking before the pull-over commits, below), matching real
            // driver behavior: slow first, THEN find a place to stop.
            if (o.isCar && !o.pulledOver && !o.hit) {
              if (o.reacting) {
                o.targetSpd = 0; // siren braking takes priority over a red light
              } else {
                // Real, functional traffic lights (queue item "traffic
                // lights needed"): find the nearest signalized intersection
                // ahead of THIS obstacle's own arc (a small, arc-sorted
                // list built once at mount — see signalArcList, above), and
                // if its route-axis light is red and this car is within a
                // real stopping-distance window of the stop line, brake to
                // a stop the same way siren-reaction braking already does.
                // The player's own vehicle is NOT gated here — an ambulance
                // on a call may proceed through a red light with caution,
                // matching real EMS practice; only ordinary traffic obeys.
                const upcoming = signalArcList.find((p) => p.arc > o.arc && p.arc - o.arc < 45);
                let redAhead = false;
                if (upcoming) {
                  const routeGreen = ((S.elapsed + upcoming.cycleOffset) % LIGHT_CYCLE + LIGHT_CYCLE) % LIGHT_CYCLE < LIGHT_CYCLE / 2;
                  if (!routeGreen && o.arc < upcoming.stopArc && upcoming.stopArc - o.arc < 30) redAhead = true;
                }
                if (redAhead) {
                  o.targetSpd = 0;
                } else {
                  o.retargetT -= dt;
                  if (o.retargetT <= 0) { o.targetSpd = 6 + Math.random() * 7; o.retargetT = 2 + Math.random() * 4; }
                }
              }
              const accel = 2.5 * dt;
              o.spd += Math.max(-accel, Math.min(accel, o.targetSpd - o.spd));
              o.arc += o.spd * dt;
            }
            // Item 7 (stretch goal) — ambient walking: advance this
            // pedestrian along the sidewalk (its own arc, not just the walk
            // CLIP's time) at a real walking pace while it isn't reacting to
            // a siren, occasionally pausing or reversing direction so foot
            // traffic doesn't read as a single-file march. Skipped once
            // `reacting` takes over (that logic drives `lat`, not `arc`, to
            // step further onto the curb — this loop must not fight it).
            if (o.isPed && !o.reacting && !o.hit && !o.pulledOver) {
              o.walkChangeT -= dt;
              if (o.walkChangeT <= 0) {
                o.walkChangeT = 3 + Math.random() * 6;
                o.walkPaused = Math.random() < 0.3;
                if (!o.walkPaused && Math.random() < 0.35) o.walkDir *= -1;
              }
              if (!o.walkPaused) {
                o.arc += o.walkDir * o.walkSpd * dt;
                if (o.arc < 0) { o.arc = 0; o.walkDir = 1; }
                if (o.arc > totalLen) { o.arc = totalLen; o.walkDir = -1; }
              }
              if (o.pedMixer) o.pedMixer.timeScale = o.walkPaused ? 0 : 1;
            }
            // Item 7 (stretch goal) — advance this pedestrian's own walk-
            // cycle clock every frame, independent of every other spawned
            // pedestrian's clip phase (each has its own AnimationMixer).
            if (o.pedMixer) o.pedMixer.update(dt);
            placeObstacle(o);
            // Distance-falloff "hears the siren" model (item 4): loudness
            // falls off with distance (inverse-square-flavored), so a car
            // far ahead barely accumulates hear-chance per second while a
            // close one reacts almost immediately; integrated over time
            // this converges on the stated ~60% eventual pull-over rate for
            // a car the ambulance actually closes on, not a single
            // fixed-radius coin flip.
            if ((o.isCar || o.isPed) && !o.pulledOver && S.sirenOn) {
              const dist = Math.hypot(o.worldX - S.x, o.worldZ - S.z);
              if (dist < 60) {
                const loudness = Math.min(1, 400 / (dist * dist + 20));
                o.hearAccum += loudness * dt;
                // Item 5/6 — "reacting" is the audible-and-noticed window
                // before commitment: a car blinks its turn signal, a
                // pedestrian turns to face the siren and starts stepping
                // toward the curb, both real per-frame behavior rather than
                // a snap-to-final-position on the same tick they first hear it.
                if (o.hearAccum > 0.35) o.reacting = true;
                if (o.isCar && o.reacting && o.blinker) {
                  o.blinkT += dt;
                  o.blinker.material.emissiveIntensity = Math.sin(o.blinkT * 10) > 0 ? 2.2 : 0;
                }
                if (o.isPed && o.reacting) {
                  // Turn to face the sound direction, then step further
                  // back onto the sidewalk (away from the road, not toward
                  // it) — pedestrians already live in the sidewalk band
                  // (see spawnObstacle above), so "get clear" means
                  // deeper onto the curb, the opposite direction a car's
                  // own pull-over uses.
                  const toSrc = Math.atan2(S.x - o.worldX, S.z - o.worldZ);
                  o.mesh.rotation.y = toSrc;
                  const pedCurbLat = o.lat < 0 ? -(ROAD_HALF + SIDEWALK_W - 0.4) : (ROAD_HALF + SIDEWALK_W - 0.4);
                  if (Math.abs(o.lat - pedCurbLat) > 0.05) o.lat += Math.sign(pedCurbLat - o.lat) * Math.min(Math.abs(pedCurbLat - o.lat), 1.1 * dt);
                }
                const carCurbLat = o.lat < 0 ? -2.6 : 2.6;
                if (o.hearAccum > 1 && Math.random() < 0.6 * dt * 2) {
                  o.pulledOver = true;
                  if (o.isCar) { o.lat = carCurbLat; if (o.mesh.isMesh) o.mesh.material = pulledMat; if (o.blinker) o.blinker.material.emissiveIntensity = 0; }
                }
              }
            }
            if (o.hit || o.pulledOver) continue;
            const dx2 = o.worldX - S.x, dz2 = o.worldZ - S.z;
            if (Math.hypot(dx2, dz2) < (CAR_HALF_W + o.hw + 0.3)) {
              o.hit = true;
              const impactSpeed = Math.abs(S.speed);
              const major = (o.isPed || o.isCar) && impactSpeed > MAJOR_CRASH_SPEED;
              if (major) {
                S.crashed = true;
                S.crashSpeed = impactSpeed;
                S.crashObstacle = o.isPed ? "pedestrian" : "car";
                S.crashOverSafeSpeed = impactSpeed > maxSpeed * 0.85;
              } else {
                S.crashes++; S.speed *= 0.4;
                if (o.mesh.isMesh) {
                  o.mesh.material = o.mesh.material.clone();
                  o.mesh.material.color.set("#5C6E78");
                } else {
                  // Real GLTF-model car (a Group, no single .material) —
                  // tint every child mesh instead of the whole object.
                  o.mesh.traverse((n) => { if (n.isMesh) { n.material = n.material.clone(); n.material.color.set("#5C6E78"); } });
                }
              }
            }
          }
        } else {
          const sd = sharedRef.current;
          if (sd) {
            S.x += (sd.x - S.x) * Math.min(1, dt * 4);
            S.z += (sd.z - S.z) * Math.min(1, dt * 4);
            S.yaw = sd.yaw; S.speed = sd.speed;
            S.odometer = sd.odometer; S.elapsed = sd.elapsed; S.crashes = sd.crashes; S.curbHits = sd.curbHits;
            S.sirenOn = sd.sirenOn;
          }
          spawnTimer -= dt;
          if (spawnTimer <= 0) { spawnObstacle(S._lastArc || 0); spawnTimer = codeTuning.spawnEvery * (0.7 + Math.random() * 0.6); }
          for (let i = obstacles.length - 1; i >= 0; i--) {
            if (obstacles[i].arc < (S._lastArc || 0) - OBSTACLE_BEHIND) { despawnObstacle(obstacles[i]); obstacles.splice(i, 1); }
          }
          for (const o of obstacles) { if (o.pedMixer) o.pedMixer.update(dt); placeObstacle(o); }
        }

        // Mouse-look: a limited yaw/pitch offset from the car's own
        // heading, layered on top of steering (item 4) — driving direction
        // is still controlled by S.yaw/A-D; this only changes where the
        // player is LOOKING inside the cabin.
        S.lookYaw = Math.max(-LOOK_YAW_MAX, Math.min(LOOK_YAW_MAX, S.lookYaw + mouseRef.current.dx * 0.0022));
        S.lookPitch = Math.max(-LOOK_PITCH_MAX, Math.min(LOOK_PITCH_MAX, S.lookPitch + mouseRef.current.dy * 0.0018));
        mouseRef.current.dx = 0; mouseRef.current.dy = 0;

        // Item 4 — camera imperfections: a mounted-camera feel instead of a
        // perfectly stabilized one. Pitch dips forward under braking / back
        // under acceleration (driven off this frame's real speed delta, not
        // a scripted animation), a small continuous suspension bob scaled
        // by speed and road roughness (worse on gravel/off-road, per look's
        // own roadRough), and a slight steering-linked roll. All clamped
        // small — this should read as "in a moving vehicle," not motion
        // sickness.
        const speedDelta = (S.speed - (S._prevSpeed ?? S.speed)) / Math.max(dt, 0.001);
        S._prevSpeed = S.speed;
        const accelPitch = Math.max(-0.05, Math.min(0.05, -speedDelta * 0.0026));
        S._bobT = (S._bobT ?? 0) + dt * (3 + Math.abs(S.speed) * 0.6);
        const roughness = S._lastOffroad > ROAD_HALF + 0.6 ? 2.2 : (1 - look.roadRough) * 1.4 + 0.3;
        const bob = Math.sin(S._bobT) * 0.012 * roughness * Math.min(1, Math.abs(S.speed) / 6);
        const roll = Math.max(-0.045, Math.min(0.045, -S.steerVel * 0.05));

        camera.position.set(S.x, CAM_Y + bob, S.z);
        camera.rotation.order = "YXZ";
        camera.rotation.y = S.yaw + S.lookYaw;
        camera.rotation.x = S.lookPitch + accelPitch;
        camera.rotation.z = roll;

        // Item 3/11 — advance and recycle the precipitation particles. Camera-
        // local coordinates, so this needs no world-position math at all —
        // a particle just falls in -Y until it's below the floor, then pops
        // back to the top of the box at a fresh random X/Z.
        if (precip) {
          precip.points.position.set(S.x, 0, S.z);
          const { positions, count, box, fallSpeed, drift } = precip;
          for (let i = 0; i < count; i++) {
            const iy = i * 3 + 1;
            positions[iy] -= fallSpeed * dt;
            positions[i * 3] += (Math.random() - 0.5) * drift * dt;
            if (positions[iy] < -1) {
              positions[iy] = box.yTop;
              positions[i * 3] = (Math.random() * 2 - 1) * box.x;
              positions[i * 3 + 2] = (Math.random() * 2 - 1) * box.z;
            }
          }
          precip.points.geometry.attributes.position.needsUpdate = true;
        }

        // Item 2 — siren light update: alternate red/blue in lockstep with
        // the audible siren's own sirenPhase, positioned just ahead of the
        // vehicle so the flash actually washes the road/facades in front.
        if (S.sirenOn) {
          const ahead = 2.2;
          const lx = S.x - Math.sin(S.yaw) * ahead, lz = S.z - Math.cos(S.yaw) * ahead;
          sirenLightA.position.set(lx, 2.4, lz);
          sirenLightB.position.set(lx, 2.4, lz);
          const onA = S.sirenPhase < 0.5;
          sirenLightA.intensity = onA ? 7 : 0;
          sirenLightB.intensity = onA ? 0 : 7;
          // Item 7 — the siren's real sound source rides at the same spot
          // as its own light (one source of truth for "where the siren
          // physically is"), so pan/falloff and the visible strobe agree.
          if (sirenPanner) {
            if (sirenPanner.positionX) { sirenPanner.positionX.value = lx; sirenPanner.positionY.value = 2.4; sirenPanner.positionZ.value = lz; }
            else sirenPanner.setPosition(lx, 2.4, lz);
          }
        } else {
          sirenLightA.intensity = 0; sirenLightB.intensity = 0;
        }

        // Real, FUNCTIONAL traffic-light signal cycle: each signalized
        // intersection has its own desynced phase (tl.cycleOffset, a
        // deterministic per-node hash — see hashOffset, module scope) so
        // the whole city doesn't blink in lockstep, and the route axis and
        // cross axis are exact complements of the same formula, so they can
        // never both show green at once. The SAME LIGHT_CYCLE constant (and
        // the same formula) drives the obstacle-braking check further down
        // — they can't drift apart. Emergency traffic (the player) doesn't
        // legally have to obey a red light on a call and stays exempt;
        // ordinary traffic obstacles now genuinely stop for one (see that
        // check's own comment).
        if (trafficLights.length) {
          for (const tl of trafficLights) {
            const routeGreen = ((S.elapsed + tl.cycleOffset) % LIGHT_CYCLE + LIGHT_CYCLE) % LIGHT_CYCLE < LIGHT_CYCLE / 2;
            const green = tl.axis === "route" ? routeGreen : !routeGreen;
            tl.green.emissiveIntensity = green ? 1.6 : 0;
            tl.red.emissiveIntensity = green ? 0 : 1.6;
          }
        }

        // Item 7 — real AudioListener tracking: position at the camera,
        // forward/up vectors derived from the same yaw+lookYaw/lookPitch
        // the camera itself renders with, so panning genuinely follows
        // where the player is looking, not just where the car is pointed.
        if (audioCtx && audioCtx.listener) {
          const lis = audioCtx.listener;
          const fx = -Math.sin(S.yaw + S.lookYaw) * Math.cos(S.lookPitch + accelPitch);
          const fz = -Math.cos(S.yaw + S.lookYaw) * Math.cos(S.lookPitch + accelPitch);
          const fy = Math.sin(S.lookPitch + accelPitch);
          if (lis.positionX) {
            lis.positionX.value = S.x; lis.positionY.value = CAM_Y + bob; lis.positionZ.value = S.z;
            lis.forwardX.value = fx; lis.forwardY.value = fy; lis.forwardZ.value = fz;
            lis.upX.value = 0; lis.upY.value = 1; lis.upZ.value = 0;
          } else if (lis.setPosition) {
            lis.setPosition(S.x, CAM_Y + bob, S.z);
            lis.setOrientation(fx, fy, fz, 0, 1, 0);
          }
        }

        // Real GPS: live bearing + distance to the actual destination
        // waypoint, same idiom Coop3DWalk already established.
        const dx = destPoint.x - S.x, dz = destPoint.z - S.z;
        const dist = Math.hypot(dx, dz);
        const worldBearing = Math.atan2(dx, dz);
        const rel = ((worldBearing - S.yaw) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        if (dist < ARRIVE_RADIUS && !S.arrived) { S.arrived = true; }

        // Minimap draw — a real, live top-down render of the actual route
        // (segs, the same geometry the 3D road is built from), throttled to
        // ~10fps (hudTimer's own cadence) since a canvas 2D redraw every
        // frame isn't needed for something this size.
        if (S.stage === "drive" && minimapRef.current && hudTimer <= 0) {
          const cv = minimapRef.current, ctx = cv.getContext("2d");
          if (ctx) {
            const W = cv.width, H = cv.height, ZOOM = 2.1; // px per world meter
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "rgba(11,15,18,.001)"; ctx.fillRect(0, 0, W, H);
            const toPx = (x, z) => [W / 2 + (x - S.x) * ZOOM, H / 2 + (z - S.z) * ZOOM];
            ctx.strokeStyle = "#3a434b"; ctx.lineWidth = 4; ctx.lineCap = "round";
            ctx.beginPath();
            for (const seg of segs) {
              const [ax, az] = toPx(seg.a.x, seg.a.z), [bx, bz] = toPx(seg.b.x, seg.b.z);
              ctx.moveTo(ax, az); ctx.lineTo(bx, bz);
            }
            ctx.stroke();
            const [dxp, dzp] = toPx(destPoint.x, destPoint.z);
            ctx.fillStyle = "#46E39B";
            ctx.beginPath(); ctx.arc(dxp, dzp, 4, 0, Math.PI * 2); ctx.fill();
            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctx.rotate(S.yaw);
            ctx.fillStyle = "#F2A33C";
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 5); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
            ctx.restore();
          }
        }

        // Doppler: real relative-velocity-driven pitch shift toward the
        // nearest car obstacle ahead, standard approaching-raises-pitch /
        // receding-lowers-pitch physics, not a flat tone.
        if (sirenOsc && audioCtx) {
          let bestD = Infinity, relSpeed = 0;
          for (const o of obstacles) {
            if (o.isHole) continue;
            const d = Math.hypot(o.worldX - S.x, o.worldZ - S.z);
            if (d < bestD) {
              bestD = d;
              const toObs = { x: (o.worldX - S.x) / (d || 1), z: (o.worldZ - S.z) / (d || 1) };
              const vx = -Math.sin(S.yaw) * S.speed, vz = -Math.cos(S.yaw) * S.speed;
              relSpeed = vx * toObs.x + vz * toObs.z; // + = closing
            }
          }
          const SOUND_SPEED = 343;
          const nearestRate = bestD < 80 ? SOUND_SPEED / Math.max(40, SOUND_SPEED - relSpeed) : 1;
          const targetFreq = (S.sirenPhase < 0.5 ? 880 : 610) * nearestRate;
          sirenOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.08);
          S.sirenPhase += dt / 0.55; if (S.sirenPhase > 1) S.sirenPhase = 0;
        }

        // Interactable highlight (look-and-press E) — raycast every frame
        // from screen center against the cockpit's dash controls.
        let lookPrompt = S.arrived ? "[E] Put it in park and get out" : null;
        if (!S.arrived && interactables.length) {
          raycaster.setFromCamera({ x: 0, y: 0 }, camera);
          const hit = raycaster.intersectObjects(interactables, false)[0];
          for (const m of interactables) m.material.color.setHex(baseEmissive.get(m));
          if (hit && hit.distance < 1.3) {
            hit.object.material.color.setHex(0x46e39b);
            lookPrompt = hit.object === sirenSwitchMesh ? (S.sirenOn ? "[E] Siren off" : "[E] Siren on") : "[E] Horn";
          }
        }

        hudTimer -= dt;
        if (hudTimer <= 0) {
          hudTimer = 0.1;
          setHud({
            mph: Math.round((S.speed / maxSpeed) * (maxSpeed * 2.2)),
            crashes: S.crashes, curbHits: S.curbHits,
            bearing: rel, dist, arrived: S.arrived, sirenOn: S.sirenOn, lookPrompt,
            boardPrompt: null, stage: S.stage,
          });
        }
        if (isDriverRef.current && onBroadcast) {
          broadcastTimer -= dt;
          if (broadcastTimer <= 0) {
            broadcastTimer = 0.24;
            onBroadcast({ x: S.x, z: S.z, yaw: S.yaw, speed: S.speed, odometer: S.odometer, elapsed: S.elapsed, crashes: S.crashes, curbHits: S.curbHits, sirenOn: S.sirenOn });
          }
        }
        // Arrival no longer auto-finishes the drive — S.arrived just
        // surfaces the "[E] Get out" prompt (rendered below) and lets
        // onE() move S.stage to "exit", which is what actually reports the
        // score and fires onFinish once the exit beat completes.
        if (S.crashed && !S._crashFading) {
          S._crashFading = true;
          setFade(1);
          setTimeout(() => {
            if (onCrash) onCrash({
              atFault: !!S.crashOverSafeSpeed || S.crashObstacle === "pedestrian",
              obstacle: S.crashObstacle, speed: Math.round(S.crashSpeed), siren: S.sirenOn,
            });
          }, 1050);
        }
      }
      renderer.render(scene, camera);
    }
    // assetsReady gates real interaction (see `running`/onE above), `ready`
    // (React state) only gates the "Loading scene…" overlay text — the
    // render loop itself always starts immediately so the scene visibly
    // resolves in place as its own assets arrive, rather than staring at a
    // blank screen. `queuedAnyLoad` is set synchronously by
    // loadingManager.onStart the instant the first gltfLoader.load() call
    // fires above (before this point), so it's already correct by the time
    // we check it here — if this mount genuinely queued nothing (shouldn't
    // happen for "drive"/"station", every mode loads at least the vehicle
    // or the station's own furniture models, but stated honestly rather
    // than assumed), don't wait forever for an onLoad that will never
    // fire (LoadingManager only calls onLoad once itemsTotal>0).
    let assetsReady = !queuedAnyLoad;
    // Wrapped in setTimeout, not called bare — this project's own linter
    // (react-hooks/set-state-in-effect) flags a synchronous setState call
    // directly in an effect body; the same fix this codebase already
    // applies elsewhere for the identical rule.
    if (assetsReady) setTimeout(() => setReady(true), 0);
    let readyFallback = null;
    loadingManager.onLoad = () => {
      assetsReady = true;
      setReady(true);
      if (readyFallback) { clearTimeout(readyFallback); readyFallback = null; }
    };
    if (!assetsReady) {
      // Defensive only — a stalled/failed network request shouldn't strand
      // a player on the loading screen forever. Individual model failures
      // already have real per-asset fallback geometry (the boxes this file
      // already falls back to); this just guarantees the gate itself can't
      // hang.
      readyFallback = setTimeout(() => { assetsReady = true; setReady(true); }, 12000);
    }
    raf = requestAnimationFrame(step);

    const onKeyE = (e) => { if (e.key.toLowerCase() === "e") onE(); };
    window.addEventListener("keydown", onKeyE);

    return () => {
      cancelAnimationFrame(raf);
      if (readyFallback) clearTimeout(readyFallback);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyE);
      setSiren(false);
      try { audioCtx && audioCtx.close(); } catch { /* already closed */ }
      if (isDriverRef.current && onFinish && !S._arrivalReported && !S.crashed) {
        // Unmounted before arriving (phase forced elsewhere, e.g. driving
        // mode toggled off mid-drive, or driving-mode-disabled fallback) —
        // still report whatever partial score exists rather than silently
        // dropping it.
        const maxDist = maxSpeed * Math.max(1, S.elapsed);
        const ratio = S.elapsed > 0 ? Math.max(0, Math.min(1, S.odometer / maxDist)) : 0.5;
        const score = S.elapsed > 2 ? Math.max(0, Math.min(100, Math.round(ratio * 100 - S.crashes * 15 - S.curbHits * 3))) : 50;
        onFinish({ score, crashes: S.crashes, curbHits: S.curbHits, elapsed: S.elapsed });
      }
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      if (renderer.domElement && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
    // isDriver/route/map/vehType/code deliberately excluded — this
    // component is fixed for one call's whole life (one mount = one
    // drive), same as before; see isDriverRef's own comment (a driver-
    // election flip mid-drive must not tear down and rebuild the scene or
    // fire the unmount-only onFinish/onCrash paths).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (!DRIVE_KEYS.has(k)) return;
      e.preventDefault();
      keysRef.current.add(k);
    };
    const up = (e) => { const k = e.key.toLowerCase(); keysRef.current.delete(k); };
    // Real bug fix: if the window loses focus while a key is held (alt-tab,
    // clicking browser chrome, a modal stealing focus), the keyup event
    // never fires and that key stays "held" forever — a permanently stuck
    // "a" reads as the car turning left on its own with no way to cancel it
    // short of pressing "d". Clear every held key on blur/visibility-hidden.
    const clearKeys = () => keysRef.current.clear();
    const onVisibility = () => { if (document.hidden) clearKeys(); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clearKeys);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Mouse-look: drag or pointer-move over the canvas accumulates a delta
  // consumed by the physics loop each frame (item 4) — no pointer-lock
  // requested, so no permission prompt, same reasoning Coop3DWalk's own
  // header gives for tank-control turning over mouse-look there.
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let dragging = false, lastX = 0, lastY = 0;
    const down = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const move = (e) => {
      if (!dragging) return;
      mouseRef.current.dx += e.clientX - lastX;
      mouseRef.current.dy += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
    };
    const upFn = () => { dragging = false; };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", upFn);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", upFn);
    };
  }, []);

  const tuningLabel = (CODE_TUNING[code] || CODE_TUNING[2]).label;
  // Portaled straight to <body>: the response-phase screen this mounts
  // inside of applies a CSS transform for its screen-shake effect
  // (App.jsx's "rock" class), and a transformed ancestor becomes the
  // containing block for any `position:fixed` descendant per spec — so
  // without the portal this would NOT actually cover the viewport, just
  // the shake container's own box. Confirmed live (a first version
  // rendered a ~620px-wide panel, not full-screen) before adding this.
  return createPortal((<div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#0A0F12", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 14px" }}>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: C.red }}>
        {mode === "station" ? "🏢 NORTHWOOD STATION" : hud.stage === "board" ? "🚑 GET IN THE RIG" : "🚑 DRIVE"} — {mode === "station" ? "WALK TO THE WHITEBOARD TO PICK A CALL" : tuningLabel}{mode !== "station" && !isDriver && ` — RIDING WITH ${(driverName || "YOUR PARTNER").toUpperCase()}`}</span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint }}>{mode !== "station" && vehName}</span>
    </div>
    <div ref={mountRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0c1114", cursor: "grab" }}>
      {!ready && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: MONO, fontSize: 12, color: C.dim, background: "#0A0F12" }}>
        <div>Loading scene{loadProgress.total ? `… ${loadProgress.loaded}/${loadProgress.total}` : "…"}</div>
        {loadProgress.total > 0 && <div style={{ width: 180, height: 4, background: C.line, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${Math.round((loadProgress.loaded / loadProgress.total) * 100)}%`, height: "100%", background: C.amber, transition: "width .15s linear" }} />
        </div>}
      </div>}
      {/* Real GPS HUD — live compass + distance to the actual destination,
          same idiom Coop3DWalk already uses; arrival ends the drive for
          real (App.jsx), not a fixed timer. */}
      {hud.stage !== "board" && <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(11,15,18,.85)", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 10px", fontFamily: MONO, textAlign: "center", minWidth: 78 }}>
        <div style={{ fontSize: 20, transform: `rotate(${Math.round((hud.bearing * 180) / Math.PI)}deg)`, color: hud.arrived ? C.hr : C.amber }}>▲</div>
        <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>{Math.round(hud.dist)}m</div>
      </div>}
      {/* Real minimap/GPS — a live top-down canvas of the actual route the
          car is driving (the same `segs` road geometry the 3D scene itself
          renders, not a decorative fake), player position + heading as a
          triangle, destination as a dot. North-up, fixed zoom. */}
      {hud.stage === "drive" && <canvas ref={minimapRef} width={148} height={148}
        style={{ position: "absolute", top: 10, left: 10, borderRadius: 6, border: `1px solid ${C.line}`, background: "rgba(11,15,18,.85)" }} />}
      {hud.sirenOn && <div style={{ position: "absolute", top: hud.stage === "drive" ? 164 : 10, left: 10, fontFamily: MONO, fontSize: 11, color: C.red, background: "rgba(11,15,18,.85)", border: `1px solid ${C.red}`, borderRadius: 6, padding: "6px 10px" }}>🚨 SIREN ON</div>}
      {hud.lookPrompt && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,140%)", fontFamily: MONO, fontSize: 12, color: C.text, background: "rgba(11,15,18,.85)", borderRadius: 6, padding: "5px 10px" }}>{hud.lookPrompt}</div>}
      {hud.boardPrompt && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,140%)", fontFamily: MONO, fontSize: 12, color: C.text, background: "rgba(11,15,18,.85)", borderRadius: 6, padding: "5px 10px" }}>{hud.boardPrompt}</div>}
      {hud.arrived && hud.stage === "drive" && <div style={{ position: "absolute", bottom: 46, left: 10, right: 10, textAlign: "center", fontFamily: MONO, fontSize: 12, color: C.hr, background: "rgba(11,15,18,.85)", borderRadius: 6, padding: "8px" }}>ON SCENE — get out when ready.</div>}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: fade, transition: "opacity 1s linear", pointerEvents: "none" }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", fontFamily: MONO, fontSize: 11, color: C.dim }}>
      <span>{mode === "station" ? "W forward · S back · A/D turn — walk up to something and press E"
        : !isDriver ? "You're not driving — watching the road."
        : hud.stage === "board" ? "W forward · S back · A/D turn — walk to the rig and press E to get in"
        : "W accelerate · S brake · A/D turn · drag to look · E to use a control"}</span>
      <span>{hud.stage === "drive" && `${hud.mph} MPH${hud.crashes > 0 ? ` · ${hud.crashes} hit${hud.crashes > 1 ? "s" : ""}` : ""}`}</span>
    </div>
  </div>), document.body);
}
