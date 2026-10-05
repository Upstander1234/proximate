// tools/browser/verifyDrawUpMixingAndWrongVial.mjs — real-click check of the two
// draw-up failure modes: push-dose epinephrine must be mixed (draw from the
// 0.1 mg/mL vial, dilute, push a volume), and a wrong vial can be used anyway,
// leaving a syringe that carries the ordered drug's label but its real contents.
//
// Run: node tools/browser/verifyDrawUpMixingAndWrongVial.mjs   (needs `npm run dev`)
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
  await page.fill('input[placeholder="First"]', "Mix");
  await page.fill('input[placeholder="Last"]', "Test");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}
const setRange = (page, idx, v) => page.evaluate(([i, val]) => {
  const el = document.querySelectorAll('input[type="range"]')[i];
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(val));
  el.dispatchEvent(new Event("input", { bubbles: true }));
}, [idx, v]);
// Open the minigame through the real "Draw up the next drug" action (a stub action has
// no run(), so the drawn syringe would never land in state), then pin the order.
async function openPrep(page, forceOrder) {
  await page.evaluate(() => window.__proximateTestSetState({
    phase: "scene", gmode: "sandbox", scen: "chest", level: "unlimited", t: 5, onSceneAt: 0, speed: 1, tab: "meds", region: "head",
    prepped: 0, preppedDraw: null, busy: null, accessMinigame: null,
    pockets: ["drug", "scope", "airway", "monitor", "trauma"], bags: ["drug", "airway", "monitor", "trauma"] }));
  await page.waitForTimeout(300);
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => !!window.__proximateTestGetState().accessMinigame)) break;
    await page.evaluate(() => window.__proximateTestSetState({ busy: null, prepped: 0, preppedDraw: null, done: {} }));
    await clickText(page, "Draw up the next drug").catch(() => {});
    await page.waitForTimeout(300);
  }
  // Remount with the pinned order (the minigame picks its order once, at mount).
  // Function patches keep the real action object (with its run()) intact; a JSON round trip would drop it.
  await page.evaluate(() => window.__proximateTestSetState((g) => ({ accessMinigame: null, _testMgStash: g.accessMinigame })));
  await page.waitForTimeout(200);
  await page.evaluate((fo) => window.__proximateTestSetState((g) => ({ accessMinigame: { ...g._testMgStash, forceOrder: fo }, _testMgStash: undefined })), forceOrder);
  await page.waitForTimeout(300);
}
// The prep action costs sim time; the drawn syringe lands in state when it completes.
const waitDraw = async (page) => {
  await page.evaluate(() => window.__proximateTestSetState({ speed: 12 }));
  for (let i = 0; i < 40; i++) { const d = await page.evaluate(() => window.__proximateTestGetState().preppedDraw); if (d) return d; await page.waitForTimeout(250); }
  return null;
};
const flick = async (page) => { for (let i = 0; i < 3; i++) await page.locator('svg g circle[r="10"]').first().click({ force: true }).catch(() => {}); };
const pickVial = async (page, pred) => {
  for (const v of await page.locator('button[aria-label^="Select vial"]').all()) {
    const label = (await v.getAttribute("aria-label")).replace("Select vial: ", "").trim();
    if (pred(label)) { await v.click(); return label; }
  }
  return null;
};

async function mixRun(page, epiMl, totalMl, pushMl) {
  await openPrep(page, "pushEpi");
  const v = await pickVial(page, l => /^Epinephrine 1 mg/.test(l));
  if (!v) return { body: "no epinephrine vial" };
  await setRange(page, 0, epiMl); await setRange(page, 1, totalMl); await setRange(page, 2, pushMl);
  await flick(page);
  await clickText(page, "Confirm and cap");
  return { body: await page.locator("body").innerText() };
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await freshCharacter(page);
  const results = [];
  const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}: ${name} ${detail}`); };

  // Correct mix: 1 mL of 0.1 mg/mL into 10 mL total (10 mcg/mL), push 2 mL = 20 mcg.
  const good = await mixRun(page, 1, 10, 2);
  check("push-dose epi mixed correctly is accepted", /Drawn, labeled/.test(good.body), good.body.match(/Order:[^\n]*/)?.[0] || "");
  await clickText(page, "Continue");
  const st = await waitDraw(page);
  check("the mixed syringe carries 20 mcg", st && st.id === "pushEpi" && Math.abs(st.amount - 0.02) < 0.002, JSON.stringify(st));

  // No dilution: pushing 2 mL straight from the vial is 0.2 mg, a 10x error.
  const raw = await mixRun(page, 1, 0, 2);
  check("skipping dilution is caught as a 10x dose", /not the ordered dose/.test(raw.body) && /10\.0x/.test(raw.body), raw.body.match(/ordered[^\n]*/)?.[0] || "");
  await clickText(page, "Continue"); await page.waitForTimeout(300);

  // Wrong vial, used anyway: the syringe is labeled midazolam but holds the other drug.
  await openPrep(page, "midazolam");
  const other = await pickVial(page, l => !/^Midazolam/i.test(l));
  await setRange(page, 0, 1); await flick(page);
  await clickText(page, "Confirm and cap");
  const wv = await page.locator("body").innerText();
  check("a wrong vial is flagged", /not the ordered drug/.test(wv), other || "");
  // A button-role click: the flash message itself also contains the words "use it anyway".
  await page.getByRole("button", { name: "Use it anyway" }).click();
  const st2 = await waitDraw(page);
  check("used-anyway syringe keeps the midazolam label but holds the other drug", st2 && st2.label === "midazolam" && st2.id !== "midazolam", JSON.stringify(st2));

  const real = consoleErrors.filter(e => !/Failed to load resource|LocalLLMProvider|Hugging|favicon|Firebase|ERR_CERT/i.test(e));
  check("no console errors", real.length === 0, real.join(" | ").slice(0, 200));
  await browser.close();
  process.exit(results.every(Boolean) ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
