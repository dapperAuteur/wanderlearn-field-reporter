# Video script · Module 5 · Lesson 32 · Online evals on convergence rate

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 5 · Lesson 32 · Online evals on convergence rate
- **Duration:** ~5 min
- **Objective:** the viewer can compute convergence rate from run records and explain online vs
  offline eval.
- **Segments:** screencast (editor + terminal), talking-head bookends.
- **Tag:** `course/lesson-32`.

## Block 2 — Pre-production

- `git checkout course/lesson-32`; deps installed.
- `production.ts` open at `computeMetrics`; test file open.
- Slide: offline (CI, fixed dataset) vs online (live traffic).

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Module 5's belief: reflection is a budget allocation, not a magic wand. Module 4's eval ran
> offline on a fixed dataset. Production runs on live traffic you cannot see in advance. We start
> with the headline online metric: convergence rate.

**[Beat 2 · slide: offline vs online · 0:30]**
> Two different questions. The offline eval asks: did this change make the loop worse, against a
> curated dataset, in CI. The online eval asks, continuously, on real inputs: is the loop healthy
> right now, on traffic I have never seen. You need both, and they share the same rubric, so healthy
> means the same thing in both places.

**[Beat 3 · editor: computeMetrics · 1:20]**
> The one number that tells you the loop is working is convergence rate: the fraction of runs that
> resolved rather than escalated. And notice where it comes from: run records, id, outcome, revisions,
> that the loop already produces. You are not adding instrumentation, you are aggregating what the
> loop already knows. The test asserts a zero-point-nine convergence rate, nine of ten tickets
> resolved.

**[Beat 4 · slide: why convergence · 2:30]**
> Why this metric? It is the loop's actual job, measured. It moves when reality changes, a model
> regression, a shift in the kinds of tickets, a rubric edit, all show up as a convergence change,
> even on traffic your dataset never had. And it is comparable over time, chart it by day and see
> trends a single run never reveals.

**[Beat 5 · talking-head · 3:30]**
> One callback. Module 3 taught you to diagnose one escalation from its trace. Convergence rate is the
> aggregate. It does not tell you why any single run escalated. It tells you when to go look. Two
> percent escalation is normal. A jump to twenty means something changed, and then you open the
> traces. Online metric finds the when. The trace finds the why. In that order.

## Block 4 — Post-production

- Beat 2: offline-vs-online split slide.
- Beat 3: highlight `convergenceRate` and the run-record shape; zoom the 0.9 assertion.
- Beat 5: "rate finds when → trace finds why" slide.
- Chapter markers at Beats 2, 3, 4, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `production.ts` `computeMetrics`; terminal run pointing at the metrics block (0.9).
- **Beat 4:** why-convergence slide.
- **Beat 5:** when/why slide.

(No optional steps in this lesson — no bonus footage.)
