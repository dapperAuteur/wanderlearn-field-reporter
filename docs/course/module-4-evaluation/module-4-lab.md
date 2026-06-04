# Module 4 · Lab · Build a regression eval that fails loudly

> **Goal:** grow the dataset, catch a regression you introduce, and prove your eval aborts on an
> infrastructure error instead of scoring it.
> **Success signal:** `npm run test -- tests/course/module-4-evaluation.test.ts` green with your
> additions; a regression you introduce turns the gate red; a poisoned run throws. Offline, no key.

Work on `course/lesson-31`. Code: `examples/support-reply-loop/eval.ts`.

## Part A — Grow the dataset from a "production miss" (required)

1. Add two examples to `supportReplyDataset`: one you expect to **pass**, one you expect to
   **fail** (e.g., a ticket with two unrelated problems, or one with no graspable keyword).
2. Re-run the suite and read the new pass rate. Confirm the failing case lowers it.
3. Write one sentence: which real production failure would have motivated each new example?

## Part B — Catch a regression (required)

1. Introduce a regression: in a copy of the loop target, weaken the writer (or lower a rubric
   weight so a real check stops blocking).
2. Run `runEval` on both the good and regressed targets and assert, in a test, that the good one
   clears `meetsThreshold(report, 0.7)` and the regressed one does not.
3. Confirm the *pairwise* comparison also shows the regression (the good target wins the cases the
   regressed one lost).

## Part C — Prove it fails loudly (required)

1. Run the eval with `failSoftJudge` as both the loop's judge and the evaluator's judge.
2. Assert `report.erroredCount > 0` and that `assertNoInfraErrors(report)` **throws** with a
   message containing "NOT a measurement".
3. Now remove the `"<error"` marker from `failSoftJudge`'s evidence and re-run. Watch the run
   score a fake `0%` instead of aborting — that is the witus-triage bug. Restore the marker.

## Part D — Set a margin you can defend (stretch, optional)

Pretend the judge is a real LLM whose pass rate on a good system wobbles between 0.82 and 0.94.
Pick a threshold and justify it in one sentence (it should survive 0.82 but reject a regression to
0.6). Add a comment to your test recording the reasoning.

## Self-check rubric

| Check | Pass condition |
|---|---|
| Dataset grown | two new examples; one passes, one fails; pass rate reflects them |
| Regression caught | good clears 0.7, regressed does not; pairwise shows it too |
| Loud fail | poisoned run → `erroredCount > 0` and `assertNoInfraErrors` throws |
| Bug understood | dropping the error marker scores a fake 0% (you can explain why that's the bug) |
| Margin defended | (stretch) a threshold justified against a stated noise band |

All required rows green → you can build a regression eval that protects a loop and never lies. On
to Module 5 (taking this online).
