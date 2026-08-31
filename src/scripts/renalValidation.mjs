// renalValidation.mjs — UNIT-LEVEL validation of salt/water physiology.
// Exercises renal.js directly (no cardiovascular ODE), so multi-hour endocrine
// processes can be validated at their real time scale.
import { Patient } from "../physio/patient.js";
import { updateRenalEndocrine } from "../physio/renal.js";

const ecf = p => p.plasmaVol + p.interstitialVol;
function mk(over={}){const p=new Patient({age:35,sex:"male",weight:70},0);Object.assign(p,over);
  p.map=93;p.co=5;p.cvp=4;return p;}
function run(p,hours,perTick){const dt=0.5;// minutes
  for(let m=0;m<hours*60;m+=dt){if(perTick)perTick(p,dt);updateRenalEndocrine(p,dt);
    p.totalBloodVol=p.plasmaVol+p.rbcVol;}
  return p;}
let pass=0,fail=0;
function chk(name,v,lo,hi,u=""){const ok=v>=lo&&v<=hi;ok?pass++:fail++;
  console.log(`  ${ok?"PASS":"FAIL"}  ${name.padEnd(46)} ${v.toFixed(2).padStart(9)} ${u.padEnd(10)} [${lo}..${hi}]`);}

console.log("RENAL / SALT-WATER UNIT VALIDATION (12 h horizons)\n");
console.log("[BASELINE]");
{const p=mk();const na0=p.na,m0=p.naMass;run(p,12);
 chk("serum Na stable",p.na,136,145,"mmol/L");
 chk("Na mass conserved (no drift)",Math.abs(p.naMass-m0),0,120,"mmol");
 chk("ECF water stable",ecf(p)/14.0,0.9,1.1,"x");}

console.log("\n[DEHYDRATION] 2 L solute-free water lost over 12 h");
{const p=mk();const na0=p.na;const m0=p.naMass;
 run(p,12,(pt,dt)=>{const l=2.0/(12*60/dt);const f=pt.plasmaVol/ecf(pt);
   pt.plasmaVol-=l*f;pt.interstitialVol-=l*(1-f);});
 chk("sodium RISES (hypernatremia)",p.na-na0,3,30,"mmol/L");
 chk("ADH activated",p.adhs,1.2,6,"x rest");
 chk("sodium MASS not lost (water problem)",Math.abs(p.naMass-m0),0,300,"mmol");}

console.log("\n[SIADH] autonomous ADH");
{const p=mk({adhAutonomous:3});const na0=p.na;const m0=p.naMass;run(p,12);
 chk("sodium FALLS (dilutional hyponatremia)",na0-p.na,3,40,"mmol/L");
 chk("ECF water expands",ecf(p)/14.0,1.02,1.4,"x");
 chk("sodium mass roughly preserved",Math.abs(p.naMass-m0)/m0,0,0.2,"frac");}

console.log("\n[CENTRAL DI] no ADH secretion");
{const p=mk({adhSecretionCapacity:0});const na0=p.na;run(p,12);
 chk("sodium RISES (hypernatremia)",p.na-na0,3,40,"mmol/L");
 chk("ADH absent",p.adhs,0,0.2,"x rest");
 chk("ECF water contracts",ecf(p)/14.0,0.7,0.99,"x");}

console.log("\n[NEPHROGENIC DI] ADH present, duct unresponsive");
{const p=mk({adhRenalResponsiveness:0.05});const na0=p.na;run(p,12);
 chk("sodium RISES",p.na-na0,3,40,"mmol/L");
 chk("ADH HIGH (distinguishes from central DI)",p.adhs,1.0,6,"x rest");}

console.log("\n[HEMORRHAGE] 1.5 L isotonic loss");
{const p=mk();const na0=p.na;
 run(p,2,(pt,dt)=>{if(pt._t===undefined)pt._t=0;pt._t+=dt;
   if(pt._t<=10){const l=1.5/(10/dt);pt.plasmaVol-=l*0.6;pt.naMass-=pt.na*l*0.6;
     pt.interstitialVol-=l*0.4;pt.naMass-=pt.na*l*0.4;}});
 chk("sodium UNCHANGED (isotonic)",Math.abs(p.na-na0),0,4,"mmol/L");
 chk("volume depleted",ecf(p),10.5,13.5,"L");}

console.log("\n[CIRRHOSIS] venodilation -> underfilled circuit");
{const p=mk({venousCapacitanceFactor:1.5});run(p,12);
 chk("defended volume RISES",p.targetBloodVol/4.9,1.15,1.8,"x");
 chk("sodium preserved",p.na,132,145,"mmol/L");}

console.log("\n[PRESSURE NATRIURESIS] sustained MAP 120");
{const p=mk();p.map=120;const bv0=p.totalBloodVol;run(p,12);
 chk("volume falls (excretion)",bv0-p.totalBloodVol,0.05,2.0,"L");}
{const p=mk();p.map=60;const bv0=p.totalBloodVol;run(p,12);
 chk("hypotension -> retention (opposite sign)",p.totalBloodVol-bv0,-0.2,2.0,"L");}

// ---------------------------------------------------------------------------
console.log("\n[CONSERVATION LAWS] closed system, 12 h, no external input");
{const p=mk();
 const w0=p.plasmaVol+p.interstitialVol+p.intracellularVol;
 const na0=p.naMass, pr0=(p.ivAlbuminMass||0)+(p.isAlbuminMass||0);
 run(p,12);
 const w1=p.plasmaVol+p.interstitialVol+p.intracellularVol;
 chk("water: change only via renal routes",Math.abs(w1-w0),0,1.5,"L");
 chk("sodium MASS conserved",Math.abs(p.naMass-na0),0,60,"mmol");
 chk("protein MASS conserved",Math.abs((p.ivAlbuminMass||0)+(p.isAlbuminMass||0)-pr0),0,1,"g");
 chk("plasma+rbc == TBV",Math.abs(p.plasmaVol+p.rbcVol-p.totalBloodVol),0,1e-6,"L");}

console.log("\n[TONICITY] 2 L isotonic saline vs 2 L free water");
{const iso=mk(); const na0=iso.na;
 run(iso,2,(pt,dt)=>{if(pt._t===undefined)pt._t=0;pt._t+=dt;
   if(pt._t<=30){const v=2.0/(30/dt);pt.plasmaVol+=v;pt.naMass+=154*v;}});
 chk("isotonic saline: Na UNCHANGED",Math.abs(iso.na-na0),0,4,"mmol/L");
 chk("isotonic saline: volume expanded",iso.plasmaVol+iso.interstitialVol,14.5,17.5,"L");}
{const hyp=mk(); const na0=hyp.na;
 run(hyp,2,(pt,dt)=>{if(pt._t===undefined)pt._t=0;pt._t+=dt;
   if(pt._t<=30){const v=2.0/(30/dt);pt.plasmaVol+=v;}});   // D5W: water, no sodium
 chk("free water (D5W): Na FALLS",na0-hyp.na,3,30,"mmol/L");
 chk("free water: sodium mass unchanged",Math.abs(hyp.naMass-140*14.0),0,220,"mmol");}

console.log(`\n${pass} passed, ${fail} failed`);
