// Short-lived cache for read-mostly Firestore collections (the approved
// crowdsourced question bank, approved Medicdle cases) that every session
// would otherwise re-read in full on each load. Kept in memory for the tab's
// lifetime and in sessionStorage across reloads, for TTL_MS. Reviewers call
// invalidateCached() after approving/rejecting so their own view stays fresh;
// everyone else sees a change within one TTL.
const TTL_MS = 10 * 60 * 1000;
const PREFIX = "nremt_cache_";
const mem = new Map(); // key -> { at, value }
const inflight = new Map(); // key -> Promise (dedupes concurrent loads)

function readSession(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(key, entry) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* storage full/unavailable — memory cache still works */
  }
}

export async function cachedFetch(key, loader) {
  const fresh = (e) => e && Date.now() - e.at < TTL_MS;
  const hit = mem.get(key) || readSession(key);
  if (fresh(hit)) {
    mem.set(key, hit);
    return hit.value;
  }
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const value = await loader();
      const entry = { at: Date.now(), value };
      mem.set(key, entry);
      writeSession(key, entry);
      return value;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

export function invalidateCached(key) {
  mem.delete(key);
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
