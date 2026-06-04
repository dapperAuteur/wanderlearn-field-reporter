# Video script · Module 1 · Lesson 9 · Pattern 2 — convergence detection

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 1 · Lesson 9 · Pattern 2 — convergence detection
- **Duration:** ~5 min
- **Objective:** the viewer can define convergence operationally and implement an
  early exit when revising stops changing the draft.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-09`.

## Block 2 — Pre-production

- `git checkout course/lesson-09`; clean tree; deps installed.
- `termination.ts` open at `hasConverged` and `routeWithAllPatterns`; test file open.
- Slide: the three convergence signals (exact / semantic / score).

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The counter guarantees the loop stops. It does not make the loop smart about
> stopping. Pattern 2 adds the intelligence: detect when revising has stopped
> changing anything, and exit early.

**[Beat 2 · editor: the stall · 0:25]**
> Run the loop with a writer that keeps emitting the same failing draft. The counter
> still saves you at max-revisions, but look what happened in between: three
> identical bad drafts, three critique passes that could never change the outcome.
> The counter caught the runaway. It did not catch the stall.

**[Beat 3 · editor: hasConverged · 1:10]**
> Converged means the output has stopped moving. The simplest honest test is exact
> equality of consecutive drafts. If the two most recent drafts are identical, the
> writer is no longer responding to the critique. Another pass produces the same
> draft and wastes the same tokens.

**[Beat 4 · editor: router branch · 1:55]**
> So the router treats convergence as a reason to stop now. And notice where a
> converged-but-failing run goes: to a human, not to end. Convergence tells you the
> loop is done trying. It does not tell you the answer is good. Different facts,
> different routes.

**[Beat 5 · slide: three signals · 2:35]**
> Exact match keeps this offline and deterministic, but production drafts rarely
> come back byte-identical. Two stronger signals, same idea. Semantic convergence:
> embed consecutive drafts, stop when the distance is tiny. Score convergence: stop
> when the critique score stops improving, even if the text churns. All three define
> a measure of movement and exit when movement falls below a floor.

**[Beat 6 · terminal: convergence test · 3:30]**
> Watch it stop early. This test uses a stalling writer. The run escalates at
> revision two, the first repeat, strictly before the hard cap. That gap between two
> and max-revisions is the budget convergence detection just saved you.

**[Beat 7 · talking-head · 4:15]**
> A bounded loop should stop for the right reason, as early as it honestly can. The
> counter is the backstop. Convergence is the early, intelligent exit. Together, the
> loop spends LLM calls only while those calls might still change the answer.

## Block 4 — Post-production

- Beat 3: highlight the two-draft comparison in `hasConverged`.
- Beat 4: highlight the `hasConverged` branch routing to `flag_for_human`.
- Beat 6: zoom the "escalates at revision 2" assertion.
- Chapter markers at Beats 3, 5, 6.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** narrate over `termination.ts`; optionally show a 3-identical-draft
  history in a comment.
- **Beat 3:** `hasConverged` function; highlight `latest === previous`.
- **Beat 4:** `routeWithAllPatterns`; highlight the convergence line → `flag_for_human`.
- **Beat 5:** three-signals slide.
- **Beat 6:** terminal — run the Module 1 test; point at the "Pattern 2" block and
  the revision-2 assertion.

## Bonus footage — Optional: score-based convergence using the rubric (preview of Module 2)

> Optional advanced path mentioned in the lesson. Record as a separate ~75s clip.

**Pre-production:** a scratch branch where `hasConverged` is replaced by a
score-delta check reading consecutive `critique` scores.

**VO (verbatim):**
> Optional, and a preview of Module 2. Instead of comparing draft text, compare the
> critique score across passes and stop when it stops improving. This is often the
> most robust convergence signal, because it measures progress toward the goal
> directly rather than guessing from how much the text changed. You will have a real
> scored rubric after Module 2; come back and wire it in here.

**Shot list:** show a `hasScoreConverged(history)` helper comparing the count of
passed checks on the last two critiques; swap it into the router; re-run the test to
show identical escalation behavior. Re-revert afterward to keep `main` on the
text-based version.
