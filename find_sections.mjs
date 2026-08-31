import fs from 'fs';
const t = fs.readFileSync(new URL('./CLAUDE.md', import.meta.url), 'utf8').split(/\r?\n/);
const out = [];
t.forEach((l, i) => { if (/^## [0-9]+\./.test(l)) out.push((i + 1) + ': ' + l); });
fs.writeFileSync(new URL('./sections.txt', import.meta.url), out.join('\n'));
console.log('done');