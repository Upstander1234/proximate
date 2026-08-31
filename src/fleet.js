import { LEVELS } from "./scope.js";
import { drawName, pronounForGender } from "./names.js";

const chance=(p)=>Math.random()<p;
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
export const randRange=ri;
function wpick(entries){
  const total=entries.reduce((s,e)=>s+e[1],0); let r=Math.random()*total;
  for(const [v,w] of entries){ r-=w; if(r<=0) return v; }
  return entries[entries.length-1][0];
}
// Every person on scene — your own crew and every other unit's personnel
// alike — gets a starting fatigue (mostly fresh), morale (mostly good),
// base skill, and years on the job. These drive individualized fail odds
// (see failChance below), independent of the department they're with.
export function genPersonStats(){
  return {fatigue:ri(0,20), morale:ri(80,100), baseSkill:ri(40,90),
    yearsExp:chance(0.6)?ri(0,5):ri(6,20)};
}
function lastName(full){ return full.split(" ").slice(-1)[0]; }
// `role` doubles as the on-scene title — everyone is referred to as
// "{title} {last name}", never by their full random first+last name.
// Pronouns come from the drawn name's own gender tag (names.js) rather than
// an independent random pick, so a person's pronouns are never at odds with
// their name — read by App.jsx's low-morale callout via pronouns.js's
// PRONOUN_SETS, the same lookup patient pronouns already use.
function person(role,level){ const {name:full,gender}=drawName();
  return {name:`${role} ${lastName(full)}`, fullName:full, role, title:role, level, gender,
    pronouns:pronounForGender(gender), ...genPersonStats()}; }

// Base fail rate is purely a function of the SKILL's own tier (0-5), on a
// clean geometric curve so two known points line up exactly: an EMT-tier
// skill (lvl 2) sits at 1%, a paramedic-tier skill (lvl 4) sits at 10% —
// i.e. each tier is ~3.16× (sqrt(10)) riskier than the one below it.
export function baseFailPct(lvl){ return Math.pow(10,(lvl-2)/2); }
// Individual modifiers layer on top of that base rate: more fatigue or
// lower morale multiply it up; more base skill or more years of experience
// multiply it down (experience falls off exponentially past year 5, per
// design — a rookie improves fast, a 20-year medic barely improves at all).
// §1.5.2: "high morale improves crew efficiency slightly." Rather than a new
// mechanism, this nudges the INPUT to failChance below (which already reads
// p.morale for exactly this purpose, via moraleMult) by the crew-wide
// g.morale scalar (campaign.js) — a thin wrapper, not a change to
// failChance's own behavior. Self-neutralizing at crewMorale=50 (g.morale's
// blank() default), so any save that never moves g.morale sees zero change.
export function effectiveCrewMorale(p, crewMorale=50){
  return {...p, morale:Math.max(0,Math.min(100,(p.morale??90)+((crewMorale??50)-50)*0.2))};
}
export function failChance(p, taskLvl){
  const base=baseFailPct(taskLvl);
  const fatigue=p.fatigue??10, morale=p.morale??90, skill=p.baseSkill??65, yrs=p.yearsExp??3;
  const fatigueMult=1+fatigue/100;
  const moraleMult=1+Math.max(0,100-morale)/100;
  const skillMult=Math.max(0.05,1-(skill/100)*0.8);
  const expMult=yrs<=5?Math.max(0.15,1-yrs*0.12):Math.max(0.01,0.4*Math.exp(-(yrs-5)*0.35));
  const pct=base*fatigueMult*moraleMult*skillMult*expMult;
  return Math.max(0,pct)/100;
}

// `driveMult` is LEGACY as of the map-expansion batch (see CLAUDE.md) —
// src/scope.js's travelTimes() and src/data/hospitals.js's effTransportTime()
// now compute real drive time from src/data/maps.js's actual street graphs
// (src/mapGraph.js's shortestPath) instead of this flat scalar. Left defined
// for one release, unread by either function, purely as insurance against
// anything else in the tree still displaying it — delete once confirmed
// unused everywhere.
export const MODES={
  city:{key:"city",name:"City",note:"Dense coverage. Many units, short ETAs — you are rarely alone for long.",
    units:["engine","squad","pd","pso"], medicChance:0.35, emrBias:0.30, driveMult:0.7},
  suburban:{key:"suburban",name:"Suburban",note:"Moderate coverage. An engine and a medic, most of the time.",
    units:["engine","squad","pd"], medicChance:0.30, emrBias:0.35, driveMult:1.0},
  rural:{key:"rural",name:"Rural",note:"Thin coverage, long roads. Few hands, and they are a long way out.",
    units:["engine","squad","sheriff","volunteer"], medicChance:0.10, emrBias:0.55, driveMult:1.9},
};

function engineCrew(m){
  const roll=Math.random();
  const roles=[person("Captain","emt"),person("Engineer",chance(m.emrBias)?"emr":"emt"),
    person("Firefighter",chance(m.emrBias)?"emr":"emt"),person("Firefighter",chance(m.emrBias)?"emr":"emt")];
  if(roll<0.15) roles[0].level="paramedic";
  else if(roll<0.30) roles[2+ri(0,1)].level="paramedic";
  return chance(0.12)?roles.slice(0,3):roles;
}
function squadCrew(m){
  const solo=m.key==="rural"&&chance(0.4);
  if(solo) return [person("Paramedic","paramedic")];
  return wpick([
    [[person("Paramedic","paramedic"),person("EMT","emt")],0.55],
    [[person("Paramedic","paramedic"),person("AEMT","aemt")],0.25],
    [[person("Paramedic","paramedic"),person("Paramedic","paramedic")],0.20],
  ]);
}
function blsCrew(){
  return wpick([
    [[person("EMT","emt"),person("EMT","emt")],0.70],
    [[person("EMT","emt"),person("AEMT","aemt")],0.30],
  ]);
}
function alsCrew(){
  return wpick([
    [[person("Paramedic","paramedic"),person("EMT","emt")],0.60],
    [[person("Paramedic","paramedic"),person("AEMT","aemt")],0.25],
    [[person("Paramedic","paramedic"),person("Paramedic","paramedic")],0.15],
  ]);
}
function pdCrew(){
  const n=chance(0.5)?2:1;
  return Array.from({length:n},()=>chance(0.25)?person("Officer","emr"):person("Officer","layperson"));
}
function sheriffCrew(){
  return [chance(0.3)?person("Deputy","emr"):person("Deputy","layperson")];
}
function psoCrew(){ return [person("PSO","emr")]; }
// Northwood University's trained-layperson campus patrol (the Zero-To-Hero
// campaign's entry point, per src/assets/ui/ZeroToHeroMode.md) — a solo,
// on-foot volunteer with no vehicle and no certification above layperson.
function patrolCrew(){ return [person("PATROL Volunteer","layperson")]; }
function volunteerCrew(){
  const n=chance(0.4)?2:1;
  return Array.from({length:n},()=>wpick([[person("Volly Firefighter","emr"),0.55],[person("Volly Firefighter","emt"),0.35],
    [person("Volly Firefighter","layperson"),0.10]]));
}
function supervisorCrew(){ return [person("Supervisor",chance(0.5)?"unlimited":"paramedic")]; }
// The pilot is not a medical provider — level "layperson" keeps them out of
// any scope/topLevel calculation — and is flagged `pilot:true` so callers
// can recognize and special-case them (never recruitable, never removable,
// never the seat a player occupies; always the one who flies the aircraft).
function pilotPerson(){ return {...person("Pilot","layperson"), pilot:true}; }
function flightCrew(){ return [pilotPerson(),person("Flight Medic","unlimited"),person("Flight Nurse","unlimited")]; }
function campusEmrCrew(){ return [person("Campus EMR","emr")]; }
function rescueCrew(m){
  return wpick([
    [[person("Rescue Officer","paramedic"),person("Firefighter",chance(m.emrBias)?"emr":"emt")],0.5],
    [[person("Rescue Officer","emt"),person("Firefighter","emt")],0.5],
  ]);
}
function ladderCrew(m){ return engineCrew(m); }
function volBLSCrew(){
  return wpick([[[person("EMT","emt"),person("EMT","emt")],0.6],
    [[person("EMT","emt"),person("EMR","emr")],0.4]]);
}
function battalionCrew(){ return [person("Battalion Chief",chance(0.6)?"paramedic":"emt")]; }
function sergeantCrew(){ return [chance(0.4)?person("Sergeant","emr"):person("Sergeant","layperson")]; }
// Critical Care Transport — extremely rare, physician/CCP-level. Two seats,
// one of which is always the Unlimited-scope provider.
function criticalCareCrew(){ return [person("CCT Physician","unlimited"),person("CCT Paramedic","unlimited")]; }

export const KINDS={
  engine:    {label:"Fire engine",  agency:"Fire Dept",         vehicle:{type:"engine",  normalSeats:4,totalSeats:4}, crewFn:engineCrew,    etaTier:1, category:"fire",     baseChance:1.0},
  rescue:    {label:"Rescue truck", agency:"Fire Dept",         vehicle:{type:"rescue",  normalSeats:4,totalSeats:4}, crewFn:rescueCrew,    etaTier:1, category:"fire",     baseChance:0.3},
  ladder:    {label:"Ladder truck", agency:"Fire Dept",         vehicle:{type:"ladder",  normalSeats:4,totalSeats:4}, crewFn:ladderCrew,    etaTier:2, category:"fire",     baseChance:0.25},
  battalion: {label:"Battalion Chief",agency:"Fire Dept",       vehicle:{type:"suv",     normalSeats:1,totalSeats:1}, crewFn:battalionCrew, etaTier:2, category:"command",  baseChance:0.12},
  squad:     {label:"Medic squad",  agency:"Fire Dept",         vehicle:{type:"chase",   normalSeats:2,totalSeats:2}, crewFn:squadCrew,     etaTier:0, category:"ems",      baseChance:1.0},
  ambBLS:    {label:"BLS ambulance",agency:"Private EMS",       vehicle:{type:"bls",     normalSeats:2,totalSeats:4,transport:true}, crewFn:blsCrew, etaTier:1, category:"ems", baseChance:0.5},
  ambALS:    {label:"ALS ambulance",agency:"County EMS",        vehicle:{type:"als",     normalSeats:2,totalSeats:4,transport:true}, crewFn:alsCrew, etaTier:0, category:"ems", baseChance:0.4},
  criticalCare:{label:"Critical Care Unit",agency:"County EMS", vehicle:{type:"als",     normalSeats:2,totalSeats:4,transport:true}, crewFn:criticalCareCrew, etaTier:1, category:"ems", baseChance:0.02},
  criticalCareChase:{label:"Critical Care chase car",agency:"County EMS", vehicle:{type:"chase", normalSeats:2,totalSeats:2,transport:false}, crewFn:criticalCareCrew, etaTier:1, category:"ems", baseChance:0.02},
  pd:        {label:"PD patrol",    agency:"Police Dept",       vehicle:{type:"pdcar",   normalSeats:2,totalSeats:2}, crewFn:pdCrew,        etaTier:2, category:"police",   baseChance:0.8},
  pdMoto:    {label:"Police motorcycle",agency:"Police Dept",   vehicle:{type:"motorcycle",normalSeats:1,totalSeats:1}, crewFn:pdCrew,     etaTier:0, category:"police",   baseChance:0.4},
  sergeant:  {label:"Police Sergeant",agency:"Police Dept",     vehicle:{type:"pdcar",   normalSeats:1,totalSeats:1}, crewFn:sergeantCrew,  etaTier:2, category:"command",  baseChance:0.15},
  sheriff:   {label:"Sheriff patrol",agency:"Sheriff's Office", vehicle:{type:"shercar", normalSeats:2,totalSeats:2}, crewFn:sheriffCrew,   etaTier:1, category:"police",   baseChance:0.7},
  pso:       {label:"Public Safety Officer",agency:"Campus PD", vehicle:{type:"bike",    normalSeats:1,totalSeats:1}, crewFn:psoCrew,       etaTier:0, category:"campus",   baseChance:0.5},
  // normalSeats bumped 1->2 (F7): a real, non-recruitable foot-patrol partner
  // now rides along automatically (fixedCrew, the same idiom flight's pilot
  // already uses) rather than PATROL being solo-only. totalSeats stays equal
  // to normalSeats — a two-person foot patrol has no student capacity.
  patrol:    {label:"PATROL Volunteer",agency:"Campus PD",     vehicle:{type:"none",    normalSeats:2,totalSeats:2}, crewFn:patrolCrew, fixedCrew:patrolCrew, etaTier:0, category:"campus",   baseChance:0.3},
  volunteer: {label:"Volunteer rescue",agency:"Volunteer Agency",vehicle:{type:"pickup",normalSeats:2,totalSeats:2},crewFn:volunteerCrew,etaTier:2, category:"volunteer",baseChance:0.6},
  volBLS:    {label:"Volunteer BLS chase car",agency:"Volunteer Agency",vehicle:{type:"chase",normalSeats:2,totalSeats:2},crewFn:volBLSCrew,etaTier:2, category:"volunteer",baseChance:0.4},
  campusEmr: {label:"Campus EMR",   agency:"Campus PD", vehicle:{type:"golfcart",normalSeats:1,totalSeats:1}, crewFn:campusEmrCrew,  etaTier:0, category:"campus",   baseChance:0.5},
  supervisor:{label:"EMS Supervisor",agency:"County EMS",       vehicle:{type:"suv",     normalSeats:1,totalSeats:1}, crewFn:supervisorCrew, etaTier:2, category:"command",  baseChance:0.15},
  flight:    {label:"Air medical",  agency:"Flight EMS",        vehicle:{type:"helo",    normalSeats:3,totalSeats:5,transport:true}, crewFn:flightCrew, fixedCrew:()=>[pilotPerson()], etaTier:3, category:"air",      baseChance:0.10},
};

export const VEHICLE_KIND_ORDER=["engine","rescue","ladder","battalion","squad","ambBLS","ambALS","criticalCare","criticalCareChase",
  "pd","pdMoto","sergeant","sheriff","pso","patrol","volunteer","volBLS","campusEmr","supervisor","flight"];
export const DEFAULT_ALLOWED=new Set(["engine","rescue","ladder","battalion","squad","ambBLS","ambALS","criticalCare","criticalCareChase",
  "pd","pdMoto","sergeant","sheriff","pso","patrol","volunteer","volBLS","campusEmr","supervisor","flight"]);

// The player level required to guarantee you're never outranked by your
// own crew on a given vehicle kind — i.e. the highest provider level that
// kind's crew generator can ever produce. Used to gate the vehicle picker
// so you can only choose a rig you'd actually be senior on.
export const KIND_MIN_LEVEL_N={
  engine:0, rescue:0, ladder:0, battalion:0,
  squad:4, ambBLS:1, ambALS:4, criticalCare:5, criticalCareChase:5,
  pd:0, pdMoto:0, sergeant:0, sheriff:0, pso:0, patrol:0,
  volunteer:0, volBLS:0, campusEmr:0,
  supervisor:4, flight:5,
};
// The set of provider levels that could plausibly staff each vehicle kind
// (drawn straight from each crewFn above). Used to gate which departments
// even show up for a given provider level — a department only "has" your
// level if one of its enabled vehicle kinds could actually put you to work.
export const KIND_LEVELS={
  engine:["emr","emt","paramedic"], rescue:["emr","emt","paramedic"], ladder:["emr","emt","paramedic"],
  battalion:["emt","paramedic"], squad:["emt","aemt","paramedic"],
  ambBLS:["emt","aemt"], ambALS:["emt","aemt","paramedic"],
  criticalCare:["unlimited"], criticalCareChase:["unlimited"],
  pd:["layperson","emr"], pdMoto:["layperson","emr"], sergeant:["layperson","emr"], sheriff:["layperson","emr"], pso:["emr"],
  patrol:["layperson"],
  volunteer:["layperson","emr","emt"], volBLS:["emr","emt"], campusEmr:["emr"],
  supervisor:["paramedic","unlimited"], flight:["unlimited"],
};

// Departments/agencies — grouped straight off each vehicle kind's `agency`.
// Used both for the "what department are you with" picker (which filters
// the vehicle list to that department) and Department Settings (which
// gates whole departments in/out of a save, same spirit as Fleet Settings).
export const DEPARTMENT_ORDER=["Fire Dept","County EMS","Private EMS","Police Dept","Sheriff's Office",
  "Campus PD","Volunteer Agency","Flight EMS"];
export const DEPARTMENT_KINDS=Object.fromEntries(DEPARTMENT_ORDER.map(dep=>
  [dep, VEHICLE_KIND_ORDER.filter(k=>KINDS[k].agency===dep)]));
export const DEFAULT_ALLOWED_DEPARTMENTS=new Set(DEPARTMENT_ORDER);

// Always resolves to a real Set. Anything that isn't already a Set or a
// plain array (e.g. a stale/corrupted value from an old save) falls back
// to `fallback` — which is DEFAULT_ALLOWED / DEFAULT_ALLOWED_DEPARTMENTS
// at every call site, so the fleet defaults to fully enabled rather than
// silently empty.
export function toAllowedSet(val, fallback){
  if(val instanceof Set) return val;
  if(Array.isArray(val)) return new Set(val);
  return new Set(fallback);
}

// A vehicle kind is actually available only if BOTH its own Fleet Settings
// toggle AND its department are switched on.
export function effectiveAllowedKinds(allowedKinds, allowedDepartments){
  const ak=toAllowedSet(allowedKinds, DEFAULT_ALLOWED);
  const ad=toAllowedSet(allowedDepartments, DEFAULT_ALLOWED_DEPARTMENTS);
  return new Set([...ak].filter(k=>KINDS[k]&&ad.has(KINDS[k].agency)));
}

function unitName(kind){
  if(kind==="engine")     return "Engine "+ri(30,71);
  if(kind==="rescue")     return "Rescue "+ri(1,19);
  if(kind==="ladder")     return "Ladder "+ri(1,19);
  if(kind==="battalion")  return "Battalion "+ri(1,9);
  if(kind==="squad")      return "Squad "+ri(1,9);
  if(kind==="ambBLS")     return "Medic "+(10+ri(0,79));
  if(kind==="ambALS")     return "Medic "+(1+ri(0,9));
  if(kind==="criticalCare") return "CCT "+ri(1,4);
  if(kind==="criticalCareChase") return "CCT Chase "+ri(1,4);
  if(kind==="pd")         return "PD "+ri(100,899);
  if(kind==="pdMoto")     return "PD Motor "+ri(1,49);
  if(kind==="sergeant")   return "PD Sergeant "+ri(1,29);
  if(kind==="sheriff")    return "Sheriff "+ri(10,99);
  if(kind==="pso")        return "PSO "+ri(1,20);
  if(kind==="volunteer")  return "Rescue "+ri(1,29);
  if(kind==="volBLS")     return "Volunteer Medic "+ri(1,19);
  if(kind==="campusEmr")  return "Campus EMR "+ri(1,9);
  if(kind==="supervisor") return "Supervisor "+ri(1,9);
  if(kind==="flight")     return "LifeFlight "+ri(1,9);
  return "Unit";
}

function makeUnit(kind,m,etaBase,i){
  const K=KINDS[kind]; const personnel=K.crewFn(m);
  return {id:kind+"_"+i, kind, label:K.label, agency:K.agency,
    name:unitName(kind), vehicle:K.vehicle, personnel,
    solo:personnel.length===1,
    eta:Math.round(etaBase[Math.min(K.etaTier,etaBase.length-1)]*(0.85+Math.random()*0.3)),
    arrived:false};
}

export function genUnits(modeKey,opts={}){
  const m=MODES[modeKey]||MODES.suburban;
  const allowed=opts.allowed instanceof Set?opts.allowed:new Set(opts.allowed||DEFAULT_ALLOWED);
  const severity=opts.severity||2;
  const etaBase={city:[45,90,130,220],suburban:[120,200,270,360],rural:[300,430,560,900]}[m.key];
  const out=[];
  let idx=0;
  const tryAdd=(kind,p)=>{
    if(!allowed.has(kind)) return;
    const K=KINDS[kind]; if(!K) return;
    if(!chance(p??K.baseChance)) return;
    out.push(makeUnit(kind,m,etaBase,idx++));
  };

  m.units.forEach(kind=>tryAdd(kind));
  // Rural/volunteer coverage sometimes sends a volunteer BLS chase car alongside (or instead of) the pickup.
  if(m.key==="rural") tryAdd("volBLS",0.25);

  if(severity<=1){
    if(!out.some(u=>u.vehicle.transport)) tryAdd("ambBLS",0.85);
    return capUnitsBySeverity(out.sort((a,b)=>a.eta-b.eta), severity, m.key);
  }
  if(severity===2){
    tryAdd("ambALS",0.35);
    if(!out.some(u=>u.vehicle.transport)) tryAdd("ambBLS",0.6);
    tryAdd("sergeant",0.1);
  }
  if(severity>=3){
    tryAdd("ambALS",0.7);
    if(!out.some(u=>u.vehicle.transport)) tryAdd("ambBLS",0.5);
    tryAdd("squad",0.5);
    tryAdd("supervisor",0.35);
    tryAdd("battalion",0.2);
    tryAdd("rescue",0.3);
    tryAdd("ladder",0.15);
    tryAdd("sergeant",0.2);
    tryAdd("criticalCare",0.02);   // vanishingly rare — a physician-staffed unit for the worst calls
    tryAdd("criticalCareChase",0.02);   // same crew tier, no-transport chase car variant
    if(m.key==="rural") tryAdd("flight",0.3);
  }
  if(!out.some(u=>u.vehicle.transport)&&(allowed.has("ambBLS")||allowed.has("ambALS")))
    tryAdd(allowed.has("ambALS")&&severity>=2?"ambALS":"ambBLS",1);
  return capUnitsBySeverity(out.sort((a,b)=>a.eta-b.eta), severity, m.key);
}

export const topLevel=(u)=>Math.max(0,...u.personnel.map(p=>LEVELS[p.level].n));

// ─── First / second / third on scene ──────────────────────────────────────
// Every call, there is a chance YOU beat the other units to the patient. The
// chance climbs the longer you have gone without being first (streak), and it
// depends on how light and fast your own rig is. It resets to base the call
// after you ARE first.
//
// Per region: a base and a linear cap. The chance rises linearly from base to
// cap over CALLS_TO_CAP calls, then grows exponentially toward 1 beyond that.
// The base/cap are scaled by a per-vehicle multiplier — a PSO on a bike or a
// motorcycle officer is first far more often than a full-size ALS ambulance.
export const FIRST_REGION={ city:{base:0.05,cap:0.20}, suburban:{base:0.15,cap:0.30}, rural:{base:0.60,cap:0.65} };
export const FIRST_VEH_MULT={
  bike:2.4, motorcycle:2.1, golfcart:1.9, chase:1.5, suv:1.4, pickup:1.2,
  pdcar:1.3, shercar:1.3, bls:0.8, als:0.7, engine:0.6, rescue:0.7, ladder:0.5, helo:0.4,
};
const CALLS_TO_CAP=5;
export function firstOnSceneChance(region, vehType, streak=0, variable=1){
  const R=FIRST_REGION[region]||FIRST_REGION.suburban;
  const mult=(FIRST_VEH_MULT[vehType]??1.0)*(variable||1);
  const base=Math.min(0.95, R.base*mult);
  const cap=Math.min(0.97, R.cap*mult);
  let ch;
  if(streak<CALLS_TO_CAP) ch=base+(cap-base)*(streak/CALLS_TO_CAP);
  else ch=cap+(1-cap)*(1-Math.exp(-0.35*(streak-CALLS_TO_CAP)));
  return Math.max(0, Math.min(0.98, ch));
}
// Roll the player's arrival rank. First is the primary roll; second and third
// are CONDITIONAL — only rolled if you were not first (and not second). Returns
// 1, 2, 3, or 4 (4 = you arrive after the first three units are already there).
export function rollSceneRank(region, vehType, streak=0, variable=1){
  const pFirst=firstOnSceneChance(region, vehType, streak, variable);
  if(Math.random()<pFirst) return 1;
  // Not first. Lighter rigs are still likelier to be near the front.
  const mult=FIRST_VEH_MULT[vehType]??1.0;
  const pSecond=Math.min(0.6, 0.30*mult);
  if(Math.random()<pSecond) return 2;
  const pThird=Math.min(0.6, 0.30*mult);
  if(Math.random()<pThird) return 3;
  return 4;
}

// Cap how many units may pile onto one scene, scaled by severity AND region.
// Keeps a minor call from drawing a dozen rigs. Always keeps at least one
// transport unit if one is present.
//
// F2: "far too many providers show up" was specifically a rural complaint —
// thin coverage should mean thin response. Rural caps at roughly the player
// + an ambulance, with room for one more (an engine, or the chase-car/squad
// upgrade) only at the highest severity; city/suburban keep the denser
// baseline caps, since dense coverage genuinely means more hands show up.
export function capUnitsBySeverity(units, severity, modeKey){
  const CAPS_BY_MODE={
    rural:   {1:2,2:2,3:3},
    suburban:{1:2,2:3,3:5},
    city:    {1:2,2:4,3:6},
  };
  const cap=(CAPS_BY_MODE[modeKey]||CAPS_BY_MODE.suburban)[severity]||6;
  if(units.length<=cap) return units;
  const sorted=[...units].sort((a,b)=>a.eta-b.eta);
  const kept=sorted.slice(0,cap);
  if(!kept.some(u=>u.vehicle&&u.vehicle.transport)){
    const t=sorted.find(u=>u.vehicle&&u.vehicle.transport);
    if(t){kept[kept.length-1]=t;}
  }
  return kept.sort((a,b)=>a.eta-b.eta);
}


export function blsAmbulance(modeKey){
  const eta={city:150,suburban:250,rural:430}[modeKey||"suburban"];
  return {id:"amb_bls", kind:"ambBLS", label:"BLS ambulance", agency:"Private EMS",
    name:unitName("ambBLS"),
    vehicle:{type:"bls",normalSeats:2,totalSeats:4,transport:true}, personnel:blsCrew(), solo:false,
    eta:Math.round(eta*(0.85+Math.random()*0.3)), arrived:false};
}

// The rigs a player may choose to be on, gated by their own level and by
// which agencies/vehicle kinds Fleet Settings has turned on. Falls back to
// the old auto-computed myVehicle() if Fleet Settings has excluded every
// option that would otherwise apply (so the player is never left choiceless).
export function rigOptions(level, partner, allowedKinds){
  const n=level?LEVELS[level].n:0;
  const allowed=allowedKinds instanceof Set?allowedKinds:new Set(allowedKinds||DEFAULT_ALLOWED);
  if(n===0) return [{key:"none",type:"none",normalSeats:1,totalSeats:1,transport:false,
    name:"On foot — you are already here",note:"Laypeople don't drive a rig to the call; you're already on scene."}];
  const opts=[];
  if(allowed.has("ambBLS")) opts.push({key:"bls",type:"bls",normalSeats:2,totalSeats:4,transport:true,name:"BLS ambulance",
    note:"Transport-capable. Your partner drives once you load."});
  if(n>=4&&allowed.has("ambALS")) opts.push({key:"als",type:"als",normalSeats:2,totalSeats:4,transport:true,name:"ALS ambulance",
    note:"Transport-capable. Your partner drives once you load."});
  if(n>=4&&allowed.has("squad")) opts.push({key:"chase",type:"chase",normalSeats:2,totalSeats:2,transport:false,name:"Solo chase car",
    note:"No transport — you'll need an ambulance on scene to move this patient."});
  if(opts.length===0) opts.push({...myVehicle(level,partner),key:"default"});
  return opts;
}

export function drawPersonName(){ return drawName().name; }

// normalSeats = permanent crew positions (you, partner, pilot, firefighter —
// whoever actually staffs the rig). totalSeats = physical capacity, which for
// transport ambulances is bigger than the crew alone (room for students,
// ride-alongs, and the transported patient). Falls back to the legacy
// single-`seats` shape for vehicles pulled from an old save that predates
// this split, so old saves keep working.
export function seatsFor(vehicle){
  if(!vehicle) return 1;
  if(vehicle.normalSeats!=null) return vehicle.normalSeats;
  if(vehicle.type==="bls"||vehicle.type==="als") return 2;
  return vehicle.seats||1;
}
export function totalSeatsFor(vehicle){
  if(!vehicle) return 1;
  if(vehicle.totalSeats!=null) return vehicle.totalSeats;
  if(vehicle.seats!=null) return vehicle.seats;
  return seatsFor(vehicle);
}

// ─── Recruitment: budget, cost, and the candidate pool ──────────────────
// Every provider level has a different base "sticker price" to recruit —
// roughly a geometric climb mirroring the scope tiers themselves.
export const PROVIDER_BASE_COST={layperson:0,emr:12,emt:20,aemt:32,paramedic:50,unlimited:90};
// Each department gives the player a flat 100-point budget to spend
// recruiting crew out of its roster.
export const RECRUIT_BUDGET=100;
// The provider-level key one tier below the given one (floors at layperson).
export function levelBelow(levelKey){
  const n=LEVELS[levelKey]?.n??0;
  const target=Math.max(0,n-1);
  return Object.keys(LEVELS).find(k=>LEVELS[k].n===target)||levelKey;
}
// Cost factors in base skill, years of experience, and provider level.
// A student is costed as if they were the level BELOW the one they're
// training toward (an EMT student prices out like an EMR, using the same
// on-record years/skill), then gets a further 50% discount on top of that.
export function recruitCost(p, asStudent){
  const costLevel=asStudent?levelBelow(p.level):p.level;
  const base=PROVIDER_BASE_COST[costLevel]??10;
  if(base===0) return 0;
  const skill=p.baseSkill??65, yrs=p.yearsExp??3;
  const skillMult=0.6+(skill/100)*0.8;        // ~0.92–1.32 across the normal 40–90 range
  const expMult=1+Math.min(yrs,20)*0.03;       // up to 1.6x at 20 years
  let cost=base*skillMult*expMult;
  if(asStudent) cost*=0.5;
  // Cost of any single partner is capped at 100 — no matter how high their
  // level, skill, and experience stack up, one hire can never exceed 100.
  return Math.max(1,Math.min(100,Math.round(cost)));
}
// Builds the full recruitable roster: loops through every unit kind
// (every other unit that could show up on a call — engines, squads,
// ambulances, PD, volunteers, flight, all of it) and runs its crewFn
// several times over, collecting every crew member it produces into one
// big named, stat-rolled pool tagged with the department that "employs"
// them. This runs once, during the loading screen, and the resulting
// pool is what the recruitment page reads from and depletes as the
// player hires people out of it.
export function genCandidatePool(){
  const m={key:"suburban",emrBias:0.35};
  const pool=[];
  VEHICLE_KIND_ORDER.forEach(kind=>{
    const K=KINDS[kind]; if(!K) return;
    for(let i=0;i<6;i++){
      const crew=K.crewFn(m);
      crew.forEach((p,j)=>{
        if(p.pilot) return; // fixed crew — always present, never part of the recruit pool
        pool.push({...p, id:`cand_${kind}_${i}_${j}_${Math.random().toString(36).slice(2,8)}`,
          agency:K.agency, sourceKind:kind});
      });
    }
  });
  return pool;
}

// Recurring hospital staff — generated ONCE per career save (see App.jsx's
// "loading" phase, alongside genCandidatePool) and carried across every call
// for the life of the save, so the same Medical Director and the same
// handful of ER staff keep showing up: base contact is always the same
// physician, not a new anonymous voice every call, and the receiving crew at
// the doors is drawn from a real, recurring roster rather than invented on
// the spot per arrival.
export function genHospitalStaff(){
  const one=(title)=>{const {name:full,gender}=drawName();
    return {name:`${title} ${lastName(full)}`, fullName:full, title, gender, pronouns:pronounForGender(gender)};};
  return {
    medicalDirector: one("Dr."),
    erDoctors: Array.from({length:3},()=>one("Dr.")),
    erNurses: Array.from({length:4},()=>one("RN")),
    erTechs: Array.from({length:3},()=>one("Tech")),
    respTherapists: Array.from({length:2},()=>one("RT")),
  };
}

// F2: "not every vehicle carries every bag" — a police unit does not stock a
// full EMS loadout. Keyed by the SAME `vehicle.type` strings KINDS already
// uses (App.jsx reads g.myVeh.type, set from myVehicle()/rigOptions() below),
// so this needs no new identifiers anywhere else. Anything not listed here
// keeps full access (fire/EMS rigs, and "none" for a layperson who has no
// bags to restrict in the first place).
export const VEHICLE_BAG_ACCESS={
  pdcar:["trauma"], motorcycle:["trauma"], shercar:["trauma"],   // patrol units: bleeding-control gear only (IFAK)
  bike:["trauma"], golfcart:["trauma","airway"],                 // campus PSO / EMR: light bag plus basic airway
};
export function bagsForVehicle(vehicle){
  const t=vehicle?.type;
  return (t&&VEHICLE_BAG_ACCESS[t])||null;   // null = unrestricted (full loadout)
}

export function myVehicle(level, partner){
  const n=level?LEVELS[level].n:0;
  if(n===0) return {type:"none",normalSeats:1,totalSeats:1,transport:false,name:"On foot — you are already here"};
  if(n<=3)  return {type:"bls", normalSeats:2,totalSeats:4,transport:true, name:"BLS ambulance"};
  if(n===4) return partner
    ? {type:"als", normalSeats:2,totalSeats:4,transport:true, name:"ALS ambulance"}
    : {type:"chase",normalSeats:2,totalSeats:2,transport:false,name:"Solo chase car — no transport"};
  return {type:"als",normalSeats:2,totalSeats:4,transport:true,name:"ALS ambulance"};
}
