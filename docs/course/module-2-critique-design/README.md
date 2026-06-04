# Module 2 · Critique design (writing rubrics an LLM can score)

> **The model you are about to install:** *Writing checks an LLM can actually score
> is a craft.*

Module 1 made the loop terminate; Module 2 makes it *good*. The rubric — not the
prompt — is the lever, and this module is the craft of writing it: the three ways a
criterion fails (vague, overlapping, compound), evidence + suggestion per verdict,
and weights + pass rules as data the node only reads. The stub critic from Module 0
becomes a real, data-driven rubric scored by an injected LLM judge.

## Lessons

| # | Lesson | ~min | Runnable |
|---|---|---|---|
| 13 | [The rubric is the lever, not the prompt](./13-rubric-is-the-lever-not-the-prompt.md) | 5 | ✅ |
| 14 | [Failure mode 1 — vague criteria](./14-failure-mode-1-vague-criteria.md) | 5 | — |
| 15 | [Failure mode 2 — overlapping criteria](./15-failure-mode-2-overlapping-criteria.md) | 4 | — |
| 16 | [Failure mode 3 — coarse compound criteria](./16-failure-mode-3-coarse-compound-criteria.md) | 5 | ✅ |
| 17 | [Evidence and suggestion per criterion](./17-evidence-and-suggestion-per-criterion.md) | 5 | ✅ |
| 18 | [Weights and pass rules as data, not in node code](./18-weights-and-pass-rules-as-data.md) | 5 | ✅ |

**Then:** [Lab](./module-2-lab.md) · [Quiz](./module-2-quiz.md) ·
[Feedback](./module-2-feedback.md)

Video scripts are in [`./video/`](./video/).

## Runnable artifact

[`examples/support-reply-loop/rubric.ts`](../../../examples/support-reply-loop/rubric.ts)
— the rubric as data, `CriterionVerdictSchema` (evidence + suggestion required),
`applyPassRule` (all-blocking / weighted-threshold), `findCompoundCriteria` (the
failure-mode-3 linter), and `buildRubricReplyLoop` (the rubric critic dropped into
Module 1's bounded loop). Tests:
`npm run test -- tests/course/module-2-critique.test.ts` (10 green, offline — a
deterministic fake judge stands in for the LLM).

## What you should now believe (module close)

The whole lever — criteria, weights, pass rule — is data the node merely reads, so
the loop's quality is something you edit and test, not something you hope for. Because
the rubric is data, it can be both the runtime critic and the offline eval (Module 4).
First, Module 3 makes the loop visible: a critic you cannot trace is a critic you
cannot debug.
