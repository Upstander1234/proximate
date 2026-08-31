// tools/browser/verifyCustomScenarioFbaoClear.mjs — closes the third of F10's
// three remaining "still open" items (CLAUDE.md queue): confirming fbao
// still clears via CPR when combined with a chronic comorbidity in a custom
// (BUILD YOUR OWN) case, in a real browser scene, not just by reading the
// generic conditionHas() helper in isolation.
//
// Real clicks throughout except one documented setState jump (skipping the
// response/approach travel-time drive — a separate, already-covered surface;
// see verifyCustomScenarioSave.mjs's own identical carve-out for the
// precedent this follows).
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyCustomScenarioFbaoClear.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function createSandboxCharacter(page) {
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
  await clickText(page, "County EMS");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
  await clickText(page, "EMS Supervisor");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
  // "▲ " prefixes below are load-bearing, not decorative: the scope screen's
  // own descriptive paragraph contains the plain word "Ready" ("press Ready
  // below, this scope is LOCKED...") ahead of the real button in DOM order,
  // so a bare clickText(page,"Ready") silently clicks inert paragraph text
  // instead — see verifyCustomScenarioSave.mjs for the debugging trace.
  await clickText(page, "▲ Continue");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
  await clickText(page, "City");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
  await clickText(page, "▲ Ready");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
  await clickText(page, "▲ Begin");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
  await clickText(page, "▲ Get the call");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
}

async function selectCondition(page, groupHeaderText, conditionName) {
  await clickText(page, groupHeaderText);
  await page.waitForTimeout(150);
  // Not exact:true — see verifyCustomScenarioSave.mjs's own selectCondition
  // comment: the button's text is a checkbox glyph glued directly onto the
  // name with no space, so an exact match against the bare name never hits.
  await clickText(page, conditionName);
  await page.waitForTimeout(150);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page);
    console.log("1. Real click-through to the BUILD YOUR OWN picker (cat phase). OK");

    // fbao (emergent / Physiologic States) + epilepsy (chronic / Disabilities
    // & Neurologic Conditions) — the exact combination F10's own "still
    // open" note names: "confirming fbao+chronic still clears via CPR
    // in-scene." conditionHas()/woundsFor() (App.jsx) are the generic
    // helpers this exercises against a real array-shaped condition list,
    // not a single string.
    await selectCondition(page, "PHYSIOLOGIC STATES", "Foreign body airway obstruction");
    await selectCondition(page, "NEUROLOGIC CONDITIONS", "Epilepsy (seizure disorder)");
    let st = await getState(page);
    console.log(`2. Real-clicked both conditions. customParams.conditions=[${(st.customParams?.conditions || []).join(", ")}]. OK`);
    if (!st.customParams?.conditions?.includes("fbao") || !st.customParams?.conditions?.includes("epilepsy"))
      throw new Error(`expected both conditions selected, got ${JSON.stringify(st.customParams)}`);

    await clickText(page, "4×"); // real UI time-scale control, capped at 4x
    await clickText(page, "▲ Run this case");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    console.log("3. Real click \"Run this case\" -> kit. OK");

    // See verifyCustomScenarioSave.mjs's own comment: the kit screen's real
    // continue button is "Roll — <code name>", not "Load the truck" (that
    // one belongs to the separate limited-items LOADOUT screen). It stays
    // disabled until bag selection is "ready" — real-click the stretcher
    // option to satisfy that with one click.
    await clickText(page, "Bring the stretcher");
    await clickText(page, "Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
    st = await getState(page);
    await setState(page, { phase: "scene", onSceneAt: st.t });
    await page.waitForTimeout(200);
    console.log("4. Real click \"Roll\" -> response, setState-skipped travel time -> scene. OK");

    st = await getState(page);
    if (st.cleared) throw new Error("airway already cleared before any action was taken — test fixture is wrong");

    await clickText(page, "PROCEDURES");
    await clickText(page, "Chest compressions");
    console.log("5. Real click PROCEDURES tab -> \"Chest compressions\" (starts the busy timer — cost 60s, 4x time scale). OK");

    let cleared = false;
    for (let i = 0; i < 40; i++) {
      st = await getState(page);
      if (st.cleared) { cleared = true; break; }
      await page.waitForTimeout(500);
    }
    if (!cleared) throw new Error("s.cleared never became true after 20s of real-time waiting on the compressions busy timer");
    console.log(`6. s.cleared=1 for real after the busy timer resolved (App.jsx:1318's conditionHas(condition,\"fbao\") branch fired against an array-shaped condition list). OK`);

    // A second, independent confirmation via the DOM: the real message this
    // action produces on success is specific to the FBAO-clear branch, not
    // a generic "compressions done" line.
    const bodyText = await page.locator("body").innerText();
    const messageVisible = /sweep it out with a finger/i.test(bodyText);
    console.log(`7. FBAO-clear result text visible in the DOM: ${messageVisible}. OK`);
    if (!messageVisible) throw new Error("expected the FBAO-clear compressions result text, found none");

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Verification crashed:", e); process.exit(1); });
