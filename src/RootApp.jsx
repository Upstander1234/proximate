import { useState } from "react";
import App from "./App.jsx";
import EducationApp from "./education/EducationApp.jsx";

export default function RootApp() {
  const [mode, setMode] = useState(null); // null | "game" | "education"

  if (mode === "game") return <App />;
  if (mode === "education") return <EducationApp onExit={() => setMode(null)} />;
  return <HomePage onPick={setMode} />;
}

function HomePage({ onPick }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center space-y-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">Proximate</h1>
          <p className="text-slate-400 mt-3">Pick a mode to get started.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Tile
            title="Game"
            badge="VERY WIP"
            badgeClass="bg-amber-900/60 text-amber-300 border border-amber-700"
            description="The prehospital-care physiology simulator. Diagnose and treat patients in real scenarios."
            cta="Play"
            onClick={() => onPick("game")}
          />
          <Tile
            title="Education"
            badge="NREMT Prep"
            badgeClass="bg-emerald-900/60 text-emerald-300 border border-emerald-700"
            description="Spaced-repetition practice questions for the NREMT exam. Free, sign in to save your progress."
            cta="Study"
            onClick={() => onPick("education")}
          />
        </div>
      </div>
    </div>
  );
}

function Tile({ title, badge, badgeClass, description, cta, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-700 transition p-6 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-slate-400 flex-1">{description}</p>
      <div className="text-sm font-medium text-sky-400 group-hover:text-sky-300">
        {cta} →
      </div>
    </button>
  );
}
