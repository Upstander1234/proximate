# PK literature review brief (for the pk.js realism and weight-scaling rework)

Prepared 2026-10-04. Purpose: everything needed to review the literature and hand back parameters so `src/physio/pk.js` can move from adult-only, partly effect-matched parameters to weight- and age-aware, literature-anchored ones. Companion to the "weight-aware dosing" item in CLAUDE.md section 6.

## 1. How the engine models a drug today

- **Units.** Dose is in mg unless noted (a few drugs use units: vasopressin U, oxytocin U). Concentration is mg/L. `v1` is liters, rates are per minute.
- **Two-compartment disposition** (21 drugs, table in section 2): central and peripheral compartments with `kel` (elimination from central), `k12`, `k21`. Total clearance is `CL = kel * v1`. Peripheral volume is implied: `V2 = v1 * k12 / k21`. Terminal half-life is derived from all three rates.
- **Effect site.** One effect compartment per drug with rate `keo` (1/min). Effect-site concentration `Ce` relaxes toward `central / v1`.
- **Response.** Hill occupancy `Ce^n / (ec50^n + Ce^n)`, then scaled by receptor or `fx` coefficients declared in `drugs.js`. `ec50` is in mg/L, one value per drug (morphine and fentanyl have a second `respEc50`/`respHillN` for respiratory depression; morphine `hillN`=2.4 for analgesia). Naloxone shifts the opioid EC50 by `1 + [naloxone]/Ki` (competitive), plus a fentanyl-specific receptor off-rate `koff`.
- **Routes.** Absorption is a first-order depot with route-specific defaults: IM `ka`=0.09/min (perfusion-dependent, optional second deep depot for epinephrine), IN `ka`=0.11/min with F=0.6, SL `ka`=0.12 (F=0.8), oral `ka`=0.035 (F=0.4), inhaled `ka`=0.06 with ~15% systemic fraction plus a local airway depot. Per-drug overrides exist (`imKa`, `inKa`, `nasalBioavailability`, `oralBioavailability`, `inhaledBioavailability`, `bioavailability`).
- **Elimination organ scaling.** `kel` is multiplied by `renalFrac * renalClearanceFraction + (1 - renalFrac) * hepaticFactor`, where hepatic factor is `min(1, CO/restCO) * (1 - 0.7*liverInjury)`. Table column `renalFrac` is the assumed renal share of total clearance.
- **Tolerance/desensitization** is layered on top (opioid analgesic and respiratory tolerance, benzodiazepine GABA desensitization, beta2 desensitization) and is a separate review topic.
- **What does NOT exist.** No weight, age, sex, body composition or pregnancy dependence anywhere in PK. No protein binding. No active metabolites. No three-compartment disposition. No saturable (Michaelis-Menten) elimination. No flow-limited hepatic extraction (the flow factor is a crude scaler). No temperature, pH, or albumin effects on PK. No renal replacement. No infusion model (norepinephrine is "hang and titrate" but is simulated as repeated boluses).
- **Important context:** a previous session found the engine often matches a documented half-life or a measured bedside effect through compensating errors (small `v1` and small `CL` together). Several parameters below were chosen so a 15 to 30 minute simulated call behaves right, not because they match a published parameter set. The rework must decide, per drug, whether to keep that effect-matching or replace it with a real parameter set and re-fit `ec50`/`keo` so the bedside time course survives.

## 2. Current parameters for every two-compartment drug

Derived columns: `v1/kg` assumes a 70 kg adult; `CL = kel*v1`; terminal half-life computed from the three rates; `keo t1/2 = ln2/keo`.

| drug | route | dose (mg) | max doses | v1 (L) | v1 per kg | CL | kel | k12 | k21 | terminal t1/2 | ec50 (mg/L) | keo | keo t1/2 | renalFrac | extras |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| fentanyl | IV/IM/IN | 0.05 | 5 | 13 | 0.19 | 0.13 L/min | 0.01 | 0.2 | 0.1 | 213 min | 0.0012 | 0.14 | 5.0 min | 0.1 | respEc50=0.0023 koff=0.25 |
| morphine | IV/IM | 4 | 5 | 18 | 0.26 | 0.14 L/min | 0.008 | 0.15 | 0.1 | 221 min | 0.025 | 0.04 | 17.3 min | 0.55 | hillN=2.4 respEc50=0.025 |
| midazolam | IM/IN/IV | 5 | 4 | 15 | 0.21 | 0.30 L/min | 0.02 | 0.3 | 0.2 | 89 min | 0.1 | 0.14 | 5.0 min | 0.2 |  |
| ketamine | IV/IO | 100 | 2 | 40 | 0.57 | 1.20 L/min | 0.03 | 1 | 0.5 | 70 min | 1 | 0.7 | 1.0 min | 0.05 |  |
| etomidate | IV/IO | 20 | 2 | 8 | 0.11 | 0.40 L/min | 0.05 | 2 | 0.5 | 70 min | 0.3 | 0.46 | 1.5 min | 0.1 |  |
| rocuronium | IV/IO | 100 | 1 | 12 | 0.17 | 0.41 L/min | 0.0345 | 0.167 | 0.0558 | 90 min | 1.5 | 0.25 | 2.8 min | 0.3 |  |
| epiIV | IV/IO | 1 | 3 | 8 | 0.11 | 2.40 L/min | 0.3 | 0.5 | 0.3 | 8 min | 0.003 | 0.7 | 1.0 min | 0.05 |  |
| pushEpi | IV | 0.02 | 10 | 8 | 0.11 | 2.40 L/min | 0.3 | 0.5 | 0.3 | 8 min | 0.003 | 0.7 | 1.0 min | 0.05 |  |
| norepi | IV | 1 | 12 | 8 | 0.11 | 0.80 L/min | 0.1 | 0.4 | 0.3 | 18 min | 0.008 | 0.7 | 1.0 min | 0.05 |  |
| naloxone_in | IN | 0.4 | 2 | 21 | 0.30 | 1.18 L/min | 0.0564 | 0.154 | 0.0513 | 60 min | 0.002 | 0.5 | 1.4 min | 0.15 |  |
| naloxone_im | IM | 0.4 | 4 | 21 | 0.30 | 1.18 L/min | 0.0564 | 0.154 | 0.0513 | 60 min | 0.002 | 0.5 | 1.4 min | 0.15 |  |
| naloxone_iv | IV | 0.4 | 4 | 21 | 0.30 | 1.18 L/min | 0.0564 | 0.154 | 0.0513 | 60 min | 0.002 | 0.5 | 1.4 min | 0.15 |  |
| epiIM | IM | 0.5 | 3 | 8 | 0.11 | 2.40 L/min | 0.3 | 0.5 | 0.3 | 8 min | 0.003 | 0.1 | 6.9 min | 0.05 |  |
| epiAuto | IM | 0.3 | 3 | 8 | 0.11 | 2.40 L/min | 0.3 | 0.5 | 0.3 | 8 min | 0.003 | 0.7 | 1.0 min | 0.05 |  |
| amiodarone | IV/IO | 300 | 2 | 10 | 0.14 | 0.05 L/min | 0.005 | 2 | 0.01 | 27933 min | 1.75 | 0.25 | 2.8 min | 0 |  |
| amiodarone2 | IV/IO | 150 | 1 | 10 | 0.14 | 0.05 L/min | 0.005 | 2 | 0.01 | 27933 min | 1.75 | 0.25 | 2.8 min | 0 |  |
| lidocaine | IV/IO | 100 | 2 | 3 | 0.04 | 0.03 L/min | 0.01 | 1 | 0.1 | 769 min | 2.5 | 0.55 | 1.3 min | 0.03 |  |
| lidocaineBlock | IM | 120 | 2 | 3 | 0.04 | 0.03 L/min | 0.01 | 1 | 0.1 | 769 min | 2.5 | 0.55 | 1.3 min | 0.03 |  |
| atropine | IV/IO | 1 | 3 | 25 | 0.36 | 1.25 L/min | 0.05 | 0.2 | 0.1 | 46 min | 0.005 | 0.5 | 1.4 min | 0.5 |  |
| diltiazem | IV | 20 | 2 | 5 | 0.07 | 0.25 L/min | 0.05 | 0.5 | 0.1 | 89 min | 0.1 | 0.14 | 5.0 min | 0.05 |  |
| metoprolol | IV | 5 | 3 | 4 | 0.06 | 0.08 L/min | 0.02 | 0.6 | 0.2 | 141 min | 0.1 | 0.07 | 9.9 min | 0.05 |  |

Notes on the table: epiIV, pushEpi, epiIM, epiAuto share one parameter set (only route, keo and dose differ). Naloxone IN/IM/IV share one set. `amiodarone2` and `amiodarone` are the same drug (second dose is 150 mg). `lidocaineBlock` is lidocaine given IM as a hematoma block (120 mg).

## 3. Per-drug review list, with my leads to check (NOT authoritative)

The "lead" column is my recollection of typical adult values and where the engine looks far off. Treat every number as a hypothesis to confirm or refute from primary sources. Where the engine value was deliberately effect-matched, the in-code comment in `pk.js` says so; read it before overwriting.

| drug | engine concern to verify | what to find |
|---|---|---|
| fentanyl | CL 0.13 L/min looks low (typical adult CL is roughly 0.5-1 L/min); three-compartment behavior; strong dependence on hepatic blood flow (high extraction) | Vc, Vss (L/kg), CL (L/min/kg), t1/2 alpha/beta/gamma, EC50 for analgesia and respiratory depression, ke0, pediatric and neonatal CL maturation, context-sensitive half-time |
| morphine | CL 0.14 L/min looks low (typical is roughly 1 L/min) and Vss looks small (typical several L/kg); terminal t1/2 may be matched by compensating errors; M6G/M3G metabolites with renal accumulation | Vc, Vss, CL, metabolite kinetics and potency (M6G active), ke0 (see the CLAUDE.md morphine note: published t1/2 ke0 ranges 0.71 h to 4.4 h by method), neonatal/infant CL maturation, renal-failure effect |
| midazolam | CL 0.3 L/min plausible; CYP3A4 and age/obesity effects; alpha-hydroxymidazolam | Vc, Vss, CL, EC50 for sedation and for anticonvulsant effect, ke0, pediatric weight scaling, IM and IN bioavailability and Tmax |
| ketamine | CL 1.2 L/min plausible; N-demethylation to norketamine (active) | Vc, Vss, CL, EC50 (analgesia vs dissociation), ke0, norketamine contribution, IM/IN bioavailability, pediatric scaling |
| etomidate | `v1` 8 L looks small relative to published Vss | Vc, Vss, CL, EC50, ke0, adrenal suppression time course (optional) |
| rocuronium | `v1` 12 L plausible | Vc, Vss, CL, EC50 or Ce50 for neuromuscular block, ke0, hepatic and renal effects, pediatric and neonatal sensitivity, hypothermia effect |
| epinephrine (IV/IM/auto) | Single `v1` 8 L and CL 2.4 L/min are not well anchored; endogenous baseline not modeled; IM absorption highly site and perfusion dependent; pediatric dose is 0.01 mg/kg | Vc, CL (reported ~ 60-90 mL/kg/min?), t1/2, EC50 for the cardiovascular endpoints, IM Tmax and F by site (thigh vs deltoid), peripheral-perfusion effect on absorption, auto-injector dose by weight |
| norepinephrine | CL 0.8 L/min looks low; infusion drug simulated as bolus | Vc, CL, t1/2, EC50, infusion rate-to-effect data (mcg/kg/min), pediatric scaling |
| naloxone | Vc 21 L, CL 1.18 L/min plausible; IN bioavailability; duration shorter than many opioids | Vc, Vss, CL, IN and IM F and Tmax, receptor Ki, pediatric dosing and CL |
| amiodarone | Terminal t1/2 computes to weeks, probably fine, but acute IV behavior (redistribution) dominates a call; `k21` 0.01 is tiny | Vc, Vss (very large), CL, acute IV alpha phase, EC50/effect markers (QT, AV slowing), desethylamiodarone, pediatric mg/kg |
| lidocaine | `v1` 3 L and CL 0.03 L/min look far too small (typical Vc is roughly 0.5-1 L/kg, CL roughly 10-20 mL/kg/min, hepatic flow-limited, t1/2 ~1.5-2 h); toxicity thresholds in `drugs.js` are in mg/L | Vc, Vss, CL, flow dependence (CO and hepatic perfusion), MEGX active metabolite, therapeutic and toxic plasma levels, IM absorption for the hematoma block, protein binding (alpha-1 acid glycoprotein), pediatric and neonatal dosing |
| atropine | CL and Vc plausible; renal fraction ~0.5 | Vc, Vss, CL, EC50 for heart rate effect, ke0, pediatric weight dose (and minimum dose), neonatal differences |
| diltiazem | `v1` 5 L and CL 0.25 L/min look small versus published (Vss reported as several L/kg, CL roughly 0.5-1 L/min) | Vc, Vss, CL, active metabolites, EC50 for AV nodal slowing and BP, ke0, hepatic impairment, pediatric data |
| metoprolol | `v1` 4 L and CL 0.08 L/min look small versus published (Vss roughly 3-5 L/kg, CL roughly 1 L/min, CYP2D6 polymorphism) | Vc, Vss, CL, CYP2D6 phenotype effect, EC50 for beta blockade, ke0 |

## 4. Curve-model drugs (28): decide which should become real PK models

These use fixed onset/duration and flat receptor coefficients with no concentration. For each, the question is whether the clinical teaching value justifies a concentration model. Candidates most likely to need one (concentration-driven, dose-dependent, or routinely given to children): adenosine (ultra-short, bolus into central vein, weight-based pediatric dose 0.1 mg/kg), calcium chloride, vasopressin, dexamethasone (weight-based, long), magnesium (levels matter, toxicity), glucagon, diphenhydramine, ketorolac, acetaminophen IV (weight-based and hepatotoxic), ondansetron (weight-based), oxytocin, tranexamic acid (weight-based), heparin, phenylephrine (infusion), olanzapine (agitation, sedation). Probably fine as curves: aspirin, albuterol and ipratropium and nebulized epinephrine (local airway effect, dose is not weight-scaled in practice), nitroglycerin and nitroOwn, nitrous oxide (inhaled gas kinetics are a separate model), OTC analgesic, duodote, hydroxocobalamin, thrombolytic, metoclopramide, bicarbonate. For anything you recommend promoting, I need the same dataset as section 5.

List: duodote, aspirin, albuterol, ipratropium, nebEpi, nitroOwn, nitrous, otcAnalgesic, nitro, glucagon, ondansetron, metoclopramide, ketorolac, acetaminophenIV, adenosine, calcium, bicarb, vasopressin, dexamethasone, diphen, olanzapine, magnesium, txa, hydroxo, oxytocin, heparin, phenylephrine, thrombolytic.

Fluids and others (not receptor PK, handled by volume and composition): oralGlucose, saline, salineMinor, d10, blood, plasma, plasmalyte. Needed only for weight-based bolus conventions (20 mL/kg, D10 2-5 mL/kg, etc.) and neonatal limits.

## 5. Dataset to extract per drug (the template to fill)

For each drug, ideally from a population PK paper or a standard reference (Goodman & Gilman, Miller's Anesthesia, Neofax/Lexicomp for pediatric, plus primary PK/PD papers). Please record the source, population, and whether the value is mean or median.

1. **Disposition:** Vc, V2 (and V3 if 3-compartment), Vss, CL, inter-compartment clearances, in L/kg or L and L/min/kg; which model order the source fit.
2. **Scaling:** whether the source used allometry (exponent), lean body mass, or total weight; reported weight and age ranges.
3. **Maturation:** neonate (by gestational and postnatal age), infant, child, adolescent clearance and volume. Prefer a published maturation function (sigmoid Emax of postmenstrual age, or a Rhodin-type GFR maturation for renally cleared drugs) over a table of factors.
4. **Elimination route:** fraction renal vs hepatic, high or low hepatic extraction ratio, enzyme (CYP) involved, active metabolites with their own kinetics and potency.
5. **Binding:** plasma protein binding and which protein (albumin vs alpha-1 acid glycoprotein), and how it changes in critical illness, neonates, pregnancy.
6. **PD:** EC50 or Ce50 for each clinically relevant endpoint (units mg/L or ng/mL, state which), Hill exponent, ke0 or t1/2ke0 and the endpoint it was measured against (arterial, venous, brain, EEG, hemodynamic).
7. **Routes used in EMS:** F and ka and Tmax for IM, IN, IO, SL, oral, inhaled; site dependence (IM thigh vs deltoid); IO versus IV differences.
8. **Dosing anchor:** standard adult dose, standard pediatric mg/kg dose, maximum single and cumulative dose, and the source guideline (NRP, PALS, ACLS, AHA 2025, local protocols).
9. **Altered states:** renal failure, hepatic impairment, shock or low cardiac output (hepatic blood-flow effect on CL; central volume shrinkage in hemorrhage), hypothermia, acidosis, obesity, pregnancy, elderly, critical illness.
10. **Toxic concentrations and overdose behavior**, where an overdose condition exists in the sim (fentanyl, rocuronium, diltiazem, metoprolol, atropine, lidocaine, amiodarone, norepinephrine).

## 6. Cross-cutting model questions to settle (cite sources for the choice)

- **Scaling law.** Allometric weight exponents of 1 for volumes and 0.75 for clearance, versus drug-specific exponents from the source papers; lean body mass versus total weight for fentanyl, propofol-like drugs, and rocuronium.
- **Neonatal and infant maturation.** Which published function per elimination pathway (CYP3A4, CYP2D6, glucuronidation, renal) and what the age-0 asymptote is.
- **Hepatic extraction.** Whether to adopt a well-stirred model for high-extraction drugs (fentanyl, lidocaine, morphine partly, propranolol-like) where CL depends on hepatic blood flow, versus the current flow factor.
- **Compartment order.** Which drugs justify three-compartment disposition (fentanyl, ketamine, rocuronium, amiodarone are the usual cases).
- **Effect-site modeling.** Whether one `keo` per drug is acceptable or whether separate effect compartments per endpoint (analgesia, respiratory depression, hemodynamics, EEG) are needed.
- **Infusions.** Whether to add a continuous-infusion input for norepinephrine, epinephrine, and phenylephrine (mcg/kg/min), which most protocols dose that way.
- **Shock effects on volume and clearance.** Hemorrhage and vasoconstriction shrink the central volume and raise concentrations of fentanyl, midazolam, ketamine, and rocuronium; evidence base for the size of the effect.
- **Preserving sim timescale.** Evidence-based parameters will lengthen several half-lives well beyond a 30 minute call. State, per drug, the clinically visible time course (onset, peak, offset in minutes) so we can verify that a realistic parameter set still produces sensible bedside behavior.

## 7. Suggested priority order

1. **Pediatric-critical and high-teaching-value:** epinephrine, atropine, naloxone, midazolam, fentanyl, ketamine, adenosine, amiodarone, lidocaine, calcium, dextrose and fluids, rocuronium, etomidate.
2. **Likely numerically off in the current engine (section 3 flags):** lidocaine, morphine, fentanyl, metoprolol, diltiazem, norepinephrine.
3. **Curve drugs worth promoting** (section 4 list), only after the first two groups.

## 8. Where this code lives

- `src/physio/pk.js`: `PK_PARAMS` (the table above), `DrugInstance` (route and depot logic), `updateDrugs` (per-tick concentration, effect site, receptor and `fx` application), `organClearanceFactor`.
- `src/data/drugs.js`: per-drug route, dose, max, receptors, `fx`, `toxicity` thresholds, `bioavailability` overrides.
- Existing in-code comments in `pk.js` give the anchors used so far and explain which parameters were effect-matched. Read the comment above each `PK_PARAMS` entry before changing it.
- Verification that must keep passing: `mechanismWiring.mjs`, `scenarioSweep.mjs`, `pkAudit.mjs`, `curveDrugAudit.mjs`, and the arrhythmia efficacy harness (onset time depends on `keo`).

## 9. Findings received from OpenEvidence (2026-10-04), and what they change

Source quality: OpenEvidence summaries of reviews and FDA labels, not primary-paper extraction. Treat every number as "to confirm in the primary paper" before it goes into `PK_PARAMS`. Two figures look suspect and are flagged below.

### 9.1 Scaling model (settled enough to build against)

- **Size**: volumes scale linearly on weight (exponent 1.0), clearance on weight^0.75. Fixed exponents are the field default for children over about 2 years (Germovsek 2019, van Valkengoed 2025).
- **Maturation** (needed below about 2 years, essential in neonates): multiply clearance by a sigmoid in post-menstrual age, `PMA^n / (PMA^n + PMA50^n)`, with PMA50 and Hill n taken per elimination pathway from a published source, not a flat neonatal factor. Postmenstrual age, not postnatal age, because enzyme maturation starts before birth.
- **Full equation**: `CL_i = CL_70kg * (WT_i/70)^0.75 * maturation(PMA_i)`. At 70 kg and an adult PMA the maturation term is about 1, so phase 1 can reproduce today's numbers exactly (the bit-for-bit adult regression requirement).
- **Alternative if neonatal fit is poor**: age-dependent exponents (reported roughly 1.2 at 0 to 3 months, 1.0 at 3 months to 2 years, 0.9 above 2 years). Keep as a fallback, not the default.
- **Engine inputs needed**: PMA means the patient needs gestational age at birth plus postnatal age. `AgeProfile` currently carries age, weight, sex, height only. Add a gestational-age field (default term, 40 weeks) for neonatal patients, and use actual current weight for dosing and scaling (this also settles the pregnancy question: use actual weight, matching the existing `anatomicalWeight()` note).
- **Roster-wide doses** (`patientId == null`): resolve weight per receiving patient at administration. There is no single roster weight.
- **Fentanyl is an exception to "neonates clear slower"**: weight-normalized clearance is reportedly higher in infants (peak about 18.9 mL/min/kg at 6 months to 6 years, versus 8.2 younger and 8.0 older), from higher weight-normalized hepatic blood flow. So the maturation function must be per pathway, and the planned assertion "neonates must not clear faster than adults" must be per drug and on a total (not per kg) basis, with fentanyl handled explicitly.
- **Lipophilic drugs**: one remifentanil model found volume deviating from linear weight scaling at large body sizes. Consider lean body mass for fentanyl, rocuronium and similar, flagged as an open choice.

### 9.2 Model-structure decisions the evidence forces

| drug | what the literature says | decision to make |
|---|---|---|
| epinephrine | Pediatric population PK (Oualha 2014) fit **one compartment**, linear, Vd fixed to circulating blood volume, CL scaled with weight^0.75. Adult CL reported about 78 to 145 mL/kg/min (about 5 to 10 L/min at 70 kg) versus engine 2.4 L/min. Effective IV half-life under 5 minutes. No ke0 or EC50 published. | Collapse to one compartment (or a degenerate second), raise CL toward the published range, and keep `keo` as a documented calibration choice since none is published. |
| norepinephrine | Pediatric population PK fit **one compartment**, CL and endogenous production both scale with weight^0.75. Adult label: Vd 8.8 L, CL 3.1 L/min, half-life about 2.4 min (engine CL is 0.8 L/min). A real PD anchor exists: Emax on MAP of 32 mmHg (3 or fewer organ dysfunctions) versus 12 mmHg (4 or more). | One compartment, CL about 3.1 L/min. The Emax figure gives the first real receptor-to-MAP anchor. Also needs a continuous-infusion input (mcg/kg/min), which the engine lacks. |
| atropine | **Nonlinear** after IV 0.5 to 4 mg (saturable protein binding, about 44% over 2 to 20 mcg/mL). Half-life 2 to 4 h (engine terminal 46 min). Half-life more than doubled in children under 2 years. IM peaks about 30 min and is perfusion dependent. No published ke0 or EC50. | Decide whether to model saturable binding or accept a linear approximation with a documented range. Fix the half-life. Add the under-2-years prolongation through the maturation term. |
| naloxone | No reliable two-compartment split. Vd 320 to 482 L (engine 21 L), CL 3 to 4 L/min (engine 1.18 L/min), exceeds hepatic blood flow, so extrahepatic metabolism. Half-life about 60 to 74 min adult, about 3.1 h in neonates (immature glucuronidation). | Large correction to `v1` and CL. The Ki shift (`NALOXONE_KI`) needs its own source. Re-fit `keo` and the reversal timing tests after changing volumes. |
| adenosine | Clearance is **saturable** (CL fell from about 10.7 to 4.14 L/min as dose rose), Vd 8 to 13 L, half-life 0.6 to 1.9 min (under 10 s in whole blood), no hepatic or renal dependence. Pediatric 0.05 to 0.1 mg/kg, max 0.3 mg/kg. | If promoted from a curve drug, it is a Michaelis-Menten case, with no maturation term needed. |
| fentanyl | Vd about 4 L/kg in one review; ICU infusion Vd 14 to 25 L/kg with CL 12 to 13 mL/min/kg; adult mean half-life about 317 min; t1/2 ke0 about 6 min. | **Suspect:** the ICU 14 to 25 L/kg looks like a steady-state infusion artifact (large peripheral loading), not a bolus-relevant Vc. Do not use it for `v1`. Confirm Vc and the three-compartment split in a primary paper. |
| morphine | t1/2 ke0 about 2 to 3 h (range 1.6 to 4.8 h); M6G active with t1/2 about 7 h. | Consistent with the existing note that morphine ke0 is unsettled. Leave `keo` as an effect-matched calibration. M6G and renal accumulation is the real missing mechanism. |
| midazolam | Vd 1 to 3.1 L/kg, t1/2 1.8 to 6.4 h, CYP3A4, hydroxylated metabolites renally cleared, inotropes reduce CL about 33%. | Engine v1 0.21 L/kg is well under the literature Vd per kg; confirm Vc versus Vss. |
| ketamine | Vd about 2.3 L/kg, N-dealkylation to active norketamine, t1/2 about 2.5 h. | Engine v1 0.57 L/kg is a central volume; check against Vss. |

### 9.3 Corrections to my own leads in section 3

- **Naloxone**: I called Vc 21 L and CL 1.18 L/min "plausible". The retrieved literature says Vd 320 to 482 L and CL 3 to 4 L/min. The engine is off by roughly an order of magnitude in volume.
- **Norepinephrine**: confirmed low (0.8 vs 3.1 L/min).
- **Epinephrine**: engine CL 2.4 L/min is low against about 5 to 10 L/min.
- **Atropine**: I called Vc and CL plausible; the terminal half-life (46 min) is well below the reported 2 to 4 h.

### 9.4 Still missing (next literature passes)

1. Primary-paper Vc, Vss, CL, three-compartment parameters for fentanyl, ketamine, rocuronium, etomidate, midazolam.
2. Lidocaine, diltiazem, metoprolol, amiodarone (the engine values that looked implausible; none were covered).
3. A published PMA50 and Hill n for each elimination pathway used: CYP3A4 (midazolam, fentanyl), glucuronidation (morphine, naloxone), renal GFR (atropine), CYP2D6 (metoprolol), and plasma esterase or other routes for rocuronium and etomidate.
4. Effect-site ke0 and EC50 for the endpoints the engine uses. Epinephrine, norepinephrine, atropine and naloxone have essentially none published, so those `keo` values remain documented calibrations rather than literature values.
5. Calcium, dextrose, vasopressin, magnesium, and the other curve-model promotion candidates in section 4.

### 9.5 Suggested next literature request

Run the same extraction for lidocaine, diltiazem, metoprolol and amiodarone, then fentanyl, ketamine, midazolam and rocuronium with a request for primary-paper Vc, Vss, three-compartment parameters, CL, and the maturation function used in each pediatric model.
