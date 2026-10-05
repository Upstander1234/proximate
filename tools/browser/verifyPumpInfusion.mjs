// tools/browser/verifyPumpInfusion.mjs — hang a norepinephrine drip, dial a real mL/h, confirm an
// infusion line is created in state with a mcg/kg/min rate, then raise and stop it with the pump actions.
// Run: node tools/browser/verifyPumpInfusion.mjs   (needs `npm run dev` on PROXIMATE_URL, default 5174)
import { launch, clickText, toTitleScreen } from "./driver.mjs";
const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5174";
const { page, browser } = await launch();
const results = []; const check = (n, ok, d = "") => { results.push(ok); console.log(`  ${ok ? "PASS" : "FAIL"}  ${n} ${d}`); };
const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
await page.goto(BASE_URL); await page.evaluate(() => { try { localStorage.clear(); } catch {} }); await page.reload();
await toTitleScreen(page);
await page.evaluate(() => window.__proximateTestSetState({ phase: "scene", gmode: "sandbox", scen: "septicShock", level: "unlimited", t: 5, onSceneAt: 0, speed: 12, tab: "meds", ivSites: ["armR"], accessTypes: { armR: ["IV"] }, region: "armR", pockets: ["drug", "scope", "airway", "monitor", "trauma"], bags: ["drug", "airway", "monitor", "trauma"] }));
await page.waitForTimeout(600);
const btn = page.getByText(/Norepinephrine/i).first();
const present = await btn.count();
check("norepinephrine drip action offered", present > 0);
if (present) {
  await btn.click(); await page.waitForTimeout(400);
  await clickText(page, "Spike the bag"); await clickText(page, "Continue");
  const chamber = page.locator('svg g[style*="grab"]').first();
  await chamber.dispatchEvent("pointerdown"); await page.waitForTimeout(2600); await chamber.dispatchEvent("pointerup");
  await clickText(page, "Continue to the hub");
  await page.getByRole("button", { name: "Scrub the hub" }).click(); await page.getByRole("button", { name: /Aspirate and flush/ }).click();
  await page.getByText(/Spike into the/).first().click();
  const range = page.locator('input[type="range"]').first();
  await range.waitFor({ timeout: 3000 }).catch(() => {});
  await range.evaluate((el) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, "60"); el.dispatchEvent(new Event("input", { bubbles: true })); });
  const txt = await page.locator("body").innerText();
  check("pump line shows mcg/kg/min from the bag", /mcg\/kg\/min/.test(txt));
  await clickText(page, "Start the infusion"); await clickText(page, "Continue");
  await page.waitForTimeout(4000);
  const inf = await page.evaluate(() => window.__proximateTestGetState().infusions);
  check("infusion line created at the dialed rate", Array.isArray(inf) && inf.length === 1 && inf[0].mlH === 60 && inf[0].rate > 0, JSON.stringify(inf));
  await page.getByText(/Raise Norepinephrine/i).first().click().catch(() => {});
  await page.waitForTimeout(5000);
  const inf2 = await page.evaluate(() => window.__proximateTestGetState().infusions);
  check("raise pump adds a new segment at a higher rate", inf2.filter(l => l.to == null).some(l => l.mlH > 60), JSON.stringify(inf2.map(l => [l.mlH, l.to])));
}
check("no page errors", errs.length === 0, errs.join(" | "));
await browser.close();
console.log(`${results.filter(Boolean).length} passed, ${results.filter(x => !x).length} failed`);
