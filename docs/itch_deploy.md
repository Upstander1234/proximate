# Deploying to itch.io (and hosting co-op's relay)

Two separate things get deployed, because itch.io only hosts static files:

1. **The game itself** — `npm run build`'s output, uploaded to itch.io as an
   HTML5 project. No server involved; itch.io serves it directly.
2. **The co-op relay** (`server/coopServer.mjs`) — a tiny always-on Node
   process. itch.io cannot run this for you. It needs to live somewhere else
   with a public address, and the game build needs to be told that address.
   Skip this part entirely if you're not shipping co-op.

Solo/single-player play needs nothing from part 2 — only build and upload.

## 1. Building the game for itch.io

itch.io serves an uploaded build from a hashed CDN subpath (something like
`https://html-classic.itch.zone/html/123456/index.html`), not from a domain
root. `vite.config.js` already sets `base: "./"` and `src/assets.js` already
resolves its own asset paths off `import.meta.env.BASE_URL` for exactly this
reason — a plain `npm run build` produces a build that works at any subpath,
itch.io's included. Nothing further is needed for this part.

```
npm run build
```

This produces `dist/`. Zip the **contents** of `dist/` (`index.html` should
be at the zip's top level, not inside a `dist/` folder within the zip) and
upload that zip to your itch.io project page as an HTML5 file. Check "This
file will be played in the browser," and set the embed's viewport to
something reasonably large (the game is not mobile-optimized).

`npm run preview` (also bound to `host: true`, so it's reachable from another
device on your network too) serves the production build locally — use it to
sanity-check the real build before uploading, since `npm run dev`'s output
isn't quite the same artifact.

## 2. Hosting the co-op relay

`server/coopServer.mjs` is a stateless WebSocket relay — no database, no
persistence, trivial to run on almost any free/cheap always-on Node host.
Render, Railway, and Fly.io all work; Render's free tier is the easiest to
get running from scratch:

1. Push this repo (or just enough of it — `server/`, `package.json`,
   `package-lock.json`) to a Git host Render can pull from.
2. Create a new Render **Web Service** pointed at it.
   - Build command: `npm install`
   - Start command: `npm run coop-server`
3. Render assigns a dynamic port via `$PORT` and expects the process to bind
   to it — `coopServer.mjs` already checks `process.env.PORT` first for
   exactly this reason, so no config is needed there.
4. Render terminates TLS for you at `https`/`wss` on its own subdomain
   (`your-app.onrender.com`), forwarding to your plain `ws` server
   internally. **This matters**: itch.io pages are served over HTTPS, so a
   browser will refuse to open a plain `ws://` connection from that page as
   mixed content — the relay must be reachable at `wss://`, which Render (or
   Railway/Fly, same story) gives you automatically. A relay run on a bare
   VPS without a TLS-terminating proxy in front of it will NOT work from an
   itch.io build for this reason, even though it works fine for same-network
   LAN play (that path never goes through HTTPS).

Once the relay has a public `wss://` address, bake it into the build as the
default so players don't have to find and paste it in manually:

```
# macOS/Linux
VITE_COOP_RELAY_URL=wss://your-relay.onrender.com npm run build

# Windows PowerShell
$env:VITE_COOP_RELAY_URL="wss://your-relay.onrender.com"; npm run build
```

(Or drop `VITE_COOP_RELAY_URL=wss://your-relay.onrender.com` into a
`.env.production` file — Vite picks it up automatically on `npm run build`.)
Players can still type a different relay address into the Co-op setup
screen's RELAY ADDRESS field — this only changes the pre-filled default, the
same way it already defaults to `ws://localhost:8787` for local dev today.

## 3. What's NOT verified here

The relay itself was tested locally (two real WebSocket clients over a LAN
address — see the game's own handoff notes) and the room/roster/staleness
logic was reviewed by reading, but **an actual itch.io upload, an actual
Render deploy, and a real cross-internet 4-player session were not run as
part of this change** — no hosting account or itch.io project exists to
verify against from here. The two concrete, itch.io-specific defects this
batch found and fixed (the root-relative `base`/`BASE` asset paths, and
`$PORT` binding for typical PaaS hosts) are real, confirmed-by-reading
issues, not guesses — but the first real deploy should be treated as the
actual test, not this document.
