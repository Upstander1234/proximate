import { useEffect, useState } from "react";
import { DAILY_CHALLENGES } from "./dailyChallenge.js";

// initialChallenge/launchId let recommendations deep-link straight to a
// specific daily game (e.g. QOTD or Medicdle). onOpenMedicdleSubmit opens the
// "Submit a Medicdle" form from the Medicdle community-stats footer.
export default function DailyChallengeTab({ user, initialChallenge, launchId, onOpenMedicdleSubmit }) {
  const validKeys = new Set(DAILY_CHALLENGES.map((c) => c.key));
  const [active, setActive] = useState(() =>
    initialChallenge && validKeys.has(initialChallenge) ? initialChallenge : DAILY_CHALLENGES[0]?.key || null
  );

  // launchId changes only when a recommendation explicitly asked for a
  // different game, so this event-driven sync is the supported pattern (the
  // same "setTimeout in effect" shape MedicdleCommunityStats.jsx already
  // uses to satisfy react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!launchId) return;
    if (initialChallenge && validKeys.has(initialChallenge)) {
      const t = setTimeout(() => setActive(initialChallenge), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchId]);

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
      {activeChallenge && (
        <activeChallenge.Component
          user={user}
          {...(activeChallenge.key === "medicdle" ? { onOpenSubmit: onOpenMedicdleSubmit } : {})}
        />
      )}
    </div>
  );
}
