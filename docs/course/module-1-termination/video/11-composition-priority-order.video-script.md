# Video script · Module 1 · Lesson 11 · Composition — the patterns in priority order

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 1 · Lesson 11 · Composition — the patterns in priority order
- **Duration:** ~5 min
- **Objective:** the viewer can read a multi-exit router and defend why each
  termination check sits where it does.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-11`.

## Block 2 — Pre-production

- `git checkout course/lesson-11`; clean tree.
- `termination.ts` open at `routeWithAllPatterns`; test file open.
- Slide: the four-branch cascade with priority numbers 1–4.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> You have three exits, counter, convergence, escalation, plus the revise edge. Now
> compose them into one router. And the lesson is the order, because more than one
> can be true at once, and the order changes the outcome.

**[Beat 2 · editor: routeWithAllPatterns · 0:30]**
> One router, four branches, top to bottom. Success. Convergence. Cap. Otherwise
> revise. Four mutually-exclusive outcomes from a cascade, and the first matching
> branch wins.

**[Beat 3 · editor + slide: success first · 1:05]**
> Why this order? Success first, above everything. A draft that passes on the third
> and final allowed revision is a win, not an escalation. Put the cap check first
> and you would escalate a perfectly good reply. Success must dominate.

**[Beat 4 · slide: convergence before cap · 1:50]**
> Convergence before the cap. Both route to a human, so the destination is the same,
> but the order changes when and why. Checking convergence first escalates at
> revision two, the stall, instead of grinding to revision three to reach the same
> human. Same destination, two fewer wasted calls, a truer reason recorded.

**[Beat 5 · slide: cap last, revise default · 2:35]**
> The cap is the backstop. It only acts if nothing smarter stopped the loop, so it
> sits just above revise. And revise is the default: only if no exit condition holds
> does the loop spend another iteration. Keep going is what you do when no reason to
> stop has fired. Never the other way around.

**[Beat 6 · talking-head · 3:15]**
> The principle, redeployable far beyond this loop: when several termination
> conditions can be true at once, termination is a priority-ordered list, not an
> unordered set. Success beats give-up. Cheap give-up beats expensive give-up. The
> hard backstop is last. Get the order wrong and you do not get a crash. You get a
> subtly wrong outcome no type checker will catch.

**[Beat 7 · terminal: overlap tests · 3:55]**
> The tests probe the overlaps on purpose. The success test passes on a revision,
> success beats cap. The convergence test stalls, convergence beats cap, escalating
> at two. The counter test always differs, only the cap fires. Three priority
> interactions, all green.

**[Beat 8 · talking-head · 4:30]**
> Termination is a small ordered policy: succeed if you can, give up cheaply if you
> must, never run unbounded. With that in code, the loop is reliable. Next module,
> the other half of loop quality: is the critic the router trusts any good?

## Block 4 — Post-production

- Beat 2: number the four branches 1–4 as overlays on the code.
- Beats 3–5: split-screen the relevant branch with the priority slide.
- Beat 7: zoom each describe block result.
- Chapter markers at Beats 2, 3, 4, 5, 6.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `routeWithAllPatterns`; reveal/number each branch.
- **Beat 3:** highlight `critique.passed → mark_resolved` at the top.
- **Beat 4:** highlight the `hasConverged` line sitting above the `MAX_REVISIONS` line.
- **Beat 5:** highlight the `MAX_REVISIONS` line and the default `return "write_reply"`.
- **Beat 7:** terminal — run the Module 1 test; point at the three describe blocks
  (Pattern 1 / Pattern 2 / success).

(No optional steps in this lesson — no bonus footage.)
