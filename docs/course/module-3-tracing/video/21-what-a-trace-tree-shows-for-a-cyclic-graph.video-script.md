# Video script · Module 3 · Lesson 21 · What a trace tree shows for a cyclic graph

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 3 · Lesson 21 · What a trace tree shows for a cyclic graph
- **Duration:** ~5 min
- **Objective:** the viewer can read revision count, cost, score trajectory, and terminal
  state off a cyclic trace tree.
- **Segments:** screencast (annotated trace-tree slide + editor), talking-head close.
- **Tag:** `course/lesson-21`.

## Block 2 — Pre-production

- Slide: the annotated trace tree (write/critique repeating, per-criterion child spans).
- `tracing.ts` open at the `TraceStep` / `RunTrace` shapes.
- `git checkout course/lesson-21`.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> A reflection loop is a cycle, and a cycle traces differently from a straight pipeline.
> The same node appears many times, once per pass. Let me teach you to read that shape.

**[Beat 2 · slide: linear vs cyclic · 0:25]**
> A linear chain traces as a tidy ladder, each node once. A reflection loop traces as a
> repeating structure, because write-reply to critique-reply runs again every time the
> router sends it back. Here is the tree: the run at the root, write and critique stacked
> per revision, and under each critique, one child span per criterion with its own pass or
> fail and evidence.

**[Beat 3 · slide: four things at a glance · 1:30]**
> You read four things without reading any text. One, revision count equals how many
> critique spans there are. Two spans, one revision. Six, the loop nearly hit the cap, a
> smell. Two, where time and tokens went, each span carries duration and counts. Three, the
> score trajectory, reading passed-checks down the critique spans, two-of-four to
> four-of-four shows the loop improving. Four, the terminal node, mark-resolved or
> flag-for-human, tells you how it ended, the thing the output threw away.

**[Beat 4 · slide: per-criterion spans · 2:55]**
> And because Module 2's judge scores one criterion at a time, each critique span has a
> child per criterion, with its own verdict and evidence. So when a draft fails you do not
> see critique failed, you see which criterion failed, with the judge's evidence. A compound
> criterion would collapse those into one ambiguous verdict. Atomic criteria keep the trace
> legible. The rubric craft pays off in debugging.

**[Beat 5 · talking-head · 3:50]**
> The deep point: a log throws away structure, a trace preserves it. The cycle, the nesting,
> the order, all survive in the tree. That preserved structure is what makes every diagnosis
> coming up a matter of reading a shape, not reconstructing a story from log fragments. You
> do not parse a cyclic trace. You look at it.

## Block 4 — Post-production

- Beat 2: build the tree, animating the second write/critique pass appearing.
- Beat 3: number-callout the four readable signals on the tree.
- Beat 4: expand a critique span to reveal four per-criterion children.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** annotated trace-tree slide (linear ladder vs cyclic repeat).
- **Beat 3:** highlight revision count, a duration/token chip, the score column, terminal node.
- **Beat 4:** expand one `critique_reply` to show per-criterion spans; briefly show
  `TraceStep` in `tracing.ts`.

(No optional steps in this lesson — no bonus footage.)
