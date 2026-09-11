import { useState } from "react";
import { DAILY_CHALLENGES } from "./dailyChallenge.js";

export default function DailyChallengeTab({ user }) {
  const [active, setActive] = useState(DAILY_CHALLENGES[0]?.key || null);

  if (DAILY_CHALLENGES.length === 0) {
    return <div className="text-slate-400 text-center py-20">No daily challenges available yet.</div>;
  }

  const activeChallenge = DAILY_CHALLENGES.find((c) => c.key === active);

  return (
    <div className="space-y-6">
      {DAILY_CHALLENGES.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {DAILY_CHALLENGES.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                active === c.key ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {activeChallenge && <activeChallenge.Component user={user} />}
    </div>
  );
}
