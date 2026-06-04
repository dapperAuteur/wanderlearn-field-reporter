# Video script · Module 5 · Lesson 37 · Cost–quality Pareto framing

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 5 · Lesson 37 · Cost–quality Pareto framing
- **Duration:** ~5 min
- **Objective:** the viewer can place loop configs on a cost–quality plane, drop the dominated ones, and
  choose a point on the frontier.
- **Segments:** screencast (editor + terminal), talking-head close (module + course wrap).
- **Tag:** `course/lesson-37`.

## Block 2 — Pre-production

- `git checkout course/lesson-37`; deps installed.
- `production.ts` open at `paretoFrontier`; test file open.
- Slide: the cost–quality scatter with the frontier; the dominated point.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Every production knob in this module trades cost against quality: max-revisions, the critic model, loop
> versus single-shot. This final lesson gives you the framework that organizes all of them: the cost–quality
> Pareto frontier.

**[Beat 2 · slide: configs as points · 0:30]**
> Each way to run the loop is a point with two coordinates: how good it is, and what it costs. Single-shot,
> quality zero-point-one, cost one. Loop cap one, quality zero-point-nine, cost two. Loop cap three, quality
> zero-point-nine, cost four.

**[Beat 3 · editor + terminal: paretoFrontier · 1:15]**
> A config is dominated when another is at least as good and at least as cheap. Dominated configs are never
> worth running. The frontier is what is left. And look: loop-cap-three is dominated by loop-cap-one, same
> zero-point-nine quality, double the cost. The frontier is single-shot and loop-cap-one, and the test asserts
> exactly that. The insight is concrete: raising max-revisions from one to three bought no quality here and
> doubled the cost. You would never have seen that without putting both configs on the same curve.

**[Beat 4 · slide: choosing a point · 2:30]**
> The frontier does not pick for you. It eliminates the strictly-worse configs and leaves the real choices.
> Single-shot, cheapest but probably below your bar. Loop-cap-one, double the cost for nine times the quality,
> obviously worth it for support replies. Where you sit is a product decision, not an engineering one. A
> legal-document assistant lives at the high-quality end and pays for it. The engineer's job is to compute the
> frontier so the product decision is made with the trade-off visible, not guessed.

**[Beat 5 · talking-head · 3:40]**
> Course close. Reflection is a budget allocation, not a magic wand. You now have the full instrument panel:
> convergence rate for quality, cost-per-converged-output for cost, A/B and single-pass checks for which points
> exist, and the frontier for which points are real. Reflection is not on-or-off and not always-better. It is a
> position on a curve, and you choose it on purpose, measured, bounded, judged, traced, evaluated, and priced.
> The capstone takes the whole stack to a brand-new domain to prove it transfers without the notes.

## Block 4 — Post-production

- Beat 2: plot the three points on a cost–quality scatter.
- Beat 3: shade the dominated point (cap-3); draw the frontier line through single-shot + cap-1; zoom the
  test assertion.
- Beat 5: full-stack recap slide (the six modules as one instrument panel).
- Chapter markers at Beats 2, 3, 4, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `production.ts` `paretoFrontier`; terminal run pointing at the Pareto block
  (frontier = single-shot + loop-cap-1).
- **Beat 4:** cost–quality scatter with the dominated point shaded.
- **Beat 5:** six-module recap slide.

(No optional steps in this lesson — no bonus footage.)
