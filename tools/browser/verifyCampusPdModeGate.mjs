// tools/browser/verifyCampusPdModeGate.mjs — real in-browser verification
// that the "WHERE ARE YOU WORKING" (mode) phase only offers City for Campus
// PD (Northwood University only exists in the city map — see maps.js), and
// confirms every other department is UNAFFECTED (still offers all 3
// regions) — a real regression check, not just the positive case.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyCampusPdModeGate.mjs`.

import { launch, clickText } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function regionOptionsFor(browser, { levelLabel, departmentLabel, vehicleLabel }) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.stack || err.message}`));
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await clickText(page, "Go on shift");
  await clickText(page, "I understand");
  await clickText(page, "New save");
  await clickText(page, "I understand");
  await clickText(page, "Start");
  await page.waitForTimeout(1700);
  await clickText(page, "Medical Education Mode");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "level", null, { timeout: 5000 });
  // Campus PD's own kinds (pso/patrol/campusEmr) are only staffable at
  // Layperson/EMR level (fleet.js's KIND_LEVELS) — Paramedic never even
  // shows Campus PD as a department option, so the two cases need
  // different levels, not the same one.
  await clickText(page, levelLabel, { exact: true });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
  await clickText(page, departmentLabel, { exact: true });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
  await clickText(page, vehicleLabel, { exact: true });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
  await clickText(page, "▲ Continue");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
  const regions = [];
  for (const r of ["City", "Suburban", "Rural"]) {
    const count = await page.getByText(r, { exact: true }).count();
    if (count > 0) regions.push(r);
  }
  await ctx.close();
  return { regions, errors };
}

async function main() {
  const { browser } = await launch({ headless: true });
  try {
    const campus = await regionOptionsFor(browser, { levelLabel: "EMR", departmentLabel: "Campus PD", vehicleLabel: "PATROL Volunteer" });
    console.log("Campus PD offers:", campus.regions.join(", "));
    if (campus.regions.length !== 1 || campus.regions[0] !== "City") {
      throw new Error(`expected Campus PD to offer ONLY City, got: ${campus.regions.join(", ")}`);
    }

    const county = await regionOptionsFor(browser, { levelLabel: "Paramedic", departmentLabel: "County EMS", vehicleLabel: "EMS Supervisor" });
    console.log("County EMS offers:", county.regions.join(", "));
    if (county.regions.length !== 3) {
      throw new Error(`expected County EMS to still offer all 3 regions (no regression), got: ${county.regions.join(", ")}`);
    }

    const errors = [...campus.errors, ...county.errors];
    console.log(errors.length ? `Console errors: ${errors.join(" | ")}` : "No console errors.");
    console.log(errors.length ? "FAIL" : "PASS");
    process.exitCode = errors.length ? 1 : 0;
  } catch (e) {
    console.error("Verification crashed:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
main();
