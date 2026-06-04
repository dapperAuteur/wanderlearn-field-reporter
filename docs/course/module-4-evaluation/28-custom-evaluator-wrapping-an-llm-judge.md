# Module 4 · Lesson 28 · A custom evaluator wrapping an LLM judge

> **Tag:** `course/lesson-28` · **Module 4: Eval-driven reflection** · ~5 min

## The model you are about to install

An evaluator is a function that scores one output and returns a result the eval harness can
aggregate. This lesson builds a **custom evaluator** that wraps the rubric's LLM judge — and
carries forward the Module 3 lesson by making it **fail loudly** on an infrastructure error
instead of folding it into the score. By the end you can write an evaluator that produces a
real number or no number at all.

## What an evaluator is

In LangSmith's model, `evaluate(target, { data, evaluators })` runs the target on each
example and passes the output to each **evaluator**, which returns a score or label
(LangChain, n.d.). A custom evaluator is just your own scoring function. Ours wraps the
rubric judge (`examples/support-reply-loop/eval.ts`):

```ts
export async function evaluateDraft(judge, ticket, draft) {
  const critique = await scoreAgainstRubric(judge, ticket, draft, 0, supportReplyRubric);
  return { passed: critique.passed, errored: looksLikeErrorFallback(critique) };
}
```

It returns two things, and the second is the lesson: `passed` (the score) *and* `errored`
(whether this is a real measurement at all).

## The Module 3 bug, prevented here

Recall Lesson 25: the witus-triage eval folded a fail-soft fallback into its accuracy and
reported a fake **8%** that was really an unfunded key (McDonald, n.d.). The defect was that
the evaluator could not tell a *bad score* from a *broken run*. Our evaluator can, because it
detects the error-fallback signature:

```ts
export function looksLikeErrorFallback(critique) {
  const allFailed = critique.checks.every((c) => !c.passed);
  const hasErrorMarker = critique.checks.some((c) => c.evidence.includes("<error"));
  return allFailed && hasErrorMarker;   // every check failed AND an error is in the evidence
}
```

A draft that genuinely fails every criterion (a weak reply) looks different from one where
the *judge itself errored*: the latter carries an error marker in its evidence. The evaluator
separates "this output is bad" from "this measurement is invalid."

## Fail loudly, never score a poisoned run

The harness then refuses to report a number for a poisoned run
(`assertNoInfraErrors`):

```ts
export function assertNoInfraErrors(report) {
  if (report.erroredCount > 0) {
    throw new Error(`Eval aborted: infrastructure failure on ${report.erroredCount} case(s) ` +
      `[${ids}]. This is NOT a measurement — re-run on a working provider.`);
  }
}
```

The Module 4 test drives the eval with a fail-soft judge and asserts this **throws** — the
eval aborts loudly rather than reporting `0%`. This is the single most important property an
eval can have: *produce a real number, or fail in a way no one can mistake for a measurement.*
A silent fake number is worse than a crash, because someone will cite it.

## Why "wrap the judge" and not "re-score in the evaluator"

The evaluator wraps the *same* judge the loop used, for the same reason as Lesson 26: one
standard. If the evaluator scored with a different judge or different criteria, a green eval
would no longer certify the runtime loop. Wrapping keeps the eval honest; the only thing the
evaluator *adds* is the validity check (`errored`), which is about the measurement, not the
standard.

## The anti-pattern

> **Anti-pattern — The credulous evaluator.** An evaluator that returns a score for every
> run, including ones where the judge or the model errored. It cannot distinguish a bad output
> from a broken pipeline, so infrastructure failures get averaged into your metric and reported
> as if real. Detect the error-fallback and abort loudly.

## What you should now believe

An evaluator returns two things, not one: a score, and whether the score is *valid*. Wrap the
runtime judge so the standard stays single, add a validity check so infrastructure failures
cannot masquerade as measurements, and make the harness fail loudly on a poisoned run. An eval
you cannot trust to fail loudly is an eval you cannot trust at all.

## Try it

In the Module 4 suite, change `failSoftJudge`'s evidence to drop the `"<error"` marker and
re-run the infra-error test. Watch `looksLikeErrorFallback` stop firing — and notice the run
now scores a fake `0%` instead of aborting. That marker is the difference between a caught
infrastructure failure and the witus-triage bug. Put it back.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

McDonald, B. A. (n.d.). *WitUS triage agent* [Computer software]. Retrieved June 4, 2026,
from the repository `witus-triage-agent` (`plans/01-fix-accuracy-eval.md`).
