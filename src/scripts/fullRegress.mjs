import { physio, activePatient } from '../physiology.js';
import { SCEN } from '../data/scenarios.js';
// Full vs legacy at a settled time point, capturing the full hemodynamic vector.
export function regress(atSec=240, keys=Object.keys(SCEN)){
  const rows=[];
  for(const k of keys){
    const s={scen:k,t:0,doses:[],given:{},activePatientId:null};let p;
    for(let T=2;T<=atSec;T+=2){s.t=T;physio(s);}
    p=activePatient(s);
    const fc=p.fourChamberLoop||{};
    rows.push({
      k, bs:+(p._bodyScale||1).toFixed(2), rhythm:p.rhythm, hr:Math.round(p.hr),
      fCO:+p.co.toFixed(2), lCO:+(p._legacyCo||0).toFixed(2),
      fMAP:Math.round(p.map), lMAP:Math.round(p._legacyMap||0),
      fSV:Math.round(p.sv), lSV:Math.round(p._legacySv||0),
      fEDV:Math.round(p.edv), lEDV:Math.round(p._legacyEdv||0),
      fESV:Math.round(p.esv), lESV:Math.round(p._legacyEsv||0),
      fEF:Math.round(p.ef*100), lEF:Math.round((p._legacyEf||0)*100),
      Pla:fc.Pla, Pra:fc.Pra, Ppv:fc.Ppv, Psys:fc.Psys, Ppa:fc.Ppa,
      cvp:+(p.cvp||0).toFixed(1), svr:Math.round(p.svr||0),
      bv:+(p.totalBloodVol||0).toFixed(2),
    });
  }
  return rows;
}
export function sev(r){ // severity: relative CO + absolute MAP divergence
  const co=r.lCO>0.3?Math.abs(r.fCO-r.lCO)/r.lCO:(Math.abs(r.fCO-r.lCO)>0.5?1:0);
  const map=Math.abs(r.fMAP-r.lMAP)/40;
  return +(co+map).toFixed(2);
}
