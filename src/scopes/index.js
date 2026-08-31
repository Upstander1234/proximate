// ─── Scope registry — auto-discovers every scope-of-practice file here ─────
// Same pattern as src/protocols/index.js: any sibling file that default-
// exports {id, name, overrides} is picked up automatically via Vite's
// import.meta.glob — authoring a new scope is "add a file," not "add a file
// AND remember to register it here." Files starting with "_" (the authoring
// template) and this index/engine module itself are excluded from discovery.
import { effectiveLvl } from "./engine.js";
import { getCustomScope } from "../customScopes.js";
export { effectiveLvl };

const modules = import.meta.glob(
  ["./*.js", "!./index.js", "!./engine.js", "!./_*.js"],
  { eager: true },
);
const discovered = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean);

export const SCOPES = Object.fromEntries(discovered.map((p) => [p.id, p]));

// "national2019" always leads (it's the safe, always-available baseline);
// every other discovered scope follows in alphabetical-by-name order, so a
// newly dropped-in file appears in Settings without touching this file.
export const SCOPE_ORDER = [
  "national2019",
  ...discovered
    .filter((p) => p.id !== "national2019")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => p.id),
];

// Resolves a developer-shipped scope (this folder) OR a player-saved custom
// scope (src/customScopes.js, localStorage) by the same id — g.scopeProfile
// doesn't distinguish which store an id came from, so every caller (App.jsx's
// lvlOf, the FAQ breakdown, the scope editor) can just call getScope and not
// care. Falls back to national2019 only if the id resolves to neither.
export function getScope(id) {
  return SCOPES[id] || getCustomScope(id) || SCOPES.national2019;
}
