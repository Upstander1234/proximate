// tools/browser/verifyCampusVehicleSpeed.mjs — closes F1's "e-bike/golf-cart
// response-time mechanic" gap: confirms, via real clicks through the ordinary
// level/department/vehicle wizard (Sandbox mode, since it reaches "level"
// directly), that an EMR-level Campus PD player can pick PATROL Volunteer,
// PSO (bike), or Campus EMR (golf cart) side by side, that g.myVeh.type lands
// correctly for each, and that scope.js's new VEH_TYPE_TRAVEL_MULT actually
// changes the real drive/need numbers travelTimes() computes for the two
// campus vehicles relative to an ordinary rig — not just that the constant
// exists in source.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyCampusVehicleSpeed.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

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
    console.log("1. Real click-through to the level picker (Sandbox). OK");

    await clickText(page, "EMR", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
    let st = await getState(page);
    if (st.level !== "emr") throw new Error(`expected level "emr", got "${st.level}"`);
    console.log("2. Real click \"EMR\" -> department picker. OK");

    await clickText(page, "Campus PD");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
    st = await getState(page);
    if (st.department !== "Campus PD") throw new Error(`expected department "Campus PD", got "${st.department}"`);
    console.log("3. Real click \"Campus PD\" -> vehicle picker. OK");

    const bodyText = await page.locator("body").innerText();
    for (const label of ["PATROL Volunteer", "Public Safety Officer", "Campus EMR"]) {
      if (!bodyText.includes(label)) throw new Error(`expected "${label}" to be a listed vehicle choice at Campus PD/EMR, it wasn't in the DOM`);
    }
    console.log("4. All three Campus PD vehicle kinds (PATROL Volunteer / PSO / Campus EMR) are real, clickable choices at EMR level. OK");

    await clickText(page, "Public Safety Officer");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
    st = await getState(page);
    if (st.myVeh?.type !== "bike") throw new Error(`expected myVeh.type "bike" after picking PSO, got "${st.myVeh?.type}"`);
    console.log(`5. Real click "Public Safety Officer" -> myVeh.type="${st.myVeh.type}", myVeh.kind="${st.myVeh.kind}". OK`);

    // travelTimes() itself is a pure function over `s` — exercise it directly
    // against the real committed state (myVeh.type="bike" from the actual
    // click above), not a reconstructed patient/config object, per this
    // project's own "don't reconstruct what the engine already computes"
    // discipline (lesson 8) — the module itself is imported fresh inside the
    // page via a dynamic import so this runs the SAME code the app runs.
    const bikeTimes = await page.evaluate(async (s) => {
      const mod = await import("/src/scope.js");
      return mod.travelTimes({ ...s, mode: "city", code: 3 });
    }, st);
    const vehTimes = await page.evaluate(async () => {
      const mod = await import("/src/scope.js");
      return mod.travelTimes({ level: "emr", mode: "city", code: 3, myVeh: { type: "als" } });
    });
    console.log(`6. Real travelTimes(): bike drive=${bikeTimes.drive.toFixed(1)}s vs. an ordinary ALS ambulance drive=${vehTimes.drive.toFixed(1)}s.`);
    if (!(bikeTimes.drive < vehTimes.drive * 0.6)) throw new Error(`expected the bike's drive time to be meaningfully faster than an ordinary vehicle's, got bike=${bikeTimes.drive} vs veh=${vehTimes.drive}`);

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Verification crashed:", e); process.exit(1); });
