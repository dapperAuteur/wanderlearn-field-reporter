# Lesson 4 — Cyclic graphs without infinite loops

> Part of the Wanderlearn Field Reporter curriculum.

## A loop that can revise can loop forever

Lesson 1's reflection loop has a cyclic edge: `critique` can send the run back
to `write`. That cycle is the point — and it is also a hazard. If the critic
never passes the draft, the graph runs `write → critique → write → critique`
until something external kills it. A cyclic agent graph needs a *guaranteed*
exit (LangChain, n.d.).

This lesson builds termination into a loop on a new domain: a summarizer that
compresses meeting notes until they fit under a target length. Three patterns,
then how to combine them.

## Pattern 1 — the max-iteration counter

The simplest guarantee: count the loops and stop at a fixed cap. Keep the count
in graph state, increment it in the node, and read it in the routing function.

```ts
const State = Annotation.Root({
  notes: Annotation<string>,
  summary: Annotation<string | undefined>,
  iteration: Annotation<number>({ reducer: (a, b) => a + b, default: () => 0 }),
});

const MAX_ITERATIONS = 5;

function route(state) {
  if (underTargetLength(state.summary)) return END;
  if (state.iteration >= MAX_ITERATIONS) return "escalate";
  return "summarize";
}
```

The cap **must** live in code and state — never in the prompt. "Try at most five
times" in a system prompt is a suggestion the model cannot reliably honor; it
has no durable counter. Counting is the graph's job. (This is exactly the
`MAX_REVISIONS` constant and the `routeAfterCritique` guard in this repo's
`src/agent/graph.ts`.)

Because `iteration` only ever increases, the routing function is guaranteed to
reach the cap — the loop is *provably* bounded.

## Pattern 2 — convergence detection

A counter stops a loop that is going nowhere. **Convergence detection** stops a
loop that has already arrived: if iteration N produced essentially the same
output as N−1, another pass will not help, so exit early and save the spend.

```ts
function hasConverged(current, previous) {
  if (!previous) return false;
  return similarity(current, previous) > 0.98; // or an exact-match check
}
```

Convergence is a quality signal, not just a cost saving: a loop that has
converged *without* meeting its goal has told you something — the agent cannot
do this task as posed. That is a result worth acting on, not retrying.

## Pattern 3 — human escalation

The first two patterns answer "when to stop." The third answers "stop *into
what*." When a loop exhausts its iterations without succeeding, the wrong move
is to return the last failed draft as if it were done. The right move is a
terminal node that flags the run for a person.

```ts
async function escalate(state) {
  return {
    needsHumanReview: true,
    summary: state.summary, // the best attempt, carried forward for the reviewer
  };
}

const graph = new StateGraph(State)
  .addNode("summarize", summarize)
  .addNode("escalate", escalate)
  .addEdge(START, "summarize")
  .addConditionalEdges("summarize", route, ["summarize", "escalate", END])
  .addEdge("escalate", END)
  .compile();
```

Escalation makes failure *legible*. The operator sees "this one needs me"
instead of discovering a bad summary downstream — and self-improving agents have
a known ceiling, so a definite hand-off beats an indefinite retry (Shinn et
al., 2023).

## Combining the three

A production loop uses all three in one routing function, in priority order:
success first, then the cheap progress check, then the hard cap — and every
non-success exit lands on escalation, never on a silent return.

```ts
function route(state) {
  if (goalMet(state)) return END;                            // 1. success
  if (hasConverged(state.summary, state.previousSummary)) return "escalate";
  if (state.iteration >= MAX_ITERATIONS) return "escalate";  // 2. + 3.
  return "summarize";                                        // keep looping
}
```

## The backstop — and why it is not your plan

LangGraph compiles with a `recursionLimit` (25 by default): exceed it and the
graph throws rather than running forever (LangChain, n.d.). Treat that as a
*backstop* — a seatbelt, not a steering wheel. If a graph ever hits the
recursion limit, the routing logic failed and the limit caught a bug. Your own
counter should terminate the loop long before LangGraph's does.

The principle underneath all three patterns: a cyclic graph is safe only if it
has a **monotonic quantity that forces progress** — here, the iteration count —
and a **defined exit for every outcome**, success or not.

## Try it

1. Take Lesson 1's reflection loop and add an `iteration` counter with a cap.
2. Add convergence detection comparing revision N to N−1.
3. Add an `escalate` terminal node, and route every non-pass exit to it. Force
   the critic to always fail, and confirm the graph stops — and flags — instead
   of spinning.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
