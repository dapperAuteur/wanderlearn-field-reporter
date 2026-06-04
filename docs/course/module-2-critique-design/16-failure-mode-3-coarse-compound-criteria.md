# Module 2 · Lesson 16 · Failure mode 3 — coarse compound criteria

> **Tag:** `course/lesson-16` · **Module 2: Critique design** · ~5 min

## The model you are about to install

The third failure mode is one criterion doing two jobs. A **compound criterion**
bundles multiple checks into a single pass/fail, so its verdict cannot say *which*
part failed — and a critic that cannot localize a defect cannot give the writer
feedback it can act on. This is the one failure mode you can partly automate, and
this lesson ships a linter for it.

## What compound looks like

> "Acknowledges the issue **and** gives a next step **and** ends politely."

One key, one boolean, three questions. Now a draft that names the problem and signs
off but offers no next step gets a single `false`. What does the writer do with
that? It cannot tell which of the three parts it missed, so its revision is a guess.
The verdict is technically correct and operationally useless.

Compound criteria are seductive because they read like a *summary* of quality —
"the reply should acknowledge, act, and close." That sentence is a fine description
of the rubric. It is a terrible single criterion. The rubric should *be* three
checks; the compound version *describes* three checks while scoring as one.

## Why it breaks the loop specifically

A reflection loop's feedback channel is the critique's per-criterion failures. The
writer revises against *what failed*. Collapse three checks into one and you collapse
three independent pieces of feedback into one ambiguous bit:

- **Lost localization.** "This compound check failed" does not say where, so the
  revision cannot target the actual gap.
- **Lost partial credit.** A draft that fixed two of the three parts still shows the
  same single `false`, so the loop cannot see it made progress — and convergence
  detection (Module 1) may misfire because the visible verdict did not move.
- **Lost weighting.** You cannot weight "has a sign-off" differently from
  "gives a next step" if they are the same criterion. Lesson 18's data-driven
  weights become impossible.

## The fix, and a linter to enforce it

Split every compound criterion into its atoms — one check each:

```
✗  "Acknowledges the issue and gives a next step and ends politely."
✓  acknowledges_issue   — "Names the specific problem the customer reported."
✓  gives_next_step      — "States one concrete action that resolves the problem."
✓  has_signoff          — "Ends with a sign-off naming the sender."
```

Because compoundness has a *textual signature* — conjunctions and comma-joined
clauses — you can lint for it. The Module 2 code ships exactly that
(`examples/support-reply-loop/rubric.ts`):

```ts
export function findCompoundCriteria(rubric: RubricCriterion[]): string[] {
  return rubric
    .filter((c) => /\b(and|or)\b/i.test(c.description) || c.description.includes(","))
    .map((c) => c.key);
}
```

Run it over any rubric you write. The support-reply rubric returns `[]`; a rubric
with `"Is professional and friendly."` returns `["tone"]`. It is a *smell* detector,
not a proof — a criterion can be compound without the word "and" ("a timely,
on-brand reply") — but it catches the common case automatically and cheaply, and the
Module 2 test asserts the clean rubric stays clean.

## The limit of automation

The linter catches compound; it cannot catch *vague* (Lesson 14) or *overlap*
(Lesson 15), because those have no reliable textual signature — they need the
judgment calls "could two readers disagree?" and "could a draft split these?" That
boundary is the whole reason this module is a craft and not a checklist: automate
the mechanical failure mode, and reserve your attention for the two that need a human.

## What you should now believe

One criterion, one question. If a criterion contains an "and," it is two criteria
wearing one key — split it, and lint to keep it split. The verdict you want from a
critic is not "is this good" but "which specific thing is missing," and only atomic
criteria can answer that.

## Try it

Add `{ key: "complete", description: "Names the issue and the fix and the timeline.",
weight: 1 }` to a rubric copy and run `npm run test -- tests/course/module-2-critique.test.ts`
after extending the linter test to include it. Watch `findCompoundCriteria` flag it.
Then split it into the three atomic checks and watch the flag clear.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG
evaluation using GPT-4 with better human alignment. In *Proceedings of the 2023
Conference on Empirical Methods in Natural Language Processing* (pp. 2511–2522).
Association for Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/
