# Video script · Module 3 · Lesson 24 · Diagnosing non-convergence

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 3 · Lesson 24 · Diagnosing non-convergence
- **Duration:** ~4 min
- **Objective:** the viewer can triage a non-converged run by reading the score trajectory,
  and avoid the raise-the-cap anti-pattern.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-24`.

## Block 2 — Pre-production

- `git checkout course/lesson-24`; deps installed.
- `tracing.ts` open at `didNotConverge`; test file open.
- Slide: the three trajectory shapes + fixes; the anti-pattern card.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Third trouble-shape: non-convergence. A run that never reached a passing draft and exited
> by escalation or cap. Not itself a bug, Module 1 made it a designed outcome, but a rate of
> it is a signal, and the trace tells you the cause.

**[Beat 2 · editor: didNotConverge · 0:30]**
> The detection is a one-liner, because the outcome already carries it: escalated means did
> not converge. The test asserts true for escalated, false for resolved. But detection is
> trivial. The real work is reading the trace to learn why this run did not converge, because
> the fix differs entirely by cause.

**[Beat 3 · slide: three causes · 1:15]**
> Three shapes, told apart by the score trajectory. One, the score climbs but ran out of
> passes, one to two to three, cap hit. Cause: needed more budget. Fix: raise max-revisions,
> it was converging, just slowly. Two, the score is flat the whole way, two, two, two. Cause:
> writer or rubric stuck. Fix the suggestions, do not just raise the cap. Three, the score is
> zero on every pass, even on good drafts. Something is broken upstream. That is Lesson 25.

**[Beat 4 · slide: anti-pattern · 2:30]**
> Here is the anti-pattern: raising the cap to fix non-convergence. Reflexively bumping
> max-revisions whenever runs escalate. It rescues only the genuinely-slow case. For a flat
> trajectory it just buys more identical failing passes at full price. Read the trajectory
> first. Raise the cap only when the score was actually climbing.

**[Beat 5 · talking-head · 3:15]**
> Escalation is one outcome hiding three causes that demand opposite fixes: more budget, a
> better writer or rubric, or an upstream repair. The trajectory is the triage tool. And the
> rate of non-convergence, not any single run, is what tells you the system changed, which
> Module 5 puts on a dashboard with an alert.

## Block 4 — Post-production

- Beat 3: three-trajectory slide, each with its fix; color climb green, flat amber, zeros red.
- Beat 4: anti-pattern card.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `tracing.ts` — `didNotConverge`; terminal run pointing at the non-convergence block.
- **Beat 3:** three-causes-and-fixes slide.
- **Beat 4:** raise-the-cap anti-pattern card.

(No optional steps in this lesson — no bonus footage.)
