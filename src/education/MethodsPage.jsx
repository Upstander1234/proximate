import { BLUEPRINT_CATEGORIES } from "./contentBlueprint.js";
import { MIN_QUESTIONS, MAX_QUESTIONS } from "./adaptiveEngine.js";
import { TARGET_ACCURACY } from "./userStats.js";
import { MIN_RESPONSES_FOR_DISPLAY } from "./itemStats.js";
import { LEECH_THRESHOLD } from "./srs.js";

export default function MethodsPage({ onBack }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
        ← Back
      </button>
      <div>
        <h1 className="text-3xl font-bold">How Proximate's Education System Works</h1>
        <p className="text-slate-400 mt-2">
          This page explains, in plain language, every real calculation and design decision behind
          Proximate's study tools — question selection, spaced repetition, difficulty and prediction
          estimates, and the study suggestions on your dashboard — and what each one is not.
        </p>
      </div>

      <Section title="This is not the NREMT exam">
        Proximate does not have access to, and does not claim to reproduce, NREMT's own proprietary
        adaptive-testing algorithm or scoring method. What follows is Proximate's own design, inspired by
        publicly available information about computerized adaptive testing (CAT) principles in general and
        the publicly described structure of the NREMT EMT cognitive exam. Your result is an educational
        practice metric — Proximate's own estimated EMT readiness — never an official NREMT score, an
        NREMT prediction, or a guarantee of passing the real exam.
      </Section>

      <Section title="How questions are selected">
        Every question you're offered is chosen to give useful information about your current estimated
        ability — not simply the hardest or easiest question available. The selection considers, together:
        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
          <li>your current estimated ability</li>
          <li>each candidate question's estimated difficulty and discrimination</li>
          <li>how much community response data backs that difficulty estimate (its reliability/confidence)</li>
          <li>whether you've seen the question before, in any part of Proximate</li>
          <li>whether the question is manually approved and appropriate for EMT-B</li>
          <li>the NREMT content blueprint below, so the exam doesn't drift toward whichever category
            happens to have the most (or the most statistically useful) questions</li>
        </ul>
      </Section>

      <Section title="An IRT-style ability model">
        Proximate uses an item-response-theory-style (2-parameter logistic) model, not a simple
        "difficulty plus one / minus one" staircase. The model maintains a user ability estimate, a
        standard error for that estimate, and per-item difficulty and discrimination parameters. A correct
        answer generally raises your ability estimate and shifts subsequent questions toward higher
        difficulty; an incorrect answer generally lowers it and shifts toward lower difficulty — but the
        actual next question is the one estimated to give the most USEFUL information about your ability
        at that point, not simply a harder or easier one.
      </Section>

      <Section title="Community difficulty vs. your ability">
        A question's "community difficulty" comes from how everyone who has answered it has performed —
        it is tracked completely separately from any one user's ability estimate, and separately again
        from the question's quality (a manual approval decision). An 80%-correct question is never used
        as a stand-in for how able YOU are — that's what the ability model is for.
      </Section>

      <Section title="New questions become more reliable over time">
        Proximate launches with a large EMT-B question bank and, initially, relatively few responses per
        question. A question's difficulty estimate is treated as provisional until enough real responses
        back it, and heavily shrunk toward a neutral, medium-difficulty assumption until then. As more
        users answer a question, its difficulty (and, eventually, discrimination) estimate becomes more
        reliable, and it naturally moves from "provisional" to "fully trusted" in the adaptive selection
        process — no manual recalibration is required.
      </Section>

      <Section title={`Exam length: ${MIN_QUESTIONS}–${MAX_QUESTIONS} questions`}>
        The exam never ends before {MIN_QUESTIONS} questions, matching the range publicly described for the
        NREMT EMT cognitive exam (70–120 items). Once {MIN_QUESTIONS} questions have been answered, the
        exam may end if your ability estimate has reached Proximate's own 99% confidence stopping
        criterion — intentionally tighter than the 95% band often associated with NREMT-style CAT, since
        Proximate's own questions aren't guaranteed to be equivalent to real NREMT items. If that
        confidence level hasn't been reached by {MAX_QUESTIONS} questions, the exam stops there and says so
        plainly — it does not claim to have reached its normal confidence-based stopping point when it
        hasn't.
      </Section>

      <Section title="The NREMT content blueprint used">
        <table className="w-full text-sm mt-2">
          <tbody>
            {BLUEPRINT_CATEGORIES.map((c) => (
              <tr key={c.key} className="border-t border-slate-800">
                <td className="py-2 pr-4 text-slate-300">{c.label}</td>
                <td className="py-2 text-slate-400 text-right">
                  {c.minPct}–{c.maxPct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-slate-400">
          Because Proximate's existing questions are tagged by body-system topic rather than by
          assessment phase, each question's blueprint category is currently derived from its topic using a
          documented approximation, not hand-tagged individually — stated here plainly as a known
          limitation of the current content library, not hidden.
        </p>
      </Section>

      <Section title="Never-before-seen questions come first">
        A question counts as "seen" the moment it is shown to you anywhere in Proximate — MCQ Practice,
        a prior adaptive exam, or any future presentation context — using the same attempt/history
        architecture the rest of Proximate uses, not a separate one. The adaptive exam prioritizes
        questions you've never seen, with reliable difficulty data, that suit your current ability, while
        respecting the content blueprint. If you exhaust every eligible question in the bank, Proximate
        tells you so and continues using the best available questions, still chosen to be statistically
        useful, rather than failing.
      </Section>

      <Section title="Answer randomization">
        Every time a question is shown, its answer choices are shuffled independently. The underlying
        correct answer never changes — only its on-screen position does — and your response is always
        recorded against that stable, underlying answer, not whichever position it happened to appear in.
      </Section>

      <div className="pt-2">
        <h2 className="text-xl font-bold">Personal statistics</h2>
        <p className="text-slate-400 mt-1 text-sm">
          The numbers on your dashboard and Progress tab, and where each one actually comes from.
        </p>
      </div>

      <Section title="Your accuracy is your real answer record, not your self-rating">
        MCQ Practice asks two separate things after each question: which answer you picked (right there,
        immediately, graded against the real answer key), and then, separately, how well you personally
        felt you recalled it — Again / Hard / Good / Easy — which only controls when Proximate schedules
        that card again (see "Spaced repetition scheduling" below). Your displayed accuracy is computed
        exclusively from the first of those — the actual multiple-choice answer you chose — never from the
        second. Picking the wrong answer and later rating your recall "Good" (because you understood the
        explanation, say) does not, and cannot, make that question count as correct.
      </Section>

      <Section title="Weakest / strongest domain">
        A domain is only ever flagged as your weakest or strongest once you've answered at least 3
        questions in it. Below that, Proximate doesn't have enough of a sample to say anything meaningful
        and simply doesn't flag a weakest domain at all, rather than reacting to one or two lucky or
        unlucky guesses.
      </Section>

      <Section title={`"Consider completing N questions": how N is calculated`}>
        This number is a real, computed projection, not a fixed suggestion. It assumes you go on to answer
        every future question in that domain at exactly {Math.round(TARGET_ACCURACY * 100)}% — the
        conventional mastery-learning cut popularized by Benjamin Bloom's 1968 "Learning for Mastery" and
        used in most criterion-referenced classroom testing since — and solves for the smallest number of
        additional questions that would pull your CUMULATIVE (running-average) accuracy in that domain up
        to {Math.round(TARGET_ACCURACY * 100)}%, as displayed (rounded to the nearest whole percent, same
        as every other accuracy number here).
        <p className="mt-2">
          Concretely, with <span className="text-slate-300">n</span> questions answered so far and{" "}
          <span className="text-slate-300">c</span> answered correctly, it solves for the smallest integer{" "}
          <span className="text-slate-300">m</span> such that{" "}
          <span className="font-mono text-xs text-slate-300">
            (c + {Math.round(TARGET_ACCURACY * 100) / 100}·m) / (n + m)
          </span>{" "}
          rounds to {Math.round(TARGET_ACCURACY * 100)}%.
        </p>
        <p className="mt-2">
          This is a translation of John Carroll's 1963 "A Model of School Learning" — which frames mastery
          as a function of how much further practice, at a learner's achievable performance level, it
          takes to bring cumulative performance up to a criterion — from Carroll's original time axis onto
          a question-count axis, the natural unit for a spaced-repetition question bank.
        </p>
        <p className="mt-2 text-amber-400/90">
          What this number is NOT: a prediction that your underlying knowledge will spontaneously improve,
          or a guarantee that answering that many questions will actually get you there. It's a completion
          estimate under a stated best-case assumption — if your true performance going forward is below{" "}
          {Math.round(TARGET_ACCURACY * 100)}%, no number of additional questions at that same (lower) rate
          will ever bring your average up to {Math.round(TARGET_ACCURACY * 100)}%; you'd need to actually
          study and improve, which is the entire point of the spaced-repetition system this number sits
          next to.
        </p>
        <p className="mt-2">
          If your current accuracy in that domain is already at or above{" "}
          {Math.round(TARGET_ACCURACY * 100)}%, Proximate says so directly instead of showing a number.
        </p>
      </Section>

      <div className="pt-2">
        <h2 className="text-xl font-bold">Spaced repetition scheduling</h2>
        <p className="text-slate-400 mt-1 text-sm">
          What actually happens when you rate a card Again / Hard / Good / Easy.
        </p>
      </div>

      <Section title="An Anki-style SM-2 variant">
        MCQ Practice schedules review using a variant of the SM-2 algorithm (the scheduling method behind
        SuperMemo and, later, Anki), not a fixed daily quiz. Each question card moves through three phases:
        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
          <li>
            <span className="text-slate-200">new</span> — never successfully reviewed yet; walks a short
            ladder (10 minutes, then 1 day) before graduating
          </li>
          <li>
            <span className="text-slate-200">review</span> — the normal long-run interval, growing by your
            personal ease factor each time you rate it Good or Easy
          </li>
          <li>
            <span className="text-slate-200">relearning</span> — a graduated card you just rated Again (a
            "lapse"); walks a short ladder again before returning to review at a reduced interval
          </li>
        </ul>
        <p className="mt-2">
          A card that keeps coming back wrong is flagged as a "leech" once it has lapsed{" "}
          {LEECH_THRESHOLD} times, so you can tell it apart from ordinary forgetting and give it real,
          focused attention rather than letting the scheduler keep quietly re-queuing it.
        </p>
      </Section>

      <div className="pt-2">
        <h2 className="text-xl font-bold">Predicted probability of correctness</h2>
        <p className="text-slate-400 mt-1 text-sm">
          The "Proximate predicts: N% chance correct" line shown before you answer.
        </p>
      </div>

      <Section title="A blend of community difficulty and your own recent accuracy">
        Before you answer, Proximate estimates your chance of getting the question right by blending two
        real signals: how everyone else who has answered this specific question has done (community
        difficulty, weighted 60%), and your own recent overall accuracy (weighted 40%). If one of those
        inputs doesn't exist yet — a brand-new question with no community responses, or a brand-new user
        with no answer history — the estimate falls back to whichever real input is available, or a
        neutral 65% if neither exists.
        <p className="mt-2">
          After you answer, both the prediction and the real outcome are logged, and Proximate's Progress
          tab shows a real calibration curve (predicted vs. actual accuracy, bucketed in 10% bands) so you
          — and Proximate's own maintainers — can see whether these predictions run over- or
          under-confident, and where.
        </p>
      </Section>

      <div className="pt-2">
        <h2 className="text-xl font-bold">Community item statistics</h2>
        <p className="text-slate-400 mt-1 text-sm">
          How a question's own difficulty and answer-choice breakdown are built from everyone's responses.
        </p>
      </div>

      <Section title="Responses are weighted by provider level, not counted 1-for-1">
        A question's community difficulty isn't a flat "N out of M people got this right." Every response
        is weighted by how the RESPONDER's own stated provider level relates to the QUESTION's own level:
        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
          <li>no provider level saved (a guest, or "Other Healthcare Professional"): contributes nothing</li>
          <li>same level as the question: counts normally (1× either way)</li>
          <li>
            one level below the question: a correct answer counts extra (1.5×) — a below-level provider
            getting it right is stronger evidence the question is answerable — while a wrong answer isn't
            held against it at all
          </li>
          <li>
            two or more levels below: correct answers count for even more (3×, capped there); wrong
            answers still aren't held against it
          </li>
          <li>
            above the question's own level: a correct answer proves nothing (0×) — of course a paramedic
            gets an EMT-level question right — while a wrong answer is weighted like two same-level misses,
            since that's a stronger signal something is actually off with the question
          </li>
        </ul>
        <p className="mt-2">
          A question's difficulty is treated as provisional, and heavily shrunk toward a neutral,
          medium-difficulty assumption, until it has at least {MIN_RESPONSES_FOR_DISPLAY} real weighted
          responses behind it — so a brand-new question with two responses can't masquerade as
          confidently easy or hard.
        </p>
      </Section>

      <Section title="Everyone's raw response count still moves the site-wide activity counter">
        Separately from difficulty weighting, Proximate's community-wide "questions answered" counter
        (shown on the dashboard) counts every real answer submitted by every user, regardless of provider
        level — it's a plain engagement count, not a calibration signal, and is deliberately kept
        independent of the weighting scheme above so an unset provider level never makes a real answer
        vanish from either number for the wrong reason.
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="font-semibold text-lg mb-2">{title}</div>
      <div className="text-sm text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}
