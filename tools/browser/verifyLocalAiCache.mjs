// tools/browser/verifyLocalAiCache.mjs — verifies F0 item 8 (persistent
// model caching). Two parts:
//
// PART A (live, this headless-Chromium environment): confirms the new
// cache-detection code (LocalLLMProvider.checkCache(), dialogueProvider.js)
// runs cleanly during a real boot-screen launch — even though that launch
// still fails at the WebGPU adapter-request step in this environment (no
// real GPU adapter behind navigator.gpu here, confirmed by every prior F0
// session) — and that a fresh reload afterward reports the model as
// genuinely NOT cached, honestly, rather than either crashing or falsely
// claiming a cache hit that never happened.
//
// PART B (direct-function test, offline, no WebGPU/network involved): this
// project's documented precedent for verifying GPU-gated logic that can't
// be exercised live here (see tools/browser/README.md) — calls the REAL
// exported dialogueManager.checkLocalAiCache() -> LocalLLMProvider.
// checkCache() -> web-llm's own public hasModelInCache() against a Cache
// API cache seeded (or left empty) with entries in web-llm's OWN real key
// format, confirmed by reading node_modules/@mlc-ai/web-llm/lib/index.js:
//   - cache name (Cache API "scope"): "webllm/model" (hasModelInCache's own
//     call to getCacheAccessOptions("webllm/model", appConfig), ~line 12023)
//   - keys: full shard-manifest URL and each shard's full download URL,
//     both under the model's own resolved base
//     (cleanModelUrl(modelRecord.model), ~line 9458) — for
//     Qwen2.5-0.5B-Instruct-q4f16_1-MLC (the model this project actually
//     uses, dialogueProvider.js's own MODEL_ID) that base is
//     "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC/resolve/main/"
//     (model URL string at ~line 1951, transformed by cleanModelUrl).
//   - hasTensorInCache's own logic (~line 5905-5918): checks the manifest
//     URL ("tensor-cache.json" under that base) is itself a cache key FIRST
//     (a pure Cache-API read, no network) — if absent, returns false
//     immediately, which is why the "not-cached" half of this test needs no
//     network access at all. Only if the manifest key IS present does it
//     read the manifest (from cache, since it's already there — `addToCache`
//     no-ops when `cache.match` already finds it, ~line 5487-5497) to get
//     the shard list, then checks every shard URL is also a cache key. This
//     test seeds exactly that shape (a manifest listing one shard, plus
//     that one shard) so the "cached" half also needs zero network calls.

import { launch, getState } from "./driver.mjs";

const DEV_URL = process.env.PROXIMATE_DEV_URL || "http://localhost:5173";

// Real values, per the citation above — not invented for this test.
const MODEL_BASE = "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC/resolve/main/";
const MANIFEST_URL = MODEL_BASE + "tensor-cache.json";
const SHARD_URL = MODEL_BASE + "params_shard_0.bin";
const CACHE_SCOPE = "webllm/model";

async function main() {
  const { browser, page, consoleErrors } = await launch();
  try {
    // ---- PART A: live boot-screen launch --------------------------------
    await page.goto(DEV_URL, { waitUntil: "networkidle" });
    const s0 = await getState(page);
    if (s0?.phase !== "boot") throw new Error(`expected initial phase "boot", got "${s0?.phase}"`);

    // Give the real preload()->checkCache()->CreateMLCEngine chain a window
    // to run and fail at the adapter-request step (as every prior F0
    // session's environment does) without hanging this script on it.
    await page.waitForTimeout(4000);
    let bodyText = await page.textContent("body");
    const recognizable = /UNSUPPORTED|SUPPORTED|DOWNLOADING|LOADING FROM CACHE|CHECKING FOR CACHED MODEL|READY|UNAVAILABLE/.test(bodyText);
    if (!recognizable) throw new Error("AI panel rendered no recognizable status after preload attempt");
    console.log("PASS: cache-detection code ran during a real boot launch without crashing the AI panel (status seen: "
      + (bodyText.match(/LOCAL AI DIALOGUE[\s\S]{0,60}/)?.[0] || "?").replace(/\s+/g, " ") + ")");
    // This sandbox has no outbound internet access to huggingface.co (the
    // real host web-llm's own CreateMLCEngine tries once checkCache()
    // reports "not-cached"), so Chromium logs a network-level
    // "net::ERR_CONNECTION_RESET" console error for that attempted fetch —
    // that is expected sandbox noise, not a JS exception from this batch's
    // own code, and is filtered out here. A genuine JS crash (a thrown
    // exception, a "pageerror:"-prefixed entry) still fails this check.
    const realErrors = consoleErrors.filter((e) => !/net::ERR_|Failed to load resource/.test(e));
    if (realErrors.length) {
      throw new Error(`${realErrors.length} real console error(s) (non-network) surfaced during the cache-check/preload path: ${realErrors.join(" | ")}`);
    }
    console.log(`PASS: zero real (non-network) console errors from the cache-detection path`
      + (consoleErrors.length ? ` (${consoleErrors.length} expected sandbox network-resource error(s) filtered out: ${consoleErrors.join(" | ")})` : ""));

    // Reload — a genuinely fresh navigation, not a setState jump — and
    // confirm the model is honestly reported as NOT cached, since nothing
    // in this environment ever actually completed a download (no real
    // WebGPU adapter to load the compiled model onto even if the shard
    // bytes themselves happened to reach the Cache API over the network).
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(4000);
    bodyText = await page.textContent("body");
    if (/LOADING FROM CACHE|READY — local AI/.test(bodyText)) {
      throw new Error("AI panel falsely reported a cache hit / ready state after reload in an environment where nothing ever finished downloading");
    }
    console.log("PASS: after reload, AI panel does not falsely claim cached/ready (honest \"not cached\"/failed reporting)");

    // ---- PART B: direct-function cache-detection test --------------------
    // Uses the SAME real production function (dialogueManager.checkLocalAiCache
    // -> LocalLLMProvider.checkCache -> web-llm's own hasModelInCache), called
    // from inside the page so it runs against the page's real Cache API.
    const notCachedResult = await page.evaluate(async () => {
      // Start from a clean cache of this exact scope so a stray leftover
      // from a previous run of this script doesn't produce a false "cached".
      await caches.delete("webllm/model");
      const dm = await import("/src/dialogue/dialogueManager.js");
      return dm.checkLocalAiCache();
    });
    if (notCachedResult !== "not-cached") {
      throw new Error(`expected "not-cached" with an empty cache, got "${notCachedResult}"`);
    }
    console.log('PASS: checkLocalAiCache() reports "not-cached" against a real, empty Cache API (no seed, no network)');

    const cachedResult = await page.evaluate(async ({ cacheScope, manifestUrl, shardUrl }) => {
      const cache = await caches.open(cacheScope);
      // Real key format per this file's own header citation: the manifest
      // URL and every shard URL it lists, both as full-URL Cache API keys.
      await cache.put(manifestUrl, new Response(JSON.stringify({
        records: [{ dataPath: "params_shard_0.bin", nbytes: 1 }],
        metadata: {},
      }), { headers: { "Content-Type": "application/json" } }));
      await cache.put(shardUrl, new Response(new Uint8Array([1, 2, 3, 4]).buffer));
      const dm = await import("/src/dialogue/dialogueManager.js");
      return dm.checkLocalAiCache();
    }, { cacheScope: CACHE_SCOPE, manifestUrl: MANIFEST_URL, shardUrl: SHARD_URL });
    if (cachedResult !== "cached") {
      throw new Error(`expected "cached" after seeding a real, correctly-keyed Cache API entry, got "${cachedResult}"`);
    }
    console.log('PASS: checkLocalAiCache() reports "cached" against a manually-seeded Cache API entry matching web-llm\'s own real key format');

    // Clean up the seeded cache so this script leaves no state behind for a
    // later run (or the real app) to trip over.
    await page.evaluate(async (cacheScope) => { await caches.delete(cacheScope); }, CACHE_SCOPE);

    console.log("\nALL LOCAL-AI CACHE-DETECTION CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
