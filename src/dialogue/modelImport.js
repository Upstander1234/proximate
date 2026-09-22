// src/dialogue/modelImport.js — offline/auto import of the local AI model.
//
// Hugging Face's download endpoint randomly resets connections for some
// players, so the WebGPU tier can fail to download no matter how often it
// retries. Two ways around that, both landing in the exact same place: the
// browser Cache API entries @mlc-ai/web-llm looks for, keyed by the exact
// URLs it would have fetched, so its normal load path finds everything
// cached and never touches Hugging Face for the model.
//   1. autoDownloadModel() — LocalLLMProvider tries this itself, first, on
//      every load: fetch each file from our own GitHub-hosted mirror (see
//      MODEL_ASSETS_BASE_URL below) and populate the cache automatically.
//      No player action needed; any failure just falls through to letting
//      web-llm fetch from Hugging Face exactly as it always has.
//   2. importModelZip() — the manual fallback for a player whose network
//      can't even reach GitHub raw content: download ONE zip through their
//      browser (which resumes properly, unlike (1) or web-llm's own
//      fetches), then import it here.
//
// The file layout (produced by scripts/build_local_ai_model_zip.mjs for the
// zip, and mirrored as plain files on the `model-assets` branch for (1)) is:
//   config/<file>  -> cache "webllm/config"
//   wasm/<file>    -> cache "webllm/wasm"
//   model/<file>   -> cache "webllm/model"
//   manifest.json  -> { format, modelId }
import { unzipSync } from "fflate";

// Where the built zip is published for players to download. It is a plain link
// the player clicks (opened in a new tab), never fetched by the app, because
// GitHub release assets send no Access-Control-Allow-Origin header (confirmed
// against the live release: a fetch() from the game's own origin would be
// blocked by CORS even though the link itself works fine as a navigation).
export const MODEL_ZIP_URL =
  "https://github.com/Upstander1234/proximate/releases/download/local-ai-model-v1/proximate-local-ai-model.zip";

// Same model files as the zip above, but committed as plain (unzipped) files
// on a dedicated orphan branch and served via raw.githubusercontent.com,
// which DOES send Access-Control-Allow-Origin: * (confirmed against the live
// branch) — so, unlike the Release asset, this one the app CAN fetch()
// itself automatically. Kept off `master` so it doesn't bloat every normal
// clone of the app's own dev history.
const MODEL_ASSETS_BASE_URL = "https://raw.githubusercontent.com/Upstander1234/proximate/model-assets/";

const SCOPES = { config: "webllm/config", wasm: "webllm/wasm", model: "webllm/model" };

function fail(msg) {
  const e = new Error(msg);
  e.userFacing = true;
  return e;
}

// Shared between importModelZip() and autoDownloadModel(): exactly which
// cache entries the model needs, and the real URL/scope/content-type each
// one is keyed under. Built once here so the two import paths can never
// silently drift apart on what "a complete model" means. `rec` is web-llm's
// own prebuiltAppConfig entry for this model id; `tensorCacheBytes` is the
// raw bytes of model/tensor-cache.json (from wherever it was fetched from).
function buildInstallPlan(rec, tensorCacheBytes) {
  let base = rec.model.endsWith("/") ? rec.model : rec.model + "/";
  if (!base.match(/.+\/resolve\/.+\//)) base += "resolve/main/";
  const wasmName = rec.model_lib.split("/").pop();
  const shardRecords = JSON.parse(new TextDecoder().decode(tensorCacheBytes)).records;
  return [
    { key: "config/mlc-chat-config.json", scope: SCOPES.config, url: new URL("mlc-chat-config.json", base).href, type: "application/json" },
    { key: `wasm/${wasmName}`, scope: SCOPES.wasm, url: rec.model_lib, type: "application/wasm" },
    { key: "model/tensor-cache.json", scope: SCOPES.model, url: new URL("tensor-cache.json", base).href, type: "application/json" },
    { key: "model/tokenizer.json", scope: SCOPES.model, url: new URL("tokenizer.json", base).href, type: "application/json" },
    ...shardRecords.map((r) => ({
      key: `model/${r.dataPath}`, scope: SCOPES.model, url: new URL(r.dataPath, base).href,
      type: "application/octet-stream", size: r.nbytes,
    })),
  ];
}

// file: a File from an <input type="file">. modelId: the web-llm model id this
// build uses. onProgress(text): called with short status strings.
export async function importModelZip(file, modelId, onProgress = () => {}) {
  if (typeof caches === "undefined") throw fail("This browser has no Cache API, so the model can't be stored.");

  const webllm = await import("@mlc-ai/web-llm");
  const rec = webllm.prebuiltAppConfig.model_list.find((m) => m.model_id === modelId);
  if (!rec) throw fail("This build doesn't know the model it should import.");

  onProgress("Reading file…");
  let entries;
  try {
    entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    throw fail("That file isn't a valid zip. Use the model file from the download link.");
  }

  let manifest;
  try {
    manifest = JSON.parse(new TextDecoder().decode(entries["manifest.json"]));
  } catch {
    throw fail("That zip isn't a Proximate model file (no manifest).");
  }
  if (manifest.modelId !== modelId) {
    throw fail(`That model file is for a different model (${manifest.modelId}). Download the current one.`);
  }

  // Work out exactly which entries are required, and check each is present and
  // the right size, before writing anything, so a bad file never leaves a
  // half-imported cache behind.
  const tcBytes = entries["model/tensor-cache.json"];
  if (!tcBytes) throw fail("The model file is incomplete (missing tensor-cache.json).");
  const plan = buildInstallPlan(rec, tcBytes);
  for (const p of plan) {
    const data = entries[p.key];
    if (!data) throw fail(`The model file is incomplete (missing ${p.key}). Re-download it.`);
    if (p.size && data.length !== p.size) {
      throw fail(`${p.key} is the wrong size (the download may be cut off). Re-download the model file.`);
    }
  }

  let done = 0;
  for (const p of plan) {
    onProgress(`Installing ${++done}/${plan.length}…`);
    const cache = await caches.open(p.scope);
    await cache.put(new Request(p.url), new Response(entries[p.key], { headers: { "Content-Type": p.type } }));
  }
  onProgress("Done");
}

// Fetches one file from MODEL_ASSETS_BASE_URL as bytes, throwing (not
// silently returning empty) on any non-2xx response or network error — the
// caller decides what to do with a failure (autoDownloadModel below aborts
// the whole attempt rather than writing a partial file into the cache).
async function fetchAsset(path) {
  const r = await fetch(MODEL_ASSETS_BASE_URL + path);
  if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${path}`);
  return new Uint8Array(await r.arrayBuffer());
}

// modelId: the web-llm model id this build uses. onProgress({progress,text}):
// called with the SAME shape web-llm's own initProgressCallback uses
// (progress 0..1), so a caller (LocalLLMProvider) can forward it straight
// into its existing subscribeProgress() listeners with no translation.
//
// Two-phase, same discipline as importModelZip: every file is fetched and
// size-checked into memory FIRST, and the Cache API is only written to once
// everything has validated clean — so a network failure partway through
// never leaves a half-populated cache that could confuse a later
// "is this cached?" check.
export async function autoDownloadModel(modelId, onProgress = () => {}) {
  if (typeof caches === "undefined") throw fail("This browser has no Cache API.");
  if (typeof fetch === "undefined") throw fail("This context can't fetch.");

  const webllm = await import("@mlc-ai/web-llm");
  const rec = webllm.prebuiltAppConfig.model_list.find((m) => m.model_id === modelId);
  if (!rec) throw fail("This build doesn't know the model it should import.");

  const manifestBytes = await fetchAsset("manifest.json");
  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
  if (manifest.modelId !== modelId) throw fail(`Asset mirror is for a different model (${manifest.modelId}).`);

  const tcBytes = await fetchAsset("model/tensor-cache.json");
  const plan = buildInstallPlan(rec, tcBytes);
  // Shard sizes (from tensor-cache.json, authoritative) are ~96% of total
  // payload for this model — close enough for a progress fraction without a
  // second round-trip just to learn the wasm/tokenizer/config sizes upfront.
  const totalBytes = plan.reduce((s, p) => s + (p.size || 0), 0) || 1;
  let downloadedBytes = 0;

  const fetched = {};
  for (const p of plan) {
    const data = await fetchAsset(p.key);
    if (p.size && data.length !== p.size) {
      throw fail(`${p.key} came back the wrong size from the asset mirror.`);
    }
    fetched[p.key] = data;
    downloadedBytes += data.length;
    onProgress({ progress: Math.min(1, downloadedBytes / totalBytes), text: "downloading model (mirror)" });
  }

  for (const p of plan) {
    const cache = await caches.open(p.scope);
    await cache.put(new Request(p.url), new Response(fetched[p.key], { headers: { "Content-Type": p.type } }));
  }
}
