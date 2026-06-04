# Module 5 · Production — keeping the loop honest

> **The model you are about to install:** *Reflection is a budget allocation, not a magic wand.*

The loop works, terminates, judges well, is debuggable, and is regression-tested. This module makes
it *honest in production*: online convergence metrics, alerts on runaway loops, cost accounting per
iteration, A/B-testing critic models, the "is a single pass good enough?" gate, and the cost–quality
Pareto frontier that unifies every trade-off. All offline and deterministic, computed from records the
loop already produces.

## Lessons

| # | Lesson | ~min | Runnable |
|---|---|---|---|
| 32 | [Online evals on convergence rate](./32-online-evals-on-convergence-rate.md) | 5 | ✅ |
| 33 | [Alerts on runaway loops](./33-alerts-on-runaway-loops.md) | 4 | ✅ |
| 34 | [A/B testing critic models](./34-ab-testing-critic-models.md) | 5 | ✅ |
| 35 | [Cost accounting per iteration](./35-cost-accounting-per-iteration.md) | 5 | ✅ |
| 36 | [The "single-pass good enough?" check](./36-the-single-pass-good-enough-check.md) | 4 | ✅ |
| 37 | [Cost–quality Pareto framing](./37-cost-quality-pareto-framing.md) | 5 | ✅ |

**Then:** [Lab](./module-5-lab.md) · [Quiz](./module-5-quiz.md) ·
[Feedback](./module-5-feedback.md)

Video scripts are in [`./video/`](./video/).

## Runnable artifact

[`examples/support-reply-loop/production.ts`](../../../examples/support-reply-loop/production.ts)
— `runCost` (per-iteration accounting), `runProduction` + `computeMetrics` (convergence rate,
avg iterations, runaway count, cost-per-converged-output), `checkAlerts`, `singlePassGoodEnough`,
`abCompare`, and `paretoFrontier`. Tests:
`npm run test -- tests/course/module-5-production.test.ts` (7 green, offline).

## What you should now believe (module + course close)

Reflection is a position on a cost–quality curve, not on-or-off and not always-better. You have the
full instrument panel — convergence (quality), cost-per-converged-output (cost), A/B and single-pass
checks (which points exist), and the Pareto frontier (which points are real) — so where the loop sits
is a deliberate product decision, not a hope. The capstone (Module 6) takes the whole stack to a
**new domain** — legal clause → plain language — to prove it transfers.
