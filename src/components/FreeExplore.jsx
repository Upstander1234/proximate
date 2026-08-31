import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { C, MONO } from "../theme.js";

// FreeExplore — a TEMPORARY, dev-facing free-roam mode (explicit operator
// request while auditing the 3D map/driving experience, not a numbered
// front-end queue item and not meant to be a polished feature). It exists
// so the map's building layout/density/campus content can actually be
// walked around and looked at outside of a real call, without dispatching
// one every time.
//
// Deliberately reuses Coop3DWalk.jsx's core walk loop (WASD tank controls,
// ground/sidewalk plane, box-per-building collision, requestAnimationFrame
// render loop, mount/unmount disposal) rather than editing that file —
// Coop3DWalk is tightly coupled to the real co-op call flow (peer sync,
// GPS-to-target HUD, onArrive gating the approach phase) and none of that
// applies here, so a sibling component avoids putting mode-switch branches
// into code a real call depends on. Everything specific to a real call
// (target beacon, arrival, broadcast, peer avatars) is stripped; everything
// specific to "walk around and look at the world" (rendering EVERY building
// on the map, not just the 6 nearest one incident) is new.
const WALK_SPEED = 4.2, TURN_SPEED = 2.3, MOUSE_SENS = 0.0022;
const WALK_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
const MAX_PITCH = Math.PI / 2 - 0.08;
// A real, drivable vehicle inside this same walkable world (previously
// DrivingScene.jsx-only, and only along a fixed station->incident route) —
// the "blend into the general 3D world, get in/out at will" ask. Deliberately
// a simpler physics model than DrivingScene's own (no siren/crash/traffic —
// this is still the same "temporary layout-inspection tool" this file's own
// header already frames itself as, not a second copy of the full driving
// minigame), reusing the same accel/steer-velocity SHAPE rather than the
// exact tuned constants, since this file's own convention (see the header
// comment) is to duplicate rather than import from sibling scene files.
const VEH_MAX_SPEED = 32, VEH_ACCEL = 9, VEH_BRAKE = 13, VEH_DRAG = 3.5;
const VEH_TURN_RATE = 1.9, VEH_STEER_ACCEL = 3.4, VEH_STEER_DAMP = 7;
const VEH_DOOR_RADIUS = 2.6;
const VEH_COLLIDE_RADIUS = 1.3; // wider than the on-foot 0.4 push-out — a car is bigger than a person

// A simple pair of first-person hands/forearms, sized and posed like a
// generic FPS viewmodel — not a real character rig, just enough that "you"
// exist in the scene instead of a disembodied camera. Parented to the
// camera so it always sits in view-space regardless of look direction.
function buildHandsRig() {
  const rig = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: "#c99a76", roughness: 0.75 });
  const sleeveMat = new THREE.MeshStandardMaterial({ color: "#2c3540", roughness: 0.85 });
  function makeArm(side) {
    const arm = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.22, 4, 8), sleeveMat);
    sleeve.position.set(0, -0.02, 0);
    sleeve.rotation.x = Math.PI / 2.6;
    arm.add(sleeve);
    const hand = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.11, 4, 8), skinMat);
    hand.position.set(0, -0.18, -0.24);
    hand.rotation.x = Math.PI / 2.3;
    arm.add(hand);
    arm.position.set(side === "l" ? -0.22 : 0.22, -0.32, -0.42);
    arm.rotation.z = side === "l" ? 0.18 : -0.18;
    return arm;
  }
  rig.add(makeArm("l"));
  rig.add(makeArm("r"));
  rig.renderOrder = 999;
  return rig;
}

// Same box-per-type sizing spirit as Coop3DWalk's own FALLBACK_LAYOUT —
// this mode has no real 3D building models loaded (deliberately: the point
// is to see LAYOUT/DENSITY, and loading every GLTF building model would
// reintroduce exactly the perf/loading problems this whole pass exists to
// fix), so every building is a labeled box sized roughly by type.
const SIZE_FOR = {
  hospital: { w: 26, h: 22, d: 22 }, skyscraper: { w: 22, h: 26, d: 22 },
  school: { w: 20, h: 10, d: 16 }, cityHall: { w: 18, h: 14, d: 16 },
  fireStation: { w: 16, h: 9, d: 18 }, emsStation: { w: 14, h: 8, d: 16 },
  privateEmsStation: { w: 14, h: 8, d: 16 }, policeStation: { w: 16, h: 9, d: 16 },
  volunteerStation: { w: 12, h: 7, d: 14 }, university: { w: 24, h: 12, d: 20 },
  business: { w: 12, h: 8, d: 12 }, clinic: { w: 12, h: 7, d: 12 },
  park: { w: 10, h: 0.2, d: 10 }, house: { w: 8, h: 6, d: 8 },
};
const COLOR_FOR = {
  hospital: "#c85a5a", skyscraper: "#4a5868", school: "#c8a25a", cityHall: "#8a7ac8",
  fireStation: "#c04a3a", emsStation: "#3a7ac0", privateEmsStation: "#3a9ac0",
  policeStation: "#3a4ac0", volunteerStation: "#5a9a5a", university: "#7a5ac8",
  business: "#39434c", clinic: "#5a9ac8", park: "#2f5a3a", house: "#4a4a52",
};

// A plain primitive car (body/cabin/wheels) — same "no real 3D models"
// discipline this file's own SIZE_FOR/COLOR_FOR box buildings already
// follow, not a GLTF load.
function buildCarMesh() {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: "#8a2a32", roughness: 0.45, metalness: 0.2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 4.0), bodyMat);
  body.position.y = 0.55;
  car.add(body);
  const cabinMat = new THREE.MeshStandardMaterial({ color: "#cfe0e8", roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.7 });
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 2.0), cabinMat);
  cabin.position.set(0, 1.15, -0.2);
  car.add(cabin);
  const wheelMat = new THREE.MeshStandardMaterial({ color: "#14171a", roughness: 0.9 });
  for (const [wx, wz] of [[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.28, 12), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.32, wz);
    car.add(wheel);
  }
  return car;
}

export default function FreeExplore({ mapId, map, spawnVehicle, onExit }) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState({ nearby: null, mode: "walk", speedMph: 0, vehiclePrompt: null });
  const [looking, setLooking] = useState(false);
  const wasLockedRef = useRef(false);
  const keysRef = useRef(new Set());
  // Bridges the two separate useEffects below (movement/mount vs. the
  // key-listener effect, split the same way this file already splits them
  // — see the key-listener effect's own comment for why): the key listener
  // has no access to the mount effect's own closure (car/mode/V/P), so it
  // calls through this ref instead of needing the two effects merged.
  const onERef = useRef(() => {});

  useEffect(() => {
    const el = mountRef.current;
    if (!el || !map) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d1a14");
    scene.fog = new THREE.Fog("#0d1a14", 40, 260);
    const camera = new THREE.PerspectiveCamera(72, el.clientWidth / (el.clientHeight || 300), 0.1, 600);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(el.clientWidth, el.clientHeight || 300);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // No shadow map here — dozens of simple boxes across a big open map
    // don't need it for a temporary layout-inspection mode, and skipping it
    // keeps this genuinely cheap regardless of how the real perf work above
    // shakes out.
    el.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight("#9fc4d8", "#1a221c", 1.1));
    const sun = new THREE.DirectionalLight("#fff2d8", 0.8);
    sun.position.set(-30, 60, 20);
    scene.add(sun);

    // Real map data, not a fixed fallback: every node's real (x,y) averaged
    // gives a map-agnostic origin (works for city/suburban/rural without
    // needing to know each map's own node-id prefix), and every real
    // building (node position + its own offset, same field CityMap.jsx
    // already reads for 2D icon placement) becomes a walkable, labeled box.
    const nodes = map.nodes || [];
    const originX = nodes.reduce((a, n) => a + n.x, 0) / (nodes.length || 1);
    const originY = nodes.reduce((a, n) => a + n.y, 0) / (nodes.length || 1);
    const SCALE = 0.5; // map units are real meters at city scale; halve so a big 7x7 grid stays walkable in a reasonable number of steps

    const w = ((map.bounds?.width || 600) * SCALE) + 80, d = ((map.bounds?.height || 600) * SCALE) + 80;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: "#1c2a20", roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const buildings = [];
    for (const b of (map.buildings || [])) {
      const node = nodes.find((n) => n.id === b.node);
      if (!node) continue;
      const off = b.offset || { dx: 0, dy: 0 };
      const x = (node.x + off.dx - originX) * SCALE, z = -(node.y + off.dy - originY) * SCALE;
      const size = SIZE_FOR[b.type] || { w: 10, h: 8, d: 10 };
      const mat = new THREE.MeshStandardMaterial({ color: COLOR_FOR[b.type] || "#39434c", roughness: 0.8 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.w, size.h, size.d), mat);
      mesh.position.set(x, size.h / 2, z);
      scene.add(mesh);
      buildings.push({ x, z, hw: size.w / 2 + 0.5, hd: size.d / 2 + 0.5, label: b.name || b.type });
    }

    camera.position.set(0, 1.6, 0);
    camera.rotation.order = "YXZ";
    scene.add(camera);

    const hands = buildHandsRig();
    hands.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.depthTest = false; } });
    camera.add(hands);

    function resize() {
      const cw = el.clientWidth, ch = el.clientHeight || 300;
      camera.aspect = cw / ch; camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Same circle-vs-box push-out Coop3DWalk uses — "go around it," not a
    // full physics engine. `radius` defaults to the on-foot push-out margin;
    // the vehicle below passes a wider one (VEH_COLLIDE_RADIUS) since a car
    // is bigger than a person.
    function collideAndSlide(nx, nz, radius = 0.4) {
      let x = nx, z = nz;
      for (const b of buildings) {
        const dx = x - b.x, dz = z - b.z;
        const px = Math.max(-b.hw, Math.min(b.hw, dx)), pz = Math.max(-b.hd, Math.min(b.hd, dz));
        const ox = dx - px, oz = dz - pz;
        if (Math.hypot(ox, oz) < radius) {
          if (Math.abs(dx) / b.hw > Math.abs(dz) / b.hd) x = b.x + (dx >= 0 ? b.hw + radius : -(b.hw + radius));
          else z = b.z + (dz >= 0 ? b.hd + radius : -(b.hd + radius));
        }
      }
      return { x, z };
    }

    const P = { x: 0, z: 0, yaw: 0, pitch: 0 };
    // The vehicle — only built at all if the player chose "spawn with a
    // vehicle" on the picker screen (App.jsx). Spawned a few meters from the
    // player's own origin so it's immediately visible and walkable-to, not
    // hidden somewhere on a big map.
    // Finds a spot genuinely clear of every building (collideAndSlide needs
    // to push a test point by less than 5cm to call it "clear"), rather than
    // a fixed offset from the player's own spawn — the map-agnostic origin
    // (average of every node) can land close to real building geometry
    // depending on the map, and a fixed offset was found, via a real
    // browser session, to sometimes land the vehicle INSIDE a building.
    // Prefers straight ahead of the player's own default facing (-z, yaw=0)
    // at increasing distance first (the common case: a few meters of open
    // street in front of you), falling back to a full ring search only if
    // that direction is unusually dense.
    function findClearSpawn(baseX, baseZ) {
      const candidates = [];
      for (let r = 3; r <= 14; r += 2) candidates.push([baseX, baseZ - r]);
      for (let ring = 0; ring < 4; ring++) {
        const radius = 3 + ring * 2.5;
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          candidates.push([baseX + Math.cos(ang) * radius, baseZ + Math.sin(ang) * radius]);
        }
      }
      for (const [tx, tz] of candidates) {
        const c = collideAndSlide(tx, tz, VEH_COLLIDE_RADIUS);
        if (Math.hypot(c.x - tx, c.z - tz) < 0.05) return { x: tx, z: tz };
      }
      return { x: baseX, z: baseZ - 3 }; // every candidate was blocked — rare; spawn anyway rather than not at all
    }
    const car = spawnVehicle ? buildCarMesh() : null;
    const carSpawn = spawnVehicle ? findClearSpawn(0, 0) : { x: 0, z: -3 };
    const V = { x: carSpawn.x, z: carSpawn.z, yaw: 0, speed: 0, steerVel: 0 };
    let mode = "walk"; // "walk" | "drive" — real get-in/get-out at will, not a fixed board->drive->exit sequence
    if (car) { car.position.set(V.x, 0, V.z); car.rotation.y = V.yaw; scene.add(car); }
    // Real E-press interact, mirroring the exact proximity-trigger idiom
    // DrivingScene.jsx's own board/exit E-press already uses — walk up to
    // the car and press E to get in; press E again at ANY point while
    // driving (not just at a scripted arrival) to park exactly where the
    // car currently sits and step out beside it. onERef is read by the
    // separate key-listener effect below.
    function interact() {
      if (!car) return;
      if (mode === "walk") {
        if (Math.hypot(P.x - V.x, P.z - V.z) < VEH_DOOR_RADIUS) {
          mode = "drive";
          V.speed = 0; V.steerVel = 0;
        }
        return;
      }
      mode = "walk";
      V.speed = 0; V.steerVel = 0; // parked — a real "took your foot off the pedal," not just a camera-mode flip
      const rx = -Math.sin(V.yaw + Math.PI / 2), rz = -Math.cos(V.yaw + Math.PI / 2);
      const exitPt = collideAndSlide(V.x + rx * 2.3, V.z + rz * 2.3, 0.4);
      P.x = exitPt.x; P.z = exitPt.z; P.yaw = V.yaw; P.pitch = 0;
    }
    onERef.current = interact;
    // Dev-only, read-only test telemetry — same gated pattern App.jsx's own
    // window.__proximateTestGetState already uses (import.meta.env.DEV, so
    // Vite strips it from a production build). FreeExplore's own mode/
    // vehicle/player state lives entirely in this closure, invisible to
    // that global `g`-state hook, so real browser verification of "press E
    // near the car, drive it, press E again to park" needs its own way in.
    if (import.meta.env.DEV) {
      window.__proximateTestFreeExplore = () => ({
        mode, hasCar: !!car,
        P: { x: P.x, z: P.z, yaw: P.yaw },
        V: { x: V.x, z: V.z, yaw: V.yaw, speed: V.speed },
      });
    }
    const clock = new THREE.Clock();
    let raf = null, hudTimer = 0, bobT = 0, bobAmp = 0;

    // Mouse-look: pointer lock so raw mousemove deltas drive yaw/pitch, the
    // same convention as any FPS. Movement (WASD) stays yaw-only — pitch
    // never affects walk direction, matching how a real FPS decouples
    // "where you're looking" from "which way you're walking."
    function onMouseMove(e) {
      P.yaw -= (e.movementX || 0) * MOUSE_SENS;
      P.pitch -= (e.movementY || 0) * MOUSE_SENS;
      P.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, P.pitch));
    }
    function onPointerLockChange() {
      const locked = document.pointerLockElement === el;
      setLooking(locked);
      if (!locked && wasLockedRef.current) wasLockedRef.current = Date.now();
      else if (locked) wasLockedRef.current = true;
      if (locked) document.addEventListener("mousemove", onMouseMove);
      else document.removeEventListener("mousemove", onMouseMove);
    }
    function requestLock() { if (document.pointerLockElement !== el) el.requestPointerLock?.(); }
    el.addEventListener("click", requestLock);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    function stepWalk(dt) {
      const has = (...ks) => ks.some((k) => keysRef.current.has(k));
      const wk = has("w", "arrowup"), sk = has("s", "arrowdown"), ak = has("a", "arrowleft"), dk = has("d", "arrowright");
      // A/D still turn (keyboard-only look) when the mouse isn't locked —
      // once pointer-locked, the mouse is the primary look input and A/D
      // become pure strafe, the standard FPS split.
      const locked = document.pointerLockElement === el;
      if (!locked) { if (ak) P.yaw += TURN_SPEED * dt; if (dk) P.yaw -= TURN_SPEED * dt; }
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
      const rx = -Math.sin(P.yaw + Math.PI / 2), rz = -Math.cos(P.yaw + Math.PI / 2);
      let mv = 0; if (wk) mv += 1; if (sk) mv -= 1;
      let sv = 0; if (locked) { if (ak) sv -= 1; if (dk) sv += 1; }
      const moving = mv !== 0 || sv !== 0;
      if (moving) {
        const nx = P.x + (fx * mv + rx * sv) * WALK_SPEED * dt;
        const nz = P.z + (fz * mv + rz * sv) * WALK_SPEED * dt;
        const c = collideAndSlide(nx, nz);
        P.x = c.x; P.z = c.z;
        bobT += dt * 9;
      }
      // Damp the bob amplitude toward 0 when idle rather than snapping,
      // so stopping doesn't jump the camera/hands to a mid-cycle offset.
      bobAmp = moving ? Math.min(1, bobAmp + dt * 8) : Math.max(0, bobAmp - dt * 8);
      camera.position.set(P.x, 1.6 + Math.sin(bobT) * 0.035 * bobAmp, P.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = P.yaw;
      camera.rotation.x = P.pitch;
      hands.position.set(0, Math.sin(bobT * 2) * 0.012 * bobAmp, Math.cos(bobT) * 0.006 * bobAmp);
      hands.visible = true;

      hudTimer -= dt;
      if (hudTimer <= 0) {
        hudTimer = 0.15;
        let nearest = null, nearestDist = Infinity;
        for (const b of buildings) {
          const dist = Math.hypot(b.x - P.x, b.z - P.z);
          if (dist < nearestDist) { nearestDist = dist; nearest = b; }
        }
        const vDist = car ? Math.hypot(P.x - V.x, P.z - V.z) : Infinity;
        setHud({
          nearby: nearest && nearestDist < 30 ? nearest.label : null,
          mode: "walk",
          speedMph: 0,
          vehiclePrompt: vDist < VEH_DOOR_RADIUS ? "[E] Get in the vehicle" : null,
        });
      }
    }

    // Real vehicle physics — same accel/steer-velocity SHAPE DrivingScene.jsx
    // uses (damped steering, speed-scaled steer authority, drag-when-idle),
    // reused at simpler tuning since this mode has no vehicle-type roster to
    // read a profile from. Third-person chase camera (not DrivingScene's own
    // first-person dashboard — building a whole cockpit for this "temporary
    // layout tool" mode would be real scope creep past what was asked for).
    function stepDrive(dt) {
      const has = (...ks) => ks.some((k) => keysRef.current.has(k));
      const wk = has("w", "arrowup"), sk = has("s", "arrowdown"), ak = has("a", "arrowleft"), dk = has("d", "arrowright");
      const speedFrac = Math.min(1, Math.abs(V.speed) / VEH_MAX_SPEED);
      const steerAuthority = 1 - speedFrac * 0.55;
      if (ak) V.steerVel = Math.min(1, V.steerVel + VEH_STEER_ACCEL * dt);
      else if (dk) V.steerVel = Math.max(-1, V.steerVel - VEH_STEER_ACCEL * dt);
      else V.steerVel -= V.steerVel * Math.min(1, VEH_STEER_DAMP * dt);
      V.yaw += V.steerVel * VEH_TURN_RATE * steerAuthority * dt * (V.speed < 0 ? -1 : 1);
      if (wk) V.speed += VEH_ACCEL * dt;
      else if (sk) V.speed -= (V.speed > 0 ? VEH_BRAKE : VEH_ACCEL) * dt;
      else V.speed -= Math.sign(V.speed) * VEH_DRAG * dt;
      if (!wk && !sk && Math.abs(V.speed) < 0.05) V.speed = 0;
      V.speed = Math.max(-VEH_MAX_SPEED * 0.5, Math.min(VEH_MAX_SPEED, V.speed));
      // Collision correction only runs while actually attempting to move —
      // mirroring stepWalk's own `if (moving)` gate. Running it unconditionally
      // every frame (a real bug caught while verifying this against a live
      // browser session — see tools/browser/verifyFreeExploreVehicle.mjs)
      // meant a car parked near a building's edge would silently keep
      // getting re-pushed frame after frame with speed at exactly 0,
      // drifting several real meters while "stationary."
      if (V.speed !== 0) {
        const fx = -Math.sin(V.yaw), fz = -Math.cos(V.yaw);
        const nx = V.x + fx * V.speed * dt, nz = V.z + fz * V.speed * dt;
        const c = collideAndSlide(nx, nz, VEH_COLLIDE_RADIUS);
        if (c.x !== nx || c.z !== nz) V.speed *= 0.4; // hit something — a real, if crude, speed penalty
        V.x = c.x; V.z = c.z;
      }
      car.position.set(V.x, 0, V.z);
      car.rotation.y = V.yaw;
      hands.visible = false; // no first-person hands while driving — nothing for them to be attached in front of
      const camDist = 7, camHeight = 3.4;
      const cfx = -Math.sin(V.yaw), cfz = -Math.cos(V.yaw);
      camera.position.set(V.x - cfx * camDist, camHeight, V.z - cfz * camDist);
      camera.up.set(0, 1, 0);
      camera.lookAt(V.x, 1.1, V.z);

      hudTimer -= dt;
      if (hudTimer <= 0) {
        hudTimer = 0.15;
        setHud({ nearby: null, mode: "drive", speedMph: Math.round(Math.abs(V.speed) * 2.23694), vehiclePrompt: "[E] Park and get out" });
      }
    }

    function step() {
      raf = requestAnimationFrame(step);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (document.visibilityState !== "hidden") {
        if (mode === "drive") stepDrive(dt); else stepWalk(dt);
      }
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(step);
    setReady(true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("click", requestLock);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      if (document.pointerLockElement === el) document.exitPointerLock?.();
      onERef.current = () => {}; // don't let a stale closure reach into a disposed scene
      if (import.meta.env.DEV) delete window.__proximateTestFreeExplore;
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      if (renderer.domElement && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [map, spawnVehicle]);

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        // Browsers auto-release pointer lock on Escape before this handler
        // sees the key — if we were locked within the last moment, treat
        // this Escape as "stop looking around" only, not "leave Free
        // Explore," so the player doesn't get bounced out of the mode by
        // the same key that just gave them their mouse cursor back.
        if (document.pointerLockElement) return;
        const justUnlocked = typeof wasLockedRef.current === "number" && Date.now() - wasLockedRef.current < 400;
        if (justUnlocked) return;
        onExit && onExit();
        return;
      }
      if (k === "e") {
        // e.repeat guards against the OS's own key-repeat firing this
        // several times while E is held — a real single "press," not a
        // held action, matching every other E-interact in this game.
        if (!e.repeat) onERef.current();
        return;
      }
      if (!WALK_KEYS.has(k)) return;
      e.preventDefault();
      keysRef.current.add(k);
    };
    const up = (e) => { const k = e.key.toLowerCase(); keysRef.current.delete(k); };
    // Same fix as DrivingScene.jsx/Coop3DWalk.jsx: a stuck key from a lost
    // keyup (window blur, alt-tab) would otherwise walk forever in one
    // direction with no way to cancel it.
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
  }, [onExit]);

  return createPortal((<div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#0A0F12", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 14px" }}>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: C.amber }}>
        🚶 FREE EXPLORE (beta) — {(map?.name || mapId || "").toUpperCase()}</span>
      <button onClick={onExit} className="px-3 py-1 rounded" style={{ background: C.panelHi, border: `1px solid ${C.line}`, color: C.dim, fontSize: 11 }}>Exit (Esc)</button>
    </div>
    <div ref={mountRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0c1114", cursor: looking ? "none" : "pointer" }}>
      {!ready && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 12, color: C.dim }}>Loading scene…</div>}
      {ready && hud.mode === "walk" && !looking && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 12, color: C.text, background: "rgba(11,15,18,.55)", pointerEvents: "none" }}>Click to look around</div>}
      {looking && hud.mode === "walk" && <div style={{ position: "absolute", top: "50%", left: "50%", width: 6, height: 6, marginTop: -3, marginLeft: -3, borderRadius: "50%", background: "rgba(255,255,255,.7)", pointerEvents: "none" }} />}
      {hud.mode === "walk" && hud.nearby && <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(11,15,18,.85)", border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 10px", fontFamily: MONO, fontSize: 11, color: C.text }}>{hud.nearby}</div>}
      {hud.vehiclePrompt && <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(11,15,18,.85)", border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 12px", fontFamily: MONO, fontSize: 12, color: C.amber }}>{hud.vehiclePrompt}</div>}
      {hud.mode === "drive" && <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(11,15,18,.85)", border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 10px", fontFamily: MONO, fontSize: 12, color: C.text }}>{hud.speedMph} MPH</div>}
    </div>
    <div style={{ fontFamily: MONO, fontSize: 11, color: C.dim, padding: "8px 14px" }}>
      {hud.mode === "drive"
        ? "W/S accel/brake · A/D steer · E to park and get out — Esc to exit."
        : "Click to look around · mouse to look · W/A/S/D to move · E to get in a nearby vehicle · Esc to release the mouse (Esc again to exit)"}
      {" — every building on this map is here as a labeled box, no real models. Not a real gamemode — a temporary layout-inspection tool."}
    </div>
  </div>), document.body);
}
