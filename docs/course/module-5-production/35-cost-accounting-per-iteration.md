# Module 5 · Lesson 35 · Cost accounting per iteration

> **Tag:** `course/lesson-35` · **Module 5: Production — keeping the loop honest** · ~5 min

## The model you are about to install

You cannot manage what you do not price. This lesson makes the cost of a reflection loop
*explicit and per-iteration*, so "add another revision" stops being free in your head. By the end
you can compute what a run costs and, crucially, the one metric that matters —
**cost-per-converged-output** — which counts the money you spent on runs that *failed*, too.

## Every revision has a price

A reflection loop's cost is dominated by LLM calls, and each revision makes several: one writer
call plus one critic call per criterion. So cost scales with *both* the number of revisions and
the size of the rubric (`examples/support-reply-loop/production.ts`):

```ts
export function runCost(revisions, criteriaCount, model = defaultCostModel): number {
  return revisions * (model.writeCallCost + criteriaCount * model.critiqueCallCostPerCriterion);
}
// 2 revisions, 4 criteria: 2 × (1 + 4×0.25) = 4 "calls"
```

Two consequences fall out immediately, and both are design levers:

1. **More revisions costs linearly more.** A loop tuned to allow five revisions instead of three
   is not "a bit slower" — it is up to 67% more expensive per run. The `MAX_REVISIONS` you set in
   Module 1 is a *budget cap*, and now you can see its price.
2. **A bigger rubric costs more, every revision.** Each criterion is a critic call, so a
   ten-criterion rubric costs more than twice a four-criterion one — on *every* pass. The rubric
   craft from Module 2 (no redundant/overlapping criteria) is also cost discipline: every
   criterion you cannot justify is a call you pay for on every revision of every run.

## Cost-per-converged-output: the metric that counts the failures

The naive cost metric is "average cost per run." It lies, because it spreads the cost over *all*
runs, including the ones that escalated unresolved — making a loop that fails half its runs look
half as expensive as it is. The honest metric divides total cost by *resolved* runs only:

```ts
costPerConvergedOutput: resolved ? totalCost / resolved : Infinity,
```

This counts the money you spent on failures against the good outputs you actually got. A loop that
burns three revisions to escalate contributes its full cost to the numerator and *nothing* to the
denominator — so its waste shows up where you will see it. And when convergence is zero, the metric
is `Infinity`: you spent money and got nothing, which is exactly what infinite cost-per-good-output
should mean (and why it trips the cost alert, Lesson 33).

## This is the whole module's thesis, made numeric

"Reflection is a budget allocation, not a magic wand" stops being a slogan here. Each revision is a
line item; the loop is a *spending decision* you make per run. Cost accounting per iteration is what
lets every later choice — how high to set `MAX_REVISIONS`, whether to loop at all (Lesson 36), which
critic to use (Lesson 34), where to sit on the Pareto curve (Lesson 37) — be made with the price in
view instead of pretending revisions are free.

## The anti-pattern

> **Anti-pattern — Average-cost-per-run.** Reporting mean cost across all runs, which dilutes the
> cost of failed runs into the successes and hides a loop that pays full price to escalate. Divide
> by *converged* outputs so failures count where they belong.

## What you should now believe

Every revision is a priced line item — writer call plus one critic call per criterion — so more
revisions and bigger rubrics cost linearly more. Measure cost-per-*converged*-output, not per run,
so the money spent on failures is visible against the good outputs you got. With the price in view,
reflection becomes a budget you allocate on purpose.

## Try it

Use `runCost` to price a single run at `MAX_REVISIONS = 3` with a four-criterion rubric, then at a
ten-criterion rubric. Note how much the rubric size alone raises the per-run cost — then look back at
your Module 2 rubric and ask whether every criterion earns its call.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651
