# Video script · Module 1 · Lesson 8 · Pattern 1 — the max-iteration counter

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 1 · Lesson 8 · Pattern 1 — the max-iteration counter (in code, not a prompt)
- **Duration:** ~5 min
- **Objective:** the viewer can implement a code-level counter and explain why a
  prompt-counted cap is not a cap.
- **Segments:** screencast (editor + terminal), talking-head bookends.
- **Tag:** `course/lesson-08`.

## Block 2 — Pre-production

- `git checkout course/lesson-08`; clean tree; deps installed.
- `examples/support-reply-loop/termination.ts` and
  `tests/course/module-1-termination.test.ts` open.
- Slide: the "Prompt-counted termination" anti-pattern card.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The first termination pattern is a plain integer counter the graph increments and
> the router checks. Unglamorous, and the one you must never skip.

**[Beat 2 · editor: increment + check · 0:20]**
> Two halves. The write node increments a counter every pass. The router compares it
> to a constant. Because the counter strictly increases and the router exits at the
> bound, the loop halts in at most max-revisions passes, regardless of the rubric,
> the writer, or the model's mood. A guarantee, not a tendency.

**[Beat 3 · slide: anti-pattern · 1:15]**
> Now the version that looks equivalent and is not: telling the model in the prompt,
> revise at most three times then stop. Prompt-counted termination. It reads like a
> cap. It is not one. The model cannot reliably count its own turns. It is one
> confused completion from ignoring you. And it is invisible to your guards: you
> cannot alert on, trace, or test a bound that lives inside a paragraph.

**[Beat 4 · talking-head · 2:30]**
> The cap is a control-flow decision, and control flow belongs in the graph, not in
> the generator you are trying to control. Putting the safety bound inside the thing
> it is supposed to bound is the category error this whole module exists to prevent.

**[Beat 5 · editor: MAX_REVISIONS constant · 3:00]**
> Max-revisions is a budget. Set it like one. Most loops that converge do so in two
> or three passes. Start at three, measure honestly in Module 4, adjust. The point
> is not the number. It is that some finite number is enforced in code.

**[Beat 6 · terminal: run the counter test · 3:35]**
> Watch it stop. This test uses a writer that always fails but always changes its
> draft, so convergence never fires and only the counter can stop it. The run ends
> escalated at exactly max-revisions. Pattern 1 doing its one job.

**[Beat 7 · talking-head · 4:20]**
> The hard counter is the floor under every reflection loop. In code, checked by the
> router, non-negotiable. Other patterns make the loop smarter about stopping. The
> counter makes it safe. Never ship without it.

## Block 4 — Post-production

- Beat 2: highlight box on `revisionNumber + 1` and on `>= MAX_REVISIONS`.
- Beat 3: anti-pattern card; strike-through animation on "revise at most three times".
- Beat 6: zoom on the test's "escalated" + revision-count assertions.
- Chapter markers at Beats 2, 3, 5, 6.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `termination.ts` — show the increment in `writeReply` and the
  `>= MAX_REVISIONS` line in `routeWithAllPatterns`.
- **Beat 3:** cut to the anti-pattern slide.
- **Beat 5:** open `graph.ts`; highlight `export const MAX_REVISIONS = 3`.
- **Beat 6:** terminal — `npm run test -- tests/course/module-1-termination.test.ts`;
  point at the "Pattern 1" describe block passing; zoom "7 passed".

(No optional steps in this lesson — no bonus footage.)
