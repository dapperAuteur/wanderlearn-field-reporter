# Module 3 · Lab · Read a trace, catch the masked bug

> **Goal:** drive the loop into each failure mode, then read the local trace to diagnose
> it — including the fail-soft bug that passes every output assertion.
> **Success signal:** `npm run test -- tests/course/module-3-tracing.test.ts` green with
> your additions; you can name the cause of each escalation from its trace. Offline, no
> LangSmith account.

Work on `course/lesson-25`. Code: `examples/support-reply-loop/tracing.ts`.

## Part A — Produce and read each shape (required)

Write a small script (or extend the test) that runs `buildTracedReplyLoop` with four
different writer/judge pairs and prints `summarizeRun(result)`:

1. **Healthy:** weak→strong writer + the keyword judge → resolves, climbing trajectory.
2. **Wasted iteration:** a writer that improves only on its *second* revision → a flat then
   climbing trajectory; confirm `findWastedIterations` flags the flat pass.
3. **Critic drift:** a judge that returns a different score for the same draft on alternating
   calls → confirm `detectCriticDrift` flags it. (Hint: key off a call counter.)
4. **Fail-soft masking:** the blanket-fail judge → `outcome: "escalated"`, and
   `detectFailSoftMasking` returns `true`.

For each, write one sentence: *what does the output say, and what does the trace say?*

## Part B — The masked bug, end to end (required)

1. Confirm the fail-soft run's **output** is just `escalated` — nothing alarming.
2. Confirm the **trace** shows even the known-strong draft scored `0/4`.
3. Add an assertion: the strong draft appears in `trace.steps` with `passedChecks === 0`.
   That assertion is the thing output-only testing can never check — you needed the trace.

## Part C — Make the soft failure loud (required)

The witus-triage fix was to detect the error-fallback and fail loudly. Do the analogue:

1. Have the fail-soft judge put an error signature in its `evidence`
   (`"<error: …>"`), as the real one did in `rationale`.
2. Write a `detectErrorFallback(trace)` (or extend a diagnostic) that flags a run where
   every criterion failed with an error-signature evidence — the loud signal.
3. Decide where it should fire: a trace alert (Module 5) and a loud eval failure (Module 4).
   Write one sentence on each.

## Self-check rubric

| Check | Pass condition |
|---|---|
| Four shapes produced | each writer/judge pair yields the intended trajectory |
| Diagnostics fire | wasted/drift/masking each flagged on the right run |
| Output vs trace | you can state, per run, what output hid that the trace showed |
| Masked-bug assertion | a test asserts the strong draft scored 0 (trace-only knowledge) |
| Loud signal | `detectErrorFallback` (or equivalent) flags the error-fallback run |

All rows green → you can debug a loop from its trace, including the bug that looks healthy.
On to Module 4 (turning this rubric into an offline eval that fails loudly).
