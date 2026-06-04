# Module 3 · Tracing reflection loops in LangSmith

> **The model you are about to install:** *Tracing makes bugs legible, not rarer.*

A reflection loop is undebuggable from its output — a wrong answer and a right one are
both just strings. This module wires fail-soft tracing and teaches you to read a cyclic
trace tree, diagnosing the four ways a loop misbehaves: wasted iterations, critic drift,
non-convergence, and a fail-soft critic silently masking total failure. The last is a
**real production bug** from a sibling agent.

## Lessons

| # | Lesson | ~min | Runnable |
|---|---|---|---|
| 19 | [Why an LLM app is undebuggable without tracing](./19-why-an-llm-app-is-undebuggable-without-tracing.md) | 4 | — |
| 20 | [LangSmith fail-soft wiring](./20-langsmith-fail-soft-wiring.md) | 5 | ✅ |
| 21 | [What a trace tree shows for a cyclic graph](./21-what-a-trace-tree-shows-for-a-cyclic-graph.md) | 5 | — |
| 22 | [Diagnosing wasted iterations](./22-diagnosing-wasted-iterations.md) | 5 | ✅ |
| 23 | [Diagnosing critic drift](./23-diagnosing-critic-drift.md) | 4 | ✅ |
| 24 | [Diagnosing non-convergence](./24-diagnosing-non-convergence.md) | 4 | ✅ |
| 25 | [A worked real bug from production](./25-a-worked-real-bug-from-production.md) | 6 | ✅ |

**Then:** [Lab](./module-3-lab.md) · [Quiz](./module-3-quiz.md) ·
[Feedback](./module-3-feedback.md)

Video scripts are in [`./video/`](./video/).

## Runnable artifact

[`examples/support-reply-loop/tracing.ts`](../../../examples/support-reply-loop/tracing.ts)
— `tracingConfig`/`isTracingEnabled` (fail-soft env wiring, three LangSmith vars),
`buildTracedReplyLoop` (records a local `RunTrace`), and the diagnostics
`findWastedIterations`, `detectCriticDrift`, `didNotConverge`, `detectFailSoftMasking`
(the witus-triage bug). Tests:
`npm run test -- tests/course/module-3-tracing.test.ts` (8 green, offline — no LangSmith
account required).

## LangSmith setup (optional)

No lesson requires an account; the diagnostics run on a local trace. To light up real
dashboards, provision `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`, `LANGSMITH_TRACING` (see
`plans/user-tasks/09-langsmith-team-tier.md`).

## What you should now believe (module close)

A fail-soft node — the thing that keeps your graph alive — can turn a total failure into
clean-looking output that passes every test; the trace is the only artifact that recovers
the truth. Trace your loops, and make soft failures loud in the trace and the eval. That
eval is Module 4: the runtime rubric, reused as an offline regression test that fails
loudly instead of lying quietly.
