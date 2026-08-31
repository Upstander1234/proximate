import { physio, activePatient } from "../physiology.js";
import { CONDITIONS } from "../physio/conditions.js";

const STEP = 2;
function run(scen, mutate, settle, run) {
  const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
  for (let T = STEP; T <= settle; T += STEP) { s.t = T; physio(s); if (mutate) mutate(activePatient(s)); }
  for (let T = settle + STEP; T <= run; T += STEP) { s.t = T; physio(s); if (mutate) mutate(activePatient(s)); }
  return activePatient(s);
}
const majorBurn = (p) => { p.burnTbsaFraction = 0.55; CONDITIONS.thermalBurn.progress(p, STEP / 60); };

const burn = run("abdPain", majorBurn, 2, 600);
console.log("burn55 capillaryLeak:", burn.capillaryLeak, "coreTemp:", burn.coreTemp);

const healthy = run("abdPain", null, 2, 600);
console.log("healthy capillaryLeak:", healthy.capillaryLeak, "burnTbsaFraction:", healthy.burnTbsaFraction);

const coldBurn = run("abdPain", (p) => { p.ambientTemp = 5; majorBurn(p); }, 2, 900);
const coldControl = run("abdPain", (p) => { p.ambientTemp = 5; }, 2, 900);
console.log("coldBurn coreTemp:", coldBurn.coreTemp, "coldControl coreTemp:", coldControl.coreTemp);

const fluidTreated = run("abdPain", majorBurn, 2, 600);
const s2 = { scen: "abdPain", t: 0, doses: [], given: {}, activePatientId: null };
for (let T = STEP; T <= 2; T += STEP) { s2.t = T; physio(s2); majorBurn(activePatient(s2)); }
for (let T = 4; T <= 600; T += STEP) {
  s2.t = T;
  if ((T - 2) % 240 === 0) s2.doses.push({ id: "saline", at: T });
  physio(s2);
  majorBurn(activePatient(s2));
}
console.log("untreated co:", fluidTreated.co, "fluid-treated co:", activePatient(s2).co);
