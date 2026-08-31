STANDARD WORKING LOOP FOR EACH TASK:

1. ORIENT. Read CLAUDE.md (order given in RULES above) to understand
   current authoritative state. If the task references a queue item /
   numbered item, read that item's FULL body, not just its opening line.

2. VERIFY THE CLAIM AGAINST THE TREE. For whatever you're about to touch
   or build on top of: grep the relevant field/function/file. Confirm it
   actually exists and does what the doc says before planning around it.

3. SCOPE THE BATCH. Do one coherent, reviewable unit of work. A small
   verified batch beats a large unverified one. If a task looks like it
   spans several genuinely independent pieces, do them as separate
   sequential batches, each fully verified before starting the next —
   don't let verification pile up at the end of a big multi-part change.

4. FOR PHYSIOLOGY-ENGINE WORK SPECIFICALLY, follow this loop per
   condition/mechanism:
     a. Research the real clinical mechanism BEFORE looking at the code.
        What does the disease/drug actually do, mechanistically, and on
        what time course? Cite the source.
     b. Diff that against what the code currently does. Expect gaps in
        both directions (missing mechanisms, and dead fields nothing
        reads).
     c. Wire missing mechanisms through EXISTING engine handles/receptors
        where possible, not new stat writes. If a mechanism genuinely
        doesn't exist yet, add it to the right physiology module.
     d. Give it a real, literature-anchored time course — not a step
        function.
     e. Make treatment act through the same mechanism the disease uses,
        not a scripted response.
     f. Add two-sided assertions (fires when it should; does NOT fire when
        it shouldn't) to the relevant regression suite. Add any new field
        to the sweep/presence-check suite.

5. INSTRUMENT, DON'T RECONSTRUCT. When measuring an engine behavior for
   calibration or verification, drive the real code path (direct
   construction + the real update/tick functions), never a hand-written
   reimplementation of the formula. Strip the probe script afterward.

6. VERIFY.
   - Physiology: run the relevant suite(s) to completion; check the
     result file/output for the actual pass count, not just "no failures
     so far" (a truncated run is not a pass).
   - Front end: `npx vite build`, `npx eslint` against baseline, re-read
     the touched code paths for regressions, and real click-through via
     browser automation tooling if it exists in this repo.

7. REPORT AND RECORD. State clearly: what changed, what was measured
   (with numbers), what's still open, what was NOT verified. Update
   whatever tracking mechanism this project uses (CLAUDE.md's queue
   structure, or its CLINE-appropriate equivalent) — remove finished items
   from "open," add newly-discovered deferred items as new tracked items,
   don't leave either only in a code comment or only in this chat.

8. STOP AT A VERIFIED BOUNDARY. If you're interrupted or running low on
   context/turns mid-batch, stop, verify whatever unit is actually
   complete, and write down explicitly what is done vs. unverified vs.
   untouched — don't let an in-progress batch get silently treated as
   shipped.

WHEN PICKING UP A NEW TASK WITH NO EXPLICIT INSTRUCTION: work the current
top-priority open item as tracked (front-end/gameplay items before
numbered physiology items, unless told otherwise), top to bottom by
leverage — but confirm that item is still genuinely open (step 2) before
starting, since backlogs drift.