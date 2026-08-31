// The quiet side of EMS. Between calls in Career Mode, a crew doesn't just
// teleport to the next patient — they go back to quarters, restock, clean,
// paper the last run, eat, rest, and wait. This module drives that loop:
// a menu of station activities, occasional flavor events, and the chance
// that dispatch interrupts whatever the crew is doing with a priority call.

// Each activity has a time cost (minutes, flavor only — this is a turn
// based game, not a real clock) and stat effects applied to every roster
// member (partners/students). Fatigue and morale are 0-100. Training is
// the only activity that raises baseSkill, and it costs the most time and
// some fatigue in exchange.
export const ACTIVITIES=[
  {id:"restock",  name:"Restock supplies",        cat:"chore", time:15,
    note:"Refill the bags from the truck's cache.", fatigue:-2, morale:2},
  {id:"clean",    name:"Clean & disinfect the rig",cat:"chore", time:20,
    note:"Scrub the cot, wipe the rails, bag the linens.", fatigue:-1, morale:1},
  {id:"pcr",      name:"Finish PCR documentation", cat:"chore", time:20,
    note:"Close out the paperwork from the last run.", fatigue:-2, morale:2},
  {id:"review",   name:"Review the last call",     cat:"chore", time:15,
    note:"Talk through what went right, what didn't.", fatigue:0, morale:3},
  {id:"food",     name:"Grab food or coffee",      cat:"self",  time:15,
    note:"Something in your stomach, caffeine in your veins.", fatigue:-6, morale:4},
  {id:"chat",     name:"Chat with your partner",   cat:"self",  time:10,
    note:"Nothing important. Just talk.", fatigue:-1, morale:5},
  {id:"duties",   name:"Station duties",           cat:"chore", time:20,
    note:"Sweep the bay, check the O₂ cylinders, restock the linen closet.", fatigue:2, morale:-1},
  {id:"train",    name:"Training / skills drill",  cat:"train", time:45,
    note:"Takes real time out of the shift, but it sharpens the crew.", fatigue:4, morale:1, skill:3},
  {id:"rest",     name:"Rest — feet up",            cat:"rest",  time:30,
    note:"Bunk room, eyes closed, not quite asleep.", fatigue:-10, morale:2},
  {id:"sleep",    name:"Sleep",                     cat:"rest",  time:90,
    note:"Real sleep, if the tones allow it.", fatigue:-30, morale:5},
  {id:"eat",      name:"Eat a real meal",            cat:"rest",  time:30,
    note:"Sit down, actual food, actual plate.", fatigue:-8, morale:6},
];
export const ACTIVITY_BY_ID=Object.fromEntries(ACTIVITIES.map(a=>[a.id,a]));

// Small, purely-atmospheric downtime events — the sense that a shift is
// continuous, not a series of teleports between patients. Some carry a
// tiny stat nudge; most are flavor only.
export const DOWNTIME_EVENTS=[
  {id:"weather1",  text:"Rain starts hammering the bay doors. Somebody mutters about what that'll bring in.", morale:-1},
  {id:"weather2",  text:"The sky clears up for the first time all week. Nobody trusts it to last.", morale:1},
  {id:"supervisor",text:"Your supervisor pops in for a check-in — nothing formal, just making rounds.", morale:1},
  {id:"community", text:"A neighbor stops by with a box of donuts for the crew.", morale:4},
  {id:"drill",     text:"The tone drops for a false alarm two blocks over. Everyone resets.", fatigue:2},
  {id:"quiet",     text:"The bay is quiet. The radio hisses. Nobody says much.", morale:0},
  {id:"prank",     text:"Someone taped a sign to the ambulance. It is not clever. Everyone laughs anyway.", morale:2},
  {id:"maintenance",text:"A mechanic comes through to check the rig's fluids and tire pressure.", morale:0},
  {id:"news",      text:"The scanner in the corner mentions a multi-car pileup on the interstate — not your call, not yet.", fatigue:0},
];

// Odds that dispatch cuts in on whatever the crew is doing. Rolled once
// per activity the player starts.
export const INTERRUPT_CHANCE=0.35;
// Odds a flavor event fires when a player lands back at the station or
// finishes an activity uninterrupted.
export const EVENT_CHANCE=0.4;

export function rollInterrupt(){ return Math.random()<INTERRUPT_CHANCE; }
export function rollDowntimeEvent(){
  if(Math.random()>EVENT_CHANCE) return null;
  return DOWNTIME_EVENTS[Math.floor(Math.random()*DOWNTIME_EVENTS.length)];
}

const clamp=(n)=>Math.max(0,Math.min(100,n));

// Apply an activity's stat effects to every roster member. `frac` scales
// the effect down (0-1) for when dispatch cuts an activity short — a crew
// that dropped everything and ran gets only a fraction of the benefit.
export function applyActivityToRoster(roster,act,frac=1){
  if(!act) return roster;
  return (roster||[]).map(p=>({...p,
    fatigue:clamp((p.fatigue||0)+(act.fatigue||0)*frac),
    morale:clamp((p.morale??90)+(act.morale||0)*frac),
    baseSkill:act.skill?clamp((p.baseSkill||50)+act.skill*frac):p.baseSkill,
  }));
}
export function applyEventToRoster(roster,ev){
  if(!ev) return roster;
  return (roster||[]).map(p=>({...p,
    fatigue:clamp((p.fatigue||0)+(ev.fatigue||0)),
    morale:clamp((p.morale??90)+(ev.morale||0))}));
}
