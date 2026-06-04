# Module 1 · Lesson 9 · Pattern 2 — convergence detection

> **Tag:** `course/lesson-09` · **Module 1: Bounded termination** · ~5 min

## The model you are about to install

The counter guarantees the loop *stops*; it does not make the loop *smart* about
stopping. Pattern 2 adds the intelligence: detect when revising has stopped
changing anything, and exit early instead of burning the rest of the budget on
identical drafts. By the end you can name what "converged" means operationally and
implement it.

## The waste the counter alone leaves on the table

Run the bounded loop with a writer that keeps emitting the *same* failing draft.
The counter still saves you — it stops at `MAX_REVISIONS` — but look at what
happened in between: the loop ran the full budget, producing the identical bad
draft three times, paying for three critique passes that could never have changed
the outcome. The counter caught the runaway; it did not catch the *stall*.

A stall is its own failure mode (Lesson 7's "stalled writer"). Spending three LLM
calls to confirm the writer is stuck is three calls too many. Convergence detection
is the fix.

## The pattern

"Converged" means: **the loop's output has stopped moving.** The simplest honest
test is exact equality of consecutive drafts:

```ts
export function hasConverged(history: { draft: string }[]): boolean {
  if (history.length < 2) return false;
  const latest = history[history.length - 1]!.draft.trim();
  const previous = history[history.length - 2]!.draft.trim();
  return latest === previous;
}
```

If the two most recent drafts are identical, the writer is no longer responding to
the critique — another pass will produce the same draft, fail the same checks, and
waste the same tokens. So the router treats convergence as a reason to stop *now*:

```ts
if (critique.passed) return "mark_resolved";
if (hasConverged(state.history)) return "flag_for_human";   // ← Pattern 2
if (state.revisionNumber >= MAX_REVISIONS) return "flag_for_human";
return "write_reply";
```

Note *where* a converged-but-failing run goes: to a human (Lesson 10), not to
`END`. Convergence tells you the loop is done trying; it does not tell you the
answer is good. Those are different facts and they route differently.

## Convergence in the real world

Exact-match keeps this lesson deterministic and offline, but production loops
rarely emit byte-identical drafts. Two stronger signals, same idea:

- **Semantic convergence.** Embed consecutive drafts and stop when cosine distance
  falls below a threshold — catches "changed three words, same draft."
- **Score convergence.** Stop when the critique *score* stops improving across
  passes (delta below a threshold), even if the text keeps churning. This reuses
  the rubric you build in Module 2, and it is often the most robust signal.

All three are the same pattern: define a measure of "movement," and exit when
movement falls below a floor. Pick the measure your domain can compute cheaply and
trust.

## The anti-pattern

> **Anti-pattern — Revising a stalled loop.** Letting a loop run its full
> iteration budget when its output has stopped changing. It conflates "the loop is
> bounded" (true, thanks to the counter) with "the loop is making progress"
> (false). The cost is real tokens spent confirming the obvious. Detect the stall
> and exit.

## See it stop early

The second Module 1 test drives the bounded loop with a writer that returns the
same draft every pass:

```bash
npm run test -- tests/course/module-1-termination.test.ts
```

It asserts the run escalates at revision **2** — the first repeat — strictly before
the hard cap. That gap between 2 and `MAX_REVISIONS` is the budget convergence
detection just saved you.

## What you should now believe

A bounded loop should stop for the *right reason*, as early as it honestly can.
The counter is the backstop; convergence is the early, intelligent exit. Together
they mean the loop spends LLM calls only while those calls might still change the
answer.

## Try it

Change `hasConverged` to compare the last *three* drafts instead of two (require
two consecutive repeats before declaring a stall). Re-run the test and reason about
how the escalation revision number shifts. Which threshold is right depends on how
noisy your writer is — that judgment is the lesson.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651
