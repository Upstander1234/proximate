// tools/browser/verifyFreeDrawUp.mjs — real-click check of the free draw-up:
// the player picks any vial, draws any amount, and that exact amount reaches the
// patient by any route of the same drug. Two cases: 0.5 mg of morphine (an
// arbitrary under-dose), and epinephrine drawn from the 0.1 mg/mL cardiac vial
// but given IM through the 1:1000 IM action (one molecule, any presentation),
// plus a 10x fentanyl draw from a vial labeled in mcg.
//
// Run: node tools/browser/verifyFreeDrawUp.mjs   (needs `npx vite --port 5174`)
import { launch, clickText, waitForPhase, toTitleScreen } from "./driver.mjs";
const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5174";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.reload();
  await toTitleScreen(page);
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Free");
  await page.fill('input[placeholder="Last"]', "Draw");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}
const setRange = (page, label, v) => page.evaluate(([l, val]) => {
  const el = document.querySelector(`input[type="range"][aria-label="${l}"]`) || document.querySelectorAll('input[type="range"]')[0];
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(val));
  el.dispatchEvent(new Event("input", { bubbles: true }));
}, [label, v]);
const st = (page) => page.evaluate(() => window.__proximateTestGetState());
async function scene(page) {
  await page.evaluate(() => window.__proximateTestSetState({
    phase: "scene", gmode: "sandbox", scen: "chest", level: "unlimited", t: 5, onSceneAt: 0, speed: 12, tab: "meds", region: "legR",
    prepped: 0, preppedDraw: null, busy: null, accessMinigame: null, done: {}, given: {}, givenAmt: {},
    pockets: ["drug", "scope", "airway", "monitor", "trauma"], bags: ["drug", "airway", "monitor", "trauma"] }));
  await page.waitForTimeout(300);
}
async function draw(page, name, conc, syringe, ml) {
  // The draw-up action lives on the head region of the meds tab.
  await page.evaluate(() => window.__proximateTestSetState({ region: "head" }));
  await page.waitForTimeout(200);
  for (let i = 0; i < 20 && !(await st(page)).accessMinigame; i++) { await clickText(page, "Draw up a drug").catch(() => {}); await page.waitForTimeout(300); }
  await page.fill('input[aria-label="Search vials"]', name);
  await page.locator(`button[aria-label="Select vial: ${name}"]`).filter({ hasText: conc }).first().click();
  await page.getByRole("button", { name: `${syringe} mL syringe` }).click();
  await setRange(page, "Plunger", ml);
  for (let i = 0; i < 3; i++) await page.locator('svg g circle[r="10"]').first().click({ force: true }).catch(() => {});
  draw.lastText = await page.locator("text=Dose in hand").first().innerText().catch(() => "");
  await page.getByRole("button", { name: "Confirm and cap" }).click();

  for (let i = 0; i < 60; i++) { const d = (await st(page)).preppedDraw; if (d) return d; await page.waitForTimeout(250); }
  return null;
}
async function giveIM(page, label) {
  const before = ((await st(page)).doses || []).length;
  await page.evaluate(() => window.__proximateTestSetState({ busy: null, region: "legR" }));
  await page.getByText(label, { exact: false }).first().click();
  // An oversized draw raises the max-amount warning; the player may give it anyway.
  const anyway = page.getByRole("button", { name: "Give it anyway" });
  if (await anyway.isVisible({ timeout: 1500 }).catch(() => false)) { giveIM.warned = true; await anyway.click(); }
  await page.getByRole("button", { name: "Pinch the muscle" }).click();
  await setRange(page, "", 90);
  await page.getByRole("button", { name: "Insert the needle" }).click();
  const push = page.getByRole("button", { name: "Hold to push" });
  await push.hover(); await page.mouse.down(); await page.waitForTimeout(2500); await page.mouse.up();
  await page.getByRole("button", { name: "Withdraw and release" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  for (let i = 0; i < 80; i++) { const s = await st(page); if ((s.doses || []).length > before) return s; await page.waitForTimeout(250); }
  return st(page);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await freshCharacter(page);
  const results = [];
  const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}: ${name} ${detail}`); };

  await scene(page);
  const m = await draw(page, "Morphine", "10 mg/mL", 1, 0.05);
  check("free draw: 0.05 mL of 10 mg/mL morphine is 0.5 mg in hand", m && m.id === "morphine" && Math.abs(m.amount - 0.5) < 0.01, JSON.stringify(m));
  const s1 = await giveIM(page, "Morphine 4 mg · IM");
  const d1 = (s1.doses || []).at(-1);
  check("given IM, the patient receives exactly 0.5 mg", d1 && d1.id === "morphine" && Math.abs(d1.amount - 0.5) < 0.01 && !s1.preppedDraw, JSON.stringify(d1));

  await scene(page);
  const e = await draw(page, "Epinephrine", "0.1 mg/mL", 3, 3);
  check("free draw: 3 mL of the 0.1 mg/mL epinephrine is 0.3 mg", e && e.id === "epiIV" && Math.abs(e.amount - 0.3) < 0.01, JSON.stringify(e));
  const s2 = await giveIM(page, "Epinephrine 0.5 mg (1:1000) · IM");
  const d2 = (s2.doses || []).at(-1);
  check("cardiac-vial epinephrine given IM goes in as 0.3 mg by the IM route", d2 && d2.id === "epiIM" && Math.abs(d2.amount - 0.3) < 0.01, JSON.stringify(d2));

  await scene(page);
  const f = await draw(page, "Fentanyl", "50 mcg/mL", 10, 10);
  check("fentanyl vial labeled in mcg; 10 mL shows 500 mcg (0.5 mg) in hand", f && f.id === "fentanyl" && Math.abs(f.amount - 0.5) < 0.01 && /500 mcg \(0\.5 mg\)/.test(draw.lastText), `${JSON.stringify(f)} "${draw.lastText}"`);
  giveIM.warned = false;
  const s3 = await giveIM(page, "Fentanyl 50 mcg · IM");
  const d3 = (s3.doses || []).at(-1);
  check("a 10x fentanyl draw warns first, then reaches the patient as 0.5 mg", giveIM.warned && d3 && d3.id === "fentanyl" && Math.abs(d3.amount - 0.5) < 0.01, JSON.stringify(d3));

  const real = consoleErrors.filter(x => !/Failed to load resource|LocalLLMProvider|Hugging|favicon|Firebase|ERR_CERT/i.test(x));
  check("no console errors", real.length === 0, real.join(" | ").slice(0, 200));
  await browser.close();
  process.exit(results.every(Boolean) ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
