# Video script · Module 4 · Lesson 28 · A custom evaluator wrapping an LLM judge

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 4 · Lesson 28 · A custom evaluator wrapping an LLM judge
- **Duration:** ~5 min
- **Objective:** the viewer can write an evaluator that wraps the rubric judge and fails
  loudly on an infrastructure error instead of scoring it.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-28`.

## Block 2 — Pre-production

- `git checkout course/lesson-28`; deps installed.
- `eval.ts` open at `evaluateDraft`, `looksLikeErrorFallback`, `assertNoInfraErrors`; test file open.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> An evaluator scores one output and returns a result the harness aggregates. We build one that
> wraps the rubric judge, and crucially, fails loudly on an infrastructure error instead of
> folding it into the score.

**[Beat 2 · editor: evaluateDraft · 0:30]**
> Here it is. It calls the same score-against-rubric the loop uses, and returns two things:
> passed, the score, and errored, whether this is a real measurement at all. That second field
> is the lesson.

**[Beat 3 · editor: looksLikeErrorFallback · 1:15]**
> Recall the witus-triage bug: the eval folded a fail-soft fallback into its accuracy and
> reported a fake eight percent that was really an unfunded key. The defect was it could not
> tell a bad score from a broken run. Ours can. Looks-like-error-fallback flags when every
> criterion failed and at least one carries an error marker in its evidence. A genuinely weak
> reply looks different from one where the judge itself errored. [cite: McDonald, n.d.]

**[Beat 4 · editor + terminal: assertNoInfraErrors · 2:15]**
> And the harness refuses to report a number for a poisoned run. Assert-no-infra-errors throws:
> this is not a measurement, re-run on a working provider. The test drives the eval with a
> fail-soft judge and asserts it throws, the eval aborts loudly rather than reporting zero
> percent. This is the single most important property an eval can have: produce a real number,
> or fail in a way no one can mistake for a measurement. A silent fake number is worse than a
> crash, because someone will cite it.

**[Beat 5 · talking-head · 3:30]**
> Why wrap the judge and not re-score? One standard, same as Lesson 26. The only thing the
> evaluator adds is the validity check, errored, which is about the measurement, not the
> standard. The anti-pattern is the credulous evaluator that returns a score for every run,
> including broken ones, so infrastructure failures get averaged into your metric.

**[Beat 6 · talking-head · 4:15]**
> An evaluator returns two things: a score, and whether the score is valid. Wrap the runtime
> judge so the standard stays single, add a validity check so failures cannot masquerade as
> measurements, and fail loudly on a poisoned run. An eval you cannot trust to fail loudly is
> an eval you cannot trust at all.

## Block 4 — Post-production

- Beat 2: highlight the `{ passed, errored }` return.
- Beat 3: highlight `allFailed && hasErrorMarker`; lower-third McDonald citation.
- Beat 4: zoom the `throw` and the test's `toThrow(/NOT a measurement/)`.
- Chapter markers at Beats 2, 3, 4, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `eval.ts` — `evaluateDraft`.
- **Beat 3:** `eval.ts` — `looksLikeErrorFallback`.
- **Beat 4:** `eval.ts` — `assertNoInfraErrors`; terminal run pointing at the infra-error
  describe block (throws).

(No optional steps in this lesson — no bonus footage.)
