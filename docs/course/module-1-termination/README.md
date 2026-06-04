# Module 1 · Bounded termination

> **The model you are about to install:** *The cap lives in code; counting is the
> graph's job.*

Module 0's loop had one exit. This module gives it four — counter, convergence,
escalation, and the `recursionLimit` backstop — and composes them in a deliberate
priority order, so the loop terminates on *every* input for a reason you chose, in
a state you can read. Same support-ticket thread domain, same stub critic; now with
real exits.

## Lessons

| # | Lesson | ~min | Runnable |
|---|---|---|---|
| 7 | [Why cyclic graphs need a guaranteed exit](./07-why-cyclic-graphs-need-a-guaranteed-exit.md) | 4 | — |
| 8 | [Pattern 1 — the max-iteration counter (in code, not a prompt)](./08-pattern-1-max-iteration-counter.md) | 5 | ✅ |
| 9 | [Pattern 2 — convergence detection](./09-pattern-2-convergence-detection.md) | 5 | ✅ |
| 10 | [Pattern 3 — human escalation](./10-pattern-3-human-escalation.md) | 4 | ✅ |
| 11 | [Composition — the patterns in priority order](./11-composition-priority-order.md) | 5 | ✅ |
| 12 | [`recursionLimit` — the backstop, not the steering wheel](./12-recursionlimit-backstop-not-steering-wheel.md) | 5 | ✅ |

**Then:** [Lab](./module-1-lab.md) · [Quiz](./module-1-quiz.md) ·
[Feedback](./module-1-feedback.md)

Video scripts are in [`./video/`](./video/).

## Runnable artifact

[`examples/support-reply-loop/termination.ts`](../../../examples/support-reply-loop/termination.ts)
— `buildBoundedReplyLoop` (all patterns composed), `buildUncappedReplyLoop` (the
backstop demo), and `hasConverged`. Tests:
`npm run test -- tests/course/module-1-termination.test.ts` (7 green, offline).

## What you should now believe (module close)

Termination is a small ordered policy: succeed if you can, give up cheaply if you
must, never run unbounded — with a generous framework backstop you never steer
with. The router's reliability rests on trusting the critic's `passed` verdict, so
Module 2 asks the next question: is the critic any good?
