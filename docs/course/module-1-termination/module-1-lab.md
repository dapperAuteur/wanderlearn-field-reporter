# Module 1 · Lab · Compose and break termination

> **Goal:** prove you understand termination by adding an exit, then deliberately
> mis-ordering the router and watching a correctness bug appear.
> **Success signal:** `npm run test -- tests/course/module-1-termination.test.ts`
> green after Parts A–B; a *failing* test you can explain in Part C. Offline, no key.

Work on the `course/lesson-12` checkpoint (or a branch from it). The code is
`examples/support-reply-loop/termination.ts`.

## Part A — Add a fourth exit: a cost ceiling (required)

Add a termination condition that escalates when the loop has spent too many *total*
LLM calls, independent of revisions (a real production guard).

1. Add a `maxCalls` notion: since each pass is ~2 calls (write + critique), escalate
   when `revisionNumber * 2 >= MAX_CALLS` for a new `MAX_CALLS` constant (set it so
   it triggers around the same place as the counter, then lower it).
2. Place the check in `routeWithAllPatterns` **in the right priority slot** — below
   success and convergence, beside the revision cap. Defend your placement in a
   comment.
3. Run the test. The existing assertions should still pass. Add one asserting your
   cost ceiling escalates when `MAX_CALLS` is low.

## Part B — Convergence by a different measure (required)

Replace exact-match convergence with a length-stability measure: converged when the
last two drafts differ in length by ≤ 2 characters.

1. Rewrite `hasConverged` to compare `Math.abs(a.length - b.length) <= 2`.
2. Re-run the test. Reason about whether the stalling-writer test still escalates at
   revision 2 (it should — identical drafts have identical length).
3. Note the tradeoff you just made: length-stability is cheaper but can false-positive
   on same-length rewrites. This is the convergence-signal choice from Lesson 9, made
   real.

## Part C — Break the priority order, on purpose (required)

1. In `routeWithAllPatterns`, move the `MAX_REVISIONS` check **above** the
   `critique.passed` check.
2. Run the test. The **success test fails** — a draft that passes on the capped
   revision now escalates.
3. Write one sentence explaining the failure in terms of Lesson 11's principle, then
   restore the order and confirm green.

You just experienced priority-order as a correctness property, not a style choice.

## Self-check rubric

| Check | Pass condition |
|---|---|
| Fourth exit added | cost-ceiling branch present in the router, priority defended |
| Cost-ceiling tested | a new assertion escalates when `MAX_CALLS` is low |
| Convergence swapped | `hasConverged` uses the length measure; stall test still escalates at 2 |
| Order break understood | you can state *why* success-below-cap mis-routes a good draft |
| Restored + green | router order restored; full Module 1 test green |

All required rows green → you can build, compose, and reason about a bounded loop.
On to Module 2.
