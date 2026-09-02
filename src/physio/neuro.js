// End-organ injury accrual (kidney/brain/liver) and cerebral perfusion / consciousness.
export function updateOrganInjury(pat, dt) {
    // Kidney injury now reads pat.renalO2Debt (renal.js, queue item 42) --
    // a LOCAL renal delivery-vs-demand signal built from the kidney's own
    // autoregulated perfusion fraction, not the whole-body VO2 debt this used
    // to read. WAS: a patient with normal renal blood flow but some OTHER
    // organ's demand unmet (e.g. shivering, seizure) could accrue kidney
    // injury from a deficit the kidney itself never experienced; conversely a
    // kidney selectively underperfused by strong afferent (angiotensin-driven)
    // constriction, while the rest of the body was still globally compensated,
    // accrued none. Rate kept at the same order of magnitude the old
    // whole-body term used (debt=1 sustained reaches the 0.5 "irreversible"
    // threshold, physiology.js, at ~42 minutes) so already-shipped shock
    // conditions -- whose global VO2 debt and renal perfusion collapse
    // together in the common case -- see essentially the same injury
    // trajectory; only the SELECTIVE cases now diverge correctly.
    const debt = pat.renalO2Debt ?? 0;
    const kidneyStress = debt * 0.012 * dt;
    pat.kidneyInjury += kidneyStress;
    pat.kidneyInjury = Math.max(0, Math.min(1, pat.kidneyInjury));
    if (debt < 0.01) pat.kidneyInjury = Math.max(0, pat.kidneyInjury - 0.005 * dt);

    // CEREBRAL ISCHEMIC INJURY — graded, not a threshold.
    //
    // WAS: brainInjury += fixed rate whenever (sao2<70 OR map<30), i.e. a binary
    // switch. A brain getting 25% of its oxygen demand and one getting 5%
    // accrued injury at the same rate, and a patient one point above either
    // cutoff accrued none. That cannot express the central fact of arrest
    // physiology — that outcome depends on the DEPTH and DURATION of the oxygen
    // deficit, so a rapid ROSC after a brief arrest recovers while a prolonged
    // low-flow state does not.
    //
    // NOW: injury rate scales with the cerebral oxygen DEFICIT (1 - delivery/
    // demand), using the same cpp*caO2 delivery proxy updateCerebral already
    // computes for consciousness — so the two stay consistent and no new
    // delivery model is invented. brainO2 = 1.0 is full delivery; the deficit is
    // what drives damage. The 0.0008/min ceiling at total deprivation reproduces
    // the clinical anchor that irreversible cortical injury begins ~4-5 min of
    // complete cerebral ischemia (brainInjury ~0.2-0.25 by 5 min at full
    // deficit, crossing the coma/unconscious bands built above).
    const mapRefB = pat.mapBaseline || 93;
    const cppNow = pat.cpp ?? (pat.map - (pat.icp ?? 10));
    // Same histotoxic-hypoxia utilization ceiling as updateCerebral's own
    // brainO2 below (pat.cytochromeBlock) — applied here too so that anoxic
    // brain INJURY accrues for real during a severe cyanide exposure, not just
    // a reversible drop in consciousness. Real cyanide survivors do have
    // documented delayed anoxic/basal-ganglia sequelae; scoring this brain as
    // uninjured while it is comatose would be exactly the "right vitals by the
    // wrong route" defect item 7(b) warns about.
    const cytoBlockInj = Math.min(1, Math.max(0, pat.cytochromeBlock ?? 0));
    const brainO2now = Math.max(0, cppNow * (pat.caO2 ?? 0) * (1 - cytoBlockInj) / (mapRefB * 20));
    const o2deficit = (() => {
      // ISCHEMIC THRESHOLD. Injury must NOT accrue in a well patient, and a
      // naive (1 - delivery) deficit does exactly that: normal cerebral delivery
      // on this scale is ~0.89, not 1.0, because CPP sits below MAP by the ICP
      // and the patient's live MAP sits a little under its own baseline. Scored
      // against an idealised 1.0, every healthy brain accrued ~0.004/min forever
      // — measured, and the reason this deadband exists.
      //
      // The deadband is real physiology, not a fudge to zero the baseline. The
      // brain defends itself twice before it infarcts: cerebral autoregulation
      // holds flow constant across CPP ~50-150 mmHg, and oxygen extraction
      // fraction can roughly double when flow does fall. Injury begins only once
      // BOTH reserves are spent. Classic CBF thresholds: normal ~50 mL/100g/min,
      // electrical failure/penumbra below ~20, infarction below ~10 — i.e.
      // damage starts at roughly HALF of normal delivery, which is the 0.5 here.
      // Above that the brain is compensating, not dying, which is why a patient
      // at altitude with SpO2 83 accrues nothing.
      const ISCHEMIC_THRESHOLD = 0.5;
      if (brainO2now >= ISCHEMIC_THRESHOLD) return 0;
      return (ISCHEMIC_THRESHOLD - brainO2now) / ISCHEMIC_THRESHOLD;
    })();

    // TEMPERATURE MODIFIER. Cerebral metabolic rate falls ~6-7%/degC, so cold
    // brain tolerates ischemia longer (the basis of therapeutic hypothermia and
    // cold-water-drowning survival); hyperthermia accelerates injury. A Q10 of 2
    // around 37 C gives the ~50% reduction per 10 C cooling that the literature
    // reports, and this reads coreTemp as a MECHANISM so future scenarios
    // (immersion, exposure, cooling protocols) modify injury simply by moving
    // temperature — no hardcoded scenario assumptions here, per the brief.
    const tempFactor = Math.pow(2, ((pat.coreTemp ?? 37) - 37) / 10);

    // REPERFUSION INJURY. Restoring flow after ischemia is not free: oxidative
    // stress and the no-reflow phenomenon add injury for a period AFTER ROSC,
    // proportional to the ischemic burden already accrued. pat._rosc is the
    // rhythm module's post-ROSC perfusion accumulator; while it is winding up
    // (>0) the brain is freshly reperfused. Scaled by existing brainInjury so a
    // brain that never became ischemic pays nothing on reperfusion.
    const reperfusing = (pat._rosc ?? 0) > 0 && brainO2now > 0.6;
    const reperfusionInjury = reperfusing ? 0.0003 * pat.brainInjury * dt * 60 : 0;

    const brainStress = o2deficit * tempFactor * 0.0008 * dt * 60 + reperfusionInjury;
    pat.brainInjury += brainStress;
    // Recovery only when genuinely well-perfused, and slower than damage — the
    // asymmetry IS the clinical claim that ischemic injury outlasts the insult.
    if (brainO2now >= 0.7 && pat.sao2 >= 90) pat.brainInjury = Math.max(0, pat.brainInjury - 0.003 * dt);
    pat.brainInjury = Math.min(1, pat.brainInjury);

    // HEPATIC OXYGEN DELIVERY vs DEMAND — queue item 42's per-organ pattern,
    // second slice after kidney. WAS: liverStress fired off a binary
    // whole-body lactate threshold (>4 -> injure, <=2 -> recover) -- a
    // systemic anaerobic-state proxy, not a hepatic one, so a patient whose
    // OWN hepatic flow was collapsing (low-output cardiogenic/obstructive
    // shock) while lactate hadn't yet crossed 4 accrued nothing, and a
    // patient with a lactate source having nothing to do with the liver
    // (seizure, shivering) could injure a liver that was perfectly well
    // perfused. `pk.js`'s organClearanceFactor() already uses the SAME
    // hepatic-blood-flow proxy for drug clearance (cardiac output relative
    // to this patient's own resting reference) -- real physiology, not a
    // new invention: reduced hepatic flow both slows clearance AND causes
    // ischemic hepatocellular injury (shock liver / hypoxic hepatitis),
    // the same underlying mechanism this file and pk.js used to model with
    // two disconnected proxies. Normalized against a 20 mL/dL caO2
    // reference, the same convention brainO2now (above) already uses.
    const restCo = pat._restCo || 5.0;
    const hepaticFlow = Math.max(0, (pat.co ?? restCo) / restCo);
    pat.hepaticDO2 = hepaticFlow * ((pat.caO2 ?? 20) / 20);
    pat.hepaticO2Debt = Math.max(0, 1 - pat.hepaticDO2);
    // Rate kept at the SAME magnitude the old lactate-threshold mechanism
    // used at its own full-debt equivalent (0.0001*60 = 0.006/min), so this
    // is a real driver swap, not an unrelated severity re-tune.
    const liverStress = pat.hepaticO2Debt * 0.006 * dt;
    pat.liverInjury += liverStress;
    if (pat.hepaticO2Debt < 0.01) pat.liverInjury = Math.max(0, pat.liverInjury - 0.002 * dt);
    pat.liverInjury = Math.min(1, pat.liverInjury);

    // HEPATIC ISCHEMIA-REPERFUSION STUNNING — queue item 48's own pattern,
    // extended to liver. Real hepatology anchor: transient hepatic
    // hypoperfusion (low-output shock, ischemia-reperfusion) produces
    // "shock liver" / hypoxic hepatitis -- a real, often-DRAMATIC
    // transaminase rise (ALT/AST commonly 10-100x normal within 24-48h)
    // that is genuinely REVERSIBLE, normalizing over days to weeks IF
    // perfusion is restored promptly (Henrion, "Hypoxic hepatitis," Liver
    // Int 2012) -- mechanistically distinct from the slower, durable
    // structural necrosis `pat.liverInjury` already models. Mirrors
    // renal.js's `atnProgression`/`kidneyInjury` pair exactly: same
    // ischemic threshold (hepaticDO2 < 0.5, the same "damage/dysfunction
    // begins at roughly half of normal delivery" anchor brain/gut already
    // use), same rise/decay rates (0.01/min rise, 0.005/min decay) so this
    // is a real reuse of an already-calibrated pattern, not a freshly
    // guessed number.
    if (pat.hepaticDO2 < 0.5) pat.hepaticStunning = (pat.hepaticStunning ?? 0) + 0.01 * dt;
    else pat.hepaticStunning = Math.max(0, (pat.hepaticStunning ?? 0) - 0.005 * dt);
    pat.hepaticStunning = Math.min(1, pat.hepaticStunning);

    // SPLANCHNIC (GUT) OXYGEN DELIVERY vs DEMAND — queue item 42's third
    // per-organ slice. A genuinely NEW structural-injury field, not a
    // re-driven existing one (kidney/liver both already had an injury
    // field; the gut had none). Real physiology: the splanchnic/mesenteric
    // bed is one of the EARLIEST vascular beds to constrict under
    // sympathetic stress — skin and gut are sacrificed before skeletal
    // muscle, which is sacrificed before kidney, which is sacrificed before
    // brain/heart (the textbook shock perfusion-priority hierarchy). That
    // is why gut ischemia (acuteMesenteric) can be catastrophic while a
    // patient's OTHER vitals still look compensated. Modeled off
    // `pat.alphaTone` (cardiovascular.js's own general sympathetic
    // vasoconstrictor drive, 0-3) rather than the slower, angiotensin-
    // mediated afferent-constriction pathway kidney uses (renal
    // autoregulation defends flow until angiotensin ramps up over minutes;
    // splanchnic constriction is fast, direct alpha-adrenergic, and the
    // first thing to give under an acute sympathetic surge) — deliberately
    // a DIFFERENT, faster-onset driver from kidney's, not the same formula
    // copy-pasted, because the two beds genuinely behave differently.
    // Coefficient CALIBRATED AGAINST MEASURED ENGINE RANGES, not the
    // theoretical alphaTone clamp ceiling (0-3) -- the same "calibrate
    // against the instrument you have" discipline this document's own
    // lesson 20 already establishes. A first draft at 0.45 was measured
    // (not assumed) against a genuinely catastrophic, untreated, 30-minute
    // AAA rupture (sbp collapsed to 11.4 mmHg, effectively a dying
    // patient) and found alphaTone peaks at only ~0.6 in this engine even
    // there -- far below the naive assumption that severe shock would
    // approach the clamp ceiling -- which left gut injury unable to engage
    // even for a genuinely near-terminal patient, the exact "written, read,
    // and still inert" defect class section 1 warns about. Raised to 1.0 so
    // THIS SAME near-terminal patient (alphaTone~0.6) crosses the ischemic
    // deadband with real margin, while a healthy resting patient
    // (alphaTone~0.2-0.3) stays clearly above it.
    const gutPerf = Math.max(0.05, 1 - (pat.alphaTone ?? 0) * 1.0);
    pat.gutDO2 = gutPerf * ((pat.caO2 ?? 20) / 20);
    pat.gutO2Debt = Math.max(0, 1 - pat.gutDO2);
    // ISCHEMIC DEADBAND -- gutO2Debt alone must NOT drive injury, the exact
    // "naive (1-delivery) deficit" mistake brainO2now's own comment already
    // documents fixing once, on a different field: resting alphaTone is
    // never exactly 0 (baseline sympathetic tone ~0.2-0.3), so a resting,
    // condition-less, perfectly healthy patient's gutDO2 sits below 1 for
    // real, MEASURED (not guessed): a first version without this deadband
    // accrued gutInjury continuously at rest with no condition at all
    // (0.026 by 30 minutes) -- exactly the same defect class, caught the
    // same way, by instrumenting the real engine before trusting a
    // plausible-looking formula (lesson 8). Ordinary sympathetic
    // compensation is not ischemia; injury only begins once delivery falls
    // meaningfully below normal, the same "damage starts at roughly half of
    // normal delivery" anchor brain's own threshold already uses.
    const GUT_ISCHEMIC_THRESHOLD = 0.5;
    const gutDeficit = pat.gutDO2 >= GUT_ISCHEMIC_THRESHOLD ? 0
      : (GUT_ISCHEMIC_THRESHOLD - pat.gutDO2) / GUT_ISCHEMIC_THRESHOLD;
    // Rate kept at the same magnitude kidney's own local mechanism uses
    // (0.012/min at full deficit, crossing the 0.5 irreversible threshold
    // at ~40 min) rather than inventing a separate, unanchored bowel-
    // specific rate -- consistent, not coincidentally identical to a real
    // citation.
    pat.gutInjury = (pat.gutInjury ?? 0) + gutDeficit * 0.012 * dt;
    if (gutDeficit < 0.01) pat.gutInjury = Math.max(0, (pat.gutInjury ?? 0) - 0.005 * dt);
    pat.gutInjury = Math.max(0, Math.min(1, pat.gutInjury));

    // MUCOSAL (villous) ISCHEMIA — queue item 48's pattern extended to
    // gut. Real anchor: bowel ischemia has a well-documented EARLY,
    // reversible phase — villous-tip mucosal injury (Chiu/Park grading,
    // Chiu et al. Arch Surg 1970) that heals completely if perfusion is
    // restored before it progresses to full-thickness (transmural)
    // infarction, which is what `pat.gutInjury` above already models as
    // the durable, structural endpoint. Reuses the SAME ischemic
    // threshold and rise/decay rates as hepaticStunning/atnProgression
    // above rather than a freshly invented number — mucosal cells are, if
    // anything, MORE vulnerable than deeper bowel-wall layers (they sit
    // at the villous tip, furthest from the submucosal plexus), so using
    // the identical threshold is a conservative, not an arbitrary, choice.
    if (pat.gutDO2 < 0.5) pat.gutMucosalStunning = (pat.gutMucosalStunning ?? 0) + 0.01 * dt;
    else pat.gutMucosalStunning = Math.max(0, (pat.gutMucosalStunning ?? 0) - 0.005 * dt);
    pat.gutMucosalStunning = Math.min(1, pat.gutMucosalStunning);

    // SKIN (CUTANEOUS) PERFUSION — queue item 42's fourth per-organ slice,
    // deliberately NOT a structural-injury accumulator like kidney/liver/
    // gut. Skin does not meaningfully necrose from transient hypoperfusion
    // at EMS timescales absent frostbite or a pressure injury (neither
    // modeled here) — this is a pure, live, real-time perfusion SIGNAL, not
    // a persistent injury pool, and its real consumer is DIAGNOSTIC rather
    // than pathological. Cool, clammy, mottled skin with delayed capillary
    // refill is textbook-documented as one of the EARLIEST signs of
    // compensated shock — appearing BEFORE hypotension, which is the
    // entire clinical reason a skin exam is taught at all.
    // `actions.js`'s pre-existing `skin`/`capRefill` exam findings
    // previously fired only once frank hypotension had already occurred
    // (`v.sbp < LIM.sbpShock`), silently missing that exact teaching point
    // — a compensated-shock patient with a normal blood pressure and
    // already-cool, clammy extremities read as completely unremarkable on
    // exam. Shares gut's alphaTone-driven mechanism (fast, direct
    // alpha-adrenergic, one of the earliest beds sacrificed) and its
    // already-measured calibration (coefficient 1.0, calibrated against
    // real engine ranges via the AAA scenario above) rather than inventing
    // a fresh, unmeasured number for a bed that shares the same
    // physiological priority tier as gut.
    pat.skinDO2 = Math.max(0.05, 1 - (pat.alphaTone ?? 0) * 1.0) * ((pat.caO2 ?? 20) / 20);

    // PER-LIMB ARTERIAL PERFUSION — queue item 74, Phase 2. Skeletal muscle
    // sits ONE TIER below skin/gut in the classic shock vasoconstriction-
    // priority hierarchy (skin/gut sacrificed first, then muscle, then
    // kidney, then brain/heart) — so its alphaTone coefficient must be
    // REAL BUT LESS AGGRESSIVE than gut/skin's 1.0, not a copy-paste.
    // MEASURED, not guessed: probed the real engine via physio() over true
    // simulated MINUTES (s.t is SECONDS -- dt = (s.t-lastUpdate)/60 --
    // caught a first probe pass reading s.t as minutes directly, which
    // under-ran every scenario 60x and would have calibrated against
    // near-instant transients; redone correctly before trusting any
    // number, per lesson 8). The SAME near-terminal reference gut's own
    // comment uses -- untreated abdominalAorticAneurysm at 30 real minutes
    // -- reproduces sbp 11.9 (gut's comment: 11.4), confirming this probe
    // reads the same scenario/timescale, with alphaTone 0.523 there. A
    // coefficient of 0.5 gives that near-terminal (sbp ~12, "effectively
    // dying") patient a systemic muscleFactor of ~0.74 -- still clearly
    // ABOVE the 0.5 ischemic deadband below, i.e. systemic shock ALONE (no
    // arterial occlusion) does not, by itself, produce limb ischemia in
    // this engine, which is the correct clinical claim: overt acute limb
    // ischemia requires an actual arterial lesion (embolism, thrombosis,
    // tourniquet), not sympathetic tone alone. A healthy resting patient
    // (alphaTone ~0.2) sits at muscleFactor ~0.90. Only once alphaTone
    // climbs past this scenario's own further, near-death trajectory
    // (it reaches brain death by 90 min, alphaTone >2) does muscleFactor
    // itself collapse toward the 0.05 floor -- appropriate, since
    // end-stage multi-organ shutdown genuinely does include skeletal
    // muscle, just LATER than gut/skin, matching the hierarchy.
    const MUSCLE_ALPHA_COEF = 0.5;
    const muscleFactor = Math.max(0.05, 1 - (pat.alphaTone ?? 0) * MUSCLE_ALPHA_COEF);
    // COMPOSITION: local occlusion and systemic vasoconstriction are two
    // resistances effectively in SERIES on the same arterial path (heart ->
    // systemic arterioles -> the one narrowed/occluded segment -> limb
    // capillary bed), so their flow-fraction terms compose by MULTIPLYING,
    // not adding or taking a min/max of two 0-1 fractions arbitrarily. This
    // has the physiologically correct property that whichever term is
    // SMALLER dominates the product: a fully occluded limb (occlusion~1)
    // stays near-zero regardless of systemic tone, while a patent limb's
    // flow still tracks ordinary systemic vasoconstriction.
    const LIMB_ISCHEMIC_THRESHOLD = 0.5;
    const LIMB_ISCHEMIA_RATE = 0.002; // /min at full deficit -- see comment below
    for (const loc of ["armL", "armR", "legL", "legR"]) {
      // Composed here, at the point of consumption, from TWO independent
      // sources (queue item 74, Phase 3): acuteLimbIschemia/a located
      // tourniquet's own accumulated pat.limbOcclusion, and compartment
      // syndrome's live-recomputed pat.compartmentOcclusion (cardiovascular.js).
      // max(), not addition: whichever mechanism is currently more occlusive
      // dominates. Composing here rather than writing compartmentOcclusion
      // INTO limbOcclusion upstream matters -- see patient.js's own comment
      // on compartmentOcclusion for the one-way-ratchet defect that produced.
      const occl = Math.max(0, Math.min(1, Math.max(
        (pat.limbOcclusion || {})[loc] ?? 0,
        (pat.compartmentOcclusion || {})[loc] ?? 0,
      )));
      const do2 = (1 - occl) * muscleFactor * ((pat.caO2 ?? 20) / 20);
      pat.limbDO2[loc] = do2;
      pat.limbO2Debt[loc] = Math.max(0, 1 - do2);
      // ISCHEMIA-TIME-TO-INJURY, gated by the same deadband idiom gut/
      // kidney use. Rate anchored to the real "time is tissue" golden
      // period taught for acute embolic/thrombotic limb ischemia:
      // irreversible muscle/nerve injury begins accruing meaningfully at
      // roughly 4-6h of severe (not necessarily total) ischemia in a limb
      // with some collateral flow (Rutherford/vascular-surgery teaching;
      // distinctly LONGER than a tourniquet's own ~2h warm-ischemia
      // tolerance, a separate mechanism/time-constant this batch does NOT
      // attempt to derive separately -- see CLAUDE.md section 3 for why).
      // 0.002/min at full deficit crosses physiology.js's 0.5 structural
      // threshold at ~250 min (~4.2h) for a FULLY occluded limb (deficit=1,
      // e.g. a tourniquet) and ~300-330 min for acuteLimbIschemia's own
      // partial embolic occlusion (deficit ~0.75-0.85) -- both land inside
      // the real 4-6h teaching window, the more severe (total) occlusion
      // correctly injuring faster as an EMERGENT consequence of one shared
      // rate constant, not two separately fitted numbers.
      const deficit = do2 >= LIMB_ISCHEMIC_THRESHOLD ? 0
        : (LIMB_ISCHEMIC_THRESHOLD - do2) / LIMB_ISCHEMIC_THRESHOLD;
      pat.limbInjury[loc] = (pat.limbInjury[loc] ?? 0) + deficit * LIMB_ISCHEMIA_RATE * dt;
      if (deficit < 0.01) pat.limbInjury[loc] = Math.max(0, pat.limbInjury[loc] - 0.0008 * dt);
      pat.limbInjury[loc] = Math.max(0, Math.min(1, pat.limbInjury[loc]));
    }

    // PER-ORGAN OXYGEN EXTRACTION, generalized (queue item V2-2). Item 42
    // already built real per-organ DO2 (delivery) for kidney/liver/gut/skin
    // and, above, skeletal muscle -- but delivery alone only says whether an
    // organ is ischemic (DO2 below its own threshold), not how much of what
    // IS delivered the organ is actually extracting. Real organs compensate
    // for falling delivery by extracting MORE of the oxygen they still get,
    // up to a real physiologic ceiling -- and different organs have very
    // different amounts of that reserve at rest. Resting extraction targets
    // (Guyton & Hall, Textbook of Medical Physiology -- the same order-of-
    // magnitude figures this project's own literature-anchor discipline
    // asks for, stated as calibration targets, not fixed constants):
    // kidney ~10%, liver ~25%, gut ~25%, skeletal muscle ~25% at rest (can
    // rise sharply during exercise -- not modeled here, this is a resting/
    // shock-state target). The heart already extracts ~60% of what it's
    // given AT REST -- almost its whole physiologic ceiling -- which is the
    // real, teachable reason the myocardium has the LEAST reserve against
    // hypoperfusion of any organ in the body and decompensates first; brain
    // sits around 35%. Extraction rises reciprocally as delivery falls
    // (real compensatory physiology, not guessed), capped at a real
    // ceiling beyond which anaerobic metabolism/lactate production takes
    // over rather than further extraction (65% for the organs below; the
    // heart is given a narrower ceiling since it starts closer to its own
    // limit already).
    //
    // Brain and heart are deliberately NOT given a live dynamic extraction
    // here: brainO2now (this file) and myoO2Balance (cardiovascular.js) are
    // real signals but in units that don't reduce to the same 0-1
    // DO2-normalized-to-rest scale kidney/liver/gut/skin/muscle share --
    // making them dynamic honestly would need a real, separately-derived
    // conversion, which is new perfusion-model work, explicitly out of
    // scope for this item ("wire it through EXISTING per-organ DO2 signals,
    // don't invent new organ perfusion mechanisms"). They compose into the
    // mixed-venous estimate below at their own cited RESTING target instead
    // -- a real, honest limitation, not silently glossed over.
    const extractionOf = (do2n, restTarget, ceiling) => {
      const d = Math.max(0.05, do2n);
      return Math.min(ceiling, Math.max(restTarget, restTarget / d));
    };
    pat.organExtraction = pat.organExtraction || {};
    pat.organExtraction.kidney = extractionOf(pat.renalDO2 ?? 1, 0.10, 0.65);
    pat.organExtraction.liver = extractionOf(pat.hepaticDO2 ?? 1, 0.25, 0.65);
    pat.organExtraction.gut = extractionOf(pat.gutDO2 ?? 1, 0.25, 0.65);
    pat.organExtraction.skin = extractionOf(pat.skinDO2 ?? 1, 0.10, 0.65);
    pat.organExtraction.muscle = extractionOf(muscleFactor * ((pat.caO2 ?? 20) / 20), 0.25, 0.70);
    pat.organExtraction.brain = 0.35; // static target -- see comment above
    pat.organExtraction.heart = 0.60; // static target -- see comment above

    // FLOW-WEIGHTED COMPOSITE, real Fick mixing (mixed venous O2 content is
    // the flow-weighted average of every venous bed's own content): weights
    // are approximate resting fractions of cardiac output per organ bed
    // (Guyton & Hall Ch.14's own resting-distribution table -- kidneys
    // ~20-25%, splanchnic/hepatic bed ~25% combined here split gut/liver,
    // skeletal muscle ~20% at rest, skin ~5%, brain ~15%, heart(coronary)
    // ~5%, everything else -- bone, adipose, remainder -- ~10% at a
    // generic mid-range extraction). These are STATIC weights, not a new
    // dynamic flow-distribution mechanism -- the same "reuse existing
    // signals, cite literature constants" posture this item's own text
    // requires, not new perfusion modeling.
    const W = { kidney: 0.20, liver: 0.10, gut: 0.15, skin: 0.05, muscle: 0.20, brain: 0.15, heart: 0.05 };
    const OTHER_W = 0.10, OTHER_ER = 0.25; // remainder tissue bed, generic mid-range target
    let weightedER = OTHER_W * OTHER_ER;
    for (const k of Object.keys(W)) weightedER += W[k] * pat.organExtraction[k];
    // Same 0-100 scale as respiratory.js's own pat.svO2 (both are
    // sao2 * (1 - extraction)) so the two are directly comparable.
    pat.svO2Composite = Math.max(0, (pat.sao2 ?? 98) * (1 - weightedER));
}

export function updateCerebral(pat, dt) {
    // SEIZURE ACTIVITY. `pat.seizing` was READ by metabolic.js — it raises oxygen
    // demand 2.2-fold — but NOTHING IN THE ENGINE EVER SET IT. The read side of
    // the field existed with no write side, so no patient in any scenario has
    // ever paid the metabolic cost of a seizure. (The `seizure` scenario is
    // post-ictal: the patient has already stopped, so it is correct for it not
    // to set this.) Drug toxicity was its first writer.
    //
    // NON-DRUG LIMB. Until now local-anaesthetic toxicity was the ONLY thing that
    // could make a patient seize, which meant the commonest prehospital causes
    // could not. These are derived from state the engine already carries,
    // deliberately: a `seizureDrive` written by a condition would be destroyed
    // before it could be read, because conditions run their progress() in
    // stepPatient BEFORE pat.update() calls updateDrugs(), and updateDrugs resets
    // pat.seizureDrive to 0 every tick. Deriving the drive HERE — downstream of
    // that reset, from glucose, sodium and the pregnancy/blood-pressure state —
    // is what makes the limb closed-loop rather than a flag someone sets.
    //
    // Each threshold is the documented one, not a fitted number:
    //   * Neuroglycopenic seizures appear below ~40 mg/dL; the brain has no
    //     substrate reserve, so the drive climbs steeply below that.
    //   * Hyponatremic seizures are a feature of severe hyponatremia,
    //     conventionally below ~120 mmol/L, from cerebral oedema as water follows
    //     the osmotic gradient into brain cells.
    //   * Eclampsia is by definition a pre-eclamptic patient who seizes, and the
    //     severe-range pressure that defines it is >=160 systolic OR >=110
    //     diastolic. Modelled as pregnancy AND severe hypertension so it cannot
    //     fire in a non-pregnant hypertensive patient.
    //
    //     THE DIASTOLIC HALF WAS MISSING. This tested systolic alone, which made
    //     the limb unreachable for a whole class of patient: severe-range
    //     hypertension is a DISJUNCTION (ACOG), and preeclamptic pressure is
    //     characteristically diastolic-dominant because the lesion is vascular
    //     resistance. Measured on the preeclampsia condition: 158/111 at forty
    //     minutes — severe by the diastolic criterion, at the pressure where
    //     eclampsia actually happens, and the engine scored her drive at zero.
    //     The condition was reaching the right pressure and being told it was
    //     not severe.
    //
    //     The systolic span 160->200 maps to drive 0->1 and is unchanged. The
    //     diastolic span 110->135 is its counterpart: both run from the
    //     severe-range threshold to the pressure at which hypertensive
    //     encephalopathy is established, so the two limbs agree about how
    //     severe a given patient is instead of being separately scaled. They
    //     combine by MAX for the same reason the drug and intrinsic drives do —
    //     one patient with one brain, not two independent chances to seize.
    // The intrinsic causes are kept SEPARATE rather than collapsed into one
    // number, because suppression is not uniform across them. Magnesium is the
    // definitive drug for the eclamptic mechanism and a poor anticonvulsant
    // otherwise — it is not indicated in status epilepticus of other causes and
    // is ineffective in epilepsy. Collapsing the causes first made that
    // impossible to express: a single generic handle turned the eclampsia drug
    // into a broad-spectrum one that would have worked on hypoglycemia, which
    // teaches the wrong drug choice at the wrong bedside.
    let metabolic = 0;
    const glu = pat.glucose ?? 100;
    if (glu < 40) metabolic = Math.max(metabolic, Math.min(1, (40 - glu) / 20));
    const naNow = pat.na ?? 140;
    if (naNow < 120) metabolic = Math.max(metabolic, Math.min(1, (120 - naNow) / 10));
    let eclamptic = 0;
    if (pat._pregnancy) {
      const severeRange = Math.max(((pat.sbp ?? 0) - 160) / 40,
                                   ((pat.dbp ?? 0) - 110) / 25);
      if (severeRange > 0) eclamptic = Math.min(1, severeRange);
    }
    // HYPERTHERMIC SEIZURES (queue item 26/heatStroke) — a real, common heat
    // stroke feature this engine had no way to produce before. 40 C is the
    // accepted heat-stroke threshold; the drive reaches maximum at 42 C, the
    // engine's own hard coreTemp clamp, rather than an arbitrary ceiling.
    // Kept as its own limb (not folded into `metabolic`) for the same reason
    // eclamptic is separate: suppression is cause-specific — a benzodiazepine
    // is real, appropriate supportive care here, but the DEFINITIVE treatment
    // is cooling, not the anticonvulsant, so this composes with `general`
    // suppression like every other limb rather than getting a dedicated one.
    let hyperthermic = 0;
    const coreT = pat.coreTemp ?? 37;
    if (coreT > 40) hyperthermic = Math.min(1, (coreT - 40) / 2);

    // IDIOPATHIC/STRUCTURAL SEIZURE DISORDER (neuro batch, queue item 7 —
    // seizure-family conditions). A fifth, SEPARATE intrinsic cause, kept
    // apart from metabolic/eclamptic/hyperthermic for the same reason those
    // three are separate from each other: epilepsy is neither a glucose,
    // sodium, pressure nor temperature problem, so collapsing it into any of
    // those would make a generic anticonvulsant look like it treats causes
    // it does not (or vice-versa). pat.epilepticDrive is a condition-level
    // handle (activeSeizureGTC/statusEpilepticus/epilepsy/febrileSeizure) —
    // held every tick the same way scarBurden/avNodalDisease are, and safe
    // from pk.js's reset because only pat.seizureDrive (the drug-toxicity
    // limb) is reset there.
    const epileptic = Math.max(0, Math.min(1, pat.epilepticDrive || 0));

    // Drug-toxicity drive and intrinsic drive combine by MAX rather than sum: a
    // patient is not more likely to seize because two independent causes each
    // already guarantee it, and summing would let two sub-threshold causes
    // manufacture a seizure neither would produce on its own.
    // Each cause is suppressed by what actually works against IT, then the
    // causes combine by MAX. A cause-selective agent therefore cannot mask a
    // cause it does not treat: give magnesium to a hypoglycemic patient and the
    // metabolic limb is barely touched, which is the correct and clinically
    // important behaviour.
    const general = Math.max(0, Math.min(0.98, pat.anticonvulsant || 0));
    const eclampticSupp = Math.max(0, Math.min(0.98,
      general + (pat.anticonvulsantEclamptic || 0)));
    const rawDrive = Math.max(
      (pat.seizureDrive || 0) * (1 - general),
      metabolic * (1 - general),
      eclamptic * (1 - eclampticSupp),
      hyperthermic * (1 - general),
      epileptic * (1 - general));
    // An anticonvulsant raises the threshold; it does not delete the cause. So a
    // seizure whose cause persists returns as the drug wears off, and one whose
    // cause has passed does not.
    const seizureDrive = Math.max(0, Math.min(1, rawDrive));
    // Onset is probabilistic rather than a switch, and once started activity
    // is self-sustaining while the drive persists — status epilepticus does
    // not stop because the stimulus eased slightly.
    //
    // TERMINATION IS A THRESHOLD, NOT A TEST FOR ZERO. This previously cleared
    // `seizing` only when the drive was exactly 0, which made the anticonvulsant
    // limb above unobservable: midazolam reduced the drive but could never end a
    // seizure, so the drug carried for seizures still did nothing about them.
    // Measured before this fix: a hypoglycemic patient given midazolam seized
    // for 95% of ticks, against 98% untreated.
    //
    // 0.15 is the drive below which activity is no longer self-sustaining. The
    // clinically important consequence is that the SAME dose behaves differently
    // depending on the cause: a moderate drive is suppressed below the sustain
    // threshold and the seizure stops, while a profound one — glucose 25, say —
    // stays above it and the seizure continues until the glucose is actually
    // corrected. That is the correct teaching point, not a limitation: a
    // benzodiazepine does not fix hypoglycemia.
    const SUSTAIN = 0.15;
    if (!pat.seizing) {
      if (seizureDrive > 0 && Math.random() < seizureDrive * dt * 2) pat.seizing = true;
    } else if (seizureDrive < SUSTAIN) {
      pat.seizing = false;
    }

    // MASS EFFECT (neuro batch, queue item 7 — Increased ICP / Cushing
    // Reflex / Brain Herniation): a general handle for anything that
    // physically occupies intracranial volume — edema, a hematoma, a tumor —
    // as opposed to brainInjury's own ischemic-injury-driven ICP rise. 0-1,
    // additive; 40 mmHg at the ceiling puts a fully-developed mass lesion
    // (icpMassEffect=1) at ICP ~50+ mmHg even before injury/CO2 contribute —
    // solidly in the herniation range (>40 mmHg is Monro-Kellie
    // decompensation; >60 approaches Cushing's own threshold below).
    // HEAD-OF-BED ELEVATION (queue item 70) — a real, modest ICP-reducing
    // measure (30-degree reverse Trendelenburg improves cerebral venous
    // outflow), NOT a cure: published head-elevation studies report only a
    // few mmHg of reduction (Ng et al./Fan et al.'s own reviews of 30-degree
    // positioning trials), nowhere near enough to rescue a genuinely
    // herniating patient — it buys margin, matching the modest,
    // non-curative framing this engine already uses for shade/passive
    // cooling. Applied as a flat subtraction, not a percentage: the real
    // mechanism (improved venous drainage) does not scale with how bad the
    // underlying lesion already is, and a percentage-of-total reduction
    // would make elevation implausibly powerful for a large mass-effect
    // lesion and negligible for a near-normal patient — backwards, since the
    // clinical teaching is "helps a little, always," not "helps more, the
    // worse things get."
    const headOfBedRelief = pat.headElevated ? 3 : 0;
    pat.icp = 10 + (pat.paco2 - 40) * 0.3 + pat.brainInjury * 20 + (pat.icpMassEffect || 0) * 40 - headOfBedRelief;
    // RESOLVED — physiology queue item 15. A real cerebral perfusion
    // pressure cannot go negative: at MAP<ICP the cerebral vessels collapse
    // and flow stops, it does not run backwards. MEASURED pre-fix: -22 mmHg
    // in prolonged arrest. The consciousness/injury math immediately below
    // already independently floored its OWN derived brainO2 at 0
    // (Math.max(0, ...) at both this site and the injury accrual in this
    // file), so no classification or injury-accrual behavior changes here —
    // this fixes the STORED number itself, which is what a monitor or a
    // future debrief readout would otherwise report as a physically
    // meaningless negative pressure.
    pat.cpp = Math.max(0, pat.map - pat.icp);
    // CUSHING REFLEX — a real, distinct autonomic response to RISING ICP
    // specifically, not to ordinary hypovolemic hypotension. As CPP falls
    // toward the lower edge of cerebral autoregulation, the brainstem mounts
    // a sympathetic pressor surge to defend perfusion, paired with a
    // baroreceptor-mediated vagal bradycardia — the paradox of HYPERTENSION
    // plus BRADYCARDIA (Cushing's triad) that a hemorrhaging, hypovolemic
    // patient never shows (that patient compensates with a tachycardia
    // instead). Gated on pat.icp itself being genuinely elevated (>25, well
    // above the ~10 mmHg normal), not merely on a low CPP, so a shocked
    // patient's low CPP from a low MAP does not fire this reflex — only a
    // real intracranial process does. Severity scales from 0 at CPP=70 (the
    // low end of the ~50-150 mmHg autoregulation plateau this file's own
    // ischemic-threshold comment already cites) to 1 at CPP=30. Feeds
    // cardiovascular.js's alphaTone (a real additive channel, the same idiom
    // as an exogenous pressor drug) and reuses pat.vagalSurge (the same
    // handle a Valsalva manoeuvre drives) for the bradycardic half, rather
    // than inventing a second vagal channel.
    if (pat.icp > 25) {
      const cushingSeverity = Math.max(0, Math.min(1, (70 - pat.cpp) / 40));
      pat._cushingAlpha = cushingSeverity * 1.5;
      pat.vagalSurge = Math.max(pat.vagalSurge || 0, cushingSeverity * 0.8);
    } else {
      pat._cushingAlpha = 0;
    }
    // Normalize cerebral oxygen delivery to the patient's OWN age-appropriate
    // MAP (a child at its normal, lower MAP is fully awake — not "drowsy" by an
    // adult 93 mmHg yardstick).
    const mapRef = pat.mapBaseline || 93;
    // HISTOTOXIC HYPOXIA AT THE BRAIN (pat.cytochromeBlock, patient.js). The
    // cortex is the most oxidative-phosphorylation-dependent tissue in the
    // body and is the first thing cyanide takes down clinically (headache and
    // confusion at low dose, seizure and coma at high dose) — with an entirely
    // normal PaO2, SaO2 and cerebral blood flow. Same one-line utilization
    // ceiling as metabolic.js's actualVO2 and cardiovascular.js's coronary
    // supply, applied here so consciousness falls out of the SAME already-
    // calibrated brainO2 bands every other cause of cerebral hypoxia uses
    // (<0.7 drowsy, <0.5 unconscious, <0.3 coma) rather than a condition
    // writing pat.consciousness. MEASURED: a healthy resting brainO2 is ~0.89
    // here, so a 0.3 block reads drowsy, 0.5 unconscious and 0.7 coma — a real,
    // graded dose-severity relationship, not a step function.
    const cytoBlockCns = Math.min(1, Math.max(0, pat.cytochromeBlock ?? 0));
    const brainO2 = pat.cpp * pat.caO2 * (1 - cytoBlockCns) / (mapRef * 20);
    const comaCpp = Math.min(30, 0.55 * mapRef);

    // AGITATION / PSYCHIATRIC-CRISIS SEVERITY (queue item 51). Real, general
    // 0-1 severity — found missing while implementing LA County TP 1209
    // (Behavioral/Psychiatric Crisis): that protocol's own core algorithm
    // (verbal de-escalation vs. restraint, olanzapine for a cooperative
    // patient, midazolam titration for an uncooperative/severely agitated
    // one) had no real ground-truth signal to gate on. Confirmed by grep
    // before writing anything (lesson 16): no agitation-shaped field existed
    // anywhere in patient.js.
    //
    // Composed from THREE independently real physiological drivers, plus one
    // condition-declared magnitude for causes this engine doesn't otherwise
    // model — the same "declare the lesion, let the engine derive the
    // observable" idiom pat.pathogenBurden (inflammation.js) already uses:
    //   1. Sympathetic/catecholamine tone (pat.sympathetic,
    //      cardiovascular.js, already settled this tick). Real, textbook
    //      mechanism: sympathetic activation IS the physiologic substrate
    //      of psychomotor agitation — restlessness, hypervigilance and
    //      combativeness are the behavioral face of the same fight-or-flight
    //      response, the actual reason stimulant intoxication, alcohol/
    //      sedative withdrawal, and severe pain/anxiety all present
    //      agitated clinically. Baseline is 0.3 (patient.js/
    //      cardiovascular.js's own documented convention) — only genuine
    //      excess above it contributes.
    //   2. Hypoxia (brainO2, computed immediately above). A real, classic
    //      EMS/anesthesia teaching point: the EARLIEST cerebral sign of
    //      hypoxia is agitation/restlessness, not obtundation — "the
    //      combative hypoxic patient" is a standard teaching case
    //      specifically BECAUSE the correct field move is oxygen, not
    //      sedation. Modeled as a HUMP (rises through a mild-moderate
    //      deficit, then recedes as the deficit deepens toward genuine
    //      obtundation) rather than a monotonic ramp — matching the real
    //      clinical progression (agitated -> confused -> obtunded) this same
    //      function's own consciousness ladder a few lines below already
    //      reflects, so a dying, severely hypoxic patient does not read as
    //      MORE agitated the closer they get to unconsciousness.
    //   3. pat.agitationBurden (0-1, condition-declared): the direct handle
    //      for a condition with no other physiological driver for its own
    //      agitation. excitedDelirium (conditions.js) is the first consumer,
    //      wired the same session this field was built — its own real
    //      catecholamine crisis composes here rather than needing a second,
    //      parallel severity scale.
    //
    // LOWERED BY REAL PHARMACOLOGIC TREATMENT, not narrated — TWO
    // mechanistically distinct pathways, each reused directly rather than
    // inventing a disconnected lever, composed multiplicatively (each is an
    // independent partial blockade of the SAME behavioral endpoint, so the
    // fraction of agitation that "gets through" is the product of what each
    // pathway leaves unblocked, not a single additive discount):
    //   - pat.sedationDepth (pk.js, queue item 47 — midazolam/etomidate's
    //     real GABA-A-potentiation-driven CNS depression), the actual
    //     mechanism behind benzodiazepine treatment of agitation.
    //   - pat.antipsychoticEffect (pk.js, queue item 52 — olanzapine's real
    //     D2/5-HT2A receptor antagonism), a genuinely different receptor
    //     mechanism for the SAME clinical outcome (a calmed, cooperative
    //     patient) without sedationDepth's own GABA-ergic respiratory/
    //     unconsciousness profile — real clinical distinction: an atypical
    //     antipsychotic can calm without sedating to unresponsiveness the
    //     way an equivalent-strength benzodiazepine dose does.
    // Both are the same fields TP 1209's own midazolam/olanzapine rules
    // (laCounty.js) measurably move.
    //
    // GATED TO ZERO FOR AN ALREADY-UNCONSCIOUS/COMATOSE PATIENT: agitation is
    // a BEHAVIORAL phenomenon requiring some cortical arousal — a patient who
    // is genuinely unconscious (whatever the cause: TBI, hypoglycemia, deep
    // sedation) cannot be behaviorally agitated. Reads pat.consciousness as
    // it stands RIGHT NOW — i.e. LAST tick's already-settled classification,
    // since this tick's own classification is computed later in this same
    // function — the identical one-tick-lag idiom this codebase already uses
    // for a cross-quantity read within one substep (e.g. cardiovascular.js's
    // Cushing-reflex term reading the prior tick's cpp).
    const agitSymDrive = Math.max(0, (pat.sympathetic ?? 0.3) - 0.3) * 0.5;
    let agitHypox = 0;
    if (brainO2 > 0.3 && brainO2 < 0.9) {
      agitHypox = brainO2 >= 0.65
        ? (0.9 - brainO2) / 0.25   // rising limb: 0.9->0 up to 0.65->1
        : (brainO2 - 0.3) / 0.35; // falling limb: 0.65->1 down to 0.3->0
    }
    const agitSedationCalm = Math.max(0, 1 - (pat.sedationDepth || 0) * 2.5);
    const agitAntipsychoticCalm = Math.max(0, 1 - (pat.antipsychoticEffect || 0) * 1.5);
    let agitRaw = ((pat.agitationBurden || 0) + agitSymDrive + agitHypox * 0.5)
      * agitSedationCalm * agitAntipsychoticCalm;
    if (pat.consciousness === "unconscious" || pat.consciousness === "coma") agitRaw = 0;
    pat.agitation = Math.max(0, Math.min(1, agitRaw));

    let target = "awake";
    if (brainO2 < 0.3 || pat.cpp < comaCpp) target = "coma";
    else if (brainO2 < 0.5 || pat.sao2 < 70) target = "unconscious";
    else if (brainO2 < 0.7) target = "drowsy";
    else if (pat.paco2 > 70) target = "confused";
    // HYPERTENSIVE ENCEPHALOPATHY (queue item 23, gated on the same
    // hypertensiveEmergency-class severe pressure) — the opposite pole from
    // every branch above, which is all built on a PERFUSION DEFICIT. Severe
    // acute hypertension can outrun cerebral autoregulation's UPPER limit
    // (breakthrough vasodilation, capillary leak, vasogenic edema — ACC/AHA)
    // and cause confusion from too much pressure, not too little. Threshold
    // (160 mmHg) matches this file's own eclamptic severe-range anchor
    // (ACOG) and hypertensiveEmergency's own documented measured MAP —
    // reusing an existing calibration point rather than inventing a new one.
    else if (pat.map > 160) target = "confused";
    // TOXIC-METABOLIC ENCEPHALOPATHY (queue item 7 — Neurologic). Reads TWO
    // already-tracked injury markers (pat.liverInjury/pat.kidneyInjury, both
    // real, both previously never wired to consciousness at all) plus a
    // general pat.metabolicEncephalopathy handle for causes with no existing
    // injury accumulator (sepsis-associated encephalopathy, drug/toxin
    // causes) — hepatic and uremic encephalopathy are real, common, and
    // until now this engine could raise liver/kidney injury without any
    // downstream consciousness consequence at all.
    else if (pat.liverInjury > 0.5 || pat.kidneyInjury > 0.6 || (pat.metabolicEncephalopathy || 0) > 0.5) target = "confused";
    // NEUROGLYCOPENIA (endocrine batch, queue item 7 — Severe Hypoglycemia).
    // A real, missing piece: `glu` above already drives SEIZURE risk via the
    // metabolic limb, but most hypoglycemic patients present with impaired
    // consciousness WITHOUT seizing — a distinct, more common mechanism this
    // engine had no route to at all. Documented thresholds: confusion is
    // typical below ~50 mg/dL, coma/unresponsiveness below ~30 (Cryer,
    // "Hypoglycemia in Diabetes").
    else if (glu < 50) target = glu < 30 ? "unconscious" : "confused";
    // PHARMACOLOGIC SEDATION (pk.js's real, direct pat.sedationDepth —
    // midazolam/etomidate CNS depression, distinct from every branch
    // above, which is built on a perfusion/metabolic deficit). Before
    // this, giving a large sedative dose to an otherwise healthy patient
    // produced no consciousness change at all unless it happened to also
    // cause enough respiratory depression to drop oxygenation. Thresholds
    // are placed relative to real measured drug behavior, not invented: a
    // single standard midazolam dose measures sedationDepth~0.26 (drowsy,
    // not unconscious — matching real single-dose procedural sedation),
    // while a single etomidate induction dose measures ~0.60 (crosses into
    // unconsciousness, matching etomidate's actual clinical role as an
    // INDUCTION agent). MEASURED, not assumed: repeated midazolam dosing
    // (3 doses over 9 min) only reached ~0.34, still drowsy rather than
    // unconscious — the engine's own Emax saturation (intensity computed
    // once from SUMMED concentration, not additively per dose) correctly
    // limits how far repeat dosing of a single moderate-potency sedative
    // can push this, an honest finding rather than the naive "more doses
    // -> deeper sedation" assumption a first draft of this comment made.
    else if ((pat.sedationDepth || 0) > 0.6) target = "unconscious";
    else if ((pat.sedationDepth || 0) > 0.25) target = "drowsy";
    // FLOOR, not an override — queue item 29's actual root cause. This used to
    // fire unconditionally, which meant it DOWNGRADED an already-selected
    // "coma" (the deepest tier above, checked first from cpp/brainO2) to
    // "unconscious" the instant cumulative brainInjury passed 0.5 — which
    // happens on the way to every genuinely comatose trajectory, since
    // brainInjury only keeps climbing during ongoing ischemia. Two real
    // consumers key specifically on the string "coma", not "coma or
    // unconscious": mortality.js's brainDeath mechanism
    // (brainInjury>=0.6 && consciousness==="coma" && cpp<20) and
    // physiology.js's arrestWarning. Both require a state this override made
    // UNREACHABLE for exactly the patients they exist to catch — a real
    // arrest never got the chance to be classified "coma" long enough for
    // brainInjury to cross 0.5, at which point this line permanently
    // relabeled it "unconscious" and locked both mechanisms out for the rest
    // of the trajectory (brainInjury does not fall back below 0.5 mid-arrest).
    // The intent this line DOES need to keep: a patient whose perfusion has
    // recovered (post-ROSC) but who carries enough accrued brain injury to
    // stay unconscious anyway, rather than the perfusion-based branches above
    // waking them back up to "drowsy"/"confused"/"awake". Restricting it to
    // only ever RAISE the severity (never override an already-deeper "coma")
    // preserves that while letting an actively perfusion-failing patient stay
    // classified at the state their own physiology already earned.
    if (pat.brainInjury > 0.5 && target !== "coma") target = "unconscious";
    if (target !== pat.consciousness) {
      pat.consciousnessTimer += dt;
      if (pat.consciousnessTimer > 0.5) {
        pat.consciousness = target;
        pat.consciousnessTimer = 0;
      }
    } else {
      pat.consciousnessTimer = 0;
    }
}
