// Acid-base status: a real, derived strong-ion-difference model.
// Reads: pat.na, pat.k, pat.clShift, pat.sidAdjust, pat.lactate, pat.unmeasuredAnions, pat.paco2
// Writes: pat.cl, pat.hco3, pat.ph, pat.phScale, pat.anionGap
//
// PHYSIOLOGY QUEUE ITEM 44. Before this module existed, pat.hco3 was a
// free-standing "bucket" that roughly a dozen sites (six conditions, two
// drug-effect routes, one chronic-compensation seed) wrote to DIRECTLY —
// each condition deciding for itself what number the patient's bicarbonate
// should be, then Henderson-Hasselbalch (already the ONLY site in the whole
// engine that ever assigned pat.ph — confirmed by exhaustive grep before
// this module was written, so the "never set pH directly" half of this
// item's own constraint was ALREADY true) converted that bucket into a pH.
// The bucket approach had a real, previously undocumented consequence: a
// condition lowering hco3 by manipulating the SAME field, through the SAME
// mechanism, produces the SAME anion gap regardless of WHY the acidosis is
// happening — so an anion-gap acidosis (diabetic ketoacidosis: ketoacid
// anions accumulate) and a non-anion-gap acidosis (severe diarrheal
// bicarbonate loss: chloride rises to fill the charge gap left behind) were
// mechanistically indistinguishable in this engine, even though the real
// clinical distinction between them is a textbook teaching point this
// condition-library workstream (queue item 7) explicitly built
// severeMetabolicAcidosis to teach.
//
// This module replaces the bucket with a simplified Stewart/Fencl strong-
// ion-difference derivation. HCO3- becomes a DEPENDENT, computed quantity —
// what is physiologically real, and what any condition or drug is now
// expected to move, are:
//   - pat.na / pat.k        real, already-tracked strong cations (renal.js)
//   - pat.clShift            a real strong-anion-difference input for
//                             conditions/derangements that primarily shift
//                             CHLORIDE (hyperchloremic / non-anion-gap
//                             causes: bicarbonate loss, some renal-tubular
//                             physiology) — mEq/L, delta from CL_BASELINE
//   - pat.unmeasuredAnions   a real strong-anion pool for conditions whose
//                             acidosis comes from an ACCUMULATING anion
//                             instead (ketoacids, uremic anions) — mEq/L,
//                             the literal thing "anion gap" measures
//   - pat.sidAdjust           a net strong-ion-difference adjustment for
//                             processes this engine does not itemize
//                             per-ion: chronic renal compensation for
//                             sustained respiratory acid-base derangement
//                             (net acid excretion sustained over days,
//                             functionally raising SID), and acute IV
//                             sodium-bicarbonate treatment (delivers Na+
//                             with no matching Cl-, also raising SID) —
//                             both are the SAME kind of quantity
//                             mechanistically (a strong cation input this
//                             engine has no reason to track ion-by-ion),
//                             so one field serves both.
//   - pat.lactate             already real, already tracked (metabolic.js)
//                             — now a genuine Stewart strong anion instead
//                             of a separate, ad hoc rate-based hco3 drain.
//
// A DELIBERATE SIMPLIFICATION, stated honestly rather than hidden: a full
// Stewart-Figge solve accounts for Ca2+/Mg2+ as separate strong cations and
// solves a cubic in [H+] against albumin/phosphate weak-acid dissociation
// curves. This engine tracks neither calcium/magnesium as SID contributors
// (both are handled elsewhere, as their own direct pharmacologic/membrane
// mechanisms — see cardiovascular.js's calcium/magnesium ECG terms) nor
// albumin/phosphate as independent buffer quantities. Ca2+/Mg2+ are small,
// close-to-constant net contributors in real plasma (roughly +1.5/+1
// mEq/L respectively, cancelling most of their own charge against protein
// binding) and are folded into ACID_BASE_ATOT rather than given their own
// pool. This keeps the derivation a single closed-form algebraic step
// (matching this engine's own tick-rate architecture — no iterative
// solver) while still satisfying the real constraint this item exists to
// enforce: HCO3- is COMPUTED from a strong-ion difference and a real
// pathological anion burden, not asserted by whichever condition wants a
// patient to be acidotic.
import { CL_BASELINE, ACID_BASE_ATOT } from "./constants.js";

export function updateAcidBase(pat) {
  const na = pat.na ?? 140;
  const k = pat.k ?? 4;
  // Chloride, like sodium, is dissolved in and concentrated/diluted by
  // total body WATER — a real pure free-water derangement (SIADH,
  // diabetes insipidus, simple dehydration/overhydration) moves na and cl
  // together, roughly preserving their difference (and therefore SID) —
  // it is not a chloride-specific event. A FLAT cl baseline here (the
  // first version of this module) got this wrong: pat.na already
  // concentrates with water loss via its own mass/water derivation
  // (renal.js), but cl stayed pinned at CL_BASELINE regardless — so a
  // severely hypernatremic patient (diabetes insipidus, hypernatremia)
  // read as artifactually ALKALOTIC, pH climbing to 7.6-7.7 with nothing
  // pathological driving it there. FOUND BY THE SWEEP, not anticipated:
  // scenarioSweep.mjs's own survivable-pH bound flagged both conditions
  // real, before this was shipped. Fixed by scaling the baseline
  // proportionally with na's own concentration relative to its 140
  // reference — the same free-water event that concentrates sodium
  // concentrates chloride by the same fraction, so SID (and therefore
  // hco3) is left roughly UNCHANGED by a pure water derangement, exactly
  // as real physiology requires. pat.clShift remains the lever for a
  // genuine, DISPROPORTIONATE chloride-specific derangement (hyperchloremic
  // acidosis, severeMetabolicAcidosis/addisonianCrisis-adjacent) layered on
  // top of that proportional baseline, not replacing it.
  pat.cl = CL_BASELINE * (na / 140) + (pat.clShift || 0);

  // Apparent strong-ion difference (simplified: Na+ + K+ - Cl-, plus any net
  // exogenous/renal-compensation input this engine doesn't itemize further).
  const sidApparent = na + k - pat.cl + (pat.sidAdjust || 0);

  // Net pathological strong anions consuming that difference before HCO3-
  // ever sees it. Lactate above its own normal ~1 mmol/L baseline is now a
  // real, ALGEBRAIC strong-anion contributor — not the old per-tick RATE
  // that drained hco3 the longer an elevated lactate persisted (which could
  // make a sustained-but-stable lactate look ever-more-acidotic with no
  // floor other than the numeric clamp). Real bicarbonate tracks the
  // CURRENT strong-ion difference instant to instant; it does not have
  // memory of how long an anion has been elevated.
  const excessLactate = Math.max(0, (pat.lactate ?? 1) - 1.0);
  const netStrongAnions = excessLactate + (pat.unmeasuredAnions || 0);

  pat.hco3 = Math.max(5, Math.min(50, sidApparent - netStrongAnions - ACID_BASE_ATOT));

  // Henderson-Hasselbalch, UNCHANGED from before this item — this was
  // already the only site in the engine that ever assigned pat.ph. What
  // changed is what feeds hco3 into it.
  pat.ph = 6.1 + Math.log10(pat.hco3 / (0.03 * (pat.paco2 || 40)));
  pat.ph = Math.max(6.8, Math.min(7.8, pat.ph));
  pat.phScale = Math.round(pat.ph * 100);

  // Anion gap: same formula as before, but now a genuinely faithful signal
  // — see this file's own header for the real defect this fixes (cl used
  // to be back-derived FROM hco3, so it moved in lockstep with any hco3
  // change regardless of cause, and a non-anion-gap acidosis could never
  // actually present as one).
  pat.anionGap = na - (pat.cl + pat.hco3);
}
