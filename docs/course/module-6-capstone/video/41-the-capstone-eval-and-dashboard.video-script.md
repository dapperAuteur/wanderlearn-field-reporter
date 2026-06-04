# Video script · Module 6 · Lesson 41 · The capstone eval and dashboard

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 6 · Lesson 41 · The capstone eval and dashboard
- **Duration:** ~5 min
- **Objective:** the viewer sees Module 4's eval and Module 5's dashboard run unchanged on the new domain,
  producing the capstone's exit artifact.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-41`.

## Block 2 — Pre-production

- `git checkout course/lesson-41`; deps installed.
- `index.ts` open at `runCapstoneEval` / `runCapstoneProduction`; test open at the eval + metrics blocks.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> A capstone is not finished when the loop runs. It is finished when you can prove it works and what it
> costs on the new domain. Let's run Module 4's eval and Module 5's dashboard on the legal-clause corpus,
> reusing those helpers unchanged.

**[Beat 2 · editor + terminal: the eval · 0:35]**
> Module 4's eval machinery is domain-agnostic, it operates on a report, not a rubric. So the capstone
> scores its corpus with a thin wrapper over the same score-against-rubric and feeds the results straight
> into the reused helpers. The loop converts eleven of twelve clauses, the legalese-saturated remittance is
> the honest miss. Single-shot converts none. Pairwise: the loop wins eleven, single wins zero. It clears
> the margin threshold, and a fail-soft judge still aborts loudly. Every one of those came from Module 4 for
> free. The capstone wrote a dataset, not an eval.

**[Beat 3 · editor + terminal: the dashboard · 2:15]**
> Module 5's metrics are equally domain-agnostic, they read run records, not clauses. So the dashboard is
> compute-metrics over capstone records and pareto-frontier over capstone configs, imported unchanged.
> Convergence about ninety-two percent, finite cost-per-converged-output, runaway count zero. And notice:
> compute-metrics takes plain-language-rubric-dot-length as the criteria count, the only domain input the
> cost model needs, because cost scales with rubric size. Everything else is the same code on new data,
> including the Pareto frontier dropping loop-cap-three.

**[Beat 4 · slide: the exit artifact · 3:40]**
> This is the forkable template the course set out to produce: a reflection loop on a chosen domain, a
> pre-built eval dataset, a dashboard tracking convergence and cost-per-converged-output, and per-lesson git
> tags so any checkpoint runs. The capstone proves it is real by instantiating it on a domain that shares no
> vocabulary with the support replies it was built on. A learner forks it, swaps the rubric and dataset, and
> has a measured loop on their domain.

**[Beat 5 · talking-head · 4:25]**
> A finished capstone is a measured capstone. The eval, the threshold, the loud-fail guard, the dashboard,
> and the Pareto frontier all transferred by reuse. You supplied a dataset and a rubric, and the instruments
> came with you. That portability is the deliverable.

## Block 4 — Post-production

- Beat 2: zoom the eval assertions (11/12, pairwise, threshold, loud-fail).
- Beat 3: highlight `computeMetrics(records, plainLanguageRubric.length)`; show the Pareto drop.
- Beat 4: exit-artifact slide.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** terminal — run the capstone test; point at the eval/pairwise/threshold/loud-fail assertions.
- **Beat 3:** `index.ts` `runCapstoneProduction`; terminal pointing at the metrics + Pareto assertions.
- **Beat 4:** exit-artifact slide.

(No optional steps in this lesson — no bonus footage.)
