import { useEffect, useState } from "react";
import { loadProfile, saveProfile, PROVIDER_LEVELS } from "./profile.js";

export default function ProfileSettings({ user, onBack }) {
  const [providerLevel, setProviderLevel] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadProfile(user).then((p) => {
      if (!active) return;
      setProviderLevel(p?.providerLevel || "");
      setIsStudent(!!p?.isStudent);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const save = async () => {
    setError("");
    setBusy(true);
    try {
      await saveProfile(user, { providerLevel: providerLevel || null, isStudent });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message || "Couldn't save your profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile</h2>
        <button onClick={onBack} className="text-sm text-slate-400 hover:text-white underline underline-offset-4">
          Back
        </button>
      </div>

      {!loaded ? (
        <div className="text-slate-400 text-sm py-10 text-center">Loading...</div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm text-slate-400">Provider level</label>
            <select
              value={providerLevel}
              onChange={(e) => setProviderLevel(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100"
            >
              <option value="">Not set</option>
              {PROVIDER_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500">
              Used to weight how your answers affect each question's community difficulty rating.
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
              className="rounded border-slate-700"
            />
            Currently a student
            <span className="text-xs text-slate-500">(just a badge, doesn't affect anything)</span>
          </label>

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button
            disabled={busy}
            onClick={save}
            className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium disabled:opacity-50"
          >
            {saved ? "Saved" : busy ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
