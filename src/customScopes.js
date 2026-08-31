// customScopes.js — player-authored scope-of-practice profiles, persisted in
// localStorage so they survive across saves and browser sessions (the same
// "permanent for that player" footing saves.js gives actual save slots, but
// this is a separate store — a custom scope isn't tied to any one character).
//
// Distinct from src/scopes/*.js on purpose: those files are DEVELOPER-added
// (shipped with the game, real jurisdictions), auto-discovered from disk, and
// are pure {id,name,levels} tables. A custom scope is built in-app, from the
// scope editor, by taking a base preset and adjusting individual items, and
// carries one extra field a shipped scope never needs: `off` — items the
// player has banned outright, which is a difficulty/challenge choice, not a
// jurisdiction's certification requirement, so it doesn't belong in `levels`
// (see scopes/engine.js — level 5 is "Unlimited," not "banned for everyone,"
// so there's no level number that means "off" the way g.scopeOff does today).
//
// Shape: { id, name, levels: {itemId:lvl,...}, off: [itemId,...] }
const KEY="proximate.customScopes.v1";

function readAll(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function writeAll(list){
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable/full — best-effort only */ }
}

export function listCustomScopes(){
  return readAll();
}

export function getCustomScope(id){
  return readAll().find(s=>s.id===id) || null;
}

// Upserts by id — saving again with the same id (e.g. re-saving after
// further edits) replaces the prior version rather than duplicating it.
export function saveCustomScope(scope){
  const list=readAll();
  const i=list.findIndex(s=>s.id===scope.id);
  if(i>=0) list[i]=scope; else list.push(scope);
  writeAll(list);
  return scope;
}

export function deleteCustomScope(id){
  writeAll(readAll().filter(s=>s.id!==id));
}

// A stable, unique, snake_case-ish id derived from the player's chosen name
// — collision-checked against whatever's already saved (never against the
// developer scopes, which live in a completely separate store/namespace).
export function newCustomScopeId(name){
  const base="custom_"+(name||"scope").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"") || "custom_scope";
  const existing=new Set(readAll().map(s=>s.id));
  if(!existing.has(base)) return base;
  let n=2;
  while(existing.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}
