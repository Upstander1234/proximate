// tools/browser/verifyCh1Tutorial.mjs — real click-through verification for
// the interactive first-call tutorial (TutorialCoachmark.jsx): confirms it
// auto-opens on benignFaint (the real first tutorial call), pauses the sim
// clock while open, steps through all 6 stops via real clicks, resumes the
// clock and sets ch1TutorialDone once finished, and never reappears on a
// later call. Establishes a real character via real clicks first (per
// driver.mjs's own guidance), then uses setState to skip straight past the
// prologue scenes and the kit/response/approach loadout steps that are
// ordinary core gameplay, not part of what this script verifies — the same
// "skip core gameplay, not campaign phase-wiring" idiom clickThroughCh1.mjs
// already established for this exact tutorial shift.
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
    await clickText(page, "Career Mode");
    await clickText(page, "Zero-To-Hero", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignDisclaimer");
    console.log("1. Real character creation reached campaignDisclaimer. OK");

    // Jump to campaignPreCall1 with the real fixed tutorial queue already
    // seeded (campaignIntro's own beginPatrol() sets this identical shape —
    // reproduced here rather than clicked through, since this script's own
    // target is several scenes further along).
    await setState(page, {
      phase: "campaignPreCall1", learningMode: "zth",
      career: { queue: ["benignFaint", "od", "seizure"], idx: 0, results: [] },
      relationships: { partner_patrol: { name: "Riley Chen", role: "PATROL partner", gender: "nonbinary", pronouns: "nonbinary", friendship: 10, romance: 0, met: true } },
    });
    await page.waitForTimeout(200);
    for (let i = 0; i < 8; i++) {
      const phase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
      if (phase !== "campaignPreCall1") break;
      await page.locator("text=/▶/").first().click({ timeout: 3000 });
      await page.waitForTimeout(150);
    }
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    let st = await getState(page);
    if (st.scen !== "benignFaint") throw new Error(`expected scen "benignFaint" after real click-through, got "${st.scen}"`);
    console.log("2. Real click through campaignPreCall1's dialogue reached \"kit\" with scen=benignFaint (real SCEN.seed()). OK");

    // The kit -> response -> approach -> scene loadout/travel steps are
    // ordinary core gameplay (vehicle/bag prep, travel time), not this
    // tutorial's own concern — jump the last hop directly, keeping every
    // field the real seed() call already populated.
    await setState(page, { phase: "scene", onSceneAt: st.t, region: "torso" });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.ch1TutorialActive === true, null, { timeout: 5000 });
    console.log("3. Reaching the benignFaint scene auto-started the tutorial (ch1TutorialActive=true). OK");

    // Pause check: sim time must not advance while the tutorial is up.
    const before = (await getState(page)).t;
    await page.waitForTimeout(1500);
    const during = (await getState(page)).t;
    if (during !== before) throw new Error(`sim clock advanced while tutorial active: ${before} -> ${during}`);
    console.log(`4. Sim clock held at t=${before} while the tutorial overlay was open. OK`);

    // Step through all 6 stops via real clicks on the coachmark's own
    // Next/Got it button.
    for (let step = 0; step < 6; step++) {
      const label = step < 5 ? "Next →" : "Got it";
      await clickText(page, label, { timeout: 3000 });
      await page.waitForTimeout(150);
    }
    st = await getState(page);
    if (st.ch1TutorialActive !== false) throw new Error(`expected ch1TutorialActive=false after finishing, got ${st.ch1TutorialActive}`);
    if (!st.ch1TutorialDone) throw new Error(`expected ch1TutorialDone truthy after finishing, got ${st.ch1TutorialDone}`);
    console.log("5. Clicked through all 6 real coachmark steps -> ch1TutorialActive=false, ch1TutorialDone set. OK");

    // Clock resumes now that the tutorial is closed.
    const afterBefore = (await getState(page)).t;
    await page.waitForTimeout(1500);
    const afterDuring = (await getState(page)).t;
    if (afterDuring === afterBefore) throw new Error(`sim clock did not resume after the tutorial closed: stayed at ${afterBefore}`);
    console.log(`6. Sim clock resumed after close: t=${afterBefore} -> ${afterDuring}. OK`);

    // Never reappears on a later call, even though it's still the same
    // tutorial shift and career.idx has moved on.
    await setState(page, {
      phase: "scene", scen: "od", career: { queue: ["benignFaint", "od", "seizure"], idx: 1, results: [] },
    });
    await page.waitForTimeout(600);
    st = await getState(page);
    if (st.ch1TutorialActive) throw new Error("tutorial re-triggered on a later call despite ch1TutorialDone");
    console.log("7. Tutorial did not reappear on the od call (ch1TutorialDone holds). OK");

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("verifyCh1Tutorial crashed:", e); process.exit(1); });
