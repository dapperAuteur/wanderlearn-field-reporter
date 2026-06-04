# Module 4 · Lesson 26 · Rubric reuse — the runtime critic *is* the offline test

> **Tag:** `course/lesson-26` · **Module 4: Eval-driven reflection** · ~5 min

## The model you are about to install

Module 4's belief: **the runtime rubric is also the offline test.** The rubric you
wrote in Module 2 to *steer* the loop at runtime is the exact same artifact you use to
*measure* the loop offline — the same criteria, the same judge contract, the same
`applyPassRule`. By the end you can see why reusing it (rather than writing a second
scorer) is what makes an eval trustworthy.

## Two jobs, one rubric

A reflection loop's rubric does two jobs that look different but are the same check:

- **Runtime (the critic).** On every revision, score the draft and decide pass/revise.
  This is steering — it happens *inside* one run.
- **Offline (the eval).** Over a dataset of many inputs, score each final output and
  compute a pass rate. This is measuring — it happens *across* runs, in CI.

The temptation is to write the offline eval separately ("a test that checks the output
looks right"). Resist it. The moment the eval's standard differs from the runtime
critic's, you are measuring something other than what the loop optimizes — and your
green eval no longer means your loop is good.

## The reuse, in code

Module 4's evaluator does not define a new standard. It calls the *same*
`scoreAgainstRubric` over the *same* `supportReplyRubric` the loop uses
(`examples/support-reply-loop/eval.ts`):

```ts
export async function evaluateDraft(judge, ticket, draft) {
  const critique = await scoreAgainstRubric(judge, ticket, draft, 0, supportReplyRubric);
  return { passed: critique.passed, errored: looksLikeErrorFallback(critique) };
}
```

`runEval` walks a dataset, runs the loop on each ticket, and scores the final draft with
that evaluator. The pass/fail is decided by the identical `applyPassRule` the router
trusts at runtime. There is **one** definition of "good," and both the loop and the eval
read it. That is the literal meaning of "the runtime rubric is also the offline test."

## Why this is the whole point of data-as-policy (Module 2 paying off)

Remember Lesson 18: the weights and the pass rule live in *data*, not in the node. This
is why. Because the policy is data, the offline eval can apply the exact same policy
without re-implementing it. Had the pass rule been hard-coded in the critique node, the
eval would have to copy that logic — and the copy would drift, so one day your loop would
ship a draft your eval calls good while the *runtime* critic would have rejected it. Reuse
is only possible because Module 2 made the rubric an artifact, not a code path.

## What reuse buys you

1. **The eval measures what the loop optimizes.** Pass rate on the eval *is* the loop's
   real success rate, by construction — not a proxy.
2. **Tuning is honest.** Change a weight to make the loop stricter (Module 2) and the eval
   immediately reflects the new bar, because it reads the same weight.
3. **No drift.** One source of truth means the runtime standard and the test standard can
   never disagree.

## The anti-pattern

> **Anti-pattern — The second, separate scorer.** Writing an offline eval whose standard
> is hand-coded apart from the runtime rubric. It drifts from what the loop actually
> optimizes, so a passing eval stops meaning a good loop. Reuse the rubric; never
> re-implement it.

## What you should now believe

You do not write an eval for a reflection loop — you *reuse the critic* as one. The rubric
is a single artifact that steers at runtime and measures offline, and that single source
of truth is what makes the eval's number mean something. The rest of this module builds the
machinery around that reused rubric: a dataset, a custom evaluator, pairwise comparison,
thresholds, and dataset size.

## Try it

In `tests/course/module-4-evaluation.test.ts`, note that the loop target and the evaluator
are handed the *same* `datasetJudge`. Change one criterion's weight in `supportReplyRubric`
and re-run the suite: both the loop's behavior and the eval's pass rate move together,
because they read the same data. One rubric, two jobs.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG evaluation
using GPT-4 with better human alignment. In *Proceedings of the 2023 Conference on
Empirical Methods in Natural Language Processing* (pp. 2511–2522). Association for
Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153
