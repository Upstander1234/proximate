import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { C, MONO } from "../theme.js";

// A real, walkable first-person approach for CO-OP ONLY, replacing the
// approach phase's plain "time passes, click a couple of free-action
// buttons" screen with an actual on-foot navigation task. WASD is a classic
// tank-control scheme (W/S move, A/D turn) rather than mouse-look — no
// pointer-lock permission prompt needed, and it stays reliably testable.
//
// Every connected player walks independently (there is no single "driver"
// role here — see DrivingScene.jsx for that split, which now also runs
// outside co-op); each broadcasts its own
// {x,z,yaw} into g.coop3d.walk[clientId] at the same throttled cadence
// coop.js already uses for everything else, and renders every OTHER known
// player as a simple capsule avatar.
//
// Same scope decision as the drive scene: this does NOT gate the
// approach->scene phase transition on actually reaching the target — the
// existing sim-clock-driven transition (App.jsx's tick loop) is unchanged.
// Arrival is real and visible (the GPS reads "on scene" and the compass
// stops), but making the whole party's progress hostage to one player
// physically walking there would be a stall risk this design deliberately
// avoids — see this file's own onArrive callback, which is informational,
// not a gate.
const WALK_SPEED = 3.4, TURN_SPEED = 2.3;
const ARRIVE_RADIUS = 6;
const WALK_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);

// Fallback TARGET/LAYOUT — used only when the caller has no real per-call
// map data to hand in (a locOnStreet scenario with no specific building, or
// reconstruction failing for any reason; see App.jsx's `target`/`layout`
// props, computed from the real incident building's own offset in
// src/data/maps.js — the exact same field CityMap.jsx already renders
// icons at, now a genuinely new consumer instead of a decorative one). Kept
// as the honest "we have no real distance to offer" case, not deleted, so
// this component still renders something coherent without real map data.
const FALLBACK_TARGET = { x: 14, z: -130 };
const FALLBACK_LAYOUT = [
  { x: -9, z: -30, w: 8, d: 10, h: 14 }, { x: 10, z: -45, w: 9, d: 8, h: 20 },
  { x: -11, z: -65, w: 7, d: 12, h: 10 }, { x: 12, z: -85, w: 10, d: 9, h: 24 },
  { x: -8, z: -105, w: 8, d: 10, h: 16 },
];

export default function Coop3DWalk({ paused, myId, myName, peerCount, sharedPositions, onBroadcast, onArrive, destLabel, target, layout }) {
  // Real per-call data (App.jsx) when available, so walk-in distance
  // genuinely varies call to call — sometimes you park right outside,
  // sometimes it's a real walk down the block — instead of a fixed ~130m
  // every time. Read once here (not inside the mount effect's own closure
  // directly) so the fallback logic is in one place. Safe to read as a
  // plain value, not a ref: this component only ever mounts once per call
  // (the approach phase's own key/lifecycle), so target/layout are already
  // fixed for this component's whole life by the time it first renders.
  const TARGET = target || FALLBACK_TARGET;
  const LAYOUT = layout && layout.length ? layout : FALLBACK_LAYOUT;
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState({ bearing: 0, dist: 0, arrived: false });
  const keysRef = useRef(new Set());
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  const sharedRef = useRef(sharedPositions);
  useEffect(() => { sharedRef.current = sharedPositions; }, [sharedPositions]);
  const myIdRef = useRef(myId);
  useEffect(() => { myIdRef.current = myId; }, [myId]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d1a14");
    scene.fog = new THREE.Fog("#0d1a14", 30, 180);
    const camera = new THREE.PerspectiveCamera(70, el.clientWidth / (el.clientHeight || 300), 0.1, 400);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(el.clientWidth, el.clientHeight || 300);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight("#9fc4d8", "#1a221c", 1.0));
    const sun = new THREE.DirectionalLight("#fff2d8", 0.7);
    sun.position.set(-20, 40, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 10; sun.shadow.camera.far = 180;
    sun.shadow.camera.left = -100; sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100; sun.shadow.camera.bottom = -100;
    sun.shadow.bias = -0.0015;
    scene.add(sun);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 260), new THREE.MeshStandardMaterial({ color: "#1c2a20", roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -70); ground.receiveShadow = true; scene.add(ground);
    const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(10, 200), new THREE.MeshStandardMaterial({ color: "#3a4046", roughness: 0.85 }));
    sidewalk.rotation.x = -Math.PI / 2; sidewalk.position.set(7, 0.01, -70); sidewalk.receiveShadow = true; scene.add(sidewalk);

    const buildings = [];
    const bMat = new THREE.MeshStandardMaterial({ color: "#39434c", roughness: 0.8 });
    for (const b of LAYOUT) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), bMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true; mesh.receiveShadow = true;
      scene.add(mesh);
      buildings.push({ x: b.x, z: b.z, hw: b.w / 2 + 0.5, hd: b.d / 2 + 0.5 });
    }

    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), new THREE.MeshBasicMaterial({ color: "#46E39B" }));
    beacon.position.set(TARGET.x, 1.5, TARGET.z);
    scene.add(beacon);
    const beaconGlow = new THREE.PointLight("#46E39B", 2, 14);
    beaconGlow.position.copy(beacon.position);
    scene.add(beaconGlow);

    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    const avatarMeshes = {};

    camera.position.set(0, 1.6, 0);
    scene.add(camera);

    function resize() {
      const w = el.clientWidth, h = el.clientHeight || 300;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Simple circle-vs-box push-out: clamps the player's next position so
    // they can't walk through a building footprint, without a full physics
    // engine — good enough for "you have to go around it," not a general
    // collision system.
    function collideAndSlide(nx, nz) {
      let x = nx, z = nz;
      for (const b of buildings) {
        const dx = x - b.x, dz = z - b.z;
        const px = Math.max(-b.hw, Math.min(b.hw, dx)), pz = Math.max(-b.hd, Math.min(b.hd, dz));
        const ox = dx - px, oz = dz - pz;
        if (Math.hypot(ox, oz) < 0.4) {
          if (Math.abs(dx) / b.hw > Math.abs(dz) / b.hd) x = b.x + (dx >= 0 ? b.hw + 0.4 : -(b.hw + 0.4));
          else z = b.z + (dz >= 0 ? b.hd + 0.4 : -(b.hd + 0.4));
        }
      }
      return { x, z };
    }

    const P = { x: 0, z: 0, yaw: 0 };
    const clock = new THREE.Clock();
    let raf = null, hudTimer = 0, bcastTimer = 0, arrivedSent = false;

    function step() {
      raf = requestAnimationFrame(step);
      const dt = Math.min(clock.getDelta(), 0.05);
      const running = !pausedRef.current && document.visibilityState !== "hidden";
      if (running) {
        const has = (...ks) => ks.some((k) => keysRef.current.has(k));
        const w = has("w", "arrowup"), s = has("s", "arrowdown"), a = has("a", "arrowleft"), d = has("d", "arrowright");
        if (a) P.yaw += TURN_SPEED * dt;
        if (d) P.yaw -= TURN_SPEED * dt;
        const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
        let mv = 0; if (w) mv += 1; if (s) mv -= 1;
        if (mv !== 0) {
          const c = collideAndSlide(P.x + fx * mv * WALK_SPEED * dt, P.z + fz * mv * WALK_SPEED * dt);
          P.x = c.x; P.z = c.z;
        }
        camera.position.set(P.x, 1.6, P.z);
        camera.rotation.y = P.yaw;
        beacon.rotation.y += dt * 1.4;

        const shared = sharedRef.current || {};
        const seen = new Set();
        for (const [id, pl] of Object.entries(shared)) {
          if (id === myIdRef.current) continue;
          seen.add(id);
          let av = avatarMeshes[id];
          if (!av) {
            av = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.1, 4, 8), new THREE.MeshStandardMaterial({ color: "#4D7CFF" }));
            body.position.y = 0.95;
            av.add(body);
            avatarGroup.add(av);
            avatarMeshes[id] = av;
          }
          av.position.set(pl.x, 0, pl.z);
          av.rotation.y = pl.yaw || 0;
        }
        for (const id of Object.keys(avatarMeshes)) {
          if (!seen.has(id)) { avatarGroup.remove(avatarMeshes[id]); delete avatarMeshes[id]; }
        }

        const dx = TARGET.x - P.x, dz = TARGET.z - P.z;
        const dist = Math.hypot(dx, dz);
        const worldBearing = Math.atan2(dx, dz);
        const rel = ((worldBearing - P.yaw) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        const arrived = dist < ARRIVE_RADIUS;
        if (arrived && !arrivedSent) { arrivedSent = true; onArrive && onArrive(); }

        hudTimer -= dt;
        if (hudTimer <= 0) { hudTimer = 0.12; setHud({ bearing: rel, dist, arrived }); }
        bcastTimer -= dt;
        if (bcastTimer <= 0 && onBroadcast) { bcastTimer = 0.24; onBroadcast({ x: P.x, z: P.z, yaw: P.yaw, name: myName }); }
      }
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(step);
    setReady(true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      if (renderer.domElement && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (!WALK_KEYS.has(k)) return;
      e.preventDefault();
      keysRef.current.add(k);
    };
    const up = (e) => { const k = e.key.toLowerCase(); keysRef.current.delete(k); };
    // Same fix as DrivingScene.jsx: a stuck key from a lost keyup (window
    // blur, alt-tab, a modal stealing focus) would otherwise walk the
    // player in one direction forever with no way to cancel it.
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

  const bearingDeg = Math.round((hud.bearing * 180) / Math.PI);
  return (<div className="mt-4" style={{ background: "#0A0F12", border: `1px solid ${C.line}`, borderRadius: 8, padding: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", color: C.amber }}>🚶 WALKING IN — {destLabel || "ON FOOT TO THE PATIENT"}</span>
      <span style={{ fontFamily: MONO, fontSize: 10, color: C.faint }}>{peerCount} on the crew</span>
    </div>
    <div ref={mountRef} style={{ width: "100%", height: 300, borderRadius: 4, overflow: "hidden", position: "relative", background: "#0d1a14" }}>
      {!ready && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, color: C.dim }}>Loading scene…</div>}
      {/* Real GPS HUD — a live compass bearing + distance to the dispatch
          address, computed every frame from the player's actual 3D
          position, not a decorative readout. */}
      <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(11,15,18,.85)", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 10px", fontFamily: MONO, textAlign: "center", minWidth: 74 }}>
        <div style={{ fontSize: 20, transform: `rotate(${bearingDeg}deg)`, color: hud.arrived ? C.hr : C.amber }}>▲</div>
        <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>{Math.round(hud.dist)}m</div>
      </div>
      {hud.arrived && <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, textAlign: "center", fontFamily: MONO, fontSize: 11, color: C.hr, background: "rgba(11,15,18,.85)", borderRadius: 6, padding: "6px 8px" }}>
        On scene — hang tight for the rest of the crew.</div>}
    </div>
    <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 11, color: C.dim }}>W forward · S back · A/D turn — follow the compass to the call.</div>
  </div>);
}
