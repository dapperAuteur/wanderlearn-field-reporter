# Lesson 2 — Writing rubrics an LLM can score

> Part of the Wanderlearn Field Reporter curriculum.

## The critic is only as good as its rubric

Lesson 1 ended on a warning: a reflection loop depends on its critic, and a
critic depends on the **rubric** it scores against. Give the critic a vague
standard and it will wave weak drafts through, or fail good ones at random — and
the loop spins without converging.

A rubric is a set of **criteria**. Each criterion is one statement of what
"good" requires. The whole skill is writing criteria a language model can apply
*consistently* — score the same draft the same way twice. This lesson works a
single example: a rubric for the quality of **code comments**.

A first attempt usually looks like this:

```ts
const badRubric = {
  quality: { description: "The comment is good and helpful." },
};
```

Every word of that is a trap. Here are the three failure modes it commits, and
how to fix each.

## Failure mode 1 — too vague

"Good and helpful" is not checkable. Two careful reviewers would not reliably
agree on it, and neither will an LLM across runs — its score drifts with
phrasing and temperature. The reliability of an LLM judge depends directly on
how concretely the criterion is specified (Zheng et al., 2023).

The fix is to name the **observable** that separates pass from fail:

```ts
explains_why: {
  description:
    "The comment explains WHY the code does what it does — a constraint, a
     trade-off, a non-obvious reason — rather than restating WHAT it does.",
},
```

A reviewer can now point at the comment and the code and decide. A good test:
*could two people, given only the description, agree on the score?* If not, the
criterion is still too vague.

## Failure mode 2 — too overlapping

Add a second criterion — "the comment is clear" — and then a third — "the
comment is well-written." These do not measure independent things; a comment
that scores high on one scores high on all. Overlapping criteria pad the rubric
without adding signal, and they let one underlying quality count three times.

Each criterion should isolate **one independent property**. For code comments:

```ts
const rubric = {
  explains_why:         { description: "Explains why, not what.", weight: 1 },
  flags_the_nonobvious: { description: "Calls out anything surprising — a
                           workaround, an edge case, an external constraint.",
                          weight: 1 },
  stays_in_sync:        { description: "Describes the code as it is now, making
                           no claim the code contradicts.", weight: 1 },
};
```

Drop a criterion and ask: *did I lose a distinct way a comment can fail?* If
not, it was redundant.

## Failure mode 3 — too coarse

The original `quality` criterion bundles several judgments into one pass/fail.
When it fails, you cannot tell whether the comment was slightly off or actively
misleading — a near-miss and a disaster produce the same score, and the `write`
node revising against it gets no usable direction.

Split compound criteria until each is a single pass/fail, and have the critic
attach **evidence** and a **suggestion** to each:

```ts
const RubricScoreSchema = z.object({
  pass: z.boolean(),
  evidence: z.string(),              // why it passed or failed
  suggestion: z.string().optional(), // how to fix it next revision
});
```

Now a failing draft yields a specific, per-criterion list of what to change —
exactly what the reflection loop's `write` node needs to revise instead of
guess. Requiring the judge to produce evidence *before* the verdict, rather than
a bare label, is itself a documented way to raise agreement with human scoring
(Liu et al., 2023). (This is the rubric shape used in this repo's
`src/agent/rubric.ts`.)

## Weights, and the pass rule

Not every criterion is a blocker. Mark each with a weight: weight-1 criteria
must pass for the draft to ship; a lighter criterion is a nudge, not a gate.

```ts
function isPassing(scores) {
  return Object.entries(rubric)
    .filter(([, def]) => def.weight >= 1)
    .every(([name]) => scores[name].pass);
}
```

Keeping the pass rule in one function — and the criteria in one object — means
tuning "what good means" never touches the agent's node code. The rubric is
data.

## The critic prompt

The rubric's `description` strings are not documentation; they are the prompt.
The critic node embeds them verbatim:

```ts
const prompt = `Score this code comment against each criterion.
${Object.entries(rubric).map(([k, d]) => `- ${k}: ${d.description}`).join("\n")}
Return pass/fail, evidence, and (on fail) a suggestion for each.`;
```

Because the rubric is the single source of truth, editing a description changes
the critic's behavior with no code change — and the same descriptions can drive
an offline evaluation, which is **Lesson 3**.

## Try it

1. Write a three-criterion rubric for a domain you know — error messages, PR
   titles, test names.
2. Score ten real examples by hand, then have an LLM score them. Where you
   disagree, the criterion — not the model — is usually the bug.
3. Rewrite the criteria you disagreed on to name an observable, and re-run.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). *G-Eval: NLG
evaluation using GPT-4 with better human alignment* (arXiv:2303.16634). arXiv.
https://arxiv.org/abs/2303.16634

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z.,
Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023).
*Judging LLM-as-a-judge with MT-Bench and Chatbot Arena* (arXiv:2306.05685).
arXiv. https://arxiv.org/abs/2306.05685
