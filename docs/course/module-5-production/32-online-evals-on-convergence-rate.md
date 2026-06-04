# Module 5 · Lesson 32 · Online evals on convergence rate

> **Tag:** `course/lesson-32` · **Module 5: Production — keeping the loop honest** · ~5 min

## The model you are about to install

Module 5's belief: **reflection is a budget allocation, not a magic wand.** Module 4's eval
ran offline on a fixed dataset; production runs on *live* traffic you cannot see in advance.
This lesson installs the headline online metric — **convergence rate** — and shows how to
watch it on traffic the dataset never contained. By the end you can compute the metric every
production loop should put on a dashboard first.

## Offline eval vs online eval

The Module 4 eval answered "did this *change* make the loop worse?" against a curated dataset,
in CI. An **online eval** answers a different question, continuously, on real inputs: "is the
loop *healthy right now*, on traffic I have never seen?" The dataset is fixed and known; live
traffic is open-ended and surprising. You need both — the offline eval gates deploys, the online
eval watches production — and they share the same rubric (Module 2), so "healthy" means the same
thing in both places.

## Convergence rate is the first metric

The single number that tells you whether a reflection loop is working in production is its
**convergence rate**: the fraction of runs that resolved (passed the rubric) rather than escalated
(`examples/support-reply-loop/production.ts`):

```ts
export function computeMetrics(records, criteriaCount, maxRevisions, model): ProductionMetrics {
  const resolved = records.filter((r) => r.outcome === "resolved").length;
  return {
    convergenceRate: resolved / total,          // ← the headline
    escalationRate: (total - resolved) / total,
    avgIterations: /* mean revisions */,
    runawayCount: /* runs that hit the cap unresolved */,
    costPerConvergedOutput: /* total cost / resolved */,
  };
}
```

The metrics come from **run records** — `{ id, outcome, revisions }` — that the loop already
produces (the same `outcome` and `revisionNumber` from Modules 1–2). You are not adding
instrumentation; you are aggregating what the loop already knows. The Module 5 test runs the loop
over the dataset and asserts a 0.9 convergence rate — nine of ten tickets resolved.

## Why convergence rate, specifically

- **It is the loop's actual job, measured.** A reflection loop exists to turn drafts into
  passing outputs; convergence rate is the fraction of times it did. Everything else (cost,
  iterations) is secondary to *did it work*.
- **It moves when reality changes.** A model regression, a shift in the kinds of tickets coming
  in, a rubric edit that raised the bar — all show up as a convergence-rate change, even on
  traffic your offline dataset never had. It is the canary for "something is different now."
- **It is comparable over time.** Because it is a rate, you can chart it by hour/day and see
  trends a single run never reveals.

## The rate, not the run (Module 3 callback)

Module 3 taught you to diagnose *one* escalation from its trace. Convergence rate is the
*aggregate* — it does not tell you why any single run escalated, it tells you *when to go look*.
A 2% escalation rate is normal; a jump to 20% means something changed, and *then* you open the
traces (Module 3) to find the cause. Online metric finds the *when*; the trace finds the *why*.
You need both, in that order.

## What you should now believe

Production health starts with one number: the fraction of live runs that converge. It is computed
from records the loop already produces, it shares the rubric with your offline eval so "healthy"
is consistent, and it is the canary that tells you *when* reality has shifted — at which point
Module 3's traces tell you *why*.

## Try it

Run `runProduction` over the dataset with the good writer, then with a writer that fails half the
tickets, and compare `computeMetrics(...).convergenceRate`. Watch the number drop. Now imagine that
drop happening on live traffic at 3am — that is the alert you build in the next lesson.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG evaluation
using GPT-4 with better human alignment. In *Proceedings of the 2023 Conference on
Empirical Methods in Natural Language Processing* (pp. 2511–2522). Association for
Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153
