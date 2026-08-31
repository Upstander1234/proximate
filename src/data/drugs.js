export const DRUGS = {
  /* ================================================================
     EMR (1)
     ================================================================ */
  naloxone_in: {
    pkModel: "twoCompartment",
    name: "Naloxone (IN)", route: "IN", lvl: 0,
    onset: 60, dur: 1800, max: 2,
    dose: 0.4,
    fx: {},
    note: "Intranasal unit‑dose — layperson and EMR scope. Publicly available; ventilate first, titrate to RR."
  },
  naloxone_im: {
    pkModel: "twoCompartment",
    name: "Naloxone (IM)", route: "IM", lvl: 1,
    onset: 60, dur: 2400, max: 4,
    dose: 0.4,
    fx: {},
    note: "Intramuscular auto‑injector — EMT scope."
  },
  naloxone_iv: {
    pkModel: "twoCompartment",
    name: "Naloxone (IV)", route: "IV", lvl: 2,
    onset: 30, dur: 1200, max: 4,
    dose: 0.4,
    fx: {},
    note: "Intravenous bolus — AEMT/Paramedic scope. Faster onset, shorter duration."
  },

  epiAuto: {
    pkModel: "twoCompartment",
    // DOSE WAS UNDECLARED — DrugInstance fell back to `?? 1`, so every
    // administration was silently 1 mg. Same silent default that was found on
    // naloxone in batch 56.
    dose: 0.3,   // mg, adult auto-injector
    // IM absorption is SELF-LIMITING — epinephrine constricts the vessels at
    // its own injection site. Identified against published PK: EpiPen 0.3 mg
    // Cmax 503-801 pg/mL at Tmax ~20 min. The shared 0.09/min gave 4,684 pg/mL
    // at 8 min, which is the concentration a case report recorded for
    // ACCIDENTAL INTRAVASCULAR delivery (4,390 pg/mL, BP 221/128).
    // Measured here: Cmax 601 pg/mL at Tmax 17 min.
    imKa: 0.026,
    // QUEUE ITEM 4 — see the fuller derivation at epiIM below, which shares
    // this two-stage-depot mechanism. This device's already-fast ka (0.026)
    // needs only a mild deep-depot fraction to land Tmax in the published
    // ~20 min band without collapsing Cmax, unlike the slower vial/needle.
    deepDepotFraction: 0.35, deepDepotRelease: 0.05,
    // Presystemic COMT/MAO loss in muscle. Trims Cmax without moving Tmax,
    // which is why ka alone could not fix both.
    bioavailability: 0.30,
    name: "Epinephrine auto-injector", route: "IM", lvl: 1,
    onset: 60, dur: 900, max: 3,
    // QUEUE ITEM 61: angioedema (the real localized lips/tongue/pharynx
    // swelling field, distinct from `edema` above) added alongside
    // bronch/edema — alpha-1-mediated mucosal vasoconstriction is the
    // documented real-world mechanism for epi relieving anaphylactic
    // angioedema, the same receptor already justifying `edema`'s own
    // reduction here.
    fx: { bronch: -0.5, edema: -0.35, angioedema: -0.4 },        // non‑hemodynamic effects kept
    receptors: { alpha: 0.5, beta1: 0.8, beta2: 0.6 },
    note: "National Scope: EMR. Drug of choice in anaphylaxis. Lateral thigh."
  },

  duodote: {
    pkModel: "curve",
    name: "DuoDote auto-injector", route: "IM", lvl: 1,
    onset: 120, dur: 2400, max: 3,
    // DEAD-CODE SWEEP FIX (physiology queue item 5). This declared
    // `fx: { hr: 20 }`, which routes into pat.drugHr — an accumulator that
    // updateCardiovascular's HR computation never reads at all (confirmed by
    // grep: pat.drugHr/drugSbp are written every tick in pk.js and read
    // nowhere in cardiovascular.js). The comment here used to read "no
    // receptor model -> direct HR kept," which was itself wrong: DuoDote's
    // rate-raising component IS atropine (2.1 mg per injector, roughly double
    // the standalone 1 mg atropine entry's dose), and atropine already has a
    // real mechanism for exactly this — vagal blockade (see atropine below,
    // `receptors:{vagalBlock:0.8}`, which cardiovascular.js's updateCardio-
    // vascular reads as `hr += clamp(pat.vagalBlock,0,1)*25`). Using the same
    // handle instead of a raw offset means DuoDote's rate effect now composes
    // correctly with atropine given alongside it (same receptor, summed, not
    // double-counted) and with any bradycardia the organophosphate toxidrome
    // itself is driving, rather than bolting a flat +20 on top of whatever
    // the rest of the engine already computed.
    fx: {},
    receptors: { vagalBlock: 0.8 },
    note: "National Scope: chemical/hazmat antidote auto-injector is EMR."
  },

  /* ================================================================
     EMT (2)
     ================================================================ */
  aspirin: {
    pkModel: "curve",
    name: "Aspirin 324 mg", route: "PO", lvl: 2,
    onset: 300, dur: 9999,
    fx: { coag: -5 },                           // impaired hemostasis on the coag panel
    // ANTIPLATELET MECHANISM, not just a coag-panel nudge. Irreversible COX-1
    // inhibition drops thromboxane A2 and platelet aggregation, which is why
    // aspirin's ACS benefit is halting/slowing coronary THROMBUS propagation —
    // an effect the flat `coag: -5` (a lab number) never produced. The ACS
    // condition reads pat.antiplatelet to slow the thrombus. 0.6 = a strong but
    // not complete single-pathway effect: aspirin alone roughly halves events
    // but the platelet-rich clot still needs P2Y12 blockade and anticoagulation
    // for fuller suppression — see the dual-pathway note in conditions.js::acs.
    receptors: { antiplatelet: 0.6 },
    note: "Give to ALL cardiac chest pain. Dissection is rare; the MI benefit outweighs the risk."
  },

  oralGlucose: {
    pkModel: "fluid",
    name: "Oral Glucose 15 g", route: "PO", lvl: 2,
    onset: 420, dur: 3600, max: 2,
    fx: { glu: 40 },
    hold: (v) => v.rr < 10 && "Not awake and alert. You would be putting gel into an unprotected airway.",
    note: "Raises blood glucose."
  },

  albuterol: {
    pkModel: "curve",
    name: "Albuterol 5 mg", route: "NEB", lvl: 2,
    onset: 120, dur: 1800, max: 3,
    // No direct bronch/kShift: BOTH are consequences of beta-2 receptor
    // occupancy, which the engine now models (airway smooth muscle tone in
    // respiratory.js, Na/K-ATPase potassium shift in renal.js). Declaring them
    // here as well double-counted the drug and, more importantly, meant the
    // effects did not scale with receptor occupancy, compete with beta blockade,
    // or arise from endogenous catecholamines the way real beta-2 activity does.
    fx: {},
    receptors: { beta2: 1.0 },
    note: "β₂ agonist. National Scope: EMT. Expect tachycardia — that is the drug, not the patient."
  },

  ipratropium: {
    pkModel: "curve",
    name: "Ipratropium 0.5 mg", route: "NEB", lvl: 2,
    onset: 150, dur: 2400, max: 2,
    fx: { bronch: -0.25 },
    note: "Anticholinergic — SYNERGISTIC with albuterol. Give them together, not instead."
  },

  epiIM: {
    pkModel: "twoCompartment",
    // DOSE WAS UNDECLARED — DrugInstance fell back to `?? 1`, so every
    // administration was silently 1 mg. Same silent default that was found on
    // naloxone in batch 56.
    dose: 0.5,   // mg, 1:1000 IM — the adult anaphylaxis dose
    // A vial and needle is slower than an auto-injector for the same dose
    // (published Tmax ~45-50 min vs ~20, Cmax roughly half). A real device
    // difference, previously unmodelled — note bioavailability is deliberately
    // the SAME 0.30 as the auto-injector, because presystemic COMT/MAO loss is
    // a property of the drug and the muscle, not of the delivery device. Only
    // the RATE differs, and the published 2x Cmax gap between devices is what a
    // 2x rate difference predicts on its own.
    //
    // Measured at 0.010 for this 0.5 mg dose: Cmax 500 pg/mL, inside the
    // dose-scaled published range of ~420-580. Tmax lands at 25 min against a
    // published 45-50, and THAT GAP IS STRUCTURAL, not a coefficient left
    // unfitted. Epinephrine's elimination here is kel 0.3/min (t1/2 ~2.3 min),
    // so a first-order depot's peak tracks absorption almost immediately:
    //     ka 0.026 -> Tmax  8.9 min      ka 0.006 -> Tmax 13.3 min
    //     ka 0.010 -> Tmax 11.7 min      ka 0.003 -> Tmax 15.5 min
    // Halving ka repeatedly buys a couple of minutes of Tmax while collapsing
    // Cmax proportionally. Reaching 45 min needs absorption that SLOWS as the
    // depot sits — which is what progressive local vasoconstriction actually
    // does — i.e. a model change, not a number. Left visible rather than
    // fitted to one target at the other's expense.
    //
    // QUEUE ITEM 4 FIX. The gap above is now closed with a model change, not
    // a coefficient: pk.js's IM absorption is now a TWO-STAGE depot for any
    // drug that declares deepDepotFraction/deepDepotRelease. A fraction of
    // the dose sequesters immediately in a slowly-releasing deep pool
    // (epinephrine's own alpha-1 vasoconstriction trapping part of the
    // injected dose at the site) that trickles into the normal
    // fast-absorbing depot over tens of minutes — a genuine second
    // rate-limiting step, not a coefficient on the same one-stage model.
    // TRIED AND REJECTED FIRST, recorded so it isn't retried blind: a
    // time-decaying ka on a SINGLE depot (ka fastest at t=0, slowing
    // afterward) made Tmax EARLIER, not later (17->13 min measured on
    // epiAuto) — front-loading absorption moves the peak up, it does not
    // delay it.
    //
    // Even the two-stage depot alone could not clear Cmax>=420 pg/mL AND
    // Tmax>=45 min simultaneously — every (fraction, release-rate) pair
    // measured landed on one side or the other (e.g. frac 0.65/rel 0.032:
    // Cmax 376 at Tmax 53; frac 0.3/rel 0.025/imKa 0.012: Cmax 471 at Tmax
    // 32). The remaining few minutes came from PK_PARAMS.epiIM's keo (pk.js)
    // — slowed from the shared 0.7 default to 0.15 — which delays how fast
    // effect-site concentration tracks the (now broader, two-stage-depot)
    // central curve without materially changing its peak, since that curve
    // is no longer a sharp early spike. MEASURED at the values below: Cmax
    // 461 pg/mL (published ~420-580) at Tmax 46 min (published 45-50) — both
    // inside range. Gated on deepDepotFraction/deepDepotRelease specifically
    // (undefined for DuoDote/glucagon/IM midazolam/oxytocin) and keo is a
    // per-drug PK_PARAMS entry already, so nothing else sharing the
    // perfusion-dependent IM route is touched by either change.
    imKa: 0.013,
    deepDepotFraction: 0.35, deepDepotRelease: 0.025,
    bioavailability: 0.30,
    name: "Epinephrine 0.5 mg (1:1000)", route: "IM", lvl: 2,
    onset: 60, dur: 900, max: 3,
    // QUEUE ITEM 61: see epiAuto's own comment above — same real alpha-1
    // mucosal-vasoconstriction mechanism, same magnitude.
    fx: { bronch: -0.5, edema: -0.35, angioedema: -0.4 },
    receptors: { alpha: 0.5, beta1: 0.8, beta2: 0.6 },
    note: "Drawn from a vial. National Scope added IM route at EMT (Change Notice 1.0)."
  },

  // QUEUE ITEM 60 (nebulized-epi slice). TP 1234/1234-P (Airway Obstruction)
  // and TP 1236/1236-P (Inhalation Injury) both call for nebulized epi for
  // stridor — mechanistically distinct from BOTH epiIM/epiAuto above
  // (systemic IM, treats anaphylactic angioedema via alpha-1 mucosal
  // vasoconstriction reached through the bloodstream) and albuterol below
  // (beta-2 bronchodilation, lower airway smooth muscle, NOT indicated for
  // upper airway edema — see conditions.js's croup/epiglottitis comments,
  // which explicitly named this drug as the missing field skill). Real
  // nebulized epi (either 2.25% racemic epinephrine 0.5 mL in 3 mL saline,
  // or an equipotent L-epinephrine 1:1000 5 mg alternative when racemic is
  // unavailable — both are standard, AAP/PALS-documented options, the vial
  // form used here since this box's other epi entries are also plain
  // 1:1000) delivers the SAME alpha-1 receptor directly onto the swollen
  // mucosa via inhalation, a LOCAL route distinct from IM/IV's systemic one.
  // Deliberately reduces `pat.upperAirwayObstruction` itself, not
  // `pat.angioedema` — epiIM/epiAuto treat systemic angioedema and let
  // upperAirwayObstruction fall out as a downstream derivation (conditions.js
  // anaphylaxis progress()); nebEpi has no systemic-angioedema effect at all
  // (no anaphylaxis fx declared) and instead acts on the airway-mechanics
  // field croup/epiglottitis drive directly, since a structural/infectious
  // upper-airway swelling has no circulating-mediator field to treat.
  nebEpi: {
    pkModel: "curve",
    name: "Epinephrine (nebulized) 5 mg (1:1000)", route: "NEB", lvl: 3,
    // Onset/duration on the SAME engine-time scale albuterol/ipratropium
    // already use for this route (a few minutes to peak, tens of minutes of
    // effect) rather than literally modeling the real ~2 h clinical window
    // before rebound stridor can occur — real croup/epiglottitis calls in
    // this engine run well under an hour, so the clinically relevant part of
    // that window (onset through peak effect) is what a single scene needs.
    onset: 150, dur: 2400, max: 3,
    fx: { upperAirwayObstruction: -0.45 },
    note: "Local alpha-1 mucosal vasoconstriction for stridor (croup, epiglottitis, inhalation injury). NOT a bronchodilator — does not treat lower-airway wheeze, and does not treat systemic anaphylaxis; give epiIM/epiAuto for that. Rebound swelling is real: this is a temporizing measure, not definitive airway management."
  },

  nitroOwn: {
    pkModel: "curve",
    name: "Nitroglycerin — patient's own", route: "SL", lvl: 2,
    onset: 45, dur: 360, max: 3,
    fx: { pain: -2 },                           // pain relief from coronary vasodilation
    receptors: { venodilation: 0.8, arteriolarDilation: 0.4 },
    hold: (v) => v.sbp < 100 && "SBP under 100. HOLD.",
    preloadDependent: true,
    note: "National Scope: at EMT, nitro is limited to the PATIENT'S OWN prescription. Agency-supplied nitro starts at AEMT."
  },

  nitrous: {
    pkModel: "curve",
    name: "Nitrous oxide (Entonox)", route: "INH", lvl: 2,
    onset: 45, dur: 180, max: 6,
    fx: { pain: -5 },
    note: "National Scope: EMT may MONITOR patient-administered nitrous. If they can hold the mask they cannot overdose. Contraindicated in pneumothorax."
  },

  otcAnalgesic: {
    pkModel: "curve",
    name: "OTC analgesic (paracetamol/ibuprofen)", route: "PO", lvl: 2,
    onset: 900, dur: 9999, max: 1,
    fx: { pain: -2 },
    note: "Mild analgesic. Ibuprofen also inhibits platelets (coag −2)."
  },

  /* ================================================================
     AEMT (3) — CLOSED IV list
     ================================================================ */
  nitro: {
    pkModel: "curve",
    name: "Nitroglycerin 0.4 mg", route: "SL", lvl: 3,
    onset: 45, dur: 360, max: 3,
    fx: { pain: -2 },
    receptors: { venodilation: 0.8, arteriolarDilation: 0.4 },
    hold: (v) => v.sbp < 100 && "SBP under 100. HOLD.",
    preloadDependent: true,
    note: "Agency-supplied. AVOID in suspected dissection: it drops the pressure holding the tear closed."
  },

  saline: {
    pkModel: "fluid",
    name: "Normal Saline 500 mL", route: "IV/IO", lvl: 3,
    onset: 60, dur: 5400, max: 8,
    // ph: -350 WAS SIZED FOR A RATCHET THAT DELIVERED IT EVERY TICK, NOT
    // ONCE. Found while investigating a genuinely unrelated task (queue
    // item 40, amiodarone) — a probe giving one saline bolus to a plain,
    // condition-less control patient reached hco3=5.00 (its own floor) and
    // pH 6.82 within the first minute and stayed there, with
    // rhythmInstability climbing toward a lethal rhythm from the resulting
    // acidemia alone. Traced to pk.js's fx-application loop (the "ph" prop
    // handler): `pat.sidAdjust += delta/10` ran every tick the dose's
    // curve stayed elevated — for a fluid-model drug, intensity sits at
    // exactly 1.0 for the drug's ENTIRE declared duration (5400 s / 90
    // min here), so a single bag was adding sidAdjust -35/tick for the
    // next 90 minutes. This reached every scenario in the game through
    // the single most commonly administered drug in the formulary and was
    // invisible to both suites: scenarioSweep.mjs never gives any doses at
    // all (confirmed by grep), and no mechanismWiring.mjs assertion ran a
    // saline-treated probe long enough, or read sidAdjust/factorII
    // afterward, to notice. `coag`/`hco3`/`shunt`/`plasminActivity` shared
    // the identical defect on every other drug that declares them — see
    // pk.js's own comment at the "ph" case for the full trace and fix
    // (deliver once, on the curve's rising edge, matching every other
    // one-time-quantity prop in that loop — the same pattern already used
    // for blood/temp/k/glucose/calcium).
    //
    // Fixing the ratchet alone left the SINGLE-DOSE magnitude still wrong
    // (still -35 net, still crashing hco3 to its floor from one bag) — a
    // second, real, INDEPENDENT defect in the same field, not fixed by the
    // structural change alone. Re-identified against a real anchor rather
    // than guessed: Scheingraber et al., Anesthesiology 1999 (rapid 0.9%
    // saline infusion, ~30 mL/kg — ~2.1 L for a 70 kg adult — over ~2-3 h)
    // measured strong-ion difference falling by roughly 8-9 mEq/L. Scaled
    // linearly to this drug's own 500 mL per-administration dose (2.1 L /
    // 500 mL ≈ 4.2 administrations): -8.5 / 4.2 ≈ -2.0 mEq/L of sidAdjust
    // per bag. With the /10 divisor already in pk.js, val = -20 lands
    // there exactly (net delivered = val/10 = -2.0). MEASURED post-fix: a
    // single bag now moves hco3 24.0 -> ~22 and pH by a few hundredths — a
    // real, small, directionally-correct hyperchloraemic nudge, only
    // becoming clinically apparent after several liters, exactly matching
    // this note's own long-standing clinical claim and why it is a real
    // teaching point for LARGE-volume resuscitation, not a single bag.
    fx: { blood: 0.4, k: -0.25, ph: -20, coag: -6, temp: -0.3 },  // legacy fx still works
    note: "Hyperchloraemic metabolic acidosis (strong-ion shift). Dilutes clotting factors. Cold. Volume is not free."
  },

  // QUEUE ITEM 69: TP 1244's own footnote ❻/❽ calls for a smaller, more
  // conservative 250mL bolus for suspected internal hemorrhage in
  // multi-system blunt/penetrating trauma (permissive hypotension) —
  // `saline`'s fixed 500mL-per-administration granularity cannot represent
  // that dose at all. Same `pkModel:"fluid"` mechanism, every `fx` value
  // scaled exactly in half (this is a smaller volume of the identical
  // fluid, not a different drug), the same `amiodarone`/`amiodarone2`
  // precedent for "a second flat-dose entry at a different fixed size."
  salineMinor: {
    pkModel: "fluid",
    name: "Normal Saline 250 mL", route: "IV/IO", lvl: 3,
    onset: 60, dur: 5400, max: 8,
    fx: { blood: 0.2, k: -0.125, ph: -10, coag: -3, temp: -0.15 },
    note: "Permissive hypotension — smaller volume to limit clotting-factor dilution in a bleeding trauma patient."
  },

  d10: {
    pkModel: "fluid",
    name: "Dextrose 10% 125 mL", route: "IV/IO", lvl: 3,
    onset: 60, dur: 3600, max: 2,
    fx: { glu: 70 },
    note: "National Scope: dextrose is on the AEMT closed IV list."
  },

  glucagon: {
    pkModel: "curve",
    name: "Glucagon 1 mg", route: "IM", lvl: 3,
    onset: 300, dur: 3600, max: 2,
    fx: { glu: 50 },
    // QUEUE ITEM 40 (metoprololOverdose). Glucagon's real, textbook role as
    // the classic beta-blocker-overdose antidote is a genuinely DIFFERENT
    // receptor mechanism than every other drug in this file's `receptors`
    // object represents: it activates myocardial adenylate cyclase via its
    // OWN Gs-coupled glucagon receptor, bypassing the blocked beta-1
    // receptor entirely, rather than competing at it. The functional,
    // OBSERVABLE consequence — a real, partial, cAMP-driven rise in rate
    // and contractility independent of beta blockade — is exactly what
    // this engine's beta1Drug/alphaDrug summation already composes from
    // every drug's own receptors object (pk.js), so it's declared here as
    // a positive beta1 term for that reason, not because glucagon is
    // literally a beta agonist. Deliberately modest (0.3, well below a
    // real agonist like epinephrine's own beta1 pull) — real glucagon
    // reversal of BB overdose is partial and temporary, not curative; see
    // metoprololOverdose's own resolve() text.
    receptors: { beta1: 0.3 },
    note: "Useless without hepatic glycogen — cirrhosis, malnutrition."
  },

  fentanyl: {
    pkModel: "twoCompartment",
    name: "Fentanyl 50 mcg", route: "IV/IM/IN", lvl: 3,
    onset: 60, dur: 900, max: 5,
    dose: 0.05,                                 // 50 mcg = 0.05 mg
    class: "opioid",
        // RESPIRATORY DEPRESSION IS A MECHANISM, NOT A RATE OFFSET.
    // These drugs previously declared BOTH `respiratoryDepression` (which
    // suppresses medullary drive in respiratory.js — rate, tidal volume and the
    // hypercapnic/hypoxic response slopes all fall out of it) AND an fx rr
    // offset. Both were applied, so the depression was counted twice.
    //
    // The coefficient itself was also 0.8 for every one of them — an assertion
    // that a single therapeutic dose abolishes 80% of respiratory drive. It does
    // not. Documented observable used for identification: 0.1 mg/kg IV morphine
    // in an opioid-naive adult raises PaCO2 by roughly 5-8 mmHg and blunts the
    // hypercapnic ventilatory response slope by about a third to a half. The
    // values below are each drug's maximal drive suppression scaled to that.
    respiratoryDepression: 0.25,   // slightly above morphine per equianalgesic dose
    fx: { pain: -8 },                   // direct respiratory depression (opioid effect will be blocked by naloxone)
    receptors: {},                               // no α/β receptors; pain & RR handled via fx
    note: "National Scope: parenteral analgesia is AEMT. PREFERRED over nitro in dissection."
  },

  morphine: {
    pkModel: "twoCompartment",
    name: "Morphine 4 mg", route: "IV/IM", lvl: 3,
    onset: 90, dur: 1800, max: 5,
    dose: 4,
    class: "opioid",
        // RESPIRATORY DEPRESSION IS A MECHANISM, NOT A RATE OFFSET.
    // These drugs previously declared BOTH `respiratoryDepression` (which
    // suppresses medullary drive in respiratory.js — rate, tidal volume and the
    // hypercapnic/hypoxic response slopes all fall out of it) AND an fx rr
    // offset. Both were applied, so the depression was counted twice.
    //
    // The coefficient itself was also 0.8 for every one of them — an assertion
    // that a single therapeutic dose abolishes 80% of respiratory drive. It does
    // not. Documented observable used for identification: 0.1 mg/kg IV morphine
    // in an opioid-naive adult raises PaCO2 by roughly 5-8 mmHg and blunts the
    // hypercapnic ventilatory response slope by about a third to a half. The
    // values below are each drug's maximal drive suppression scaled to that.
    respiratoryDepression: 0.18,   // RE-IDENTIFIED: PaCO2 +6.3 mmHg after 4 mg IV (documented 5-8)
    fx: { pain: -6 },
    note: "Slower onset, longer duration than fentanyl. Histamine release → mild vasodilation."
  },

  ondansetron: {
    pkModel: "curve",
    name: "Ondansetron 4 mg", route: "ODT/IV/IM", lvl: 3,
    onset: 180, dur: 3600, max: 2,
    fx: {},
    note: "National Scope: antiemetic is on the AEMT closed IV list."
  },

  // Queue item 66: found missing entirely while implementing TP 1239/1239-P
  // (Dystonic Reaction) — the D2-antagonist-class antiemetic whose real,
  // documented adverse effect the whole protocol exists to teach did not
  // exist anywhere in this file. Metoclopramide's antiemetic action IS its
  // D2 blockade (central chemoreceptor trigger zone); the SAME dopamine
  // blockade, at the SAME time, disinhibits striatal cholinergic
  // interneurons in the nigrostriatal pathway — one mechanism, two
  // consequences, not two separate drug effects. Real incidence is
  // dose-dependent and low overall (~0.2-1% per dose, IV push, younger
  // patients most susceptible per the literature this protocol is drawn
  // from) — modeled here as a real but modest deterministic contribution
  // (0.15 at Imax) rather than a decorative zero, matching this project's
  // established fx-curve idiom (bronch/edema/urticaria/angioedema above) and
  // NOT a dramatic guaranteed reaction on every dose, which would misstate
  // the epidemiology. The clinically significant, protocol-relevant
  // presentation (acuteDystonicReaction, conditions.js) is scenario-authored
  // at a real starting severity, matching TP 1239's own framing of a patient
  // presenting WITH an already-established reaction rather than one this
  // engine spontaneously triggers mid-call.
  metoclopramide: {
    pkModel: "curve",
    name: "Metoclopramide 10 mg", route: "IV/IM", lvl: 4,
    onset: 180, dur: 3600, max: 1,
    fx: { dystonia: 0.15 },
    note: "D2-antagonist antiemetic. Push slowly — rapid IV administration raises the risk of an acute dystonic reaction."
  },

  epiIV: {
    pkModel: "twoCompartment",
    name: "Epinephrine 1 mg (0.1 mg/mL)", route: "IV/IO", lvl: 3,
    onset: 20, dur: 300, max: 3,
    dose: 1,
    fx: {},                                      // hemodynamics entirely via receptors
    receptors: { alpha: 0.9, beta1: 1.0, beta2: 0.3 },
    note: "On the AEMT closed IV list — for ARREST. Benefit falls away after 3 doses."
  },

  /* ================================================================
     Paramedic (4)
     ================================================================ */
  ketamine: {
    pkModel: "twoCompartment",
    name: "Ketamine", route: "IV/IO", lvl: 4,
    onset: 45, dur: 900, max: 2,
    dose: 100,
    class: "dissociative",
    fx: { pain: -8, bronch: -0.3 },             // analgesic & bronchodilator, HR/BP via indirect sympathomimetic
    // KETAMINE'S PRESSOR EFFECT IS INDIRECT, AND THAT IS THE WHOLE POINT OF IT.
    // Measured before this change: SBP 113 -> 114, a 1% rise against a documented
    // 20-25%. The receptor block declared beta1 and beta2 only, so heart rate
    // moved a little and systemic vascular resistance never moved at all — there
    // was no alpha limb.
    //
    // Ketamine does not stimulate adrenoceptors directly. It raises central
    // sympathetic outflow and inhibits noradrenaline reuptake, so its
    // cardiovascular effect is produced BY THE PATIENT'S OWN CATECHOLAMINES.
    // `indirectSympathomimetic` therefore scales the alpha and beta1 terms by
    // adrenal reserve, which the engine already depletes under sustained
    // sympathetic drive. The clinical consequence falls out without a flag for
    // it: in the catecholamine-depleted patient — prolonged shock, sepsis, the
    // patient who has been compensating for an hour — ketamine's support
    // disappears and its direct myocardial depressant action is unopposed. That
    // is exactly the patient in whom ketamine is documented to cause hypotension,
    // and it was previously unrepresentable.
    receptors: { beta1: 0.75, alpha: 0.45, beta2: 0.1 },
    indirectSympathomimetic: true,
    myocardialDepression: 0.25,
    note: "The analgesic that RAISES HR and BP — unlike every opioid. Also a bronchodilator."
  },

  ketorolac: {
    pkModel: "curve",
    name: "Ketorolac 15 mg", route: "IV/IM", lvl: 4,
    onset: 300, dur: 3600, max: 1,
    fx: { pain: -4, coag: -10 },
    hold: (v) => v.coag < 70 && "Coagulopathic. Ketorolac inhibits platelets. Do not.",
    note: "NSAID — analgesia with NO respiratory depression. Contraindicated in trauma and bleeding."
  },

  acetaminophenIV: {
    pkModel: "curve",
    name: "Acetaminophen 1 g", route: "IV", lvl: 4,
    onset: 240, dur: 3600, max: 1,
    fx: { pain: -3 },
    note: "IV paracetamol. No anti‑platelet effect."
  },

  amiodarone: {
    pkModel: "twoCompartment",
    name: "Amiodarone 300 mg", route: "IV/IO", lvl: 4,
    onset: 60, dur: 600, max: 2,
    dose: 300,
    fx: {},                                      // HR drop via class III & mild beta blockade, handled by receptor
    // AMIODARONE ALSO HAD NO ANTIARRHYTHMIC EFFECT. Worse, its only declared
    // actions were weak alpha and beta1 AGONISM, which would RAISE blood
    // pressure — the opposite of the hypotension amiodarone is known for, and
    // the opposite of what its own note in this file describes.
    //
    // Amiodarone is multi-class. Modelled here as the three actions that matter
    // at the roadside: sodium-channel blockade (not ischemia-selective, unlike
    // lidocaine), potassium-channel blockade which prolongs repolarisation and
    // therefore the QT — suppressing reentry while RAISING torsades risk, a
    // trade-off the engine can now actually express — and AV nodal slowing.
    // Its hypotension is vasodilation, not adrenergic agonism.
    receptors: { arteriolarDilation: 0.25 },
    antiarrhythmic: { sodiumBlock: 0.35, potassiumBlock: 0.5, avSlowing: 0.3 },
    note: "Slows AV conduction, prolongs QT. Can cause hypotension."
  },

  // LA County TP 1210 step 12: the real repeat dose for refractory VF/VT
  // after a further two defibrillations is 150mg, not a second 300mg —
  // CLAUDE.md queue item 53 flagged this as unmodelled (this file's own
  // `amiodarone` entry only ever represented the FIRST dose; a protocol
  // rule capping at "2 administrations of the flat 300mg entry" was a
  // knowingly-approximate stand-in, overshooting the real 450mg total
  // ceiling by 150mg). Fixed for real, not re-approximated: a second entry
  // at the true repeat dose, same drug, same mechanism (receptors/
  // antiarrhythmic identical to `amiodarone` above — the two-compartment PK
  // model naturally produces lower peak concentration/occupancy from the
  // lower `dose`, the same reason naloxone_in/im/iv are three separate
  // entries rather than one drug with a route flag).
  amiodarone2: {
    pkModel: "twoCompartment",
    name: "Amiodarone 150 mg (repeat)", route: "IV/IO", lvl: 4,
    onset: 60, dur: 600, max: 1,
    dose: 150,
    fx: {},
    receptors: { arteriolarDilation: 0.25 },
    antiarrhythmic: { sodiumBlock: 0.35, potassiumBlock: 0.5, avSlowing: 0.3 },
    note: "The repeat dose after the initial 300mg — TP 1210's own 450mg total ceiling, not a second full dose."
  },

  lidocaine: {
    pkModel: "twoCompartment",
    name: "Lidocaine", route: "IV/IO", lvl: 4,
    onset: 45, dur: 600, max: 2,
    dose: 100,
    fx: { pain: -2 },
    // LIDOCAINE HAD NO ANTIARRHYTHMIC EFFECT OF ANY KIND. Its only declared
    // action was fx:{pain:-2}. In a simulator built around cardiac arrest, the
    // antiarrhythmic did nothing antiarrhythmic — it was a mild analgesic.
    //
    // Class Ib: fast sodium channel blockade with strong use- and
    // voltage-dependence, so it binds preferentially in DEPOLARISED, ischemic
    // myocardium and leaves normal tissue largely alone. That selectivity is the
    // whole character of the drug — it suppresses ischemic ventricular ectopy
    // without meaningfully slowing normal conduction, and it is why lidocaine
    // works in the infarct and does little in a structurally normal heart.
    // `ischemiaSelective` expresses exactly that: the block is weighted by how
    // much of the arrhythmic substrate is ischemic.
    antiarrhythmic: { sodiumBlock: 0.65, ischemiaSelective: true },
    // LOCAL ANAESTHETIC SYSTEMIC TOXICITY. Lidocaine's therapeutic and toxic
    // ranges nearly touch — 1.5-5 mg/L treats, 5-9 produces CNS excitation and
    // seizures, and above ~15 the myocardium is depressed and conduction blocks.
    // That narrow margin IS the drug: it is the reason lidocaine is dosed by
    // weight, why the second dose is halved, and why a maintenance infusion is
    // reduced in low cardiac output states (where, as of batch 51, this engine
    // already slows its clearance). Modelling the antiarrhythmic action without
    // the toxic one would teach that more is always better.
    toxicity: { seizureThreshold: 10, cardiacThreshold: 18 },                           // local anesthetic / antiarrhythmic, no receptor model needed
    note: "Cumulative toxicity above ~3 mg/kg — seizures, cardiac depression."
  },

  atropine: {
    pkModel: "twoCompartment",
    name: "Atropine 1 mg", route: "IV/IO", lvl: 4,
    onset: 30, dur: 1200, max: 3,
    dose: 1,
    fx: {},                                      // HR increase via vagal block
    receptors: { vagalBlock: 0.8 },
    note: "USELESS in 2° type II or 3° block. Do not delay pacing for it."
  },

  adenosine: {
    pkModel: "curve",
    name: "Adenosine 12 mg", route: "IV", lvl: 4,
    // DEAD-CODE SWEEP FIX (physiology queue item 5). `fx: { hr: -70, sbp: -15 }`
    // routed into pat.drugHr/drugSbp — accumulators written every tick by
    // pk.js and read by NOTHING downstream (confirmed by grep, the same class
    // of defect duodote's fx:{hr:20} already was). Adenosine's real action —
    // the transient "impending doom" sensation the note below already
    // describes — IS a real, if brief, AV-nodal block, and the engine already
    // has a mechanism for exactly that: `antiarrhythmic.avSlowing`
    // (cardiovascular.js's updateConduction, the same handle amiodarone's own
    // chronic partial AV slowing already reads). At full intensity this
    // saturates the term's own 0.9 ceiling — a near-complete but not literal
    // third-degree block, which is the correct distinction: a transient
    // adenosine pause should read as severe, sudden bradycardia, not a
    // permanent chb diagnosis (updateRhythm only flips the rhythm STATE to
    // "chb" below avConduction 0.05; 1.0 avSlowing alone does not cross that).
    // The resulting bradycardia (and, through it, the transient hypotension
    // real adenosine also causes) is now an EMERGENT consequence of reduced
    // conduction/rate feeding cardiac output, not a second stat write —
    // exactly the "let the loops produce the numbers" principle a direct
    // fx:{sbp:-15} violated.
    //
    // `dur` shortened from 60 to 15: 60s was never calibrated against a real
    // effect (the fx it timed was dead), and adenosine's own published
    // elimination half-life is under 10 seconds — the whole clinical episode
    // (onset, plateau, decay) documented at roughly 20-30 seconds total. This
    // curve's own decay tail is onset*3 beyond `dur`, so onset:5/dur:15 gives
    // a ~5s ramp, ~10s near-complete block, ~15s taper — about 30s end to
    // end, matching that window. `rhythmFix:"svt"` is a separate, one-shot
    // check against pat.rhythm at dose time (pk.js's applyProcedures) and
    // does not read `dur` at all, so shortening it does not touch the drug's
    // already-working SVT-terminating action.
    onset: 5, dur: 15, max: 2,
    fx: {},
    antiarrhythmic: { avSlowing: 1.0 },
    rhythmFix: "svt",
    note: "Contraindicated in WPW+AF. Does NOT touch sinus tach. Warn them: it feels like dying."
  },

  diltiazem: {
    pkModel: "twoCompartment",
    name: "Diltiazem 20 mg", route: "IV", lvl: 4,
    onset: 120, dur: 1800, max: 2,
    dose: 20,
    fx: {},                                      // HR and SBP lowered via receptor model (Ca channel block)
    receptors: { calciumChannel: -0.7 },         // interpreted as negative chronotrope/inotrope/vasodilator
    hold: (v) => v.sbp < 100 && "Hypotensive. Diltiazem is a negative inotrope. This will make it worse.",
    note: "Rate control in rapid AF."
  },

  metoprolol: {
    pkModel: "twoCompartment",
    name: "Metoprolol 5 mg", route: "IV", lvl: 4,
    onset: 120, dur: 2400, max: 3,
    dose: 5,
    // No direct `bronch` effect: bronchospasm is now produced by the beta-2
    // blockade below acting on airway smooth muscle tone (see respiratory.js).
    // The blanket +0.25 this replaced was applied to every patient equally, so a
    // healthy airway constricted exactly as much as an asthmatic one. Through the
    // receptor it scales with the patient's own airway reactivity, which is the
    // clinical reality: metoprolol is beta-1 selective and largely tolerated by
    // normal lungs while still dangerous in reactive airways.
    receptors: { beta1: -0.5, beta2: -0.1 },
    contraindications: ["bronchospasm", "asthma", "COPD"],
    note: "WORSENS bronchospasm. Never in asthma or COPD."
  },

  calcium: {
    pkModel: "curve",
    name: "Calcium Chloride 1 g", route: "IV/IO", lvl: 4,
    onset: 45, dur: 1800, max: 2,
    fx: { ca: 0.5 },                            // raise ionised calcium
    // QUEUE ITEM 40 (diltiazemOverdose). Supraphysiologic extracellular
    // calcium partially overcomes competitive blockade at the L-type
    // calcium channel diltiazem's own `receptors.calciumChannel:-0.7`
    // (this file, diltiazem) blocks — the real mechanism behind calcium
    // chloride's use as a first-line calcium-channel-blocker-overdose
    // antidote. Routed through the SAME calciumChannel receptor term
    // (positive here, pk.js sums it against every other drug's value on
    // the same tone) rather than a bespoke interaction, so it composes
    // correctly with anything else touching that receptor. Deliberately
    // partial (0.3, well below diltiazem overdose's own blockade
    // magnitude) — calcium buys time and improves conduction/contractility,
    // it does not fully reverse a calcium-channel-blocker overdose; see
    // diltiazemOverdose's own resolve() text. This is additive to
    // calcium's own pre-existing, unrelated hyperkalaemia/hypocalcaemia
    // membrane-stabilisation use elsewhere (which works through `ca`/
    // `effK`, not this receptor) — a small, real, same-direction nudge to
    // contractility/vascular tone on top of those, not a competing effect.
    receptors: { calciumChannel: 0.3 },
    note: "GIVE FIRST. Stabilises the myocardium; does not lower K⁺. Precipitates with bicarb — FLUSH."
  },

  bicarb: {
    pkModel: "curve",
    name: "Sodium Bicarbonate 50 mEq", route: "IV/IO", lvl: 4,
    onset: 60, dur: 1800, max: 2,
    // fx.hco3 was 16 — queue item 71's own finding, re-derived here, not
    // guessed. pk.js's "hco3" prop handler (pat.sidAdjust += val*rising(),
    // no /10 division, unlike the "ph" prop's blood/plasma entries) applies
    // this value DIRECTLY as net mEq/L delivered — confirmed by grep before
    // touching anything, and MEASURED pre-fix: one dose drove sidAdjust to
    // exactly +16.00. 16 for a 50 mEq dose backs out to a ~3 L distribution
    // volume (50/3≈16.7) — a plasma-volume-sized space, not the real
    // bicarbonate space. Real sodium bicarbonate distributes across roughly
    // 40-50% of body weight for an acute/large dose (Cogan, Fluid &
    // Electrolytes) — 28-35 L for this file's own 70 kg reference adult
    // (the same reference weight PPH's own 20 mL/kg dosing already uses).
    // 50 mEq / ~31 L (midpoint) ≈ 1.6 mEq/L, matching real, published
    // single-dose serum bicarbonate response (a guideline dose moves serum
    // HCO3 by a few mEq/L, not 16) and the same "small, honest, single-dose
    // magnitude" precedent blood/plasma's own re-derived fx.ph values (2.5
    // and 3.0 mEq/L net) already set on the opposite side of the ledger.
    fx: { kShift: -0.8, hco3: 1.6 },            // 50 mEq / ~31 L bicarbonate space ≈ 1.6 mEq/L net SID rise
    note: "Alkalinising agent. Can cause hypernatraemia. Do NOT mix with calcium in the same line."
  },

  vasopressin: {
    pkModel: "curve",
    name: "Vasopressin 40 U", route: "IV/IO", lvl: 4,
    onset: 60, dur: 1200, max: 1,
    // `fx: { sbp: 30 }` REMOVED — it was BOTH forbidden and dead.
    // Forbidden because a systolic offset is the exact pattern section 1 of the
    // brief names: it produces a monitor number without producing the state that
    // number is supposed to be a measurement OF. Dead because nothing read it —
    // measured peak systolic rise with the field present and absent is +101.0
    // mmHg either way, while stripping the receptors instead drops it to +0.1.
    // So the entire pressor response was already receptor-mediated and the offset
    // was decorative, which also makes the old comment ("no receptor model
    // needed") the opposite of the truth: the receptor model is all there is.
    //
    // Left in place it was a landmine rather than a mere wart — the obvious
    // "fix" for a field that appears to do nothing is to make it work, and that
    // would have silently double-counted the whole vasopressor effect on top of
    // a V1 limb that is already wired (pk.js adds rec.V1 to alpha tone).
    receptors: { alpha: 0.9, V1: 1.0 },
    note: "Works in acidosis where catecholamines will not."
  },

  pushEpi: {
    pkModel: "twoCompartment",
    name: "Push-dose Epinephrine", route: "IV", lvl: 4,
    onset: 30, dur: 300, max: 10,
    // PUSH-DOSE EPINEPHRINE IS 10-20 MCG, NOT 1 MG.
    // This declared `dose: 1` — one milligram, the ARREST dose, fifty times the
    // documented push-dose pressor bolus. It is the same defect class as
    // `epiIM`/`epiAuto` having no declared `dose` at all and silently falling
    // back to `?? 1`: a number in the drug definition that produces the wrong
    // observable, invisible because nothing asserted the observable.
    //
    // It survived the catecholamine PK correction because that work fixed the
    // CONCENTRATION-to-effect mapping (v1 0.06 L -> 8 L, ec50 0.01) and left the
    // dose alone. Correcting the saturation is what made this visible: on the
    // old flat-top curve 1 mg and 20 mcg were indistinguishable anyway, so the
    // wrong dose had no consequence. With a titratable curve it does.
    //
    // Measured on a normotensive 70 kg adult, peak SBP rise over 30 min:
    //   dose 1     (as declared)  +86.3 mmHg  — an arrest response
    //   dose 0.02  (as fixed)      +6.4 mmHg  — a transient nudge
    // The response is modest because the probe patient is normotensive with an
    // intact baroreflex buffering it; the drug exists for the hypotensive
    // post-intubation patient, in whom that buffering is already spent.
    // 0.02 mg is the top of the documented 10-20 mcg range, not a fitted number.
    dose: 0.02,
    fx: {},
    receptors: { alpha: 0.7, beta1: 0.9, beta2: 0.4 },
    note: "Low‑dose bolus for transient hypotension (e.g., post‑intubation)."
  },

  dexamethasone: {
    pkModel: "curve",
    name: "Dexamethasone 10 mg", route: "IV/IM", lvl: 4,
    onset: 900, dur: 9999, max: 1,
    fx: { edema: -0.4, bronch: -0.15 },
    note: "Fifteen minutes to work. Prevents the SECOND wave. It has never rescued anybody from the first."
  },

  diphen: {
    pkModel: "curve",
    name: "Diphenhydramine 50 mg", route: "IV/IM", lvl: 4,
    onset: 300, dur: 3600, max: 1,
    // Queue item 58: was fx:{}, a real drug with zero physiologic effect —
    // decorative. H1 antagonism blocks histamine's vasodilatory/pruritic
    // action; this is the one real handle in this engine that histamine
    // release drives (pat.urticaria — see conditions.js allergicReactionMild
    // and patient.js). -0.5 at Imax against urticaria's own small 0.05-0.2
    // ceiling clears an isolated reaction within the onset/duration below.
    // Deliberately NOT wired to bronch/edema/vasodilation directly —
    // antihistamines are not bronchodilators or pressors and do not treat
    // anaphylaxis (still true, still stated in the note below).
    //
    // Queue item 66: also the real, first-line field treatment for an acute
    // dystonic reaction (TP 1239/1239-P) — diphenhydramine's H1/anticholinergic
    // activity restores the striatal dopamine-acetylcholine balance a D2
    // blocker (metoclopramide/prochlorperazine-class) disrupts, the actual
    // textbook mechanism, not a coincidence of engine convenience. -0.6 at
    // Imax against acuteDystonicReaction's own 0.6 initial severity, SAME
    // onset/duration as the urticaria reversal above. MEASURED (direct-probe,
    // acuteDystonicReactionCall, settle 2/run 600): untreated dystonia drifts
    // 0.60 -> 0.62 over 10 minutes (the condition's own slow non-resolving
    // plateau); treated falls to 0.542 over the same window — a real,
    // measurable partial reversal, not a full clearance within one field
    // encounter, matching real anticholinergic onset being gradual rather
    // than instantaneous (same honest framing this drug's own note below
    // already carries for anaphylaxis).
    fx: { urticaria: -0.5, dystonia: -0.6 },
    note: "Does NOT treat anaphylaxis. Epinephrine first, always."
  },

  midazolam: {
    pkModel: "twoCompartment",
    name: "Midazolam 5 mg", route: "IM/IN/IV", lvl: 4,
    onset: 90, dur: 1800, max: 4,
    dose: 5,
    class: "benzodiazepine",
    // ANTICONVULSANT ACTION. Midazolam is the prehospital seizure drug and had
    // no anticonvulsant mechanism at all — it sedated and depressed respiration
    // and did nothing to the seizure it is carried for. The coefficient is the
    // fraction of seizure DRIVE suppressed at full effect intensity (see the
    // anticonvulsant block in pk.js): 0.9 at Imax, so a standard 5 mg dose
    // (measured intensity 0.534) suppresses ~48% of the drive. That is
    // deliberately not total — benzodiazepines terminate roughly two thirds of
    // seizures at first dose and status epilepticus is defined by the ones they
    // do not, so a model in which one dose always works would teach the wrong
    // thing.
    anticonvulsant: 0.9,
    // SEDATION DEPTH (see pk.js's own definition of pat.sedationDepth for
    // the full mechanism/scoping reasoning). 0.6, not 1.0: a standard 5 mg
    // dose (measured intensity ~0.534, the same figure the anticonvulsant
    // comment above already cites) should land real, moderate sedation —
    // genuinely drowsy, not necessarily fully unconscious from one dose,
    // matching real single-dose IV/IM/IN midazolam's clinical range —
    // while stacked doses (a higher summed Emax intensity) can still reach
    // deeper sedation, which is realistic for repeat benzodiazepine dosing.
    sedative: 0.6,
        // RESPIRATORY DEPRESSION IS A MECHANISM, NOT A RATE OFFSET.
    // These drugs previously declared BOTH `respiratoryDepression` (which
    // suppresses medullary drive in respiratory.js — rate, tidal volume and the
    // hypercapnic/hypoxic response slopes all fall out of it) AND an fx rr
    // offset. Both were applied, so the depression was counted twice.
    //
    // The coefficient itself was also 0.8 for every one of them — an assertion
    // that a single therapeutic dose abolishes 80% of respiratory drive. It does
    // not. Documented observable used for identification: 0.1 mg/kg IV morphine
    // in an opioid-naive adult raises PaCO2 by roughly 5-8 mmHg and blunts the
    // hypercapnic ventilatory response slope by about a third to a half. The
    // values below are each drug's maximal drive suppression scaled to that.
    respiratoryDepression: 0.22,   // RE-IDENTIFIED after the PK fix: PaCO2 +3.7 mmHg after 5 mg IV (documented 3-5)
    // DEAD-CODE SWEEP FIX (physiology queue item 5). The old `sbp: -10` in fx
    // routed to pat.drugSbp, an accumulator pk.js writes every tick and NOTHING
    // downstream reads (confirmed by grep — the same class of defect duodote's
    // fx:{hr:20} already was; measured before this fix: a full dose moved SBP
    // by -0.4 mmHg over a 4-minute window, i.e. not at all). Midazolam's real
    // hypotensive action is loss of baseline sympathetic vasomotor tone under
    // sedation/anxiolysis — mild arteriolar relaxation, not a direct pressure
    // write — so it is now routed through the SAME `arteriolarDilation`
    // receptor nitro/amiodarone already use (pk.js: alphaDrug -=
    // arteriolarDilation * recIntensity), which lets it compose correctly with
    // any other vasoactive drug on the same tone and lets a hypovolemic/shocked
    // patient (already vasoconstricted near their reserve) show a bigger drop
    // than a normovolemic one, which is the correct clinical picture a flat
    // offset could not produce. Coefficient identified by measurement, not
    // assumed: 0.2 lands a full dose at -10.1 mmHg SBP in a settled,
    // normotensive baseline patient (probe: scen "abdPain", dose at 180s,
    // measured at 420s) — matching the magnitude the original (dead) -10
    // offset had documented as the intended effect.
    receptors: { arteriolarDilation: 0.2 },
    fx: { pain: -2 },                   // sedation + respiratory depression
    note: "Apnea comes suddenly and with little warning. BVM within reach BEFORE you push."
  },

  // QUEUE ITEM 52 — LA County TP 1209's own first-line agent for a
  // cooperative, agitated patient. Uses the "curve" (non-two-compartment)
  // pkModel deliberately, not a full concentration model: `pkModel:"curve"`
  // drugs already declare a real receptor-style coefficient (`sedative`,
  // `anticonvulsant`) read by pk.js's shared per-instance loop regardless of
  // pk model — the SAME code path aspirin/duodote/adenosine already use for
  // their own real mechanisms (antiplatelet drive, atropine-mediated
  // vagalBlock) with no full compartment model. Olanzapine's own oral-ODT
  // absorption/elimination kinetics (peak plasma ~5-8h, terminal half-life
  // ~30h) would need real published absorption-rate data this project has
  // not identified, and — the more important reason — a full multi-hour
  // elimination model is the wrong fidelity for a single EMS scene anyway,
  // the same reasoning aspirin's own `dur: 9999` (effectively "for the rest
  // of the call") already applies to a drug whose real duration vastly
  // outlasts a scene.
  //
  // A REAL, MECHANISTICALLY DISTINCT calming pathway from midazolam's own
  // `sedative` coefficient above — D2/5-HT2A receptor antagonism, not
  // GABA-A potentiation (see pk.js/neuro.js's own new `antipsychoticEffect`/
  // agitation-composition comments for the full reasoning) — declared as
  // its own `antipsychotic` coefficient rather than reusing `sedative`,
  // which would have wrongly given this drug midazolam's own respiratory-
  // depression/unconsciousness profile.
  //
  // ONSET: `curve()` (util.js) ramps LINEARLY from 0 to full coefficient
  // over the declared onset — the same shape aspirin/duodote/adenosine
  // already use, so "onset" here means the time to full effect, not merely
  // first detectable effect. Real-world olanzapine ODT is commonly cited in
  // the agitation-management/psychopharmacology literature (e.g. the
  // Project BETA psychopharmacology guidelines for agitated patients, West
  // J Emerg Med 2012) as reaching a clinically apparent calming effect
  // within roughly 15-30 minutes — 900s (15 min) is used here as the full
  // ramp-to-effect time, the fast end of that range (an ODT bypasses
  // first-pass swallowing delay), so a real, gradually-strengthening
  // partial effect is already visible well before the 15-minute mark
  // (measured: ~9% of full coefficient at 2 minutes post-dose), not an
  // all-or-nothing effect that waits the full 15 minutes to appear at all.
  // COEFFICIENT (0.7): a strong
  // but deliberately sub-maximal single-pathway effect, the same "not 1.0"
  // reasoning midazolam's own sedative:0.6 comment already states — real
  // second-generation antipsychotics reliably calm most agitated patients
  // but do not guarantee full resolution from one oral dose, and this
  // engine's own agitation composition (neuro.js) multiplies the remaining-
  // agitation fraction by (1 - 1.5*antipsychoticEffect), so 0.7 at a fully
  // equilibrated curve (intensity approaching 1) leaves real headroom for a
  // severely agitated patient to still need a second-line agent, matching
  // real clinical practice (olanzapine alone does not resolve every case).
  olanzapine: {
    pkModel: "curve",
    name: "Olanzapine 10 mg ODT", route: "PO (ODT)", lvl: 4,
    onset: 900, dur: 14400, max: 1,
    fx: {},
    antipsychotic: 0.7,
    hold: (v) => v.rr < 10 && "Not awake enough to safely take an oral disintegrating tablet — this needs a cooperative, protected airway.",
    note: "First-line for a cooperative agitated patient who can safely take an oral tablet. Not for a patient who cannot cooperate enough to take it."
  },

  magnesium: {
    pkModel: "curve",
    name: "Magnesium Sulfate 4 g", route: "IV", lvl: 4,
    onset: 300, dur: 3600, max: 1,
    // ANTICONVULSANT ACTION — the reason this drug is carried, and it had none.
    // Magnesium declared `fx: { sbp: -10 }`, which routes to pat.drugSbp: a raw
    // additive offset on the observable, forbidden for the usual reason (it
    // produces a monitor number without producing the state that number is
    // supposed to be a measurement OF). More to the point, the drug given for
    // eclampsia did NOTHING about seizures. A crew could manage an eclamptic
    // patient by protocol and watch her keep fitting.
    //
    // Magnesium is the definitive agent here — it blocks the NMDA channel pore,
    // relieves cerebral vasospasm and stabilizes the membrane. Identification
    // is against the Collaborative Eclampsia Trial: recurrent convulsions in
    // roughly 9-13% of women treated with magnesium, against 23-27% with
    // diazepam or phenytoin. So it must suppress MORE of the drive than
    // midazolam's 0.9, not less.
    //
    // MEASURED on the engine's own eclampsia fixture (pregnant + pressor to
    // severe range, drug at 420 s, 25 min window observed from 300 s):
    //     untreated ......... 78.3% of ticks seizing
    //     magnesium 4 g ..... 29.7% of ticks seizing
    // The residual is almost entirely the pre-onset window — the drug lands at
    // 7 min of a 20 min observation with a 5 min onset, so ~35% of observed
    // ticks are necessarily before it can act. Activity stops close to the
    // moment effect is established, which matches the 87-91% prevention the
    // trial reports. Crucially sbpMax moved 231 -> 232 across the same pair:
    // the seizure stopped and the blood pressure did not, which is the correct
    // clinical picture and the thing the old `fx: { sbp: -10 }` got backwards.
    // GENERAL anticonvulsant efficacy is LOW, and deliberately so. Magnesium is
    // not indicated in status epilepticus of other causes and is ineffective in
    // epilepsy; outside eclampsia its only seizure indication is hypomagnesemia.
    // Leaving the old single 0.95 here made it a broad-spectrum anticonvulsant
    // that would have worked on a hypoglycemic seizure — teaching a crew to
    // reach for the wrong drug.
    // Raises serum magnesium — the mechanism behind its OTHER indication.
    // 4 g IV takes serum Mg from ~0.8 to ~2.0-2.5 mmol/L, so +1.3 at full
    // intensity. This is what makes magnesium work for TORSADES DE POINTES.
    //
    // WHAT THAT LIMB NOW DOES, because the previous note here described a
    // conversion that could not happen in practice: cardiovascular.js used to
    // read `pat.mg > 1.5` and set the rhythm straight to sinus, but torsades
    // degenerated to VF at 1.2/min (measured 60 of 60 episodes, mean 52 s), so
    // the rhythm was always gone before this drug's 300 s onset could deliver
    // the magnesium. Adding the writer was necessary and was not sufficient.
    // The limb is now a graded suppression of the early-afterdepolarization
    // TRIGGER, saturating at the documented 2.0 mmol/L treatment target, and it
    // acts on recurrence as much as on the running episode — which is what the
    // evidence actually describes ("the MgSO4 bolus, which prevented the
    // recurrence of TdP", Tzivoni et al., Circulation 1988;77:392).
    //
    // ONSET IS DELIBERATELY LEFT AT 300 s, against the queue's suggestion to
    // shorten it. The queue reasoned from "an IV bolus for torsades acts in
    // ~1-2 min", but the documented endpoint is abolition within 1-5 min of the
    // bolus (9 of 12 patients, Tzivoni), and this entry is a 4 g load — the
    // eclampsia dose, given over minutes, not the 1-2 g torsades push. The
    // linear curve ramp reaches the therapeutic magnesium level inside that
    // 1-5 min window on its own, so shortening the onset would buy nothing for
    // torsades while re-opening the eclampsia calibration measured above.
    serumMg: 1.3,
    anticonvulsant: 0.2,
    // Against the ECLAMPTIC mechanism specifically it is the definitive agent,
    // and this is where the trial evidence lands. Sums with the general term in
    // neuro.js, so the eclamptic limb sees 0.2 + 0.75.
    anticonvulsantEclamptic: 0.75,
    // VASCULAR SMOOTH MUSCLE — magnesium is a physiological calcium antagonist,
    // so the modest pressure fall is arteriolar dilation, not an offset. Kept
    // deliberately SMALL: a 4 g load drops MAP by roughly 5-10 mmHg, and the
    // clinically important teaching point is that magnesium is NOT an
    // antihypertensive. Controlling severe-range pressure and preventing the
    // seizure are two separate tasks with two separate drugs, and a magnesium
    // that quietly fixed the blood pressure would teach the opposite.
    // IDENTIFIED AGAINST A NORMOTENSIVE PATIENT, which is the case the published
    // number describes. This was first set to 0.12 by eye and looked fine on the
    // only patient it was checked against — the eclamptic fixture, where a
    // maximally vasoconstricted circulation barely moved (sbpMax 231 -> 232).
    // The curve-drug audit then measured -223 dyn.s.cm-5 in its NORMOTENSIVE
    // control, roughly a 19% SVR fall, which did not obviously match "magnesium
    // is not an antihypertensive". Measuring the thing the literature actually
    // quotes settled it: a 4 g load is documented to drop MAP about 5-10 mmHg,
    // and 0.12 produced 11.4 mmHg and still climbing at 25 min.
    //
    // Measured at 0.085: MAP falls 8.5 mmHg by 25 min (control 84.7 -> 76.2),
    // SVR -153, cardiac output essentially unchanged at 4.62 L/min. Middle of
    // the documented band.
    //
    // THE LESSON, not the number: a coefficient checked only on the patient the
    // drug is FOR can be wrong by half and never show it, because that patient
    // is at an extreme where the term saturates. Identify against the population
    // the published figure was measured in.
    receptors: { arteriolarDilation: 0.085 },
    // Airway smooth muscle relaxes by the same calcium antagonism. This one
    // stays as an fx because `bronch` writes pat.broncho, which IS the
    // mechanism handle respiratory.js reads for airway calibre — not an
    // observable. It is deliberately NOT routed through beta2: magnesium's
    // bronchodilation is non-adrenergic.
    fx: { bronch: -0.2 },
    // KNOWN GAP — TOXICITY. Loss of deep tendon reflexes at ~8-10 mEq/L,
    // respiratory depression ~12, cardiac arrest ~25, reversed by calcium.
    // pat.mg is now a real serum concentration with a writer, so thresholds can
    // hang off it directly (mind the units: pat.mg is mmol/L and the figures
    // above are mEq/L, which for Mg2+ is 2x). This is queue item 1.
    //
    // A COMMENT CLAIMING A GAP THAT NO LONGER EXISTS WAS DELETED HERE. It said
    // pat.anticonvulsant was a general handle, so this drug would work on any
    // seizure the engine could produce, and that the cause-selective fix "is its
    // own batch". That batch shipped: `anticonvulsantEclamptic` above is the
    // selective term, neuro.js keeps the intrinsic causes separate, and 2h
    // asserts two-sided that midazolam ends a hypoglycemic seizure and magnesium
    // does not. Left in place it would have told a future session that a working
    // mechanism was still broken — the same failure as the false neuro.js
    // comment found last session, in the opposite direction.
    note: "Smooth muscle relaxant and anticonvulsant. First-line for eclamptic seizure; NOT an antihypertensive."
  },

  txa: {
    pkModel: "curve",
    name: "Tranexamic Acid 1 g", route: "IV/IO", lvl: 4,
    onset: 120, dur: 3600, max: 1,
    fx: { coag: 12, plasminActivity: -0.5 },    // antifibrinolytic; persistent effect handled by engine
    note: "Stabilises clot. Give within 3 hours of injury."
  },

  hydroxo: {
    pkModel: "curve",
    name: "Hydroxocobalamin 5 g", route: "IV/IO", lvl: 4,
    onset: 300, dur: 3600, max: 2,
    // DEAD-CODE SWEEP FIX (physiology queue item 5, the last of the four
    // drugs it named). `fx: { sbp: 15 }` routed to the same dead pat.drugSbp
    // accumulator as midazolam/etomidate's own entries above (measured
    // before this fix, identical probe: +0.3 mmHg over 4 minutes — not real).
    // Nitric-oxide scavenging is a real, mechanistically DIFFERENT pressor
    // action from an adrenergic agonist — it removes endogenous vasodilator
    // tone rather than stimulating a receptor — but the engine has no
    // separate "NO scavenging" axis, and the net physiological effect is the
    // same one alphaDrug already represents (increased peripheral vascular
    // tone -> higher afterload/SVR), so it is routed through the SAME `alpha`
    // receptor phenylephrine uses (a pure-alpha pressor, the closest existing
    // analog: no beta1/beta2 component here either — hydroxocobalamin's BP
    // effect is not adrenergic and should not touch rate or contractility).
    // Coefficient identified by measurement, not assumed: 0.21 lands a full
    // dose at +15.1 mmHg SBP on the same settled-baseline probe (scen
    // "abdPain", dose at 180s, measured at 420s) midazolam/etomidate's fix
    // used — matching the original (dead) +15 offset's documented intent.
    // Deliberately far below phenylephrine's own alpha:1.0 — hydroxocobalamin
    // is an antidote with an incidental pressor side effect, not a titrated
    // vasopressor, and real-world reports describe the BP rise as measurable
    // but modest, not a pressor-grade jump.
    receptors: { alpha: 0.21 },
    // REAL ANTIDOTE MECHANISM ADDED (queue item 7, cyanidePoisoning): until
    // this batch hydroxocobalamin had only its incidental alpha-pressor
    // effect above and NO cyanide-binding mechanism at all — its own note
    // below already claimed "cyanide antidote" while nothing in the engine
    // read a cyanide-toxicity field, the same "comment claims a fix that was
    // never made" shape lesson 16 warns about, just for a mechanism instead
    // of a fix. Cobalt directly chelates free cyanide (1:1, forming inert
    // cyanocobalamin/vitamin B12, renally excreted) — see pk.js's `cytoBlock`
    // prop handler for why this is modeled as a one-time bound quantity, the
    // SAME shape as fx.bronch, not a held ceiling.
    //
    // MAGNITUDE RE-IDENTIFIED BY MEASUREMENT, and the first-pass value was
    // wrong — recorded here rather than quietly corrected. An earlier -0.7 was
    // derived against an assumed 0.75 presenting severity; measured against
    // the severity cyanidePoisoning actually ships at (0.55), a single 5 g dose
    // drove cytochromeBlock 0.547 -> 0.000 by 450 s, i.e. one dose was a
    // complete cure and this drug's own max:2 second dose had nothing left to
    // do. That is both clinically wrong (a large exposure routinely needs the
    // second 5 g) and pedagogically wrong (it makes the antidote look like a
    // switch rather than an infusion that buys a trajectory).
    //
    // Re-anchored stoichiometrically instead of fitted: 5 g of
    // hydroxocobalamin is ~3.7 mmol of cobalt, binding cyanide 1:1, so one
    // dose neutralizes ~3.7 mmol (~96 mg) of cyanide — a real but bounded
    // quantity, against an industrial exposure that can be several times that.
    // -0.35 makes one dose remove roughly two thirds of this presentation's
    // block (MEASURED: 0.547 -> ~0.19 by the end of the 300 s onset curve, the
    // patient regaining consciousness but still acidotic and still in cellular
    // energy failure), with the second dose finishing the job. That matches the
    // label's own two-dose provision being there for a reason.
    fx: { cytoBlock: -0.35 },
    note: "Cyanide antidote (binds free cyanide); also raises BP via nitric oxide scavenging."
  },

  oxytocin: {
    pkModel: "curve",
    name: "Oxytocin 10 U", route: "IM/IV", lvl: 4,
    onset: 120, dur: 3600, max: 2,
    // RESOLVED — physiology queue item 9. Used to be fx:{bleed:-0.6}, a flat
    // continuous suppression of pat.activeBleedRate with no reference to
    // whether the uterus was actually contracting — the fx:{sbp:+30} stat-
    // write pattern section 1 forbids. Oxytocin's real mechanism is
    // myometrial oxytocin-receptor stimulation; it now raises
    // preg.uterotonicDrive (obstetric.js/pk.js), which raises the ACHIEVABLE
    // uterine-tone ceiling — first-line pharmacologic treatment, so a high
    // coefficient (a single dose can correct even severe atony essentially
    // on its own; see the uterineAtony condition's own measurements).
    receptors: { uterotonic: 0.85 },
    note: "Uterotonic. Can cause hypotension if given rapidly IV."
  },

  heparin: {
    pkModel: "curve",
    name: "Heparin", route: "IV", lvl: 4,
    onset: 180, dur: 3600, max: 1,
    fx: { coag: -25 },                           // aPTT prolongation on the coag panel
    // ANTICOAGULANT MECHANISM. Antithrombin activation -> factor Xa/IIa
    // inhibition -> less thrombin generation, which suppresses the fibrin arm of
    // a coronary thrombus. Distinct pathway from aspirin's antiplatelet action,
    // so in ACS the two are additive (read multiplicatively in conditions.js).
    // 0.55 = a strong single-pathway effect on the fibrin limb.
    receptors: { anticoagulant: 0.55 },
    note: "Anticoagulation in PE. Catastrophic in dissection or hemorrhage."
  },

  /* ================================================================
     Unlimited (5)
     ================================================================ */
  norepi: {
    pkModel: "twoCompartment",
    name: "Norepinephrine infusion", route: "IV", lvl: 5,
    onset: 60, dur: 1800, max: 12,
    dose: 1,                                    // per‑dose amount (infusion handled by repeated doses)
    fx: {},
    receptors: { alpha: 1.0, beta1: 0.3 },
    note: "First‑line vasopressor for septic shock. Titrate to MAP ≥ 65 mmHg."
  },

  phenylephrine: {
    pkModel: "curve",
    name: "Phenylephrine", route: "IV", lvl: 5,
    onset: 60, dur: 360, max: 6,
    dose: 1,
    fx: {},
    receptors: { alpha: 1.0 },
    note: "Pure alpha. Raises pressure, DROPS heart rate — the one for tachycardic hypotension."
  },

  blood: {
    pkModel: "fluid",
    name: "Whole Blood 500 mL", route: "IV/IO", lvl: 5,
    onset: 90, dur: 9999, max: 4,
    // ph: 280 WAS SIZED FOR A RATCHET THAT DELIVERED IT EVERY TICK, NOT
    // ONCE — the crashed-session investigation (see saline's own entry
    // above for the full trace of the pk.js "ph" ratchet bug) fixed the
    // STRUCTURAL bug (one-time delivery on the curve's rising edge) but
    // left this drug's own MAGNITUDE unexamined; picked up and finished
    // here. MEASURED before touching it (lesson 8): with the structural
    // fix already in place, one unit still drove sidAdjust to +28.00,
    // hco3 to 49.76 (its own [5,50] clamp ceiling) and pH to 7.785 (the
    // acidbase.js clamp's own upper bound, 7.8) from a SINGLE unit of
    // blood on a plain, condition-less control — the same class of
    // implausible one-dose magnitude saline's own -350 was, just
    // unnoticed because it sits on the opposite (alkalotic) side and
    // never crashed a rhythm the way saline's acidemia did.
    //
    // Re-identified against a real anchor, not guessed: a standard unit
    // of citrated whole blood carries roughly 10-17 mmol of sodium
    // citrate anticoagulant, metabolised hepatically at ~1 mol citrate :
    // 3 mol bicarbonate generated (~30-50 mmol bicarbonate-equivalent per
    // unit) — the real, textbook mechanism behind transfusion-associated
    // metabolic alkalosis, clinically apparent only after MASSIVE
    // transfusion (commonly cited as >10 units), not a single bag.
    // Distributed across a ~14-17 L bicarbonate space (roughly ECF
    // volume), that lands at a real, modest ~2-3 mEq/L SID rise per unit
    // — small enough to be honestly invisible after one bag, exactly
    // matching saline's own "becomes clinically apparent only after
    // several liters" precedent on the opposite side of the ledger.
    // val=25 lands there (net delivered = val/10 = 2.5 mEq/L). MEASURED
    // post-fix: one unit now moves hco3 from a healthy baseline (~23) to
    // ~25.5 and pH by a few hundredths — real, correctly signed,
    // clinically honest for a single unit.
    fx: { blood: 0.5, ph: 25, coag: 14, temp: -0.4 },  // volume, pH, clotting factors, cold
    note: "Carries oxygen AND clotting factors. Warm it — cold blood worsens the lethal triad."
  },

  plasma: {
    pkModel: "fluid",
    name: "Plasma 500 mL", route: "IV/IO", lvl: 5,
    onset: 90, dur: 9999, max: 4,
    // SAME ratchet-magnitude fix as blood's own entry immediately above —
    // see that comment for the full citrate-metabolism citation and the
    // measured pre-fix crash (sidAdjust +18.00, hco3 40.48, pH 7.688 from
    // one 500 mL unit on a condition-less control). A 500 mL plasma
    // product is nearly pure citrated plasma — proportionally MORE
    // citrate-bearing volume per bag than a whole-blood unit of the same
    // volume, where red cells displace some of that anticoagulated
    // plasma — so a modestly larger single-unit alkalinising effect than
    // whole blood is defensible, though the exact multiplier is an
    // estimate, stated honestly as one rather than asserted precisely.
    // val=30 (net delivered = 3.0 mEq/L) keeps that same order of
    // magnitude as blood's own 2.5 mEq/L, not the old, ratchet-sized 180.
    fx: { blood: 0.35, ph: 30, coag: 18 },
    note: "Provides clotting factors but no RBCs. Use for coagulopathy."
  },

  plasmalyte: {
    pkModel: "fluid",
    name: "Plasma-Lyte 500 mL", route: "IV/IO", lvl: 5,
    onset: 60, dur: 5400, max: 8,
    // Rescaled alongside saline's own ph fix (see that entry's comment for
    // the full ratchet trace) to preserve the SAME relative relationship
    // this drug's own note already claims: -40 was ~1/8.75 of saline's old
    // -350, so the new value keeps that ratio against saline's corrected
    // -20 (-20/8.75 ≈ -2.3, rounded) rather than being independently
    // re-derived — this drug's whole clinical point is "chloride-balanced,
    // so almost no strong-ion penalty relative to saline," not a
    // separately-anchored number of its own.
    fx: { blood: 0.4, ph: -2, coag: -4 },
    note: "Balanced crystalloid. Almost no acidosis penalty. Strictly better than saline."
  },

  etomidate: {
    pkModel: "twoCompartment",
    name: "Etomidate 20 mg", route: "IV/IO", lvl: 5,
    onset: 20, dur: 300, max: 2,
    dose: 20,
    class: "sedative",
    // SEDATION DEPTH (see pk.js's own definition of pat.sedationDepth).
    // 1.0, higher than midazolam's 0.6: etomidate is specifically an
    // INDUCTION agent — its entire clinical purpose is producing genuine
    // unconsciousness for intubation at a standard dose, unlike
    // midazolam's more variable, dose-dependent procedural-sedation range.
    sedative: 1.0,
        // RESPIRATORY DEPRESSION IS A MECHANISM, NOT A RATE OFFSET.
    // These drugs previously declared BOTH `respiratoryDepression` (which
    // suppresses medullary drive in respiratory.js — rate, tidal volume and the
    // hypercapnic/hypoxic response slopes all fall out of it) AND an fx rr
    // offset. Both were applied, so the depression was counted twice.
    //
    // The coefficient itself was also 0.8 for every one of them — an assertion
    // that a single therapeutic dose abolishes 80% of respiratory drive. It does
    // not. Documented observable used for identification: 0.1 mg/kg IV morphine
    // in an opioid-naive adult raises PaCO2 by roughly 5-8 mmHg and blunts the
    // hypercapnic ventilatory response slope by about a third to a half. The
    // values below are each drug's maximal drive suppression scaled to that.
    respiratoryDepression: 0.29,   // RE-IDENTIFIED after the PK fix: PaCO2 +7.1 mmHg after 20 mg IV
    // DEAD-CODE SWEEP FIX (physiology queue item 5) — same defect and same
    // fix shape as midazolam's own entry above: `sbp: -5` routed to the dead
    // pat.drugSbp accumulator (measured before this fix: -1.0 mmHg over 4
    // minutes, i.e. not real). Routed through the same `arteriolarDilation`
    // receptor at a smaller coefficient — etomidate's whole clinical
    // reputation (this drug's own note: "Hemodynamically kind") is that it
    // preserves sympathetic tone far better than other induction agents, so
    // its coefficient should land near half of midazolam's, not the same.
    // Measured: 0.058 lands a full dose at -4.7 mmHg SBP on the identical
    // probe midazolam's entry used, matching the original (dead) -5 offset's
    // documented intent while staying clearly smaller than midazolam's -10.1.
    receptors: { arteriolarDilation: 0.058 },
    fx: { pain: -9 },                   // sedation, mild SBP drop via arteriolarDilation
    note: "RSI induction. Hemodynamically kind — which is why you reach for it in shock."
  },

  rocuronium: {
    pkModel: "twoCompartment",
    name: "Rocuronium 100 mg", route: "IV/IO", lvl: 5,
    onset: 45, dur: 2400, max: 1,
    dose: 100,
    // NEUROMUSCULAR BLOCKADE IS NOT A TIDAL-VOLUME OFFSET.
    // This was fx:{tv:-1}, and respiratory.js zeroed tidal volume whenever
    // tvDrugOffset was negative AT ALL — so paralysis was total from the first
    // trace of drug and persisted for as long as any drug remained. Measured:
    // still completely apneic 80 minutes after a single dose, against a
    // documented duration of 30-60 minutes for 1 mg/kg. In a simulator whose
    // whole point includes can't-intubate-can't-oxygenate timing, that is the
    // worst possible place for a duration error.
    //
    // Blockade is instead computed from effect-site concentration with the STEEP
    // concentration-effect relationship neuromuscular blockers actually have
    // (Hill coefficient ~4.5): almost nothing, then near-total over a narrow
    // concentration band, then rapid recovery. That steepness is why paralysis
    // looks like a switch clinically while still having a real duration.
    neuromuscularBlock: { ec50: 1.0, hill: 4.5 },
    fx: {},                             // complete paralysis → VT = 0, RR = 0
    note: "Paralytic. From this second YOU are the airway. Nothing about it is reversible in the field."
  },

  thrombolytic: {
    pkModel: "curve",
    name: "Thrombolytic (alteplase)", route: "IV", lvl: 4,
    onset: 300, dur: 9999, max: 1,
    fx: { shunt: -0.35, coag: -30, plasminActivity: 1.0 },
    note: "National Scope: thrombolytics are Paramedic-level. Massive PE. Catastrophic if it is a dissection."
  },
};
