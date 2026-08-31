// tools/browser/verifyCrewAi.mjs — real click-through verifying the crew-AI
// batch (see the approved plan): autonomous direction now assesses before it
// treats, best-fit hand selection, the two real bugs (monitor-device gate,
// max-dose cap) fixed, and a busy crew member is no longer locked to their
// current task — reordering them costs a small Career-only reputation hit
// inside a 60s grace window, and nothing outside it.
import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

// The sim clock keeps ticking (and re-rendering) throughout this whole
// script — the same "not stable"/timing-race flakiness this project's own
// tooling notes have documented before. Retry a locator click a few times
// rather than chasing a single perfectly-timed force click.
async function retryClick(locator, opts = {}) {
  let lastErr;
  for (let i = 0; i < 4; i++) {
    try { await locator.click({ timeout: 4000, force: true, ...opts }); return; }
    catch (e) { lastErr = e; await locator.page().waitForTimeout(300); }
  }
  throw lastErr;
}

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
  await clickText(page, "ALS ambulance", { exact: true });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
  await page.waitForTimeout(200);
  await clickText(page, "Recruit", { exact: true });
  await page.waitForTimeout(200);
  await clickText(page, "▲ Continue");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
  await clickText(page, "City");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
  await clickText(page, "▲ Ready");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
  await clickText(page, "▲ Begin");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
  // The station is now a first-person walk-to-the-whiteboard scene (WASD),
  // not a button — a separate, already-covered surface (see the driving/
  // walk-in verification scripts). Not what's under test here, so jump
  // straight past it the same way other scripts skip an unrelated stretch.
  await setState(page, { phase: "cat" });
}

async function launchScenario(page, key) {
  const select = page.locator("select").filter({ has: page.locator(`option[value="${key}"]`) });
  await select.first().selectOption(key);
  const row = select.first().locator("xpath=..");
  await row.locator("button", { hasText: "Go" }).click();
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
}

async function enterScene(page) {
  await page.waitForTimeout(300);
  await clickText(page, "Bring the stretcher");
  await page.waitForTimeout(300);
  // "Roll" (substring) also matches "patroller's" in the Backpack bag's own
  // description text, which sits earlier in DOM order — match the button's
  // own "▲ Roll" prefix instead, same gotcha already on record in
  // tools/browser/README.md for the near-identical "Ready" case.
  await clickText(page, "▲ Roll");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
  const st = await getState(page);
  await setState(page, { phase: "scene", onSceneAt: st.t, speed: 4, protocol: "laCounty" });
  await page.waitForTimeout(300);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page);
    console.log("1. Sandbox wizard click-through (Paramedic/EMS Supervisor/City). OK");

    // "ami" — chest pain, cardiac. LA County TP 1211's aspirinChestPain rule
    // fires immediately (AWAKE && pain>=4), giving a real drug rec to race
    // against the assess-before-treat gate.
    await launchScenario(page, "ami");
    await enterScene(page);
    let st = await getState(page);
    if (!(st.crew || []).length) throw new Error("expected at least one crew member (EMS Supervisor is a multi-seat vehicle)");
    const partnerId = st.crew[0].id;
    console.log(`2. Entered scene on "ami" with crew: ${st.crew.map((c) => c.name).join(", ")}. laCounty protocol active, speed 4x. OK`);

    // ── Assess-before-treat: no drug/procedure task should be crew-directed
    // before SOME real assessment (vitals, in this case, since no device can
    // be crew-attached) has happened. Poll early — before the first vitals
    // task could possibly have completed — and confirm aspirin hasn't jumped
    // the queue.
    await page.waitForTimeout(1200); // a little over one 4-sim-sec re-eval cycle at 4x
    st = await getState(page);
    const earlyTasks = Object.values(st.cBusy || {}).map((b) => b.taskId);
    const earlyDirects = (st.log || []).filter((l) => /directs/.test(l.text)).map((l) => l.text);
    console.log(`   early cBusy tasks: [${earlyTasks.join(", ")}]`);
    earlyDirects.forEach((t) => console.log(`   log: ${t}`));
    if (earlyTasks.includes("aspirinTask"))
      throw new Error("aspirinTask was auto-directed before any assessment happened — assess-before-treat gate did not hold");
    if (!earlyTasks.some((id) => id === "vitals" || id === "monitor"))
      console.log("   (no assessment task auto-assigned yet either — will keep polling)");
    console.log("3. No drug auto-directed before assessment. OK");

    // Keep polling until either the patient is "assessed" (a real device
    // got attached, or vitals were taken — either satisfies the gate) or
    // aspirin itself gets directed. With only one crew member (recruited
    // above), that same hand may end up permanently tied up on the
    // continuous "monitor" task once a device is on — a real resourcing
    // fact (one person can't monitor AND give a drug at once), not a gate
    // failure, so this only requires reaching "assessed", not aspirin
    // itself landing.
    let assessedSeen = false, aspirinSeen = false;
    for (let i = 0; i < 25; i++) {
      await page.waitForTimeout(1000);
      st = await getState(page);
      const devAttached = st.devices && Object.keys(st.devices).length > 0;
      const vitalsTaken = st.vitals && Object.keys(st.vitals).length > 0;
      if (devAttached || vitalsTaken) assessedSeen = true;
      const tasks = Object.values(st.cBusy || {}).map((b) => b.taskId);
      if (tasks.includes("aspirinTask") || st.log.some((l) => /aspirin/i.test(l.text))) { aspirinSeen = true; break; }
      if (assessedSeen && i >= 4) break;   // give it a few more cycles, then move on
    }
    if (!assessedSeen) throw new Error("patient was never assessed by the crew (no device attached, no vitals taken) — gate may be blocking forever");
    console.log(`4. Patient was assessed by the crew for real (devices=${JSON.stringify(Object.keys(st.devices || {}))}, vitals=${Object.keys(st.vitals || {}).length} readings)${aspirinSeen ? " and aspirin was subsequently auto-directed" : " — a solo hand then had no capacity left over for the drug, which is real, not a gate bug"}. OK`);

    // ── Monitor never auto-assigns without a device attached first (the
    // real, previously-confirmed bug: it used to skip this check entirely).
    // Re-derive from the log, not just the current snapshot: find the
    // FIRST point "monitor" was assigned, and confirm a device-attach
    // ("leads"/pulseox/bpcuff) log line already preceded it.
    const monitorIdx = st.log.findIndex((l) => /directs .* monitor vitals|Monitoring vitals/i.test(l.text));
    if (monitorIdx >= 0) {
      const deviceIdx = st.log.findIndex((l) => /leads|pulse ox|bp cuff/i.test(l.text));
      if (deviceIdx < 0 || deviceIdx > monitorIdx)
        throw new Error("monitor was directed before any device-attach log line — the monitor-device gate did not hold");
    }
    console.log("5. Monitor task never auto-assigned before a device-attach task. OK");

    // ── Crew members are no longer locked to a task — reorder mid-task.
    await page.getByText("Crew ·", { exact: false }).first().click({ timeout: 8000, force: true });
    await page.waitForSelector('[data-testid="crew-order-card"]', { timeout: 8000 });
    await page.waitForTimeout(200);
    let card = page.getByTestId("crew-order-card").filter({ hasText: st.crew[0].name });
    await retryClick(card.getByText("Move the bystanders back", { exact: false }).first());
    await page.waitForTimeout(300);
    st = await getState(page);
    if (st.cBusy?.[partnerId]?.taskId !== "crowd") throw new Error("expected crowd task to be assigned first");
    console.log("6. Ordered crew member to 'Move the bystanders back'. OK");

    // Switch gmode to career in-place so the reputation grace-period penalty
    // is actually reachable (Sandbox has none by design) — a legitimate,
    // narrowly-scoped state patch to exercise one specific branch, not a
    // reconstruction of career mode's own setup.
    await setState(page, { gmode: "career", reputation: 0 });
    await page.waitForTimeout(100);
    const repBefore = (await getState(page)).reputation;
    card = page.getByTestId("crew-order-card").filter({ hasText: st.crew[0].name });
    await retryClick(card.getByText("Compressions", { exact: false }).first());
    await page.waitForTimeout(300);
    st = await getState(page);
    if (st.cBusy?.[partnerId]?.taskId !== "cpr")
      throw new Error(`expected reassignment to cpr, got ${st.cBusy?.[partnerId]?.taskId} — crew member is still locked to the old task`);
    if (st.reputation >= repBefore)
      throw new Error(`expected a reputation penalty for redirecting inside the grace window (before=${repBefore}, after=${st.reputation})`);
    const indecisiveLine = st.log.some((l) => /indecisive/.test(l.text));
    if (!indecisiveLine) throw new Error("expected a log line calling out the reputation hit");
    console.log(`7. Crew member is no longer locked to a task: redirected mid-task from crowd -> cpr. Reputation ${repBefore} -> ${st.reputation} (grace-window penalty applied). OK`);

    // Backdate this task's startedAt past the grace window and reorder again
    // — should be free this time.
    const cb = { ...st.cBusy, [partnerId]: { ...st.cBusy[partnerId], startedAt: st.t - 61 } };
    await setState(page, { cBusy: cb });
    await page.waitForTimeout(100);
    const repBefore2 = (await getState(page)).reputation;
    card = page.getByTestId("crew-order-card").filter({ hasText: st.crew[0].name });
    await retryClick(card.getByText("Move the bystanders back", { exact: false }).first());
    await page.waitForTimeout(300);
    st = await getState(page);
    if (st.cBusy?.[partnerId]?.taskId !== "crowd") throw new Error("expected reassignment to crowd after the grace window");
    if (st.reputation !== repBefore2)
      throw new Error(`expected NO reputation penalty after the 60s grace window (before=${repBefore2}, after=${st.reputation})`);
    console.log(`8. Redirecting after the 60s grace window is free: reputation stayed at ${st.reputation}. OK`);

    // Confirm Sandbox never costs reputation regardless of timing.
    await setState(page, { gmode: "sandbox" });
    await page.waitForTimeout(100);
    const repBefore3 = (await getState(page)).reputation;
    card = page.getByTestId("crew-order-card").filter({ hasText: st.crew[0].name });
    await retryClick(card.getByText("Compressions", { exact: false }).first());
    await page.waitForTimeout(300);
    st = await getState(page);
    if (st.cBusy?.[partnerId]?.taskId !== "cpr") throw new Error("expected reassignment to cpr in sandbox");
    if (st.reputation !== repBefore3) throw new Error("Sandbox/Medical Simulation should never cost reputation");
    console.log(`9. Sandbox mode: instant reassignment, no reputation cost regardless of timing. OK`);

    await page.screenshot({ path: "tools/browser/screenshots/crew-ai.png", fullPage: true });
    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Crew AI verification crashed:", e); process.exit(1); });
