// Runs selected sections of mechanismWiring.mjs without the ~25 minute full run.
// Usage: node src/scripts/mwSections.mjs "NOREPINEPHRINE OVERDOSE" "HOCM" ...
// Each argument is a case-insensitive substring of a section header line
// (console.log("\n[SECTION NAME ...]")). The shared preamble (helpers, probe(),
// pinTraitsNeutral(), counters) is always included. Sections that read state
// set by an earlier section will not work in isolation; the script says so
// only through the failure it produces, so treat an odd failure by running
// the full suite once. Writes a temporary file next to the suite and removes it.
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(dir, "mechanismWiring.mjs"), "utf8").split("\n");
const isHeader = l => /^console\.log\("(\\n)?\[/.test(l);
const headers = src.map((l, i) => (isHeader(l) ? i : -1)).filter(i => i >= 0);
const wanted = process.argv.slice(2).map(s => s.toLowerCase());
if (!wanted.length) {
  console.log("sections:\n" + headers.map(i => "  " + src[i].slice(15, 90)).join("\n"));
  process.exit(0);
}
const tail = src.findIndex((l, i) => i > headers[headers.length - 1] && l.startsWith('console.log("\\n" + "="'));
const out = src.slice(0, headers[0]);
let n = 0;
headers.forEach((h, k) => {
  if (!wanted.some(w => src[h].toLowerCase().includes(w))) return;
  n++;
  const end = k + 1 < headers.length ? headers[k + 1] : tail;
  out.push(...src.slice(h, end));
});
out.push(...src.slice(tail));
if (!n) { console.log("no section matched"); process.exit(1); }
const tmp = path.join(dir, `.mwSections.tmp.${process.pid}.mjs`);
fs.writeFileSync(tmp, out.join("\n"));
try { await import(pathToFileURL(tmp).href); } finally { fs.unlinkSync(tmp); }
