# Module 1 · Lesson 10 · Pattern 3 — human escalation

> **Tag:** `course/lesson-10` · **Module 1: Bounded termination** · ~4 min

## The model you are about to install

The counter and convergence both stop the loop *unresolved* — they fire precisely
when the draft did **not** pass. Pattern 3 answers the question those two leave
open: what do you do with a draft you decided to stop improving but never made
good? You hand it to a human. By the end you can model "needs a person" as a
first-class terminal state, distinct from success.

## Two ways to stop are not the same outcome

A reflection loop has exactly two honest endings, and conflating them is a
mistake:

- **Resolved** — the critique passed; the output is good enough to ship.
- **Escalated** — the loop stopped (cap or convergence) without passing; a human
  must own what happens next.

If your loop only has `END`, both endings look identical to everything downstream,
and you will ship an unresolved draft to a customer because nothing distinguished
"we fixed it" from "we gave up." Pattern 3 makes the distinction structural.

## The pattern: a terminal node, not just an edge

Escalation is its own node with its own side effect, reached by its own route:

```ts
function markResolved() {
  return { outcome: "resolved" as const };
}

function flagForHuman() {
  return { escalated: true, outcome: "escalated" as const };
}

// …in the builder:
  .addNode("mark_resolved", markResolved)
  .addNode("flag_for_human", flagForHuman)
  .addConditionalEdges("critique_reply", routeWithAllPatterns, [
    "write_reply", "mark_resolved", "flag_for_human",
  ])
  .addEdge("mark_resolved", END)
  .addEdge("flag_for_human", END)
```

Now the run ends in one of two *named* states. `flag_for_human` is where you would,
in a real system, open a ticket, page the on-call support lead, or drop the draft
into a review queue with the failing critique attached so the human starts with the
diagnosis, not a blank page. The field-reporter agent in this very repo does
exactly this — its graph routes to a `flag_for_human_review` node when the rubric
fails past `MAX_REVISIONS` (see `src/agent/graph.ts`).

## Why escalation belongs *inside* the graph

You might think escalation is an application concern — let the caller check
`critique.passed` and decide. Two reasons it belongs in the graph:

1. **One source of truth for "how it ended."** The graph already knows why it
   stopped (passed vs. cap vs. convergence). Re-deriving that outside the graph
   duplicates the logic and invites drift.
2. **It composes with the routing.** Escalation is one of the router's branches, so
   it sits beside the other exits in priority order (next lesson) rather than in a
   separate `if` the router cannot see.

## The anti-pattern

> **Anti-pattern — Silent unresolved output.** Ending an unresolved loop at a plain
> `END` so a failing draft is indistinguishable from a passing one. Downstream code
> cannot tell "shipped" from "gave up," so the gave-up draft gets shipped. The fix
> is a distinct escalation terminal that carries the outcome.

## See it

Every Module 1 escalation test asserts `outcome === "escalated"` and
`escalated === true`, while the success test asserts `outcome === "resolved"`. The
two endings are observable, testable facts — which is the whole point.

## What you should now believe

"The loop stopped" and "the loop succeeded" are different claims, and a reliable
system encodes the difference. Human escalation is not an error path bolted on; it
is the loop being honest that not every input is one it can resolve alone.

## Try it

Add a `console.log` (or a real notification stub) inside `flagForHuman` that prints
the ticket and the failing critique's `feedback`. Re-run the convergence test and
read what a human reviewer would receive. A good escalation hands the human the
diagnosis; make sure yours does.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
