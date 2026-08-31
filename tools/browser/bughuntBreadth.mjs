// tools/browser/bughuntBreadth.mjs — F42/F43 breadth bug-hunt pass.
// Closes the specific gaps F43's "still open" list names:
//   1. Only 4 scenarios launched before, not 6+ different body systems.
//   2. Airway/Meds region-gated tabs never opened (default region is torso;
//      clicking the BodyMap to switch region to head first closes that gap).
//   3. Career mode's own setup wizard not click-tested.
//   4. Crew tab's actual "order a task" flow not click-tested.
// Plus: open/close Settings + Achievements overlays, watch for console errors.
//
// Real clicks throughout except one documented setState jump (skipping the
// response/approach travel-time drive — a separate, already-covered surface).
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/bughuntBreadth.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

// One scenario per body system, spread across the library.
const SYSTEMS = [
  { sys: "Cardiac", key: "ami", title: "Male, 58. Crushing chest pain while shoveling snow." },
  { sys: "Respiratory", key: "asthmaAttack", title: "Female, 54. Wheezing, cleaning with chemicals." },
  { sys: "Trauma", key: "fall", title: "Male, 24. Fall from a roof. Not moving." },
  { sys: "Toxicology", key: "od", title: "Male, 20s. Unresponsive, shallow breathing, cyanotic." },
  { sys: "Obstetric / Gynecologic", key: "childbirth", title: "Female, 30. Struck as a pedestrian. Pregnant, and crowning." },
  { sys: "Neurologic", key: "seizure", title: "Male, 25. Post-seizure, confused." },
  { sys: "Endocrine / Metabolic", key: "diabeticKetoacidosisCall", title: "Male, 24. Days of vomiting and deep, rapid breathing." },
];

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

// Launch a specific scenario from the cat phase's per-system dropdown.
async function launchScenario(page, { sys, key, title }) {
  // Find the <select> that contains an <option> with this scenario's key.
  const select = page.locator("select").filter({
    has: page.locator(`option[value="${key}"]`),
  });
  const count = await select.count();
  if (!count) throw new Error(`no <select> found containing option value="${key}" (${title})`);
  await select.first().selectOption(key);
  // The "Go ▸" button sits in the same flex row as the select.
  const row = select.first().locator("xpath=..");
  await row.locator("button", { hasText: "Go" }).click();
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
  const st = await getState(page);
  if (st.scen !== key) throw new Error(`expected scen=${key}, got ${st.scen}`);
  console.log(`  Launched ${sys}: ${title} (scen=${key}). OK`);
}

// Walk the kit -> response -> scene path, then exercise the scene.
async function enterScene(page) {
  await clickText(page, "Bring the stretcher");
  await clickText(page, "Roll");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
  const st = await getState(page);
  await setState(page, { phase: "scene", onSceneAt: st.t });
  await page.waitForTimeout(200);
}

// Click the BodyMap to switch region (head opens Airway/Meds tabs).
async function switchRegion(page, regionIndex) {
  // BodyMap renders g.rg elements: head(0), neck(1), torso(2), abdo(3),
  // armR(4), armL(5), legR(6), legL(7).
  await page.locator("g.rg").nth(regionIndex).click();
  await page.waitForTimeout(150);
  const st = await getState(page);
  return st.region;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page);
    console.log("1. Sandbox wizard click-through (level->department->vehicle->partners->mode->scope->ready->station->cat). OK");

    // ── Settings + Achievements overlays ────────────────────────────────
    // Both are always-visible fixed buttons (SettingsOverlay.jsx /
    // AchievementsOverlay.jsx), mounted on every screen via Shell.jsx.
    // The buttons use `title="Settings"`/`title="Achievements"` with a gear/
    // trophy emoji as the visible text — getByText won't match, use getByTitle.
    await page.getByTitle("Settings").click();
    await page.waitForTimeout(200);
    const settingsOpen = await page.evaluate(() => document.body.innerText.includes("Settings"));
    if (!settingsOpen) throw new Error("Settings overlay did not open");
    await clickText(page, "close");
    await page.waitForTimeout(200);
    console.log("2. Settings overlay opened and closed. OK");

    await page.getByTitle("Achievements").click();
    await page.waitForTimeout(200);
    const achOpen = await page.evaluate(() => document.body.innerText.includes("Achievements"));
    if (!achOpen) throw new Error("Achievements overlay did not open");
    await clickText(page, "close");
    await page.waitForTimeout(200);
    console.log("3. Achievements overlay opened and closed. OK");

    // ── Launch scenarios from 7 body systems ────────────────────────────
    for (let i = 0; i < SYSTEMS.length; i++) {
      const s = SYSTEMS[i];
      console.log(`\n── Body system ${i + 1}/${SYSTEMS.length}: ${s.sys} ──`);
      await launchScenario(page, s);
      await enterScene(page);

      // Switch region to head to open Airway/Meds tabs (F43's named gap).
      const region = await switchRegion(page, 0); // head
      if (region !== "head") throw new Error(`expected region=head after BodyMap click, got ${region}`);
      console.log(`  BodyMap -> head region (opens Airway/Meds tabs). OK`);

      // Click a few actions across tabs to exercise the scene.
      const bodyText = await page.locator("body").innerText();
      const hasAssess = bodyText.includes("ASSESS") || bodyText.includes("Assess");
      const hasAirway = bodyText.includes("AIRWAY") || bodyText.includes("Airway");
      const hasMeds = bodyText.includes("MEDS") || bodyText.includes("Meds");
      console.log(`  Tabs visible: assess=${hasAssess}, airway=${hasAirway}, meds=${hasMeds}`);

      // Try clicking the Airway tab if present. Non-exact: the tab button
      // renders TN[k] with letterSpacing styling that can split the text
      // node, so exact:true fails even though the text is visible.
      if (hasAirway) {
        await clickText(page, "Airway");
        await page.waitForTimeout(150);
        console.log("  Clicked Airway tab. OK");
      }
      // Try clicking the Meds tab if present.
      if (hasMeds) {
        await clickText(page, "Meds");
        await page.waitForTimeout(150);
        console.log("  Clicked Meds tab. OK");
      }

      // ── Crew tab: real "order a task" flow ────────────────────────────
      // The panel label is "Crew · N" (with a count) — non-exact match.
      await clickText(page, "Crew");
      await page.waitForTimeout(200);
      const crewText = await page.locator("body").innerText();
      const hasCrew = crewText.includes("Compressions") || crewText.includes("Ventilate");
      console.log(`  Crew tab: task buttons visible=${hasCrew}`);
      if (hasCrew) {
        // Click "Compressions" on the first crew card (Bystander).
        await clickText(page, "Compressions", { exact: true });
        await page.waitForTimeout(300);
        const st = await getState(page);
        const busy = Object.values(st.cBusy || {}).filter(Boolean);
        console.log(`  Ordered Compressions. cBusy entries: ${busy.length}`);
        if (!busy.length) throw new Error("ordering Compressions did not populate g.cBusy");
      }

      // Back to cat for the next scenario.
      await clickText(page, "← Abandon call");
      await page.waitForTimeout(300);
      // The confirm dialog — click the confirm button.
      const confirmBtn = page.locator("button", { hasText: "Abandon" }).last();
      await confirmBtn.click();
      await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
      console.log("  Abandoned call -> back to cat. OK");
    }

    // ── Career wizard click-through ─────────────────────────────────────
    console.log("\n── Career mode wizard ──");
    await clickText(page, "← Back");
    await page.waitForTimeout(200);
    // From cat, BackBtn goes to station. From station, we need to go back
    // to the wizard. Actually, let's just create a fresh character.
    // Simpler: navigate to title and start a Career character.
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await clickText(page, "Go on shift");
    await clickText(page, "I understand");
    await clickText(page, "New save");
    await clickText(page, "I understand");
    await clickText(page, "Start");
    await page.waitForTimeout(1700);
    await clickText(page, "Career Mode");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "level", null, { timeout: 5000 });
    await clickText(page, "EMT");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
    await clickText(page, "County EMS");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
    await clickText(page, "Ambulance");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
    await clickText(page, "▲ Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
    await clickText(page, "City");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
    await clickText(page, "▲ Ready");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
    await clickText(page, "▲ Begin");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    const careerSt = await getState(page);
    if (careerSt.gmode !== "career") throw new Error(`expected gmode=career, got ${careerSt.gmode}`);
    console.log("Career wizard click-through (level->department->vehicle->partners->mode->scope->ready->station). OK");

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Bug-hunt crashed:", e); process.exit(1); });