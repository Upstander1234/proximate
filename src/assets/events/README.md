# Downtime / story event illustrations

Covers `EVENT_ART` in `src/assets.js` — illustrations for the between-call
narrative beats F17 (Career Mode overhaul) introduces, as opposed to
`EMERGENCY_ART` (on-duty call types) or the character portrait/expression/pose
sets (the people IN these scenes).

## Purpose
One illustration per downtime-event category, used by the F17 downtime-event
system's event cards/dialogue screens (`src/downtimeEvents.js`, shipped this
session — see its own header comment for the event data shape).

## Intended appearance
Medium/close illustrations of a station-life moment — two or more characters
in a normal, human beat (not a clinical scene). Warmer and more intimate than
the emergency-scene art; this is about the crew's life between calls.

## Theme / style
Same restrained illustrated style as the rest of the set, but permitted a
warmer palette than the clinical in-call screens — these are meant to feel
like a breath between calls, not more clinical tension.

## Assets (`EVENT_ART`)
`promotion`, `training_day`, `argument`, `birthday`, `equipment_failure`,
`station_inspection`, `storm`, `graduation`, `retirement`, `funeral`,
`award_ceremony`. Each corresponds to a category the downtime-event data table
can tag an event with (`src/downtimeEvents.js`'s `art` field) — additional
categories should get a matching entry here when new event categories are
authored, not reuse an unrelated existing illustration.

## Notes for the artist / asset generator
`EVENT_ART` had zero call sites before this session; the downtime-event
overlay (F17) now reads `EVENT_ART[event.art]` with a graceful fallback to
`PLACEHOLDERS.generic` for any event that doesn't specify one yet.
