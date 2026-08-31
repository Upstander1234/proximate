import { effectiveFitness, fitnessCostMult } from "./campaign/index.js";
import { mapFor } from "./data/maps.js";
import { shortestPath } from "./mapGraph.js";
export const STALE=120, FETCH=150, SOFTSTALE=45;   // 45–120 s = slightly stale (soft), >120 s = critically old
/* Reserve window. The instant you make patient contact, the body still has a little
   slack before any single deranged vital becomes fatal — that is the window you
   arrived to work in. Nothing arrests in the first GRACE seconds on scene, so a
   patient who is already critical on arrival (the overdose at RR 4, the crush at
   K 6.4) can no longer die before you have laid a hand on them. Tune freely. */
export const GRACE=120;
export const LEVELS={
  layperson:{n:0,name:"Layperson",note:"Hands, eyes, a phone. Compressions, an AED, a pocket mask, and intranasal naloxone."},
  emr:{n:1,name:"EMR",note:"Public safety first responder. BVM, O₂, OPA, suction, TQ, manual BP, AED, IN naloxone."},
  emt:{n:2,name:"EMT",note:"BLS. NPA, SGA, CPAP, oximetry, glucometry, nebs, aspirin, IM epi. Can ACQUIRE a 12-lead — not read it."},
  aemt:{n:3,name:"AEMT",note:"The needle. IV/IO, fluids, capnography, and a CLOSED list of IV drugs."},
  paramedic:{n:4,name:"Paramedic",note:"The monitor and the tube. 12-lead INTERPRETATION, manual defib, pacing, cric, full box."},
  unlimited:{n:5,name:"Unlimited Scope",note:"Physician / CCP. Every drug, every procedure. No gates. Nothing to hide behind."},
};
export const LNAME=(n)=>Object.values(LEVELS).find(l=>l.n===n)?.name||"?";
export const CODES={1:{name:"Code 1",note:"Routine. No lights, no siren.",mult:1.9},
  2:{name:"Code 2",note:"Urgent. Lights, intermittent siren.",mult:1.35},
  3:{name:"Code 3",note:"Emergency. Full lights and siren. The most dangerous thing you will do today.",mult:1.0}};

/* Travel timing. A layperson is not responding — they are already there. A bystander
   at the scene is seconds from the patient, so the whole approach collapses to ~10 s.
   Everyone else rolls a truck, and the response code sets how fast. */
// MODE_MULT is legacy — the map-expansion batch (see CLAUDE.md) replaced its
// role in travelTimes() below with real station->incident road distance
// (src/mapGraph.js's shortestPath over src/data/maps.js's real street
// graphs). Left defined, unused by travelTimes() itself, for one release in
// case anything else in the tree still reads it — see fleet.js's MODES.driveMult
// for the same legacy-field note.
export const MODE_MULT={city:0.7,suburban:1.0,rural:1.9};
// Response-vehicle type modifier (queue item F1's "e-bike/golf-cart
// response-time mechanic" — previously narrated in Chapter 3's PATROL path
// text with no mechanism behind it). Every non-Layperson response before
// this multiplier used the SAME 240s*CODES*MODE_MULT formula regardless of
// what's actually responding — a fire engine navigating city streets and a
// campus patrol bike covering the same quad arrived in identical time,
// which is not realistic and made the "e-bike/golf-cart PATROL-EMR
// promotion" (fleet.js's `pso`/`campusEmr` kinds) mechanically invisible.
// A campus bike or golf cart doesn't need to find parking, navigate general
// traffic, or cover the same catchment as a full department vehicle — it's
// already staged somewhere on or near the same small campus MODE_MULT.city
// already represents. No published response-time dataset exists for a
// fictional campus patrol program, so these are a reasoned estimate (the
// same honest category as MODE_MULT's own city/suburban/rural spread, not a
// literature-anchored physiology coefficient) rather than a tuned number —
// bike/golf-cart land at roughly a third to a bit under half of the ordinary
// vehicle drive time, distinctly faster than a full response but nowhere
// near the ~10s a Layperson who is ALREADY on scene gets. Default 1 (no
// change) for every other vehicle type, so no existing non-campus play is
// affected. Keyed by fleet.js's own `vehicle.type` values.
export const VEH_TYPE_TRAVEL_MULT={bike:0.4,golfcart:0.45};
// Zero-To-Hero campaign only (design doc §1.3.1, "lower fitness = slower to
// walk to scene"): scales only the ON-FOOT component — the layperson's flat
// walk-up, and the truck-to-patient tail after a vehicle response — never
// `drive` itself, since vehicle speed has nothing to do with the player's
// own legs. footMult is 1 (no change) for every non-campaign save, since
// fitness/fatigue sit fixed at their blank() defaults there.
// Real, map-derived base drive time: shortestPath over the current map's
// street graph from the station to the incident's own RoutingPoint (a
// building node, or a mid-street {edgeId,t} for locOnStreet scenarios —
// see src/data/scenarios.js). Falls back to the old flat 240s reference if
// g.locations hasn't been seeded yet (e.g. mid-transition, or a save from
// before this batch that hasn't dispatched since) so nothing crashes on a
// missing location — real geometry always wins once a dispatch has seeded it.
function baseDriveSeconds(s){
  if(!s.locations?.station||!s.locations?.incident) return 240;
  const map=mapFor(s);
  // s.weather (Sandbox's own picker, default "clear") now has a REAL effect
  // on the player's own drive, not just the decorative WEATHER_MULT/TOD_MULT
  // that dramatizes OTHER units' ETAs (App.jsx) — gravel rural branch roads
  // (maps.js) genuinely slow down under rain/snow; paved edges are
  // unaffected (mapGraph.js's edgeSeconds/GRAVEL_WEATHER_MULT).
  const {seconds}=shortestPath(map,s.locations.station,s.locations.incident,s.weather||"clear");
  return Number.isFinite(seconds)?seconds:240;
}
export const travelTimes=(s)=>{
  const lvl=s.level?LEVELS[s.level].n:0;
  const footMult=s.learningMode==="zth"?fitnessCostMult(effectiveFitness(s.fitness,s.fatigue)):1;
  if(lvl===0) return {drive:4,need:10*footMult};        // layperson: ~10 s to the patient
  const vm=VEH_TYPE_TRAVEL_MULT[s.myVeh?.type]||1;         // bike/golf-cart respond faster than a full vehicle
  const drive=baseDriveSeconds(s)*CODES[s.code].mult*vm;
  return {drive,need:drive+(s.stretcher?100:20)*footMult};
};
export const LIM={bloodLethal:2.4,spo2Lethal:65,spo2Unc:75,hrLow:20,hrHigh:220,
  sbpLow:50,sbpHigh:285,sbpRadial:90,sbpShock:90,sbpCarotid:60};
