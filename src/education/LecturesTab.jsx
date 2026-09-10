import { LECTURES, LECTURE_CATEGORIES_BY_LEVEL } from "./lectures.js";

export default function LecturesTab({ onOpenPractice }) {
  const categories = LECTURE_CATEGORIES_BY_LEVEL.EMT;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Lectures</h1>
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700">
            Work in progress
          </span>
        </div>
        <p className="text-slate-400 mt-2">
          Short, focused lessons on one specific condition or concept at a time — think{" "}
          <span className="text-slate-300">Cardiology → Acute Coronary Syndrome → Lecture → Key Concepts →
          Practice Questions</span>, not a giant general textbook chapter. Lecture content hasn't shipped
          yet, but the structure below is ready for it.
        </p>
      </div>

      {LECTURES.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center space-y-3">
          <div className="text-lg font-semibold text-slate-200">No lectures yet</div>
          <div className="text-sm text-slate-400 max-w-md mx-auto">
            Lectures are coming to Proximate as focused, topic-level lessons connected directly to real
            practice questions and your spaced-repetition schedule. In the meantime, MCQ Practice and the
            Adaptive Practice Exam already cover the full EMT-B question bank.
          </div>
          <button
            onClick={onOpenPractice}
            className="mt-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium"
          >
            Go to MCQ Practice instead
          </button>
        </div>
      )}

      <div>
        <div className="text-sm text-slate-400 mb-2">Planned categories (EMT-B)</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div
              key={cat}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 opacity-60"
            >
              <div className="font-semibold">{cat}</div>
              <div className="text-xs text-slate-500 mt-1">No lectures published yet</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
