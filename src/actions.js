import { LIM } from "./scope.js";
import { cyan } from "./util.js";
import { PROCS } from "./data/procedures.js";

export const LIB=[
  {id:"loc",region:"head",tab:"assess",label:"Level of consciousness (AVPU)",gerund:"Assessing responsiveness",cost:10,lvl:0,probe:"loc",
    // F18: this fired the same "Awake. Oriented. Frightened." on every conscious
    // patient in every scenario, regardless of presentation — surfaced by
    // prankCall, whose "patient" is laughing and annoyed, not frightened.
    // Neutral default now; a scenario that actually warrants a specific
    // demeanor (frightened, annoyed, embarrassed…) opts in via probes.loc,
    // the same mechanism opqrst/sample already use for scenario-aware text.
    run:(s,v)=>({say:(v.spo2<LIM.spo2Unc||v.rr<8)?"Unresponsive. Nothing to voice, nothing to pain.":"Awake and oriented.",
      kind:v.spo2<LIM.spo2Unc?"warn":"obs"})},
  // Reads pat.skinDO2 (queue item 42's cutaneous-perfusion slice) directly,
  // not v.sbp -- real compensated shock shows cool, clammy, mottled skin
  // BEFORE blood pressure falls (skin is one of the first beds sacrificed
  // to preserve brain/heart), which the old sbp-threshold version could
  // never show. Threshold (0.78) is calibrated against measured examples,
  // not a single cited number: a healthy resting patient measures ~0.81,
  // a real, moderately-injured compensated-trauma patient (normal sbp)
  // measures ~0.76 -- placed to separate the two.
  //
  // ALSO fixes a real, PRE-EXISTING defect while rebuilding this action:
  // the old version treated any sbp<shock threshold as "gray, cool,
  // diaphoretic" regardless of MECHANISM -- clinically wrong for
  // distributive shock (anaphylaxis, sepsis, neurogenic, heat stroke),
  // which is textbook "warm shock": vasodilated, often flushed, NOT
  // vasoconstricted. pat.vasodilation is already a real, purpose-built
  // field several already-shipped conditions set for exactly this
  // (anaphylaxis, sepsis, neurogenic shock, heat stroke, addisonianCrisis)
  // -- reused directly here rather than trying to infer warm-vs-cold shock
  // indirectly from skinDO2/alphaTone, which would need a proper
  // expected-vasoconstriction-for-this-MAP baseline this batch does not
  // have and should not improvise under time pressure.
  {id:"skin",region:"head",tab:"assess",label:"Skin — color, temp, moisture",gerund:"Assessing skin",cost:15,lvl:0,probe:"skin",
    // Queue item 58: pat.urticaria (isolated histamine-driven hives/pruritus,
    // no bronch/edema/hemodynamic component) checked FIRST, ahead of the
    // shock findings below — a hives-only patient is otherwise hemodynamically
    // unremarkable and would fall through to the generic "warm, dry" line,
    // making the one real finding on this exam invisible to the player.
    // Threshold at 0.15 separates a genuinely present reaction from
    // allergicReactionMild/Moderate's own initial-condition floor noise.
    run:(s,v)=>{const skinDO2=s.patient?.skinDO2??1;
      const warmShock=(s.patient?.vasodilation??0)>0.15;
      const hypotensive=v.sbp<LIM.sbpShock;
      const cool=skinDO2<0.78;
      const urticaria=s.patient?.urticaria??0;
      // Queue item 61: v.angioedema is now a real, live field (was decorative
      // "no angioedema" text unconditionally, since nothing tracked it) — a
      // hives patient who ALSO has real airway/lip/tongue swelling now reads
      // differently from one who does not, and the finding tracks epi
      // treatment (v.angioedema falls) instead of being permanently fixed.
      const angioedema=v.angioedema??0;
      if(urticaria>0.15&&angioedema>0.2) return {say:"Raised, red welts scattered across the skin, and her lips and tongue are visibly swollen.",kind:"crit",
        find:`Skin: urticaria present, angioedema (lips/tongue) present${angioedema>0.4?", severe":""}.`};
      if(urticaria>0.15) return {say:"Raised, red welts scattered across the skin — hives. Warm, no swelling of the lips, tongue or airway.",kind:"warn",
        find:`Skin: urticaria present (no angioedema)${urticaria>0.4?", diffuse":""}.`};
      if(angioedema>0.2) return {say:"No hives, but her lips and tongue are visibly swollen.",kind:"crit",
        find:`Skin: no urticaria, angioedema (lips/tongue) present${angioedema>0.4?", severe":""}.`};
      if(hypotensive&&warmShock) return {say:"Warm. Flushed, even. Not what you'd expect from a pressure this low.",kind:"warn",
        find:"Skin: warm, flushed despite hypotension — distributive (warm) shock."};
      if(hypotensive) return {say:"Gray. Cool. Wringing wet.",kind:"warn",find:"Skin: gray, cool, diaphoretic."};
      if(cool) return {say:"Cool and clammy to the touch — pale, a little damp. Blood pressure's not showing it yet.",kind:"warn",
        find:"Skin: cool, clammy, pale — early compensated-shock sign, sbp still normal."};
      return {say:"Warm, dry.",kind:"obs",find:null};}},
  {id:"cyan",region:"head",tab:"assess",label:"Check for cyanosis (lips, nail beds)",gerund:"Checking cyanosis",cost:12,lvl:0,
    run:(s,v)=>{const c=cyan(v.spo2);
      return {say:c==="none"?"No cyanosis.":`${c[0].toUpperCase()+c.slice(1)} cyanosis.`,
        kind:c==="none"?"obs":c==="severe"?"crit":"warn",find:c==="none"?null:`Cyanosis: ${c}.`,
        evid:(c==="severe"||c==="mild")?`${c} cyanosis — hypoxic, and you did not need a machine to see it.`:null};}},
  {id:"pupils",region:"head",tab:"assess",label:"Pupils",gerund:"Checking pupils",cost:10,lvl:0,pocket:"penlight",probe:"pupils",
    // Was a hardcoded "Equal, reactive" on every patient, including severe TBI
    // scenarios that never bothered to override probes.pupils. Reads the same
    // two state variables neuro.js already computes: pat.icp>25 is the exact
    // threshold where this engine's own Cushing-reflex mechanism fires
    // (rising ICP against the brainstem — a blown, sluggish pupil is the real
    // bedside correlate), and v._cons (any depressed consciousness) for a
    // milder, non-lateralizing sluggishness. A scenario with a specific
    // narrated finding (e.g. a lateralized bleed) still wins via probes.pupils
    // — this is only the fallback every other scenario was silently missing.
    run:(s,v)=>{const pat=s.patient;
      if((pat?.icp||10)>25) return {say:"One pupil is bigger than the other, and slow to react.",kind:"crit",
        find:"Anisocoria, sluggish — rising ICP.",evid:"A newly blown, sluggish pupil with rising ICP is a herniation warning sign."};
      // Cholinergic toxidrome (organophosphatePoisoning, queue item 67) —
      // narrated only, gated on the real pat.cholinergicVagalTone that
      // condition itself drives (0.35-0.85 range — see conditions.js), not a
      // new decorative flag. No pupil-diameter mechanism exists anywhere in
      // this engine (the same standing limitation atropineOverdose's/
      // tricyclicOverdose's own mydriasis narration carries for the
      // opposite, anticholinergic, direction) — this field has exactly one
      // writer, so a >0 check cannot fire for any other condition.
      if((pat?.cholinergicVagalTone||0)>0) return {say:"Both pupils are pinpoint, barely visible.",kind:"warn",
        find:"Pupils: bilateral miosis (pinpoint).",evid:"Miosis fits the muscarinic toxidrome (cholinergic excess) — the opposite finding from an anticholinergic or opioid picture, and a real bedside clue toward organophosphate/nerve-agent exposure."};
      if(v._cons&&v._cons!=="awake") return {say:"Equal, but sluggish to react.",kind:"warn",find:"Pupils sluggish."};
      return {say:"Equal, reactive.",find:"PERRL."};}},
  // Physiology queue item 34: pat.strokeWeakness/strokeSide/strokeAphasia
  // (patient.js) are real, correctly-computed focal-deficit fields —
  // ischemicStroke (0.8), intracerebralHemorrhage (0.6), tia (0->0.7,
  // decaying over ~20 min as the deficit genuinely resolves), and
  // centralVertigo (0.2, deliberately subtle — see that condition's own
  // comment) all write them — but grep confirmed nothing player-facing
  // ever read them; only mechanismWiring.mjs/scenarioSweep.mjs did. This is
  // that reader: a FAST/Cincinnati-style face-arm-speech screen, distinct
  // from `reflexes` (DTRs/clonus/magnesium toxicity, a different exam
  // entirely) and from `loc` (some stroke scenarios narrate a positive
  // screen as fixed text there — this reads the same underlying fields
  // live instead, so it also works for any future/custom-builder stroke
  // presentation that never got bespoke probe text). Real FAST screens are
  // taught to laypeople/bystanders, so this is lvl:0 like the other primary
  // exam checks. Thresholds are keyed to the conditions that actually write
  // this field, not invented: 0.15 is the floor above centralVertigo's own
  // deliberately-subtle 0.2 (so it registers as a real but non-dramatic
  // finding, matching that condition's own "not a dramatic hemiparesis"
  // intent); 0.4 (facial droop) and 0.5 (complete drift) both sit below
  // ischemicStroke/intracerebralHemorrhage's 0.6-0.8 range, so both cross
  // into a full positive screen with drift, droop, and (since both also set
  // strokeAphasia) a speech deficit — matching Cincinnati's three positive
  // findings together.
  {id:"strokeScreen",region:"head",tab:"assess",label:"Stroke screen — face, arm, speech (FAST)",gerund:"Running a stroke screen",cost:15,lvl:0,probe:"strokeScreen",
    // Queue item 66: pat.dystonia checked FIRST, ahead of the FAST logic
    // below — an acute dystonic reaction (sustained involuntary head/neck/
    // face spasm, forced gaze deviation) is a well-documented real stroke
    // mimic, exactly the differential a candidate running this screen needs
    // to learn to recognize, not a coincidental reuse of this exam. Arms are
    // NOT weak/drifting in an uncomplicated dystonic reaction (acuteDystonicReaction,
    // conditions.js, deliberately does not touch strokeWeakness) and speech
    // is dysarthric from trismus/tongue involvement rather than aphasic, so
    // this is written as its own distinct finding instead of reusing FAST's
    // positive-screen wording, which would misrepresent the actual exam.
    run:(s)=>{const pat=s.patient,w=pat?.strokeWeakness||0,side=pat?.strokeSide,aphasia=!!pat?.strokeAphasia;
      const dystonia=pat?.dystonia||0;
      if(dystonia>0.3) return {say:"No arm drift or facial droop — but the neck is twisted hard to one side and won't release, jaw forced open, eyes deviated upward. Not a stroke pattern.",kind:"crit",
        find:`Stroke screen: negative for FAST (no drift/droop), but sustained dystonic spasm present (neck/jaw/eye deviation) — a real stroke mimic, not CVA.`,
        evid:"Involuntary sustained head/neck/face spasm with a NEGATIVE FAST screen is the classic acute dystonic reaction pattern, not a stroke — ask about any antiemetic/antipsychotic given recently and treat with diphenhydramine, not a stroke activation."};
      if(w<0.15) return {say:"Face symmetric, no droop. Both arms hold steady, no drift. Speech clear.",
        find:"FAST: negative — no facial droop, arm drift, or speech deficit."};
      const armPart=w>=0.5?`the ${side||"affected"} arm drifts all the way down and can't be held up against gravity`
        :`the ${side||"affected"} arm drifts and settles lower than the other side, weaker but not collapsed`;
      const facePart=w>=0.4?" One side of the face droops, flat at the corner of the mouth.":"";
      const speechPart=aphasia?" Speech is slurred, garbled, or the words don't come at all.":"";
      return {say:`Positive.${facePart} Raised together, ${armPart}.${speechPart}`,kind:"crit",
        find:`FAST: positive — ${side||"unilateral"} arm drift/weakness (${Math.round(w*100)}%)${w>=0.4?", facial droop":""}${aphasia?", speech deficit":""}.`,
        evid:"A positive FAST/Cincinnati stroke screen — time of last known well and rapid transport to a stroke-capable facility are the priority; there is no field-reversible treatment for the deficit itself."};}},
  {id:"airwayLook",region:"head",tab:"assess",label:"Look in the airway",gerund:"Inspecting the airway",cost:10,lvl:0,probe:"airwayLook",
    run:(s)=>({say:(s.vomited&&!s.rolled)?"Full of vomit. He is not protecting it.":"Patent.",kind:(s.vomited&&!s.rolled)?"crit":"obs"})},
  {id:"jvd",region:"neck",tab:"assess",label:"Jugular venous distension",gerund:"Inspecting neck veins",cost:20,lvl:1,probe:"jvd",
    // pat.cvp is a real, live right-atrial-pressure state variable
    // (cardiovascular.js integrates it every tick from venous return vs
    // cardiac output) — JVD IS what elevated CVP looks like at the bedside,
    // not a separate scripted sign, so this reads it directly instead of
    // returning "No distension" on every patient regardless of physiology.
    // Normal CVP is documented elsewhere in this codebase as 2-6 mmHg
    // (cardiovascular.js's pregnancy-benchmark comment); >8 is the commonly
    // taught bedside threshold for visible distension, >12 for marked
    // distension to the angle of the jaw.
    run:(s)=>{const cvp=s.patient?.cvp??4;
      if(cvp>12) return {say:"Distended right up to the angle of the jaw, even sitting up.",kind:"warn",find:`JVD present, elevated CVP.`};
      if(cvp>8) return {say:"Mildly full, visible with the head at 30 degrees.",kind:"obs",find:`Mild JVD.`};
      return {say:"No distension.",find:"No JVD."};}},
  {id:"neckStiffness",region:"neck",tab:"assess",label:"Check for neck stiffness",gerund:"Checking neck stiffness",cost:8,lvl:0,probe:"neck",
    // Meningismus (nuchal rigidity) is documented elsewhere in this codebase
    // (physio/conditions.js's meningitis condition) as narrative/exam-only —
    // no continuous vitals mechanism exists for it, and none should be
    // invented. A scenario like meningitisFeverNeck supplies its own
    // probes.neck override for the positive finding; every other patient
    // gets this real negative default instead of the action rendering
    // nothing at all (the prior state — no action anywhere declared
    // probe:"neck", so the one scenario that wrote one was dead content).
    run:()=>({say:"Chin tucks to chest without resistance or pain.",find:"Neck supple, no nuchal rigidity."})},
  {id:"carotid",region:"neck",tab:"assess",label:"Carotid pulse (10 seconds)",gerund:"Palpating carotid",cost:12,lvl:0,
    run:(s,v)=>(v.hr>0&&v.sbp>=LIM.sbpCarotid)?{say:`Present. ${v.hr}, thready.`,meas:{HR:`${v.hr}`}}
      :{say:"Nothing. Ten seconds. Nothing at all. Compressions.",kind:"crit",evid:"No central pulse."}},
  {id:"heart",region:"torso",tab:"assess",label:"Auscultate heart sounds",gerund:"Auscultating heart",cost:25,once:1,lvl:1,pocket:"scope",probe:"heart",
    // Was "unremarkable" on every patient. Now reads three real, independent
    // state variables a stethoscope actually distinguishes from what the
    // monitor already shows: pat.pericardialEffusion (tamponade muffles heart
    // sounds — the third leg of Beck's triad, alongside jvd/hypotension
    // above), v.edema (fluid overload produces a real S3 gallop), and
    // v.rhythm/v.ecg (an irregular rhythm or ectopic beat is audible, not
    // just visible on a strip). Priority runs most-specific/time-critical
    // first: muffled > gallop > irregular > rate > normal.
    run:(s,v)=>{const pat=s.patient;
      if((pat?.pericardialEffusion||0)>0.3) return {say:"Distant. Muffled. Hard to make out even with the bell.",kind:"crit",
        find:"Heart sounds muffled/distant.",evid:"Muffled heart sounds — with JVD and hypotension, that is Beck's triad for tamponade."};
      if(v.edema>0.3) return {say:"Rapid, with a soft extra sound right after S2 — a gallop.",kind:"warn",
        find:"S3 gallop present.",evid:"S3 gallop — volume overload, a failing ventricle."};
      if(v.rhythm==="afib") return {say:"Irregular. No two beats quite the same distance apart.",kind:"warn",find:"Heart sounds irregularly irregular."};
      if(v.ecg==="sinusPVC"||v.ecg==="sinusPAC") return {say:"Mostly regular, with the occasional early beat that breaks the pattern.",kind:"obs",find:"Occasional ectopic beats on auscultation."};
      return {say:v.hr>100?"Rapid, regular, no murmurs or rubs.":v.hr<60?"Slow, regular, no murmurs or rubs.":"Regular rate and rhythm. No murmurs, rubs, or gallops.",
        find:"Heart sounds unremarkable."};}},
  {id:"lungs",region:"torso",tab:"assess",label:"Auscultate lung fields",gerund:"Auscultating chest",cost:25,lvl:1,pocket:"scope",probe:"lungs",
    run:(s,v)=>({say:s.aspirated?"Coarse and wet at the right base. You did that.":v.bronch>.3?"Wheeze throughout.":"Clear and equal.",
      kind:s.aspirated?"crit":v.bronch>.3?"warn":"obs",
      find:s.aspirated?"Coarse crackles R base — aspiration.":v.bronch>.3?"Wheeze.":"Lungs clear."})},
  {id:"rr",region:"torso",tab:"assess",label:"Respirations — rate, DEPTH, effort",gerund:"Counting respirations",cost:25,lvl:0,
    run:(s,v)=>({say:`${v.rr} a minute.`+(v.rr<8?" Too slow. Normal is 12–20. And they are difficult to rouse — this is respiratory FAILURE, not distress."
      :v.rr>20?` Above normal (12–20). But rate is not adequacy — check the depth and the mental status.`:" Within the normal range, 12–20."),
      kind:v.rr<8?"crit":v.rr>24?"warn":"obs",find:`RR ${v.rr}.`,meas:{RR:`${v.rr}`},
      evid:v.rr<8?"RR 8 with decreased LOC — respiratory failure. Positive pressure ventilation is indicated.":null})},
  {id:"palp",region:"abdo",tab:"assess",label:"Palpate four quadrants",gerund:"Palpating abdomen",cost:25,once:1,lvl:1,probe:"abdo",
    run:()=>({say:"Soft. Non-tender.",find:"Abdomen soft."})},
  // Fetal heart tones (queue item V2-28, scoped slice) — a real Doppler
  // finding: reads the live pat.fetalHR obstetric.js now maintains (110-160
  // bpm normal; sustained bradycardia is the standard sign of fetal
  // distress from reduced placental perfusion). Only meaningful for a
  // pregnant, undelivered patient — every other patient gets an honest "not
  // applicable" rather than a fabricated number.
  {id:"fetalHeartTones",region:"abdo",tab:"assess",label:"Fetal heart tones (Doppler)",gerund:"Checking fetal heart tones",cost:20,lvl:1,
    run:(s)=>{
      const preg=s.patient?._pregnancy;
      if(!preg) return {say:"No fetus to assess — patient is not pregnant.",find:"N/A — not pregnant."};
      if(preg.delivered) return {say:"Mother has delivered — assess the newborn directly.",find:"N/A — already delivered."};
      const fhr=Math.round(s.patient.fetalHR??140);
      if(fhr<110) return {say:`${fhr} beats per minute. That's low — normal is 110 to 160.`,kind:"warn",
        find:`Fetal HR ${fhr} — sustained bradycardia.`,
        evid:"Fetal bradycardia (<110 bpm) — a real sign of fetal distress from reduced placental perfusion. Position, oxygenate, transport."};
      return {say:`${fhr} beats per minute. Within the normal 110-160 range.`,find:`Fetal HR ${fhr}.`};
    }},
  {id:"bpR",region:"armR",tab:"assess",label:"Blood pressure — RIGHT arm",gerund:"Right-arm pressure",cost:25,lvl:1,
    run:(s,v)=>{const d=Math.abs(v.sbp-v.sbpL),o={meas:{"BP (R)":`${v.sbp}/${v.dbp}`}};
      if(s.vitals["BP (L)"]&&d>=20){o.evid=`Systolic differential of ${d} mmHg between arms.`;
        o.find=`BP differential ${d} mmHg.`;o.say=`${v.sbp} here — nothing like the other side.`;o.kind="warn";}
      else o.say=`${v.sbp}/${v.dbp} on the right.`;
      return o;}},
  {id:"radR",region:"armR",tab:"assess",label:"Radial pulse — right",gerund:"Right radial",cost:15,lvl:0,
    run:(s,v)=>v.sbp>=LIM.sbpRadial?{say:`Present. ${v.hr}.`,meas:{HR:`${v.hr}`}}
      :{say:"You cannot find it. A radial needs about 90 systolic to be felt. Its ABSENCE is a finding — go central.",kind:"warn",
        evid:"Radial absent, carotid present — hypoperfusion, SBP under 90."}},
  {id:"pulseox",region:"armR",tab:"assess",label:"Pulse oximeter",gerund:"Applying pulse oximeter",cost:12,lvl:2,bag:"monitor",
    run:(s,v)=>{if(v.hr===0||v.sbp<60) return {say:"It searches and searches. It cannot find a pulse to read. That is information.",kind:"crit"};
      const pr=Math.max(0,v.hr+(v.sbp<LIM.sbpShock?-14:0)),dis=Math.abs(pr-v.hr)>8;
      return {say:`SpO₂ ${v.spo2}%. Pulse rate ${pr}.`+(dis?" That is not the rate you counted at the wrist.":""),
        kind:(dis||v.spo2<90)?"warn":"obs",meas:{"SpO₂":`${v.spo2}%`,PR:`${pr}`},
        evid:dis?"Oximeter PR ≠ palpated HR — poor peripheral perfusion.":null};}},
  {id:"pulseox",region:"armL",tab:"assess",label:"Pulse oximeter",gerund:"Applying pulse oximeter",cost:12,lvl:2,bag:"monitor",
    run:(s,v)=>{if(v.hr===0||v.sbp<60) return {say:"It searches and searches. It cannot find a pulse to read. That is information.",kind:"crit"};
      const pr=Math.max(0,v.hr+(v.sbp<LIM.sbpShock?-14:0)),dis=Math.abs(pr-v.hr)>8;
      return {say:`SpO₂ ${v.spo2}%. Pulse rate ${pr}.`+(dis?" That is not the rate you counted at the wrist.":""),
        kind:(dis||v.spo2<90)?"warn":"obs",meas:{"SpO₂":`${v.spo2}%`,PR:`${pr}`},
        evid:dis?"Oximeter PR ≠ palpated HR — poor peripheral perfusion.":null};}},
  {id:"gluc",region:"armR",tab:"assess",label:"Blood glucose",gerund:"Checking glucose",cost:25,once:1,lvl:2,pocket:"glucometer",probe:"glucometer",
    run:(s,v)=>({say:`${v.glu} mg/dL.`,find:`Glucose ${v.glu}.`,meas:{Glu:`${v.glu}`}})},
  {id:"gluc",region:"armL",tab:"assess",label:"Blood glucose",gerund:"Checking glucose",cost:25,once:1,lvl:2,pocket:"glucometer",probe:"glucometer",
    run:(s,v)=>({say:`${v.glu} mg/dL.`,find:`Glucose ${v.glu}.`,meas:{Glu:`${v.glu}`}})},
  {id:"bpL",region:"armL",tab:"assess",label:"Blood pressure — LEFT arm",gerund:"Left-arm pressure",cost:25,lvl:1,
    run:(s,v)=>{const d=Math.abs(v.sbp-v.sbpL),o={meas:{"BP (L)":`${v.sbpL}/${Math.round(v.sbpL*.62)}`}};
      if(s.vitals["BP (R)"]&&d>=20){o.evid=`Systolic differential of ${d} mmHg between arms.`;
        o.find=`BP differential ${d} mmHg.`;o.say=`${v.sbpL} systolic. You run it again. It does not change.`;o.kind="warn";}
      else o.say=`${v.sbpL}/${Math.round(v.sbpL*.62)} on the left.`;
      return o;}},
  {id:"radL",region:"armL",tab:"assess",label:"Radial pulse — left",gerund:"Left radial",cost:15,once:1,lvl:0,probe:"radL",
    run:(s,v)=>({say:`Present. ${v.hr}.`,meas:{HR:`${v.hr}`}})},
  {id:"pedL",region:"legL",tab:"assess",label:"Pedal pulse / calf — left",gerund:"Left leg",cost:25,once:1,lvl:0,probe:"pedL",
    // Distal pulses vasoconstrict away first in shock — the same "rule of
    // palpable pulses" this file's own radial/carotid thresholds already
    // encode (LIM.sbpRadial=90, sbpCarotid=60), one step further out. Pedal
    // pulses are harder to find than radial even in a healthy patient, so the
    // loss threshold sits above LIM.sbpRadial rather than at it.
    // Queue item 74, Phase 2: PULSELESSNESS (one of the 6 P's of acute limb
    // ischemia) previously had no local-limb reader at all — only the
    // systemic sbp check above, which cannot fire for a NORMOTENSIVE
    // patient with a real, local arterial occlusion (exactly
    // acuteLimbIschemia's own presentation: sbp 132, one dead leg). Now
    // reads pat.limbDO2.legL for real: a genuinely collapsed local
    // delivery goes pulseless even with a normal systemic pressure, the
    // mechanical fact a distal-pulse exam actually tests for.
    run:(s,v)=>{
      const legDO2=s.patient?.limbDO2?.legL??1;
      if(legDO2<0.3) return {say:"Can't find it. Cold below the point of pain. No pedal, no popliteal.",kind:"crit",find:"Pedal pulse absent — left leg."};
      return v.sbp>=LIM.sbpRadial+10?{say:"Present. Calf soft.",find:"Pedal pulse present."}
        :{say:"Can't find it. Radial's still there, so this is peripheral shunting, not a dead leg.",kind:"warn",find:"Pedal pulse absent."};
    }},
  {id:"pedR",region:"legR",tab:"assess",label:"Pedal pulse — right",gerund:"Right pedal",cost:20,once:1,lvl:0,probe:"pedR",
    // pedL already had a probe hook (probes.pedL) for a scenario to override;
    // pedR had none, so no scenario could ever attach a right-leg-specific
    // finding here (e.g. a unilateral fracture/vascular injury) — added for
    // parity, same fix shape as F20's earlier probe-key gaps.
    run:(s,v)=>{
      const legDO2=s.patient?.limbDO2?.legR??1;
      if(legDO2<0.3) return {say:"Can't find it. Cold below the point of pain. No pedal, no popliteal.",kind:"crit",find:"Pedal pulse absent — right leg."};
      return v.sbp>=LIM.sbpRadial+10?{say:"Present, equal to the left.",find:"Pedal pulse present."}
        :{say:"Can't find it here either — symmetric, at least.",kind:"warn",find:"Pedal pulse absent."};
    }},
  // Quick primary-survey check — "is he breathing at all," not a timed rate
  // count (that's countRespirations, torso, below — same A-then-B ordering
  // loc/airwayLook already establish at head). Binary presence reads v.rr the
  // same way countRespirations does, just without waiting to count a rate.
  //
  // Breath odor moves here from the old torso "checkBreathing" action — you
  // smell breath at the mouth, not the chest. It was previously 100%
  // scenario-scripted (probe:"breathOdor") and, confirmed by grep, no
  // scenario in this codebase has ever actually declared one — genuinely
  // inert on every patient. Two real cases are now wired instead of
  // scripted: pat.anionGap ((Na) - (Cl+hco3), metabolic.js) is itself a
  // real, previously-dead field (queue item 5) that rises whenever hco3
  // falls without a matching chloride rise — true metabolic acidosis with
  // unmeasured anions, which is exactly what diabeticKetoacidosis/
  // alcoholicKetoacidosis/starvationKetosis already produce through their
  // shared hco3-depletion mechanism. A gap this high (>16, the standard
  // elevated-anion-gap threshold; DKA's own hco3 floor of 6 measures ~32)
  // is real fruity/acetone breath, not an invented number. pat.bun (also
  // queue item 5, also real and live) is checked second, at a real uremic-
  // fetor threshold (>60 mg/dL — uremic fetor is reported clinically from
  // moderate-severe azotemia upward, not only end-stage; hyperkalemiaMissed
  // Dialysis seeds a real, chronic ~95 mg/dL at presentation per queue item
  // 35) — an ammonia/urine-like odor, distinct from ketosis's sweet one.
  // DKA's fruity odor is checked first: if both happened to be present, the
  // more acute ketoacidotic finding is the one that should be reported.
  // Alcohol and hydrocarbon odors still have no backing physiology state —
  // still filed as queue item 35 — so a scenario can opt in with its own
  // probes.breathOdor override for those, which wins over every case below.
  {id:"breathingCheck",region:"head",tab:"assess",label:"Check breathing — present/absent, odor",gerund:"Checking breathing",cost:2,lvl:0,probe:"breathOdor",
    run:(s,v)=>{
      if(v.rr<1) return {say:"Nothing. No chest rise, no air movement.",kind:"crit",
        find:"Apneic — not breathing.",evid:"Patient is apneic. Ventilate now."};
      const gap=s.patient?.anionGap??12;
      if(gap>16) return {say:"Breathing. A sweet, fruity smell on the breath — ketones.",kind:"warn",
        find:"Breathing present. Ketotic (fruity/acetone) breath odor.",evid:"Fruity breath odor with an elevated anion gap — ketoacidosis."};
      const bun=s.patient?.bun??12;
      if(bun>60) return {say:"Breathing. An ammonia-like, urine-like smell on the breath.",kind:"warn",
        find:"Breathing present. Uremic (ammonia) breath odor.",evid:"Uremic fetor — suggests significant renal failure/azotemia."};
      return {say:"Breathing. No unusual odor.",find:"Breathing present. Breath odor unremarkable."};}},
  // Renamed from "checkBreathing" — this is the timed rate/depth/effort
  // count; odor moved to the new head action above, where breath is
  // actually smelled. Kept distinct from the "rr" action's own rate/depth/
  // effort report rather than merged with it — no request to consolidate
  // those two.
  {id:"countRespirations",region:"torso",tab:"assess",label:"Count respirations",gerund:"Counting respirations",cost:20,lvl:0,
    run:(s,v)=>({say:`Respirations ${v.rr} a minute`+(v.rr<8?", too slow — normal is 12–20":v.rr>20?", above the normal 12–20 range":", within the normal 12–20 range")+".",
      kind:v.rr<8?"crit":v.rr>24?"warn":"obs",find:`RR ${v.rr}.`,meas:{RR:`${v.rr}`}})},
  // Capillary refill — press a nail bed and time the color returning. A crude
  // but fast perfusion read: brisk (<2s) when perfused, sluggish (>4s) in shock.
  // Scenarios may override via probes.capRefill for mottling/specific findings.
  // Now reads pat.skinDO2 (queue item 42) for a real graded (not just
  // binary shocky/not-shocky) delay, alongside the frank-shock/arrest
  // cases -- a moderately vasoconstricted (compensated) patient shows a
  // real, intermediate delay (2-4s) rather than jumping straight from
  // brisk to a scripted ">4s".
  {id:"capRefill",region:"armR",tab:"assess",label:"Capillary refill (nail bed)",gerund:"Checking capillary refill",cost:2,lvl:0,probe:"capRefill",
    run:(s,v)=>{const skinDO2=s.patient?.skinDO2??1;
      const warmShock=(s.patient?.vasodilation??0)>0.15;
      const shocky=(v.sbp<LIM.sbpShock||v.hr===0)&&!warmShock;
      const delayed=!shocky&&!warmShock&&skinDO2<0.78;
      if(shocky) return {say:"The color crawls back — past four seconds. Poor peripheral perfusion.",kind:"warn",
        find:"Cap refill >4s — poor perfusion.",evid:"Delayed capillary refill (>4s) — peripheral hypoperfusion."};
      if(delayed) return {say:"Two, three seconds — a little sluggish. Not brisk, not alarming yet.",kind:"warn",
        find:"Cap refill 2-4s — early peripheral vasoconstriction, sbp still normal.",
        evid:"Mildly delayed capillary refill with a normal blood pressure — compensated, not decompensated."};
      // A warm-shock (distributive) patient can be genuinely hypotensive
      // and still refill briskly, or even faster than normal early on
      // (vasodilation) -- confirmed by reading pat.vasodilation directly
      // rather than guessed; a brisk refill with a low sbp is itself a real
      // finding worth distinguishing from ordinary "everything's fine".
      if(warmShock&&(v.sbp<LIM.sbpShock||v.hr===0)) return {say:"Brisk — almost too brisk. Doesn't match a pressure this low.",kind:"warn",
        find:"Cap refill brisk despite hypotension — distributive (warm) shock, not hypovolemic.",evid:null};
      return {say:"Color returns in under two seconds. Brisk.",kind:"obs",find:"Cap refill <2s.",evid:null};}},
  // F20b: severePreeclampsia declared a probes.neuro finding (hyperreflexia
  // with ankle clonus — a real severe-feature teaching point) that no action
  // could ever surface, because nothing declared probe:"neuro". Deep tendon
  // reflexes/clonus are checked at the leg, so this lives there rather than
  // at "head" with the rest of the general neuro exam.
  {id:"reflexes",region:"legR",tab:"assess",label:"Deep tendon reflexes / clonus",gerund:"Checking reflexes",cost:20,lvl:1,probe:"neuro",
    // pat.magToxicity (pk.js) was a real, correctly-computed 0..1 severity —
    // its own comment says it is "exposed for the monitor and the wiring
    // suite" — that in fact reached nothing but mechanismWiring.mjs; the only
    // player-facing action for reflexes never read it. Hyporeflexia is the
    // FIRST clinical sign of magnesium toxicity (pk.js's own documented
    // thresholds: patellar reflex lost at mg 4.0-5.0 mmol/L, well before the
    // respiratory-depression threshold at 5.0-7.5) — the actual reason a real
    // crew checks reflexes during a magnesium sulfate infusion. A scenario's
    // own finding (e.g. severePreeclampsia's hyperreflexia/clonus) still wins
    // via probes.neuro, unchanged.
    run:(s)=>{const tox=s.patient?.magToxicity||0;
      // Serotonin syndrome (queue item 7, Toxicology backlog): real
      // neuromuscular hyperactivity, narrated only (no vitals-writing
      // mechanism for clonus exists in this engine, the same honest
      // approach mydriasis/miosis already use). Checked BEFORE the
      // magnesium-toxicity branch below — the two conditions are mutually
      // exclusive in practice and this is the opposite direction of finding
      // (hyperreflexia/clonus present, not absent/diminished).
      const clonus=s.patient?.serotoninClonus||0;
      // Neuroleptic malignant syndrome (queue item 7, Toxicology backlog):
      // real, sustained "lead-pipe" rigidity — a UNIFORM, constant increase
      // in tone through the full range of passive motion, with no rhythmic
      // beating and no relaxation between attempts. Checked BEFORE the
      // serotonin-clonus branch: the two toxidromes are mutually exclusive in
      // practice and this is the actual, teachable distinguishing exam
      // finding between them (Caroff & Mann) — sustained rigidity, not
      // intermittent/inducible clonus.
      const rigidity=s.patient?.nmsRigidity||0;
      if(rigidity>=0.7) return {say:"Rigid. Whole limb moves as one stiff unit through the full range, no give anywhere, no beating, doesn't relax when you stop pushing.",kind:"crit",
        find:"Sustained, uniform lead-pipe rigidity — no clonus. Neuroleptic malignant syndrome.",evid:"Lead-pipe rigidity, sustained and uniform through passive range, with no clonus and no relaxation between passes — NMS, not serotonin toxicity."};
      if(rigidity>=0.35) return {say:"Increased tone throughout, stiffer than normal, but no beating, no clonus.",kind:"warn",
        find:"Early sustained rigidity, no clonus.",evid:"A uniform increase in resting tone with no clonus — early lead-pipe rigidity."};
      if(clonus>=0.7) return {say:"Sustained clonus at both ankles, worse than the wrists. Hyperreflexic throughout, more so in the legs than the arms.",kind:"crit",
        find:"Sustained inducible clonus, hyperreflexia — worse in the lower extremities. Serotonin syndrome.",evid:"Clonus and hyperreflexia, more pronounced in the legs than the arms — classic serotonin toxicity, not a dystonic reaction."};
      if(clonus>=0.35) return {say:"A few beats of clonus at the ankle. Reflexes brisk, legs more than arms.",kind:"warn",
        find:"Inducible clonus and hyperreflexia, lower extremities more than upper.",evid:"Early clonus and hyperreflexia, lower extremities worse than upper."};
      if(tox>=0.6) return {say:"Nothing. No patellar reflex at all.",kind:"crit",
        find:"DTRs absent — magnesium toxicity.",evid:"Absent deep tendon reflexes on a magnesium infusion — stop it and reassess before the next sign is respiratory depression."};
      if(tox>=0.25) return {say:"Diminished. Barely there on the patella.",kind:"warn",find:"DTRs diminished — early magnesium toxicity."};
      return {say:"Reflexes 2+, symmetric. No clonus.",find:"DTRs 2+ symmetric, no clonus."};}},
  // Queue item V2-9 (thirst, generalized): pat.thirstDrive (renal.js) is a
  // real, osmolality-plus-effective-circulating-volume-derived 0-1 signal
  // that previously had no consumer anywhere — this is that consumer.
  // Gated on consciousness first: an unresponsive patient cannot report
  // thirst, the same "nothing to voice" framing the "loc" action above
  // already uses for the same case.
  {id:"askThirst",region:"head",tab:"assess",label:"Ask if thirsty",gerund:"Asking about thirst",cost:2,lvl:0,
    run:(s,v)=>{
      if(v._cons&&v._cons!=="awake") return {say:"No response.",find:"Cannot assess thirst — not responsive enough to ask."};
      const thirst=s.patient?.thirstDrive??0;
      if(thirst>=0.5) return {say:"\"I'm so thirsty. Can I have some water?\"",kind:"obs",
        find:"Reports significant thirst.",evid:"Patient reports marked thirst — consistent with dehydration/hyperosmolar state."};
      if(thirst>=0.15) return {say:"\"A little thirsty, I guess.\"",find:"Reports mild thirst."};
      return {say:"\"No, not really.\"",find:"Denies thirst."};}},
];
export const P=(id,region,tab,x={})=>{
  const multiSite=id==="iv"||id==="io"||id==="tq"; // can be applied to more than one limb at once
  return {id,region,tab,label:PROCS[id].name,gerund:PROCS[id].name,cost:PROCS[id].cost,
    lvl:PROCS[id].lvl,bag:PROCS[id].bag,pocket:PROCS[id].pocket,tip:PROCS[id].note,proc:1,
    doneKey:multiSite?`${id}@${region}`:id, ...x};
};
export const PROC_ACTS=[
  P("headTilt","head","airway",{once:1}),P("jawThrust","head","airway",{once:1}),
  P("opa","head","airway",{once:1}),P("npa","head","airway",{once:1}),P("sga","head","airway",{once:1}),
  P("ett","head","airway",{once:1}),P("cric","head","airway",{once:1}),P("laryngoscopy","head","airway",{once:1}),
  P("bvm","head","airway",{once:1}),P("mouthMask","head","airway",{once:1}),P("mouthMouth","head","airway",{once:1}),
  P("cpap","head","airway",{once:1}),P("vent","head","airway",{once:1}),
  P("o2nc","head","airway",{once:1}),P("o2nrb","head","airway",{once:1}),
  P("suction","head","procedures"),P("recovery","head","procedures",{once:1}),P("abdThrust","head","procedures"),
  P("cpr","torso","procedures"),P("lucas","torso","procedures",{once:1}),P("pads","torso","procedures",{once:1}),
  P("aedAnalyze","torso","procedures"),P("aedShock","torso","procedures"),
  // hideInList: the Monitor tab's own "MANUAL DEFIBRILLATION" section
  // (energy select -> charge -> shock, App.jsx) already runs this exact
  // action once pads are on and the paramedic charges the paddles — a
  // second, separate "Defibrillate 200 J (manual)" button in the
  // Procedures list was a duplicate route to the identical action, not a
  // different one. The action itself stays registered (procActs() still
  // builds it, and the Monitor tab's own button still finds it via
  // A.find(a=>a.id==="defib")) — only the redundant list entry is hidden.
  P("defib","torso","procedures",{hideInList:1}),P("cardiovert","torso","procedures"),P("pacing","torso","procedures",{once:1}),
  P("icdMagnet","torso","procedures",{once:1}),
  P("valsalva","torso","procedures",{once:1}),P("chestSeal","torso","procedures",{once:1}),
  P("ecgAcquire","torso","procedures",{once:1}),P("ecgRead","torso","procedures",{once:1}),
  P("needleD","torso","procedures",{once:1}),P("chestTube","torso","procedures",{once:1}),
  P("ultrasound","torso","procedures"),P("paCath","torso","procedures",{once:1}),P("warm","torso","procedures",{once:1}),
  P("moveToShade","torso","procedures",{once:1}),P("activeCooling","torso","procedures",{once:1}),
  P("headElevate","head","procedures",{once:1}),
  P("cCollar","neck","procedures",{once:1}),
  P("pelvicBinder","abdo","procedures",{once:1}),P("pack","abdo","procedures"),P("directPressure","abdo","procedures"),
  P("fundalMassage","abdo","procedures"),
  // F42: label alone used to be overridden here while gerund stayed the
  // generic PROCS[id].name (P()'s own default, which the busy/progress
  // indicator reads — App.jsx's busy state is built from a.gerund, not
  // a.label) — so the busy banner for EVERY one of these site-specific
  // draws showed the same generic site ("IO — humeral head", "IV — 18g
  // antecubital") regardless of which real site was clicked. gerund now
  // matches label at every site.
  P("iv","armR","iv",{once:1,label:"IV — 18g right antecubital",gerund:"IV — 18g right antecubital"}),
  P("io","armR","iv",{once:1,label:"IO — right humeral head",gerund:"IO — right humeral head"}),
  P("iv","armL","iv",{once:1,label:"IV — 18g left antecubital",gerund:"IV — 18g left antecubital"}),
  P("io","armL","iv",{once:1,label:"IO — left humeral head",gerund:"IO — left humeral head"}),
  P("iv","legR","iv",{once:1,label:"IV — 18g right saphenous",gerund:"IV — 18g right saphenous"}),
  P("io","legR","iv",{once:1,label:"IO — right tibial",gerund:"IO — right tibial"}),
  P("iv","legL","iv",{once:1,label:"IV — 18g left saphenous",gerund:"IV — 18g left saphenous"}),
  P("io","legL","iv",{once:1,label:"IO — left tibial",gerund:"IO — left tibial"}),
  // F6: sternal IO — a real, commonly-taught adult IO site (e.g. the FAST1
  // system), landmarked on the manubrium. Lives under "torso" like the other
  // chest procedures rather than a limb, since it isn't one.
  P("io","torso","iv",{once:1,label:"IO — sternal (manubrium)",gerund:"IO — sternal (manubrium)"}),
  // Sternal IO is classified under tab: "iv" so it populates g.ivSites and enables all IV/IO medications.
  P("artLine","armR","procedures",{once:1,label:"Arterial line — right radial",gerund:"Arterial line — right radial"}),
  P("artLine","armL","procedures",{once:1,label:"Arterial line — left radial",gerund:"Arterial line — left radial"}),
  // EtCO₂ belongs at the mouth, not the arms. It samples exhaled gas — via a
  // nasal cannula on a spontaneously breathing patient (no advanced airway
  // required) or inline on an SGA/ETT for continuous waveform capnography.
  P("etco2","head","assess",{label:"EtCO₂ — capnography (mouth)"}),
  P("tq","armR","procedures",{once:1}),P("tq","armL","procedures",{once:1}),
  P("tq","legR","procedures",{once:1}),P("splint","legR","procedures",{once:1}),
  P("traction","legR","procedures",{once:1}),P("reboa","legR","procedures",{once:1}),
  P("tq","legL","procedures",{once:1}),P("splint","legL","procedures",{once:1}),
  P("traction","legL","procedures",{once:1}),P("reboa","legL","procedures",{once:1}),
];

