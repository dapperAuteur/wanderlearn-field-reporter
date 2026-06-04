# Video script · Module 5 · Lesson 34 · A/B testing critic models

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 5 · Lesson 34 · A/B testing critic models
- **Duration:** ~5 min
- **Objective:** the viewer can A/B two critic models on the same dataset and decide on
  quality-per-cost.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-34`.

## Block 2 — Pre-production

- `git checkout course/lesson-34`; deps installed.
- `production.ts` open at `abCompare`; test file open.
- Slide: critic runs N× the writer; the decision matrix.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The critic is an LLM, and you choose which one. A bigger critic may judge more accurately, but it
> costs more per call, and the loop calls the critic on every criterion of every revision. We A/B-test
> whether a more expensive critic earns its price.

**[Beat 2 · slide: the critic dominates · 0:30]**
> Why is this a real decision? The critic runs far more than the writer: one critique call per criterion
> per revision. Four criteria and two revisions is eight critic calls to one or two writer calls. So the
> critic dominates both the cost and the quality of the loop. That makes which critic model one of the
> highest-leverage production decisions, and one you should measure, not guess.

**[Beat 3 · editor + terminal: abCompare · 1:30]**
> Run the same loop on the same dataset with two different judges and compare the pass rate each produces.
> The test A/Bs a working critic against a broken one and asserts the working one wins. In production you
> would A/B two real critics, a small fast model against a larger one, on a slice of live traffic, holding
> the writer and rubric fixed so the only variable is the critic. Same reuse-the-rubric discipline from
> Module 4, the comparison is fair because both are scored against the same standard.

**[Beat 4 · slide: decision matrix · 2:45]**
> The A/B gives the quality delta. The decision combines it with cost. Big quality win, modest cost,
> upgrade. Tiny quality win, large cost, keep the cheaper one, the same pairwise-margin logic applied to
> the critic. No quality difference, always take the cheaper, a pricier model that judges no better is
> pure waste. The trap is A/B-ing on quality alone and upgrading to a critic that wins one percent at
> triple the cost. The metric that decides is quality-per-cost, which is the Pareto framing in Lesson 37.

**[Beat 5 · talking-head · 4:00]**
> The anti-pattern: bigger-critic-is-better. Defaulting to the largest model for the critic without
> A/B-ing the gain against the cost. Since the critic runs every criterion every revision, an over-sized
> critic is where loops quietly bleed money. Measure the delta. Upgrade only when it pays.

## Block 4 — Post-production

- Beat 2: animate "8 critic calls vs 2 writer calls".
- Beat 3: zoom the `abCompare` winner assertion.
- Beat 4: decision matrix (quality delta × cost delta).
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `production.ts` `abCompare`; terminal run pointing at the A/B block (winner A).
- **Beat 4:** decision-matrix slide.

(No optional steps in this lesson — no bonus footage.)
