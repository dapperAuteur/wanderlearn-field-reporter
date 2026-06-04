# Module 6 · Capstone — the whole stack on a new domain

> **The model you are about to install:** *You can redeploy the reflection-loop pattern, without the
> notes, on a domain you have never seen.*

The capstone composes all six modules — primitive, termination, rubric, tracing, eval, production — on a
**new domain**: rewriting dense legal/regulatory clauses into plain language. Everything structural is
*reused* from the support-reply modules; the only new code is a rubric and a corpus. A programmatic
transfer test then carries the scorer to a **third** domain (commit messages) to prove the pattern is
durable, not domain-shaped.

## Lessons

| # | Lesson | ~min | Runnable |
|---|---|---|---|
| 38 | [The capstone — composing the whole stack on a new domain](./38-the-capstone-composing-the-whole-stack.md) | 5 | ✅ |
| 39 | [Designing a rubric for a new domain](./39-designing-a-rubric-for-a-new-domain.md) | 5 | ✅ |
| 40 | [Composing the capstone graph](./40-composing-the-capstone-graph.md) | 5 | ✅ |
| 41 | [The capstone eval and dashboard](./41-the-capstone-eval-and-dashboard.md) | 5 | ✅ |
| 42 | [The transfer test — a third domain, without the notes](./42-the-transfer-test-a-third-domain.md) | 5 | ✅ |
| 43 | [Course close — the model you installed](./43-course-close-the-model-you-installed.md) | 4 | — |

**Then:** [Lab](./module-6-lab.md) · [Quiz](./module-6-quiz.md) ·
[Feedback](./module-6-feedback.md)

Video scripts are in [`./video/`](./video/).

## Runnable artifact

[`examples/capstone-plain-language/index.ts`](../../../examples/capstone-plain-language/index.ts)
— the capstone composition: `plainLanguageRubric`, the `plainLanguageDataset` corpus,
`buildPlainLanguageLoop` (reuses M1's `routeWithAllPatterns` + state and M2's `scoreAgainstRubric`),
`runCapstoneEval` / `runCapstoneProduction`, and offline stand-ins. The eval/metrics helpers
(`pairwise`, `meetsThreshold`, `assertNoInfraErrors`, `computeMetrics`, `paretoFrontier`) are imported
**unchanged** from M4/M5 — that import list is the transfer. Tests:
`npm run test -- tests/course/module-6-capstone.test.ts` (6 green, offline) — the full stack on legal→plain,
plus a third-domain (commit-message) transfer test.

## Sources (corpus provenance)

The `recovery` clause is **verbatim** from U.S. federal plain-language materials (public domain; Plain
Language Action and Information Network, plainlanguage.gov). The other dense clauses are **author-written**
in that same public-domain federal/legal register — no licensing required. None are under copyright.

## What you should now believe (course close)

The six modules are one method: a reflection loop is a *cyclic graph* with a *guaranteed exit*, steered by
a *data rubric an LLM can score*, made *legible by tracing*, *protected by an eval that reuses the rubric*,
and *allocated as a budget on a cost–quality curve* — and because every piece is generic, the whole thing
**transfers**. Reread Lesson 1; the staircase is complete.
