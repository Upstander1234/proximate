import { useEffect, useRef, useState } from "react";

// A type-to-filter combobox: the player starts typing a diagnosis and picks
// from the matching options that appear, rather than scrolling a plain
// <select> or typing free text that has to be fuzzy-matched. Selecting an
// option is the only way to commit a value — matching stays exact-key,
// never spelling-sensitive.
//
// The parent should pass a changing `resetKey` (e.g. the current stage
// number) whenever it wants the typed text cleared out from under this
// component (after a guess is submitted) — that remounts this component
// with fresh internal state, rather than syncing external state back into
// local text via an effect.
export default function DiagnosisCombobox({ options, value, onChange, placeholder = "Type a diagnosis…" }) {
  const selected = options.find((o) => o.key === value) || null;
  const [query, setQuery] = useState(selected?.name || "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.name.toLowerCase().includes(q))
    : options;

  const commit = (opt) => {
    onChange(opt.key);
    setQuery(opt.name);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) commit(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative flex-1">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
          if (value) onChange(""); // typing invalidates a previously-picked value
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-slate-800 bg-slate-900 shadow-lg">
          {filtered.map((o, i) => (
            <li
              key={o.key}
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus, avoid blur-before-click races
                commit(o);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2 text-sm cursor-pointer ${
                i === highlight ? "bg-sky-600 text-white" : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              {o.name}
            </li>
          ))}
        </ul>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-500 shadow-lg">
          No matching diagnoses.
        </div>
      )}
    </div>
  );
}
