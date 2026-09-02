import { physio, activePatient } from '../physiology.js';

function runMinutes(scen, minutes) {
  const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
  const totalSec = Math.round(minutes * 60);
  for (let T = 30; T <= totalSec; T += 30) { s.t = T; physio(s); }
  return activePatient(s);
}

for (const h of [1, 5, 10]) {
  const p = runMinutes('crush', h * 60);
  console.log(`t=${h}h hct=${p.hct?.toFixed(3)} svr=${p.svr?.toFixed(1)} sbp=${p.sbp?.toFixed(1)} dbp=${p.dbp?.toFixed(1)} map=${p.map?.toFixed(1)} csOccl.legL=${p.compartmentOcclusion?.legL?.toFixed(3)} limbInjury.legL=${p.limbInjury?.legL?.toFixed(3)}`);
}
