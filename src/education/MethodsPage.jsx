import { BLUEPRINT_CATEGORIES } from "./contentBlueprint.js";
import { MIN_QUESTIONS, MAX_QUESTIONS } from "./adaptiveEngine.js";

export default function MethodsPage({ onBack }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
        ← Back
      </button>
      <div>
        <h1 className="text-3xl font-bold">How Proximate's Adaptive Exam Works</h1>
        <p className="text-slate-400 mt-2">
          This page explains, in plain language, how question selection and your results are calculated —
          and what Proximate's practice exam is not.
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
