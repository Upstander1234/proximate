// tools/browser/verifyDrawUpRealDoses.mjs — real-click check of the draw-up
// The player draw-up is free (verifyFreeDrawUp.mjs); this checks the scored ordered mode via forceOrder.
// minigame with real units: the order shows a real amount, each vial shows its
// concentration, drawing amount/concentration succeeds, and a 10x volume error
// is rejected as a wrong dose.
//
// Run: node tools/browser/verifyDrawUpRealDoses.mjs   (needs `npm run dev`)
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
  await page.fill('input[placeholder="First"]', "Draw");
  await page.fill('input[placeholder="Last"]', "Up");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}
const setRange = (page, v) => page.evaluate((val) => {
  const el = document.querySelector('input[type="range"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(val));
  el.dispatchEvent(new Event("input", { bubbles: true }));
}, v);

async function openPrep(page) {
  await page.evaluate(() => window.__proximateTestSetState({
    phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic", t: 5, onSceneAt: 0, tab: "meds",
    accessMinigame: { action: { id: "prep", region: "head", cost: 25, gerund: "Drawing up" }, kind: "prep", forceOrder: "morphine" },
  }));
  await page.waitForTimeout(400);
}

async function drawOnce(page, mult) {
  await openPrep(page);
  const text = await page.locator("body").innerText();
  const m = text.match(/Order:\s*(.+?),\s*([\d.]+)\s*(mg|mcg|U|mEq|g)/);
  if (!m) return { ok: false, why: "no order" };
  const amount = parseFloat(m[2]);
  let conc = null;
  for (const v of await page.locator('button[aria-label^="Select vial"]').all()) {
    const label = (await v.getAttribute("aria-label")).replace("Select vial: ", "").trim();
    if (m[1].trim() === label) {
      const c = (await v.innerText()).match(/([\d.]+)\s*(mg|mcg|U|mEq|g)\/mL/); if (c) conc = parseFloat(c[1]);
      await v.click(); break;
    }
  }
  if (conc == null) return { ok: false, why: "vial not found", order: m[1] };
  const max = Number(await page.locator('input[type="range"]').getAttribute("max"));
  await setRange(page, Math.min(max, (amount / conc) * mult));
  for (let i = 0; i < 3; i++) await page.locator('svg g circle[r="10"]').first().click({ force: true }).catch(() => {});
  await clickText(page, "Confirm and cap");
  const body = await page.locator("body").innerText();
  await clickText(page, "Continue");
  await page.waitForTimeout(300);
  return { ok: true, order: `${m[1]} ${amount}`, body };
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await freshCharacter(page);
  const results = [];
  const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}: ${name} ${detail}`); };

  await openPrep(page);
  const text = await page.locator("body").innerText();
  check("order shows a real amount and unit", /Order:\s*.+?,\s*[\d.]+\s*(mg|mcg|U|mEq|g)/.test(text));
  check("vials show a real concentration", /\/mL/.test(text));
  const good = await drawOnce(page, 1);
  check("drawing amount/concentration is accepted", good.ok && /Drawn, labeled/.test(good.body || ""), good.order || good.why || "");
  const bad = await drawOnce(page, 10);
  check("a 10x volume error is refused as a wrong dose", bad.ok && /not the ordered dose/.test(bad.body || ""), bad.order || bad.why || "");
  const real = consoleErrors.filter(e => !/Failed to load resource|LocalLLMProvider|Hugging|favicon|Firebase|ERR_CERT/i.test(e));
  check("no console errors", real.length === 0, real.join(" | ").slice(0, 200));
  await browser.close();
  process.exit(results.every(Boolean) ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
