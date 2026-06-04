# Module 6 · Lesson 40 · Composing the capstone graph

> **Tag:** `course/lesson-40` · **Module 6: Capstone** · ~5 min

## The model you are about to install

With the rubric written, the graph almost builds itself — because the graph is *reused*, not rewritten.
This lesson composes the capstone loop from the parts you already have: Module 1's bounded router and
state, Module 2's scorer, and an injected writer. By the end you can see how little new graph code a new
domain actually needs.

## The loop, assembled from imports

Here is the whole capstone graph (`examples/capstone-plain-language/index.ts`):

```ts
export function buildPlainLanguageLoop(writer, judge) {
  async function writeRewrite(state) {
    const draft = await writer({ ticket: state.ticket, draft: state.draft, critique: state.critique });
    return { draft, revisionNumber: state.revisionNumber + 1, history: [{ revisionNumber: …, draft }] };
  }
  async function critiqueRewrite(state) {
    const critique = await scoreAgainstRubric(judge, state.ticket, state.draft ?? "", state.revisionNumber, plainLanguageRubric);
    return { critique };
  }
  return new StateGraph(TerminatingReplyStateAnnotation)        // ← M1 state, reused
    .addNode("write_reply", writeRewrite)
    .addNode("critique_reply", critiqueRewrite)
    .addNode("mark_resolved", () => ({ outcome: "resolved" }))
    .addNode("flag_for_human", () => ({ escalated: true, outcome: "escalated" }))
    .addEdge(START, "write_reply")
    .addEdge("write_reply", "critique_reply")
    .addConditionalEdges("critique_reply", routeWithAllPatterns, [  // ← M1 router, reused verbatim
      "write_reply", "mark_resolved", "flag_for_human",
    ])
    .addEdge("mark_resolved", END)
    .addEdge("flag_for_human", END)
    .compile();
}
```

Look at what is *new* and what is *reused*:

- **Reused verbatim:** `TerminatingReplyStateAnnotation` (M1 state with the history + escalation
  channels), `routeWithAllPatterns` (M1's success → convergence → cap → revise priority router), and
  `scoreAgainstRubric` (M2's scorer). The termination guarantees, the convergence detection, the
  escalation terminal — all of it carries over for free.
- **New:** two node bodies (`writeRewrite`, `critiqueRewrite`) that are thin — they call the injected
  writer and the reused scorer — and they pass `plainLanguageRubric` instead of the support rubric.
  That single argument is the entire domain-specific change in the graph.

## Why the router needs no changes

This is the payoff of building termination as a *generic* function in Module 1. `routeWithAllPatterns`
reads only `critique.passed`, `revisionNumber`, and the draft history — none of which is
domain-specific. So the capstone inherits, with zero new code: the hard `MAX_REVISIONS` cap, convergence
detection (the legalese-saturated clause escalates by convergence when the rewriter stalls on it), and a
distinct human-escalation terminal. A domain-coupled router would have forced you to re-derive all three;
a generic one just works.

## The writer is still injected

As in every module, the writer is a parameter. The capstone's offline stand-in (`plainRewriter`)
produces a short, direct rewrite that echoes the clause's key term; a real run injects a chat-model
writer prompted to rewrite legalese into plain language. The graph does not change either way — the same
reuse-the-injection discipline from Module 0 means swapping in a real model is a one-line change, not a
graph rewrite. *(Optional: wire a real rewriter — see this lesson's Bonus footage.)*

## What you should now believe

Composing the capstone graph is mostly *naming what you reuse*. The state and the router come from
Module 1 unchanged; the scorer from Module 2; the writer is injected as always. The only new code is two
thin nodes that hand the reused scorer your new rubric. A new domain costs you a rubric and a dataset —
not a new graph — which is the strongest possible evidence the pattern is durable.

## Try it

In `buildPlainLanguageLoop`, the node names are `write_reply` / `critique_reply` (reused so they match
`routeWithAllPatterns`'s expected targets). Rename them to `write_rewrite` / `critique_rewrite` and watch
the build break — the router's target list no longer matches. Restore them. That coupling is the seam
where reuse meets your domain; mind it.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S. (2023). *Reflexion:
Language agents with verbal reinforcement learning* (arXiv:2303.11366). arXiv.
https://arxiv.org/abs/2303.11366
