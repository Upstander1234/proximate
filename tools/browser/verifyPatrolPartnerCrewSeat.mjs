// tools/browser/verifyPatrolPartnerCrewSeat.mjs — real click-through
// verifying F7 (CLAUDE.md queue): the Zero-To-Hero PATROL partner
// (g.relationships.partner_patrol) now gets a real crew seat instead of
// being a VNSprite-only narrative presence. Confirms the fixed, free,
// Layperson-level roster entry App.jsx's beginPatrol() now seeds actually
// reaches g.roster -> g.crew -> the in-scene crew-order panel, not just
// that the code compiles.
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
    console.log("1. Reached campaignDisclaimer via real clicks. OK");

    // Jump straight to campaignIntro — the screen with the real
    // "Begin your PATROL" button whose handler (beginPatrol) is the actual
    // code under test. Everything before it (disclaimer, customize, the
    // heat-stroke prologue) is a separate, already-covered stretch, same
    // carve-out precedent clickThroughCh1to3.mjs already uses.
    await setState(page, { phase: "campaignIntro" });
    await page.waitForTimeout(200);
    await clickText(page, "Begin your PATROL");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignSupervisorClass", null, { timeout: 5000 });
    let st = await getState(page);
    const partnerRoster = (st.roster || []).find((p) => p.id === "partner_patrol");
    if (!partnerRoster) throw new Error("beginPatrol did not seed a partner_patrol roster entry");
    if (partnerRoster.level !== "layperson") throw new Error(`expected layperson level, got ${partnerRoster.level}`);
    if (!partnerRoster.fixed) throw new Error("expected fixed:true (free, non-recruitable)");
    if (partnerRoster.name !== st.relationships.partner_patrol.name)
      throw new Error("roster entry name doesn't match relationships.partner_patrol.name");
    console.log(`2. Real click on "Begin your PATROL" -> g.roster now has a fixed Layperson partner_patrol entry named "${partnerRoster.name}". OK`);

    // Skip the two remaining VN screens (supervisor class dialogue, the
    // patrol briefing reference card) — real dialogue-advance clicking is
    // already proven generically by clickThroughCh1.mjs. Jump to
    // campaignPreCall1, whose own "Head over" button is beginCall(), the
    // real site that seeds g.scen/kit state — that's real code, not a
    // reconstruction.
    await setState(page, { phase: "campaignPreCall1" });
    await page.waitForTimeout(200);
    // campaignPreCall1 is a VNDialogue (doneLabel="Head over") — click the
    // "▶" advance indicator until the last line's click fires onDone/
    // beginCall(), same loop clickThroughCh1.mjs already uses.
    for (let i = 0; i < 10; i++) {
      const phase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
      if (phase !== "campaignPreCall1") break;
      await page.locator("text=/▶/").first().click({ timeout: 3000 });
      await page.waitForTimeout(150);
    }
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    console.log("3. Real click through campaignPreCall1's dialogue -> kit (beginCall() ran for real). OK");

    // kit's own Layperson button is also labeled "Head over" (L===0) — this
    // is the exact click site (App.jsx's ownCrew build) under test.
    await clickText(page, "Head over");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
    st = await getState(page);
    const partnerCrew = (st.crew || []).find((c) => c.id === "partner_patrol");
    if (!partnerCrew) throw new Error("g.crew does not contain partner_patrol after the kit->response transition");
    if (partnerCrew.crewTitle !== "partner") throw new Error(`expected crewTitle "partner", got ${partnerCrew.crewTitle}`);
    console.log(`4. Real click on kit's "Head over" -> response. g.crew contains "${partnerCrew.name}" (level ${partnerCrew.level}, crewTitle ${partnerCrew.crewTitle}). OK`);

    // Fast-forward into the scene itself (skips the real-time approach
    // walk — a plain time-skip, not a reconstruction of any formula) and
    // open the real crew-order panel to confirm the partner renders with a
    // real, orderable task button, not just live in `g` unrendered.
    await setState(page, { phase: "scene", onSceneAt: st.t });
    await page.waitForTimeout(300);
    // L===0's "Call 911?" modal blocks the panel — answer it for real first.
    await clickText(page, "No — not yet");
    await clickText(page, "Crew ·");
    await page.waitForTimeout(200);
    const crewPanelText = await page.evaluate(() => document.body.innerText);
    if (!crewPanelText.includes(partnerRoster.name))
      throw new Error(`crew panel does not show "${partnerRoster.name}"`);
    if (!crewPanelText.includes("LAYPERSON"))
      throw new Error("crew panel does not show a LAYPERSON-level crew entry");
    console.log(`5. Real click on the Crew tab -> panel shows "${partnerRoster.name}" as a LAYPERSON crew member. OK`);
    await page.screenshot({ path: "tools/browser/screenshots/patrol-partner-crew-seat.png", fullPage: true });

    // Real order: click the partner's own "Compressions" button (their card,
    // not the Bystander's identical-looking one) and confirm g.cBusy picks
    // up a real task for their id — proving order() itself, not just the
    // panel's rendering, accepts this crew member.
    const partnerCard = page.locator(".p-3.rounded").filter({ hasText: partnerRoster.name });
    await partnerCard.getByText("Compressions", { exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(200);
    st = await getState(page);
    if (!st.cBusy?.[partnerRoster.id]) throw new Error("ordering Compressions did not set g.cBusy for the partner's id");
    console.log(`6. Real click ordering "${partnerRoster.name}" to do Compressions -> g.cBusy["${partnerRoster.id}"] = "${st.cBusy[partnerRoster.id].task}". OK`);

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Click-through test crashed:", e); process.exit(1); });
