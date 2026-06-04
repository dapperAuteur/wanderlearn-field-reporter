# Video script · Module 3 · Lesson 22 · Diagnosing wasted iterations

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 3 · Lesson 22 · Diagnosing wasted iterations
- **Duration:** ~5 min
- **Objective:** the viewer can spot a wasted iteration in a trace and reason about its
  three causes.
- **Segments:** screencast (editor + terminal), talking-head bookends.
- **Tag:** `course/lesson-22`.

## Block 2 — Pre-production

- `git checkout course/lesson-22`; deps installed.
- `tracing.ts` open at `findWastedIterations`; test file open.
- Slide: healthy-climb vs flat trajectory; the three causes table.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> First trouble-shape: a wasted iteration. A revision that cost an LLM call and moved the
> score nowhere. The loop terminated correctly, Module 1 guaranteed that, but it spent budget
> on drafts no better than before.

**[Beat 2 · slide: the trajectory · 0:30]**
> Read passed-checks down the critique spans. A healthy loop climbs: two-of-four, then
> four-of-four, resolved. A wasted iteration is flat: two-of-four, two-of-four, four-of-four.
> Revision two cost a write and a critique and the score did not move.

**[Beat 3 · editor + terminal: findWastedIterations · 1:15]**
> The diagnostic walks the steps and flags any pass whose score did not exceed the prior one.
> The test feeds it one-to-one-to-four and asserts it returns revision two. In LangSmith you
> would see a flat run of equal-height critique spans and click into revision two to ask why
> it did not improve.

**[Beat 4 · slide: three causes · 2:15]**
> A wasted iteration is a symptom. The trace tells you the cause. One, the feedback was not
> actionable, the suggestion was vague, the Lesson 17 failure downstream. Two, the writer
> ignored good feedback, the new draft did not address specific suggestions. Three, the
> criterion is genuinely hard and the model plateaus. You cannot tell which from the outcome.
> You can tell instantly from the trace, because it carries the suggestion and the next draft
> side by side.

**[Beat 5 · talking-head · 3:30]**
> Correct termination is not efficient termination. A loop can stop properly and still
> squander half its passes, and the only way to see it is the score trajectory. Every wasted
> iteration is real money and latency, which Module 5 tracks. Flat critique spans are money
> on the floor. Pick them up.

## Block 4 — Post-production

- Beat 2: animate the flat trajectory in red vs the climbing one in green.
- Beat 3: zoom the `<=` comparison and the `[2]` assertion.
- Beat 4: three-causes table with the fix per row.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** trajectory slide.
- **Beat 3:** `tracing.ts` — `findWastedIterations`; terminal run pointing at the
  wasted-iteration describe block returning `[2]`.
- **Beat 4:** three-causes table.

(No optional steps in this lesson — no bonus footage.)
