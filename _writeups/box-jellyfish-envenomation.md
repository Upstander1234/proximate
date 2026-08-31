### Physiology-engine batch: `boxJellyfishSting` shipped (queue item 7, Toxicology/Environmental)

Confirmed unbuilt before starting (grep for `jellyfish`/`marine`/`sting` in
`conditions.js`: no matches). Real mechanism, genuinely different from this
session's own already-shipped `envenomation` (crotaline/pit-viper
coagulopathy — read that condition's own template/comment first, per this
batch's instruction, before building a distinct one): box jellyfish
(Chironex fleckeri and relatives) venom contains pore-forming toxins that
act directly on cardiac myocyte membranes, causing potassium efflux and a
real, dangerous cardiotoxic/arrhythmogenic effect — cardiovascular collapse
and lethal arrhythmia, not a hemostatic/coagulopathy picture (Winkel et al.
and Currie, "Marine antivenoms," J Toxicol 2003).

**Wired as direct field ceilings**, the same "direct field ceilings, not
routed through an unrelated pathway" idiom `envenomation`'s own coagulation-
factor ceilings already established, applied here to a genuinely different
(cardiac, not hemotoxic) venom target:
- `pat.rhythmInstability` (`cardiovascular.js`'s real arrhythmia-substrate
  accumulator, the same field the AICD-magnet-suppression batch already
  established a condition can add to directly) accrues a real, modest,
  gated-on-`icdSuppressed` contribution.
- `pat.contractilityFactor` (already a real, condition-owned multiplier —
  reused, not reset, per `takotsubo`'s own precedent) carries a real, if
  modest, direct myocardial-depressant component.

**Field treatment, stated honestly.** Vinegar (acetic acid) is the real,
guideline-supported first-aid measure — it deactivates UNFIRED nematocysts
still adherent to the skin, preventing further envenomation from tentacle
fragments, but does nothing to reverse venom already injected (Currie
2003). No field antivenom mechanism is modeled: real Australian box
jellyfish antivenom is a hospital-administered product not carried in this
formulary, matching the same honest "recognize, decontaminate, supportive
care, no field antidote" precedent `envenomation`'s own crotaline write-up
already established for a different venom class. The condition's own
`progress()` comment records that vinegar is NOT a treatment lever for the
cardiotoxic substrate itself (it only prevents further envenomation, not
reversal of venom already on board) — the scenario narrates bystanders
already applying it on scene, matching real first-aid practice.

New scenario `boxJellyfishSting` (ENV-015, `src/data/scenarios.js`) — a
beach sting with visible whip-like welts and a live `heart` probe reading
`v.rhythm` for the real, developing cardiotoxic substrate. `App.jsx`'s
`SCEN_BODY_SYSTEM` map gained `boxJellyfishSting:"Toxicology"`.

**MEASURED**: untreated at 900s, rhythmInstability 0.090, contractilityFactor
0.978, intrinsicPain 9.1, hr 119.5 — real, developing arrhythmia risk and
mild myocardial depression, correctly NOT yet crossing the engine's own
vtDrive threshold at this presenting severity (a single sting, not an
immediately lethal envenomation — real box jellyfish stings vary widely in
severity). A condition-less control shows exactly zero rhythmInstability
contribution and an unchanged contractilityFactor. `coagPct` is confirmed
completely untouched (100 in both arms) — direct, measured proof this is a
genuinely different (cardiotoxic, not hemotoxic) mechanism from crotaline
envenomation, not a relabeled copy.

**Three new two-sided `mechanismWiring.mjs` assertions** (source-only, new
`[BOX JELLYFISH ENVENOMATION — queue item 7, Toxicology/Environmental]`
section): presence, specificity against a healthy control, and the
coagulation-independence check against crotaline's own mechanism.
`rhythmInstability`/`contractilityFactor`/`intrinsicPain`/`coagPct` were all
already-tracked fields — no new scenarioSweep entries were needed.

**Verification.** `node --check` clean. `npx eslint` on all touched files:
zero findings. Direct-instantiation probes confirmed all assertion logic
passes and the scenario resolves end to end. Probe scripts stripped.
