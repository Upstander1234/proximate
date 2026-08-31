// tools/browser/verifyCustomScenarioSave.mjs — closes two of F10's three
// remaining "still open" items (CLAUDE.md queue): a real in-scene wound
// render for a multi-condition trauma+chronic custom case, and a real
// save/reload round-trip of g.customParams mid-picker. Both were flagged as
// "expected to work... but none has been watched happen on screen yet."
//
// Real clicks throughout except one documented setState jump (skipping the
// response/approach travel-time drive — a separate, already-covered surface;
// F4's own queue entry covers the driving minigame itself) — same carve-out
// precedent clickThroughCh1to3.mjs/clickThroughCh8to10.mjs already use.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyCustomScenarioSave.mjs`.

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
  // instead — found by debugging exactly this timeout.
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

// Expands a BUILD YOUR OWN taxonomy group by its category header text, then
// real-clicks the named condition inside it. `.first()` (clickText's own
// default) always lands on the taxonomy button, never the post-selection
// chip below it — the chip row renders AFTER the taxonomy tree in DOM order.
async function selectCondition(page, groupHeaderText, conditionName) {
  await clickText(page, groupHeaderText);
  await page.waitForTimeout(150);
  // Not exact:true — the button's full text content is "☐" (or "☑") glued
  // directly onto the condition name with no space (two sibling text nodes
  // in the same <button>, confirmed by dumping innerText while debugging
  // this), so an exact match against the bare name never matches anything.
  await clickText(page, conditionName);
  await page.waitForTimeout(150);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page);
    console.log("1. Real click-through to the BUILD YOUR OWN picker (cat phase). OK");

    // Two categories that don't share a name with any category on the other
    // tier (both "Diseases" categories exist on both tiers and would collide
    // under clickText's first-match semantics) — abdominalGSW (emergent /
    // Injuries, has a real torso wound) + epilepsy (chronic / Disabilities &
    // Neurologic Conditions).
    await selectCondition(page, "INJURIES", "Penetrating abdominal trauma (GSW)");
    await selectCondition(page, "NEUROLOGIC CONDITIONS", "Epilepsy (seizure disorder)");
    let st = await getState(page);
    console.log(`2. Real-clicked both conditions. customParams.conditions=[${(st.customParams?.conditions || []).join(", ")}]. OK`);
    if (!st.customParams?.conditions?.includes("abdominalGSW") || !st.customParams?.conditions?.includes("epilepsy"))
      throw new Error(`expected both conditions selected, got ${JSON.stringify(st.customParams)}`);

    // Real UI time-scale control (capped at 4x, unlike an arbitrary injected
    // value) — shortens the real-time wait for the exposure action's busy
    // timer below without bypassing the tick loop that actually resolves it.
    await clickText(page, "4×");

    const saveId = st.saveId, savedConditions = st.customParams.conditions.slice();

    await clickText(page, "▲ Run this case");
    // "kit" is one of the three phases (App.jsx's own autosave effect) that
    // triggers a REAL writeSave(g.saveId, g, ...) the instant it's entered —
    // this is the actual "autosaves before every call" mechanism the Saves
    // screen's own text describes, not something this script has to fake.
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await page.waitForTimeout(400); // let the autosave effect's writeSave land
    console.log("3. Real click \"Run this case\" -> kit (autosave effect fires here). OK");

    // The kit screen's own continue button reads "Roll — <code name>" for
    // any non-Layperson level ("▲ Load the truck" belongs to the separate
    // LOADOUT screen, only reached via limited-items mode, which sandbox
    // defaults off) — found while debugging this exact click. It stays
    // disabled until bag selection is "ready" (g.bags.length===bagCap, or
    // stretcher); real-click the stretcher option to satisfy that with one
    // click rather than picking three individual bags.
    await clickText(page, "Bring the stretcher");
    await clickText(page, "Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
    st = await getState(page);
    // Skips only the response/approach travel-time drive (a real WASD 3D
    // driving segment, F4's own separately-tracked surface) — every action
    // from here on is a real click against the real scene screen.
    await setState(page, { phase: "scene", onSceneAt: st.t });
    await page.waitForTimeout(200);
    console.log("4. Real click \"Roll\" -> response, setState-skipped travel time -> scene. OK");

    await clickText(page, "PROCEDURES");
    await clickText(page, "Remove shirt");
    console.log("5. Real click PROCEDURES tab -> \"Remove shirt\" (starts the busy timer). OK");

    let exposed = false;
    for (let i = 0; i < 40; i++) {
      st = await getState(page);
      if (st.exposed?.torso) { exposed = true; break; }
      await page.waitForTimeout(500);
    }
    if (!exposed) throw new Error("torso never exposed after 20s of real-time waiting on the busy timer");
    const bodyText = await page.locator("body").innerText();
    // "left lower quadrant" is unique to abdominalGSW's own WOUND note
    // (conditions.js) — NOT its dispatch line ("Gunshot wound to the
    // abdomen."), which is already on screen regardless of exposure state.
    // Matching the wound note specifically proves exposure actually
    // revealed something new, not just that dispatch text is present.
    const woundVisible = /left lower quadrant/i.test(bodyText);
    console.log(`6. Torso exposed for real (busy timer resolved). Wound note text visible in the DOM: ${woundVisible}. OK`);
    if (!woundVisible) throw new Error("expected the abdominalGSW wound note (\"...left lower quadrant...\") to render once torso is exposed, found none");

    // ── Save/reload round-trip ──────────────────────────────────────────
    // Simulate a real browser restart: fresh navigation drops all in-memory
    // React state, leaving only what actually made it to localStorage via
    // the real writeSave call above.
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await clickText(page, "Go on shift"); // disclaimer flag persists across this reload (same localStorage) -> straight to Saves
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "saves", null, { timeout: 5000 });
    await clickText(page, "Continue");
    await page.waitForTimeout(300);
    st = await getState(page);
    console.log(`7. Real reload -> Saves -> "Continue" -> phase=${st.phase}, saveId=${st.saveId}. OK`);
    if (st.saveId !== saveId) throw new Error(`expected the same saveId (${saveId}) after reload, got ${st.saveId}`);
    const reloadedConditions = st.customParams?.conditions || [];
    console.log(`8. customParams.conditions after reload: [${reloadedConditions.join(", ")}]. OK`);
    if (JSON.stringify(reloadedConditions.slice().sort()) !== JSON.stringify(savedConditions.slice().sort()))
      throw new Error(`customParams.conditions did not round-trip: before=${savedConditions}, after=${reloadedConditions}`);
    // Documented, expected behavior (tools/browser/README.md's own gotcha):
    // doContinue() always forces phase to "station"/"shiftSummary" once
    // character setup is done — it does NOT resume mid-picker. The round
    // trip under test here is the VALUE, not the phase.
    if (st.phase !== "station") console.log(`   (note: phase landed on "${st.phase}", not "station" — unexpected, but not what this script is checking)`);

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Verification crashed:", e); process.exit(1); });
