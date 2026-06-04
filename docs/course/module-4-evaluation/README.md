# Module 4 · Eval-driven reflection

> **The model you are about to install:** *The runtime rubric is also the offline test.*

Module 2's rubric steered the loop; this module reuses the *exact same* rubric as an offline
regression eval over a small curated dataset. You build a dataset, a custom evaluator that
fails loudly on infrastructure errors (the witus-triage bug, prevented), a pairwise comparison
that proves reflection beats single-shot, and a margin-aware threshold — all offline, all green
with no LangSmith account.

## Lessons

| # | Lesson | ~min | Runnable |
|---|---|---|---|
| 26 | [Rubric reuse — the runtime critic is the offline test](./26-rubric-reuse-runtime-critic-vs-offline-test.md) | 5 | ✅ |
| 27 | [Creating a dataset](./27-creating-a-langsmith-dataset.md) | 5 | ✅ |
| 28 | [A custom evaluator wrapping an LLM judge](./28-custom-evaluator-wrapping-an-llm-judge.md) | 5 | ✅ |
| 29 | [Pairwise eval — single-shot vs the reflection loop](./29-pairwise-eval-single-shot-vs-reflection.md) | 5 | ✅ |
| 30 | [Setting thresholds with margin for LLM-judge noise](./30-thresholds-with-margin-for-judge-noise.md) | 4 | ✅ |
| 31 | [Why a small (~10 example) dataset catches regressions](./31-why-a-small-dataset-catches-regressions.md) | 4 | ✅ |

**Then:** [Lab](./module-4-lab.md) · [Quiz](./module-4-quiz.md) ·
[Feedback](./module-4-feedback.md)

Video scripts are in [`./video/`](./video/).

## Runnable artifact

[`examples/support-reply-loop/eval.ts`](../../../examples/support-reply-loop/eval.ts)
— a 10-example `supportReplyDataset`, `evaluateDraft` (reuses `scoreAgainstRubric`),
`runEval`, `pairwise`, `meetsThreshold` (margin-aware), and `assertNoInfraErrors` (loud-fail
on the error-fallback signature). Tests:
`npm run test -- tests/course/module-4-evaluation.test.ts` (8 green, offline — deterministic
stand-ins for the model; loop scores 9/10, single-shot 0/10).

## What you should now believe (module close)

The eval is the runtime rubric, reused — one source of truth that steers at runtime and measures
offline. It is small on purpose (regressions are cliffs; curation beats volume; run it on every
change), it fails loudly rather than scoring a broken run, and pairwise proves the loop earns its
cost. Module 5 takes the same rubric *online*: convergence rate, cost-per-converged-output, and
the "is single-pass good enough?" check on live traffic.
