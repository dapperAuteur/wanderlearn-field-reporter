# Module 0 · Lesson 6 · The minimal write → critique loop with a stub critic

> **Tag:** `course/lesson-06` · **Module 0: Reflection-loop primitive + setup** · ~6 min

## The model you are about to install

Now you build the thing. By the end of this lesson the three checks from Lesson 5
are a running graph: a `write_reply` node, a `critique_reply` node, a cyclic edge,
and a cap. The critic is a deterministic **stub** — no LLM yet — because Module 0
is about the *shape* of the loop, and a stub lets the whole thing run offline with
a verifiable success signal. The code is
[`examples/support-reply-loop/graph.ts`](../../../examples/support-reply-loop/graph.ts);
read it open beside this lesson.

## State: what flows through the loop

A reflection loop needs to carry the ticket, the current draft, the latest
critique, and a counter. In LangGraph that is a typed state annotation:

```ts
export const SupportReplyStateAnnotation = Annotation.Root({
  ticket: Annotation<string>,
  draft: Annotation<string | undefined>,
  critique: Annotation<ReplyCritique | undefined>,
  revisionNumber: Annotation<number>({ reducer: (_c, u) => u, default: () => 0 }),
  history: Annotation<{ revisionNumber: number; draft: string }[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});
```

Most channels are last-write-wins. The one exception is `history`, whose **concat
reducer** appends every draft instead of overwriting — so a finished run is fully
auditable, which Module 3's tracing builds on.

## The writer is injected

Notice the graph does not hard-code *how* a draft is written:

```ts
export type ReplyWriter = (input: {
  ticket: string; draft?: string; critique?: ReplyCritique;
}) => string | Promise<string>;
```

`buildSupportReplyLoop(write)` takes the writer as an argument. In Module 0 the
writer is a canned weak→strong function, so everything runs with no API key. The
same graph runs with a real chat model by passing a model-backed writer — the loop
does not care. *(Optional: swap in Claude — see this lesson's **Bonus footage**,
and the commented `llmWriter` in
[`examples/support-reply-loop/run.ts`](../../../examples/support-reply-loop/run.ts).)*

## The stub critic: checks an LLM could score, that you can score now

Here is the heart of the lesson — a critic that judges the draft against the three
concrete checks from Lesson 5, returning **pass/fail plus evidence** per check:

```ts
export function scoreReply(ticket, draft, revisionNumber): ReplyCritique {
  const lower = draft.toLowerCase();
  const checks = [
    { name: "acknowledges_the_specific_issue", passed: /* shares a content word with the ticket */ },
    { name: "gives_a_concrete_next_step",      passed: /* matches will|we'll|refund|ship|within … */ },
    { name: "has_a_sign_off",                  passed: /* matches regards|best,|thanks, … */ },
  ];
  const failed = checks.filter((c) => !c.passed);
  return { passed: failed.length === 0, checks, revisionNumber, feedback: /* fix hints */ };
}
```

Two properties make this critic useful, and they are the same two an LLM critic
needs (Module 2):

1. **Every check is concretely verifiable.** "Names the customer's issue" can be
   confirmed by reading the text; "is empathetic" cannot. Writing checks an LLM
   can actually score is a craft of its own — Module 2 is entirely about it.
2. **The critic produces evidence per check,** which forces it to ground each
   verdict in the draft rather than rubber-stamping (Liu et al., 2023).

A real stub is honest about being a stub: regex checks are *brittle* on purpose,
so you feel exactly where a deterministic critic ends and an LLM-scored rubric
must begin.

## Closing the loop

A conditional edge routes the run after each critique — finish, or revise:

```ts
export function routeAfterCritique(state): "write_reply" | typeof END {
  const { critique } = state;
  if (!critique) throw new Error("critique must run before routing.");
  if (critique.passed) return END;                       // good enough → stop
  if (state.revisionNumber >= MAX_REVISIONS) return END; // bounded exit
  return "write_reply";                                  // revise
}

return new StateGraph(SupportReplyStateAnnotation)
  .addNode("write_reply", writeReply)
  .addNode("critique_reply", critiqueReply)
  .addEdge(START, "write_reply")
  .addEdge("write_reply", "critique_reply")
  .addConditionalEdges("critique_reply", routeAfterCritique, ["write_reply", END])
  .compile();
```

When the critique fails, `write_reply` runs again — and because it reads
`state.critique`, it *revises with the feedback in scope* rather than starting
over (Shinn et al., 2023). The cap lives here, in code, **never in a prompt.** That
single line — `if (state.revisionNumber >= MAX_REVISIONS) return END` — is the
entire reason this cyclic graph is guaranteed to terminate. Module 1 is nothing
but a careful study of that line and its alternatives.

## Run it; watch it converge

```bash
npx tsx examples/support-reply-loop/run.ts
```

Revision 1 is the weak reply; the critic fails all three checks. Revision 2 names
the cracked jar, promises a replacement, and signs off; the critic flips to
`PASSED` and the loop ends. The test makes this a hard signal:

```bash
npm run test -- tests/course/module-0-loop.test.ts
```

It asserts both halves of the loop: that a weak-then-strong writer **converges**,
and that a never-improving writer still **terminates at `MAX_REVISIONS`** instead
of spinning forever.

## What you should now believe (module close)

Look back at Lesson 1's promise: *reflection is a graph, not a prompt.* You have
now built it — generation and judgment are *separate nodes*, the revision is a
*cyclic edge*, and "when to stop" is a *counter in the routing function*. Every
remaining module bolts onto this graph: Module 1 hardens the cap, Module 2
replaces the stub critic with an LLM-scored rubric, Module 3 traces the loop,
Module 4 turns the rubric into an offline eval, and Module 5 keeps it honest in
production. You hold the primitive now. The rest is making it reliable.

## Try it

Extend the stub critic with a fourth check of your own — for example, "states a
concrete timeline" (matches `today`, `within 24 hours`, a weekday). Add it to
`scoreReply`, update the canned strong reply in `run.ts` to satisfy it, and add an
assertion to `tests/course/module-0-loop.test.ts`. Green test = you closed the
loop on a check you invented. That is the whole job.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG
evaluation using GPT-4 with better human alignment. In *Proceedings of the 2023
Conference on Empirical Methods in Natural Language Processing* (pp. 2511–2522).
Association for Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
