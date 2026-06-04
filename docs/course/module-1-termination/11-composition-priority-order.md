# Module 1 · Lesson 11 · Composition — the patterns in priority order

> **Tag:** `course/lesson-11` · **Module 1: Bounded termination** · ~5 min

## The model you are about to install

You have three exits — counter, convergence, escalation — plus the revise edge.
This lesson composes them into one router, and the lesson *is* the order: the
branches must be checked in a deliberate priority, because more than one can be
true at once and the order changes the outcome. By the end you can read a
multi-exit router and defend why each check sits where it does.

## One router, four branches

```ts
export function routeWithAllPatterns(state): TerminationRoute {
  const { critique } = state;
  if (!critique) throw new Error("critique must run before routing.");

  if (critique.passed) return "mark_resolved";                 // 1. success
  if (hasConverged(state.history)) return "flag_for_human";    // 2. stalled
  if (state.revisionNumber >= MAX_REVISIONS) return "flag_for_human"; // 3. cap
  return "write_reply";                                        // 4. revise
}
```

Four mutually-exclusive outcomes from a top-to-bottom cascade. The cascade is the
point: at the moment of routing, several conditions can hold simultaneously, and
the *first* matching branch wins.

## Why this exact order

Read each adjacency and the bug the order prevents:

- **Success first, above everything.** If the draft passed, you ship it — even if
  it also happens to be the third revision (cap) or identical to the last
  (convergence). A draft that passes on the final allowed pass is a *win*, not an
  escalation. Put the cap check first and you would escalate a perfectly good
  reply. Success must dominate.
- **Convergence before the cap.** Both route to a human, so order seems not to
  matter — but it changes *when* and *why*. Checking convergence first lets the
  loop escalate at revision 2 (the stall) instead of grinding to revision 3 (the
  cap) to reach the same human. Same destination, two fewer wasted LLM calls, and a
  truer reason recorded for *why* it escalated.
- **Cap before revise, always last among the stoppers.** The counter is the
  backstop: it only gets to act if nothing smarter already stopped the loop. It
  must sit just above the revise branch so it is the final gate before another
  pass.
- **Revise is the default.** Only if no exit condition holds does the loop spend
  another iteration. "Keep going" is what you do when no reason to stop has fired
  yet — never the other way around.

## The principle: stop conditions are a priority list, not a set

The deep idea, redeployable far beyond this loop: **when several termination
conditions can be simultaneously true, termination is a priority-ordered list, not
an unordered set.** "Success beats give-up; cheap give-up beats expensive give-up;
the hard backstop is last." Get the order wrong and you do not get a crash — you
get a subtly wrong outcome (a good draft escalated, or a stall ground out to the
cap) that no type checker will catch. The order is a design decision; make it on
purpose and write it down.

## The anti-pattern

> **Anti-pattern — Order-dependent routing left to chance.** Stacking termination
> checks in whatever order they were added, so an input where two conditions hold
> at once takes the wrong branch. It type-checks, it passes the happy-path test,
> and it mis-routes exactly the edge cases termination exists to handle. The fix is
> to choose the priority deliberately and test the overlaps.

## See it

The Module 1 tests probe the overlaps on purpose: the success test uses a writer
that passes on a revision (success-beats-cap); the convergence test uses a stalling
writer (convergence-beats-cap, escalating at 2 not 3); the counter test uses an
always-different failing writer (only the cap can fire). Three tests, three
priority interactions, all green.

## What you should now believe (carry into Module 2)

Termination is not one trick; it is a small ordered policy: succeed if you can,
give up cheaply if you must, and never run unbounded. With that policy in code, the
loop is *reliable* — it stops correctly on every input, not just the convenient
ones. Module 2 turns to the other half of loop quality: whether the critic the
router trusts is any good.

## Try it

Deliberately break the order: move the `MAX_REVISIONS` check *above* the
`critique.passed` check and re-run the Module 1 tests. Watch the success test fail
when a draft passes on the capped revision. Restore the order. You just felt why
priority is a correctness property, not a style preference.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651
