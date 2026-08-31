// Real click-through verification for FreeExplore's new "spawn with a
// vehicle" mechanic — get in, drive, park and get out at will. Not state
// injection: FreeExplore's own mode/vehicle/player state lives entirely in
// its own mount-effect closure, invisible to the shared g-state hook, so
// this reads it through window.__proximateTestFreeExplore (dev-only,
// FreeExplore.jsx's own telemetry hook) instead.
import { launch, clickText } from "./driver.mjs";

const BASE_URL = process.argv[2] || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL, { waitUntil: "load" });

  // Real clicks: title -> Free Explore -> check "spawn with vehicle" -> pick a map.
  await clickText(page, "Free Explore");
  await page.waitForFunction(() => document.body.innerText.includes("Spawn with a vehicle"), null, { timeout: 5000 });
  const checkbox = page.locator('input[type="checkbox"]');
  await checkbox.check();
  await clickText(page, "Northwood City");

  // Wait for the scene to mount and the telemetry hook to exist.
  await page.waitForFunction(() => typeof window.__proximateTestFreeExplore === "function", null, { timeout: 10000 });
  await page.waitForTimeout(500); // one real frame of settle time before trusting telemetry

  const initial = await page.evaluate(() => window.__proximateTestFreeExplore());
  console.log("initial:", initial);
  if (!initial.hasCar) throw new Error("FAIL: hasCar is false — spawnVehicle prop did not reach the scene");
  if (initial.mode !== "walk") throw new Error(`FAIL: expected initial mode "walk", got "${initial.mode}"`);
  let spawnDist = Math.hypot(initial.P.x - initial.V.x, initial.P.z - initial.V.z);
  console.log(`spawn distance to vehicle: ${spawnDist.toFixed(2)}m`);

  // The vehicle spawns wherever findClearSpawn() found open ground, not
  // necessarily right next to the player — walk forward (the player's
  // default facing, yaw=0, is -z, the same direction findClearSpawn()
  // prefers) for real, held W input until within the door radius, up to a
  // generous cap, rather than assuming a fixed distance.
  let walked = 0;
  while (spawnDist >= 2.6 && walked < 8000) {
    await page.keyboard.down("w");
    await page.waitForTimeout(300);
    await page.keyboard.up("w");
    walked += 300;
    const t = await page.evaluate(() => window.__proximateTestFreeExplore());
    spawnDist = Math.hypot(t.P.x - t.V.x, t.P.z - t.V.z);
  }
  console.log(`distance to vehicle after walking: ${spawnDist.toFixed(2)}m`);
  if (spawnDist >= 2.6) throw new Error("FAIL: could not walk within the vehicle's door radius");

  // Press E to get in.
  await page.keyboard.press("e");
  await page.waitForTimeout(200);
  const afterEnter = await page.evaluate(() => window.__proximateTestFreeExplore());
  console.log("after E (should be driving):", afterEnter);
  if (afterEnter.mode !== "drive") throw new Error(`FAIL: expected mode "drive" after pressing E near the vehicle, got "${afterEnter.mode}"`);

  // Hold W for a real, sustained interval to confirm the car actually moves
  // under real physics (not a teleport, not a no-op).
  await page.keyboard.down("w");
  await page.waitForTimeout(1500);
  await page.keyboard.up("w");
  const beforeBrake = await page.evaluate(() => window.__proximateTestFreeExplore());
  const driveDist = Math.hypot(beforeBrake.V.x - afterEnter.V.x, beforeBrake.V.z - afterEnter.V.z);
  console.log(`vehicle moved ${driveDist.toFixed(2)}m while W was held`);
  if (driveDist < 1) throw new Error("FAIL: vehicle did not move a meaningful distance while W was held — physics not engaging");
  if (beforeBrake.mode !== "drive") throw new Error("FAIL: mode changed unexpectedly while driving");

  // Press E immediately (no intervening wait — the car is still coasting
  // under drag right after releasing W, so any gap here would itself move
  // the car and make a "did it drift after parking" comparison meaningless)
  // to park and get out.
  await page.keyboard.press("e");
  await page.waitForTimeout(300);
  const parked1 = await page.evaluate(() => window.__proximateTestFreeExplore());
  console.log("just after parking:", parked1);
  if (parked1.mode !== "walk") throw new Error(`FAIL: expected mode "walk" after pressing E while driving, got "${parked1.mode}"`);
  if (parked1.V.speed !== 0) throw new Error(`FAIL: parked vehicle still has nonzero speed (${parked1.V.speed})`);
  const exitDist = Math.hypot(parked1.P.x - parked1.V.x, parked1.P.z - parked1.V.z);
  console.log(`player landed ${exitDist.toFixed(2)}m from the parked vehicle`);
  if (exitDist > 4) throw new Error("FAIL: player did not land near the parked vehicle on exit");

  // The real invariant: a PARKED car does not drift over time. Two reads,
  // several hundred ms apart, with nobody touching the controls.
  await page.waitForTimeout(500);
  const parked2 = await page.evaluate(() => window.__proximateTestFreeExplore());
  const parkedDrift = Math.hypot(parked2.V.x - parked1.V.x, parked2.V.z - parked1.V.z);
  console.log(`parked-vehicle drift over 500ms of idle time: ${parkedDrift.toFixed(3)}m`);
  if (parkedDrift > 0.01) throw new Error(`FAIL: parked vehicle drifted (${parkedDrift.toFixed(3)}m) while nobody was driving it`);
  const afterExit = parked2;

  // Confirm real re-entry: walk away is not required for this check — just
  // confirm pressing E again immediately re-enters (still within door radius).
  await page.keyboard.press("e");
  await page.waitForTimeout(200);
  const reEntered = await page.evaluate(() => window.__proximateTestFreeExplore());
  console.log("after E a third time (should be driving again):", reEntered);
  if (reEntered.mode !== "drive") throw new Error("FAIL: could not re-enter the parked vehicle");

  if (consoleErrors.length) {
    console.log("Console errors:", consoleErrors);
    throw new Error(`FAIL: ${consoleErrors.length} console error(s)`);
  }

  console.log("PASS: spawn-with-vehicle, enter, drive, park/exit, and re-enter all verified against real physics.");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
