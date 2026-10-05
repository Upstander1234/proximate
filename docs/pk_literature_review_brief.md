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

## 10. Second OpenEvidence pass (2026-10-04): lidocaine, diltiazem, metoprolol, amiodarone

Same caveat as section 9: secondary summaries of primary papers and labels, to be confirmed in the sources before values enter `PK_PARAMS`. Sources cited by OpenEvidence: Foong 2024 (lidocaine adult population PK systematic review), Finholt 1986 (lidocaine children vs adults), FDA labels (diltiazem, metoprolol), Lehnert 2022 and Dallefeld 2018 (amiodarone pediatric population PK), Batra 2024 (AHA/PACES neonatal arrhythmia statement).

### 10.1 Engine versus literature (70 kg adult; my arithmetic from the quoted per-kg figures)

| drug | engine now | literature | factor |
|---|---|---|---|
| lidocaine v1 | 3 L | V1 0.16 L/kg adults (Finholt, about 11 L); 0.33 to 1.15 L/kg across adult population studies (Foong, about 23 to 80 L) | about 4 to 25x too small |
| lidocaine CL | 0.03 L/min | 9.8 mL/kg/min (Finholt, about 0.69 L/min); 0.45 to 1.18 L/h/kg (Foong, about 0.5 to 1.4 L/min) | about 17 to 46x too small |
| diltiazem Vd | 5 L (v1) | 305 to 391 L (label) | about 60 to 80x |
| diltiazem CL | 0.25 L/min | about 65 L/h, 1.08 L/min (label); falls to 48 L/h at higher infusion rates | about 4x |
| metoprolol Vd | 4 L (v1) | 3.2 to 5.6 L/kg, about 224 to 392 L | about 55 to 100x |
| metoprolol t1/2 | 141 min terminal | 3 to 4 h; 7 to 9 h in CYP2D6 poor metabolizers | close |
| amiodarone CL | 0.05 L/min (3 L/h) | 6.32 L/h (Lehnert, 70 kg scaled) | about 2x |
| amiodarone V | 10 L central | V 167 L central, 3930 L peripheral (Lehnert) | about 17x central, huge peripheral |

An important consequence for lidocaine: with the engine's 3 L central volume, a 100 mg IV bolus peaks near 33 mg/L, which is already above the seizure threshold the engine uses (10 mg/L). The `lidocaineOverdose` and `lidocaineBlock` calibrations were tuned on top of that small volume. Changing `v1` changes where every lidocaine toxicity threshold lands, so those conditions and their assertions must be re-fit together with the PK change.

### 10.2 Lidocaine

- Two-compartment, adult (Finholt): t1/2 alpha 3.6 min, t1/2 beta 43 min, V1 0.16 L/kg, Vd area 0.71 L/kg, CL 9.8 mL/kg/min. Children 0.5 to 3 years: t1/2 alpha 3.2 min, t1/2 beta 58 min, V1 0.22 L/kg, Vd area 1.1 L/kg, CL 11.1 mL/kg/min. No significant difference between children older than 6 months and adults, so size scaling is enough above about 6 months (maturation term only needed below that).
- Caveats: Finholt studied patients under general anesthesia in 1986, small groups; Foong's adult ranges are wider than Finholt's point values. Pick the model structure by checking the primary paper.
- Flow-limited (hepatic extraction above 0.7): clearance should depend on hepatic blood flow, so it falls in low cardiac output and heart failure. This supports replacing the crude flow factor with a well-stirred model for lidocaine.
- Binding to alpha-1 acid glycoprotein (60 to 80%), which rises in acute MI and lowers free fraction effects on Vd and CL. Infusions over 24 h lower CL through MEGX competition. MEGX is active.
- Not retrieved: therapeutic and toxic plasma ranges (needed to anchor the engine's 10 and 18 mg/L thresholds), IM absorption kinetics for the hematoma block.

### 10.3 Diltiazem

- Label: Vd about 305 to 391 L, CL about 65 L/h, t1/2 about 3.4 h. Clearance is nonlinear (64 to 48 L/h as infusion rate rises).
- A usable PD anchor (sigmoidal Emax for rate control): about 80 ng/mL for a 20% heart rate decrease, 130 ng/mL for 30%, 300 ng/mL for 40%. PR prolongation also follows a sigmoidal Emax. BP and HR in normal volunteers did not correlate with concentration.
- Binding about 70 to 80% (AAG about 40%, albumin about 30%). Renal failure does not change disposition. Cirrhosis lowers CL and prolongs t1/2. CYP3A4.
- Gap: no pediatric or neonatal population model retrieved.
- Engine note: `ec50` is 0.1 mg/L (100 ng/mL). That sits inside the label's 80 to 130 ng/mL band for a 20 to 30% rate effect, so `ec50` may already be roughly right even though `v1` and CL are not.

### 10.4 Metoprolol

- Labels: Vd 3.2 to 5.6 L/kg, t1/2 3 to 4 h (7 to 9 h in CYP2D6 poor metabolizers), about 10% renal unchanged after IV, essentially hepatic (CYP2D6).
- Pediatric (120 hypertensive children 6 to 17 years): PK similar to adults, apparent oral clearance rose linearly with body weight, no effect of age, sex, race or ideal body weight. Not studied below 6 years, so there is no anchor for infants or neonates.
- CYP2D6 phenotype is the dominant covariate (poor metabolizers about 8% of Caucasians, about 2% of others, several-fold higher levels). Optional: model as a patient trait the way `baroreflexGain` and similar traits are done.
- No compartmental model was retrieved, only label values.

### 10.5 Amiodarone

- Lehnert 2022 (pediatric, two-compartment, scaled to 70 kg): CL 6.32 L/h, Q 7.14 L/h, V 167 L, V peripheral 3930 L, oral F 0.362, terminal t1/2 34 days (parent) and 14.5 days (desethylamiodarone, DEA).
- Infants (Dallefeld 2018 and the AHA/PACES statement): CL 0.25 L/kg/h, Vss 93 L/kg, terminal t1/2 266 h, versus adults CL 0.06 to 0.22 L/kg/h, Vss 10 to 87 L/kg, t1/2 50 to 60 days.
- Like fentanyl, amiodarone clears faster per kg in infants and has a larger weight-normalized Vss, which breaks the simple "neonates clear slower" rule. Clinically visible time course in a 15 to 30 minute call is dominated by the acute redistribution phase, not the terminal phase, so the three-compartment alpha behavior matters more than the weeks-long half-life.
- DEA metabolite has its own kinetics. A gradual 30 to 60 minute load is advised in neonates (hypotension risk).
- Engine note: the engine's `k21` of 0.01 with `k12` 2 already encodes a huge peripheral volume (V2 = v1 * k12 / k21 = 2000 L), so its Vss is of the right order but the central volume and CL are low.

### 10.6 Scaling equation confirmed (four sources agree)

`CL_i = CL_STD * (WT_i/70)^0.75 * PMA^Hill / (PMA50^Hill + PMA^Hill)`, volumes at exponent 1.0, PMA in weeks. Fixing the exponent at 0.75 is advocated especially when the weight range is narrow. Germovsek 2019 found no published size or age model fit better than this standard form. Above about 2 years the maturation term is near 1. Per-drug PMA50 and Hill values were NOT retrieved for these four.

### 10.7 What this means for the rework

1. These four need a re-fit of `ec50` and `keo` along with `v1` and CL so the bedside time course survives. Lidocaine in particular must be re-fit together with its overdose condition and the hematoma-block calibration.
2. Diltiazem and lidocaine justify the first two nonlinear or flow-limited clearance experiments (diltiazem nonlinear CL, lidocaine well-stirred hepatic extraction). Both stay optional: a linear CL at a documented typical value is an acceptable first step.
3. Maturation must be per pathway and per total clearance, not a global factor. Amiodarone and fentanyl are explicit counterexamples to a "neonates clear slower" rule.
4. Metoprolol has no data below 6 years. For younger children the rework must either extrapolate with the standard equation and say so, or block weight-scaled dosing for that group.

### 10.8 Next literature request

Pathway-specific PMA50 and Hill values for CYP1A2 and CYP3A4 (lidocaine, diltiazem, amiodarone, midazolam, fentanyl), CYP2D6 (metoprolol), UGT glucuronidation (morphine, naloxone), and GFR maturation (atropine, renally cleared fractions). Also still outstanding from section 9.4: primary-paper Vc, Vss, CL and maturation for fentanyl, ketamine, midazolam, rocuronium, etomidate, plus lidocaine therapeutic and toxic plasma ranges.

## 11. Third OpenEvidence pass (2026-10-04): maturation constants, lidocaine thresholds, sedative disposition

Same caveat as sections 9 and 10: secondary summaries; confirm in the primary papers before values enter `PK_PARAMS`. Primary sources named: Salem 2014 (CYP1A2 and CYP3A4 ontogeny), Rhodin 2009 (GFR), Stevens 2008 (CYP2D6), Badee 2019 (UGT), Wu 2022 and Rzasa Lynn 2024 (neonatal fentanyl), Kamp 2020 and Peltoniemi 2016 (ketamine), Lin 2012 and Valk 2021 (etomidate), FDA rocuronium label, plus the lidocaine sources listed in 11.2.

### 11.1 Pathway maturation functions (fraction of adult activity, PMA in weeks)

Form: `PMA^Hill / (PMA50^Hill + PMA^Hill)`.

| Pathway | Drugs in this engine | PMA50 (wk) | Hill | Notes |
|---|---|---|---|---|
| CYP3A4 | midazolam, fentanyl, diltiazem, amiodarone, lidocaine (minor) | 108 | 3.9 | Asymptote 1.0. Derived in vivo from midazolam clearance. |
| CYP1A2 | lidocaine (major) | 54.6 | 5.7 | Asymptote 1.6, i.e. it overshoots adult. Below 196 wk: `1.6 * PMA^5.7/(54.6^5.7 + PMA^5.7)`. Above 196 wk: `0.8 * exp(-0.001*(PMA-196)) + 0.8`. |
| GFR | atropine (renal fraction), renally cleared metabolites | 47.7 | 3.40 | Rhodin. Adult 121.2 mL/min per 70 kg. |
| CYP2D6 | metoprolol | none published | none | About 2% adult at 24 h, about 25% by 7 to 28 days (preterm), then genotype dependent. Handle as size scaling only plus a CYP2D6 phenotype trait. |
| UGT | morphine (UGT2B7), naloxone | none published | none | Isoform specific. At birth 0 to 23% of adult. UGT2B7 reaches adult activity anywhere from about 2 months to 14 years depending on the study. Present as a range. |

Engine values at selected ages, computed from those equations (my arithmetic):

| Age | PMA (wk) | CYP3A4 | CYP1A2 | GFR |
|---|---|---|---|---|
| term birth | 40 | 0.020 | 0.232 | 0.355 |
| 1 month | 44 | 0.029 | 0.362 | 0.432 |
| 3 months | 53 | 0.059 | 0.732 | 0.589 |
| 6 months | 66 | 0.128 | 1.195 | 0.751 |
| 1 year | 92 | 0.349 | 1.522 | 0.903 |
| 2 years | 144 | 0.754 | 1.594 | 0.977 |
| about 3.8 years | 196 | 0.911 | 1.600 | 0.992 |
| 10 years | 560 | 0.998 | 1.356 | 1.000 |
| 25 years | 1340 | 1.000 | 1.055 | 1.000 |

Things to check or handle:
- **Adult normalization.** The CYP1A2 function gives 1.055 at 25 years, not 1.0. To keep phase 1 bit-for-bit at adult values, divide every maturation term by its own value at the adult reference age (or clamp to 1.0 at and above the adult reference PMA), and say which one in the code comment.
- **CYP3A4 versus the AHA/PACES statement.** The Salem sigmoid gives about 3% of adult CYP3A4 at one month, but the AHA/PACES neonatal statement (via the same pass) says CYP3A reaches 30 to 40% of adult by the end of the first month. That is roughly a 10x disagreement. Possible reasons: different quantity (CYP3A4 versus total CYP3A including fetal CYP3A7), or an in vivo midazolam-derived function versus an expression measurement. Resolve this in the primary papers before coding the neonatal range for midazolam, fentanyl, and amiodarone.
- **GFR checks out**: 0.355 at term versus the statement's about 33%, 0.90 at 1 year versus the stated 90%.
- **Do not invent CYP2D6 or UGT numbers.** For metoprolol and morphine/naloxone use size scaling only with an explicit "no neonatal anchor" flag, as in sections 9 and 10. Metoprolol has no data below 6 years anyway.

### 11.2 Lidocaine plasma thresholds (all in ug/mL, which equals the engine's mg/L)

| Threshold | Reported | Source type |
|---|---|---|
| Antiarrhythmic therapeutic | 1.5 to 6 | FDA label |
| Perioperative infusion therapeutic | 1.4 to 6.0 | Beaussier 2018 review |
| Pediatric infusion therapeutic | 2.5 to 3.5 | Hall 2021 review |
| Earliest toxicity | as low as 5 | pediatric review |
| CNS symptoms (slurred speech, tinnitus) | above 6 | prospective study |
| Seizure or loss of consciousness | about 15 (about 8 mg/kg); loss of consciousness above 10 | Beaussier, prospective study |
| Cardiovascular toxicity | above 21 (Beaussier); 15 to 20 elsewhere | review, prospective |

- The engine's seizure threshold of 10 mg/L is at the upper end of the CNS-symptom range and below the frank-seizure figure of about 15. The cardiac threshold of 18 mg/L falls inside the 15 to 21 band. Neither is wrong; they are single points inside wide ranges.
- **Protein binding changes the picture**: 60 to 80% bound at 1 to 4 ug/mL, falling as concentration rises, and AAG dependent. Free-drug toxicity at a given total concentration rises when AAG is low (hypoproteinemia) and falls when AAG is high (acute MI).
- **Flow limitation**: hepatic extraction about 0.7, so clearance can halve or more in heart failure or shock.
- **Design choice for the rework**: keep two thresholds but pick values inside the published ranges, state the chosen point and the range in the comment, and re-fit the lidocaine overdose and hematoma-block conditions after the volume change (section 10.1).

### 11.3 Sedative and paralytic disposition (70 kg standardized where reported)

| Drug | Vc | Vss / Vperiph | CL | Model | Pediatric or neonatal signal |
|---|---|---|---|---|---|
| fentanyl | scaled, nonlinear | neonatal Vd median 12 L/kg (adult 3.2 to 5.9) | best fit with body weight plus postnatal age; 2.7x rise from day 1 to 7; supra-allometric exponent above 0.75 | 2 to 3 compartments, flow limited (CYP3A4 and CYP3A7 plus hepatic blood flow) | clearance higher per kg in infants; use body weight plus postnatal age, not PMA alone |
| ketamine | 38.7 L | Vss 160 to 550 L; Vperiph 102 L | 79 to 90 L/h (about liver blood flow); meta-analysis 79 L/h | 2 compartments, linear (meta-analysis); flow limited | pediatric CL comparable to adult when allometrically scaled; norketamine active, t1/2 1.1 h |
| midazolam | not retrieved | Vd 1 to 3.1 L/kg | CYP3A4 driven | 2 compartments | inotropes lower CL about 33%; alpha-hydroxy metabolite renally cleared |
| rocuronium | not retrieved | Vd 0.42 L/kg (neonate) falling to 0.18 L/kg (adolescent) | 0.29 to 0.35 L/kg/h, about flat across ages | compartmental (label) | neonatal t1/2 beta longer (1.1 h versus 0.7 to 0.8 h) because of the larger Vd, not lower CL |
| etomidate | 9.51 L (4-year standard); adult Vc 4.5 L/kg | V2 11.0 L, V3 79.2 L (4-year std); adult Vperiph 74.9 L/kg | Cl1 1.50, Cl2 1.95, Cl3 1.23 L/min (4-year std); adult 9.9 to 25 mL/min/kg | 3 compartments, allometric; hepatic esterase, extraction ratio 0.5 to 0.9 | younger children have higher size-adjusted CL and V, so weight-based dosing underdoses small children |

Observations (confirm before relying on them):
- **Rocuronium is the cleanest "volume, not clearance" case**: do not put a maturation term on its clearance; put the neonatal effect in the volume.
- **Fentanyl and etomidate both show supra-allometric behavior** (younger means higher size-adjusted clearance), like amiodarone. They need the counterexample handling, not the plain "neonates clear slower" assertion.
- **Ketamine's clearance is about hepatic blood flow**, a well-stirred flow-limited candidate like lidocaine. Shock should lower it.
- **Internal inconsistency in the pasted summary**: ketamine CL is given as 79 to 90 L/h per 70 kg but the engine's CL is 1.2 L/min (72 L/h). That is close, so ketamine CL may not need much change, while its Vc (38.7 L versus the engine's 40 L) is also close. Ketamine may be one of the few drugs already near the literature.
- **Etomidate adult Vc 4.5 L/kg** looks like a volume per kg of the whole body; read the primary paper to see whether that is Vc or Vss.
- Midazolam and rocuronium Vc values were not retrieved.

### 11.4 Engineering consequences

1. Hard-code CYP3A4, CYP1A2 and GFR sigmoids now, normalized to their adult reference. Flag CYP2D6 and UGT as size scaling only.
2. Do not apply a maturation term to rocuronium clearance. Handle its neonatal prolongation through volume.
3. Fentanyl needs body weight plus postnatal age rather than PMA alone.
4. Lidocaine and ketamine are flow-limited. A well-stirred hepatic model is the principled treatment; hepatic blood flow maturation data are the missing input.
5. Per-drug minimum evidence needed before coding: an unresolved CYP3A4 neonatal range, midazolam and rocuronium Vc, and etomidate's Vc versus Vss.

### 11.5 Next literature request

Hepatic blood flow in neonates and infants as a function of age and weight, and well-stirred model parameters (extraction ratio, unbound fraction, intrinsic clearance) for fentanyl, ketamine, lidocaine and morphine. Also resolve the CYP3A4 neonatal discrepancy in 11.1 and extract midazolam and rocuronium Vc.

## 12. Fourth OpenEvidence pass (2026-10-04): hepatic blood flow, well-stirred parameters, CYP3A4 discrepancy, midazolam and rocuronium volumes

Same caveat as before: secondary summaries. The pasted rocuronium paragraph was cut off mid-sentence, so rocuronium still needs the label table pulled directly. Primary sources named: Chang 2021 (pediatric organ weights and blood flows), Wynne 1989 and Soejima 2022 (liver blood flow and age), Walther 1985 (neonatal cardiac output), Mahdy 2025 (neonatal fentanyl PBPK), Bjorkman 2000 (clearance versus hepatic blood flow), Bullingham 1984 (morphine extraction), Pang 2019 and 2024 and Dong 2018 (hepatic clearance models), de Wildt 1999 and Zane 2018 (CYP3A ontogeny), Kos 2020 (midazolam maturation), FDA midazolam and rocuronium labels.

### 12.1 Hepatic blood flow (the missing input for flow-limited clearance)

- **Source to adopt:** Chang 2021 supplies continuous equations for organ weight and organ blood flow from 0 to 20 years, sex specific, validated against Simcyp and PK-Sim. Use it as the age and weight backbone for hepatic blood flow `Q_H`.
- **Adult anchor:** about 0.8 to 1.2 L/min (about 20 mL/min/kg at 70 kg), roughly 25% of cardiac output, one third hepatic artery and two thirds portal vein.
- **Elderly:** apparent liver blood flow and liver volume fall with age (about 0.3 to 1.5% per year after 40; the 91-year value is about half the 24-year value).
- **Neonates:** term cardiac output is about 240 to 250 mL/min/kg (limits about 200 to 325). The hepatic arterial fraction rises about 18-fold at birth as the ductus venosus closes and the portal contribution goes from about 20 to 25% to about 75%. The neonatal liver is perfused differently for the first days.
- **Engine fit:** the engine already tracks `co / _restCo`. A well-stirred term would use `Q_H = fraction_of_CO(age) * CO`, so shock lowers clearance through `Q_H` and not through a crude min() scaler.

### 12.2 Well-stirred inputs for the four high-extraction drugs

Well-stirred form: `CL_h = Q_H * fu * CLint / (Q_H + fu * CLint)`.

| drug | extraction ratio | unbound fraction | binding | note |
|---|---|---|---|---|
| fentanyl | about 0.8 to 1.0 | about 0.16 | AAG and albumin | CYP3A4, 3A5, 3A7 |
| ketamine | about 0.9 | the pasted value is ambiguous (about 0.5, with "10 to 30% bound in some refs"); resolve in the primary paper | albumin | CL about equals hepatic blood flow, some extrahepatic clearance |
| lidocaine | above 0.7 | 0.2 to 0.4 (60 to 80% bound at 1 to 4 mg/L) | AAG, concentration dependent | CYP1A2 and CYP3A4 |
| morphine | rises with portal concentration, from about 0 toward a plateau | about 0.65 to 0.80 | albumin | not a fixed-ER drug; the flow-limited assumption is weakest here |

Cautions:
- The well-stirred model systematically under-predicts clearance for high-extraction drugs, and 2024 analyses recommend parallel-tube or dispersion models above ER 0.7. For a real-time simulator the well-stirred form is still the pragmatic choice (closed form, cheap), but `CLint` must be an empirical scale-up fitted to observed CL, not an in-vitro value.
- The lidocaine data behind the classic well-stirred fit have been re-analyzed and challenged (Dong 2018).
- Morphine's extraction ratio is not constant, so a fixed-ER term misbehaves at the low concentrations where morphine acts. Treat morphine as a documented exception, probably with a simpler linear clearance.
- **Update to my earlier lead on fentanyl clearance:** the pasted table gives "79 to 87" (units presumably L/h, about 1.3 to 1.45 L/min) next to "liver blood flow". That is shared with ketamine in the source text, so I cannot tell which drug it belongs to. If it is fentanyl's, the engine's 0.13 L/min is about 10x low, not 4 to 8x. Confirm per drug in the primary papers.

### 12.3 The CYP3A4 neonatal discrepancy, resolved

The two numbers measure different things.
- **Salem, about 3% of adult at one month:** an in-vivo, CYP3A4-specific activity sigmoid (PMA50 108 weeks, Hill 3.9). de Wildt 1999 agrees CYP3A4 itself is very low before birth and reaches about 50% of adult only between 6 and 12 months.
- **AHA/PACES, 30 to 40% of adult by one month:** total CYP3A, dominated in the neonate by the fetal isoform CYP3A7 (most abundant CYP at birth, peaks in week 1, then declines). CYP3A7 has more than 10-fold lower catalytic rate than CYP3A4 for most substrates, so it adds protein but modest function (Zane 2018 documents the 3A7 to 3A4 switch and notes functional activity above what protein alone predicts).
- **Drug-specific in-vivo maturation is better for the engine.** Kos 2020 (critically ill children 0 to 130 weeks PMA) found midazolam clearance reaches 50% of adult at PMA 45.9 weeks, more than twice as fast as the generic 108-week CYP3A4 sigmoid. Use drug-specific values where a pediatric population model exists and the generic sigmoid only as a fallback. Hill exponent for the midazolam function was not reported in the pasted text.

### 12.4 Midazolam and rocuronium

- **Midazolam (Kos 2020, two-compartment, scaled to 70 kg):** central volume 5.71 L, peripheral 39.8 L, CL 8.52 L/h (0.142 L/min), intercompartmental CL 25.5 L/h. Engine now: v1 15 L, CL 0.30 L/min, so the engine's central volume is about 2.6x larger and its CL about 2x larger than Kos.
  - Caveats: the Kos population is critically ill children with bronchiolitis, so its CL is probably lower than a healthy adult's (adult label and other adult studies report a higher CL). Treat Kos as the maturation anchor and take adult CL from an adult source.
  - Total Vd: adult 1.0 to 3.1 L/kg (higher in females, elderly, obesity); children 6 months to 16 years 1.24 to 2.02 L/kg; children about 1.7 L/kg; preterm about 1.1 L/kg. Vd per kg is higher in children than adults, so do not scale the adult per-kg volume down for infants. A PBPK model that fixed Vd at 0.88 L/kg under-predicted pediatric exposure. 97% protein bound (albumin) over 1 year of age.
- **Rocuronium:** the label gives age-banded Vd and CL; the first values quoted are Vd 0.42 L/kg in neonates (consistent with section 11.3). Pull the full band table directly (cut off in the paste). Keep the maturation term on volume only.

### 12.5 Engineering consequences

1. Put hepatic blood flow `Q_H` on the patient (from Chang 2021 equations, as a fraction of cardiac output) and compute clearance for fentanyl, ketamine and lidocaine through a well-stirred term with an empirical `CLint`. Check against the adult `CL ~ Q_H` identity at 70 kg and normal cardiac output.
2. Morphine stays on a simpler clearance. Its extraction is concentration dependent.
3. Midazolam, fentanyl, diltiazem and amiodarone: use a drug-specific maturation function where one exists (midazolam PMA50 45.9 weeks) and the generic CYP3A4 sigmoid otherwise. Fentanyl needs postnatal age plus body weight (section 11.3).
4. Adult normalization still applies to every maturation term (section 11.1).
5. Every one of these values must be confirmed in primary papers before it enters `PK_PARAMS`.

### 12.6 Next literature request (the one offered)

Neonatal and infant population PK for ketamine and etomidate, to check whether their clearance tracks hepatic blood flow at the youngest ages. Also: the full rocuronium age-band table from the label, the Hill exponent for the Kos midazolam maturation function, and the adult fentanyl CL and extraction ratio from a primary adult paper.

## 13. Fifth OpenEvidence pass (2026-10-04): ketamine, etomidate, rocuronium, midazolam maturation, adult fentanyl

Same caveat as before: secondary summaries. Primary sources named: Hornik 2018 (pediatric ketamine IM/IV), Kamp 2020 (ketamine meta-analysis), Peltoniemi 2016, Mion 2013, Valk and Struys 2021 (etomidate review; Lin, Su, Shen models), Zheng 2025 (etomidate hazards), FDA rocuronium label, Kos 2020, Zuppa 2019, Ince 2013, Johnson 2023 (midazolam), Choi 2016 (ICU fentanyl), Beaucage-Charron 2025, Mahdy 2025 (fentanyl PBPK).

### 13.1 Ketamine

- **Structure to code (Hornik 2018, 113 children, median 3.3 years, range 0.02 to 17.6 years, 2.4 to 176 kg):** two-compartment, first-order IM absorption, allometric exponent 1 for central and peripheral volume, 0.75 for clearance and intercompartmental clearance, IM bioavailability 41%. Simulations support 2 mg/kg IV and 6 to 8 mg/kg IM (age dependent) for procedures up to about 20 minutes, which gives a bedside-behavior check for the rework.
- **Adult anchors:** Vss 252 L/70 kg (CI 200 to 304) and CL 79 L/h/70 kg (CI 69 to 90) from the Kamp meta-analysis of 18 studies; Vc 38.7 L, V peripheral 102 L, Q 215 L/h from Peltoniemi. Norketamine (active) t1/2 1.1 h versus ketamine 2.1 h.
- **Maturation:** clearance is reduced in the first 3 months of life (immature hepatic transformation and renal excretion), while volume is comparable to older children. Above infancy children show higher weight-normalized clearance (16.8 mL/kg/min) and a shorter half-life (about 100 min) than adults. The meta-analysis found no significant covariate effect once parameters are allometrically scaled. So a maturation term is only needed for the youngest infants, and size scaling is enough above about 3 months.
- **Versus the engine:** engine `v1` 40 L and CL 1.2 L/min (72 L/h) are close to the literature (38.7 L, 79 L/h). The engine's implied Vss, `v1 * (1 + k12/k21)` = 40 * 3 = 120 L, is about half the literature's 252 L. So ketamine needs less rework than the other drugs; the main gap is the peripheral volume and the norketamine metabolite.

### 13.2 Etomidate (needs its own maturation pathway)

- Etomidate is hydrolyzed by **hepatic carboxylesterases (CES), not CYP**. About 75% protein bound, total plasma CL 15 to 20 mL/kg/min, metabolic half-life 2 to 5 h. Its ontogeny follows carboxylesterase development, which is a fifth pathway beyond CYP3A4, CYP2D6, UGT and GFR. Do not force it onto an existing sigmoid.
- Three pediatric population models exist, with large between-study variability:
  - **Lin:** children over 6 months, elective surgery, three-compartment allometric. Age was the most significant covariate, and older children had smaller size-adjusted clearance and volumes (same "younger clears faster per kg" pattern as fentanyl and amiodarone).
  - **Su:** neonates and infants.
  - **Shen:** neonates and infants, three-compartment allometric; tetralogy of Fallot lowered clearance.
  - Lin reports almost 3-fold higher clearance than Su, and Su cautions that Lin's older-child model may be inappropriate for neonates and infants. Use Su or Shen for infants and Lin only above 6 months. Adult population PK is scarce.
- The earlier "adult Vc 4.5 L/kg" is consistent with a whole-body or Vss-per-kg figure, not a central volume; the pediatric models report much smaller central volumes.
- Not retrieved: the CES1 and CES2 ontogeny function itself.

### 13.2b Engine note for etomidate
The engine's `v1` is 8 L and CL 0.4 L/min. The 4-year standard model gave Cl1 1.50 L/min (section 11.3), so the engine CL looks low, but the pasted adult figure of 9.9 to 25 mL/kg/min (about 0.7 to 1.75 L/min) also exceeds the engine's value. Confirm per drug.

### 13.3 Rocuronium

The pasted age-band table was cut off again ("Birth to ..."), so the table itself is still not retrieved. The text states the same conclusion as section 11.3: weight-normalized clearance is essentially flat at 0.29 to 0.35 L/kg/h across all ages, and Vd falls monotonically from 0.42 to 0.18 L/kg. The prolonged neonatal terminal half-life (1.1 h) is a pure volume effect. **Maturation belongs on volume only; rocuronium clearance gets none.** Pull the exact band values directly from the label.

### 13.4 Midazolam maturation: sources disagree on both half-point and form

- **Kos:** PMA50 45.9 weeks. The Hill coefficient was not in the retrieved text; read it from the primary paper.
- **Zuppa:** time to 50% mature clearance about 1.0 year postmenstrual age (about 52 weeks), close to Kos. Adult CL 0.61 L/min/70 kg (units worth confirming; the engine's CL is 0.30 L/min and Kos's scaled CL is 0.142 L/min, which was a critically ill population). Adds UGT2B7 genotype and ALT/renal covariates.
- **Ince:** no Hill sigmoid. An allometric exponent that itself varies with weight (0.84 at 0.77 kg preterm down to 0.44 at 89 kg adult), capturing the fastest maturation in the youngest range.
- **Johnson (PBPK):** the Upreti CYP3A4 ontogeny outperformed Salem (bias 0.14 versus 0.69) for midazolam. Salem over-predicts midazolam clearance in children.
- **Consequence:** there is no single published midazolam Hill exponent to drop in. Options: take Kos's full sigmoid from the primary paper, or adopt Ince's weight-varying exponent. For the generic CYP3A4 fallback prefer Upreti over Salem. This revises the earlier plan (sections 11 and 12) that used Salem as the generic CYP3A4 function. Present it as a model-structure disagreement and do not average half-points.

### 13.5 Adult fentanyl

- **Choi 2016 (ICU, 337 patients, reference 92 kg, no severe liver disease or heart failure):** two-compartment, CL 35 L/h (CI 32 to 39), about 0.58 L/min, Q 55 L/h, V1 203 L, V2 523 L. Severe liver disease, heart failure and weight are the dominant covariates (supports flow-limited clearance). Allometrically toward 70 kg this is roughly 0.45 to 0.5 L/min.
- **Non-ICU infusion reports:** 12 to 13 mL/kg/min, about 0.84 to 0.91 L/min at 70 kg.
- **Result:** adult CL about 0.5 to 0.9 L/min. The engine's 0.13 L/min is about 4 to 7x low (my earlier "10x" came from an ambiguous source line, and the pasted "79 to 87" was ketamine's, in L/h).
- **Volumes:** the large V1 (203 L) and infusion-based Vd of 14 to 25 L/kg are steady-state artifacts. Do not use them for bolus central volume. A bolus-appropriate Vc still needs a source.
- **Extraction ratio:** no numeric human ER was retrieved. The PBPK analysis attributes about 59.7% of the dose to CYP3A, 31.6% to a nonspecific hepatic pathway and 8.7% to unchanged renal excretion (about 91% hepatic), consistent with a high-extraction, flow-limited drug. Heart failure and liver disease covariates corroborate flow dependence. A numeric ER for the well-stirred term remains a gap.

### 13.6 Updated engineering consequences

1. Ketamine: two-compartment allometric (Hornik), IM F 41%, maturation limited to the first 3 months. Smallest rework of the group.
2. Etomidate: carboxylesterase ontogeny as a fifth pathway. Not CYP.
3. Rocuronium: maturation on volume only, no clearance maturation.
4. Midazolam: drug-specific maturation (Kos sigmoid after reading its Hill, or Ince's weight-varying exponent); Upreti not Salem as the generic fallback.
5. Fentanyl: raise adult CL toward 0.5 to 0.9 L/min; use bolus-appropriate volumes; flow-limited clearance supported by covariates; postnatal age plus body weight for neonates (section 11.3).

### 13.7 Remaining gaps and next request

- Midazolam maturation Hill exponent (primary Kos paper), a numeric adult fentanyl extraction ratio, a bolus-appropriate fentanyl Vc, the rocuronium label age-band table, and CES1/CES2 ontogeny for etomidate.
- Next request offered: carboxylesterase (CES1 and CES2) ontogeny data to anchor etomidate's maturation.

## 14. Sixth literature pass: carboxylesterase ontogeny and etomidate

No published CES1/CES2 maturation sigmoid (PMA50 + Hill) exists. The data are age-banded protein abundance and activity with very large interindividual variability (up to ~100-fold protein, ~127-fold activity). Etomidate's relevant enzyme is CES1 (hepatic ester hydrolysis).

CES1 versus adult (Hines 2016, Shi 2011, Zhu 2009, Boberg 2017, Yang 2009):
- Fetal about 10%; birth to 3 weeks about 28 to 36% by abundance (Hines), about 10% by expression and activity (Shi, 1 to 31 d).
- 35 to 198 d about 50% (Shi); 3 weeks to 6 years near plateau; neonate about 19% overall (Boberg proteomics, 315 vs 1664 pmol/mg).
- CES2 matures more modestly: about 3-fold neonate to adult (neonate about 34%), mRNA surge about 2.7-fold between 1 and 2 months.
- Sharpest breakpoint: 3 weeks of age.

Encoding decision: piecewise age-band multiplier on the CES pathway (about 0.10 to 0.20 at birth to 3 weeks, about 0.5 at 1 to 6 months, about 1.0 by 6 years), explicitly flagged as engine-fitted. Boberg abundance data is the raw material if a continuous curve is wanted (precedent: Simcyp oseltamivir ontogeny).

Interaction with size scaling: Lin et al. found size-adjusted etomidate clearance higher in younger children above 6 months. CES immaturity dominates below about 3 months; supra-allometric size dominates above. The "neonates must not clear faster than adults" assertion should hold for etomidate in the first months.

Etomidate extraction ratio resolved (Valk and Struys 2021): ER 0.5 to 0.9, CL 9.9 to 25.0 mL/min/kg, t1/2 2.9 to 5.5 h, about 75% protein bound. Intermediate-to-high extraction, so partly hepatic-blood-flow dependent. Clearance term blends CES maturation, allometric size, and partial flow sensitivity. Still open: a true adult population PK model.

Next anchors offered: ke0 and EC50 (BIS/EEG) for the sedative-hypnotics.

## 15. Seventh literature pass: sedative-hypnotic effect-site anchors (ke0, EC50)

Etomidate (Kaneda 2011, n=18 volunteers, BIS and OAA/S, brief infusions):
- EC50 0.526 ug/mL (BIS), 0.554 (OAA/S); gamma 2.25 (BIS), 6.24 (OAA/S); t1/2ke0 1.55 min (ke0 about 0.447/min).
- Disposition: Vc 4.45 L TOTAL, Vp 74.9 L, CL 0.63 L/min, Q 3.16 L/min.
- Correction: the earlier "adult Vc 4.5 L/kg" was a mis-transcription of 4.45 L total (about 0.06 L/kg). The engine's v1 of 8 L is about 1.8x HIGH, not low.
- Caveat: values come from brief infusions. Do not mix with ABP-700 analog figures (EC50 1014 ng/mL, ke0 0.844/min).

Ketamine:
- BIS is the wrong PD endpoint. Ketamine raises BIS (0.5 mg/kg raised it from 40 to 63; Linassi 2024 shows paradoxical peak at CeK 0.2 to 0.5 ug/mL).
- Use EEG slow-wave (Sleigh 2019): hypnotic Ce50 about 1.64 ug/mL (recovery 1.06); equilibration half-time about 23 s (theta about 47 s).
- Engine ec50 1 mg/L and fast keo are consistent. Little PD rework needed.

Midazolam:
- Greenblatt EEG beta-band: EC50 31 ng/mL, Emax 16.3% over baseline; ke0 very rapid in the pooled fit but real counterclockwise hysteresis at 1-min infusion, so keep a finite keo.
- FDA label sedation band: at least 100 ng/mL gives at least 50% sedation probability; 200 ng/mL asleep. Engine ec50 0.1 mg/L matches the sedation endpoint; EEG endpoint is lower. Document which endpoint is scored.
- Pediatric (Flores-Perez, ages 2 to 17, BIS): clockwise hysteresis (time-dependent protein binding), so a plain effect compartment will not capture it; half the usual dose was adequate.

Fentanyl respiratory C50 is model-dependent and should be kept as documented disagreement:
- 2.3 ng/mL physiological CO2/controller model (van Lemmen 2025); 7.5 ng/mL simpler VE/end-tidal models; 0.42 ng/mL biophase Emax opioid-naive vs 1.82 ng/mL chronic users, a 4.3x tolerance shift (Algera 2021).
- Engine respEc50 2.3 ng/mL matches the physiological model. The 4.3x shift is usable for the respiratory tolerance layer.
- Pediatric fentanyl analgesia template (Cruzat 2024): allometric effect-compartment keo and Ce50; the numeric Ce50 was not retrieved.
- MacKenzie 2016: fentanyl effect-delay estimates are stable across the literature.

Rocuronium Ce50 is U-shaped by age (Saldien 2003, Wierda 1997):
- Ce50 ng/mL: infants 652 (Saldien) or 1200 (Wierda); children 1200; adults 954. Ce90: infants 1705, children 2035, adults 2230.
- Hill slope 5.7 infants vs 3.9 children. Vss 231 vs 165 mL/kg, CL 4.2 vs 6.7 mL/min/kg; time course after equipotent doses did not differ.
- Engine ec50 1.5 mg/L is within adult/child range; an age-dependent Ce50 (lower in infants) would fix infant potency.
- Label bedside check: neonatal T3 reappearance about 114 min at 0.6 mg/kg vs about 53 min in children.

Still open: pediatric fentanyl Ce50 numeric value; midazolam maturation Hill exponent. Next offered: effect-site PD anchors for the cardiovascular drugs (epinephrine, norepinephrine, atropine, antiarrhythmics).

### 14a. Open design task: engine-fitted CES1 maturation function

No published CES1/CES2 PMA50 + Hill exists, so we must design one ourselves (needed for etomidate, and for any later CES substrate).
- Inputs to fit: Boberg 2017 proteomics (continuous, 136 pediatric donors, neonate about 19% of adult for CES1), Hines 2016 age bands, Shi 2011 (about 10% at 1 to 31 d, about 50% at 35 to 198 d), Zhu 2009, Yang 2009.
- Required behavior: steep rise in the first 1 to 2 months, 3-week breakpoint, near-adult by about 6 years, asymptote 1.0 normalized to adult.
- Must be flagged in code as engine-fitted, not literature-reported, with the fit data and residuals in the comment.
- Must be combined with allometric size scaling and partial hepatic-flow sensitivity (ER 0.5 to 0.9), and pass the test that neonates never clear faster than adults in the first months.
- Decide: smooth sigmoid fit to Boberg points versus the simple piecewise bands. Record the choice and the measured fit.

## 16. Eighth literature pass: cardiovascular and antiarrhythmic PD anchors

Design finding: unlike the sedative-hypnotics, most of this group has no published effect-site ke0/EC50 Emax model. Endpoints are plasma thresholds (catecholamines), use-dependent or time-delayed tissue effects (amiodarone, atropine), or a flat concentration band (lidocaine). Only diltiazem and metoprolol have clean sigmoidal Emax models.

Diltiazem (Dias 1992 in AF/flutter; FDA label in volunteers):
- Sigmoidal Emax for HR reduction: EC50 110 +/- 84 ng/mL, Emax 52 +/- 17%. 20% reduction at 79-80 ng/mL, 30% at 130-172, 40% at 294-300.
- Engine ec50 0.1 mg/L (100 ng/mL) matches. No change needed to ec50; volume (Vd about 305-411 L) and CL (about 65 L/h) still need correction.
- HR and BP do not correlate with concentration in normal subjects (only in AF for rate, hypertensives for MAP); PR prolongation is also sigmoidal. Model rate control against the AF/tachycardia state. Peak hemodynamic effect 2 to 5 min.

Metoprolol (Abrahamsson 1990, pooled Emax for beta-1 blockade of exercise tachycardia):
- Emax 28% (95% CI 25-31), C50 105 nmol/L (CI 74-135) = about 28 ng/mL = 0.028 mg/L at MW about 267.
- Engine ec50 0.1 mg/L is about 3.5x too high; lower to about 0.03 mg/L.
- Label: 30-80% of maximal blockade at 30-540 nmol/L, log-linear; beta-1 selectivity lost above 300 nmol/L. Effect lags plasma: peak block about 20 min after a 10-min IV infusion; IV:oral potency about 1:2.5, so keep a keo. Pediatric blockade data floor is age 6 years.

Epinephrine (Oualha 2014, post-cardiac-surgery children): one compartment, allometric scaling (0.75 on CL and on endogenous production q0), explicit endogenous baseline, two linked Emax models (HR; SV x SVR to MAP). No ke0 (effect tracks plasma; label effective half-life is very short). Adult thresholds (Clutter 1980): 50-100 pg/mL HR, 75-125 SBP, 150-200 DBP; epinephrine about 10x more potent than norepinephrine. Clearance higher in older adults (144.8 vs 78 mL/kg/min).

Norepinephrine: no effect-site model. Opposite chronotropic sign (baroreflex lowers HR in healthy volunteers; no sustained HR rise in cardiogenic shock). About 0.6 ug/kg/min to MAP 70 vs about 0.7 for epinephrine. Use the 10:1 potency ratio.

Atropine: HR effect delayed 7-8 min after IV and non-linearly related to peripheral compartment; PK is not the rate-limiting step, so keep a keo anchored to effect. Pediatric dose-response (Palmisano 1991): ED50 9 ug/kg, ED90 26 ug/kg for HR. No effect in denervated transplanted hearts. The historical 0.1 mg minimum dose is not supported by recent pediatric data. No numeric ke0 published.

Amiodarone: model acute IV as AV-nodal slowing, sinus bradycardia and noncompetitive beta/Ca blockade only. Class III/QT prolongation takes days to weeks (ventricular effects about 10 weeks, Mitchell 1989; QT from day 3, max day 14, Zhao 2018) and tracks desethylamiodarone. No ke0/EC50 retrieved. Do not model QT prolongation on the sim timescale.

Lidocaine: flat band, no antiarrhythmic Emax. Therapeutic 1.5-6 ug/mL; adverse above 6; CNS symptoms/convulsions about 15 ug/mL; first cardiotoxicity above 21 ug/mL. Minimal hemodynamic effect, little effect on normal AV node. Hepatic ER about 70%, about 90% hepatic metabolism, flow-limited; t1/2 1.5-2 h. Supports re-anchoring the engine's too-small v1 and CL.

Engine consequences: diltiazem ec50 confirmed; metoprolol ec50 down about 3.5x with a keo giving about 20 min peak; amiodarone acute effect restricted; lidocaine toxicity breakpoints re-anchored together with the v1/CL fix (note this shifts every lidocaine toxicity calibration and the hematoma block thresholds).

Still open: numeric ke0 for atropine; adult epinephrine/norepinephrine effect-site equilibration constants. Next offered: adrenergic receptor affinity and relative potency for vasopressors (alpha1/beta1/beta2 coefficients).

## 17. Ninth literature pass: vasopressor receptor affinity and relative potency

Key finding: alpha-1 affinities of epinephrine, norepinephrine and phenylephrine are within about 5-fold, so large clinical potency differences come mostly from beta activity and receptor-bed distribution, not alpha-1 affinity alone.

Alpha-1 (Besse and Furchgott 1976, rabbit aorta, equal intrinsic efficacy): relative affinity epinephrine 1.25, norepinephrine 1.0, phenylephrine 0.200. Oriowo 1991: rank epinephrine > norepinephrine > phenylephrine > methoxamine > dopamine in five arteries; affinity is bed-dependent (up to 40-fold for norepinephrine, about 4-fold for epinephrine). Cloned subtypes (Minneman 1994): epinephrine and norepinephrine full agonists of similar potency; phenylephrine full agonist except submaximal at alpha-1B. Lumped encoding: epinephrine about 1.25, norepinephrine 1.0, phenylephrine 0.2, equal efficacy.

Beta:
- Epinephrine non-selective (beta-1 about beta-2). Norepinephrine about 10x beta-1 selective, purely an affinity effect with equal efficacy (McPherson 1985, Xu 2021). Phenylephrine essentially no beta activity.
- Functional beta-2 (Kahlous 2026): epinephrine pEC50 8.69 (cAMP) vs norepinephrine 7.09, about 40x weaker. Norepinephrine is a partial agonist at beta-2 (Weitl and Seifert 2008).
- Clinically: norepinephrine minimal heart-rate effect; epinephrine potent beta-1 plus moderate beta-2 and alpha-1 (Surviving Sepsis 2021).

Clinical potency (validation targets for net pressor output):
- Norepinephrine:phenylephrine about 13:1 by bolus (Ngan Kee 2017), about 6:1 by infusion (Qian 2022). Carry as documented route dependence, do not average.
- Norepinephrine-equivalent scale (Kotani 2023): epinephrine 1, phenylephrine about 0.06, dopamine about 0.01, vasopressin about 2.5 (0.03 U/min is about 7.5 ug/min norepinephrine).

Phenylephrine: pure alpha-1 (alpha about 0.2 relative, beta-1 and beta-2 zero); reflex bradycardia expected.

Vasopressin: model separately on V1 (Gq/11-PLC-IP3), not adrenergic. Pressor effect proportional to infusion rate, peaks within about 15 min, fades within about 20 min of stopping; tends to lower HR and CO; fixed dose 0.01-0.1 U/min; efficacy preserved in acidosis (catecholamine-resistant flag).

No in-vivo ke0 or absolute EC50 exists for these hemodynamic endpoints; receptor data are relative affinities and cloned or isolated-tissue pEC50. Engine effect-site constants for vasopressors stay documented calibrations.

Next offered: dopamine receptor affinity and dose-dependent hemodynamics.

## 18. Dopamine staging, pediatric fentanyl Ce50, midazolam maturation, CES1 ontogeny (tenth pass)

Source: OpenEvidence pass pasted by the user. Values below are as reported there; primary-paper confirmation is still owed.

### 18a. Dopamine (only needed if dopamine is promoted off its flat curve)
- Canonical dose staging disagrees across sources, so carry ranges, never averages:
  - Francis (JACC 2014): 3 to 10 ug/kg/min beta (inotropy, HR; also promotes NE release and blocks reuptake); 10 to 20 alpha (SVR).
  - Prideaux (NeoReviews 2024): 2 to 5 dopaminergic (renal vasodilation); 5 to 10 beta; 10 to 20 alpha + beta + serotonergic.
  - Drieghe 2008: above 7.5 beta then alpha, renal plasma flow falls.
- Model as three overlapping sigmoidal concentration-effect curves (D1 vasodilation, beta-1 inotropy/chronotropy, alpha-1 vasoconstriction) with wide interindividual variability, not hard dose windows. Carry the renal-to-beta transition as a 3 to 7.5 ug/kg/min range.
- Realism rule: NO renal protective benefit. Low-dose dopamine transiently raises renal blood flow and urine output, but eGFR does not improve (ROSE-AHF: no better than placebo). Do not model organ protection.
- Receptor potency (Kahlous, Nat Commun 2026): D1 pEC50 8.48 (cAMP); beta-2 pEC50 5.29, about 2500x weaker than epinephrine and 63x weaker than norepinephrine. Direct adrenergic potency is intrinsically low (about 0.01 norepinephrine-equivalent), so mid/high-dose effect is partly indirect via endogenous NE release. The engine has no endogenous-NE-release term; that would be new mechanism work.
- D1-like is Gs (cAMP, vascular smooth muscle relaxation); D2-like is Gi (inhibits presynaptic NE release).
- No in-vivo ke0 or absolute EC50 exists for dopamine hemodynamic endpoints; constants stay documented calibrations.

### 18b. Pediatric fentanyl Ce50 (resolved)
- Cruzat 2024 (children, NoL index, sevoflurane): C50 1.93 ng/mL, gamma 1.33, t1/2ke0 1.69 min. Adult comparison 3.26 ng/mL (different endpoint).
- Wu 2022 (neonates): no defined range; target 0.6 to 1.2 ug/L; neonates possibly more sensitive (higher unbound fraction, greater BBB permeability).

### 18c. Midazolam maturation (resolved as a model choice)
- Ince 2013: best description is an allometric exponent that varies with bodyweight, 0.84 at 0.77 kg falling to 0.44 at 89 kg, not a single Hill sigmoid.
- Kos 2020: 50% of adult CL at 45.9 weeks PMA (critically ill; adult-scaled CL 8.52 L/h is probably low, use for shape only).
- Johnson 2023 (PBPK, nine studies): Upreti CYP3A4 ontogeny beats Salem (bias 0.14 vs 0.69). Confirms the section 12/13 preference. Use Upreti or Ince with PMA50 about 46 weeks.

### 18d. CES1 ontogeny for etomidate (section 14a inputs, now primary-sourced)
- Hines 2016 (165 livers, Western blot): CES1 markedly lower under 3 weeks (microsomal 6.27 vs 17.5 pmol/mg; cytosolic 4.7 at birth to 3 wk vs 15.8 at 3 wk to 6 yr vs 16.6 above 6 yr).
- Shi 2011: about 10% of adult CES1 activity at 1 to 31 days, rising about 4 to 7x to about 50% of adult by 35 to 70 days, roughly stable through 6 months.
- Supports the fitted breakpoints (about 0.10 to 0.20 under 3 weeks, about 0.5 at 1 to 6 months, about 1.0 by 6 years). No published smooth sigmoid, so a piecewise age-band multiplier flagged engine-fitted is the honest encoding. The 14a design task still needs the function itself written down.

### 18e. Offered next
Dobutamine receptor pharmacology and concentration-effect data (racemic alpha-1/beta mechanism).

## 19. Audit of the brief's own claims (eleventh pass) and the realism direction

Direction from the user: procedures are moving toward minigames where the player draws the drug and eventually starts drips and similar. Push toward realism. Values below are as reported by the audit pass (FDA labels plus reviews); primary confirmation still owed.

### 19a. Must-fix structural items
1. **Continuous-infusion input is a prerequisite, not an open question.** Epinephrine, norepinephrine, phenylephrine, dopamine and vasopressin are titrated infusions; their behavior is rate-in/rate-out steady state. Epinephrine reaches PK steady state in 10 to 15 min, BP effect offsets 15 to 20 min after stopping. Norepinephrine steady state about 5 min, pressor action stops within 1 to 2 min of stopping. Repeated boluses cannot reproduce plateau or washout. Design the infusion input (rate in mcg/kg/min, pump start/stop/titrate) so it composes with the drug-draw and drip minigames; it also resolves brief section 2 question on infusions.
2. **Naloxone disposition is wrong by an order of magnitude and its clearance must NOT be hepatic-flow scaled.** Reported Vd 320 to 482 L, CL 3 to 3.66 L/min (above hepatic blood flow, so substantial extrahepatic metabolism), three-compartment, terminal t1/2 60 to 120 min. Tying it to `organClearanceFactor` would make naloxone clearance fall in shock, which is false. Neonatal t1/2 about 3.1 h vs about 64 min adult belongs on a UGT maturation term.
3. **Retract the global assertion "neonates must not clear faster than adults".** On a per-kg basis fentanyl, amiodarone, etomidate and ketamine (beyond early infancy) clear faster in young children. The assertion must be per drug, on total (not per kg) clearance, with those four exempted. Removed from the CLAUDE.md verification plan accordingly.
4. **Norepinephrine chronotropy.** Pressor doses reflexly slow HR (baroreflex vagal) while raising MAP (label). If the engine's beta-1 term makes norepinephrine raise HR like a generic beta agonist, that is an error; net HR must fall at pressor doses.

### 19b. Numeric anchors still off (engine/brief vs reported)
| Parameter | Engine / brief | Reported realistic value | Action |
|---|---|---|---|
| Epinephrine CL | 2.4 L/min | MCR 78 to 145 mL/kg/min, about 5.5 to 10 L/min at 70 kg | raise 2 to 4x, weight-scaled |
| Norepinephrine CL | 0.8 L/min | 3.1 L/min (Vd 8.8 L, t1/2 2.4 min) | raise about 4x |
| Naloxone Vd / CL | 21 L / 1.18 L/min | 320 to 482 L / 3 to 3.66 L/min | raise about 15 to 20x / 3x, extrahepatic |
| Fentanyl Vd | 13 L central | label Vss 4 L/kg, 3-compartment, distribution 1.7 min, redistribution 13 min, terminal t1/2 219 min | anchor Vss to 4 L/kg; reject ICU 14 to 25 L/kg |
| Fentanyl CL | 0.13 L/min | flow-limited, about 0.5 to 1.5 L/min | raise, well-stirred |
| Etomidate CL | 0.4 L/min | 15 to 20 mL/kg/min, about 1.05 to 1.4 L/min | raise about 3x |
| Etomidate "Vc 4.5 L/kg" | treated as central V | whole-body Vss figure, not Vc | reassign; central V far smaller (see section 15: Vc about 4.45 L total) |

### 19c. Confirmed, keep
- Rocuronium maturation on VOLUME only: clearance flat at 0.29 to 0.35 L/kg/h across ages; Vd falls 0.42 L/kg (birth to 28 d) to 0.18 L/kg (2 to 17 yr); neonatal t1/2 prolongation (1.1 h vs 0.7 h) is purely the volume effect. This also closes the "full rocuronium age-band table" open item (label table).
- Midazolam maturation via Upreti/Ince, no single Hill exponent; stop listing it as open. Kos CL 8.52 L/h is a critically-ill value; take adult CL from an adult source.
- Etomidate CES1 as a piecewise engine-fitted multiplier.
- Amiodarone acute IV effect is AV-nodal/beta-block only, QT suppressed on the sim timescale.

### 19d. Honesty framing
For epinephrine, norepinephrine, atropine, naloxone, dopamine and vasopressors there is no published effect-site ke0 or mg/L EC50 for the hemodynamic endpoints; labels give onset/offset and threshold concentrations only. The PD layer for this group is CALIBRATED to reproduce label windows (epinephrine offset 15 to 20 min; norepinephrine offset 1 to 2 min), not fitted to literature constants. Say so in code comments so calibrations are not mistaken for anchored values.

### 19e. Offered next
Structure of the continuous-infusion input so titrated vasopressors reproduce their published onset and offset windows.

## 20. Continuous-infusion input design (twelfth pass)

Source: OpenEvidence pass pasted by the user plus our own review. Design intent only; nothing built.

### 20a. Structure
- Zero-order mass input into the central compartment alongside the existing bolus/depot terms. No new disposition structure. Plateau falls out of Css = R/CL; time to plateau is set only by elimination half-life (about 4 to 5 half-lives), independent of rate. Short-half-life vasopressors need no loading bolus.
- One pump state per line (rate in mcg/kg/min, on/off, target vein), written by the drip minigame and read by the PK layer each tick. Never duplicate the rate into a separate PK field. Titration is writing a new value; stop is toggling the term; ODE state persists so there is no reset.
- Per tick add R_mass x dt to central amount, with R_mass = rate x weight. Input is linear, so a bolus or timed loading infusion plus a maintenance infusion coexist by addition (amiodarone load-then-maintain falls out for free).
- Weight enters both rate (linear) and clearance (weight^0.75 times maturation), so per-kg plateau is not weight-invariant: large patients get a lower plateau at a fixed per-kg rate. Epinephrine label agrees (higher weight, higher CL; elderly clear faster, 144.8 vs 78 mL/kg/min).
- Integration: norepinephrine k about 0.35/min. The engine tick is up to 1 min, so use the exact per-step update C = Css + (C0 - Css) exp(-k dt) for a piecewise-constant rate (applied to the central amount with the two-compartment exact or substepped solution), not an explicit Euler step.

### 20b. Validation anchors (adult labels, as reported)
| Drug | Vd | CL | t1/2 | Steady state | Offset after stop | Infusion range |
|---|---|---|---|---|---|---|
| Norepinephrine | 8.8 L | 3.1 L/min | 2.4 min | about 5 min | 1 to 2 min | 2 to 12 mcg/min titrated |
| Epinephrine | not reported in this pass | weight dependent | not reported | 10 to 15 min | 15 to 20 min | not reported in this pass |
| Phenylephrine | 340 L (Vss) | 2.095 L/min | about 5 min | about 15 to 25 min | up to 20 min | 0.5 to 1.4 periop, 0.5 to 6 shock mcg/kg/min; max 200 mcg/min |
(The pass's epinephrine row was incomplete; fill from the epinephrine label in a later pass.)

### 20c. Offset caution (our correction to the pass's framing)
The pass says norepinephrine offset (1 to 2 min) is faster than its 2.4 min plasma half-life predicts and must therefore be a PD property. That is overstated: after a stop, plasma falls to about 25% in two half-lives (about 5 min), and a pressor effect that is already near the top of a sigmoid can drop visibly sooner, so 1 to 2 min is roughly compatible with plain PK plus a steep or saturated E(C) curve. Decide by simulation: drive the engine with the label rate, check the offset, and only add a PD offset mechanism if plain PK plus the existing keo cannot reproduce it. Epinephrine and phenylephrine 15 to 20 min offsets need the longer-lived pieces (epinephrine endogenous baseline and dual Emax; phenylephrine t1/2 about 5 min with a large Vss) and a keo calibration. Either way the vasopressor PD layer is calibrated to label windows, not fitted (section 19d).

### 20d. Optional realism for the drip minigame
Pump dead volume and carrier-flow coupling cause delivery lag after a rate change and a transient bolus or dip when a carrier line is stopped (Lovich 2006). Vasopressors are titrated to MAP, not to a concentration, so the minigame closes the loop (player adjusts R against MAP). A small delivery lag on rate changes is the one piece worth considering for teaching titration; full dead-volume modeling is probably beyond scope for v1.

### 20e. Offered next
Calibration of the effect-site/keo layer so each vasopressor's offset and reflex-HR behavior emerges from the infusion.

## 21. Vasopressor effect-site calibration, reflex HR, epinephrine PD (thirteenth pass)

Source: OpenEvidence pass pasted by the user. The final calibration caveat in the pass was truncated mid-sentence; treated as a gap.

### 21a. Correction to our section 20c
Our claim that an effect "near the top of a sigmoid" drops visibly sooner after a stop was wrong. Near saturation, effect falls slower than concentration. A fast visible offset comes from operating on the steep part around EC50. A norepinephrine infusion titrated to a MAP target sits on that steep, near-linear region, so a 1 to 2 min visible offset is reproducible from plain PK plus the existing keo. The plan stays simulation-first (add a PD offset mechanism only if PK plus keo cannot hit the window), but the stated reason is now the steep-region argument.

### 21b. Norepinephrine PD
- De Keijzer 2026 (healthy volunteers, awake and anesthetized): MAP tracked infusion RATE better than plasma concentration, with an essentially linear dose to MAP slope (about 103 mmHg per ug/kg/min awake, steeper under anesthesia). Closed form under anesthesia: rate about (target MAP - 54)/222 ug/kg/min. Healthy volunteers, not shock; do not transplant the slope to septic patients without a shock-specific anchor.
- Engine consequence: model MAP as a near-direct function of pump rate with a short effect-site lag, a linear or shallow-Emax gain, not a steep sigmoid with large hysteresis.
- Mechanism supporting fast offset: neuronal reuptake clears norepinephrine at the junction (biexponential removal, fast t1/2 about 2.0 min, slow 33 min; Esler 1981, hypertensive patients).
- Ensinger 1992 (volunteers): infusion raises BP and lowers HR.

### 21c. Reflex heart rate (needs its own mechanism)
- Phenylephrine is pure alpha-1 with no cardiac beta activity, yet the label reports reflex bradycardia. So HR must fall through a MAP to baroreceptor to vagal efferent loop, not through a coefficient on the SA node. Bolus phenylephrine probes the vagal limb; with an infusion, sympathoinhibition also contributes (Salman 2015).
- One MAP-driven baroreflex term covers phenylephrine and norepinephrine's net HR decrease, while beta-active drugs (epinephrine) can still raise HR through their direct beta-1 term. The engine already has a baroreflex (`baroGain`, trait `baroreflexGain`); first measure what it does with norepinephrine and phenylephrine today before adding anything.

### 21d. Epinephrine PD (Oualha 2014, children)
- One-compartment PK with endogenous production q0; CL and q0 scale with weight^0.75. Two Emax relationships: HR (C50_HR) and the SV x SVR product (C50). Matches the plan.
- Dose-dependent sign: beta-2 vasodilation lowers SVR and diastolic pressure at low doses, overtaken by alpha-1 vasoconstriction at higher doses. The SV x SVR term must be able to go the "wrong" way at low rates; it is not a monotone pressor.
- Offset about 20 min (hormonal, longer effective clearance), so its keo target differs from norepinephrine's.
- Bighamian 2016: dose-response parameters should be individualized, a population-average latency model costs little. Supports fixed label-anchored keo per drug with the dose-response gain carrying inter-patient variability.

### 21e. Calibration targets
| Drug | Effect model | Offset after stop | Reflex HR | Dose-sign |
|---|---|---|---|---|
| Norepinephrine | near-linear dose to MAP, short keo | 1 to 2 min | net HR down via baroreflex | monotone pressor |
| Epinephrine | dual Emax: HR and SV x SVR | about 20 min | HR up (direct beta-1) | beta-2 vasodilation low dose, alpha-1 high dose |
| Phenylephrine | alpha-1 to SVR to MAP | up to about 20 min | HR down via baroreflex (prominent) | monotone pressor |

### 21f. Offered next
Structure of the single MAP-driven baroreflex term so it lowers HR for alpha agonists but still lets beta-active drugs raise it.

## 22. Baroreflex term design (fourteenth pass)

Source: OpenEvidence pass pasted by the user. Design intent only; nothing built. Marked-as-ours notes are our own checks.

### 22a. Structure
- One negative-feedback loop sensing MAP error, driving two efferent limbs, with the output applied to the same HR variable the drugs' direct chronotropic terms write to. The sign for each drug then emerges from competition at that variable: alpha agonists have only the reflex (HR falls); beta-active drugs have a direct SA-node term that outweighs it (HR rises). No drug-specific sign rule (Marey's law). This is also a clean unit test: epinephrine vs norepinephrine HR divergence should come only from the beta term (atrial beta-2 about 30% of cardiac beta receptors), proving the reflex and direct drive are summed, not double-counted.
- Cardiovagal limb to HR: fast (onset 100 to 475 ms, under one beat), abolished by muscarinic blockade. A phenylephrine bolus probes this limb selectively.
- Sympathetic limb to SVR and, more slowly, HR: beta-sympathetic HR control begins about 2.5 s and completes about 10 s; alpha-sympathetic resistance control starts about 5 s and takes up to about 20 s. With an infusion both limbs engage, so phenylephrine's HR fall is part vagal, part sympathoinhibition.
- The sympathoinhibitory limb must buffer SVR, not only slow HR. Without it every pressor overshoots its MAP target and the near-linear norepinephrine dose to MAP gain (section 21) reads too steep. Closed-loop vasopressor models (Kao 2023, Sharifi 2022 PyMyoVent) close the loop on both chronotropism and vascular tone. The buffered steady state is the target.

### 22b. Gain anchor
- Human BRS: about 15.7 ms/mmHg (modified Oxford, phenylephrine), about 19.4 ms/mmHg (spontaneous transfer function) (Bonyhay 2013).
- Our conversion check: dHR = -(60000/RR^2) x dRR; at RR 1000 ms and 15.7 ms/mmHg that is about 0.94 bpm per mmHg, consistent with the pass's 0.9 to 1.2 bpm per mmHg. Use as the calibration target for `baroGain`.
- Map inter-patient variability onto the existing `baroreflexGain` trait. BRS is depressed in shock, after MI, in the elderly and in heart failure (Goldberger 2019); a low-BRS patient shows a blunted reflex HR response.

### 22c. Refinements
- Build in: sigmoid MAP-error to reflex-output relation saturating at both ends (BRS is linear only mid-range), to prevent implausible bradycardia at very high induced pressures.
- Build in, simply: setpoint fixed or very slowly drifting over a 15 to 30 min call, so a sustained pressor infusion holds a sustained reflex bradycardia.
- Defer unless the minigame needs beat-level fidelity: separate 2.5 to 20 s limb lags. For titrated infusions, one fast HR lag plus one slower SVR lag captures the visible behavior.

### 22d. Validation targets (infusion of each drug)
Norepinephrine: MAP up, net HR down. Epinephrine: HR up; at low doses MAP/diastolic may fall via beta-2 vasodilation, which should add reflex tachycardia. Phenylephrine: MAP up with reflex bradycardia. Sources: Tulen 1993 (volunteers), Levy 2018 (cardiogenic shock).

### 22e. Our cautions
- The cited BRS values are from specific healthy or lab populations and mixed methods; the 100 to 475 ms and 2.5 to 20 s latencies come from a validation-dataset paper, not shock patients. Treat as healthy anchors.
- First measure what the existing engine baroreflex already does for norepinephrine and phenylephrine; the term may exist and only need re-gain and an SVR limb.

### 22f. Offered next
How to adjust baroreflex setpoint and gain for a shock state so the healthy-volunteer norepinephrine dose to MAP slope is not over-applied.

## 23. Shock adjustment of baroreflex gain, setpoint and pressor gain (fifteenth pass)

Source: OpenEvidence pass pasted by the user. Design intent only; nothing built. The user also noted that the read-only engine probe is a measurement task no search can replace; it is still pending.

### 23a. Three independent axes (not one "shock multiplier")
1. **Baroreflex gain depressed, and not auto-recovering.** BRS falls in septic and hemorrhagic shock and stays depressed after MAP is restored to 65 mmHg or more with fluids and norepinephrine (Carrara 2022 swine 5-day sepsis; Carrara 2018 hemorrhage; Carrara 2020). Causes: reduced arterial compliance lowers baroreceptor stretch sensitivity; adrenergic over-stimulation and parasympathetic suppression blunt the heart's response. Make the blunting a property of the shock state, not a function of current pressure.
2. **Setpoint shifts, acutely, partially, reversibly.** Within 20 min of a sustained pressure change the baroreflex curve resets rightward/upward with steep-portion sensitivity relatively preserved (Salman 2016). Resetting moves where the curve sits; gain change alters its steepness; encode separately. Holding the setpoint fixed over a 15 to 30 min call remains a defensible simplification; the literature supports a slowly drifting setpoint so a prolonged pressor settles into a new operating point. Chronic resetting (weeks) is out of scope.
3. **Drug-side dose to MAP gain attenuated in sepsis, a different mechanism from the baroreflex.** Alpha-receptor downregulation, increased Vd from permeability, fluid dilution. Nishikimi 2026: a starting dose of 0.1 ug/kg/min raised MAP only about 12 mmHg in critically ill patients; 0.025 to 0.05 ug/kg/min often failed to reach MAP 65 within 60 min when baseline MAP was severely low. Surviving Sepsis 2021 frames the same point. So the norepinephrine gain needs its own shock/sepsis attenuation factor distinct from `baroreflexGain`.

### 23b. The SVR buffer pulls the other way
In sepsis the sympathetic SVR-buffering limb is weakened too (suppressed LF power of diastolic pressure, reduced HR contribution to resistance control; Carrara 2018, 2020), so a given alpha-1 drive reaches SVR with less reflex opposition. That steepens the dose to MAP slope while receptor desensitization and higher Vd flatten it; the data show the latter dominating at low doses. This is why they must be separate terms, so a scenario can dial each.

### 23c. Template
Kao 2023 vasoplegic-shock model keeps the direct drug effect (phenomenological dose-response) and the baroreflex modulation as separate interacting blocks and reproduced phenylephrine effects on MAP, CO and SVR including secondary baroreflex effects; the same architecture as the plan. Jentzer/Hollenberg 2021 supplies the sign logic: a vasoconstrictor MAP rise causes sympathetic withdrawal that attenuates the rise and lowers HR and inotropy; in shock that loop is weakened.

### 23d. Calibration table
| Parameter | Healthy anchor | Shock adjustment |
|---|---|---|
| `baroreflexGain` | about 0.9 to 1.2 bpm/mmHg | depressed; does not recover on reaching target |
| Setpoint | fixed over call | optional acute partial rightward reset over about 20 min |
| NE dose to MAP gain | about 12 mmHg per 0.1 ug/kg/min (clinical) | attenuated in sepsis at low doses |
| SVR buffer strength | full | weakened (partially offsets the above) |

### 23e. Cautions
- Most quantitative BRS data are from swine models and small ICU cohorts: direction of each change is well supported, magnitudes are scenario-tuning choices, not constants.
- The Nishikimi figures are observational clinical associations, not a controlled dose-response; do not treat 12 mmHg per 0.1 as a population parameter.
- Section 21's healthy slope (about 103 mmHg per ug/kg/min) and this clinical 12 mmHg per 0.1 ug/kg/min (about 120 per ug/kg/min) are the same order; do not read the difference as healthy vs shock since the contexts differ.

### 23f. Offered next
Progressive catecholamine resistance and the switch to a multimodal vasopressor strategy at high norepinephrine doses.

## 24. Catecholamine resistance and the escalation ladder (sixteenth pass)

Source: OpenEvidence pass pasted by the user. Design intent only; nothing built. The pass's escalation table row for step 2 was garbled in transit; the trigger text below is reconstructed from the prose (vasopressin added on escalating norepinephrine, about 0.25 to 0.5 ug/kg/min in SSC 2021) and should be re-checked.

### 24a. Structure
- Resistance is a time-dependent, receptor-class-specific decay of the ALPHA-adrenergic dose-to-effect gain during sustained exposure. Do not fold it into the static sepsis drug-gain factor of section 23; that one is static, this one is progressive.
- Non-adrenergic vasopressors (vasopressin V1a, angiotensin II AT1) read a separate efficacy channel the adrenergic decay does not touch. Mechanism: homologous desensitization first (response to vasopressin and angiotensin II intact early), heterologous only later. This is the license for the rescue channel.
- Mechanisms: (1) alpha desensitization/downregulation via GRK, beta-arrestin, internalization (infusion cut alpha-1 receptor number about 50%, receptor-loss t1/2 about 12 h, maximal by about 2 days; rat data, Snavely 1985, Tsujimoto 1987); (2) superoxide inactivation of catecholamines in sepsis (Macarthur 2000), a faster route to the same observable, so one combined decay term suffices unless methylene-blue/antioxidant teaching is wanted; (3) beta downregulation and sepsis cardiomyopathy (Hollenberg 2021), a separate decay on the beta to contractility gain if inotropy is modeled.

### 24b. Escalation ladder (SSC 2026 sequence), gated on the norepinephrine-equivalent dose
1. Norepinephrine, alpha-1 to SVR with decaying gain.
2. Add vasopressin on escalating norepinephrine (SSC 2021 about 0.25 to 0.5 ug/kg/min or equivalent).
3. Add epinephrine if MAP still inadequate on norepinephrine plus vasopressin; shares the decaying adrenergic channel.
4. Refractory: angiotensin II 20 up to 80 ng/kg/min (100 after 3 h; maintenance 2.5 to 20), with or without hydrocortisone; AT1 to SVR, resistance-independent.

### 24c. Unit test
Raising norepinephrine past saturation/downregulation gives diminishing MAP return; switching to vasopressin or angiotensin II restores it; epinephrine does not (same receptors, SSC rationale). If vasopressin and angiotensin II write to a channel immune to the adrenergic decay, this emerges automatically.

### 24d. Hydrocortisone as a resistance REVERSAL lever
Model it as a partial reversal of the alpha-gain decay (raises the ceiling, re-sensitizes the channel), not as a pressor input. Timing anchor: steroids at norepinephrine 0.25 ug/kg/min or more, at least 4 h after norepinephrine start (SSC; Wang 2026). Time course and dose thresholds not yet researched.

### 24e. Dosing anchors for the pump layer
- Vasopressin: fixed, non-titrated 0.01 to 0.03 U/min (TRICYCLE starts 0.015, caps 0.03 IU/min). Dosed in units per minute, not per kg, so the pump state must support a non-per-kg unit.
- Angiotensin II: ng/kg/min as above.
- The norepinephrine-equivalent scale (section 17) is the single decision variable for each step.

### 24f. Cautions
- Mortality evidence for adding vasopressin is moderate and modest (RR 0.89, 95% CI 0.79 to 1.01); angiotensin II signal low and indirect. The ladder is a realism and teaching structure, not a survival claim.
- Pure vasoconstrictors (vasopressin, angiotensin II, phenylephrine) can lower CO via afterload and sympathetic withdrawal; angiotensin II is contraindicated in low-output states. The non-adrenergic channel must carry an afterload/CO penalty or it teaches the wrong lesson in mixed cardiogenic-vasodilatory shock (Jentzer 2025).
- **Timescale mismatch (our flag, important):** the receptor downregulation numbers are rat data on an hours-to-days scale (t1/2 about 12 h). On a 15 to 30 min call a receptor-downregulation decay would barely move. Call-timescale refractoriness is better represented as (a) a scenario-initial state (the patient arrives already refractory after hours of shock or prior infusions), plus (b) fast contributors (superoxide inactivation, acidosis, hypovolemia). Do not decay the gain by a literature t1/2 inside a single call and call it realistic. Scenario time compression, if any, is a separate design decision.

### 24g. Offered next
Hydrocortisone re-sensitization of the adrenergic channel: time course and dose/timing thresholds.

## 25. Read-only engine probe of pressors and baroreflex (measurement, no code changed)

Method: scratch script (kept outside the repo) driving `physio()` with the real engine, traits pinned neutral, one single dose at t=180 s, 2 s steps, 900 s observation, scenarios `abdPain` (suite's healthy control, mild pain) and `septicShock`. One run per case, no repeated trials; single doses, NOT infusions. The `amount` argument is a raw dose multiplier whose mapping to mcg/kg/min is undefined in the engine (norepi `dose:1` per "unit"). Treat every number as engine behavior to compare with the section 19 to 24 targets, not as a validation.

### 25a. What already exists (do not rebuild)
- `updateAutonomic` (cardiovascular.js) already has: logistic baroreceptor firing F(MAP - setpoint) with k 0.033/mmHg, a setpoint that adapts to MAP (tau 20 min; it rose from 94 to about 130 to 140 mmHg over 15 min under a pressor, so the reflex fades and resets, matching the literature's acute resetting), a dP/dt term, a sympathetic limb (`neuralSymp`, tau 20 s) and a separate vagal limb (`parasympathetic`, tau 8 s, asymmetric gain 0.9 below / 0.45 above setpoint, plus central-command withdrawal), the `baroreflexGain` trait, elderly and diabetic blunting. HR reads `-(parasympathetic - REST_PARA) * 60`.
- Drug receptor terms compose into `_alphaDrug/_beta1Drug/_beta2Drug` and add to `alphaTone` (clamped 0 to 3). Vasopressin (V1) already has its own coefficient with a tone-dependent sensitivity (`v1Sens`, preserved in vasodilatory shock), but it sums into the same `_alphaDrug` as the adrenergic terms.
- An afterload CO penalty already emerges: norepinephrine 4 units CO 6.1 to 3.7, vasopressin 6.1 to 3.1 L/min; epinephrine raises CO.
- An SVR-buffering sympathetic withdrawal exists (`neuralSymp` falls from 0.22 to about 0 under a pressor) but is weak: resting `neuralSymp` is small, so it can remove at most about 0.2 of alpha tone against drug terms of 0.5 to 1.0.

### 25b. Findings against the targets
1. **Pressor gain is saturated and overshoots.** Healthy norepinephrine MAP rise at about 5 min: 0.01 unit +5, 0.02 +10, 0.05 +22, 0.1 +37, 0.25 +66, 1 unit +105 (MAP about 210), 4 units +125. Epinephrine 0.3 unit MAP about 232. Alpha tone saturates near 1 (SVR 2.7x baseline). A clinically plausible titrated dose is meant to give MAP 65 to 90; here modest doses make hypertensive emergencies. Needs the dose-unit mapping to mcg/kg/min first, then a flatter, less saturating alpha-to-SVR gain.
2. **Sepsis attenuation already emerges, direction correct.** Same 0.1 unit raises MAP +37 in `abdPain` but only +17 to 20 in `septicShock` (and 0.25 unit +34 to 36). Not a designed receptor-downregulation term; it appears to come from the lower baseline SVR/tone. Right direction versus section 23; magnitude and mechanism are accidental.
3. **Offset is slow, and saturation makes it slower (confirms the section 21 correction empirically).** After a single norepinephrine dose the effect peaks about 2 to 5 min then declines slowly; alpha-drug term at 900 s is still 0.45 (0.25 unit) to 0.78 (1 unit), versus 0.03 to 0.06 for 0.01 to 0.02 units. Higher doses sit far above EC50 (0.008 mg/L) so concentration must fall a long way before effect drops. Also engine norepinephrine elimination k = kel 0.1/min (CL 0.8 L/min, v1 8 L) is about 3.5x slower than the label (k about 0.35/min), consistent with section 19b. A bolus is not an infusion, so the label's 1 to 2 min offset after stopping cannot be tested until the infusion input exists.
4. **Phenylephrine (curve model) has a cliff, not a decay.** Effect holds then drops abruptly at the fixed duration (about 360 s): septic alpha 1.06 at 300 s to 0.47 at 900 s, with rebound tachycardia overshoot (HR 143 vs baseline 137). Label offset is up to 15 to 20 min as a decay; promote phenylephrine to a concentration model (brief section 5/20).
5. **Reflex HR sign is right but about 5x weak.** Phenylephrine healthy: HR -15.5 for MAP +70 at 60 s (about 0.22 bpm/mmHg); septic about 0.5 bpm/mmHg. Norepinephrine 0.1 unit: HR -5 for MAP +29 (about 0.17); HR then drifts back to baseline or above by 900 s even with MAP still +30 to +35, because the setpoint chases MAP. Target from section 22 is about 0.9 to 1.2 bpm/mmHg. Norepinephrine HR is roughly flat to slightly down at low dose and slightly UP at 1 to 4 units (+4 to +10 at 15 min), not a clear net fall. The `-60 * (parasympathetic - REST)` HR gain and/or the vagal gain constants are the levers; measure before changing.
6. **Epinephrine has no low-dose beta-2 vasodilation dip.** Over 0.01 to 1 unit SVR rises monotonically (1100 to 1146, 1320, 1812, 2326, 2664) and MAP rises at every dose, even though `epiIV` carries `beta2: 0.3`. The section 21 sign change (low-dose SVR/diastolic fall) is absent. HR rises appropriately (+3 at 0.01 to +46 at 1 unit).
7. **Vasopressin is far too strong and shares the adrenergic alpha channel.** 1 unit raises septic MAP 71 to 126 to 137 (alpha tone 1.2), HR falls 137 to 107, CO falls to 3.1; label expectation at 0.03 U/min is a modest rise (order of 10 mmHg). Because V1 sums into `_alphaDrug`, any adrenergic desensitization decay (section 24) applied to that variable would wrongly attenuate vasopressin too. V1 must be split into its own accumulator before a resistance term is added.
8. **Resting control drifts.** `abdPain` control HR 93.9 to 97.3 and setpoint 94.4 to 98.8 over 15 min (the known resting transient, brief section 6 PaCO2/pH item, plus pain); the baseline setpoint starts below MAP (F 0.57), so the reflex is not at its operating point at rest.

### 25c. Consequences for the plan
- First, define the dose unit: map `amount` to mcg/kg/min (norepi) and U/min (vasopressin), tie to pump state.
- Then rescale pressor gains against label MAP slopes; the existing saturation (alphaTone about 1 gives SVR 2.7x) is the main distortion.
- The baroreflex mechanism mostly exists; the work is gain calibration (HR slope about 5x low), a stronger SVR-buffer limb, and the HR formula, not a new structure.
- Add the epinephrine low-dose beta-2 vasodilation term, a separate V1 accumulator, concentration-based phenylephrine, and the infusion input; norepinephrine PK constants per section 19b.
- Sepsis attenuation exists accidentally; replace with a designed term (section 23) so it can be dialed per scenario.

### 25d. Limits of this probe
Single doses, single runs, one scenario each, neutral traits, pain confound in `abdPain`, undefined dose units, and no suites re-run. Findings 1, 5 and 6 should be re-checked with an infusion-like repeated-dose arm and with several seeds before any coefficient is changed.

## 26. Dose is a variable, not a constant (design note from the user's draw-up minigame direction)

Current state (read from the tree): the player path always delivers `drugDef.dose`. `giveDose(s, {id, at, route})` carries no amount; `pk.js` already honors an optional `d.amount` (`const dose = d.amount ?? drugDef.dose ?? 1`) but only scenario-seeded doses use it. `DrawUpMinigame` is a pass/fail check (random order, pick the right vial, pull to a gameplay-only volume; its own comment says drugs.js has no concentration), and a success only sets `prepped`. The `max` cap counts doses, not mg.

What a variable dose needs:
**DECIDED (user): the drawn amount is always authoritative; the ordered amount is used only for scoring the player.**

1. **Amount flows end to end:** draw-up (concentration x volume drawn, or a pump rate x time for drips) writes `amount` into `giveDose`, then `DrugInstance`. The drawn amount, not the ordered amount, must be authoritative so errors have consequences. The order/target is scoring only.
2. **Real units per drug.** Drug definitions need vial concentration and unit (mg, mcg, U, mEq). Audit every `dose` first: norepinephrine's `dose:1` is an undefined "unit" and the PK parameters (v1 in L, ec50 in mg/L) imply mg for the two-compartment drugs. Vasopressin and insulin are units, not mg.
3. **Per-drug rule for curve drugs.** They have no concentration; decide per drug whether `amount` scales the effect (and how) or only the label and max-dose check (brief section 5 and plan phase 3).
4. **Saturation hides dose errors today.** Receptor-coefficient drugs (norepinephrine, vasopressin, diltiazem, metoprolol, atropine) and per-drug-id Emax drugs (fentanyl, midazolam, morphine) already saturate, so a 10x draw error changes little (section 25 probe; overdose-workstream findings). Dose realism therefore depends on the pressor recalibration and the other saturation fixes, otherwise the minigame teaches that errors do not matter.
5. **Drips:** the pump state is a rate in mL/h against a drawn concentration (for example mg in mL of bag); mcg/kg/min is derived using patient weight. A wrong concentration or weight then gives a wrong dose, the realistic error. Section 20's pump state should store mL/h plus bag concentration, not mcg/kg/min directly.
6. **Weight-based orders:** the order shown is mg/kg times the receiving patient's weight (plan phase 2); pediatric and neonatal patients make the drawn volume small and error-prone, which is the teaching value.
7. **Bookkeeping:** `s.given` and `max` should track cumulative mg (or units), not dose count. The PK dedupe key already includes `amount` (`id|at|amount`), so two different amounts at the same instant stay distinct.
8. **Toxicity paths** that scale with dose (lidocaine seizure and cardiac thresholds, rocuronium Hill block) will respond to drawn amount immediately; saturated ones will not (point 4).

## 27. Follow-up probes: multi-run, repeated-dose, realistic-rate arms, unit audit (measurement, no code changed)

Scripts live outside the repo (scratchpad). Infusion-like arms are repeated boluses of `amount` mg every 60 or 120 s (mass rate = amount/interval; this is an approximation of a pump with ripple). 70 kg assumed for mcg/kg/min conversions. Traits neutral. All numbers are engine behavior, not validation.

### 27a. Corrections to section 25
- **Seeds add nothing.** Five runs per arm gave SD about 0 everywhere; these paths are deterministic. Re-check by varying scenario and traits (`baroreflexGain`, `vascularReactivity`, age), not seeds.
- **Finding 1 (pressor gain saturated, overshoots) was largely a unit artifact.** Section 25 used bolus amounts up to 1 mg of norepinephrine (the engine's `dose:1` is 1 mg given the PK units, 100x a push dose). At realistic infusion-like rates the healthy MAP rise is not absurd.

### 27b. Realistic-rate results (healthy `abdPain` / `septicShock`, rise in MAP after about 12 to 15 min, mmHg)
| Arm | Healthy | Septic |
|---|---|---|
| NE 2 mcg/min | +2 | -5 (disease drift; no effect) |
| NE 5 mcg/min (0.07 ug/kg/min) | +24 | +6 |
| NE 10 mcg/min (0.14 ug/kg/min) | +39 | +16 |
| Epi 1 mcg/min | 0 | 0 |
| Epi 3 mcg/min | +14 (HR +6) | +3 (HR +2) |
In per 0.1 ug/kg/min terms: healthy about 27 to 34 versus the volunteer slope of about 10 (section 21), so healthy gain is about 3x too high; septic about 8 to 11 versus the clinical about 12 (section 23), so septic gain already matches. The healthy/septic difference is the accidental attenuation noted in section 25; the healthy case is the one out of line.
- Effect is nonlinear at the low end: 2 mcg/min does almost nothing, 5 mcg/min gives +24.
- Higher infusion-like rates (25 to 50 mcg/min) give healthy MAP 158 to 180 and septic 99 to 112; still not steady at 15 min because the baroreflex setpoint is also resetting.

### 27c. Offset is PK-limited and far too slow
After stopping a 10 mcg/min infusion at 900 s, the alpha-drug term falls only 0.4 to 0.3 in 3 min and MAP barely moves (healthy 141 to 142; septic 87 to 85). SVR is an instantaneous function of alpha tone (`svr = baseSVR x (0.55 + 2.0 x alphaTone)`, cardiovascular.js line 937), so no vascular lag is the cause; the cause is slow norepinephrine elimination (CL 0.8 L/min vs label 3.1, brief 19b) plus accumulation in the peripheral compartment. Label expectation is a drop to near baseline within 1 to 2 min. keo 0.7/min is not the limiter. After the CL fix, re-run this arm before adding any PD offset mechanism.

### 27d. Curve drugs ignore `amount` and stack without limit
Phenylephrine (curve model) gave the same alpha effect for amount 0.3 as for 1.0, so `amount` is ignored. Repeated doses (0.3 every 120 s for 8 min) stack: `_alphaDrug` climbs to 3 to 4, SVR hits its 4000 ceiling, CO falls to 2.8 (healthy) or 4.9 (septic), MAP 169 to 212. After stopping, septic HR rebounds to 159 (baseline 137). So a phenylephrine drip cannot be dosed by amount until it is promoted to a concentration model.

### 27e. Baroreflex HR slope confirmed weak
Healthy about 0.1 to 0.2 bpm per mmHg, septic about 0.4 to 0.5 bpm per mmHg versus the 0.9 to 1.2 target (section 22). Healthy control HR also drifts 93.9 to 97.2 over 15 min (resting transient), so slopes are measured against a moving baseline; compare against the control arm.

### 27f. Epinephrine low-dose dip still absent
At 1 and 3 mcg/min, healthy SVR rises monotonically (1100 to 1264 at 3 mcg/min); no beta-2 fall in SVR or diastolic. HR response is small (+6 at 3 mcg/min), but present.

### 27g. Unit audit (all drugs, `drugs.js` vs `PK_PARAMS`)
- 21 two-compartment drugs: `dose` is in mg (names confirm: fentanyl 0.05 = 50 mcg, ketamine 100, amiodarone 300, pushEpi 0.02, epiIV 1). Exception: norepinephrine `dose:1` is labeled a "unit" and behaves as 1 mg.
- 28 curve drugs and 7 fluids have NO `dose` field; the amount exists only in the drug name text (for example "Vasopressin 40 U", "Adenosine 12 mg", "Saline 500 mL"). The two curve drips (phenylephrine `dose:1`, norepinephrine) carry a placeholder `dose:1`.
- `max` counts doses for every drug, regardless of unit.
- Implication for the draw-up decision (section 26): a real-units field and vial concentration must be added for all 56 drugs, with the curve and fluid entries getting their first numeric dose.

### 27h. Revised priorities
1. Fix norepinephrine CL (and re-run the offset arm), then reconsider the healthy-gain mismatch (3x) against the septic match; do not recalibrate the septic case.
2. Real-unit dose fields and `amount` handling for curve drugs (phenylephrine first).
3. Reflex HR gain and SVR-buffer limb, epinephrine beta-2 dip, split V1 into its own accumulator (sections 22 to 25).
4. Infusion input and pump state (section 20, revised by section 26).

## 28. Trait-variation probe (measurement, no code changed)

Setup: `baroreflexGain` 0.7 / 1 / 1.3 (vascularReactivity 1) and `vascularReactivity` 0.75 / 1.25 (baroreflexGain 1), one trait at a time, set at tick 1; each combo run for control, norepinephrine 10 mcg/min infusion-like (0.01 mg every 60 s from t=182 s) and a single phenylephrine dose; deltas are versus the control with the SAME traits. Healthy `abdPain` and `septicShock`. One run per cell (engine deterministic). Age was not varied (needs a scenario with a different patient). Numbers are engine behavior, not validation.

### 28a. Results (dMAP mmHg, dHR bpm, slope bpm/mmHg)
| Traits | Healthy NE @540 s | Healthy PE @+60 s | Septic NE @540 s | Septic PE @+60 s |
|---|---|---|---|---|
| baro 0.7 | +28.1, -2.7 (0.10) | +72.9, -14.0 (0.19) | +15.1, -3.7 (0.24) | +54.1, -20.5 (0.38) |
| baro 1.0 | +22.8, -4.3 (0.19) | +70.5, -15.8 (0.22) | +12.1, -5.8 (0.48) | +49.4, -25.6 (0.52) |
| baro 1.3 | +19.4, -5.7 (0.29) | +68.7, -17.6 (0.26) | +9.8, -7.4 (0.75) | +45.2, -29.4 (0.65) |
| vasc 0.75 | +26.6, -5.8 (0.22) | +75.4, -17.5 (0.23) | +12.2, -6.7 (0.55) | +52.3, -28.1 (0.54) |
| vasc 1.25 | +20.3, -3.1 (0.15) | +66.1, -14.6 (0.22) | +11.9, -5.0 (0.42) | +46.6, -23.3 (0.50) |
Control MAP at 540 s: healthy 96.6 to 107.4 across vasc 0.75 to 1.25 (baro barely moves it); septic 64.4 to 73.0.

### 28b. What the traits do
- `baroreflexGain` works as intended: higher gain buffers the pressor rise (healthy NE dMAP 28 to 19 over 0.7 to 1.3) and steepens the HR slope about 3x (healthy 0.10 to 0.29, septic 0.24 to 0.75). The trait range alone spans roughly +-20% on pressor MAP rise.
- `vascularReactivity` also acts as the SVR-buffer strength: low reactivity gives a lower resting MAP (97 vs 107) and a LARGER drug rise (26.6 vs 20.3), because the reflex withdrawal of neural alpha tone is scaled by the same trait (`alphaTone = neuralSymp x 0.9 x vascularReactivity + ...`). That is the weak-buffer behavior section 23 describes for sepsis, available already via the trait.

### 28c. Root cause of the weak reflex HR slope (our analysis, from the code)
Small-signal vagal slope at the setpoint = kBaro/4 x kVagal x 60 bpm per mmHg = 0.033/4 x (0.45 to 0.9 x 0.72) x 60, giving about 0.2 (above setpoint, gain 0.45) to 0.3 (below, gain 0.9) bpm/mmHg at baro 1.0. That matches the healthy measurements (0.19 to 0.22) and is about 4 to 5x under the 0.9 to 1.2 target (section 22). Septic readings are higher (0.5) because the operating point is below the setpoint (higher-gain side) and the MAP excursion stays in the near-linear range; healthy pressor rises of 40 to 70 mmHg run into the logistic saturation (F near 0.95 to 1), which flattens the slope further. So the levers are the vagal gain constants (0.9 / 0.45), the HR coefficient (`- (parasympathetic - REST_PARA) x 60`) and, secondarily, kBaro; the trait multiplies all of it but cannot reach the target within 0.7 to 1.3. The structure needs no change.

### 28d. Implications
- Calibrate the reflex HR gain by roughly 4x on the vagal limb before judging trait ranges; re-run this probe after the change, since septic slopes (0.5 to 0.75) would then overshoot and the setpoint/asymmetry may need rebalancing.
- The healthy-vs-septic pressor difference noted in section 27 is only partly trait-driven: trait changes moved healthy dMAP 19 to 28, still nowhere near septic (10 to 15) or the 3x volunteer-slope overshoot; the rest comes from disease state (baseline SVR, tone).
- Not yet tested: age (elderly blunting, neonates), diabetic autonomic neuropathy, and combined trait corners.

## 29. Age and autonomic neuropathy probe (measurement, no code changed)

Setup: healthy `abdPain` with the scenario's patient age overridden (19, 45, 70, 85) and `autonomicNeuropathy` set at 0, 0.5 and 1.0 on the 19-year-old; traits neutral; control, norepinephrine 10 mcg/min infusion-like (0.01 mg every 60 s) and a single phenylephrine dose per case. The scenario fixes weight at 74 kg, so the age override did not change weight (mcg/kg is therefore constant across ages here; neonatal and pediatric physiology is NOT covered). One run per cell.

| Case | Control MAP / HR at 540 s | NE10 dMAP, dHR (slope) | PE dMAP, dHR (slope) |
|---|---|---|---|
| age 19 | 102.6 / 95.3 | +22.8, -4.2 (0.18) | +70.5, -15.8 (0.22) |
| age 45 | 102.6 / 95.3 | +22.8, -4.1 (0.18) | +70.5, -15.8 (0.22) |
| age 70 | 105.0 / 94.8 | +24.6, -4.3 (0.17) | +74.0, -15.3 (0.21) |
| age 85 | 95.9 / 93.7 | +29.9, -3.9 (0.13) | +81.5, -14.8 (0.18) |
| neuropathy 0.5 | 94.3 / 94.1 | +27.6, -3.7 (0.13) | +76.4, -15.1 (0.20) |
| neuropathy 1.0 | 83.3 / 93.6 | +34.2, -4.1 (0.12) | +85.2, -15.0 (0.18) |

Findings:
- **No age effect below 65.** Ages 19 and 45 are identical to the digit. Elderly blunting (`sympTarget x (1 - min(0.4, (age-65) x 0.02))`) starts above 65 and reaches its 40% cap at 85.
- **Elderly: weaker buffer, bigger drug response.** At 85 the pressor MAP rise grows by about 30% (NE) and 16% (PE) and the HR slope falls (0.18 to 0.13), because the blunting acts on the sympathetic target; the vagal limb is not blunted, but the HR slope still falls, probably because the larger MAP rise pushes further into logistic saturation. Resting MAP at 85 is 95.9 (lower), SVR 1273.
- **Neuropathy lowers resting MAP substantially.** Multiplying the sympathetic target by up to 0.4 drops resting MAP from 102.6 to 94.3 at 0.5 and 83.3 at 1.0, and amplifies the pressor response (+34). The only condition that sets it (`diabeticVasculopathy`) uses 0.6, so the shipped case is about -9 mmHg resting. Real diabetic autonomic neuropathy is dominated by orthostatic hypotension and often supine hypertension, not a lower supine resting MAP, so this is a possible realism flag for that condition, not for the pressor work. Not changed.
- **None of the age or neuropathy effects touches the weak reflex HR slope** (0.12 to 0.22 everywhere): the vagal constants in section 28c remain the main lever.
- **Untested:** neonatal and pediatric patients (weight and age together), combined elderly plus neuropathy plus sepsis, and age-dependent PK clearance (not modeled yet).

## 30. Implementation handoff (2026-10-04, end of session)

Done and pushed: norepinephrine PK set to label values (kel 0.35, k12 0.02, v1 8.8, ec50 0.015).

Measured: with new clearance the offset after stopping a drip is still slow (MAP 129 to 122 over 5 min at 10 mcg/min). Concentration falls on schedule, so the lag is in SVR-to-MAP and baroreflex adaptation (setpoint drifts up about 4 mmHg), not PK or ec50 (the fraction of rise lost in 2 min is about 15 to 28 percent for any ec50). ec50 0.015 targets healthy gain near +14 mmHg at 10 mcg/min (74 kg); septic gain at that value is about +5 against a clinical 8 to 11, needing its own axis. Healthy gain at 0.015 has not been re-measured.

NOT verified: mechanismWiring.mjs was partway through (about 207 passed, 4 failed, all failures the documented BVM trio and the Tzivoni near-miss, no new ones) when the session ended; scenarioSweep.mjs has not been run. Detached (setsid) runs get killed here; run suites as harness background tasks or in chunks, one at a time.

Next: (1) rerun both suites and diff failure sets; (2) re-measure healthy gain at ec50 0.015; (3) probe and fix the SVR-to-MAP/baroreflex offset lag and septic gain; (4) real-unit dose fields and amount handling for curve drugs (phenylephrine first); (5) baroreflex vagal gain, epinephrine low-dose beta-2 dip, split V1 accumulator; (6) infusion input and pump state; (7) weight-aware dosing phases.

### 30a. Progress after the handoff (not suite-verified; full suites to be run locally)

- Norepinephrine overdose condition rebuilt as an ongoing pump error (0.3 mg/min for 10 min); the old "receptor ceiling" assertion is replaced by a dose-scaling one. Probe: sbp 128/140/166/178/183 at 0.01/0.03/0.1/0.3/1 mg/min.
- Curve-model receptor drugs now scale with the delivered amount (`DrugInstance.givenDose` relative to the declared reference `dose`, capped at 3x); default dose gives factor 1 so existing scenarios are unchanged. Phenylephrine probe, peak MAP rise at 0.25/0.5/1/2 units: +20/+41/+95/+124. Open: phenylephrine's reference dose of 1 gives about +95 MAP, far above a real 100 mcg push (about +20), so its declared unit needs real-unit calibration (a 1 unit dose is effectively an overdose).
- Baroreflex vagal gain: raising the hypertension-side kVagal 0.45 to 1.2 and 2.4 barely moved reflex HR (slope -0.19 to -0.15 bpm/mmHg for phenylephrine), so the limit is elsewhere in the HR chain (not kVagal alone). Reverted; needs a different probe.
- Per user decision, cloud sessions implement and verify with short probes only; full mechanismWiring.mjs and scenarioSweep.mjs are run locally.
- Phenylephrine recalibrated to real units: dose 0.1 mg (a usual push), receptors.alpha 0.25 (was dose 1, alpha 1.0). Probe peak MAP rise: default +20, 0.05 mg +10, 0.1 +20, 0.2 +42, 1.0 +72 (3x cap). Run locally: the HOCM phenylephrine assertion and curveDrugAudit read this drug (its effect at the default dose is now about a quarter of before).
- Vasopressin split from the adrenergic path: V1 now accumulates into its own `pat._v1Drug`, added to alphaTone beside `_alphaDrug` (sum unchanged, so a later catecholamine-resistance term can act on `_alphaDrug` only). Vasopressin's declared `alpha: 0.9` was a mislabel (it is V1 only) and is removed. Probe, one 40 U dose, peak MAP rise: healthy +24 (was +106), septic +34. Run locally: vasopressin assertions in mechanismWiring.mjs, curveDrugAudit.
