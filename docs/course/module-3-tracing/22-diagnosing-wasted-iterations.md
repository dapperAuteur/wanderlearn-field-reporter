# Module 3 · Lesson 22 · Diagnosing wasted iterations

> **Tag:** `course/lesson-22` · **Module 3: Tracing reflection loops in LangSmith** · ~5 min

## The model you are about to install

The first trouble-shape: a **wasted iteration** — a revision that cost an LLM call and
moved the score nowhere. The loop terminated correctly (Module 1 guaranteed that), but
it spent budget producing drafts no better than the one before. By the end you can spot
wasted iterations in a trace and reason about their cause.

## The shape in the trace

Read the `passedChecks` down the `critique_reply` spans. A healthy loop climbs:

```
critique_reply  rev 1   2/4 passed
critique_reply  rev 2   4/4 passed        ← improved, then resolved
```

A wasted iteration is flat or falling:

```
critique_reply  rev 1   2/4 passed
critique_reply  rev 2   2/4 passed        ← WASTED: a call spent, score unchanged
critique_reply  rev 3   4/4 passed
```

Revision 2 cost a write call and a critique call and the score did not move. The
diagnostic names it (`examples/support-reply-loop/tracing.ts`):

```ts
export function findWastedIterations(trace: RunTrace): number[] {
  const wasted: number[] = [];
  for (let i = 1; i < trace.steps.length; i++) {
    if (trace.steps[i]!.passedChecks <= trace.steps[i - 1]!.passedChecks) {
      wasted.push(trace.steps[i]!.revisionNumber);
    }
  }
  return wasted;
}
```

The Module 3 test feeds it the `1 → 1 → 4` trace and asserts it returns `[2]`. In
LangSmith you would see the same thing as a flat run of equal-height critique spans, and
you would click into revision 2 to ask *why it did not improve.*

## Why iterations get wasted — three causes, read from the trace

A wasted iteration is a symptom; the trace tells you the cause:

1. **The feedback was not actionable.** Open revision 2's failing criteria. If the
   `suggestion` was vague ("make it better"), the writer had nothing to act on — this is
   the Lesson 17 failure showing up downstream. *Fix: better suggestions in the rubric.*
2. **The writer ignored good feedback.** If the suggestions were specific but the new
   draft did not address them, the writer (the model, or your write-node prompt) is the
   problem. *Fix: the revise prompt, or a stronger model for the writer.*
3. **The criterion is genuinely hard.** Some checks a given model simply cannot satisfy;
   it will plateau no matter how good the feedback. *Fix: lower the bar (Module 2 weights)
   or escalate sooner.*

You cannot tell which of the three from the outcome. You can tell instantly from the
trace, because the trace carries the suggestion *and* the next draft side by side.

## Why wasted iterations matter

Every wasted iteration is real money and latency — Module 5 makes this a tracked metric
(average iterations, cost-per-converged-output). A loop that resolves in two passes but
*usually* wastes one is paying 50% overhead you can often remove by fixing the rubric's
suggestions. The trace is how you find the waste before the bill does.

## What you should now believe

Correct termination is not the same as efficient termination. A loop can stop properly
and still squander half its passes, and the only way to see it is the score trajectory
in the trace. Flat critique spans are money on the floor — pick them up.

## Try it

In `tests/course/module-3-tracing.test.ts`, change the wasted-iteration trace to
`passedChecks` `2 → 3 → 4` (a steady climb) and watch `findWastedIterations` return `[]`.
Then make it `2 → 2 → 2` and watch it flag `[2, 3]`. You are reading the score trajectory
the way you would scan critique-span heights in LangSmith.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651
