// tools/browser/verifyDestinationPicker.mjs — real in-browser verification
// that the transport-destination picker (App.jsx, the "LOAD THE TRUCK"
// hospital buttons) now shows the REAL resolved hospital name + designation
// per option, computed live via chooseDestination/designationLabel
// (src/data/hospitals.js), not just the generic archetype tag.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyDestinationPicker.mjs`.

import { launch, clickText, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await clickText(page, "Go on shift");
    await clickText(page, "I understand");
    await clickText(page, "New save");
    await clickText(page, "I understand");
    await clickText(page, "Start");
    await page.waitForTimeout(1700);
    await clickText(page, "Medical Education Mode");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "level", null, { timeout: 5000 });
    await clickText(page, "Paramedic");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
    await clickText(page, "County EMS", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
    // A transport-capable vehicle (myVeh.transport===true) — needed for the
    // loadOpen screen to resolve straight to the destination picker instead
    // of "waiting on an ambulance" (this script jumps straight to the scene
    // phase via setState, so there is no dispatched fleet of other units to
    // supply a transport-capable one).
    await clickText(page, "ALS ambulance", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
    // ALS ambulance is crew-gated (needsCrew) — seed a real roster candidate
    // directly via setState rather than clicking through the hire UI, since
    // this script's target is the destination picker, not partner-hiring.
    await page.evaluate(() => {
      const st = window.__proximateTestGetState();
      const cand = (st.candidatePool || []).find((c) => c.agency === st.department);
      if (cand) window.__proximateTestSetState({ roster: [{ ...cand, student: false, cost: 0, exp: 0 }] });
    });
    await clickText(page, "▲ Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
    await clickText(page, "City", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
    await clickText(page, "▲ Ready");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
    await clickText(page, "▲ Begin");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    // The station screen became a real 3D walk-up-to-the-whiteboard
    // interaction in a later session (no plain "Get the call" button
    // anymore) — this script predates that and was left stale. Not what
    // this script is testing, so skip straight to the scenario picker via
    // setState, the same "fast-forward past what isn't under test" idiom
    // already used a few lines down for the response/approach phase.
    await page.evaluate(() => window.__proximateTestSetState({ phase: "cat" }));
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
    await clickText(page, "🎲 Random cardiac");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await clickText(page, "Bring the stretcher");
    await clickText(page, "▲ Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });

    // Fast-forward through response/approach into the scene via setState —
    // core call-flow timing is not what this script is testing.
    const st = await getState(page);
    await page.evaluate((locations) => window.__proximateTestSetState({ phase: "scene", locations }), st.locations);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scene", null, { timeout: 5000 });

    await clickText(page, "TRANSPORT", { exact: true });
    await page.waitForTimeout(200);
    await clickText(page, "▲ Transport");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.loadOpen === 1, null, { timeout: 5000 });

    // Read the rendered destination button text directly from the DOM —
    // every destination option button contains "min" (its ~N min ETA).
    const allButtonTexts = await page.locator("button").allTextContents();
    const buttonTexts = allButtonTexts.filter((t) => / min/.test(t));
    console.log("Destination buttons rendered:\n" + buttonTexts.map((t, i) => `  [${i}] ${t}`).join("\n"));

    if (!buttonTexts.length) throw new Error("expected at least one destination button to render");
    const hasArrow = buttonTexts.some((t) => t.includes("→"));
    if (!hasArrow) throw new Error("expected at least one destination button to show a real resolved hospital name (→ ...)");
    const hasDesignation = buttonTexts.some((t) => /Trauma Level|Stroke|STEMI/.test(t));
    if (!hasDesignation) throw new Error("expected at least one destination button to show a real designation string");
    console.log("\nPASS: destination picker shows real resolved hospital name + designation.");

    if (consoleErrors.length) {
      console.log("Console errors:", consoleErrors.join(" | "));
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  } catch (e) {
    console.error("Verification crashed:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
main();
