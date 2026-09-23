// ─── Protocol registry — auto-discovers every agency file in this folder ──
// F19: previously a single hand-maintained PROTOCOLS object in protocols.js.
// Now any sibling file that default-exports {id, name, rules} is picked up
// automatically via Vite's import.meta.glob — authoring a new protocol is
// "add a file," not "add a file AND remember to register it here." Files
// starting with "_" (the authoring template) and this index/engine module
// itself are excluded from discovery.
import { evaluateProtocol } from "./engine.js";
export { evaluateProtocol };

const modules = import.meta.glob(
  ["./*.js", "!./index.js", "!./engine.js", "!./_*.js"],
  { eager: true },
);
const discovered = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean);

export const PROTOCOLS = Object.fromEntries(discovered.map((p) => [p.id, p]));

// "national" (the NASEMSO National Model EMS Clinical Guidelines) always
// leads — it's the default, always-available protocol; every other
// discovered protocol follows in alphabetical-by-name order, so a newly
// dropped-in file appears in Settings without touching this file.
export const PROTOCOL_ORDER = [
  "national",
  ...discovered
    .filter((p) => p.id !== "national")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => p.id),
];

export function getProtocol(id) {
  return PROTOCOLS[id] || PROTOCOLS.national;
}
