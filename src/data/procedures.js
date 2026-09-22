// COST AUDIT (queue item: "audit existing cost values against real EMS
// time-motion benchmarks"). Every `cost` field below was reviewed against
// NREMT skill-sheet timing and general EMS time-motion literature. Two
// genuine internal-consistency defects were found and fixed (pack, traction
// — both flagged below at their own site with the real-world reasoning).
// Everything else was left alone: for the high-end Paramedic/Unlimited
// procedures (chestTube, reboa, paCath, artLine, ultrasound) the real-world
// skill takes minutes, and the current costs are already a DELIBERATELY
// compressed, game-paced fraction of that — moving them slower would be
// going the wrong direction from the actual complaint ("some things feel
// too slow"), and moving them faster has no defensible real-world anchor
// (a chest tube does not go in in under two minutes in reality, full stop).
// For the routine BLS/EMR actions (headTilt, jawThrust, opa, npa, pulseox,
// autoBP, o2nc, o2nrb, etc.) no published benchmark gives a number precise
// enough to override the current values, and none showed the kind of
// clear cross-procedure ordering problem the two fixes below did — so per
// this project's own "identify numbers, do not tune them" discipline, they
// are left as-is rather than guessed at.
export const PROCS={
  /* Layperson (0) */
  headTilt:{pkModel:"curve",name:"Head-tilt / chin-lift",lvl:0,cost:5,onset:0,dur:9999,fx:{},airwayFix:1,
    note:"National Scope: all levels. No trauma. It is the first thing anybody does and it is free."},
  jawThrust:{pkModel:"curve",name:"Jaw-thrust",lvl:0,cost:5,onset:0,dur:9999,fx:{},airwayFix:1,
    note:"National Scope: all levels. The airway maneuver when the c-spine is in question."},
  mouthMask:{pkModel:"curve",name:"Mouth-to-mask (pocket mask)",lvl:0,cost:18,onset:15,dur:9999,fx:{fio2:.17}, ventilation:{rr:9,vt:.35},
    note:"National Scope: all levels. Exhaled air is about 16% oxygen — and it is infinitely more than none."},
  mouthMouth:{pkModel:"curve",name:"Mouth-to-mouth / barrier",lvl:0,cost:15,onset:15,dur:9999,fx:{fio2:.16}, ventilation:{rr:8,vt:.3}},
  // fx no longer contains an sbp offset: compressions are handled by the
  // cardiovascular model as an external pump (pat.cprActive), so the resulting
  // pressure, cardiac output, oxygen delivery and end-tidal CO2 all emerge from
  // the circulation rather than being written onto the monitor.
  cpr:{pkModel:"curve",name:"Chest compressions",lvl:0,cost:60,onset:0,dur:150,fx:{},
    note:"Nothing takes priority — not drugs, not transport. In a complete FBAO that goes unconscious, compressions ARE the maneuver."},
  // Mechanical CPR device (LUCAS-type). Drives the exact same pat.cprActive
  // pump as manual compressions (pk.js) — a device and a rescuer's hands are
  // two ways of producing the same mechanical event, not two mechanisms.
  // dur:9999 (continuous, like pads/leads) instead of cpr's dur:150 is the
  // actual point of the device: once applied it doesn't need to be
  // re-started every couple of minutes as a human tires. Mutually exclusive
  // with manual "cpr" (App.jsx's EXCL_GROUPS) — one compression source at a
  // time — and, unlike manual compressions, frees the applying provider's
  // hands for everything else a code needs done at once.
  lucas:{pkModel:"curve",name:"Mechanical CPR device (LUCAS)",lvl:1,cost:45,onset:0,dur:9999,fx:{},
    note:"Once applied, compressions are continuous and fatigue-free. Applying it still takes hands and time; it does not replace the first round of manual compressions while it's being set up."},
  // "pads" itself is retired (see actions.js's own comment at PROC_ACTS) —
  // DEVICES.pads (devices.js) is the one real definition now, consumed by
  // deviceActs()'s attach_pads / DeviceMinigame.
  aedAnalyze:{pkModel:"curve",name:"AED — analyze rhythm",lvl:0,bag:"monitor",cost:10,onset:0,dur:0,fx:{}},
  aedShock:{pkModel:"curve",name:"AED — deliver shock",lvl:0,bag:"monitor",cost:5,onset:0,dur:0,fx:{},rhythmFix:1},
  recovery:{pkModel:"curve",name:"Recovery position",lvl:0,cost:10,onset:0,dur:9999,fx:{},airwayFix:1},
  abdThrust:{pkModel:"curve",name:"Back blows / abdominal thrusts",lvl:0,cost:15,onset:0,dur:0,fx:{}},
  // CLASSIFICATION — LEGITIMATELY DIRECT (audited, not a placeholder).
  // directPressure / pack / splint / traction / pelvicBinder all write `bleed`
  // directly, and that is correct: they are MECHANICAL hemostasis. They do not
  // act through a receptor or a clotting factor — they physically reduce the
  // cross-section of the bleeding vessel or the volume the hematoma can occupy.
  // `bleed` (pat.activeBleedRate) is the engine's own hemorrhage-rate state, not
  // a monitor value, and everything downstream (blood volume, hematocrit,
  // dilutional coagulopathy, shock) still emerges from it. The tourniquet's
  // `stopsBleed:1` is the same argument taken to its limit: it is a switch.
  directPressure:{pkModel:"curve",name:"Direct pressure",lvl:0,cost:12,onset:0,dur:9999,fx:{bleed:-.3}},
  tq:{pkModel:"curve",name:"Tourniquet",lvl:0,pocket:"tq",cost:6,onset:5,dur:9999,fx:{},stopsBleed:1,
    note:"National Scope: tourniquet is ALL LEVELS, including EMR and layperson."},
  // Cost audit: was 14s, barely above directPressure's 12s. Real wound
  // packing (opening hemostatic gauze, packing the cavity to its base,
  // holding it there) is a genuinely more involved skill than simply
  // pressing on a wound — TCCC/TECC training treats packing as its own,
  // longer step, not a marginal increment over direct pressure. Raised to
  // 20s to reflect that real ordering, not a guessed number.
  pack:{pkModel:"curve",name:"Wound packing",lvl:0,bag:"trauma",cost:20,onset:5,dur:9999,fx:{bleed:-.4}},
  /* EMR (1) */
  opa:{pkModel:"curve",name:"Oropharyngeal airway",lvl:1,bag:"airway",cost:10,onset:5,dur:9999,fx:{},airwayFix:1,
    hold:(v)=>v.rr>10&&"They are protecting their own airway. It will be gagged straight back out."},
  bvm:{pkModel:"curve",name:"Bag-valve-mask",lvl:1,bag:"airway",cost:18,onset:20,dur:9999,fx:{fio2:1}, ventilation:{rr:10,vt:.5},
    note:"One breath every 6 seconds, just enough for visible CHEST RISE — then LET THEM EXHALE. Stacking breaths retains CO₂ and kills venous return."},
  o2nc:{pkModel:"curve",name:"Oxygen — nasal cannula",lvl:1,bag:"airway",cost:10,onset:60,dur:9999,fx:{fio2:.32}},
  o2nrb:{pkModel:"curve",name:"Oxygen — NRB 15 L/min",lvl:1,bag:"airway",cost:12,onset:45,dur:9999,fx:{fio2:.85}},
  // RESOLVED — physiology queue item 13. pat.airwayFluid (0-1, patient.js) is
  // fed today by pediatricDrowning (aspirated water in the conducting airway,
  // separate from its own alveolar shuntFraction) and generically by severe
  // pulmonary edema (respiratory.js: any condition that drives pat.edema past
  // 0.6 floods the airway too, not only the alveoli — chf/hypertensiveEmergency
  // reach it for free). It raises airway resistance (primary effect) and adds a
  // smaller shunt contribution (respiratory.js) — see the comments at both
  // sites. `reducesAirwayFluid` below is consumed in pk.js::applyProcedures,
  // once per application (a dedup ledger, not a continuous suppression), so
  // suctioning removes 60% of whatever is currently there and the underlying
  // source (ongoing aspiration, ongoing frothing) can reaccumulate it —
  // realistic re-suctioning, not a one-and-done fix. GI bleed and facial
  // trauma remain named-but-unwired sources: neither has a condition built yet
  // (see section 8's Trauma list for facial trauma with airway compromise, and
  // physiology queue item 23 for GI hemorrhage) — wire them into
  // pat.airwayFluid the same way once they exist, rather than guessing at
  // conditions that don't.
  suction:{pkModel:"curve",name:"Suction — upper airway",lvl:1,bag:"airway",cost:15,onset:0,dur:0,fx:{},reducesAirwayFluid:0.6},
  manualBP:{pkModel:"curve",name:"Blood pressure — manual",lvl:1,pocket:"scope",cost:28},
  cspine:{pkModel:"curve",name:"Manual C-spine stabilization",lvl:0,cost:10,onset:0,dur:9999,fx:{},
    note:"Hold the head in neutral in-line alignment until a collar and board are on."},
  cCollar:{pkModel:"curve",name:"Cervical collar",lvl:1,bag:"trauma",cost:15,onset:0,dur:9999,fx:{}},
  splint:{pkModel:"curve",name:"Extremity splinting",lvl:1,bag:"trauma",cost:40,onset:10,dur:9999,fx:{pain:-3,bleed:-.2}},
  /* EMT (2) */
  npa:{pkModel:"curve",name:"Nasopharyngeal airway",lvl:2,bag:"airway",cost:10,onset:5,dur:9999,fx:{},airwayFix:1,
    note:"National Scope: EMT. Tolerated by a patient with an intact gag — which is the whole point of it."},
  // A supraglottic airway does not "add tidal volume" (the former fx:{tv:.2}
  // wrote 200 mL onto every breath, including a patient who was not being
  // ventilated at all). What it physically does is bypass the collapsible
  // oropharynx: it removes the upper-airway resistance and excludes part of the
  // anatomic dead space from the conducting path. Both are now declared as an
  // `artificialAirway` mechanism (see respiratory.js) and the tidal volume that
  // results is whatever the mechanics then permit.
  //
  // An SGA sits ABOVE the glottis, so it excludes only the oro/nasopharynx —
  // roughly 40% of anatomic dead space — and leaves a partial seal, so the
  // resistance reduction is smaller than a cuffed tube's.
  sga:{pkModel:"curve",name:"Supraglottic airway (i-gel / King LT)",lvl:2,bag:"airway",cost:20,onset:10,dur:9999,fx:{},
    artificialAirway:{deadSpaceFraction:.40,resistanceFactor:.75,seal:.7},airwayFix:1,
    note:"Now EMT-level nationally. The PREFERRED advanced airway — intubation is deferred until after ROSC."},
  // CPAP delivers CONTINUOUS positive pressure to a spontaneously breathing
  // patient — it splints alveoli open and offsets the inspiratory threshold load,
  // it does not deliver a set breath. The former fx:{tv:.5} added half a litre to
  // every breath, producing 1.9 L tidal volumes and pH 7.77. Declaring it as
  // assisted ventilation at the patient's own rate lets it unload the muscles and
  // improve recruitment without inventing volume.
  cpap:{pkModel:"curve",name:"CPAP",lvl:2,bag:"airway",cost:25,onset:60,dur:9999,// No direct `edema` effect: CPAP does not remove alveolar fluid. It RECRUITS
  // flooded and collapsed alveoli (reducing shunt) and raises intrathoracic
  // pressure (reducing preload, and so the hydrostatic pressure driving fluid
  // into the alveoli). Both now happen through physiology — see recruitment in
  // respiratory.js and appliedPEEP in cardiovascular.js.
  fx:{fio2:.9}, peep:8, ventilation:{rr:0,vt:.55},
    hold:(v)=>v.sbp<90&&"Hypotensive. CPAP is contraindicated.",
    note:"First line in pulmonary edema. Hold if hypotensive or suspected pneumothorax."},
  pulseox:{pkModel:"curve",name:"Pulse oximeter",lvl:2,bag:"monitor",cost:10},
  autoBP:{pkModel:"curve",name:"Blood pressure — automated (background)",lvl:2,bag:"monitor",cost:4},
  // "glucometer" itself is retired — it was never registered as a real
  // action (no P("glucometer",...) anywhere in actions.js), so this entry,
  // its App.jsx run() branch, and every s.given.glucometer/categories.js
  // reference to it were all dead on arrival. The real, reachable action is
  // "gluc" (actions.js), which already routes through GlucometerMinigame.
  ecgAcquire:{pkModel:"curve",name:"12-lead — acquire and transmit",lvl:2,bag:"monitor",cost:25,
    note:"National Scope: EMT may ACQUIRE and TRANSMIT a 12-lead. Interpretation is Paramedic-level. You will see the strip. You will not be told what it says."},
  // Cost audit: was 25s — LESS than plain extremity splinting (splint,
  // above, at 40s), which is backwards. A traction splint (Sager/Hare-type)
  // is objectively the more involved skill: measure the uninjured limb,
  // apply the ankle hitch, seat the device against the ischial tuberosity,
  // and ratchet to a target traction force — real skill runs commonly take
  // several minutes. Raised to 45s, above splint's 40s, to fix that
  // ordering rather than leaving the more complex skill priced as cheaper.
  traction:{pkModel:"curve",name:"Traction splint",lvl:2,bag:"trauma",cost:45,onset:10,dur:9999,fx:{pain:-4,bleed:-.3}},
  // RESOLVED — physiology queue item 9. Bimanual/fundal massage stimulates
  // myometrial contraction directly (and via reflex endogenous oxytocin
  // release) — the SAME observable oxytocin acts on (see
  // obstetric.js::updatePostpartumHemostasis and pat.uterotonicDrive,
  // pk.js), not a separate bleed-rate suppression. Postpartum only (no
  // consequence on any patient without pat._pregnancy — the receptor handler
  // is a no-op if nothing downstream reads uterotonicDrive). 0.5, lower than
  // oxytocin's 0.85: real practice is massage FIRST, escalating to a
  // uterotonic drug if massage alone does not control it, and the two
  // compose (accumulate) if both are given, matching combination therapy for
  // refractory atony.
  fundalMassage:{pkModel:"curve",name:"Fundal massage",lvl:2,bag:"trauma",cost:20,onset:0,dur:9999,
    fx:{}, receptors:{uterotonic:0.5},
    note:"Postpartum only. Firm, circular massage of the uterine fundus to stimulate contraction and control atonic bleeding."},
  // RESOLVED — queue item 7 (openPneumothorax/hemothorax). Was fx:{} —
  // completely inert — despite three existing scenarios' own resolve() text
  // already claiming a chest seal "keeps the sucking wound from becoming a
  // tension." sealsChest (pk.js) sets a real, persistent flag every
  // condition's own tension-progression logic now checks before letting an
  // open pneumothorax convert to a tension one.
  chestSeal:{pkModel:"curve",name:"Vented chest seal",lvl:1,bag:"trauma",cost:15,onset:5,dur:9999,fx:{},sealsChest:1},
  pelvicBinder:{pkModel:"curve",name:"Pelvic binder",lvl:1,bag:"trauma",cost:20,onset:10,dur:9999,fx:{bleed:-.5},
    note:"At the GREATER TROCHANTERS. Not the iliac crests."},
  // fx:{temp:2.2,coag:8} removed, both of them. `temp:2.2` added 2.2 degrees to
  // ANY patient, including a normothermic one (who would be driven to 39.2 C);
  // heat is now added as POWER and the existing heat-balance equation decides
  // what temperature results, so a cold patient rewarms and a warm one barely
  // moves. `coag:8` was a second, redundant path to an effect the coagulation
  // model already produces: clotStrength divides by a temperature term, so
  // raising core temperature improves clotting on its own. Declaring it twice
  // meant warming a 30 C patient credited the factor bonus immediately, before
  // any actual rewarming had occurred.
  //
  // 55 W net is a forced-air convective warmer plus warmed fluids — roughly
  // 1 C/hr in an adult, which is the documented achievable rate.
  warm:{pkModel:"curve",name:"Active warming",lvl:1,cost:25,onset:60,dur:9999,fx:{},warmingPower:55,
    note:"Cold blood does not clot. Warming is a hemostatic intervention."},
  // MOVE TO SHADE (queue item 26) — Layperson scope: this is the one thing a
  // bystander can always do, no equipment required, and it is a real,
  // bounded intervention (removes direct solar radiant load, thermo.js) —
  // not a cure, since ambient air temperature on a hot day does not change.
  // An instantaneous environmental relocation, hence shadeFix (a boolean
  // flip, like airwayFix/ptxFix) rather than a continuous curve.
  moveToShade:{pkModel:"curve",name:"Move to shade",lvl:0,cost:0,onset:2,dur:9999,fx:{},shadeFix:1,
    note:"Removes direct sun exposure. Does not lower ambient air temperature — heat stroke needs active cooling and transport, not just shade."},
  // ACTIVE COOLING (ice packs to neck/axillae/groin, cold water misting +
  // fanning) — the same power-into-the-heat-balance idiom warm/warmingPower
  // already uses, in reverse. 400 W approximates the achievable end of
  // documented field evaporative-assisted cooling protocols (roughly
  // 0.1-0.2 C/min net, once combined with the patient's own — often failed —
  // sweat mechanism and removal of solar/ambient load); cold-water immersion
  // is faster still but is not a field BLS/ALS procedure this drug box models.
  activeCooling:{pkModel:"curve",name:"Active cooling (ice packs / misting)",lvl:1,cost:20,onset:30,dur:9999,fx:{},coolingPower:400,
    note:"Ice packs to neck, axillae, groin; cold water misting with fanning. Do not delay transport to cool in the field."},
  // Queue item 55 — a genuinely separate, milder cooling mechanism, distinct
  // from ice-packs/misting's 400W. TP 1204 (fever without sepsis) and TP
  // 1209 (hyperthermia in agitation, mild tier) both call for undressing/
  // removing excess blankets, not the aggressive heat-stroke protocol — a
  // real clinical distinction this engine previously had no way to
  // represent (both reused the SAME activeCooling procedure). 100W is an
  // order-of-magnitude estimate, not fitted to a specific study (stated
  // honestly, per this project's own "identify numbers, do not tune them"
  // discipline: no field trial measures W removed by blanket removal
  // specifically) — chosen as roughly a quarter of activeCooling's 400W,
  // reflecting that undressing only increases ordinary radiant/convective
  // skin heat loss (thermo.js's own skinHeatLoss term), while ice packs plus
  // misting add real evaporative cooling on top of that (thermo.js's own
  // 700W evaporative ceiling), a mechanistically much larger effect.
  // MEASURED (condition-less control, coreTemp forced to 38.5 with a
  // sustained metabolicHeatMultiplier of 1.15 so it doesn't self-resolve,
  // 900s): untreated settles at 37.31, passiveCooling at 37.11 (an extra
  // -0.20 C beyond natural resolution), activeCooling at 37.00 (an extra
  // -0.31 C) -- passiveCooling is real, present, and correctly milder than
  // activeCooling, not a relabeled copy of it.
  passiveCooling:{pkModel:"curve",name:"Passive cooling (remove excess clothing/blankets)",lvl:1,cost:15,onset:20,dur:9999,fx:{},coolingPower:100,
    note:"Remove excess clothing and blankets. Add a light blanket back only if shivering starts. Not the ice-pack/misting protocol — that's for suspected heat stroke."},
  /* AEMT (3) */
  iv:{pkModel:"curve",name:"IV — 18g antecubital",lvl:3,bag:"drug",cost:25},
  // F6: IO is FASTER than a peripheral IV in practice — it is the reason IO
  // access exists at all (the difficult/emergent-access route), not a slower
  // fallback. Was 40s against IV's 25s, backwards; IO driving (EZ-IO or
  // manual) is a single motion into a fixed landmark, no vein-finding.
  io:{pkModel:"curve",name:"IO — humeral head",lvl:3,bag:"drug",cost:15},
  etco2:{pkModel:"curve",name:"Waveform capnography",lvl:3,bag:"monitor",cost:20,
    note:"National Scope: EtCO₂ monitoring and waveform interpretation is AEMT."},
  /* Paramedic (4) */
  ecgRead:{pkModel:"curve",name:"12-lead — INTERPRET",lvl:4,bag:"monitor",cost:25,
    note:"National Scope: interpretive 12-lead is Paramedic-only."},
  defib:{pkModel:"curve",name:"Defibrillate 200 J (manual)",lvl:4,bag:"monitor",cost:10,onset:0,dur:0,fx:{},rhythmFix:1},
  // fx:{hr:-60} removed: cardioversion does not "slow" a heart by 60 beats, it
  // TERMINATES a reentrant circuit or chaotic atrial activity. rhythmFix:
  // "cardiovert" (its own value, wider than adenosine's "svt"-only one — see
  // pk.js) does that for SVT AND AFib/AFib-with-RVR, and the rate that
  // follows is whatever the sinus node and the baroreflex then produce — which
  // is why a cardioverted patient who is still hypovolemic stays tachycardic.
  cardiovert:{pkModel:"curve",name:"Synchronised cardioversion",lvl:4,bag:"monitor",base:1,cost:25,onset:0,dur:0,fx:{},rhythmFix:"cardiovert",
    note:"Unstable tachycardia. Sedate first if they are awake — and they will remember if you don't."},
  // fx:{hr:35,sbp:18} removed. That wrote a monitor number: it raised the
  // displayed pressure by 18 mmHg whether or not the pacer ever captured, and it
  // added 35 to whatever rate the patient already had rather than IMPOSING a
  // rate. Pacing now declares a pacemaker (`pacer`) and the engine decides
  // whether capture occurs and what haemodynamics follow — see
  // updateCardiovascular. The clinical consequence the note has always described
  // ("electrical capture is not mechanical capture") is now literally true in
  // the model: a paced beat is ventricular in origin, so it is dyssynchronous
  // and loses the atrial kick, and in an asystolic or profoundly acidotic
  // myocardium it may not capture at all.
  pacing:{pkModel:"curve",name:"Transcutaneous pacing",lvl:4,bag:"monitor",base:1,cost:25,onset:15,dur:9999,fx:{},
    pacer:{rate:70,mA:70},
    note:"Electrical capture is not mechanical capture. Palpate a pulse with every spike."},
  // Suspends an implanted defibrillator's shock therapy without touching the
  // underlying rhythm at all (queue item 7, aicdMalfunction) — a genuinely
  // distinct mechanism from every other rhythm procedure in this file, which
  // is the actual teaching point: this fixes the DEVICE, not the heart.
  // Real EMS/ACLS guidance for suspected inappropriate ICD shocks.
  icdMagnet:{pkModel:"curve",name:"Magnet — suspend ICD therapy",lvl:4,bag:"monitor",cost:5,onset:0,dur:9999,fx:{},icdMagnet:1,
    note:"A ring magnet over the device suspends shock (not pacing) therapy. Confirm this is truly inappropriate first — you are disabling their protection against a real VF."},
  // HEAD-OF-BED / REVERSE TRENDELENBURG ELEVATION (queue item 70) — TP 1244
  // (TBI) step 22/23 and TP 1232 (stroke) both ask for 30-degree head
  // elevation as a real ICP-reducing measure; neuro.js's own pat.icp formula
  // previously had no position input at all. An instantaneous positioning
  // change, hence a boolean flip (headElevated, the same idiom as
  // shadeFix/icdMagnet above) rather than a continuous curve — a gurney
  // stays elevated once raised, it does not need re-raising every tick.
  headElevate:{pkModel:"curve",name:"Elevate head of bed 30°",lvl:0,cost:5,onset:0,dur:9999,fx:{},headElevated:1,
    note:"Improves cerebral venous drainage, modestly lowering ICP. Contraindicated in suspected spinal injury without full immobilization first."},
  // A cuffed endotracheal tube excludes the whole upper airway from the
  // conducting path (~50% of anatomic dead space) and replaces a variable,
  // collapsible pharynx with a fixed-calibre tube. See sga above for why the
  // former fx:{tv:.3} was wrong.
  ett:{pkModel:"curve",name:"Endotracheal intubation",lvl:4,bag:"airway",cost:25,onset:15,dur:9999,fx:{},
    artificialAirway:{deadSpaceFraction:.50,resistanceFactor:.55,seal:1},airwayFix:1},
  laryngoscopy:{pkModel:"curve",name:"Direct laryngoscopy — Magill forceps",lvl:4,bag:"airway",cost:25,onset:0,dur:0,fx:{},airwayFix:1,
    note:"Visualise the obstruction and pull it out — after compressions, not instead of them."},
  cric:{pkModel:"curve",name:"Cricothyrotomy",lvl:4,bag:"airway",cost:25,onset:15,dur:9999,fx:{fio2:1}, ventilation:{rr:10,vt:.45},airwayFix:1,
    note:"Can't intubate, can't oxygenate. The decision is harder than the procedure."},
  needleD:{pkModel:"curve",name:"Needle decompression",lvl:4,bag:"trauma",cost:20,onset:15,dur:9999,fx:{},ptxFix:1,
    note:"Relieves trapped AIR under tension. Does nothing for a hemothorax — that needs a chest tube."},
    valsalva:{pkModel:"curve",name:"Valsalva maneuver",lvl:4,cost:15,onset:0,dur:60,fx:{},vagalManeuver:1,
    note:"Vagal. First-line in stable SVT — and it costs nothing but thirty seconds and their dignity. Adenosine or cardioversion if it doesn't break."},
  /* Unlimited (5) */
  chestTube:{pkModel:"curve",name:"Tube thoracostomy",lvl:5,bag:"trauma",cost:120,onset:20,dur:9999,fx:{},ptxFix:1,drainsChest:1,
    note:"Drains air OR blood — the only field procedure that actually treats a hemothorax."},
  vent:{pkModel:"curve",name:"Transport ventilator",lvl:5,bag:"airway",cost:60,onset:30,dur:9999,fx:{fio2:1}, ventilation:{rr:12,vt:.5}},
  ultrasound:{pkModel:"curve",name:"Ultrasound (eFAST)",lvl:5,bag:"monitor",cost:60},
  // fx:{sbp:30} removed. A REBOA balloon does not add 30 mmHg to a monitor: it
  // OCCLUDES the aorta, so the entire cardiac output is delivered into a much
  // smaller vascular bed. Proximal pressure rises because resistance rises, and
  // it rises far more in a patient with output to redistribute than in one who
  // is nearly empty — which is the actual clinical caveat about REBOA and the
  // one a fixed +30 offset could never express. Distal hemorrhage stops because
  // there is no distal flow (stopsBleed, retained).
  reboa:{pkModel:"curve",name:"REBOA",lvl:5,bag:"trauma",cost:120,onset:20,dur:9999,fx:{},
    aorticOcclusion:.55,stopsBleed:1},
  paCath:{pkModel:"curve",name:"Pulmonary artery catheter",lvl:5,bag:"monitor",cost:150,
    note:"PAOP estimates LEFT ventricular preload (normal 6–12). CVP is the RIGHT. They are not the same number."},
  artLine:{pkModel:"curve",name:"Arterial line",lvl:5,bag:"monitor",cost:90,
    note:"Beat-to-beat. Nothing goes stale."},
};
