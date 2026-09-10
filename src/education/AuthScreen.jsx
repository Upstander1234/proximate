import { useState } from "react";
import { signIn, signUp, signInWithGoogle } from "./auth.js";
import { saveProfile, PROVIDER_LEVELS } from "./profile.js";

export default function AuthScreen({ onDone, allowGuest = true }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [providerLevel, setProviderLevel] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && !providerLevel) {
      setError("Please select the provider level you're studying for.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const fbUser = await signUp(email, password, name);
        await saveProfile({ uid: fbUser.uid, isGuest: false }, { providerLevel });
      } else {
        await signIn(email, password);
      }
      onDone();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogle();
      onDone();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h2 className="text-2xl font-bold">{mode === "signup" ? "Create account" : "Sign in"}</h2>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
          />
        )}
        {mode === "signup" && (
          <select
            required
            value={providerLevel}
            onChange={(e) => setProviderLevel(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100"
          >
            <option value="" disabled>
              Provider level (current or studying for)
            </option>
            {PROVIDER_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        )}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium disabled:opacity-50"
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
      <button disabled={busy} onClick={google} className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium">
        Continue with Google
      </button>
      <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="w-full text-sm text-slate-400 hover:text-white">
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
      {allowGuest && (
        <button onClick={onDone} className="w-full text-sm text-slate-500 hover:text-slate-300">
          Continue as guest instead
        </button>
      )}
    </div>
  );
}
