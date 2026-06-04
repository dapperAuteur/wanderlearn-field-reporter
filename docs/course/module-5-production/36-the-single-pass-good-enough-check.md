# Module 5 · Lesson 36 · The "single-pass good enough?" check before looping at all

> **Tag:** `course/lesson-36` · **Module 5: Production — keeping the loop honest** · ~4 min

## The model you are about to install

The cheapest reflection loop is the one you do not run. After five modules of building loops, this
lesson asks the question that can delete the whole apparatus for a given task: **is a single pass
already good enough?** If it is, looping spends multiples of the cost for nothing. By the end you can
make "should this even loop?" a measured decision, not a default.

## The default that costs you

It is easy to reach for a reflection loop because you have one and it is sophisticated. But for many
inputs, a single well-prompted pass already clears the rubric — and on those, the loop's write →
critique → revise cycle is pure overhead: extra latency, extra calls, identical result. The
discipline is to *check first* whether you need to loop at all.

The check is one comparison against your existing eval (`examples/support-reply-loop/production.ts`):

```ts
export function singlePassGoodEnough(singleShotReport, threshold): boolean {
  return singleShotReport.passRate >= threshold;
}
```

Run the single-shot baseline on your dataset; if its pass rate already meets the bar, ship single-shot
and skip the loop. The Module 5 test shows both outcomes: with a weak single-shot writer the check says
**loop** (0% single-shot), and with a strong single-shot writer it says **don't loop** — the single pass
already passes 9/10, so the loop would add cost for no gain.

## Where this fits: a gate before the graph

In production this is a gate *in front of* the reflection loop, decided per task (and re-checked as
models improve):

1. Measure single-shot quality on a representative dataset (you already have the eval).
2. If it clears the threshold with margin → ship single-shot; the loop is unjustified.
3. If it does not → loop, and use the rest of Module 5 to keep the loop honest.

This is the production form of Module 4's pairwise lesson: pairwise told you *whether* the loop beats
single-shot; this gate *acts on* that answer by not running the loop when the margin is zero. As models
get better, single-shot quality rises — so a loop that was justified last year may not be this year.
Re-run the check; do not assume yesterday's answer.

## Why this is the honest module

A course that spent five modules teaching reflection loops and never asked "do you need one?" would be
selling a hammer. The intellectually honest move — and the one that marks engineering judgment over
pattern-collecting — is to make *not looping* a first-class, measured option. The best reflection loop
for a task is sometimes no reflection loop.

## The anti-pattern

> **Anti-pattern — Looping by default.** Running the reflection loop on every input because you built
> one, without ever checking whether a single pass already clears the bar. On easy inputs the loop is
> pure overhead — multiples of the cost for an identical result. Gate the loop behind a single-pass check.

## What you should now believe

Before you spend a loop's cost, ask whether one pass already wins — and measure it, do not assume. If
single-shot clears the bar with margin, skip the loop; the cheapest reflection is none. Re-check as
models improve, because the answer drifts. Reflection is a budget allocation, and sometimes the right
allocation is zero.

## Try it

In the Module 5 test, change the threshold in the single-pass check from 0.8 to 0.95 and re-run. Watch
the strong single-shot (≈0.9) now *fail* the check, flipping the decision back to "loop." The threshold
you pick is the line between "good enough to ship as-is" and "worth the loop" — set it where your product
actually needs quality, not at a reflex 100%.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651
