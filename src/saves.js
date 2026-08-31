// saves.js — localStorage-backed save slots, plus JSON export/import.
// Each save is a full snapshot of the game state object (`g` in App.jsx)
// under a stable id, alongside small display metadata (name, updatedAt)
// that's cheap to read for the save-select screen without touching the
// (potentially large) state blob.

const INDEX_KEY = "proximate.saves.index.v1";
const SAVE_KEY = (id) => `proximate.save.${id}.v1`;

// JSON can't represent Set natively — plain JSON.stringify(aSet) silently
// collapses it to "{}", which on reload looks like "nothing allowed" rather
// than the intended "everything allowed" default. This replacer/reviver
// pair round-trips any Set field in state losslessly.
const setReplacer = (key, value) =>
  value instanceof Set ? { __set: [...value] } : value;
const setReviver = (key, value) =>
  (value && typeof value === "object" && Array.isArray(value.__set)) ? new Set(value.__set) : value;

const readIndex = () => {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY)) || []; }
  catch { return []; }
};
const writeIndex = (idx) => {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(idx)); } catch { /* storage unavailable/full — best-effort only */ }
};

export function listSaves() {
  return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function newSaveId() {
  return `s${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// Writes/overwrites a save. `meta` is small display info; `state` is the
// full game-state snapshot. Called on autosave (before/after every case)
// and whenever the player names a new save.
export function writeSave(id, state, metaPatch = {}) {
  try {
    localStorage.setItem(SAVE_KEY(id), JSON.stringify(state, setReplacer));
  } catch { return false; }
  const idx = readIndex();
  const i = idx.findIndex((s) => s.id === id);
  const prior = i >= 0 ? idx[i] : { id, createdAt: Date.now() };
  const meta = { ...prior, ...metaPatch, id, updatedAt: Date.now() };
  if (i >= 0) idx[i] = meta; else idx.push(meta);
  writeIndex(idx);
  return true;
}

export function loadSave(id) {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY(id)), setReviver); }
  catch { return null; }
}

export function deleteSave(id) {
  try { localStorage.removeItem(SAVE_KEY(id)); } catch { /* storage unavailable — best-effort only */ }
  writeIndex(readIndex().filter((s) => s.id !== id));
}

// Bundles metadata + full state into one downloadable JSON blob.
export function exportSave(id) {
  const meta = readIndex().find((s) => s.id === id);
  const state = loadSave(id);
  if (!state) return null;
  const blob = JSON.stringify({ kind: "proximate-save", version: 1, meta, state }, setReplacer, 2);
  const url = URL.createObjectURL(new Blob([blob], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(meta?.name || "proximate-save").replace(/[^a-z0-9-_]+/gi, "_")}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

// Parses an imported file's text and writes it in as a new (or matching-id)
// save. Returns the id on success, null on failure — callers should
// validate `kind` before trusting `state`.
export function importSaveText(text) {
  let parsed;
  try { parsed = JSON.parse(text, setReviver); } catch { return null; }
  if (!parsed || parsed.kind !== "proximate-save" || !parsed.state) return null;
  const id = parsed.meta?.id || newSaveId();
  writeSave(id, parsed.state, { name: parsed.meta?.name || "Imported save" });
  return id;
}
