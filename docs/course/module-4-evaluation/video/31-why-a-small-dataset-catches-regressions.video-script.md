# Video script · Module 4 · Lesson 31 · Why a small (~10 example) dataset catches regressions

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 4 · Lesson 31 · Why a small (~10 example) dataset catches regressions
- **Duration:** ~4 min
- **Objective:** the viewer can defend a ten-example regression dataset and state what it does
  and does not buy.
- **Segments:** screencast (editor + terminal), talking-head close (module wrap).
- **Tag:** `course/lesson-31`.

## Block 2 — Pre-production

- `git checkout course/lesson-31`; deps installed.
- `eval.ts` open at the dataset; test file open at the regression block.
- Slide: differential vs absolute; "run on every change".

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The instinct is that a good eval needs hundreds of examples. For catching regressions in a
> reflection loop, that instinct is wrong. A small, curated dataset, ten examples deliberately
> chosen, catches the regressions that matter and stays cheap enough to run on every change.

**[Beat 2 · slide: differential question · 0:30]**
> Be precise about the job. A regression eval is not measuring absolute quality to two decimals.
> It answers one question on every change: did this make the loop worse? That is a differential
> question, you compare the new pass rate to the old, and differential questions need far fewer
> examples than absolute measurement, because you are looking for a drop, not a precise level.

**[Beat 3 · terminal: regression caught · 1:15]**
> The test shows it with ten examples. The good loop, about zero-point-nine. Swap in the weak
> writer, a regression, and it drops below the zero-point-seven threshold, caught. Ten examples
> were enough to turn someone broke the writer into a red build.

**[Beat 4 · slide: why small works · 1:55]**
> Three reasons small works. Real regressions are not subtle, a broken prompt or a bad model swap
> tanks many examples at once, you do not need a big sample to see a cliff. Curation beats volume,
> ten cases spanning the failure modes carry more signal than a thousand random easy ones. And
> cheap enough to run always, ten calls runs on every commit, while a thousand-example eval runs
> nightly at best, so regressions live for a day. An eval you run on every change catches more
> than a big one you run rarely.

**[Beat 5 · slide: the limits · 2:50]**
> Be honest about limits. Ten examples give plus-or-minus ten percent resolution, not a precise
> quality number, which is also why the threshold needs margin. And a regression that only shows
> on a one-in-five-hundred input will not appear in ten examples. Those you catch in production
> and add to the dataset, example eleven. The dataset grows along the failures it missed.

**[Beat 6 · talking-head · 3:35]**
> Module close. The runtime rubric is also the offline test. You built the whole eval around that
> reused rubric: a small curated dataset, an evaluator that fails loudly, pairwise proof the loop
> beats one pass, a margin-aware threshold. Small on purpose: regressions are cliffs, curation
> beats volume, and an eval you run on every change is the one that protects you. Module 5 takes
> this online: the same rubric watching convergence, cost, and quality on live traffic.

## Block 4 — Post-production

- Beat 3: zoom the good-vs-regressed threshold assertions.
- Beat 4: three-reasons slide.
- Beat 5: limits slide (resolution; rare inputs → grow the dataset).
- Chapter markers at Beats 2, 3, 4, 5, 6.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** terminal — run the suite; point at the regression describe block (good passes,
  regressed fails the threshold).
- **Beat 4:** three-reasons-small-works slide.
- **Beat 5:** limits slide.

(No optional steps in this lesson — no bonus footage.)
