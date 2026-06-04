# Module 2 · Lesson 13 · The rubric is the lever, not the prompt

> **Tag:** `course/lesson-13` · **Module 2: Critique design** · ~5 min

## The model you are about to install

Module 2's belief: **writing checks an LLM can actually score is a craft** — and
the rubric, not the prompt, is the lever that controls a reflection loop's quality.
A loop is only as good as its critic, and a critic is only as good as the standard
you hand it. This lesson swaps Module 0's hand-rolled stub for a real rubric scored
by an LLM judge, and shows why the rubric lives in *data*, not in node code or a
prompt.

## Where loop quality actually comes from

You have spent two modules on the loop's *structure*: the cycle, the router, the
termination patterns. None of it improves a single draft. The draft improves
because the **critic** tells the writer, specifically and correctly, what is wrong.
Turn the critic up and the loop gets better; turn it down and the loop spins
producing junk it keeps approving. So the highest-leverage thing you can edit in a
reflection loop is not the graph and not the generation prompt — it is the rubric
the critic scores against.

That is why this is its own module. Termination keeps the loop safe; the rubric
makes it *good*.

## The rubric as data

Here is the support-reply rubric — a plain array, each entry one check
(`examples/support-reply-loop/rubric.ts`):

```ts
export const supportReplyRubric: RubricCriterion[] = [
  { key: "acknowledges_issue", description: "Names the specific problem the customer reported.", weight: 1 },
  { key: "gives_next_step",    description: "States one concrete action that resolves the problem.", weight: 1 },
  { key: "states_timeline",    description: "Gives a specific timeframe for that action.", weight: 0.5 },
  { key: "has_signoff",        description: "Ends with a sign-off naming the sender.", weight: 1 },
];
```

Three properties to notice, each load-bearing for the rest of the module:

1. **It is data, separate from the node.** The critique node *reads* this array; it
   does not contain it. To change what "good" means, you edit the data, never the
   code — exactly how the field-reporter agent in this repo keeps its rubric in
   `src/agent/rubric.ts`, apart from the node that scores it.
2. **Each entry is one check.** Not "is it clear and complete and friendly" —
   `acknowledges_issue` is a single question with a single answer.
3. **Each has a weight.** Blocking (1) versus a nudge (0.5). Lesson 18 makes weights
   and the pass rule fully data-driven.

## The critic reads the rubric; the LLM scores one check at a time

The judge is *injected* — a function that scores one criterion against the draft:

```ts
export type RubricJudge = (input: {
  ticket: string; draft: string; criterion: RubricCriterion;
}) => CriterionVerdict | Promise<CriterionVerdict>;
```

In production it is `model.withStructuredOutput(CriterionVerdictSchema)`; in the
tests it is a deterministic fake, so the loop runs offline. Either way, the node
walks the rubric, asks the judge per criterion, and combines the verdicts in code.
The LLM judges; it does not decide policy.

## The anti-pattern: the rubric-in-the-prompt

> **Anti-pattern — Rubric-in-the-prompt.** Embedding the standard as prose inside
> the critique prompt ("make sure it's clear, complete, and friendly"). It cannot
> be versioned, weighted, linted, or reused as an eval (Module 4 needs exactly that
> reuse). And because it is prose, the model scores it inconsistently run to run.
> Promote the rubric to data and the LLM's job shrinks to one verifiable judgment
> at a time.

## What you should now believe

The rubric is the control surface of a reflection loop. Keep it as data — a list of
single, weighted checks — and the loop becomes tunable, testable, and reusable. The
next three lessons are the craft of writing those checks well: the three ways a
criterion goes wrong, and how to fix each.

## Try it

Open `examples/support-reply-loop/rubric.ts` and add a fifth criterion of your own
(say, `offers_apology`, weight 0.5). Run `npm run test -- tests/course/module-2-critique.test.ts`
and watch the rubric-length assertion. You just changed what the loop considers
"good" by editing data — no node touched.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG
evaluation using GPT-4 with better human alignment. In *Proceedings of the 2023
Conference on Empirical Methods in Natural Language Processing* (pp. 2511–2522).
Association for Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/
