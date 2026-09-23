import React, { useState, useEffect, useRef } from "react";
import { C, MONO } from "./theme.js";
import { clk, curve } from "./util.js";
import { LEVELS, LNAME, CODES, LIM, STALE, SOFTSTALE, travelTimes, VEH_TYPE_TRAVEL_MULT } from "./scope.js";
import { PI, POCKETS, BAGS, RN, TASKS, STANDARD_BAG_KEYS } from "./gear.js";
import { ecgReadout, ecgPoints, artPoints, capnoPoints, respPoints } from "./ecg.js";
import { DRUGS } from "./data/drugs.js";
import { PROCS } from "./data/procedures.js";
import { STOCK_ITEMS, CONSUMES_STOCK, STOCK_CATEGORIES, CATEGORY_LABEL, maxCapacity, defaultLoadout,
  categoryBudget, truckBudget, carriedUsed, truckUsed, isLocked } from "./data/loadout.js";
import { DRUG_CATEGORIES, PROC_CATEGORIES, drugCategoryOf, procCategoryOf } from "./data/categories.js";
import { SCEN } from "./data/scenarios.js";
import { physio, critical, arrestWarning, giveDose, roster, setActivePatient, outcomeReport } from "./physiology.js";
import { CONDITIONS } from "./physio/conditions.js";
import { woundDef, woundColor, WOUND_TYPES } from "./physio/wounds.js";
import { CLOTH_LOCK, REGION_LABEL, lockedRegions, initialExposure, initialShoes } from "./clothing.js";
import { LIB, PROC_ACTS } from "./actions.js";
import { MODES, genUnits, myVehicle, seatsFor, totalSeatsFor, topLevel, blsAmbulance, KINDS, VEHICLE_KIND_ORDER, DEFAULT_ALLOWED,
  DEPARTMENT_ORDER, DEPARTMENT_KINDS, DEFAULT_ALLOWED_DEPARTMENTS, effectiveAllowedKinds, toAllowedSet, KIND_LEVELS, KIND_MIN_LEVEL_N, bagsForVehicle,
  failChance, effectiveCrewMorale, randRange,
  rollSceneRank,
  RECRUIT_BUDGET, recruitCost, genCandidatePool, genHospitalStaff, genPersonStats } from "./fleet.js";
import { listSaves, newSaveId, writeSave, loadSave, deleteSave, exportSave, importSaveText } from "./saves.js";
import { BACKGROUNDS, portraitFor, onImgError, AUDIO, vehicleArt, MODE_ART, EVENT_ART, PLACEHOLDERS,
  playerPortraitLayers, jasonSpritePath, ICON_ART } from "./assets.js";
import { DOWNTIME_EVENTS, rollDowntimeEvent } from "./downtimeEvents.js";
import { generateDialogueSync, shouldSpeakUnprompted, pickUnpromptedEvent, pushDialogueMemory, requestLocalUpgrade } from "./dialogue/dialogueManager.js";
import { neuralTts } from "./dialogue/neuralTts.js";
import { PROCEDURE_OUTCOME, POST_MINIGAME_CONFIRM_S } from "./procedureOutcome.js";
import { buildDialogueContext } from "./dialogue/dialogueContext.js";
import { resolveActingCrew, npcId, rememberNpcLine } from "./dialogue/characterBrain.js";
import { ACHIEVEMENTS, newlyUnlocked } from "./achievements.js";
import { useVoiceCommands } from "./hooks/useVoiceCommands.js";
import { isTaskBlocked, rollPartnerLimitation, LIMITATIONS } from "./limitations.js";
import { CONDITION_INFO, groundTruthConditions, matchesCondition } from "./medicle.js";
import { REFLECTION_PROMPTS, REFLECTION_PRIMARY_DELTA, REFLECTION_SECONDARY_DELTA, initializeCampaignNames,
  campaignName, campaignGender, CAMPAIGN_NAME_SLOTS,
  effectiveFitness, staminaFitness, fitnessCostMult, campaignFumbleChance, PHYSICAL_ACTION_IDS, FATIGUE_PER_PHYSICAL_ACTION,
  clampFatigue, campaignBagCap, betweenCallRecovery,
  endOfShiftFatigueGain, FATIGUE_WARN_THRESHOLD, FATIGUE_STUMBLE_THRESHOLD, FATIGUE_STUMBLE_CHANCE,
  clampMorale, clampReputation, needsRemedialTraining, callOutcomeDeltas,
  CH5_EMPLOYERS, canCombineEmployers, resolveEntranceOutcome, nine11Shortfall, CH5_REAPPLY_COOLDOWN_SHIFTS,
  nine11EntranceScore, fireEntranceScore, JOB_SHIFT_PAY, EVENT_SHIFT_FREQUENCY_FACTOR,
  CH4_CAST, FUNDING_CUT_CHANCE, balanceBothSuccessChance, TUITION, takeLoan,
  examFieldScore, examCombinedScore, EXAM_FIELD_WEIGHT, examPass, examFailurePenalty, EXAM_PASS_THRESHOLD, STARTING_MONEY,
  rollExamFieldScore, rollWrittenQuiz, EXAM_WRITTEN_QUESTIONS, EXAM_FIELD_SCENARIOS,
  ADVOCATE_POOL, ADVOCATE_FRIENDSHIP_FLOOR, paramedicApplicationFloor, PARAMEDIC_APPLICATION_FLOOR_MIN,
  ARRIVAL_TIME_OPTIONS, arrivalTimeDeltas, patrolShiftRoster, laypersonVolunteerCount,
  seedCh1Queue, CH1_DIALOGUE, CH1_STATION_NPC_DIALOGUE, CH1_STATION_NPC_PER_CHARACTER,
  CH1_PER_CHARACTER_FRIENDSHIP_THRESHOLD, BACKGROUND_CALL_TYPES, BACKGROUND_CALL_VIGNETTES,
  FREQUENT_FLYER_SCENARIOS, FREQUENT_FLYER_OD_SCENARIO, maybeInjectFrequentFlyer,
  CH2_CAST, CH3_CAST,
  CH8_ROTATIONS, CH8_FTO, CH8_INTERNSHIP_CALLS_REQUIRED, paramedicAdmissionChance,
  HOUSING_TIERS, LIFESTYLE_PURCHASES, CCP_TUITION, FLIGHT_TUITION, FLIGHT_FITNESS_MIN,
  aemtTuitionQuote, AEMT_SERVICE_COMMITMENT_MONTHS, AEMT_SCHEDULE_CONFLICT_ROUNDS,
  AEMT_REPUTATION_FLOOR,
  VIDEO_LINES, LAPTOP_INTRO_LINES, AFTERMATH_LINES, STATION_LINES, CLASS_LINES, STATION_STEPOUT_OPTION,
  HEATSTROKE_SIM_INTRO_LINES, LIBRARY_ENCOUNTER_LINES, PRE_CALL1_LINES,
  DISCLAIMER_TEXT, DISCLAIMER_FOOTER, COINCIDENCE_TEXT,
  LETTER_GREETING, LETTER_BODY, LETTER_PROGRAM_LABEL, LETTER_FOOTER,
  OD_PRECALL_LINES, OD_POSTCALL_LINES, SEIZURE_PRECALL_LINES,
  TUTORIAL_FINALE_INTRO_LINES, TUTORIAL_FINALE_EPILOGUE_LINES,
  STATION_INTERLUDE1_OPTS, STATION_INTERLUDE2_FOOD, STATION_INTERLUDE2_LATE_OPTS,
  TUTORIAL_FINALE_OPTIONS } from "./campaign/index.js";
import { drawName, drawNameByGender, firstName } from "./names.js";
import { friendshipTier, toneBucket, createRelationship, adjustFriendship, adjustRomance, wasQuietMomentEligible } from "./relationships.js";
import { CONDITION_LIST, CONDITION_META, buildCustomScenario } from "./data/customScenario.js";
import { TAXONOMY, CONDITION_TAXONOMY } from "./data/conditionTaxonomy.js";
import { DEVICES, WAVE_META, DEFIB_ENERGIES, pulseRateFrom } from "./devices.js";
import { getProtocol, evaluateProtocol } from "./protocols/index.js";
import { getScope, effectiveLvl, SCOPES } from "./scopes/index.js";
import { getCustomScope } from "./customScopes.js";
import { pron, applyPron, PRONOUN_SETS } from "./pronouns.js";
import { HOSPITAL_TYPES, HOSPITAL_ORDER, effTransportTime, destinationNote, chooseDestination, designationLabel } from "./data/hospitals.js";
import { MAPS, mapFor } from "./data/maps.js";
import { mulberry32, pickIncidentBuilding, pickPointOnStreet, shortestPath, nearestStation, pathToWaypoints, describeIncidentLocation } from "./mapGraph.js";
import CityMap from "./components/CityMap.jsx";
import { useCoop, randomRoomCode, COOP_MAX_PEERS } from "./coop.js";
import { TESTER_KEY, TESTER_PASSWORD, isTesterUnlocked } from "./testerGate.js";

// Baked in at build time for an itch.io (or any static-hosted) build via a
// .env file's VITE_COOP_RELAY_URL — see docs/itch_deploy.md. Falls back to
// the same-machine relay default so local `npm run dev` + `npm run
// coop-server` still works unconfigured, exactly as before.
const DEFAULT_COOP_URL = import.meta.env.VITE_COOP_RELAY_URL || "ws://localhost:8787";

// Every action id that start() routes into a mini-game popup (mirrors the
// id lists in start() itself — see the accessMinigame dispatch block). The
// real time cost for these is however long the player takes playing the
// mini-game, plus the fixed POST_MINIGAME_CONFIRM_S confirmation window —
// a flat pre-play "Xs" estimate next to the action is stale/misleading and
// is suppressed for these ids wherever the action list renders a time badge.
const MINIGAME_ACTION_IDS = new Set([
  "iv","io","laryngoscopy","ett","cric","sga","prep","pupils","lungs","heart","bvm","splint","manualBP",
  "tq","pack","directPressure",
  "needleD","chestSeal","defib","aedShock","headTilt","jawThrust","cCollar","cspine","opa","npa","suction",
  "o2nc","o2nrb","fundalMassage","recovery","abdThrust","traction","ultrasound","cardiovert","pacing",
  "icdMagnet","chestTube","lucas","pelvicBinder","artLine","reboa","paCath","cpap","vent","mouthMask","mouthMouth",
  "gluc","cpr",
]);
const opensMinigame=(a)=>MINIGAME_ACTION_IDS.has(a.id)||/^attach_/.test(a.id)||!!(a.drug&&DRUGS[a.drug]);
import Shell from "./components/Shell.jsx";
import BootScreen from "./components/BootScreen.jsx";
import CreditsScreen from "./components/CreditsScreen.jsx";
import { CREDITS_SEEN_KEY } from "./credits.js";
import AccessMinigame from "./components/AccessMinigame.jsx";
import AirwayMinigame from "./components/AirwayMinigame.jsx";
import CricMinigame from "./components/CricMinigame.jsx";
import SGAMinigame from "./components/SGAMinigame.jsx";
import DrawUpMinigame from "./components/DrawUpMinigame.jsx";
import PupilMinigame from "./components/PupilMinigame.jsx";
import GiveMedMinigame from "./components/GiveMedMinigame.jsx";
import HangMinigame from "./components/HangMinigame.jsx";
import TwelveLeadPrint from "./components/TwelveLeadPrint.jsx";
import GlucometerMinigame from "./components/GlucometerMinigame.jsx";
import DeviceMinigame from "./components/DeviceMinigame.jsx";
import PulseOxScreen from "./components/PulseOxScreen.jsx";
import CprMinigame from "./components/CprMinigame.jsx";
import ProcMinigame from "./components/ProcMinigame.jsx";
import MonitorScreenMinigame from "./components/MonitorScreenMinigame.jsx";
import BvmMinigame from "./components/BvmMinigame.jsx";
import AuscultationMinigame from "./components/AuscultationMinigame.jsx";
import SplintMinigame from "./components/SplintMinigame.jsx";
import BleedingControlMinigame from "./components/BleedingControlMinigame.jsx";
import BpMinigame from "./components/BpMinigame.jsx";
import BodyMap from "./components/BodyMap.jsx";
import { VNScene, VNBox, VNDialogue, VNHeader, VNSprite } from "./components/VNShell.jsx";
import CampusMapOverlay from "./components/CampusMapOverlay.jsx";
import DrivingScene from "./components/DrivingScene.jsx";
import Coop3DWalk from "./components/Coop3DWalk.jsx";
import FreeExplore from "./components/FreeExplore.jsx";

// Shared by every VN scene that reacts to VNDialogue's onLineChange to drive
// a character's sprite pose (see VNSprite's `pose` prop, VNShell.jsx) — the
// mechanism that lets a dialogue line's ACTION live on the speaker's own
// portrait instead of being written into the quoted text. Keyed by speaker
// name so a scene with two on-screen characters (e.g. campaignStation) can
// track both independently: a narration line (no speaker) clears everyone
// back to idle, a normal speaker line only ever touches that ONE speaker's
// entry, leaving whoever else is on screen exactly as they were.
export const vnLineChange=(setG)=>(line)=>setG(s=>({...s,
  vnPose: !line.speaker ? {} : {...s.vnPose,[line.speaker]:line.pose||null}}));

// Resolves a campaign.js CH1_DIALOGUE entry array (each line's `speaker` is
// a STRING KEY into `ctx`, each line's `text` a function of `ctx`, per that
// file's own comment) into the plain {speaker,text} shape <VNDialogue>
// expects. Kept here rather than in campaign.js since resolving a speaker
// key to an actual name is a render-time concern that file deliberately
// has no access to.
const ch1Lines=(entries,ctx)=>entries.map(l=>({
  ...(l.speaker?{speaker:ctx[l.speaker]}:{}),
  text:l.text(ctx)}));

// F9: background music, the piece F9's prior batch left unwired — assets.js
// already defines the AUDIO map and the two music slots (menu_music,
// station_ambience); nothing played either. A phase-driven looping player:
// station ambience while waiting between calls, menu music on every setup/
// menu screen, and silence once a call is actually running (response through
// debrief) — this game's whole premise is that the clock never stops, and
// music under a live call would cut against that tension rather than serve it.
// Autoplay policy means the FIRST play() must be inside a user gesture, so
// this only starts once `unlocked` flips (set from a click handler), same
// constraint useSiren/unlockSpeech already work around for the siren/voice.
const MENU_PHASES=new Set(["title","faq","tut","disclaimer","saves","namesave","loading","gmodePick","testerGate","freeExplorePick",
  "learningMode","campaignRenderPref","campaignDisclaimer","campaignCoincidence","campaignLetter","campaignCustomize","campaignWelcome","campaignReflection",
  "campaignStatsReveal","campaignLaptop","campaignHeatStrokeSim","campaignHeatStrokeAftermath",
  "campaignPatrolDeclineInterstitial",
  "campaignLibraryEncounter","campaignNormieEnding","campaignStation","campaignIntro","campaignSupervisorClass","campaignPatrolBriefing",
  "campaignTutorialFinale","coopSetup",
  // Chapter 1 — Boots on the Ground. See the banner comment at
  // campaignArrivalPrompt for the full flow/entry note.
  "campaignArrivalPrompt","campaignCh1Gearup","campaignCh1SupervisorTalk","campaignCh1End",
  // Chapter 2 — EMR School. See the banner comment at campaignCh2Intro.
  "campaignCh2Intro","campaignCh2Practice","campaignCh2Classmate","campaignCh2ExamPrep",
  "campaignCh2ExamResult","campaignCh2Departure","campaignCh2End",
  // Chapter 3 — Fork in the Road. See the banner comment at campaignCh3Intro.
  "campaignCh3Intro","campaignCh3Info","campaignCh3PathPatrol","campaignCh3PathFire","campaignCh3End",
  // Chapter 4 — EMT School (§1.6.5/§1.6.12). See the big comment block at
  // campaignCh4Intro for the full flow/entry-exit note.
  "campaignCh4Intro","campaignFundingCut","campaignCh4Day1","campaignCh4Practice",
  "campaignCh4Classmate","campaignCh4ExamPrep","campaignCh4ExamResult","campaignCh4End",
  // Chapter 5 — Employment (§1.6.6). See the big comment block at these
  // phases' own implementation for the full flow.
  "campaignCh5Intro","campaignCh5JobChoice","campaignCh5Exam","campaignCh5ExamResult",
  "campaignCh5EmployerIntro","campaignCh5AddSecondJob","campaignCh5End",
  // Chapter 6 — AEMT School. See the banner comment at campaignCh6Offer.
  "campaignCh6Offer","campaignCh6SkipConfirm","campaignCh6Enroll","campaignCh6ClassIntro",
  "campaignCh6ScheduleConflict","campaignCh6Exam","campaignCh6ExamResult","campaignCh6End",
  // Chapters 7-10 — built backwards from Ch.10 per operator instruction.
  // See the banner comment at campaignCh7Intro for the full flow/entry note.
  "campaignCh7Intro","campaignCh7Advocate","campaignCh7End",
  "campaignCh8Intro","campaignCh8Apply","campaignCh8EntranceExam","campaignCh8Interview","campaignCh8Wait",
  "campaignCh8AdmissionResult","campaignCh8Rotations","campaignCh8Internship","campaignCh8InternshipReview",
  "campaignCh8FinalExam","campaignCh8FinalExamResult","campaignCh8End",
  "campaignCh9Intro","campaignCh9Hub","campaignCh9Mentor","campaignCh9Housing",
  "campaignCh10Intro","campaignCh10Choice","campaignCh10CCP","campaignCh10Flight","campaignCh10End",
  "level","department","deptSettings","vehicle","fleet","partners","mode","scope","ready","cat","kit","shiftSummary"]);
function useBackgroundMusic(phase,muted,volume,unlocked){
  const audioRef=useRef(null);
  useEffect(()=>{
    if(!audioRef.current){const a=new Audio(); a.loop=true; a.onerror=()=>{}; audioRef.current=a;}
  },[]);
  const track=phase==="station"?"station_ambience":MENU_PHASES.has(phase)?"menu_music":null;
  useEffect(()=>{
    const a=audioRef.current; if(!a) return;
    const src=track?AUDIO[track]:null;
    if(!src){a.pause(); return;}
    if(!a.src||!a.src.endsWith(src)) a.src=src;
    if(unlocked) a.play().catch(()=>{});
  },[track,unlocked]);
  useEffect(()=>{
    const a=audioRef.current; if(!a) return;
    a.volume=muted?0:Math.max(0,Math.min(1,volume??1)); a.muted=!!muted;
  },[muted,volume]);
  // Dev-only test hook, same gating/cleanup convention as
  // __proximateTestGetState above: the background-music <audio> element is
  // a plain `new Audio()`, never attached to the DOM tree, so a Playwright
  // script has no other way to confirm the music/voice volume split
  // actually reaches the real element rather than just checking the state
  // field round-trips.
  useEffect(()=>{
    if(!import.meta.env.DEV) return;
    window.__proximateTestGetMusicVolume=()=>audioRef.current?.volume??null;
    return ()=>{delete window.__proximateTestGetMusicVolume;};
  },[]);
}
function useSiren(on,volume=1){useEffect(()=>{if(!on)return;let ctx,osc,iv;
  try{ctx=new (window.AudioContext||window.webkitAudioContext)();osc=ctx.createOscillator();
    const g=ctx.createGain(),f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=1300;
    osc.type="sawtooth";g.gain.value=.02*Math.max(0,Math.min(1,volume));osc.connect(f);f.connect(g);g.connect(ctx.destination);osc.start();
    let up=1;iv=setInterval(()=>{osc.frequency.linearRampToValueAtTime(up?880:610,ctx.currentTime+.55);up=!up;},550);
  }catch{/* ignore */}return()=>{clearInterval(iv);try{osc.stop();ctx.close();}catch{/* ignore */}};},[on,volume]);}

// Reads dialogue aloud: the initial dispatch call, and any log line that's
// either explicitly radio traffic (kind "disp"), a patient quote (kind
// "pt"), or simply contains a quoted line -- which is how every scenario in
// this game already marks actual spoken words vs narrated findings.
const SPEAKABLE=(e)=>e.kind==="disp"||e.kind==="pt"||/"/.test(e.text);

// Pulls a stable "who's talking" key out of a log line so different people
// can get different voices instead of one flat narrator reading everything.
// Crew/partner/physician lines are already written as `NAME: "..."` (see
// crewFn/order/micn throughout App.jsx) — patient quotes are tagged kind
// "pt" directly, since a patient never gets a name prefix.
function speakerKeyFor(e){
  if(e.kind==="pt") return "patient";
  const m=e.text.match(/^([A-Z][A-Z0-9 .'-]{1,40}):\s/);
  if(m) return m[1].trim();
  return e.kind==="disp"?"dispatch":"narrator";
}
// Dialogue-subsystem lines (patient/crew/bystander speech, tiers 1-3, F0's
// dialogueManager) render in the SAME always-visible NARRATIVE log every
// other scene event already uses, rather than a separate floating box —
// a floating overlay visually sat on top of procedure/mini-game controls,
// which is exactly what this shape avoids. Follows the log's own existing
// speech conventions (see speakerKeyFor's own comment above): a patient
// quote is `kind:"pt"` with no name prefix (rendered italic); everyone
// else gets a `NAME: "..."` prefixed line, `kind:"disp"` (the same color
// already used for radio traffic, so speech reads as a distinct color from
// plain narration/findings).
function dialogueLineFor(speaker,text,role,patientName){
  // Every dialogue line now carries an explicit speaker label, patient
  // lines included — a generated line is otherwise indistinguishable from
  // narration at a glance. A patient with a confirmed identity (askId's own
  // "PATIENT: ..." find, s.idKnown) is labeled by name instead of the
  // generic "PATIENT" tag once it's actually been asked, matching how
  // crew/bystander lines already carry a real name/role.
  //
  // `role` doubles as "whatever real name/relationship label this specific
  // speaker should carry" — a bystander's parsed relationship word (already
  // shipped) OR, for a crew-voiced line, the ACTING crew member's own real
  // name (characterBrain.js's resolveActingCrew — see the crew-reaction call
  // sites below), so two different crew members on the same call show up as
  // two different names instead of one generic "CREW" tag.
  if(speaker==="patient") return {kind:"pt",text:`${(patientName||"PATIENT").toUpperCase()}: "${text}"`};
  const label=(speaker==="crew"&&role)?role.toUpperCase()
    :(speaker==="bystander"&&role&&role!=="bystander")?role.toUpperCase()
    :speaker==="crew"?"CREW":speaker==="bystander"?"BYSTANDER":(speaker||"NARRATOR").toUpperCase();
  return {kind:"disp",text:`${label}: "${text}"`};
}
// Most browsers only allow kicking off <audio> playback from within a real
// user gesture (autoplay policy) — the very first play() call has to happen
// synchronously inside a click handler, or every later programmatic call
// from an async neural-TTS pump stays silent. Call this from the "voice on"
// button's own onClick to prime it for the rest of the session: a silent,
// muted, near-zero-length clip played (and immediately paused) inside the
// real click gesture satisfies the same-origin autoplay unlock for every
// later Audio() this session creates from useReadAloud's own async pump.
function unlockSpeech(){
  try{
    const a=new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
    a.volume=0;
    a.play().then(()=>a.pause()).catch(()=>{});
  }catch{/* ignore */}
  // SpeechSynthesis (the every-device fallback voice) needs the same
  // real-user-gesture priming on several mobile browsers -- a silent,
  // near-zero-length utterance spoken here, inside the actual click, lets
  // useReadAloud's later async calls (from the tick loop, not a click)
  // actually produce sound instead of being silently ignored.
  try{
    if(typeof window!=="undefined"&&window.speechSynthesis){
      const u=new SpeechSynthesisUtterance(" ");
      u.volume=0;
      window.speechSynthesis.speak(u);
    }
  }catch{/* ignore */}
}
// Browser SpeechSynthesis, used ONLY as a fallback when the real neural
// voice (Kokoro, via neuralTts.js) isn't available on this device -- some
// devices never finish (or never even start) downloading/compiling the WASM
// model (limited memory, a blocked/slow model CDN, no WASM at all), and this
// project's earlier "silent beats robotic" design meant those players heard
// no voice ever, with nothing telling them why. SpeechSynthesis is supported
// on effectively every browser (unlike SpeechRecognition, which Firefox
// lacks entirely), so falling back to it is what actually makes voice output
// work on EVERY device, at the cost of a robotic voice on the ones where the
// nicer neural model can't run -- degrading gracefully, not staying silent.
let _synthVoicesCache=null;
function synthVoiceFor(speakerKey){
  if(typeof window==="undefined"||!window.speechSynthesis) return null;
  if(!_synthVoicesCache||!_synthVoicesCache.length) _synthVoicesCache=window.speechSynthesis.getVoices();
  const voices=_synthVoicesCache||[];
  if(!voices.length) return null;
  let h=0; const k=speakerKey||"narrator";
  for(let i=0;i<k.length;i++) h=(h*31+k.charCodeAt(i))>>>0;
  return voices[h%voices.length];
}
function speakWithSynthFallback(text,speakerKey,volume){
  if(typeof window==="undefined"||!window.speechSynthesis) return false;
  try{
    const u=new SpeechSynthesisUtterance(text);
    const v=synthVoiceFor(speakerKey);
    if(v) u.voice=v;
    u.volume=Math.max(0,Math.min(1,volume));
    window.speechSynthesis.speak(u);
    return true;
  }catch{return false;}
}
function useReadAloud(log,voice,dispatchCue,volume=1){
  const lastLen=useRef(0);
  const queueRef=useRef([]);
  const speakingRef=useRef(false);
  const audioRef=useRef(null);
  // A pump loop is deliberately built by re-scheduling itself (setTimeout),
  // not an unbounded synchronous recursion -- see the grace-window branch
  // below, which needs to wait between attempts while the neural engine is
  // still loading.
  const pump=async()=>{
    if(speakingRef.current) return;
    const next=queueRef.current.shift();
    if(next===undefined) return;
    const st=neuralTts.status();
    if(st!=="ready"){
      // Give the neural voice a real grace window (it's the nicer voice,
      // worth a short wait) but never let a line sit forever: once it's
      // failed outright, or this particular line has already waited past
      // the window, speak it via SpeechSynthesis instead of dropping it.
      const waited=(next._waitedMs||0);
      if(st==="failed"||waited>=4000){
        speakWithSynthFallback(next.text,next.speaker,volume);
        return pump();
      }
      queueRef.current.unshift({...next,_waitedMs:waited+150});
      setTimeout(pump,150);
      return;
    }
    speakingRef.current=true;
    const finish=()=>{speakingRef.current=false; pump();};
    try{
      const blob=await neuralTts.generate(next.text,next.speaker);
      const url=URL.createObjectURL(blob);
      const a=new Audio(url);
      a.volume=Math.max(0,Math.min(1,volume));
      audioRef.current=a;
      const done=()=>{URL.revokeObjectURL(url); if(audioRef.current===a) audioRef.current=null; finish();};
      a.onended=done; a.onerror=done;
      await a.play().catch(done);
    }catch{
      // Generation itself failed for this one line (not just "not ready
      // yet") -- fall back to SpeechSynthesis rather than silently
      // dropping it, then move on.
      speakWithSynthFallback(next.text,next.speaker,volume);
      finish();
    }
  };
  const enqueue=(text,speaker)=>{if(!text) return; queueRef.current.push({text,speaker:speaker||"narrator"}); pump();};
  // Start the real (potentially large) neural-voice download the moment
  // read-aloud is turned on, so it has a head start rather than only
  // beginning on the very first spoken line.
  useEffect(()=>{if(voice) neuralTts.preload();},[voice]);
  useEffect(()=>{
    if(!voice){lastLen.current=log.length;return;}
    log.slice(lastLen.current).forEach(e=>{
      if(SPEAKABLE(e)){const clean=e.text.replace(/[\u2605\u25cf\u25b2\u26a0_#]/g,"").replace(/"/g,"").trim();
        enqueue(clean,speakerKeyFor(e));}
    });
    lastLen.current=log.length;
    // log/enqueue aren't deps: both are fresh every render (enqueue isn't
    // memoized; log's identity changes whenever it does), but this effect
    // already tracks progress itself via lastLen.current and slices from
    // there, so an extra re-run from either changing identity without
    // log.length/voice changing is a harmless no-op (empty slice).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[log.length,voice]);
  // enqueue is deliberately NOT a dependency here, unlike the effect above:
  // this one has no lastLen-style "already handled" guard, so re-firing it
  // for a reason other than dispatchCue/voice actually changing would
  // re-speak the same dispatch line every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{if(voice&&dispatchCue) enqueue(dispatchCue,"dispatch");},[dispatchCue,voice]);
  useEffect(()=>()=>{
    if(audioRef.current){audioRef.current.pause(); audioRef.current=null;}
    queueRef.current=[]; speakingRef.current=false;},[voice]);
}

// Default sim speed is 4x (matching the TIME SCALE picker's own "4×
// recommended" label), not 1x. A first-time public tester who never
// notices that picker was otherwise stuck watching real-time countdowns for
// their entire first call — approach/scene/transport waits are all real
// minutes at 1x — which is exactly the "dead time" this project's own
// Medical Simulation priorities call out to avoid. `speed` is a plain UI
// scalar multiplying the sim clock's dt (App.jsx's tick effect) — it does
// not change physiology fidelity (the engine's own substep/rollback
// machinery already handles a larger per-tick dt safely), and it's in
// CARRY, so a returning player's own choice still persists across calls;
// this only changes what a BRAND NEW save starts at. Still fully
// adjustable any time via SettingsOverlay or the TIME SCALE picker itself.
export const blank=()=>({phase:"boot",scen:null,level:null,roster:[],code:3,speed:4,scopeOff:{},scopeOverride:{},scopeLocked:0,oosUsed:{},
  t:0,onSceneAt:null,pockets:[],bags:[],stretcher:0,
  log:[],vitals:{},findings:[],evidence:[],done:{},fired:{},doses:[],given:{},crew:[],
  busy:null,cBusy:{},ivSites:[],accessTypes:{},exposed:{},shoesOff:{},pi:null,committedAt:null,transportT:0,outcome:null,
  // F44: a snapshot of outcomeReport(s) — the OBJECTIVE physiological outcome
  // (neuro outcome, ROSC/downtime, irreversible/reversible injury, troponin,
  // lethal-mechanism-treatable) — taken at the same moment g.outcome itself is
  // built, while s.phase is still "scene"/"transport" (outcomeReport()'s own
  // GUARD requires that; by the time phase reads "debrief" it's too late to
  // call fresh). See each debrief-transition site for where this is set.
  physioOutcome:null,muted:0,voice:0,
  // Real interactive IV mini-game state (uncap/angle/insert), replacing a
  // flat busy-timer dice-roll for this one procedure. {action,site,attempts}
  // while open; null otherwise. accessAttempts tracks per-call, per-site
  // miss counts so a retry after a blown vein costs a little more time each
  // time, rather than resetting free — transient, not carried across saves.
  accessMinigame:null,accessAttempts:{},
  // "Procedure Gameplay" spec 2.9 — Assisted/Standard/Advanced accessibility
  // tiers for the interactive mini-games above. Standard is a no-op (see
  // procedureAssist.js's own multiplier), so an existing save loading this
  // field for the first time behaves exactly as it always did.
  procedureAssist:"standard",
  region:"torso",tab:"assess",panel:"actions",micnOpen:0,newUnit:null,
  rolled:0,suctioned:0,bvm:0,base:0,calcium:0,flushed:0,prepped:0,leadsOn:0,leadsSecured:0,
  devices:{},defib:{energy:null,charged:0},bpMode:null,devTick:0,ecgInterp:null,autoBPAt:null,ecgTxAt:null,
  o2Psi:2000,
  vomited:0,aspirated:0,cleared:0,pushedDeeper:0,badOrder:0,refused:0,paCath:0,arrestLogged:0,
  sizedUp:0,ppe:0,injuries:[],
  mode:null,myVeh:null,sceneUnits:[],planned:{},commandLevel:0,commander:null,forcedTask:null,handoffDone:0,
  monitorBy:null,lastMon:0,occupants:[],abandoned:[],loadOpen:0,pendingPI:null,loadRiders:[],loadDriver:null,transportUnitId:null,
  // Destination choice, made at the doors before the wheels roll (see
  // data/hospitals.js). Transient, reset every new call like loadOpen —
  // not in CARRY.
  destHospitalType:null,
  allowedKinds:DEFAULT_ALLOWED,arrivalArrest:null,confirmDeath:0,department:null,allowedDepartments:DEFAULT_ALLOWED_DEPARTMENTS,
  saveId:null,saveName:"",gmode:null,career:null,customParams:null,pendingHandoffUnit:null,
  playerFirst:"John",playerLast:"Doe",playerGender:"",playerPronouns:"",
  firstStreak:0,firstVar:1,sceneRank:null,sandboxFirst:null,protocol:"national",weather:"clear",timeOfDay:"day",lastProtocol:0,settingsOpen:0,volume:1,musicVolume:1,voiceVolume:1,lastSaveAt:null,
  call911:0,call911Asked:0,candidatePool:[],policeCalled:0,alsRequested:0,bystanderDismissed:0,securedIds:[],money:0,speedBoost:1,hazardEventRolled:0,learningMode:null,
  // Upfront 2D/3D render preference, picked once at campaignRenderPref (just
  // after the zth learningMode pick) and changeable later in Settings.
  // IMPORTANT: this flag currently changes NOTHING about rendering — every
  // scene renders identically regardless of value. This project's Three.js
  // work (Coop3DWalk/Coop3DDrive) is co-op-only today; real 3D rendering for
  // solo/campaign scenes (starting with the heat-stroke incident) is
  // deferred — see CLAUDE.md's F1 queue item. This field only stores the
  // player's stated preference so that work can land later without a save
  // migration.
  prologueRenderPref:null,
  achievements:[],achievementsOpen:0,lifetimeStats:{callsRun:0,callsSurvived:0,correctImpressions:0,currentSurvivalStreak:0,bestSurvivalStreak:0,heroicActions:0,fiveStarCalls:0,perfectShifts:0},
  // F7: a one-shot queue of just-unlocked achievement ids, read by
  // AchievementToast.jsx and popped off as each one is shown. Separate from
  // g.log (whose "unlocked" lines are real, permanent history but were never
  // actually visible — see that component's header comment) and separate
  // from g.achievements (permanent unlock record, read by AchievementsOverlay).
  toastQueue:[],
  // A one-shot queue of VISIBLE, emergent clinical events — "the patient
  // vomits," "the patient begins seizing," "the patient stops responding" —
  // read by ClinicalEventAlert.jsx the same way toastQueue feeds
  // AchievementToast.jsx. Deliberately scoped to things a bystander could
  // SEE happen without equipment: real physiology crossing a threshold
  // (seizure onset, loss of responsiveness) or a scenario's own scripted
  // `events` firing at kind:"crit" (e.g. the choking scenario's vomiting
  // beat). Never used for internally-invisible events like the onset of
  // cardiac arrest itself — there is no way to SEE a rhythm change; only
  // its visible consequences (the patient going unresponsive, which IS
  // alerted) are fair game. See the tick loop's own edge-detection block
  // for exactly which physiology fields are watched.
  eventAlertQueue:[],
  // F0 — Medical Simulation dialogue system. Patient/crew/bystander lines
  // (tiers 1-3) render straight into the ordinary scene `log` (see
  // dialogueLineFor()'s own header) rather than a separate floating box —
  // an earlier version kept a dedicated `dialogueLog` array rendered by its
  // own always-on-top DialoguePanel.jsx overlay, which visually sat on top
  // of procedure/mini-game controls; removed for exactly that reason.
  // dialogueMemory is a SEPARATE, smaller bounded window
  // (src/dialogue/dialogueManager.js's own MEMORY_CAP) of just the spoken
  // TEXT, used to avoid immediately repeating a line. dialogueLastAt is the
  // sim-time (n.t, seconds) of the last unprompted line, enforcing the
  // cooldown in shouldSpeakUnprompted().
  dialogueMemory:[],dialogueLastAt:null,
  // Real, SEPARATE per-NPC "brain" memory (characterBrain.js) — keyed by a
  // stable id per character (patient/"patient", each crew member's own
  // roster id, "bystander"), each holding just the lines THAT character
  // has personally said this call. Distinct from the shared dialogueMemory
  // scrollback above. Wiped every new call by the same blank() reset that
  // already wipes dialogueMemory — Medical Simulation Mode has no reason to
  // remember an NPC's own voice past the call they were in.
  npcBrains:{},
  // F0 — treatment-response dialogue tracking (item 18's "treatment
  // response" event). Seeded once by medActs' own run() handler at the
  // moment an analgesic dose (any drug whose real, already-declared
  // fx.pain is negative — not a hardcoded id list) lands; the tick loop
  // clears it once the response window closes, whether or not pain
  // actually fell. null means no dose is currently being watched.
  _analgesiaCheckAt:null,_analgesiaBaselinePain:0,
  pendingDowntimeEvent:null,offDutyDone:0,afterDisclaimer:null,pendingGmode:null,scopeProfile:"national2019",
  // F22: patient refusal / AMA flow. amaOpen/amaStep drive the modal wizard
  // (capacity judgment -> risks -> signature); `ama` is the record left
  // behind once it completes, read by pickImpression to score the process
  // itself (capacity actually checked AND actually present) separately from
  // the scenario's own clinical resolve().
  amaOpen:0,amaStep:null,ama:null,
  // Recurring hospital staff (Medical Director + ER doctors/nurses/techs/RTs),
  // generated once per career save and carried for its whole life — see
  // fleet.js's genHospitalStaff and the "loading" phase below.
  hospitalStaff:null,receivingTeam:null,
  // Driving scene — per-call, reset every new call like the rest of the
  // live-patient state (not carried; see CARRY). driveMiniDone gates the
  // <DrivingScene> render in the response-phase screen: it shows once,
  // reports a score back via speedBoost/g.log, then stays hidden for the
  // rest of THIS call's dead-time-to-scene.
  driveMiniDone:0,
  // Real elapsed drive time at arrival (App.jsx's tick effect), used to
  // anchor the approach phase's own walk-in budget to when the drive
  // ACTUALLY finished instead of a pre-drive time estimate. null until set.
  driveArrivedAt:null,
  // Set by DrivingScene.jsx's onCrash when a major collision happens —
  // {atFault,obstacle,speed,siren}. Read once by the "crashWake" phase
  // below, then discarded on the reset back to normal play.
  crashInfo:null,
  // 3D mode: whether the "station" phase's whiteboard call-picker overlay
  // is open (false = show the walkable 3D station room instead). Reset to
  // false by every full blank()-based transition; explicitly reset at the
  // few "station" transitions that don't spread blank() (see those sites).
  stationBoardOpen:false,
  // F22 co-op (same-network first version) — see src/coop.js. null when not
  // in a co-op session; {url,room,status,peers} while connecting/connected.
  coop:null,
  // Co-op-only 3D driving/walking telemetry (DrivingScene/Coop3DWalk),
  // synced through the SAME coop.js whole-state broadcast everything else
  // uses — {drive:{carX,speed,dist,elapsed,crashes,curbHits}} written only
  // by the elected driver so passengers' scenes mirror it, and
  // {walk:{[clientId]:{x,z,yaw,name}}} written per-player so everyone sees
  // everyone else walking in. Reset per-call like driveMiniDone, not carried.
  coop3d:null,
  // Medical Education Mode only — see the "scope" phase toggle and the
  // command-hierarchy check in the tick loop.
  alwaysCommand:0,
  // Medical Education Mode only — toggle on the "cat" case-select screen.
  // When on, one recruited partner (never the pilot) is rolled a physical
  // limitation (see src/limitations.js) at the kit screen's "Roll" button,
  // blocking some of their tasks for the rest of THIS call. Persisted in
  // CARRY like alwaysCommand — it's a standing setting, not a per-call flag.
  partnerLimited:0,
  // The end-of-call diagnosis-guessing game ("Medicdle") — per-call state,
  // reset fresh every new call (NOT in CARRY). mdGuesses is the list of past
  // guesses ({text,correct}); mdSolved is the subset of ground-truth
  // condition keys already correctly guessed; mdSkipped lets a player opt
  // out and go straight to the reveal.
  mdGuesses:[],mdSolved:[],mdSkipped:0,
   transportSkipStart:null,
   transportSkipVitals:null,
   transportSkipPenalty:0,
  // Zero-To-Hero campaign — character creation (design doc §1). Appearance
  // is cosmetic flavor with no GAMEPLAY consumer (nothing outside this one
  // screen reads it for scoring/dialogue branching) — it DOES drive the
  // campaignCustomize screen's own layered portrait preview
  // (skinTone/hairStyle/hairColor/eyeColor/outfit, see playerBasePath/
  // playerOutfitLayerPath/playerHairLayerPath/playerEyesLayerPath in
  // assets.js), just nothing beyond that yet. campaignNames seeds from
  // initializeCampaignNames() once, at the campaignCustomize phase. The
  // four attributes start at 10 per the doc and are real g fields other
  // campaign/simulation content can read.
  campaignAppearance:null,campaignNames:null,reflectionStep:null,statsOpen:0,
  fitness:10,confidence:10,knowledge:10,ambition:10,
  // Player's OWN stamina (0-100, starts fresh) — distinct from crew fatigue
  // (fleet.js's genPersonStats). Campaign-only in practice (see campaign.js);
  // present for every save since a field only ever read behind a
  // learningMode==="zth" gate is still honest, not decorative.
  fatigue:0,
  // §1.4 Generalized Relationship System — see src/relationships.js. Keyed
  // by a freeform id ("partner_patrol", etc.), created on first meeting via
  // createRelationship(). romance is a hidden sub-stat: nothing in the UI
  // ever renders it, only friendship's tier label. Campaign-only in practice
  // (every relationship entry is created behind a learningMode==="zth" gate)
  // but present as {} for every save, same honesty standard as fitness/
  // confidence/knowledge/ambition/fatigue above.
  relationships:{},
  // Transient UI flag for the off-duty "call a relationship" sub-card — NOT
  // in CARRY, same footing as driveMiniDone: per-screen-instance, not a
  // standing setting.
  relCallOpen:0,
  // §1.5.2/§1.5.3 — crew-wide morale and career reputation. Distinct from
  // each roster member's OWN morale field (fleet.js), which is untouched.
  // Scoped to gmode==="career" (zth AND plain Career, unlike
  // fitness/confidence/knowledge/ambition/fatigue above, which stay
  // zth-only) — see campaign.js's clampMorale/clampReputation. Both starting
  // values (50, 0) are their own formulas' neutral points, so a Sandbox/MOS
  // save that never touches them sees no behavior change.
  morale:50,reputation:0,
  // §2.4 — "yes"/"no"/null. The one branching choice in the laptop scene;
  // drives which of the two mutually-exclusive flavor achievements
  // (ems_wannabe/not_so_ems) unlocks. Kept in CARRY since it's part of the
  // character's own history for the life of the save, same footing as
  // campaignAppearance.
  campaignEmsInterest:null,
  // §2.5 — moved the heat-stroke patient to shade or not (read from the
  // REAL patient.inShade field the moment PATROL takes over — see the tick
  // loop's tutorialHeatStrokeActive branch), read by the aftermath scene's
  // dialogue.
  heatStrokeMovedToShade:null,
  // §2.5, full reuse of the real approach/scene screens: true only while
  // the campaign's heat-stroke call is live. Lets call911Now (and the
  // in-scene "Call 911" general action) know to summon Northwood PATROL on
  // a scripted one-minute ETA instead of a real dispatch, and lets the tick
  // loop know to end the scene into campaignHeatStrokeAftermath once that
  // minute is up, rather than letting it run through to transport/debrief
  // like an ordinary heatStroke call elsewhere in the game. NOT in CARRY —
  // set true only for the duration of this one scene, cleared the instant
  // it ends.
  tutorialHeatStrokeActive:0,
  tutorialHeatStroke911At:null,
  // Set once, at the moment begin() drops the player into the scene (the
  // scene's own "t=0" baseline) — s.t itself is a continuous whole-session
  // clock, never reset per-call, so hesitation has to be measured as a
  // DELTA against this baseline, not against tutorialHeatStroke911At alone.
  // Not in CARRY, same reasoning as tutorialHeatStrokeActive above — only
  // needed for the duration of this one scene.
  tutorialHeatStrokeStartAt:null,
  // Derived once, at the tick loop's own tutorialHeatStrokeActive transition
  // below, from tutorialHeatStroke911At-tutorialHeatStrokeStartAt — IS in
  // CARRY (same footing as heatStrokeMovedToShade) since it's read by
  // campaignHeatStrokeAftermath's dialogue, one phase past where the
  // transient timestamps above stop mattering.
  heatStrokeHesitated:null,
  // §2.5's second responder — a single-scene-only speaking role, drawn once
  // at the moment the aftermath scene begins (not persisted as a
  // relationship — none of §1.4.4's reserved ids fit a one-scene role).
  // Transient, not in CARRY: it's dead flavor text once that scene ends.
  campaignSecondRespName:null,
  // Limited-items / supply-logistics system (src/data/loadout.js). Career
  // is always limited (both zth and mos); Sandbox opts in via
  // limitedItems. loadoutSelection is the player's chosen {carried,truck}
  // quantities for the CURRENT shift (Career) or game/5-call window
  // (Sandbox) — null means "not configured yet," which forces the loadout
  // page open at the next "kit" phase entry (see withLoadoutRefresh).
  // supplyStock/truckReserve are the live remaining counts, decremented as
  // items are used; both are reset to loadoutSelection's numbers by the
  // "Decontaminate & Restock" debrief action (Career) or automatically
  // every 5 calls (Sandbox). restockedThisCall is transient (NOT in
  // CARRY) — cleared every new call, set true once restock has run this
  // call, read at the "Next call"/"Finish shift" handler to decide whether
  // skipping it costs reputation. callsSinceLoadoutRefresh only moves in
  // Sandbox; Career refreshes are shift-boundary events, not a counter.
  limitedItems:0,
  loadoutSelection:null,supplyStock:null,truckReserve:null,
  restockedThisCall:0,stockoutThisCall:0,callsSinceLoadoutRefresh:0,loadoutReturnPhase:null,loadoutDraft:null,
  // F30 follow-up: how many CONSECUTIVE calls in a row have gone out short
  // (skipped restock, actually depleted) — the flat -2 reputation penalty
  // already existed; this is the "your rig has a reputation for showing up
  // unprepared" escalation CLAUDE.md's own F30 entry flagged as a natural
  // next step. Reset to 0 the instant a real restock happens
  // (restockLoadout, below); IS in CARRY — it has to survive across calls
  // to mean "consecutive," unlike restockedThisCall/stockoutThisCall which
  // are deliberately per-call.
  skippedRestockStreak:0,
  // Scene 6 (§2.7) — which of the tutorial shift's two scripted station
  // interludes (idx 1, between benignFaint and od; idx 2, between od and
  // seizure) have been dismissed on THIS visit to the station. Deliberately
  // not in CARRY: it resets every new call, which is correct here since
  // g.career.idx always moves forward too, so a stale idx key never matters.
  tutorialInterludeSeen:{},
  // F31 — has the player clicked through the campaignLaptop ParamedicStories
  // video yet? Gates the achievement/Yes-No-EMS choice behind actually
  // watching it one line at a time, per the "one click is one line" request.
  // Transient: this is a one-time early scene with no way back into it once
  // g.campaignEmsInterest is set, so it never needs to survive past here.
  laptopVideoDone:0,laptopIntroDone:0,
  // ─── Chapter 1 — Boots on the Ground ─────────────────────────────────────
  // arrivalPromptSeen gates the debut vs recurring arrival-time prompt text
  // (campaignArrivalPrompt phase) — false until the player's first
  // post-tutorial shift, true forever after. ch1Done is the real gate on
  // whether Chapter 1's own 3-call shift/EMR-push content still needs to
  // run; STARTING_MONEY (250, campaign.js) is seeded once, at the same
  // moment, rather than baked into blank()'s own money:0 default, since
  // every non-campaign save must still start at 0. ch1BetweenPicks tracks
  // which between-call station actions have been used THIS interlude
  // (reset each time a new one starts), same idiom as the Prologue's own
  // interlude1Picks.
  arrivalPromptSeen:false,ch1Done:0,ch1MoneySeeded:0,ch1BetweenPicks:[],ch1EmrPushChoice:null,
  // campaignCh1SupervisorTalk (new phase, inserted before the existing
  // Partner Talk/campaignCh1End) — flavor-only tracking flags, matching the
  // un-carried ch1EmrPushChoice convention: set and read within one
  // uninterrupted VN sequence, no offDuty pick() in between, so neither
  // needs to survive a shift boundary or join CARRY.
  ch1EmrSponsorshipDiscussed:0,ch1SponsorshipAccepted:0,
  // Chapter 1 station-life additions: a real shift counter (feeds
  // patrolShiftRoster's rotation, added to CARRY — survives every shift
  // boundary for the life of the save) plus the "talk to whoever's here"/
  // background-dispatch state, all of which is meant to reset fresh every
  // shift and so is deliberately NOT in CARRY (campaignArrivalPrompt's
  // choose() and campaignCh1Gearup's begin() both explicitly reset
  // ch1BgUnits/ch1BgVignetteShownThisShift/lastBgDispatchAt at shift start,
  // same as this default).
  ch1ShiftIdx:0,
  ch1StationTalkTarget:null,ch1StationTalkedThisShift:{},ch1StationTalkInterrupt:null,
  ch1BgUnits:{},lastBgDispatchAt:0,ch1BgVignetteShownThisShift:false,
  // The interactive first-call tutorial (TutorialCoachmark.jsx). Active/step
  // are transient scene-local UI state, not carried — a mid-tutorial reload
  // simply re-triggers it (the trigger effect's own guard, !ch1TutorialDone,
  // is what actually matters and IS carried, see CARRY above, so it can
  // never replay once finished or skipped).
  ch1TutorialActive:false,ch1TutorialStep:0,ch1TutorialDone:0,
  // "Step out and see who's around" (both station interludes) — see the
  // interludeIdx comment above for how this reuses the plain station
  // screen's roster instead of duplicating it. Transient, not carried.
  ch1InterludeStepOut:false,
  // ─── General: every scenario's patient gets a random name ─────────────────
  // Freshly overwritten every single call at the kit→response transition
  // (App.jsx's "kit" phase button handler) — never needs an explicit reset,
  // never joins CARRY. Revealed to the player only via the "Ask for ID"
  // general action, not shown by default (see that action's own comment).
  patientName:null,
  // Set by the "Ask for ID" action's default (non-overridden) awake branch —
  // gates dialogueLineFor's patient-speaker label switching from the
  // generic "PATIENT" tag to the patient's own confirmed name. Freshly
  // reset every call the same way patientName itself is, never joins CARRY.
  idKnown:0,
  // ─── General: the recurring "frequent flyer" patient (any Career shift,
  // any save) ──────────────────────────────────────────────────────────────
  // frequentFlyerName/frequentFlyerGender: drawn once ever per save, the
  // first time campaign.js's pickFrequentFlyerScenario() is rolled — added
  // to CARRY (below) so the identity survives every shift boundary for the
  // life of the save. frequentFlyerEncounters: lifetime count of calls this
  // save has had with them, also in CARRY — read by
  // campaign.js's frequentFlyerOdChance() to scale the opioid-overdose
  // escalation.
  frequentFlyerName:null,frequentFlyerGender:null,frequentFlyerEncounters:0,
  // ─── Chapter 2 — EMR School: "The First Step" (§1.6.3) ───────────────────
  // emrExamAttempts is declared further below (Ch.4's own section — it was
  // added there first, defensively, before this chapter existed; reused
  // as-is here, not redeclared, since Ch.4's two_for_two achievement already
  // reads this exact field). emrCertified is the real gate (parallels
  // emtCertified/aemtCertified/paramedicCertified). ch2ExamFieldScore etc.
  // are the most recent attempt's result, re-rolled fresh on every retake,
  // same shape every other tier's exam state uses. ch2Done gates whether
  // Ch.2's own content still needs to run.
  ch2ExamFieldScore:null,ch2ExamWrittenCorrect:null,ch2ExamWrittenTotal:null,
  ch2ExamCombinedScore:null,ch2ExamOutcome:null,emrCertified:false,ch2Done:0,
  ch2ClassmateTalked:0,ch2ClassmateChoice:null,ch2DepartureChoice:null,
  // ─── Chapter 3 — Fork in the Road: PATROL or Volunteer Fire (§1.6.4) ─────
  // chapter3Path is declared further below (Ch.5's own section, same
  // defensive-declaration precedent as emrExamAttempts above) — reused
  // as-is, not redeclared. ch3ForkChoice records the SUPERVISOR conversation
  // itself (which of the three dialogue options was picked, "patrol"|
  // "fire"|"info" — distinct from chapter3Path, which is the actual
  // resolved path taken and is what every later chapter's formulas read).
  ch3ForkChoice:null,ch3Done:0,

  // Real money: STARTING_MONEY (250) is Chapter 1's own seed value — not
  // applied to blank()'s own `money:0` default above, since Ch.1-3 are being
  // built in a separate batch and own that seeding moment; Ch.4 just reads/
  // spends whatever g.money already is. g.debt (§1.6.2.1's no-interest loan
  // balance) is new here — nothing before Ch.4 could ever produce debt, since
  // EMR tuition is always $0.
  debt:0,
  // §1.6.12: has the funding-cut incident already fired ANYWHERE (Ch.2/3/4
  // share one roll — see campaign.js's FUNDING_CUT_CHANCE), and how it
  // resolved ("partTime"|"dropOut"|"balancedSuccess") — read by Ch.5's own
  // connective text per §1.6.12's Ch.4->Ch.5 callback. fundingCutBalanceFailed
  // is a separate flag (the `stretched_thin` achievement's own condition):
  // the "balance both" option can be ATTEMPTED and fail before the player
  // still ends up at "partTime" or "dropOut" via the forced follow-up, so
  // resolution alone can't distinguish "chose it directly" from "ended up
  // there after stretching too thin first" — both real, both worth tracking.
  // fundingCutStage is the incident scene's own transient sub-state, not
  // carried (the whole incident resolves in one sitting, before any call
  // runs).
  fundingCutFired:false,fundingCutResolution:null,fundingCutBalanceFailed:false,fundingCutStage:null,
  // Chapter 4's own scene-local transient flags — gate a VNDialogue intro
  // from the interactive choice/result view that follows it, same idiom
  // campaignTutorialFinale's own tutorialFinaleTalked/tutorialFinaleEpilogue
  // already use. Not in CARRY: each resolves within its own single sitting.
  ch4Day1TuitionShown:0,ch4ClassmateTalked:0,ch4ClassmateChoice:null,ch4PracticeEdChoice:null,
  // Declared defensively for the SAME reason Ch.5's own chapter3Path is
  // (see the comment just below this block) — Ch.4's own `two_for_two`
  // achievement wants to know whether the EMR exam was ever retaken, but
  // Chapter 2 (EMR school) doesn't exist yet as of this batch. 0 (never
  // retaken) is the only honest default until Ch.2 starts writing real data.
  emrExamAttempts:0,
  // Chapter 4's own EMT-certification exam state — same shape as Ch.5's
  // ch5ExamAttempts911/Fire and the same shared roll placeholders
  // (rollExamFieldScore/rollWrittenQuiz, campaign.js) Ch.6/8 also use.
  // ch4ExamAttempts escalates examFailurePenalty on a repeat failure;
  // ch4ExamFieldScore/ch4ExamWrittenCorrect/ch4ExamWrittenTotal/
  // ch4ExamCombinedScore/ch4ExamOutcome are the most recent attempt's result,
  // re-rolled fresh on every retake. emtCertified is the real gate (Ch.5
  // doesn't check it structurally today, but achievements.js's `the_patch`
  // does, and it's the honest record of whether this chapter resolved).
  ch4ExamAttempts:0,ch4ExamFieldScore:null,ch4ExamWrittenCorrect:null,ch4ExamWrittenTotal:null,
  ch4ExamCombinedScore:null,ch4ExamOutcome:null,emtCertified:false,
  // ─── Chapter 5 — Employment (§1.6.6) ─────────────────────────────────────
  // g.chapter3Path ("patrol"|"fire") is Chapter 3's own field (design doc
  // §1.6.4) — declared here defensively since Chapter 5 reads it and
  // Chapters 1-4 are still being built in a separate batch; null (neither
  // fork resolved yet) degrades safely to "no fire-track option shown."
  chapter3Path:null,
  // Five separate counters, deliberately not collapsed into one "calls"
  // number — see design doc §1.6.6's own "job-call counters, named
  // precisely" note. emrCalls/aemtCalls are read by Ch.5's own hire
  // formulas but are actually populated by Chapters 1-3 and 6-7
  // respectively; declared here so the formulas have a real (if zero)
  // input before those chapters land.
  emrCalls:0,iftCalls:0,eventCalls:0,calls911:0,aemtCalls:0,
  // Which employer(s) the player currently works — an array so the IFT+
  // Event combine case (§1.6.6, achievement `moonlighter`) has somewhere to
  // live; every other combination is exclusive (see campaign.js's
  // canCombineEmployers). Values are CH5_EMPLOYERS keys: "ift"|"event"|
  // "county911"|"fire911".
  jobs:[],
  // Chapter 5's own local flow state — which entrance-exam track is
  // currently being attempted ("911"|"fire"), attempt counters (feed
  // examFailurePenalty-style escalation and the `probie_no_more`
  // first-attempt achievement), the most recent roll/outcome, and whether
  // Ch.5 has been resolved at least once (a real job secured).
  ch5ExamTrack:null,ch5ExamAttempts911:0,ch5ExamAttemptsFire:0,
  ch5EntranceScore:null,ch5EntranceOutcome:null,ch5Done:0,
  ch5FirstIftShift:0,ch5FirstEventShift:0,ch5Hired911:0,ch5SwitchedPaths:0,
  // ─── Chapter 6 — AEMT School (§1.6.7, optional per §1.6.8.1) ─────────────
  // Reached from campaignCh5End once at least one job is secured. Skippable:
  // a player can decline AEMT (ch6SkippedAemt) and apply straight to
  // paramedic school later at worse odds (§1.6.8.1) — either path sets
  // ch6Done so the shiftSummary re-entry button (below) stops offering it
  // and Ch.7 knows this chapter has resolved one way or the other.
  ch6Done:0,ch6SkippedAemt:0,
  // Same exam-state shape as Ch.4's ch4Exam* fields (same shared
  // rollExamFieldScore/rollWrittenQuiz placeholders, campaign.js) —
  // ch6ExamAttempts escalates examFailurePenalty on a repeat failure;
  // the rest are the most recent attempt's result, re-rolled fresh on
  // every retake. aemtCertified is the real gate (Ch.7's own entry-state
  // assumption reads this, same footing as Ch.5's use of emtCertified).
  ch6ExamAttempts:0,ch6ExamFieldScore:null,ch6ExamWrittenCorrect:null,ch6ExamWrittenTotal:null,
  ch6ExamCombinedScore:null,ch6ExamOutcome:null,aemtCertified:false,
  // The repeatable shift-vs-class scheduling-conflict beat (§1.6.7's own
  // "worth adding" note) — which of AEMT_SCHEDULE_CONFLICT_ROUNDS the
  // player is on. Not carried: resolves in one sitting, same footing as
  // Ch.4's fundingCutStage.
  ch6ConflictRound:0,
  // The enrollment money sub-flow's own local state (scholarship offered?
  // accepted?) — resolves in one sitting before any class beat plays, same
  // footing as ch6ConflictRound just above.
  ch6EnrollScholarshipStep:null,
  // g.serviceCommitment ({employer,monthsRemaining,totalMonths,
  // tuitionCovered}, §1.6.2.1) is declared further below alongside the
  // other career-long money fields (everCarriedDebt/acceptedScholarship) —
  // Ch.6 is its first real WRITER (the AEMT-tier scholarship accept, see
  // campaignCh6Enroll), not its declaration site.
  // ─── Chapter 7 — AEMT: New Responsibilities (§1.6.8.3's advocate draw) ──
  // This batch (built backwards from Ch.10, per operator instruction) picks
  // up from wherever Ch.6 (AEMT school, built separately) leaves off — see
  // the campaignCh7Intro banner comment below for the exact entry-state
  // assumption. paramedicAdvocate is the ONE random draw made once per
  // campaign (§1.6.8.3): {role,relationshipId,name,gender} or null before
  // Ch.7's reveal scene has run.
  paramedicAdvocate:null,ch7Done:0,
  // ─── Chapter 8 — Paramedic School (§1.6.8) ───────────────────────────────
  // paramedicApplicationAttempts escalates examFailurePenalty-style on a
  // rejected/conditional admission roll, same idiom as ch5ExamAttempts911.
  // paramedicAdmittedWithoutAemt is straight_to_medic's own honest condition
  // (§1.6.8.1), captured at the moment admission actually resolves rather
  // than re-derived later from g.level (which will read "aemt" by Ch.9
  // regardless of the path taken to get there).
  paramedicApplicationAttempts:0,ch8EntranceExamScore:null,ch8AdmissionChance:null,
  paramedicAdmitted:0,paramedicAdmittedWithoutAemt:0,
  // The three rotation-adjacent beats, compacted into one indexed loop
  // (campaign.js's CH8_ROTATIONS) rather than five bespoke scenes — see
  // that file's own comment. ch8IntubationCount feeds tubes_and_tubes;
  // ch8InternshipRepeated (not ch8InternshipClean, which would need a
  // separate "still true" flag) is what preceptor_approved's clean-capstone
  // check actually reads.
  ch8RotationIdx:0,ch8IntubationCount:0,ch8IntubationAttempts:0,ch8InternshipRepeated:0,ch8InternshipActive:0,ch8InternshipDone:0,
  paramedicFinalExamAttempts:0,paramedicCertified:0,
  ch8FinalExamFieldScore:null,ch8FinalExamWrittenCorrect:null,ch8FinalExamWrittenTotal:null,
  ch8FinalExamCombinedScore:null,ch8FinalExamOutcome:null,
  // §1.6.8.2 optional certifications (ACLS/PALS) — a plain array (JSON/
  // localStorage-safe), wrapped in `new Set(...)` at the two formula call
  // sites (campaign.js's optionalCertScore/paramedicAdmissionChance) that
  // want Set semantics, per that file's own documented input shape.
  certifications:[],
  // ─── Chapter 9 — Paramedic: The Real Deal (open world, no forced ending) ─
  ch9MentorCount:0,ch9Reached:0,
  // ─── §1.6.2.2 Off-duty housing/lifestyle — no chapter owns this outright;
  // surfaced from Ch.9's hub once the player has real paramedic income.
  // g.mortgage uses the SAME recurringDeduction() shape as g.debt (10% vs
  // 15% — campaign.js) rather than a second implementation.
  housingTier:"dorm",mortgage:0,hasVehicle:0,hasPet:0,hasHomeGym:0,hasStudyDesk:0,
  // ─── Chapter 10 — Advanced Roles (§10.1) ─────────────────────────────────
  advancedRole:null,ch10Done:0,
  // ─── §1.6.2.1 money fields shared across whichever tuition-gate chapter
  // reaches them first — declared here for Ch.8's own paramedic-tuition
  // scholarship/loan gate; reused as-is (not redeclared) if an earlier
  // chapter's AEMT-tier tuition gate lands first, since these are the same
  // fields either way, not a second implementation.
  everCarriedDebt:false,acceptedScholarship:false,serviceCommitment:null,
  // Snapshot of g.lifetimeStats.callsRun at the moment Paramedic certifies —
  // `still_here`'s own "50 calls post-certification" reads the DIFFERENCE
  // against this, checked at Ch.9's hub rather than on every call
  // (creditOutcome, the shared per-call credit site, is out of scope for
  // this batch to touch — see the Ch.9 hub's own comment for why).
  paramedicCertCallsSnapshot:0});
// Fields carried across a "new call, same shift" reset — everything about
// who you are and which save you're in, but none of the live-patient state.
const CARRY=["level","roster","scopeOff","scopeOverride","scopeLocked","speed","muted","voice","mode","myVeh","department","allowedDepartments",
  "saveId","saveName","gmode","career","allowedKinds","candidatePool","hospitalStaff",
  "firstStreak","firstVar","protocol","scopeProfile","weather","timeOfDay","volume","musicVolume","voiceVolume","alwaysCommand","partnerLimited","voiceCommandsEnabled",
  "playerFirst","playerLast","playerGender","playerPronouns","money","learningMode","achievements","lifetimeStats",
  "campaignAppearance","campaignNames","fitness","confidence","knowledge","ambition","fatigue","relationships","morale","reputation",
  // prologueRenderPref is on the same footing as campaignEmsInterest just
  // below — a persistent, one-time-but-revisable fact about the character/
  // session that must survive a reset, not per-call transient state.
  "campaignEmsInterest","prologueRenderPref","heatStrokeMovedToShade","heatStrokeHesitated",
  "arrivalPromptSeen","ch1Done","ch1MoneySeeded","ch1ShiftIdx","ch1TutorialDone",
  "frequentFlyerName","frequentFlyerGender","frequentFlyerEncounters",
  "emrCertified","ch2Done","ch3ForkChoice","ch3Done",
  "limitedItems","loadoutSelection","supplyStock","truckReserve","callsSinceLoadoutRefresh","skippedRestockStreak",
  "chapter3Path","emrCalls","iftCalls","eventCalls","calls911","aemtCalls","jobs",
  "ch5ExamAttempts911","ch5ExamAttemptsFire","ch5Done",
  "ch5FirstIftShift","ch5FirstEventShift","ch5Hired911","ch5SwitchedPaths",
  "debt","fundingCutFired","fundingCutResolution","emrExamAttempts","ch4ExamAttempts","emtCertified",
  "ch6Done","ch6SkippedAemt","ch6ExamAttempts","aemtCertified",
  "paramedicAdvocate","ch7Done",
  "paramedicApplicationAttempts","paramedicAdmitted","paramedicAdmittedWithoutAemt",
  "ch8RotationIdx","ch8IntubationCount","ch8InternshipRepeated","ch8InternshipActive","ch8InternshipDone","paramedicFinalExamAttempts","paramedicCertified","certifications",
  "ch9MentorCount","ch9Reached","housingTier","mortgage","hasVehicle","hasPet","hasHomeGym","hasStudyDesk",
  "advancedRole","ch10Done",
  "everCarriedDebt","acceptedScholarship","serviceCommitment","paramedicCertCallsSnapshot"];

// Limited-items system — pure helpers, all taking an explicit state object
// so they work equally inside setG(s=>...) transition callbacks and inside
// the component body. Career (zth or mos) is always limited; Sandbox opts
// in via the "Limited Items" toggle on its scope-customization screen.
const limitedItemsActive=(s)=>s.gmode==="career"||(s.gmode==="sandbox"&&!!s.limitedItems);
// Which stock item (if any) a given player action consumes one unit of.
// Drug actions carry the drug id in `a.drug` (medActs); the curated
// consumable procedures are keyed by `a.id` directly (procActs/PROC_ACTS).
const stockIdOfAction=(a)=>a?.drug&&CONSUMES_STOCK.has(a.drug)?a.drug:(a?.id&&CONSUMES_STOCK.has(a.id)?a.id:null);
// Same lookup from a bare action id — used at the busy-timer completion
// site (tick loop), which only has `busy.id` (== a.id for both drug and
// proc actions — medActs never prefixes the drug id) to work with.
const stockIdForId=(id)=>CONSUMES_STOCK.has(id)?id:null;
// Decrement one unit of an item's CARRIED stock, floored at 0. Mutates the
// draft state object in place, matching this file's own convention (see
// `apply()` above) rather than returning a copy.
const consumeStock=(s,itemId)=>{if(!itemId||!s.supplyStock)return;
  s.supplyStock={...s.supplyStock,[itemId]:Math.max(0,(s.supplyStock[itemId]??0)-1)};
  if((s.supplyStock[itemId]??0)<=0) s.stockoutThisCall=1;};
// Fully refills both pools from the current loadoutSelection — the
// "Decontaminate & Restock" debrief action, and the Sandbox 5-call
// auto-refresh, both funnel through this. The station (and, for Sandbox,
// this automatic refresh) is the "functionally unlimited" resupply point;
// only the vehicle's own carried/truck quantities are ever limited.
const restockLoadout=(s)=>{if(!s.loadoutSelection)return s;
  return {...s,supplyStock:{...s.loadoutSelection.carried},truckReserve:{...s.loadoutSelection.truck},
    restockedThisCall:1,stockoutThisCall:0,skippedRestockStreak:0};};
// Called at every "enter the kit phase for a new call" transition (5 call
// sites — getCall/takeCall/the two sandbox pickers/buildCustomScenario's
// picker). First entry this shift/game seeds defaults and forces the
// loadout page open (loadoutSelection stays null until the player actually
// configures it — see the "kit" phase render). Sandbox additionally
// auto-refreshes every 5 completed calls, silently, matching "the station
// is unlimited" — Career's equivalent refresh is the explicit restock
// action, not automatic, since CLAUDE.md's own ask is that skipping it
// should carry a real risk.
// Scene 6 (§2.7) — the deterministic 3-call tutorial queue campaignIntro
// seeds (benignFaint, od, seizure). Used to (a) suppress the ordinary random
// downtime-event roll during these three calls, since the tutorial's own two
// scripted station interludes take that slot instead, and (b) gate those two
// interludes so they only ever appear for this exact queue, never a later
// zth shift that happens to draw the same three scenarios by chance.
const isTutorialShift=(s)=>s.learningMode==="zth"&&s.career&&s.career.queue.length===3&&
  s.career.queue[0]==="benignFaint"&&s.career.queue[1]==="od"&&s.career.queue[2]==="seizure";
const withLoadoutRefresh=(s)=>{if(!limitedItemsActive(s))return s;
  // F32: scope-gate the default loadout — a Layperson's rig doesn't start
  // pre-packed with paramedic-only drugs. Module-level, so it recomputes L
  // the same way App()'s own `L` does (g.level -> LEVELS[...].n) rather than
  // threading the component's L through every setG(s=>...) call site.
  const Ls=s.level?LEVELS[s.level].n:0;
  if(!s.loadoutSelection){const def=defaultLoadout(Ls);
    return {...s,loadoutSelection:def,supplyStock:{...def.carried},truckReserve:{...def.truck},callsSinceLoadoutRefresh:0};}
  if(s.gmode==="sandbox"&&(s.callsSinceLoadoutRefresh||0)>=5)
    return {...restockLoadout(s),callsSinceLoadoutRefresh:0,restockedThisCall:0};
  return s;};

// F4: career economy — a shift's per-call payout. Rural calls pay less (long
// roads, thin coverage, the same reason real rural EMS reimbursement runs
// behind urban systems); a correct impression earns a small bonus, a death
// costs a little (the call still had to be run, but a bad outcome is not
// rewarded like a good one). Numbers are a starting skeleton — tunable, not
// derived from any real reimbursement schedule.
// DRUG_CATEGORIES/PROC_CATEGORIES/drugCategoryOf/procCategoryOf now live in
// data/categories.js — shared with components/ScopeEditor.jsx, which can't
// import them from here without a circular import (App.jsx -> SettingsOverlay
// -> ScopeEditor -> App.jsx).
// F5: body-system grouping for the Sandbox "pick a specific case" list —
// pairs with the target condition-library categories in CLAUDE.md section 8.
// Keyed by scenario key (not condition id), since a couple of scenarios that
// share a condition (fall/bikeVsCar both use polytraumaFall) are still both
// trauma; this is a display grouping, not a physiology distinction.
// Full sweep (previous session): only ~30 of the 124 scenarios were mapped
// here — everything else (the whole CARD-028..047 cardiac batch, all 14
// Endocrine/Metabolic scenarios, most of the Neurologic/Respiratory/Pediatric
// libraries) silently fell through bodySystemOf's "Other" fallback below.
// Filled in for real against each scenario's own `id:` prefix (CARD-/RESP-/
// NEUR-/ENDO-/TRMA-/PEDS-/OBGY-/ABD-/ALLERGY-/CHOKE-/HEAT-/SHOCK-/PE-/SYNC-),
// with the id used as a strong signal, not gospel — a few scenarios are
// classified by clinical content over id prefix, same as `resp` (RESP-007,
// but CHF/pulmonary edema is cardiac in origin) already was: `childbirth` is
// filed under Obstetric/Gynecologic despite a TRMA-adjacent mechanism (struck
// pedestrian) because the emergency itself is the delivery, and any scenario
// whose title names a Child/Infant/Toddler stays "Pediatric" regardless of
// the underlying organ system, matching the precedent `drowning` (a
// fundamentally respiratory/asphyxial event) already set by being filed
// there instead of under Respiratory.
//
// Two new sections added (order/PINS below, both updated to match):
// "Endocrine / Metabolic" (14 scenarios — previously ALL invisible in
// "Other") and "Environmental" (currently just `heatStroke`, but a real,
// distinct mechanism-of-injury category the same way Trauma/Toxicology
// already aren't literal organ systems either).
const SCEN_BODY_SYSTEM={
  // --- Cardiac ---
  chest:"Cardiac",ami:"Cardiac",cardiogenicShock:"Cardiac",takotsubo:"Cardiac",svt:"Cardiac",
  chestPainM:"Cardiac",chestPainF:"Cardiac",acs:"Cardiac",stableAngina:"Cardiac",unstableAngina:"Cardiac",nstemi:"Cardiac",
  resp:"Cardiac",   // CHF / pulmonary edema — cardiac etiology, respiratory presentation
  acquiredLongQT:"Cardiac",thirdDegreeAVBlock:"Cardiac",firstDegreeAVBlock:"Cardiac",atrialFibrillationRVR:"Cardiac",
  pericardialTamponade:"Cardiac",symptomaticBradycardia:"Cardiac",atrialFlutter:"Cardiac",
  secondDegreeAVBlockTypeI:"Cardiac",secondDegreeAVBlockTypeII:"Cardiac",monomorphicVT:"Cardiac",wpwAfib:"Cardiac",
  digoxinToxicity:"Cardiac",pericarditis:"Cardiac",myocarditis:"Cardiac",hypertensiveUrgency:"Cardiac",
  hypertensiveEmergency:"Cardiac",prematureVentricularContractions:"Cardiac",prematureAtrialContractions:"Cardiac",
  sickSinusSyndrome:"Cardiac",electricalStorm:"Cardiac",aicdMalfunction:"Cardiac",
  mitralStenosis:"Cardiac",
  // --- Respiratory ---
  pe:"Respiratory",fbao:"Respiratory",choking40:"Respiratory",asthmaAttack:"Respiratory",respArrest:"Respiratory",
  spontaneousPneumothorax:"Respiratory",pleuralEffusionCall:"Respiratory",ardsTransfer:"Respiratory",
  aspirationPneumonitis:"Respiratory",acuteBronchitis:"Respiratory",influenzaPneumonia:"Respiratory",
  covidPneumonia:"Respiratory",cysticFibrosisExacerbation:"Respiratory",tuberculosisHemoptysis:"Respiratory",
  copdExacerbationCall:"Respiratory",toxicInhalationChlorine:"Respiratory",
  // upperRespiratoryInfection carries a MISC- id (it predates a dedicated
  // Respiratory backlog entry — see CLAUDE.md section 8), but the content is
  // plainly respiratory.
  upperRespiratoryInfection:"Respiratory",
  // --- Trauma ---
  crush:"Trauma",fall:"Trauma",motorcycle:"Trauma",bikeVsCar:"Trauma",abdGSW:"Trauma",stabChest:"Trauma",
  mciPileup:"Trauma",unsafeSceneAssault:"Trauma",stabbingPair:"Trauma",minorSprain:"Trauma",
  openPneumothorax:"Trauma",hemothorax:"Trauma",neurogenicShock:"Trauma",
  // --- Toxicology ---
  od:"Toxicology",frequentFlyerIntoxicated:"Toxicology",frequentFlyerCannabis:"Toxicology",
  // rocuroniumOverdose (queue item 40's first shipped drug) was never added
  // here when it shipped — a real, previously-undiscovered gap, found and
  // fixed while wiring this batch's own two new overdose scenarios into
  // the same category.
  rocuroniumOverdose:"Toxicology",diltiazemOverdose:"Toxicology",metoprololOverdose:"Toxicology",atropineOverdose:"Toxicology",
  carbonMonoxidePoisoning:"Toxicology",lidocaineOverdose:"Toxicology",tricyclicOverdose:"Toxicology",
  cyanidePoisoning:"Toxicology",cocaineToxicity:"Toxicology",
  methemoglobinemia:"Toxicology",
  lithiumToxicity:"Toxicology",ironOverdose:"Toxicology",hydrocarbonAspiration:"Toxicology",serotoninSyndrome:"Toxicology",neurolepticMalignantSyndrome:"Toxicology",
  // Malaria (queue item 7, Infectious-disease backlog) is the first
  // scenario needing this category — a genuinely new bucket, not a
  // reuse of an existing one, since no prior scenario in this map has
  // been Infectious-disease-primary.
  malaria:"Infectious Disease",
  boxJellyfishSting:"Toxicology",
  // --- Allergy / Immune ---
  anaph:"Allergy / Immune",allergicReactionModerateCall:"Allergy / Immune",
  // --- Obstetric / Gynecologic ---
  childbirth:"Obstetric / Gynecologic",severePreeclampsia:"Obstetric / Gynecologic",pph:"Obstetric / Gynecologic",
  ectopicPregnancyRuptured:"Obstetric / Gynecologic",placentalAbruption:"Obstetric / Gynecologic",
  placentaPrevia:"Obstetric / Gynecologic",ovarianTorsion:"Obstetric / Gynecologic",
  rupturedOvarianCyst:"Obstetric / Gynecologic",
  // --- Pediatric --- (population-based grouping — see comment above)
  drowning:"Pediatric",bronchiolitisInfant:"Pediatric",pertussisInfant:"Pediatric",croupToddler:"Pediatric",
  epiglottitisChild:"Pediatric",febrileSeizureToddler:"Pediatric",absenceSeizureChild:"Pediatric",
  // --- Gastrointestinal ---
  abdPain:"Gastrointestinal",esophagealVaricesBleed:"Gastrointestinal",
  acuteMesentericIschemia:"Gastrointestinal",acuteCholecystitis:"Gastrointestinal",
  lowerGIBleed:"Gastrointestinal",upperGIBleed:"Gastrointestinal",
  acutePancreatitis:"Gastrointestinal",bowelObstruction:"Gastrointestinal",
  // --- Neurologic ---
  seizure:"Neurologic",seizureCombative:"Neurologic",benignFaint:"Neurologic",maskedBleed:"Neurologic",
  activeSeizureGTC:"Neurologic",statusEpilepticus:"Neurologic",simplePartialSeizure:"Neurologic",
  complexPartialSeizure:"Neurologic",migraineHeadache:"Neurologic",clusterHeadacheAttack:"Neurologic",
  tensionHeadacheCall:"Neurologic",trigeminalNeuralgiaAttack:"Neurologic",peripheralVertigoAttack:"Neurologic",
  centralVertigoStroke:"Neurologic",guillainBarreProgressive:"Neurologic",myastheniaGravisCrisisCall:"Neurologic",
  bellsPalsyOnset:"Neurologic",meningitisFeverNeck:"Neurologic",encephalitisConfused:"Neurologic",
  toxicMetabolicConfusion:"Neurologic",deliriumFluctuating:"Neurologic",hypoxicBrainInjuryPostArrest:"Neurologic",
  increasedICPHeadacheVomiting:"Neurologic",ischemicStrokeSudden:"Neurologic",transientIschemicAttack:"Neurologic",
  intracerebralHemorrhageCollapse:"Neurologic",subarachnoidHemorrhageThunderclap:"Neurologic",
  // --- Endocrine / Metabolic (new section — 14 scenarios, all previously "Other") ---
  diabeticKetoacidosisCall:"Endocrine / Metabolic",hyperosmolarHyperglycemicCall:"Endocrine / Metabolic",
  severeHypoglycemiaFound:"Endocrine / Metabolic",alcoholicKetoacidosisCall:"Endocrine / Metabolic",
  starvationKetosisCall:"Endocrine / Metabolic",hyperthyroidRacing:"Endocrine / Metabolic",
  thyroidStormCrisis:"Endocrine / Metabolic",hypothyroidSluggish:"Endocrine / Metabolic",
  myxedemaComaCold:"Endocrine / Metabolic",addisonianCrisisCollapse:"Endocrine / Metabolic",
  siadhConfusedHyponatremia:"Endocrine / Metabolic",diabetesInsipidusThirsty:"Endocrine / Metabolic",
  refeedingSyndromeCall:"Endocrine / Metabolic",hyperammonemiaConfused:"Endocrine / Metabolic",
  // --- Electrolyte (new section — queue item 7's electrolyte batch) ---
  hypokalemia:"Electrolyte",hypercalcemia:"Electrolyte",hypocalcemia:"Electrolyte",
  hypermagnesemia:"Electrolyte",hypomagnesemia:"Electrolyte",hyponatremia:"Electrolyte",
  hypernatremia:"Electrolyte",severeMetabolicAcidosis:"Electrolyte",
  // --- Environmental (new section) ---
  heatStroke:"Environmental",
  accidentalHypothermia:"Environmental",
  // --- Other ---
  // No "Genitourinary" or "Hematologic" Sandbox section exists — inventing
  // one for a single scenario apiece would be scope nobody asked for, so
  // both land in "Other" rather than being force-fit into an unrelated
  // system (same reasoning already on file for testicularTorsion).
  doa:"Other",prankCall:"Other",testicularTorsion:"Other",sickleCellCrisis:"Other",rectalForeignBody:"Other",
  excitedDeliriumAgitated:"Other",chronicBackPain:"Other",
  // No "Vascular" or "Psychiatric" Sandbox section exists — same reasoning
  // as above, both land in "Other" rather than inventing a section for one
  // or two scenarios apiece.
  acuteLimbIschemia:"Other",deepVeinThrombosis:"Other",panicAttackHyperventilation:"Other",
  abdominalAorticAneurysm:"Other",
  // No "Infectious disease" Sandbox section exists — same reasoning as
  // above, "Other" rather than inventing a section for one scenario.
  necrotizingFasciitisCall:"Other",
  dengueFeverCall:"Other",
};
const bodySystemOf=(k)=>SCEN_BODY_SYSTEM[k]||"Other";
// F17 step 7: scenarios whose resolve() reward path is reachable at Layperson
// scope — audited directly against each scenario's resolve() logic (does the
// forced-death branch, or the "correct" check, require an EMT+ drug/
// procedure with no lvl-0 substitute?). Excluded: anaph (epi is lvl 1+),
// fall/stabChest (needle decompression, lvl 4), motorcycle/bikeVsCar (chest
// seal/decompression, lvl 1/4), resp/cardiogenicShock (CPAP/pressor, lvl 2+),
// asthmaAttack (bronchodilator, lvl 2), crush (calcium/bicarb, lvl 4),
// severePreeclampsia (magnesium, lvl 4). See queue item for the full audit.
const LAYPERSON_COMPLETABLE=new Set(["chest","pe","od","ami","takotsubo","svt","childbirth","drowning",
  "chestPainM","chestPainF","acs","stableAngina","unstableAngina","nstemi","abdGSW","abdPain",
  "respArrest","seizure","doa","prankCall","benignFaint",
  // F1 (this session): fbao/choking40 were WRONGLY excluded — both clear
  // their airway (pat.airway, physio/conditions.js's fbao condition) via
  // s.cleared, and chest compressions (lvl 0) already set that for real
  // once the fix above generalized the check off the scenario key onto the
  // condition. choking40 previously had NO way to set s.cleared at all
  // (see the App.jsx comment at the fix site) — this wasn't just a
  // Layperson gap, it was unwinnable at any scope until now.
  "fbao","choking40",
  // Added with the three new scenarios below: none require an EMT+ drug or
  // procedure — minorSprain/chronicBackPain are assessment-and-positioning
  // only, and seizureCombative shares seizure's own already-audited
  // treatment set (recovery position, airway adjuncts, glucose check).
  "minorSprain","chronicBackPain","seizureCombative",
  // testicularTorsion (F2/F8b): correct resolution is recognition + rapid
  // transport, not a specific drug/procedure — Layperson-reachable, same
  // reasoning as minorSprain. unsafeSceneAssault/stabbingPair are NOT
  // included: both require ALS-level hemorrhage/airway procedures (needle
  // decompression, chest seal) with no lvl-0 substitute, same as
  // bikeVsCar/stabChest above.
  "testicularTorsion",
  // The two new frequent-flyer variants (campaign.js's
  // FREQUENT_FLYER_SCENARIOS): both content-only, correct resolution is
  // recognition/reassurance/monitoring, no EMT+ drug or procedure — same
  // reasoning as minorSprain/chronicBackPain above. "od" (the frequent
  // flyer's rare OD escalation) is already in this set.
  "frequentFlyerIntoxicated","frequentFlyerCannabis"]);
// F2b: crude call-acuity badge for the dispatch board — HIGH if any of the
// scenario's candidate impression codes carries PI's `base:1` (the codes
// gear.js already flags as inherently severe: cardiac arrest, respiratory
// arrest/failure, ALOC, shock, hypotension, anaphylaxis, choking), else
// STANDARD. Reuses an existing flag rather than inventing a new severity
// field on every scenario.
const callAcuity=(k)=>(SCEN[k]?.imps||[]).some(code=>PI[code]?.base)?"HIGH":"STANDARD";
const MODE_BASE_PAY={city:45,suburban:32,rural:18};
const shiftPay=(g,result)=>{
  // Design doc §1.6.6: once Chapter 5 has landed a real EMS job, pay is the
  // employer's own flat per-shift figure (approximated here as per-call,
  // same granularity MODE_BASE_PAY already uses), not the generic
  // city/suburban/rural rate — a real, felt payoff for which employer the
  // player actually works for. Event's real income is inconsistent
  // (§1.6.6's EVENT_SHIFT_FREQUENCY_FACTOR), reflected here as a per-call
  // chance the "shift" simply wasn't scheduled that day, rather than
  // scaling every payout down uniformly (which would just read as event
  // work always paying less, not "less but spikier").
  const jobs=g.learningMode==="zth"?(g.jobs||[]):[];
  if(jobs.length){
    const primary=jobs.includes("county911")?"county911":jobs.includes("fire911")?"fire911":jobs.includes("ift")?"ift":"event";
    if(primary==="event"&&Math.random()>EVENT_SHIFT_FREQUENCY_FACTOR) return 0;
    let pay=JOB_SHIFT_PAY[primary]||MODE_BASE_PAY[g.mode]||30;
    if(result.correct) pay+=10;
    if(result.died) pay=Math.round(pay*0.6);
    return pay;
  }
  let pay=MODE_BASE_PAY[g.mode]||30;
  if(result.correct) pay+=10;
  if(result.died) pay=Math.round(pay*0.6);
  return pay;
};

// ── Sandbox call rating (queue F1) ──────────────────────────────────────────
// Two axes the product owner asked for: how well the patient was STABILIZED, and
// how well the player worked WITHIN THEIR SCOPE. Both 0-100, deliberately
// transparent and tunable (the bands and weights are right here). Stabilization
// reads the patient's TRUE final state — the last vitals the engine published
// (physio()'s _lastVitals), NOT the player-measured vitals — so you cannot inflate
// the score by simply not looking. Scope/practice reuses the care-quality signals
// the debrief already surfaces: impression declared and correct, vitals actually
// obtained, base contacted, and real findings behind the decision (not a lucky
// guess). The scope-OVERRIDE switch (scope screen) lets a player exceed their
// own licence deliberately; every override actually used during the call is
// tallied in g.oosUsed and penalizes the practice axis below.
const SB_BANDS=(v)=>[
  ["HR", v.hr>=50&&v.hr<=110],
  ["SBP", v.sbp>=90&&v.sbp<=180],
  ["SpO₂", (v.spo2??100)>=92],
  ["RR", v.rr>=10&&v.rr<=24],
  ["MAP", (v._map??70)>=65],
  ["pH", (v._ph??v.ph??7.4)>=7.30&&(v._ph??v.ph??7.4)<=7.50],
  ["Lactate", (v._lactate??1)<4],
];
const sandboxRating=(g,o)=>{
  const v=g.patient?._lastVitals||{};
  const bands=SB_BANDS(v), inBand=bands.filter(([,ok])=>ok).length, total=bands.length;
  const arrested=v.hr===0||["VF","asystole","PEA"].includes(v.rhythm);
  // STABILIZATION — survival first, then how many key vitals were left safe.
  let stab;
  if(o.died) stab=6;
  else { stab=Math.round(50+50*(inBand/total)); if(arrested) stab=Math.min(stab,40); }
  // PRACTICE (within scope) — completeness of scope-appropriate care.
  const ROWS=["HR","BP (R)","BP (L)","SpO₂","RR","EtCO₂","Glu"];
  const gaps=ROWS.filter(k=>!g.vitals[k]).length;
  const lucky=!o.died&&(g.evidence?.length||0)<2;
  let practice=(g.pi?18:0)+(o.correct?27:0)+Math.max(0,20-gaps*3)+(g.base?15:0)+Math.min(20,(g.evidence?.length||0)*7);
  if(lucky) practice-=15;
  // F1b: the scope-override switch lets a player reach above their own
  // certification level; every time they actually used it this call is a
  // real out-of-scope-practice event and costs points here, distinct from
  // (and additive with) a bad outcome — a save that "worked" while reaching
  // outside scope is still a scope violation.
  const oosCount=Object.values(g.oosUsed||{}).reduce((a,b)=>a+b,0);
  if(oosCount>0) practice-=Math.min(30,oosCount*10);
  practice=Math.max(0,Math.min(100,practice));
  const overall=Math.round(0.55*stab+0.45*practice);
  const grade=overall>=90?"A":overall>=80?"B":overall>=70?"C":overall>=60?"D":"F";
  const line=o.died?"The patient died — stabilization is the first job, and it wasn't done."
    :overall>=85?"Strong call — a stable patient and scope-appropriate care."
    :overall>=70?"Solid, with room to tighten up."
    :overall>=55?"Shaky — go back through what was left undone."
    :"Rough call. Work the fundamentals.";
  const outVitals=bands.filter(([,ok])=>!ok).map(([k])=>k);
  return {stab,practice,overall,grade,inBand,total,outVitals,line};
};
// Every call a student partner rides, their odds of fumbling a skill at
// their own certification level improve — 10% at first, -0.5%/call, floor 0.
// Every crew member (student or not) also drifts: fatigue climbs a little
// with each call, and morale takes a hit if the last call went badly.
const bumpRoster=(s)=>{
  const o=s.outcome, died=!!(o&&o.died), badOutcome=!!(o&&o.correct===false);
  return (s.roster||[]).map(p=>{
    let morale=p.morale??90;
    if(died) morale-=randRange(20,30); else if(badOutcome) morale-=randRange(5,20);
    const fatigue=Math.min(100,(p.fatigue||0)+randRange(0,5));
    const next={...p,morale:Math.max(0,Math.min(100,morale)),fatigue};
    return p.student?{...next,exp:Math.min(20,(p.exp||0)+1)}:next;
  });};
export const carry=(s)=>{const out=Object.fromEntries(CARRY.map(k=>[k,s[k]]));
  out.roster=bumpRoster(s); return out;};

// A scenario is either a hand-authored entry in SCEN, or — for Sandbox's
// "build your own" — rebuilt on the fly from `customParams` every time
// (never stored as an object itself, since scenario objects carry
// functions that JSON/localStorage can't round-trip).
const scenOf=(s)=>s.scen==="custom"?(s.customParams?buildCustomScenario(s.customParams):null):SCEN[s.scen];

// A real, previously-dead defect (F7 standing workstream): `ecgReadout()`
// (ecg.js) gives a fixed, generic finding per rhythm KIND — e.g. every
// "stemi" reads "ST ELEVATION — inferior leads (II, III, aVF)." regardless
// of which scenario it's attached to. Several scenarios (takotsubo,
// nstemi, stableAngina, unstableAngina, ami) separately author their own,
// more specific `probes.ecg` finding (anterior STEMI for takotsubo,
// lateral ST depression for nstemi, etc) — but every real ECG display site
// in this file (the ecgAcquire action, the transmitted-to-base readback, the
// live 12-lead JSX panel) called `ecgReadout()` directly, never once
// consulting `scenOf(state).probes.ecg` the way every other exam action
// composes its own scenario override. The authored, clinically-specific
// text was completely unreachable — every player of these five scenarios
// saw the same generic inferior-STEMI (or matching-kind) wording no matter
// which one they were running. This one shared helper is used at all
// three sites instead of a bare `ecgReadout()` call, so a fix (or a future
// scenario's own override) only has to be written once.
function ecgLiveText(state,v){
  const ov=(scenOf(state)?.probes||{}).ecg;
  if(ov){const r=ov(state,v); const t=r?.find||r?.say; if(t) return t;}
  return ecgReadout(v.ecg,v);
}

// A scenario's `condition` is either a single key or (F10 — Sandbox multi-
// condition custom cases) an array of them, the same normalization
// Medicdle.js's own groundTruthConditions() already does for the same
// reason. conditionHas checks membership either way; woundsFor merges every
// matched condition's own `.wounds` (later entries win, matching
// physiology.js's own composition-order comment) instead of the single-key
// `CONDITIONS[cond]?.wounds` lookup that silently returned nothing for an
// array condition.
const conditionHas=(condKey,key)=>Array.isArray(condKey)?condKey.includes(key):condKey===key;
const woundsFor=(condKey)=>{const keys=Array.isArray(condKey)?condKey:[condKey];
  return keys.reduce((acc,k)=>({...acc,...(CONDITIONS[k]?.wounds||{})}),{});};

// Weather and time-of-day stretch everyone's response time; heavier weather /
// worse hour = longer ETAs for the other units (and, narratively, for you).
const WEATHER_MULT={clear:1,rain:1.2,fog:1.3,snow:1.5,heat:1.1};
const TOD_MULT={day:1,night:1.15,rush:1.4};
// Decide the player's arrival rank for a call and reshape every responding
// unit's ETA to match it, layering in weather/time penalties and extra
// show-up variability. rank 1 = you are first; the (rank-1) fastest units are
// marked already-on-scene when you are not first. Sandbox can force the choice.
function scheduleUnits(s, units){
  if(!units||!units.length) return {units:units||[], rank:1};
  const {need}=travelTimes(s);
  const wm=(WEATHER_MULT[s.weather]||1)*(TOD_MULT[s.timeOfDay]||1);
  const vehType=s.myVeh?.type||"als", region=s.mode||"suburban";
  let rank;
  if(s.gmode==="sandbox"&&s.sandboxFirst!=null)
    rank=s.sandboxFirst?1:Math.max(2,rollSceneRank(region,vehType,s.firstStreak||0,s.firstVar||1));
  else rank=rollSceneRank(region,vehType,s.firstStreak||0,s.firstVar||1);
  let u=units.map(x=>({...x, eta:x.eta*wm*(0.8+Math.random()*0.5)})).sort((a,b)=>a.eta-b.eta);
  if(rank===1){
    u=u.map(x=>({...x, eta:Math.max(x.eta, need+randRange(20,140)), preArrived:false}));
  } else {
    const ahead=Math.min(rank-1,u.length);
    u=u.map((x,i)=> i<ahead
      ? {...x, eta:Math.max(4, need-randRange(15,80)), preArrived:true}
      : {...x, eta:Math.max(x.eta, need+randRange(15,120)), preArrived:false});
  }
  return {units:u.sort((a,b)=>a.eta-b.eta), rank};
}

// History taking — one button for SAMPLE, one for OPQRST. Each is tracked
// independently (sampleAsked / opqrstAsked) so asking one does not consume
// the other; each surfaces the scenario's scripted probe for that history,
// falling back to the general `history` probe if a scenario hasn't been
// split into separate sample/opqrst probes yet.
const HX_SETS=[
  ["sample","sampleAsked","SAMPLE history","Taking a SAMPLE history — signs & symptoms, allergies, medications, pertinent history, last oral intake, events leading up"],
  ["opqrst","opqrstAsked","OPQRST history","Taking an OPQRST history — onset, provocation, quality, region/radiation, severity, time"],
];

// Shared back-button, used on every setup screen (jumps one step back in
// the wizard) and, with a confirm, on the live-call screens (jumps all
// the way to scenario select — there's no "one step back" once the scene
// clock is running, since time and physiology don't reverse). Hoisted to
// module scope (was previously declared inside App(), so every render of
// the giant App component created a brand-new BackBtn function — React
// treats that as a new component TYPE each render, forcing every button on
// screen to fully remount instead of reconciling). blank()/carry() are
// already module-scope; setG is the only thing that needed to become an
// explicit prop instead of a closure.
const BackBtn=({toPhase,label="← Back",confirmMsg,reset,setG})=>(
  <button onClick={()=>{if(confirmMsg&&!window.confirm(confirmMsg))return;
      setG(s=>reset?{...blank(),...carry(s),phase:toPhase}:{...s,phase:toPhase});}}
    style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:12,padding:"6px 12px",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"}}>
    {label}</button>);

export default function App({onHome}={}){
  const [g,setG]=useState(blank);
  // Autosave every 5 minutes of real time to the active slot (on top of the
  // existing save-around-each-call behavior). Reads the latest state through
  // a ref so the interval doesn't need to be torn down on every keystroke.
  // The ref write itself happens in its own effect (not directly in the render
  // body) — refs are an escape hatch for effects/event handlers, not something
  // to mutate while rendering.
  const gRef=useRef(g);
  useEffect(()=>{gRef.current=g;},[g]);
  // Dev-only browser-automation hook (tools/browser/driver.mjs) — lets a
  // headless-Chromium test script jump straight to an arbitrary phase/state
  // patch without clicking through every screen in front of it, the same
  // way a real save's `phase` drives rendering already. import.meta.env.DEV
  // keeps this out of any production/itch.io build entirely (Vite strips
  // the whole branch at build time) — it is not reachable from a shipped
  // build, only `npm run dev`.
  useEffect(()=>{
    if(!import.meta.env.DEV) return;
    window.__proximateTestGetState=()=>gRef.current;
    window.__proximateTestSetState=(patch)=>setG(s=>({...s,...(typeof patch==="function"?patch(s):patch)}));
    return ()=>{delete window.__proximateTestGetState; delete window.__proximateTestSetState;};
  },[]);
  useEffect(()=>{
    if(!g.saveId) return;
    const iv=setInterval(()=>{const cur=gRef.current;
      if(cur&&cur.saveId){
        writeSave(cur.saveId,cur,{name:cur.saveName,gmode:cur.gmode,level:cur.level,careerIdx:cur.career?.idx??0});
        setG(s=>({...s,lastSaveAt:Date.now()}));
      }
    },5*60*1000);
    return ()=>clearInterval(iv);
  },[g.saveId]);
  // F9: unlock background-music playback on the first click/keypress anywhere
  // in the app — required once per session because of browser autoplay policy.
  const [audioUnlocked,setAudioUnlocked]=useState(false);
  useEffect(()=>{
    if(audioUnlocked) return;
    const unlock=()=>setAudioUnlocked(true);
    window.addEventListener("pointerdown",unlock,{once:true});
    window.addEventListener("keydown",unlock,{once:true});
    return ()=>{window.removeEventListener("pointerdown",unlock);window.removeEventListener("keydown",unlock);};
  },[audioUnlocked]);
  useBackgroundMusic(g.phase,g.muted,(g.musicVolume??1)*0.5,audioUnlocked);
  useCoop(g.coop,g,setG);
  // F4: the between-call skill-check minigame. UI-only local state (position
  // of the moving marker and whether it's running) — the OUTCOME (the speed
  // boost) is what persists, onto g.speedBoost, not this.
  const [practice,setPractice]=useState(null);
  const practiceRef=useRef(null);
  useEffect(()=>{
    if(!practice?.running) return;
    let dir=1, pos=0;
    practiceRef.current=setInterval(()=>{
      pos+=dir*4; if(pos>=100){pos=100;dir=-1;} if(pos<=0){pos=0;dir=1;}
      setPractice(p=>p&&p.running?{...p,pos}:p);
    },30);
    return ()=>clearInterval(practiceRef.current);
  },[practice?.running]);
  // UI-only: which candidates on the recruitment page currently have their
  // "recruit as student" toggle flipped on. Doesn't need to persist.
  const [studentToggle,setStudentToggle]=useState(new Set());
  // UI-only: which column (cost/level) and direction sorts the recruit pool.
  const [partnerSort,setPartnerSort]=useState({field:"level",dir:"desc"});
  // F22: Sandbox scenario-select can show a visual dispatch map instead of the
  // plain body-system list — a display preference, not gameplay state.
  const [mapView,setMapView]=useState(false);
  // Free Explore (temporary, dev-facing) — which map id the player picked
  // to walk around; UI-only, same footing as mapView, no save/CARRY needed.
  // Credits are the very first screen of a fresh session, once; afterwards they
  // live behind the title screen's Credits button (phase "credits").
  const [firstCredits,setFirstCredits]=useState(()=>{try{return !localStorage.getItem(CREDITS_SEEN_KEY);}catch{return true;}});
  const [exploreMapId,setExploreMapId]=useState("city");
  const [exploreSpawnVehicle,setExploreSpawnVehicle]=useState(false);
  // Tester-gate password field — UI-only, never persisted, same footing as
  // exploreSpawnVehicle above.
  const [testerPwInput,setTesterPwInput]=useState("");
  const [testerPwError,setTesterPwError]=useState(false);
  // Which case is currently highlighted in each organ system's dropdown on
  // the Sandbox case-picker (g.phase==="cat") — keyed by system name, reset
  // implicitly since it's UI-only (not gameplay state, same as mapView).
  const [sysCaseSelect,setSysCaseSelect]=useState({});
  // F10: which BUILD YOUR OWN taxonomy category groups are expanded (keyed
  // "tier/category") — UI-only, same category as sysCaseSelect/mapView above.
  const [customGroupOpen,setCustomGroupOpen]=useState({});
  // UI-only text input for the debrief "guess the diagnosis" game — the
  // guesses/results themselves are real g state (mdGuesses/mdSolved),
  // reset per-call; this is just the live keystrokes before submit.
  const [mdInput,setmdInput]=useState("");
  const SC=g.scen?scenOf(g):null;
  const L=g.level?LEVELS[g.level].n:0;
  // The active scope-of-practice profile — which certification level a given
  // drug/procedure actually requires. Defaults to the National Model 2019
  // baseline (every registry item's own `.lvl`); a selected regional/agency
  // scope (src/scopes/) overrides specific items. Every place that used to
  // read `d.lvl`/`p.lvl`/`src.lvl` directly now goes through this so a
  // selected scope actually changes what's locked, everywhere at once.
  const activeScope=getScope(g.scopeProfile);
  const lvlOf=(id,baseLvl)=>effectiveLvl(id,baseLvl,activeScope);
  // F18: siren was reported audible on the title/menu screen. The phase gate alone
  // should already prevent this, but a siren with no active call is nonsensical
  // regardless of the exact stale-render path that let it slip through — add
  // !!g.scen as a hard second gate (title/menu screens never have a scenario set).
  useSiren((g.phase==="response"||g.phase==="transport")&&!!g.scen&&!g.muted&&L!==0,(g.muted?0:1)*(g.musicVolume??1));
  useReadAloud(g.log,g.voice,(g.phase==="kit"&&SC&&L!==0)?SC.dispatch.join(". "):null,(g.voiceVolume??1));
  // Autosave: before every case (entering "kit", right after a scenario is
  // picked and before anything happens to the patient) and after every
  // case (entering "debrief", right after it resolves). Deliberately keyed
  // on [g.phase,g.saveId] only, not the whole of `g` — the intent is "save
  // once, right at the phase transition, with whatever g is at that
  // instant" (which this closure already has, fresh, every render), not
  // "save again on every subsequent change while still on one of these
  // phases" — the kit screen alone has enough interactive controls
  // (loadout, bags) that the latter would mean a localStorage write on
  // nearly every click.
  useEffect(()=>{
    if(!g.saveId) return;
    if(g.phase==="kit"||g.phase==="debrief"||g.phase==="shiftSummary")
      writeSave(g.saveId,g,{name:g.saveName,gmode:g.gmode,level:g.level,careerIdx:g.career?.idx??0});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[g.phase,g.saveId]);
  useEffect(()=>{
    if(g.phase!=="loading") return;
    // candidatePool/hospitalStaff (recruit pool, recurring hospital staff)
    // used to be rolled here via setG on every "loading" entry — moved to
    // namesave's begin(), the one place a fresh save is actually created,
    // since deriving them here was a synchronous setState-in-effect that
    // triggered an extra cascading render for something that only ever
    // needs to happen once, at creation.
    const to=setTimeout(()=>setG(s=>s.phase==="loading"?{...s,phase:"gmodePick"}:s),1400);
    return ()=>clearTimeout(to);
  },[g.phase]);
  const has=(b)=>!b||g.phase==="transport"||g.bags.includes(b);
  const pk=(p)=>!p||g.pockets.includes(p);
  const ok=(id)=>!g.scopeOff[id];
  const LIMBS=["armL","armR","legL","legR"];
  // F4: the FIRST time this browser ever clicks "Go on shift," show the
  // liability disclaimer before proceeding — a flag in localStorage (not a
  // save field) since it's about the person at the keyboard having seen it
  // once, not about any one save profile.
  const DISCLAIMER_KEY="proximate_disclaimer_seen";
  const goOnShiftPhase=()=>{try{if(localStorage.getItem(DISCLAIMER_KEY)) return "saves";}catch{/* storage unavailable */} return "disclaimer";};
  const goGmode=(mode)=>setG(s=>{
    if(mode!=="career"&&mode!=="coop") return s;
    if(isTesterUnlocked()){
      return mode==="career"?{...s,gmode:"career",phase:s.learningMode?"level":"learningMode"}:{...s,phase:"coopSetup"};
    }
    return {...s,pendingGmode:mode,phase:"testerGate"};
  });
  const NOSTACK=["cpr","bvm","mouthMask","mouthMouth"];   // continuous procedures — one at a time
  // F3: continuous monitoring cannot come from thin air — a crew member can
  // only run the LIVE "Monitor vitals" task once at least one device that
  // actually produces a continuous reading (pulse ox, BP cuff, ECG leads) is
  // attached to the patient. Point-in-time "Full set of vitals" is unaffected.
  // Declared here (not down near order()/stopMonitor where it used to sit) so
  // the autonomous-direction block, which now also reads it, doesn't have to
  // reference a later declaration — same ordering reasoning already given for
  // crewFn above.
  const MONITOR_DEVICES=["pulseox","bpcuff","leads"];
  // Crew are held to the same clothing/exposure limits the player already
  // is (clothing.js's CLOTH_LOCK, checked for the player at every Btn() via
  // the "covered — expose the X first" disabled reason below) — a crew
  // member ordered to attach a device whose region is currently covered
  // shouldn't be able to do it either, any more than clicking the button
  // themselves would work for the player. Only "leads" is affected today
  // (pulseox/bpcuff attach to a bare finger/sleeve, not cloth-locked).
  const deviceRegionLocked=(s,deviceId)=>{
    const region=DEVICES[deviceId]?.region;
    return !!(region&&CLOTH_LOCK[region]?.includes(`attach_${deviceId}`)&&!s.exposed?.[region]);
  };
  // Crew AI — genuine life-threat tasks that may preempt a crew member
  // currently doing something non-urgent (see the autonomous-direction
  // block below). Deliberately a short, hand-picked list, not every high-lvl
  // task — this is about "drop what you're doing, the patient just coded,"
  // not a general priority scale.
  const URGENT_TASKS=new Set(["cpr","bvm","mouthMask","defibrillate","applyPads","epiArrest","needleDecompTask","tq"]);
  // A player redirecting a crew member off a task they only just started
  // reads as whiplashing the crew, not sound command judgment — costs
  // reputation in Career; Sandbox/Medical Simulation has no reputation to
  // spend, so it's always free there. System-driven (autonomous) preemption
  // never costs reputation — that's the crew's own judgment, not the
  // player's.
  const REORDER_GRACE_SEC=60;
  const srcOf=(id)=>DRUGS[id]||PROCS[id];
  // A continuous procedure counts as "already running" if its dose is still active.
  const doseActive=(s,id)=>{const src=srcOf(id); if(!src) return false;
    return (s.doses||[]).some(d=>d.id===id&&(d.patientId==null||d.patientId===s.activePatientId)&&curve(s.t-d.at,src.onset||30,src.dur||600)>0);};
  // Every task a hand is CURRENTLY performing (you + each crew member), by id.
  const workingIds=(()=>{const s=new Set(); if(g.busy) s.add(g.busy.id);
    Object.values(g.cBusy||{}).forEach(b=>{if(b.taskId) s.add(b.taskId);}); return s;})();
  const procBusy=(id)=>NOSTACK.includes(id)&&(workingIds.has(id)||doseActive(g,id));

  // Mutually-exclusive action groups: only ONE member of a group can be running
  // at a time, across BOTH the player and any crew member. The ventilation group
  // means you can't bag while someone pocket-masks, or mouth-to-mouth while a
  // CPAP is on, etc. — one airway/ventilation method owns the patient at once.
  const EXCL_GROUPS=[["bvm","mouthMask","mouthMouth","cpap","vent"],
    // Compressions are one mechanical event whether a rescuer's hands or a
    // device is producing them (see pk.js's shared pat.cprActive) — manual
    // and mechanical CPR shouldn't both be "running" at once any more than
    // two ventilation methods should.
    ["cpr","lucas"]];
  const exclGroupOf=(id)=>EXCL_GROUPS.find(gr=>gr.includes(id));
  // Returns the id of a conflicting member currently active (via a live dose or
  // a hand working it), or null. `exceptId` lets a member ignore itself.
  const exclConflict=(s,id,exceptId)=>{const grp=exclGroupOf(id); if(!grp) return null;
    for(const m of grp){ if(m===exceptId) continue;
      if(doseActive(s,m)) return m;
      if(Object.values(s.cBusy||{}).some(b=>b.taskId===m||b.dose===m)) return m;
      if(s.busy&&s.busy.id===m) return m;
    }
    return null;};
  // §9 — fresh vs slightly stale (soft) vs critically old
  const SOFTAMBER="#C79A5B";
  const staleColor=(age,fresh)=>age>STALE?C.amber:age>SOFTSTALE?SOFTAMBER:fresh;

  const apply=(s,r)=>{if(!r)return s;
    if(r.say) s.log=[...s.log,{t:s.t,kind:r.kind||"obs",text:r.say}];
    if(r.find) s.findings=[...s.findings,r.find];
    if(r.evid) s.evidence=[...s.evidence,r.evid];
    if(r.meas) Object.entries(r.meas).forEach(([k,v])=>{s.vitals={...s.vitals,[k]:{value:v,at:s.t}};});
    if(r.set) Object.assign(s,r.set);
    return s;};
  // F15: shared by every one of the four code paths that can land on
  // "debrief" (resolve/handoffResolve below, the declare-death confirmation,
  // and the hospital-arrival handoff) — computes the lifetime-stat and
  // achievement-unlock update from a state object that already carries the
  // fresh s.outcome, applied once at the point the state is CONSTRUCTED.
  // Deliberately NOT a useEffect watching g.outcome: calling setG
  // synchronously from inside an effect body is exactly the
  // react-hooks/set-state-in-effect anti-pattern (cascading renders) — doing
  // the same computation as a pure transform at construction time avoids
  // that while still crediting every path exactly once.
  const creditOutcome=(s)=>{
    const o=s.outcome; if(!o) return s;
    const prev=s.lifetimeStats||blank().lifetimeStats;
    const survived=!o.died;
    const streak=survived?(prev.currentSurvivalStreak||0)+1:0;
    const isFiveStar=s.gmode==="sandbox"&&sandboxRating(s,o).grade==="A";
    const stats={...prev,
      callsRun:(prev.callsRun||0)+1,
      callsSurvived:(prev.callsSurvived||0)+(survived?1:0),
      correctImpressions:(prev.correctImpressions||0)+(o.correct?1:0),
      currentSurvivalStreak:streak,
      bestSurvivalStreak:Math.max(prev.bestSurvivalStreak||0,streak),
      heroicActions:(prev.heroicActions||0)+((survived&&o.correct&&callAcuity(s.scen)==="HIGH")?1:0),
      fiveStarCalls:(prev.fiveStarCalls||0)+(isFiveStar?1:0)};
    // Limited-items: Sandbox's own refresh window has no manual restock
    // action (see loadout.js's header comment), so it just counts completed
    // calls here and withLoadoutRefresh (kit-entry) auto-refills at 5. Career
    // doesn't use this counter at all — its refresh is the explicit restock
    // action on THIS screen, not a call count.
    const bump=(s.gmode==="sandbox"&&s.limitedItems)?{callsSinceLoadoutRefresh:(s.callsSinceLoadoutRefresh||0)+1}:{};
    // Design doc §1.6.6's five separate job-call counters — see App.jsx's
    // blank()/CARRY comment. Chapters 1-3/6-7 (which own emrCalls/aemtCalls
    // proper) aren't built yet; this heuristic keys purely off state Ch.5
    // itself owns (s.jobs, the current scope level) so it's honest today and
    // needs no rework once those chapters land — they can layer their own,
    // more precise tracking on top without this double-counting anything it
    // doesn't already own (emrCalls only moves here before any Ch.5 job is
    // held; aemtCalls only once s.level has actually advanced to "aemt").
    const jobs=s.jobs||[];
    const ch5Bump=s.learningMode!=="zth"?{}:
      jobs.length===0&&(s.level==="layperson"||s.level==="emr")?{emrCalls:(s.emrCalls||0)+1}:
      s.level==="aemt"?{aemtCalls:(s.aemtCalls||0)+1}:{
        ...(jobs.includes("ift")?{iftCalls:(s.iftCalls||0)+1}:{}),
        ...(jobs.includes("event")?{eventCalls:(s.eventCalls||0)+1}:{}),
        ...((jobs.includes("county911")||jobs.includes("fire911"))?{calls911:(s.calls911||0)+1}:{}),
      };
    const unlocked=newlyUnlocked(stats,s.achievements||[]);
    if(!unlocked.length) return {...s,...bump,...ch5Bump,lifetimeStats:stats};
    const names=unlocked.map(id=>ACHIEVEMENTS.find(a=>a.id===id)?.name||id);
    return {...s,...bump,...ch5Bump,lifetimeStats:stats,achievements:[...(s.achievements||[]),...unlocked],
      // F7: the actual at-the-moment notification — see AchievementToast.jsx.
      toastQueue:[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))],
      log:[...s.log,...names.map(n=>({t:s.t,kind:"good",text:`🏆 Achievement unlocked — ${n}.`}))]};
  };
  const resolve=(s,a)=>{const base=scenOf(s).resolve(s,physio(s),a);
    const dNote=destinationNote(scenOf(s),s.destHospitalType);
    // F44: snapshot outcomeReport(s) while s.phase is still "scene"/"transport"
    // — its own GUARD requires that, and it would read null once phase below
    // flips to "debrief".
    return creditOutcome({...s,phase:"debrief",busy:null,cBusy:{},physioOutcome:outcomeReport(s),
      outcome:{...base,notes:dNote?[...(base.notes||[]),dNote]:(base.notes||[]),arrest:a}});};

  const medActs=()=>{const out=[];
    // Player draw-up, resolved through DrawUpMinigame.jsx (start() intercepts
    // id "prep"). On success start() re-enters with _skipMinigame and this
    // run() sets the same `prepped` flag the crew "prep" task already sets.
    out.push({id:"prep",region:"head",tab:"meds",label:"Draw up the next drug",gerund:"Drawing up",cost:25,lvl:2,bag:"drug",
      tip:"Draw the next drug ahead of time; the next push takes half as long.",
      run:(s)=>{if(s.prepped) return {say:"A drug is already drawn up and in your hand.",kind:"obs"};
        s.prepped=1; return {say:"Drawn, labeled, and in your hand.",kind:"obs"};}});
    Object.entries(DRUGS).forEach(([id,d])=>{
      const ivOnly=(d.route.includes("IV")||d.route.includes("IO"))&&!d.route.includes("IM")&&!d.route.includes("IN");
      const imN=d.route.includes("IM")||d.route.includes("IN");
      if(ivOnly&&!(g.ivSites&&g.ivSites.length)) return;   // no line yet — IV/IO drugs stay hidden
      // IV/IO drugs live on whichever cannulated limb you're currently viewing
      // (falling back to the first site placed); IM/IN drugs follow whichever limb you click.
      const region=ivOnly?(g.ivSites.includes(g.region)?g.region:g.ivSites[0]):(imN?(LIMBS.includes(g.region)?g.region:"legR"):"head");
      const base=(d.route==="NEB"?25:d.route==="PO"?22:d.route==="INH"?20:15); // §5 realistic push/route times
      const cost=Math.round(base*(g.prepped?.5:1));
      out.push({id,region,tab:"meds",drug:id,prepped:!!g.prepped,label:`${d.name} · ${d.route}`,
        gerund:`Giving ${d.name.split(" ")[0].toLowerCase()}`, cost,
        lvl:lvlOf(id,d.lvl),bag:"drug",tip:d.note,
        run:(s,v,act)=>{const ov=!!(act&&act._override);
          if(d.hold&&!ov){const h=d.hold(v);if(h)return {say:h,kind:"warn"};}
          // F6: a tourniquet occludes venous return from everything distal to
          // it — a line placed on that same limb cannot deliver anything to
          // central circulation while the tourniquet is on. Real teaching
          // point (start the line ABOVE the tourniquet, or on the other arm).
          if(ivOnly&&s.done?.[`tq@${region}`]){
            if(!ov) return {say:`The tourniquet is still on this limb — nothing pushed below it reaches central circulation. Use the other arm, or remove the tourniquet first.`,kind:"warn"};
            // Confirmed anyway: the dose is spent but never reaches the patient.
            s.given={...s.given,[id]:(s.given[id]||0)+1};s.prepped=0;
            return {say:`You push it below the tourniquet. It pools in the limb and never reaches central circulation.`,kind:"warn"};}
          const n=(s.given[id]||0)+1;
          if(d.max&&n>d.max&&!ov) return {say:`Maximum dose (${d.max}). Stop, or call Base.`,kind:"warn"};
          s.given={...s.given,[id]:n};giveDose(s,{id,at:s.t});s.prepped=0;
          if(id==="calcium") s.calcium=1;
          // F0 — treatment-response dialogue (item 18): analgesics are
          // identified by their own real, already-declared fx.pain delta,
          // not a hardcoded drug-id list, so any current or future
          // pain-reducing drug qualifies automatically. The tick loop
          // (below) watches for pain actually falling once this dose's
          // onset has had time to act, and fires a real TemplateProvider
          // line only if it genuinely did — see _analgesiaCheckAt's own
          // comment in blank().
          if(d.fx?.pain<0&&s.patient){s._analgesiaCheckAt=s.t;s._analgesiaBaselinePain=v.pain;}
          // F6: a scenario-declared medication allergy (SC.allergy, a drug id)
          // triggers a real allergic reaction — the SAME bronch/edema fields
          // the anaphylaxis condition drives, so the engine's existing
          // (already-verified) bronch/edema → hypoxia/shunt pipeline handles
          // the consequence. A one-time nudge at the moment of administration,
          // exactly like a condition's `initial` block seeds state — not a
          // per-tick accumulation, so it can't double-count across re-renders.
          const scAllergy=scenOf(s).allergy;
          let allergyNote="";
          if(scAllergy===id&&s.patient){
            s.patient.broncho=Math.min(0.9,(s.patient.broncho||0)+0.35);
            s.patient.edema=Math.min(0.85,(s.patient.edema||0)+0.25);
            s.evidence=[...(s.evidence||[]),`Allergic reaction to ${d.name} — wheeze and swelling within moments of administration.`];
            allergyNote=` ALLERGIC REACTION — the chart never had this listed, but the patient's airway does not agree. Wheeze, swelling, tightening fast.`;
          }
          const dir=Object.entries(d.fx||{}).filter(([,m])=>m).map(([p,m])=>`${p.toUpperCase()} ${m>0?"↑":"↓"}${Math.abs(m)}`).join("  ");
          return {say:`${d.name} in.${dir?"   ["+dir+" · onset "+d.onset+"s]":""}${allergyNote}`,kind:allergyNote?"crit":"good"};}});});
    (g.ivSites||[]).forEach(limb=>out.push({id:`flush_${limb}`,region:limb,tab:"meds",label:"Flush the line",gerund:"Flushing",cost:15,lvl:3,bag:"drug",
      tip:"Calcium and bicarbonate precipitate together.",run:(s)=>{s.flushed=1;return {say:"Flushed.",kind:"good"};}}));
    return out;};

  const procActs=()=>PROC_ACTS.map(p=>({...p,lvl:lvlOf(p.id,p.lvl),run:(s,v)=>{const pr=PROCS[p.id];
    if(pr.hold){const h=pr.hold(v);if(h)return {say:h,kind:"warn"};}
    if(NOSTACK.includes(p.id)&&doseActive(s,p.id)) return {say:`${pr.name} is already running — it does not need starting twice.`,kind:"warn"};
    {const conflict=exclConflict(s,p.id);
      if(conflict) return {say:`You already have ${(PROCS[conflict]?.name||conflict).toLowerCase()} running — only one at a time. Stop that first.`,kind:"warn"};}
    if(p.id==="iv"||p.id==="io"){
      // F6: sternal IO is the one non-limb site — LIMBS.includes would
      // otherwise fall it back to "armR" and silently relocate it.
      const site=p.id==="io"&&p.region==="torso"?"torso":(LIMBS.includes(p.region)?p.region:"armR");
      s.ivSites=[...new Set([...(s.ivSites||[]),site])]; {const t=p.id==="io"?"IO":"IV";const cur=(s.accessTypes||{})[site]||[];s.accessTypes={...(s.accessTypes||{}),[site]:cur.includes(t)?cur:[...cur,t]};} giveDose(s,{id:p.id,at:s.t});
      return {say:`${pr.name}. ${site==="torso"?"IO needle seated in the manubrium, aspirate confirms marrow.":"Eighteen's in, flushes clean."} — drugs are live on this ${site==="torso"?"site":"limb"}.`,kind:"good",
        set:{region:site,tab:"meds",panel:"actions"}};}
    if(["opa","npa","sga","bvm","suction","mouthMask"].includes(p.id)&&s.vomited&&!s.rolled){s.aspirated=1;
      return {say:"You go into an airway full of vomit and drive it down. He aspirates. CLEAR the airway before you MANAGE it — ROLL HIM FIRST.",kind:"crit"};}
    if(p.id==="suction"){s.suctioned=1;return {say:"Clear.",kind:"good"};}
    if(p.id==="recovery"){s.rolled=1;return {say:(v.hr>0&&v.rr>=10)?"On the side. Pulse present, breathing adequately — exactly where they belong.":"Onto the side. It drains. The airway is theirs again.",kind:"good"};}
    if(p.id==="bvm"||p.id==="mouthMask"||p.id==="mouthMouth"){s.bvm=1;
      giveDose(s,{id:p.id,at:s.t});
      return {say:`${pr.name}. You squeeze until the chest rises — and then you STOP and let it fall. Every six seconds. Not faster.`,kind:"good",
        evid:"Ventilating with visible chest rise and complete exhalation."};}
    // F1 (Layperson-scope audit): this used to check the literal scenario
    // key ("fbao"), so `choking40` — which reuses the SAME fbao condition
    // (physio/conditions.js: pat.airway is driven off s.cleared, nothing
    // else) but isn't named "fbao" — had NO way to ever set s.cleared at
    // all: no CPR-clear special case (this check didn't match), and no
    // scenario-specific Magill action either (unlike fbao, which has its
    // own `clearFB` extra). That left choking40 genuinely unwinnable at
    // ANY provider level, not just a Layperson gap — nothing in the whole
    // codebase could ever clear its airway. Checking the CONDITION instead
    // of the scenario key fixes both: fbao (unaffected, already worked)
    // and choking40 (now real).
    if(p.id==="cpr"&&conditionHas(scenOf(s).condition,"fbao")&&!s.cleared&&!s.pushedDeeper){s.cleared=1;giveDose(s,{id:"cpr",at:s.t});
      return {say:"Compressions. Third one, and the bolus comes up into her mouth. You sweep it out with a finger because now you can SEE it. Her chest rises on the next breath.",kind:"good",
        evid:"Compressions in an unconscious complete FBAO — the correct maneuver (NREMT 14898)."};}
    // Same gap, the ALS side: the GENERIC laryngoscopy procedure (unlike
    // fbao's own scenario-specific `clearFB` extra) never set s.cleared
    // either — so even a paramedic picking the generic action in EITHER
    // scenario (the only option choking40 has, and an equally valid one a
    // fbao player might reach for instead of the scenario-specific extra)
    // could not clear the airway. Direct laryngoscopy + Magill forceps IS
    // the definitive move both scenarios' own probe/resolve text already
    // describes — wiring it here makes the mechanic match the text.
    if(p.id==="laryngoscopy"&&conditionHas(scenOf(s).condition,"fbao")&&!s.cleared&&!s.pushedDeeper){s.cleared=1;giveDose(s,{id:p.id,at:s.t});
      return {say:"Blade in, direct visualization, and the forceps take the obstruction out under vision. Her chest rises on the next breath.",kind:"good",
        evid:"Direct laryngoscopy + Magill forceps — definitive removal of a visualized foreign body."};}
    if(p.id==="abdThrust"&&v.hr===0){const pr=pron(scenOf(s));
      return {say:`${pr.Subj} ${pr.is} on the floor and unconscious. You cannot get behind ${pr.obj}. Abdominal thrusts do nothing here.`,kind:"warn"};}
    if((p.id==="needleD")&&!v.ptx){giveDose(s,{id:p.id,at:s.t});
      return {say:"There was nothing to decompress. You just put a needle in a chest that did not need one.",kind:"warn"};}
    if(p.id==="paCath"){s.paCath=1;return {say:"PA catheter floated. PAOP is LEFT ventricular preload. CVP is the RIGHT. They are not the same number.",kind:"good"};}
    if(p.id==="aedAnalyze"){const shockable=v.rhythm==="VF"||v.rhythm==="VT";
      s.lastAnalysis={shockable,at:s.t};
      if(shockable) return {say:'"SHOCK ADVISED." Stand clear.',kind:"warn"};
      return (v.hr>0&&v.sbp>=LIM.sbpCarotid)
        ?{say:'"No shock advised." She has a pulse. It was never going to shock.'}
        :{say:'"No shock advised." No pulse, and no shock — that is PEA. The AED can see the electricity and it knows a shock will not help. COMPRESSIONS.',kind:"warn",
          evid:"AED: no shock advised + pulseless → PEA."};}
    if(p.id==="aedShock"){s.lastAnalysis=null;giveDose(s,{id:p.id,at:s.t});
      return {say:"Shock delivered. Resume compressions immediately.",kind:"good"};}
    if(p.id==="defib"){
      const padsOn=s.padsOn||s.devices?.pads;
      if(!padsOn) return {say:"Nothing is connected to the patient. Apply defib pads (and the monitor cable) before you charge.",kind:"warn"};
      if(!s.defib||s.defib.energy==null) return {say:"Select an energy on the monitor first. You do not charge — or shock — at an unknown dose.",kind:"warn"};
      if(!s.defib.charged) return {say:`Charge to ${s.defib.energy} J first. On the monitor: select energy, CHARGE, then shock.`,kind:"warn"};
      const j=s.defib.energy; s.lastAnalysis=null; giveDose(s,{id:p.id,at:s.t}); s.defib={energy:j,charged:0};
      return {say:`${j} J delivered. Everyone clear — resume compressions immediately.`,kind:"good"};
    }
    if(p.id==="ecgAcquire"){s.leadsOn=1;
      // Acquiring must NOT hand the player the diagnosis. The strip goes
      // live on the monitor (raw waveform) and can be printed and self-read
      // (TwelveLeadPrint — a real self-quiz: the player commits to a
      // rhythm/finding before the key is revealed) or transmitted to base
      // for a physician readback. No interpretation is stated here.
      if(g.patient?.seizing) return {say:"Twelve-lead acquired, but too much motion artifact for a clean strip — the patient is actively seizing. Wait it out.",kind:"warn",find:"12-lead acquired (motion artifact)."};
      return {say:"Twelve-lead acquired. The strip is live on the monitor — read it yourself, print it, or transmit it to base.",
        kind:"obs",find:"12-lead acquired."};}
    if(p.id==="valsalva"&&v.ecg!=="svt") return {say:"Sinus tachycardia does not respond to a vagal maneuver. Treat the CAUSE.",kind:"warn"};
    if(p.id==="etco2"){const pr=pron(scenOf(s));return {say:`EtCO₂ ${v.etco2}.`+(v.etco2<25?` Low. In a tachypnoeic patient that is dead space — ${pr.subj} ${pr.is} ventilating lung that has no blood in it.`:v.etco2>50?" High, with a low rate. Respiratory failure.":""),
      kind:(v.etco2<25||v.etco2>50)?"warn":"obs",meas:{"EtCO₂":`${v.etco2}`},find:`EtCO₂ ${v.etco2}.`,
      evid:v.etco2<25&&v.rr>22?"Low EtCO₂ with tachypnea — dead-space ventilation.":null};}
    if(["manualBP","autoBP"].includes(p.id)){
      if(!s.devices?.bpcuff) return {say:"No cuff on the arm. Apply the BP cuff first.",kind:"warn"};
      if(p.id==="autoBP"){ s.autoBPAt=s.t;   // cycles in the background — hands stay free
        return {say:"Cuff cycling on automatic. I'll call the pressure when it lands — go ahead and keep working.",kind:"obs"};}
      // manual: you had to wait the full cycle, and it is the exact number
      return {say:`${v.sbp} over ${v.dbp}, by auscultation.`,meas:{"BP (R)":`${v.sbp}/${v.dbp}`},find:`BP ${v.sbp}/${v.dbp} (manual).`};
    }
    if(p.id==="pulseox") return {say:`SpO₂ ${v.spo2}%, PR ${v.hr}.`,meas:{"SpO₂":`${v.spo2}%`,PR:`${v.hr}`}};
    // eFAST — four real windows, each reading a real physiology field rather
    // than a decorative "Ultrasound (eFAST)." line: pericardial (tamponade),
    // RUQ/Morison's pouch and LUQ (free fluid — liverInjury/gutInjury are
    // the same structural-injury accumulators item 42's own work already
    // verifies, reused here as the honest, already-real proxy for
    // hemoperitoneum rather than inventing a dedicated free-fluid field),
    // and bilateral lung windows for pneumothorax (v.ptx).
    if(p.id==="ultrasound"){
      const peri=(s.patient?.pericardialEffusion??0)>0.15;
      const ruq=(s.patient?.liverInjury??0)>0.1;
      const luq=(s.patient?.gutInjury??0)>0.1;
      const lungPos=!!v.ptx;
      const hits=[peri&&"pericardial effusion",ruq&&"free fluid, RUQ (Morison's pouch)",luq&&"free fluid, LUQ",
        lungPos&&`absent lung sliding${v.ptxSide?` (${v.ptxSide})`:""}${v.ptx==="tptx"?" — tension physiology":""}`].filter(Boolean);
      giveDose(s,{id:p.id,at:s.t});
      const summary=hits.length?`eFAST positive — ${hits.join("; ")}.`:"eFAST negative — no pericardial or free peritoneal fluid, lung sliding present bilaterally.";
      return {say:summary,kind:hits.length?"crit":"obs",find:summary,
        evid:peri?"Pericardial effusion on eFAST — tamponade physiology.":(ruq||luq)?"Free intraperitoneal fluid on eFAST — intra-abdominal hemorrhage.":null};
    }
    // "glucometer" itself is dead as an action id — the real, reachable
    // action is "gluc" (its own run() above, via GlucometerMinigame). This
    // branch never matched anything; removed along with the PROCS.glucometer
    // entry and every s.given.glucometer/categories.js reference that made
    // the same id mistake (see scenarios.js/categories.js).
    giveDose(s,{id:p.id,at:s.t});
    const dir=Object.entries(pr.fx||{}).filter(([,m])=>m).map(([k,m])=>`${k.toUpperCase()} ${m>0?"↑":"↓"}${Math.abs(m)}`).join("  ");
    return {say:`${pr.name}.${dir?"   ["+dir+"]":""}`,kind:"good"};}}));

  // §6 — General tab: body-part independent, available under any region (region tracks g.region).
  const generalActs=()=>SC?[
    {id:"sizeup",region:g.region,tab:"general",label:"Scene size-up",gerund:"Sizing up the scene",cost:20,lvl:0,once:1,
      // F18: this and the walk-in version below were both a bare one-liner —
      // "Scene safe. One patient..." regardless of scenario — when SC.impression
      // already carries a real, scenario-specific description of what the scene
      // looks like (it's what the tick loop logs automatically on full arrival);
      // leading with it here gives size-up actual content instead of a stock line.
      run:(s)=>{s.sizedUp=1; const hz=SC.hazard;
        return {say:hz?`SCENE: ${hz} ${SC.impression}`:SC.impression,kind:hz?"crit":"obs",
          find:"Scene size-up complete.",evid:hz?`Scene hazard identified — ${hz}`:null};}},
    {id:"ppe",region:g.region,tab:"general",label:"Don PPE — gloves, eye protection",gerund:"Gloving up",cost:5,lvl:0,once:1,
      run:(s)=>{s.ppe=1;return {say:"Gloved and eye-protected. Your hands are clean to work.",kind:"good",find:"PPE donned."};}},
    {id:"genImp",region:g.region,tab:"general",label:"General impression",gerund:"Forming a general impression",cost:15,lvl:0,once:1,
      run:(s)=>{const inj=SC.injuries||[]; s.injuries=inj; const names=inj.map(k=>RN[k]).join(", ");
        return {say:inj.length?`Obvious on first look: ${names.toLowerCase()}.`:"No gross external injury. They look their complaint — no worse, no better.",
          kind:inj.length?"warn":"obs",find:inj.length?`Obvious injury: ${names}.`:"No obvious external injury."};}},
    // General: reveals g.patientName (drawn once, at dispatch — see the
    // "kit" phase's own comment) rather than showing it by default, so it
    // doesn't undermine the existing "a patient never gets a name prefix"
    // diagnose-without-bias framing. A scenario can override via its own
    // probes.id (same idiom as probes.opqrst/probes.sample) for a specific
    // "nobody knows this patient" narrative — matching unsafeSceneAssault's
    // existing text for that exact situation — otherwise this falls back to
    // the generic conscious/unconscious branch. v._cons==="awake" is the
    // same "can reliably answer" check the refusal-of-care flow and the
    // default pupils/reflexes actions already use.
    {id:"askId",region:g.region,tab:"general",label:"Ask for ID",gerund:"Confirming patient ID",cost:5,lvl:0,once:1,
      run:(s,v)=>{
        const probes=scenOf(s).probes||{};
        if(probes.id) return probes.id(s,v);
        if(v._cons==="awake") return {say:`Patient states their name is ${s.patientName}.`,
          kind:"good",find:`Patient ID: ${s.patientName}`,set:{idKnown:1}};
        return {say:"Patient is unable to respond. No ID found, no bystanders on scene able to confirm identity.",
          kind:"warn"};
      }},
    ...(!g.call911?[{id:"call911",region:g.region,tab:"general",label:"Call 911",gerund:"Calling 911",cost:10,lvl:0,once:1,
      // §2.5's tutorial exception (see call911Now's own matching branch):
      // Northwood PATROL, not a real dispatch, on a scripted one-minute ETA.
      run:(s)=>{if(s.tutorialHeatStrokeActive) return {say:'911 — "Northwood PATROL is already in the area, they\'re closer than we are — they\'re on their way."',
          kind:"beat",set:{call911:1,call911Asked:1,tutorialHeatStroke911At:s.t}};
        let units=genUnits(s.mode,{allowed:effectiveAllowedKinds(s.allowedKinds,s.allowedDepartments),severity:s.code});
        if(!units.some(u=>u.vehicle.transport)) units.push(blsAmbulance(s.mode));
        units=units.map(u=>({...u,eta:s.t+u.eta})).sort((a,b)=>a.eta-b.eta);
        return {say:"911 — help is on the way.",kind:"beat",set:{call911:1,call911Asked:1,sceneUnits:units}};}}]:[]),
    // F2: "call police" — only offered when the scenario has actually flagged
    // a crime/unsafe-scene concern (SC.crimeSuspected), not on every call. PD
    // shows up as a unit like any other, on the same eta/arrival machinery.
    ...(SC?.crimeSuspected&&!g.policeCalled?[{id:"callPolice",region:g.region,tab:"general",label:"Call police",
      gerund:"Calling for police",cost:10,lvl:0,once:1,
      run:(s)=>{const already=(s.sceneUnits||[]).some(u=>KINDS[u.kind]?.category==="police");
        if(already) return {say:"Dispatch: PD is already responding.",kind:"obs",set:{policeCalled:1}};
        const etaBase={city:90,suburban:180,rural:360}[s.mode||"suburban"];
        const unit={id:"pd_req_"+Math.round(s.t), kind:"pd", label:KINDS.pd.label, agency:KINDS.pd.agency,
          name:"PD "+(100+Math.floor(Math.random()*799)), vehicle:KINDS.pd.vehicle, personnel:KINDS.pd.crewFn({emrBias:0.3}),
          solo:false, eta:s.t+Math.round(etaBase*(0.85+Math.random()*0.3)), arrived:false};
        return {say:"Dispatch copies — PD is responding for scene safety.",kind:"beat",
          set:{policeCalled:1,sceneUnits:[...(s.sceneUnits||[]),unit].sort((a,b)=>a.eta-b.eta)}};}}]:[]),
    // F2: BLS/ALS acuity is a live decision, not a fixed label — request an
    // ALS intercept if none is coming, or (AEMT+ only, since that's the
    // provider level actually authorized to make that call) cancel one that
    // hasn't arrived yet if the patient turns out not to need it.
    ...(!(g.sceneUnits||[]).some(u=>topLevel(u)>=3)&&!g.alsRequested?[{id:"reqALS",region:g.region,tab:"general",
      label:"Request ALS intercept",gerund:"Requesting ALS",cost:10,lvl:0,once:1,
      run:(s)=>{const etaBase={city:150,suburban:260,rural:480}[s.mode||"suburban"];
        const kind=effectiveAllowedKinds(s.allowedKinds,s.allowedDepartments).has("ambALS")?"ambALS":"squad";
        const unit={id:"als_req_"+Math.round(s.t), kind, label:KINDS[kind].label, agency:KINDS[kind].agency,
          name:"Medic "+(1+Math.floor(Math.random()*9)), vehicle:KINDS[kind].vehicle, personnel:KINDS[kind].crewFn({key:s.mode,emrBias:0.3}),
          solo:false, eta:s.t+Math.round(etaBase*(0.85+Math.random()*0.3)), arrived:false};
        return {say:"Dispatch copies — ALS is responding to intercept.",kind:"beat",
          set:{alsRequested:1,sceneUnits:[...(s.sceneUnits||[]),unit].sort((a,b)=>a.eta-b.eta)}};}}]:[]),
    ...(L>=3&&(g.sceneUnits||[]).some(u=>topLevel(u)>=3&&!u.arrived)?[{id:"cancelALS",region:g.region,tab:"general",
      label:"Downgrade — cancel inbound ALS",gerund:"Cancelling ALS response",cost:10,lvl:3,once:1,
      run:(s)=>({say:"Dispatch copies — ALS response cancelled, BLS will handle transport.",kind:"obs",
        set:{sceneUnits:(s.sceneUnits||[]).filter(u=>!(topLevel(u)>=3&&!u.arrived))}})}]:[]),
    ...HX_SETS.map(([key,askedFlag,label,gerund])=>({
      id:`hx_${key}`,region:g.region,tab:"general",label:`Ask — ${label}`,gerund,cost:25,lvl:0,once:1,
      run:(s)=>{
        if(s[askedFlag]) return {say:"Patient repeats themselves — nothing new to add.",kind:"obs"};
        const probes=scenOf(s).probes||{};
        // OPQRST uses the scenario's opqrst probe (falling back to the general
        // history line, which is written onset/quality-first). SAMPLE uses its
        // own probe, falling back to a distinct SAMPLE-shaped reply — so the
        // two buttons never read out the exact same line.
        const pr = key==="opqrst" ? (probes.opqrst||probes.history) : probes.sample;
        const fallback = key==="sample"
          ? {say:'"Allergies — none that I know of. Medications — nothing I take regularly. No real medical history. I last ate a few hours ago. Nothing unusual led up to this."',
             kind:"pt",find:"SAMPLE: NKDA, no regular meds, no significant hx, last oral intake hrs ago."}
          : {say:"No further history offered — nothing more to go on.",kind:"obs"};
        const r=pr?pr(s,physio(s)):fallback;
        return {...r,set:{...(r.set||{}),[askedFlag]:1}};}})),
    // Granular equipment realism: a fresh lead placement (or one disturbed
    // by patient movement) shows real artifact until it's reseated — the
    // monitor's own ECG trace reads this (see the "monitor" panel below).
    // Only offered once leads are actually on; re-attaching leads resets
    // leadsSecured so this has to be done again, same as real practice.
    ...(g.devices?.leads?[{id:"secureLeads",region:"torso",tab:"procedures",label:"Reseat/secure ECG leads",
      gerund:"Reseating the leads",cost:8,lvl:0,
      run:(s)=>{s.leadsSecured=1;return {say:"Leads reseated — good skin contact, artifact clears.",kind:"obs",find:"Leads reseated."};}}]:[]),
    // Finite oxygen supply: swapping the cylinder is the real field remedy
    // once the tank hits its safe-residual reserve (see the tick effect's
    // O2_FLOW_LPM depletion block) or preemptively if the crew wants a full
    // tank before a long transport.
    {id:"swapO2Tank",region:g.region,tab:"general",label:`Swap O2 cylinder (${Math.round(g.o2Psi??2000)} psi left)`,
      gerund:"Swapping the oxygen cylinder",cost:20,lvl:0,
      run:(s)=>{s.o2Psi=2000;return {say:"Fresh D cylinder connected — 2000 psi.",kind:"obs",find:"Oxygen cylinder swapped."};}},
  ]:[];
  // §5.5 — Clothing: 3 ways to expose any locked region (arm sleeve, pant
  // leg/dress hem, or shirt over the chest). All three reach the same end
  // state and share a doneKey, so completing any one retires the other two.
  // Revealing a region also reports whatever wound the condition put there
  // (if any) — that's the "yellow scrape, red bleeding puncture" payoff.
  const exposureActs=()=>{if(!SC) return [];
    const locked=lockedRegions(SC.clothing), out=[];
    // Which OTHER regions come free when a garment is taken off that region
    // entirely (not just rolled/cut). A shirt removed off the body takes
    // both sleeves with it; pants (or a dress) pulled off take both legs.
    // Cutting/rolling only affects the single region worked on.
    const pairsFor=(region)=>{
      if(region==="torso") return ["armR","armL"].filter(r=>locked[r]);
      if(region==="legR") return locked.legL?["legL"]:[];
      if(region==="legL") return locked.legR?["legR"]:[];
      return [];};
    Object.entries(locked).forEach(([region,garment])=>{
      const doneKey=`expose@${region}`, rl=REGION_LABEL[region];
      const reveal=(s)=>{s.exposed={...(s.exposed||{}),[region]:1};
        const w=woundsFor(scenOf(s).condition)[region], d=woundDef(w);
        if(!d) return {say:"Skin exposed. Nothing remarkable.",kind:"obs"};
        return {say:d.desc+(w.note?` ${w.note}`:""),kind:d.bleed>0?"crit":"warn",find:`${WOUND_TYPES[w.type].label} (${w.severity}) — ${rl}.`};};
      // Full removal (and, for a shirt, cutting it off) also frees whatever
      // this garment shares with the paired region(s).
      const revealFull=(s)=>{const r=reveal(s);
        pairsFor(region).forEach(pr=>{s.exposed={...(s.exposed||{}),[pr]:1};s.done={...s.done,[`expose@${pr}`]:{at:s.t}};});
        return r;};
      // Cutting a shirt open exposes the sleeves too (there's nothing left
      // holding them shut); cutting one pant leg does not touch the other.
      const shearsRun=region==="torso"?revealFull:reveal;
      out.push({id:`undress_${region}`,region,tab:"procedures",doneKey,once:1,
        label:`Remove ${garment} — ${rl}`,gerund:`Removing the ${garment}`,cost:15,lvl:0,run:revealFull});
      out.push({id:`rollup_${region}`,region,tab:"procedures",doneKey,once:1,
        label:region==="torso"?`Lift shirt — ${rl}`:`Roll up ${garment} — ${rl}`,
        gerund:region==="torso"?"Lifting the shirt":`Rolling up the ${garment}`,cost:10,lvl:0,run:reveal});
      out.push({id:`shears_${region}`,region,tab:"procedures",doneKey,once:1,pocket:"shears",
        label:`Cut ${garment} — ${rl} (shears)`,gerund:`Cutting the ${garment}`,cost:5,lvl:0,run:shearsRun});
    });
    return out;};

  // F6: a tourniquet is currently one-way (once:1, no way back). Real practice
  // allows removal (loosening/converting once hemorrhage control is definitive
  // or transport time makes prolonged ischemia the bigger risk) — add the
  // inverse action per limb, wherever one is currently on.
  const tqRemoveActs=()=>LIMBS.filter(l=>g.done?.[`tq@${l}`]).map(l=>({
    id:`tqRemove_${l}`,region:l,tab:"procedures",lvl:0,cost:10,
    label:`Remove tourniquet — ${REGION_LABEL[l]}`,gerund:"Removing the tourniquet",
    run:(s)=>{const dn={...s.done}; delete dn[`tq@${l}`]; s.done=dn;
      const idx=(s.doses||[]).findIndex(d=>d.id==="tq");
      if(idx>=0) s.doses=[...s.doses.slice(0,idx),...s.doses.slice(idx+1)];
      return {say:"Tourniquet removed.",kind:"obs"};}}));

  // CPR/ventilation are already "continuous" procedures in the physiology
  // engine (pk.js's per-tick pat.cprActive/pat.assistedVent derivation) —
  // cpr/lucas decay naturally once their dose's `dur` window elapses
  // (doseActive goes false, procBusy re-offers the start button), but
  // ventilation methods (bvm/mouthMask/mouthMouth/cpap/vent) declare
  // dur:9999 and never naturally expire, so there was previously no way to
  // ever turn assisted ventilation back off once started (e.g. the patient
  // starts breathing adequately on their own, or the crew hands off to a
  // more definitive airway). This mirrors tqRemoveActs'/deviceActs' own
  // established pattern — splice the relevant dose(s) out of s.doses
  // directly, the same real "undo" idiom already shipped for tourniquets
  // and monitoring devices — rather than inventing a new stop-marker
  // mechanism in pk.js. A short, real cost (a few seconds to actually stop
  // compressing / pull the mask away) rather than an instant, free toggle.
  const contProcStopActs=()=>{const out=[];
    if(procBusy("cpr")||doseActive(g,"lucas")){
      const mech=doseActive(g,"lucas")?"lucas":"cpr";
      out.push({id:"stopCpr",region:"torso",tab:"procedures",cost:3,lvl:0,
        label:mech==="lucas"?"Stop the mechanical CPR device":"Stop compressions",
        gerund:"Stopping compressions",
        run:(s)=>{s.doses=(s.doses||[]).filter(d=>d.id!=="cpr"&&d.id!=="lucas");
          return {say:"Compressions stopped.",kind:"obs",find:"CPR discontinued."};}});
    }
    const ventGroup=["bvm","mouthMask","mouthMouth","cpap","vent"];
    const activeVent=ventGroup.find(id=>doseActive(g,id));
    if(activeVent){
      const nm=(PROCS[activeVent]?.name||"ventilation").toLowerCase();
      out.push({id:"stopVent",region:"head",tab:"airway",cost:3,lvl:0,
        label:`Stop ${nm}`,gerund:`Stopping ${nm}`,
        run:(s)=>{s.doses=(s.doses||[]).filter(d=>!ventGroup.includes(d.id));
          return {say:"Assisted ventilation stopped.",kind:"obs",find:"Ventilation discontinued."};}});
    }
    return out;};

  const shoeActs=()=>{if(!SC?.clothing?.shoes) return [];
    return ["legR","legL"].map(r=>({
      id:`shoe_${r}`,region:r,tab:"procedures",once:1,doneKey:`shoe@${r}`,
      label:`Remove shoe — ${REGION_LABEL[r]}`,gerund:"Removing the shoe",cost:5,lvl:0,
      run:(s)=>{s.shoesOff={...(s.shoesOff||{}),[r]:1};return {say:"Shoe off.",kind:"obs"};}}));};

  // Attach / remove monitoring equipment. Attaching registers the device in
  // g.devices (the loop then keeps its readings live once a second and draws
  // its waveform on the Monitor tab); removing clears it, which stops both.
  const deviceActs=()=>{if(!SC) return []; const out=[];
    Object.entries(DEVICES).forEach(([id,d])=>{
      const on=!!g.devices?.[id];
      if(!on){
        out.push({id:`attach_${id}`,region:d.region,tab:d.tab,label:d.attach,gerund:`Attaching ${d.name.toLowerCase()}`,
          cost:12,lvl:d.lvl,bag:d.bag,doneKey:`attach_${id}`,
          run:(s,v,a)=>{s.devices={...(s.devices||{}),[id]:{at:s.t}};
            const dn={...s.done}; delete dn[`remove_${id}`]; s.done=dn;   // allow removing again
            // fresh placement — artifact until reseated. leadsPlacementQuality
            // (0-1) comes from DeviceMinigame's own click-precision score,
            // carried through the SUCCESS re-entry as a._leadsQuality — see
            // resolveAccessMinigame. Undefined (e.g. a save from before this
            // mechanism existed) reads as 1, a perfect placement.
            if(id==="leads"){s.leadsOn=1;s.leadsSecured=0;s.leadsPlacementQuality=a?._leadsQuality??1;}
            return {say:`${d.name} attached.`+(d.reads?" Readings are live on the monitor.":""),kind:"obs",find:`${d.name} attached.`};}});
      } else {
        out.push({id:`remove_${id}`,region:d.region,tab:d.tab,label:`Remove ${d.name.toLowerCase()}`,gerund:`Removing ${d.name.toLowerCase()}`,
          cost:6,lvl:0,doneKey:`remove_${id}`,
          run:(s)=>{const nd={...(s.devices||{})}; delete nd[id]; s.devices=nd;
            const dn={...s.done}; delete dn[`attach_${id}`]; s.done=dn;   // allow attaching again
            if(id==="leads"){s.leadsOn=0;s.leadsSecured=0;s.ecgInterp=null;s.leadsPlacementQuality=null;}
            if(id==="pads"){s.defib={energy:null,charged:0};}
            return {say:`${d.name} removed.`+(d.wave?" The trace goes flat.":""),kind:"obs",find:`${d.name} removed.`};}});
      }
    });
    return out;};

  const acts=()=>SC?[...LIB,...procActs(),...medActs(),...generalActs(),...exposureActs(),...shoeActs(),...deviceActs(),...tqRemoveActs(),...contProcStopActs(),...(SC.extra||[])].filter(a=>ok(a.id)):[];

  // Shared crew-task resolution (used by manual orders AND pre-assigned tasks).
  // Declared here — ahead of the tick effect below, which references it —
  // rather than down near `order`/`stopMonitor` where it used to sit: the
  // tick effect's setInterval callback is only ever INVOKED asynchronously
  // (after this whole render's declarations have run), so referencing crewFn
  // before its old, later declaration never actually threw at runtime, but
  // it left the ordering fragile. Same reasoning for pickForcedOrder/
  // handoffResolve below.
  const crewFn=(c,t)=>(m,v)=>{
    const pr=pron(scenOf(m));
    if(t.vitals){
      // Crew are held to the same equipment limits the player already is —
      // HR/RR are manual skills (a pulse count at the wrist, a chest count),
      // real without any device, but SpO2 needs a pulse ox on the patient
      // and a cuff BP needs the cuff on, exactly like the player's own
      // deviceActs()/attach_<id> actions (App.jsx, above) require before
      // either reading is obtainable at all. A crew member reporting a
      // number for a vital nothing is actually attached to read was a real
      // gap — this reuses the SAME g.devices bookkeeping the player's own
      // pulseox/bpcuff actions already write.
      const hasPO=!!m.devices?.pulseox, hasBP=!!m.devices?.bpcuff;
      m.vitals={...m.vitals,HR:{value:`${v.hr}`,at:m.t},RR:{value:`${v.rr}`,at:m.t},
        ...(hasBP?{"BP (R)":{value:`${v.sbp}/${v.dbp}`,at:m.t}}:{}),
        ...(hasPO?{"SpO₂":{value:`${v.spo2}%`,at:m.t}}:{})};
      const parts=[`${v.hr}`, hasBP?`${v.sbp} over ${v.dbp}`:"no cuff on, no blood pressure",
        hasPO?`sats ${v.spo2}`:"no pulse ox on, no sats", `respers ${v.rr}`];
      return {say:`${c.name.toUpperCase()}: "${parts.join(", ")}."`,kind:(hasBP&&hasPO)?"good":"warn"};}
    // Mirrors the vitals branch above, for TASKS' glucoseCheck flag (LA
    // County TP 1203, Diabetic Emergencies). Stamps done.gluc so this reads
    // as complete to anything checking the same key the player's own "gluc"
    // action sets (BodyMap's touched-region marker, once-per-call gating).
    if(t.glucoseCheck){m.vitals={...m.vitals,Glu:{value:`${v.glu} mg/dL`,at:m.t}};
      m.done={...(m.done||{}),gluc:{at:m.t}};
      return {say:`${c.name.toUpperCase()}: "${v.glu} milligrams per deciliter."`,kind:"good"};}
    // Crew AI batch: a generic wrapper around an existing, real player-facing
    // exam action (src/actions.js' LIB) — reuses that action's own `run`/
    // `probe` composition (App.jsx's start(), a.probe&&(scenOf(s).probes||{})
    // [a.probe]) instead of re-deriving scenario-specific findings text a
    // second time. This is what makes assessment tasks (pupils, skin, a
    // stroke screen…) real crew-directable content rather than duplicated
    // clinical text — see TASKS' new assessId-bearing entries.
    if(t.assessId){ const a=LIB.find(x=>x.id===t.assessId); if(!a) return null;
      const apr=a.probe&&(scenOf(m).probes||{})[a.probe];
      const b=a.run?a.run(m,v):null; const r=apr?apr(m,v):null;
      const res=r?{...(b||{}),...r}:b;
      m.done={...(m.done||{}),[a.doneKey||a.id]:{at:m.t}};
      return res?.say?{...res,say:`${c.name.toUpperCase()}: ${res.say}`}:{say:`${c.name.toUpperCase()}: "Nothing remarkable."`,kind:"obs"};}
    // LA County TP 1216-P, Newborn/Neonate Resuscitation. The newborn is a
    // real, separate roster patient (id "newborn", physiology.js's own
    // multi-patient roster) with a bespoke `_neo` vigour state machine
    // (conditions.js's neonatalTransition) — not a drug/procedure `dose`,
    // so this can't use the generic t.dose path. Mirrors the SAME
    // scenario-local action handlers `pph`'s own `nbDry`/`nbBag`/`nbComp`
    // extras already use (src/data/scenarios.js), generalized so a
    // crew-directed protocol rule can trigger the identical mechanism for
    // ANY scenario that spawns a "newborn" roster entry, not just that one
    // scenario's own player-facing buttons.
    if(t.neoAction){const nb=m._roster?.find(e=>e.id==="newborn")?.patient;
      if(!nb) return {say:`${c.name.toUpperCase()}: "No baby yet."`,kind:"obs"};
      nb._neo=nb._neo||{};
      if(t.neoAction==="stimulate"){nb._neo.stimulated=true;
        const hr=Math.round(nb.hr||0);
        return {say:`${c.name.toUpperCase()}: "Drying and stimulating. Heart rate ${hr}."`,kind:hr<100?"warn":"good"};}
      if(t.neoAction==="ppv"){nb._neo.ppv=true;
        return {say:`${c.name.toUpperCase()}: "Bagging the newborn, about forty a minute."`,kind:"good"};}
      if(t.neoAction==="compressions"){
        // Same real safety guard the scenario's own nbComp action already
        // enforces: newborn arrests are hypoxic — compressions without
        // ventilation first is the wrong order, not just a suboptimal one.
        if(!nb._neo.ppv) return {say:`${c.name.toUpperCase()}: "Not without ventilating first — their arrests are hypoxic."`,kind:"warn"};
        nb._neo.compressions=true;
        return {say:`${c.name.toUpperCase()}: "Three-to-one compressions, coordinated with the bag."`,kind:"good"};}
      if(t.neoAction==="epi"){
        // Queue item 65: real NRP epinephrine indication — HR<60 DESPITE
        // effective PPV+compressions. Same order-of-operations guard
        // `compressions` already enforces. Weight-scaled at the real NRP
        // IV/IO dose (0.01 mg/kg, 0.1 mg/mL concentration) against the
        // newborn's OWN weight (obstetric.js seeds it from preg.birthWeight
        // or a 3.3 kg term default) — the actual point of this fix: a flat
        // adult 1 mg epiIV dose would be ~30x this baby's real dose.
        // Deliberately a bespoke `_neo` flag, not a routed PK dose, matching
        // this whole state machine's own established design (see the
        // header comment above) — the newborn's course is not modeled as a
        // continuous receptor/concentration curve, so there is no PK
        // consumer for a routed dose to feed.
        if(!nb._neo.compressions) return {say:`${c.name.toUpperCase()}: "Not yet — this needs effective compressions and ventilation first."`,kind:"warn"};
        const wt=nb.weight||3.3, mg=Math.round(wt*0.01*1000)/1000;
        nb._neo.epi=true;
        return {say:`${c.name.toUpperCase()}: "Epi, ${mg} mg IV/IO — ${wt} kilo baby, point-oh-one per kilo."`,kind:"good"};}
    }
    if(t.ivAttempt){const free=LIMBS.find(l=>!(m.ivSites||[]).includes(l));
      if(!free) return {say:`${c.name.toUpperCase()}: ${applyPron(t.report,pr)}`,kind:"warn"};
      if(limitedItemsActive(m)&&(m.supplyStock?.iv??0)<=0)
        return {say:`${c.name.toUpperCase()}: "No catheters left in the box."`,kind:"warn"};
      m.ivSites=[...(m.ivSites||[]),free];
      if(limitedItemsActive(m)) consumeStock(m,"iv");
      return {say:`${c.name.toUpperCase()}: "Eighteen in the ${RN[free].toLowerCase()}, flushes clean."`,kind:"good"};}
    if(t.tqAttempt){const free=LIMBS.find(l=>!m.done?.[`tq@${l}`]);
      if(!free) return {say:`${c.name.toUpperCase()}: ${applyPron(t.report,pr)}`,kind:"warn"};
      if(limitedItemsActive(m)&&(m.supplyStock?.tq??0)<=0)
        return {say:`${c.name.toUpperCase()}: "Out of tourniquets — nothing left to put on."`,kind:"warn"};
      m.done={...(m.done||{}),[`tq@${free}`]:{at:m.t}};
      giveDose(m,{id:"tq",at:m.t});
      if(limitedItemsActive(m)) consumeStock(m,"tq");
      return {say:`${c.name.toUpperCase()}: "High and tight on the ${RN[free].toLowerCase()}, windlass locked, time written on ${pr.poss} forehead."`,kind:"good"};}
    if(t.fetch){const allowed=bagsForVehicle(m.myVeh)||STANDARD_BAG_KEYS;
      const miss=allowed.filter(b=>!m.bags.includes(b));
      if(miss[0]){ m.bags=[...m.bags,miss[0]];
        return {say:`${c.name.toUpperCase()}: "Got the ${BAGS[miss[0]].name.toLowerCase()}." You never left the patient.`,kind:"good"};}
      // Every bag category is already carried — with limited items active,
      // a crew member can instead run back to the truck's own unbagged
      // reserve and top off whatever's running low (see loadout.js's
      // truckReserve pool). Bounded by what was actually loaded onto the
      // truck at the loadout page; once that's empty too, fetch is a
      // genuine dead end until the next restock.
      if(limitedItemsActive(m)&&m.supplyStock&&m.truckReserve){
        const topped=[];
        Object.keys(m.supplyStock).forEach(id=>{
          const short=(m.loadoutSelection?.carried?.[id]??0)-(m.supplyStock[id]??0);
          const avail=m.truckReserve[id]??0;
          const take=Math.min(short,avail);
          if(take>0){m.supplyStock={...m.supplyStock,[id]:m.supplyStock[id]+take};
            m.truckReserve={...m.truckReserve,[id]:avail-take}; topped.push(STOCK_ITEMS[id]?.label||id);}});
        return {say:topped.length?`${c.name.toUpperCase()}: "Grabbed more ${topped.slice(0,3).join(", ").toLowerCase()}${topped.length>3?", and a few other things,":""} off the truck."`
          :`${c.name.toUpperCase()}: "Truck's reserve is empty too — this is all we've got."`,kind:topped.length?"good":"warn"};}
      return {say:`${c.name.toUpperCase()}: "Nothing left on the truck to bring — this rig's out of bags."`,kind:"good"};}
    // Registers the SAME s.devices[id] entry deviceActs()'s own attach_<id>
    // player action does — a real device on the patient, not just a report.
    if(t.attachDevice){
      if(deviceRegionLocked(m,t.attachDevice)){
        const region=DEVICES[t.attachDevice].region;
        return {say:`${c.name.toUpperCase()}: "Can't get the leads on, his ${REGION_LABEL[region].toLowerCase()} is still covered."`,kind:"warn"};
      }
      m.devices={...(m.devices||{}),[t.attachDevice]:{at:m.t}};
      // A trained crew member's own placement, not the player's minigame
      // precision — competent but not perfect, so some baseline artifact
      // is still real until the leads settle (see the artifact calc below).
      if(t.attachDevice==="leads"){m.leadsOn=1;m.leadsSecured=0;m.leadsPlacementQuality=0.85;} }
    // Contraindication enforcement, mirroring medActs()'s own d.hold(v) check
    // (App.jsx's player dosing path, e.g. nitro's SBP<100 hold) — a real gap:
    // crew-directed doses skipped this entirely, so a crew member could be
    // ordered to push a contraindicated drug (nitro on a hypotensive patient)
    // that the player's own UI would have blocked. Only drugs that declare
    // `hold` are affected (e.g. nitro); this is a no-op for every other drug
    // and for non-drug `t.dose` (DRUGS[undefined] is undefined).
    const dHold=DRUGS[t.dose];
    if(dHold&&dHold.hold){
      const h=dHold.hold(v);
      if(h) return {say:`${c.name.toUpperCase()}: "${h}"`,kind:"warn"};
    }
    // Max-dose enforcement, mirroring medActs()'s own s.given[id]/DRUGS[id].max
    // check (App.jsx's player dosing path) — a real, previously-undiscovered
    // gap: crew-directed doses called giveDose() directly with no cap check
    // at all, so a crew member could be ordered to push a capped drug past
    // its protocol ceiling indefinitely. Only DRUGS entries carry `max`
    // (procedures like cpr/bvm never do), so this is a no-op for every
    // non-drug `t.dose`.
    const dCap=DRUGS[t.dose];
    if(dCap&&dCap.max){
      const given=(m.given?.[t.dose]||0)+1;
      if(given>dCap.max) return {say:`${c.name.toUpperCase()}: "We're already at max dose on that — call Base."`,kind:"warn"};
      m.given={...(m.given||{}),[t.dose]:given};
    }
    if(t.dose&&!(NOSTACK.includes(t.dose)&&doseActive(m,t.dose))) giveDose(m,{id:t.dose,at:m.t});
    if(t.sets) Object.assign(m,t.sets);
    // Queue item 60, part 3 — FBAO-clearance was previously reachable ONLY
    // through the player's own hands (this file's start()-level special
    // cases for p.id==="cpr"/"laryngoscopy", plus fbao's own scenario-local
    // "clearFB" Magill-forceps extra) — a crew member directed to clear the
    // SAME obstructed airway had no path that ever set s.cleared at all,
    // even the crew "Compressions" task (t.dose:"cpr"), which doses CPR for
    // real but never ran through start()'s special-case check because that
    // check lives on the PLAYER action path, not crewFn. Fixed by calling
    // the exact same resolution this file's own player-facing checks
    // already use (conditionHas(...,"fbao"), the !cleared/!pushedDeeper
    // guards) from crewFn too, not a second, parallel clearance rule.
    // t.fbaoClear (BLS/lvl 0) lets ANY crew member — including a directed
    // CPR compressor — clear a complete FBAO exactly as real guidelines
    // teach (compressions ARE the maneuver once the patient is
    // unconscious, no forceps required); t.fbaoMagill (ALS/lvl 4) is the
    // definitive direct-laryngoscopy-and-forceps removal, matching the
    // scope tier fbao's own scenario-local "clearFB" extra already
    // requires (bag:"airway", lvl 4).
    if((t.fbaoClear||t.fbaoMagill)&&conditionHas(scenOf(m).condition,"fbao")&&!m.cleared&&!m.pushedDeeper){
      m.cleared=1;
      if(t.dose) giveDose(m,{id:t.dose,at:m.t});
      return {say:`${c.name.toUpperCase()}: ${applyPron(t.report,pr)}`,kind:"good"};}
    if((t.fbaoClear||t.fbaoMagill)&&m.pushedDeeper){
      return {say:`${c.name.toUpperCase()}: "It's past the cords now, wedged. I can't reach it."`,kind:"warn"};}
    if((t.fbaoClear||t.fbaoMagill)&&!conditionHas(scenOf(m).condition,"fbao")){
      // Directed against a patient with no real foreign-body obstruction —
      // a real, honest refusal rather than silently no-opping or clearing
      // an airway that was never actually blocked.
      return {say:`${c.name.toUpperCase()}: "There's nothing obstructing this airway."`,kind:"warn"};}
    // A crew-ordered task never runs through start(), which is what normally
    // stamps s.done[id] for the player's own actions — so any check reading
    // s.done.X (scope-lock "already done" guards, a scenario's own resolve())
    // stayed blind to identical work a crew member did instead. A task opts
    // in with its own doneKey (see TASKS' "leads" entry) rather than this
    // defaulting to t.id, since not every crew task corresponds to a
    // player-facing action id.
    if(t.doneKey) m.done={...(m.done||{}),[t.doneKey]:{at:m.t}};
    return t.report?{say:`${c.name.toUpperCase()}: ${applyPron(t.report,pr)}`,kind:"good"}:null;};

  // A supervisor's forced order maps to ONE action the player can actually perform (within their scope).
  const pickForcedOrder=(n,boss)=>{const v=physio(n),pl=LEVELS[n.level].n;
    const cands=[
      [3,"iv","Get me a line.", !(n.ivSites&&n.ivSites.length)],
      [2,"ecgAcquire","Put them on the monitor — twelve-lead.", !n.done.ecgAcquire],
      [1,"bvm","Take over ventilation — bag this patient.", v.spo2<92],
      [1,"o2nrb","High-flow oxygen, non-rebreather.", v.spo2<97],
      [1,"bvm","Support their breathing — bag them.", true],
    ];
    const pick=cands.find(c=>c[0]<=pl&&c[3]&&!n.done[c[1]]) || cands.find(c=>c[0]<=pl&&!n.done[c[1]]) || cands[4];
    return {by:boss.name, actId:pick[1], label:pick[2]};};

  const handoffResolve=(n)=>{physio(n);   // ensure n.patient is populated before the snapshot below
    return creditOutcome({...n,phase:"debrief",busy:null,cBusy:{},forcedTask:null,newUnit:null,physioOutcome:outcomeReport(n),
    outcome:{died:0,correct:1,handoff:true,truth:"You handed over care.",
      cause:`As a ${LEVELS[n.level].name}, your task was to keep this patient alive until a higher licence arrived. ${n.commander?.name||"A higher-level provider"} has taken over and is transporting. Handing off cleanly is the right outcome — you did the part that was yours to do.`,
      notes:[]}});};

  // Chapter 1 background dispatch — a real per-unit availability state
  // machine for the station-roster NPCs (§7/§8 of the station-life
  // follow-up batch). The main sim-clock tick effect below only runs
  // during scene/transport/response/approach — g.t is FROZEN while the
  // player is at the station, so this is a separate, real-wall-clock-paced
  // interval, active only during Chapter 1's own idle station downtime.
  // Outbound/return travel legs reuse the same real map-distance machinery
  // scope.js's travelTimes() uses for the player's OWN response (mapFor/
  // shortestPath over the current real map, scaled by VEH_TYPE_TRAVEL_MULT
  // for a bike/golf-cart unit) rather than an invented number — falling
  // back to a plausible flat estimate only if no map-seeded incident
  // location exists yet this save (e.g. before the player's own first
  // dispatch). Total wait is compressed (BG_TIME_COMPRESS) the same
  // documented-liberty way the heat-stroke tutorial sim already compresses
  // sim-minutes into real seconds — a background call's own real minutes
  // would otherwise leave the player watching an idle screen for up to 20
  // real minutes, which defeats the point of it being ambient texture.
  useEffect(()=>{
    const ch1StationActive=g.phase==="station"&&g.learningMode==="zth"&&!g.ch1Done;
    if(!ch1StationActive) return;
    const BG_TICK_MS=5000, BG_DISPATCH_COOLDOWN_MS=20000, BG_TIME_COMPRESS=0.15;
    const bgUnitTravelSeconds=(s,vehType)=>{
      const vm=VEH_TYPE_TRAVEL_MULT[vehType]||1;
      if(s.locations?.station&&s.locations?.incident){
        const map=mapFor(s);
        const {seconds}=shortestPath(map,s.locations.station,s.locations.incident);
        if(Number.isFinite(seconds)) return Math.max(45,seconds*vm);
      }
      return Math.round((90+Math.random()*120)*vm);
    };
    const iv=setInterval(()=>setG(s=>{
      if(s.phase!=="station"||s.learningMode!=="zth"||s.ch1Done) return s;
      const now=Date.now();
      const bgUnits={...(s.ch1BgUnits||{})};
      let log=null,vignetteShown=false;
      // Bring back any unit whose wait has elapsed.
      for(const id of Object.keys(bgUnits)){
        const u=bgUnits[id];
        if(u.status==="dispatched"&&u.availableAt&&now>=u.availableAt){
          const vignettes=BACKGROUND_CALL_VIGNETTES[u.callTypeId];
          if(vignettes&&!s.ch1BgVignetteShownThisShift){
            log={t:s.t,kind:"radio",text:`📻 ${u.displayName}: "${vignettes[Math.floor(Math.random()*vignettes.length)]}"`};
            vignetteShown=true;
          } else {
            log={t:s.t,kind:"radio",text:`📻 ${u.displayName} is back at the rack.`};
          }
          bgUnits[id]={status:"atStation"};
          break; // one resolution per tick keeps the log readable
        }
      }
      let lastBgDispatchAt=s.lastBgDispatchAt||0;
      let newLog=log?[...(s.log||[]),log]:s.log;
      let ch1StationTalkInterrupt=s.ch1StationTalkInterrupt;
      if(!log&&now-lastBgDispatchAt>BG_DISPATCH_COOLDOWN_MS){
        lastBgDispatchAt=now;
        const roster=patrolShiftRoster(s.ch1ShiftIdx||0);
        const npcs=[{...roster.bikeEmr,vehType:"bike"},
          {...roster.cartCrew[0],vehType:"golfcart"},{...roster.cartCrew[1],vehType:"golfcart"},
          {...roster.footPatrol[0],vehType:"foot"},{...roster.footPatrol[1],vehType:"foot"}];
        const idle=npcs.filter(n=>!bgUnits[n.relId]||bgUnits[n.relId].status==="atStation");
        if(idle.length&&Math.random()<0.5){
          const npc=idle[Math.floor(Math.random()*idle.length)];
          const callType=BACKGROUND_CALL_TYPES[Math.floor(Math.random()*BACKGROUND_CALL_TYPES.length)];
          const travelSec=bgUnitTravelSeconds(s,npc.vehType);
          const onSceneSec=(callType.band[0]+Math.random()*(callType.band[1]-callType.band[0]))*60;
          const availableAt=now+(travelSec*2+onSceneSec)*1000*BG_TIME_COMPRESS;
          const displayName=campaignName(s,npc.relId);
          bgUnits[npc.relId]={status:"dispatched",callTypeId:callType.id,availableAt,displayName};
          newLog=[...(s.log||[]),{t:s.t,kind:"radio",text:`📻 Dispatch: ${displayName}, respond to ${callType.text}.`}];
          // If the NPC just dispatched is the one the player is CURRENTLY
          // talking to, don't just yank the conversation state out from
          // under them — mark it so the open VNDialogue can show a real
          // interrupt line as its final beat (App.jsx's ch1StationTalkTarget
          // render branch reads this) before finishTalk() closes it.
          if(s.ch1StationTalkTarget===npc.relId) ch1StationTalkInterrupt=npc.relId;
        }
      }
      return {...s,ch1BgUnits:bgUnits,lastBgDispatchAt,ch1StationTalkInterrupt,
        ch1BgVignetteShownThisShift:vignetteShown||s.ch1BgVignetteShownThisShift,
        log:newLog};
    }),BG_TICK_MS);
    return ()=>clearInterval(iv);
  },[g.phase,g.learningMode,g.ch1Done]);

  useEffect(()=>{
    const live=["scene","transport","response","approach"];
    // F13 (timer audit): the confirm-death overlay was the one modal state
    // NOT in this guard — every other modal (base contact, new-unit arrival,
    // loading a patient, settings) already pauses the clock, but a player
    // reading the "are you sure" confirmation kept accumulating sim time
    // (and therefore patient deterioration) the whole time it was open. Same
    // bug class as the settings-pause fix from the prior batch, same fix.
    // Spec 2.5 (F3 queue, "real interruptibility"), option (a): accessMinigame
    // is DELIBERATELY NOT in this pause list, unlike every other modal state
    // here. A mini-game used to fully freeze sim time (and therefore all
    // physiology) the instant it opened — real, but it made the spec's own
    // worked example ("patient deteriorates mid-IV, do you abandon?")
    // structurally impossible, and made MinigameVitalsStrip a snapshot taken
    // at open time, not a live monitor. Sim time and physiology now keep
    // advancing while a mini-game is open, same as any other unblocked scene
    // moment; the "abandon" escape hatch below (accessMinigameAlertBaseline)
    // is what gives the player a real reason to reach for it.
    if(!live.includes(g.phase)||g.micnOpen||g.newUnit||g.loadOpen||g.settingsOpen||g.confirmDeath||g.achievementsOpen||g.relationshipsOpen||g.ch1TutorialActive) return;
    const iv=setInterval(()=>setG((s)=>{
      // settingsOpen pauses the clock like the other modal states: with the
      // settings overlay up, time (and patient deterioration, which is driven by
      // s.t advancing) must not keep running. Runtime guard, matching loadOpen.
      // ch1TutorialActive (the interactive first-call coachmark, TutorialCoachmark.jsx)
      // is the same class of pause: a player reading a tutorial step should not
      // lose sim time or have their patient deteriorate underneath them.
      // accessMinigame is intentionally absent here too — see the comment above.
      if(!live.includes(s.phase)||s.micnOpen||s.newUnit||s.loadOpen||s.settingsOpen||s.confirmDeath||s.achievementsOpen||s.relationshipsOpen||s.ch1TutorialActive) return s;
      const S=scenOf(s),dt=.1*(s.speed??1);
      let n={...s,t:s.t+dt};
      const {drive,need}=travelTimes(s);
      if(s.phase==="response"){
        // Driving-mode rewrite: when <DrivingScene> is actually up (a real
        // vehicle, driving mode not toggled off), arrival is real — the
        // scene calls onFinish (setting driveMiniDone) the moment the car's
        // own position reaches the destination, not on a fixed timer. This
        // tick just advances the patient clock and waits for that flag.
        // Layperson/no-vehicle responses, driving-mode-off, and a locked
        // (non-tester) session all never mount <DrivingScene> at all, so
        // they keep the original, honest fixed-time fallback
        // (`n.t>=drive`) — nothing to gate arrival on. The 3D scenes are
        // tester-gated the same way Career/Co-op are (isTesterUnlocked()).
        const showsDriveScene=s.myVeh&&s.myVeh.type!=="none"&&s.drivingModeEnabled!==false&&isTesterUnlocked();
        if(showsDriveScene) return s.driveMiniDone?{...n,phase:"approach"}:n;
        return n.t>=drive?{...n,phase:"approach"}:n;
      }
      if(s.phase==="approach"){
        // Approach's own walk-in budget is time-based, unchanged — but its
        // TARGET is now anchored to the REAL drive-arrival time
        // (s.driveArrivedAt) when one exists, rather than the original
        // pre-drive `need` estimate, since the real drive can now take more
        // or less time than that formula guessed.
        const approachNeed=s.driveArrivedAt!=null?s.driveArrivedAt+(need-drive):need;
        if(n.t>=approachNeed){
          // Seed the visible-emergent-event edge-detection flags (below,
          // where the general scene/transport tick runs) from the patient's
          // REAL presenting state at the moment of arrival — not a false
          // default. Without this, a patient who is already seizing or
          // already unresponsive when found would fire a spurious "begins
          // seizing"/"stops responding" alert on the very first live tick,
          // which is wrong: they were found that way, they didn't just
          // transition into it under the player's own eyes.
          physio(n);
          return {...n,phase:"scene",onSceneAt:n.t,
            _seizingFlag:!!n.patient?.seizing,
            _unresponsiveFlag:n.patient?.consciousness==="unconscious"||n.patient?.consciousness==="coma",
            log:[{t:n.t,kind:"beat",text:S.impression},{t:n.t,kind:"disp",text:"BYSTANDERS: "+S.bystanders},
              {t:n.t,kind:(!n.sceneRank||n.sceneRank===1)?"good":"warn",
                text:(!n.sceneRank||n.sceneRank===1)?"You are FIRST on scene. Nobody has beaten you here."
                  :n.sceneRank===2?"You are second on scene; one unit got here ahead of you."
                  :n.sceneRank===3?"You are third on scene; two units are already working."
                  :"You arrive to a scene already in progress; several units beat you here."}]};
        }
        return n;}
      // §2.5's one exception to full reuse of the real call flow: Northwood
      // PATROL takes over exactly one minute after 911 is called, ending
      // the scene here — into the VN aftermath, not through transport/
      // debrief the way playing this same scenario in Sandbox/Career would.
      // moved is read off the REAL patient.inShade field (physio()'s own
      // "backward-compat live reference," physiology.js) rather than any
      // UI-tracked flag, so it reflects whatever the real moveToShade
      // procedure actually did, not a guess at it.
      if(n.tutorialHeatStrokeActive&&n.call911&&n.tutorialHeatStroke911At!=null&&n.t-n.tutorialHeatStroke911At>=60){
        physio(n);
        const moved=!!n.patient?.inShade;
        // Hesitation: how long the player took to call 911 after the scene
        // began, measured against tutorialHeatStrokeStartAt (begin()'s own
        // baseline) rather than an absolute time, since s.t is a continuous
        // whole-session clock. >=45s of a scene the player was dropped
        // straight into (no response/drive phase) is genuinely slow —
        // "stood there thinking about it" territory, not just "took a
        // careful look first." Read once, here, since tutorialHeatStroke911At
        // is about to go stale the moment tutorialHeatStrokeActive clears.
        const hesitated=(n.tutorialHeatStroke911At-(n.tutorialHeatStrokeStartAt??n.tutorialHeatStroke911At))>=45;
        const partnerDraw=drawName(), secondDraw=drawName();
        const relationships={...(n.relationships||{}),
          partner_patrol:n.relationships?.partner_patrol||
            createRelationship({name:partnerDraw.name,role:"PATROL partner",gender:partnerDraw.gender,startFriendship:20})};
        return {...n,phase:"campaignHeatStrokeAftermath",heatStrokeMovedToShade:moved,heatStrokeHesitated:hesitated,
          confidence:moved?(n.confidence??10)+1:n.confidence,
          relationships,campaignSecondRespName:secondDraw.name,
          tutorialHeatStrokeActive:0,busy:null};
      }
      if(s.phase==="transport") n.transportT=s.transportT+dt;

      /* arriving units (mode complement) — personnel become crew, command may shift */
      (n.sceneUnits||[]).forEach((u)=>{ if(!u.arrived && !u.cancelled && n.onSceneAt && n.t>=u.eta){
        n.sceneUnits=n.sceneUnits.map(x=>x.id===u.id?{...x,arrived:true}:x);
        const newCrew=u.personnel.map((p,pi)=>({id:u.id+"_"+pi,name:p.name,
          level:p.level,unitId:u.id,vehicle:u.vehicle,solo:u.solo,role:"onscene",pilot:!!p.pilot,
          fatigue:p.fatigue,morale:p.morale,baseSkill:p.baseSkill,yearsExp:p.yearsExp}));
        n.crew=[...n.crew,...newCrew]; n.newUnit={unit:u,crew:newCrew};
        n.log=[...n.log,{t:n.t,kind:"disp",text:`${u.name} ${u.preArrived?"is already on scene":"on scene"} — ${u.personnel.map(p=>`${p.name} (${p.pilot?"Pilot":LEVELS[p.level].name})`).join(", ")}.`}];
        // pre-assigned task auto-starts if a capable, free hand is on this unit
        const pt=n.planned[u.id]; if(pt){const t=TASKS.find(x=>x.id===pt);
          const hand=newCrew.find(c=>LEVELS[c.level].n>=t.lvl&&!n.cBusy[c.id]&&!c.pilot);
          if(hand){n.cBusy={...n.cBusy,[hand.id]:{name:hand.name,task:t.name,taskId:t.id,dur:t.dur,left:t.dur,fn:crewFn(hand,t)}};
            n.log=[...n.log,{t:n.t,kind:"good",text:`${hand.name} begins ${t.name.toLowerCase()} — pre-assigned.`}];}}
        // command hierarchy
        const topN=Math.max(...newCrew.map(c=>LEVELS[c.level].n));
        // F32: a unit arriving at a higher scope than anyone already on
        // scene brings its OWN default bags/pockets/supply — not the
        // player's. Previously every action (and pickForcedOrder's chosen
        // order) still checked the PLAYER's own g.bags/g.pockets/
        // g.supplyStock regardless of who was actually in command, which
        // could deadlock a forced order (e.g. "Get me a line" with no drug
        // /* F8: Arriving-unit supply merging only ever ADDS bags/pockets/stock; 
 // it never restricts what a LOWER-scope arriving unit can't provide. 
 // Correct today because no arriving unit currently takes command 
 // with lower/equal scope, but if that changes, this logic will still 
 // only add (never remove) due to the topN>(n.commandLevel||0) condition.
//bag on the player's own rig to satisfy it). Merged in, not
        // replaced — vehBags/pockets are ADDED to whatever's already
        // carried, and stock is topped up to whichever is HIGHER (their own
        // default vs. whatever's already there), so this never takes supply
        // away, only ever adds what the arriving unit itself would carry.
        if(topN>(n.commandLevel||0)){
          const vehBags=bagsForVehicle(u.vehicle)||STANDARD_BAG_KEYS;
          n.bags=[...new Set([...(n.bags||[]),...vehBags])];
          n.pockets=[...new Set([...(n.pockets||[]),...Object.keys(POCKETS)])];
          if(limitedItemsActive(n)&&n.supplyStock){
            const theirs=defaultLoadout(topN).carried, stock={...n.supplyStock};
            Object.entries(theirs).forEach(([id,qty])=>{ if(qty>(stock[id]||0)) stock[id]=qty; });
            n.supplyStock=stock;
          }
        }
        // Chapter 1 only: an arriving EMR+ unit doesn't wait for a
        // 5-minute hold like the ordinary Layperson handoff below — it
        // immediately takes over and sends the player home. Chapter 1's
        // calls are deliberately small; this is what makes the shift feel
        // handled, not run to a full transport/debrief. The
        // !n.ch1CallEnding guard means only the FIRST qualifying arrival
        // in this tick sets the marker/log line if several units arrive at
        // once — later ones still fall into the topN>(n.commandLevel||0)
        // supply-merge above (harmless, the call is ending regardless).
        if(n.learningMode==="zth"&&!n.ch1Done&&LEVELS[n.level].n===0&&topN>=1&&!n.ch1CallEnding){
          const boss=newCrew.find(c=>LEVELS[c.level].n===topN);
          n.ch1CallEnding={by:boss.name};
        } else if(LEVELS[n.level].n===0){
          // Layperson: an arriving ambulance marks the scene "pending" handoff,
          // but care does not actually transfer — and the call does not end —
          // until they have held the scene alone for at least five minutes.
          if(u.vehicle&&u.vehicle.transport) n.pendingHandoffUnit=n.pendingHandoffUnit||u.id;
          if(topN>(n.commandLevel||0)){const boss=newCrew.find(c=>LEVELS[c.level].n===topN);
            n.commandLevel=topN; n.commander={name:boss.name,level:boss.level,id:boss.id};
            n.log=[...n.log,{t:n.t,kind:"good",text:`${boss.name} arrives and starts helping. As a layperson, you keep going — `+
              `care fully passes to EMS once the ambulance is here and you've held the scene at least five minutes.`}];}
        } else if(!(n.gmode==="sandbox"&&n.alwaysCommand)&&topN>(n.commandLevel||0)){
          // Medical Education Mode's "Always have medical authority" option
          // (scope screen) skips this entirely — the mode is for running
          // calls and getting feedback on your own decisions, not for
          // practicing being outranked and directed by an arriving unit.
          const boss=newCrew.find(c=>LEVELS[c.level].n===topN);
          n.commandLevel=topN; n.commander={name:boss.name,level:boss.level,id:boss.id};
          n.forcedTask=pickForcedOrder(n,boss);
          n.log=[...n.log,{t:n.t,kind:"warn",text:`${boss.name} assumes command: "${n.forcedTask.label}"`}];}
      }});
      // Chapter 1's EMR+ takeover (set inside the forEach just above) ends
      // the whole tick here, before any further scene logic runs — no
      // persisted flag needed beyond this one tick: n.ch1CallEnding is set
      // and consumed within this same setG callback. career.queue is left
      // as-is deliberately (not explicitly cleared) — the next time it's
      // read is either "station"'s getCall() (never reached from here) or
      // campaignArrivalPrompt's choose(), which unconditionally reseeds a
      // fresh queue before any stale entry could matter. Skipping straight
      // to shiftSummary also means this interrupted call bypasses
      // debrief's creditOutcome entirely — not scored, no effect on
      // lifetimeStats or that shift's perfect_shift eligibility, matching
      // the "no penalty" intent directly.
      if(n.ch1CallEnding){
        return {...n,phase:"shiftSummary",busy:null,
          log:[...n.log,{t:n.t,kind:"good",
            text:`${n.ch1CallEnding.by} arrives, takes over, and tells you to manage bystanders. Thanks for the good work — call over.`}]};
      }
      // F7: an unsafe scene (SC.hazard) previously only ever produced a line
      // of narrative — the flag was read once for flavor and changed nothing
      // downstream, exactly the "decorative field" pattern the architecture
      // rules forbid. Now it costs something REAL if it isn't addressed:
      // once sized up (so the player has actually been told), a hazard that
      // hasn't been mitigated (police called, per F2, or the scene secured,
      // per F3) has one chance, ~60s after arrival, to force an interruption
      // — hands off the patient, the in-progress action lost, logged plainly.
      // A single roll (hazardEventRolled) so it cannot repeat or be farmed.
      if(s.phase==="scene"&&S.hazard&&n.sizedUp&&!n.hazardEventRolled&&n.onSceneAt&&(n.t-n.onSceneAt)>=60){
        n.hazardEventRolled=1;
        const mitigated=!!n.policeCalled||(n.securedIds||[]).length>0;
        if(!mitigated&&Math.random()<0.3){
          n.busy=null;
          n.log=[...n.log,{t:n.t,kind:"crit",
            text:"The scene hazard you flagged makes itself known again — everyone's attention is pulled off the patient for a moment. Whatever you were doing is lost."}];
          n.crew=(n.crew||[]).map(c=>({...c,morale:Math.max(0,(c.morale??90)-randRange(3,10))}));
        }
      }
      if(LEVELS[n.level].n===0&&n.pendingHandoffUnit&&n.onSceneAt&&(n.t-n.onSceneAt)>=300&&!n.handoffPending)
        n.handoffPending=1;
      if(n.handoffPending) return handoffResolve(n);
      (S.events||[]).forEach((e,i)=>{ if(n.onSceneAt&&(n.t-n.onSceneAt)>=e.at&&!n.fired[i]){
        n.fired={...n.fired,[i]:1}; const r=e.fire(n);
        if(r){n.log=[...n.log,{t:n.t,kind:r.kind,text:r.text}]; if(r.set) Object.assign(n,r.set);
          // A scenario's own scripted event at kind:"crit" is, by construction,
          // a visible emergent moment the scenario author chose to call out —
          // the choking scenario's vomiting beat is the one example today. Feed
          // it into the same on-screen alert real physiology-driven events use
          // below, instead of leaving it easy to miss in the scrolling log.
          if(r.kind==="crit") n.eventAlertQueue=[...(n.eventAlertQueue||[]),{id:`scenEvt_${i}_${Math.round(n.t)}`,text:r.text}];}}});

      if(n.busy){const l=n.busy.left-dt;
        if(l<=0){const fn=n.busy.fn,cm=n.busy.commit,bid=n.busy.id,dk=n.busy.doneKey;n.busy=null;n=apply(n,fn(n,physio(n)));
          // F5: start() stamps done[key].at at the moment the action is
          // CLICKED, so it can sit well before the busy timer actually
          // finishes — for a costly procedure (IV, a long drug push, a
          // multi-minute assessment) the "DONE — REGION" panel (below,
          // ~line 9520) would show the wrong instant, disagreeing with the
          // scrolling log's own t:n.t (which apply() above already stamps
          // correctly, at completion). Re-stamp here, once the action has
          // actually landed, so both readouts agree on when it happened.
          if(dk) n.done={...n.done,[dk]:{at:n.t}};
          // Limited-items: the effect only lands here (not at start()), so a
          // cancelled action correctly never consumes supply — matching
          // cancelAction()'s own "the effect only lands when the timer
          // completes" comment.
          if(limitedItemsActive(n)) consumeStock(n,stockIdForId(bid));
          if(n.forcedTask&&n.forcedTask.actId===bid){n.log=[...n.log,{t:n.t,kind:"good",text:`Order complete — command returns to you.`}];n.forcedTask=null;}
          if(cm) return resolve(n,null);}
        else n.busy={...n.busy,left:l};}
      const cb={...n.cBusy};
      Object.entries(cb).forEach(([cid,b])=>{const l=b.left-dt;
        if(l<=0){delete cb[cid];n=apply(n,b.fn(n,physio(n)));} else cb[cid]={...b,left:l};});
      n.cBusy=cb;

      /* Protocol-driven crew direction. A capable crew member — F14 broadened
         this from "a provider who OUTRANKS the player" to "a provider at or
         above the player's OWN level" — "runs the protocol": the engine reads
         the selected protocol against the live patient and puts free,
         capable crew onto the tasks it calls for (compressions, bagging,
         suction, monitor, vitals…). The old gate meant a same-level partner
         (the common case — your own EMT partner when you're an EMT) never
         helped autonomously at all, which is not how a real partner behaves;
         a peer follows the same protocol just as readily as a superior does.
         Throttled to a re-evaluation every few seconds; within one
         evaluation it assigns EVERY indicated task that has a hand for it
         (never overrides a hand already working a task — except an urgent
         one preempting non-urgent busywork, see below), and is skipped
         entirely once every rule's task is already running.

         Crew-AI batch: hand selection is now best-fit (lowest predicted
         failChance, the same realism model order() already uses) rather
         than first-array-match; the boss can pick up a task themself when no
         other free hand qualifies (previously always excluded); an
         auto-directed task now carries the SAME real fumble risk/morale cost
         a manually-ordered one does, via assignHand() below (reusing
         order()'s own willFail/morale logic, not a second copy of it); a
         genuinely urgent task (URGENT_TASKS) with no free hand can pull a
         crew member off non-urgent busywork instead of waiting; and nothing
         non-urgent/non-assessment auto-assigns until the patient has had
         SOME real assessment (a monitor device attached, or a vitals/
         glucose check completed) — a real partner checks before they treat,
         the same discipline the monitor task's own MONITOR_DEVICES gate
         already enforces for the player's manual order(). */
      if(n.onSceneAt){
        const boss=n.crew.find(c=>LEVELS[c.level].n>=LEVELS[n.level].n && !c.pilot);
        if(boss && n.t-(n.lastProtocol||0)>=4){
          const proto=getProtocol(n.protocol);
          const running=new Set(Object.values(n.cBusy).map(b=>b.taskId).filter(Boolean));
          const recs=evaluateProtocol(proto,{v:physio(n),s:n},running);
          let assigned=false;
          const assessed=!!(n.devices&&MONITOR_DEVICES.some(d=>n.devices[d]))||!!(n.vitals&&Object.keys(n.vitals).length>0);
          // Best-fit candidate for a task: every eligible crew member who
          // isn't the boss, scored by predicted failChance (lower wins) —
          // falling back to the boss themself only when nobody else
          // qualifies, so a solo provider (or a fully-occupied crew) still
          // gets the task done rather than leaving it unassigned.
          const pickHand=(t)=>{
            const nonBoss=n.crew.filter(c=>!c.pilot&&c.id!==boss.id&&LEVELS[c.level].n>=t.lvl&&!n.cBusy[c.id]&&!isTaskBlocked(c,t.id));
            const pool=nonBoss.length?nonBoss
              :(!n.cBusy[boss.id]&&LEVELS[boss.level].n>=t.lvl&&!isTaskBlocked(boss,t.id)?[boss]:[]);
            if(!pool.length) return null;
            return pool.reduce((best,c)=>
              failChance(effectiveCrewMorale(c,n.morale),t.lvl)<failChance(effectiveCrewMorale(best,n.morale),t.lvl)?c:best);
          };
          // Assign hand to task with the same real fumble-risk/morale-hit
          // model order() uses for a manual order — an auto-directed
          // intervention is no longer guaranteed-perfect.
          const assignHand=(hand,t,note)=>{
            if(t.monitor){ n.monitorBy=hand.id; n.lastMon=n.t-99;
              n.cBusy={...n.cBusy,[hand.id]:{name:hand.name,task:t.name,taskId:t.id,dur:9999,left:9999,startedAt:n.t,fn:()=>null}};
            } else {
              const willFail=Math.random()<failChance(effectiveCrewMorale(hand,n.morale),t.lvl);
              const fn=willFail?()=>({say:`${hand.name.toUpperCase()}: "Damn — that didn't go right."`,kind:"warn"}):crewFn(hand,t);
              n.cBusy={...n.cBusy,[hand.id]:{name:hand.name,task:t.name,taskId:t.id,dur:t.dur,left:t.dur,startedAt:n.t,fn}};
              if(willFail){ const hit=randRange(0,15);
                n.crew=n.crew.map(cm=>cm.id===hand.id?{...cm,morale:Math.max(0,(cm.morale??90)-hit)}:cm);
                n.roster=(n.roster||[]).map(p=>p.id===hand.id?{...p,morale:Math.max(0,(p.morale??90)-hit)}:p);
              }
            }
            n.log=[...n.log,{t:n.t,kind:"good",text:`${boss.name} directs ${hand.name}: ${t.name.toLowerCase()} — ${note}.`}];
          };
          // Two DIFFERENT rules can legitimately name the same task (e.g. LA
          // County's saline_shock/saline_rosc/saline_sepsis rules all point
          // at "salineBolus" from different clinical triggers) — `running`
          // above only reflects what was already in progress BEFORE this
          // cycle, so without this set two such recs would each find their
          // own free hand and double-assign the identical intervention to
          // two crew members at once. Tracked locally per cycle, not folded
          // into `running` itself (which evaluateProtocol also uses to
          // decide whether a rule fires at all, a broader/different check).
          const claimedThisCycle=new Set();
          for(const rec of recs){
            const t=TASKS.find(x=>x.id===rec.task); if(!t) continue;
            if(claimedThisCycle.has(t.id)) continue;
            if(exclGroupOf(t.id)&&exclConflict(n,t.id,null)) continue;   // don't double up a ventilation method
            if(t.monitor&&!MONITOR_DEVICES.some(d=>n.devices?.[d])) continue;   // nothing attached to read from yet
            if(t.attachDevice&&deviceRegionLocked(n,t.attachDevice)) continue;   // region still covered
            const urgent=URGENT_TASKS.has(t.id);
            const isAssessTask=!!(t.vitals||t.glucoseCheck||t.monitor||t.assessId||t.attachDevice);
            if(!urgent&&!isAssessTask&&!assessed) continue;   // assess before treat
            let hand=pickHand(t);
            if(!hand&&urgent){
              // No free/capable hand for a genuine life threat — pull a
              // crew member off non-urgent busywork instead of waiting.
              // Never preempts another urgent task, a held C-spine, or the
              // live monitor — those are structurally "must stay held."
              const candidate=n.crew.find(c=>!c.pilot&&c.id!==boss.id&&LEVELS[c.level].n>=t.lvl&&!isTaskBlocked(c,t.id)
                &&n.cBusy[c.id]&&!URGENT_TASKS.has(n.cBusy[c.id].taskId)
                &&n.cBusy[c.id].taskId!=="cspine"&&n.cBusy[c.id].taskId!=="monitor");
              if(candidate){
                n.log=[...n.log,{t:n.t,kind:"warn",text:`${boss.name} pulls ${candidate.name} off ${n.cBusy[candidate.id].task.toLowerCase()} — ${t.name.toLowerCase()} now.`}];
                const cb={...n.cBusy}; delete cb[candidate.id]; n.cBusy=cb;
                if(n.monitorBy===candidate.id) n.monitorBy=null;
                hand=candidate;
              }
            }
            if(!hand) continue;
            claimedThisCycle.add(t.id);
            assignHand(hand,t,rec.note);
            assigned=true;
          }
          if(assigned) n.lastProtocol=n.t;
        }
      }

      /* Continuous monitoring — a hand on the monitor keeps the numbers live in real time. */
      if(n.monitorBy){
        if(!n.crew.some(c=>c.id===n.monitorBy)){ n.monitorBy=null; }   // that hand left the scene
        else if(n.t-n.lastMon>=1){ const mv=physio(n);
          // Same equipment gate as the crew "Full set of vitals" task above
          // -- a live monitor can only refresh the specific readings a
          // device is actually attached for. BP cycles automatically once
          // the cuff is on (real NIBP behavior); a continuous SpO2 trace
          // needs the pulse ox specifically, not just "some device."
          n.vitals={...n.vitals,HR:{value:`${mv.hr}`,at:n.t},RR:{value:`${mv.rr}`,at:n.t},
            ...(n.devices?.bpcuff?{"BP (R)":{value:`${mv.sbp}/${mv.dbp}`,at:n.t}}:{}),
            ...(n.devices?.pulseox?{"SpO₂":{value:`${mv.spo2}%`,at:n.t}}:{})};
          n.lastMon=n.t; }
      }

      /* A transmitted 12-lead comes back read by the base physician after a
         short delay — this is how a sub-paramedic provider legally gets an
         interpretation. It lands on the Monitor tab. */
      if(n.ecgTxAt!=null && n.t-n.ecgTxAt>=15){
        const rv=physio(n); const read=ecgLiveText(n,rv)||"Rhythm unclear on the transmitted strip.";
        n.ecgInterp=read; n.ecgTxAt=null;
        n.log=[...n.log,{t:n.t,kind:"disp",text:`BASE: "We have your twelve-lead. Read is — ${read}"`}];
      }

      /* Automated cuff cycling in the background — after ~30s it lands an
         APPROXIMATE pressure (rounded, slight jitter) into the vitals without
         tying up the player's hands. Manual BP is the exact number but you
         have to stand there for the full cycle to get it. */
      if(n.autoBPAt!=null && n.t-n.autoBPAt>=30){
        const bv=physio(n); const jit=(x)=>5*Math.round((x+(Math.random()*8-4))/5);
        const asbp=jit(bv.sbp), adbp=jit(bv.dbp);
        n.vitals={...n.vitals,"BP (R)":{value:`${asbp}/${adbp}`,at:n.t}};
        n.log=[...n.log,{t:n.t,kind:"obs",text:`Auto-cuff: ${asbp}/${adbp} (approximate).`}];
        n.autoBPAt=null;
      }

      /* Attached devices report their own readings once a second, independent
         of a crew member holding the monitor. Pulse ox → SpO₂ + PR; capno →
         EtCO₂; art line → BP. Removing the device stops these updates. */
      if(n.devices&&Object.keys(n.devices).length&&n.t-n.devTick>=1){
        const dv=physio(n); let vit={...n.vitals};
        Object.keys(n.devices).forEach(id=>{const d=DEVICES[id];
          const r=d&&d.reads&&d.reads(dv); if(r) Object.entries(r).forEach(([k,val])=>{vit[k]={value:val,at:n.t};});});
        n.vitals=vit; n.devTick=n.t;
      }

      /* The patient no longer dies on scene or in the truck — only the hospital doors
         decide it. Mid-run, a DANGER SIGN is noted in the narrative the moment it's
         instantaneously true (so you can see it coming and try to pull them back), but
         the run continues. The actual outcome is decided by critical(), which only
         returns non-null once a lethal mechanism has been sustained long enough to be
         irreversible — see physio/mortality.js. */
      const vNow=physio(n);
      const arr=arrestWarning(vNow,n);
      if(arr){ if(!n.arrestLogged){ n.arrestLogged=1;
          n.log=[...n.log,{t:n.t,kind:"crit",text:"★ "+arr.cause.toUpperCase()+": "+arr.story}]; } }
      else n.arrestLogged=0;   // pulled back from the brink — the flag resets

      /* VISIBLE emergent clinical events, general and physiology-driven, not
         scenario-scripted. physio(n) just ran (above, via arrestWarning), so
         n.patient is fresh this tick. Edge-triggered against the PREVIOUS
         tick's own flags (n._seizingFlag/n._unresponsiveFlag, carried on the
         state object itself) — a continuous state crossing INTO the alerted
         condition fires once, not every tick it stays true. Deliberately
         restricted to things a bystander could actually SEE happen with no
         equipment: a seizure starting, or a patient going from
         talking/responsive to genuinely unresponsive. Explicitly NOT here:
         the onset of cardiac arrest itself (arr, just above) — there is no
         way to visually determine a rhythm changed; only its downstream,
         visible consequence (the patient going unresponsive) is alertable,
         and that's already covered by the consciousness check below. */
      if(n.patient){
        const wasSeizing=!!n._seizingFlag, isSeizing=!!n.patient.seizing;
        if(isSeizing&&!wasSeizing) n.eventAlertQueue=[...(n.eventAlertQueue||[]),
          {id:`seize_${Math.round(n.t)}`,text:"The patient begins seizing."}];
        else if(!isSeizing&&wasSeizing) n.eventAlertQueue=[...(n.eventAlertQueue||[]),
          {id:`seizeend_${Math.round(n.t)}`,text:"The seizure has stopped."}];
        n._seizingFlag=isSeizing;
        const wasUnresponsive=!!n._unresponsiveFlag,
          isUnresponsive=n.patient.consciousness==="unconscious"||n.patient.consciousness==="coma";
        if(isUnresponsive&&!wasUnresponsive) n.eventAlertQueue=[...(n.eventAlertQueue||[]),
          {id:`unresp_${Math.round(n.t)}`,text:"The patient stops responding."}];
        else if(!isUnresponsive&&wasUnresponsive) n.eventAlertQueue=[...(n.eventAlertQueue||[]),
          {id:`recover_${Math.round(n.t)}`,text:"The patient starts responding again."}];
        n._unresponsiveFlag=isUnresponsive;

        /* F0 — crew-voiced reaction to the SAME edge-triggered events, both
           directions now, a real consumer for DialoguePanel's own "CREW"
           speaker styling (built earlier for this, never actually fed until
           an earlier session — a real "written but unread" gap, the same
           class the treatment_improving fix closed). The recovery/seizure-
           ended reverse edges are new this session: the flags going back to
           false was previously silent on both channels (banner and crew
           voice) — a real, previously-missed transition, not a duplicate of
           the onset lines. Only fires with a real crew member present on
           scene — an unattended patient obviously has nobody to voice this. */
        if(n.crew&&n.crew.length&&(n.phase==="scene"||n.phase==="transport")){
          // Per-NPC brain: pick a real, specific crew member to voice this
          // moment (characterBrain.js's resolveActingCrew — stable across a
          // call, not a fresh random pick each event) and carry their id on
          // the event itself, so buildDialogueContext/buildPrompt's own brain
          // lookup (dialogueProvider.js) scopes the Tier-3 prompt to THAT
          // person's own name/personality instead of an anonymous "crew
          // member." actingName also labels the log line directly (below),
          // so even the Tier-1/2 fallback — which never touches the brain —
          // already shows a real name, not just a generic "CREW" tag.
          const actingCrew=resolveActingCrew(n.crew,null);
          const actingName=actingCrew?.name||null;
          // The stable per-NPC memory-store key for whichever crew member is
          // voicing this moment (characterBrain.js's npcId) — computed once
          // here so both the immediate line and the async tier-3 patch below
          // remember into the SAME bucket for the SAME person.
          const cid=npcId("crew",actingCrew?.id);
          const evt=(isSeizing&&!wasSeizing)?{type:"crew_seizure_reaction",speaker:"crew",bucket:"calm",crewId:actingCrew?.id}
            :(!isSeizing&&wasSeizing)?{type:"crew_seizure_ended_reaction",speaker:"crew",bucket:"calm",crewId:actingCrew?.id}
            :(isUnresponsive&&!wasUnresponsive)?{type:"crew_unresponsive_reaction",speaker:"crew",bucket:"calm",crewId:actingCrew?.id}
            :(!isUnresponsive&&wasUnresponsive)?{type:"crew_recovery_reaction",speaker:"crew",bucket:"calm",crewId:actingCrew?.id}:null;
          if(evt){
            const line=generateDialogueSync(evt,n,vNow);
            if(line){
              const entryId=`dlg_crew_${Math.round(n.t*10)}`;
              n.log=[...n.log,{t:n.t,id:entryId,...dialogueLineFor(line.speaker,line.text,actingName)}];
              n.dialogueMemory=pushDialogueMemory(n.dialogueMemory,line.text);
              n.dialogueLastAt=n.t;
              // Per-NPC memory: this specific crew member now "remembers"
              // having said this, for the rest of the call (characterBrain.js).
              n.npcBrains=rememberNpcLine(n.npcBrains,cid,"crew",actingName,line.text);
              // F0 — same fire-and-forget tier-3 upgrade pattern as the
              // unprompted-patient-dialogue site above (requestLocalUpgrade's
              // own header): the immediate line is always tier 2/1, rendered
              // synchronously; if a real local model resolves before its own
              // timeout, it patches THIS SAME log entry by id, outside this
              // synchronous reducer. If by the time it resolves the entry has
              // scrolled off the log (or the log has moved on), the .map()
              // below simply finds no match and changes nothing — a silent,
              // safe discard, not a stale-patch bug.
              // Same convention as dialogueMemory above: the per-NPC "own
              // memory" remembers the line at the moment it was generated
              // (the tier-2/1 text), not a second, redundant entry if a
              // tier-3 upgrade later polishes the same log line's wording.
              requestLocalUpgrade(evt,n,vNow,(upgraded)=>{
                setG(s2=>({...s2,log:s2.log.map(e=>
                  e.id===entryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,actingName)}:e)}));
              });
            }
          }
        }

        /* F0 item 15 — a present family/bystander reacting to the SAME two
           edges crew reacts to above, in a distinct, non-clinical, panicked
           voice (bystander_seizure_reaction/bystander_unresponsive_reaction,
           dialogueProvider.js). Scene-phase only, unlike crew's scene+
           transport — a bystander doesn't ride in the truck. Presence comes
           from dialogueContext.js's bystanderRole()/scenarioBystanderText():
           the scenario's own real `bystanders` flavor text, not a fabricated
           trigger. Reverse edges (seizure ending, patient recovering) are
           deliberately NOT covered — relief is a real crew beat but adding a
           bystander voice for it too is exactly the "exhaustive bystander
           dialogue system" this slice is scoped to avoid; two real trigger
           moments is enough to prove the architecture reuses cleanly. */
        if(n.phase==="scene"&&((isSeizing&&!wasSeizing)||(isUnresponsive&&!wasUnresponsive))){
          const bctx=buildDialogueContext(n,vNow);
          if(bctx?.bystander?.present){
            const bevt=(isSeizing&&!wasSeizing)
              ?{type:"bystander_seizure_reaction",speaker:"bystander",bucket:"calm"}
              :{type:"bystander_unresponsive_reaction",speaker:"bystander",bucket:"calm"};
            const bline=generateDialogueSync(bevt,n,vNow);
            if(bline){
              const bEntryId=`dlg_byst_${Math.round(n.t*10)}`;
              n.log=[...n.log,{t:n.t,id:bEntryId,...dialogueLineFor(bline.speaker,bline.text,bctx.bystander.role)}];
              n.dialogueMemory=pushDialogueMemory(n.dialogueMemory,bline.text);
              n.dialogueLastAt=n.t;
              n.npcBrains=rememberNpcLine(n.npcBrains,npcId("bystander"),"bystander",bctx.bystander.role,bline.text);
              requestLocalUpgrade(bevt,n,vNow,(upgraded)=>{
                setG(s2=>({...s2,log:s2.log.map(e=>
                  e.id===bEntryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,bctx.bystander.role)}:e)}));
              });
            }
          }
        }
      }

      /* F0 — unprompted patient dialogue (items 18-19): a real, physiology-
         gated chance for the patient to speak on their own, cooldown-limited
         (dialogueManager's own UNPROMPTED_MIN_GAP_SEC) so it never interrupts
         constantly. Reuses vNow (already computed above for arrestWarning) —
         no extra physio() call. The IMMEDIATE line is always tier 2/1,
         rendered synchronously — this never waits on tier 3, per item 27
         (a WebGPU model load/generation can take seconds; nothing in the
         tick loop may block on that). If a real local model is genuinely
         available on this device, a tier-3 upgrade is requested in the
         BACKGROUND (see requestLocalUpgrade's own header) and, if it
         resolves before its own timeout, silently replaces this SAME log
         entry's text/tier a moment later via the async setG call below —
         outside this synchronous reducer, so it can never stall a tick. */
      if((n.phase==="scene"||n.phase==="transport")&&n.patient){
        const dctx=buildDialogueContext(n,vNow);
        if(dctx&&shouldSpeakUnprompted(dctx,n.dialogueLastAt,n.t)){
          const evt=pickUnpromptedEvent(dctx);
          const line=generateDialogueSync(evt,n,vNow);
          if(line){
            const entryId=`dlg_${Math.round(n.t*10)}`;
            n.log=[...n.log,{t:n.t,id:entryId,...dialogueLineFor(line.speaker,line.text,null,n.idKnown?n.patientName:null)}];
            n.dialogueMemory=pushDialogueMemory(n.dialogueMemory,line.text);
            n.dialogueLastAt=n.t;
            n.npcBrains=rememberNpcLine(n.npcBrains,npcId("patient"),"patient",n.idKnown?n.patientName:null,line.text);
            requestLocalUpgrade(evt,n,vNow,(upgraded)=>{
              setG(s2=>({...s2,log:s2.log.map(e=>
                e.id===entryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,null,s2.idKnown?s2.patientName:null)}:e)}));
            });
          }
        }
      }
      /* F0 — treatment-response dialogue (item 18): closes a real, found
         gap — TemplateProvider already declared a treatment_improving
         template with zero callers anywhere in the codebase. Fires once
         per analgesic dose, only if pain has ACTUALLY fallen since the
         dose was given (seeded in medActs' own run() handler) — a real,
         measured response, not a scripted one. The window gives the
         drug's own onset time to act (fentanyl 60s, morphine 90s) without
         waiting so long the line reads disconnected from the dose; if the
         window closes with no real improvement, or the patient can no
         longer speak, the check simply expires with no line rather than
         firing a stale or dishonest "that helped." */
      if(n._analgesiaCheckAt!=null&&n.patient){
        const elapsed=n.t-n._analgesiaCheckAt;
        if(elapsed>240||vNow._cons!=="awake"){
          n._analgesiaCheckAt=null;
        } else if(elapsed>=15&&vNow.pain<=n._analgesiaBaselinePain-2){
          const dctx=buildDialogueContext(n,vNow);
          const evt={type:"treatment_improving"};
          const line=dctx&&generateDialogueSync(evt,n,vNow);
          if(line){
            const entryId=`dlg_tx_${Math.round(n.t*10)}`;
            n.log=[...n.log,{t:n.t,id:entryId,...dialogueLineFor(line.speaker,line.text,null,n.idKnown?n.patientName:null)}];
            n.dialogueMemory=pushDialogueMemory(n.dialogueMemory,line.text);
            n.dialogueLastAt=n.t;
            n.npcBrains=rememberNpcLine(n.npcBrains,npcId("patient"),"patient",n.idKnown?n.patientName:null,line.text);
            // F0 — same fire-and-forget tier-3 upgrade pattern as the other
            // dialogue call sites in this same tick loop. Discards silently
            // (via the .map() no-match case) if this entry has scrolled off
            // the log by the time it resolves.
            requestLocalUpgrade(evt,n,vNow,(upgraded)=>{
              setG(s2=>({...s2,log:s2.log.map(e=>
                e.id===entryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,null,s2.idKnown?s2.patientName:null)}:e)}));
            });
          }
          n._analgesiaCheckAt=null;
        }
      }
      if(n.phase==="transport"&&n.transportT>=effTransportTime(S,n.destHospitalType,n)){
        // Recurring ER staff — a specific doctor and nurse from the save's own
        // roster receive the patient, not an invented-on-the-spot pair.
        const hs=n.hospitalStaff;
        const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
        // A ventilated/CPAP patient gets a respiratory therapist at the doors
        // too, and a patient arriving in arrest gets a tech on the crash cart —
        // real (if small) uses for erTechs/respTherapists, not just a name pool
        // nobody reads.
        const vented=doseActive(n,"vent")||doseActive(n,"cpap")||doseActive(n,"bvm")||!!n.devices?.vent;
        const receivingTeam=hs?{doc:pick(hs.erDoctors),nurse:pick(hs.erNurses),
          rt:vented?pick(hs.respTherapists):null, tech:n.arrestLogged?pick(hs.erTechs):null}:null;
        // F44: snapshot outcomeReport(n) here too, same reasoning as
        // arrivalArrest above — n.phase is still "transport" at this point
        // (only the RETURNED object's phase reads "arrived"), and physio(n)
        // has already run inline in arrivalArrest's own evaluation, so
        // n.patient is populated. Carries forward through withPI/creditOutcome
        // at pickImpression() below, which is the actual "debrief" transition.
        return {...n,phase:"arrived",busy:null,arrivalArrest:critical(physio(n),n),physioOutcome:outcomeReport(n),receivingTeam,
          log:[...n.log,{t:n.t,kind:"beat",text:receivingTeam
            ?`Backing into the bay. ${receivingTeam.doc.name} and ${receivingTeam.nurse.name} meet you at the doors — give them your impression.`
            :"Backing into the bay. Doors open — give them your impression."}]};}
      // Granular equipment realism: finite oxygen supply. Real EMS D-cylinder
      // duration formula (0.16 L/psi constant for a D cylinder, 200 psi safe
      // residual): minutes = (psi - 200) * 0.16 / flow_lpm — rearranged, psi
      // depletes at flow_lpm/0.16 per minute. Mouth-to-mask/mouth-to-mouth use
      // exhaled/room air, not a tank, so they're not in this table. Only one
      // O2-tank device is ever realistically in use at a time; if more than
      // one dose happens to be active, the higher flow rate governs.
      if((n.phase==="scene"||n.phase==="transport")){
        const O2_FLOW_LPM={o2nc:4,o2nrb:15,bvm:15,vent:15,cric:15};
        const activeO2=Object.keys(O2_FLOW_LPM).filter(id=>doseActive(n,id));
        const flow=activeO2.length?Math.max(...activeO2.map(id=>O2_FLOW_LPM[id])):0;
        if(flow>0&&(n.o2Psi??2000)>200){
          n.o2Psi=Math.max(0,(n.o2Psi??2000)-(flow/0.16)*(dt/60));
          if(n.o2Psi<=200){
            // Tank hit its safe-residual reserve — delivery stops for real,
            // the same as a rescuer discovering an empty cylinder mid-call.
            n.doses=n.doses.filter(d=>!activeO2.includes(d.id));
            n.log=[...n.log,{t:n.t,kind:"crit",text:"⚠ Oxygen tank hit its reserve — delivery has stopped. Swap the cylinder."}];
          }
        }
      }
      if(n.phase==="scene"&&n.onSceneAt&&(n.t-n.onSceneAt)>=S.limit) return resolve(n,critical(physio(n),n));
      return n;
    }),100);
    return ()=>clearInterval(iv);
  // F18: settingsOpen/loadOpen/confirmDeath/achievementsOpen all gate the guard
  // above but were missing here. If a real dep (e.g. speed) changed while one of
  // them was true, the effect tore down and recreated, the new run's guard saw
  // the flag still true and returned without starting an interval, and because
  // the flag itself wasn't a dep, clearing it later never re-fired the effect —
  // the clock stayed dead permanently instead of resuming. Now closing any of
  // these modals re-runs the effect and starts a fresh interval.
  //
  // crewFn/doseActive/exclConflict/exclGroupOf/handoffResolve/resolve are
  // deliberately NOT deps: every one of them is a plain closure recreated
  // fresh on every render (none are memoized), so adding them would tear
  // down and rebuild this setInterval on every render instead of only on
  // the meaningful transitions above — reintroducing exactly the
  // interval-churn class of bug this same comment already documents one
  // instance of. The setInterval callback always reads the CURRENT s via
  // setG's updater, so it never needs these to be fresh via the deps array.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[g.phase,g.scen,g.speed,g.micnOpen,g.newUnit,g.settingsOpen,g.loadOpen,g.confirmDeath,g.achievementsOpen,g.relationshipsOpen,g.ch1TutorialActive,g.accessMinigame]);

  // The interactive first-call tutorial (TutorialCoachmark.jsx, mounted from
  // Shell.jsx): auto-starts the instant benignFaint — the real first call in
  // the fixed tutorial queue, not the heat-stroke prologue sim — reaches the
  // scene phase, and never again once ch1TutorialDone is set (persisted in
  // CARRY, see blank()). Gated on isTutorialShift/career.idx===0 rather than
  // just scen==="benignFaint" so a later, non-tutorial call that happens to
  // reuse the same scenario (CH1_CALL_POOL/general Layperson play) never
  // re-triggers it.
  useEffect(()=>{
    if(g.phase==="scene"&&g.scen==="benignFaint"&&isTutorialShift(g)&&g.career?.idx===0
      &&!g.ch1TutorialDone&&!g.ch1TutorialActive){
      // Deferred a tick rather than called synchronously in the effect body
      // (react-hooks/set-state-in-effect) — same fix shape this project's
      // own driving-minigame countdown already uses for the identical rule.
      const t=setTimeout(()=>setG(s=>({...s,ch1TutorialActive:true,ch1TutorialStep:0})),0);
      return ()=>clearTimeout(t);
    }
    // isTutorialShift(g) reads the whole g object (career.queue) rather than
    // a single field already in the deps array below — same pattern as the
    // tick-loop effect a few lines up, which documents why its own similar
    // closures are deliberately excluded from its deps array rather than
    // retriggering this effect on every unrelated g change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[g.phase,g.scen,g.career?.idx,g.ch1TutorialDone,g.ch1TutorialActive]);

  const start=(a)=>setG(s=>{if(s.busy||!["scene","transport"].includes(s.phase))return s;
    // Real interactive mini-games (uncap/angle/insert for IV/IO; a view
    // step + tube pass for laryngoscopy/ETT; a sequenced landmark-incise-
    // tube for cric; a blind angle+depth for SGA) replace the flat
    // busy-timer for these six procedures — see AccessMinigame.jsx,
    // AirwayMinigame.jsx, CricMinigame.jsx, SGAMinigame.jsx and access.js.
    // `a._skipMinigame` is the re-entry flag: once a mini-game resolves
    // successfully, resolveAccessMinigame() re-invokes start() with it set
    // so the REST of this function's own logic (fumble/stumble, fitMult,
    // the busy-timer, fn composition) runs completely unchanged — the
    // mini-game only replaces how the ATTEMPT itself is decided, not what
    // a successful procedure does afterward.
    //
    // DELIBERATE, per explicit operator instruction: these six can fail in
    // EVERY mode, including Sandbox/Medical Simulation — not gated on
    // `s.gmode!=="sandbox"` the way section 4's plan originally scoped
    // failure. Real failure here has training value ("the player can now
    // fail here because it just makes sense for training purposes"), a
    // deliberate, scoped exception to the general "Sandbox never fails"
    // rule every other action in this game still honors. Do not add a
    // Sandbox gate here to "fix" this — it would be undoing an explicit
    // design decision, not closing a gap.
    if(["iv","io","laryngoscopy","ett","cric","sga","prep","pupils"].includes(a.id)&&!a._skipMinigame){
      // alertBaseline: how many eventAlertQueue entries existed the moment
      // this attempt opened (spec 2.5's escape hatch — see the tick-loop
      // comment above this function's own resolveAccessMinigame). Sim time
      // keeps running underneath the mini-game now, so if that count grows
      // while it's open, something the player could see happened (seizure
      // onset, going unresponsive, a scripted crit event) — a real reason to
      // reach for "Abandon", distinct from "Cancel" (walking away for no
      // reason nothing prompted).
      return {...s,accessMinigame:{action:a,kind:a.id,site:a.region,
        attempts:(s.accessAttempts||{})[`${a.id}@${a.region}`]||0,
        alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    // Tourniquet, needle decompression, chest seal, BVM and defibrillation.
    // Stethoscope exam: real recordings retimed to the engine's exact rates.
    if((a.id==="lungs"||a.id==="heart")&&!a._skipMinigame){
      // A stethoscope needs skin: the chest has to be bared first.
      if(!s.exposed?.torso) return {...s,log:[...s.log,{t:s.t,kind:"warn",
        text:"You can't hear anything through their shirt. Expose the chest first."}]};
      return {...s,accessMinigame:{action:a,kind:"auscultate",mode:a.id==="lungs"?"lungs":"heart",site:a.region,
        attempts:0,alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    // BVM is a continuous, live session (BvmMinigame), not a one-shot sequence.
    if(a.id==="bvm"&&!a._skipMinigame){
      return {...s,accessMinigame:{action:a,kind:"bvm",site:a.region,
        attempts:0,alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    // Extremity splinting: unique per limb (arm/leg, left/right — right
    // pulse site and joints) and unique per material (rigid/cardboard vs
    // vacuum), distinct from the generic flat-timer ProcMinigame below.
    if(a.id==="splint"&&!a._skipMinigame){
      return {...s,accessMinigame:{action:a,kind:"splint",site:a.region,
        attempts:(s.accessAttempts||{})[`splint@${a.region}`]||0,
        alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    // Manual blood pressure: a real arm, a real cuff, listen for the sounds
    // yourself — distinct from autoBP, which stays a flat cycling wait since
    // an automatic cuff needs no technique. Needs the cuff already applied
    // (DeviceMinigame's own bpcuff attach) — if it isn't, fall through to the
    // normal proc-action path below so the existing "no cuff" warning fires.
    if(a.id==="manualBP"&&!a._skipMinigame&&s.devices?.bpcuff){
      return {...s,accessMinigame:{action:a,kind:"bp",site:a.region,
        attempts:(s.accessAttempts||{})[`manualBP@${a.region}`]||0,
        alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    // Bleeding control: tourniquet, wound packing and direct pressure are
    // one real sequence (BleedingControlMinigame) instead of three separate
    // flat actions — direct pressure first, then a real branch to packing
    // or a tourniquet, one-handed or crew-assisted two-handed.
    if(["tq","pack","directPressure"].includes(a.id)&&!a._skipMinigame&&PROCS[a.id]){
      const isLimb=LIMBS.includes(a.region);
      const availableCrew=(s.crew||[]).filter(c=>!s.cBusy[c.id]).map(c=>({id:c.id,name:c.name}));
      return {...s,accessMinigame:{action:a,kind:"bleedingControl",site:a.region,isLimb,availableCrew,
        attempts:(s.accessAttempts||{})[`${a.id}@${a.region}`]||0,
        alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    // AED/defibrillator/cardioversion/pacing: a real device screen
    // (MonitorScreenMinigame), not the generic torso+pads ProcMinigame
    // scene. aedAnalyze previously had NO minigame at all. screenType
    // distinguishes a screenless BLS/EMT-scope AED from a paramedic's
    // monitor running in AED mode (both aedAnalyze/aedShock, lvl 0) from
    // the full manual monitor-defibrillator (defib/cardiovert/pacing, all
    // lvl 4 already) — a real equipment-tier distinction, not decorative.
    if(["aedAnalyze","aedShock","defib","cardiovert","pacing"].includes(a.id)&&!a._skipMinigame&&PROCS[a.id]){
      const screenType=(a.id==="aedAnalyze"||a.id==="aedShock")?(L>=4?"aedScreen":"aedBasic"):"monitorDefib";
      return {...s,accessMinigame:{action:a,kind:"monitor",site:a.region,procId:a.id,procName:PROCS[a.id].name,screenType,
        attempts:(s.accessAttempts||{})[`${a.id}@${a.region}`]||0,
        alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    if(["needleD","chestSeal","headTilt","jawThrust","cCollar","cspine","opa","npa","suction","o2nc","o2nrb","fundalMassage","recovery","abdThrust","traction","ultrasound",
      "icdMagnet","chestTube","lucas","pelvicBinder","artLine","reboa","paCath","cpap","vent","mouthMask","mouthMouth"].includes(a.id)&&!a._skipMinigame&&PROCS[a.id]){
      return {...s,accessMinigame:{action:a,kind:"proc",site:a.region,procId:a.id,procName:PROCS[a.id].name,
        attempts:(s.accessAttempts||{})[`${a.id}@${a.region}`]||0,
        alertBaseline:(s.eventAlertQueue||[]).length}};
    }
    // Glucometer, device application and hands-on CPR minigames.
    if((a.id==="gluc"||a.id==="cpr"||/^attach_/.test(a.id))&&!a._skipMinigame){
      const devId=/^attach_/.test(a.id)?a.id.slice(7):null;
      if(!devId||DEVICES[devId]){
        return {...s,accessMinigame:{action:a,kind:devId?"device":a.id,site:a.region,deviceId:devId,deviceName:devId?DEVICES[devId].name:"",
          attempts:(s.accessAttempts||{})[`${a.id}@${a.region}`]||0,
          alertBaseline:(s.eventAlertQueue||[]).length}};
      }
    }
    // Route-shaped drug administration (GiveMedMinigame.jsx). Contraindication
    // holds and a tourniquet-occluded line fall through to the normal path so
    // their warning still fires instead of wasting a minigame.
    if(a.drug&&!a._skipMinigame&&DRUGS[a.drug]){
      const d=DRUGS[a.drug];
      // Contraindication, tourniquet and max-dose problems no longer skip the
      // game: they become a warning + confirmation screen, and the player can
      // still proceed (a._override, read by medActs()'s run()).
      const warnings=[];
      const held=d.hold&&d.hold(physio(s));
      if(held) warnings.push(held);
      const lineOnlyRoute=(d.route.includes("IV")||d.route.includes("IO"))&&!d.route.includes("IM")&&!d.route.includes("IN");
      if(lineOnlyRoute&&s.done?.[`tq@${a.region}`]) warnings.push("The tourniquet is still on this limb. Nothing pushed below it reaches central circulation.");
      if(d.max&&(s.given[a.drug]||0)>=d.max) warnings.push(`Maximum dose reached (${d.max}). Stop, or call Base.`);
      {
        const r=d.route;
        const lineOnly=(r.includes("IV")||r.includes("IO"))&&!r.includes("IM")&&!r.includes("IN");
        const accessOptions=(s.accessTypes||{})[a.region]||["IV"];
        // Fluid bags and drip pressors don't go in via a syringe push — you
        // hang them (spike the bag/premix, prime the tubing, connect, set a
        // real drip/pump rate), a genuinely different real skill from
        // GiveMedMinigame's push-bolus flow. HangMinigame handles both.
        if(lineOnly&&(d.pkModel==="fluid"||d.drip)){
          return {...s,accessMinigame:{action:a,kind:"hang",site:a.region,access:accessOptions[0],accessOptions,
            drugId:a.drug,drugName:d.name,fluidMode:d.pkModel==="fluid",warnings,
            attempts:(s.accessAttempts||{})[`give@${a.id}`]||0,
            alertBaseline:(s.eventAlertQueue||[]).length}};
        }
        const mode=lineOnly?"line":r.includes("IM")?"im":r.includes("IN")?"in":/NEB|INH/.test(r)?"neb":"oral";
        return {...s,accessMinigame:{action:a,kind:"give",site:a.region,mode,access:accessOptions[0],accessOptions,drugName:d.name,pushRate:d.pushRate,warnings,
          attempts:(s.accessAttempts||{})[`give@${a.id}`]||0,
          alertBaseline:(s.eventAlertQueue||[]).length}};
      }
    }
    const pr=a.probe&&(scenOf(s).probes||{})[a.probe];
    // Zero-To-Hero campaign only (design doc §1.3.1/§1.3.3) — every player
    // action outside "zth" is completely unaffected by any of this block,
    // since fitness/confidence/knowledge/fatigue sit fixed at their blank()
    // defaults for every other save. Low confidence/knowledge can fumble the
    // action outright (a genuinely new mechanic — player actions previously
    // always succeeded, unlike crew's own failChance roll); fitness affects
    // only the SPEED of physically demanding actions, via effectiveFitness
    // (fatigue-discounted) — see campaign.js for both formulas.
    const zth=s.learningMode==="zth";
    // §1.5.1: "at 100 [fatigue], the player may randomly stumble." A
    // distinct roll from the confidence/knowledge fumble below (mutually
    // exclusive — only one message per action), gated at the stumble
    // threshold rather than the 80 warning threshold. The other half of
    // §1.5.1's sentence ("or have slowed action speed") is already covered,
    // not new: effectiveFitness (campaign.js) already steepens its penalty
    // past fatigue 80, so fitMult below is already slower once fatigue
    // crosses that warning threshold.
    // No random fumble or stumble once the player has done the minigame: a
    // successful attempt (a._skipMinigame re-entry) is decided by their own
    // technique, not a dice roll. Actions without a minigame keep both rolls.
    const viaMinigame=!!a._skipMinigame;
    const stumbled=zth&&!viaMinigame&&(s.fatigue||0)>=FATIGUE_STUMBLE_THRESHOLD&&Math.random()<FATIGUE_STUMBLE_CHANCE;
    const fumbled=!stumbled&&zth&&!viaMinigame&&Math.random()<campaignFumbleChance(s.confidence,s.knowledge);
    const fn=stumbled
      ?()=>({say:"You stumble, dangerously exhausted — that didn't land.",kind:"warn"})
      :fumbled
      ?()=>({say:"Your hands aren't quite there yet — that didn't land the way you meant to.",kind:"warn"})
      :(n,v)=>{const b=a.run?a.run(n,v,a):null;const r=pr?pr(n,v):null;return r?{...(b||{}),...r}:b;};
    // F1: an action performed above the player's own certification level only
    // reaches here because the scope-OVERRIDE switch let it through (why()'s
    // lock check exempts overridden ids) — record it so sandboxRating's
    // practice axis can penalize out-of-scope usage, per the hook this file
    // used to carry as a comment ("once the scope-override ships...").
    const oos=(a.lvl>L&&L<5)?{...s.oosUsed,[a.id]:(s.oosUsed[a.id]||0)+1}:s.oosUsed;
    const physical=zth&&PHYSICAL_ACTION_IDS.has(a.id);
    const fitMult=physical?fitnessCostMult(effectiveFitness(s.fitness,s.fatigue)):1;
    // F4: the between-call skill-check minigame earns a speed boost (a cost
    // multiplier <1) applied to every one of the player's own actions for the
    // rest of that single call — same knob the game already varies per-drug
    // (dur:t.dur>9000?...) rather than a new timing system.
    const dur=a.cost*(s.speedBoost||1)*fitMult;
    const fatigue=physical?clampFatigue((s.fatigue||0)+FATIGUE_PER_PHYSICAL_ACTION):s.fatigue;
    // F0 item 23: dialogue during a procedure, not just before/after it — a
    // real hands-on action (dur>=10s, this game's own already-established
    // "meaningful, not a quick check" line for procedural cost) has a real
    // chance of a discomfort reaction from a conscious patient. Deliberately
    // NOT restricted to a hand-picked list of "painful" action ids — no such
    // list exists in this codebase, and guessing one would misfire on plenty
    // of non-painful long actions — so this is an honest, coarse duration
    // heuristic rather than a precise per-procedure mechanism; the true fix
    // (a real pain-consequence flag per procedure) is bigger scope than this
    // batch, see CLAUDE.md queue item F0. The six real mini-game procedures
    // (iv/io/laryngoscopy/ett/cric/sga, above) don't reach this path at all —
    // they resolve through their own components, which don't yet generate
    // dialogue either; left open for the same reason.
    let dlgPatch={};
    // F0 item 17 depth follow-up: torso exposure (clothing.js's own
    // "Remove shirt" / "Lift shirt" / "Cut shirt" actions, exposureActs
    // above) is the one real, already-existing gameplay event this codebase
    // has that genuinely fits the "embarrassed" emotional state — a
    // conscious patient's chest bared in front of the crew (and any
    // bystanders on scene), not a fabricated trigger. Checked BEFORE the
    // generic procedure_discomfort heuristic below (and independent of its
    // dur>=10 gate, since the "Cut shirt" shears variant is a fast 5s
    // action but the same social moment) so it fires its own distinct
    // exposure_reaction/embarrassed line instead of being swallowed by the
    // generic pain reaction.
    const isTorsoExposure=/^(undress|rollup|shears)_torso$/.test(a.id);
    if(isTorsoExposure&&s.patient?.consciousness==="awake"){
      const exEvt={type:"exposure_reaction",bucket:"embarrassed"};
      const exV=physio(s);
      const line=generateDialogueSync(exEvt,s,exV);
      if(line){
        const entryId=`dlg_${a.id}_${Math.round(s.t*10)}`;
        dlgPatch={log:[...s.log,{t:s.t,id:entryId,...dialogueLineFor(line.speaker,line.text,null,s.idKnown?s.patientName:null)}],
          dialogueMemory:pushDialogueMemory(s.dialogueMemory,line.text),
          npcBrains:rememberNpcLine(s.npcBrains,npcId("patient"),"patient",s.idKnown?s.patientName:null,line.text)};
        requestLocalUpgrade(exEvt,s,exV,(upgraded)=>{
          setG(s2=>({...s2,log:s2.log.map(e=>
            e.id===entryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,null,s2.idKnown?s2.patientName:null)}:e)}));
        });
      }
    } else if(dur>=10&&s.patient?.consciousness==="awake"&&Math.random()<0.45){
      const pdEvt={type:"procedure_discomfort"};
      const pdV=physio(s);
      const line=generateDialogueSync(pdEvt,s,pdV);
      if(line){
        const entryId=`dlg_${a.id}_${Math.round(s.t*10)}`;
        dlgPatch={log:[...s.log,{t:s.t,id:entryId,...dialogueLineFor(line.speaker,line.text,null,s.idKnown?s.patientName:null)}],
          dialogueMemory:pushDialogueMemory(s.dialogueMemory,line.text),
          npcBrains:rememberNpcLine(s.npcBrains,npcId("patient"),"patient",s.idKnown?s.patientName:null,line.text)};
        // F0 — same fire-and-forget tier-3 upgrade pattern as the tick-loop
        // dialogue sites. Called here (inside start()'s own setG updater,
        // not the tick-loop interval) with a snapshot of `s` — safe, since
        // requestLocalUpgrade only reads it synchronously to build context
        // before returning; the actual upgrade resolves later via its own
        // independent setG call, same as every other site. Discards
        // silently (via the .map() no-match case below) if this entry has
        // scrolled off the log, or the busy action/call has ended, by the
        // time it resolves.
        requestLocalUpgrade(pdEvt,s,pdV,(upgraded)=>{
          setG(s2=>({...s2,log:s2.log.map(e=>
            e.id===entryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,null,s2.idKnown?s2.patientName:null)}:e)}));
        });
      }
    }
    return {...s,oosUsed:oos,fatigue,done:{...s.done,[a.doneKey||a.id]:{at:s.t}},...dlgPatch,busy:{id:a.id,doneKey:a.doneKey||a.id,label:a.gerund,dur,left:dur,fn,commit:!!a.commit}};});

  // Cancel your own in-progress action. The action's effect only lands when
  // the timer completes, so cancelling mid-way applies nothing — it just frees
  // your hands and clears the "done" marker so you can start over.
  const cancelAction=()=>setG(s=>{if(!s.busy) return s;
    const dn={...s.done}; if(s.busy.doneKey) delete dn[s.busy.doneKey];
    return {...s,busy:null,done:dn,
      log:[...s.log,{t:s.t,kind:"obs",text:`You stop — ${s.busy.label.toLowerCase()} cancelled.`}]};});

  // Resolves any of the four mini-games (AccessMinigame/AirwayMinigame/
  // CricMinigame/SGAMinigame.jsx) through one named-outcome contract (Spec
  // 2.4, PROCEDURE_OUTCOME) instead of the old boolean + a second, silent
  // onCancel path. SUCCESS re-invokes the ORIGINAL start(a) with
  // a._skipMinigame so every bit of start()'s own existing logic (zth
  // fumble/stumble, fitMult, the busy-timer, fn composition) runs completely
  // unchanged — the mini-game only replaces how the attempt itself is
  // decided. FAILED costs a real, escalating retry time (via a synthetic
  // no-effect busy entry, the same shape the existing fumble/stumble stub
  // already produces) rather than resetting for free — a second stick at a
  // site that's already been missed is slower, not identical to the first
  // attempt. CANCELLED stays free (unchanged from the old onCancel
  // behavior — walking away costs nothing) but is now a real, logged event
  // instead of vanishing silently, so it's visible in the call log same as
  // any other state transition. ABORTED is spec 2.5's escape hatch: the
  // patient's own condition changed (a real eventAlertQueue entry landed —
  // seizure onset, going unresponsive, a scripted crit event) while this
  // attempt was open, which sim time no longer freezes for. Also free like
  // CANCELLED (the player didn't choose to walk away for no reason, the
  // situation forced it), but logged with distinct, honest wording and kept
  // as its own outcome rather than folded into CANCELLED, so a future
  // session auditing the call log can tell "player gave up" from "the scene
  // changed under them" apart.
  // F0 item 23 / F3 spec 2.7's own worked example ("Ow, that hurts." while
  // an IV mini-game continues), closing a real, previously-flagged gap: the
  // four real procedure mini-games below never reached the dialogue path at
  // all (App.jsx's own start()-level procedure_discomfort block only fires
  // for the flat busy-timer path — a._skipMinigame's re-entry means these
  // six ids never hit it directly). Passed down as the `onDialogue` prop to
  // AccessMinigame/AirwayMinigame/CricMinigame/SGAMinigame, each of which
  // calls it at ONE real, single, event-driven trigger moment — the actual
  // needle stick, incision, or airway instrumentation itself (see each
  // component's own comment at its call site) — never on a tick or a slider
  // drag. Mirrors the EXACT same pattern every other dialogue call site in
  // this file already uses (generateDialogueSync for the immediate tier-2/1
  // line, requestLocalUpgrade fire-and-forget for a background tier-3 patch-
  // in-place by entryId) — no parallel system, no new context builder.
  // `evtType` is "procedure_discomfort" (needle/incision pain) or
  // "airway_stimulation_reaction" (gag/cough on airway instrumentation),
  // both real TEMPLATES entries. A no-op if the patient can't speak (not
  // awake) or there's no active call, so a stray call can never throw.
  const fireMinigameDialogue=(evtType)=>setG(s=>{
    if(!s.patient||s.patient.consciousness!=="awake") return s;
    const v=physio(s);
    const evt={type:evtType};
    const line=generateDialogueSync(evt,s,v);
    if(!line) return s;
    const entryId=`dlg_mg_${evtType}_${Math.round(s.t*10)}`;
    const log=[...s.log,{t:s.t,id:entryId,...dialogueLineFor(line.speaker,line.text,null,s.idKnown?s.patientName:null)}];
    const dialogueMemory=pushDialogueMemory(s.dialogueMemory,line.text);
    const npcBrains=rememberNpcLine(s.npcBrains,npcId("patient"),"patient",s.idKnown?s.patientName:null,line.text);
    requestLocalUpgrade(evt,s,v,(upgraded)=>{
      setG(s2=>({...s2,log:s2.log.map(e=>
        e.id===entryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,null,s2.idKnown?s2.patientName:null)}:e)}));
    });
    return {...s,log,dialogueMemory,npcBrains,dialogueLastAt:s.t};
  });

  // CprMinigame: each 4th compression pushes the rolling depth/rate quality
  // into the patient (idempotent value, safe under strict-mode double invoke)
  // and every 8th refreshes the compression dose so perfusion doesn't decay.
  const cprProgress=(q,n)=>setG(s=>{if(!s.patient) return s;
    s.patient.cprQuality=q; s.patient._cprQualityAt=s.t;
    if(n!==1&&n%8!==0) return s;
    const m={...s}; giveDose(m,{id:"cpr",at:s.t}); return m;});
  // Hands-on CPR/BVM tire the player in the campaign (fatigue: 0 fresh, 100
  // exhausted). Medical Simulation has no fatigue, and only the Zero to Hero
  // campaign tracks it, matching start()'s own physical-action rule.
  const cprFatigue=(s,count)=>s.learningMode==="zth"&&s.gmode!=="sandbox"
    ?clampFatigue((s.fatigue||0)+Math.round(FATIGUE_PER_PHYSICAL_ACTION*count/60)):s.fatigue;
  const cprSummaryText=(sum)=>`${sum.count} compressions at an average ${sum.avgDepth.toFixed(1)} cm, ${Math.round(sum.goodDepth*100)}% at target depth${sum.rate?`, about ${sum.rate}/min`:""}`;
  const cprFinish=(sum)=>{const mg=g.accessMinigame; if(!mg) return;
    setG(s=>({...s,accessMinigame:null,fatigue:cprFatigue(s,sum.count),
      log:[...s.log,{t:s.t,kind:"obs",text:`Compressions stopped: ${cprSummaryText(sum)}.`}]}));
    // Re-enter the normal CPR action so its own logic (e.g. clearing an FBAO) still runs.
    start({...mg.action,_skipMinigame:true,cost:POST_MINIGAME_CONFIRM_S});};
  const cprAbort=()=>setG(s=>({...s,accessMinigame:null}));
  // Hand the work to a crew member: end the player's session, keep the
  // compressions going without a gap (a fresh dose now), and order the task.
  const handOff=(taskId,cid,sum)=>{
    const c=(g.crew||[]).find(x=>x.id===cid), t=TASKS.find(x=>x.id===taskId);
    if(!c||!t) return;
    setG(s=>{const m={...s,accessMinigame:null};
      if(taskId==="cpr"){ giveDose(m,{id:"cpr",at:s.t}); if(sum) m.fatigue=cprFatigue(s,sum.count); }
      m.log=[...s.log,{t:s.t,kind:"obs",text:sum?`You hand compressions to ${c.name} after ${cprSummaryText(sum)}.`:`You hand the bag to ${c.name}.`}];
      return m;});
    order(c,t);};
  // BVM, live: each second the minigame pushes volume/rate factors into the
  // patient, and the first push starts the ventilation dose.
  const bvmProgress=(volQ,rateQ)=>setG(s=>{if(!s.patient) return s;
    s.patient.bvmVolQ=volQ; s.patient.bvmRateQ=rateQ; s.patient._bvmQualityAt=s.t;
    if((s.doses||[]).some(d=>d.id==="bvm")) return s;
    const m={...s,bvm:1}; giveDose(m,{id:"bvm",at:s.t}); return m;});
  const bvmStop=(count)=>setG(s=>({...s,accessMinigame:null,
    doses:count>0?(s.doses||[]).filter(d=>d.id!=="bvm"):s.doses,
    log:count>0?[...s.log,{t:s.t,kind:"obs",text:`You stop bagging after ${count} breaths.`}]:s.log}));

  const resolveAccessMinigame=(outcome,detail)=>{
    const mg=g.accessMinigame; if(!mg) return;
    if(outcome===PROCEDURE_OUTCOME.CANCELLED){
      setG(s=>({...s,accessMinigame:null,
        log:[...s.log,{t:s.t,kind:"obs",text:`${mg.action.label||"Attempt"} cancelled.`}]}));
      return;
    }
    if(outcome===PROCEDURE_OUTCOME.ABORTED){
      setG(s=>({...s,accessMinigame:null,
        log:[...s.log,{t:s.t,kind:"obs",text:`${mg.action.label||"Attempt"} abandoned, the patient's condition changed.`}]}));
      return;
    }
    if(outcome===PROCEDURE_OUTCOME.SUCCESS&&mg.kind==="bp"){
      // The player's OWN marked pressures are what gets charted here, not
      // the engine's true v.sbp/v.dbp — a real manual BP can read a few
      // points off from technique, same as a real one can. giveDose still
      // fires so the cost/done-marking/repeat-attempt bookkeeping matches
      // every other proc action, it just doesn't route through the generic
      // manualBP run() (which would report the exact true numbers).
      setG(s=>{const sbp=detail?.sbp, dbp=detail?.dbp;
        const m={...s,accessMinigame:null};
        giveDose(m,{id:"manualBP",at:s.t});
        return apply(m,{say:`${sbp} over ${dbp}, by auscultation.`,kind:"obs",
          meas:{"BP (R)":`${sbp}/${dbp}`},find:`BP ${sbp}/${dbp} (manual).`});});
      return;
    }
    if(outcome===PROCEDURE_OUTCOME.SUCCESS&&mg.kind==="bleedingControl"){
      // The player may have ended on directPressure alone, or escalated to
      // pack or tq — re-enter start() with WHICHEVER real action actually
      // controlled the bleeding, not the original action that opened the
      // combined minigame, so procActs()'s real fx (bleed -.3/-.4/stopsBleed)
      // fires for the real thing that was done.
      const finalId=detail?.finalProc||mg.action.id;
      const finalAction=PROC_ACTS.find(x=>x.id===finalId&&x.region===mg.site)||mg.action;
      setG(s=>({...s,accessMinigame:null}));
      start({...finalAction,_skipMinigame:true,cost:POST_MINIGAME_CONFIRM_S});
      return;
    }
    if(outcome===PROCEDURE_OUTCOME.SUCCESS&&mg.kind==="auscultate"){
      // Nothing to pass or fail here: the player listened, and whatever they typed
      // is what they tell the crew. The engine's own finding still lands in the log
      // through the normal exam action (actions.js), so the record stays honest even
      // if the player's read was wrong.
      setG(s=>{const note=detail&&(detail.hear||detail.think);
        return {...s,accessMinigame:null,log:note?[...s.log,
          {t:s.t,kind:"disp",text:`YOU: "${detail.what}${detail.hear?` — ${detail.hear}`:""}${detail.think?`. I think ${detail.think}.`:""}"`}]:s.log};});
      start({...mg.action,_skipMinigame:true,cost:POST_MINIGAME_CONFIRM_S});
      return;
    }
    if(outcome===PROCEDURE_OUTCOME.SUCCESS){
      // F0 item 23 / F3 coordination — a real, event-driven relief line on a
      // successful stick (iv/io/laryngoscopy/ett/cric/sga all resolve
      // through here). Awake-patient-gated and a real chance roll, same
      // shape as the existing procedure_discomfort site in start() below —
      // not every successful attempt gets a line (item 18's "event-driven,
      // not continuous" bar applies to the GOOD outcome too, not just pain).
      setG(s=>{
        let dlgPatch={};
        if(s.patient?.consciousness==="awake"&&Math.random()<0.35){
          const vNow=physio(s);
          const evt={type:"procedure_success_relief"};
          const line=generateDialogueSync(evt,s,vNow);
          if(line){
            const entryId=`dlg_ok_${mg.kind}_${Math.round(s.t*10)}`;
            dlgPatch={log:[...s.log,{t:s.t,id:entryId,...dialogueLineFor(line.speaker,line.text,null,s.idKnown?s.patientName:null)}],
              dialogueMemory:pushDialogueMemory(s.dialogueMemory,line.text),
              npcBrains:rememberNpcLine(s.npcBrains,npcId("patient"),"patient",s.idKnown?s.patientName:null,line.text)};
            // Same fire-and-forget tier-3 upgrade pattern as every other
            // dialogue call site, discards silently via the .map() no-match
            // case if this entry has scrolled off the log.
            requestLocalUpgrade(evt,s,vNow,(upgraded)=>{
              setG(s2=>({...s2,log:s2.log.map(e=>
                e.id===entryId?{...e,...dialogueLineFor(upgraded.speaker,upgraded.text,null,s2.idKnown?s2.patientName:null)}:e)}));
            });
          }
        }
        return {...s,accessMinigame:null,...dlgPatch};
      });
      // A successful mini-game attempt already WAS the real time cost (the
      // player spent real seconds fumbling angle/depth) — charging the
      // procedure's full abstract cost on top of that double-counts it.
      // Per explicit operator instruction, the busy timer after a
      // successful mini-game is a short, fixed confirmation window, not
      // the original flat cost.
      // Leads placement quality (click-precision score from DeviceMinigame)
      // rides along on the re-entered action so deviceActs()' own attach_leads
      // run() can read it via its 3rd (action) argument and set
      // s.leadsPlacementQuality — the thing the monitor's artifact calc
      // reads (see the Monitor panel below).
      const leadsExtra=(mg.kind==="device"&&mg.deviceId==="leads"&&detail?.quality!=null)?{_leadsQuality:detail.quality}:{};
      start({...mg.action,_skipMinigame:true,_override:!!(mg.warnings&&mg.warnings.length),cost:POST_MINIGAME_CONFIRM_S,...leadsExtra});
      return;
    }
    const key=`${mg.kind}@${mg.site}`;
    // The missed-stick/failed-attempt pain reaction the spec's own example
    // line ("Ow, that hurts.") describes already fired, once, at the real
    // physical moment (the stick/incision/instrumentation itself) via each
    // component's own onDialogue={fireMinigameDialogue} call, immediately
    // before this resolver ever runs — not duplicated here, which would
    // double-fire a second line for the exact same single event.
    setG(s=>{
      const attempts=((s.accessAttempts||{})[key]||0)+1;
      const retryCost=Math.max(5,Math.round((mg.action.cost||15)*0.3*Math.min(attempts,3)));
      return {...s,accessMinigame:null,
        accessAttempts:{...(s.accessAttempts||{}),[key]:attempts},
        busy:{id:"accessMiss",doneKey:null,label:"Repositioning",dur:retryCost,left:retryCost,
          fn:()=>({say:detail||"Missed — reposition and try again.",kind:"warn"}),commit:false},
        log:[...s.log,{t:s.t,kind:"obs",text:detail||"IV attempt missed."}]};
    });
  };

  // BleedingControlMinigame's "two-handed" escalation: direct an idle crew
  // member to hold pressure while the player packs a wound or applies a
  // tourniquet. A real, minimal cBusy entry (same dur:9999 continuous shape
  // as the "cspine" task) so they read as busy everywhere else in the UI;
  // released the moment the minigame resolves, not left holding forever.
  const directHoldPressure=(cid)=>setG(s=>{
    const c=(s.crew||[]).find(x=>x.id===cid); if(!c||s.cBusy[cid]) return s;
    return {...s,cBusy:{...s.cBusy,[cid]:{name:c.name,task:"Holding direct pressure",taskId:"holdPressure",dur:9999,left:9999,startedAt:s.t,fn:()=>null}},
      log:[...s.log,{t:s.t,kind:"disp",text:`YOU: "${c.name}, hold pressure here."`},
        {t:s.t,kind:"good",text:`${c.name.toUpperCase()}: "Got it, holding."`}]};
  });
  const releaseHoldPressure=(cid)=>setG(s=>{
    if(!cid||s.cBusy[cid]?.taskId!=="holdPressure") return s;
    const cb={...s.cBusy}; delete cb[cid];
    return {...s,cBusy:cb};
  });

  // Cancel a crew member's in-progress task (monitoring included).
  const cancelCrew=(cid)=>setG(s=>{const b=s.cBusy[cid]; if(!b) return s;
    const cb={...s.cBusy}; delete cb[cid];
    return {...s,cBusy:cb,monitorBy:s.monitorBy===cid?null:s.monitorBy,
      log:[...s.log,{t:s.t,kind:"obs",text:`${b.name} stops — ${b.task.toLowerCase()} cancelled.`}]};});

  // Crew AI batch: a crew member is no longer locked to whatever they were
  // last ordered to do — the player can redirect them at any time, the same
  // way the autonomous-direction block can now pull a hand off non-urgent
  // busywork for something urgent. Redirecting someone who'd barely started
  // (under REORDER_GRACE_SEC) reads as whiplashing the crew, so it costs a
  // little reputation in Career; Sandbox/Medical Simulation has no
  // reputation to spend, so it's always free there, and redirecting after
  // the grace window has passed is free everywhere.
  const order=(c,t)=>setG(s=>{
    const prev=s.cBusy[c.id];
    if(isTaskBlocked(c,t.id)) return {...s,log:[...s.log,{t:s.t,kind:"warn",
      text:`${c.name.toUpperCase()}: "I can't — ${LIMITATIONS[c.limitation].note.toLowerCase()}"`}]};
    if(t.monitor&&!MONITOR_DEVICES.some(d=>s.devices?.[d])) return {...s,log:[...s.log,{t:s.t,kind:"warn",
      text:`${c.name.toUpperCase()}: "Nothing's attached to read from, get a pulse ox, cuff, or leads on first."`}]};
    if(t.attachDevice&&deviceRegionLocked(s,t.attachDevice)) return {...s,log:[...s.log,{t:s.t,kind:"warn",
      text:`${c.name.toUpperCase()}: "Can't, ${REGION_LABEL[DEVICES[t.attachDevice].region].toLowerCase()}'s still covered, expose it first."`}]};
    const vConflict=exclConflict(s,t.id,prev?.taskId);
    if(vConflict) return {...s,log:[...s.log,{t:s.t,kind:"warn",
      text:`${c.name.toUpperCase()}: "We already have ${(PROCS[vConflict]?.name||vConflict).toLowerCase()} running, can't run two at once."`}]};
    const redirected=prev&&prev.taskId!==t.id;
    const tooSoon=redirected&&s.t-(prev.startedAt??s.t)<REORDER_GRACE_SEC&&s.gmode!=="sandbox";
    const n={...s,
      monitorBy:s.monitorBy===c.id?null:s.monitorBy,   // releasing this hand off a prior monitor hold, if any
      reputation:tooSoon?clampReputation((s.reputation||0)-1):s.reputation,
      log:[...s.log,
        ...(redirected?[{t:s.t,kind:"obs",text:`${c.name.toUpperCase()}: stops, ${prev.task.toLowerCase()} cancelled.`}]:[]),
        {t:s.t,kind:"disp",text:`YOU: "${c.name}, ${t.name.toLowerCase()}."`},
        {t:s.t,kind:"good",text:`${c.name.toUpperCase()}: ${t.readback}`},
        ...(tooSoon?[{t:s.t,kind:"warn",text:`Pulling ${c.name} off a task that fast reads as indecisive — a small reputation hit.`}]:[])]};
    if(t.monitor){ n.monitorBy=c.id; n.lastMon=n.t-99;   // start live immediately
      n.cBusy={...n.cBusy,[c.id]:{name:c.name,task:"Monitoring vitals",taskId:"monitor",dur:9999,left:9999,startedAt:n.t,fn:()=>null}};
      return n; }
    const dur=t.dur>9000?t.dur:t.dur+(c.student?5:0);
    // Everyone's fail odds run off their own fatigue/morale/skill/experience
    // (see failChance in fleet.js) — students additionally pay the +5s above.
    // §1.5.2: g.morale (crew-wide) nudges the per-crew-member morale
    // failChance already reads, via effectiveCrewMorale — self-neutralizing
    // at g.morale===50, so non-Career saves are unaffected.
    const willFail=Math.random()<failChance(effectiveCrewMorale(c,s.morale),t.lvl);
    const fn=willFail?()=>({say:`${c.name.toUpperCase()}: "Shit! I missed."`,kind:"warn"}):crewFn(c,t);
    n.cBusy={...n.cBusy,[c.id]:{name:c.name,task:t.name,taskId:t.id,dur,left:dur,startedAt:n.t,fn}};
    if(willFail){ // a fumble costs morale, both for the rest of this call and going forward
      const hit=randRange(0,15);
      n.crew=n.crew.map(cm=>cm.id===c.id?{...cm,morale:Math.max(0,(cm.morale??90)-hit)}:cm);
      n.roster=(n.roster||[]).map(p=>p.id===c.id?{...p,morale:Math.max(0,(p.morale??90)-hit)}:p);
    }
    return n;});
  const stopMonitor=(cid)=>setG(s=>{const cb={...s.cBusy}; delete cb[cid];
    return {...s,monitorBy:s.monitorBy===cid?null:s.monitorBy,cBusy:cb,
      log:[...s.log,{t:s.t,kind:"obs",text:"Monitoring released."}]};});

  // Crew AI batch: the exact same "what can this crew member be ordered to
  // do right now" filter the crew-order panel's own JSX uses, hoisted so
  // both the click-based panel AND the voice-command matcher (below) read
  // one shared definition rather than two that could drift apart.
  const orderableTasksFor=(c)=>{const cl=LEVELS[c.level].n, busy=g.cBusy[c.id];
    return TASKS.filter(t=>{const out=t.lvl>cl;
      const outranks=!out&&cl>L;
      const noDevice=!out&&!outranks&&t.monitor&&!MONITOR_DEVICES.some(d=>g.devices?.[d]);
      const dup=!out&&!outranks&&t.id!==busy?.taskId&&((t.dose&&(workingIds.has(t.dose)||doseActive(g,t.dose)))||(t.id==="iv"&&(g.ivSites||[]).length>=LIMBS.length)||(t.id==="tq"&&LIMBS.every(l=>g.done?.[`tq@${l}`]))||(!!exclGroupOf(t.id)&&!!exclConflict(g,t.id,busy?.taskId)));
      const blocked=!out&&!outranks&&isTaskBlocked(c,t.id);
      return !out&&!outranks&&!dup&&!noDevice&&!blocked;});};

  const canDeclareDeath = L>=4 || (g.commander&&LEVELS[g.commander.level].n>=4);
  const confirmDeclareDeath=()=>setG(s=>({...s,confirmDeath:1}));
  const declareDeath=()=>setG(s=>{const v=physio(s),arr=critical(v,s);
    const trulyDead=!!arr&&(v.hr<=0||["asystole","PEA","VF"].includes(v.rhythm));
    return creditOutcome({...s,phase:"debrief",busy:null,cBusy:{},forcedTask:null,confirmDeath:0,physioOutcome:outcomeReport(s),
      outcome:{died:1,correct:trulyDead,truth:trulyDead?"Field pronouncement.":"You pronounced a patient who was not dead.",
        cause:trulyDead?`Prolonged arrest with no reversible cause on the table. ${arr.story}`
          :`There were still signs of life. Pronouncing here is outside sound practice — this patient had a rhythm and a pressure worth transporting.`,
        arrest:arr,notes:[]}});});

  // §3 — transport crew rules. Partners live in s.crew from the start now
  // (seeded at "Roll"), so no synthetic "ptr" entry is needed any more.
  const transportCandidates=(s)=>s.sceneUnits.filter(u=>u.arrived&&u.vehicle&&u.vehicle.transport);
  const ambUnitOf=(s)=>{const cands=transportCandidates(s);
    if(s.transportUnitId) return cands.find(u=>u.id===s.transportUnitId)||null;
    return cands.length===1?cands[0]:null;};
  // The lowest-level member of the ambulance crew drives; the highest level
  // (plus up to one more) rides in back with you. Everyone else stays on scene.
  const ambulanceCrewPool=(s)=>{const myAmb=s.myVeh&&s.myVeh.transport;
    if(myAmb) return s.crew.filter(c=>c.unitId==="own");
    const amb=ambUnitOf(s); if(!amb) return [];
    return s.crew.filter(c=>c.unitId===amb.id);};
  const autoAssign=(s)=>{const pool=ambulanceCrewPool(s);
    if(pool.length===0) return {driver:null,riders:[]};
    const byLevelAsc=[...pool].sort((a,b)=>LEVELS[a.level].n-LEVELS[b.level].n);
    const driver=byLevelAsc[0];
    const rest=byLevelAsc.slice(1).sort((a,b)=>LEVELS[b.level].n-LEVELS[a.level].n);
    return {driver:driver.id, riders:rest.slice(0,2).map(r=>r.id)};};
  const beginTransport=()=>setG(s=>{const s2={...s,transportUnitId:null};const {driver,riders}=autoAssign(s2);
    return {...s2,loadOpen:1,loadRiders:riders,loadDriver:driver};});
  const chooseTransportUnit=(uid)=>setG(s=>{const s2={...s,transportUnitId:uid};const {driver,riders}=autoAssign(s2);
    return {...s2,loadRiders:riders,loadDriver:driver};});
  const depart=()=>setG(s=>{const myAmb=s.myVeh&&s.myVeh.transport,pool=s.crew,find=(id)=>pool.find(p=>p.id===id);
    const {driver,riders:riderIds}=autoAssign(s);
    const driverName=find(driver)?.name||(myAmb?"You — no crew to drive, took the wheel yourself":"—");
    const riders=riderIds.map(find).filter(Boolean);
    const meName=(`${s.playerFirst||""} ${s.playerLast||""}`).trim()||"You";
    const occupants=[`${meName} — lead`,driverName+" — driver",...riders.map(r=>r.name)];
    const abandoned=[];
    if(!myAmb){const taken=new Set([driver,...riderIds]);
      const spare=pool.find(p=>!taken.has(p.id));
      abandoned.push(spare?`Your chase car — ${spare.name} driving it back to station`:"Your chase car — LEFT ON SCENE (no one to drive it)");}
    riders.forEach(r=>{if(r.solo&&r.vehicle&&!["bls","als"].includes(r.vehicle.type))
      abandoned.push(`${r.name}'s ${r.vehicle.type} left on scene — arrived alone`);});
    // §T — only the hands actually riding in this truck keep working. Whoever
    // was left on scene stops whatever they were doing the instant the doors shut.
    const ridingIds=new Set([driver,...riderIds].filter(Boolean));
    const leftBehind=pool.filter(p=>!ridingIds.has(p.id));
    const crew=s.crew.filter(c=>ridingIds.has(c.id));
    const cBusy=Object.fromEntries(Object.entries(s.cBusy).filter(([cid])=>ridingIds.has(cid)));
    const monitorBy=(s.monitorBy&&ridingIds.has(s.monitorBy))?s.monitorBy:null;
    // Once you commit to transport, any units still en route are cancelled so
    // they don't come strolling onto an empty scene mid-transport.
    const enRoute=(s.sceneUnits||[]).filter(u=>!u.arrived&&!u.cancelled);
    const sceneUnits=(s.sceneUnits||[]).map(u=>(!u.arrived&&!u.cancelled)?{...u,cancelled:true}:u);
    const cancelLog=enRoute.length?[{t:s.t,kind:"obs",text:`Dispatch cancels ${enRoute.length} unit${enRoute.length>1?"s":""} still en route — you are transporting.`}]:[];
    const ceaseLog=leftBehind.filter(p=>s.cBusy[p.id]).map(p=>({t:s.t,kind:"obs",
      text:`${p.name} stays on scene and stops — ${s.cBusy[p.id].task.toLowerCase()} ends here.`}));
    return {...s,phase:"transport",committedAt:s.t,busy:null,crew,cBusy,monitorBy,sceneUnits,
      panel:"report",loadOpen:0,occupants,abandoned,
      log:[...s.log,{t:s.t,kind:"beat",text:`${occupants.length} in the box. Doors shut. Code ${s.code}. Wheels rolling.`},
        ...abandoned.map(a=>({t:s.t,kind:"warn",text:"⚠ "+a})),...ceaseLog,...cancelLog]};});

  // §911 — for a layperson, nobody is coming until THIS fires. Units are
  // generated fresh right now, with their ETA anchored to this moment (not
  // to when the scene started), so "help is 4 minutes out" means 4 minutes
  // from the call, not from whenever the player happened to arrive.
  const call911Now=()=>setG(s=>{if(s.call911) return s;
    // §2.5's one scripted exception to reusing the real call flow: this
    // isn't a real EMS dispatch, so it doesn't get genUnits' normal ETA —
    // Northwood PATROL takes over in exactly one minute (see the tick
    // loop's own tutorialHeatStrokeActive branch, and
    // campaignHeatStrokeAftermath, which narrates a real ambulance still
    // separately "four minutes out" once PATROL is on scene).
    if(s.tutorialHeatStrokeActive) return {...s,call911:1,call911Asked:1,tutorialHeatStroke911At:s.t,
      log:[...s.log,{t:s.t,kind:"beat",text:'911 — "Northwood PATROL is already in the area, they\'re closer than we are — they\'re on their way."'}]};
    let units=genUnits(s.mode,{allowed:effectiveAllowedKinds(s.allowedKinds,s.allowedDepartments),severity:s.code});
    if(!units.some(u=>u.vehicle.transport)) units.push(blsAmbulance(s.mode));
    units=units.map(u=>({...u,eta:s.t+u.eta})).sort((a,b)=>a.eta-b.eta);
    return {...s,call911:1,call911Asked:1,sceneUnits:units,
      log:[...s.log,{t:s.t,kind:"beat",text:"911 — help is on the way."}]};});

  // F22: patient refusal / AMA. Reuses the SAME "arrived" impression-pick
  // screen a hospital handoff uses (see the branch on g.ama in that render)
  // rather than a parallel disposition path — a refusal still gets a
  // provider impression on the paperwork, same as a transport does.
  //
  // The capacity Yes/No choice is the actual decision tree: "No" just closes
  // the flow and care continues, so the only way to reach `amaSign` is a
  // player judgment of "yes, has capacity" — which is exactly the judgment
  // `pickImpression` below checks against the engine's own live
  // `_cons` state (see patient.js `updateCerebral`, which runs every tick
  // regardless of scenario, so this is a real signal, not a decorative one).
  const amaCapacityYes=()=>setG(s=>({...s,amaStep:"risks"}));
  const amaCapacityNo=()=>setG(s=>({...s,amaOpen:0,amaStep:null,
    log:[...s.log,{t:s.t,kind:"good",text:"Correctly recognized the patient does not currently have the capacity to refuse care — continuing care instead."}]}));
  const amaExplainRisks=()=>setG(s=>({...s,amaStep:"signature"}));
  const amaSign=()=>setG(s=>{physio(s);   // ensure s.patient is populated before the snapshot below
    // F44: snapshot outcomeReport(s) here — s.phase is still "scene" at this
    // point (only the returned object's phase reads "arrived"). Carries
    // forward through withPI/creditOutcome at pickImpression() below.
    return {...s,phase:"arrived",arrivalArrest:null,amaOpen:0,amaStep:null,physioOutcome:outcomeReport(s),
    ama:{capacityChecked:!!s.done.loc},
    log:[...s.log,{t:s.t,kind:"beat",text:"Refusal of care documented — risks explained, form signed. Care ends here unless they call back."}]};});

  // Arrival at the hospital pauses the run for the impression pick, then hands off to resolve().
  const pickImpression=(pi)=>setG(s=>{const withPI={...s,pi};
    const v=physio(withPI);
    const base=scenOf(s).resolve(withPI,v,s.arrivalArrest);
    if(!s.ama){const dNote=destinationNote(scenOf(s),s.destHospitalType);
      return creditOutcome({...withPI,phase:"debrief",busy:null,cBusy:{},
        outcome:{...base,notes:dNote?[...(base.notes||[]),dNote]:base.notes,arrest:s.arrivalArrest}});}
    // Scored separately from the scenario's own clinical resolve(): whether
    // the refusal ITSELF was valid (orientation actually checked, AND the
    // patient was objectively "awake" — not assumed). A refusal accepted
    // from a patient the engine has moving through drowsy/confused/
    // unconscious/coma is exactly the "capacity assessment... botched"
    // failure mode this flow exists to catch.
    const objectivelyAlert=v._cons==="awake";
    const notes=[...base.notes];
    if(s.ama.capacityChecked&&objectivelyAlert) notes.push("Capacity correctly assessed before accepting the refusal — actually checked, not assumed, and the patient really was alert and oriented.");
    else if(!s.ama.capacityChecked&&objectivelyAlert) notes.push("The refusal itself was valid — the patient did have capacity — but orientation was never actually checked this call to establish that before the form went out. Assessed capacity protects the patient (and you); assumed capacity is a guess that happened to be right.");
    else notes.push(`This refusal should not have been accepted. At the moment it was signed, the patient's mental status was "${v._cons}" — not the alert, oriented state a valid refusal requires. A patient without capacity cannot refuse care; this needed continued treatment (and transport under implied consent), not a signature.`);
    return creditOutcome({...withPI,phase:"debrief",busy:null,cBusy:{},
      outcome:{...base,arrest:null,notes,correct:base.correct&&objectivelyAlert,ama:true}});});

  const css=`@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    @keyframes fR{0%,49%{opacity:.1}50%,100%{opacity:1}}@keyframes fB{0%,49%{opacity:1}50%,100%{opacity:.1}}
    @keyframes rock{0%,100%{transform:translateX(0)}25%{transform:translateX(-1.5px)}75%{transform:translateX(1.5px)}}
    @keyframes sweep{from{stroke-dashoffset:1400}to{stroke-dashoffset:0}}
    .f1{animation:fu .8s ease both}.f2{animation:fu .8s ease .4s both}.f3{animation:fu .8s ease .9s both}.f4{animation:fu .8s ease 1.5s both}
    .rock{animation:rock 1.1s ease-in-out infinite}
    .ecg{stroke-dasharray:1400;animation:sweep 3s linear infinite}
    .rg{cursor:pointer}.rg:hover rect,.rg:hover ellipse{fill:#2C3A44}
    /* Neutralise the default Vite React starter CSS (index.css / App.css), which caps
       #root at 1280px, adds padding, centers the body with flex, and sets text-align.
       Those are what squashed the page into the left half with a hard vertical edge. */
    html,body{margin:0;padding:0;min-height:100%;background:${C.bg};display:block;place-items:normal;}
    #root{max-width:none;width:100%;min-height:100vh;margin:0;padding:0;text-align:left;display:block;}
    *{box-sizing:border-box}
    .px-stage{display:flex;gap:16px;align-items:stretch;width:100%}
    .px-work{flex:1 1 0%;min-width:0;display:flex;flex-direction:column;gap:12px}
    .px-monitor{flex:0 0 340px;width:340px;max-width:340px;display:flex;flex-direction:column;gap:12px}
    @media(max-width:860px){.px-stage{flex-direction:column}.px-monitor{flex:0 0 auto;width:100%;max-width:none}}
    @media(prefers-reduced-motion:reduce){*{animation:none!important}}`;

  const isPrepAct=(a)=>a.id.startsWith("undress_")||a.id.startsWith("rollup_")||a.id.startsWith("shears_")||a.id.startsWith("shoe_");
  const why=(a)=>(g.forcedTask&&a.id!==g.forcedTask.actId&&!isPrepAct(a))?`ordered: ${g.forcedTask.label.replace(/[.!]$/,"").toLowerCase()}`
    :(a.lvl>L&&L<5&&!g.scopeOverride[a.id])?`${LNAME(a.lvl)} scope`
    :(a.bag&&!has(a.bag))?`${BAGS[a.bag].name.toLowerCase()} is in the truck`
    :(a.pocket&&!pk(a.pocket))?`no ${POCKETS[a.pocket].name.toLowerCase()}`
    :procBusy(a.id)?`already running`
    :(CLOTH_LOCK[a.region]?.includes(a.id)&&!g.exposed?.[a.region])?`covered — expose the ${REGION_LABEL[a.region]} first`
    :((a.id==="pedL"||a.id==="pedR")&&!g.shoesOff?.[a.region])?`shoe still on`
    :(["aedAnalyze","aedShock","defib","pacing"].includes(a.id)&&!g.padsOn)?`no pads applied`
    :(a.id==="aedShock"&&!g.lastAnalysis?.shockable)?`analyze first`
    :(a.drug&&DRUGS[a.drug].max&&(g.given[a.drug]||0)>=DRUGS[a.drug].max)?`max dose`
    :(limitedItemsActive(g)&&stockIdOfAction(a)&&(g.supplyStock?.[stockIdOfAction(a)]??1)<=0)?`out of ${(STOCK_ITEMS[stockIdOfAction(a)]?.label||"stock").toLowerCase()}`:null;
  // F3's highest-value bug: continuous procedures (NOSTACK — compressions,
  // BVM, pocket-mask/mouth-to-mouth ventilation) are declared `once:1` so the
  // button reads "done" and disappears, but they are exactly the actions that
  // must be RE-triggerable — compressions stop when you're bumped off the
  // chest and need restarting, ventilations resume after a pause. `once` and
  // NOSTACK were both being consulted but ORed together wrong: `once` won
  // and permanently removed the button the first time it fired, so a real
  // continuous-procedure re-offer (once `procBusy` clears) was unreachable.
  // NOSTACK ids now bypass the done-check entirely; procBusy (below in `why`)
  // still correctly hides the button for the whole time it is actively running.
  // Procedure-gameplay pass: "Your hands are full" used to gate EVERY
  // action, not just a second hands-on one — checking a pupil, asking a
  // SAMPLE question, or radioing for ALS all sat behind the exact same
  // block as starting a second IV would. Real EMS crews do this
  // constantly: you keep asking questions, keep watching the monitor, keep
  // talking on the radio while your own hands are occupied with a
  // procedure. Only "assess" (exam/history — reading the patient) and
  // "general" (scene/dispatch coordination — reading the room, not
  // touching the patient) genuinely need no free hands, so only those two
  // tabs are exempted here; "airway"/"procedures"/"meds" still correctly
  // require the player's hands to be free, since doing two hands-on things
  // at once isn't real. The interactive access/airway MINI-GAMES
  // (g.accessMinigame) are a separate, deliberately full-attention state —
  // unaffected by this, they still pause everything, matching how a real
  // provider mid-stick isn't simultaneously doing anything else either.
  const busyBlocks=(a)=>!!g.busy&&a.tab!=="assess"&&a.tab!=="general";
  const Btn=(a)=>{const w=why(a),d=busyBlocks(a)||(a.once&&!NOSTACK.includes(a.id)&&g.done[a.doneKey||a.id])||(a.req&&!a.req(g))||!!w;
    if(d) return null;
    return (<button key={a.id} onClick={()=>start(a)} disabled={d} title={a.tip||""}
      className="text-left px-3 py-2 rounded w-full"
      style={{background:a.commit?"#2A1418":a.tab!=="assess"?"#16241C":C.panelHi,
        border:`1px solid ${a.commit?C.red:a.lvl===5?C.violet:a.tab!=="assess"?"#2E4A3A":C.line}`,
        color:d?C.faint:a.commit?C.red:C.text,fontSize:13,cursor:d?"not-allowed":"pointer",opacity:d?.3:1}}>
      <div>{a.label}{a.drug&&g.given[a.drug]?<span style={{color:C.hr,fontFamily:MONO,fontSize:10}}> ×{g.given[a.drug]}</span>:null}
        {a.prepped&&a.drug?<span style={{color:C.hr,fontFamily:MONO,fontSize:9}}> · PRE-DRAWN ½</span>:null}</div>
      <div style={{fontFamily:MONO,fontSize:10,color:w?C.red:C.dim,marginTop:2}}>
        {w||(opensMinigame(a)?"":`${Math.round(a.cost)}s`)}{a.lvl>0&&!w?` · ${LNAME(a.lvl)}+`:""}</div>
    </button>);};

  // Voice-activated crew commands AND player self-commands (settings-gated,
  // g.voiceCommandsEnabled — see SettingsOverlay.jsx). Only meaningful where
  // the crew-order panel itself exists (scene/transport) and only while
  // nothing is paused — the SAME modal list the sim-clock pause guard
  // already uses (§ "every modal must be added to every pause list"), not a
  // second, divergent one. Must be called unconditionally, above every
  // phase-branch early return (Rules of Hooks) — moved here (below `why`/
  // `busyBlocks`/`Btn`, above the first phase return, `boot`) specifically
  // so player self-commands can be checked against the EXACT same gate a
  // click already goes through, not a second, potentially looser one.
  const voiceActive=(g.phase==="scene"||g.phase==="transport")&&
    !(g.micnOpen||g.newUnit||g.loadOpen||g.settingsOpen||g.confirmDeath||g.achievementsOpen||g.relationshipsOpen||g.ch1TutorialActive||g.accessMinigame);
  // The exact same set of actions Btn() would actually render a clickable
  // button for — reusing why()/busyBlocks()/the once+NOSTACK+req checks
  // verbatim rather than re-deriving a parallel, possibly looser rule, so a
  // voice command can never do something a click couldn't.
  const voiceEligibleActions=voiceActive?acts().filter(a=>
    !why(a)&&!busyBlocks(a)&&!(a.once&&!NOSTACK.includes(a.id)&&g.done[a.doneKey||a.id])&&!(a.req&&!a.req(g))):[];
  const voiceConfirmDeny=(text)=>setG(s=>({...s,log:[...s.log,{t:s.t,kind:"obs",text}],voicePendingAction:null}));
  const voiceStatus=useVoiceCommands({
    enabled:!!g.voiceCommandsEnabled, active:voiceActive, crew:g.crew,
    visibleTasksFor:orderableTasksFor, onOrder:order,
    onMiss:(transcript)=>setG(s=>({...s,log:[...s.log,{t:s.t,kind:"obs",
      text:transcript?`RADIO: "${transcript}", didn't catch who or what.`:`RADIO: didn't catch that.`}]})),
    playerActions:voiceEligibleActions,
    pendingLabel:g.voicePendingAction?.label||null,
    onPlayerAction:(a)=>setG(s=>({...s,voicePendingAction:{id:a.id,label:a.label},
      log:[...s.log,{t:s.t,kind:"warn",text:`RADIO: You want to ${a.label.toLowerCase()}. Are you sure? Say Confirm or Deny.`}]})),
    // The confirmed action is re-looked-up from a FRESH acts() call at the
    // moment of confirmation, not the stale object captured when the
    // request was first heard — the scene may have moved on in the
    // meantime (a device attached, a dose already maxed), so this goes
    // through start() exactly the way a real, freshly-clicked button would,
    // never a cached reference to a button that might no longer be valid.
    onConfirm:()=>{
      const a=voiceEligibleActions.find(x=>x.id===g.voicePendingAction?.id);
      if(a) start(a);
      voiceConfirmDeny(a?`RADIO: Confirmed, ${a.label.toLowerCase()}.`:"RADIO: That's no longer available, standing down.");
    },
    onDeny:()=>voiceConfirmDeny("RADIO: Denied, standing down."),
  });

  /* ═══ BOOT — F0 item 4: the unified boot/initialization screen. The very
     first phase any new session starts at (see blank()'s own phase:"boot"
     default). See src/components/BootScreen.jsx for the full design note on
     why the core-systems checklist is instant/real rather than a fabricated
     progress bar, and how the AI panel's progress is genuinely wired to
     LocalLLMProvider via dialogueManager's getLocalAiState()/
     subscribeLocalAiProgress()/preloadLocalAi(). ═══ */
  if(g.phase==="boot"&&firstCredits) return <CreditsScreen firstRun onDone={()=>{try{localStorage.setItem(CREDITS_SEEN_KEY,"1");}catch{/* storage unavailable */} setFirstCredits(false);}}/>;
  if(g.phase==="credits") return <CreditsScreen onDone={()=>setG(s=>({...s,phase:"title"}))}/>;
  if(g.phase==="boot") return <BootScreen g={g} setG={setG}/>;

  /* ═══ TITLE ═══ */
  if(g.phase==="title") return (<Shell g={g} setG={setG} css={css}>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",minHeight:"calc(100dvh - 48px)",
        position:"relative",backgroundImage:`linear-gradient(${C.bg}ee, ${C.bg}ee), url(${BACKGROUNDS.stationExterior})`,
        backgroundSize:"cover",backgroundPosition:"center",borderRadius:8}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:46,letterSpacing:".44em",paddingLeft:".44em"}}>PROXIMATE</div>
      <div className="f2" style={{width:130,height:1,background:C.line,margin:"24px 0"}}/>
      <div className="f2" style={{fontSize:14.5,color:C.dim,maxWidth:470,lineHeight:1.85}}>
        Nobody is going to tell you what is wrong.<br/>
        Everything you want to know costs time you do not have.<br/>
        And when the physician gives you the wrong order,<br/>
        you can only refuse it with what you went and found.
      </div>
      <div className="f3" style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:C.faint,marginTop:32}}>
        A PREHOSPITAL REASONING SIMULATOR
      </div>
      <div className="f4" style={{display:"flex",gap:12,marginTop:40,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={()=>setG(s=>({...s,phase:"tut"}))} className="px-7 py-3 rounded"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:14}}>How it works</button>
        <button onClick={()=>setG(s=>({...s,phase:"faq"}))} className="px-7 py-3 rounded"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:14}}>Scope of practice</button>
        <button onClick={()=>setG(s=>({...s,phase:"credits"}))} className="px-7 py-3 rounded"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:14}}>Credits</button>
        <button onClick={()=>setG(s=>({...s,phase:goOnShiftPhase()}))} className="px-7 py-3 rounded"
          style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>▲ Go on shift</button>
      </div>
      {/* Free Explore — a TEMPORARY, dev-facing free-roam mode (not a real
          gamemode, not saved, not part of the numbered front-end queue).
          Kept visually secondary to the real "Go on shift" flow. */}
      <button onClick={()=>setG(s=>({...s,phase:"freeExplorePick"}))} className="mt-3"
        style={{background:"none",border:"none",color:C.faint,fontSize:11,fontFamily:MONO,letterSpacing:".08em",textDecoration:"underline",cursor:"pointer"}}>
        🚶 Free Explore (beta) — walk around a map, no call</button>
      {onHome&&<button onClick={onHome} className="mt-3"
        style={{background:"none",border:"none",color:C.faint,fontSize:11,fontFamily:MONO,letterSpacing:".08em",cursor:"pointer"}}>
        ← Back to main menu</button>}
    </div></Shell>);

  /* ═══ FREE EXPLORE — temporary, dev-facing free-roam mode. Pick a map,
     walk around it, exit back to the title screen. Not gameplay, not
     saved, not gated behind character creation. ═══ */
  if(g.phase==="freeExplorePick"){
    const opts=[["city","Northwood City"],["suburban","Suburban"],["rural","Rural"]];
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:520,margin:"0 auto",paddingTop:60,textAlign:"center"}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:12,letterSpacing:".2em",color:C.amber}}>🚶 FREE EXPLORE (beta)</div>
      <div style={{fontSize:13,color:C.dim,marginTop:14,lineHeight:1.7}}>
        Walk around a map with no call, no timer, no objective. Every building on
        the map renders as a labeled box, no real 3D models — this is a
        temporary layout-inspection tool, not a real gamemode.</div>
      <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:20,fontSize:12,color:C.dim,cursor:"pointer"}}>
        <input type="checkbox" checked={exploreSpawnVehicle} onChange={(e)=>setExploreSpawnVehicle(e.target.checked)}/>
        🚗 Spawn with a vehicle (drive around, park and walk any time)
      </label>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
        {opts.map(([id,label])=>(<button key={id} onClick={()=>{setExploreMapId(id);setG(s=>({...s,phase:"freeExplore"}));}}
          className="px-6 py-3 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:13}}>{label}</button>))}
      </div>
      <button onClick={()=>setG(s=>({...s,phase:"title"}))} className="mt-6"
        style={{background:"none",border:"none",color:C.faint,fontSize:12,fontFamily:MONO,cursor:"pointer"}}>← back</button>
    </div></Shell>);
  }
  if(g.phase==="freeExplore"){
    return <FreeExplore mapId={exploreMapId} map={MAPS[exploreMapId]} spawnVehicle={exploreSpawnVehicle} onExit={()=>setG(s=>({...s,phase:"title"}))}/>;
  }

  /* ═══ LIABILITY DISCLAIMER — shown before the very first shift this browser
     has ever run, AND every time a new save is created (F18: it was previously
     gated only by the one-time localStorage flag, so it never reappeared for a
     second/third save in a browser that had already dismissed it once — tying
     it to save creation as well means every new save gets the disclaimer). ═══ */
  if(g.phase==="disclaimer"){
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:640,margin:"0 auto",paddingTop:40}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".24em",color:C.red}}>BEFORE YOU START</div>
      <div className="f1 p-5 rounded mt-5" style={{background:C.panel,border:`1px solid ${C.red}`}}>
        <div style={{fontSize:14,lineHeight:1.85,color:C.text}}>
          This is a training simulation, not medical direction. It does not replace certified EMS education,
          your local protocols, or your medical director's authority. Nothing here is a substitute for
          hands-on skills verification, licensure, or supervised clinical time.<br/><br/>
          By continuing, you understand this is a game built to teach the SHAPE of prehospital reasoning, and that this is
          not a protocol reference and not medical advice.
        </div>
      </div>
      <button onClick={()=>{try{localStorage.setItem(DISCLAIMER_KEY,"1");}catch{/* storage unavailable */} setG(s=>({...s,phase:s.afterDisclaimer||"saves",afterDisclaimer:null}));}}
        className="px-7 py-3 rounded mt-6" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>
        I understand — continue</button>
    </div></Shell>);
  }

  /* ═══ FAQ — SCOPE OF PRACTICE, EVERY LEVEL ═══ */
  if(g.phase==="faq"){
    const atLevel=(n)=>({procs:Object.entries(PROCS).filter(([id,p])=>lvlOf(id,p.lvl)===n).map(([,p])=>p.name),
      drugs:Object.entries(DRUGS).filter(([id,d])=>lvlOf(id,d.lvl)===n).map(([,d])=>d.name)});
    const back={background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:12,padding:"6px 12px",borderRadius:6,cursor:"pointer"};
    return (<Shell g={g} setG={setG} css={css}>
      <div style={{maxWidth:860,margin:"0 auto",paddingTop:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:8}}>
          <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".24em",color:C.dim}}>SCOPE OF PRACTICE — NATIONAL EMS MODEL 2019</div>
          <button onClick={()=>setG(s=>({...s,phase:"title"}))} style={back}>← Back</button></div>
        <div className="f1" style={{fontSize:12.5,color:C.dim,marginTop:10,lineHeight:1.7}}>
          Scope is cumulative: each level can do everything below it, plus what is listed as NEW here. "New procedures" and
          "new medications" are the skills and drugs that first become available at that level in this simulator.</div>
        <div className="f2" style={{display:"flex",flexDirection:"column",gap:12,marginTop:16}}>
          {Object.values(LEVELS).sort((a,b)=>a.n-b.n).map(lv=>{const {procs,drugs}=atLevel(lv.n);
            return (<div key={lv.n} className="p-4 rounded" style={{background:C.panel,border:`1px solid ${lv.n===5?C.violet:C.line}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <span style={{fontSize:16,fontWeight:600,color:lv.n===5?C.violet:C.text}}>{lv.name}</span>
                <span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>LEVEL {lv.n}</span></div>
              <div style={{fontSize:13,color:C.dim,marginTop:4,lineHeight:1.65}}>{lv.note}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:16,marginTop:12}}>
                <div style={{flex:"1 1 240px",minWidth:0}}>
                  <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.hr,marginBottom:4}}>NEW PROCEDURES</div>
                  <div style={{fontSize:12,color:procs.length?C.text:C.faint,lineHeight:1.7}}>{procs.length?procs.join(" · "):"— nothing new at this level —"}</div></div>
                <div style={{flex:"1 1 240px",minWidth:0}}>
                  <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.spo2,marginBottom:4}}>NEW MEDICATIONS</div>
                  <div style={{fontSize:12,color:drugs.length?C.text:C.faint,lineHeight:1.7}}>{drugs.length?drugs.join(" · "):"— nothing new at this level —"}</div></div>
              </div></div>);})}
        </div>
        <div className="f2" style={{display:"flex",gap:12,marginTop:18,flexWrap:"wrap"}}>
          <button onClick={()=>setG(s=>({...s,phase:goOnShiftPhase()}))} className="px-7 py-3 rounded"
            style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>▲ Go on shift</button>
          <button onClick={()=>setG(s=>({...s,phase:"title"}))} className="px-7 py-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:14}}>Back to title</button>
        </div>
      </div></Shell>);
  }

  if(g.phase==="tut") return (<Shell g={g} setG={setG} css={css}>
    <div style={{maxWidth:720,margin:"0 auto",paddingTop:20}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim}}>SEVEN THINGS, THEN YOU ARE ON YOUR OWN</div>
      <div className="f1 mt-5 flex flex-col gap-3">
        {[["THE CLOCK NEVER STOPS","One pair of hands. While you cannulate, the disease keeps working. The patient's clock starts when you REACH them — not at the tones."],
          ["NOTHING IS ON SCREEN THAT YOU DID NOT GO AND GET","Vitals start blank and go STALE. A pressure from four minutes ago is not a pressure."],
          ["THE BODY IS THE MENU","Blood pressure lives under the arms. BOTH of them. Nothing will remind you that she has two."],
          ["THE STRIP IS ON THE SCREEN — READ IT YOURSELF","Acquiring a 12-lead shows you the read directly. Nobody interprets it for you."],
          ["EVERY PAIR OF HANDS HAS ITS OWN LICENCE","Bystanders are already there. Units arrive mid-call. You command them — and only within THEIR scope. They read the order back. Then they report the result."],
          ["BASE CONTACT IS A CONSULTATION, NOT AN ABDICATION","The physician is working from the report YOU gave her, and sometimes she is wrong. Accept, Question, or Refuse — but you can only refuse with a finding you actually have."],
          ["YOU ARE GRADED ON REASONING, NOT ON GUESSING","Commit with no evidence and survive anyway, and the debrief will say you got lucky. Which is worse than being wrong."],
        ].map(([h,b],i)=>(<div key={i} className="p-4 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".14em",color:C.amber,marginBottom:6}}>{h}</div>
          <div style={{fontSize:13.5,lineHeight:1.7}}>{b}</div></div>))}
      </div>
      <div className="flex gap-2 mt-6">
        <button onClick={()=>setG(s=>({...s,phase:goOnShiftPhase()}))} className="px-7 py-3 rounded"
          style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>▲ Go on shift</button>
        <BackBtn toPhase="title" setG={setG}/>
      </div>
    </div></Shell>);

  /* ═══ SAVES — slot select, load, delete, export/import ═══ */
  if(g.phase==="saves"){
    const saves=listSaves();
    const doImport=(e)=>{const f=e.target.files?.[0]; if(!f) return;
      const r=new FileReader();
      r.onload=()=>{const id=importSaveText(String(r.result||""));
        if(!id) alert("That file isn't a Proximate save."); else setG(s=>({...s}));};
      r.readAsText(f); e.target.value="";};
    const doContinue=(id)=>{const st=loadSave(id); if(!st){alert("Couldn't read that save.");return;}
      const merged={...blank(),...st};
      const setupDone=!!(merged.level&&merged.myVeh&&merged.department&&merged.gmode);
      if(!setupDone){setG(()=>merged);return;}
      // A career shift that had already run its full queue of calls (its
      // last autosave landed on shiftSummary) must NOT be dumped back into
      // "station" — station's "Get the call" would then index past the end
      // of an exhausted career queue and crash. Send it back to the
      // shift-summary screen instead; anything else resumes at the station.
      const exhausted=merged.gmode==="career"&&merged.career&&merged.career.idx>=(merged.career.queue?.length??0);
      setG(()=>({...merged,phase:exhausted?"shiftSummary":"station"}));};
    const doDelete=(id)=>{if(!window.confirm("Delete this save? This cannot be undone.")) return;
      deleteSave(id); setG(s=>({...s}));};
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:680,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        SAVES<BackBtn toPhase="title" setG={setG}/></div>
      <div className="f1" style={{fontSize:12.5,color:C.faint,marginTop:8,lineHeight:1.6}}>
        Saved to this browser. Autosaves before and after every call — export a save if you want a copy that survives clearing your browser data.</div>
      <div className="f2 flex gap-2 flex-wrap mt-4">
        <button onClick={()=>setG(s=>({...s,phase:"disclaimer",afterDisclaimer:"namesave",saveName:"",playerFirst:"John",playerLast:"Doe",playerGender:"",playerPronouns:""}))} className="px-5 py-3 rounded"
          style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13.5}}>+ New save</button>
        <label className="px-5 py-3 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13.5,cursor:"pointer"}}>
          Import save…<input type="file" accept="application/json" onChange={doImport} style={{display:"none"}}/></label>
      </div>
      <div className="f2 flex flex-col gap-2 mt-6">
        {saves.length===0&&<div style={{fontSize:13,color:C.faint,padding:"18px 0"}}>No saves yet. Start a new one above.</div>}
        {saves.map(sv=>(<div key={sv.id} className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <div>
              <div style={{fontSize:14.5,fontWeight:600}}>{sv.name||"Unnamed save"}</div>
              <div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>
                {/* F17 step 3 randomized shift length to 3-7 calls (shiftLen) — the
                    saves list's "/5" was left over from when every shift was exactly
                    5 calls, and is now just wrong for any save with a different length. */}
                {sv.gmode==="career"?`CAREER · call ${(sv.careerIdx??0)+1}`:sv.gmode==="sandbox"?"SANDBOX":"NOT STARTED"}
                {sv.level!=null&&LEVELS[sv.level]?` · ${LEVELS[sv.level].name}`:""}
                {" · "}{new Date(sv.updatedAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>doContinue(sv.id)} className="px-3 py-1.5 rounded"
                style={{background:"#101C18",border:`1px solid ${C.hr}`,color:C.hr,fontSize:12}}>Continue</button>
              <button onClick={()=>exportSave(sv.id)} className="px-3 py-1.5 rounded"
                style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:12}}>Export</button>
              <button onClick={()=>doDelete(sv.id)} className="px-3 py-1.5 rounded"
                style={{background:"transparent",border:`1px solid ${C.faint}`,color:C.faint,fontSize:12}}>Delete</button>
            </div>
          </div>
        </div>))}
      </div>
    </div></Shell>);
  }

  if(g.phase==="namesave"){
    const nm=g.saveName||"";
    const pfirst=g.playerFirst??"John", plast=g.playerLast??"Doe";
    const fullName=`${pfirst} ${plast}`.trim();
    const begin=()=>{const id=newSaveId();
      // candidatePool/hospitalStaff used to be rolled by the "loading" phase's
      // own effect via setG (a synchronous setState-in-effect, flagged by
      // react-hooks/set-state-in-effect) — seeded directly here instead, at
      // the one place a fresh save is actually created, since both generators
      // take no arguments and need nothing from a later phase.
      const fresh={...blank(),saveId:id,saveName:nm||(fullName||"New save"),
        playerFirst:pfirst.trim()||"John",playerLast:plast.trim()||"Doe",
        playerGender:g.playerGender||"",playerPronouns:g.playerPronouns||"",
        candidatePool:genCandidatePool(),hospitalStaff:genHospitalStaff(),
        phase:"loading"};
      writeSave(id,fresh,{name:fresh.saveName,gmode:null,level:null,careerIdx:0});
      setG(()=>fresh);};
    const PRO=["he/him","she/her","they/them"];
    const GEN=["Male","Female","Non-binary"];
    const lbl=(t)=>(<div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:6,marginTop:18}}>{t}</div>);
    const chip=(active,onClick,text)=>(<button key={text} onClick={onClick}
      style={{background:active?"#16241C":"transparent",border:`1px solid ${active?C.hr:C.line}`,color:active?C.hr:C.dim,
        fontSize:12,padding:"6px 11px",borderRadius:6,cursor:"pointer"}}>{text}</button>);
    const fieldStyle={background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:15,outline:"none"};
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:520,margin:"0 auto",paddingTop:44}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        NEW SAVE<BackBtn toPhase="saves" setG={setG}/></div>

      {lbl("YOUR NAME")}
      <div style={{display:"flex",gap:8}}>
        <input autoFocus value={pfirst} onChange={(e)=>setG(s=>({...s,playerFirst:e.target.value}))}
          placeholder="First" maxLength={24}
          className="f1 px-4 py-3 rounded" style={{...fieldStyle,flex:1}}/>
        <input value={plast} onChange={(e)=>setG(s=>({...s,playerLast:e.target.value}))}
          placeholder="Last" maxLength={24}
          className="f1 px-4 py-3 rounded" style={{...fieldStyle,flex:1}}/>
      </div>

      {lbl("GENDER (OPTIONAL)")}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {GEN.map(gv=>chip(g.playerGender===gv,()=>setG(s=>({...s,playerGender:s.playerGender===gv?"":gv})),gv))}
        <input value={GEN.includes(g.playerGender)?"":(g.playerGender||"")} onChange={(e)=>setG(s=>({...s,playerGender:e.target.value}))}
          placeholder="or type your own" maxLength={24}
          style={{flex:"1 1 140px",background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:13,padding:"7px 10px",borderRadius:6,outline:"none"}}/>
      </div>

      {lbl("PRONOUNS (OPTIONAL)")}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {PRO.map(pv=>chip(g.playerPronouns===pv,()=>setG(s=>({...s,playerPronouns:s.playerPronouns===pv?"":pv})),pv))}
        <input value={PRO.includes(g.playerPronouns)?"":(g.playerPronouns||"")} onChange={(e)=>setG(s=>({...s,playerPronouns:e.target.value}))}
          placeholder="or type your own" maxLength={24}
          style={{flex:"1 1 140px",background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:13,padding:"7px 10px",borderRadius:6,outline:"none"}}/>
      </div>

      {lbl("SAVE LABEL (OPTIONAL)")}
      <input value={nm} onChange={(e)=>setG(s=>({...s,saveName:e.target.value}))}
        placeholder={`e.g. Medic 12 — ${pfirst.trim()||"Alex"}`} maxLength={40}
        onKeyDown={(e)=>{if(e.key==="Enter") begin();}}
        className="f1 w-full px-4 py-3 rounded" style={{...fieldStyle,fontSize:14}}/>

      <button onClick={begin} className="f2 px-7 py-3 rounded mt-6"
        style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>
        ▲ Start</button>
    </div></Shell>);
  }

  /* ═══ LOADING — brief, cosmetic beat while "the world" stands up ═══ */
  if(g.phase==="loading"){
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:480,margin:"0 auto",paddingTop:130,textAlign:"center"}}>
      <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".3em",color:C.dim}}>STANDING UP THE WORLD</div>
      <div style={{fontSize:15,color:C.dim,marginTop:16,lineHeight:1.8}}>
        Hiring crews. Staffing rigs. Handing out radios.</div>
      <div style={{fontFamily:MONO,fontSize:24,color:C.amber,marginTop:20}}>···</div>
    </div></Shell>);
  }

  /* ═══ SHIFT TYPE — asked right after the save is created ═══ */
  if(g.phase==="gmodePick"){
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:680,margin:"0 auto",paddingTop:40}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        HOW DO YOU WANT TO WORK<BackBtn toPhase="namesave" setG={setG}/></div>
      <div className="f2 flex flex-col gap-3 mt-6">
        <button onClick={()=>goGmode("career")} className="text-left px-5 py-4 rounded" style={{background:C.panelHi,border:`1px solid ${C.red}`}}>
          <div style={{fontSize:17,fontWeight:600,color:C.red}}>Career Mode <span style={{fontFamily:MONO,fontSize:10,color:C.faint,fontWeight:400}}>FOR FUN</span>{!isTesterUnlocked()&&<span style={{fontFamily:MONO,fontSize:10,color:C.faint,fontWeight:400}}> 🔒 TESTERS ONLY</span>}</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>
            Five calls, back to back, no picking and choosing. When the shift ends you get a debrief on how you did against your own scope of practice.
            {g.learningMode&&<span style={{display:"block",fontFamily:MONO,fontSize:10,color:C.faint,marginTop:4}}>Learning mode: {g.learningMode==="zth"?"Zero-To-Hero":"Master of Your Scope"} (locked for this save)</span>}</div></button>
        <button onClick={()=>setG(s=>({...s,gmode:"sandbox",phase:"level"}))} className="text-left px-5 py-4 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`}}>
          <div style={{fontSize:17,fontWeight:600}}>Medical Education Mode <span style={{fontFamily:MONO,fontSize:10,color:C.faint,fontWeight:400}}>SANDBOX</span></div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>
            Run any written scenario on demand, or build your own — pick the condition, the age, the gender — and drop straight into it. No fixed length, no shift summary.</div></button>
        <button onClick={()=>goGmode("coop")} className="text-left px-5 py-4 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`}}>
          <div style={{fontSize:17,fontWeight:600}}>Co-op <span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>UP TO {COOP_MAX_PEERS} PLAYERS</span>{!isTesterUnlocked()&&<span style={{fontFamily:MONO,fontSize:10,color:C.faint,fontWeight:400}}> 🔒 TESTERS ONLY</span>}</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>
            Share one call with up to {COOP_MAX_PEERS-1} other people — on your Wi-Fi/LAN or anywhere online — by connecting to the same relay and room code.</div></button>
      </div>
    </div></Shell>);
  }

  /* ═══ TESTER GATE — Career Mode / Co-op are password-gated while under
     development (see the TESTER_KEY/isTesterUnlocked/goGmode helpers above).
     Medical Simulation mode never routes through here. Once unlocked, the
     flag lives in localStorage for this browser, so a tester only enters
     the password once, not per-save. g.pendingGmode carries which button
     was clicked (the same "remember where to go next" idiom afterDisclaimer
     already uses for the liability disclaimer). ═══ */
  if(g.phase==="testerGate"){
    const submit=()=>{
      if(testerPwInput===TESTER_PASSWORD){
        try{localStorage.setItem(TESTER_KEY,"1");}catch{/* storage unavailable */}
        setTesterPwInput("");setTesterPwError(false);
        setG(s=>{
          const mode=s.pendingGmode;
          if(mode==="career") return {...s,gmode:"career",phase:s.learningMode?"level":"learningMode",pendingGmode:null};
          if(mode==="coop") return {...s,phase:"coopSetup",pendingGmode:null};
          return {...s,phase:"gmodePick",pendingGmode:null};
        });
      }else{
        setTesterPwError(true);
      }
    };
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:420,margin:"0 auto",paddingTop:80,textAlign:"center"}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim}}>🔒 TESTERS ONLY</div>
      <div style={{fontSize:13,color:C.dim,marginTop:14,lineHeight:1.7}}>
        This mode is still under development and is only open to authorized testers right now.
        Enter the tester password to continue.</div>
      <input type="password" autoFocus value={testerPwInput}
        onChange={(e)=>{setTesterPwInput(e.target.value);setTesterPwError(false);}}
        onKeyDown={(e)=>{if(e.key==="Enter") submit();}}
        placeholder="Password" className="w-full px-4 py-3 rounded mt-6"
        style={{background:C.panel,border:`1px solid ${testerPwError?C.red:C.line}`,color:C.text,fontSize:14,textAlign:"center"}}/>
      {testerPwError&&<div style={{fontSize:12,color:C.red,marginTop:8}}>Incorrect password.</div>}
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16}}>
        <button onClick={submit} className="px-7 py-3 rounded"
          style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>▲ Unlock</button>
        <button onClick={()=>{setTesterPwInput("");setTesterPwError(false);setG(s=>({...s,phase:"gmodePick",pendingGmode:null}));}}
          className="px-6 py-3 rounded" style={{background:"none",border:`1px solid ${C.line}`,color:C.dim,fontSize:14}}>← Back</button>
      </div>
    </div></Shell>);
  }

  /* ═══ CO-OP SETUP — up to COOP_MAX_PEERS players. See src/coop.js and
     server/coopServer.mjs for the full sync model and its honest limits
     (whole-state broadcast, last-write-wins with a timestamp-based staleness
     guard — a shared whiteboard, not a lockstep sim). Once connected, every
     connected browser mirrors the same `g` (phase included), so whichever
     one finishes the setup wizard below carries the rest along automatically
     — no separate "wait for everyone" step needed beyond that.
     DEFAULT_COOP_URL is baked in at build time (VITE_COOP_RELAY_URL) so an
     itch.io build can ship pre-pointed at a real, publicly-hosted relay —
     see docs/itch_deploy.md — while local dev still defaults to the
     same-machine relay unconfigured. ═══ */
  if(g.phase==="coopSetup"){
    const url=g.coop?.url??DEFAULT_COOP_URL;
    const room=g.coop?.room??randomRoomCode();
    const name=g.coop?.name??(g.playerFirst||"Player");
    const status=g.coop?.status;
    const setField=(k,v)=>setG(s=>({...s,coop:{...(s.coop||{url,room,name}),[k]:v}}));
    const connect=()=>setG(s=>({...s,coop:{url:s.coop?.url||url,room:s.coop?.room||room,name:s.coop?.name||name,status:"connecting"}}));
    const disconnect=()=>setG(s=>({...s,coop:null}));
    const players=g.coop?.players||[];
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:620,margin:"0 auto",paddingTop:40}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        CO-OP — UP TO {COOP_MAX_PEERS} PLAYERS<button onClick={()=>{disconnect();setG(s=>({...s,phase:"gmodePick"}));}}
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:12,padding:"6px 12px",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"}}>← Back</button></div>
      <div style={{fontSize:12.5,color:C.dim,marginTop:12,lineHeight:1.75}}>
        Everyone connects to the SAME relay address and SAME room code — up to {COOP_MAX_PEERS} people sharing one call.
        On the same Wi-Fi/LAN, one of you (the host) runs the relay from the project folder —{" "}
        <code style={{color:C.text}}>npm run coop-server</code> — which prints its own LAN address to use below (NOT
        "localhost" — everyone else's browser needs to reach it over Wi-Fi/LAN).
        <span style={{display:"block",marginTop:8,color:C.faint}}>Playing from an itch.io page (or anywhere not on the
        same network) instead needs a relay hosted somewhere with a public address — the field below defaults to
        whatever this build was configured with. Same-network players also still need to load THIS PAGE from the
        host's machine: the host should be running <code style={{color:C.text}}>npm run dev</code> and share the
        "Network:" URL it prints (not the "Local:" one).</span>
      </div>
      <div className="f2 mt-6" style={{display:"flex",flexDirection:"column",gap:12}}>
        <div>
          <div style={{fontSize:11.5,color:C.dim,marginBottom:6}}>YOUR NAME</div>
          <input value={name} onChange={(e)=>setField("name",e.target.value)} placeholder="Player" maxLength={24}
            className="w-full px-4 py-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:14}}/>
        </div>
        <div>
          <div style={{fontSize:11.5,color:C.dim,marginBottom:6}}>RELAY ADDRESS</div>
          <input value={url} onChange={(e)=>setField("url",e.target.value)} placeholder="wss://your-relay.example.com"
            className="w-full px-4 py-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:14}}/>
        </div>
        <div>
          <div style={{fontSize:11.5,color:C.dim,marginBottom:6}}>ROOM CODE</div>
          <input value={room} onChange={(e)=>setField("room",e.target.value.toUpperCase())} placeholder="ECHO42"
            className="w-full px-4 py-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:14,letterSpacing:".1em"}}/>
        </div>
      </div>
      {!status&&<button onClick={connect} className="px-8 py-3 rounded mt-6"
        style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>▲ Connect</button>}
      {status&&<div className="mt-6 p-4 rounded" style={{background:C.panel,border:`1px solid ${status==="connected"?C.hr:status==="error"||status==="full"?C.red:C.line}`}}>
        <div style={{fontFamily:MONO,fontSize:11,color:status==="connected"?C.hr:status==="error"||status==="full"?C.red:C.dim,letterSpacing:".14em"}}>
          {status==="connecting"?"CONNECTING…":status==="connected"?`CONNECTED — ${g.coop.peers||1} OF ${COOP_MAX_PEERS} IN THE ROOM`
            :status==="full"?`ROOM FULL — MAX ${COOP_MAX_PEERS} PLAYERS`:status==="disconnected"?"DISCONNECTED":"COULD NOT CONNECT"}</div>
        {status==="full"&&<div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
          Try a different room code, or wait for a seat to open up.</div>}
        {status==="connected"&&<>
          {players.length>0&&<div style={{fontSize:12.5,color:C.text,marginTop:8,lineHeight:1.6}}>
            {players.map(p=>p.name).join(", ")}</div>}
          <div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
            Whoever finishes "Who are you today" first, everyone else will follow into the same call automatically.</div>
        </>}
        <div className="flex gap-2 mt-4">
          {status==="connected"&&<button onClick={()=>setG(s=>({...s,gmode:"sandbox",phase:"level"}))} className="px-6 py-2.5 rounded"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue →</button>}
          <button onClick={disconnect} className="px-5 py-2.5 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>
            Disconnect</button>
        </div>
      </div>}
    </div></Shell>);
  }

  /* ═══ LEARNING MODE — career-only, PERMANENT for this save (F11) ═══ */
  if(g.phase==="learningMode"){
    // Once set, this never changes for the save — gmodePick's Career button
    // reads g.learningMode and skips straight past this phase from then on.
    // F17 (the Career Mode overhaul, not attempted here) gates its entire
    // content split on this field, so the save-shape decision is made here:
    // a plain string on `g`, carried like every other identity field.
    // F17 step 7: Zero-To-Hero now drops straight into the campaign instead
    // of the manual level/department/vehicle/scope wizard — a guided-
    // campaign player doesn't pick their own gear on day one. The character
    // this campaign is about is fixed: a Northwood University PATROL
    // volunteer, solo, on foot, Layperson scope (see fleet.js's "patrol"
    // vehicle kind). Master of Your Scope is unaffected — it IS today's
    // manual wizard, per this mode's own spec.
    const pick=(m)=>setG(s=>{
      if(m!=="zth") return {...s,learningMode:m,phase:"level"};
      const patrol=KINDS.patrol;
      return {...s,learningMode:m,level:"layperson",department:"Campus PD",
        myVeh:{transport:false,...patrol.vehicle,kind:"patrol",name:patrol.label},
        // Northwood University's PATROL program is campus-based, dense
        // coverage — the "City" MODES entry, not the prior "suburban"
        // default (which had no particular basis; the campaign was never
        // routed through the "WHERE ARE YOU WORKING" picker to justify it).
        mode:"city",scopeOff:{},scopeOverride:{},phase:"campaignRenderPref",
        // campaignCustomize (the real "who are you" moment, §2.2) is the
        // authoritative identity screen for this campaign — reset gender/
        // pronouns/appearance here so nothing carries over from the generic
        // namesave screen's own (optional, easy-to-miss) gender picker.
        // Previously only playerFirst/Last/saveName were reset on "+ New
        // save"; gender could still arrive at campaignCustomize already
        // set from namesave, which read as "auto-selected to Male" even
        // though nothing in campaignCustomize itself defaults it that way.
        playerGender:"",playerPronouns:"",campaignAppearance:null};
    });
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:680,margin:"0 auto",paddingTop:40}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        HOW DO YOU WANT TO LEARN
        <BackBtn toPhase="gmodePick" setG={setG}/>
      </div>
      <div className="f1" style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6,display:"flex",alignItems:"center",gap:6}}>
        <span>🔒</span> This choice is permanent for this save — pick once, and Career mode won't ask again. Sandbox is unaffected either way.
      </div>
      {/* F16: banners per src/assets/ui/ZeroToHeroMode.md and MasterOfYourScopeMode.md
          — amber key light for the guided path, cooler teal for the mastery path. */}
      <div className="f2 flex flex-col gap-3 mt-6">
        <button onClick={()=>pick("zth")} className="text-left px-5 py-4 rounded" style={{background:C.panelHi,border:`1px solid ${C.amber}`}}>
          <img src={MODE_ART.zth} onError={onImgError} alt="" style={{width:"100%",maxHeight:110,objectFit:"cover",borderRadius:6,marginBottom:10}}/>
          <div style={{fontSize:17,fontWeight:600,color:C.amber}}>Zero-To-Hero</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>
            A guided campaign. Start as a Layperson and earn every certification along the way, with a story that
            follows your promotions, from your first PATROL shift through Paramedic and beyond.</div></button>
        <button onClick={()=>pick("mos")} className="text-left px-5 py-4 rounded" style={{background:C.panelHi,border:`1px solid ${C.spo2}`}}>
          <img src={MODE_ART.mos} onError={onImgError} alt="" style={{width:"100%",maxHeight:110,objectFit:"cover",borderRadius:6,marginBottom:10}}/>
          <div style={{fontSize:17,fontWeight:600,color:C.spo2}}>Master of Your Scope</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>
            Open-world. Pick your provider level up front like today's Career mode and work within it — no guided
            story, no forced promotions.</div></button>
      </div>
    </div></Shell>);
  }

  /* ═══ CAMPAIGN RENDER PREFERENCE — an upfront 2D/3D picker, shown once per
     ZTH save between the learningMode pick and campaignDisclaimer.
     STORE-ONLY: whichever option is picked, campaignDisclaimer onward
     renders identically. There is no real 3D content for this campaign's
     solo scenes yet — this project's Three.js work (Coop3DWalk/Coop3DDrive)
     is co-op-only today. Picking "3D" here only sets g.prologueRenderPref;
     it changes no background, sprite, or scene. See CLAUDE.md's F1 queue
     item for the deferred real-3D-heat-stroke-scene work this sets up for
     later. Revisitable afterward via SettingsOverlay's own RENDER STYLE
     row, mirroring the drivingModeEnabled toggle. ═══ */
  if(g.phase==="campaignRenderPref"){
    const pick=(pref)=>setG(s=>({...s,prologueRenderPref:pref,phase:"campaignDisclaimer"}));
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:680,margin:"0 auto",paddingTop:40}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        HOW DO YOU WANT TO SEE IT
        <BackBtn toPhase="learningMode" setG={setG}/>
      </div>
      <div className="f1" style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
        3D rendering isn't available for every scene yet — some scenes will still show as 2D visual-novel screens
        either way. You can change this later in Settings. (Placeholder copy — polish later.)
      </div>
      <div className="f2 flex flex-col gap-3 mt-6">
        <button onClick={()=>pick("2d")} className="text-left px-5 py-4 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`}}>
          <div style={{fontSize:17,fontWeight:600}}>2D</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>Visual-novel style throughout.</div>
        </button>
        <button onClick={()=>pick("3d")} className="text-left px-5 py-4 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`}}>
          <div style={{fontSize:17,fontWeight:600}}>3D</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>
            Use interactive 3D scenes where available. Not every scene has one yet — those will still show as 2D for now.
          </div>
        </button>
      </div>
    </div></Shell>);
  }

  /* ═══ CAMPAIGN DISCLAIMER — design doc §1.1. A separate flag/copy from the
     game-wide liability disclaimer (g.afterDisclaimer/DISCLAIMER_KEY, above):
     this one is about TONE (visual-novel story mode, not a clinical-practice
     tool), shown once per campaign creation, not gated by localStorage —
     "zth" is picked once per save, so this screen is inherently a one-shot
     part of that same character-creation flow, not something that needs to
     survive a browser revisit the way the liability notice does. ═══ */
  if(g.phase==="campaignDisclaimer"){
    // F31: visual-novel reskin. dormRoom is the earliest place the player
    // physically "is" in this story — reading this on their phone/laptop in
    // the room they're about to decorate at campaignCustomize.
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="ZERO-TO-HERO" onBack={()=>setG(s=>({...s,phase:"campaignRenderPref"}))}/>
      {/* Reworded per operator instruction: the original text said "I took some
          liberties" without saying who "I" is or why the liberties exist. This
          version is explicit that the campaign was written by one EMT, not a
          curriculum committee, so gaps against real EMS are a byline, not a
          typo. */}
      <VNBox wide>
        <div style={{fontSize:14,lineHeight:1.85,color:"#EDE7DA"}}>
          {DISCLAIMER_TEXT}<br/><br/>
          {DISCLAIMER_FOOTER}
        </div>
        <button onClick={()=>setG(s=>({...s,phase:"campaignCoincidence"}))}
          className="px-7 py-3 rounded mt-5" style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
          Continue</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN COINCIDENCE NOTICE — a second, one-shot beat right after the
     tone disclaimer above, per explicit operator instruction. Kept as its own
     phase rather than appended to campaignDisclaimer's own text: that screen
     is about TONE/accuracy, this one is the standard fiction disclaimer about
     named characters/organizations, and collapsing them would blur two
     different claims into one wall of text. ═══ */
  if(g.phase==="campaignCoincidence"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="ZERO-TO-HERO" onBack={()=>setG(s=>({...s,phase:"campaignDisclaimer"}))}/>
      <VNBox wide>
        <div style={{fontSize:14,lineHeight:1.85,color:"#EDE7DA"}}>
          {COINCIDENCE_TEXT}
        </div>
        <button onClick={()=>setG(s=>({...s,phase:"campaignLetter"}))}
          className="px-7 py-3 rounded mt-5" style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
          Continue</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ ACCEPTANCE LETTER — design doc §2.2's first beat. A crisp letter from
     Northwood University, shown on its own before it "dissolves into"
     character creation (campaignCustomize, below) — kept as its own phase
     rather than inline text on the customize screen, matching how every
     other campaign beat in this file is its own phase step. ═══ */
  if(g.phase==="campaignLetter"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="NORTHWOOD UNIVERSITY — ADMISSIONS" onBack={()=>setG(s=>({...s,phase:"campaignCoincidence"}))}/>
      <VNBox>
        <div className="f1 p-5 rounded" style={{background:"#FBF6E8",color:"#2A2116",border:"1px solid #C9B98A",fontSize:14,lineHeight:1.9}}>
          {LETTER_GREETING}<br/><br/>
          {LETTER_BODY}
          <br/><br/>
          <span style={{fontFamily:MONO,fontSize:11.5,letterSpacing:".04em",color:"#5A4A2E"}}>{LETTER_PROGRAM_LABEL}</span>
        </div>
        {/* Plot thread requested this session: the player enters the game with
            no declared major, and that specific uncertainty — not just
            generic "what do I do with my life" — is meant to recur and get
            picked back up as PATROL starts to look like an actual answer
            (see campaignLaptop's EMS-interest choice and the tutorial-shift
            interludes in campaignIntro/the station screen). One line here is
            the seed; it isn't resolved this document, it's carried forward. */}
        <div className="f1" style={{fontSize:12.5,color:C.dim,marginTop:14,lineHeight:1.7,fontStyle:"italic"}}>
          {LETTER_FOOTER}</div>
        <button onClick={()=>setG(s=>({...s,phase:"campaignCustomize"}))}
          className="px-7 py-3 rounded mt-5" style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
          Continue</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN CUSTOMIZATION — design doc §1.2/§2.2. The acceptance letter
     (campaignLetter, above) dissolves into character creation: name (reusing
     the SAME playerFirst/playerLast/playerGender identity fields the
     game-wide namesave screen already set, per a real player-naming screen
     that already exists — this is a re-editable, campaign-themed pass over
     it, not a second identity store), plus cosmetic appearance fields with
     no mechanical consumer yet. Confirm leads to campaignWelcome (below),
     which is where g.campaignNames/stats actually get seeded, per §2.2's
     "screen briefly flashes Welcome, [PlayerName]" beat. ═══ */
  if(g.phase==="campaignCustomize"){
    // Name keeps its sensible editable pre-fill (g.playerFirst/Last already
    // default to "John"/"Doe" at the top-level state, same as every other
    // save) — "nothing selected" is about the four CHIP rows below, which
    // previously had three of four silently pre-answered with no chip ever
    // visibly clicked; a pre-filled, still-editable text field isn't the
    // same defect.
    const pfirst=g.playerFirst??"John", plast=g.playerLast??"Doe";
    const GEN=["Male","Female","Non-binary"];
    const GEN_TAG={Male:"male",Female:"female","Non-binary":"nonbinary"};
    const SKIN=["Light","Medium","Tan","Dark"];
    // §2.2 originally specified 5 hairstyles and exactly 3 outfits
    // ("hoodie, t-shirt, or light jacket"). Per explicit direct operator
    // instruction (not the numbered queue — a deliberate expansion of this
    // screen's customization depth), both lists are now wider, and two new
    // axes (hair color, eye color) were added — see the layered-portrait
    // comment on playerBasePath/etc. in assets.js for why that didn't
    // multiply the placeholder-image count into the thousands.
    const HAIR=["Short","Long","Curly","Buzzed","Ponytail","Half Up","Braided","Bun"];
    const HAIR_COLORS=["Black","Brown","Blonde","Red","Auburn","Gray"];
    const EYE_COLORS=["Brown","Blue","Green","Hazel","Gray","Amber"];
    const OUTFIT=["Hoodie","T-Shirt","Light Jacket","Dress","Sweater","Tank Top","Turtleneck"];
    // "Turtleneck" added per explicit operator instruction to keep growing
    // the customization roster as good source garments are found — a
    // ribbed turtleneck with suspender straps, visually distinct from
    // every other OUTFIT entry (see assets.js's PLAYER_OUTFITS comment for
    // the source/build detail).
    // Outfit gets the same style/color split as hair, per explicit operator
    // instruction to reuse the idea — a color choice multiplies only
    // against outfit style, not against gender/skin/hair/eyes too.
    const OUTFIT_COLORS=["Black","Gray","Navy","White","Red","Olive"];
    // A genuinely new 5th customization axis (not a placeholder fill), added
    // per explicit operator instruction to keep growing the roster as good
    // source garments/accessories are found. "None" is a real, always-first
    // choice — most characters won't wear glasses — so it must be picked
    // explicitly like everything else here, not defaulted to. See
    // assets.js's PLAYER_GLASSES_STYLES comment for each style's source.
    const GLASSES=["None","Oval","Browline","Round","Square","Safety"];
    const GLASSES_COLORS=["Black","Gray","Navy","White","Red","Olive"];
    // A 6th axis, same instruction/reasoning as GLASSES above — see
    // assets.js's PLAYER_EARRING_STYLES comment for each style's source.
    const EARRINGS=["None","Stud","Hoop","Heart"];
    const EARRING_COLORS=["Black","Gray","Navy","White","Red","Olive"];
    // A 7th axis, same instruction/reasoning as GLASSES/EARRINGS above — see
    // assets.js's PLAYER_NECKLACE_STYLES comment for each style's source and
    // why a cross-pendant style and a near-duplicate scarf style were both
    // skipped.
    const NECKLACE=["None","Heart","Scarf","Pendant","Shell"];
    const NECKLACE_COLORS=["Black","Gray","Navy","White","Red","Olive"];
    // An 8th axis — see assets.js's PLAYER_HAT_STYLES comment for why only
    // one real style exists (a wide-brim sun hat) and why it needed its own
    // position override, unlike every other accessory here.
    const HATS=["None","Sun","Cap","Beanie","Headphones"];
    const HAT_COLORS=["Black","Gray","Navy","White","Red","Olive"];
    // Nothing pre-selected, per explicit operator request — this is the
    // player's first real choice in the game, and a screen that already has
    // answers filled in undercuts that. Previously fell back to
    // {skinTone:SKIN[1],hairStyle:HAIR[0],outfit:OUTFIT[0]}, which made
    // three of the four chip rows read as already-decided before the player
    // touched anything (see src/assets/ui/CampaignCustomize.md). hairColor/
    // eyeColor/outfitColor/glasses/glassesColor/earrings/earringsColor/
    // necklace/necklaceColor/hat/hatColor follow the same "nothing
    // pre-selected" rule as every other attribute here.
    const app=g.campaignAppearance||{skinTone:null,hairStyle:null,hairColor:null,eyeColor:null,outfit:null,outfitColor:null,glasses:null,glassesColor:null,earrings:null,earringsColor:null,necklace:null,necklaceColor:null,hat:null,hatColor:null};
    const lbl=(t)=>(<div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:6,marginTop:16}}>{t}</div>);
    // §2.2: "the random ambulance button that pulls a binary-gendered entry
    // from NAME_POOL" — drawNameByGender already only returns male/female
    // tags unless a genderTag is unrecognized, matching "binary-gendered."
    const randomizeName=()=>setG(s=>{
      const tag=GEN_TAG[s.playerGender]||null;
      const {name}=drawNameByGender(tag);
      const parts=name.split(" "); const first=parts[0], last=parts.slice(1).join(" ")||parts[0];
      return {...s,playerFirst:first,playerLast:last};
    });
    // Nothing is pre-selected, so Confirm is now gated on every field
    // actually being chosen — previously it had no gate at all and would
    // silently commit whatever defaults were showing.
    const canConfirm=!!(pfirst.trim()&&plast.trim()&&g.playerGender&&app.skinTone&&app.hairStyle&&app.hairColor&&app.eyeColor&&app.outfit&&app.outfitColor&&app.glasses&&(app.glasses==="None"||app.glassesColor)&&app.earrings&&(app.earrings==="None"||app.earringsColor)&&app.necklace&&(app.necklace==="None"||app.necklaceColor)&&app.hat&&(app.hat==="None"||app.hatColor));
    // §2.2: Confirm no longer jumps straight to campaignReflection — it goes
    // to campaignWelcome first ("the screen briefly flashes Welcome,
    // [PlayerName]"), which is where the stats/campaignNames seeding
    // (formerly here) now happens, right before the reflection wizard.
    const confirm=()=>{ if(!canConfirm) return; setG(s=>({...s,campaignAppearance:app,phase:"campaignWelcome"})); };
    // Big customizable-asset picker (per explicit operator request): one
    // large preview portrait above a set of arrow cyclers, instead of four
    // independent chip rows with no combined picture. `cycle` wraps
    // around in either direction and treats "nothing chosen yet" as
    // "start from the first/last option" rather than crashing on indexOf(-1).
    const cycle=(arr,cur,dir)=>{
      const i=arr.indexOf(cur);
      if(i<0) return dir>0?arr[0]:arr[arr.length-1];
      return arr[(i+dir+arr.length)%arr.length];
    };
    const arrowBtn=(dir,onClick)=>(<button onClick={onClick} className="px-3 py-2 rounded"
      style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.amber,fontSize:16,cursor:"pointer",lineHeight:1,minWidth:38}}>
      {dir<0?"‹":"›"}</button>);
    const attrRow=(label,value,options,onSet)=>(<div key={label}>
      {lbl(label)}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {arrowBtn(-1,()=>onSet(cycle(options,value,-1)))}
        <div style={{flex:1,textAlign:"center",fontSize:14,color:value?C.text:C.faint}}>
          {value||"— click an arrow to choose —"}</div>
        {arrowBtn(1,()=>onSet(cycle(options,value,1)))}
      </div>
    </div>);
    // Composited layers, bottom to top: base body, outfit, hair, eyes — see
    // the layered-portrait comment on playerBasePath/etc. in assets.js.
    // playerPortraitLayers() (assets.js) is the single source of truth for
    // "is the look fully specified" + "what are the layer paths" — F8's
    // VNSprite reuse elsewhere in the campaign calls the same helper rather
    // than duplicating this slugging/gender-tag logic a second time.
    const portraitLayers=playerPortraitLayers(g.playerGender,app)||[];
    const portraitReady=portraitLayers.length>0;
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="WHO ARE YOU?" onBack={()=>setG(s=>({...s,phase:"campaignLetter"}))}/>
      <div style={{display:"flex",justifyContent:"center",padding:"0 12px"}}>
        <div style={{width:180,height:270,borderRadius:8,overflow:"hidden",flexShrink:0,position:"relative",
          border:`1px solid ${portraitReady?C.amber:C.line}`,background:"#0A0A0A",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
          {portraitReady
            ? portraitLayers.map((src,i)=>(<img key={i} src={src} onError={onImgError} alt=""
                style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>))
            : <img src={PLACEHOLDERS.generic} alt=""
                style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.3}}/>}
        </div>
      </div>
      {!portraitReady&&<div style={{textAlign:"center",fontSize:11,color:C.faint,margin:"8px 0 0"}}>
        Use the ‹ › arrows below to build your look.</div>}
      <VNBox wide>
        <div style={{fontSize:13.5,color:C.dim,lineHeight:1.7}}>
          A soft-focus dorm room, boxes half-unpacked. Move-in day is close. There's no one here to tell you what
          you're supposed to look like — so, for once, you get to decide. Who are you going to be here?</div>

        {lbl("NAME")}
        <div style={{display:"flex",gap:8}}>
          <input value={pfirst} onChange={(e)=>setG(s=>({...s,playerFirst:e.target.value}))}
            placeholder="First" maxLength={24} className="f1 px-4 py-3 rounded"
            style={{background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:15,outline:"none",flex:1}}/>
          <input value={plast} onChange={(e)=>setG(s=>({...s,playerLast:e.target.value}))}
            placeholder="Last" maxLength={24} className="f1 px-4 py-3 rounded"
            style={{background:C.panel,border:`1px solid ${C.line}`,color:C.text,fontSize:15,outline:"none",flex:1}}/>
          <button onClick={randomizeName} title="Randomize name" className="px-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,fontSize:18,cursor:"pointer"}}>🚑</button>
        </div>

        {attrRow("GENDER PRESENTATION",g.playerGender,GEN,(v)=>setG(s=>({...s,playerGender:v})))}
        {attrRow("SKIN TONE",app.skinTone,SKIN,(v)=>setG(s=>({...s,campaignAppearance:{...app,skinTone:v}})))}
        {attrRow("HAIR STYLE",app.hairStyle,HAIR,(v)=>setG(s=>({...s,campaignAppearance:{...app,hairStyle:v}})))}
        {attrRow("HAIR COLOR",app.hairColor,HAIR_COLORS,(v)=>setG(s=>({...s,campaignAppearance:{...app,hairColor:v}})))}
        {attrRow("EYE COLOR",app.eyeColor,EYE_COLORS,(v)=>setG(s=>({...s,campaignAppearance:{...app,eyeColor:v}})))}
        {attrRow("OFF-SHIFT OUTFIT",app.outfit,OUTFIT,(v)=>setG(s=>({...s,campaignAppearance:{...app,outfit:v}})))}
        {attrRow("OUTFIT COLOR",app.outfitColor,OUTFIT_COLORS,(v)=>setG(s=>({...s,campaignAppearance:{...app,outfitColor:v}})))}
        {attrRow("GLASSES",app.glasses,GLASSES,(v)=>setG(s=>({...s,campaignAppearance:{...app,glasses:v,glassesColor:v==="None"?null:app.glassesColor}})))}
        {app.glasses&&app.glasses!=="None"&&
          attrRow("GLASSES COLOR",app.glassesColor,GLASSES_COLORS,(v)=>setG(s=>({...s,campaignAppearance:{...app,glassesColor:v}})))}
        {attrRow("EARRINGS",app.earrings,EARRINGS,(v)=>setG(s=>({...s,campaignAppearance:{...app,earrings:v,earringsColor:v==="None"?null:app.earringsColor}})))}
        {app.earrings&&app.earrings!=="None"&&
          attrRow("EARRING COLOR",app.earringsColor,EARRING_COLORS,(v)=>setG(s=>({...s,campaignAppearance:{...app,earringsColor:v}})))}
        {attrRow("NECKLACE",app.necklace,NECKLACE,(v)=>setG(s=>({...s,campaignAppearance:{...app,necklace:v,necklaceColor:v==="None"?null:app.necklaceColor}})))}
        {app.necklace&&app.necklace!=="None"&&
          attrRow("NECKLACE COLOR",app.necklaceColor,NECKLACE_COLORS,(v)=>setG(s=>({...s,campaignAppearance:{...app,necklaceColor:v}})))}
        {attrRow("HAT",app.hat,HATS,(v)=>setG(s=>({...s,campaignAppearance:{...app,hat:v,hatColor:v==="None"?null:app.hatColor}})))}
        {app.hat&&app.hat!=="None"&&
          attrRow("HAT COLOR",app.hatColor,HAT_COLORS,(v)=>setG(s=>({...s,campaignAppearance:{...app,hatColor:v}})))}

        <button disabled={!canConfirm} onClick={confirm} className="px-7 py-3 rounded mt-7"
          style={{background:canConfirm?"#1A1510":C.panelHi,border:`1px solid ${canConfirm?C.amber:C.line}`,
            color:canConfirm?C.amber:C.faint,fontSize:14,cursor:canConfirm?"pointer":"default"}}>
          ▲ Confirm</button>
        {!canConfirm&&<div style={{fontSize:11,color:C.faint,marginTop:8}}>Pick a name, gender presentation, skin tone, hairstyle, hair color, eye color, outfit, outfit color, glasses (or None), earrings (or None), necklace (or None), and hat (or None) to continue.</div>}
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN WELCOME — design doc §2.2's closing beat: "the screen
     briefly flashes 'Welcome, [PlayerName]' and then fades to black." This is
     also where g.campaignNames/the four starting attributes actually get
     seeded (moved here from campaignCustomize's old Continue handler) —
     the natural point since it's the last stop before campaignReflection
     reads REFLECTION_PROMPTS[0]. ═══ */
  if(g.phase==="campaignWelcome"){
    const proceed=()=>setG(s=>({...s,campaignNames:initializeCampaignNames(CAMPAIGN_NAME_SLOTS),
      fitness:10,confidence:10,knowledge:10,ambition:10,reflectionStep:REFLECTION_PROMPTS[0].id,phase:"campaignReflection"}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom} dim={0.5}>
      <VNBox style={{textAlign:"center"}}>
        <div style={{fontSize:26,fontWeight:700,color:C.amber}}>Welcome to Northwood, {g.playerFirst}.</div>
        <button onClick={proceed} className="px-7 py-3 rounded mt-8"
          style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
          Continue</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN SELF-REFLECTION — design doc §1.3.2. A diegetic, four-step
     wizard (same shape as the AMA flow's step state machine, `g.amaStep`)
     that sets the four starting attributes via `g.reflectionStep`, one
     REFLECTION_PROMPTS entry per step. Each option applies a PRIMARY +5 and
     a SECONDARY +1 on top of the 10 baseline campaignCustomize's Continue
     button just set, so going back to customize and forward again re-zeroes
     to 10 first — re-running this wizard can never silently stack deltas
     from a prior pass. ═══ */
  if(g.phase==="campaignReflection"){
    const idx=REFLECTION_PROMPTS.findIndex(p=>p.id===g.reflectionStep);
    const prompt=REFLECTION_PROMPTS[idx<0?0:idx];
    const choose=(opt)=>setG(s=>{
      const nextIdx=idx+1;
      const stats={...s,
        [opt.primary]:(s[opt.primary]??10)+REFLECTION_PRIMARY_DELTA,
        [opt.secondary]:(s[opt.secondary]??10)+REFLECTION_SECONDARY_DELTA};
      // §2.3's closing beat ("a small UI element briefly shows the new
      // stats... fade to the apartment desk") is campaignStatsReveal, below
      // — not campaignIntro directly.
      if(nextIdx>=REFLECTION_PROMPTS.length) return {...stats,reflectionStep:null,phase:"campaignStatsReveal"};
      return {...stats,reflectionStep:REFLECTION_PROMPTS[nextIdx].id};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.apartmentStudio}>
      {/* §2.3's opening beat — shown once, only ahead of the first prompt. */}
      {idx===0&&<div style={{fontSize:13,color:"#C9BFA8",fontStyle:"italic",lineHeight:1.7,textAlign:"center",
        maxWidth:520,margin:"0 auto 14px",padding:"0 16px"}}>
        Looking out at the campus quad from your new studio apartment: "New city, new school… I guess it's time
        to figure out who I want to be here."</div>}
      <VNBox wide label={`${idx+1} / ${REFLECTION_PROMPTS.length} — SELF-REFLECTION`}>
        <div style={{fontSize:18,lineHeight:1.7}}>{prompt.scene}</div>
        <div className="flex flex-col gap-2 mt-6">
          {prompt.options.map((o,i)=>(<button key={i} onClick={()=>choose(o)} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div>{o.label}</div>
            {o.flavor&&<div style={{fontSize:12,color:C.dim,marginTop:5,fontStyle:"italic"}}>{o.flavor}</div>}</button>))}
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN STATS REVEAL — design doc §2.3's closing beat: "the MC sighs
     contentedly and turns away from the window. A small UI element briefly
     shows the new stats... fade to the apartment desk." ═══ */
  if(g.phase==="campaignStatsReveal"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.apartmentStudio}>
      <VNBox style={{textAlign:"center"}}>
        <div style={{fontSize:13,color:C.dim,fontStyle:"italic",lineHeight:1.7}}>
          You turn away from the window, a little more sure of who you are than you were an hour ago.</div>
        <div className="flex flex-col gap-2 mt-6 text-left">
          {[["Fitness",g.fitness],["Confidence",g.confidence],["Knowledge",g.knowledge],["Ambition",g.ambition]].map(([label,val])=>(
            <div key={label} className="flex justify-between px-4 py-2 rounded" style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`}}>
              <span style={{color:C.dim,fontSize:13}}>{label}</span><span style={{fontFamily:MONO,color:C.amber,fontSize:13}}>{val}</span></div>))}
        </div>
        <button onClick={()=>setG(s=>({...s,phase:"campaignLaptop"}))} className="px-7 py-3 rounded mt-7"
          style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
          Continue</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN LAPTOP — design doc §2.4. A single branching beat (Yes/No,
     "Are you interested in EMS?") that unlocks one of two mutually-exclusive
     flavor achievements. The achievement DOES get written to g.achievements
     for real (so it shows correctly in the Achievements overlay from then
     on), but this call site deliberately does NOT also push onto
     g.toastQueue (see AchievementToast.jsx, F7) — this scene already shows
     its own dedicated inline banner below, guaranteed visible because it's
     real content on THIS screen, and stacking the global toast on top would
     just be the same unlock announced twice. (F7's own defect — the global
     toast being unreachable from any phase — is now fixed for every OTHER
     achievement-credit site; this scene predates that fix and intentionally
     keeps its bespoke banner rather than switching to the generic one.) ═══ */
  if(g.phase==="campaignLaptop"){
    const unlockedId=g.campaignEmsInterest==="yes"?"ems_wannabe":g.campaignEmsInterest==="no"?"not_so_ems":null;
    const unlockedAch=unlockedId&&ACHIEVEMENTS.find(a=>a.id===unlockedId);
    const choose=(interest)=>setG(s=>{
      const unlocked=newlyUnlocked({campaignEmsInterest:interest},s.achievements||[]);
      return {...s,campaignEmsInterest:interest,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    // F31 — the ParamedicStories skit, one clicked line at a time (see
    // src/assets/ui/CampaignLaptopVideo.md and src/components/VNShell.jsx).
    // `persona` is a JASON_PERSONAS key (assets.js) driving which sprite is
    // on screen for that line — a real illustrated costume/expression
    // change now, not just a speaker-label string (see Jason.md).
    // VIDEO_LINES now lives in campaign/prologue.js (queue item F1's
    // prologue-dialogue migration) — imported at the top of this file.
    if(!g.laptopIntroDone){
      return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.apartmentStudio} dim={0.24}>
        <VNHeader title="YOUR APARTMENT — EVENING"/>
        <VNBox>
          <VNDialogue key="laptopIntro" lines={LAPTOP_INTRO_LINES} doneLabel="Open the laptop"
            onDone={()=>setG(s=>({...s,laptopIntroDone:1}))}/>
        </VNBox>
      </VNScene></Shell>);
    }
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.apartmentStudio} dim={0.24}>
      <VNHeader title="YOUR APARTMENT — EVENING"/>
      {/* The laptop "screen" — see CampaignLaptopVideo.md for the intended
          bezel/glow treatment; a dark panel INSIDE the VNBox, distinguishing
          "the video" from "the room around it." Jason renders as a real
          VNSprite (full scene-character size) rather than a small raw <img>,
          so the skit reads as a scene playing out rather than a thumbnail
          bolted above a transcript. */}
      <VNBox>
        <div className="f1 p-2 rounded" style={{background:"#0A0A0A",border:`1px solid ${C.line}`,boxShadow:"0 0 24px rgba(90,150,255,0.06) inset"}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".14em",color:C.red,padding:"8px 12px 0"}}>
            ▶ ParamedicStories — recommended for you</div>
          {!g.laptopVideoDone
            ? <>
                {/* Jason's current persona, driven by VNDialogue's
                    onLineChange the same way a scene sprite's `pose` reacts
                    to the current line elsewhere — here it's the whole
                    sprite that swaps, since these are different costumes/
                    roles, not one character's incidental action. */}
                <div style={{maxHeight:"38vh",overflow:"hidden"}}>
                  <VNSprite src={jasonSpritePath(g.jasonPersona||VIDEO_LINES[0].persona)}/>
                </div>
                <div style={{padding:"0 12px 10px"}}>
                  <VNDialogue key="paramedicStories" lines={VIDEO_LINES} doneLabel="End of clip"
                    onLineChange={(line)=>setG(s=>({...s,jasonPersona:line.persona}))}
                    onDone={()=>setG(s=>({...s,laptopVideoDone:1,jasonPersona:null}))}/>
                </div>
              </>
            : <div style={{fontSize:13,color:C.dim,fontStyle:"italic",padding:"0 12px 12px"}}>You chuckle, and close the tab.</div>}
        </div>
        {/* !! guards against the React "stray 0" render: laptopVideoDone is a
            numeric 0/1 flag (blank()), so `{g.laptopVideoDone&&(...)}` rendered
            a literal "0" text node under the video for as long as it was
            still playing — same defect class as settingsOpen/achievementsOpen/
            relationshipsOpen/statsOpen, missed in that earlier pass. */}
        {!!g.laptopVideoDone&&(unlockedAch?<>
          <div className="mt-6 p-4 rounded" style={{background:"#16241C",border:`1px solid ${C.hr}`}}>
            <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".14em",color:C.hr}}>🏆 ACHIEVEMENT UNLOCKED</div>
            <div style={{fontSize:15,fontWeight:600,marginTop:6}}>{unlockedAch.name}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4,lineHeight:1.6}}>{unlockedAch.desc}</div>
          </div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignHeatStrokeSim"}))} className="px-7 py-3 rounded mt-6"
            style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
            Continue</button>
        </>:<>
          <div style={{fontSize:12.5,color:C.dim,fontStyle:"italic",marginTop:16,lineHeight:1.7}}>
            (Still Undeclared. Your advisor's email is still sitting there, unanswered, asking what you're
            leaning toward. You don't know. You've never known. Maybe that's fine. Maybe it isn't.)</div>
          <div style={{fontSize:16,fontWeight:600,marginTop:12}}>Are you interested in EMS?</div>
          <div className="flex flex-col gap-2 mt-4">
            <button onClick={()=>choose("yes")} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              Yes — Helping people, quick thinking… and those memes are gold. Maybe I should look into this.</button>
            <button onClick={()=>choose("no")} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              No — Seems chaotic and stressful. I'll stick to business.</button>
          </div>
        </>)}
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN HEAT STROKE — SIMULATION — design doc §2.5, rebuilt onto
     FULL REUSE of the real call flow (dropping the old scripted
     HeatStrokeTutorialSim component and its hand-rolled dashboard/action
     buttons/drag mechanic entirely): the player runs the actual
     `heatStroke` scenario (HEAT-001, src/data/scenarios.js) through the
     real approach/scene screen — the same tabbed Actions/Crew/Monitor
     panel, the same "nothing is a vital until you obtain it" system, the
     same narrative log — at Layperson scope, exactly like playing this
     scenario in Sandbox or Career. "Move to shade" is therefore the REAL,
     Layperson-scope, zero-cost `moveToShade` procedure (src/data/
     procedures.js), not a bespoke drag bar; assess actions are the real
     history/probe general actions; the vitals panel only shows what's
     actually been measured, same as everywhere else in the game.
     Two deliberate departures from an ordinary call, per explicit operator
     instruction: no "response" (dispatch/drive) phase — begin() below skips
     straight to "approach," since the collapse happens right in front of
     the player and there's nothing to drive to — and calling 911 doesn't
     summon a real ambulance on a real-dispatch ETA; it summons Northwood
     PATROL, who take over in exactly one minute and end the scene (see
     call911Now's and generalActs' own tutorialHeatStrokeActive branches,
     and the tick loop's matching branch), handing off to
     campaignHeatStrokeAftermath instead of running through transport/
     debrief. ═══ */
  if(g.phase==="campaignHeatStrokeSim"){
    const begin=()=>setG(s=>withLoadoutRefresh({...s,scen:"heatStroke",phase:"approach",
      ...SCEN.heatStroke.seed(),
      exposed:initialExposure(SCEN.heatStroke.clothing),shoesOff:initialShoes(SCEN.heatStroke.clothing),
      tutorialHeatStrokeActive:1,tutorialHeatStroke911At:null,tutorialHeatStrokeStartAt:s.t,
      crew:[],call911:0,call911Asked:0,sceneUnits:[],sceneRank:1,
      planned:{},commandLevel:LEVELS[s.level].n,commander:null,forcedTask:null}));
    // F33 follow-up: this scene is broad daylight ("oppressively hot;
    // cicadas drone") — a real daytime quad background
    // (BACKGROUNDS.campusQuadDay) instead of reusing the night file as a
    // placeholder shortcut.
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadDay} dim={0.15}>
      <VNHeader title="NORTHWOOD UNIVERSITY — MAIN QUAD"/>
      <VNBox wide>
        <VNDialogue key="heatStrokeSimIntro" doneLabel="What now?"
          lines={HEATSTROKE_SIM_INTRO_LINES({stats:{fitness:g.fitness,confidence:g.confidence,knowledge:g.knowledge,ambition:g.ambition},
            emsInterest:g.campaignEmsInterest})}
          onDone={begin}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN HEAT STROKE — AFTERMATH — design doc §2.5's closing beat.
     partner_patrol and campaignSecondRespName are both already set by the
     time this phase is reached (the tick loop's tutorialHeatStrokeActive
     branch sets them at the transition in, the moment PATROL takes over —
     see the campaignHeatStrokeSim phase above) — this phase only READS
     them, so it never needs a display-only placeholder or any g mutation
     during render. ═══ */
  if(g.phase==="campaignHeatStrokeAftermath"){
    const moved=g.heatStrokeMovedToShade;
    const partner=g.relationships?.partner_patrol;
    // First name only in spoken dialogue/speaker tags — NAME_POOL entries
    // are "First Last," and two people who know each other don't address
    // each other by full legal name every line.
    const partnerFirst=firstName(partner?.name)||"???";
    const secondResp=firstName(g.campaignSecondRespName);
    const pr=PRONOUN_SETS[partner?.pronouns]||PRONOUN_SETS.they;
    // supervisor is created here too, on the "Yes" path only — the natural
    // point of committing to join, one scene before actually meeting them
    // at the station (campaignStation). Idempotent (same OR-fallback as
    // partner_patrol) so campaignLibraryEncounter's own "Yes" can safely
    // do the same thing if THAT'S the path that led here instead.
    const join=(interest)=>setG(s=>{
      if(interest==="yes"){
        const sup=drawName();
        const relationships={...(s.relationships||{}),
          supervisor: s.relationships?.supervisor ||
            createRelationship({name:sup.name, role:"PATROL supervisor", gender:sup.gender, startFriendship:10})};
        return {...s,relationships,phase:"campaignStation"};
      }
      const unlocked=newlyUnlocked({declinedPatrolFirst:true},s.achievements||[]);
      return {...s,phase:"campaignPatrolDeclineInterstitial",
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    // Actions used to be written straight into the quoted text ("(kneeling,
    // calm but urgent)", "(into radio)") — moved onto the speaker's own
    // sprite via `pose` instead (VNSprite, VNShell.jsx); dialogue text is
    // now just what's actually said. secondResp has no sprite in this scene
    // (see campaignSecondRespName's own comment — a single-scene, no-portrait
    // speaking role), so their line simply drops the stage direction rather
    // than inventing one.
    // AFTERMATH_LINES now lives in campaign/prologue.js, as a (ctx)=>[...]
    // function — see that file for why.
    const partnerSrc=partner?portraitFor({role:partner.role,gender:partner.gender,name:partner.name}):null;
    // F8: the player's own layered portrait (built at campaignCustomize,
    // reached earlier in the prologue) reappearing here, rather than never
    // being seen again after that one screen — see VNSprite's own `layers`
    // prop comment (VNShell.jsx) and playerPortraitLayers (assets.js).
    const playerLayers=playerPortraitLayers(g.playerGender,g.campaignAppearance);
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadDay} dim={0.15}>
      <VNHeader title="THE QUAD — MOMENTS LATER"/>
      <div style={{display:"flex"}}>
        <VNSprite layers={playerLayers} side="left"/>
        <VNSprite src={partnerSrc} side="right" pose={g.vnPose?.[partnerFirst]}/>
      </div>
      <VNBox wide>
        {/* The "Join Northwood PATROL?" question used to render unconditionally
            alongside the dialogue, so it was visible from the very first line
            instead of only once the scene had actually played out — the same
            "gate the choice behind onDone" pattern campaignLaptop/postCallOd
            already use correctly, applied here too. */}
        {!g.aftermathTalked
          ? <VNDialogue key="heatStrokeAftermath" doneLabel="What do you say?" lines={AFTERMATH_LINES({partnerFirst,secondResp,moved,pr,hesitated:!!g.heatStrokeHesitated})}
              onLineChange={vnLineChange(setG)}
              onDone={()=>setG(s=>({...s,aftermathTalked:1,vnPose:{}}))}/>
          : <>
              <div style={{fontSize:16,fontWeight:600,marginTop:18}}>Join Northwood PATROL?</div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={()=>join("yes")} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  Yes.</button>
                <button onClick={()=>join("no")} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  No.</button>
              </div>
            </>}
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN PATROL DECLINE INTERSTITIAL — the fade/time-skip beat
     between declining at the quad and campaignLibraryEncounter's own
     "TWO WEEKS LATER" arrival. A genuinely separate phase, not an overlay on
     campaignLibraryEncounter's own mount: matches this file's "always a
     discrete phase" convention (every other transition, however short, is
     its own phase) and needs no local useState/useEffect fade-timer, unlike
     every other phase branch in this file. The fade itself is a pure CSS
     opacity animation — no JS timer — in the same "black overlay" spirit as
     DrivingScene.jsx's fade div, reimplemented without its ref-driven rAF
     loop since this is a static VN beat, not a live 3D scene. Deliberately
     says only "Two weeks pass." (present tense) rather than repeating "two
     weeks later" — campaignLibraryEncounter's own header already carries
     that line; this screen is the transition, not the arrival. ═══ */
  if(g.phase==="campaignPatrolDeclineInterstitial"){
    return (<Shell g={g} setG={setG} css={css}>
      <div style={{position:"fixed",inset:0,background:"#000",display:"flex",
        alignItems:"center",justifyContent:"center",
        animation:"pdiFadeIn 1.1s ease-out both"}}>
        <style>{`@keyframes pdiFadeIn{from{opacity:0}to{opacity:1}}`}</style>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:15,color:"#EDE7DA",letterSpacing:".05em"}}>Two weeks pass.</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignLibraryEncounter"}))}
            className="px-6 py-3 rounded mt-8"
            style={{background:"rgba(27,36,43,0.9)",border:"1px solid rgba(255,255,255,0.15)",color:"#EDE7DA",fontSize:13.5}}>
            Continue</button>
        </div>
      </div>
    </Shell>);
  }

  /* ═══ CAMPAIGN LIBRARY ENCOUNTER — design doc §2.5.1. Only reachable after
     declining at the quad (campaignHeatStrokeAftermath's "No"). A second and
     final chance — declining here is a real ending (campaignNormieEnding),
     not a soft gate, matching the doc's "never locks the player out" spirit
     for the OTHER prologue branch (§1.4.2) applied honestly here too: this
     path really does end the campaign, and says so. ═══ */
  if(g.phase==="campaignLibraryEncounter"){
    const partner=g.relationships?.partner_patrol;
    const partnerFirst=firstName(partner?.name);
    const join=(interest)=>setG(s=>{
      if(interest==="yes"){
        const sup=drawName();
        const relationships={...(s.relationships||{}),
          supervisor: s.relationships?.supervisor ||
            createRelationship({name:sup.name, role:"PATROL supervisor", gender:sup.gender, startFriendship:10})};
        return {...s,relationships,phase:"campaignStation"};
      }
      const unlocked=newlyUnlocked({declinedPatrolTwice:true},s.achievements||[]);
      return {...s,phase:"campaignNormieEnding",
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    const partnerSrc=partner?portraitFor({role:partner.role,gender:partner.gender,name:partner.name}):null;
    // F8: same player-sprite reuse as campaignHeatStrokeAftermath, above.
    const playerLayers=playerPortraitLayers(g.playerGender,g.campaignAppearance);
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusLibrary}>
      <VNHeader title="CAMPUS LIBRARY — TWO WEEKS LATER"/>
      <div style={{display:"flex"}}>
        <VNSprite layers={playerLayers} side="left"/>
        <VNSprite src={partnerSrc} side="right"/>
      </div>
      <VNBox wide>
        {/* Same fix as campaignHeatStrokeAftermath: gate the choice behind
            the dialogue's own onDone instead of rendering it alongside the
            dialogue from the first line. */}
        {!g.libraryTalked
          ? <VNDialogue key="libraryEncounter" doneLabel="What do you say?" lines={LIBRARY_ENCOUNTER_LINES({partnerFirst})} onDone={()=>setG(s=>({...s,libraryTalked:1}))}/>
          : <>
              <div style={{fontSize:16,fontWeight:600,marginTop:18}}>Join Northwood PATROL now?</div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={()=>join("yes")} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  Yes.</button>
                <button onClick={()=>join("no")} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  No.</button>
              </div>
            </>}
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN ENDING — "Normie…" — design doc §2.5.1's ending. A genuine
     terminal beat for this save's campaign thread — the first one this
     campaign has. Returns to title rather than resetting/deleting the save
     (no destructive action was asked for, and every other "go back" button
     in this file preserves the save the same way). ═══ */
  if(g.phase==="campaignNormieEnding"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom} dim={0.6}>
      <VNBox style={{textAlign:"center"}}>
        <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".3em",color:C.faint}}>ENDING</div>
        <div style={{fontSize:24,fontWeight:700,marginTop:12}}>"Normie…"</div>
        <div style={{fontSize:14,color:C.dim,marginTop:18,lineHeight:1.9}}>
          You never join Northwood PATROL. You go back to being an ordinary student — classes, parties, the
          occasional fleeting thought about the person you couldn't help. The ambulance sirens become just another
          part of campus background noise.<br/><br/>Maybe in another life.</div>
        <button onClick={()=>{const next={...blank(),...carry(g),phase:"title"};
            writeSave(next.saveId,next,{name:next.saveName,gmode:next.gmode,level:next.level});
            setG(()=>next);}} className="px-7 py-3 rounded mt-8"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:14}}>
          Return to title</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN STATION — design doc §2.6. supervisor already exists by the
     time this phase is reached — both paths that lead here
     (campaignHeatStrokeAftermath's and campaignLibraryEncounter's "Yes")
     create it at the moment of committing to join, one scene earlier — so
     this phase only reads g.relationships, same as the aftermath scene. ═══ */
  if(g.phase==="campaignStation"){
    const partner=g.relationships?.partner_patrol;
    const supervisor=g.relationships?.supervisor;
    const partnerPr=PRONOUN_SETS[partner?.pronouns]||PRONOUN_SETS.they;
    const supervisorPr=PRONOUN_SETS[supervisor?.pronouns]||PRONOUN_SETS.they;
    // First name only in spoken dialogue — see names.js's firstName().
    const partnerFirst=firstName(partner?.name);
    const supervisorFirst=firstName(supervisor?.name);
    // F31: found while converting this scene's dialogue — PRONOUN_SETS
    // entries only ever carry lowercase fields (subj/obj/poss/...); the
    // capitalized Subj/Obj/... variants only exist on pron()'s OWN return
    // object (pronouns.js), not on a raw PRONOUN_SETS lookup like this one.
    // The pre-existing `{partnerPr.Subj}` here was silently rendering
    // nothing (undefined) since this phase shipped — real, previously-
    // undiscovered defect, fixed with a local capitalizer rather than
    // reaching for pron() (which expects a scenario object, not a person).
    const capWord=(s)=>s?s[0].toUpperCase()+s.slice(1):s;
    // Character sprites (F31b) — portraitFor() resolves a role+gender to a
    // real art path; PATROL partner/supervisor now have real TITLE_TO_ROLE
    // entries (assets.js) instead of always falling back to "civilian".
    // Both stand in the scene together for its whole length; which one is
    // DOING something right now (handing over a clipboard, leaning in with
    // coffee) is tracked via VNDialogue's onLineChange -> g.vnPose and
    // rendered as a pose badge on the right sprite (VNSprite's `pose` prop)
    // instead of being written into the line's own text.
    const supervisorSrc=supervisor?portraitFor({role:supervisor.role,gender:supervisor.gender,name:supervisor.name}):null;
    const partnerSrc=partner?portraitFor({role:partner.role,gender:partner.gender,name:partner.name}):null;
    // STATION_LINES now lives in campaign/prologue.js, as a (ctx)=>[...]
    // function — see that file for why.
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.patrolStation}>
      <CampusMapOverlay open={!!g.campusMapOpen} onClose={()=>setG(s=>({...s,campusMapOpen:0}))}/>
      <VNHeader title="NORTHWOOD PATROL STATION — STUDENT CENTER BASEMENT"
        onBack={()=>setG(s=>({...s,campusMapOpen:1}))} backLabel="🗺 Campus map"/>
      <div style={{display:"flex"}}>
        <VNSprite src={supervisorSrc} side="left" pose={g.vnPose?.[supervisorFirst]}/>
        <VNSprite src={partnerSrc} side="right" pose={g.vnPose?.[partnerFirst]}/>
      </div>
      <VNBox wide>
        <VNDialogue key="campaignStation" lines={STATION_LINES({supervisorFirst,partnerFirst,partnerPr,supervisorPr,playerFirst:g.playerFirst,capWord})} onLineChange={vnLineChange(setG)}
          onDone={()=>setG(s=>({...s,phase:"campaignIntro",vnPose:{}}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN PROLOGUE — Zero-To-Hero's Northwood University PATROL hook
     (F17 step 7). The character, department and vehicle are already fixed by
     learningMode's "zth" pick; this is the narrative beat before the first
     call, then straight to "ready" with a short, deliberately hand-picked
     queue of scenarios confirmed Layperson-completable (see
     LAYPERSON_COMPLETABLE) — not the random full-library draw a normal
     Career shift gets, because a scripted opening beat should have a
     scripted first few calls, not a coin flip. ═══ */
  if(g.phase==="campaignIntro"){
    const beginPatrol=()=>setG(s=>{
      const queue=["benignFaint","od","seizure"];
      // §1.4: seed the one fixed relationship this batch wires — an old
      // PATROL partner, the exact character old_patrol_partner's downtime
      // event already narrates. Drawn fresh from names.js's pool (not hand-
      // authored — see campaign.js's own comment on how minor speaking roles
      // are meant to be minted), startFriendship:20 because the narrative
      // already establishes them as someone the player knows, not a stranger
      // just met.
      const partner=drawName();
      const partnerRel=s.relationships?.partner_patrol ||
        createRelationship({name:partner.name, role:"PATROL partner", gender:partner.gender, startFriendship:20});
      const relationships={...(s.relationships||{}), partner_patrol:partnerRel};
      // F7: give the partner a real crew seat instead of leaving them a
      // VNSprite-only narrative presence. `fleet.js`'s `patrol` vehicle kind
      // has no `fixedCrew` of its own (unlike e.g. flight's pilot) and zth's
      // campaign never visits the "vehicle"/"partners" phases that would
      // normally seed one — those two phases are also the only place
      // `seatsFor`/`totalSeatsFor` are read (confirmed by grep), so this
      // doesn't need a seat-count change to fleet.js at all. A plain `fixed`,
      // free (cost:0), Layperson-level `g.roster` entry is enough: the
      // "kit"→"response" transition already maps every `g.roster` entry
      // into real scene crew (App.jsx's `ownCrew`), and the crew-order panel
      // already filters assignable tasks to `t.lvl<=cl` for ANY crew member
      // regardless of level — proven already-general by the fact that the
      // scene's own generic "Bystander" entry (also Layperson) goes through
      // the identical path. Keyed by a stable id so this only seeds once,
      // the same idempotency `partner_patrol` itself already uses above.
      const roster=(s.roster||[]).some(p=>p.id==="partner_patrol")?(s.roster||[])
        :[...(s.roster||[]),{id:"partner_patrol",name:partnerRel.name,fullName:partnerRel.name,
            role:"PATROL partner",title:"PATROL partner",level:"layperson",
            gender:partnerRel.gender,pronouns:partnerRel.pronouns,
            fixed:true,cost:0,exp:0,...genPersonStats()}];
      // Limited-items: a fresh shift means a freshly-loaded truck — clear
      // out any prior shift's selection/stock so withLoadoutRefresh reseeds
      // defaults the moment the first call of THIS shift reaches "kit".
      const s2={...s,career:{queue,idx:0,results:[]},relationships,roster,
        loadoutSelection:null,supplyStock:null,truckReserve:null,callsSinceLoadoutRefresh:0};
      writeSave(s2.saveId,s2,{name:s2.saveName,gmode:s2.gmode,level:s2.level,careerIdx:0});
      // §2.7.1: the first tutorial call now opens on a real pre-call VN
      // beat (the dining-hall bench scene) rather than dropping straight
      // into "ready" — campaignPreCall1 starts the actual benignFaint call
      // itself once its dialogue is clicked through. campaignSupervisorClass
      // (the skills-lab VN scene, new) runs first now, then hands off to the
      // existing campaignPatrolBriefing reference card as the class's own
      // take-home handout.
      return {...s2,phase:"campaignSupervisorClass"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadNight}>
      <VNHeader title="NORTHWOOD UNIVERSITY — PATROL PROGRAM" onBack={()=>setG(s=>({...s,phase:"campaignCustomize"}))}/>
      <VNBox wide>
        <img src={MODE_ART.zth} onError={onImgError} alt="" style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:8,border:`1px solid ${C.line}`,marginBottom:14}}/>
        <div style={{fontSize:20,fontWeight:600}}>You're not EMS. Not yet.</div>
        <div style={{fontSize:14,color:"#C9BFA8",marginTop:12,lineHeight:1.8}}>
          PATROL — Northwood's trained-layperson campus response program — put you through a weekend of CPR, AED, and
          bleeding control, handed you a radio and a belt kit, and sent you out walking the quad at night. No uniform
          that says medic, because you aren't one. No ambulance, because you don't need one to be first — the nearest
          real help is still minutes out, and minutes are what you're here to buy.<br/><br/>
          What you know how to do is short: compressions, an AED, a tourniquet, a pocket mask, naloxone if it comes to
          that. What you don't know how to do is long, and you'll find the edges of it the hard way, one call at a
          time — the same way everyone who's ever done this job first did. Every provider level above yours started
          exactly where you're standing right now.<br/><br/>
          The radio on your belt just went off.
        </div>
        {/* §2.7 Scene 6 — the tutorial-shift callout, shown once here rather
            than as a separate phase since campaignIntro already IS the
            screen immediately before the deterministic 3-call queue starts. */}
        <div className="f2 p-4 rounded mt-5" style={{background:"#12160C",border:`1px solid ${C.hr}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.hr,marginBottom:6}}>TUTORIAL SHIFT</div>
          <div style={{fontSize:13,lineHeight:1.7}}>
            This is the tutorial shift. Get familiar with the controls! You can click on tabs, drag items, and use the
            radio. Don't worry about making mistakes — {firstName(g.relationships?.partner_patrol?.name)||"your partner"} has your
            back.</div>
        </div>
        <button onClick={beginPatrol} className="px-8 py-3 rounded mt-7"
          style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:15}}>▲ Begin your PATROL</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN SUPERVISOR CLASS — the forty-minute hands-on skills lab
     campaignIntro's "Begin your PATROL" button now leads into, before the
     existing campaignPatrolBriefing reference card. Both supervisor and
     partner_patrol already exist by the time this phase runs (created one
     scene earlier, in campaignHeatStrokeAftermath/campaignLibraryEncounter
     and campaignIntro respectively — same pattern campaignStation already
     relies on), so this needed no new relationship-creation logic, just
     more dialogue for characters that already exist.
     Every clinical fact spoken here is pulled from the same PROCS/DRUGS
     entries campaignPatrolBriefing already reads (PROCS.cpr/tq/mouthMask,
     DRUGS.naloxone_in) rather than separately-authored text that could drift
     from what the engine actually does — the "don't invent a second copy
     of the truth" discipline that screen's own comment already states,
     just paraphrased into a taught scene instead of a reference card.
     Reuses BACKGROUNDS.stationTraining ("skills room — manikin, gear laid
     out", per src/assets/backgrounds/README.md) — it already existed and
     already matched this exact scene, unused by any phase until now. Its
     own spec frames the stationX family as looking like a real, properly
     equipped firehouse — the visual OPPOSITE of patrolStation's own spec,
     which is deliberately informal ("a repurposed storage room... the
     visual opposite of a real firehouse"). Rather than let those two
     pieces of established art direction quietly contradict each other, the
     opening line below gives the mismatch an in-world reason: this is the
     student health center's real skills room, borrowed for the session,
     not PATROL's own storage-room home base.
     Five new poses (assets.js's POSES — demonstrating_cpr/demonstrating_aed/
     applying_tourniquet/giving_rescue_breath/holding_naloxone, plus the
     already-existing holding_radio for the last topic) let the supervisor
     actually DEMONSTRATE each skill on their own sprite rather than the
     scene only describing it in prose, the same "action belongs on the
     sprite, not the quoted text" rule campaignStation's holding_clipboard/
     holding_coffee already established. ═══ */
  if(g.phase==="campaignSupervisorClass"){
    const partner=g.relationships?.partner_patrol;
    const supervisor=g.relationships?.supervisor;
    const partnerFirst=firstName(partner?.name);
    const supervisorFirst=firstName(supervisor?.name);
    const supervisorSrc=supervisor?portraitFor({role:supervisor.role,gender:supervisor.gender,name:supervisor.name}):null;
    const partnerSrc=partner?portraitFor({role:partner.role,gender:partner.gender,name:partner.name}):null;
    // CLASS_LINES now lives in campaign/prologue.js, as a (ctx)=>[...]
    // function — see that file for why.
    // F1 item 10 (station-intro pacing): this scene used to funnel every
    // player through campaignPatrolBriefing next, unconditionally — a
    // reference card that repeats the same six topics CLASS_LINES just
    // taught, verbatim, one screen later. That's the exact "exposition ->
    // exposition -> tutorial -> reference manual" stacking the ChatGPT
    // suggestion list's item 10 named. A real restructure (teaching each
    // skill contextually, mid-call, the first time it's actually needed)
    // would mean new hooks into the live scene/action system — real,
    // separately-scoped engine work, not a text edit, so deliberately NOT
    // attempted here. What IS safely scoped: give the player the choice to
    // skip the redundant second pass, the same "gate behind onDone, then
    // branch" pattern campaignHeatStrokeAftermath/campaignLaptop already
    // use. classTalked is scene-local and transient, same footing as that
    // phase's own aftermathTalked — no blank()/CARRY entry needed, reads
    // fine as undefined-falsy.
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="NORTHWOOD STUDENT HEALTH CENTER — SKILLS LAB"/>
      <div style={{display:"flex"}}>
        <VNSprite src={supervisorSrc} side="left" pose={g.vnPose?.[supervisorFirst]}/>
        <VNSprite src={partnerSrc} side="right" pose={g.vnPose?.[partnerFirst]}/>
      </div>
      <VNBox wide>
        {!g.classTalked
          ? <VNDialogue key="campaignSupervisorClass" lines={CLASS_LINES({supervisorFirst,partnerFirst})} onLineChange={vnLineChange(setG)}
              doneLabel="What now?" onDone={()=>setG(s=>({...s,classTalked:1,vnPose:{}}))}/>
          : <>
              <div style={{fontSize:13.5,color:C.dim,marginTop:4,lineHeight:1.7}}>
                {supervisorFirst||"The supervisor"} slides a printed card across the table.</div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={()=>setG(s=>({...s,phase:"campaignPatrolBriefing"}))} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  Take the handout and read it over.</button>
                <button onClick={()=>setG(s=>({...s,phase:"campaignPreCall1"}))} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  Pocket the card. You got it — head out.</button>
              </div>
            </>}
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN PATROL BRIEFING — the printed card campaignSupervisorClass's
     own closing line ("There's a card on the table with all of it written
     down. Take it.") hands the player on the way out. A skippable reference
     screen, not a scripted VN beat: real trained-layperson skills, pulled
     verbatim from the same PROCS/DRUGS/LEVELS entries the actual kit screen
     and scope gates read (LEVELS.layperson.note, PROCS.cpr/pads/aedAnalyze/
     aedShock/tq/mouthMask, DRUGS.naloxone_in) rather than separately-authored
     description text that could drift from what the engine actually does —
     the same "don't invent a second copy of the truth" discipline the
     physiology side of this project applies to conditions/mechanisms, and
     the exact same anchors the class scene's own dialogue was paraphrased
     from. Genuinely skippable: "Got it" and "Skip" both advance to the same
     next phase (campaignPreCall1) with no state difference, since this is
     pure teaching content, not a gate. ═══ */
  if(g.phase==="campaignPatrolBriefing"){
    const advance=()=>setG(s=>({...s,phase:"campaignPreCall1"}));
    const topics=[
      {icon:"🫀",title:"Chest compressions",body:PROCS.cpr.note},
      {icon:"⚡",title:"The AED",body:"Apply the pads, let it analyze the rhythm, deliver the shock if it tells you to. "+
        "It will not let you shock a rhythm that doesn't need it — you cannot make this worse by following its prompts."},
      {icon:"💉",title:"Naloxone",body:DRUGS.naloxone_in.note+` Standard dose is ${DRUGS.naloxone_in.dose} mg, given ${DRUGS.naloxone_in.route}.`},
      {icon:"🩸",title:"Bleeding control",body:PROCS.tq.note+" Direct pressure first if you can hold it; the tourniquet if you can't, or if the bleeding is life-threatening."},
      {icon:"😮‍💨",title:"Rescue breaths",body:PROCS.mouthMask.note},
      {icon:"📻",title:"Giving a radio report",body:"When help arrives, hand off what you saw in order: who the "+
        "patient is, what happened, what you found, what you did about it. Real crews call this an IMIST-AMBO report "+
        "— you'll give one after every call, and it's graded on whether you actually SAY what you found, not on "+
        "hitting exact words."},
    ];
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadNight}>
      <VNHeader title="PATROL FIELD BRIEFING — HANDOUT"/>
      <VNBox wide>
        <div style={{fontSize:18,fontWeight:600}}>The card from class. Here's what you're actually allowed to do.</div>
        <div style={{fontSize:13,color:C.faint,marginTop:6,marginBottom:14,lineHeight:1.6}}>{LEVELS.layperson.note} Skim it or skip
          it — this is a reference, not a test, and every scope gate in the game will remind you again in the moment.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:"38vh",overflowY:"auto",paddingRight:4}}>
          {topics.map((tp,i)=>(
            <div key={i} className="p-3 rounded" style={{background:"#12160C",border:`1px solid ${C.hr}`}}>
              <div style={{fontSize:13.5,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
                <span>{tp.icon}</span><span>{tp.title}</span></div>
              <div style={{fontSize:12.5,color:C.dim,marginTop:5,lineHeight:1.6}}>{tp.body}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={advance} className="px-8 py-3 rounded"
            style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:15}}>▲ Pocket it — begin my PATROL</button>
          <button onClick={advance} className="px-5 py-3 rounded"
            style={{background:"transparent",border:`1px solid ${C.line}`,color:C.faint,fontSize:13}}>Skip</button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CAMPAIGN PRE-CALL 1 — design doc §2.7.1's pre-call VN, the bench
     scene before the tutorial shift's first call. beginCall() replicates
     the same kit/scene-seed the "ready" phase's getCall() does for a
     single specific queued scenario (career.idx is still 0 here — this
     phase runs BEFORE the first call, not after one), rather than routing
     through "ready" and losing the scripted beat. Reuses campusQuadDay —
     a real "outside the dining hall" background wasn't in this batch's
     asset scope, and a daytime campus exterior is the closest existing
     match, the same reuse-over-invent call campusQuadDay's own intro made. ═══ */
  if(g.phase==="campaignPreCall1"){
    const partner=g.relationships?.partner_patrol;
    const partnerFirst=firstName(partner?.name);
    const partnerPr=PRONOUN_SETS[partner?.pronouns]||PRONOUN_SETS.they;
    const partnerSrc=partner?portraitFor({role:partner.role,gender:partner.gender,name:partner.name}):null;
    const capFirst=(s)=>s?s[0].toUpperCase()+s.slice(1):s;
    const beginCall=()=>setG(s=>{
      const k=s.career.queue[0];
      return withLoadoutRefresh({...s,scen:k,phase:"kit",...SCEN[k].seed(),
        exposed:initialExposure(SCEN[k].clothing),shoesOff:initialShoes(SCEN[k].clothing)});
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadDay}>
      <VNHeader title="OUTSIDE THE DINING HALL"/>
      <VNSprite src={partnerSrc} pose={g.vnPose?.[partnerFirst]}/>
      <VNBox wide>
        {/* The closing beat used to fold the walking action AND the quote
            into one narration block ("...you follow at a quick walk. ...says,
            forbidding running."). Split so the action is pure narration and
            the quote is a real speaker line with a "walking" pose instead. */}
        <VNDialogue key="preCall1" doneLabel="Head over" onLineChange={vnLineChange(setG)} lines={PRE_CALL1_LINES({partnerFirst,partnerPr,capFirst})} onDone={beginCall}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="level") return (<Shell g={g} setG={setG} css={css}>
    <div style={{maxWidth:680,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        WHO ARE YOU TODAY<BackBtn toPhase="gmodePick" setG={setG}/></div>
      <div className="f1" style={{fontSize:12.5,color:C.faint,marginTop:8}}>National EMS Scope of Practice Model 2019</div>
      {/* Medical Education Mode (Sandbox) is for running calls and getting
          feedback at a real provider level — Layperson has almost no scope to
          practice against, so it isn't offered here. Career mode is unaffected. */}
      <div className="f2 flex flex-col gap-2 mt-5">
        {Object.entries(LEVELS).filter(([k])=>!(g.gmode==="sandbox"&&k==="layperson")).map(([k,v])=>(
          <button key={k} onClick={()=>setG(s=>({...s,level:k,phase:"department"}))} className="text-left px-4 py-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${v.n===5?C.violet:C.line}`}}>
            <div className="flex justify-between items-baseline">
              <span style={{fontSize:15,fontWeight:600,color:v.n===5?C.violet:C.text}}>{v.name}</span>
              <span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>LVL {v.n}</span></div>
            <div style={{fontSize:12,color:C.dim,marginTop:3,lineHeight:1.5}}>{v.note}</div></button>))}
      </div></div></Shell>);

  /* ═══ DEPARTMENT — who you're with, before what you're on ═══ */
  if(g.phase==="department"){
    const allowedDept=toAllowedSet(g.allowedDepartments, DEFAULT_ALLOWED_DEPARTMENTS);
    const allowedKind=toAllowedSet(g.allowedKinds, DEFAULT_ALLOWED);
    const hasMyLevel=(d)=>DEPARTMENT_KINDS[d].some(k=>allowedKind.has(k)&&(KIND_LEVELS[k]||[]).includes(g.level));
    const options=DEPARTMENT_ORDER.filter(d=>allowedDept.has(d)&&hasMyLevel(d));
    const pick=(d)=>setG(s=>({...s,department:d,phase:"vehicle"}));
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:680,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>WHAT DEPARTMENT ARE YOU WITH</span><BackBtn toPhase="level" setG={setG}/></div>
      <div className="f1" style={{fontSize:13,color:C.dim,marginTop:10,lineHeight:1.7}}>
        Your department decides which vehicles you can be on — a Fire Dept medic isn't rolling up in a Sheriff's cruiser.
        Only departments Department Settings has switched on, that also have at least one vehicle Fleet Settings allows
        AND could actually staff someone at your level, show up here.</div>
      <div className="f2 flex flex-col gap-2 mt-5">
        {options.length===0&&<div style={{fontSize:12,color:C.red}}>No department has a vehicle enabled that fits {LEVELS[g.level].name} — check Department Settings and Fleet Settings.</div>}
        {options.map(d=>(
          <button key={d} onClick={()=>pick(d)} className="text-left px-4 py-3 rounded"
            style={{background:g.department===d?"#16241C":C.panelHi,border:`1px solid ${g.department===d?C.hr:C.line}`}}>
            <span style={{fontSize:15,fontWeight:600,color:g.department===d?C.hr:C.text}}>{d}</span>
            <div style={{fontSize:11.5,color:C.dim,marginTop:3}}>
              {DEPARTMENT_KINDS[d].filter(k=>allowedKind.has(k)).map(k=>KINDS[k].label).join(" · ")}</div>
          </button>))}
      </div>
      <button onClick={()=>setG(s=>({...s,phase:"deptSettings"}))} className="px-5 py-2 rounded mt-5"
        style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:12}}>
        ⚙ Department Settings — choose which departments are in this save</button>
    </div></Shell>);
  }

  /* ═══ DEPARTMENT SETTINGS — which agencies exist in this save at all ═══ */
  if(g.phase==="deptSettings"){
    const allowedDept=toAllowedSet(g.allowedDepartments, DEFAULT_ALLOWED_DEPARTMENTS);
    const toggle=(d)=>setG(s=>{const cur=new Set(toAllowedSet(s.allowedDepartments, DEFAULT_ALLOWED_DEPARTMENTS));
      cur.has(d)?cur.delete(d):cur.add(d); return {...s,allowedDepartments:cur};});
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:680,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>DEPARTMENT SETTINGS</span><BackBtn toPhase="department" setG={setG}/></div>
      <div className="f1" style={{fontSize:13,color:C.dim,marginTop:10,lineHeight:1.7}}>
        Whole-save setting: which agencies exist in this world at all. Turn off Flight EMS if you're nowhere near a
        flight catchment, or Campus PD if this isn't a campus save. A department switched off here never shows up —
        not as a department you can join, and not as a unit that responds to your calls.</div>
      <div className="f2 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
        {DEPARTMENT_ORDER.map(d=>{const on=allowedDept.has(d);
          return (<button key={d} onClick={()=>toggle(d)} className="text-left px-4 py-3 rounded"
            style={{background:on?"#16241C":C.panelHi,border:`1px solid ${on?C.hr:C.line}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontSize:14,fontWeight:600,color:on?C.hr:C.text}}>{d}</span>
              <span style={{fontFamily:MONO,fontSize:9,color:C.faint}}>{on?"ALLOWED":"OFF"}</span></div>
            <div style={{fontSize:11.5,color:C.dim,marginTop:3}}>{DEPARTMENT_KINDS[d].map(k=>KINDS[k].label).join(" · ")}</div>
          </button>);})}
      </div>
      <button onClick={()=>setG(s=>({...s,phase:"department"}))} className="px-7 py-3 rounded mt-6"
        style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:14}}>
        ▲ Done</button>
    </div></Shell>);
  }

  /* ═══ VEHICLE SELECTION — pick what you're on, before who's riding with you ═══ */
  if(g.phase==="vehicle"){
    const allowed=effectiveAllowedKinds(g.allowedKinds,g.allowedDepartments);
    const kinds=VEHICLE_KIND_ORDER.filter(k=>allowed.has(k)&&KINDS[k].agency===g.department&&L>=(KIND_MIN_LEVEL_N[k]??0));
    const onFoot={key:"none",kind:"none",type:"none",normalSeats:1,totalSeats:1,transport:false,name:"On foot — no vehicle"};
    const chosen=g.myVeh||onFoot;
    const pick=(k)=>{
      const stripFixed=(s)=>({...s,roster:(s.roster||[]).filter(p=>!p.fixed)});
      if(k==="none") return setG(s=>({...stripFixed(s),myVeh:onFoot,phase:"partners"}));
      const K=KINDS[k];
      // F7: fixedCrew entries never carried an `id` (harmless for flight's
      // pilot, since the crew-order panel filters pilots out entirely —
      // but patrol's new non-pilot fixedCrew partner IS orderable, and an
      // undefined id would collide as a React key / g.cBusy key). Give each
      // one a stable one here rather than in fleet.js, matching where every
      // other roster entry's id is assigned (hire()/genCandidatePool).
      const fixed=(K.fixedCrew?K.fixedCrew():[]).map((p,i)=>({...p,id:`${k}_fixed_${i}`,cost:0,exp:0,fixed:true}));
      setG(s=>{const s2=stripFixed(s);
        return {...s2,myVeh:{...K.vehicle,kind:k,name:K.label},roster:[...s2.roster,...fixed],phase:"partners"};});
    };
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:720,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>WHAT ARE YOU ON — {(g.department||"").toUpperCase()}</span><BackBtn toPhase="department" setG={setG}/></div>
      <div className="f1" style={{fontSize:13,color:C.dim,marginTop:10,lineHeight:1.7}}>
        Pick the vehicle you're riding today, from what {g.department} runs — only rigs you'd actually be the
        highest-level provider on are shown. The seats you have decide how much crew you can carry without
        turning them into students.</div>
      <div className="f2 flex flex-col gap-2 mt-5">
        {/* Medical Education Mode (Sandbox) always rolls with a real vehicle —
            "on foot" is a Layperson/bystander concept, and Layperson isn't a
            selectable level in this mode either (see the "level" phase). */}
        {g.gmode!=="sandbox"&&<button onClick={()=>pick("none")} className="text-left px-4 py-3 rounded"
          style={{background:chosen.type==="none"?"#16241C":C.panelHi,border:`1px solid ${chosen.type==="none"?C.hr:C.line}`}}>
          <span style={{fontSize:15,fontWeight:600,color:chosen.type==="none"?C.hr:C.text}}>On foot</span>
          <div style={{fontSize:12,color:C.dim,marginTop:3}}>No vehicle of your own — you're already on scene, or riding in with whoever responds.</div></button>}
        {kinds.length===0&&<div style={{fontSize:12,color:C.red}}>{g.department} has no vehicle enabled that you'd be senior on — check Fleet Settings{g.gmode!=="sandbox"?", or you're stuck on foot here":""}.</div>}
        {kinds.map(k=>{const K=KINDS[k],on=chosen.kind===k,seats=seatsFor(K.vehicle);
          return (<button key={k} onClick={()=>pick(k)} className="text-left px-4 py-3 rounded"
            style={{background:on?"#16241C":C.panelHi,border:`1px solid ${on?C.hr:C.line}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{display:"flex",alignItems:"center",gap:8}}>
                <img src={vehicleArt(K.vehicle.type)} onError={onImgError} alt="" width={24} height={24}
                  style={{borderRadius:4,objectFit:"cover",border:`1px solid ${C.line}`}}/>
                <span style={{fontSize:15,fontWeight:600,color:on?C.hr:C.text}}>{K.label}</span></span>
              {!K.vehicle.transport&&<span style={{fontFamily:MONO,fontSize:10,color:C.red}}>NO TRANSPORT</span>}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:3,lineHeight:1.5}}>{K.agency} · {seats} seat{seats===1?"":"s"}</div>
          </button>);})}
      </div>
      <button onClick={()=>setG(s=>({...s,phase:"fleet"}))} className="px-5 py-2 rounded mt-5"
        style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:12}}>
        ⚙ Fleet Settings — choose which units can respond</button>
    </div></Shell>);
  }

  /* ═══ PARTNERS / RECRUITMENT — hire named crew out of the department's ═══
     pool within a 100-point budget; overflow past real seats (or a manual
     toggle) rides as a discounted student. */
  if(g.phase==="partners"){
    const veh=g.myVeh||{type:"none",normalSeats:1,totalSeats:1,transport:false,name:"On foot"};
    const officialSeats=seatsFor(veh), realSlots=Math.max(0,officialSeats-1);
    // Transport ambulances have more total capacity than official crew
    // (you + one partner) — the rest is exactly how many students can ride
    // along, on top of a full real crew. Non-transport rigs have no such
    // gap between normal and total seats, so their student cap is 0 unless
    // the player forces it with the toggle.
    const studentCap=Math.max(0,totalSeatsFor(veh)-officialSeats);
    const needsCrew=["ambBLS","ambALS","engine"].includes(veh.kind);
    const rosterReal=g.roster.filter(p=>!p.student).length;
    const rosterStudents=g.roster.filter(p=>p.student).length;
    const spent=g.roster.reduce((sum,p)=>sum+(p.cost||0),0);
    const remaining=RECRUIT_BUDGET-spent;
    const pool=(g.candidatePool||[]).filter(c=>c.agency===g.department&&LEVELS[c.level]?.n<=L)
      .sort((a,b)=>{
        const dirMul=partnerSort.dir==="asc"?1:-1;
        if(partnerSort.field==="cost"){
          return (recruitCost(a,false)-recruitCost(b,false))*dirMul;
        }
        return (LEVELS[a.level].n-LEVELS[b.level].n)*dirMul;
      });
    const fixedCrew=g.roster.filter(p=>p.fixed);
    const recruitableRealSlots=Math.max(0,realSlots-fixedCrew.length);
    const toggleSort=(field)=>setPartnerSort(s=>s.field===field?{field,dir:s.dir==="asc"?"desc":"asc"}:{field,dir:"desc"});

    const hire=(cand,asStudent)=>setG(s=>{
      const cost=recruitCost(cand,asStudent);
      const already=s.roster.reduce((sum,p)=>sum+(p.cost||0),0);
      if(already+cost>RECRUIT_BUDGET) return s;
      // Never exceed the vehicle's seating, regardless of how hire() is
      // invoked — students consume real seats, and real (non-student)
      // hires consume real slots, same as anyone else on the rig.
      const curReal=s.roster.filter(p=>!p.student).length;
      const curStudents=s.roster.filter(p=>p.student).length;
      if(asStudent&&curStudents>=studentCap) return s;
      if(!asStudent&&curReal>=realSlots) return s;
      const entry={...cand,student:asStudent,cost,exp:0};
      return {...s,roster:[...s.roster,entry],
        candidatePool:(s.candidatePool||[]).filter(c=>c.id!==cand.id)};
    });
    const removePartner=(id)=>setG(s=>{
      const removed=s.roster.find(p=>p.id===id); if(!removed||removed.fixed) return s;
      const {student,cost,exp,...back}=removed;
      return {...s,roster:s.roster.filter(p=>p.id!==id),candidatePool:[...(s.candidatePool||[]),back]};
    });
    const toggleStudent=(id)=>setStudentToggle(s=>{const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n;});
    const blocked=needsCrew&&g.roster.length===0;

    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:760,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{LEVELS[g.level].name.toUpperCase()} · RECRUIT CREW — {(g.department||"").toUpperCase()}</span><BackBtn toPhase="vehicle" setG={setG}/></div>
      <div className="f1" style={{fontSize:13,color:C.dim,marginTop:10,lineHeight:1.7}}>
        {veh.name} has {officialSeats} official seat{officialSeats===1?"":"s"} — you
        {fixedCrew.length>0?`, ${fixedCrew.map(p=>(p.title||p.role||"crew").toLowerCase()).join(" and ")} (always assigned, automatic)`:""}
        , plus up to {recruitableRealSlots} more real partner{recruitableRealSlots===1?"":"s"} to recruit
        {studentCap>0?`, and room for up to ${studentCap} student${studentCap===1?"":"s"} beyond that`:""}. Students ride for
        +5s on everything they do and a real chance to fumble a skill at their own certification level — that starts at 10%
        and drops half a point every call, down to zero. You can recruit anyone at your own level or below, and you have a
        {" "}{RECRUIT_BUDGET}-point budget for this department to spend on them.</div>
      {needsCrew&&<div className="f1" style={{fontSize:12,color:C.amber,marginTop:8,lineHeight:1.6}}>
        {veh.name} can't be crewed solo — you need at least one other person to roll on this rig.</div>}
      <div className="f1 mt-4 p-3 rounded" style={{background:C.panelHi,border:`1px solid ${remaining<0?C.red:C.line}`,
          display:"flex",justifyContent:"space-between",fontFamily:MONO,fontSize:12}}>
        <span style={{color:C.dim}}>BUDGET</span>
        <span style={{color:remaining<0?C.red:C.hr}}>{remaining} / {RECRUIT_BUDGET} pts remaining</span>
      </div>

      <div className="f2 flex flex-col gap-2 mt-5">
        {g.roster.length===0&&<div style={{fontSize:12,color:C.faint}}>Nobody hired yet. Recruit crew below{needsCrew?"":", or roll solo"}.</div>}
        {g.roster.map(p=>{
          if(p.fixed) return (<div key={p.id} className="p-3 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,
              display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>{p.name} <span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>{(p.title||p.role||"CREW").toUpperCase()}</span></div>
              <div style={{fontSize:11,color:C.dim,marginTop:2}}>
                {/* F7: a second fixedCrew consumer (patrol's foot partner)
                    besides flight's pilot means this text can no longer
                    assume "flies the aircraft" — generalize on p.pilot. */}
                Always assigned — {p.pilot?"flies the aircraft":"rides along automatically"}, not part of your recruit budget.</div>
            </div>
            <span style={{fontFamily:MONO,fontSize:10,color:C.faint,padding:"4px 9px"}}>fixed crew</span>
          </div>);
          const fail=failChance(p,LEVELS[p.level].n)*100;
          return (<div key={p.id} className="p-3 rounded" style={{background:C.panelHi,border:`1px solid ${p.student?C.amber:C.line}`,
              display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>{p.name} <span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>{LEVELS[p.level].name.toUpperCase()}</span>
                <span style={{fontFamily:MONO,fontSize:10,color:C.hr,marginLeft:8}}>{p.cost||0} pts</span></div>
              <div style={{fontSize:11,color:p.student?C.amber:C.dim,marginTop:2}}>
                {p.student?`STUDENT — +5s/action · `:""}{fail.toFixed(2)}% fumble on their own top-level skills</div>
              <div style={{fontFamily:MONO,fontSize:9.5,color:C.faint,marginTop:2}}>
                fatigue {p.fatigue} · morale {p.morale} · skill {p.baseSkill} · {p.yearsExp}yr exp</div>
            </div>
            <button onClick={()=>removePartner(p.id)} style={{background:"transparent",border:`1px solid ${C.line}`,
              color:C.dim,fontFamily:MONO,fontSize:10,padding:"4px 9px",borderRadius:5,cursor:"pointer"}}>remove</button>
          </div>);})}
      </div>

      <div className="f2 mt-6">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim}}>AVAILABLE TO RECRUIT</div>
          <div style={{display:"flex",gap:6}}>
            {[["level","LEVEL"],["cost","COST"]].map(([field,label])=>(
              <button key={field} onClick={()=>toggleSort(field)} className="px-2.5 py-1 rounded"
                style={{background:partnerSort.field===field?"#16241C":"transparent",
                  border:`1px solid ${partnerSort.field===field?C.hr:C.line}`,
                  color:partnerSort.field===field?C.hr:C.dim,fontFamily:MONO,fontSize:9.5,cursor:"pointer"}}>
                {label} {partnerSort.field===field?(partnerSort.dir==="asc"?"↑":"↓"):""}
              </button>))}
          </div>
        </div>
        {pool.length===0&&<div style={{fontSize:12,color:C.faint}}>Nobody left to recruit at your level in this department.</div>}
        <div className="flex flex-col gap-2">
          {pool.map(cand=>{
            const asStudent=studentToggle.has(cand.id);
            const cost=recruitCost(cand,asStudent);
            const overRealSlots=!asStudent&&rosterReal>=realSlots;
            const overStudentCap=asStudent&&rosterStudents>=studentCap;
            const afford=cost<=remaining;
            // A normal (non-student) hire is blocked once real seats are
            // full. A student hire is blocked once the vehicle's student
            // cap (totalSeats - officialSeats) is full — students consume
            // real physical seats same as anyone else, so no rig can ever
            // exceed its totalSeats no matter how the toggle is used.
            const disabled=!afford||(overRealSlots&&!asStudent)||(overStudentCap&&asStudent);
            return (<div key={cand.id} className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,
                display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:13.5,fontWeight:600}}>{cand.name} <span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>
                  {LEVELS[cand.level].name.toUpperCase()} · {cand.sourceKind}</span></div>
                <div style={{fontFamily:MONO,fontSize:9.5,color:C.faint,marginTop:2}}>
                  fatigue {cand.fatigue} · morale {cand.morale} · skill {cand.baseSkill} · {cand.yearsExp}yr exp</div>
                {overStudentCap&&<div style={{fontSize:10.5,color:C.red,marginTop:2}}>No student seats left on {veh.name} — it's at total capacity.</div>}
                {overRealSlots&&!asStudent&&<div style={{fontSize:10.5,color:C.amber,marginTop:2}}>No real seats left — toggle "student" to still bring them on.</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <label style={{display:"flex",alignItems:"center",gap:5,fontFamily:MONO,fontSize:10,color:C.dim,cursor:"pointer"}}>
                  <input type="checkbox" checked={asStudent} onChange={()=>toggleStudent(cand.id)}/> student
                </label>
                <div style={{fontFamily:MONO,fontSize:12,color:afford?C.hr:C.red,minWidth:50,textAlign:"right"}}>
                  {cost} pts{asStudent?" (−50%)":""}</div>
                <button disabled={disabled} onClick={()=>hire(cand,asStudent)} className="px-3 py-1.5 rounded"
                  style={{background:disabled?C.panelHi:"#16241C",border:`1px solid ${disabled?C.line:C.hr}`,
                    color:disabled?C.faint:C.hr,fontSize:12,opacity:disabled?.5:1,cursor:disabled?"default":"pointer"}}>
                  Recruit</button>
              </div>
            </div>);})}
        </div>
      </div>

      <button disabled={blocked} onClick={()=>setG(s=>({...s,phase:"mode"}))} className="px-7 py-3 rounded mt-6"
        style={{background:blocked?C.panelHi:"#16241C",border:`1px solid ${blocked?C.line:C.hr}`,color:blocked?C.faint:C.hr,fontSize:14,opacity:blocked?.5:1}}>
        ▲ Continue</button>
    </div></Shell>);
  }

  /* ═══ FLEET SETTINGS — which agencies/vehicles are even allowed to be selected to respond ═══ */
  if(g.phase==="fleet"){
    const allowed=toAllowedSet(g.allowedKinds, DEFAULT_ALLOWED);
    const toggle=(k)=>setG(s=>{const cur=new Set(toAllowedSet(s.allowedKinds, DEFAULT_ALLOWED));
      cur.has(k)?cur.delete(k):cur.add(k); return {...s,allowedKinds:cur};});
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:680,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>FLEET SETTINGS</span><BackBtn toPhase="vehicle" setG={setG}/></div>
      <div className="f1" style={{fontSize:13,color:C.dim,marginTop:10,lineHeight:1.7}}>
        Choose which agencies and vehicle types are even eligible to be dispatched to your calls — or that you can
        select as your own rig. Turn on a campus EMR golf cart and PSO bike for a school scenario; turn off air
        medical if you're not near a flight catchment. Whatever you leave off will never show up, regardless of mode or severity.</div>
      <div className="f2 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
        {VEHICLE_KIND_ORDER.map(k=>{const K=KINDS[k],on=allowed.has(k);
          return (<button key={k} onClick={()=>toggle(k)} className="text-left px-4 py-3 rounded"
            style={{background:on?"#16241C":C.panelHi,border:`1px solid ${on?C.hr:C.line}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontSize:14,fontWeight:600,color:on?C.hr:C.text}}>{K.label}</span>
              <span style={{fontFamily:MONO,fontSize:9,color:C.faint}}>{on?"ALLOWED":"OFF"}</span></div>
            <div style={{fontSize:11.5,color:C.dim,marginTop:3}}>{K.agency}</div>
          </button>);})}
      </div>
      <button onClick={()=>setG(s=>({...s,phase:"vehicle"}))} className="px-7 py-3 rounded mt-6"
        style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:14}}>
        ▲ Done</button>
    </div></Shell>);
  }

  /* ═══ MODE — CITY / SUBURBAN / RURAL ═══ */
  if(g.phase==="mode"){
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:720,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>WHERE ARE YOU WORKING</span><BackBtn toPhase="partners" setG={setG}/></div>
      <div className="f1" style={{fontSize:13,color:C.dim,marginTop:10,lineHeight:1.7}}>
        The system around you is not the same everywhere. Your setting decides who else responds, how fast they get there,
        and how long your own drive takes.</div>
      {g.department==="Campus PD"&&<div className="f1" style={{fontSize:12,color:C.amber,marginTop:8,lineHeight:1.6}}>
        Northwood University only exists in the city — every PATROL/PSO/Campus EMR shift runs there.</div>}
      <div className="f2 flex flex-col gap-2 mt-5">
        {Object.values(MODES).filter(m=>g.department!=="Campus PD"||m.key==="city").map(m=>{
          // A real, map-derived figure — the player's own department's
          // nearest station to its own hospital, at Code 3 — replaces the
          // old flat driveMult display now that drive time comes from real
          // street geometry (src/data/maps.js), not a scalar. g.department/
          // g.myVeh are already set by this point in the setup flow (this
          // phase comes after "vehicle"), so this reads the SAME
          // department/vehicle-kind-aware station a real dispatch would use
          // (nearestStation), not the flat legacy map.station. Not a
          // promise every call takes exactly this long, the same honest
          // "typical" framing the old multiplier display had.
          const mMap=MAPS[m.key];
          const mHosp=mMap.buildings.find(b=>b.type==="hospital");
          const mStation=mHosp?nearestStation(mMap,g.department,g.myVeh?.kind,{type:"node",nodeId:mHosp.node}):null;
          const mDrive=mHosp&&mStation?Math.round(shortestPath(mMap,mStation,{type:"node",nodeId:mHosp.node},g.weather||"clear").seconds):null;
          return (
          <button key={m.key} onClick={()=>setG(s=>({...s,mode:m.key,phase:"scope"}))}
            className="text-left px-4 py-3 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontSize:15,fontWeight:600}}>{m.name}</span>
              {mDrive!=null&&<span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>~{Math.round(mDrive/60)} min typical drive</span>}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:3,lineHeight:1.5}}>{m.note}</div>
            <div style={{fontFamily:MONO,fontSize:10,color:m.units.length>2?C.hr:C.amber,marginTop:5}}>
              RESPONDING: {m.units.map(u=>u.toUpperCase()).join(" · ")}</div>
          </button>);})}
      </div>
      <div className="f2 p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,marginTop:16}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.amber,marginBottom:4}}>YOUR RIG</div>
        <div style={{fontSize:13,color:C.text,display:"flex",alignItems:"center",gap:8}}>
          <img src={vehicleArt((g.myVeh||myVehicle(g.level,null)).type)} onError={onImgError} alt=""
            width={28} height={28} style={{borderRadius:4,objectFit:"cover",border:`1px solid ${C.line}`}}/>
          {g.myVeh?g.myVeh.name:myVehicle(g.level,null).name}
          {g.myVeh&&!g.myVeh.transport&&<span style={{color:C.red,fontSize:11}}> — you will need an ambulance to transport</span>}</div>
        {g.roster.length>0&&<div style={{fontSize:12,color:C.dim,marginTop:4}}>
          Crew: {g.roster.map(p=>`${p.name} (${p.pilot?"Pilot":LEVELS[p.level].name}${p.student?" · student":""})`).join(", ")}</div>}
      </div>
    </div></Shell>);
  }

  if(g.phase==="scope"){
    // The per-item scope editor used to live entirely on this screen. It now
    // lives in Settings → Scope of Practice (src/components/ScopeEditor.jsx)
    // so it's reachable from the title screen too, not just this one-time
    // setup step — see that component for presets, per-item overrides, and
    // saving a custom scope. This screen is just a summary of whatever is
    // currently configured, plus the button that LOCKS it in for this save.
    const offCount=Object.values(g.scopeOff||{}).filter(Boolean).length;
    const overCount=Object.values(g.scopeOverride||{}).filter(Boolean).length;
    const activeScopeName=(SCOPES[g.scopeProfile]||getCustomScope(g.scopeProfile)||SCOPES.national2019).name;
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:620,margin:"0 auto",paddingTop:40}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>SCOPE OF PRACTICE</span><BackBtn toPhase="mode" setG={setG}/></div>
      <div className="f2 mt-6 p-4 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.spo2,marginBottom:8}}>CURRENTLY CONFIGURED</div>
        <div style={{fontSize:15,fontWeight:600}}>{activeScopeName}</div>
        <div style={{fontSize:12.5,color:C.dim,marginTop:6,lineHeight:1.6}}>
          {offCount>0&&`${offCount} item${offCount>1?"s":""} disabled. `}
          {overCount>0&&`${overCount} item${overCount>1?"s":""} overridden above your level. `}
          {offCount===0&&overCount===0&&"No changes from this scope's own defaults."}
        </div>
        <button onClick={()=>setG(s=>({...s,settingsOpen:1}))} className="px-4 py-2 rounded mt-4"
          style={{background:C.panelHi,border:`1px solid ${C.spo2}`,color:C.spo2,fontSize:12.5,cursor:"pointer"}}>
          ⚙ Adjust in Settings</button>
        <div style={{fontSize:11.5,color:C.faint,marginTop:10,lineHeight:1.6}}>
          Once you press Ready below, this scope is LOCKED for the life of this save — it can't be
          changed mid-career. Make any adjustments before then.
        </div>
      </div>
      {/* Medical Education Mode only: running calls and getting feedback on
          YOUR decisions is the whole point of this mode, so an arriving
          higher-level unit taking command and directing you can be switched
          off — it doesn't apply anywhere else and changes nothing but who
          holds command on scene. */}
      {g.gmode==="sandbox"&&<div className="f1 mt-4 p-3 rounded" style={{background:C.panel,border:`1px solid ${g.alwaysCommand?C.hr:C.line}`}}>
        <button onClick={()=>setG(s=>({...s,alwaysCommand:!s.alwaysCommand}))} className="w-full text-left"
          style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",border:"none",cursor:"pointer"}}>
          <span>
            <span style={{fontSize:14,fontWeight:600,color:g.alwaysCommand?C.hr:C.text}}>Always have medical authority</span>
            <div style={{fontSize:11.5,color:C.dim,marginTop:3,lineHeight:1.5}}>
              A higher-level arriving unit normally takes command and directs you. Turn this on to stay in command
              regardless of who shows up — this mode is for running the call and getting feedback on your own calls,
              nothing more.</div>
          </span>
          <span style={{fontFamily:MONO,fontSize:18,color:g.alwaysCommand?C.hr:C.faint}}>{g.alwaysCommand?"☑":"☐"}</span>
        </button>
      </div>}
      {/* Medical Education Mode's own opt-in to the limited-items system
          (src/data/loadout.js) — Career (both zth and mos) is ALWAYS
          limited; this mode gets a choice, since forcing supply logistics
          onto a mode built for "run a call, get feedback on it" would be
          the same kind of scope-creep the "Always have medical authority"
          toggle already exists to opt back out of. Turning it OFF leaves
          every bag/pocket exactly as unlimited as before this system
          existed (limitedItemsActive() reads this flag, not gmode alone). */}
      {g.gmode==="sandbox"&&<div className="f1 mt-4 p-3 rounded" style={{background:C.panel,border:`1px solid ${g.limitedItems?C.hr:C.line}`}}>
        <button onClick={()=>setG(s=>({...s,limitedItems:!s.limitedItems}))} className="w-full text-left"
          style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",border:"none",cursor:"pointer"}}>
          <span>
            <span style={{fontSize:14,fontWeight:600,color:g.limitedItems?C.hr:C.text}}>Limited items</span>
            <div style={{fontSize:11.5,color:C.dim,marginTop:3,lineHeight:1.5}}>
              Your bags and truck carry a realistic, finite amount of every drug and disposable supply instead of an
              unlimited one. Configure what's loaded from the kit screen; it refreshes automatically every 5 calls.
              The station itself is always fully stocked — only what's actually loaded onto the rig is limited.</div>
          </span>
          <span style={{fontFamily:MONO,fontSize:18,color:g.limitedItems?C.hr:C.faint}}>{g.limitedItems?"☑":"☐"}</span>
        </button>
      </div>}
      <button onClick={()=>setG(s=>{
          let s2;
          if(s.gmode==="career"){
            // F17 step 7: a Layperson's queue must draw only from scenarios
            // actually winnable at that scope (see LAYPERSON_COMPLETABLE) —
            // the unfiltered pool includes calls (anaph, fbao, resp,
            // stabChest…) whose only "correct" path needs a drug or
            // procedure a layperson can never give, which handed out an
            // unwinnable call through no fault of the player. Every other
            // level still draws from the full library.
            const pool=s.level==="layperson"?Object.keys(SCEN).filter(k=>LAYPERSON_COMPLETABLE.has(k)):Object.keys(SCEN).filter(k=>k!=="baseline");
            // F17 step 3: HIDDEN shift duration / dynamic call volume — a
            // real shift's length isn't known in advance to the crew working
            // it. Previously always exactly 5; now 3-7, and the station
            // screen (below) deliberately never reveals the total, only
            // "call N" — the player finds out the shift is over the same way
            // a real one would, when the calls stop coming.
            const shiftLen=3+Math.floor(Math.random()*5);
            // General: the recurring frequent-flyer patient (campaign.js)
            // can sneak into ANY Career-mode shift's random draw — not just
            // this zth save's own Chapter 1, and not gated on level, since
            // every frequent-flyer scenario key is already confirmed
            // LAYPERSON_COMPLETABLE-safe. A much lower per-shift chance than
            // Chapter 1's own dedicated one (this pool is the whole
            // library, not a small hand-picked one), so the character stays
            // rare rather than becoming a fixture of every save.
            const queue=maybeInjectFrequentFlyer(
              [...pool].sort(()=>Math.random()-.5).slice(0,shiftLen), s);
            // Limited-items: same reset as the campaign's own shift-start —
            // a new shift means a freshly-loaded truck, not last shift's
            // leftover selection/stock.
            s2={...s,career:{queue,idx:0,results:[]},loadoutSelection:null,supplyStock:null,truckReserve:null,callsSinceLoadoutRefresh:0};
          } else s2={...s,career:null};
          // The scope is now permanent for this save — see the note above and
          // the "the character is saved as of here" comment at the "ready"
          // phase just below. ScopeEditor (Settings) reads this flag to
          // switch from an editable grid to a read-only summary.
          s2={...s2,scopeLocked:1};
          writeSave(s2.saveId,s2,{name:s2.saveName,gmode:s2.gmode,level:s2.level,careerIdx:0});
          return {...s2,phase:"ready"};
        })} className="px-7 py-3 rounded mt-5"
        style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>▲ Ready</button>
    </div></Shell>);
  }

  /* ═══ READY? — the character is saved as of here; this is the persistent entry point ═══ */
  if(g.phase==="ready"){
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:520,margin:"0 auto",paddingTop:110,textAlign:"center"}}>
      <BackBtn toPhase="scope" setG={setG}/>
      <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".3em",color:C.dim}}>{(g.saveName||"").toUpperCase()}</div>
      <div style={{fontSize:28,fontWeight:700,marginTop:16}}>Ready?</div>
      <div style={{fontSize:13,color:C.dim,marginTop:10,lineHeight:1.7}}>
        {LEVELS[g.level].name} · {g.department} · {g.myVeh?.name}{g.roster.length?` · crew of ${g.roster.length+1}`:""}</div>
      <button onClick={()=>setG(s=>{
          // F17 step 2: a downtime event can fire on arrival at the station,
          // same as it can between calls (below) — career mode only. Scene
          // 6's tutorial shift is exempt — its own scripted callout (in
          // campaignIntro) and station interludes are the only interstitial
          // content during those three calls, not a random draw.
          const ev=s.gmode==="career"&&!isTutorialShift(s)&&Math.random()<0.4?rollDowntimeEvent(null,s.learningMode==="zth",s.morale):null;
          return {...s,phase:"station",pendingDowntimeEvent:ev?ev.id:null,stationBoardOpen:false};
        })} className="px-8 py-3 rounded mt-8"
        style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:15}}>▲ Begin</button>
    </div></Shell>);
  }

  /* ═══ STATION — waiting between calls (first call and every one after) ═══ */
  if(g.phase==="station"){
    // "3D mode": on the city map, with driving mode on, the pre-dispatch
    // station screen is a real walkable 3D room instead of a flat list —
    // the player walks up to a wall-mounted whiteboard and presses E to
    // open the SAME call-picker UI below as an overlay (g.stationBoardOpen),
    // rather than jumping straight to it. Every other map/mode keeps the
    // plain 2D screen below, completely untouched.
    const show3DStation=mapFor(g)?.id==="city"&&g.drivingModeEnabled!==false&&isTesterUnlocked();
    if(show3DStation&&!g.stationBoardOpen){
      return <DrivingScene mode="station" map={mapFor(g)} weather={g.weather} timeOfDay={g.timeOfDay}
        onOpenBoard={()=>setG(s=>({...s,stationBoardOpen:true}))}
        paused={!!(g.micnOpen||g.newUnit||g.loadOpen||g.settingsOpen||g.confirmDeath||g.achievementsOpen||g.relationshipsOpen||g.accessMinigame)}/>;
    }
    const getCall=()=>{setPractice(null); setG(s=>{
      if(s.gmode==="career"&&s.career){
        if(s.career.idx>=s.career.queue.length) return {...s,phase:"shiftSummary"};
        const k=s.career.queue[s.career.idx];
        return withLoadoutRefresh({...s,scen:k,phase:"kit",...SCEN[k].seed(),
          exposed:initialExposure(SCEN[k].clothing),shoesOff:initialShoes(SCEN[k].clothing)});}
      return {...s,phase:"cat"};});};
    // F2b: let the player prioritize which of the next few queued calls to
    // take first, instead of a strictly forced sequential order. Reorders
    // g.career.queue by swapping the chosen call into the current (idx) slot
    // — everything downstream (getCall, career.idx bookkeeping) is unchanged,
    // it just reads a different key out of the same slot.
    const takeCall=(k)=>{setPractice(null); setG(s=>{
      if(!(s.gmode==="career"&&s.career)) return s;
      const q=[...s.career.queue]; const from=q.indexOf(k,s.career.idx);
      if(from<0) return s;
      [q[s.career.idx],q[from]]=[q[from],q[s.career.idx]];
      const kk=q[s.career.idx];
      return withLoadoutRefresh({...s,career:{...s.career,queue:q},scen:kk,phase:"kit",...SCEN[kk].seed(),
        exposed:initialExposure(SCEN[kk].clothing),shoesOff:initialShoes(SCEN[kk].clothing)});});};
    const upcoming=(g.gmode==="career"&&g.career)?g.career.queue.slice(g.career.idx,g.career.idx+3):[];
    // F17 step 2: resolve a downtime-event choice — applies its effects to
    // the WHOLE current roster (station life affects everyone, not just the
    // player) and to g.money, then clears the pending event.
    // §1.4: if the event carries relId (only old_patrol_partner does so far)
    // and a matching relationship exists, also apply the choice's
    // friendshipDelta/romanceDelta, and log a one-time §1.4.2 "quiet moment"
    // line the instant both cross 90 — checked by diffing eligibility before
    // vs. after, since wasQuietMomentEligible itself is a pure predicate.
    // §1.5.2/§1.5.3: gmode==="career" also moves g.morale/g.reputation here —
    // moraleAll is reused as-is (the same "how this affected the house"
    // number already authored for the roster IS what the crew-wide scalar
    // should track too, no re-authoring needed across the 9 events);
    // reputationDelta is a new, optional per-choice field (only training_day
    // declares one this batch — every other event is unaffected).
    const resolveDowntime=(choice)=>setG(s=>{
      const relId=g.pendingDowntimeEvent&&DOWNTIME_EVENTS.find(e=>e.id===g.pendingDowntimeEvent)?.relId;
      const rel=relId&&s.relationships?.[relId];
      let relationships=s.relationships, extraLog=[], moraleFromMoment=0;
      if(rel){
        const before=wasQuietMomentEligible(rel);
        const after=adjustRomance(adjustFriendship(rel,choice.effects.friendshipDelta||0),choice.effects.romanceDelta||0);
        relationships={...s.relationships,[relId]:after};
        if(!before&&wasQuietMomentEligible(after)){
          extraLog=[{t:s.t,kind:"obs",
            text:`💞 A quiet, unremarkable moment with ${after.name} that you'll remember longer than you expect.`}];
          moraleFromMoment=5; // §1.5.2: "relationship milestones" moving crew-wide morale
        }
      }
      const career=s.gmode==="career";
      const morale=career?clampMorale((s.morale??50)+(choice.effects.moraleAll||0)+moraleFromMoment):s.morale;
      const reputation=career?clampReputation((s.reputation||0)+(choice.effects.reputationDelta||0)):s.reputation;
      // Chapter 4's ed_observation_shift is the first event to declare
      // knowledgeDelta (design doc §4.2's "maybe one knowledge tick") — 0/
      // undefined on every other event, so this is a no-op everywhere else.
      // zth-gated like every other fitness/confidence/knowledge/ambition
      // move, not career-gated like morale/reputation above.
      const knowledge=s.learningMode==="zth"?(s.knowledge??10)+(choice.effects.knowledgeDelta||0):s.knowledge;
      return {...s,pendingDowntimeEvent:null,money:(s.money||0)+(choice.effects.money||0),relationships,morale,reputation,knowledge,
        roster:(s.roster||[]).map(p=>({...p,
          morale:Math.max(0,Math.min(100,(p.morale??90)+(choice.effects.moraleAll||0))),
          fatigue:Math.max(0,Math.min(100,(p.fatigue??0)+(choice.effects.fatigueAll||0)))})),
        log:[...s.log,{t:s.t,kind:"obs",text:choice.resultText},...extraLog]};});
    const downtimeEvent=g.pendingDowntimeEvent?DOWNTIME_EVENTS.find(e=>e.id===g.pendingDowntimeEvent):null;
    // §1.4.1: "the tier is reflected in the tone of their dialogue" —
    // old_patrol_partner is the one event this batch wires to an actual
    // relationship, so its title/text branch on the current tone bucket.
    // Every other event (relId absent) falls through to its own static text
    // unchanged.
    const relForEvent=downtimeEvent?.relId&&g.relationships?.[downtimeEvent.relId];
    const PARTNER_TONE_TEXT={
      cold:{title:"Someone from PATROL stopped by. It's awkward.",
        text:"Your old partner from the Northwood PATROL program is at the station, out of uniform. Neither of you says much — whatever's between you hasn't been talked out, and it shows."},
      neutral:{title:"Someone from PATROL stopped by.",
        text:"Your old partner from the Northwood PATROL program is at the station, out of uniform, just passing through campus. \"Heard you're actually doing this now. Figured I'd see it for myself.\""},
      warm:{title:"Your old partner from PATROL is here, grinning.",
        text:"They didn't even call ahead — just showed up at the station, out of uniform, clearly glad to see you. \"Heard you're actually doing this now. Had to see it for myself.\""},
    };
    const eventTitle=relForEvent?PARTNER_TONE_TEXT[toneBucket(relForEvent.friendship)].title:downtimeEvent?.title;
    const eventText=relForEvent?PARTNER_TONE_TEXT[toneBucket(relForEvent.friendship)].text:downtimeEvent?.text;
    // Scene 6 (§2.7) — "two station interludes between calls." Scripted,
    // deterministic beats rather than the random DOWNTIME_EVENTS roll
    // (suppressed above during this exact 3-call queue) — matching this
    // file's own house style of a dedicated phase/branch per scripted
    // campaign beat rather than shoehorning fixed content through a
    // probabilistic system built for generic career-mode flavor.
    // ch1InterludeStepOut: "Step out and see who's around" (both interlude
    // menus below) temporarily falls through to the plain "who's at the
    // station" screen further down this function — the same real roster/
    // ch1StationTalkTarget flow the top-level station screen already uses,
    // reused rather than duplicated — without losing interlude progress
    // (interlude1Picks/lateNightDone are untouched). Clearing the flag (the
    // "← Back to the group" button on that screen) resumes the interlude
    // exactly where it left off.
    const interludeIdx=isTutorialShift(g)&&(g.career.idx===1||g.career.idx===2)&&!g.tutorialInterludeSeen?.[g.career.idx]&&!g.ch1InterludeStepOut?g.career.idx:null;
    if(interludeIdx){
      const interludePartner=g.relationships?.partner_patrol;
      const partnerName=firstName(interludePartner?.name)||"your partner";
      const supervisorName=firstName(g.relationships?.supervisor?.name)||"the supervisor";
      const interludePr=PRONOUN_SETS[interludePartner?.pronouns]||PRONOUN_SETS.they;
      const capFirst=(s)=>s?s[0].toUpperCase()+s.slice(1):s;
      const interludePartnerSrc=interludePartner?portraitFor({role:interludePartner.role,gender:interludePartner.gender,name:interludePartner.name}):null;
      // §2.7.2 — Interlude 1: "pick two before next call." Four station
      // activities, each a real, wired effect rather than flavor text —
      // g.interlude1Picks tracks which have been used THIS interlude (a
      // plain top-level field, no CARRY entry needed). g.interlude1Done
      // gates a SECOND sub-stage below (§2.7.3's own pre-call VN, "PATROL-2,
      // respond to Morrison Hall") — tutorialInterludeSeen[1] isn't set
      // until THAT stage's own "Move in" click, so this whole idx-1 slot
      // stays reachable across both sub-stages.
      if(interludeIdx===1){
        if(g.interlude1Done){
          // §2.7.3 pre-call VN — the radio call that starts the od
          // scenario, plus the partner's naloxone briefing. The doc also
          // scripts a VN interjection MID-simulation ("Give the naloxone
          // now"); no mid-call scripted-VN mechanism exists anywhere else
          // in this codebase, so rather than build a one-off interrupt
          // system for a single line, the same line is seeded into g.log
          // at call start instead — real, in-scene text (F7's fixed
          // toast/log rendering already surfaces it), not a decorative
          // field nothing reads.
          const beginOd=()=>setG(s=>{
            const k="od";
            return withLoadoutRefresh({...s,scen:k,phase:"kit",...SCEN[k].seed(),
              exposed:initialExposure(SCEN[k].clothing),shoesOff:initialShoes(SCEN[k].clothing),
              tutorialInterludeSeen:{...(s.tutorialInterludeSeen||{}),1:true},
              log:[{t:0,kind:"obs",text:`📻 ${partnerName}: "Give the naloxone now — one spray in each nostril."`}]});
          });
          return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadNight}>
            <VNSprite src={interludePartnerSrc}/>
            <VNBox label="MORRISON HALL — DISPATCHED" wide>
              <VNDialogue key="odPreCall" doneLabel="Move in" lines={OD_PRECALL_LINES({partnerName})} onDone={beginOd}/>
            </VNBox>
          </VNScene></Shell>);
        }
        const picks=g.interlude1Picks||[];
        const OPTS=STATION_INTERLUDE1_OPTS({partnerName,supervisorName,interludePr,capFirst,adjustFriendship});
        const pick=(o)=>setG(s=>({...s,...o.apply(s),interlude1Picks:[...(s.interlude1Picks||[]),o.id]}));
        return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.patrolStation}>
          <VNSprite src={interludePartnerSrc}/>
          <VNBox label="BACK AT THE STATION — AFTER YOUR FIRST CALL" wide>
            <div style={{fontSize:13.5,color:C.dim,lineHeight:1.7}}>
              You return to the basement station. The whiteboard now has a tally mark for "Fainting." There's a
              bit of time before the next call — pick two things to do.</div>
            <div className="flex flex-col gap-2 mt-4">
              {OPTS.map(o=>{const used=picks.includes(o.id);
                return (<button key={o.id} disabled={used||picks.length>=2} onClick={()=>pick(o)}
                  className="text-left px-4 py-3 rounded"
                  style={{background:used?"rgba(22,36,28,0.9)":picks.length>=2?C.panel:"rgba(27,36,43,0.9)",
                    border:`1px solid ${used?C.hr:C.line}`,color:used?C.hr:picks.length>=2?C.faint:"#EDE7DA",
                    fontSize:13.5,lineHeight:1.6,cursor:used||picks.length>=2?"default":"pointer"}}>
                  {used?"✓ ":""}{o.label}
                  {used&&<div style={{fontSize:12,color:C.dim,marginTop:6,fontStyle:"italic"}}>{o.text}</div>}
                </button>);})}
            </div>
            <button onClick={()=>setG(s=>({...s,ch1InterludeStepOut:true}))} className="text-left px-4 py-3 rounded mt-2"
              style={{background:"transparent",border:`1px dashed ${C.line}`,color:C.dim,fontSize:13}}>
              {STATION_STEPOUT_OPTION.label}</button>
            {picks.length>=2&&<button onClick={()=>setG(s=>({...s,interlude1Done:1}))} className="px-7 py-3 rounded mt-6"
              style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
              Continue</button>}
          </VNBox>
        </VNScene></Shell>);
      }

      // §2.7.3 — the post-call VN after `od`: a real beat with {partnerName}
      // processing the call, then a food choice with four real, distinct
      // stat effects (matching the request's exact magnitudes: Hotdog
      // Queen/Milk King/8-77 all raise friendship and lower fatigue, with
      // 8-77 the only one that dents fitness more than "very slightly";
      // Dining Hall is the one that raises fitness at the cost of
      // friendship, the "running joke that they only have salads"). Three
      // sub-stages share this idx-2 slot before tutorialInterludeSeen[2] is
      // finally set: the dinner scene (g.interlude2DinnerDone gates past
      // it), §2.7.4's late-night station interlude (g.lateNightDone gates
      // past it, introduces radio_crew — the reserved relationship id
      // relationships.js already names but nothing had created yet), then
      // §2.7.5's own pre-call VN for the seizure call.
      if(interludeIdx===2){
        if(!g.interlude2DinnerDone){
          const FOOD=STATION_INTERLUDE2_FOOD({partnerName,adjustFriendship});
          const eatAt=(f)=>setG(s=>{
            const applied=f.apply(s);
            const unlocked=newlyUnlocked({ateAt877:!!applied.ateAt877},s.achievements||[]);
            // §2.7.4 introduces radio_crew — drawn here (idempotent, same
            // ||-fallback pattern partner_patrol/supervisor already use) so
            // it exists by the time that stage renders and can just READ
            // it, the same "draw at the transition in" convention this
            // whole campaign uses to avoid mutating g during render.
            const radioDraw=drawNameByGender("female");
            const relationships={...s.relationships,...(applied.relationships||{}),
              radio_crew: s.relationships?.radio_crew ||
                createRelationship({name:radioDraw.name, role:"PATROL radio operator", gender:"female", startFriendship:0})};
            return {...s,...applied,relationships,
              achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,
              interlude2DinnerDone:1};
          });
          // "leans against the wall, staring at nothing" used to open the
          // line's own text — now the "thinking" pose on her sprite instead
          // (see VNSprite's `pose` prop), so the dialogue is just what she
          // actually says.
          const postCallLines=OD_POSTCALL_LINES({partnerName,pr:interludePr});
          return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.patrolStation}>
            <VNSprite src={interludePartnerSrc} pose={g.vnPose?.[partnerName]}/>
            <VNBox label="OUTSIDE MORRISON HALL — AFTER THE CALL" wide>
              {!g.interlude2Talked
                ? <VNDialogue key="postCallOd" lines={postCallLines} doneLabel="Pick where to eat"
                    onLineChange={vnLineChange(setG)}
                    onDone={()=>setG(s=>({...s,interlude2Talked:1,vnPose:{}}))}/>
                : <div className="flex flex-col gap-2">
                    {FOOD.map(f=>(<button key={f.id} onClick={()=>eatAt(f)} className="text-left px-4 py-3 rounded"
                      style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                      <div style={{fontWeight:600}}>{f.label}</div>
                      <div style={{fontSize:12,color:C.dim,marginTop:4}}>{f.text}</div>
                    </button>))}
                  </div>}
            </VNBox>
          </VNScene></Shell>);
        }
        if(!g.lateNightDone){
          // §2.7.4 — Interlude 2: "pick one." A quieter, later beat than
          // Interlude 1's "pick two" — fewer options, one choice, a new
          // speaking role (radioName) rather than a repeat of the same
          // four station activities. campaignSecondRespName is deliberately
          // NOT reused here — it's a one-scene-only field (see its own
          // comment at blank()) already reset to null by this point in the
          // shift, so naming a specific absent character would silently
          // render "undefined."
          const radio=g.relationships?.radio_crew;
          const radioName=firstName(radio?.name)||"the radio operator";
          const radioSrc=radio?portraitFor({role:radio.role,gender:radio.gender,name:radio.name}):null;
          const LATE_OPTS=STATION_INTERLUDE2_LATE_OPTS({partnerName,radioName,interludePr,capFirst,adjustFriendship});
          const pickLate=(o)=>setG(s=>({...s,...o.apply(s),lateNightDone:1}));
          return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.patrolStation}>
            <div style={{display:"flex"}}>
              <VNSprite src={interludePartnerSrc} side={radio?"left":"center"}/>
              {radio&&<VNSprite src={radioSrc} side="right"/>}
            </div>
            <VNBox label="LATE-NIGHT STATION" wide>
              <div style={{fontSize:13.5,color:C.dim,lineHeight:1.7}}>
                Only a few lamps are on now. A new face is at the radio — {radioName}, a quiet second-year nursing
                student. "Last call should be any minute," {partnerName} says. "Until then… got any questions? Or
                just want to chill?"</div>
              <div className="flex flex-col gap-2 mt-4">
                {LATE_OPTS.map(o=>(<button key={o.id} onClick={()=>pickLate(o)} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  <div style={{fontWeight:600}}>{o.label}</div>
                  <div style={{fontSize:12,color:C.dim,marginTop:4}}>{o.text}</div>
                </button>))}
                <button onClick={()=>setG(s=>({...s,ch1InterludeStepOut:true}))} className="text-left px-4 py-3 rounded"
                  style={{background:"transparent",border:`1px dashed ${C.line}`,color:C.dim,fontSize:13}}>
                  {STATION_STEPOUT_OPTION.label}</button>
              </div>
            </VNBox>
          </VNScene></Shell>);
        }
        // §2.7.5 pre-call VN — the radio call that starts the seizure
        // scenario. binderReviewed (set only if the late-night interlude's
        // protocol-binder option was picked) surfaces as a real, read
        // payoff for that choice — the doc's own "internal hint" — rather
        // than a flag nothing downstream consumes.
        const beginSeizure=()=>setG(s=>{
          const k="seizure";
          return withLoadoutRefresh({...s,scen:k,phase:"kit",...SCEN[k].seed(),
            exposed:initialExposure(SCEN[k].clothing),shoesOff:initialShoes(SCEN[k].clothing),
            tutorialInterludeSeen:{...(s.tutorialInterludeSeen||{}),2:true}});
        });
        return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadNight}>
          <VNSprite src={interludePartnerSrc}/>
          <VNBox label="THE ARTS BUILDING — LATE" wide>
            <VNDialogue key="seizurePreCall" doneLabel="Move in" lines={SEIZURE_PRECALL_LINES({partnerName,binderReviewed:g.binderReviewed})} onDone={beginSeizure}/>
          </VNBox>
        </VNScene></Shell>);
      }
    }
    // Chapter 1's "talk to whoever's here" beat (§7 of the station-life
    // follow-up batch) — a repeatable, real relationship-tracked chat with
    // whichever bike EMR / cart-crew pair is on shift, distinct from the
    // one-shot scripted tutorial interludes above. Gated on real
    // availability: an NPC currently out on a background call (§8's
    // ch1BgUnits state machine, driven by the useEffect near the top of
    // this component) has no button to click until they're back.
    if(g.ch1StationTalkTarget){
      const talkRoster=patrolShiftRoster(g.ch1ShiftIdx||0);
      const talkNpcs=[{...talkRoster.bikeEmr},{...talkRoster.cartCrew[0]},{...talkRoster.cartCrew[1]},
        {...talkRoster.footPatrol[0]},{...talkRoster.footPatrol[1]}];
      const npc=talkNpcs.find(n=>n.relId===g.ch1StationTalkTarget);
      const pool=npc&&CH1_STATION_NPC_DIALOGUE[npc.role];
      const alreadyMet=!!g.relationships?.[g.ch1StationTalkTarget];
      const npcFirst=firstName(campaignName(g,g.ch1StationTalkTarget))||"them";
      const talkCtx={npcFirst,cart1bName:firstName(campaignName(g,"station_cart1b")),
        cart2bName:firstName(campaignName(g,"station_cart2b"))};
      const npcLabel=npc?.role==="bikeEmr"?"Bike EMR":npc?.role==="cartCrew"?"Cart crew":"Foot Patrol";
      // Background dispatch (the useEffect near the top of this component)
      // can pull the NPC the player is mid-conversation with out to a call —
      // ch1StationTalkInterrupt names that relId once it happens. Rather
      // than the ordinary banter/firstMeeting pool, show one real in-fiction
      // interrupt line as this conversation's last line, then let the same
      // finishTalk() below close it out normally.
      const interrupted=g.ch1StationTalkInterrupt===g.ch1StationTalkTarget;
      // Math.random() can't be called during render (React purity rule) —
      // the random banter pick happens once, at the "Talk to X" click
      // handler below, and is stored as a plain 0..1 seed read here.
      const banterSeed=g.ch1StationTalkBanterSeed??0;
      const friendship=g.relationships?.[g.ch1StationTalkTarget]?.friendship||0;
      const perChar=friendship>=CH1_PER_CHARACTER_FRIENDSHIP_THRESHOLD
        ?(CH1_STATION_NPC_PER_CHARACTER[g.ch1StationTalkTarget]||[])
        :[];
      const banterPool=pool?[...pool.banter,...perChar]:[];
      const lines=interrupted
        ?[{text:`${npcFirst}'s radio crackles. "Gotta run, dispatch has me. We'll finish this later."`}]
        :pool
          ?ch1Lines(alreadyMet?[banterPool[Math.floor(banterSeed*banterPool.length)]]:pool.firstMeeting,talkCtx)
          :[];
      const finishTalk=()=>setG(s=>{
        const relationships={...s.relationships};
        const id=g.ch1StationTalkTarget;
        if(!relationships[id]){
          relationships[id]=createRelationship({name:campaignName(s,id),
            role:npcLabel,gender:campaignGender(s,id),startFriendship:5});
        } else {
          relationships[id]=adjustFriendship(relationships[id],1);
        }
        return {...s,relationships,ch1StationTalkTarget:null,ch1StationTalkInterrupt:null,
          ch1StationTalkedThisShift:{...(s.ch1StationTalkedThisShift||{}),[id]:true}};
      });
      const talkNpcSrc=npc?portraitFor({role:npcLabel,gender:campaignGender(g,g.ch1StationTalkTarget),name:npcFirst}):null;
      return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationGarage}>
        <VNHeader title={`TALKING WITH ${npcFirst.toUpperCase()}`}/>
        <VNSprite src={talkNpcSrc}/>
        <VNBox wide>
          <VNDialogue key={`ch1Talk-${g.ch1StationTalkTarget}-${interrupted?"int":"norm"}`} doneLabel="Back to the station"
            onLineChange={vnLineChange(setG)} lines={lines} onDone={finishTalk}/>
        </VNBox>
      </VNScene></Shell>);
    }
    if(downtimeEvent) return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:560,margin:"0 auto",paddingTop:60}}>
      <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:C.violet,marginBottom:10}}>AT THE STATION — BETWEEN CALLS</div>
      <img src={EVENT_ART[downtimeEvent.art]||PLACEHOLDERS.generic} onError={onImgError} alt=""
        style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:8,border:`1px solid ${C.line}`,marginBottom:16}}/>
      <div style={{fontSize:19,fontWeight:600}}>{eventTitle}</div>
      <div style={{fontSize:13.5,color:C.dim,marginTop:10,lineHeight:1.7}}>{eventText}</div>
      <div className="flex flex-col gap-2 mt-6">
        {downtimeEvent.choices.map((c,i)=>(<button key={i} onClick={()=>resolveDowntime(c)} className="text-left px-4 py-3 rounded"
          style={{background:C.panelHi,border:`1px solid ${C.line}`}}>
          <div style={{fontSize:14,fontWeight:500}}>{c.label}</div>
        </button>))}
      </div>
    </div></Shell>);
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:560,margin:"0 auto",paddingTop:90,textAlign:"center"}}>
      {g.learningMode==="zth"&&<CampusMapOverlay open={!!g.campusMapOpen} onClose={()=>setG(s=>({...s,campusMapOpen:0}))}/>}
      <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".3em",color:C.dim,display:"flex",justifyContent:"center",alignItems:"center",gap:10}}>
        AT THE STATION
        {g.learningMode==="zth"&&<button onClick={()=>setG(s=>({...s,campusMapOpen:1}))}
          style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:10,padding:"3px 8px",borderRadius:5,cursor:"pointer",letterSpacing:"normal",fontFamily:MONO}}>
          🗺 map</button>}
        {/* 3D mode: this screen is the whiteboard overlay — offer a way
            back to walking around the station room instead of the flat
            list, matching every other overlay's own close affordance. */}
        {mapFor(g)?.id==="city"&&g.drivingModeEnabled!==false&&isTesterUnlocked()&&<button onClick={()=>setG(s=>({...s,stationBoardOpen:false}))}
          style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:10,padding:"3px 8px",borderRadius:5,cursor:"pointer",letterSpacing:"normal",fontFamily:MONO}}>
          ← back to the floor</button>}
      </div>
      <div style={{fontSize:20,fontWeight:600,marginTop:14}}>Boots by the rig. Radio on. Waiting on the tones.</div>
      <div style={{fontSize:13,color:C.dim,marginTop:10}}>
        {LEVELS[g.level].name} · {g.department} · {g.myVeh?.name}
        {g.gmode==="career"&&g.career?` · call ${g.career.idx+1}`:""}
        {/* F18: money is a career-mode economy (F4) — blank() zero-initializes
            it for every save including Sandbox, so this rendered "· $0" in
            Sandbox even though Sandbox has no economy at all. Gate on gmode. */}
        {g.gmode==="career"&&g.money!=null&&<> · <img src={ICON_ART.money} onError={onImgError} alt=""
          width={11} height={11} style={{verticalAlign:"-1px",opacity:.85}}/> ${g.money}</>}</div>
      {/* Design doc §1.3.3: "player should be able to click a button in
          between calls to see what their stats are looking like." §1.5
          extends this to Morale/Reputation, which apply to any Career save
          (not just zth) — so the panel's own gate is now gmode==="career";
          the fitness/confidence/knowledge/ambition/fatigue rows stay
          zth-only inside it, since those fields never move outside zth. */}
      {g.gmode==="career"&&<>
        {/* §1.5.1: "if fatigue exceeds 80, a warning appears" — proactive,
            not hidden behind the collapsed panel below. zth-only, matching
            every other place fatigue moves. */}
        {g.learningMode==="zth"&&g.fatigue>FATIGUE_WARN_THRESHOLD&&
          <div className="mt-3" style={{fontFamily:MONO,fontSize:12,color:C.red}}>⚠ You're dangerously exhausted.</div>}
        <button onClick={()=>setG(s=>({...s,statsOpen:!s.statsOpen}))} className="px-4 py-2 rounded mt-4"
          style={{background:C.panelHi,border:`1px solid ${C.amber}`,color:C.amber,fontSize:12}}>
          📋 {g.statsOpen?"Hide":"Check"} your stats</button>
        {/* !! guards the React "stray 0" render: statsOpen defaults to
            numeric 0 (blank()) and only becomes a real boolean after its
            first toggle (`!s.statsOpen`), so the very first render of this
            screen rendered a literal "0" here — the same defect class fixed
            in SettingsOverlay/AchievementsOverlay/RelationshipsOverlay,
            part of the F4 "stray 00" fix. */}
        {!!g.statsOpen&&<div className="p-4 rounded mt-3 text-left" style={{background:C.panel,border:`1px solid ${C.amber}`}}>
          {g.learningMode==="zth"&&<>
            {[["Fitness","fitness",g.fitness],["Confidence","confidence",g.confidence],
              ["Knowledge","knowledge",g.knowledge],["Ambition","ambition",g.ambition]].map(([label,,val])=>(
              <div key={label} className="flex justify-between" style={{fontSize:13,marginBottom:6}}>
                <span style={{color:C.dim}}>{label}</span><span style={{fontFamily:MONO,color:C.text}}>{val}</span></div>))}
            <div className="flex justify-between" style={{fontSize:13,marginTop:8,paddingTop:8,borderTop:`1px solid ${C.line}`}}>
              <span style={{color:C.dim}}>Fatigue</span>
              <span style={{fontFamily:MONO,color:g.fatigue>80?C.red:g.fatigue>40?C.amber:C.hr}}>{g.fatigue}/100</span></div>
          </>}
          {/* §1.5.2/§1.5.3 — every Career save, zth or not. */}
          <div className="flex justify-between" style={{fontSize:13,marginTop:8,paddingTop:8,borderTop:`1px solid ${C.line}`}}>
            <span style={{color:C.dim}}>Crew morale</span>
            <span style={{fontFamily:MONO,color:g.morale<30?C.red:g.morale<50?C.amber:C.hr}}>{g.morale}/100</span></div>
          <div className="flex justify-between" style={{fontSize:13,marginTop:6}}>
            <span style={{color:C.dim,display:"flex",alignItems:"center",gap:5}}>
              <img src={ICON_ART.reputation} onError={onImgError} alt="" width={11} height={11} style={{opacity:.75}}/>Reputation</span>
            <span style={{fontFamily:MONO,color:needsRemedialTraining(g.reputation)?C.red:g.reputation<0?C.amber:C.hr}}>{g.reputation}</span></div>
          {needsRemedialTraining(g.reputation)&&<div style={{fontSize:11,color:C.red,marginTop:6,lineHeight:1.5}}>
            Reputation critically low — remedial training may be required.</div>}
          <div style={{fontSize:11,color:C.faint,marginTop:8,lineHeight:1.5}}>
            {g.learningMode==="zth"&&"Fitness speeds up physical actions and recovers between calls. Confidence and knowledge lower your fumble chance. High fatigue blunts your effective fitness. "}
            Crew morale nudges how often your crew fumbles a task. Reputation tracks how your career's going —
            good calls and training raise it; deaths and scope violations lower it.</div>
        </div>}
      </>}
      {/* "Step out and see who's around" (an interlude's own stepout
          button, above) lands here — the same plain station screen an
          ordinary between-call moment shows — with a way back to exactly
          where the interlude left off. */}
      {!!g.ch1InterludeStepOut&&<button onClick={()=>setG(s=>({...s,ch1InterludeStepOut:false}))}
        className="px-4 py-2 rounded mt-4" style={{background:C.panelHi,border:`1px solid ${C.amber}`,color:C.amber,fontSize:12}}>
        ← Back to the group</button>}
      {/* "Talk to whoever's here" (§7) — Chapter 1 only. Partner/supervisor
          already have their own deeper content elsewhere in this file; this
          is specifically the newly-relationship-tracked bike EMR/cart-crew
          roster, filtered to whoever ch1BgUnits (§8) says is actually AT
          the station right now, not off on a background call. */}
      {g.learningMode==="zth"&&!g.ch1Done&&(()=>{
        const roster=patrolShiftRoster(g.ch1ShiftIdx||0);
        const npcs=[{...roster.bikeEmr,label:"Bike EMR"},
          {...roster.cartCrew[0],label:"Cart crew"},{...roster.cartCrew[1],label:"Cart crew"},
          {...roster.footPatrol[0],label:"Foot Patrol"},{...roster.footPatrol[1],label:"Foot Patrol"}];
        return (<div className="p-4 rounded mt-6 text-left" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.violet,marginBottom:8}}>WHO'S AT THE STATION</div>
          <div className="flex flex-col gap-2">
            {npcs.map(n=>{
              const away=g.ch1BgUnits?.[n.relId]?.status==="dispatched";
              const talkedAlready=!!g.ch1StationTalkedThisShift?.[n.relId];
              return (<button key={n.relId} disabled={away} onClick={()=>setG(s=>({...s,ch1StationTalkTarget:n.relId,ch1StationTalkBanterSeed:Math.random()}))}
                className="text-left px-3 py-2 rounded" style={{background:C.panelHi,
                  border:`1px solid ${C.line}`,opacity:away?0.4:1,cursor:away?"default":"pointer"}}>
                <div className="flex justify-between">
                  <span style={{fontSize:13}}>{campaignName(g,n.relId)} — {n.label}</span>
                  <span style={{fontFamily:MONO,fontSize:10,color:away?C.faint:talkedAlready?C.dim:C.violet}}>
                    {away?"OUT ON A CALL":talkedAlready?"talk again":"talk"}</span>
                </div>
              </button>);})}
          </div>
        </div>);
      })()}
      {/* The speed-boost practice minigame and the dispatch board (below)
          are both meta-progression/optimization tools that don't belong in
          the guided tutorial shift — isTutorialShift's own deterministic
          3-call queue is meant to be experienced in a fixed, scripted
          order, not optimized. */}
      {!isTutorialShift(g)&&g.gmode==="career"&&(<div className="p-4 rounded mt-6" style={{background:C.panel,border:`1px solid ${C.line}`,textAlign:"left"}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.spo2,marginBottom:8}}>NEED A BOOST IN SPEED? PRACTICE!</div>
        {!practice?<>
          <div style={{fontSize:12,color:C.dim,marginBottom:10,lineHeight:1.6}}>
            Stop the marker as close to the center as you can. A clean stop shaves time off every action
            you perform on your NEXT call. {g.speedBoost<1?`Current boost: ${Math.round((1-g.speedBoost)*100)}% faster.`
              :g.speedBoost>1?`Still shaken from the drive in — ${Math.round((g.speedBoost-1)*100)}% slower right now.`:""}</div>
          <button onClick={()=>setPractice({running:true,pos:0,result:null})} className="px-4 py-2 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.spo2}`,color:C.spo2,fontSize:12.5}}>Practice</button>
        </>:practice.result==null?<>
          <div style={{position:"relative",height:28,background:"#0A1410",border:`1px solid ${C.line}`,borderRadius:4,marginBottom:10}}>
            <div style={{position:"absolute",left:"45%",width:"10%",top:0,bottom:0,background:"#1F3A2C"}}/>
            <div style={{position:"absolute",left:`${practice.pos}%`,top:0,bottom:0,width:2,background:C.hr}}/>
          </div>
          <button onClick={()=>{const score=Math.max(0,100-Math.abs(practice.pos-50)*2);
              const boost=1-Math.min(0.15,(score/100)*0.15);
              setG(s=>({...s,speedBoost:boost})); setPractice({running:false,pos:practice.pos,result:score});}}
            className="px-4 py-2 rounded" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:12.5}}>Stop!</button>
        </>:<>
          <div style={{fontSize:13,marginBottom:10}}>
            Score {Math.round(practice.result)}/100 — {Math.round((1-(g.speedBoost||1))*100)}% faster next call.</div>
          <button onClick={()=>setPractice(null)} className="px-4 py-2 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:12}}>Close</button>
        </>}
      </div>)}
      {/* upcoming.length>1 is true for the tutorial shift too (its whole
          3-call queue is visible at once via career.queue.slice) — but
          takeCall() REORDERS career.queue by swapping the chosen call into
          the current slot, which would silently break the deterministic
          benignFaint->od->seizure sequence isTutorialShift/interludeIdx
          both depend on (the two scripted station interludes expect a
          SPECIFIC call to have just finished at idx 1/2). A real bug, not
          just clutter — found while suppressing this board for the
          tutorial shift, not guessed at. */}
      {upcoming.length>1&&!isTutorialShift(g)?(<div className="p-4 rounded mt-6 text-left" style={{background:C.panel,border:`1px solid ${C.line}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.amber,marginBottom:8}}>DISPATCH BOARD — PICK WHAT YOU RUN NEXT</div>
        <div style={{fontSize:11.5,color:C.dim,marginBottom:10,lineHeight:1.6}}>
          More than one call is holding. You don't have to take them in the order they came in — triage which one goes first.</div>
        <div className="flex flex-col gap-2">
          {upcoming.map(k=>{const SCk=SCEN[k],acuity=callAcuity(k);
            return (<button key={k} onClick={()=>takeCall(k)} className="text-left px-4 py-3 rounded"
              style={{background:C.panelHi,border:`1px solid ${acuity==="HIGH"?C.red:C.line}`}}>
              <div className="flex justify-between items-baseline">
                <span style={{fontSize:13.5,fontWeight:600}}>{SCk.cat==="trauma"?"TRAUMA":"MEDICAL"} — {SCk.dispatch[0]}</span>
                <span style={{fontFamily:MONO,fontSize:10,color:acuity==="HIGH"?C.red:C.dim}}>{acuity}</span></div>
            </button>);})}
        </div>
      </div>):(
      <button onClick={getCall} className="px-8 py-3 rounded mt-8"
        style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:15}}>▲ Get the call</button>)}
      <button onClick={()=>setG(s=>({...blank(),...carry(s),phase:"saves"}))} className="px-5 py-2.5 rounded mt-6 block mx-auto"
        style={{background:"transparent",border:`1px solid ${C.faint}`,color:C.faint,fontSize:12.5}}>End shift — back to saves</button>
    </div></Shell>);
  }

  if(g.phase==="cat"){
    const pick=(cat)=>{const pool=Object.keys(SCEN).filter(k=>k!=="baseline"&&(cat==="random"||SCEN[k].cat===cat));
      // pick() is only ever invoked from an onClick handler (every call site
      // below), never during render; the rule can't tell a function DEFINED
      // in the render body from one only ever CALLED from an event handler.
      // eslint-disable-next-line react-hooks/purity
      const k=pool[Math.floor(Math.random()*pool.length)];
      setG(s=>withLoadoutRefresh({...s,scen:k,phase:"kit",...SCEN[k].seed(),
        exposed:initialExposure(SCEN[k].clothing),shoesOff:initialShoes(SCEN[k].clothing)}));};
    const pickExact=(k)=>setG(s=>withLoadoutRefresh({...s,scen:k,phase:"kit",...SCEN[k].seed(),
      exposed:initialExposure(SCEN[k].clothing),shoesOff:initialShoes(SCEN[k].clothing)}));
    // F10: cp.conditions is an array (was a single `condition` string) —
    // physiology.js's buildPatient()/buildCustomScenario() already compose
    // an array of condition keys onto one patient, so multi-select here
    // just passes the whole selection through unchanged.
    const cp=g.customParams||{conditions:[],age:40,gender:"female"};
    const setCP=(patch)=>setG(s=>({...s,customParams:{...cp,...patch}}));
    const toggleCondition=(k)=>{const cur=cp.conditions||[];
      setCP({conditions:cur.includes(k)?cur.filter(x=>x!==k):[...cur,k]});};
    const launchCustom=()=>{if(!(cp.conditions||[]).length) return;
      const sc=buildCustomScenario(cp); if(!sc) return;
      setG(s=>withLoadoutRefresh({...s,scen:"custom",customParams:cp,phase:"kit",...sc.seed(),
        exposed:initialExposure(sc.clothing),shoesOff:initialShoes(sc.clothing)}));};
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:660,margin:"0 auto",paddingTop:40}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{LEVELS[g.level].name.toUpperCase()} · {g.roster.length?`CREW OF ${g.roster.length+1}`:"SOLE PROVIDER"} · SANDBOX</span><BackBtn toPhase="station" setG={setG}/></div>
      <div className="f2 flex flex-col gap-2 mt-6">
        {[["medical","Medical","Chest pain. Breathing. Overdose. The ones that look fine and are not."],
          ["trauma","Trauma","The ones that look terrible and sometimes are not."],
          ["random","Random","You do not get to know. Neither does dispatch."],
          ["test","Test Patient","A healthy adult at baseline vitals, for trying every treatment, device and minigame. Never comes up in random calls."]].map(([k,n,d])=>(
          <button key={k} onClick={()=>(k==="test"?pickExact("baseline"):pick(k))} className="text-left px-5 py-4 rounded"
            style={{background:C.panelHi,border:`1px solid ${k==="random"?C.amber:k==="test"?C.spo2:C.line}`,marginTop:k==="test"?10:0}}>
            <div style={{fontSize:17,fontWeight:600,color:k==="random"?C.amber:k==="test"?C.spo2:C.text}}>{n}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>{d}</div></button>))}
      </div>
      {g.roster.length>0&&<div className="f2 mt-6 p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
        <button onClick={()=>setG(s=>({...s,partnerLimited:!s.partnerLimited}))} className="text-left w-full"
          style={{background:"transparent",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>
            <span style={{fontSize:14,fontWeight:600,color:g.partnerLimited?C.amber:C.text}}>Partner may be limited this case</span>
            <div style={{fontSize:11.5,color:C.dim,marginTop:3,lineHeight:1.5,maxWidth:480}}>
              One of your recruited partners might roll a physical limitation (a broken leg, a
              third-trimester pregnancy, an injured wrist) that blocks some of their tasks for the
              call — practice directing a crew that isn't at full capability.</div></span>
          <span style={{fontFamily:MONO,fontSize:18,color:g.partnerLimited?C.amber:C.faint}}>{g.partnerLimited?"☑":"☐"}</span>
        </button>
      </div>}
      <div className="f2 mt-6">
        <div className="flex justify-between items-center" style={{marginBottom:8}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim}}>OR PICK A SPECIFIC CASE — BY BODY SYSTEM</div>
          <div className="flex gap-1">
            {[["list","List"],["map","Map"]].map(([v,n])=>(
              <button key={v} onClick={()=>setMapView(v==="map")} className="px-2.5 py-1 rounded"
                style={{background:(v==="map")===mapView?C.panelHi:"transparent",border:`1px solid ${(v==="map")===mapView?C.spo2:C.line}`,
                  color:(v==="map")===mapView?C.spo2:C.dim,fontFamily:MONO,fontSize:9.5}}>{n}</button>))}
          </div>
        </div>
        {(()=>{const byBody={}; Object.keys(SCEN).filter(k=>k!=="baseline").forEach(k=>{const sys=bodySystemOf(k); (byBody[sys]=byBody[sys]||[]).push(k);});
          const order=["Cardiac","Respiratory","Trauma","Toxicology","Infectious Disease","Allergy / Immune","Obstetric / Gynecologic","Pediatric","Gastrointestinal","Neurologic","Endocrine / Metabolic","Electrolyte","Environmental","Other"];
          // Same "you don't get to know which one" flavor as the top-level
          // Random button and the map pins, scoped to one body system —
          // "run cardiac calls" without hand-picking the specific one.
          const pickBodySystem=(sys)=>{const pool=byBody[sys]||[]; if(!pool.length) return;
            // Only ever invoked from an onClick handler (below), same as pick() above.
            // eslint-disable-next-line react-hooks/purity
            pickExact(pool[Math.floor(Math.random()*pool.length)]);};
          if(mapView){
            // A real street/building map (src/data/maps.js) replaces the old
            // decorative percentage-pin overlay — see CLAUDE.md's
            // map-expansion plan. Clicking a building keeps the exact same
            // "you don't get to know which one" flavor the old pins/Random
            // button already have: it rolls a random call from a body
            // system PLAUSIBLE for that building's type, not a literal
            // lookup of what's actually there.
            const BUILDING_SYSTEM_POOL={
              house:["Cardiac","Neurologic","Endocrine / Metabolic","Electrolyte","Gastrointestinal","Other"],
              business:["Trauma","Toxicology","Respiratory"],
              school:["Pediatric","Allergy / Immune"],
              park:["Allergy / Immune","Environmental","Trauma"],
              clinic:["Respiratory","Cardiac"],
              hospital:order,
            };
            const pickForBuilding=(b)=>{
              const pool=(BUILDING_SYSTEM_POOL[b.type]||order).filter(sys=>byBody[sys]?.length);
              const use=pool.length?pool:order.filter(sys=>byBody[sys]?.length);
              // Only ever invoked from an onClick handler (CityMap's
              // onBuildingClick), same as pickBodySystem above.
              // eslint-disable-next-line react-hooks/purity
              if(use.length) pickBodySystem(use[Math.floor(Math.random()*use.length)]);
            };
            const dispMap=mapFor(g);
            return (<CityMap map={dispMap} onBuildingClick={pickForBuilding}/>);
          }
          // Per-system dropdown replaces the old button grid: one <select>
          // per body-system section (populated from that system's own case
          // list, defaulting to its first entry) plus a "Go" button that
          // launches whichever case is currently highlighted — same launch
          // path (pickExact) the old buttons used, just one control per
          // system instead of a button per case.
          return order.filter(sys=>byBody[sys]?.length).map(sys=>{
            const opts=byBody[sys];
            const selected=sysCaseSelect[sys]&&opts.includes(sysCaseSelect[sys])?sysCaseSelect[sys]:opts[0];
            return (<div key={sys} className="mb-4">
              <div className="flex justify-between items-center" style={{marginBottom:6}}>
                <div style={{fontFamily:MONO,fontSize:9.5,letterSpacing:".14em",color:C.spo2}}>{sys.toUpperCase()}</div>
                <button onClick={()=>pickBodySystem(sys)} className="px-2 py-1 rounded"
                  style={{background:"transparent",border:`1px solid ${C.amber}`,color:C.amber,fontFamily:MONO,fontSize:9.5,cursor:"pointer"}}>
                  🎲 Random {sys.toLowerCase()}</button>
              </div>
              <div className="flex gap-1.5">
                <select value={selected} onChange={(e)=>setSysCaseSelect(prev=>({...prev,[sys]:e.target.value}))}
                  className="flex-1 px-3 py-2 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:12.5}}>
                  {opts.map(k=>(<option key={k} value={k}>{SCEN[k].title}</option>))}
                </select>
                <button onClick={()=>pickExact(selected)} className="px-4 py-2 rounded"
                  style={{background:C.panelHi,border:`1px solid ${C.spo2}`,color:C.spo2,fontFamily:MONO,fontSize:11,whiteSpace:"nowrap"}}>Go ▸</button>
              </div>
            </div>);});})()}
      </div>
      <div className="f2 mt-6 p-4 rounded" style={{background:C.panel,border:`1px solid ${C.violet}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.violet,marginBottom:10}}>BUILD YOUR OWN</div>
        <div style={{fontSize:11.5,color:C.dim,marginBottom:10}}>
          CONDITION(S) — pick one or more. Combine an emergent presentation with any number of
          chronic comorbidities (e.g. "Pneumonia + Diabetes", "Stroke + AFib + Diabetes").</div>
        {(()=>{const taxGroups={};
          CONDITION_LIST.forEach(k=>{const t=CONDITION_TAXONOMY[k]; if(!t) return;
            const gk=`${t.tier}|${t.category}`; (taxGroups[gk]=taxGroups[gk]||[]).push(k);});
          const selected=cp.conditions||[];
          return ["emergent","chronic"].map(tier=>(
            <div key={tier} className="mb-3">
              <div style={{fontFamily:MONO,fontSize:10.5,letterSpacing:".16em",
                color:tier==="emergent"?C.red:C.spo2,marginTop:tier==="chronic"?10:0,marginBottom:6}}>
                {tier==="emergent"?"EMERGENT":"CHRONIC / BASELINE"}</div>
              {TAXONOMY[tier].map(cat=>{
                const ids=(taxGroups[`${tier}|${cat}`]||[]).slice()
                  .sort((a,b)=>CONDITION_META[a].name.localeCompare(CONDITION_META[b].name));
                if(!ids.length) return null;
                const gk=`${tier}|${cat}`, open=!!customGroupOpen[gk];
                const selCount=ids.filter(k=>selected.includes(k)).length;
                return (<div key={cat} className="mb-1.5 p-2 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
                  <button onClick={()=>setCustomGroupOpen(o=>({...o,[gk]:!open}))} className="w-full text-left flex justify-between items-center"
                    style={{background:"transparent",border:"none",cursor:"pointer",padding:0}}>
                    <span style={{fontFamily:MONO,fontSize:10,letterSpacing:".1em",color:C.dim}}>{open?"▲":"▼"} {cat.toUpperCase()}</span>
                    <span style={{fontFamily:MONO,fontSize:9.5,color:selCount?C.violet:C.faint}}>
                      {selCount?`${selCount} selected`:`${ids.length}`}</span>
                  </button>
                  {open&&<div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                    {ids.map(k=>{const sel=selected.includes(k);
                      return (<button key={k} onClick={()=>toggleCondition(k)} className="text-left px-3 py-1.5 rounded"
                        style={{background:sel?"#1F1830":C.panelHi,border:`1px solid ${sel?C.violet:C.line}`,
                          color:sel?C.violet:C.text,fontSize:11.5}}>
                        <span style={{fontFamily:MONO,color:sel?C.violet:C.faint,marginRight:5}}>{sel?"☑":"☐"}</span>
                        {CONDITION_META[k].name}</button>);})}
                  </div>}
                </div>);})}
            </div>));})()}
        {(cp.conditions||[]).length>0&&<div className="flex flex-wrap gap-1.5 mt-1 mb-2">
          {cp.conditions.map(k=>(<span key={k} className="px-2 py-1 rounded"
            style={{background:"#1F1830",border:`1px solid ${C.violet}`,color:C.violet,fontSize:11,
              display:"inline-flex",alignItems:"center",gap:5}}>
            {CONDITION_META[k].name}
            <button onClick={()=>toggleCondition(k)}
              style={{background:"transparent",border:"none",color:C.violet,cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>✕</button>
          </span>))}
        </div>}
        <div className="flex gap-4 flex-wrap mt-4">
          <div>
            <div style={{fontSize:11.5,color:C.dim,marginBottom:6}}>AGE</div>
            <input type="number" min={1} max={105} value={cp.age??40}
              onChange={(e)=>setCP({age:+e.target.value})}
              className="px-3 py-2 rounded" style={{width:90,background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:13}}/>
          </div>
          <div>
            <div style={{fontSize:11.5,color:C.dim,marginBottom:6}}>GENDER</div>
            <div className="flex gap-1.5">{[["female","F"],["male","M"],["other","Other"]].map(([k,n])=>(
              <button key={k} onClick={()=>setCP({gender:k})} className="px-3 py-2 rounded"
                style={{background:(cp.gender||"female")===k?"#1F1830":C.panelHi,border:`1px solid ${(cp.gender||"female")===k?C.violet:C.line}`,
                  color:(cp.gender||"female")===k?C.violet:C.text,fontSize:12}}>{n}</button>))}</div>
          </div>
        </div>
        <button onClick={launchCustom} disabled={!(cp.conditions||[]).length} className="px-6 py-2.5 rounded mt-5"
          style={{background:(cp.conditions||[]).length?"#1F1830":"transparent",border:`1px solid ${(cp.conditions||[]).length?C.violet:C.line}`,
            color:(cp.conditions||[]).length?C.violet:C.faint,fontSize:13,cursor:(cp.conditions||[]).length?"pointer":"default"}}>
          ▲ Run this case</button>
      </div>
      <div className="f2 mt-6 p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".14em",color:C.dim,marginBottom:8}}>TIME SCALE</div>
        <div className="flex gap-2">{[[1,"1× real time"],[2,"2×"],[4,"4× recommended"]].map(([v,n])=>(
          <button key={v} onClick={()=>setG(s=>({...s,speed:v}))} className="px-3 py-1.5 rounded"
            style={{background:g.speed===v?C.panelHi:"transparent",border:`1px solid ${g.speed===v?C.amber:C.line}`,
              color:g.speed===v?C.amber:C.dim,fontFamily:MONO,fontSize:10}}>{n}</button>))}</div>
      </div>
      <button onClick={()=>setG(s=>({...blank(),...carry(s),phase:"saves"}))} className="px-5 py-2.5 rounded mt-6"
        style={{background:"transparent",border:`1px solid ${C.faint}`,color:C.faint,fontSize:12.5}}>End shift — back to saves</button>
      </div></Shell>);
  }

  if(g.phase==="kit"){
    const hands=g.bags.filter(b=>BAGS[b].carry==="hand").length, back=g.bags.filter(b=>BAGS[b].carry==="back").length;
    // F2: some rigs (police patrol cars, a campus PSO's bike/golf cart) don't
    // stock a full EMS loadout — restrict which bags can even be picked.
    const vehBags=bagsForVehicle(g.myVeh);
    // Chapter 1's own "one bag, absolute limit" rule: a Layperson normally
    // never reaches this section at all (L>=1 gated it below) since a
    // bystander doesn't carry a jump bag — but Chapter 1's PATROL volunteer
    // narratively DOES carry one ("the patrol bag confirmed stocked," the
    // Gearup scene). Rather than auto-assign it with no choice, this opens
    // the same bag-picker UI everyone else uses, forced to the single
    // "Backpack" entry (gear.js) — not the real vehicle/full bag list — and
    // capped at exactly 1, with no stretcher option (a foot patroller has
    // nowhere to put one).
    const ch1LaypersonGearup=g.learningMode==="zth"&&!g.ch1Done&&L===0;
    const bagChoices=ch1LaypersonGearup?[["backpack",BAGS.backpack]]
      :vehBags?Object.entries(BAGS).filter(([k])=>vehBags.includes(k))
      :STANDARD_BAG_KEYS.map(k=>[k,BAGS[k]]);
    // Zero-To-Hero campaign only (design doc §1.3.1): starts capped at 2
    // bags instead of the usual 3, until fitness clears the threshold —
    // every other save's cap is untouched (campaignBagCap returns the
    // ordinary default unless learningMode==="zth").
    const bagCap=ch1LaypersonGearup?1
      :g.learningMode==="zth"?campaignBagCap(g.fitness,Math.min(3,bagChoices.length))
      :Math.min(3,bagChoices.length);
    const ready=g.stretcher||g.bags.length===bagCap||(L===0&&!ch1LaypersonGearup);
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:780,margin:"0 auto",paddingTop:16}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".22em",color:C.amber,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {/* Bug fix: this was hardcoded to "cat" (Sandbox's scenario picker)
            regardless of gmode, so a Career player backing out of the kit
            screen landed in Sandbox instead of back at their own station —
            matches the branching the two mid-call "Abandon call" buttons
            already use. */}
        <span>▶▶ CROSSING THE BAY</span><BackBtn toPhase={g.gmode==="career"?"station":"cat"} label={g.gmode==="career"?"← Back to station":"← Back to scenario select"} setG={setG}/></div>
      <div className="f1 p-4 rounded mt-4" style={{background:C.panel,border:`1px solid ${C.line}`}}>
        {L!==0?<>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.spo2,marginBottom:8}}>DISPATCH</div>
          {SC.dispatch.map((d,i)=><div key={i} style={{fontSize:14,lineHeight:1.7}}>— {d}</div>)}
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.dim,marginTop:10}}>
            {(g.mode?MODES[g.mode].name.toUpperCase():"SUBURBAN")} RESPONSE · {(g.myVeh?.name||myVehicle(g.level,null).name).toUpperCase()}</div>
          <div style={{fontSize:12.5,color:C.dim}}>Also responding: {(MODES[g.mode||"suburban"].units).map(u=>u.toUpperCase()).join(" · ")}. You'll get their ETAs and can pre-assign tasks en route.</div>
        </>:<>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.spo2,marginBottom:8}}>ON SCENE</div>
          <div style={{fontSize:14,lineHeight:1.7}}>You're already here. No dispatch, no siren, no idea who — if anyone — is coming until you decide to call.</div>
        </>}
      </div>
      {/* A layperson on foot has no vehicle, no lights, no siren — "what
          response code" is meaningless when you're not driving anywhere.
          Matches the L!==0 gate useSiren already applies for the same
          reason, and the DISPATCH-vs-ON-SCENE branch just above. */}
      {L!==0&&<div className="f2 mt-5">
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:8}}>RESPONSE CODE</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(CODES).map(([k,c])=>(<button key={k} onClick={()=>setG(s=>({...s,code:+k}))}
            className="text-left px-3 py-2 rounded" style={{background:g.code===+k?"#1A1510":C.panelHi,
              border:`1px solid ${g.code===+k?C.amber:C.line}`}}>
            <div style={{fontSize:13,fontWeight:600,color:g.code===+k?C.amber:C.text}}>{c.name}</div>
            <div style={{fontSize:10.5,color:C.dim,marginTop:3,lineHeight:1.45}}>{c.note}</div></button>))}
        </div></div>}
      <div className="f2 mt-5">
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:8}}>ON YOUR UNIFORM — FREE</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(POCKETS).map(([k,p])=>{const lock=(p.min??0)>L&&L<5,on=g.pockets.includes(k);
            return (<button key={k} disabled={lock} onClick={()=>setG(s=>({...s,pockets:on?s.pockets.filter(x=>x!==k):[...s.pockets,k]}))}
              className="text-left px-3 py-2 rounded" style={{background:on?"#16241C":C.panelHi,
                border:`1px solid ${on?C.hr:C.line}`,color:lock?C.faint:C.text,opacity:lock?.35:1}}>
              <div style={{fontSize:12.5,fontWeight:500}}>{p.name}</div>
              <div style={{fontSize:10,color:C.dim,marginTop:2}}>{p.note}</div></button>);})}
        </div></div>
      {(L>=1||ch1LaypersonGearup)&&(<div className="f2 mt-5">
        <div className="flex justify-between mb-2">
          <span style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim}}>
            {g.stretcher?"ON THE DECK — EVERYTHING":`${bagCap===1?"ONE BAG":bagCap===2?"TWO BAGS":"THREE BAGS"} — ${bagCap-g.bags.length} LEFT`}</span>
          {!g.stretcher&&<span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>HANDS {hands}/2 · BACK {back}/1</span>}</div>
        {vehBags&&<div style={{fontSize:11,color:C.faint,marginBottom:8}}>This rig only carries: {vehBags.map(k=>BAGS[k].name).join(", ")}.</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {bagChoices.map(([k,b])=>{const on=g.stretcher||g.bags.includes(k);
            const full=!on&&(b.carry==="hand"?hands>=2:back>=1);
            const dis=g.stretcher||(!on&&(g.bags.length>=bagCap||full));
            return (<button key={k} disabled={dis} onClick={()=>setG(s=>({...s,bags:on?s.bags.filter(x=>x!==k):[...s.bags,k]}))}
              className="text-left px-4 py-3 rounded" style={{background:on?"#16241C":C.panelHi,
                border:`1px solid ${on?C.hr:C.line}`,color:dis&&!on?C.faint:C.text,opacity:dis&&!on?.35:1}}>
              <div className="flex justify-between"><span style={{fontSize:14,fontWeight:500}}>{b.name}</span>
                <span style={{fontFamily:MONO,fontSize:9,color:C.faint}}>{b.carry==="hand"?"HAND":"BACK"}</span></div>
              <div style={{fontSize:11,color:C.dim,marginTop:3}}>{b.note}</div></button>);})}
        </div>
        {!ch1LaypersonGearup&&<button className="text-left px-4 py-3 rounded mt-2 w-full"
          onClick={()=>setG(s=>({...s,stretcher:!s.stretcher,bags:!s.stretcher?bagChoices.map(([k])=>k):[]}))}
          style={{background:g.stretcher?"#1A1510":C.panelHi,border:`1px solid ${g.stretcher?C.amber:C.line}`}}>
          <div className="flex justify-between"><span style={{fontSize:14,fontWeight:500,color:g.stretcher?C.amber:C.text}}>Bring the stretcher — everything on the deck</span>
            <span style={{fontFamily:MONO,fontSize:10,color:C.red}}>+80s</span></div>
          <div style={{fontSize:11,color:C.dim,marginTop:3}}>Nothing left behind. Eighty seconds late.</div></button>}
      </div>)}
      {limitedItemsActive(g)&&g.supplyStock&&(()=>{
        const low=Object.entries(g.supplyStock).filter(([id,qty])=>qty<=0&&(g.loadoutSelection?.carried?.[id]||0)>0);
        return (<div className="f2 mt-5 p-3 rounded" style={{background:C.panel,border:`1px solid ${low.length?C.red:C.line}`}}>
          <div className="flex justify-between items-center">
            <div>
              <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim}}>🎒 LOADOUT — LIMITED ITEMS</div>
              <div style={{fontSize:11.5,color:low.length?C.red:C.faint,marginTop:4}}>
                {low.length?`Out of stock: ${low.slice(0,4).map(([id])=>STOCK_ITEMS[id]?.label).join(", ")}${low.length>4?`, +${low.length-4} more`:""}.`
                  :"Carried supply is stocked from your last restock."}</div>
            </div>
            <button onClick={()=>setG(s=>({...s,phase:"loadout",loadoutReturnPhase:"kit"}))} className="px-3 py-2 rounded"
              style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:11.5,whiteSpace:"nowrap"}}>
              Configure loadout →</button>
          </div>
        </div>);})()}
      <button disabled={!ready} onClick={()=>setG(s=>{const isLay=LEVELS[s.level].n===0;
        let ownCrew=(s.roster||[]).map(p=>({id:p.id,name:p.name,level:p.level,student:!!p.student,
          exp:p.exp||0,unitId:"own",vehicle:s.myVeh,solo:false,mine:true,pilot:!!p.pilot,fixed:!!p.fixed,
          title:p.title,role:p.role,crewTitle:p.student?"student":(p.pilot?"pilot":"partner")}));
        // Medical Education Mode: roll a physical limitation onto one
        // partner for this call, per the "cat" screen's toggle.
        if(s.gmode==="sandbox"&&s.partnerLimited) ownCrew=rollPartnerLimitation(ownCrew);
        // Real map location for this call — seeded ONCE, here, at dispatch
        // (never mid-call, see CLAUDE.md's map-expansion plan item 11). The
        // seed itself is persisted (g.locations.seed) so the pick is
        // reproducible for debugging, not just the resulting location.
        // locOnStreet scenarios (MVC-mechanism calls) place on a real
        // {edgeId,t} street point instead of a building; everything else is
        // a weighted-random building draw honoring the scenario's own
        // locConstraints (hard allow-list)/locWeights (soft bias), or a flat
        // draw across every building if neither is declared.
        const dispatchMap=mapFor(s);
        const dispatchSeed=Math.floor(Math.random()*2**31);
        const rng=mulberry32(dispatchSeed);
        const dispatchScen=scenOf(s);
        const incidentRp=dispatchScen?.locOnStreet
          ?(pickPointOnStreet(dispatchMap,rng)||{type:"node",nodeId:dispatchMap.station})
          :{type:"node",nodeId:(pickIncidentBuilding(dispatchMap,dispatchScen,rng)||{node:dispatchMap.station}).node};
        // The player's own station of origin — the nearest one of their
        // department that actually has their specific vehicle kind (not
        // just the nearest building tagged with the right department: a
        // rarer kind like the ladder truck lives at only one firehouse in
        // a multi-station city, see maps.js/mapGraph.js's nearestStation).
        // Falls back to the map's flat legacy station node if the
        // department/kind combo somehow has no station on this map.
        const stationRp=nearestStation(dispatchMap,s.department,s.myVeh?.kind,incidentRp);
        const locations={mapId:dispatchMap.id,station:stationRp,
          incident:incidentRp,seed:dispatchSeed};
        // General: every scenario's patient gets a random name, drawn ONCE
        // here — same "seed once, at dispatch" idiom as dispatchSeed just
        // above. Revealed to the player only via the "Ask for ID" general
        // action (see generalActs()), never shown by default, so this
        // doesn't undermine the existing "a patient never gets a name
        // prefix" diagnose-without-bias framing. The recurring frequent-
        // flyer patient (campaign.js) overrides this with their own
        // persisted identity instead of a fresh draw, and this is also
        // where their lifetime encounter count increments.
        const isFlyer=FREQUENT_FLYER_SCENARIOS.includes(s.scen)||s.scen===FREQUENT_FLYER_OD_SCENARIO;
        let patientName,flyerPatch={},flyerLog=[];
        if(isFlyer){
          const newEncounters=(s.frequentFlyerEncounters||0)+1;
          if(s.frequentFlyerName){ patientName=s.frequentFlyerName; }
          else{ const draw=drawNameByGender(); patientName=draw.name; flyerPatch.frequentFlyerGender=draw.gender; }
          flyerPatch.frequentFlyerName=patientName; flyerPatch.frequentFlyerEncounters=newEncounters;
          // A "figures, same as last time" beat once this is a repeat
          // appearance — including the OD call, where it lands hardest
          // since nothing else in that scenario's own text signals
          // anything is different this time.
          if(newEncounters>=2) flyerLog=ch1Lines(CH1_DIALOGUE.frequentFlyerRecognition,{name:patientName})
            .map(l=>({t:s.t,kind:"disp",text:l.text}));
        }else{
          patientName=drawNameByGender(dispatchScen?.patient?.gender||dispatchScen?.patient?.sex||null).name;
        }
        const sWithLoc={...s,locations};
        let units=[];let sceneRank=1,nextStreak=s.firstStreak||0;
        if(!isLay){let raw=genUnits(s.mode,{allowed:effectiveAllowedKinds(s.allowedKinds,s.allowedDepartments),severity:s.code});
          const veh=s.myVeh||myVehicle(s.level,null);
          if(!veh.transport&&!raw.some(u=>u.vehicle.transport)) raw.push(blsAmbulance(s.mode));
          const sched=scheduleUnits(sWithLoc,raw); units=sched.units; sceneRank=sched.rank;
          nextStreak=sceneRank===1?0:(s.firstStreak||0)+1;}
        // DRIVING MODE off (Settings), OR a locked (non-tester) session —
        // skip the interactive minigame from the start — driveMiniDone is
        // set immediately rather than via an effect, so nothing renders it,
        // but travelTimes()'s own computed `need` (now real map-derived
        // geometry) still governs the phase's elapsed time identically
        // either way. The 3D scenes are tester-gated the same way
        // Career/Co-op are (isTesterUnlocked()).
        return {...s,locations,mapVersion:dispatchMap.version,
          phase:"response",sceneUnits:units,crew:ownCrew,call911:isLay?0:1,call911Asked:0,
          sceneRank,firstStreak:nextStreak,
          ...((s.drivingModeEnabled===false||!isTesterUnlocked())?{driveMiniDone:1}:{}),
          patientName,...flyerPatch,log:[...(s.log||[]),...flyerLog],
          planned:{},commandLevel:LEVELS[s.level].n,commander:null,forcedTask:null};})} className="px-8 py-3 rounded mt-5"
        style={{background:ready?"#2A1418":C.panelHi,border:`1px solid ${ready?C.red:C.line}`,color:ready?C.red:C.faint,fontSize:14}}>
        ▲ {L!==0?`Roll — ${CODES[g.code].name}`:"Head over"}</button>
    </div></Shell>);
  }

  /* ═══ LOADOUT — configure what the vehicle carries this shift/window ═══
     Limited-items system (src/data/loadout.js). Career (zth or mos) is
     always limited; Sandbox reaches this only with the "Limited Items"
     toggle on (see the "scope" phase). Draft state lives in g.loadoutDraft
     (transient) rather than a local useState, matching this file's own
     house style of funneling every input through setG rather than
     conditional local hooks inside a phase branch. */
  if(g.phase==="loadout"){
    // F32: scope-limit what can be packed. L is this file's own effective
    // player level (defined once, above, from g.level) — the SAME number
    // why()'s `a.lvl>L` scope check already uses for every action, so a
    // drug/procedure locked here is locked for the identical reason it
    // would be locked mid-call.
    const draft=g.loadoutDraft||defaultLoadout(L);
    const setQty=(pool,id,delta)=>setG(s=>{
      const Ls=s.level?LEVELS[s.level].n:0;
      const d=s.loadoutDraft||defaultLoadout(Ls);
      const cur=d[pool][id]||0, cap=maxCapacity(id,Ls);
      const cat=STOCK_ITEMS[id].cat;
      const budget=pool==="truck"?truckBudget():categoryBudget(cat);
      const used=pool==="truck"?truckUsed(d.truck):carriedUsed(d.carried,cat);
      const next=Math.max(0,Math.min(cap,cur+delta));
      if(delta>0&&(used-cur+next)>budget) return s; // would exceed the category/truck budget — refuse
      return {...s,loadoutDraft:{...d,[pool]:{...d[pool],[id]:next}}};
    });
    const resetDefaults=()=>setG(s=>({...s,loadoutDraft:defaultLoadout(s.level?LEVELS[s.level].n:0)}));
    const save=()=>setG(s=>{const Ls=s.level?LEVELS[s.level].n:0; const d=s.loadoutDraft||defaultLoadout(Ls);
      return {...s,loadoutSelection:d,supplyStock:{...d.carried},truckReserve:{...d.truck},
        loadoutDraft:null,restockedThisCall:1,phase:s.loadoutReturnPhase||"kit"};});
    const cancel=()=>setG(s=>({...s,loadoutDraft:null,phase:s.loadoutReturnPhase||"kit"}));
    const stepBtn=(dis)=>({background:dis?"transparent":C.panelHi,border:`1px solid ${C.line}`,color:dis?C.faint:C.text,borderRadius:5,
      width:22,height:22,fontFamily:MONO,fontSize:13,cursor:dis?"default":"pointer",lineHeight:1,opacity:dis?.4:1});
    const Stepper=({pool,id})=>{const val=draft[pool][id]||0, locked=isLocked(id,L);
      return (<div style={{display:"flex",alignItems:"center",gap:6}}>
        <button disabled={locked} onClick={()=>setQty(pool,id,-1)} style={stepBtn(locked)}>−</button>
        <span style={{width:20,textAlign:"center",fontFamily:MONO,fontSize:12.5,color:locked?C.faint:C.text}}>{locked?"—":val}</span>
        <button disabled={locked} onClick={()=>setQty(pool,id,1)} style={stepBtn(locked)}>+</button>
      </div>);};
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:840,margin:"0 auto",paddingTop:16}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".22em",color:C.amber,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>🎒 LOADOUT — {g.gmode==="career"?"THIS SHIFT":"MEDICAL EDUCATION MODE"}</span>
        <button onClick={cancel} style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:6,color:C.faint,fontFamily:MONO,fontSize:11,padding:"5px 10px",cursor:"pointer"}}>← Cancel</button>
      </div>
      <div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.65}}>
        Choose what's loaded into each bag and what's kept in reserve on the truck. Every rig has a realistic
        cap — you cannot carry everything, and you cannot pack a drug or procedure above {LNAME(L)} scope
        (greyed out below — the same gate every action already respects mid-call). {g.gmode==="career"
          ?"This is locked in once you head to your first call of the shift; restocking between calls refills exactly this mix from the (unlimited) station, it doesn't let you repack the truck."
          :"With Limited Items on, this refreshes automatically every 5 calls."}
      </div>
      <button onClick={resetDefaults} className="px-3 py-1.5 rounded mt-3" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:11.5}}>Reset to defaults</button>
      {STOCK_CATEGORIES.map(cat=>{
        const items=Object.entries(STOCK_ITEMS).filter(([,d])=>d.cat===cat);
        if(!items.length) return null;
        const used=carriedUsed(draft.carried,cat), budget=categoryBudget(cat);
        return (<div key={cat} className="f2 mt-5">
          <div className="flex justify-between items-baseline">
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.dim}}>{CATEGORY_LABEL[cat].toUpperCase()} — CARRIED</div>
            <div style={{fontFamily:MONO,fontSize:10,color:used>=budget?C.red:C.faint}}>{used}/{budget} SLOTS</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {items.map(([id,def])=>{const locked=isLocked(id,L);
              return (<div key={id} className="flex justify-between items-center px-3 py-2 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,opacity:locked?.5:1}}>
                <span style={{fontSize:12.5}}>{def.label}{locked&&<span style={{fontFamily:MONO,fontSize:9.5,color:C.faint,marginLeft:6}}>{LNAME(def.lvl)}+</span>}</span>
                <Stepper pool="carried" id={id}/>
              </div>);})}
          </div>
        </div>);
      })}
      <div className="f2 mt-6">
        <div className="flex justify-between items-baseline">
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.dim}}>TRUCK RESERVE — NOT HAND-CARRIED</div>
          <div style={{fontFamily:MONO,fontSize:10,color:truckUsed(draft.truck)>=truckBudget()?C.red:C.faint}}>{truckUsed(draft.truck)}/{truckBudget()} SLOTS</div>
        </div>
        <div style={{fontSize:11,color:C.faint,marginTop:4,marginBottom:6,lineHeight:1.5}}>
          Backup supply left on the rig, not in any hand-carried bag. Mid-call, a crew member can run back and pull
          from this via "Fetch a bag from the truck" once every bag category is already on scene.</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(STOCK_ITEMS).map(([id,def])=>{const locked=isLocked(id,L);
            return (<div key={id} className="flex justify-between items-center px-3 py-2 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,opacity:locked?.5:1}}>
              <span style={{fontSize:11.5}}>{def.label}</span>
              <Stepper pool="truck" id={id}/>
            </div>);})}
        </div>
      </div>
      <button onClick={save} className="px-8 py-3 rounded mt-7" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>▲ Load the truck</button>
    </div></Shell>);
  }

  // Driving-mode rewrite: a MAJOR crash (DrivingScene.jsx's own onCrash —
  // a pedestrian or in-lane car hit above its speed threshold) is a real,
  // punishing event, not a speed penalty. Reuses the existing VN shell
  // (VNScene/VNHeader/VNBox/VNDialogue — the same machinery every campaign
  // beat already uses) for the "waking up in the hospital" beat, with a
  // real, transparent fault line built from signals captured at the
  // moment of impact (was the player over a safe speed, was it a
  // pedestrian). "Continue" reuses BackBtn's own {...blank(),...carry(s)}
  // reset shape (the unit is out of service, same structural outcome as
  // "Abandon call") but bakes in real reputation/fatigue penalties first —
  // a fault crash costs more reputation than an unavoidable one.
  if(g.phase==="crashWake"){
    const ci=g.crashInfo||{};
    const faultLine=ci.atFault
      ? (ci.obstacle==="pedestrian"
          ? "You hit a pedestrian. You were driving faster than was safe for the conditions — this one's on you."
          : `You were driving well over a safe speed (${ci.speed} m/s) when you hit another vehicle. This one's on you.`)
      : "The other vehicle pulled out without warning — you didn't have time to react. Not your fault, but the rig is out of service either way.";
    const lines=[
      {text:"Everything goes white, then black."},
      {text:"…"},
      {text:"You wake up in a hospital bed. Your head is pounding. Someone in scrubs is asking if you know what day it is."},
      {text:faultLine},
      {text:ci.siren?"Your lights and siren were on — the other driver should have seen you coming.":"Your lights and siren were off at the time."},
      {text:"Your rig is totaled. The call you were headed to went to another unit."},
    ];
    const cont=()=>setG(s=>{
      const atFault=s.crashInfo?.atFault;
      const repPenalty=atFault?15:5;
      const patched={...s,reputation:Math.max(0,(s.reputation||0)-repPenalty),
        fatigue:Math.min(100,(s.fatigue||0)+25)};
      return {...blank(),...carry(patched),phase:s.gmode==="career"?"station":"cat"};
    });
    return (<>
      <VNScene bg={BACKGROUNDS.stationExterior} dim>
        <VNHeader title="AMBULANCE CRASH"/>
        <VNBox label={ci.atFault?"AT FAULT":"NOT AT FAULT"}>
          <VNDialogue lines={lines} onDone={cont}/>
        </VNBox>
      </VNScene>
    </>);
  }

  if(g.phase==="response"||g.phase==="approach"){
    const app=g.phase==="approach"; const {drive,need}=travelTimes(g);
    // The real 3D drive-in (DrivingScene.jsx) runs for every mode now —
    // Sandbox, Career, Master of Your Scope, Zero-To-Hero, and co-op alike
    // — replacing what used to be two separate implementations (a 2D
    // top-down canvas minigame for solo play, a co-op-only 3D scene). In
    // co-op, one connected player is deterministically elected "driver"
    // (lowest client id) since co-op has no per-action authority model —
    // everyone else rides along, mirroring the driver's telemetry; solo
    // play is just the isDriver:true case with no coop-specific props.
    // Walking (Coop3DWalk.jsx, below) is unchanged and stays co-op-only —
    // see that file's own header for why.
    const coop3d=g.coop?.status==="connected";
    const coopPlayers=g.coop?.players||[];
    const coopDriverId=coopPlayers.map(p=>p.id).slice().sort()[0];
    const coopIsDriver=!coop3d||!coopDriverId||coopDriverId===g.coop?.myId;
    const coopDriverName=coopPlayers.find(p=>p.id===coopDriverId)?.name;
    // Real per-call data for Coop3DWalk's target/layout (map-expansion
    // batch, CLAUDE.md item 5) — the exact incident BUILDING dispatch drew,
    // reconstructed deterministically from the persisted dispatch seed
    // (g.locations.seed): dispatch itself only kept the bare node id in
    // g.locations.incident (see the dispatch handler's own comment), not
    // which specific building at that node was picked, so re-running the
    // SAME pickIncidentBuilding(rng) draw against the same seed reproduces
    // it exactly — the identical "seed once, reconstruct on demand" idiom
    // g.locations.seed already exists for. The building's own `offset`
    // (already authored in real meters, previously read only by CityMap.jsx
    // for icon placement) becomes the real walk-in TARGET, so distance
    // genuinely varies call to call instead of a fixed ~130m; nearby
    // buildings within 120m (excluding the incident itself) become the
    // LAYOUT, capped at 6 so a dense city block doesn't overload the scene.
    // locOnStreet scenarios (no specific building) and any reconstruction
    // failure fall through to null, and Coop3DWalk's own fallback constants
    // take over — a real, honest simplification, not a silent bug.
    const walkMapData=(app&&coop3d&&g.drivingModeEnabled!==false&&isTesterUnlocked()&&g.locations?.incident?.type==="node"&&!SC?.locOnStreet)?(()=>{
      const wmap=mapFor(g);
      const incidentBuilding=pickIncidentBuilding(wmap,SC,mulberry32(g.locations.seed??0));
      const node=incidentBuilding&&wmap.nodes.find(n=>n.id===incidentBuilding.node);
      if(!incidentBuilding||!node) return null;
      const off=incidentBuilding.offset||{dx:0,dy:0};
      const originX=node.x+off.dx, originY=node.y+off.dy;
      const nearby=wmap.buildings
        .filter(b=>b.id!==incidentBuilding.id)
        .map((b,i)=>{
          const n2=wmap.nodes.find(n=>n.id===b.node);
          if(!n2) return null;
          const o2=b.offset||{dx:0,dy:0};
          const relX=(n2.x+o2.dx)-originX, relY=(n2.y+o2.dy)-originY;
          const dist=Math.hypot(relX,relY);
          return {relX,relY,dist,i};
        })
        .filter(p=>p&&p.dist>3&&p.dist<120)
        .sort((a,b)=>a.dist-b.dist)
        .slice(0,6)
        .map((p,i)=>({x:p.relX,z:-p.relY,w:7+(i%3)*1.5,d:8+(i%2)*2,h:10+(i%4)*5}));
      return {target:{x:off.dx,z:-off.dy},layout:nearby};
    })():null;
    // Real per-call route for DrivingScene (map-expansion batch, CLAUDE.md
    // item 5) — the SAME shortestPath(station,incident) call scope.js's own
    // travelTimes() already makes (so the drive-in scene's visual route
    // never disagrees with the real timer driving the phase), resolved into
    // real world-space waypoints (mapGraph.js's pathToWaypoints). Fewer than
    // 2 waypoints (station and incident resolve to the same node — a real,
    // if rare, case) or missing g.locations falls through to null, and
    // DrivingScene's own fallback straight corridor takes over — the same
    // honest simplification Coop3DWalk's target/layout already uses.
    const driveRoute=(!app&&g.myVeh&&g.myVeh.type!=="none"&&!g.driveMiniDone&&g.locations?.station&&g.locations?.incident)?(()=>{
      const dmap=mapFor(g);
      const {path}=shortestPath(dmap,g.locations.station,g.locations.incident,g.weather||"clear");
      const wp=pathToWaypoints(dmap,path);
      return wp.length>=2?wp:null;
    })():null;
    // A real dispatch address/location line (map-expansion content pass) —
    // reconstructed from the persisted seed, same idiom as walkMapData
    // above; g.locations only exists once dispatch has actually happened,
    // so this reads as "Northwood Auto Shop" / "corner of 3rd Ave and Main
    // St" rather than nothing, the real payoff of maps.js's rich naming
    // data most of it had never reached the player before this batch.
    const addressLine=g.locations?describeIncidentLocation(mapFor(g),SC,g.locations.seed,g.locations.incident):null;
    return (<Shell g={g} setG={setG} css={css} lights={!app&&g.code===3}>
      <div className={app?"":"rock"} style={{maxWidth:620,margin:"0 auto",paddingTop:40}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".22em",color:app?C.amber:C.red}}>
              {app?"ON FOOT TO THE PATIENT":`RESPONDING · ${CODES[g.code].name.toUpperCase()}`}</div>
            {addressLine&&<div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginTop:3}}>Dispatched to {addressLine}</div>}
          </div>
          <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setG(s=>({...s,muted:!s.muted}))} title={g.muted?"Sound is off":"Sound is on"}
            style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:6,color:g.muted?C.faint:C.spo2,
              fontFamily:MONO,fontSize:11,padding:"5px 9px",cursor:"pointer",whiteSpace:"nowrap"}}>
            {g.muted?"🔇 sound off":"🔊 sound on"}</button>
          <button onClick={()=>{unlockSpeech();setG(s=>({...s,voice:!s.voice}));}} title={g.voice?"Voice is on":"Voice is off"}
            style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:6,color:g.voice?C.spo2:C.faint,
              fontFamily:MONO,fontSize:11,padding:"5px 9px",cursor:"pointer",whiteSpace:"nowrap"}}>
            {g.voice?"🗣️ voice on":"🗣️ voice off"}</button>
          <BackBtn toPhase={g.gmode==="career"?"station":"cat"} label="← Abandon call" reset confirmMsg={g.gmode==="career"?"Abandon this call and return to the station? Your progress on this patient will be lost.":"Abandon this call and return to scenario select? Your progress on this patient will be lost."} setG={setG}/>
          </div>
        </div>
        <div style={{height:3,background:C.line,marginTop:14,borderRadius:2}}>
          <div style={{height:"100%",width:`${Math.min(100,(g.t/need)*100)}%`,background:app?C.amber:C.red,borderRadius:2}}/></div>
        <div style={{fontFamily:MONO,fontSize:30,marginTop:20}}>{clk(need-g.t)}</div>
        {/* Real WASD 3D driving (DrivingScene.jsx) — a physics-based segment
            during a vehicle response, for every mode. A layperson/on-foot
            response has no vehicle to drive, so it's skipped entirely.
            Graded performance (avg speed maintained, collisions, curb hits)
            feeds g.speedBoost — a clean drive arrives composed (faster
            actions all call), a rough one arrives shaken. Runs until the
            real, map-derived travel time (drive, above) elapses and the
            tick loop moves the phase on — see the outer tick effect's own
            comment for why this component has no fixed run length.
            Tester-gated the same way Career/Co-op are (isTesterUnlocked())
            — a locked (public, non-tester) session never mounts this and
            falls straight to the plain 2D fallback below, same as
            driving-mode-off. */}
        {!app&&g.myVeh&&g.myVeh.type!=="none"&&!g.driveMiniDone&&g.drivingModeEnabled!==false&&isTesterUnlocked()&&
          <DrivingScene code={g.code} vehName={g.myVeh.name} vehType={g.myVeh.type} map={mapFor(g)} isDriver={coopIsDriver} driverName={coopDriverName}
            sharedDrive={g.coop3d?.drive} route={driveRoute} weather={g.weather} timeOfDay={g.timeOfDay}
            paused={!!(g.micnOpen||g.newUnit||g.loadOpen||g.settingsOpen||g.confirmDeath||g.achievementsOpen||g.relationshipsOpen||g.accessMinigame)}
            onBroadcast={coop3d?(snap)=>setG(s=>({...s,coop3d:{...s.coop3d,drive:snap}})):undefined}
            onFinish={(result)=>setG(s=>{
              const perf=Math.max(0,Math.min(1,result.score/100));
              const delta=(perf-0.5)*0.24-result.crashes*0.05-result.curbHits*0.01;
              const speedBoost=Math.max(0.5,Math.min(1.3,(s.speedBoost||1)-delta));
              const text=result.crashes>0
                ? `You clipped ${result.crashes>1?"a couple of obstacles":"something"} on the drive in — a little shaken, but rolling.`
                : result.score>=70 ? "Clean, confident driving the whole way in."
                : "You made it in — a little ragged, but you made it.";
              // driveArrivedAt: the REAL elapsed drive time (DrivingScene now
              // reports onFinish at real arrival, not on a fixed timer — see
              // the tick effect below, which now gates response->approach on
              // driveMiniDone instead of n.t>=drive). The approach phase's own
              // walk-in budget is recomputed from this real point rather than
              // the original pre-drive estimate.
              return {...s,driveMiniDone:1,driveArrivedAt:s.t,speedBoost,
                log:[...s.log,{t:s.t,kind:result.crashes>0?"crit":"good",text}]};
            })}
            onCrash={(info)=>setG(s=>({...s,phase:"crashWake",crashInfo:info}))}/>}
        {/* Co-op-only real first-person walk-in — see Coop3DWalk.jsx's own
            header. Solo/Career/Sandbox keep the plain approach screen below
            (free PPE/size-up buttons, no walking mechanic) untouched. Gated
            on the SAME g.drivingModeEnabled toggle DrivingScene uses (see
            SettingsOverlay's "DRIVING MODE" row) — a player on weaker
            hardware can turn off both real-time WebGL scenes and still play
            every mode, since neither one gates the underlying
            response/approach timing (App.jsx's tick loop). Off falls
            straight through to the same plain free-action buttons below.
            Also tester-gated (isTesterUnlocked()) — moot in practice since
            coop3d itself requires Co-op mode, already tester-gated at
            entry, but kept explicit for the same defense-in-depth reason
            walkMapData's own computation above is. */}
        {app&&coop3d&&g.drivingModeEnabled!==false&&isTesterUnlocked()&&
          <Coop3DWalk myId={g.coop?.myId} myName={g.coop?.name} peerCount={coopPlayers.length||1}
            sharedPositions={g.coop3d?.walk} destLabel={SC.dispatch?.[0]}
            target={walkMapData?.target} layout={walkMapData?.layout}
            paused={!!(g.micnOpen||g.newUnit||g.loadOpen||g.settingsOpen||g.confirmDeath||g.achievementsOpen||g.relationshipsOpen||g.accessMinigame)}
            onBroadcast={(pos)=>setG(s=>({...s,coop3d:{...s.coop3d,walk:{...(s.coop3d?.walk||{}),[s.coop?.myId]:pos}}}))}
            onArrive={()=>setG(s=>({...s,log:s.log.some(l=>l.text==="On scene — the crew has made it in on foot.")?s.log
              :[...s.log,{t:s.t,kind:"good",text:"On scene — the crew has made it in on foot."}]}))}/>}
        {/* F7: PPE and scene size-up are genuinely free time here — the walk
            in (or, for a crewed rig, the ride) is dead time the game
            otherwise wastes. Setting the SAME done-flags the in-scene general
            actions use means they simply won't be re-offered once the clock
            starts — this isn't a second copy of those actions, it's the same
            one-time state seeded early. */}
        {!g.ppe&&<button onClick={()=>setG(s=>({...s,ppe:1,done:{...s.done,ppe:{at:s.t}},
            log:[...s.log,{t:s.t,kind:"obs",text:app?"Gloved and eye-protected on the walk in.":"Gloved and eye-protected en route."}]}))}
          className="text-left px-4 py-2.5 rounded w-full mt-5" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:13}}>
          Don PPE — gloves, eye protection<div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>Free right now — you're not on scene yet.</div></button>}
        {app&&!g.sizedUp&&<button onClick={()=>setG(s=>({...s,sizedUp:1,done:{...s.done,sizeup:{at:s.t}},
            // F18: read the same source as the in-scene "Scene size-up" action
            // (SC.impression) instead of a short generic inline string, so the
            // free walk-in glimpse actually describes what the scene looks like.
            log:[...s.log,{t:s.t,kind:SC.hazard?"crit":"obs",text:SC.hazard?`SCENE (as you approach): ${SC.hazard} ${SC.impression}`:SC.impression}],
            findings:[...s.findings,"Scene size-up complete."],
            evidence:SC.hazard?[...s.evidence,`Scene hazard identified — ${SC.hazard}`]:s.evidence}))}
          className="text-left px-4 py-2.5 rounded w-full mt-2" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:13}}>
          Scene size-up<div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>Look it over before you're committed to it.</div></button>}
        {!app&&(<div className="p-4 rounded mt-6" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.spo2,marginBottom:10}}>DISPATCH — UPDATE</div>
          {SC.update.map((u,i)=><div key={i} style={{fontSize:14,lineHeight:1.75}}>— {u}</div>)}</div>)}
        {!app&&g.sceneUnits&&g.sceneUnits.length>0&&(<div className="p-4 rounded mt-5" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.amber,marginBottom:4}}>RESPONDING UNITS — PLAN THE SCENE</div>
          <div style={{fontSize:11.5,color:C.dim,marginBottom:10,lineHeight:1.6}}>
            Give a unit a job now and they start it the instant they arrive. One task per unit — pick within their scope.</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {g.sceneUnits.map(u=>{const tl=topLevel(u),avail=TASKS.filter(t=>t.lvl<=tl);
              return (<div key={u.id} style={{borderTop:`1px solid ${C.line}`,paddingTop:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                  <span style={{fontSize:13,fontWeight:600}}>{u.name}</span>
                  <span style={{fontFamily:MONO,fontSize:11,color:C.spo2}}>ETA {clk(Math.max(0,u.eta-g.t))}</span></div>
                <div style={{fontFamily:MONO,fontSize:10,color:C.faint,marginTop:2}}>
                  {u.label} · {u.personnel.map(p=>p.pilot?"Pilot":LEVELS[p.level].name).join(", ")}{u.solo?" · arrives alone":""}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
                  {avail.slice(0,7).map(t=>{const on=g.planned[u.id]===t.id;
                    return (<button key={t.id} onClick={()=>setG(s=>({...s,planned:{...s.planned,[u.id]:on?null:t.id}}))}
                      style={{background:on?"#16241C":"transparent",border:`1px solid ${on?C.hr:C.line}`,color:on?C.hr:C.dim,
                        fontFamily:MONO,fontSize:10,padding:"3px 7px",borderRadius:5,cursor:"pointer"}}>{t.name}</button>);})}
                </div>
              </div>);})}
          </div></div>)}
        {!app&&<button onClick={()=>setG(s=>({...s,t:drive}))} className="px-5 py-2 rounded mt-5"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:12}}>▶▶ Skip to arrival</button>}
      </div></Shell>);
  }

  /* ═══ LOAD THE TRUCK ═══ */
  if(g.loadOpen){
    const myAmb=g.myVeh&&g.myVeh.transport;
    const candidates=g.sceneUnits.filter(u=>u.arrived&&u.vehicle&&u.vehicle.transport);
    const amb=myAmb?null:(g.transportUnitId?candidates.find(u=>u.id===g.transportUnitId):(candidates.length===1?candidates[0]:null));
    const waiting=!myAmb&&candidates.length===0;
    const choosing=!myAmb&&!waiting&&!amb;
    const pool=g.crew;
    const find=(id)=>pool.find(p=>p.id===id);
    const driver=find(g.loadDriver);
    const riders=g.loadRiders.map(find).filter(Boolean);
    const leftBehind=pool.filter(p=>p.id!==g.loadDriver&&!g.loadRiders.includes(p.id));
    const vehName=myAmb?g.myVeh.name:(amb?`${amb.name} · ${amb.vehicle.type.toUpperCase()}`:"—");
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:600,margin:"0 auto",paddingTop:60}}>
      <div className="f1 p-6 rounded" style={{background:C.panel,border:`1px solid ${(waiting||choosing)?C.amber:C.hr}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:(waiting||choosing)?C.amber:C.hr,marginBottom:12}}>LOAD THE TRUCK</div>
        {waiting?<>
          <div style={{fontSize:15,fontWeight:600,color:C.amber}}>Your rig can't transport — you're waiting on an ambulance.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            Hold on scene. The moment a transport-capable unit is here, you'll be able to choose it to carry your patient.</div>
          <div style={{marginTop:12}}>{g.sceneUnits.filter(u=>u.vehicle&&u.vehicle.transport).map(u=>(
            <div key={u.id} style={{fontFamily:MONO,fontSize:11,color:u.arrived?C.hr:C.spo2,marginTop:2}}>
              {u.name} — {u.arrived?"ON SCENE":`ETA ${clk(Math.max(0,u.eta-g.t))}`}</div>))}
            {g.sceneUnits.filter(u=>u.vehicle&&u.vehicle.transport).length===0&&<div style={{fontSize:12,color:C.red}}>No transport unit is responding to this call.</div>}</div>
        </>:choosing?<>
          <div style={{fontSize:15,fontWeight:600,color:C.amber}}>Your rig can't transport — pick which unit takes the patient.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            Multiple transport-capable units are on scene. Choose one — the rest stay available.</div>
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
            {candidates.map(u=>(<button key={u.id} onClick={()=>chooseTransportUnit(u.id)}
              className="text-left px-4 py-3 rounded" style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.text,fontSize:13}}>
              {u.name} <span style={{fontFamily:MONO,fontSize:10,color:C.dim}}>· {u.vehicle.type.toUpperCase()}</span>
              <div style={{fontFamily:MONO,fontSize:10,color:C.faint,marginTop:2}}>
                {u.personnel.map(p=>p.pilot?"Pilot":LEVELS[p.level].name).join(", ")}</div></button>))}
          </div>
        </>:<>
          <div style={{fontSize:15,fontWeight:600}}>{vehName}</div>
          <div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:4}}>Lowest level drives. Highest level, plus up to one more, rides in back with you.</div>
          <div style={{marginTop:14}}>
            <div style={{fontFamily:MONO,fontSize:10,color:C.spo2,letterSpacing:".14em"}}>DRIVER</div>
            <div style={{fontSize:13,marginTop:3}}>{driver?`${driver.name} — ${driver.pilot?"Pilot":LEVELS[driver.level].name}${driver.student?" (student)":""}`:"You — no crew to drive, took the wheel yourself"}</div>
          </div>
          <div style={{marginTop:14}}>
            <div style={{fontFamily:MONO,fontSize:10,color:C.spo2,letterSpacing:".14em"}}>IN THE BACK WITH YOU</div>
            {riders.length===0&&<div style={{fontSize:12,color:C.faint,marginTop:5}}>Just you and the patient.</div>}
            {riders.map(r=>(<div key={r.id} style={{fontSize:13,marginTop:3}}>{r.name} — {LEVELS[r.level].name}{r.student?" (student)":""}</div>))}
          </div>
          {leftBehind.length>0&&<div style={{marginTop:14}}>
            <div style={{fontFamily:MONO,fontSize:10,color:C.amber,letterSpacing:".14em"}}>STAYING ON SCENE</div>
            {leftBehind.map(p=>(<div key={p.id} style={{fontSize:12,color:C.dim,marginTop:2}}>{p.name} — {LEVELS[p.level].name}</div>))}
          </div>}
          <div style={{marginTop:14}}>
            <div style={{fontFamily:MONO,fontSize:10,color:C.spo2,letterSpacing:".14em"}}>DESTINATION</div>
            {g.mode==="rural"&&<div style={{fontSize:11,color:C.amber,marginTop:4}}>Rural — thin coverage, long roads. Every option below is further out than it would be in town.</div>}
            <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
              {HOSPITAL_ORDER.map(k=>{const h=HOSPITAL_TYPES[k],mins=Math.round(effTransportTime(SC,k,g)/60);
                // Resolve the REAL building this option commits to, same call
                // the click below makes — so the player sees which actual
                // hospital (and its real designation, if any) they're
                // picking, not just the generic archetype tag.
                const map=mapFor(g);
                const resolved=g.locations?.incident&&chooseDestination(map,g.locations.incident,k==="community"?null:k,g.weather||"clear");
                const label=resolved&&designationLabel(resolved);
                return (<button key={k} onClick={()=>setG(s=>{
                  // Real destination RoutingPoint, so effTransportTime's
                  // remaining-time math (below, the "rem" calc) and a future
                  // CityMap destination marker both read the ACTUAL chosen
                  // hospital, not just its archetype label.
                  const map=mapFor(s);
                  const dest=s.locations?.incident&&chooseDestination(map,s.locations.incident,k==="community"?null:k,s.weather||"clear");
                  return {...s,destHospitalType:k,
                    locations:dest?{...s.locations,destination:{type:"node",nodeId:dest.node}}:s.locations};
                })}
                  className="text-left px-4 py-3 rounded" style={{background:g.destHospitalType===k?"#16241C":"#12100E",
                    border:`1px solid ${g.destHospitalType===k?C.hr:C.line}`,color:C.text,fontSize:13}}>
                  <div className="flex justify-between" style={{display:"flex",justifyContent:"space-between"}}>
                    <span>{h.name}</span><span style={{fontFamily:MONO,fontSize:11,color:C.dim}}>~{mins} min</span></div>
                  <div style={{fontFamily:MONO,fontSize:10,color:C.faint,marginTop:2}}>{h.tag}</div>
                  {resolved&&<div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>
                    → {resolved.name}{label?` · ${label}`:""}</div>}</button>);})}
            </div>
          </div>
          <button onClick={depart} disabled={!g.destHospitalType} className="px-6 py-3 rounded mt-5"
            style={{background:g.destHospitalType?"#16241C":"#12100E",border:`1px solid ${g.destHospitalType?C.hr:C.line}`,
              color:g.destHospitalType?C.hr:C.faint,fontSize:14,cursor:g.destHospitalType?"pointer":"not-allowed"}}>
            {g.destHospitalType?"▲ Doors shut — transport":"Pick a destination first"}</button>
        </>}
        <button onClick={()=>setG(s=>({...s,loadOpen:0,transportUnitId:null}))} className="px-4 py-2 rounded mt-3"
          style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:12,marginLeft:10}}>Back to scene</button>
      </div></div></Shell>);
  }

  /* ═══ ARRIVED — PROVIDER IMPRESSION, DECIDED AT THE DOORS ═══ */
  /* ═══ VERBAL HANDOFF (F22) — a typed IMIST-AMBO-style report at the exact
     transfer-of-care moment, graded against g.evidence — the same findings
     the call itself already collected, per this queue item's own suggested
     approach ("the scoring rubric can read straight off g.evidence/probe
     results already collected during the call"). Skipped for AMA refusals
     (there's no receiving team to hand off to) and for scenarios with no
     imps (content-only calls like doa/prankCall have nothing to hand off).
     Deliberately a keyword-coverage score, not a fixed answer key — a
     report is "complete" if it actually mentions the findings you gathered,
     not if it matches pre-written text. Shown once per call
     (g.handoffDone, transient — resets every new call like g.evidence). ═══ */
  if(g.phase==="arrived"&&!g.ama&&!g.handoffDone&&SC.imps?.length){
    const gradeHandoff=(text)=>{
      const t=(text||"").toLowerCase();
      const evid=g.evidence||[];
      const covered=evid.filter(e=>{
        const words=e.toLowerCase().split(/[^a-z0-9%.]+/).filter(w=>w.length>3);
        return words.length>0&&words.some(w=>t.includes(w));
      });
      const pct=evid.length?Math.round(100*covered.length/evid.length):100;
      return {pct,covered,missed:evid.filter(e=>!covered.includes(e))};
    };
    const submit=()=>setG(s=>{const grade=gradeHandoff(s.handoffText||"");
      return {...s,handoffDone:1,handoffGrade:grade,
        log:[...s.log,{t:s.t,kind:"obs",text:`Verbal handoff given — ${grade.pct}% of gathered findings mentioned.`}]};});
    const grade=g.handoffGrade;
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:600,margin:"0 auto",paddingTop:60}}>
      <div className="p-6 rounded" style={{background:C.panel,border:`1px solid ${C.spo2}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:C.spo2,marginBottom:8}}>VERBAL HANDOFF — GIVE YOUR REPORT</div>
        <div style={{fontSize:13,color:C.dim,marginBottom:14,lineHeight:1.7}}>
          The doors are opening. Give a real IMIST-AMBO-style report — Identification, Mechanism/complaint, Injuries/
          Information, Signs, Treatment, Allergies, Medications, Background, Other — in your own words. This is graded
          on whether you actually MENTION what you found, not on hitting exact phrasing.</div>
        {!grade
          ? <>
              <textarea value={g.handoffText||""} onChange={(e)=>setG(s=>({...s,handoffText:e.target.value}))}
                placeholder="e.g. 45-year-old male, chest pain onset 20 minutes ago, BP 88/54, HR 118, given aspirin and nitro..."
                rows={5} className="w-full px-3 py-2 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:13,resize:"vertical"}}/>
              <div className="flex gap-2 mt-3">
                <button onClick={submit} className="px-5 py-2.5 rounded"
                  style={{background:"#0F2A1E",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Give report</button>
                <button onClick={()=>setG(s=>({...s,handoffDone:1,handoffGrade:{pct:0,covered:[],missed:g.evidence||[]}}))}
                  className="px-5 py-2.5 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.faint,fontSize:12.5}}>
                  Skip — hand off silently</button>
              </div>
            </>
          : <>
              <div style={{fontSize:15,fontWeight:600,color:grade.pct>=70?C.hr:grade.pct>=40?C.amber:C.red}}>
                {grade.pct}% of gathered findings mentioned.</div>
              {grade.missed.length>0&&<div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.7}}>
                Not mentioned: {grade.missed.join("; ")}</div>}
              <button onClick={()=>setG(s=>({...s,phase:"arrived"}))} className="px-6 py-3 rounded mt-5"
                style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:14}}>
                Continue to provider impression</button>
            </>}
      </div></div></Shell>);
  }

  if(g.phase==="arrived"){
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:600,margin:"0 auto",paddingTop:60}}>
      <div className="p-6 rounded" style={{background:"#1A1013",border:`1px solid ${C.red}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:C.red,marginBottom:8}}>
          {g.ama?"REFUSAL DOCUMENTED — PROVIDER IMPRESSION":"WHEELS DOWN — PROVIDER IMPRESSION"}</div>
        <div style={{fontSize:13,color:C.dim,marginBottom:14,lineHeight:1.7}}>
          {g.ama
            ?"The refusal is signed and this call is closed. Declare what you think this was anyway — it goes on the paperwork, and it's what you'll have to defend if this patient calls back worse."
            :"The doors are about to open. Declare what you think this is — it decides the destination and what you will have to defend on the report you are about to give."}
          {!g.ama&&g.receivingTeam&&<span style={{display:"block",marginTop:6,color:C.faint,fontSize:11.5}}>
            Receiving: {[g.receivingTeam.doc.name,g.receivingTeam.nurse.name,g.receivingTeam.rt?.name,g.receivingTeam.tech?.name].filter(Boolean).join(" · ")}</span>}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {SC.imps.map(k=>(<button key={k} disabled={L===0} onClick={()=>pickImpression(k)} className="text-left px-3 py-2 rounded"
            style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13,opacity:L===0?.4:1}}>
            <div className="flex justify-between"><span>▲ {PI[k].n}</span>
              {PI[k].base?<span style={{fontFamily:MONO,fontSize:9,color:C.faint}}>BASE</span>:null}</div>
            {PI[k].hint&&<div style={{fontSize:10,color:C.dim,marginTop:2}}>{PI[k].hint}</div>}</button>))}
        </div>
      </div></div></Shell>);
  }

  /* ═══ NEW UNIT ═══ */
  if(g.newUnit){const {unit:u}=g.newUnit; const iCommand=L>=g.commandLevel; const boss=g.commander;
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:560,margin:"0 auto",paddingTop:100}}>
      <div className="f1 p-6 rounded" style={{background:C.panel,border:`1px solid ${iCommand?C.hr:C.amber}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:iCommand?C.hr:C.amber,marginBottom:12}}>UNIT ON SCENE</div>
        <div style={{fontSize:20,fontWeight:600}}>{u.name}</div>
        <div style={{fontSize:13,color:C.dim,marginTop:6,lineHeight:1.7}}>
          {u.label} — {u.personnel.map(p=>p.pilot?"Pilot":LEVELS[p.level].name).join(", ")}.
          {u.solo?" They arrived alone.":""}</div>
        <div style={{fontSize:13.5,color:C.text,marginTop:14,lineHeight:1.7}}>
          {iCommand
            ? "They are looking at you. You are the medical commander — they do what you tell them, within their licence."
            : `${boss?.name} outranks you and has assumed medical command. Until control returns, you carry out the order.`}
        </div>
        {!iCommand&&g.forcedTask&&<div className="mt-3 p-3 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`}}>
          <div style={{fontFamily:MONO,fontSize:10,color:C.amber,letterSpacing:".14em"}}>ORDER</div>
          <div style={{fontSize:14,marginTop:3}}>"{g.forcedTask.label}"</div></div>}
        <button onClick={()=>setG(s=>({...s,newUnit:null,panel:"crew"}))} className="px-6 py-3 rounded mt-6"
          style={{background:iCommand?"#16241C":"#1A1510",border:`1px solid ${iCommand?C.hr:C.amber}`,color:iCommand?C.hr:C.amber,fontSize:14}}>
          {iCommand?"Take command":"Acknowledge order"}</button>
      </div></div></Shell>);
  }

  /* ═══ MICN ═══ */
  if(g.micnOpen&&SC.micn){const M=SC.micn(g,physio(g));
    const hasK=(k)=>g.evidence.some(e=>e.toLowerCase().includes(k.toLowerCase()));
    const can=M.refuteKeys.some(hasK);
    const ans=(k)=>setG(s=>{let n={...s,micnOpen:0,base:1};
      if(k==="a"){const t=M.onAccept(n);n.log=[...n.log,{t:n.t,kind:"disp",text:M.order},{t:n.t,kind:M.correct?"good":"crit",text:t}];}
      else if(k==="q"){n.micnOpen=1;n.log=[...n.log,{t:n.t,kind:"disp",text:M.onQuestion}];}
      else{if(can){n.refused=1;n.log=[...n.log,{t:n.t,kind:"good",text:M.onRefuseYes}];
          n.evidence=[...n.evidence,"Refused a physician's order — with a documented finding — and was correct."];}
        else{n.log=[...n.log,{t:n.t,kind:"crit",text:M.onRefuseNo}];n.micnOpen=1;}}
      return n;});
    // Recurring Medical Director — the same named physician for the whole
    // save, not a fresh anonymous voice every call (see genHospitalStaff).
    const md=g.hospitalStaff?.medicalDirector;
    const mdPr=PRONOUN_SETS[md?.pronouns]||PRONOUN_SETS.she;
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:700,margin:"0 auto",paddingTop:30}}>
      <div className="f1 p-6 rounded" style={{background:C.panel,border:`1px solid ${C.spo2}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:C.spo2,marginBottom:14}}>BASE HOSPITAL — {md?.name||"MICN"}</div>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,lineHeight:1.9,marginBottom:16,borderLeft:`2px solid ${C.line}`,paddingLeft:12}}>
          <div>WHAT YOU GAVE {mdPr.obj.toUpperCase()}</div>
          <div style={{color:C.text}}>{PI[g.pi]?.n||"no impression declared"}</div>
          {["HR","BP (R)","BP (L)","SpO₂","RR"].map(k=>(<div key={k}>{k}: {g.vitals[k]
            ?<span style={{color:C.text}}>{g.vitals[k].value}</span>:<span style={{color:C.red}}>not obtained</span>}</div>))}
        </div>
        <div style={{fontSize:15.5,lineHeight:1.75}}>{M.order}</div>
        <div className="flex flex-col gap-2 mt-6">
          <button onClick={()=>ans("a")} className="text-left px-4 py-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:14}}>
            <b>Accept.</b> <span style={{color:C.dim,fontSize:12.5}}>"Copy, base."</span></button>
          <button onClick={()=>ans("q")} className="text-left px-4 py-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:14}}>
            <b>Question it.</b> <span style={{color:C.dim,fontSize:12.5}}>"Doc — can we talk about that?"</span></button>
          <button onClick={()=>ans("r")} className="text-left px-4 py-3 rounded"
            style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:14}}>
            <b>Refuse, and cite your finding.</b>
            <div style={{fontSize:12,color:can?C.hr:C.faint,marginTop:4,fontFamily:MONO}}>
              {can?"YOU HAVE SOMETHING TO REFUSE WITH":"YOU HAVE NOTHING TO REFUSE WITH"}</div></button>
        </div>
        <div style={{fontSize:11.5,color:C.faint,marginTop:16,lineHeight:1.6}}>
          {mdPr.Subj} {mdPr.is} working from the report you gave {mdPr.obj}. {mdPr.Subj} cannot see the patient. {mdPr.Subj} {mdPr.is} not infallible.
          And the patient does not become {mdPr.possPron} when {mdPr.subj} speaks.
        </div></div></div></Shell>);
  }

  /* ═══ DEBRIEF ═══ */
  if(g.phase==="debrief"){const o=g.outcome, lucky=!o.died&&g.evidence.length<2;
    const ROWS=["HR","BP (R)","BP (L)","SpO₂","RR","EtCO₂","Glu"];
    const gaps=ROWS.filter(k=>!g.vitals[k]);
    // End-of-call diagnosis-guessing game ("Medicdle"). truthKeys is [] for
    // the content-only scenarios (doa/prankCall/benignFaint/minorSprain/
    // chronicBackPain) that declare no `condition:` — the game simply never
    // appears for those, per groundTruthConditions' own contract.
    const truthKeys=groundTruthConditions(SC);
    const mdGuesses=g.mdGuesses||[], mdSolved=g.mdSolved||[];
    const mdSolvedSet=new Set(mdSolved);
    const mdDone=truthKeys.length===0||!!g.mdSkipped||mdSolvedSet.size>=truthKeys.length||mdGuesses.length>=6;
    const ddUnsolved=truthKeys.filter(k=>!mdSolvedSet.has(k));
    const ddWrongCount=mdGuesses.filter(x=>!x.correct).length;
    const mdHintQueue=(()=>{const lists=ddUnsolved.map(k=>CONDITION_INFO[k].hints);
      const max=Math.max(0,...lists.map(l=>l.length)); const q=[];
      for(let i=0;i<max;i++) lists.forEach(l=>{if(l[i]) q.push(l[i]);}); return q;})();
    const mdShownHints=mdHintQueue.slice(0,ddWrongCount);
    const submitDdGuess=(textArg)=>{const text=(textArg??mdInput).trim(); if(!text||mdDone) return;
      const hit=ddUnsolved.find(k=>matchesCondition(text,k));
      setG(s=>({...s,mdGuesses:[...(s.mdGuesses||[]),{text,correct:!!hit}],
        mdSolved:hit?[...(s.mdSolved||[]),hit]:(s.mdSolved||[])}));
      setmdInput("");};
    // Type-ahead over every condition the engine actually implements
    // (CONDITION_INFO's own key list — not just truthKeys, since the whole
    // point of the game is picking the right one out of the full library
    // without being told which conditions are even in play). Scroll, don't
    // scan: sorted alphabetically, filtered against both the name and its
    // aliases so an abbreviation like "mi" or "svt" still surfaces the entry.
    const mdAllKeys=Object.keys(CONDITION_INFO).sort((a,b)=>CONDITION_INFO[a].name.localeCompare(CONDITION_INFO[b].name));
    const mdQuery=mdInput.trim().toLowerCase();
    const mdMatches=mdQuery.length===0?[]:mdAllKeys.filter(k=>{const info=CONDITION_INFO[k];
      return info.name.toLowerCase().includes(mdQuery)||info.aliases.some(a=>a.toLowerCase().includes(mdQuery));}).slice(0,12);
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:820,margin:"0 auto",paddingTop:16}}>
      {(<div className="f1 p-5 rounded mb-4" style={{background:C.panel,border:`1px solid ${C.line}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".2em",color:C.spo2,marginBottom:12}}>RADIO REPORT, AS DELIVERED</div>
        <div style={{fontFamily:MONO,fontSize:12,lineHeight:1.95}}>
          <div><span style={{color:C.dim}}>UNIT</span>  Medic 12 · {LEVELS[g.level].name}{g.roster.length?` + ${g.roster.length} crew`:" · solo"}</div>
          <div><span style={{color:C.dim}}>PATIENT</span>  {SC.title}</div>
          <div><span style={{color:C.dim}}>IMPRESSION</span>  {g.pi?PI[g.pi].n:<span style={{color:C.red}}>NONE DECLARED</span>}</div>
          <div style={{marginTop:8,color:C.dim}}>VITALS</div>
          {ROWS.map(k=>{const v=g.vitals[k],st=v&&g.t-v.at>STALE;
            return (<div key={k} style={{paddingLeft:14}}>
              <span style={{color:C.dim,display:"inline-block",width:72}}>{k}</span>
              {v?<><span style={{color:st?C.dim:C.text}}>{v.value}</span>
                {/* v.at/d.at below are ABSOLUTE g.t timestamps (since
                    dispatch); the on-scene clock elsewhere on screen reads
                    elapsed time since arrival (g.t-g.onSceneAt) -- subtract
                    the same offset here so this readout agrees with it,
                    same fix as the DONE panel's own clk(r.at) below. */}
                <span style={{color:st?C.amber:C.faint,fontSize:10}}> {st?`⚠ STALE, ${clk(g.t-v.at)} OLD`:`(${clk(v.at-(g.onSceneAt??0))})`}</span></>
                :<span style={{color:C.red}}>NEVER OBTAINED ⚠</span>}</div>);})}
          {g.doses.length>0&&<><div style={{marginTop:8,color:C.dim}}>GIVEN</div>
            {g.doses.map((d,i)=>{const s2=DRUGS[d.id]||PROCS[d.id];
              return <div key={i} style={{paddingLeft:14}}><span style={{color:C.faint}}>{clk(d.at-(g.onSceneAt??0))}</span> {s2?.name||d.id}</div>;})}</>}
          <div style={{marginTop:8}}><span style={{color:C.dim}}>BASE</span>  <span style={{color:g.base?C.hr:C.red}}>{g.base?"CONTACTED":"NOT CONTACTED"}</span></div>
        </div>
        {gaps.length>0&&<div style={{fontSize:12.5,color:C.amber,marginTop:14,lineHeight:1.7,borderTop:`1px solid ${C.line}`,paddingTop:12}}>
          You told the receiving physician "I don't have one" {gaps.length} {gaps.length===1?"time":"times"}.
          Every blank is a question you chose not to answer.</div>}
      </div>)}
      {!mdDone&&<div className="f1 p-6 rounded" style={{background:C.panel,border:`1px solid ${C.spo2}`}}>
        <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".2em",color:C.spo2}}>GUESS THE DIAGNOSIS</div>
        <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.6}}>
          This patient had {truthKeys.length} condition{truthKeys.length>1?"s":""} to find.
          {" "}{Math.max(0,6-mdGuesses.length)} guess{6-mdGuesses.length===1?"":"es"} left.</div>
        {mdSolved.length>0&&<div style={{marginTop:12}}>
          {mdSolved.map(k=>(<div key={k} style={{fontSize:14,color:C.hr}}>✓ {CONDITION_INFO[k].name}</div>))}</div>}
        {mdShownHints.length>0&&<div className="mt-4 pt-4" style={{borderTop:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:9.5,letterSpacing:".14em",color:C.amber,marginBottom:6}}>HINTS</div>
          {mdShownHints.map((h,i)=>(<div key={i} style={{fontSize:12.5,color:C.dim,marginTop:4,lineHeight:1.6}}>· {h}</div>))}</div>}
        {mdGuesses.length>0&&<div className="mt-4 pt-4" style={{borderTop:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:9.5,letterSpacing:".14em",color:C.faint,marginBottom:6}}>PAST GUESSES</div>
          {mdGuesses.map((x,i)=>(<div key={i} style={{fontSize:12,color:x.correct?C.hr:C.red}}>{x.correct?"✓":"✗"} {x.text}</div>))}</div>}
        <div className="flex gap-2 mt-5">
          <input value={mdInput} onChange={e=>setmdInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter") submitDdGuess();}}
            placeholder="Start typing a condition..." className="px-3 py-2 rounded flex-1"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:13}}/>
          <button onClick={()=>submitDdGuess()} className="px-4 py-2 rounded"
            style={{background:"#0F2A1E",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Guess</button>
        </div>
        {mdMatches.length>0&&<div className="mt-2 rounded" style={{maxHeight:200,overflowY:"auto",
            background:C.panelHi,border:`1px solid ${C.line}`}}>
          {mdMatches.map(k=>{const already=mdSolvedSet.has(k);
            return (<button key={k} disabled={already} onClick={()=>submitDdGuess(CONDITION_INFO[k].name)}
              className="text-left w-full px-3 py-2" style={{display:"block",background:"transparent",border:"none",
                borderBottom:`1px solid ${C.line}`,color:already?C.faint:C.text,fontSize:12.5,
                cursor:already?"default":"pointer"}}>
              {already?"✓ ":""}{CONDITION_INFO[k].name}</button>);})}
        </div>}
        <button onClick={()=>setG(s=>({...s,mdSkipped:1}))} className="mt-3 block"
          style={{background:"transparent",border:"none",color:C.faint,fontSize:11.5,textDecoration:"underline",cursor:"pointer"}}>
          Skip — just show me</button>
      </div>}
      {mdDone&&(()=>{
        // F22 follow-up: finer-grained outcome bands than a binary died/
        // survived, per the feedback notes' own ask ("survived but with a
        // preventable deficit"). Deliberately reads ONLY state the debrief
        // already has — o.died, `lucky` (survived on <2 pieces of gathered
        // evidence, already computed above), and o.notes (each scenario's
        // own resolve() already populates this with protocol-deviation
        // notes when something wasn't done right) — no new engine field is
        // read, per this queue item's own explicit constraint.
        const hasComplication=!o.died&&!lucky&&o.notes.length>0;
        const band=o.died?{label:"PATIENT DIED",color:C.red}
          :lucky?{label:"SURVIVED — BUT UNEARNED",color:C.amber}
          :hasComplication?{label:"SURVIVED — WITH A DEFICIT",color:C.amber}
          :{label:"PATIENT SURVIVED",color:C.hr};
        return (<div className="f1 p-6 rounded" style={{background:C.panel,border:`1px solid ${band.color}`}}>
        <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".2em",color:band.color}}>
          {band.label}</div>
        {hasComplication&&<div style={{fontSize:12.5,color:C.dim,marginTop:6,lineHeight:1.6}}>
          The patient lived, but something in how you got there is worth a second look — see PROTOCOL below.</div>}
        <div style={{fontSize:22,fontWeight:600,marginTop:12}}>It was {o.truth.toLowerCase()}.</div>
        {truthKeys.length>0&&!g.mdSkipped&&<div style={{fontFamily:MONO,fontSize:11,color:C.spo2,marginTop:6}}>
          Diagnosis game: {mdSolvedSet.size}/{truthKeys.length} correct in {mdGuesses.length} guess{mdGuesses.length===1?"":"es"}.</div>}
        {o.arrest&&<div className="mt-4 p-4 rounded" style={{background:"#1A1013",border:`1px solid ${C.red}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.red,marginBottom:8}}>THE CASCADE</div>
          <div style={{fontSize:13.5,lineHeight:1.75,whiteSpace:"pre-line"}}>{o.arrest.story}</div></div>}
        {o.cause&&<div style={{fontSize:15,lineHeight:1.75,marginTop:14,whiteSpace:"pre-line"}}>{o.cause}</div>}
        {<div className="mt-6 pt-5" style={{borderTop:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.dim,marginBottom:10}}>DID YOU HAVE A REASON?</div>
          {g.evidence.length===0
            ?<div style={{fontSize:14,color:C.red,lineHeight:1.65}}>None. You acted having found nothing that distinguished one thing from another.
              {lucky&&" You were right anyway. That is worse than being wrong."}</div>
            :<>{g.evidence.map((e,i)=><div key={i} style={{fontSize:14,lineHeight:1.7}}>· {e}</div>)}
              {lucky&&<div style={{fontSize:14,color:C.amber,marginTop:10}}>Thin. You were right. You did not earn it.</div>}</>}
        </div>}
        {o.notes.length>0&&<div className="mt-5 pt-5" style={{borderTop:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.violet,marginBottom:10}}>PROTOCOL</div>
          {o.notes.map((n,i)=><div key={i} style={{fontSize:13,lineHeight:1.75,marginBottom:10}}>· {n}</div>)}
        </div>}
        {/* F44: THE CHART — a real, distinct panel reading outcomeReport()'s
            own OBJECTIVE physiological findings (queue item 48's kidney
            reversibility work, queue item 18's troponin, the neuro/ROSC/
            downtime trajectory, death-mechanism treatability), separate from
            g.outcome above (the player's own self-graded call summary).
            Every value here is read straight from g.physioOutcome — nothing
            invented. Renders nothing at all if there's no arrest, no
            structural finding, and no positive troponin to report (the
            common, uncomplicated case), rather than an empty box. */}
        {g.physioOutcome&&(()=>{const po=g.physioOutcome;
          const neuroColor={intact:C.hr,mild:C.amber,severe:C.red,brainDead:C.red}[po.neuroOutcome]||C.dim;
          const neuroLabel={
            intact:"neurologically intact — no lasting brain injury from the arrest",
            mild:"mild neurological injury from the arrest — some deficit likely, but most patients in this range recover meaningfully",
            severe:"severe neurological injury from the arrest — significant, probably permanent impairment",
            brainDead:"brain death — no cerebral function returned after the arrest",
          }[po.neuroOutcome];
          const tropLabel=po.troponin==="positive (subendocardial)"
            ?"Troponin came back positive at the hospital — a bounded, subendocardial injury."
            :po.troponin==="positive (transmural)"
            ?"Troponin came back positive at the hospital — a large, transmural infarct."
            :null;
          const mechLabel=(!po.survived&&po.lethalMechanismTreatable!=null)
            ?(po.lethalMechanismTreatable
              ?`The mechanism that killed this patient was, in principle, treatable — the lever was ${po.lethalMechanismLever}.`
              :`The mechanism that killed this patient was not something a field intervention could have reversed once established — ${po.lethalMechanismLever}.`)
            :null;
          const hasContent=po.arrestOccurred||po.irreversibleInjuries.length>0||po.reversibleFindings.length>0||tropLabel||mechLabel;
          if(!hasContent) return null;
          return (<div className="mt-5 pt-5" style={{borderTop:`1px solid ${C.line}`}}>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.dim,marginBottom:10}}>THE CHART</div>
            {po.arrestOccurred&&<div style={{fontSize:13.5,lineHeight:1.75,marginBottom:8}}>
              Cardiac arrest at minute {po.arrestAtMin}{po.roscOccurred
                ?` — circulation returned at minute ${po.roscAtMin} (${po.downtimeMin} minute${po.downtimeMin===1?"":"s"} of downtime).`
                :" — circulation never returned."}
              {po.roscOccurred&&neuroLabel&&<> <span style={{color:neuroColor}}>{neuroLabel}</span>.</>}
            </div>}
            {po.irreversibleInjuries.length>0&&<div style={{fontSize:13.5,lineHeight:1.75,marginBottom:8}}>
              <span style={{color:C.red}}>Lasting damage —</span> {po.irreversibleInjuries.join("; ")}.</div>}
            {po.reversibleFindings.length>0&&<div style={{fontSize:13.5,lineHeight:1.75,marginBottom:8}}>
              <span style={{color:C.amber}}>Likely reversible —</span> {po.reversibleFindings.join("; ")}.</div>}
            {tropLabel&&<div style={{fontSize:13.5,lineHeight:1.75,marginBottom:8}}>{tropLabel}</div>}
            {mechLabel&&<div style={{fontSize:13.5,lineHeight:1.75}}>{mechLabel}</div>}
          </div>);})()}
        {g.gmode==="sandbox"&&(()=>{const R=sandboxRating(g,o);return(
          <div className="mt-6 pt-5" style={{borderTop:`1px solid ${C.line}`}}>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.spo2,marginBottom:12}}>CALL RATING</div>
            <div className="grid grid-cols-3 gap-3">
              {[["Stabilization",`${R.stab}`,R.stab>=70?C.hr:R.stab>=45?C.amber:C.red,1],
                ["Within scope",`${R.practice}`,R.practice>=70?C.hr:R.practice>=45?C.amber:C.red,1],
                ["Overall",R.grade,R.overall>=70?C.hr:R.overall>=55?C.amber:C.red,0]].map(([lab,val,col,slash])=>(
                <div key={lab} className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
                  <div style={{fontFamily:MONO,fontSize:26,color:col}}>{val}{slash?<span style={{fontSize:12,color:C.dim}}>/100</span>:null}
                    {/* the star glyph pairs with sandboxRating's own grade==="A" ceiling —
                        the same condition creditOutcome's own isFiveStar already checks
                        for the five_star_review achievement, not a new threshold. */}
                    {lab==="Overall"&&val==="A"&&<img src={ICON_ART.star} onError={onImgError} alt=""
                      width={15} height={15} style={{marginLeft:6,verticalAlign:1,opacity:.9}}/>}</div>
                  <div style={{fontSize:11,color:C.dim,marginTop:4}}>{lab}</div></div>))}
            </div>
            <div style={{fontSize:11,color:C.dim,marginTop:10,lineHeight:1.6}}>
              {R.inBand}/{R.total} key vitals left in a safe range{R.outVitals.length?` — out of range: ${R.outVitals.join(", ")}`:""}.</div>
            {Object.keys(g.oosUsed||{}).length>0&&<div style={{fontSize:11,color:C.violet,marginTop:6,lineHeight:1.6}}>
              Used out-of-scope, via override: {Object.keys(g.oosUsed).map(id=>(DRUGS[id]||PROCS[id])?.name||id).join(", ")}.</div>}
            <div style={{fontSize:13,color:C.text,marginTop:8,lineHeight:1.6}}>{R.line}</div>
          </div>);})()}
        {g.gmode==="career"&&limitedItemsActive(g)&&(()=>{
          const short=g.supplyStock?Object.entries(g.supplyStock).filter(([id,qty])=>qty<(g.loadoutSelection?.carried?.[id]||0)):[];
          return (<div className="mt-6 pt-5" style={{borderTop:`1px solid ${C.line}`}}>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.dim,marginBottom:8}}>RIG STATUS</div>
            {g.restockedThisCall
              ?<div style={{fontSize:13,color:C.hr}}>🧹 Decontaminated and restocked — the rig is back to full loadout.</div>
              :short.length
                ?<div>
                  <div style={{fontSize:13,color:C.amber,lineHeight:1.6}}>
                    {short.length} item{short.length>1?"s":""} used this call ({short.slice(0,4).map(([id])=>STOCK_ITEMS[id]?.label).join(", ")}{short.length>4?", …":""})
                    and not yet restocked. Skip this and you'll roll into the next call short — worse outcomes if you need
                    them again, and it won't look good on your record.</div>
                  {/* F30 follow-up: make the escalation visible before it bites,
                      not just felt afterward as a bigger-than-expected reputation drop. */}
                  {(g.skippedRestockStreak||0)>0&&<div style={{fontSize:11,color:C.red,marginTop:6,lineHeight:1.6}}>
                    ⚠ {g.skippedRestockStreak} call{g.skippedRestockStreak>1?"s":""} in a row without restocking — the
                    reputation hit gets worse each time you skip it again.</div>}
                  <button onClick={()=>setG(s=>restockLoadout(s))} className="px-4 py-2 rounded mt-3"
                    style={{background:"#0F2A1E",border:`1px solid ${C.hr}`,color:C.hr,fontSize:12.5}}>
                    🧹 Decontaminate &amp; restock</button>
                </div>
                :<div style={{fontSize:13,color:C.faint}}>Nothing used this call — the rig is still fully stocked.</div>}
          </div>);})()}
        <div className="flex gap-2 mt-7">
          {g.gmode==="career"&&g.career
            ?<button onClick={()=>{const pay=shiftPay(g,{correct:!!o.correct,died:!!o.died});
              const result={title:SC.title,truth:o.truth,correct:!!o.correct,died:!!o.died,
                lucky,evidence:g.evidence.length,notes:o.notes.length,base:!!g.base,pay};
              const idx=g.career.idx+1, results=[...g.career.results,result];
              const money=(g.money||0)+pay;
              // §1.5.2/§1.5.3: this whole branch is gmode==="career" already
              // (the ternary above), so both scalars always move here — no
              // extra gate needed. scopeViolated reads g.oosUsed at the
              // moment THIS call ended (it resets to {} on every new call,
              // so it's this call's violations only, not cumulative).
              const outcomeDeltas=callOutcomeDeltas(result,Object.keys(g.oosUsed||{}).length>0);
              // Limited-items: rolling into the next call without
              // decontaminating/restocking a meaningfully-depleted rig costs
              // reputation — the real risk CLAUDE.md's own ask names (not
              // having enough items next time, and it reflecting on you).
              // No penalty if nothing was actually used (short.length===0) —
              // skipping a no-op restock isn't negligence.
              const wentOutShort=limitedItemsActive(g)&&!g.restockedThisCall&&g.supplyStock&&
                Object.entries(g.supplyStock).some(([id,qty])=>qty<(g.loadoutSelection?.carried?.[id]||0));
              // F30 follow-up: escalating, not flat. -2 the first time, one
              // point worse per additional CONSECUTIVE skip, capped at -5 —
              // "your rig has a reputation for showing up unprepared,"
              // rather than the same -2 no matter how many times in a row.
              // A real restock (restockLoadout) resets the streak to 0, so
              // one clean call fully clears the escalation.
              const restockPenalty=wentOutShort?-(2+Math.min(3,g.skippedRestockStreak||0)):0;
              const skippedRestockStreak=wentOutShort?(g.skippedRestockStreak||0)+1:0;
              const reputation=clampReputation((g.reputation||0)+outcomeDeltas.reputationDelta+restockPenalty);
              const morale=clampMorale((g.morale??50)+outcomeDeltas.moraleDelta);
              if(idx>=g.career.queue.length){
                // F15: perfect_shift is a shift-level (not call-level) achievement —
                // credited here, at the one place a shift's full `results` list is
                // complete, rather than in an effect.
                const prevStats=g.lifetimeStats||blank().lifetimeStats;
                const perfect=results.length>0&&results.every(r=>!r.died&&r.correct);
                const stats=perfect?{...prevStats,perfectShifts:(prevStats.perfectShifts||0)+1}:prevStats;
                const unlocked=perfect?newlyUnlocked(stats,g.achievements||[]):[];
                const achievements=unlocked.length?[...(g.achievements||[]),...unlocked]:g.achievements;
                const log=unlocked.length?[...g.log,...unlocked.map(id=>({t:g.t,kind:"good",
                  text:`🏆 Achievement unlocked — ${ACHIEVEMENTS.find(a=>a.id===id)?.name||id}.`}))]:g.log;
                // F7: same toast queue creditOutcome writes to — this is the other
                // achievement-credit site (shift-level, not call-level).
                const toastQueue=unlocked.length?[...(g.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:g.toastQueue;
                // §1.5.1: the flat end-of-shift accrual, ON TOP OF the existing
                // per-action fatigue mechanic — zth-only, matching every other
                // way g.fatigue moves (a plain Career save never had fatigue
                // behavior before this, and doesn't gain any here).
                const fatigue=g.learningMode==="zth"
                  ?clampFatigue((g.fatigue||0)+endOfShiftFatigueGain(results.length,results.some(r=>r.died)))
                  :g.fatigue;
                // §2.7.5's own post-call ending (option A/B/C, "A Shift to
                // Remember," the supervisor/partner epilogue text messages)
                // is a real scripted beat this exact 3-call queue owes —
                // everything else about `done` (money/fatigue/morale/
                // reputation/achievements/career.results) is unchanged;
                // campaignTutorialFinale only reads it and, once the player
                // clicks through, moves phase on to the real shiftSummary.
                const done={...g,money,fatigue,morale,reputation,skippedRestockStreak,lifetimeStats:stats,achievements,log,toastQueue,career:{...g.career,idx,results},
                  phase:isTutorialShift(g)?"campaignTutorialFinale":"shiftSummary"};
                writeSave(done.saveId,done,{name:done.saveName,gmode:"career",level:done.level,careerIdx:idx});
                setG(()=>done);
              }else{
                // F17 step 2: same downtime-event roll as the shift's first
                // "Begin" — the station is where these beats happen either
                // way. Suppressed during Scene 6's tutorial shift, which has
                // its own two scripted interludes instead (below).
                const ev=!isTutorialShift(g)&&Math.random()<0.4?rollDowntimeEvent(null,g.learningMode==="zth",morale):null;
                // Design doc §1.3.3: fitness governs how fast fatigue recovers
                // between calls — a short breather, not full rest (see OFF_DUTY
                // below for the bigger, dedicated recovery). Inert for every
                // non-campaign save (fatigue sits at 0 there, so this is a no-op).
                const next={...blank(),...carry(g),money,morale,reputation,skippedRestockStreak,career:{...g.career,idx,results},phase:"station",pendingDowntimeEvent:ev?ev.id:null,
                  fatigue:clampFatigue((g.fatigue||0)-betweenCallRecovery(g.fitness)),
                  // supplyStock/truckReserve are in CARRY, so a skipped
                  // restock genuinely carries its depletion into the next
                  // call — this line is just telling the player why.
                  log:wentOutShort?[{t:0,kind:"warn",text:"You rolled out without decontaminating and restocking — the rig is still short on whatever you used last call."}]:[]};
                writeSave(next.saveId,next,{name:next.saveName,gmode:"career",level:next.level,careerIdx:idx});
                setG(()=>next);
              }}}
              className="px-5 py-3 rounded" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13}}>
              {g.career.idx+1>=g.career.queue.length?"Finish shift →":"Next call"}</button>
            :<button onClick={()=>{const next={...blank(),...carry(g),phase:"station"};
                writeSave(next.saveId,next,{name:next.saveName,gmode:next.gmode,level:next.level});
                setG(()=>next);}}
              className="px-5 py-3 rounded" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13}}>Next call</button>}
          <button onClick={()=>{const next={...blank(),...carry(g),phase:"saves"};
              writeSave(next.saveId,next,{name:next.saveName,gmode:next.gmode,level:next.level});
              setG(()=>next);}} className="px-5 py-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>End shift</button>
        </div></div>);})()}</div></Shell>);
  }

  /* ═══ CAMPAIGN TUTORIAL FINALE — design doc §2.7.5's closing beat. Only
     reached from the debrief's own "Finish shift" transition above, when
     isTutorialShift(g) redirected `done` here instead of straight to
     shiftSummary — money/fatigue/morale/reputation/achievements/
     career.results are already computed and saved by that point; this
     phase only adds the option A/B/C deltas, "A Shift to Remember," and
     the epilogue before handing off to the real shiftSummary screen (its
     own isTutorialShift banner, below, still fires since career.queue is
     untouched here). ═══ */
  if(g.phase==="campaignTutorialFinale"){
    const partner=g.relationships?.partner_patrol;
    const partnerFirst=firstName(partner?.name)||"your partner";
    const partnerPr=PRONOUN_SETS[partner?.pronouns]||PRONOUN_SETS.they;
    const partnerSrc=partner?portraitFor({role:partner.role,gender:partner.gender,name:partner.name}):null;
    const OPTIONS=TUTORIAL_FINALE_OPTIONS({partnerFirst,clampMorale,adjustFriendship});
    const chosen=OPTIONS.find(o=>o.id===g.tutorialFinaleChoice);
    const choose=(o)=>setG(s=>{
      const applied=o.apply(s);
      // "A Shift to Remember" — the shift-level achievement F15's own
      // pattern uses (perfect_shift, above) for a check that only makes
      // sense at a single moment, not a persistent lifetimeStats counter.
      const unlocked=newlyUnlocked({completedTutorialShift:true},s.achievements||[]);
      const log=unlocked.length?[...s.log,...unlocked.map(id=>({t:s.t,kind:"good",
        text:`🏆 Achievement unlocked — ${ACHIEVEMENTS.find(a=>a.id===id)?.name||id}.`}))]:s.log;
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,...applied,tutorialFinaleChoice:o.id,log,toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.campusQuadNight}>
      <VNSprite src={partnerSrc} pose={g.vnPose?.[partnerFirst]}/>
      <VNBox label="THE ARTS BUILDING STEPS — AFTER THE CALL" wide>
        {!g.tutorialFinaleTalked
          ? <VNDialogue key="tutorialFinaleIntro" doneLabel="How do you feel?" onLineChange={vnLineChange(setG)} lines={TUTORIAL_FINALE_INTRO_LINES({partnerFirst,partnerPr})} onDone={()=>setG(s=>({...s,tutorialFinaleTalked:1}))}/>
          : !chosen
            ? <div className="flex flex-col gap-2">
                {OPTIONS.map(o=>(<button key={o.id} onClick={()=>choose(o)} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  {o.label}</button>))}
              </div>
            : !g.tutorialFinaleEpilogue
              ? <VNDialogue key="tutorialFinaleResponse" doneLabel="What now?" onLineChange={vnLineChange(setG)}
                  lines={[{speaker:partnerFirst,text:chosen.response}]}
                  onDone={()=>setG(s=>({...s,tutorialFinaleEpilogue:1}))}/>
              // "(as you pack up)" used to open the closing line's own text —
              // reuses the existing "holding_bag" pose instead (packing gear
              // away), rather than inventing a near-duplicate asset.
              : <VNDialogue key="tutorialFinaleEpilogue" doneLabel="Fade to black" onLineChange={vnLineChange(setG)} lines={TUTORIAL_FINALE_EPILOGUE_LINES({partnerFirst,supervisorFirst:firstName(g.relationships?.supervisor?.name)})} onDone={()=>setG(s=>({...s,phase:"shiftSummary",vnPose:{}}))}/>}
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 1 — BOOTS ON THE GROUND (design doc's own Chapter 1 section,
     §1.1-§1.5). Structural content, real mechanics. Dialogue is REAL text
     now (not placeholder stubs), living as data in campaign.js's
     CH1_DIALOGUE — see that file's own comment and the ch1Lines() helper
     above for how a line's `speaker`/`text` resolve to render-time values.

     Flow: campaignArrivalPrompt (the recurring arrival-time choice, debut
     text on the very first call, "It's time for your shift" every time
     after — see the offDuty phase's own pick(), which is what routes here)
     -> on the very first pass only, campaignCh1Gearup (§1.1's gear-up beat,
     now a real back-and-forth scene with the partner) -> seeds a 3-call
     queue via campaign.js's seedCh1Queue() (CH1_CALL_POOL, with a 1/3
     chance one slot becomes the recurring frequent-flyer patient instead)
     and drops straight into the existing "station" between-call phase,
     which already handles downtime events / the loadout screen /
     everything else a normal Career shift needs — no bespoke Ch.1
     between-call system was built, since "station" already IS that system.
     An arriving EMR+ unit during a Ch.1 scene ends the call immediately and
     sends the shift straight to shiftSummary (see the scene tick loop's own
     n.ch1CallEnding handling, above). After the shift resolves (shiftSummary
     -> Off duty), offDuty's own pick() routes back here for
     "campaignCh1SupervisorTalk" instead of another arrival prompt while
     ch1Done is still false — a real post-shift conversation (sets the
     flavor-only ch1EmrSponsorshipDiscussed/ch1SponsorshipAccepted flags),
     which always continues into "campaignCh1End" (Partner Talk) — the ACTUAL
     EMR-school decision, accepted (-> Chapter 2) or delayed (-> another
     campaignArrivalPrompt-seeded shift, per design doc §1.5's own "no
     penalty for waiting" note) — independent of what was said at Supervisor
     Talk.

     STARTING_MONEY is seeded once, at the gear-up beat, rather than baked
     into blank()'s own money:0 default (every non-campaign save must still
     start at 0). ═══════════════════════════════════════════════════════ */

  if(g.phase==="campaignArrivalPrompt"){
    const isDebut=!g.arrivalPromptSeen;
    const choose=(opt)=>setG(s=>{
      const d=arrivalTimeDeltas(opt.id);
      const patch={arrivalPromptSeen:true,
        reputation:clampReputation((s.reputation||0)+d.reputationDelta),
        morale:clampMorale((s.morale??50)+d.moraleDelta),
        fatigue:clampFatigue((s.fatigue||0)+d.fatigueDelta)};
      // Debut only: the one-line gear-up beat, then seed the very first
      // Ch.1 shift. Every later pass (recurring arrival prompts, whether
      // still inside Ch.1's own shift loop or long past it) skips straight
      // past Gearup — it's a first-day-only texture beat, not a chore
      // repeated before every shift.
      if(isDebut) return {...s,...patch,phase:"campaignCh1Gearup"};
      if(!s.ch1Done){
        const queue=seedCh1Queue(s);
        // A real shift counter (§7/§8) — feeds patrolShiftRoster's rotation
        // and resets every station NPC/background-dispatch unit back to
        // "at the station" for the new shift.
        const ch1ShiftIdx=(s.ch1ShiftIdx||0)+1;
        return {...s,...patch,career:{queue,idx:0,results:[]},ch1ShiftIdx,
          loadoutSelection:null,supplyStock:null,truckReserve:null,callsSinceLoadoutRefresh:0,
          ch1BgUnits:{},ch1BgVignetteShownThisShift:false,lastBgDispatchAt:Date.now(),ch1StationTalkedThisShift:{},
          scopeLocked:1,phase:"station",stationBoardOpen:false};
      }
      return {...s,...patch,phase:"gmodePick"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title={isDebut?"YOUR FIRST DAY":"BEFORE YOUR SHIFT"}/>
      <VNBox wide>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:16}}>
          {isDebut
            ?"You just woke up. It's your first day as a member of the Northwood PATROL! How early do you arrive?"
            :"It's time for your shift. How early do you head out?"}
        </div>
        <div className="flex flex-col gap-2">
          {[["very_early","45 minutes early"],["a_bit_early","15 minutes early"],
            ["on_time","Right on time"],["a_bit_late","5 minutes late"]].map(([id,label])=>{
            const opt=ARRIVAL_TIME_OPTIONS.find(o=>o.id===id);
            return (<button key={id} onClick={()=>choose(opt)} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5}}>
              <div>{label}</div>
              <div style={{fontFamily:MONO,fontSize:10,color:C.faint,marginTop:3}}>
                reputation {opt.reputationDelta>=0?"+":""}{opt.reputationDelta} · station morale {opt.moraleDelta>=0?"+":""}{opt.moraleDelta} ·
                fatigue {opt.fatigueDelta>=0?"+":""}{opt.fatigueDelta}</div>
            </button>);})}
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh1Gearup"){
    const roster=patrolShiftRoster(g.ch1ShiftIdx||0);
    const bikeEmrName=campaignName(g,roster.bikeEmr.relId);
    const cartName1=campaignName(g,roster.cartCrew[0].relId), cartName2=campaignName(g,roster.cartCrew[1].relId);
    const volunteers=laypersonVolunteerCount(new Date().getDay());
    const partnerFirst=firstName(g.relationships?.partner_patrol?.name)||"your partner";
    const begin=()=>setG(s=>{
      const queue=seedCh1Queue(s);
      const money=s.ch1MoneySeeded?s.money:(s.money||0)+STARTING_MONEY;
      return {...s,ch1MoneySeeded:1,money,career:{queue,idx:0,results:[]},
        loadoutSelection:null,supplyStock:null,truckReserve:null,callsSinceLoadoutRefresh:0,
        // Every station NPC/background dispatch unit resets to "at the
        // station" at the start of each shift — a fresh g.ch1BgUnits (not
        // in CARRY) already does this on its own via blank()'s default, but
        // ch1BgVignetteShownThisShift needs an explicit reset here since
        // this phase doesn't route back through blank()/carry().
        ch1BgUnits:{},ch1BgVignetteShownThisShift:false,lastBgDispatchAt:Date.now(),ch1StationTalkedThisShift:{},
        scopeLocked:1,phase:"station",stationBoardOpen:false};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationGarage}>
      <VNHeader title="GEARING UP"/>
      <VNBox wide>
        <VNDialogue key="ch1Gearup" doneLabel="Head out" onLineChange={vnLineChange(setG)}
          lines={ch1Lines(CH1_DIALOGUE.gearup,{bikeEmrName,cartName1,cartName2,volunteers,partnerFirst})} onDone={begin}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh1SupervisorTalk"){
    const sup=g.relationships?.supervisor;
    const supFirst=firstName(sup?.name)||"your supervisor";
    const choose=(accepted)=>setG(s=>({...s,
      ch1EmrSponsorshipDiscussed:1,ch1SponsorshipAccepted:accepted?1:0,
      phase:"campaignCh1End"}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="AFTER THE SHIFT"/>
      <VNBox wide>
        <VNDialogue key="ch1SupTalk" doneLabel="..." onLineChange={vnLineChange(setG)}
          lines={ch1Lines(CH1_DIALOGUE.supervisorTalk,{supFirst})} onDone={()=>{}}/>
        <div className="flex flex-col gap-2 mt-5">
          <button onClick={()=>choose(true)} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.hr}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600,color:C.hr}}>Ask about sponsored EMR school</div>
          </button>
          <button onClick={()=>choose(false)} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600}}>Skip, go find your partner</div>
          </button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh1End"){
    const raiser=g.relationships?.supervisor||g.relationships?.partner_patrol;
    const raiserFirst=firstName(raiser?.name)||"your supervisor";
    const accept=()=>setG(s=>({...s,ch1Done:1,ch1EmrPushChoice:"accept",phase:"campaignCh2Intro"}));
    const delay=()=>setG(s=>({...s,ch1EmrPushChoice:"delay",phase:"campaignArrivalPrompt"}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="THE PUSH TO EMR SCHOOL"/>
      <VNBox wide>
        <VNDialogue key="ch1End" doneLabel="What now?" onLineChange={vnLineChange(setG)}
          lines={ch1Lines(CH1_DIALOGUE.partnerTalk,{raiserFirst,sponsorshipAccepted:!!g.ch1SponsorshipAccepted})} onDone={()=>{}}/>
        <div className="flex flex-col gap-2 mt-5">
          <button onClick={accept} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.hr}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600,color:C.hr}}>Enroll in EMR school</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>Free — covered by PATROL as a recruitment investment (design doc §1.6.2.1).</div>
          </button>
          <button onClick={delay} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600}}>Not yet — a few more shifts first</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>No penalty. The offer stands whenever you're ready.</div>
          </button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 2 — EMR SCHOOL: "THE FIRST STEP" (design doc §1.6.3 and the
     doc's own Chapter 2 section, §2.1-§2.6). Structural content, real
     mechanics, PLACEHOLDER dialogue throughout — same convention as every
     other campaign-chapter batch. Classroom-only, like Ch.4/Ch.6/Ch.8: no
     calls run here, so it never touches offDuty/gmodePick/"station" at all.

     Flow: campaignCh2Intro (classmate/instructor intro, §2.1) -> a 25%
     funding-cut roll (§1.6.12's first of three windows, reusing the SAME
     campaignFundingCut phase Ch.4's batch built, now generalized via
     fundingCutReturnPhase rather than hardcoded to Ch.4) ->
     campaignCh2Practice (§2.2) -> campaignCh2Classmate (§2.3) ->
     campaignCh2ExamPrep/campaignCh2ExamResult (§2.5, the EMR certification
     exam — field 70% avg / written 4-5, 70/30 weighted, reusing the SAME
     shared rollExamFieldScore/rollWrittenQuiz placeholders every other tier
     uses, now parameterized "emr") -> campaignCh2Departure (§2.6, partner's
     departure) -> campaignCh2End, which hands off to campaignCh3Intro.

     Entry point: campaignCh1End's "Enroll in EMR school" button (Chapter 1,
     above). Exit point: campaignCh2End -> campaignCh3Intro (built directly
     below Chapter 2 in this same batch). ═══════════════════════════════ */

  if(g.phase==="campaignCh2Intro"){
    const emr={...CH2_CAST.classmateEmr,name:campaignName(g,CH2_CAST.classmateEmr.relId)};
    const instr={...CH2_CAST.instructor,name:campaignName(g,CH2_CAST.instructor.relId)};
    const rollFundingCut=()=>setG(s=>{
      const relationships={...s.relationships,
        [emr.relId]:s.relationships?.[emr.relId]||createRelationship({name:emr.name,role:emr.role,gender:emr.gender,startFriendship:5}),
        [instr.relId]:s.relationships?.[instr.relId]||createRelationship({name:instr.name,role:instr.role,gender:instr.gender,startFriendship:10})};
      if(s.fundingCutFired) return {...s,relationships,phase:"campaignCh2Practice"};
      const fired=Math.random()<FUNDING_CUT_CHANCE.ch2;
      return {...s,relationships,phase:fired?"campaignFundingCut":"campaignCh2Practice",fundingCutReturnPhase:"campaignCh2Practice"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="EMR SCHOOL — FIRST DAY OF CLASS"/>
      <VNBox wide>
        <VNDialogue key="ch2Intro" doneLabel="What now?" onLineChange={vnLineChange(setG)} lines={[
            {text:`*Placeholder — a real classroom: a mannequin on the table, ${emr.name} a few seats over.*`},
            {speaker:instr.name,text:"\"Forty-eight hours over the next six weeks. That's not a lot of time to learn to keep someone alive until help that's better equipped than you shows up, because that's the whole job description at this level. You are not the definitive treatment. You are the bridge. Get comfortable with that.\""},
          ]} onDone={rollFundingCut}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh2Practice"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="PRACTICE SCENARIOS"/>
      <VNBox wide>
        <VNDialogue key="ch2Practice" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the EMR program's own zero-stakes practice scenarios: CPR/AED, bleeding control, splinting, recovery position, OPA insertion once the course reaches airway week (design doc §2.2/§1.6.11).*"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh2Classmate"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh2Classmate"){
    const emr={...CH2_CAST.classmateEmr,name:campaignName(g,CH2_CAST.classmateEmr.relId)};
    const OPTIONS=[
      {id:"warm",label:`"You seem like you've got this down already. Done something like this before?"`,
        response:`${emr.name} laughs, a little sheepish. "*Placeholder — he admits he's retaking the course after failing once elsewhere (design doc §2.3's own grounding-scene note — the ${'`wet_behind_the_ears`'} achievement's framing, not a shame marker).*"`,delta:5},
      {id:"guarded",label:`"Just trying to get through the material, honestly."`,
        response:`${emr.name} nods. "Fair enough. No judgment."`,delta:1},
      {id:"banter",label:`"Think either of us is walking out of here able to actually save someone?"`,
        response:`${emr.name} grins. "*Placeholder — a light, nervous-energy joke about the mannequin's questionable CPR feedback.*"`,delta:3},
    ];
    const chosen=OPTIONS.find(o=>o.id===g.ch2ClassmateChoice);
    const choose=(o)=>setG(s=>({...s,ch2ClassmateChoice:o.id,
      relationships:{...s.relationships,[emr.relId]:adjustFriendship(s.relationships[emr.relId],o.delta)}}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationBreakroom}>
      <VNHeader title={`GETTING TO KNOW ${emr.name.toUpperCase()}`}/>
      <VNBox wide>
        {!g.ch2ClassmateTalked
          ?<VNDialogue key="ch2ClassmateIntro" doneLabel="Say something" onLineChange={vnLineChange(setG)} lines={[
              {text:`*Placeholder — a study-session moment with ${emr.name} (design doc §2.3).*`},
            ]} onDone={()=>setG(s=>({...s,ch2ClassmateTalked:1}))}/>
          :!chosen
            ?<div className="flex flex-col gap-2">
                {OPTIONS.map(o=>(<button key={o.id} onClick={()=>choose(o)} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  {o.label}</button>))}
              </div>
            :<VNDialogue key={`ch2ClassmateResp-${chosen.id}`} doneLabel="Continue" onLineChange={vnLineChange(setG)}
                lines={[{speaker:emr.name,text:chosen.response}]}
                onDone={()=>setG(s=>({...s,phase:"campaignCh2ExamPrep"}))}/>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh2ExamPrep"){
    const attempts=g.emrExamAttempts||0;
    const run=()=>setG(s=>{
      const fieldScores=rollExamFieldScore(EXAM_FIELD_SCENARIOS.emr,s.confidence,s.knowledge);
      const fieldScore=Math.round(examFieldScore(fieldScores));
      const written=rollWrittenQuiz(EXAM_WRITTEN_QUESTIONS.emr,s.knowledge);
      const combined=Math.round(examCombinedScore(fieldScore,written.correct,written.total,EXAM_FIELD_WEIGHT.emr));
      const passed=examPass(combined,"emr");
      const priorAttempts=s.emrExamAttempts||0;
      const nextAttempts=priorAttempts+1;
      let patch={emrExamAttempts:nextAttempts,ch2ExamFieldScore:fieldScore,ch2ExamWrittenCorrect:written.correct,
        ch2ExamWrittenTotal:written.total,ch2ExamCombinedScore:combined,ch2ExamOutcome:passed?"pass":"fail"};
      const flags={};
      if(passed){
        patch.knowledge=(s.knowledge??10)+5; patch.confidence=(s.confidence??10)+5;
        patch.reputation=clampReputation((s.reputation||0)+10); patch.emrCertified=true; patch.level="emr";
        flags.emrCertified=true;
        flags.emrExamPerfectFirstTry=nextAttempts===1&&written.correct===written.total;
        flags.emrFailedOnceBeforePass=priorAttempts>=1;
      } else {
        patch.reputation=clampReputation((s.reputation||0)-3); patch.knowledge=(s.knowledge??10)-1;
        patch.fatigue=clampFatigue((s.fatigue||0)+2);
      }
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,...patch,phase:"campaignCh2ExamResult",toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="EMR CERTIFICATION EXAM"/>
      <VNBox wide>
        <VNDialogue key={`ch2Exam-${attempts}`} doneLabel="Take the exam" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — 5 EMR-scope field scenarios plus a written component: scene safety, BSI/PPE, basic anatomy terminology, an EMR scope-of-practice boundary question, and a CPR/AED ratio-and-sequence question (design doc §2.5).*"},
            {text:attempts>0?`(This is attempt ${attempts+1}. A short remediation stretch behind you.)`:"(Deep breath. First real cert exam of your life.)"},
          ]} onDone={run}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh2ExamResult"){
    const outcome=g.ch2ExamOutcome;
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="EMR CERTIFICATION EXAM — RESULT"/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginBottom:10}}>
          Field: {g.ch2ExamFieldScore}/100 · Written: {g.ch2ExamWrittenCorrect}/{g.ch2ExamWrittenTotal} ·
          Combined: {g.ch2ExamCombinedScore}/100 (need {EXAM_PASS_THRESHOLD.emr})</div>
        {outcome==="pass"&&<>
          <div style={{fontSize:16,fontWeight:600,color:C.hr}}>Pass. You're EMR certified.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — a real certification-day beat, not a form letter (design doc §2.5).*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh2Departure"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
        </>}
        {outcome==="fail"&&<>
          <div style={{fontSize:16,fontWeight:600,color:C.red}}>Not this time.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — a 24-hour remediation beat, narrated as a study weekend (design doc §1.6.3). Not
            locked out — you keep working PATROL shifts and can retake whenever you're ready.*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh2ExamPrep"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>Retake the exam</button>
        </>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh2Departure"){
    const partner=g.relationships?.partner_patrol;
    const partnerFirst=firstName(partner?.name)||"your partner";
    const romance=partner?.romance??0;
    const bittersweetEligible=romance>=40;
    const finish=(branch)=>setG(s=>{
      const flags={ch2QuietGoodbye:branch==="quiet",ch2Bittersweet:branch==="bittersweet"};
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,ch2DepartureChoice:branch,phase:"campaignCh2End",toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="A TURNING POINT"/>
      <VNBox wide>
        <VNDialogue key="ch2Departure" doneLabel="What now?" onLineChange={vnLineChange(setG)} lines={[
            {speaker:partnerFirst,text:`*Placeholder — ${partnerFirst} tells you they're leaving PATROL: a job at the outdoor rec center, teaching kayaking. Realistic, not a contrived exit (design doc §2.6) — a genuinely common trajectory, not a failure.*`},
          ]} onDone={()=>{}}/>
        <div className="flex flex-col gap-2 mt-5">
          <button onClick={()=>finish("quiet")} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            A quiet, appreciative goodbye. Wish them well.</button>
          {bittersweetEligible&&<button onClick={()=>finish("bittersweet")} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.hr}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            *Placeholder — a bittersweet, more-than-friends beat, gated on the friendship built over the Prologue/Ch.1.*</button>}
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh2End"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 2"/>
      <VNBox wide>
        <VNDialogue key="ch2End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a closing beat: EMR-certified, a familiar partner gone, the station a little different now.*"},
            {text:"*Placeholder — connective text into Chapter 3 (Fork in the Road: PATROL or Volunteer Fire).*"},
          ]} onDone={()=>setG(s=>({...s,ch2Done:1,phase:"campaignCh3Intro"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 3 — FORK IN THE ROAD: PATROL OR VOLUNTEER FIRE (design doc's
     own Chapter 3 section, §3.1-§3.4). Structural content, real mechanics,
     PLACEHOLDER dialogue throughout, same convention as every other batch.

     Flow: campaignCh3Intro (§3.1, the supervisor conversation — a real
     three-option choice, "Tell me more" surfacing the actual PATROL/Fire
     pay-and-cost numbers rather than stalling) -> a 35% funding-cut roll
     (§1.6.12's second window, only if it hasn't already fired in Ch.2) ->
     campaignCh3PathPatrol or campaignCh3PathFire (§3.2/§3.3, the resolved
     fork — sets chapter3Path, which every later chapter's formulas already
     expect) -> campaignCh3End, which hands off to campaignCh4Intro (built
     directly below, already reachable — this is the exact hook Ch.4's own
     "not yet reachable from normal play" comment asked for). ═══════════ */

  if(g.phase==="campaignCh3Intro"){
    const sup=firstName(g.relationships?.supervisor?.name)||"your supervisor";
    const rollThenGo=(choice,nextPhase)=>setG(s=>{
      const patch={ch3ForkChoice:choice};
      if(choice==="info") return {...s,...patch,phase:"campaignCh3Info"};
      if(s.fundingCutFired) return {...s,...patch,phase:nextPhase};
      const fired=Math.random()<FUNDING_CUT_CHANCE.ch3;
      return {...s,...patch,phase:fired?"campaignFundingCut":nextPhase,fundingCutReturnPhase:nextPhase};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="PATROL OR FIRE"/>
      <VNBox wide>
        <VNDialogue key="ch3Intro" doneLabel="Decide" onLineChange={vnLineChange(setG)} lines={[
            {speaker:sup,text:"\"So. PATROL or Fire. Take your time, but not too much time, both sides need bodies. PATROL keeps you here, keeps you paid, and honestly it's the safer bet if you're worried about money. Fire's a different animal. Chief Alvarez runs a good house, and if you put the hours in, she'll fight for you when a paid seat opens up. But it's volunteer. Nobody at that station is getting a paycheck for showing up.\""},
          ]} onDone={()=>{}}/>
        <div className="flex flex-col gap-2 mt-5">
          <button onClick={()=>rollThenGo("patrol","campaignCh3PathPatrol")} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            "I need the paycheck. PATROL."</button>
          <button onClick={()=>rollThenGo("fire","campaignCh3PathFire")} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            "I want the guarantee that I'll always have a place there. Fire."</button>
          <button onClick={()=>rollThenGo("info",null)} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            "Tell me more about what each one actually costs before I decide."</button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh3Info"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="THE ACTUAL NUMBERS"/>
      <VNBox wide>
        <div style={{fontSize:13.5,lineHeight:1.8,marginBottom:16}}>
          PATROL pays roughly $80 a shift and leads toward jobs that can eventually help pay for AEMT and
          Paramedic school. Fire pays nothing for as long as you stay a volunteer, and every certification
          after EMR comes out of your own pocket unless you later win one of the department's rare paid seats.</div>
        <div className="flex flex-col gap-2">
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh3Intro"}))} className="px-6 py-2.5 rounded"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Back to the decision</button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh3PathPatrol"){
    // §3.2's "widened action set" needs no new mechanism — it's already a
    // real, direct consequence of g.level having advanced to "emr" back in
    // Chapter 2: why()'s own `a.lvl>L` scope gate (App.jsx) already opens
    // every EMR-level action the instant g.level allows it, the same gate
    // every other level transition in the game already goes through. §3.2's
    // other half — a real e-bike/golf-cart PATROL-EMR promotion, distinct
    // from on-foot patrol — is also now real: fleet.js's `pso`(bike)/
    // `campusEmr`(golf cart) vehicle kinds are both gated to KIND_LEVELS
    // "emr" (department.js's hasMyLevel check), so the moment this phase's
    // own `finish()` below hands the player back into ordinary shift-to-
    // shift play (offDuty -> campaignArrivalPrompt -> gmodePick, once
    // ch1Done), Campus PD is offered as a department for real (it wasn't
    // reachable at Layperson level before) and the vehicle picker inside it
    // lists PATROL Volunteer/PSO(bike)/Campus EMR(golf cart) side by side —
    // `patrol` stays pickable too (KIND_MIN_LEVEL_N gates the vehicle LIST,
    // not KIND_LEVELS, and its own crew generator never outranks an EMR), a
    // genuine choice to keep walking the beat rather than a forced upgrade.
    // Whichever is picked, `pso`/`campusEmr` now carry their own real,
    // distinctly-faster response time (scope.js's VEH_TYPE_TRAVEL_MULT)
    // instead of the flat vehicle-drive formula every other rig used before
    // this batch; `patrol` still gets the ordinary vehicle-drive formula
    // (not the ~10s Layperson walk-up — that's specific to g.level itself
    // being Layperson, not to this vehicle kind).
    const finish=()=>setG(s=>({...s,chapter3Path:"patrol",phase:"campaignCh3End"}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationGarage}>
      <VNHeader title="NORTHWOOD PATROL — EMR"/>
      <VNBox wide>
        <VNDialogue key="ch3Patrol" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — with EMR certification, campus-scope calls widen for real: still institutionally Layperson-adjacent, but EMR-scope interventions PATROL previously deferred to arriving EMS are now yours to give, starting this shift (design doc §3.2).*"},
            {text:"*Placeholder — and you're off the ground: pick up the e-bike or the golf cart next time you head out, instead of walking the quad on foot. Either one covers the campus faster than walking ever did (design doc §3.2).*"},
            {text:"*Placeholder — a mentoring beat: some shifts, you're leading a rookie of your own now — a small mirror of the crew-task delegation system, not new machinery.*"},
          ]} onDone={finish}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh3PathFire"){
    const chief={...CH3_CAST.fireChief,name:campaignName(g,CH3_CAST.fireChief.relId)};
    const partner={...CH3_CAST.firePartner,name:campaignName(g,CH3_CAST.firePartner.relId)};
    const finish=()=>setG(s=>{
      const relationships={...s.relationships,
        [chief.relId]:s.relationships?.[chief.relId]||createRelationship({name:chief.name,role:chief.role,gender:chief.gender,startFriendship:10}),
        [partner.relId]:s.relationships?.[partner.relId]||createRelationship({name:partner.name,role:partner.role,gender:partner.gender,startFriendship:15})};
      return {...s,relationships,chapter3Path:"fire",phase:"campaignCh3End"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationGarage}>
      <VNHeader title="VOLUNTEER FIRE — ENGINE 42"/>
      <VNBox wide>
        <VNDialogue key="ch3Fire" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:`*Placeholder — Engine 42, older than some of the members. ${partner.name} is your new partner; ${chief.name} runs a good house (design doc §3.3).*`},
            {text:"*Placeholder — basic fire-suppression skill checks, kept genuinely minor — texture for the setting and the relationships, not a second simulator.*"},
            {text:`${chief.name}: "Nobody joins a volunteer house for the money. You already know that part."`},
          ]} onDone={finish}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh3End"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 3"/>
      <VNBox wide>
        <VNDialogue key="ch3End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a closing beat naming the path taken and what it's already changed.*"},
            {text:"*Placeholder — connective text into Chapter 4 (EMT School: \"It Gets Real\").*"},
          ]} onDone={()=>setG(s=>({...s,ch3Done:1,phase:"campaignCh4Intro"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 4 — EMT SCHOOL: "IT GETS REAL" (design doc §1.6.5, §1.6.12, and
     the doc's own Chapter 4 section). Structural content, real mechanics,
     PLACEHOLDER dialogue throughout — per explicit operator instruction for
     this batch ("leave placeholders for dialogue... we'll come back and
     polish it later"), same convention the Chapter 5 batch below already
     used.

     Flow: campaignCh4Intro (framing) -> campaignFundingCut (§1.6.12's
     three-way financial-strain incident, only if it hasn't fired anywhere
     yet — rolled here at a flat 45%, simplified from the doc's own
     staggered Ch.2 25% / Ch.3 35% / Ch.4 45% window since Ch.2-3 don't exist
     yet to roll their own chance first) -> campaignCh4Day1 (4.1: classmate/
     instructor intro, the EMT tuition gate) -> campaignCh4Practice (4.2:
     practice scenarios, the optional ED-observation downtime beat) ->
     campaignCh4Classmate (4.3) -> campaignCh4ExamPrep/campaignCh4ExamResult
     (4.4, the EMT certification exam — §1.6.5's field+written mechanics,
     using the SAME shared roll placeholders (rollExamFieldScore/
     rollWrittenQuiz, campaign.js) the Ch.6/8 batches also use, rather than a
     bespoke real-scenario battery — see that section's own comment for what
     a future real-battery pass would replace) -> campaignCh4End.

     Entry point: NOT yet reachable from normal play — Chapters 1-3 (EMR
     school, the Ch.3 PATROL/Fire fork) are being built in a separate,
     concurrent batch and don't have an ending to route from yet; whoever
     finishes them should route their own Chapter 3 ending into
     "campaignCh4Intro". Exit point: campaignCh4End hands off to
     "campaignCh5Intro" (built below, already reachable) — this is the exact
     hook that chapter's own "TEMPORARY bridge" comment (campaignTutorialFinale,
     above) asked for. ═══════════════════════════════════════════════ */

  if(g.phase==="campaignCh4Intro"){
    const rollFundingCut=()=>setG(s=>{
      if(s.fundingCutFired) return {...s,phase:"campaignCh4Day1"};
      const fired=Math.random()<FUNDING_CUT_CHANCE.ch4;
      return {...s,phase:fired?"campaignFundingCut":"campaignCh4Day1",fundingCutReturnPhase:"campaignCh4Day1"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="A FEW WEEKS LATER"/>
      <VNBox wide>
        <VNDialogue key="ch4Intro" doneLabel="What now?" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — EMR-certified, some PATROL/Fire seasoning behind you now. Time for the next real step: EMT school.*"},
            {text:"*Placeholder — a classmate remarks on how much longer this program is than EMR (design doc §1.6.5's own texture note — the ~150-190 hour gap is real and worth a line of dialogue)."},
          ]} onDone={rollFundingCut}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignFundingCut"){
    const stage=g.fundingCutStage||"choice";
    // Applies a resolved outcome's stat deltas plus its achievement credit in
    // one shot — the same shape Ch.5's campaignCh5JobChoice/finish() use.
    // `resolution` matches achievements.js's own fundingCutResolution check
    // exactly ("partTime"|"dropOut"|"balancedSuccess" — see blank()'s own
    // comment for why a failed-then-resolved balance attempt still lands on
    // plain "partTime"/"dropOut" here, with fundingCutBalanceFailed carrying
    // the "stretched thin first" part separately).
    const grant=(resolution,deltas,resultText)=>setG(s=>{
      const unlocked=newlyUnlocked({fundingCutResolution:resolution},s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,...deltas,fundingCutFired:true,fundingCutResolution:resolution,fundingCutStage:"resolved",
        log:[...s.log,{t:s.t,kind:"obs",text:resultText}],toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    const takePartTime=()=>grant("partTime",
      {money:(g.money||0)+Math.max(0,TUITION.emt-(g.money||0)),fatigue:clampFatigue((g.fatigue||0)+8)},
      "*Placeholder — a modest campus job (dining hall, retail, tutoring), taken purely for the money. Slower, safer, real.*");
    const dropOut=()=>grant("dropOut",
      {money:(g.money||0)+Math.round(TUITION.emt*1.5)},
      "*Placeholder — dropping the degree, not the EMS track. The job takes over first, the same way it does for plenty of real working medics.*");
    const failPartTime=()=>grant("partTime",
      {money:(g.money||0)+Math.max(0,TUITION.emt-(g.money||0)),fatigue:clampFatigue((g.fatigue||0)+8)},
      "*Placeholder — the burnout beat resolves into the safer choice. Something had to give; this is what gave.*");
    const failDropOut=()=>grant("dropOut",
      {money:(g.money||0)+Math.round(TUITION.emt*1.5)},
      "*Placeholder — the burnout beat resolves into walking away from the degree instead.*");
    const tryBalance=()=>setG(s=>{
      const chance=balanceBothSuccessChance(s.ambition,s.fitness,s.confidence,s.fatigue);
      const success=Math.random()*100<chance;
      if(success){
        const unlocked=newlyUnlocked({fundingCutResolution:"balancedSuccess"},s.achievements||[]);
        const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
        return {...s,ambition:(s.ambition??10)+2,confidence:(s.confidence??10)+2,
          fundingCutFired:true,fundingCutResolution:"balancedSuccess",fundingCutStage:"resolved",
          achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,toastQueue,
          log:[...s.log,{t:s.t,kind:"good",text:"*Placeholder — a real relief beat. You pulled it off, for now.*"}]};
      }
      const unlocked=newlyUnlocked({fundingCutBalanceFailed:true},s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,fatigue:clampFatigue((s.fatigue||0)+10),reputation:clampReputation((s.reputation||0)-2),
        fundingCutBalanceFailed:true,fundingCutStage:"balanceFail",
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,toastQueue};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="A LETTER FROM FINANCIAL AID"/>
      <VNBox wide>
        {stage==="choice"&&<>
          <div style={{fontSize:13,color:C.dim,fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>
            *Placeholder — the funding-cut letter itself (design doc §1.6.12 deliberately leaves the cause flexible:
            a financial-aid restructuring, a scholarship renewal denied, a work-study cut, or a family situation).
            Whatever it is, EMT tuition (${TUITION.emt}) is suddenly a real problem.*</div>
          <div className="flex flex-col gap-2">
            <button onClick={takePartTime} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              Work a part-time job to cover it — safe, slow, real.</button>
            <button onClick={dropOut} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              Drop the degree, work full-time — the EMS track keeps going either way.</button>
            <button onClick={tryBalance} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              Try to balance both — risky, but no delay if it works.</button>
          </div>
        </>}
        {stage==="balanceFail"&&<>
          <div style={{fontSize:13,color:C.dim,fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>
            *Placeholder — the forced burnout beat: a missed shift, a missed class, something had to give.
            Now the same choice, for real this time.*</div>
          <div className="flex flex-col gap-2">
            <button onClick={failPartTime} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              Take the part-time job.</button>
            <button onClick={failDropOut} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              Drop the degree.</button>
          </div>
        </>}
        {stage==="resolved"&&<button onClick={()=>setG(s=>({...s,phase:s.fundingCutReturnPhase||"campaignCh4Day1"}))} className="px-6 py-2.5 rounded"
          style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh4Day1"){
    const emt={...CH4_CAST.classmateEmt,name:campaignName(g,CH4_CAST.classmateEmt.relId)};
    const instr={...CH4_CAST.instructor,name:campaignName(g,CH4_CAST.instructor.relId)};
    const shortfall=Math.max(0,TUITION.emt-(g.money||0));
    const seedCast=(s)=>({...s.relationships,
      [emt.relId]:s.relationships?.[emt.relId]||createRelationship({name:emt.name,role:emt.role,gender:emt.gender,startFriendship:5}),
      [instr.relId]:s.relationships?.[instr.relId]||createRelationship({name:instr.name,role:instr.role,gender:instr.gender,startFriendship:10})});
    const finishEnroll=()=>setG(s=>{
      const relationships=seedCast(s);
      if(shortfall<=0) return {...s,relationships,money:(s.money||0)-TUITION.emt,phase:"campaignCh4Practice"};
      const {money,debt}=takeLoan(s.money,s.debt,shortfall);
      return {...s,relationships,money:money-TUITION.emt,debt,phase:"campaignCh4Practice"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="EMT SCHOOL — DAY ONE"/>
      <VNBox wide>
        {!g.ch4Day1TuitionShown
          ?<VNDialogue key="ch4Day1" doneLabel="About that tuition..." onLineChange={vnLineChange(setG)} lines={[
              {text:`*Placeholder — a real classroom this time, longer than EMR's. A classmate introduces herself: ${emt.name}, energetic, already talking about event medicine.*`},
              {speaker:instr.name,text:"*Placeholder — the instructor's own opening line, procedural and a little wry (design doc §2.1's calibration line, one tier up).*"},
              {text:`*Placeholder — ${campaignName(g,CH4_CAST.rivalClassmate.slotId)} is here too, a little too confident about the skills stations.*`},
            ]} onDone={()=>setG(s=>({...s,ch4Day1TuitionShown:1}))}/>
          :shortfall<=0
            ?<>
              <div style={{fontSize:13.5,lineHeight:1.7,marginBottom:14}}>
                EMT tuition: ${TUITION.emt}. You have ${g.money||0}.</div>
              <button onClick={finishEnroll} className="px-6 py-2.5 rounded"
                style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Pay tuition and enroll</button>
            </>
            :<>
              <div style={{fontSize:13.5,lineHeight:1.7,marginBottom:14}}>
                EMT tuition: ${TUITION.emt}. You have ${g.money||0} — you're ${shortfall} short.
                *Placeholder — the first real gut-punch tuition beat (design doc §1.6.3/§1.6.5's own framing).*</div>
              <button onClick={finishEnroll} className="px-6 py-2.5 rounded"
                style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>
                Take a loan for the shortfall (${shortfall}, no interest)</button>
            </>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh4Practice"){
    // Reuses the SAME ed_observation_shift event downtimeEvents.js declares
    // (design doc §4.2), resolved inline rather than through the ordinary
    // g.pendingDowntimeEvent/station roll — Ch.4 doesn't run through the
    // station/career-queue loop at all (see the banner comment above), so
    // there's no "between calls" moment for the generic system to fire in.
    const edEvent=DOWNTIME_EVENTS.find(e=>e.id==="ed_observation_shift");
    const edChoice=g.ch4PracticeEdChoice;
    const chosenEd=edChoice?edEvent.choices.find(c=>c.label===edChoice):null;
    const chooseEd=(c)=>setG(s=>({...s,
      money:(s.money||0)+(c.effects.money||0),
      fatigue:clampFatigue((s.fatigue||0)+(c.effects.fatigueAll||0)),
      knowledge:(s.knowledge??10)+(c.effects.knowledgeDelta||0),
      ch4PracticeEdChoice:c.label}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="PRACTICE SCENARIOS"/>
      <VNBox wide>
        <div style={{fontSize:13,color:C.dim,fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>
          *Placeholder — the EMT program's own bank of zero-stakes practice scenarios, replayable for a small
          capped knowledge/confidence boost (design doc §1.6.11).*</div>
        {!chosenEd?<>
          <div style={{fontSize:13.5,marginBottom:10}}>{edEvent.text}</div>
          <div className="flex flex-col gap-2">
            {edEvent.choices.map((c,i)=>(<button key={i} onClick={()=>chooseEd(c)} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5}}>
              {c.label}</button>))}
          </div>
        </>:<>
          <div style={{fontSize:13,color:C.dim,lineHeight:1.7,marginBottom:14}}>{chosenEd.resultText}</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh4Classmate"}))} className="px-6 py-2.5 rounded"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
        </>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh4Classmate"){
    const emt={...CH4_CAST.classmateEmt,name:campaignName(g,CH4_CAST.classmateEmt.relId)};
    // §1.10.1's "three or four options, not two" house rule: one warm, one
    // guarded, one banter/humor option — the design doc's own concert/
    // event-medic hook (§4.3) lives in the banter response.
    const OPTIONS=[
      {id:"warm",label:`"You seem really into this. What got you started?"`,
        response:`${emt.name} lights up. "*Placeholder — her real backstory answer (design doc §1.10.2's 'backstory' topic tier).*"`,delta:4},
      {id:"guarded",label:`"Just trying to get through the material, honestly."`,
        response:`${emt.name} nods. "Fair. Not everyone's here for the same reason."`,delta:1},
      {id:"banter",label:`"So when do we get to the exciting stuff?"`,
        response:`${emt.name} laughs. "*Placeholder — a light, event-medicine-flavored joke, foreshadowing Ch.5's Event EMT option (design doc §4.3).*"`,delta:3},
    ];
    const chosen=OPTIONS.find(o=>o.id===g.ch4ClassmateChoice);
    const choose=(o)=>setG(s=>({...s,ch4ClassmateChoice:o.id,
      relationships:{...s.relationships,[emt.relId]:adjustFriendship(s.relationships[emt.relId],o.delta)}}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationBreakroom}>
      <VNHeader title={`GETTING TO KNOW ${emt.name.toUpperCase()}`}/>
      <VNBox wide>
        {!g.ch4ClassmateTalked
          ?<VNDialogue key="ch4ClassmateIntro" doneLabel="Say something" onLineChange={vnLineChange(setG)} lines={[
              {text:`*Placeholder — a between-lectures moment with ${emt.name} (design doc §4.3).*`},
            ]} onDone={()=>setG(s=>({...s,ch4ClassmateTalked:1}))}/>
          :!chosen
            ?<div className="flex flex-col gap-2">
                {OPTIONS.map(o=>(<button key={o.id} onClick={()=>choose(o)} className="text-left px-4 py-3 rounded"
                  style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
                  {o.label}</button>))}
              </div>
            :<VNDialogue key={`ch4ClassmateResp-${chosen.id}`} doneLabel="Continue" onLineChange={vnLineChange(setG)}
                lines={[{speaker:emt.name,text:chosen.response}]}
                onDone={()=>setG(s=>({...s,phase:"campaignCh4ExamPrep"}))}/>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh4ExamPrep"){
    const attempts=g.ch4ExamAttempts||0;
    const run=()=>setG(s=>{
      const fieldScores=rollExamFieldScore(EXAM_FIELD_SCENARIOS.emt,s.confidence,s.knowledge);
      const fieldScore=Math.round(examFieldScore(fieldScores));
      const written=rollWrittenQuiz(EXAM_WRITTEN_QUESTIONS.emt,s.knowledge);
      const combined=Math.round(examCombinedScore(fieldScore,written.correct,written.total,EXAM_FIELD_WEIGHT.emt));
      const passed=examPass(combined,"emt");
      const nextAttempts=(s.ch4ExamAttempts||0)+1;
      let patch={ch4ExamAttempts:nextAttempts,ch4ExamFieldScore:fieldScore,ch4ExamWrittenCorrect:written.correct,
        ch4ExamWrittenTotal:written.total,ch4ExamCombinedScore:combined,ch4ExamOutcome:passed?"pass":"fail"};
      const flags={};
      if(passed){
        patch.knowledge=(s.knowledge??10)+10; patch.confidence=(s.confidence??10)+5;
        patch.reputation=clampReputation((s.reputation||0)+15); patch.emtCertified=true;
        // A real, previously-undiscovered gap found while reconciling this
        // batch with Ch.6's own equivalent (which DOES set level:"aemt" on
        // pass, line ~6132): Ch.4's exam pass set emtCertified but never
        // advanced g.level, so scope-gating (why(), LIM thresholds) never
        // actually reflected the new EMT certification. Fixed here.
        patch.level="emt";
        flags.emtCertified=true;
        // Honest caveat per achievements.js's own comment: emrExamAttempts
        // has no real writer until Chapter 2 exists, so this reads as
        // "clean" for every player until then.
        flags.emrExamCleanFirstTry=(s.emrExamAttempts??0)===0;
        flags.emtExamCleanFirstTry=nextAttempts===1;
      } else {
        const pen=examFailurePenalty(nextAttempts);
        patch.reputation=clampReputation((s.reputation||0)+pen.reputationDelta);
        patch.knowledge=(s.knowledge??10)+pen.knowledgeDelta;
      }
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,...patch,phase:"campaignCh4ExamResult",toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="EMT CERTIFICATION EXAM"/>
      <VNBox wide>
        <VNDialogue key={`ch4Exam-${attempts}`} doneLabel="Take the exam" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — 5 EMT-scope field scenarios plus a written component: the five rights of medication administration, 12-lead acquisition, spinal motion restriction, and more (design doc §1.6.5).*"},
            {text:attempts>0?`(This is attempt ${attempts+1}. You've studied since the last one — for whatever that's worth.)`:"(Deep breath. This is the real thing.)"},
          ]} onDone={run}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh4ExamResult"){
    const outcome=g.ch4ExamOutcome;
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="EMT CERTIFICATION EXAM — RESULT"/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginBottom:10}}>
          Field: {g.ch4ExamFieldScore}/100 · Written: {g.ch4ExamWrittenCorrect}/{g.ch4ExamWrittenTotal} ·
          Combined: {g.ch4ExamCombinedScore}/100 (need {EXAM_PASS_THRESHOLD.emt})</div>
        {outcome==="pass"&&<>
          <div style={{fontSize:16,fontWeight:600,color:C.hr}}>Pass. You're EMT certified.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — the certification moment itself, a real beat, not a form letter (design doc §1.6.5).*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh4End"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
        </>}
        {outcome==="fail"&&<>
          <div style={{fontSize:16,fontWeight:600,color:C.red}}>Not this time.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — an escalating remediation beat (design doc §1.6.5/§1.6.3: a longer "remediation semester"
            on a second failure). Not permanent — retake once you've had time to study.*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh4ExamPrep"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>Retake the exam</button>
        </>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh4End"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 4"/>
      <VNBox wide>
        <VNDialogue key="ch4End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a closing beat: EMT-Basic, certified, patch on the bag. Whatever the funding-cut incident cost you (design doc §1.6.12's own Ch.4->Ch.5 callback), it's behind you now.*"},
            {text:"*Placeholder — connective text into Chapter 5 (Employment: IFT, 911, or Event EMT).*"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh5Intro"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 5 — EMPLOYMENT: IFT, 911, OR EVENT EMT (design doc §1.6.6, and
     the doc's own Chapter 5 section, "§5.1-5.6"). Structural content, real
     mechanics, PLACEHOLDER dialogue throughout — per explicit operator
     instruction for this batch ("leave placeholders for dialogue... we'll
     come back and polish it later").

     Flow: campaignCh5Intro (5.1 framing) -> campaignCh5JobChoice (the
     employer picker, always offering IFT/911/Event, plus a Fire-Rescue
     entrance exam if chapter3Path==="fire") -> for IFT/Event, straight to
     campaignCh5EmployerIntro (5.2/5.4); for 911/Fire, campaignCh5Exam (5.3/
     5.5) -> campaignCh5ExamResult, which on a hire routes into
     campaignCh5EmployerIntro and on conditional/rejected routes back to
     campaignCh5JobChoice after a cooldown. campaignCh5AddSecondJob offers
     the IFT+Event combine case once one of the two is already held.
     campaignCh5End (5.6) wraps the chapter.

     Entry point: reached today via the temporary tutorialFinale bridge
     above. Exit point: campaignCh5End currently hands off to "shiftSummary"
     (ordinary Career play) — this is where Chapter 6 (AEMT school, §1.6.7,
     optional per §1.6.8.1) should hook in once it exists. ═══════════════ */

  if(g.phase==="campaignCh5Intro"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="A FEW WEEKS LATER"/>
      <VNBox wide>
        <VNDialogue key="ch5Intro" doneLabel="What now?" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the EMT patch, the graduation-adjacent beat, a short montage of the last stretch of school.*"},
            {text:"*Placeholder — a callback to how the funding-strain incident resolved, if it fired (design doc §1.6.12's Ch.4->Ch.5 connective text), otherwise straight into: it's time to find a real EMS job.*"},
            {text:"(EMT-Basic. Certified. Now what? IFT, 911, Event... time to figure out where you actually fit.)"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh5JobChoice"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh5JobChoice"){
    const jobs=g.jobs||[];
    const fireEligible=g.chapter3Path==="fire";
    const cooldownActive=(id)=>{
      const attempts=id==="fire"?g.ch5ExamAttemptsFire:g.ch5ExamAttempts911;
      return attempts>0&&g.ch5EntranceOutcome==="rejected"&&g.ch5ExamTrack===id;
    };
    const pickInstant=(empId)=>setG(s=>{
      const empKey=empId;
      let nextJobs;
      const cur=s.jobs||[];
      if(empKey==="ift"||empKey==="event"){
        // §1.6.6: IFT+Event can combine; either replaces a solo 911/fire911
        // job outright (those are stated to be incompatible with a second
        // EMS job), and re-picking a job already held is a no-op.
        if(cur.includes("county911")||cur.includes("fire911")) nextJobs=[empKey];
        else if(cur.includes(empKey)) nextJobs=cur;
        else nextJobs=[...cur,empKey];
      } else nextJobs=[empKey];
      const switched=cur.length>0&&!cur.includes(empKey)&&!(canCombineEmployers(cur[0],empKey));
      const unlocked=newlyUnlocked({ch5SwitchedPaths:switched},s.achievements||[]);
      return {...s,jobs:nextJobs,ch5SwitchedPaths:s.ch5SwitchedPaths||switched,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,
        phase:"campaignCh5EmployerIntro",ch5PendingEmployer:empKey};
    });
    const startExam=(track)=>setG(s=>({...s,ch5ExamTrack:track,phase:"campaignCh5Exam"}));
    const EMP_ORDER=["ift","event","county911"];
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="FINDING WORK"/>
      <VNBox wide>
        <div style={{fontSize:13,color:C.dim,fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>
          *Placeholder — a short framing beat naming the three real employers
          (Crosswind Medical Transport for IFT, Northwood County EMS for 911,
          EventMed for Event), per design doc §1.6.6.*</div>
        <div className="flex flex-col gap-3">
          {EMP_ORDER.map(id=>{
            const emp=CH5_EMPLOYERS[id];
            const held=jobs.includes(id);
            return (<button key={id} disabled={held} onClick={()=>emp.exam?startExam("911"):pickInstant(id)}
              className="text-left px-4 py-3 rounded" style={{background:held?"rgba(40,60,45,0.5)":"rgba(27,36,43,0.9)",
                border:`1px solid ${held?C.hr:C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6,opacity:held?0.7:1}}>
              <div style={{fontWeight:600}}>{emp.name} — {emp.jobType==="ift"?"IFT":emp.jobType==="event"?"Event EMT":"911"}
                {held?" (current)":""}</div>
              <div style={{fontSize:12,color:C.dim,marginTop:3}}>{emp.blurb}</div>
              <div style={{fontFamily:MONO,fontSize:11,color:C.amber,marginTop:4}}>
                ${JOB_SHIFT_PAY[emp.jobType]}/shift{emp.exam?" — competitive entrance exam":" — always accepted, no exam"}</div>
            </button>);
          })}
          {fireEligible&&<button disabled={jobs.includes("fire911")||cooldownActive("fire")}
            onClick={()=>startExam("fire")} className="text-left px-4 py-3 rounded"
            style={{background:jobs.includes("fire911")?"rgba(40,60,45,0.5)":"rgba(43,27,27,0.9)",
              border:`1px solid ${C.red}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600}}>{CH5_EMPLOYERS.fire911.name} — paid Fire-Rescue entrance exam
              {jobs.includes("fire911")?" (current)":""}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:3}}>{CH5_EMPLOYERS.fire911.blurb} The only route to a
              paid fire wage — your volunteer standing at Engine 42 gives you a real internal-candidate edge.</div>
            <div style={{fontFamily:MONO,fontSize:11,color:C.amber,marginTop:4}}>
              ${JOB_SHIFT_PAY.fire911}/shift — competitive entrance exam</div>
          </button>}
        </div>
        {jobs.length>0&&<div style={{fontSize:12,color:C.dim,marginTop:16,fontStyle:"italic"}}>
          Currently working: {jobs.map(id=>CH5_EMPLOYERS[id].name).join(" + ")}.
          {(jobs.length===1&&(jobs[0]==="ift"||jobs[0]==="event"))&&" You could pick up a second part-time role alongside this one."}</div>}
        {jobs.length>0&&<button onClick={()=>setG(s=>({...s,phase:"campaignCh5End"}))} className="px-6 py-2.5 rounded mt-5"
          style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>
          Move on with {jobs.length>1?"these jobs":"this job"} for now</button>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh5Exam"){
    const track=g.ch5ExamTrack;
    const attempts=track==="fire"?(g.ch5ExamAttemptsFire||0):(g.ch5ExamAttempts911||0);
    const run=()=>setG(s=>{
      const baseRoll=Math.random()*100;
      let score;
      if(track==="fire"){
        // examComponent: a placeholder field/written component, same shape
        // as the EMT-tier exam per design doc §1.6.6 — a modest random
        // draw standing in for the real scenario battery/quiz until that
        // content is built.
        const examComponent=Math.random()*30;
        score=fireEntranceScore(s.reputation,examComponent);
      } else {
        score=nine11EntranceScore(baseRoll,s.emrCalls,s.iftCalls,s.eventCalls,s.reputation);
      }
      const outcome=resolveEntranceOutcome(score);
      const attemptsKey=track==="fire"?"ch5ExamAttemptsFire":"ch5ExamAttempts911";
      const nextAttempts=(s[attemptsKey]||0)+1;
      const flags={};
      if(outcome==="hire"&&track==="911"){ flags.ch5Hired911=true; }
      if(outcome==="hire"&&track==="fire"&&nextAttempts===1){ flags.ch5FireHiredFirstAttempt=true; }
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      return {...s,[attemptsKey]:nextAttempts,ch5EntranceScore:Math.round(score),ch5EntranceOutcome:outcome,
        ...flags,achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,
        phase:"campaignCh5ExamResult"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title={track==="fire"?"CITY OF NORTHWOOD FIRE-RESCUE — ENTRANCE EXAM":"NORTHWOOD COUNTY EMS — ENTRANCE EXAM"}/>
      <VNBox wide>
        <VNDialogue key={`ch5Exam-${track}-${attempts}`} doneLabel="Take the exam" onLineChange={vnLineChange(setG)} lines={[
            {text:track==="fire"
              ? "*Placeholder — a scored field/written entrance-exam battery for the paid Fire-Rescue seat, modeled the same shape as the EMT-tier exam (design doc §1.6.6).*"
              : "*Placeholder — a scored high-acuity scenario battery, distinct from a plain interview (design doc §1.6.6's own framing).*"},
            {text:attempts>0?`(This is attempt ${attempts+1}. You've put in more calls since the last try — for whatever that's worth.)`:
              "(Deep breath. This is the real thing.)"},
          ]} onDone={run}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh5ExamResult"){
    const track=g.ch5ExamTrack;
    const outcome=g.ch5EntranceOutcome;
    const score=g.ch5EntranceScore;
    const emp=track==="fire"?CH5_EMPLOYERS.fire911:CH5_EMPLOYERS.county911;
    const shortfall=nine11Shortfall(score??0);
    const accept=()=>setG(s=>({...s,jobs:[emp.id],phase:"campaignCh5EmployerIntro",ch5PendingEmployer:emp.id}));
    const backToChoice=()=>setG(s=>({...s,phase:"campaignCh5JobChoice"}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title={`${emp.name.toUpperCase()} — RESULT`}/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginBottom:6}}>Score: {score}/100</div>
        {outcome==="hire"&&<>
          <div style={{fontSize:16,fontWeight:600,color:C.hr}}>Hired.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — the call/letter confirming the hire, a real beat, not a form email.*</div>
          <button onClick={accept} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Report for your first shift</button>
        </>}
        {outcome==="conditional"&&<>
          <div style={{fontSize:16,fontWeight:600,color:C.amber}}>Conditional — not yet.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — the panel's real, specific feedback.* Come back with roughly {shortfall} more
            qualifying calls (IFT/Event experience counts) and reapply.</div>
          <button onClick={backToChoice} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>
            Back to the job search</button>
        </>}
        {outcome==="rejected"&&<>
          <div style={{fontSize:16,fontWeight:600,color:C.red}}>Rejected.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — a real, honest letdown beat, not a game-over.* Not permanent — reapply after more
            experience and reputation (roughly {CH5_REAPPLY_COOLDOWN_SHIFTS} shifts' worth is a reasonable target).</div>
          <button onClick={backToChoice} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#1A1510",border:`1px solid ${C.dim}`,color:C.dim,fontSize:13}}>
            Back to the job search</button>
        </>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh5EmployerIntro"){
    const empId=g.ch5PendingEmployer||g.jobs?.[g.jobs.length-1];
    const emp=CH5_EMPLOYERS[empId];
    if(!emp) return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNBox><button onClick={()=>setG(s=>({...s,phase:"campaignCh5JobChoice"}))}
        className="px-6 py-2.5 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber}}>
        Back to job search</button></VNBox></VNScene></Shell>);
    const canAddSecond=(empId==="ift"||empId==="event")&&!(g.jobs||[]).some(j=>j!=="ift"&&j!=="event")&&(g.jobs||[]).length===1;
    const supervisorName=emp.supervisorRelId?campaignName(g,emp.supervisorRelId):null;
    const partnerName=emp.partnerRelId?campaignName(g,emp.partnerRelId):null;
    const finish=()=>setG(s=>{
      const relationships={...(s.relationships||{})};
      if(emp.supervisorRelId){
        relationships[emp.supervisorRelId]=s.relationships?.[emp.supervisorRelId]||
          createRelationship({name:supervisorName,role:`${emp.name} supervisor`,gender:campaignGender(s,emp.supervisorRelId),startFriendship:5});
      }
      if(emp.partnerRelId){
        relationships[emp.partnerRelId]=s.relationships?.[emp.partnerRelId]||
          createRelationship({name:partnerName,role:emp.partnerRole,gender:emp.partnerGender||campaignGender(s,emp.partnerRelId),startFriendship:5});
      }
      const flags={};
      if(empId==="ift"&&!s.ch5FirstIftShift) flags.ch5FirstIftShift=true;
      if(empId==="event"&&!s.ch5FirstEventShift) flags.ch5FirstEventShift=true;
      const moonlighting=(s.jobs||[]).length>1;
      if(moonlighting) flags.ch5Moonlighting=true;
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      return {...s,relationships,...flags,ch5PendingEmployer:null,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,
        phase:canAddSecond?"campaignCh5AddSecondJob":"campaignCh5JobChoice"};
    });
    const introLines=[
      {text:`*Placeholder — the first-shift-jitters beat (design doc's own "worth adding" note under §1.6.6): a real, distinct anxiety from PATROL's sheltered, campus-scoped calls.*`},
      ...(supervisorName?[{speaker:supervisorName,text:"*Placeholder — the supervisor's own introduction, and this employer's personality as an organization.*"}]:[]),
      ...(partnerName?[{speaker:partnerName,text:"*Placeholder — the new partner's own introduction.*"}]:[]),
      {text:"*Placeholder — the actual first shift/first call, narrated or handed off to a real scenario run.*"},
    ];
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationGarage}>
      <VNHeader title={`${emp.name.toUpperCase()} — FIRST SHIFT`}/>
      <VNBox wide>
        <VNDialogue key={`ch5Intro-${empId}`} doneLabel="Clock in" onLineChange={vnLineChange(setG)} lines={introLines} onDone={finish}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh5AddSecondJob"){
    const heldId=(g.jobs||[])[0];
    const otherId=heldId==="ift"?"event":"ift";
    const other=CH5_EMPLOYERS[otherId];
    const addSecond=()=>setG(s=>({...s,ch5PendingEmployer:otherId,phase:"campaignCh5EmployerIntro"}));
    const skip=()=>setG(s=>({...s,phase:"campaignCh5JobChoice"}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="A SECOND JOB?"/>
      <VNBox wide>
        <div style={{fontSize:13,color:C.dim,fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>
          *Placeholder — a downtime beat weighing a second, part-time role at {other.name} alongside your
          current work. IFT and Event are the only two jobs this campaign lets you hold at once (design doc
          §1.6.6) — more income, more fatigue, a real "moonlighter" schedule.*</div>
        <div className="flex gap-3">
          <button onClick={addSecond} className="px-5 py-2.5 rounded"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>
            Pick up {other.name} too</button>
          <button onClick={skip} className="px-5 py-2.5 rounded"
            style={{background:"#1A1510",border:`1px solid ${C.dim}`,color:C.dim,fontSize:13}}>
            Not right now</button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh5End"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 5"/>
      <VNBox wide>
        <VNDialogue key="ch5End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a closing beat naming what the player is now: working EMS, for real pay (or, if Fire-only and unpaid, working EMS for the experience), somewhere on the IFT/911/Event/Fire ladder.*"},
            {text:"*Placeholder — connective text into Chapter 6 (AEMT school, optional per design doc §1.6.8.1).*"},
          ]}
          // Ch.5's own exit point — see the big banner comment above these
          // phases. Chapter 6 now exists (campaignCh6Offer, below) — see
          // that phase's own banner comment for the rest of the flow.
          onDone={()=>setG(s=>({...s,phase:"campaignCh6Offer",ch5Done:1}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ CHAPTER 6 — AEMT SCHOOL, "Going Advanced" (design doc §1.6.7, made
     OPTIONAL by §1.6.8.1's revision). Placeholder dialogue throughout per
     explicit operator instruction ("leave placeholders... we'll come back
     and polish it later").

     Flow: campaignCh6Offer (the skip-or-enroll choice, honest about the
     odds either way) -> if enrolling, campaignCh6Enroll (tuition/
     scholarship/loan) -> campaignCh6ClassIntro (6.1, meets/reuses the
     SAME `instructor` relationship Ch.4's EMT course already created —
     CH4_CAST.instructor, "Instructor Yolanda Briggs," per design doc §1.9's
     "one recurring person across all three classroom chapters") ->
     campaignCh6ScheduleConflict (the repeatable shift-vs-class friction
     point §1.6.7 explicitly asks for, AEMT_SCHEDULE_CONFLICT_ROUNDS times,
     round 2 doubling as the "office politics"/Shitty-Supervisor-style
     beat) -> campaignCh6Exam (field+written, via campaign.js's shared
     rollExamFieldScore/rollWrittenQuiz placeholders — the same mechanism
     Ch.4/Ch.5's own exams use, not a bespoke AEMT-only battery) ->
     campaignCh6ExamResult (pass -> aemtCertified, g.level bumped to
     "aemt", achievement `advanced`; fail -> escalating remediation, retake
     loops back to campaignCh6Exam only, not the whole chapter). If the
     player instead skips AEMT at the offer, campaignCh6SkipConfirm ->
     campaignCh6End directly. campaignCh6End (6.5) wraps the chapter either
     way and hands off to "shiftSummary" (ordinary Career play) — Chapter 7
     doesn't exist in this file as of this batch, so this is where it
     should hook in once it does (its own blank()-comment banner already
     names campaignCh7Intro and reads g.aemtCertified/g.ch6Done/
     g.ch6SkippedAemt as this chapter's exit state).

     Re-entry: a player who backs out at the reputation or money gate
     (ch6Done stays 0) can return via a button on the shiftSummary screen,
     below — see that phase's own Ch.6 re-entry addition. ═══════════════ */

  if(g.phase==="campaignCh6Offer"){
    const raiser=g.relationships?.job_supervisor||g.relationships?.event_coord||g.relationships?.supervisor;
    const raiserFirst=firstName(raiser?.name)||"Your supervisor";
    const eligible=(g.reputation||0)>AEMT_REPUTATION_FLOOR;
    const notReady=()=>setG(s=>({...s,phase:"shiftSummary"}));
    const skip=()=>setG(s=>{
      const unlocked=newlyUnlocked({ch6SkippedAemt:true},s.achievements||[]);
      return {...s,ch6SkippedAemt:1,ch6Done:1,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,
        phase:"campaignCh6SkipConfirm"};
    });
    const enroll=()=>setG(s=>({...s,phase:"campaignCh6Enroll"}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="GOING ADVANCED?"/>
      <VNBox wide>
        <VNDialogue key="ch6Offer" doneLabel="What now?" onLineChange={vnLineChange(setG)} lines={[
            {speaker:raiserFirst,text:"*Placeholder — the supervisor (or whoever's closest at hand) explicitly raises AEMT as the next step, per design doc §1.6.8.1's own instruction that this be a real, offered choice, not a hidden option.*"},
            {text:`(AEMT — IV/IO, a real drug list, supraglottic airways. ${eligible?"":"Or maybe not yet — you've got some reputation to build first."})`},
          ]} onDone={()=>{}}/>
        {eligible?(
          <div className="flex flex-col gap-2 mt-5">
            <button onClick={enroll} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.hr}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600,color:C.hr}}>Enroll in AEMT school</div>
              <div style={{fontSize:12,color:C.dim,marginTop:4}}>Tuition ${TUITION.aemt} (§1.6.2.1) — the first tier scholarship money can realistically help with.</div>
            </button>
            <button onClick={skip} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600}}>Skip AEMT — apply straight to paramedic school later</div>
              <div style={{fontSize:12,color:C.dim,marginTop:4}}>
                Honest odds: possible per design doc §1.6.8.1, but paramedic admission is weighted heavily
                toward having AEMT first — this makes it considerably harder, not impossible. Not permanent:
                you can still come back for AEMT later.</div>
            </button>
          </div>
        ):(
          <div className="flex flex-col gap-2 mt-5">
            <div style={{fontSize:12.5,color:C.amber,lineHeight:1.6}}>
              Reputation {g.reputation||0} — AEMT school wants a supervisor recommendation, which needs
              reputation above {AEMT_REPUTATION_FLOOR} (§1.6.7). Keep working; this isn't a permanent lockout.</div>
            <button onClick={notReady} className="px-5 py-2.5 rounded"
              style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>Not yet — keep working</button>
            <button onClick={skip} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600}}>Or skip AEMT entirely — apply straight to paramedic school later</div>
            </button>
          </div>
        )}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh6SkipConfirm"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="A DIFFERENT ROUTE"/>
      <VNBox wide>
        <VNDialogue key="ch6Skip" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a real, non-judgmental beat: the player is choosing to gamble on paramedic admission straight from EMT rather than take the AEMT bridge. Someone (supervisor/partner) can voice honest skepticism without it reading as a wrong choice.*"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh6End"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh6Enroll"){
    const quote=aemtTuitionQuote(g);
    const step=g.ch6EnrollScholarshipStep;
    const cost=step==="scholarship"?quote.effective:quote.full;
    const short=Math.max(0,cost-(g.money||0));
    const finishEnroll=(finalCost)=>setG(s=>({...s,money:(s.money||0)-finalCost,phase:"campaignCh6ClassIntro"}));
    const acceptScholarship=()=>setG(s=>{
      const unlocked=newlyUnlocked({acceptedScholarship:true},s.achievements||[]);
      return {...s,ch6EnrollScholarshipStep:"scholarship",
        serviceCommitment:{employer:quote.employerId,monthsRemaining:AEMT_SERVICE_COMMITMENT_MONTHS,
          totalMonths:AEMT_SERVICE_COMMITMENT_MONTHS,tuitionCovered:quote.full-quote.effective},
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    const declineScholarship=()=>setG(s=>({...s,ch6EnrollScholarshipStep:"pay"}));
    const takeOutLoan=()=>setG(s=>{
      const {money,debt}=takeLoan(s.money,s.debt,short);
      return {...s,money,debt,phase:"campaignCh6ClassIntro"};
    });
    const notYet=()=>setG(s=>({...s,phase:"shiftSummary"}));
    if(quote.eligible&&!step){
      return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
        <VNHeader title="AEMT TUITION"/>
        <VNBox wide>
          <div style={{fontSize:13,color:C.dim,lineHeight:1.7,marginBottom:14}}>
            *Placeholder — {CH5_EMPLOYERS[quote.employerId]?.name||"your employer"} offers to cover part of AEMT
            tuition (design doc §1.6.2.1), reflecting your standing there.*</div>
          <div className="flex flex-col gap-2">
            <button onClick={acceptScholarship} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.hr}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600,color:C.hr}}>Accept the scholarship</div>
              <div style={{fontSize:12,color:C.dim,marginTop:4}}>
                {quote.coveragePct}% covered (${quote.full-quote.effective} of ${quote.full}) — you owe ${quote.effective}.
                In return: a {AEMT_SERVICE_COMMITMENT_MONTHS}-month service commitment. Leaving that employer early
                converts the unserved portion to debt (§1.6.2.1).</div>
            </button>
            <button onClick={declineScholarship} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600}}>Pay the standard ${quote.full} yourself</div>
              <div style={{fontSize:12,color:C.dim,marginTop:4}}>No strings attached.</div>
            </button>
          </div>
        </VNBox>
      </VNScene></Shell>);
    }
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="AEMT TUITION"/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:12,color:C.amber,marginBottom:10}}>
          Due: ${cost} · On hand: ${g.money||0}{short>0?` · Short: $${short}`:""}</div>
        {short<=0?(
          <button onClick={()=>finishEnroll(cost)} className="px-6 py-2.5 rounded"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Pay ${cost} and enroll</button>
        ):(
          <div className="flex flex-col gap-2">
            <div style={{fontSize:12.5,color:C.dim,lineHeight:1.6}}>
              *Placeholder — a real beat naming the shortfall, not a silent block (§1.6.2.1).*</div>
            <button onClick={takeOutLoan} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.amber}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600,color:C.amber}}>Take out a loan for the ${short} shortfall</div>
              <div style={{fontSize:12,color:C.dim,marginTop:4}}>No interest (a stated game-balance simplification) — 15% of every paycheck goes toward it once employed.</div>
            </button>
            <button onClick={notYet} className="px-5 py-2.5 rounded"
              style={{background:"#1A1510",border:`1px solid ${C.dim}`,color:C.dim,fontSize:13}}>Not yet — keep saving</button>
          </div>
        )}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh6ClassIntro"){
    const instructor={...CH4_CAST.instructor,name:campaignName(g,CH4_CAST.instructor.relId)};
    const finish=()=>setG(s=>{
      const relationships={...(s.relationships||{})};
      relationships.instructor=relationships.instructor||
        createRelationship({name:instructor.name,role:instructor.role,gender:instructor.gender,startFriendship:10});
      return {...s,relationships,phase:"campaignCh6ScheduleConflict",ch6ConflictRound:0};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="AEMT SCHOOL — FIRST DAY"/>
      <VNBox wide>
        <VNDialogue key="ch6ClassIntro" doneLabel="Weeks pass" onLineChange={vnLineChange(setG)} lines={[
            {speaker:firstName(instructor.name),text:"*Placeholder — the same instructor from EMT school, now teaching the AEMT bridge: IV/IO access, blood glucose monitoring, the closed AEMT drug list, supraglottic airway devices (design doc §1.6.7). Explicitly NOT endotracheal intubation — that stays Paramedic-tier.*"},
            {text:"(A shorter, more accessible bridge than EMT was — but a real one. Now the actual grind: fitting a class schedule around a job that doesn't stop needing you.)"},
          ]} onDone={finish}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh6ScheduleConflict"){
    const round=g.ch6ConflictRound||0;
    const isFrictionRound=round===1; // the "office politics" beat, §1.6.7's own note — the middle round
    const supervisorFirst=firstName(g.relationships?.job_supervisor?.name||g.relationships?.event_coord?.name)||"your supervisor";
    const advance=(patchFn)=>setG(s=>{
      const nextRound=(s.ch6ConflictRound||0)+1;
      const patch=patchFn(s);
      if(nextRound>=AEMT_SCHEDULE_CONFLICT_ROUNDS) return {...s,...patch,ch6ConflictRound:nextRound,phase:"campaignCh6Exam"};
      return {...s,...patch,ch6ConflictRound:nextRound};
    });
    const attendClass=()=>advance((s)=>({knowledge:(s.knowledge||10)+1,fatigue:clampFatigue((s.fatigue||0)+4)}));
    const coverShift=()=>advance((s)=>({money:(s.money||0)+(JOB_SHIFT_PAY[(CH5_EMPLOYERS[s.jobs?.[0]]||{}).jobType]||0),
      reputation:clampReputation((s.reputation||0)+1)}));
    const confront=()=>advance((s)=>({reputation:clampReputation((s.reputation||0)-2),
      relationships:{...s.relationships,...(s.relationships?.job_supervisor?{job_supervisor:adjustFriendship(s.relationships.job_supervisor,-3)}:{})}}));
    const comply=()=>advance((s)=>({fatigue:clampFatigue((s.fatigue||0)+6)}));
    const appeal=()=>advance((s)=>({knowledge:(s.knowledge||10)+1,
      relationships:{...s.relationships,...(s.relationships?.job_supervisor?{job_supervisor:adjustFriendship(s.relationships.job_supervisor,2)}:{})}}));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationBreakroom}>
      <VNHeader title={`AEMT SCHOOL — WEEK ${round+1}`}/>
      <VNBox wide>
        {isFrictionRound?(<>
          <div style={{fontSize:13,color:C.dim,lineHeight:1.7,marginBottom:14}}>
            *Placeholder — {supervisorFirst} isn't thrilled about accommodating the class schedule
            (design doc §1.6.7's "workplace friction" note — a real, common AEMT-bridge-student complaint).*</div>
          <div className="flex flex-col gap-2">
            <button onClick={confront} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600}}>Push back — the schedule is the schedule</div></button>
            <button onClick={comply} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600}}>Comply — pick up the awkward shifts anyway</div></button>
            <button onClick={appeal} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600}}>Appeal — go over their head to HR/the program</div></button>
          </div>
        </>):(<>
          <div style={{fontSize:13,color:C.dim,lineHeight:1.7,marginBottom:14}}>
            *Placeholder — a class session and a work shift land on the same night, again (design doc §1.6.7).*</div>
          <div className="flex flex-col gap-2">
            <button onClick={attendClass} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.hr}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600,color:C.hr}}>Go to class</div>
              <div style={{fontSize:12,color:C.dim,marginTop:4}}>Miss the shift — a little knowledge, a little fatigue.</div></button>
            <button onClick={coverShift} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
              <div style={{fontWeight:600}}>Cover the shift</div>
              <div style={{fontSize:12,color:C.dim,marginTop:4}}>Miss the class — a little money, a little reputation.</div></button>
          </div>
        </>)}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh6Exam"){
    const attempts=g.ch6ExamAttempts||0;
    const run=()=>setG(s=>{
      const fieldScores=rollExamFieldScore(EXAM_FIELD_SCENARIOS.aemt,s.confidence,s.knowledge);
      const fieldScore=examFieldScore(fieldScores);
      const written=rollWrittenQuiz(EXAM_WRITTEN_QUESTIONS.aemt,s.knowledge);
      const combined=examCombinedScore(fieldScore,written.correct,written.total,EXAM_FIELD_WEIGHT.aemt);
      const passed=examPass(combined,"aemt");
      return {...s,ch6ExamAttempts:attempts+1,ch6ExamFieldScore:Math.round(fieldScore),
        ch6ExamWrittenCorrect:written.correct,ch6ExamWrittenTotal:written.total,
        ch6ExamCombinedScore:Math.round(combined),ch6ExamOutcome:passed?"pass":"fail",
        phase:"campaignCh6ExamResult"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="THE AEMT BOARDS"/>
      <VNBox wide>
        <VNDialogue key={`ch6Exam-${attempts}`} doneLabel="Take the exam" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a field component (real vascular-access priority order tested, per §1.6.7) plus a written component (IV/IO priority, a weight-based dose calculation, the AEMT scope boundary).*"},
            {text:attempts>0?`(Attempt ${attempts+1}. You know the material better this time, at least.)`:"(Deep breath. This is the real thing.)"},
          ]} onDone={run}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh6ExamResult"){
    const passed=g.ch6ExamOutcome==="pass";
    const attempts=g.ch6ExamAttempts||0;
    const accept=()=>setG(s=>{
      const unlocked=newlyUnlocked({aemtCertified:true},s.achievements||[]);
      return {...s,aemtCertified:true,level:"aemt",knowledge:(s.knowledge||10)+15,
        reputation:clampReputation((s.reputation||0)+20),ch6Done:1,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,
        phase:"campaignCh6End"};
    });
    const retry=()=>setG(s=>{
      const penalty=examFailurePenalty(attempts);
      return {...s,reputation:clampReputation((s.reputation||0)+penalty.reputationDelta),
        knowledge:Math.max(0,(s.knowledge||10)+penalty.knowledgeDelta),phase:"campaignCh6Exam"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="AEMT BOARDS — RESULT"/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginBottom:6}}>
          Field {g.ch6ExamFieldScore}/100 · Written {g.ch6ExamWrittenCorrect}/{g.ch6ExamWrittenTotal} · Combined {g.ch6ExamCombinedScore}/100</div>
        {passed?(<>
          <div style={{fontSize:16,fontWeight:600,color:C.hr}}>Passed. AEMT-certified.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — a real beat marking the milestone, not a form letter.*</div>
          <button onClick={accept} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
        </>):(<>
          <div style={{fontSize:16,fontWeight:600,color:C.red}}>Not this time.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — {attempts<=1?"a study-weekend remediation beat":"a longer, several-week remediation stretch"}, not a game over (§1.6.3's own escalating-but-survivable pattern).*</div>
          <button onClick={retry} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>Retake the boards</button>
        </>)}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh6End"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 6"/>
      <VNBox wide>
        <VNDialogue key="ch6End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:g.aemtCertified
              ?"*Placeholder — a closing beat naming what the player is now: AEMT-certified, real IV/IO and a real drug list in the box.*"
              :"*Placeholder — a closing beat naming the choice made: skipping the bridge, applying straight to paramedic school later at harder odds.*"},
            {text:"*Placeholder — connective text into Chapter 7 (AEMT: New Responsibilities, §1.6.8.3's advocate draw).*"},
          ]}
          // Ch.6's real exit point: BOTH the enroll+pass path and the skip
          // path (campaignCh6SkipConfirm) land here. Per design doc's own
          // flow amendment (§ "Ch6/Ch7 are now an optional branch"), only an
          // actually-AEMT-certified player has real "new responsibilities"
          // to land in Chapter 7 for — a skipped player instead returns to
          // ordinary play and picks up Chapter 8 (paramedic application)
          // directly from the shiftSummary re-entry button below once
          // eligible, exactly as the doc's amendment describes.
          onDone={()=>setG(s=>({...s,phase:g.aemtCertified?"campaignCh7Intro":"shiftSummary",ch6Done:1}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ SHIFT SUMMARY — Career Mode, after 5 calls ═══
     A real, previously-undiscovered crash was found here while building
     tools/browser/clickThroughCh4to7.mjs (a real click-through of Chapters
     4-7): the render guard below has always been g.phase==="shiftSummary"
     &&g.career, on the assumption shiftSummary is only ever reached after a
     real career queue completes (line ~3933, where g.career is guaranteed
     set). But several campaign-chapter batches since then (Ch.6/Ch.7/Ch.9's
     own bail-out and chapter-end buttons — grep phase:"shiftSummary" for
     the full list, 7 sites) route here as a generic "back to normal play"
     destination WITHOUT ever seeding g.career — real for a player who
     reaches, say, Ch.7's end without having run an actual shift in between
     (Ch.2/4/6/8 are classroom-only phases that never touch the career
     queue). With the old guard false, execution fell through every
     remaining phase check to the SCENE/TRANSPORT fallback at the bottom of
     this function, which unconditionally reads SC.limit (SC derived from
     g.scen) — also unset — and crashed with "Cannot read properties of
     null (reading 'limit')". This block now handles the no-career case
     explicitly instead of falling through. */
  if(g.phase==="shiftSummary"&&!g.career){
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:560,margin:"0 auto",paddingTop:70}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim}}>BACK TO IT</div>
      <div className="f1" style={{fontSize:14,color:C.dim,marginTop:10,lineHeight:1.7}}>
        No shift results to show yet — nothing's actually been run since the last one.</div>
      <button onClick={()=>setG(s=>({...s,phase:"offDuty"}))} className="px-5 py-3 rounded mt-6"
        style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13}}>Off duty →</button>
    </div></Shell>);
  }
  if(g.phase==="shiftSummary"&&g.career){
    const R=g.career.results, n=R.length||1;
    const shiftEarned=R.reduce((a,r)=>a+(r.pay||0),0);
    const survived=R.filter(r=>!r.died).length;
    const correctPct=Math.round(100*R.filter(r=>r.correct).length/n);
    const luckyN=R.filter(r=>r.lucky).length;
    const avgEvid=(R.reduce((a,r)=>a+r.evidence,0)/n).toFixed(1);
    const baseN=R.filter(r=>r.base).length;
    const rating=correctPct>=80&&luckyN===0?"Solid — this is what scope-appropriate reasoning looks like.":
      correctPct>=60?"Getting there — some calls were guesses that happened to land.":
      "Rough shift. Go back through the debriefs before your next one.";
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:720,margin:"0 auto",paddingTop:24}}>
      <div className="f1" style={{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim}}>SHIFT COMPLETE — {LEVELS[g.level].name.toUpperCase()}</div>
      {isTutorialShift(g)&&<div className="f1" style={{fontSize:13,color:C.hr,marginTop:6}}>
        🎓 Tutorial shift complete — you're a probationary Northwood PATROL responder now.</div>}
      <div className="f1" style={{fontSize:22,fontWeight:600,marginTop:8}}>{R.length} calls run.</div>
      <div className="f1" style={{fontFamily:MONO,fontSize:12,color:C.amber,marginTop:4}}>Balance: ${g.money||0}</div>
      <div className="f2 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[["Survived",`${survived}/${n}`,C.hr],["Correct impression",`${correctPct}%`,correctPct>=70?C.hr:C.amber],
          ["Lucky (right w/o evidence)",luckyN,luckyN===0?C.hr:C.red],["Avg. findings/call",avgEvid,C.spo2],
          ["Base contact used",`${baseN}/${n}`,C.violet],["Earned this shift",`$${shiftEarned}`,C.amber]].map(([lab,val,col])=>(
          <div key={lab} className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
            <div style={{fontFamily:MONO,fontSize:24,color:col}}>{val}</div>
            <div style={{fontSize:11,color:C.dim,marginTop:4}}>{lab}</div></div>))}
      </div>
      <div className="f2 mt-6 p-4 rounded" style={{background:C.panel,border:`1px solid ${C.amber}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.amber,marginBottom:8}}>HOW YOU DID FOR {LEVELS[g.level].name.toUpperCase()} SCOPE</div>
        <div style={{fontSize:14,lineHeight:1.7}}>{rating}</div>
      </div>
      {/* F17 step 4: crew wellbeing — the passive per-call drift (bumpRoster)
          and any downtime events this shift both land on g.roster; this is
          the one place that accumulation becomes visible to the player. */}
      {g.roster.length>0&&(()=>{const avgMorale=Math.round(g.roster.reduce((a,p)=>a+(p.morale??90),0)/g.roster.length);
        const avgFatigue=Math.round(g.roster.reduce((a,p)=>a+(p.fatigue??0),0)/g.roster.length);
        const worst=[...g.roster].sort((a,b)=>(a.morale??90)-(b.morale??90))[0];
        return (<div className="f2 mt-4 p-4 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.spo2,marginBottom:8}}>CREW, END OF SHIFT</div>
          <div style={{fontSize:13,lineHeight:1.7}}>
            Average crew morale {avgMorale}/100, average fatigue {avgFatigue}/100.
            {worst&&worst.morale<60?` ${worst.name} is running low on morale — worth checking on ${(PRONOUN_SETS[worst.pronouns]||PRONOUN_SETS.they).obj} before the next shift.`:""}
          </div>
        </div>);})()}
      <div className="f2 mt-5 flex flex-col gap-2">
        {R.map((r,i)=>(<div key={i} className="p-3 rounded flex justify-between items-center" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div>
            <div style={{fontSize:13}}>{r.title}</div>
            <div style={{fontFamily:MONO,fontSize:10,color:C.faint,marginTop:2}}>{r.truth}</div></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:MONO,fontSize:11,color:r.died?C.red:r.lucky?C.amber:C.hr}}>
              {r.died?"DIED":r.lucky?"LUCKY":"SURVIVED"}{r.correct?" · CORRECT":" · MISSED"}</div>
            <div style={{fontFamily:MONO,fontSize:10,color:C.amber,marginTop:2}}>+${r.pay||0}</div>
          </div>
        </div>))}
      </div>
      <div className="flex gap-2 mt-7">
        {/* F17 step 5: off duty comes BEFORE picking the next shift, not after —
            it's what you do with your own time between shifts, not a shift setting. */}
        <button onClick={()=>setG(s=>({...s,phase:"offDuty"}))} className="px-5 py-3 rounded"
          style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13}}>Off duty →</button>
        {/* Chapter 6 re-entry: a player who backed out at campaignCh6Offer's
            reputation gate or campaignCh6Enroll's money gate has ch6Done
            still 0 — this is the only durable way back in, since neither
            of those bounce-outs land anywhere else that re-offers it. */}
        {g.learningMode==="zth"&&g.ch5Done&&!g.ch6Done&&<button onClick={()=>setG(s=>({...s,phase:"campaignCh6Offer"}))} className="px-5 py-3 rounded"
          style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>AEMT school (Chapter 6) →</button>}
        {/* Chapter 8 entry: per design doc's own "Ch6/Ch7 optional branch"
            amendment, reachable either after Ch.7 (AEMT path) or directly
            once AEMT was skipped (campaignCh6SkipConfirm's own route) — in
            both cases gated on paramedicApplicationFloor actually being met,
            same honest floor check campaignCh7End's own text already uses. */}
        {g.learningMode==="zth"&&(g.ch7Done||g.ch6SkippedAemt)&&!g.paramedicCertified&&!g.paramedicAdmitted&&
          paramedicApplicationFloor(g.calls911,g.aemtCalls,g.iftCalls,g.eventCalls)>=PARAMEDIC_APPLICATION_FLOOR_MIN&&
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh8Intro"}))} className="px-5 py-3 rounded"
          style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>Apply to Paramedic school (Chapter 8) →</button>}
        {g.learningMode==="zth"&&g.paramedicAdmitted&&!g.paramedicCertified&&!g.ch8InternshipActive&&
          <button onClick={()=>setG(s=>({...s,phase:g.ch8InternshipDone?"campaignCh8FinalExam":"campaignCh8Rotations"}))} className="px-5 py-3 rounded"
          style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>Continue Paramedic school (Chapter 8) →</button>}
        <button onClick={()=>{const next={...blank(),...carry(g),phase:"saves"};
            writeSave(next.saveId,next,{name:next.saveName,gmode:next.gmode,level:next.level});
            setG(()=>next);}} className="px-5 py-3 rounded"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>Back to saves</button>
      </div>
    </div></Shell>);
  }

  /* ═══ OFF DUTY — F17 step 5. What the player does with their own time
     between shifts, before picking the next one. Applies to the PLAYER only
     (the crew roster's wellbeing is the downtime-event system's territory,
     above) — a simple one-time choice, not a repeating minigame. ═══ */
  if(g.phase==="offDuty"){
    // Effects here were originally limited to money (F4's economy) and
    // speedBoost (F4's next-call action-cost multiplier) specifically to
    // avoid a player fatigue number nothing would consume — the campaign's
    // player.fatigue field (design doc §1.3.1/§1.3.3) is now that real
    // consumer, so a dedicated rest choice recovers it for real. Inert for
    // every non-campaign save (fatigue sits at 0 there regardless). The
    // crew's own wellbeing is still tracked separately (g.roster's morale/
    // fatigue, moved by downtime events above and bumpRoster's passive
    // per-call drift) — this is the player's own choice, not a copy of it.
    const OFF_DUTY=[
      {id:"rest",label:"Rest",desc:"Sleep in, do nothing EMS-related. The single best way to recover.",
        effects:{money:0,speedBoost:0,fatigue:-60}},
      {id:"train",label:"Train on your own time",desc:"Extra skills practice. A small speed edge on your next shift's first call — less restful than doing nothing.",
        effects:{money:0,speedBoost:0.05,fatigue:-20}},
      {id:"family",label:"See family",desc:"Time away from the job entirely. Costs a little (dinner out, gas) but it's not nothing.",
        effects:{money:-5,speedBoost:0,fatigue:-35}},
    ];
    const pick=(o)=>setG(s=>{
      // Chapter 1 (§1.1): the arrival-time choice is a RECURRING mechanic,
      // asked at the start of every zth-campaign shift going forward — it
      // slots in here, the one place every shift-to-shift transition already
      // passes through, rather than needing each shift-based chapter (Ch.1,
      // Ch.3's PATROL/Fire path, Ch.5, Ch.7, Ch.9) to know to ask it itself.
      // While Chapter 1 hasn't yet resolved (ch1Done still false) AND the
      // player has already seen the debut prompt once, this off-duty
      // completion is the end of a Ch.1 shift specifically — route to the
      // post-shift conversation (campaignCh1SupervisorTalk, then Partner
      // Talk/campaignCh1End) instead of straight back to another arrival
      // prompt; Ch.1End's own "not yet" choice loops back to
      // campaignArrivalPrompt for another shift. Ch.2/4/6/8 are classroom-
      // only chapters entered/exited via direct phase handoff and never
      // reach offDuty at all, so this branch only ever fires during the
      // shift-based stretches, exactly as intended.
      // Chapter 8's field internship (§8.2) reuses this exact same "seed a
      // career queue, run it through the ordinary station/kit/scene loop"
      // shape Ch.1 established, so it needs the identical shift-boundary
      // hook: ch8InternshipActive is set the moment campaignCh8Internship
      // seeds its one queue, and offDuty is the one place every shift
      // boundary already passes through, campaign or not.
      const nextPhase=s.learningMode!=="zth"?"gmodePick"
        :s.ch8InternshipActive?"campaignCh8InternshipReview"
        :(s.arrivalPromptSeen&&!s.ch1Done)?"campaignCh1SupervisorTalk":"campaignArrivalPrompt";
      const next={...blank(),...carry(s),phase:nextPhase,money:(s.money||0)+(o.effects.money||0),
        speedBoost:Math.max(0.5,(s.speedBoost||1)-(o.effects.speedBoost||0)),
        fatigue:clampFatigue((s.fatigue||0)+(o.effects.fatigue||0)),
        ch8InternshipActive:0};
      writeSave(next.saveId,next,{name:next.saveName,gmode:null,level:next.level});
      return next;});
    // §1.4.1: "Off shift, players can go hang out, call them, talk with
    // them, text them." An additive side-action, not a replacement for the
    // Rest/Train/Family choice above — calling a relationship doesn't
    // consume the off-duty action, so it renders separately and doesn't
    // touch `pick`/OFF_DUTY at all. Only wired for partner_patrol this
    // batch (the one relationship this batch creates); the block simply
    // doesn't render for any save where it isn't met yet (non-campaign
    // saves, or a campaign save that hasn't reached campaignIntro).
    const partnerRel=g.learningMode==="zth"?g.relationships?.partner_patrol:null;
    const CALL_CHOICES=[
      {id:"talk",label:"Actually talk — ask how they're doing",
        desc:"Not just a status update. A real conversation.",friendshipDelta:5,romanceDelta:1},
      {id:"light",label:"Quick call, keep it light",
        desc:"Catch up for a few minutes without going deep.",friendshipDelta:1,romanceDelta:0},
    ];
    const callChoice=(c)=>setG(s=>{
      const rel=s.relationships?.partner_patrol; if(!rel) return s;
      const before=wasQuietMomentEligible(rel);
      const after=adjustRomance(adjustFriendship(rel,c.friendshipDelta),c.romanceDelta);
      const newMoment=!before&&wasQuietMomentEligible(after);
      const extraLog=newMoment
        ?[{t:s.t,kind:"obs",text:`💞 A quiet, unremarkable moment with ${after.name} that you'll remember longer than you expect.`}]:[];
      // §1.5.2: relationship milestones move crew-wide morale, same as the
      // downtime-event quiet-moment trigger above.
      const morale=(newMoment&&s.gmode==="career")?clampMorale((s.morale??50)+5):s.morale;
      return {...s,relCallOpen:0,relationships:{...s.relationships,partner_patrol:after},morale,
        log:[...s.log,...extraLog]};});
    // F33 follow-up: VN treatment for zth specifically — Master-of-Scope/
    // plain Career off-duty screens aren't part of the campus story, so
    // they keep the original plain dark-card UI unchanged; only zth gets a
    // background + the partner's sprite while a call is in progress.
    const zthVN=g.learningMode==="zth";
    const partnerSrc=zthVN&&partnerRel?portraitFor({role:partnerRel.role,gender:partnerRel.gender,name:partnerRel.name}):null;
    // F8: the player's own layered portrait, shown in their own dorm room —
    // always at full brightness (unlike the partner sprite's faded/bright
    // toggle, which represents whether a call is actually in progress; the
    // player is always genuinely "there").
    const playerLayers=zthVN?playerPortraitLayers(g.playerGender,g.campaignAppearance):null;
    const body=(<>
      <div className={zthVN?"":"f1"} style={zthVN?{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.amber}:{fontFamily:MONO,fontSize:11,letterSpacing:".26em",color:C.dim}}>OFF DUTY</div>
      <div className="f1" style={{fontSize:14,color:zthVN?"#C9BFA8":C.dim,marginTop:10,lineHeight:1.7}}>
        The shift's over. What do you do with the time before the next one?</div>
      {partnerRel&&<div className="f2 mt-5 p-3 rounded" style={{background:zthVN?"rgba(27,36,43,0.9)":C.panel,border:`1px solid ${C.line}`}}>
        {g.relCallOpen?<>
          <div style={{fontSize:13,color:C.dim,marginBottom:8}}>Calling {firstName(partnerRel.name)||partnerRel.name}…</div>
          <div className="flex flex-col gap-2">
            {CALL_CHOICES.map(c=>(<button key={c.id} onClick={()=>callChoice(c)} className="text-left px-4 py-3 rounded"
              style={{background:zthVN?"rgba(20,26,31,0.9)":C.panelHi,border:`1px solid ${C.line}`}}>
              <div style={{fontSize:14,fontWeight:500,color:zthVN?"#EDE7DA":C.text}}>{c.label}</div>
              <div style={{fontSize:12,color:C.dim,marginTop:2,lineHeight:1.5}}>{c.desc}</div></button>))}
          </div>
        </>:
          <button onClick={()=>setG(s=>({...s,relCallOpen:1}))} className="text-left w-full px-1 py-1"
            style={{background:"transparent",border:"none"}}>
            <div style={{fontSize:15,fontWeight:600,color:zthVN?"#EDE7DA":C.text}}>Call {firstName(partnerRel.name)||partnerRel.name}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:2}}>{friendshipTier(partnerRel.friendship)}</div>
          </button>}
      </div>}
      <div className="f2 flex flex-col gap-2 mt-6">
        {OFF_DUTY.map(o=>(<button key={o.id} onClick={()=>pick(o)} className="text-left px-4 py-3 rounded"
          style={{background:zthVN?"rgba(27,36,43,0.9)":C.panelHi,border:`1px solid ${C.line}`}}>
          <div style={{fontSize:15,fontWeight:600,color:zthVN?"#EDE7DA":C.text}}>{o.label}</div>
          <div style={{fontSize:12,color:C.dim,marginTop:3,lineHeight:1.5}}>{o.desc}</div></button>))}
      </div>
    </>);
    if(zthVN) return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom} dim={0.45}>
      <div style={{display:"flex"}}>
        <VNSprite layers={playerLayers} side="left"/>
        <VNSprite src={partnerSrc} side="right" faded={!g.relCallOpen}/>
      </div>
      <VNBox wide>{body}</VNBox>
    </VNScene></Shell>);
    return (<Shell g={g} setG={setG} css={css}><div style={{maxWidth:560,margin:"0 auto",paddingTop:70}}>{body}</div></Shell>);
  }

  /* ═══ CHAPTER 7 — AEMT: "New Responsibilities" (§1.6.8.3, Ch.7 script).
     Built backwards from Ch.10 per operator instruction, while a separate
     concurrent batch builds Chapters 1-6 forward — see CLAUDE.md's queue
     for the current handoff state. ENTRY ASSUMPTION: reached from Ch.6's
     own "AEMT certified" ending (g.level==="aemt"), or — per §1.6.8.1's
     "AEMT is now optional" revision — a Ch.6 "skip AEMT" branch that lands
     here with g.level still "emt". Every read below uses g.level rather
     than assuming either value, so both entry shapes are safe. Dialogue is
     PLACEHOLDER throughout ("*Placeholder — ...*"), matching Ch.5's own
     shipped convention exactly — structure and mechanics are real.
     Chapters 8 (Paramedic School), 9 (open world) and 10 (Advanced Roles)
     are NOT built yet — filed as a queue item (CLAUDE.md §6) rather than
     left as silent unfinished work; campaign.js already carries the data/
     formulas (ADVOCATE_POOL, CH8_ROTATIONS, CH8_FTO, CCP_TUITION,
     FLIGHT_TUITION, etc.) and achievements.js already carries their
     achievement definitions, both declared now and wired to nothing yet —
     the SAME "declared defensively, wired once the chapter lands" pattern
     Ch.5's own chapter3Path/emrCalls fields used before Chapters 1-4
     existed. campaignCh7End currently hands off to "shiftSummary" (ordinary
     Career play) rather than a real Ch.8 entry, for the same reason. ═══ */

  // §1.6.8.3 — draw (once) the paramedic-program advocate from the eligible
  // pool. Idempotent: returns {} if a draw was already made. job_supervisor's
  // identity isn't in ADVOCATE_POOL (it already lives per-employer on
  // CH5_EMPLOYERS, §1.9) — resolved here instead of a second source of truth.
  const drawParamedicAdvocate=(s)=>{
    if(s.paramedicAdvocate) return {};
    const eligible=ADVOCATE_POOL.filter(p=>p.eligible(s));
    const pick=eligible[Math.floor(Math.random()*eligible.length)]||ADVOCATE_POOL[0];
    // job_supervisor's identity already lives in g.relationships (created at
    // campaignCh5EmployerIntro) if the player is employed yet; every other
    // role resolves straight off the campaign-start-drawn campaignNames.
    let name=pick.relationshipId==="job_supervisor"
      ?(s.relationships?.job_supervisor?.name||campaignName(s,"job_supervisor"))
      :campaignName(s,pick.relationshipId);
    let gender=pick.relationshipId==="job_supervisor"
      ?(s.relationships?.job_supervisor?.gender||campaignGender(s,"job_supervisor"))
      :campaignGender(s,pick.relationshipId);
    const relationships={...(s.relationships||{})};
    if(name&&pick.relationshipId!=="job_supervisor"){
      relationships[pick.relationshipId]=s.relationships?.[pick.relationshipId]||
        createRelationship({name,role:pick.role,gender,startFriendship:10});
    }
    return {relationships,paramedicAdvocate:{role:pick.role,relationshipId:pick.relationshipId,name,gender}};
  }

  if(g.phase==="campaignCh7Intro"){
    const partner=g.relationships?.partner_patrol;
    const partnerFirst=firstName(partner?.name)||"your partner";
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationGarage}>
      <VNHeader title="NEW RESPONSIBILITIES"/>
      <VNBox wide>
        <VNDialogue key="ch7Intro" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the weight of AEMT-level leadership landing for real: IV/IO access, the limited medication set, a supraglottic airway device now genuinely available on scene (design doc §7.1).*"},
            {speaker:partnerFirst,text:`*Placeholder — ${partnerFirst} (or whoever's riding along) noticing the felt difference on a real call — "Good to have the extra hands that can actually do something."*`},
            {text:"*Placeholder — a burnout-caution beat, checking in on pace now that the responsibility is heavier (design doc §7.1).*"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh7Advocate"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh7Advocate"){
    // The random draw itself must happen inside an event handler, not
    // during render (React's purity rule — Math.random() in the render
    // path is exactly the "impure render" defect class CLAUDE.md's own
    // history has fixed before). Two-stage: an envelope-opening beat with
    // no name in it yet (safe to render before the draw exists), then a
    // reveal beat that only ever reads the now-persisted g.paramedicAdvocate.
    const advocate=g.paramedicAdvocate;
    const reveal=()=>setG(s=>({...s,...drawParamedicAdvocate(s)}));
    if(!advocate) return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="A NAME ON THE LETTERHEAD"/>
      <VNBox wide>
        <VNDialogue key="ch7AdvocatePre" doneLabel="Open the envelope" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the reveal beat (design doc §1.6.8.3/§7.2): the medical director of the paramedic program you'll eventually apply to turns out to be someone you already know.*"},
          ]} onDone={reveal}/>
      </VNBox>
    </VNScene></Shell>);
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="A NAME ON THE LETTERHEAD"/>
      <VNBox wide>
        <VNDialogue key="ch7AdvocateReveal" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:`It's ${advocate.name} — your ${(advocate.role||"advocate").toLowerCase()}.`},
            {text:"*Placeholder — the player's own reaction, colored by however that relationship actually stands right now.*"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh7End"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh7End"){
    const floor=paramedicApplicationFloor(g.calls911,g.aemtCalls,g.iftCalls,g.eventCalls);
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 7"/>
      <VNBox wide>
        <VNDialogue key="ch7End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a closing beat naming the accumulating call experience (design doc §7.2) — every call at AEMT scope is now genuinely moving the needle toward Paramedic school.*"},
            {text:floor>=PARAMEDIC_APPLICATION_FLOOR_MIN
              ?"You've put in enough real work to apply. Paramedic school (Chapter 8) is a real, reachable next step whenever you're ready — not yet built; see CLAUDE.md's queue."
              :"Not quite enough experience to apply yet — a few more shifts and you will be."},
          ]}
          // Returns to ordinary Career play; Chapter 8 is reached from
          // shiftSummary's own conditional re-entry button (see the
          // "Apply to Paramedic school" button, above) once
          // paramedicApplicationFloor is actually met — not a hard redirect
          // here, since the floor might not be crossed yet, same shape the
          // dialogue text above already uses.
          onDone={()=>setG(s=>({...s,ch7Done:1,phase:"shiftSummary"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 8 — PARAMEDIC SCHOOL: "THE LONG HAUL" (design doc §1.6.8 and
     the doc's own Chapter 8 section, §8.1-§8.6). Structural content, real
     mechanics, PLACEHOLDER dialogue throughout, same convention as every
     other campaign-chapter batch.

     Flow: campaignCh8Intro (framing; names the advocate if one was drawn in
     Ch.7 and friendship crossed ADVOCATE_FRIENDSHIP_FLOOR) ->
     campaignCh8Apply (the real application-floor gate, paramedicApplicationFloor,
     §1.6.8.1) -> campaignCh8EntranceExam (a stat-driven placeholder roll,
     same shared-roll convention every other tier's exam uses) ->
     campaignCh8Interview -> campaignCh8Wait (a real suspense beat —
     deliberately does NOT show the computed percentage, per §8.1's own
     "a player should feel suspense" note) -> campaignCh8AdmissionResult
     (rolls paramedicAdmissionChance for real; on rejection, a real "which
     lever moves the needle" beat per §8.1, not a game over, and the player
     can retry via shiftSummary's own re-entry button) -> on admission,
     campaignCh8Rotations (a SELF-ADVANCING dispatcher over CH8_ROTATIONS —
     ed/icu/obgyn/or/psych — that redirects straight to
     campaignCh8Internship once every rotation is done, so re-entering this
     phase after a save/reload or the shiftSummary button always picks up
     wherever ch8RotationIdx left off) -> campaignCh8Internship (§8.2's
     field-internship capstone under FTO Diego Salcedo: seeds ONE real
     career queue of CH8_INTERNSHIP_CALLS_REQUIRED calls, run through the
     ordinary station/kit/scene loop exactly like any other shift) ->
     campaignCh8InternshipReview (reached automatically via offDuty's own
     ch8InternshipActive hook once that shift resolves — grades the
     just-finished calls, no separate mid-shift bookkeeping needed) ->
     campaignCh8FinalExam/campaignCh8FinalExamResult (the paramedic-tier
     cognitive/field exam gauntlet, §1.6.10's weighting: EXAM_FIELD_WEIGHT.
     paramedic=0.55, the one tier where written reasoning outweighs
     psychomotor score) -> campaignCh8End, which hands off to
     campaignCh9Intro.

     Entry point: shiftSummary's own conditional "Apply to Paramedic school"
     button (above), reachable either after Ch.7 or directly once AEMT was
     skipped, per the design doc's own "Ch6/Ch7 optional branch" amendment.
     ═══════════════════════════════════════════════════════════════════ */

  if(g.phase==="campaignCh8Intro"){
    const advId=g.paramedicAdvocate?.relationshipId;
    const advFriendship=advId?g.relationships?.[advId]?.friendship:null;
    const advocateNote=(advId&&advFriendship!=null&&advFriendship>=ADVOCATE_FRIENDSHIP_FLOOR)
      ?`*Placeholder — ${firstName(g.paramedicAdvocate?.name)||"your advocate"} already mentioned they'd put in a good word once you applied.*`
      :null;
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="PARAMEDIC SCHOOL — THE LONG HAUL"/>
      <VNBox wide>
        <VNDialogue key="ch8Intro" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:g.aemtCertified
              ?"*Placeholder — enough real AEMT-scope calls behind you now to actually apply. Twelve to eighteen months, the longest single step yet (design doc §8).*"
              :"*Placeholder — applying straight from EMT, skipping the AEMT bridge. Harder odds, but not a closed door (design doc §1.6.8.1).*"},
            ...(advocateNote?[{text:advocateNote}]:[]),
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh8Apply"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8Apply"){
    const floor=paramedicApplicationFloor(g.calls911,g.aemtCalls,g.iftCalls,g.eventCalls);
    const eligible=floor>=PARAMEDIC_APPLICATION_FLOOR_MIN;
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="SUBMITTING THE APPLICATION"/>
      <VNBox wide>
        <div style={{fontSize:13.5,lineHeight:1.7,marginBottom:14}}>
          {eligible?"Your call history clears the bar to apply.":
            `Not quite enough call experience yet (need ${PARAMEDIC_APPLICATION_FLOOR_MIN}, at ${floor.toFixed(1)}) — a few more shifts first.`}</div>
        {eligible&&<button onClick={()=>setG(s=>({...s,phase:"campaignCh8EntranceExam"}))} className="px-6 py-2.5 rounded"
          style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Submit application</button>}
        {!eligible&&<button onClick={()=>setG(s=>({...s,phase:"shiftSummary"}))} className="px-6 py-2.5 rounded"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>Back to work</button>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8EntranceExam"){
    const run=()=>setG(s=>{
      const score=Math.round(examFieldScore(rollExamFieldScore(3,s.confidence,s.knowledge)));
      return {...s,ch8EntranceExamScore:score,phase:"campaignCh8Interview"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="ENTRANCE EXAM"/>
      <VNBox wide>
        <VNDialogue key="ch8Entrance" doneLabel="Sit the exam" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the program's own entrance exam: a mix of cognitive screening and a few field-judgment scenarios (design doc §8.1).*"},
          ]} onDone={run}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8Interview"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="THE INTERVIEW"/>
      <VNBox wide>
        <VNDialogue key="ch8Interview" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:`*Placeholder — a short interview beat, colored by confidence (${g.confidence??10}) and ambition (${g.ambition??10}) — design doc §8.1.*`},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh8Wait"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8Wait"){
    // The roll itself happens on "open the letter," an event handler, not
    // during render — same discipline campaignCh7Advocate's own comment
    // documents (React's purity rule). Deliberately does NOT surface the
    // computed percentage anywhere in this phase, per §8.1's own "a player
    // should feel suspense, not read a number" instruction.
    const openLetter=()=>setG(s=>{
      const advId=s.paramedicAdvocate?.relationshipId;
      const primary=advId?s.relationships?.[advId]?.friendship:null;
      const secondary=ADVOCATE_POOL.filter(p=>p.relationshipId!==advId)
        .map(p=>s.relationships?.[p.relationshipId]?.friendship).filter(f=>f!=null);
      const chance=paramedicAdmissionChance({
        reputation:s.reputation,certLevel:s.aemtCertified?"aemt":"emt",
        emrCalls:s.emrCalls,iftCalls:s.iftCalls,eventCalls:s.eventCalls,calls911:s.calls911,aemtCalls:s.aemtCalls,
        certifications:new Set(s.certifications||[]),entranceExamScore:s.ch8EntranceExamScore,
        primaryAdvocateFriendship:primary,secondaryAdvocateFriendships:secondary});
      const admitted=Math.random()*100<chance;
      const nextAttempts=(s.paramedicApplicationAttempts||0)+1;
      let patch={paramedicApplicationAttempts:nextAttempts,ch8AdmissionChance:chance};
      const flags={};
      if(admitted){
        patch.paramedicAdmitted=1; patch.paramedicAdmittedWithoutAemt=!s.aemtCertified;
        flags.paramedicAdmittedWithoutAemt=!s.aemtCertified;
      }
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,...patch,phase:"campaignCh8AdmissionResult",toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="THE WAIT"/>
      <VNBox wide>
        <VNDialogue key="ch8Wait" doneLabel="Open the letter" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the genuine wait-for-the-letter beat design doc §8.1 asks for. Days of checking the mailbox, narrated, not skipped past.*"},
          ]} onDone={openLetter}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8AdmissionResult"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="THE LETTER"/>
      <VNBox wide>
        {g.paramedicAdmitted?<>
          <div style={{fontSize:16,fontWeight:600,color:C.hr}}>You're in.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — a real, earned acceptance beat (design doc §8.1). Whoever put in a good word gets a
            real acknowledgment here, not just an invisible number.*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh8Rotations"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
        </>:<>
          <div style={{fontSize:16,fontWeight:600,color:C.red}}>Not this cycle.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — an honest, non-catastrophic disappointment beat (design doc §8.1's "rejection is not
            permanent"). More calls, an optional cert, AEMT if you skipped it, or just more reputation would
            each move the needle — whichever fits your build.*</div>
          <button onClick={()=>setG(s=>({...s,phase:"shiftSummary"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>Back to work</button>
        </>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8Rotations"){
    // A dispatcher over CH8_ROTATIONS, keyed on ch8RotationIdx — this is
    // what makes the shiftSummary re-entry button (and a save/reload) safe
    // to always point here regardless of how far rotations have gotten.
    // Once every entry is done, a plain "Continue" button (an event
    // handler, not a render-time setG — the impure-render pattern this
    // project's own history has fixed before, e.g. the Prologue's finale
    // scene) moves on to the internship capstone.
    if((g.ch8RotationIdx||0)>=CH8_ROTATIONS.length)
      return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
        <VNHeader title="ROTATIONS COMPLETE"/>
        <VNBox wide>
          <div style={{fontSize:13.5,lineHeight:1.7,marginBottom:14}}>
            *Placeholder — all five clinical rotations behind you (design doc §8.2). The field internship is next.*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh8Internship"}))} className="px-6 py-2.5 rounded"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
        </VNBox>
      </VNScene></Shell>);
    const rot=CH8_ROTATIONS[g.ch8RotationIdx||0];
    // ED's preceptor is whichever ADVOCATE_POOL "ER physician" candidate the
    // game hasn't already leaned on — reads back the SAME advocate_er
    // relationship Ch.7's draw may have already created, per §1.9's own
    // "whichever the game hasn't already leaned on more" note, rather than
    // a second, independent name.
    const preceptor=rot.fixedPreceptor
      ?{name:campaignName(g,rot.fixedPreceptor.slotId),gender:rot.fixedPreceptor.gender}
      :(g.relationships?.advocate_er?{name:g.relationships.advocate_er.name,gender:g.relationships.advocate_er.gender}
        :{name:campaignName(g,"advocate_er"),gender:campaignGender(g,"advocate_er")});
    const advanceRotation=()=>setG(s=>({...s,ch8RotationIdx:(s.ch8RotationIdx||0)+1,ch8IntubationAttempts:0}));
    if(rot.id==="or"){
      const attempts=g.ch8IntubationAttempts||0, successes=g.ch8IntubationCount||0;
      const target=rot.intubationTarget||5;
      const done=successes>=target||attempts>=8;
      const attempt=()=>setG(s=>{
        const chance=Math.max(0.2,Math.min(0.9,0.5+((s.confidence??10)-10)*0.02+((s.fitness??10)-10)*0.02));
        const ok=Math.random()<chance;
        return {...s,ch8IntubationAttempts:(s.ch8IntubationAttempts||0)+1,
          ch8IntubationCount:(s.ch8IntubationCount||0)+(ok?1:0)};
      });
      const finishOr=()=>setG(s=>{
        const flags={ch8IntubationTargetMet:(s.ch8IntubationCount||0)>=target&&(s.ch8IntubationAttempts||0)<=target};
        const unlocked=newlyUnlocked(flags,s.achievements||[]);
        const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
        return {...s,ch8RotationIdx:(s.ch8RotationIdx||0)+1,ch8IntubationAttempts:0,toastQueue,
          achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
      });
      return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
        <VNHeader title={rot.label.toUpperCase()}/>
        <VNBox wide>
          <div style={{fontSize:13,color:C.dim,fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>
            *Placeholder — {preceptor.name} precepts. The one clinical scene meant to feel genuinely tense
            (design doc §8.2) — a hard numeric target, not a soft time-passed beat.*</div>
          <div style={{fontFamily:MONO,fontSize:12,color:C.hr,marginBottom:12}}>
            Successful intubations: {successes}/{target} (attempt {attempts})</div>
          {!done
            ?<button onClick={attempt} className="px-6 py-2.5 rounded"
                style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Attempt intubation</button>
            :<button onClick={finishOr} className="px-6 py-2.5 rounded"
                style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>
                {successes>=target?"Clean run — continue":"Needed the extension — continue"}</button>}
        </VNBox>
      </VNScene></Shell>);
    }
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title={rot.label.toUpperCase()}/>
      <VNBox wide>
        <VNDialogue key={`ch8Rot-${rot.id}`} doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:`*Placeholder — ${preceptor.name} precepts (design doc §8.2). At least two or three real exchanges specific to this rotation's own flavor.*`},
          ]} onDone={advanceRotation}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8Internship"){
    const begin=()=>setG(s=>{
      const pool=Object.keys(SCEN).filter(k=>k!=="baseline");
      const queue=[...pool].sort(()=>Math.random()-.5).slice(0,CH8_INTERNSHIP_CALLS_REQUIRED);
      return {...s,career:{queue,idx:0,results:[]},ch8InternshipActive:1,scopeLocked:1,
        loadoutSelection:null,supplyStock:null,truckReserve:null,callsSinceLoadoutRefresh:0,phase:"station",stationBoardOpen:false};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationGarage}>
      <VNHeader title="FIELD INTERNSHIP"/>
      <VNBox wide>
        <VNDialogue key="ch8Internship" doneLabel="Begin" onLineChange={vnLineChange(setG)} lines={[
            {text:`*Placeholder — ${campaignName(g,CH8_FTO.slotId)}, your FTO for the capstone: ${CH8_INTERNSHIP_CALLS_REQUIRED} team-lead calls, evaluated for real (design doc §8.2). 12-lead interpretation acting on a real diagnosis, appropriate medication administration, team leadership.*`},
          ]} onDone={begin}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8InternshipReview"){
    const results=g.career?.results||[];
    const correctPct=results.length?Math.round(100*results.filter(r=>r.correct&&!r.died).length/results.length):0;
    const clean=correctPct>=70;
    const finish=()=>setG(s=>{
      const flags={ch8InternshipClean:clean&&!s.ch8InternshipRepeated};
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,ch8InternshipDone:1,ch8InternshipRepeated:clean?s.ch8InternshipRepeated:1,
        toastQueue,achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,
        phase:"campaignCh8FinalExam"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title={`${campaignName(g,CH8_FTO.slotId).toUpperCase()} — CAPSTONE REVIEW`}/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:12,color:clean?C.hr:C.amber,marginBottom:10}}>
          {results.length} calls run · {correctPct}% correctly identified/managed</div>
        <div style={{fontSize:13.5,lineHeight:1.7,marginBottom:14}}>
          {clean?"*Placeholder — a clean capstone. FTO Salcedo signs off without reservation (design doc §8.2).*"
            :"*Placeholder — a real, honest critique. Not a fail, but a repeat rotation is recommended before the final exam (design doc §8.2's own competency checklist).*"}</div>
        <button onClick={finish} className="px-6 py-2.5 rounded"
          style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8FinalExam"){
    const attempts=g.paramedicFinalExamAttempts||0;
    const run=()=>setG(s=>{
      const fieldScores=rollExamFieldScore(EXAM_FIELD_SCENARIOS.paramedic,s.confidence,s.knowledge);
      const fieldScore=Math.round(examFieldScore(fieldScores));
      const written=rollWrittenQuiz(EXAM_WRITTEN_QUESTIONS.paramedic,s.knowledge);
      const combined=Math.round(examCombinedScore(fieldScore,written.correct,written.total,EXAM_FIELD_WEIGHT.paramedic));
      const passed=examPass(combined,"paramedic");
      const nextAttempts=(s.paramedicFinalExamAttempts||0)+1;
      let patch={paramedicFinalExamAttempts:nextAttempts,ch8FinalExamFieldScore:fieldScore,
        ch8FinalExamWrittenCorrect:written.correct,ch8FinalExamWrittenTotal:written.total,
        ch8FinalExamCombinedScore:combined,ch8FinalExamOutcome:passed?"pass":"fail"};
      const flags={};
      if(passed){
        patch.knowledge=(s.knowledge??10)+15; patch.confidence=(s.confidence??10)+10;
        patch.reputation=clampReputation((s.reputation||0)+20); patch.paramedicCertified=true; patch.level="paramedic";
        patch.paramedicCertCallsSnapshot=s.lifetimeStats?.callsRun||0;
        flags.paramedicCertified=true;
        flags.keptItProfessional=Object.values(s.relationships||{}).filter(r=>(r.friendship||0)>=65).length>=3
          &&Object.values(s.relationships||{}).every(r=>(r.romance||0)<35);
      } else {
        const pen=examFailurePenalty(nextAttempts);
        patch.reputation=clampReputation((s.reputation||0)+pen.reputationDelta);
        patch.knowledge=(s.knowledge??10)+pen.knowledgeDelta;
      }
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,...patch,phase:"campaignCh8FinalExamResult",toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="PARAMEDIC CERTIFICATION — THE GAUNTLET"/>
      <VNBox wide>
        <VNDialogue key={`ch8Final-${attempts}`} doneLabel="Take the exam" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — 6 paramedic-scope field scenarios plus an 8-question written component, weighted 55/45 toward the written for the first time in the ladder (design doc §1.6.10) — this is the tier where cognitive reasoning finally outweighs raw psychomotor score.*"},
            {text:attempts>0?`(Attempt ${attempts+1}.)`:"(Everything since the Prologue has been leading here.)"},
          ]} onDone={run}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8FinalExamResult"){
    const outcome=g.ch8FinalExamOutcome;
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="PARAMEDIC CERTIFICATION — RESULT"/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginBottom:10}}>
          Field: {g.ch8FinalExamFieldScore}/100 · Written: {g.ch8FinalExamWrittenCorrect}/{g.ch8FinalExamWrittenTotal} ·
          Combined: {g.ch8FinalExamCombinedScore}/100 (need {EXAM_PASS_THRESHOLD.paramedic})</div>
        {outcome==="pass"?<>
          <div style={{fontSize:16,fontWeight:600,color:C.hr}}>Pass. You're a Paramedic.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — the gold-patch moment itself (design doc §1.6.8). The long haul, actually over.*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh8End"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Continue</button>
        </>:<>
          <div style={{fontSize:16,fontWeight:600,color:C.red}}>Not this time.</div>
          <div style={{fontSize:13,color:C.dim,marginTop:8,lineHeight:1.7}}>
            *Placeholder — a real remediation beat (design doc §1.6.8). Not permanent.*</div>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh8FinalExam"}))} className="px-6 py-2.5 rounded mt-5"
            style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>Retake the exam</button>
        </>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh8End"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 8"/>
      <VNBox wide>
        <VNDialogue key="ch8End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a closing beat: gold patch on the bag, the long haul behind you (design doc §8).*"},
            {text:"*Placeholder — connective text into Chapter 9 (Paramedic: The Real Deal — the open world, no forced ending).*"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh9Intro"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 9 — PARAMEDIC: "THE REAL DEAL" (design doc §9.1-§9.3). Open
     world, explicitly NO forced ending — this is deliberately the thinnest
     chapter in the ladder: a one-time welcome/orientation beat
     (campaignCh9Intro), then a persistent HUB (campaignCh9Hub) the player
     can return to at will via a shiftSummary button (added below, same
     re-entry idiom every other chapter's own button already uses) for
     housing upgrades (§1.6.2.2) and mentoring a lower-tier classmate
     (§9.1's taught_the_teacher hook) — everything else about "the real
     deal" (veteran-medic downtime-event texture, mentoring's own content,
     the postCertCalls/still_here long-haul achievement) is either already
     covered by existing systems (the downtime-event roll, creditOutcome's
     own lifetimeStats.callsRun tracking) or deliberately left as future
     content, not a missing mechanic — see design doc §9.1's own "none of
     this needs new mechanics" note. ═══════════════════════════════════ */

  if(g.phase==="campaignCh9Intro"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="THE REAL DEAL"/>
      <VNBox wide>
        <VNDialogue key="ch9Intro" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a real welcome-to-the-open-world beat: no more chapters ahead with a fixed shape, just the job now (design doc §9.1). Optional Advanced Roles (Critical Care, Flight) are there whenever you want them, not required.*"},
          ]} onDone={()=>setG(s=>({...s,ch9Reached:1,paramedicCertCallsSnapshot:g.lifetimeStats?.callsRun||g.paramedicCertCallsSnapshot||0,phase:"campaignCh9Hub"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh9Hub"){
    const postCertCalls=Math.max(0,(g.lifetimeStats?.callsRun||0)-(g.paramedicCertCallsSnapshot||0));
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="PARAMEDIC — OPEN WORLD"/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginBottom:14}}>
          {postCertCalls} calls run since certification.</div>
        <div className="flex flex-col gap-2">
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh9Mentor"}))} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600}}>Mentor a lower-tier classmate</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>Precept a practice-scenario session (design doc §9.1).</div>
          </button>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh9Housing"}))} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600}}>Off-duty lifestyle (housing, ${g.money||0} on hand)</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>Current tier: {HOUSING_TIERS[g.housingTier||"dorm"]?g.housingTier:"dorm"} (design doc §1.6.2.2).</div>
          </button>
          {!g.advancedRole&&<button onClick={()=>setG(s=>({...s,phase:"campaignCh10Intro"}))} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.amber}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600,color:C.amber}}>Advanced Roles — Critical Care / Flight (optional)</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>Chapter 10 (design doc §10.1).</div>
          </button>}
          <button onClick={()=>setG(s=>({...s,phase:"shiftSummary"}))} className="text-left px-4 py-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13.5}}>
            Back to work</button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh9Mentor"){
    const finish=()=>setG(s=>{
      const flags={ch9MentorCount:(s.ch9MentorCount||0)+1};
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,ch9MentorCount:(s.ch9MentorCount||0)+1,knowledge:(s.knowledge??10)+1,
        reputation:clampReputation((s.reputation||0)+1),toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,phase:"campaignCh9Hub"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="TEACHING THE TEACHER"/>
      <VNBox wide>
        <VNDialogue key="ch9Mentor" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — a real mentoring beat: a newer EMT/AEMT, a practice scenario, your own hard-won reasoning finally paying it forward (design doc §9.1).*"},
          ]} onDone={finish}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh9Housing"){
    const pick=(tierId)=>setG(s=>{
      const tier=HOUSING_TIERS[tierId];
      if(!tier) return s;
      const money=(s.money||0)-tier.cost;
      if(money<0) return s;
      const flags={housingTier:tierId};
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,housingTier:tierId,money,
        mortgage:tierId==="house"?Math.round(tier.cost*0.1):s.mortgage,
        toastQueue,achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    const buyLifestyle=(key)=>setG(s=>{
      const item=LIFESTYLE_PURCHASES[key];
      const cost=item.cost??Math.round(item.costMin+Math.random()*(item.costMax-item.costMin));
      if((s.money||0)<cost) return s;
      const patch={money:(s.money||0)-cost};
      if(key==="vehicle") patch.hasVehicle=1; if(key==="pet") patch.hasPet=1;
      if(key==="homeGym") patch.hasHomeGym=1; if(key==="studyDesk") patch.hasStudyDesk=1;
      const flags={hasPet:key==="pet"?true:s.hasPet};
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,...patch,toastQueue,achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.dormRoom}>
      <VNHeader title="OFF-DUTY LIFESTYLE"/>
      <VNBox wide>
        <div style={{fontFamily:MONO,fontSize:11,color:C.dim,marginBottom:10}}>${g.money||0} on hand · housing: {g.housingTier||"dorm"}</div>
        <div className="flex flex-col gap-2">
          {Object.entries(HOUSING_TIERS).filter(([id])=>id!==(g.housingTier||"dorm")).map(([id,tier])=>(
            <button key={id} onClick={()=>pick(id)} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5}}>
              Move to {id.replace("_"," ")} — ${tier.cost}{tier.recurring?` (+$${tier.recurring}/shift)`:tier.cost===8000?" (mortgage, 10%/shift)":""}
            </button>))}
          {Object.entries(LIFESTYLE_PURCHASES).map(([key])=>(
            <button key={key} onClick={()=>buyLifestyle(key)} className="text-left px-4 py-3 rounded"
              style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5}}>
              {key==="vehicle"?"Buy a personal vehicle":key==="pet"?"Adopt a pet":key==="homeGym"?"Home gym":"Study desk"}</button>))}
        </div>
        <button onClick={()=>setG(s=>({...s,phase:"campaignCh9Hub"}))} className="px-6 py-2.5 rounded mt-5"
          style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>Back</button>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHAPTER 10 — ADVANCED ROLES: CRITICAL CARE & FLIGHT (design doc §10.1-
     §10.2). Optional, reached only via campaignCh9Hub's own conditional
     button — no forced entry, matching Ch.9's own "no forced progression"
     framing. ═══════════════════════════════════════════════════════════ */

  if(g.phase==="campaignCh10Intro"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="ADVANCED ROLES"/>
      <VNBox wide>
        <VNDialogue key="ch10Intro" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — Critical Care and Flight, both optional, both a real additional certification on top of Paramedic (design doc §10.1).*"},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh10Choice"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh10Choice"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationOffice}>
      <VNHeader title="CRITICAL CARE OR FLIGHT"/>
      <VNBox wide>
        <div className="flex flex-col gap-2">
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh10CCP"}))} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600}}>Critical Care Paramedic</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>Tuition ${CCP_TUITION}. Ventilators, infusion pumps, invasive lines — long interfacility transports (design doc §10.1).</div>
          </button>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh10Flight"}))} className="text-left px-4 py-3 rounded"
            style={{background:"rgba(27,36,43,0.9)",border:`1px solid ${C.line}`,color:"#EDE7DA",fontSize:13.5,lineHeight:1.6}}>
            <div style={{fontWeight:600}}>Flight Medic</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>
              Tuition ${FLIGHT_TUITION}. Needs fitness {FLIGHT_FITNESS_MIN}+ (currently {g.fitness??10}) — a real physical fitness test, cabin-size/weight limits, altitude physiology (design doc §10.1).</div>
          </button>
          <button onClick={()=>setG(s=>({...s,phase:"campaignCh9Hub"}))} className="text-left px-4 py-3 rounded"
            style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>Not right now</button>
        </div>
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh10CCP"){
    const afford=(g.money||0)>=CCP_TUITION;
    const enroll=()=>setG(s=>{
      const flags={advancedRole:"ccp"};
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,money:(s.money||0)-CCP_TUITION,advancedRole:"ccp",ch10Done:1,toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,phase:"campaignCh10End"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="CRITICAL CARE PARAMEDIC"/>
      <VNBox wide>
        <VNDialogue key="ch10CCP" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the CCP course itself: ventilator management, infusion pumps, invasive line management, over long interfacility transports — a distinct call SHAPE (longer, more monitoring-over-time) rather than just a vehicle skin (design doc §10.1).*"},
          ]} onDone={()=>{}}/>
        {afford
          ?<button onClick={enroll} className="px-6 py-2.5 rounded mt-5"
              style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Pay tuition (${CCP_TUITION}) and certify</button>
          :<div style={{fontSize:13,color:C.amber,marginTop:14}}>Not enough saved yet (${g.money||0}/{CCP_TUITION}).</div>}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh10Flight"){
    const fitOk=(g.fitness??10)>=FLIGHT_FITNESS_MIN;
    const afford=(g.money||0)>=FLIGHT_TUITION;
    const enroll=()=>setG(s=>{
      const flags={advancedRole:"flight"};
      const unlocked=newlyUnlocked(flags,s.achievements||[]);
      const toastQueue=unlocked.length?[...(s.toastQueue||[]),...unlocked.map(id=>({id,at:Date.now()}))]:s.toastQueue;
      return {...s,money:(s.money||0)-FLIGHT_TUITION,advancedRole:"flight",ch10Done:1,toastQueue,
        achievements:unlocked.length?[...(s.achievements||[]),...unlocked]:s.achievements,phase:"campaignCh10End"};
    });
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationTraining}>
      <VNHeader title="FLIGHT MEDIC"/>
      <VNBox wide>
        <VNDialogue key="ch10Flight" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:"*Placeholder — the physical fitness test, a psych exam, a simulation gauntlet. A weight/size restriction beat tied to helicopter cabin constraints, and an altitude-physiology teaching beat (pneumothorax expansion, ET tube cuff pressure, IV rates) — design doc §10.1.*"},
          ]} onDone={()=>{}}/>
        {!fitOk&&<div style={{fontSize:13,color:C.amber,marginTop:14}}>
          Fitness test not yet cleared — need {FLIGHT_FITNESS_MIN}+, currently {g.fitness??10}.</div>}
        {fitOk&&(afford
          ?<button onClick={enroll} className="px-6 py-2.5 rounded mt-5"
              style={{background:"#16241C",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}>Pay tuition (${FLIGHT_TUITION}) and certify</button>
          :<div style={{fontSize:13,color:C.amber,marginTop:14}}>Not enough saved yet (${g.money||0}/{FLIGHT_TUITION}).</div>)}
      </VNBox>
    </VNScene></Shell>);
  }

  if(g.phase==="campaignCh10End"){
    return (<Shell g={g} setG={setG} css={css}><VNScene bg={BACKGROUNDS.stationExterior}>
      <VNHeader title="END OF CHAPTER 10"/>
      <VNBox wide>
        <VNDialogue key="ch10End" doneLabel="Continue" onLineChange={vnLineChange(setG)} lines={[
            {text:g.advancedRole==="ccp"
              ?"*Placeholder — a new rig, a new call shape, the CCT bird waiting on the next long transport (design doc §10.2).*"
              :"*Placeholder — the AirLink helicopter, waiting on the pad (design doc §10.2).*"},
            {text:"New vehicles, call types, and crew are layered onto the open world from here — no forced ending."},
          ]} onDone={()=>setG(s=>({...s,phase:"campaignCh9Hub"}))}/>
      </VNBox>
    </VNScene></Shell>);
  }

  /* ═══ SCENE / TRANSPORT — body LEFT, tabbed panel RIGHT ═══ */
  const V=physio(g), tp=g.phase==="transport";
  const A=acts(), inR=A.filter(a=>a.region===g.region);
  // Tab order derives from the order actions are emitted, but "General" is
  // body-part-independent and belongs at the FAR LEFT under every region. Pull it
  // to the front while preserving the order of the rest. (Display order only —
  // the selected tab still defaults to g.tab, which is "assess".)
  const tabsRaw=[...new Set(inR.map(a=>a.tab))];
  const tabs=tabsRaw.includes("general")?["general",...tabsRaw.filter(t=>t!=="general")]:tabsRaw;
  const tab=tabs.includes(g.tab)?g.tab:tabs[0];
  const rem=tp?effTransportTime(SC,g.destHospitalType,g)-g.transportT:SC.limit-(g.t-(g.onSceneAt??g.t));
  const ROWS=[["HR",C.hr],["PR",C.spo2],["BP (R)",C.bp],["BP (L)",C.bp],["SpO₂",C.spo2],["RR",C.rr],["EtCO₂",C.violet],["Glu",C.violet]];
  const gaps=ROWS.filter(([k])=>!g.vitals[k]).length;
  const stales=ROWS.filter(([k])=>g.vitals[k]&&g.t-g.vitals[k].at>STALE).length;
  const bystander={id:"bys",name:"Bystander",level:"layperson"};
  // F3: bystanders can be dismissed (declutters the crew tab once they've
  // called it in / handed off, or if they're just in the way), and any
  // lower-level provider can be assigned to "secure the scene" — a real
  // task (crowd control, traffic, keeping a hazard contained) that takes
  // them off the crew roster for orders, same spirit as a monitor task
  // that occupies a hand indefinitely.
  const crew=[...(!tp&&!g.bystanderDismissed?[bystander]:[]),
    ...g.crew.filter(c=>!c.pilot&&!(g.securedIds||[]).includes(c.id))];
  // MCI/roster support: roster() is a no-op single-entry list for every
  // ordinary scenario (see physiology.js), so this tab only appears once a
  // scenario actually declares more than one patient — a normal call's panel
  // row is completely unchanged.
  const rosterList=roster(g);
  const multiPatient=rosterList.length>1;
  const switchPatient=(id)=>setG(s=>{setActivePatient(s,id); return {...s,activePatientId:id};});
  const PANELS=[["actions","Actions"],...(multiPatient?[["triage",`Triage · ${rosterList.length}`]]:[]),
    ["crew",`Crew · ${crew.length}`],["monitor","Monitor"],
    [tp?"report":"transport",tp?"Report":"Transport"]];
  const TN={assess:"Assess",airway:"Airway",meds:"Meds",iv:"IV/IO",procedures:"Procedures",general:"General"};

  return (<Shell g={g} setG={setG} css={css} lights={tp&&g.code===3} full>
    {/* Voice-command mic indicator — only shown once the player has actually
        turned it on (settings), so it never appears as a mystery badge for
        everyone else. Color/text reflect useVoiceCommands' own real status,
        not a decorative always-green dot. */}
    {!!g.voiceCommandsEnabled&&<div title='Voice commands: say a crew member’s name then a task, or "Push/Give <drug or procedure>" for yourself'
      style={{position:"fixed",top:12,right:64,zIndex:60,background:"rgba(10,14,12,.85)",
        border:`1px solid ${voiceStatus==="listening"?C.hr:voiceStatus==="error"?C.red:C.line}`,borderRadius:8,
        color:voiceStatus==="listening"?C.hr:voiceStatus==="error"?C.red:C.dim,fontFamily:MONO,fontSize:11,
        padding:"7px 11px",backdropFilter:"blur(4px)"}}>
      🎙 {voiceStatus==="listening"?"listening":voiceStatus==="error"?"mic error":"starting…"}</div>}
    {/* A voice self-command (spec: "Push epinephrine") never executes
        directly — same "no parallel dispatch" discipline the crew-order
        voice path already follows. This box is the visible confirmation
        prompt the spec asked for, with real click targets too, so a
        player without (or between) mic input isn't stuck — Confirm/Deny
        here call the exact same setG paths a spoken "Confirm"/"Deny"
        would (useVoiceCommands' own onConfirm/onDeny, reused directly). */}
    {g.voicePendingAction&&<div style={{position:"fixed",top:64,right:12,zIndex:210,
      background:"#1A1408",border:`1px solid ${C.amber}`,borderRadius:8,padding:"10px 12px",
      maxWidth:280,fontFamily:MONO}}>
      <div style={{fontSize:12,color:C.amber,marginBottom:8}}>
        You want to {g.voicePendingAction.label.toLowerCase()}. Are you sure? Say Confirm or Deny.</div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{
            const a=voiceEligibleActions.find(x=>x.id===g.voicePendingAction?.id);
            if(a) start(a);
            voiceConfirmDeny(a?`RADIO: Confirmed, ${a.label.toLowerCase()}.`:"RADIO: That's no longer available, standing down.");
          }} className="px-3 py-1.5 rounded" style={{background:"#122A18",border:`1px solid ${C.hr}`,color:C.hr,fontSize:11.5,cursor:"pointer"}}>
          Confirm</button>
        <button onClick={()=>voiceConfirmDeny("RADIO: Denied, standing down.")}
          className="px-3 py-1.5 rounded" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:11.5,cursor:"pointer"}}>
          Deny</button>
      </div>
    </div>}
    {g.accessMinigame&&["iv","io"].includes(g.accessMinigame.kind)&&<AccessMinigame open kind={g.accessMinigame.kind} site={g.accessMinigame.site}
      attempts={g.accessMinigame.attempts||0} pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame} onDialogue={fireMinigameDialogue}/>}
    {g.accessMinigame&&["laryngoscopy","ett"].includes(g.accessMinigame.kind)&&<AirwayMinigame open kind={g.accessMinigame.kind}
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame} onDialogue={fireMinigameDialogue}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="cric"&&<CricMinigame open kind="cric"
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame} onDialogue={fireMinigameDialogue}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="splint"&&<SplintMinigame open kind="splint"
      site={g.accessMinigame.site} pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="bleedingControl"&&<BleedingControlMinigame open kind="bleedingControl"
      site={g.accessMinigame.site} isLimb={g.accessMinigame.isLimb} availableCrew={g.accessMinigame.availableCrew}
      pat={g.patient} assist={g.procedureAssist}
      onDirectCrew={directHoldPressure} onReleaseCrew={releaseHoldPressure}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="bp"&&<BpMinigame open kind="bp"
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="proc"&&<ProcMinigame open kind="proc"
      procId={g.accessMinigame.procId} procName={g.accessMinigame.procName}
      pat={g.patient} assist={g.procedureAssist}
      suspectSpine={scenOf(g)?.cat==="trauma"||(g.patient?.brainInjury||0)>0}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="monitor"&&<MonitorScreenMinigame open kind="monitor"
      procId={g.accessMinigame.procId} screenType={g.accessMinigame.screenType}
      energyJ={g.defib?.charged?g.defib.energy:null}
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="gluc"&&<GlucometerMinigame open kind="gluc"
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="device"&&<DeviceMinigame open kind="device"
      deviceId={g.accessMinigame.deviceId} deviceName={g.accessMinigame.deviceName}
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="auscultate"&&<AuscultationMinigame open kind="auscultate"
      mode={g.accessMinigame.mode} pat={g.patient} aspirated={g.aspirated}
      sex={(scenOf(g)?.pronouns==="she"?"f":"m")}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="bvm"&&<BvmMinigame open kind="bvm" pat={g.patient}
      crew={(g.crew||[]).map(c=>({id:c.id,name:c.name}))}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onProgress={bvmProgress} onStop={bvmStop} onHandoff={(cid)=>handOff("bvm",cid)}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="cpr"&&<CprMinigame open kind="cpr" pat={g.patient}
      fitness={staminaFitness(g)} crew={(g.crew||[]).map(c=>({id:c.id,name:c.name}))}
      onHandoff={(cid,sum)=>handOff("cpr",cid,sum)}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onProgress={cprProgress} onFinish={cprFinish} onAbort={cprAbort}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="give"&&<GiveMedMinigame open kind="give" warnings={g.accessMinigame.warnings}
      drugName={g.accessMinigame.drugName} mode={g.accessMinigame.mode} access={g.accessMinigame.access} accessOptions={g.accessMinigame.accessOptions}
      pushRate={g.accessMinigame.pushRate}
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="hang"&&<HangMinigame open kind="hang" warnings={g.accessMinigame.warnings}
      drugName={g.accessMinigame.drugName} fluidMode={g.accessMinigame.fluidMode} access={g.accessMinigame.access} accessOptions={g.accessMinigame.accessOptions}
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="prep"&&<DrawUpMinigame open kind="prep"
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="pupils"&&<PupilMinigame open kind="pupils"
      pat={g.patient}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame}/>}
    {g.accessMinigame&&g.accessMinigame.kind==="sga"&&<SGAMinigame open kind="sga"
      pat={g.patient} assist={g.procedureAssist}
      interrupted={(g.eventAlertQueue||[]).length>(g.accessMinigame.alertBaseline||0)}
      onResolve={resolveAccessMinigame} onDialogue={fireMinigameDialogue}/>}
    {L===0&&!tp&&!g.call911&&!g.call911Asked&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:51,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="p-5 rounded" style={{background:C.panel,border:`1px solid ${C.amber}`,maxWidth:360}}>
        <div style={{fontSize:15,fontWeight:600,color:C.amber}}>Call 911?</div>
        <div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
          Nobody is coming until somebody calls. That can be you, right now — or you can start working the patient first and call (or have a bystander call) later.</div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={call911Now} className="px-4 py-2 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>
            Yes</button>
          <button onClick={()=>setG(s=>({...s,call911Asked:1}))} className="px-4 py-2 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>
            No — not yet</button>
        </div>
      </div>
    </div>}
    {/* !! guards against the React "stray 0" render: confirmDeath is a numeric
       flag (0/1), and `{0 && <jsx>}` renders a literal 0. Coerce to boolean. */}
    {!!g.confirmDeath&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:50,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="p-5 rounded" style={{background:C.panel,border:`1px solid ${C.red}`,maxWidth:360}}>
        <div style={{fontSize:15,fontWeight:600,color:C.red}}>Are you sure?</div>
        <div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
          This is a field pronouncement of death. It ends the call — there is no undoing it.</div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={declareDeath} className="px-4 py-2 rounded" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13}}>
            Yes — declare death</button>
          <button onClick={()=>setG(s=>({...s,confirmDeath:0}))} className="px-4 py-2 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>
            Cancel</button>
        </div>
      </div>
    </div>}
    {/* F22: patient refusal / AMA — a three-step wizard (capacity judgment,
        risk disclosure, signature), same modal pattern as confirmDeath
        above. The capacity step is the real decision, not a formality: it's
        the only place in the flow the player can get this wrong. */}
    {!!g.amaOpen&&(()=>{const pr=pron(SC);
      return (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:50,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="p-5 rounded" style={{background:C.panel,border:`1px solid ${C.amber}`,maxWidth:420}}>
        {g.amaStep==="capacity"&&<>
          <div style={{fontSize:15,fontWeight:600,color:C.amber}}>Assess capacity</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
            Before any refusal is valid, {pr.subj} {pr.has} to be alert, oriented, and actually able to understand
            what {pr.subj} {pr.is} refusing and what could happen as a result.</div>
          <div style={{fontSize:12,marginTop:10,padding:8,borderRadius:6,background:g.done.loc?"#132018":"#1A1510",
            border:`1px solid ${g.done.loc?C.hr:C.amber}`,color:g.done.loc?C.hr:C.amber}}>
            {g.done.loc?"✓ Orientation/AVPU checked this call.":"⚠ You have not checked orientation this call."}</div>
          <div style={{fontSize:13,color:C.text,marginTop:12}}>Does this patient have the capacity to refuse care right now?</div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={amaCapacityYes} className="px-4 py-2 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>
              Yes — has capacity</button>
            <button onClick={amaCapacityNo} className="px-4 py-2 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>
              No — continue care</button>
          </div>
        </>}
        {g.amaStep==="risks"&&<>
          <div style={{fontSize:15,fontWeight:600,color:C.amber}}>Explain the risks</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
            Tell {pr.obj}, in plain language, that {pr.subj} {pr.is} being advised to be seen, that the condition could
            worsen or be fatal without it, and that {pr.subj} can call back at any time.</div>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button onClick={amaExplainRisks} className="px-4 py-2 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>
              Risks explained</button>
            <button onClick={()=>setG(s=>({...s,amaOpen:0,amaStep:null}))} className="px-4 py-2 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>
              Cancel</button>
          </div>
        </>}
        {g.amaStep==="signature"&&<>
          <div style={{fontSize:15,fontWeight:600,color:C.amber}}>Get the signature</div>
          <div style={{fontSize:12.5,color:C.dim,marginTop:8,lineHeight:1.6}}>
            Have {pr.obj} sign the refusal-of-care form. This ends the call — there is no undoing it.</div>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button onClick={amaSign} className="px-4 py-2 rounded" style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13}}>
              Patient signs</button>
            <button onClick={()=>setG(s=>({...s,amaOpen:0,amaStep:null}))} className="px-4 py-2 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:13}}>
              Cancel</button>
          </div>
        </>}
      </div>
    </div>);})()}
    {/* paddingTop:40 clears the fixed settings/achievements/relationships
        icon bar (Shell.jsx, top:12, ~30px tall) — every other screen's
        content wrapper already carries this same clearance (see the
        response/approach screen a few hundred lines up); this call/transport
        screen is the one place in the file that used `full` mode and never
        got it, so its own header — including the on-scene timer, the
        right-most thing in that header — rendered flush against the top of
        the viewport, directly behind those icons. */}
    <div className={tp?"rock":""} style={{paddingTop:40}}>
    <div className="flex items-baseline justify-between flex-wrap gap-2 pb-3 mb-3" style={{borderBottom:`1px solid ${C.line}`}}>
      <div>
        <div style={{fontFamily:MONO,fontSize:11,letterSpacing:".18em",color:tp?C.red:C.dim}}>
          {tp?`EN ROUTE · CODE ${g.code}`:`${SC.id} · ${LEVELS[g.level].name.toUpperCase()}`}</div>
        <div style={{fontSize:18,fontWeight:600}}>{SC.title}</div></div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setG(s=>({...s,muted:!s.muted}))} title={g.muted?"Sound is off":"Sound is on"}
          style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:6,color:g.muted?C.faint:C.spo2,
            fontFamily:MONO,fontSize:11,padding:"5px 9px",cursor:"pointer",whiteSpace:"nowrap"}}>
          {g.muted?"🔇 sound off":"🔊 sound on"}</button>
        <button onClick={()=>{unlockSpeech();setG(s=>({...s,voice:!s.voice}));}} title={g.voice?"Voice is on":"Voice is off"}
          style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:6,color:g.voice?C.spo2:C.faint,
            fontFamily:MONO,fontSize:11,padding:"5px 9px",cursor:"pointer",whiteSpace:"nowrap"}}>
          {g.voice?"🗣️ voice on":"🗣️ voice off"}</button>
        <BackBtn toPhase={g.gmode==="career"?"station":"cat"} label="← Abandon call" reset confirmMsg={g.gmode==="career"?"Abandon this call and return to the station? Your progress on this patient will be lost.":"Abandon this call and return to scenario select? Your progress on this patient will be lost."} setG={setG}/>
        <div className="text-right">
          <div style={{fontFamily:MONO,fontSize:26,color:rem<240?C.red:C.text,lineHeight:1}}>
            {clk(g.t-(g.onSceneAt??g.t))}</div>
          <div style={{fontFamily:MONO,fontSize:10,color:rem<240?C.red:C.dim}}>
            {tp?`HOSPITAL IN ${clk(rem)}`:"ON SCENE"}</div></div>
      </div>

           {g.phase === "transport" && (!g.transportSkipStart ? (
               <button onClick={()=>setG(s=>({...s,transportSkipStart:s.t,transportSkipVitals:{...s.vitals}}))}
                 className="px-4 py-2 rounded"
                 style={{background:"#0F2A1E",border:`1px solid ${C.hr}`,color:C.hr,fontSize:13}}
                 >Skip Transport</button>
           ) : null)}
    </div>

    {g.busy&&(<div data-tutorial-id="busy-timer" className="mb-3 p-3 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`}}>
      <div className="flex justify-between"><span style={{fontSize:14,color:C.amber}}>{g.busy.label}…</span>
        <span style={{fontFamily:MONO,fontSize:16,color:C.amber}}>{Math.ceil(g.busy.left)}s</span></div>
      <div style={{height:4,background:"#2A2018",borderRadius:2,marginTop:6,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(1-g.busy.left/g.busy.dur)*100}%`,background:C.amber,transition:"width .1s linear"}}/></div>
      <div className="flex justify-between items-center" style={{marginTop:5}}>
        <span style={{fontSize:11,color:C.faint}}>Your hands are full — but you can still ask, listen, watch the monitor, and direct your crew.</span>
        <button onClick={cancelAction} style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:5,
          color:C.dim,fontFamily:MONO,fontSize:10,padding:"3px 9px",cursor:"pointer"}}>cancel</button></div></div>)}

    <div className="px-stage">
      {/* ═══ LEFT — THE PATIENT AND THE WORK ═══ */}
      <div className="px-work">
        {L===0&&!tp&&g.onSceneAt&&(()=>{
          // Chapter 1 doesn't use the ordinary 5-minute Layperson hold at
          // all (tick loop's n.ch1CallEnding branch) — an arriving EMR+ unit
          // takes over and ends the call immediately, and that unit's own
          // fleet.js ETA (etaTier:0) lands around 45-120s, not 5 minutes.
          // This banner used to say "five minutes"/count down from 300s
          // unconditionally, which was simply stale for this branch — the
          // underlying handoff logic was always correct, only the display
          // wasn't. Every other Layperson context (Master of Your Scope,
          // post-Ch1 zth play) keeps the real 5-minute-hold text/countdown.
          const ch1Active=g.learningMode==="zth"&&!g.ch1Done;
          const cap=ch1Active?60:300;
          if((g.t-g.onSceneAt)>=cap) return null;
          return (<div className="p-3 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`}}>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.amber}}>ALONE ON SCENE</div>
            <div style={{fontSize:13.5,marginTop:3}}>{ch1Active
              ?"As a layperson on Chapter 1 patrol, backup arrives fast — hold the scene until PATROL/EMR gets here, about a minute out."
              :"As a layperson you hold this scene solo for at least five minutes. Stabilize as best you can — care doesn't pass to EMS until the ambulance is here and that clock runs out."}</div>
            <div style={{fontFamily:MONO,fontSize:16,color:C.amber,marginTop:6}}>{clk(cap-(g.t-g.onSceneAt))} remaining</div></div>);
        })()}
        {g.forcedTask&&<div className="p-3 rounded" style={{background:"#1A1510",border:`1px solid ${C.amber}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.amber}}>SUPERVISOR ORDER · {g.commander?.name||"COMMAND"}</div>
          <div style={{fontSize:13.5,marginTop:3}}>"{g.forcedTask.label}"</div>
          <div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:3}}>Your other actions are locked until this is done.</div></div>}
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,flex:"0 0 200px",maxWidth:220}}>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:6}}>PATIENT</div>
            <BodyMap active={g.region} ivSites={g.ivSites} injured={g.injuries||[]} touched={(k)=>A.some(a=>a.region===k&&g.done[a.doneKey||a.id])}
              woundColors={SC?Object.fromEntries(Object.entries(woundsFor(SC.condition)).filter(([r])=>g.exposed?.[r]).map(([r,w])=>[r,woundColor(w)])):{}}
              onPick={(k)=>setG(s=>({...s,region:k,tab:"assess",panel:"actions"}))}/>
            <div style={{fontFamily:MONO,fontSize:10,color:C.amber,textAlign:"center",marginTop:4}}>{RN[g.region].toUpperCase()}</div>
            {g.ivSites?.length>0&&<div style={{fontFamily:MONO,fontSize:9.5,color:C.hr,textAlign:"center"}}>IV/IO — {g.ivSites.map(l=>RN[l]).join(", ").toUpperCase()}</div>}
          </div>
          {(()=>{const seen=new Set();
            const rows=inR.map(a=>{const key=a.doneKey||a.id,rec=g.done[key];
                if(!rec||seen.has(key)) return null; seen.add(key);
                return {key,at:rec.at,label:key.startsWith("expose@")?`Exposed — ${RN[g.region]}`:a.label};})
              .filter(Boolean).sort((x,y)=>x.at-y.at);
            const wound=g.exposed?.[g.region]?woundsFor(SC.condition)[g.region]:null;
            const wc=wound?woundColor(wound):null, wd=wound?woundDef(wound):null;
            return (<div className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,flex:"1 1 200px",maxWidth:280}}>
              <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:6}}>DONE — {RN[g.region].toUpperCase()}</div>
              {wound&&wd&&<div className="mb-2 pb-2" style={{borderBottom:`1px solid ${C.line}`}}>
                <div style={{fontSize:12,fontWeight:600,color:wc==="red"?C.red:C.amber}}>
                  ● {WOUND_TYPES[wound.type].label} — {wound.severity}</div>
                <div style={{fontSize:11.5,color:C.dim,marginTop:2}}>{wd.desc}</div></div>}
              {/* !! guards the React stray-0 render: initialExposure sets covered
                 regions to 0, and `{0 && <jsx>}` would print a literal 0 before
                 the patient is undressed. */}
              {!!g.exposed?.[g.region]&&!wound&&<div className="mb-2 pb-2" style={{borderBottom:`1px solid ${C.line}`,fontSize:11.5,color:C.faint}}>No visible injury.</div>}
              {rows.length===0?<div style={{fontSize:12,color:C.faint}}>Nothing done here yet.</div>
                :rows.map(r=>(<div key={r.key} style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:12,marginBottom:3}}>
                    <span style={{color:C.text}}>{r.label}</span>
                    {/* r.at is g.done[key].at -- an ABSOLUTE g.t timestamp
                        (seconds since dispatch/call start), the same basis
                        every action's done-marker uses. The clock in the
                        top-right corner and the scrolling log both show
                        elapsed time SINCE ARRIVING ON SCENE (g.t-g.onSceneAt)
                        -- this row used to show the raw absolute value
                        instead, so it disagreed with every other clock on
                        screen (worse the longer response/approach took).
                        Same subtraction here brings it into agreement. */}
                    <span style={{fontFamily:MONO,color:C.faint,whiteSpace:"nowrap"}}>{clk(r.at-(g.onSceneAt??0))}</span></div>))}
            </div>);})()}
          {Object.keys(g.cBusy).length>0&&<div className="p-3 rounded" style={{background:"#101C18",border:`1px solid ${C.hr}`,flex:"1 1 220px"}}>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.hr,marginBottom:6}}>CREW WORKING</div>
            {Object.entries(g.cBusy).map(([k,b])=>(<div key={k} style={{fontSize:11.5,marginBottom:4}}>
              <div className="flex justify-between" style={{display:"flex",justifyContent:"space-between"}}><span>{b.name} — {b.task}</span>
                <span style={{fontFamily:MONO,color:C.hr}}>{b.left>9000?"∞":Math.ceil(b.left)+"s"}</span></div>
              <div style={{height:3,background:"#16241C",borderRadius:2,marginTop:2}}>
                <div style={{height:"100%",width:`${b.left>9000?100:(1-b.left/b.dur)*100}%`,background:C.hr,borderRadius:2}}/></div>
            </div>))}</div>}
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {PANELS.map(([k,n])=>(<button key={k}
            data-tutorial-id={k==="crew"?"crew":k==="monitor"?"monitor":(k==="transport"||k==="report")?"transport":undefined}
            onClick={()=>setG(s=>({...s,panel:k}))} className="px-3.5 py-2 rounded"
            style={{background:g.panel===k?C.panelHi:"transparent",border:`1px solid ${g.panel===k?C.amber:C.line}`,
              color:g.panel===k?C.amber:C.dim,fontFamily:MONO,fontSize:10.5,letterSpacing:".06em",cursor:"pointer",padding:"7px 12px",borderRadius:6}}>
            {n.toUpperCase()}</button>))}
        </div>

        {g.panel==="actions"&&(<div className="p-4 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div data-tutorial-id="tabs" className="flex gap-1 mb-3 flex-wrap">
            {tabs.map(k=>(<button key={k} onClick={()=>setG(s=>({...s,tab:k}))} className="px-3 py-1.5 rounded"
              style={{background:tab===k?"#16241C":"transparent",border:`1px solid ${tab===k?C.hr:C.line}`,
                color:tab===k?C.hr:C.dim,fontFamily:MONO,fontSize:10}}>{(TN[k]||k).toUpperCase()}</button>))}
          </div>
          <div data-tutorial-id="actions" className="grid grid-cols-1 sm:grid-cols-2 gap-1.5" style={{maxHeight:430,overflowY:"auto"}}>
            {(()=>{const inTab=inR.filter(a=>a.tab===tab&&!a.hideInList);
              // F5: the medications tab groups by clinical category (cardiac,
              // airway/RSI, analgesia, ...) instead of one flat alphabetical
              // list — same DRUG_CATEGORIES the scope screen already uses.
              if(tab==="meds"||tab==="procedures"){
                const cats=tab==="meds"?DRUG_CATEGORIES:PROC_CATEGORIES;
                const catOf=tab==="meds"?(a=>drugCategoryOf(a.drug)):(a=>procCategoryOf(a.id));
                const byCat=[...Object.keys(cats),"Other"].map(cat=>[cat,inTab.filter(a=>catOf(a)===cat).map(Btn).filter(Boolean)])
                  .filter(([,btns])=>btns.length>0);
                if(byCat.length===0) return <div style={{fontSize:12,color:C.faint,padding:"4px 2px"}}>
                  {g.busy?"Hands full — wait for the current task to finish.":g.forcedTask?"Nothing available while under order — see the task above.":"Nothing available here right now."}</div>;
                return byCat.map(([cat,btns])=>(<React.Fragment key={cat}>
                  <div className="col-span-1 sm:col-span-2" style={{fontFamily:MONO,fontSize:9.5,letterSpacing:".12em",color:C.faint,marginTop:8,marginBottom:2}}>{cat.toUpperCase()}</div>
                  {btns}
                </React.Fragment>));
              }
              const rendered=inTab.map(Btn).filter(Boolean);
              if(rendered.length===0) return <div style={{fontSize:12,color:C.faint,padding:"4px 2px"}}>
                {(!!g.busy&&tab!=="assess"&&tab!=="general")?"Hands full — wait for the current task to finish.":g.forcedTask?"Nothing available while under order — see the task above.":"Nothing available here right now."}</div>;
              return rendered;})()}
          </div>
          {tab==="general"&&L>=4&&SC.micn&&<button disabled={!!g.busy||!!g.base} onClick={()=>setG(s=>({...s,micnOpen:1}))}
            className="text-left px-3 py-2 rounded w-full mt-3"
            style={{background:C.panelHi,border:`1px solid ${C.spo2}`,color:g.base?C.faint:C.spo2,fontSize:13}}>
            Contact Base — online medical direction
            <div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>{g.base?"already consulted":"she may be wrong"}</div>
          </button>}
          {tab==="general"&&canDeclareDeath&&!tp&&<button disabled={!!g.busy} onClick={confirmDeclareDeath}
            className="text-left px-3 py-2 rounded w-full mt-3"
            style={{background:"#12100E",border:`1px solid ${C.faint}`,color:C.dim,fontSize:13}}>
            ▲ Declare death on scene
            <div style={{fontFamily:MONO,fontSize:10,color:C.faint,marginTop:2}}>Field pronouncement — {LNAME(4)}+ only. Ends the call.</div></button>}
        </div>)}

        {g.panel==="triage"&&(<div className="p-4 rounded" style={{background:C.panel,border:`1px solid ${C.amber}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.amber,marginBottom:6}}>MULTIPLE PATIENTS — TRIAGE</div>
          <div style={{fontSize:11.5,color:C.faint,marginBottom:12,lineHeight:1.6}}>
            Every patient here keeps deteriorating whether or not you're the one looking at them.
            Switch who the monitor and your actions are bound to — everything you do only affects
            whoever is highlighted below.</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {rosterList.map(p=>{const tagColor={red:C.red,yellow:C.amber,green:C.hr}[p.role]||C.dim;
              return (<button key={p.id} onClick={()=>switchPatient(p.id)} className="text-left px-3 py-2.5 rounded"
                style={{background:p.active?"#1B242B":"#12100E",border:`1px solid ${p.active?tagColor:C.line}`,color:C.text}}>
                <div className="flex justify-between items-center" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:600}}>
                    <span style={{fontFamily:MONO,fontSize:10,color:tagColor,marginRight:6}}>{(p.role||"—").toUpperCase()}</span>
                    {p.name||p.id}{p.active?" — ACTIVE":""}</span>
                  {p.dead&&<span style={{fontFamily:MONO,fontSize:10,color:C.red}}>DECEASED</span>}
                </div>
                {!p.dead&&<div style={{fontFamily:MONO,fontSize:10.5,color:C.dim,marginTop:3}}>
                  HR {Math.round(p.vitals.hr)} · BP {Math.round(p.vitals.sbp)}/{Math.round(p.vitals.dbp)} · SpO2 {Math.round(p.vitals.spo2)} · RR {Math.round(p.vitals.rr)}</div>}
              </button>);})}
          </div>
        </div>)}

        {g.panel==="crew"&&(<div className="p-4 rounded" style={{background:C.panel,border:`1px solid ${C.hr}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.hr,marginBottom:6}}>CLOSED-LOOP COMMAND</div>
          <div style={{fontSize:11.5,color:C.faint,marginBottom:12,lineHeight:1.6}}>
            Name them. Give the order. They read it back, they do it, they report the result.
            Only tasks within their licence show up — and anyone who outranks you won't take orders at all.
          </div>
          <div className="flex flex-col gap-3">
            {crew.map(c=>{const busy=g.cBusy[c.id];
              return (<div key={c.id} data-testid="crew-order-card" className="p-3 rounded" style={{background:C.panelHi,border:`1px solid ${busy?C.hr:c.student?C.amber:C.line}`}}>
                <div className="flex justify-between items-baseline mb-2">
                  <span style={{display:"flex",alignItems:"center",gap:8}}>
                    <img src={portraitFor(c)} onError={onImgError} alt="" width={28} height={28}
                      style={{borderRadius:5,objectFit:"cover",border:`1px solid ${C.line}`}}/>
                    <span style={{fontSize:14,fontWeight:600}}>{c.name}</span></span>
                  <span style={{fontFamily:MONO,fontSize:10,color:c.student?C.amber:C.faint}}>{LEVELS[c.level].name.toUpperCase()}{c.student?" · STUDENT":""}</span></div>
                {(c.vehicle||c.crewTitle)&&<div style={{fontFamily:MONO,fontSize:9.5,color:C.dim,marginTop:-6,marginBottom:6}}>
                  {c.vehicle?`${c.vehicle.type}${c.solo?" · alone":""}`:""}{c.crewTitle?` · ${c.crewTitle}`:c.vehicle?" · on scene":""}</div>}
                {c.fatigue!=null&&<div style={{fontFamily:MONO,fontSize:9,color:C.faint,marginTop:-4,marginBottom:6}}>
                  fatigue {c.fatigue} · morale {c.morale} · skill {c.baseSkill} · {c.yearsExp}yr{c.student?" · +5s every task":""}</div>}
                {c.limitation&&<div style={{fontSize:10.5,color:C.amber,marginTop:-4,marginBottom:6,lineHeight:1.5}}>
                  ⚠ {LIMITATIONS[c.limitation].name} — {LIMITATIONS[c.limitation].note}</div>}
                {c.id==="bys"&&<div className="flex gap-2 mb-2">
                  {!g.call911&&<button onClick={call911Now} className="text-left px-2.5 py-1.5 rounded flex-1"
                    style={{background:"#1A1510",border:`1px solid ${C.amber}`,color:C.amber,fontSize:11.5}}>
                    Call 911<div style={{fontFamily:MONO,fontSize:9,color:C.dim}}>Nobody is coming until this is pressed.</div></button>}
                  <button onClick={()=>setG(s=>({...s,bystanderDismissed:1,
                      log:[...s.log,{t:s.t,kind:"obs",text:"The bystander is sent off scene."}]}))}
                    className="text-left px-2.5 py-1.5 rounded" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:11.5}}>
                    Dismiss</button>
                </div>}
                {c.id!=="bys"&&!busy&&<button onClick={()=>setG(s=>({...s,securedIds:[...(s.securedIds||[]),c.id],
                    log:[...s.log,{t:s.t,kind:"obs",text:`${c.name} peels off to secure the scene.`}]}))}
                  className="text-left px-2.5 py-1.5 rounded w-full mb-2" style={{background:"transparent",border:`1px solid ${C.line}`,color:C.faint,fontSize:11}}>
                  Assign — secure the scene<div style={{fontFamily:MONO,fontSize:9,color:C.faint}}>Off the roster for the rest of this call.</div></button>}
                {busy&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:12,color:C.hr}}>Working — {busy.task}{busy.taskId==="monitor"?" ● LIVE":` (${busy.left>9000?"ongoing":Math.ceil(busy.left)+"s"})`}</span>
                  {busy.taskId==="monitor"
                    ?<button onClick={()=>stopMonitor(c.id)}
                      style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:5,color:C.dim,fontFamily:MONO,fontSize:10,padding:"3px 8px",cursor:"pointer"}}>release</button>
                    :<button onClick={()=>cancelCrew(c.id)}
                      style={{background:"transparent",border:`1px solid ${C.line}`,borderRadius:5,color:C.dim,fontFamily:MONO,fontSize:10,padding:"3px 8px",cursor:"pointer"}}>cancel</button>}
                </div>}
                {/* Crew AI batch: a crew member is no longer locked to their
                    current task (see order() — it now cancels-and-reassigns
                    instead of refusing), so the task list stays visible even
                    while busy, not just the cancel/release row above. Picking
                    a different task here redirects them for real; picking
                    their OWN current task just restarts it. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {(()=>{const visible=orderableTasksFor(c);
                    if(visible.length===0) return <div style={{fontSize:11,color:C.faint}}>Nothing to order right now.</div>;
                    return visible.map(t=>{const fumble=failChance(effectiveCrewMorale(c,g.morale),t.lvl)*100, risky=fumble>=1;
                      const dur=t.dur>9000?t.dur:t.dur+(c.student?5:0);
                      const redirect=busy&&busy.taskId!==t.id;
                      return (<button key={t.id} onClick={()=>order(c,t)} className="text-left px-2.5 py-1.5 rounded"
                        style={{background:"transparent",border:`1px solid ${risky?C.amber:"#2E4A3A"}`,
                          color:C.text,fontSize:11.5,cursor:"pointer"}}>
                        <div>{redirect?"↳ ":""}{t.name}</div>
                        <div style={{fontFamily:MONO,fontSize:9,color:risky?C.amber:C.dim}}>
                          {t.dur>9000?"ongoing":`${dur}s`} · {fumble.toFixed(2)}% fumble</div>
                      </button>);});})()}
                </div>
              </div>);})}
          </div></div>)}

        {g.panel==="monitor"&&(()=>{
          const dv=g.devices||{};
          const leadsLive=!!(dv.leads||g.leadsOn);
          const perf=V.sbp>=90?1:V.sbp>=60?0.55:0.2;
          // Granular equipment realism: real ECG artifact, not always a clean
          // trace. Three real causes composed additively — patient movement
          // (a seizing patient defeats any lead job), a brief settling window
          // right after placement (leads haven't made good skin contact yet),
          // and a loose-lead/60Hz baseline that persists until the crew
          // actually reseats them (secureLeads action).
          const secSinceLeads=dv.leads?.at!=null?(g.t-dv.leads.at):99;
          const settling=leadsLive&&secSinceLeads<12?(1-secSinceLeads/12):0;
          const movement=g.patient?.seizing?0.75:0;
          const loose=leadsLive&&!g.leadsSecured?0.3:0;
          // A fourth, PERSISTENT source, distinct from the transient settling
          // window and the securable "loose" flag above: how precisely the
          // electrodes were actually placed (DeviceMinigame's own click-
          // accuracy score for a player attach, ~0.85 for a crew attach, 1
          // for an undefined/legacy save). Poor contact from sloppy placement
          // doesn't resolve on its own the way settling does — it stays until
          // the leads are pulled and redone.
          const placementNoise=leadsLive?(1-(g.leadsPlacementQuality??1))*0.5:0;
          const artifact=Math.min(1,movement+settling*0.6+loose+placementNoise);
          const waves=[
            leadsLive&&{key:"ecg",pts:ecgPoints(V.ecg,380,70,artifact)},
            dv.capno&&{key:"capno",pts:capnoPoints(V.etco2,V.rr)},
            dv.artline&&{key:"art",pts:artPoints(V.sbp,V.dbp,V.hr)},
            (leadsLive||dv.pulseox)&&{key:"resp",pts:respPoints(V.rr)},
          ].filter(Boolean);
          const padsOn=!!(g.padsOn||dv.pads);
          const defibAct=A.find(a=>a.id==="defib");
          const attached=Object.keys(DEVICES).filter(id=>dv[id]);
          const o2Psi=Math.round(g.o2Psi??2000);
          const o2Active=["o2nc","o2nrb","bvm","vent","cric"].some(id=>doseActive(g,id));
          return (<div className="p-4 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
            <div className="flex justify-between mb-3">
              <span style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim}}>MONITOR</span>
              <span style={{fontFamily:MONO,fontSize:10,color:attached.length?C.hr:C.faint}}>
                {attached.length?`${attached.length} ATTACHED`:"NOTHING ATTACHED"}</span></div>
            {leadsLive&&artifact>0.25&&
              <div style={{fontFamily:MONO,fontSize:10,color:C.amber||"#F2A33C",marginBottom:6}}>
                ⚠ ARTIFACT — {movement>0?"patient movement is defeating the leads"
                  :loose>0?"check lead contact, reseat if loose"
                  :placementNoise>0.15?"electrodes are poorly seated, remove and reapply for a clean trace"
                  :"leads are still settling"}</div>}
            {o2Active&&
              <div style={{fontFamily:MONO,fontSize:10,color:o2Psi<=400?(C.amber||"#F2A33C"):C.dim,marginBottom:6}}>
                O2 CYLINDER — {o2Psi} psi{o2Psi<=400?" — LOW, swap soon":""}</div>}
            {dv.pulseox&&<PulseOxScreen spo2={V.spo2} pr={pulseRateFrom(V)} perf={perf}/>}
            {waves.length===0&&!dv.pulseox
              ?<div style={{fontSize:13,color:C.dim,padding:"24px 0",textAlign:"center"}}>
                 Nothing is on the patient. Attach the pulse oximeter, capnography, monitor leads or an arterial line
                 (from the relevant body region) and the waveforms appear here.</div>
              :waves.map(w=>{const m=WAVE_META[w.key],col=C[m.color]||C.hr;
                return (<div key={w.key} style={{marginBottom:8}}>
                  <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:col,marginBottom:2}}>{m.label.toUpperCase()}</div>
                  <div style={{background:"#08120C",border:`1px solid ${C.line}`,borderRadius:4,padding:"4px 0"}}>
                    <svg viewBox="0 0 380 70" style={{width:"100%",height:64}}>
                      <polyline points={w.pts.map(p=>p.join(",")).join(" ")} fill="none" stroke={col} strokeWidth="1.3"/>
                    </svg></div></div>);})}

            {/* ── LV pressure–volume loop (from the integrated time-varying-elastance beat) ── */}
            {dv.artline&&V._pvLoop&&V._pvLoop.length>5&&(()=>{
              const LP=V._pvLoop, cv=V._cv||{}, RP=V._rvLoop;
              const Vs=LP.map(p=>p.V), Ps=LP.map(p=>p.Plv);
              const allV=Vs.concat(RP?RP.map(p=>p.V):[]);
              const allP=Ps.concat(RP?RP.map(p=>p.Plv):[]);
              const vlo=Math.max(0,Math.min(...allV)-15), vhi=Math.max(...allV)+15;
              const phi=Math.max(140,Math.max(...allP)*1.12);
              const X=v=>12+(v-vlo)/((vhi-vlo)||1)*356;
              const Y=p=>150-(p/phi)*138;
              const pts=LP.map(p=>`${X(p.V).toFixed(1)},${Y(p.Plv).toFixed(1)}`).join(" ");
              const rpts=RP?RP.map(p=>`${X(p.V).toFixed(1)},${Y(p.Plv).toFixed(1)}`).join(" "):"";
              const stat=[["EDV",(cv.edv||0)+" mL"],["ESV",(cv.esv||0)+" mL"],["SV",(cv.sv||0)+" mL"],
                          ["EF",Math.round((cv.ef||0)*100)+"%"],["CO",(cv.co||0)+" L/min"],
                          ["PA",(cv.paSys||0)+"/"+(cv.paDia||0)],["RV EF",Math.round((cv.rvEf||0)*100)+"%"],
                          ["RV EDV",(cv.rvEdv||0)+" mL"],
                          ["BARO",Math.round((cv.baro==null?0.5:cv.baro)*100)+"%"],["SYMP",Math.round((cv.symp==null?0.3:cv.symp)*100)+"%"]];
              return (<div style={{marginTop:8}}>
                <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.spo2,marginBottom:2}}>PRESSURE–VOLUME LOOPS &nbsp;<span style={{color:C.hr}}>LV</span> &nbsp;<span style={{color:C.amber}}>RV</span></div>
                <div style={{background:"#08120C",border:`1px solid ${C.line}`,borderRadius:4,padding:4}}>
                  <svg viewBox="0 0 380 160" style={{width:"100%",height:150}}>
                    <line x1="12" y1="150" x2="368" y2="150" stroke={C.line} strokeWidth="1"/>
                    <line x1="12" y1="8" x2="12" y2="150" stroke={C.line} strokeWidth="1"/>
                    {rpts&&<polyline points={rpts} fill="none" stroke={C.amber} strokeWidth="1.2" opacity="0.85"/>}
                    <polyline points={pts} fill="none" stroke={C.hr} strokeWidth="1.4"/>
                    <text x="366" y="147" fill={C.faint} fontSize="8" textAnchor="end" fontFamily={MONO}>VOLUME (mL)</text>
                    <text x="16" y="15" fill={C.faint} fontSize="8" fontFamily={MONO}>P (mmHg)</text>
                  </svg></div>
                <div style={{display:"flex",gap:12,marginTop:3,flexWrap:"wrap"}}>
                  {stat.map(([k,val])=>(<span key={k} style={{fontFamily:MONO,fontSize:10,color:C.dim}}>{k} <b style={{color:C.text}}>{val}</b></span>))}
                </div></div>);
            })()}

            {/* ── 12-lead interpretation / transmit to base ── */}
            {leadsLive&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.line}`}}>
              <button disabled={!!g.busy} onClick={()=>setG(s=>{const pv=physio(s);const n=(s.twelveLeadCount||0)+1;
                  const snap={n,t:s.t,seed:Math.floor(s.t*10)+7*n,hr:pv.hr,ecg:pv.ecg,qrsWidth:pv.qrsWidth,k:pv.k,
                    infarctTerritory:pv.infarctTerritory,pr:pv.prInterval,
                    info:{name:s.idKnown?s.patientName:"UNKNOWN",age:s.patient?.ageProfile?.age,bp:`${pv.sbp}/${pv.dbp}`,spo2:pv.spo2,id:scenOf(s).id}};
                  return {...s,twelveLeadCount:n,twelveLeadPrints:[snap,...(s.twelveLeadPrints||[])].slice(0,3),
                    log:[...s.log,{t:s.t,kind:"obs",text:"You print a 12-lead ECG."}]};})}
                className="px-3 py-2 rounded mb-3" style={{background:C.panelHi,border:`1px solid ${C.hr}`,color:C.hr,fontSize:12.5,cursor:"pointer",display:"block"}}>
                Print 12-lead</button>
              {(g.twelveLeadPrints||[]).map(sn=><TwelveLeadPrint key={sn.n} snap={sn}
                onClose={()=>setG(s=>({...s,twelveLeadPrints:(s.twelveLeadPrints||[]).filter(x=>x.n!==sn.n)}))}/>)}
              {/* No auto-interpretation is ever shown here — the strip
                  (waveform above, and each printed copy) is the only source
                  of truth. The player reads it themselves via Print, or
                  gets a genuine physician readback via Transmit. */}
              {g.ecgInterp
                ?<div style={{fontSize:13,color:C.spo2,lineHeight:1.6}}>
                   <span style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.dim,display:"block",marginBottom:3}}>BASE HOSPITAL READ — TRANSMITTED 12-LEAD</span>
                   {g.ecgInterp}
                   {/* A transmitted read is a snapshot, not a live feed — if the
                       rhythm changes after base already read one back (a stable
                       strip going into VT, K-driven changes resolving, etc.), the
                       old text just sat there with no way to get a current one.
                       Re-transmitting is the same real action as the first
                       transmit, not a new mechanic — same button, same 15s delay. */}
                   <button disabled={!!g.busy} onClick={()=>setG(s=>({...s,ecgInterp:null,ecgTxAt:s.t,
                       log:[...s.log,{t:s.t,kind:"disp",text:"You transmit an updated twelve-lead to the receiving facility."}]}))}
                     className="px-3 py-1.5 rounded mt-2" style={{background:"transparent",border:`1px solid ${C.spo2}`,color:C.spo2,fontSize:11.5,cursor:"pointer"}}>
                     Transmit again</button></div>
                :g.ecgTxAt!=null
                ?<div style={{fontSize:12.5,color:C.amber}}>Transmitting the 12-lead to base… the physician will read it back.</div>
                :<>
                  <div style={{fontSize:12.5,color:C.dim,lineHeight:1.6,marginBottom:8}}>
                    You have the strip. Read it yourself off the waveform and the printed copy, or transmit it to base for a second opinion.</div>
                  <button disabled={!!g.busy} onClick={()=>setG(s=>({...s,ecgTxAt:s.t,
                      log:[...s.log,{t:s.t,kind:"disp",text:"You transmit the 12-lead to the receiving facility for interpretation."}]}))}
                    className="px-3 py-2 rounded" style={{background:C.panelHi,border:`1px solid ${C.spo2}`,color:C.spo2,fontSize:12.5,cursor:"pointer"}}>
                    Transmit 12-lead to base</button></>}
            </div>}

            {/* ── Manual defibrillation: energy → charge → shock ── */}
            {padsOn&&L>=4&&<div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.line}`}}>
              <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.red,marginBottom:6}}>MANUAL DEFIBRILLATION</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {DEFIB_ENERGIES.map(j=>{const sel=g.defib?.energy===j;
                  return (<button key={j} onClick={()=>setG(s=>({...s,defib:{energy:j,charged:0}}))}
                    style={{background:sel?"#2A1418":"transparent",border:`1px solid ${sel?C.red:C.line}`,color:sel?C.red:C.dim,
                      fontFamily:MONO,fontSize:11,padding:"5px 9px",borderRadius:5,cursor:"pointer"}}>{j} J</button>);})}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button disabled={g.defib?.energy==null||g.defib?.charged} onClick={()=>setG(s=>({...s,defib:{...s.defib,charged:1}}))}
                  className="px-3 py-2 rounded" style={{background:C.panelHi,border:`1px solid ${C.amber}`,
                    color:g.defib?.energy==null||g.defib?.charged?C.faint:C.amber,fontSize:12.5,cursor:"pointer",flex:1}}>
                  {g.defib?.charged?`Charged · ${g.defib.energy} J`:"Charge"}</button>
                <button disabled={!g.defib?.charged||!!g.busy} onClick={()=>defibAct&&start(defibAct)}
                  className="px-3 py-2 rounded" style={{background:"#2A1418",border:`1px solid ${C.red}`,
                    color:g.defib?.charged?C.red:C.faint,fontSize:12.5,cursor:"pointer",flex:1}}>
                  ⚡ Shock</button>
              </div>
              <div style={{fontFamily:MONO,fontSize:9.5,color:C.faint,marginTop:5}}>
                Select an energy, charge, then shock. Sync/energy must be set before every shock.</div>
            </div>}
            {padsOn&&L<4&&<div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.line}`,fontSize:12,color:C.amber,lineHeight:1.6}}>
              Pads are on for AED use. Manual (energy-select) defibrillation is a paramedic skill — use ANALYZE / SHOCK from the chest.</div>}

            {/* ── Remove attached equipment ── */}
            {attached.length>0&&<div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.line}`}}>
              <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.dim,marginBottom:6}}>ATTACHED, TAP TO REMOVE</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {attached.map(id=>(<button key={id} disabled={!!g.busy} onClick={()=>{const act=A.find(a=>a.id===`remove_${id}`); if(act) start(act);}}
                  style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontFamily:MONO,fontSize:10.5,padding:"5px 9px",borderRadius:5,cursor:"pointer"}}>
                  ✕ {DEVICES[id].name}</button>))}
              </div></div>}
          </div>);})()}

        {g.panel==="vitals"&&(<div className="p-4 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:10}}>MEASURED ONLY</div>
          {ROWS.map(([k,c])=>{const v=g.vitals[k],st=v&&g.t-v.at>STALE;
            return (<div key={k} className="flex justify-between items-baseline py-2" style={{borderBottom:`1px solid ${C.line}`}}>
              <span style={{fontFamily:MONO,fontSize:11,color:C.dim}}>{k}</span>
              <div className="text-right"><span style={{fontFamily:MONO,fontSize:20,color:!v?C.faint:st?C.dim:c}}>{v?v.value:"– – –"}</span>
                {v&&<div style={{fontFamily:MONO,fontSize:9,color:st?C.amber:C.faint}}>
                  {/* v.at is an ABSOLUTE g.t timestamp -- subtract onSceneAt
                      to agree with the on-scene clock elsewhere on screen,
                      same fix as the DONE panel/radio-report readouts. */}
                  {st?`STALE · ${clk(g.t-v.at)} OLD`:`taken ${clk(v.at-(g.onSceneAt??0))}`}</div>}</div></div>);})}
          {g.doses.length>0&&<div className="mt-4 pt-4" style={{borderTop:`1px solid ${C.line}`}}>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:8}}>ACTIVE — ONSET / DECAY</div>
            {g.doses.map((d,i)=>{const s2=DRUGS[d.id]||PROCS[d.id];
              if(!s2?.fx||!Object.keys(s2.fx).length) return null;
              const k=curve(g.t-d.at,s2.onset||30,s2.dur||600); if(k<=0) return null;
              return (<div key={i} className="mb-1.5">
                <div className="flex justify-between" style={{fontFamily:MONO,fontSize:10}}>
                  <span>{s2.name.split(" ")[0]}</span><span style={{color:k>=1?C.hr:C.amber}}>{k>=1?"PEAK":`${Math.round(k*100)}%`}</span></div>
                <div style={{height:3,background:C.line,borderRadius:2,marginTop:2}}>
                  <div style={{height:"100%",width:`${k*100}%`,background:k>=1?C.hr:C.amber,borderRadius:2}}/></div></div>);})}
          </div>}</div>)}

        {g.panel==="log"&&(<div className="p-4 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,maxHeight:490,overflowY:"auto"}}>
          {g.log.map((l,i)=>{const c=l.kind==="crit"?C.red:l.kind==="warn"?C.amber:l.kind==="good"?C.hr
            :l.kind==="disp"?C.spo2:l.kind==="pt"?C.text:C.dim;
            return (<div key={i} className="flex gap-2 mb-2.5" style={{fontSize:13,lineHeight:1.6}}>
              <span style={{fontFamily:MONO,fontSize:10,color:C.faint,paddingTop:2,flexShrink:0}}>{clk(l.t-(g.onSceneAt??0))}</span>
              <span style={{color:c,fontStyle:l.kind==="pt"?"italic":"normal"}}>{l.text}</span></div>);})}
        </div>)}

        {g.panel==="transport"&&!tp&&(<div className="p-4 rounded" style={{background:"#1A1013",border:`1px solid ${C.red}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.red,marginBottom:6}}>TRANSPORT</div>
          <div style={{fontSize:11.5,color:C.dim,marginBottom:12,lineHeight:1.6}}>
            Load and go. You will not have to declare a provider impression until you are wheels-down at the hospital —
            so what you report there had better be backed by what you actually gathered here.</div>
          <button disabled={!!g.busy||L===0} onClick={beginTransport} className="text-left px-3 py-2 rounded w-full"
            style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:13,opacity:L===0?.4:1}}>
            ▲ Transport
            <div style={{fontSize:10,color:C.dim,marginTop:2}}>Load the truck and go.</div></button>
          {L===0&&<div style={{fontSize:11.5,color:C.amber,marginTop:10,lineHeight:1.6}}>
            As a layperson you cannot transport. Keep them alive — care passes to EMS the moment a licensed unit arrives.</div>}
          {/* F22: patient refusal / AMA. A layperson can't process a legal
              refusal — same scope boundary as not being able to transport —
              so this only opens at EMR and above. Deliberately NOT
              pre-blocked on the patient's actual consciousness state: the
              whole point of the capacity-judgment step inside the flow is
              that the PLAYER has to recognize impaired capacity themselves,
              not have the game recognize it for them. */}
          {L>=1&&<button disabled={!!g.busy} onClick={()=>setG(s=>({...s,amaOpen:1,amaStep:"capacity"}))}
            className="text-left px-3 py-2 rounded w-full mt-3"
            style={{background:C.panelHi,border:`1px solid ${C.amber}`,color:C.amber,fontSize:13}}>
            Patient refuses transport (AMA)
            <div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>Assess capacity, explain risks, document the refusal.</div></button>}
          {L>=4&&SC.micn&&<button disabled={!!g.busy||!!g.base} onClick={()=>setG(s=>({...s,micnOpen:1}))}
            className="text-left px-3 py-2 rounded w-full mt-3"
            style={{background:C.panelHi,border:`1px solid ${C.spo2}`,color:g.base?C.faint:C.spo2,fontSize:13}}>
            Contact Base — online medical direction
            <div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>{g.base?"already consulted":"she may be wrong"}</div>
          </button>}
          {g.crew.some(c=>LEVELS[c.level].n>=5)&&g.commandLevel<5&&<button onClick={()=>setG(s=>{const doc=s.crew.find(c=>LEVELS[c.level].n>=5);
            return {...s,commandLevel:5,commander:{name:doc.name,level:doc.level,id:doc.id},forcedTask:null,
              log:[...s.log,{t:s.t,kind:"warn",text:`You hand medical command to ${doc.name}.`}]};})}
            className="text-left px-3 py-2 rounded w-full mt-3" style={{background:C.panelHi,border:`1px solid ${C.violet}`,color:C.violet,fontSize:13}}>
            Hand off command to the physician on scene
            <div style={{fontFamily:MONO,fontSize:10,color:C.dim,marginTop:2}}>Voluntary. They direct care from here.</div></button>}
        </div>)}

        {g.panel==="report"&&tp&&(<div className="p-4 rounded" style={{background:C.panel,border:`1px solid ${(gaps||stales)?C.amber:C.hr}`}}>
          <div className="flex justify-between mb-3">
            <span style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.spo2}}>RADIO REPORT, BUILDING</span>
            <span style={{fontFamily:MONO,fontSize:10,color:(gaps||stales)?C.amber:C.hr}}>
              {gaps?`${gaps} BLANK`:""}{gaps&&stales?" · ":""}{stales?`${stales} STALE`:""}{!gaps&&!stales?"COMPLETE":""}</span></div>
          {g.occupants&&g.occupants.length>0&&<div style={{marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${C.line}`}}>
            <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.dim,marginBottom:4}}>IN THE BOX</div>
            {g.occupants.map((o,i)=><div key={i} style={{fontSize:12,color:C.text}}>· {o}</div>)}
            {g.abandoned&&g.abandoned.length>0&&<div style={{marginTop:8}}>
              <div style={{fontFamily:MONO,fontSize:9,letterSpacing:".14em",color:C.amber,marginBottom:4}}>VEHICLES LEFT ON SCENE</div>
              {g.abandoned.map((a,i)=><div key={i} style={{fontSize:11.5,color:a.includes("LEFT ON SCENE")?C.red:C.amber}}>⚠ {a}</div>)}</div>}
          </div>}
          <div style={{fontFamily:MONO,fontSize:12,lineHeight:2}}>
            <div><span style={{color:C.dim}}>IMPRESSION</span>  {g.pi?PI[g.pi].n:<span style={{color:C.faint}}>to be declared at the hospital</span>}</div>
            {ROWS.map(([k])=>{const v=g.vitals[k],st=v&&g.t-v.at>STALE;
              return (<div key={k}><span style={{color:C.dim,display:"inline-block",width:70}}>{k}</span>
                {v?<><span style={{color:st?C.dim:C.text}}>{v.value}</span>
                  <span style={{color:st?C.amber:C.faint,fontSize:10}}> {st?`⚠ ${clk(g.t-v.at)} OLD`:`(${clk(v.at-(g.onSceneAt??0))})`}</span></>
                  :<span style={{color:C.red}}>NEVER OBTAINED ⚠</span>}</div>);})}
          </div>
          <div style={{fontSize:11.5,color:C.faint,marginTop:12,borderTop:`1px solid ${C.line}`,paddingTop:10,lineHeight:1.6}}>
            You can only report what you measured. A stale vital read out as current is a lie you tell the receiving physician.
            Everything in the truck is within reach now — go and fill the blanks.
          </div></div>)}
      </div>{/* end px-work */}

      {/* ═══ RIGHT — MONITOR: VITALS + NARRATIVE, always on screen ═══ */}
      <div className="px-monitor">
        <div className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,padding:12,borderRadius:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
            <span style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim}}>VITALS</span>
            <span style={{fontFamily:MONO,fontSize:9,color:g.monitorBy?C.hr:C.faint}}>{g.monitorBy?"● LIVE MONITOR":"MEASURED ONLY"}</span></div>
          {ROWS.map(([k,c])=>{const v=g.vitals[k],age=v?g.t-v.at:0,soft=v&&age>SOFTSTALE&&age<=STALE,st=v&&age>STALE;
            return (<div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"5px 0",borderBottom:`1px solid ${C.line}`}}>
              <span style={{fontFamily:MONO,fontSize:11,color:C.dim}}>{k}</span>
              <div style={{textAlign:"right"}}>
                <span style={{fontFamily:MONO,fontSize:18,color:!v?C.faint:staleColor(age,c)}}>{v?v.value:"– – –"}</span>
                {v&&<div style={{fontFamily:MONO,fontSize:9,color:st?C.amber:soft?SOFTAMBER:C.faint}}>{st?`STALE · ${clk(age)} OLD`:soft?`aging · ${clk(age)}`:`taken ${clk(v.at-(g.onSceneAt??0))}`}</div>}</div>
            </div>);})}
        </div>
        <div className="p-3 rounded" style={{background:C.panel,border:`1px solid ${C.line}`,padding:12,borderRadius:8,flex:"1 1 auto",minHeight:220,maxHeight:"62vh",overflowY:"auto"}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".18em",color:C.dim,marginBottom:8}}>NARRATIVE</div>
          {g.log.length===0
            ?<div style={{fontSize:12,color:C.faint,lineHeight:1.6}}>Nothing yet. What you do, and what it costs you, shows up here.</div>
            :g.log.map((l,i)=>{const c=l.kind==="crit"?C.red:l.kind==="warn"?C.amber:l.kind==="good"?C.hr
              :l.kind==="disp"?C.spo2:l.kind==="pt"?C.text:C.dim;
              return (<div key={i} style={{display:"flex",gap:8,marginBottom:9,fontSize:12.5,lineHeight:1.55}}>
                <span style={{fontFamily:MONO,fontSize:10,color:C.faint,paddingTop:2,flexShrink:0}}>{clk(l.t-(g.onSceneAt??0))}</span>
                <span style={{color:c,fontStyle:l.kind==="pt"?"italic":"normal"}}>{l.text}</span></div>);})}
        </div>
      </div>
    </div>{/* end px-stage */}
  </div></Shell>);
}
