import fs from 'fs';
const t = fs.readFileSync('C:/Users/trana/proximate/CLAUDE.md', 'utf8').split(/\r?\n/);
const out = [];
t.forEach((l, i) => { if (/^## [0-9]+\./.test(l)) out.push((i + 1) + ': ' + l); });
fs.writeFileSync('C:/Users/trana/proximate/sections.txt', out.join('\n'));