// tools/browser/verifyBystanderDialogue.mjs — real setState verification of
// F0 item 15's bystander/family dialogue slice: a present bystander (derived
// from the scenario's own real `bystanders` flavor text, data/scenarios.js)
// now reacts, in a distinct panicked/non-clinical voice, to the SAME two
// real edges crew already reacts to (seizure onset, unresponsive onset) —
// see dialogueProvider.js's bystander_seizure_reaction/
// bystander_unresponsive_reaction pools and App.jsx's trigger site, added
// right after the existing crew-reaction block in the same edge-detection
// code.
//
// Run: node tools/browser/verifyBystanderDialogue.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5174";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  // F0 item 4's boot screen (phase:"boot") is now the first thing any fresh
  // session sees — "CONTINUE WITHOUT AI" (or "ENTER PROXIMATE" if AI somehow
  // reached ready) must be clicked before the title screen's "Go on shift"
  // even exists in the DOM.
  await clickText(page, "CONTINUE WITHOUT AI", { timeout: 15000 }).catch(() =>
    clickText(page, "ENTER PROXIMATE", { timeout: 5000 }));
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "By");
  await page.fill('input[placeholder="Last"]', "Stander");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // "chest" (data/scenarios.js) declares a real bystander: "Her husband is
  // in the doorway, saying her name over and over." — a real ROLE
  // (bystanderRole() should read "husband") this script confirms shows up
  // as the dialogueLog entry's speaker label, not just a generic tag.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic", patientName: "Maria",
      t: 5, onSceneAt: 4, tab: "assess", speed: 1,
      dialogueLog: [], dialogueMemory: [], dialogueLastAt: null,
      crew: [], // deliberately EMPTY — the bystander trigger must not depend on crew presence
    });
  });
  await page.waitForTimeout(300);

  // 1) A REAL, live, sustained seizure onset (same reliable lever
  // verifyCrewDialogueReaction.mjs already established: seizing=true alone
  // races neuro.js's own SUSTAIN reset, epilepticDrive=1 keeps it held).
  const seeded = await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    if (!s.patient) return false;
    s.patient.epilepticDrive = 1;
    s.patient.seizing = true;
    return true;
  });
  if (!seeded) throw new Error("Expected a live s.patient to exist to mutate");

  let bystanderLine = null;
  for (let i = 0; i < 20 && !bystanderLine; i++) {
    await page.waitForTimeout(200);
    const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    bystanderLine = log.find((l) => l.speaker === "bystander") || null;
  }
  if (!bystanderLine) throw new Error("Expected a bystander-voiced seizure-reaction line to appear in dialogueLog");
  console.log("PASS: a real seizure onset with a present bystander (no crew needed) produces a bystander-voiced line:", JSON.stringify(bystanderLine));

  // Knowledge-boundary check (F0 item 15): a bystander line must never state
  // a clinical fact (vitals, a rhythm, a lab value, a diagnosis) — only what
  // a frightened bystander could actually witness/feel. Check the actual
  // text against a list of terms that would only make sense coming from
  // someone with clinical access.
  const CLINICAL_TERMS = /\b(bp|blood pressure|spo2|heart rate|pulse ox|ecg|ekg|rhythm|mmhg|epinephrine|diagnos|dissection|seizure threshold|glucose|mg\/dl)\b/i;
  if (CLINICAL_TERMS.test(bystanderLine.text)) {
    throw new Error(`Bystander line contains clinical content it could not know: "${bystanderLine.text}"`);
  }
  console.log("PASS: bystander line contains no clinical content (knowledge-boundary respected)");

  // Real role label: "chest"'s bystander text says "Her husband..." — the
  // dialogueLog entry should carry role:"husband" (dialogueContext.js's
  // bystanderRole()), and DialoguePanel renders that instead of the generic
  // "BYSTANDER" label (checked via the DOM below, not just the raw field).
  if (bystanderLine.role !== "husband") {
    throw new Error(`Expected role "husband" from the chest scenario's bystander text, got "${bystanderLine.role}"`);
  }
  console.log("PASS: bystander role correctly parsed as \"husband\" from the scenario's own bystanders text");

  const domHasHusbandLabel = await page.evaluate(() => document.body.innerText.includes("HUSBAND"));
  if (!domHasHusbandLabel) throw new Error("Expected DialoguePanel to render the HUSBAND speaker label in the DOM");
  console.log("PASS: DialoguePanel renders the real \"HUSBAND\" role label, not a generic BYSTANDER tag");

  // Voice-distinctness check: this line must not be identical to any of the
  // crew_seizure_reaction/patient template lines (a real, textual proof the
  // bystander voice is its own pool, not a relabeled reuse of another one).
  const OTHER_VOICE_LINES = [
    "He's seizing!", "Whoa, she's seizing, hang on.", "Full body, right now. Watch the airway.",
    "It hurts, but I'm okay.", "Still hurts some right there.",
  ];
  if (OTHER_VOICE_LINES.includes(bystanderLine.text)) {
    throw new Error(`Bystander line matched an unrelated speaker's template text verbatim: "${bystanderLine.text}"`);
  }
  console.log("PASS: bystander line text is genuinely distinct from crew/patient template pools");

  // 2) Negative control: the SAME real sustained onset with NO bystander
  // present (a scenario whose `bystanders` field this script blanks via
  // scen:"custom", which always declares one — so instead directly force
  // presence off is not possible without a scenario lacking the field. Every
  // real scenario in this codebase has a non-empty bystanders string per the
  // spec investigation, so the honest negative control here is: reset the
  // log, wait through a NON-edge tick (steady state, still seizing), and
  // confirm no SECOND bystander line fires — proving this is event-driven
  // (item 18), not continuous polling).
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null });
  });
  await page.waitForTimeout(2000);
  const log2 = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
  if (log2.some((l) => l.speaker === "bystander")) {
    throw new Error("Expected NO new bystander line on a steady-state tick with no fresh edge (event-driven check failed)");
  }
  console.log("PASS: no bystander line fires on an ordinary steady-state tick with no fresh edge (event-driven, not polling)");

  // 3) Unresponsive-onset trigger, the second real edge this slice wires.
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.epilepticDrive = 0;
    s.patient.seizing = false;
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null });
    const s = window.__proximateTestGetState();
    s.patient.consciousness = "unconscious";
  });
  let unrespLine = null;
  for (let i = 0; i < 20 && !unrespLine; i++) {
    await page.waitForTimeout(200);
    const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    unrespLine = log.find((l) => l.speaker === "bystander") || null;
  }
  if (!unrespLine) throw new Error("Expected a bystander-voiced unresponsive-reaction line to appear in dialogueLog");
  console.log("PASS: a real unresponsive onset produces a bystander-voiced line:", JSON.stringify(unrespLine));

  // 4) localAiEnabled gate: with the toggle off, requestLocalUpgrade must
  // never fire for the bystander site either (same gate every other Tier-3
  // call site already respects — dialogueManager.js's isLocalAiEnabled()
  // check runs before the provider-specific isAvailable() check).
  await page.evaluate(() => {
    // failed:false is required too — this environment's own real background
    // preload() (started at boot) has already hit a genuine WebGPU
    // adapter-request rejection by this point in the run and latched
    // `_failed=true`, which makes isAvailable() report false regardless of
    // the stub engine (same real timing hazard verifyAiReadyNoticeAndToggle.mjs's
    // own gotcha documents) — re-asserting failed:false here is required, not optional.
    window.__proximateTestForceLocalAi({ engineStub: true, engineStubText: "STUB TIER3 BYSTANDER LINE", failed: false });
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, localAiEnabled: false });
    const s = window.__proximateTestGetState();
    s.patient.consciousness = "awake"; // reset so the next mutation is a fresh edge
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.consciousness = "unconscious";
  });
  let gatedLine = null;
  for (let i = 0; i < 15 && !gatedLine; i++) {
    await page.waitForTimeout(200);
    const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    gatedLine = log.find((l) => l.speaker === "bystander") || null;
  }
  if (!gatedLine) throw new Error("Expected the tier-2/1 bystander line to still fire with localAiEnabled=false");
  if (gatedLine.text === "STUB TIER3 BYSTANDER LINE") {
    throw new Error("Tier-3 upgrade fired despite localAiEnabled=false — the gate did not hold for the bystander site");
  }
  console.log("PASS: with localAiEnabled=false, the bystander line still fires at tier 2/1 and is NEVER upgraded to the stub tier-3 line");

  // 5) With the toggle back on, the SAME stub engine SHOULD patch the entry
  // in place — proving the gate is genuinely reactive, not permanently off.
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, localAiEnabled: true });
    const s = window.__proximateTestGetState();
    s.patient.consciousness = "awake";
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    // failed:false is required too — this environment's own real background
    // preload() (started at boot) has already hit a genuine WebGPU
    // adapter-request rejection by this point in the run and latched
    // `_failed=true`, which makes isAvailable() report false regardless of
    // the stub engine (same real timing hazard verifyAiReadyNoticeAndToggle.mjs's
    // own gotcha documents) — re-asserting failed:false here is required, not optional.
    window.__proximateTestForceLocalAi({ engineStub: true, engineStubText: "STUB TIER3 BYSTANDER LINE", failed: false });
    const s = window.__proximateTestGetState();
    s.patient.consciousness = "unconscious";
  });
  let upgraded = false;
  for (let i = 0; i < 25 && !upgraded; i++) {
    await page.waitForTimeout(200);
    // Re-assert every iteration — the real background WebGPU-adapter
    // rejection can re-latch _failed=true asynchronously mid-loop in this
    // no-adapter environment (the same hazard verifyAiReadyNoticeAndToggle.mjs
    // found), which would otherwise silently kill the upgrade path partway through.
    await page.evaluate(() => window.__proximateTestForceLocalAi({ engineStub: true, engineStubText: "STUB TIER3 BYSTANDER LINE", failed: false }));
    const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    upgraded = log.some((l) => l.speaker === "bystander" && l.text === "STUB TIER3 BYSTANDER LINE" && l.tier === "local-llm");
  }
  if (!upgraded) throw new Error("Expected the bystander dialogueLog entry to be patched to the forced stub tier-3 line when localAiEnabled is on");
  console.log("PASS: with localAiEnabled=true, a forced tier-3 stub genuinely patches the bystander line in place");

  // Confirm sim time was never blocked by any of the above.
  const tAfter = await page.evaluate(() => window.__proximateTestGetState()?.t);
  if (!(tAfter > 5)) throw new Error(`Expected sim time to have advanced past the seeded t=5, got ${tAfter}`);
  console.log("PASS: sim time advanced normally throughout (t=" + tAfter + "), never blocked by bystander dialogue");

  if (consoleErrors.length) {
    console.error("Console errors:", consoleErrors);
    process.exitCode = 1;
  } else {
    console.log("\nALL CHECKS PASSED, zero console errors");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});
