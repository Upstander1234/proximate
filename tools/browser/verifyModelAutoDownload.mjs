// tools/browser/verifyModelAutoDownload.mjs — verifies autoDownloadModel()
// (src/dialogue/modelImport.js) actually downloads the model from the
// GitHub-hosted mirror (raw.githubusercontent.com/.../model-assets/) and
// populates the browser Cache API entries @mlc-ai/web-llm expects, using a
// REAL browser (Cache API + fetch), no WebGPU needed since this path never
// touches the GPU — only checkCache()/hasModelInCache() and the cache writes
// themselves. Real network to GitHub's raw CDN; this is not stubbed.
import { launch } from "./driver.mjs";

const URL_ = process.env.PROXIMATE_URL || "http://localhost:5199";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(URL_, { waitUntil: "domcontentloaded" });

  console.log("Running autoDownloadModel() against the real mirror (this downloads ~290MB, may take a while)...");
  const result = await page.evaluate(async () => {
    const mod = await import("/src/dialogue/modelImport.js");
    const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

    // Clean slate: clear any pre-existing cache entries so this is a real
    // cold-start test, not accidentally passing because a prior run already
    // populated the cache.
    for (const scope of ["webllm/config", "webllm/wasm", "webllm/model"]) {
      await caches.delete(scope);
    }

    const progressEvents = [];
    const t0 = performance.now();
    await mod.autoDownloadModel(MODEL_ID, (p) => progressEvents.push(p));
    const elapsedMs = performance.now() - t0;

    // Now ask through the REAL LocalLLMProvider.checkCache() — which calls
    // web-llm's own hasModelInCache() internally — whether it agrees the
    // model is now fully cached. This is the real, load-bearing assertion:
    // it's not enough that *some* cache entries exist, they have to be at
    // the exact URLs/scopes web-llm itself will look for. (Importing
    // "@mlc-ai/web-llm" directly here, with a bare specifier, would fail —
    // page.evaluate()'s injected code isn't part of Vite's own module graph,
    // so bare-specifier resolution only works from inside a file Vite is
    // actually serving/transforming, like dialogueProvider.js.)
    const providerMod = await import("/src/dialogue/dialogueProvider.js");
    const provider = new providerMod.LocalLLMProvider();
    const cacheState = await provider.checkCache();
    const hasInCache = cacheState === "cached";

    // Spot-check the largest shard actually has real byte content, not an
    // empty/truncated response. Model files (tensor-cache.json,
    // tokenizer.json, 8 shards) live in "webllm/model"; config and wasm are
    // each their own separate scope (see SCOPES in modelImport.js) — total
    // real cache entries across all three scopes should be 12.
    const modelCache = await caches.open("webllm/model");
    const modelKeys = await modelCache.keys();
    const configKeys = await (await caches.open("webllm/config")).keys();
    const wasmKeys = await (await caches.open("webllm/wasm")).keys();
    const shardKey = modelKeys.find((k) => k.url.includes("params_shard_0"));
    const shardResp = shardKey ? await modelCache.match(shardKey) : null;
    const shardBytes = shardResp ? (await shardResp.arrayBuffer()).byteLength : 0;

    return {
      hasInCache,
      progressEventCount: progressEvents.length,
      lastProgress: progressEvents[progressEvents.length - 1],
      cacheKeyCount: modelKeys.length + configKeys.length + wasmKeys.length,
      shardBytes,
      elapsedMs,
    };
  });

  console.log("Result:", JSON.stringify(result, null, 2));

  const realErrors = consoleErrors.filter((e) => !/net::ERR_/.test(e));
  console.log(`Console errors (excluding sandbox network noise): ${realErrors.length}`);
  if (realErrors.length) console.log(realErrors);

  const pass =
    result.hasInCache === true &&
    result.cacheKeyCount === 12 && // config + wasm + tensor-cache + tokenizer + 8 shards
    result.shardBytes === 68067328 &&
    result.lastProgress?.progress === 1 &&
    realErrors.length === 0;

  console.log(pass ? "PASS" : "FAIL");
  await browser.close();
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
