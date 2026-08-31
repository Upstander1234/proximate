import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // itch.io serves an uploaded HTML5 build from a hashed CDN subpath (e.g.
  // https://html-classic.itch.zone/html/<id>/index.html), not from a domain
  // root — a root-relative asset URL like "/assets/index.js" resolves
  // against the CDN's own root and 404s. "./" makes every emitted reference
  // relative to index.html's own location instead, which works both there
  // and at a normal domain root. Also required in src/assets.js's own BASE
  // constant (public/assets/... paths), which Vite's `base` does not touch
  // since those are runtime string concatenations, not resolved imports.
  base: "./",
  // Co-op (F22) needs a second machine on the LAN to load this page at all,
  // not just reach the coop relay. Vite's dev server binds to localhost only
  // by default, which silently made that impossible regardless of whether
  // server/coopServer.mjs was reachable — `host: true` binds 0.0.0.0 (same
  // as `vite --host`) and makes Vite print the LAN URL to share.
  server: { host: true },
  preview: { host: true },
})