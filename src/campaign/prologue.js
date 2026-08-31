// campaign/prologue.js — the prologue's own dialogue tables, in PLOT ORDER
// (top to bottom = the order these beats actually play, per App.jsx's own
// phase-transition chain — campaignDisclaimer through campaignTutorialFinale).
//
// Every export below was moved VERBATIM (not retyped) out of App.jsx in an
// earlier batch, wrapped in a `(ctx)=>[...]` function so any local variable
// the original inline block referenced (speaker names, pronoun forms, etc.)
// is destructured from `ctx` at the top rather than touching a single word
// of the array body itself, per this project's own "relocating text is not
// license to edit it" rule. This file has since been reordered (position
// only — no text content changed) to match story order rather than
// migration order.
//
// The four choice-menu tables (STATION_INTERLUDE1_OPTS/
// STATION_INTERLUDE2_FOOD/STATION_INTERLUDE2_LATE_OPTS/
// TUTORIAL_FINALE_OPTIONS) each carry their own `apply:(s)=>{...}`
// state-mutation closure per option (clampMorale/adjustFriendship/plain
// stat math) alongside their label/text — these are pure functions of
// state-in to patch-out (never call setG themselves), so they export fine
// as plain data; App.jsx's own choose()/pick() handlers still own the
// actual setG call and any achievement-unlock wiring layered on top.
//
// What's already real and separate from this file: Chapter 1's own dialogue
// (CH1_DIALOGUE, chapter1.js) already lives in a data file and is NOT part
// of this file. REFLECTION_PROMPTS (used by campaignReflection) already
// lives in core.js, not here. campaignWelcome/campaignReflection/
// campaignStatsReveal/campaignCustomize/campaignIntro/
// campaignPatrolBriefing/campaignNormieEnding have no dialogue table here —
// they're either meta UI screens or (Reflection) already externalized
// elsewhere.

// campaignDisclaimer — plain strings, two text nodes separated by <br/><br/>
// in the original JSX (unchanged in App.jsx).
export const DISCLAIMER_TEXT=`This mode is meant to be a fun visual-novel-style experience simulating the life of someone in EMS. It was written by one person — a working EMT, not a training program or a medical director — so it is not meant to be a fully accurate representation of EMS, its culture, or how any real agency actually runs. Some liberties were taken with the campaign, and this route is not the only way to get into EMS (and, realistically, this exact pathway doesn't exist).`;
export const DISCLAIMER_FOOTER=`If you're looking purely to practice clinical skills, please exit and choose Medical Education Mode from the main menu.`;

// campaignCoincidence — one paragraph.
export const COINCIDENCE_TEXT=`Every character, agency, hospital, and school in this campaign — Northwood University, PATROL, the crew you're about to meet, all of it — is fictional. Any resemblance to real people, living or dead, or to real organizations, is merely a coincidence.`;

// campaignLetter — four separate text nodes (kept separate rather than one
// blob, matching the original JSX's own separate nodes/styling around each).
export const LETTER_GREETING=`Dear Applicant,`;
export const LETTER_BODY=`On behalf of the Admissions Committee, it is my pleasure to offer you admission to Northwood University…`;
export const LETTER_PROGRAM_LABEL=`PROGRAM OF STUDY: UNDECLARED`;
export const LETTER_FOOTER=`Undeclared. Everyone else on the floor seems to already know — pre-law, biomed, whatever their parents did. You checked the box because you had to check something.`;

// campaignLaptop's lead-in, before the video starts — the apartment
// scene-setting and the player's own internal reaction, previously two
// static italic paragraphs shown all at once outside the click-through
// flow. Turned into real one-click-one-line VNDialogue, same shape as
// HEATSTROKE_SIM_INTRO_LINES. No ctx references, plain array.
export const LAPTOP_INTRO_LINES=[
  {text:`A cheap desk, a laptop, a half-eaten cup of ramen. This is it. My own place. First year of college.`},
  {text:`(I should probably be excited… or terrified. I'm still not sure which.)`},
];

// campaignLaptop — the ParamedicStories skit. No ctx references at all in
// the original inline block, so this is a plain array, not a function.
export const VIDEO_LINES=[
  {speaker:"Jason (firefighter outfit)",persona:"firefighter",text:'"What happened?"'},
  {speaker:"Jason (as the friend)",persona:"as_friend",text:'"I thought he was having a heart attack…"'},
  {speaker:"Jason (as the patient)",persona:"as_patient",text:'"I just got dared to jump off the bridge."'},
  {speaker:"Jason (as himself)",persona:"as_himself",text:'"...How tall was the bridge?"'},
  {speaker:"Jason (as the friend)",persona:"as_friend",text:'"Tall enough that he blacked out."'},
];

// campaignHeatStrokeSim's intro VNDialogue. No ctx references — plain array.
// Now a (ctx)=>[...] function, not a plain array — ctx: {stats,emsInterest},
// where stats is {fitness,confidence,knowledge,ambition} straight off g and
// emsInterest is g.campaignEmsInterest ("yes"/"no"/null). Adds two closing
// internal-thought lines:
//   - EMS_INTEREST_LINE is the real payoff for campaignLaptop's Yes/No
//     choice (ChatGPT suggestion #5/#6, treated as one item — the actual
//     fix isn't rewording the laptop choice itself, which already reads as
//     tentative curiosity rather than a firm commitment ("Maybe I should
//     look into this"/"I'll stick to business"), it's giving that choice
//     something to answer TO once the stakes are real. campaignEmsInterest
//     was already being set and carried — grep confirmed it before this —
//     but had no reader anywhere past the achievement-unlock check that
//     sets it, so the choice was landing with zero narrative consequence).
//   - REFLECTION_LINE is keyed to whichever of the four campaignReflection
//     stats the player ended up highest in, so the four numbers chosen
//     back at that screen become something the player actually RECOGNIZES
//     here rather than staying an invisible RPG stat (ChatGPT suggestion
//     #4, scoped to a single moment rather than threaded through every
//     scene). Ties broken by a fixed priority order (confidence >
//     knowledge > ambition > fitness) so an exact tie is deterministic,
//     not arbitrary — confidence/knowledge are the two most legible in a
//     single line, fitness is the most generic fallback.
export const HEATSTROKE_SIM_INTRO_LINES=(ctx)=>{
  const stats=ctx?.stats||{};
  const order=["confidence","knowledge","ambition","fitness"];
  let top="fitness",topVal=-Infinity;
  order.forEach((k)=>{const v=stats[k]??10; if(v>topVal){topVal=v;top=k;}});
  const REFLECTION_LINE={
    confidence:"(People are already looking around, waiting for someone else to move first. Fine. You'll be the someone.)",
    knowledge:"(Heat. Collapse. This exact weather. That's heat stroke — get them out of the sun, that much you remember.)",
    ambition:"(You don't know why, but you're already moving before you've actually decided to.)",
    fitness:"(Your legs are already moving toward them. You'll figure out the rest on the way.)",
  }[top];
  const EMS_INTEREST_LINE=ctx?.emsInterest==="yes"
    ?"(You said maybe, watching that video. This isn't a maybe anymore.)"
    :ctx?.emsInterest==="no"
    ?"(You said this wasn't your thing. Try telling that to whoever's on the ground.)"
    :null;
  return [
    {text:`It's oppressively hot; cicadas drone. Students mill about, fanning themselves. "Wow, it's really hot today…" you mutter, walking toward the science building.`},
    {text:`Suddenly, a sharp cry cuts through the air. A student a few yards ahead staggers, clutches their head, and collapses. A water bottle clatters away.`},
    {text:"(Oh no. That's a person. On the ground. Not moving. What do I do? What did that video say? Check breathing? Scene safety first?)"},
    ...(EMS_INTEREST_LINE?[{text:EMS_INTEREST_LINE}]:[]),
    {text:REFLECTION_LINE},
  ];
};

// campaignHeatStrokeAftermath — ctx: {partnerFirst, secondResp, moved, pr}
// hesitated: derived by App.jsx's own tick-loop transition from how long
// the player took to call 911 after the scene began (>=45s of a scene
// they were dropped straight into) — a real, measured signal, not a
// guess. Ties into item 7 of the ChatGPT suggestion list ("hesitation
// reactivity"): kept to a single, honest line rather than a full
// approach-mechanic, since there's no reliable signal in this scene for
// finer-grained hesitation (did they look around first vs. freeze vs.
// read the whole scene) beyond "how long before they acted."
export const AFTERMATH_LINES=(ctx)=>{
  const {partnerFirst,secondResp,moved,pr,hesitated}=ctx;
  return [
    {text:`Two figures in green polos with "NORTHWOOD PATROL" badges jog onto the scene. One kneels by the patient; the other waves bystanders back.`},
    {speaker:partnerFirst,pose:"kneeling",text:`"Heat stroke. They're seizing slightly. Get me the ice packs and spray bottle. ${secondResp}, what's the ETA on that ambulance!"`},
    {speaker:secondResp,text:`"On it… they're four minutes out."`},
    {speaker:partnerFirst,text:`"You were here first, right? ${moved
      ?"You did the right thing, moving them out of the sun — probably saved brain cells. Good job."
      :"You didn't do bad. Good job."}"${moved?"  (+1 CONFIDENCE)":""}`},
    ...(hesitated?[{speaker:partnerFirst,pose:"thinking",text:`"You looked like you were waiting for someone else to step in first, back there. That's normal — everybody freezes a little the first time. Just don't wait as long next time."`}]:[]),
    {text:`An ambulance siren wails in the distance. The patient is loaded onto a stretcher. ${partnerFirst} wipes sweat from ${pr.poss} forehead and turns to you with an easy grin.`},
    {speaker:partnerFirst,text:hesitated
      ?`"Hey — thanks for the help back there. You got there in the end, and that's what actually counts. Nobody's grading your reaction time."`
      :`"Hey — thanks for the help back there. You kept your head when a lot of people would've frozen. That's not nothing."`},
    {speaker:partnerFirst,pose:"thinking",text:`"You know what you actually did back there? You helped. Before anyone official showed up, before anyone told you to — you just did."`},
    {speaker:partnerFirst,text:`"You should join us. Northwood PATROL, campus first-response. We train you, you help people, and — okay, you also get a cool green shirt."`},
  ];
};

// campaignLibraryEncounter — the declined-once-more branch, two weeks
// later. ctx: {partnerFirst}
export const LIBRARY_ENCOUNTER_LINES=(ctx)=>{
  const {partnerFirst}=ctx;
  return [
    {text:`A quiet study area. You're scanning a shelf when ${partnerFirst||"they"} approaches, eyebrow raised.`},
    {speaker:partnerFirst||"???",text:`"Hey. Been a couple weeks — figured I'd catch you before finals swallow the campus whole."`},
    {speaker:partnerFirst||"???",text:`"I'll actually tell you what it is this time, instead of just grinning about a t-shirt. It's a few shifts a week, unpaid, and most of it is boring — waiting around, refilling supplies, walking a dorm loop where nothing happens. Some of it isn't boring at all."`},
    {speaker:partnerFirst||"???",text:`"Look, I asked once already, so I'm not going to make a whole thing out of asking twice. But I am asking. Last time. So — is this a yes?"`},
  ];
};

// campaignStation — ctx: {supervisorFirst, partnerFirst, partnerPr, supervisorPr, playerFirst, capWord}
// capWord passed through rather than re-implemented here, since it's a
// one-line helper App.jsx already has in scope at the call site.
export const STATION_LINES=(ctx)=>{
  const {supervisorFirst,partnerFirst,partnerPr,supervisorPr,playerFirst,capWord}=ctx;
  return [
    {text:"A repurposed storage room. Mismatched desks, an old whiteboard with call tallies, a crooked campus map. A worn-out couch sits in one corner; a small locker holds basic medical supplies."},
    {text:`${supervisorFirst}, mid-40s, built like they could still play linebacker, looks up from a stack of paperwork.`},
    {speaker:supervisorFirst,pose:"holding_clipboard",text:`"Welcome, probationary. You'll ride with ${partnerFirst}. ${capWord(partnerPr.subj)} will show you the ropes. Mostly it's scraped knees, drunk kids, and the occasional real emergency. Pay attention and you'll do fine."`},
    {speaker:partnerFirst,pose:"holding_coffee",text:`"Ready for your first shift, ${playerFirst||"partner"}? Each day isn't certain — we might get one call, we might get six. Don't worry, I'll do all the talking. You just try not to pass out."`},
    {speaker:supervisorFirst,text:"\"Northwood's a small campus. That means when something happens, we're usually the first ones there, sometimes the only ones there for a few minutes. Don't let that scare you. Let it make you sharp.\""},
    {speaker:partnerFirst,text:`"Also don't let ${supervisorFirst} scare you either. ${capWord(supervisorPr.subj)} says that to every new EMR on their first shift. It's basically our welcome mat."`},
  ];
};

// campaignSupervisorClass — ctx: {supervisorFirst, partnerFirst}
export const CLASS_LINES=(ctx)=>{
  const {supervisorFirst,partnerFirst}=ctx;
  return [
    {text:"Not the storage room. The student health center loans PATROL its real skills lab twice a semester: a manikin flat on a mat, an AED trainer on a shelf, a folding table laid out with pocket masks and tourniquets. A locked case sits at the end of the table. Folding chairs face all of it."},
    {speaker:supervisorFirst,pose:"holding_clipboard",text:`"You're on the radio starting tonight, so before that happens, I need you to actually have these — not memorized, just in your hands once. Forty minutes. Sit."`},
    {speaker:partnerFirst,text:`"I still remember mine. I passed out during the AED part. Not from the patient — from the coffee."`},
    {text:`${supervisorFirst} kneels beside the manikin and pulls its shirt open.`},
    {speaker:supervisorFirst,pose:"kneeling",text:`"Compressions first. Always first. If somebody drops in front of you and stops breathing, you don't wait on the AED and you don't wait on us — you start pushing. Nothing outranks this. Not a drug, not a transport decision. If somebody's choking and goes unconscious, compressions ARE the maneuver. That's not the backup plan — that's the whole plan."`},
    {speaker:supervisorFirst,pose:"demonstrating_cpr",text:`"Two inches deep, center of the chest. Hard and fast — a hundred to a hundred-twenty a minute — and let it come all the way back up between pushes. You'll get tired faster than you think. That's why you work in pairs: swap every two minutes, before you're the one who needs it."`},
    {speaker:partnerFirst,pose:"thinking",text:`"'Stayin' Alive' is the right tempo, if you need something to count to. Or 'Another One Bites the Dust.'"`},
    {text:`${supervisorFirst} pulls the AED trainer down off the shelf and sets it on the table next to the manikin.`},
    {speaker:supervisorFirst,pose:"demonstrating_aed",text:`"Pads on bare skin — one below the right collarbone, one on the lower left ribs. Then you let it do the thinking. It analyzes the rhythm, and it will not let you shock one that doesn't need it. You cannot make this worse by following what it tells you to do."`},
    {speaker:supervisorFirst,pose:"pointing",text:`"The only way to actually get it wrong is to freeze. Turn it on, follow the voice, that's the whole skill."`},
    {text:`${supervisorFirst} lays a tourniquet and a folded pocket mask out on the table.`},
    {speaker:supervisorFirst,pose:"applying_tourniquet",text:`"Bleeding: direct pressure first, if you can hold it there yourself. Tourniquet if you can't — or if it's bad enough that you shouldn't waste time trying. High and tight, above the wound, crank it until the bleeding actually stops, not until it hurts less. This one's every level, all the way down to you — it's not held back for anybody higher up the chain."`},
    {speaker:supervisorFirst,pose:"pointing",text:`"Quick one — where does it go on a forearm bleed that won't stop?"`},
    {speaker:partnerFirst,pose:"thinking",text:`"...Right above the wrist?"`},
    {speaker:supervisorFirst,text:`"Above the elbow. High and tight means high — you're not trying to pinch the exact spot, you're cutting off everything below it. Forearm and lower leg wounds both get it above the joint, every time."`},
    {speaker:partnerFirst,pose:"idle",text:`"...Right. I knew that."`},
    {speaker:supervisorFirst,pose:"giving_rescue_breath",text:`"Rescue breaths: the pocket mask, not mouth-to-mouth, if you've got the choice. Exhaled air runs about sixteen percent oxygen instead of twenty-one — but sixteen percent is infinitely more than none. Don't overthink it."`},
    {speaker:partnerFirst,text:`"It tastes like the inside of a first-aid kit. You get used to it faster than you'd think."`},
    {text:`${supervisorFirst} unlocks the case at the end of the table. Inside: a row of small intranasal devices.`},
    {speaker:supervisorFirst,pose:"holding_naloxone",text:`"This one's new to your scope — it wasn't always layperson-level. Intranasal, one spray, point-four milligrams. If somebody's not breathing and you think it's an opioid, ventilate them FIRST — the mask, not this. Then give it, and titrate to their BREATHING coming back, not to them waking up. Waking up too fast is its own problem — you'll see why the hard way if you're not careful."`},
    {speaker:partnerFirst,text:`"Campus has had four overdoses this year. That's the actual reason they finally let us carry it."`},
    {text:`${supervisorFirst} sets the clipboard down and leans back against the table.`},
    {speaker:supervisorFirst,pose:"holding_radio",text:`"Last one, and it matters more than people give it credit for: when a real crew gets there, you hand off what you saw. In order — who the patient is, what happened, what you found, what you did about it. Real crews call that an IMIST-AMBO. You'll give one after every call you run out here, and it's graded on whether you actually SAID what you found — not on hitting exact words."`},
    {speaker:supervisorFirst,text:`"Get it wrong and nobody's in trouble — you just make the next person's job harder, walking in blind. Get it right and you buy the patient a few extra seconds nobody else could."`},
    {speaker:partnerFirst,text:`"Also, talk slower than you think you need to. Everybody's first few reports come out sounding like an auctioneer. Slow is smooth, and smooth is fast."`},
    {speaker:supervisorFirst,pose:"idle",text:`"That's the whole kit: compressions, the AED, bleeding, breaths, naloxone, the report. Everything past this you learn on scene — same as everyone above you did, by doing it and getting corrected. There's a card on the table with all of it written down. Take it."`},
    {speaker:supervisorFirst,text:`"One more thing, and it matters more than any of the steps I just gave you: you don't have to know everything out there. Nobody does, not even me. You have to know what to do next. That's it. That's the whole job."`},
    {speaker:supervisorFirst,text:`"Your radio works. Go. And stay sharp."`},
  ];
};

// campaignPreCall1 — ctx: {partnerFirst, partnerPr, capFirst}. The radio
// beat at the end is a real, EARLY appearance of the radio operator's
// voice, reachable well before that character gets a name (radio_crew's
// relationship isn't created until interlude 2's dinner scene) — no name
// is used here on purpose, so a later, named late-night chat with the same
// operator (STATION_INTERLUDE2_LATE_OPTS below) doesn't feel like a
// repeat of an identical beat.
export const PRE_CALL1_LINES=(ctx)=>{
  const {partnerFirst,partnerPr,capFirst}=ctx;
  return [
    {text:`You and ${partnerFirst||"your partner"} sit on a bench near the dining hall, sipping water. The radio crackles: "PATROL-2, respond to the library — person fainted."`},
    {speaker:partnerFirst,text:`"Classic library faint. Too much studying, not enough food. Or they saw the price of textbooks. Let's go."`},
    {text:`${capFirst(partnerPr.subj)} stands and sets a brisk pace toward the library, forbidding you from running.`},
    {speaker:partnerFirst,pose:"walking",text:`"Sweaty responder is a useless responder."`},
    {speaker:partnerFirst,text:`"Stay close and watch what I do. First one's just about not panicking — I've got the rest."`},
    {speaker:"Radio",text:`"Radio check, you copy?"`},
    {text:`"Copy. Just wanted a voice on the line before your first one."`},
    {speaker:"Radio",text:`"You'll do fine. Call it in clean, and if you forget a step I'll walk you through it."`},
  ];
};

// A fifth, always-available option at both station interludes below: step
// out of the "pick two"/"pick one" scene and check the real, relationship-
// tracked bike EMR/cart-crew/foot-patrol roster (App.jsx's own
// ch1StationTalkTarget flow, already built for the plain station screen).
// Rendered as its own button rather than folded into STATION_INTERLUDE1_OPTS/
// STATION_INTERLUDE2_LATE_OPTS, since those tables' `apply` closures are
// pure state patches and this needs to actually change screens, not just
// patch a stat.
export const STATION_STEPOUT_OPTION={
  label:"Step out and see who's around.",
  text:"You leave the break room and check who's actually at the station right now.",
};

// §2.7.2 — Station Interlude 1's "pick two" activities (between the
// library-faint call and the `od` call).
// ctx: {partnerName, supervisorName, interludePr, capFirst, adjustFriendship}
export const STATION_INTERLUDE1_OPTS=(ctx)=>{
  const {partnerName,supervisorName,interludePr,capFirst,adjustFriendship}=ctx;
  return [
    {id:"coffee",label:`Grab coffee with ${partnerName}.`,
      text:`${partnerName} leads you to a vending machine that dispenses brown liquid allegedly resembling coffee. ${capFirst(interludePr.subj)} tells you about ${interludePr.poss} first call — a nosebleed that wouldn't stop, and how ${interludePr.subj} panicked.`,
      apply:(s)=>({relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,2)}})},
    {id:"equipment",label:"Ask to see the equipment.",
      text:`You go through the patrol bag: bandages, ice packs, pocket mask, AED, naloxone, gloves. ${partnerName} explains each item and what you're allowed to do with it. (+1 Knowledge)`,
      apply:(s)=>({knowledge:(s.knowledge??10)+1})},
    {id:"vehicles",label:"Check out the vehicles.",
      text:`Out back, there's a slightly battered golf cart with "NORTHWOOD PATROL" stenciled on the side. "That's for senior members," ${partnerName} says. "Maybe one day." You also spot a bicycle with a medical bag strapped to the rear rack — the e-bike senior PATROL officers use. (+1 Ambition)`,
      apply:(s)=>({ambition:(s.ambition??10)+1})},
    {id:"rest",label:"Just rest and people-watch.",
      text:`You sink onto the couch, watching a student come in for a band-aid. ${supervisorName} handles it with practiced patience. (-2 Fatigue)`,
      apply:(s)=>({fatigue:Math.max(0,(s.fatigue??0)-2)})},
  ];
};

// §2.7.3 pre-call VN for the `od` scenario — ctx: {partnerName}
export const OD_PRECALL_LINES=(ctx)=>{
  const {partnerName}=ctx;
  return [
    {text:`Evening. The station lights flicker. The radio crackles: "PATROL-2, respond to Morrison Hall. Person unconscious, possible overdose."`},
    {text:`${partnerName}'s expression tightens; the humor from earlier is gone.`},
    {speaker:partnerName,text:`"Okay, this one's serious. We've got naloxone. You can give it intranasally if I tell you to — just spray it in the nose. Stay calm, follow my lead."`},
    {speaker:partnerName,text:`"You ready? I mean it — you don't have to be fine with this. Just tell me if you're not."`},
  ];
};

// §2.7.3 post-call VN after `od` — ctx: {partnerName, pr}
export const OD_POSTCALL_LINES=(ctx)=>{
  const {partnerName,pr}=ctx;
  return [
    {speaker:partnerName,pose:"thinking",text:`"First overdose? Yeah, it's hard. You did the right thing. Naloxone doesn't fix everything. They'll still need help long-term, but Narcan helps them begin to breathe again."`},
    {text:`A beat of silence. Then ${pr.subj} forces a small smile.`},
    {speaker:partnerName,text:`"Let's get dinner. On me. Real food, not that vending machine stuff. What do you want to eat?"`},
  ];
};

// §2.7.3 — Interlude 2's post-`od` dinner choice.
// ctx: {partnerName, adjustFriendship}
export const STATION_INTERLUDE2_FOOD=(ctx)=>{
  const {partnerName,adjustFriendship}=ctx;
  return [
    {id:"hotdog",label:"Hotdog Queen",
      text:`Two dollar hotdogs, extra everything, eaten standing at a folding table. "This is a NUTRIENT," ${partnerName} insists, unconvincingly.`,
      apply:(s)=>({fitness:Math.max(0,(s.fitness??10)-1),fatigue:Math.max(0,(s.fatigue??0)-3),
        relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,2)}})},
    {id:"dining",label:"Dining Hall",
      text:`Back to the dining hall, where it's salad, again. "They only have salads here," ${partnerName} mutters, for what you suspect is not the first time.`,
      apply:(s)=>({fitness:(s.fitness??10)+3,
        relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,-2)}})},
    {id:"milkking",label:"Milk King",
      text:`Burgers and shakes in a booth that's seen better decades. ${partnerName} actually relaxes for the first time all shift.`,
      apply:(s)=>({fitness:Math.max(0,(s.fitness??10)-1),fatigue:Math.max(0,(s.fatigue??0)-3),
        relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,2)}})},
    {id:"877",label:"8-77",
      text:`Late-night 8-77, the kind of food that is a decision you make and then live with. Worth it. Mostly.`,
      apply:(s)=>({fitness:Math.max(0,(s.fitness??10)-2),fatigue:Math.max(0,(s.fatigue??0)-3),ateAt877:true,
        relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,3)}})},
  ];
};

// §2.7.4 — Interlude 2's late-night "pick one."
// ctx: {partnerName, radioName, interludePr, capFirst, adjustFriendship}
export const STATION_INTERLUDE2_LATE_OPTS=(ctx)=>{
  const {partnerName,radioName,interludePr,capFirst,adjustFriendship}=ctx;
  return [
    {id:"askPartner",label:`Ask ${partnerName} why she joined PATROL.`,
      text:`${capFirst(interludePr.subj)} pauses, then speaks softly. "Honestly? I was just like you. Someone collapsed in front of me sophomore year, and I froze. I joined because I never wanted to feel that useless again."`,
      apply:(s)=>({relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,3)}})},
    {id:"chatRadio",label:`Chat with ${radioName}.`,
      text:`${radioName} is studying nursing. She talks about balancing school and shifts, and gives you a tip: "Always carry snacks. Low blood sugar makes everything harder." She hands you a granola bar from her own bag.`,
      apply:(s)=>({relationships:{...s.relationships,radio_crew:adjustFriendship(s.relationships.radio_crew,1)}})},
    {id:"binder",label:"Review the protocol binder.",
      text:"You flip through the PATROL handbook — basic first aid, when to call ALS, campus-specific procedures. (+1 Knowledge)",
      apply:(s)=>({knowledge:(s.knowledge??10)+1,binderReviewed:1})},
    {id:"rest",label:"Close your eyes for five minutes.",
      text:`${partnerName} tosses you a thin blanket from the couch. (-2 Fatigue)`,
      apply:(s)=>({fatigue:Math.max(0,(s.fatigue??0)-2)})},
  ];
};

// §2.7.5 pre-call VN for the `seizure` scenario — ctx: {partnerName, binderReviewed}
export const SEIZURE_PRECALL_LINES=(ctx)=>{
  const {partnerName,binderReviewed}=ctx;
  return [
    {text:`Almost midnight. The radio crackles: "PATROL-2, seizure at the arts building — one student, now post-ictal." You both hurry over.`},
    {text:"The student is on the floor, groggy, with a small crowd gathered. Another student explains they convulsed for about a minute."},
    {speaker:partnerName,text:`"Post-ictal. Seizure's over. Protect their head — I don't want them hitting the floor again. Don't restrain them, just talk calmly. I'll check vitals."${binderReviewed?" (You remember the protocol binder said the same thing — time it, protect the head, nothing more.)":""}`},
    {speaker:partnerName,pose:"idle",text:`"So — what do you think? Walk me through it before I confirm it. I want to hear you get there, not just watch me get there."`},
  ];
};

// campaignTutorialFinale's intro beat, right after the `seizure` call —
// ctx: {partnerFirst, partnerPr}
export const TUTORIAL_FINALE_INTRO_LINES=(ctx)=>{
  const {partnerFirst,partnerPr}=ctx;
  return [
    {text:`The ambulance takes the patient. ${partnerFirst} drops onto the arts building steps. You sit beside ${partnerPr.obj}, the night air finally cool.`},
    {speaker:partnerFirst,text:`"And that's a night. You survived. How do you feel?"`},
  ];
};

// campaignTutorialFinale's own OPTIONS[] — how the player says they feel.
// ctx: {partnerFirst, clampMorale, adjustFriendship}
export const TUTORIAL_FINALE_OPTIONS=(ctx)=>{
  const {partnerFirst,clampMorale,adjustFriendship}=ctx;
  return [
    {id:"tired",label:`"Tired but good."`,
      response:`${partnerFirst} laughs. "That's the job in two words. Welcome to the club."`,
      apply:(s)=>({morale:clampMorale((s.morale??50)+2)})},
    {id:"shaken",label:`"Kind of shaken."`,
      response:`${partnerFirst}'s voice softens. "Yeah, that's normal. First few weeks are a roller coaster. But you kept it together. I think you've got potential, rookie."`,
      apply:(s)=>({morale:clampMorale((s.morale??50)+1),
        relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,2)}})},
    {id:"badass",label:`"Like a badass."`,
      response:`${partnerFirst} snorts. "Okay, hotshot. Don't let it go to your head. Who knows? Maybe the next call will humble you. But… you did good."`,
      apply:(s)=>({confidence:(s.confidence??10)+1,
        relationships:{...s.relationships,partner_patrol:adjustFriendship(s.relationships.partner_patrol,1)}})},
  ];
};

// campaignTutorialFinale's closing epilogue — ctx: {partnerFirst, supervisorFirst}
export const TUTORIAL_FINALE_EPILOGUE_LINES=(ctx)=>{
  const {partnerFirst,supervisorFirst}=ctx;
  return [
    {text:`Your phone buzzes. A text from ${supervisorFirst||"your supervisor"}: "Probationary status confirmed. Welcome to Northwood PATROL. Next step: talk to me about EMR school."`},
    {speaker:partnerFirst,pose:"holding_bag",text:`"So, you thinking about the EMR course? They'll teach you the real skills — airway management, splinting, maybe even some meds. I'll still be here, holding down the fort. Go for it. You're ready."`},
    {speaker:partnerFirst,pose:"idle",text:`"Radio's been quiet about it, but ${supervisorFirst||"the supervisor"} wasn't always running this station. There's a story there. Ask about it sometime — when you've earned it."`},
    {text:"Undeclared, still — on paper, anyway. Weeks ago, you checked that box because you had to check something. It felt like nothing. Tonight it doesn't."},
    {text:"You chose something."},
    {text:"Fade to black.\n\nEnd of Prologue."},
  ];
};
