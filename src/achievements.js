// achievements.js — F15. Data-driven, in the same spirit as conditions.js /
// drugs.js: a definitions table plus a checker, not bespoke code per
// achievement. Reuses the exact ids already defined in assets.js's
// ACHIEVEMENT_ART map (that map was shipped ahead of this system existing),
// so art references and unlock logic share one vocabulary.
//
// Every check reads ONLY existing, already-tracked state (g.lifetimeStats,
// the just-resolved outcome, sandboxRating, the scenario's own imps/PI
// codes) — nothing here required a physiology-engine change, per F15's own
// scope note. Two entries (became_captain / became_chief) have no real
// unlock condition yet: they depend on the Career Mode rank-progression
// system F17 will build, which does not exist. They're shipped LOCKED with
// an honest reason string rather than faked with a fabricated rank number.
//
// SCOPE, STATED HONESTLY: unlocked ids live on `g.achievements`, part of the
// current SAVE (see App.jsx's blank()/CARRY) — there is no separate,
// cross-save player-profile store in this codebase, so achievements are
// per-save, not per-player-across-every-save. Good enough for "Sandbox and
// Career both count," which is what F15 actually asked for; a global
// profile store is a bigger, separate piece of infrastructure.
export const ACHIEVEMENTS = [
  {
    id: "first_save",
    name: "First Save",
    desc: "Complete your very first call, in Sandbox or Career.",
    check: (stats) => stats.callsRun >= 1,
  },
  {
    id: "first_rescue",
    name: "First Rescue",
    desc: "Bring a patient through a call alive.",
    check: (stats) => stats.callsSurvived >= 1,
  },
  {
    id: "heroic_action",
    name: "Heroic Action",
    desc: "Correctly recognize and treat a HIGH-acuity call, and the patient survives.",
    check: (stats) => stats.heroicActions >= 1,
  },
  {
    id: "no_losses_streak",
    name: "No Losses",
    desc: "Survive five calls in a row.",
    check: (stats) => stats.bestSurvivalStreak >= 5,
  },
  {
    id: "five_star_review",
    name: "Five-Star Review",
    desc: "Earn an A grade on a Sandbox call rating.",
    check: (stats) => stats.fiveStarCalls >= 1,
  },
  {
    id: "calls_completed_100",
    name: "Veteran",
    desc: "Complete 100 calls total.",
    check: (stats) => stats.callsRun >= 100,
  },
  {
    id: "perfect_shift",
    name: "Perfect Shift",
    desc: "Finish a Career shift where every call was survived and correctly identified.",
    check: (stats) => stats.perfectShifts >= 1,
  },
  {
    id: "ems_wannabe",
    name: "EMS Wannabe",
    desc: "Zero-To-Hero prologue: get curious about EMS after watching a ParamedicStories video (design doc §2.4).",
    check: (stats) => stats.campaignEmsInterest === "yes",
  },
  {
    id: "not_so_ems",
    name: "Not So EMS of You",
    desc: "Zero-To-Hero prologue: decide EMS isn't for you after watching a ParamedicStories video (design doc §2.4).",
    check: (stats) => stats.campaignEmsInterest === "no",
  },
  {
    id: "declined_patrol_first",
    name: "BOOOOOO",
    desc: "Zero-To-Hero prologue: turn down Northwood PATROL the first time they ask (design doc §2.5).",
    check: (stats) => stats.declinedPatrolFirst === true,
  },
  {
    id: "declined_patrol_twice",
    name: "Really Not Feeling It, Huh?",
    desc: "Zero-To-Hero prologue: turn down Northwood PATROL a second time, at the library (design doc §2.5.1).",
    check: (stats) => stats.declinedPatrolTwice === true,
  },
  {
    id: "gassy_food",
    name: "Gassy Food",
    desc: "Zero-To-Hero: after the naloxone save, pick 8-77 for dinner (design doc §2.7.3).",
    check: (stats) => stats.ateAt877 === true,
  },
  {
    id: "shift_to_remember",
    name: "A Shift to Remember",
    desc: "Zero-To-Hero prologue: complete your first full tutorial shift, all three calls (design doc §2.7.5).",
    check: (stats) => stats.completedTutorialShift === true,
  },
  // ── Chapter 2 (EMR School, design doc §1.6.3/§1.7) ──────────────────────
  {
    id: "moving_up",
    name: "Moving Up",
    desc: "Zero-To-Hero: pass the EMR certification exam (design doc §1.6.3).",
    check: (stats) => stats.emrCertified === true,
  },
  {
    id: "bookworm",
    name: "Bookworm",
    desc: "Zero-To-Hero: pass the EMR written component with a perfect 5/5 on the first attempt (design doc §1.7).",
    check: (stats) => stats.emrExamPerfectFirstTry === true,
  },
  {
    id: "wet_behind_the_ears",
    name: "Wet Behind the Ears",
    desc: "Zero-To-Hero: fail the EMR exam at least once before passing — a badge, not a shame marker; extremely common, rarely stigmatized in real EMS culture (design doc §1.7).",
    check: (stats) => stats.emrFailedOnceBeforePass === true,
  },
  {
    id: "quiet_goodbye",
    name: "Quiet Goodbye",
    desc: "Zero-To-Hero Chapter 2: see your EMR-era partner off with a quiet, appreciative goodbye (design doc §2.6).",
    check: (stats) => stats.ch2QuietGoodbye === true,
  },
  {
    id: "bittersweet",
    name: "Bittersweet",
    desc: "Zero-To-Hero Chapter 2: a more-than-friends goodbye, gated on the friendship actually built (design doc §2.6).",
    check: (stats) => stats.ch2Bittersweet === true,
  },
  {
    id: "amberlamps",
    name: "Amberlamps",
    desc: "Zero-To-Hero Chapter 5: run your first shift as an IFT EMT (design doc §1.6.6/§1.7).",
    check: (stats) => stats.ch5FirstIftShift === true,
  },
  {
    id: "boo_boo_bus_driver",
    name: "Boo Boo Bus Driver",
    desc: "Zero-To-Hero Chapter 5: hired as a 911 EMT at Northwood County EMS (design doc §1.6.6/§1.7).",
    check: (stats) => stats.ch5Hired911 === true,
  },
  {
    id: "party_medic",
    name: "Party Medic",
    desc: "Zero-To-Hero Chapter 5: run your first shift as an Event EMT (design doc §1.6.6/§1.7).",
    check: (stats) => stats.ch5FirstEventShift === true,
  },
  {
    id: "cross_trained",
    name: "Cross-Trained",
    desc: "Zero-To-Hero: successfully switched EMS job paths (design doc §1.6.6/§1.7).",
    check: (stats) => stats.ch5SwitchedPaths === true,
  },
  {
    id: "moonlighter",
    name: "Moonlighter",
    desc: "Zero-To-Hero Chapter 5: held IFT and Event work concurrently (design doc §1.6.6/§1.7).",
    check: (stats) => stats.ch5Moonlighting === true,
  },
  {
    id: "probie_no_more",
    name: "Probie No More",
    desc: "Zero-To-Hero Chapter 5: passed the volunteer fire department's paid entrance exam on the first attempt (design doc §1.6.6/§1.7).",
    check: (stats) => stats.ch5FireHiredFirstAttempt === true,
  },
  // ── Chapter 4 (EMT School, design doc §1.6.5/§1.6.12/§1.7) ──────────────
  {
    id: "the_patch",
    name: "The Patch",
    desc: "Zero-To-Hero: pass the EMT certification exam (design doc §1.6.5).",
    check: (stats) => stats.emtCertified === true,
  },
  {
    id: "two_for_two",
    name: "Two for Two",
    desc: "Zero-To-Hero: pass both the EMR and EMT exams on the first attempt, no retakes at either tier (design doc §1.7).",
    // Honest caveat: Chapter 2 (EMR school) doesn't exist yet as of this
    // batch, so g.emrExamAttempts has no real writer — the credit site
    // (App.jsx's Ch4 exam-result branch) passes emrExamCleanFirstTry as
    // `(g.emrExamAttempts ?? 0) === 0`, which is honestly true for every
    // player until Ch2 starts tracking real EMR retakes, at which point
    // this starts reading real data with no code change needed here.
    check: (stats) => stats.emrExamCleanFirstTry === true && stats.emtExamCleanFirstTry === true,
  },
  // ── §1.6.12 Financial Strain incident (Ch.2/3/4 window) ─────────────────
  {
    id: "paying_my_own_way",
    name: "Paying My Own Way",
    desc: "Zero-To-Hero: resolve the funding-cut incident by taking a part-time job (design doc §1.6.12).",
    check: (stats) => stats.fundingCutResolution === "partTime",
  },
  {
    id: "working_medic",
    name: "Working Medic",
    desc: "Zero-To-Hero: resolve the funding-cut incident by dropping out of school to work full-time (design doc §1.6.12).",
    check: (stats) => stats.fundingCutResolution === "dropOut",
  },
  {
    id: "burning_the_candle",
    name: "Burning the Candle",
    desc: "Zero-To-Hero: resolve the funding-cut incident by successfully balancing both (design doc §1.6.12).",
    check: (stats) => stats.fundingCutResolution === "balancedSuccess",
  },
  {
    id: "stretched_thin",
    name: "Stretched Thin",
    desc: "Zero-To-Hero: attempt to balance both during the funding-cut incident and come up short — a badge, not a shame marker (design doc §1.6.12/§1.7).",
    check: (stats) => stats.fundingCutBalanceFailed === true,
  },
  // ── Chapter 6 (AEMT School, design doc §1.6.7/§1.6.8.1/§1.7) ────────────
  {
    id: "advanced",
    name: "Advanced",
    desc: "Zero-To-Hero: pass the AEMT certification exam (design doc §1.6.7).",
    check: (stats) => stats.aemtCertified === true,
  },
  {
    id: "golden_handcuffs",
    name: "Golden Handcuffs",
    desc: "Zero-To-Hero: accept an employer's tuition-assistance scholarship, taking on a service commitment in return (design doc §1.6.2.1).",
    check: (stats) => stats.acceptedScholarship === true,
  },
  // ── Career-long money (design doc §1.6.2.1/§1.7, not tied to one chapter) ─
  {
    id: "debt_free",
    name: "Debt Free",
    desc: "Zero-To-Hero: pay off all carried student debt after having borrowed at least once (design doc §1.6.2.1).",
    check: (stats) => stats.everCarriedDebt === true && (stats.debt ?? 0) <= 0,
  },
  {
    id: "paid_my_own_way",
    name: "Paid My Own Way",
    desc: "Zero-To-Hero: reach Paramedic certification having never carried debt and never accepted a scholarship — the career-long version of Paying My Own Way (design doc §1.6.2.1).",
    check: (stats) => stats.paramedicCertified === true && stats.everCarriedDebt !== true && stats.acceptedScholarship !== true,
  },
  {
    id: "first_house",
    name: "First House",
    desc: "Zero-To-Hero: buy a starter house off duty (design doc §1.6.2.2).",
    check: (stats) => stats.housingTier === "house",
  },
  {
    id: "off_duty_best_friend",
    name: "Off-Duty Best Friend",
    desc: "Zero-To-Hero: adopt a pet (design doc §1.6.2.2).",
    check: (stats) => stats.hasPet === true,
  },
  // ── Chapter 8 (Paramedic School, design doc §1.6.8/§1.7) ────────────────
  {
    id: "straight_to_medic",
    name: "Straight to Medic",
    desc: "Zero-To-Hero: admitted to paramedic school without ever certifying AEMT — a genuinely rare outlier result (design doc §1.6.8.1).",
    check: (stats) => stats.paramedicAdmittedWithoutAemt === true,
  },
  {
    id: "tubes_and_tubes",
    name: "Tubes and Tubes",
    desc: "Zero-To-Hero: complete the required live intubations during the OR/anesthesia clinical rotation without needing an extension (design doc §1.6.8/§1.7).",
    check: (stats) => stats.ch8IntubationTargetMet === true,
  },
  {
    id: "preceptor_approved",
    name: "Preceptor Approved",
    desc: "Zero-To-Hero: finish the paramedic field internship with no repeated shifts — a clean capstone (design doc §1.6.8/§1.7).",
    check: (stats) => stats.ch8InternshipClean === true,
  },
  {
    id: "gold_patch",
    name: "Gold Patch",
    desc: "Zero-To-Hero: pass the paramedic certification exam gauntlet (design doc §1.6.8).",
    check: (stats) => stats.paramedicCertified === true,
  },
  // ── Social layer (design doc §1.10, career-long) ─────────────────────────
  {
    id: "swept_off_their_feet",
    name: "Swept Off Their Feet",
    desc: "Zero-To-Hero: reach a confirmed romance with any eligible cast member (design doc §1.10.3).",
    check: (stats) => stats.confirmedRomance === true,
  },
  {
    id: "keeping_it_professional",
    name: "Keeping It Professional",
    desc: "Zero-To-Hero: reach Paramedic certification with at least three friendships at 65+ and no romance ever crossing 35 — a real, valid, rewarded way to play (design doc §1.10.3).",
    check: (stats) => stats.paramedicCertified === true && stats.keptItProfessional === true,
  },
  // ── Chapter 9 (Paramedic: The Real Deal, design doc §1.7) ────────────────
  {
    id: "still_here",
    name: "Still Here",
    desc: "Zero-To-Hero: log 50 career-total calls post-certification — a long-haul achievement rewarding continued play (design doc §1.7).",
    check: (stats) => (stats.postCertCalls ?? 0) >= 50,
  },
  {
    id: "taught_the_teacher",
    name: "Taught the Teacher",
    desc: "Zero-To-Hero Chapter 9: precept or teach a practice-scenario session for a lower-tier classmate during the open world (design doc §1.7).",
    check: (stats) => (stats.ch9MentorCount ?? 0) >= 1,
  },
  // ── Chapter 10 (Advanced Roles, design doc §10.1/§1.7) ───────────────────
  {
    id: "super_boo_boo_bus",
    name: "Super Boo Boo Bus",
    desc: "Zero-To-Hero Chapter 10: unlock Critical Care Paramedic (design doc §10.1).",
    check: (stats) => stats.advancedRole === "ccp",
  },
  {
    id: "wings",
    name: "Wings",
    desc: "Zero-To-Hero Chapter 10: unlock Flight Medic (design doc §10.1).",
    check: (stats) => stats.advancedRole === "flight",
  },
  {
    id: "became_captain",
    name: "Became Captain",
    desc: "Not yet reachable — depends on Career Mode's rank-progression system (queue item F17), which hasn't been built.",
    check: () => false,
    locked: true,
  },
  {
    id: "became_chief",
    name: "Became Chief",
    desc: "Not yet reachable — depends on Career Mode's rank-progression system (queue item F17), which hasn't been built.",
    check: () => false,
    locked: true,
  },
];

// Returns the array of achievement ids newly unlocked this check (i.e. in
// `stats` but not already in `already`), for a toast/log line at the moment
// of unlock. Pure function — callers decide how/when to persist the result.
export function newlyUnlocked(stats, already) {
  const have = new Set(already || []);
  return ACHIEVEMENTS.filter(a => !a.locked && !have.has(a.id) && a.check(stats)).map(a => a.id);
}
