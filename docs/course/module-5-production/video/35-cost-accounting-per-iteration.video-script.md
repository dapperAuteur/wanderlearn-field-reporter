# Video script · Module 5 · Lesson 35 · Cost accounting per iteration

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 5 · Lesson 35 · Cost accounting per iteration
- **Duration:** ~5 min
- **Objective:** the viewer can price a run and explain why cost-per-converged-output is the metric
  that counts failures.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-35`.

## Block 2 — Pre-production

- `git checkout course/lesson-35`; deps installed.
- `production.ts` open at `runCost` + `costPerConvergedOutput`; test file open.
- Slide: revisions × (write + critique-per-criterion); average-per-run vs per-converged.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> You cannot manage what you do not price. We make the cost of a reflection loop explicit and
> per-iteration, so adding another revision stops being free in your head.

**[Beat 2 · editor: runCost · 0:30]**
> A loop's cost is dominated by LLM calls, and each revision makes several: one writer call plus one
> critic call per criterion. So cost scales with both the number of revisions and the size of the rubric.
> Two revisions, four criteria: two times one plus four-quarters, equals four calls. Two consequences,
> both design levers. More revisions costs linearly more, a loop allowing five revisions instead of three
> is up to sixty-seven percent more expensive. And a bigger rubric costs more every revision, the Module 2
> craft of no redundant criteria is also cost discipline.

**[Beat 3 · editor: costPerConvergedOutput · 1:50]**
> Now the metric that matters. The naive one is average cost per run. It lies, because it spreads cost over
> all runs, including the ones that escalated unresolved, making a loop that fails half its runs look half
> as expensive. The honest metric divides total cost by resolved runs only. A loop that burns three
> revisions to escalate contributes its full cost to the numerator and nothing to the denominator, so its
> waste shows up where you will see it. And when convergence is zero, the metric is infinity, you spent
> money and got nothing.

**[Beat 4 · talking-head · 3:10]**
> This is the whole module's thesis made numeric. Reflection is a budget allocation, not a magic wand,
> stops being a slogan here. Each revision is a line item. The loop is a spending decision you make per
> run. Cost accounting is what lets every later choice, how high to set max-revisions, whether to loop at
> all, which critic, where to sit on the Pareto curve, be made with the price in view.

**[Beat 5 · talking-head · 4:00]**
> The anti-pattern: average-cost-per-run, which dilutes failed runs into successes and hides a loop paying
> full price to escalate. Divide by converged outputs so failures count where they belong.

## Block 4 — Post-production

- Beat 2: highlight `runCost`; animate the 2×(1+4×0.25)=4 arithmetic.
- Beat 3: split "average per run (lies)" vs "per converged (honest)".
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `production.ts` `runCost`; terminal `runCost(2,4)` → 4.
- **Beat 3:** `production.ts` `costPerConvergedOutput`; show it climb as escalations rise.

(No optional steps in this lesson — no bonus footage.)
