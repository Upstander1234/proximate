// tools/browser/verifyMosPatrolFixedCrew.mjs — real click-through verifying
// F7's Master-of-Your-Scope extension: fleet.js's `patrol` vehicle kind now
// carries a real `fixedCrew` (a generic, anonymous "PATROL Volunteer"
// partner), so a manual Career player picking "patrol" through the ordinary
// level -> department -> vehicle -> partners wizard gets a real seated
// partner too, not just the Zero-To-Hero campaign's own named
// relationships.partner_patrol (see verifyPatrolPartnerCrewSeat.mjs for
// that path). Confirms the real "vehicle" phase pick() handler seeds
// g.roster with a fixed, free, Layperson entry with a real (non-undefined)
// id, and that the "partners" recruit screen renders it correctly with the
// now-generalized fixed-crew note text (previously hardcoded to "flies the
// aircraft," which only fit flight's pilot).
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
    await clickText(page, "Career Mode");
    await clickText(page, "Master of Your Scope", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "level", null, { timeout: 5000 });
    console.log("1. Real clicks: Career Mode -> Master of Your Scope -> level. OK");

    await clickText(page, "Layperson", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
    await clickText(page, "Campus PD", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
    console.log("2. Real clicks: Layperson -> Campus PD -> vehicle. OK");

    await clickText(page, "PATROL Volunteer", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
    const st = await getState(page);
    console.log("3. Real click on \"PATROL Volunteer\" -> partners. OK");

    const fixed = (st.roster || []).find((p) => p.fixed);
    if (!fixed) throw new Error("picking the patrol vehicle kind did not seed a fixed roster entry");
    if (fixed.id == null) throw new Error("fixed crew entry has no id (React-key / g.cBusy collision risk)");
    if (fixed.level !== "layperson") throw new Error(`expected layperson level, got ${fixed.level}`);
    if (fixed.cost !== 0) throw new Error(`expected cost:0 (not part of the recruit budget), got ${fixed.cost}`);
    console.log(`4. g.roster has a real fixed crew entry: id="${fixed.id}", name="${fixed.name}", level=${fixed.level}, cost=${fixed.cost}. OK`);

    if (st.myVeh?.normalSeats !== 2) throw new Error(`expected patrol's normalSeats:2 (you + the fixed partner), got ${st.myVeh?.normalSeats}`);

    const panelText = await page.evaluate(() => document.body.innerText);
    if (!panelText.includes(fixed.name)) throw new Error(`partners screen doesn't show "${fixed.name}"`);
    if (!panelText.includes("rides along automatically"))
      throw new Error('partners screen still shows the old pilot-only "flies the aircraft" text for a non-pilot fixed crew member');
    if (panelText.includes("flies the aircraft"))
      throw new Error('partners screen wrongly shows pilot flavor text for this non-pilot fixed crew member');
    console.log("5. \"partners\" screen renders the fixed entry with the generalized (non-pilot) note text, not the old pilot-only copy. OK");

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Click-through test crashed:", e); process.exit(1); });
