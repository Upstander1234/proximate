// ─── Proximate co-op relay server ──────────────────────────────────────────
// A pure relay — it holds no game state and runs no game logic, just rooms of
// connected sockets (up to MAX_PEERS each) plus each socket's chosen display
// name. Whoever runs this starts it with `npm run coop-server`. Two ways to
// use it:
//   - SAME NETWORK: share your machine's LAN address (printed below, NOT
//     "localhost" — the other players' browsers need to reach this machine
//     over Wi-Fi/LAN) and a room code.
//   - ONLINE (e.g. an itch.io build): deploy this file to any always-on Node
//     host (Render/Fly.io/Railway/a VPS all work — see docs/itch_deploy.md)
//     and share that host's wss:// address instead. itch.io pages are served
//     over HTTPS, so the relay must be wss:// (TLS), not ws://, or the
//     browser blocks it as mixed content — every host above provides TLS on
//     its own domain for free.
//
// Sync model, stated plainly (see src/coop.js for the client half): every
// connected client periodically broadcasts its FULL game-state snapshot to
// every other client in its room, and a client that receives one simply
// replaces its own state with it — the same shape a save file already is
// (App.jsx's `g`, JSON-safe, exactly what saves.js already round-trips).
// There is no server-side authority and no per-action reconciliation: this is
// closer to a shared whiteboard than a lockstep simulation, so players acting
// at the exact same instant can clobber each other's action — a real, known
// limitation, not a hidden one. It is enough for up to 4 people actually
// talking to each other (in person, on a call, or in itch.io's page chat)
// sharing one patient. The client attaches a wall-clock timestamp to each
// snapshot and drops ones older than the last one it already applied, which
// only guards against the relay/network reordering messages from several
// simultaneous senders — it does not merge simultaneous edits.
import { WebSocketServer } from "ws";
import { networkInterfaces } from "node:os";
import { randomUUID } from "node:crypto";

// Most PaaS hosts (Render, Railway, Fly's http service type, etc.) assign a
// dynamic port via $PORT and expect the process to bind to it — checked
// first so this file needs zero changes to deploy there. PROXIMATE_COOP_PORT
// stays as the explicit override for local/self-hosted runs.
const PORT = process.env.PORT || process.env.PROXIMATE_COOP_PORT || 8787;
const MAX_PEERS = 4; // one shared patient, four sets of hands — see src/coop.js
const rooms = new Map(); // room code -> Map<WebSocket, {id, name}>

const wss = new WebSocketServer({ port: PORT });

// Real detected LAN addresses, not a placeholder example — the previous
// version printed a literal "e.g. 192.168.1.23", which the host then had to
// go find themselves via ipconfig/ifconfig. WebSocketServer({port}) already
// binds all interfaces (0.0.0.0) by default, so any of these will work; we
// just weren't telling the host what they were.
function lanAddresses() {
  const out = [];
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces || []) {
      if (iface.family === "IPv4" && !iface.internal) out.push(iface.address);
    }
  }
  return out;
}

function broadcastRoster(room) {
  const peers = rooms.get(room);
  if (!peers) return;
  const players = [...peers.values()].map((v) => ({ id: v.id, name: v.name }));
  const payload = JSON.stringify({ type: "roster", count: peers.size, players });
  for (const peer of peers.keys()) {
    if (peer.readyState === peer.OPEN) peer.send(payload);
  }
}

wss.on("connection", (ws) => {
  let room = null;

  ws.on("message", (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "join" && typeof msg.room === "string" && msg.room) {
      room = msg.room;
      if (!rooms.has(room)) rooms.set(room, new Map());
      const peers = rooms.get(room);
      if (peers.size >= MAX_PEERS && !peers.has(ws)) {
        ws.send(JSON.stringify({ type: "full", max: MAX_PEERS }));
        ws.close();
        room = null;
        return;
      }
      // The client may reconnect with the same id (a dropped connection
      // retrying), so id comes from the client, not assigned here — the
      // server just trusts it as an opaque room-scoped label, same as it
      // already trusted room codes.
      const id = typeof msg.id === "string" && msg.id ? msg.id : randomUUID();
      const name = (typeof msg.name === "string" && msg.name.trim()) ? msg.name.trim().slice(0, 24) : "Player";
      peers.set(ws, { id, name });
      ws.send(JSON.stringify({ type: "welcome", id }));
      broadcastRoster(room);
      return;
    }

    // Anything else just relays to every other socket in the same room.
    if (!room || !rooms.has(room)) return;
    for (const peer of rooms.get(room).keys()) {
      if (peer !== ws && peer.readyState === peer.OPEN) peer.send(data.toString());
    }
  });

  ws.on("close", () => {
    if (room && rooms.has(room)) {
      const peers = rooms.get(room);
      peers.delete(ws);
      if (peers.size === 0) rooms.delete(room);
      else broadcastRoster(room);
    }
  });
});

console.log(`Proximate co-op relay listening on ws://0.0.0.0:${PORT} (max ${MAX_PEERS} players per room)`);
const addrs = lanAddresses();
if (addrs.length) {
  console.log(`Same-network play — share one of these with whoever you're playing with (NOT localhost, that only works on this machine):`);
  for (const a of addrs) console.log(`  ws://${a}:${PORT}`);
  console.log(`They also need to load the game itself from your machine's Vite URL (run "npm run dev", it will print a similar "Network:" address) — the relay address above is only for the co-op connection, not the page.`);
} else {
  console.log(`Could not detect a LAN address on this machine — find it yourself (ipconfig on Windows, ifconfig/ip addr on Mac/Linux) and share ws://<that address>:${PORT}.`);
}
console.log(`For an itch.io build (or any players not on the same network), deploy this file to a host with a public wss:// address instead — see docs/itch_deploy.md.`);
console.log(`Everyone enters the same relay address and the same room code (up to ${MAX_PEERS} players).`);
