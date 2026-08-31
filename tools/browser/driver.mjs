// tools/browser/driver.mjs — reusable headless-Chromium driver for testing
// this app in a real browser. General-purpose (any future front-end batch
// can import this), not specific to any one feature.
//
// Two ways to get a script to a useful screen:
//   1. Real clicks (getByText/click helpers below) — the only honest way to
//      verify a click-through PATH actually works end to end.
//   2. State injection (setState/getState) — jumps `g.phase` (and any other
//      field) directly via a dev-only hook App.jsx exposes
//      (window.__proximateTestSetState/__proximateTestGetState, gated on
//      import.meta.env.DEV so it never ships in a production build). Use
//      this to reach a screen that's many steps deep without re-walking
//      every screen in front of it every time — the same way a save's own
//      `phase` field already drives which screen renders.
//
// Neither replaces the other: establish a REAL base state via real clicks
// (character creation actually has to have happened for level/myVeh/
// gmode/etc. to be populated correctly), then use setState to jump `phase`
// around freely from there.

import { chromium } from "playwright";

export async function launch({ headless = true } = {}) {
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.stack || err.message}`));
  return { browser, page, consoleErrors };
}

// Clicks the first element containing `text` (case-sensitive substring,
// matching Playwright's default getByText behavior). Throws if not found
// within the timeout — a missing button is exactly the kind of thing this
// tooling exists to catch.
export async function clickText(page, text, opts = {}) {
  await page.getByText(text, { exact: !!opts.exact }).first().click({ timeout: opts.timeout ?? 10000 });
}

export async function setState(page, patch) {
  const hasHook = await page.evaluate(() => typeof window.__proximateTestSetState === "function");
  if (!hasHook) {
    throw new Error(
      "__proximateTestSetState not found on window. This hook only exists in `npm run dev` " +
      "(gated on import.meta.env.DEV) — make sure you're pointed at the dev server, not a production build."
    );
  }
  await page.evaluate((p) => window.__proximateTestSetState(p), patch);
}

export async function getState(page) {
  return page.evaluate(() => (window.__proximateTestGetState ? window.__proximateTestGetState() : null));
}

export async function waitForPhase(page, phase, timeout = 5000) {
  await page.waitForFunction(
    (ph) => window.__proximateTestGetState && window.__proximateTestGetState()?.phase === ph,
    phase,
    { timeout }
  );
}
