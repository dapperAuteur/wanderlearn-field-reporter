# Module 0 · Reflection-loop primitive + setup

> **The model you are about to install:** *Reflection is a graph, not a prompt.*

This module gets you running and builds the minimal write → critique → revise loop
on the course's thread domain — **customer support-ticket replies**. You finish
with a loop that runs offline (no API key, no Docker) and a test that proves it
both converges and terminates.

## Lessons

| # | Lesson | ~min | Runnable |
|---|---|---|---|
| 1 | [Course overview & "reflection is a graph, not a prompt"](./01-course-overview.md) | 4 | — |
| 2 | [Getting set up (TypeScript)](./02-getting-set-up-typescript.md) | 4 | ✅ |
| 3 | [Getting set up (Python)](./03-getting-set-up-python.md) | 3 | ✅ |
| 4 | [Python ↔ TypeScript translation table](./04-python-typescript-translation-table.md) | 3 | — |
| 5 | [Why one pass is plausible, not good](./05-why-one-pass-is-plausible-not-good.md) | 5 | — |
| 6 | [The minimal write → critique loop with a stub critic](./06-the-minimal-write-critique-loop.md) | 6 | ✅ |

**Then:** [Lab](./module-0-lab.md) · [Quiz](./module-0-quiz.md) ·
[Feedback](./module-0-feedback.md)

Video scripts for every lesson are in [`./video/`](./video/).

## Runnable artifact

[`examples/support-reply-loop/`](../../../examples/support-reply-loop/) —
`npx tsx examples/support-reply-loop/run.ts` and
`npm run test -- tests/course/module-0-loop.test.ts`.

## What you should now believe (module close)

Generation and judgment are *separate nodes*; revision is a *cyclic edge*; "when
to stop" is a *counter in the routing function*. You hold the reflection-loop
primitive. Module 1 hardens the cap into guaranteed, well-behaved termination.
