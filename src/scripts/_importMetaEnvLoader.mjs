// A minimal Node ESM loader bootstrap (node:module's `register()` API)
// that lets education-module code using Vite's `import.meta.env.VITE_*`
// (firebase.js, adminConfig.js) load under plain `node`, which has no
// `import.meta.env` at all — throws "Cannot read properties of undefined"
// the instant a module using it is imported. Vite injects
// `import.meta.env` at build time; this project's other standalone
// `src/scripts/*.mjs` verification scripts have never needed to import
// anything from `src/education/` before, so this gap was never hit until
// now.
//
// Rather than editing firebase.js/adminConfig.js themselves (real,
// production source, correct as written for the app's actual Vite
// runtime) or reimplementing the modules they gate, the hooks in
// _importMetaEnvHooks.mjs rewrite only the literal substring
// `import.meta.env` to a safe, always-object fallback while a module's
// source is being loaded for Node — the resulting value for every
// `VITE_*` key is `undefined`, exactly like an unconfigured `.env.local`
// in the real app (firebase.js's own `firebaseConfigured` already treats
// that as "Firebase not set up," a real, already-handled code path, not a
// bypass of anything).
//
// Usage: node --import ./src/scripts/_importMetaEnvLoader.mjs <script>.mjs
import { register } from "node:module";

register("./_importMetaEnvHooks.mjs", import.meta.url);
