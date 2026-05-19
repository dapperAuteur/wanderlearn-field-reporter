# Lesson 1 — Reflection loops

> Part of the Wanderlearn Field Reporter curriculum. Each lesson is a
> standalone, code-along introduction to one LangGraph pattern, taught on a
> sample domain you can build in an afternoon.

## The problem with the first draft

Ask a language model to write something and it hands you a *plausible* answer —
not its *best* answer. Plausible is where next-token prediction stops. The gap
between "plausible" and "good" is exactly the gap a human writer closes by
re-reading a draft and fixing what is weak.

A **reflection loop** gives an agent that second look: generate a draft,
critique it against an explicit standard, then revise. Across tasks from code
generation to reasoning, agents that critique and revise their own output
measurably outperform agents that emit a single pass (Madaan et al., 2023;
Shinn et al., 2023).

This lesson builds one, on a small domain: turning a product's spec bullets
into marketing copy.

## A one-pass baseline

Start with the naive version — a single `write` node. (The snippets are
LangGraph JS, lightly trimmed; the production graph lives in this repo's
`src/agent/`.)

```ts
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

const State = Annotation.Root({
  specs: Annotation<string>,
  copy: Annotation<string | undefined>,
});

async function write(state) {
  const copy = await llm.invoke(
    `Write marketing copy for a product with these specs:\n${state.specs}`,
  );
  return { copy };
}

const graph = new StateGraph(State)
  .addNode("write", write)
  .addEdge(START, "write")
  .addEdge("write", END)
  .compile();
```

Feed it a blender's specs and you get something like:

> *"This powerful blender is a great addition to any kitchen. It's perfect for
> all your blending needs!"*

It is grammatical, on-topic, and useless. It names no concrete benefit, cites
none of the specs, and never asks the reader to do anything. The model had no
signal about what *good* copy is, so it stopped at *plausible*.

## Adding a critic

The fix is not a better prompt — it is a second node whose only job is to judge
the first. The `critique` node scores the draft against a few concrete,
checkable standards:

```ts
async function critique(state) {
  const result = await llm.withStructuredOutput(CritiqueSchema).invoke(
    `Score this marketing copy. For each check return pass/fail and one
     sentence of evidence.
     - names at least one concrete, spec-derived benefit
     - ends with a clear call to action
     - is 60 words or fewer
     Copy:\n${state.copy}`,
  );
  return { critique: result };
}
```

Two things make this critic useful. First, every check is **concretely
verifiable** — "names a concrete benefit" can be confirmed by reading the text,
unlike "is engaging." Writing checks an LLM can actually score is a craft of its
own; Lesson 2 is entirely about it. Second, the critic must produce **evidence**
per check, which forces it to ground each judgment in the draft rather than
rubber-stamping.

## Closing the loop

Now wire the cycle. After `critique`, a conditional edge routes the run: if the
draft passed, finish; if not, send it back to `write` — this time with the
critique's feedback in scope.

```ts
function routeAfterCritique(state) {
  return state.critique.passed ? END : "write";
}

const graph = new StateGraph(State)
  .addNode("write", write)
  .addNode("critique", critique)
  .addEdge(START, "write")
  .addEdge("write", "critique")
  .addConditionalEdges("critique", routeAfterCritique, ["write", END])
  .compile();
```

The `write` node reads `state.critique` and, when it is present, revises rather
than restarts:

```ts
async function write(state) {
  const instruction = state.critique
    ? `Revise this copy to fix every issue, keeping what worked.
       Draft:\n${state.copy}\nIssues:\n${state.critique.feedback}`
    : `Write marketing copy for:\n${state.specs}`;
  return { copy: await llm.invoke(instruction) };
}
```

Run it again and revision 2 comes back changed:

> *"Crush ice and frozen fruit in seconds — the 1200-watt motor and stainless
> blades handle smoothies, soups, and nut butters without stalling. Order today
> and skip the upgrade later."*

Concrete benefits drawn from the specs, a call to action, under 60 words. The
loop did not make the model smarter; it gave the model a *target* and a second
attempt at hitting it.

## Why this works

The reflection loop externalizes the quality bar that the generator, on its
own, does not hold. Generation and judgment are different tasks, and a model is
often a better critic of a finished draft than a first-pass author of one — it
is easier to see that copy lacks a call to action than to never omit one.
Self-Refine frames this as iterative refinement with self-feedback (Madaan et
al., 2023); Reflexion frames the feedback as "verbal reinforcement" that
conditions the next attempt (Shinn et al., 2023). LangGraph makes the loop a
first-class structure — a cyclic edge in a typed state graph (LangChain, n.d.).

## One caveat, and what is next

A reflection loop is only as good as its critic, and a critic is only as good as
the standard you give it. A vague rubric — "make it better" — produces a critic
that waves every draft through or rejects them at random, and the loop spins
without improving. **Lesson 2** is about writing rubric criteria an LLM can
score reliably. And a loop that can revise can also revise forever; **Lesson 4**
covers terminating cyclic graphs safely.

## Try it

1. Build the one-pass graph above for a domain of your own — a commit message,
   a release note, a conference bio.
2. Add a three-check critic and the cyclic edge.
3. Log every revision. The draft should converge within two or three passes —
   and if it does not, your critic is the suspect.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon,
U., Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta,
S., Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement
with self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
