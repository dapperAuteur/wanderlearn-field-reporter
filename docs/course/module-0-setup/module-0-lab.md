# Module 0 · Lab · Extend the reflection loop

> **Goal:** prove to yourself that the loop is a graph you control, by adding a
> check the course did not write, satisfying it, and locking it with a test.
> **Success signal:** `npm run test -- tests/course/module-0-loop.test.ts` stays
> green with your new assertion. No API key, no Docker.

Work on the `course/lesson-06` checkpoint (or your own branch from it).

## Part A — Add a fourth check (required)

The stub critic in `examples/support-reply-loop/graph.ts` scores three checks. Add
a fourth: **states a concrete timeline.**

1. In `scoreReply`, add a check named `states_a_concrete_timeline` whose `passed`
   matches a timeline cue — e.g. `today`, `tomorrow`, a weekday, or
   `within \d+ (hours|days)`. Give it grounded `evidence`.
2. Run the demo: `npx tsx examples/support-reply-loop/run.ts`. The canned strong
   reply already says "today", so it should still pass — confirm it does. If it
   fails, your regex is too strict; fix it.
3. In `tests/course/module-0-loop.test.ts`, add an assertion to the "passes a
   reply…" test that the strong reply now satisfies `states_a_concrete_timeline`,
   and to the "fails a generic reply…" test that the weak reply does not.
4. `npm run test -- tests/course/module-0-loop.test.ts` → green.

You just closed the loop on a check you invented. That is the entire job of a
critique node.

## Part B — Make a draft fail, then pass (required)

1. In `run.ts`, edit the canned strong reply to remove the timeline word. Re-run
   the demo — your new check should now fail and the loop should burn more
   revisions (or exit unresolved at the cap).
2. Put the timeline back. Watch the critic flip to `PASSED`.

This is the convergence/termination behavior from Lesson 6, under your hands.

## Part C — Transfer preview (stretch, optional)

> Optional. If you skip it, you lose nothing required; it previews Module-level
> transfer (F2) early.

Point the *same graph* at a different domain without touching `graph.ts`: write a
new `ticket`/draft pair for a **commit message** ("draft a commit message for: fix
null deref in auth refresh") and a writer that returns a weak then a strong commit
message. The content-word and next-step checks won't fit perfectly — note *where*
the support-reply rubric fails to transfer. That failure is the motivation for
Module 2 (rubric design) and the capstone (a genuinely new domain).

## Self-check rubric

| Check | Pass condition |
|---|---|
| New check added | `scoreReply` returns a fourth check with evidence |
| Demo still converges | `run.ts` ends at `PASSED` with four `[x]` checks |
| Test locks it | new assertions present; `4`+ tests green |
| Termination intact | the "terminates at MAX_REVISIONS" test still passes |
| (Stretch) Transfer noted | you can name one check that did NOT transfer to commits |

If every required row passes, you have built and verified a reflection loop —
move to the quiz.
