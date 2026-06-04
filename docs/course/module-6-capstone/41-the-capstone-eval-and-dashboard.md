# Module 6 · Lesson 41 · The capstone eval and dashboard

> **Tag:** `course/lesson-41` · **Module 6: Capstone** · ~5 min

## The model you are about to install

A capstone is not finished when the loop runs — it is finished when you can *prove it works and what it
costs* on the new domain. This lesson runs Module 4's eval and Module 5's dashboard on the legal-clause
corpus, reusing those helpers unchanged. By the end you have the capstone's exit artifact: a measured,
priced, regression-testable reflection loop on a domain the course never showed you.

## The eval, reused

Module 4's eval machinery is domain-agnostic — `pairwise`, `meetsThreshold`, and `assertNoInfraErrors`
all operate on an `EvalReport`, not on a rubric. So the capstone scores its corpus with a thin wrapper
over the *same* `scoreAgainstRubric` and feeds the results straight into the reused helpers
(`examples/capstone-plain-language/index.ts`):

```ts
const loop   = await runCapstoneEval(dataset, loopTarget(plainRewriter, judge), judge);     // 11/12
const single = await runCapstoneEval(dataset, singleShotTarget(echoRewriter), judge);       //  0/12
pairwise(loop, single);            // M4, unchanged → loop wins 11, single wins 0
meetsThreshold(loop, 0.7);         // M4, unchanged → true
assertNoInfraErrors(loop);         // M4/M3, unchanged → guards the fail-soft bug
```

The capstone test asserts all of it: the loop converts 11 of 12 clauses (the legalese-saturated
`remittance` is the honest miss), single-shot converts none, the loop wins pairwise, it clears the
margin-aware threshold, and a fail-soft judge still aborts loudly. Every one of those guarantees came
from Module 4 for free — the capstone wrote a dataset, not an eval.

## The dashboard, reused

Module 5's metrics are equally domain-agnostic — they read *run records*, not clauses. So the capstone's
dashboard is `computeMetrics` over capstone run records, and `paretoFrontier` over capstone configs,
imported unchanged:

```ts
const records = await runCapstoneProduction(dataset, plainRewriter, judge);
const m = computeMetrics(records, plainLanguageRubric.length);
//   m.convergenceRate ≈ 0.92, m.costPerConvergedOutput finite, m.runawayCount = 0
paretoFrontier([
  { label: "single-shot", quality: 0.0,  cost: 1 },
  { label: "loop-cap-1",  quality: 0.92, cost: 2 },
  { label: "loop-cap-3",  quality: 0.92, cost: 4 },   // dominated → dropped
]);
```

Notice `computeMetrics` takes `plainLanguageRubric.length` as the criteria count — the *only* domain
input the cost model needs, because cost scales with rubric size (Lesson 35). Everything else — the
convergence rate, the cost-per-converged-output, the Pareto frontier that drops `loop-cap-3` — is the
same code computing the same insights on new data.

## The exit artifact (PRD §4.4)

This is the forkable template the course set out to produce: a reflection loop on a chosen domain with a
pre-built eval dataset, a dashboard tracking convergence / iterations / cost-per-converged-output, and
per-lesson git tags so any checkpoint runs. The capstone proves the template is *real* by instantiating
it on a domain — legal-clause rewriting — that shares no vocabulary with the support replies it was built
on. A learner forks it, swaps the rubric and dataset, and has a measured loop on *their* domain.

## What you should now believe

A finished capstone is a *measured* capstone. The eval that proves the loop beats single-shot, the
threshold that gates regressions, the loud-fail guard, the convergence/cost dashboard, and the Pareto
frontier all transferred to the new domain by reuse — you supplied a dataset and a rubric, and the
instruments came with you. That portability *is* the deliverable.

## Try it

Run the capstone test and read the three reused-helper assertions (`pairwise`, `meetsThreshold`,
`computeMetrics`). Then break the loop by swapping `plainRewriter` for `echoRewriter` in the loop target,
and watch the convergence rate collapse and the threshold gate go red — the Module 4/5 instruments
catching a regression on a domain they were never written for.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P.,
Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging LLM-as-a-judge with MT-Bench and Chatbot Arena.
In *Advances in Neural Information Processing Systems 36* (pp. 46595–46623). Curran Associates.
https://arxiv.org/abs/2306.05685
