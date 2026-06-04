# Video script · Module 1 · Lesson 10 · Pattern 3 — human escalation

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 1 · Lesson 10 · Pattern 3 — human escalation
- **Duration:** ~4 min
- **Objective:** the viewer can model "needs a human" as a first-class terminal
  state distinct from success.
- **Segments:** screencast (editor + terminal), talking-head bookends.
- **Tag:** `course/lesson-10`.

## Block 2 — Pre-production

- `git checkout course/lesson-10`; clean tree.
- `termination.ts` open at `markResolved` / `flagForHuman` / the builder edges.
- `src/agent/graph.ts` open at the real `flag_for_human_review` node (cross-reference).
- Slide: "resolved vs escalated" two-ending diagram.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The counter and convergence both stop the loop unresolved. They fire precisely
> when the draft did not pass. Pattern 3 answers what to do with a draft you stopped
> improving but never made good. You hand it to a human.

**[Beat 2 · slide: two endings · 0:25]**
> A reflection loop has two honest endings, and conflating them is a mistake.
> Resolved: the critique passed, ship it. Escalated: the loop stopped without
> passing, a human must own it. If your loop only has end, both look identical
> downstream, and you will ship an unresolved draft to a customer because nothing
> distinguished we fixed it from we gave up.

**[Beat 3 · editor: two terminal nodes · 1:15]**
> So escalation is its own node with its own side effect, reached by its own route.
> Mark-resolved sets outcome resolved. Flag-for-human sets escalated and outcome
> escalated. The run ends in one of two named states. In a real system, flag-for-
> human opens a ticket or drops the draft into a review queue with the failing
> critique attached, so the human starts with the diagnosis, not a blank page.

**[Beat 4 · editor: src/agent/graph.ts · 2:10]**
> This is not a toy. The field-reporter agent in this very repo does exactly this:
> its graph routes to a flag-for-human-review node when the rubric fails past
> max-revisions. Same pattern, production code.

**[Beat 5 · talking-head · 2:45]**
> Why inside the graph and not the caller? Two reasons. One source of truth for how
> it ended: the graph already knows why it stopped. And it composes with the
> routing: escalation is one of the router's branches, beside the other exits in
> priority order.

**[Beat 6 · terminal: tests · 3:15]**
> The escalation tests assert outcome escalated and the flag set; the success test
> asserts outcome resolved. Two endings, observable and testable facts. That is the
> whole point.

**[Beat 7 · talking-head · 3:40]**
> The loop stopped and the loop succeeded are different claims, and a reliable
> system encodes the difference. Escalation is the loop being honest that not every
> input is one it can resolve alone.

## Block 4 — Post-production

- Beat 3: highlight `outcome: "resolved"` vs `escalated: true, outcome: "escalated"`.
- Beat 4: highlight `flag_for_human_review` in `src/agent/graph.ts`.
- Chapter markers at Beats 2, 3, 4, 6.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** two-endings slide.
- **Beat 3:** `termination.ts` — `markResolved`, `flagForHuman`, and the two
  `addEdge(..., END)` lines; highlight the distinct outcomes.
- **Beat 4:** open `src/agent/graph.ts`; scroll to the `flag_for_human_review`
  route in `routeAfterCritique`.
- **Beat 6:** terminal — run the Module 1 test; point at the success vs escalation
  assertions.

(No optional steps in this lesson — no bonus footage.)
