import { physio, activePatient } from "../physiology.js";

function run(scen, apply=[], settle=2, endT=900) {
  const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
  for (let T = 2; T <= settle; T += 2) { s.t = T; physio(s); }
  for (const id of apply) s.doses.push({ id, at: s.t });
  for (let T = settle+2; T <= endT; T += 2) {
    s.t = T;
    if (apply.length && (T - settle) % 140 === 0) for (const id of apply) s.doses.push({ id, at: T });
    physio(s);
  }
  const p = activePatient(s);
  return { li: p.li, enc: p.metabolicEncephalopathy, sz: p.epilepticDrive, hr: p.hr };
}

console.log("untreated 300s", run("abdPain", [], 2, 300)); // placeholder control check first
