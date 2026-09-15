// Module customization hook — see _importMetaEnvLoader.mjs (the bootstrap
// file that registers this) for why this exists.
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  let src = result.source;
  if (src instanceof Uint8Array) src = Buffer.from(src).toString("utf8");
  if (typeof src === "string" && src.includes("import.meta.env")) {
    return { ...result, source: src.replaceAll("import.meta.env", "(globalThis.__NODE_IMPORT_META_ENV_SHIM__ || {})") };
  }
  return result;
}
