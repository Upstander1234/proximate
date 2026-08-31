// ─── Co-op client ───────────────────────────────────────────────────────────
// Talks to server/coopServer.mjs. See that file's header for the sync model
// in full; the short version: every connected browser periodically
// broadcasts its whole `g` snapshot, and receiving one replaces local state
// with it (except a short list of fields that must stay per-browser — see
// COOP_LOCAL_ONLY below). This is a shared-whiteboard model, not a lockstep
// simulation: it's built for people who are already talking to each other
// (in person, on a call, or via itch.io's page chat), not for hiding
// information between them.
import { useEffect, useRef } from "react";

// Must match server/coopServer.mjs's own MAX_PEERS — duplicated rather than
// imported since the client bundle and the Node relay are two separate
// runtimes with no shared module graph.
export const COOP_MAX_PEERS = 4;

// Fields that belong to THIS browser/save, not the shared call — overwriting
// these from a remote snapshot would make this browser autosave into the
// other player's save slot, or silently flip this player's own audio/UI
// preferences to match theirs.
export const COOP_LOCAL_ONLY = [
  "saveId", "saveName", "muted", "voice", "volume",
  "settingsOpen", "achievementsOpen", "lastSaveAt", "coop",
];

const THROTTLE_MS = 250;

function randomClientId() {
  try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch { /* unavailable */ }
  return `p${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function useCoop(coop, g, setG) {
  const wsRef = useRef(null);
  const suppressRef = useRef(false); // true while applying a just-received remote snapshot
  const lastSentRef = useRef(0);
  const pendingRef = useRef(null);
  const clientIdRef = useRef(null);
  // Guards against out-of-order delivery across several simultaneous
  // senders (up to COOP_MAX_PEERS-1 other broadcasters hitting one relay):
  // a snapshot timestamped earlier than the last one we actually applied is
  // dropped rather than allowed to clobber newer state that arrived first.
  // This is ordering hygiene only — it does not merge two players' edits
  // made at the same instant, which the sync model's own "shared whiteboard,
  // last write wins" limitation still applies to unchanged.
  const lastAppliedTsRef = useRef(0);

  // Connect / disconnect when the co-op config changes.
  useEffect(() => {
    if (!coop?.url || !coop?.room) return;
    if (!clientIdRef.current) clientIdRef.current = randomClientId();
    let ws;
    try { ws = new WebSocket(coop.url); } catch { return; }
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", room: coop.room, id: clientIdRef.current, name: coop.name || "Player" }));
      setG((s) => ({ ...s, coop: { ...s.coop, status: "connected" } }));
    };
    ws.onclose = () => setG((s) => (s.coop ? { ...s, coop: { ...s.coop, status: "disconnected" } } : s));
    ws.onerror = () => setG((s) => (s.coop ? { ...s, coop: { ...s.coop, status: "error" } } : s));
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.type === "welcome") {
        clientIdRef.current = msg.id;
        // Exposed on g.coop.myId so the UI can do client-local things that
        // need to know "which peer am I" — e.g. the 3D co-op driving scene
        // deterministically elects one connected player as the driver
        // (lowest id in g.coop.players) rather than letting every client's
        // WASD input fight over one shared vehicle.
        setG((s) => (s.coop ? { ...s, coop: { ...s.coop, myId: msg.id } } : s));
        return;
      }
      if (msg.type === "full") {
        setG((s) => (s.coop ? { ...s, coop: { ...s.coop, status: "full" } } : s));
        try { ws.close(); } catch { /* empty */ }
        return;
      }
      if (msg.type === "roster") {
        setG((s) => (s.coop ? { ...s, coop: { ...s.coop, peers: msg.count, players: msg.players || [] } } : s));
        return;
      }
      if (msg.type === "state" && msg.g) {
        if (typeof msg.ts === "number" && msg.ts < lastAppliedTsRef.current) return; // stale/reordered — drop it
        lastAppliedTsRef.current = typeof msg.ts === "number" ? msg.ts : Date.now();
        suppressRef.current = true;
        setG((s) => {
          const kept = Object.fromEntries(COOP_LOCAL_ONLY.map((k) => [k, s[k]]));
          return { ...msg.g, ...kept };
        });
      }
    };
    return () => { try { ws.close(); } catch { /* empty */ } wsRef.current = null; };
  }, [coop?.url, coop?.room, coop?.name, setG]);

  // Broadcast local state changes, throttled, skipping the echo of a
  // snapshot we just applied FROM the network.
  useEffect(() => {
    if (!coop?.url || !coop?.room) return;
    if (suppressRef.current) { suppressRef.current = false; return; }
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const now = Date.now();
    const send = () => {
      lastSentRef.current = Date.now();
      pendingRef.current = null;
      try { ws.send(JSON.stringify({ type: "state", room: coop.room, from: clientIdRef.current, ts: Date.now(), g })); } catch { /* empty */ }
    };
    if (now - lastSentRef.current >= THROTTLE_MS) send();
    else {
      clearTimeout(pendingRef.current);
      pendingRef.current = setTimeout(send, THROTTLE_MS - (now - lastSentRef.current));
    }
  }, [g, coop?.url, coop?.room]);
}

// A short, easy-to-say-out-loud room code — four letters, no save-id-style
// randomness needed since collisions just mean "pick a different word."
const WORDS = ["ECHO", "TANGO", "BRAVO", "FOXTROT", "DELTA", "KILO", "ROMEO", "VICTOR", "ZEBRA", "OSCAR"];
export function randomRoomCode() {
  return WORDS[Math.floor(Math.random() * WORDS.length)] + Math.floor(10 + Math.random() * 90);
}
