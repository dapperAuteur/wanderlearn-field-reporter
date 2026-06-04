# Module 3 · Lesson 23 · Diagnosing critic drift

> **Tag:** `course/lesson-23` · **Module 3: Tracing reflection loops in LangSmith** · ~4 min

## The model you are about to install

The second trouble-shape: **critic drift** — the same draft scored differently on
different passes. Because the critic is an LLM, and an LLM is nondeterministic, the
judge can pass a draft, fail the identical draft a pass later, and never let the loop
settle. By the end you can detect drift in a trace and know the two levers that reduce
it.

## The shape in the trace

Drift is visible only because the trace keeps *every* pass. Look for two
`critique_reply` spans whose `draft` is identical but whose `passedChecks` differ:

```
critique_reply  rev 1   draft "Hi Sam, …, Best, Riley"   2/4 passed
critique_reply  rev 2   draft "Hi Sam, …, Best, Riley"   3/4 passed   ← SAME draft, different score
```

Same input, different verdict — the judge is not a function. The diagnostic
(`examples/support-reply-loop/tracing.ts`):

```ts
export function detectCriticDrift(trace: RunTrace): string[] {
  const byDraft = new Map<string, Set<number>>();
  for (const step of trace.steps) {
    const key = step.draft.trim();
    (byDraft.get(key) ?? byDraft.set(key, new Set()).get(key)!).add(step.passedChecks);
  }
  return [...byDraft.entries()].filter(([, s]) => s.size > 1).map(([d]) => d);
}
```

It groups steps by draft and flags any draft that received more than one distinct
score. The Module 3 test gives it the same draft scored `2/4` then `3/4` and asserts it
returns that draft. In LangSmith you would catch this by noticing a loop that revisits a
draft it already saw, with a different result — the loop "thrashing" instead of
converging.

## Why drift is uniquely nasty

Wasted iterations (Lesson 22) at least make *consistent* progress-or-not. Drift breaks
the loop's core assumption: that `passed` is a stable function of the draft. When it is
not:

- **Convergence detection can misfire.** Module 1's stall check compares drafts; but if
  the *score* drifts on a stable draft, the loop may revise a draft that was actually
  fine last pass.
- **The loop never settles deterministically.** Re-run the same input and you get a
  different number of revisions, a different outcome — which makes everything downstream
  (evals, cost metrics) noisy.
- **It hides in aggregate.** Average pass rates look fine; the drift is only visible
  per-run, on the *same* draft across passes — which only the trace preserves.

## The two levers that reduce drift

Drift is the LLM-judge's nondeterminism leaking into your control flow. You reduce it the
same way G-Eval and the LLM-judge literature do (Liu et al., 2023; Zheng et al., 2023):

1. **Lower the judge's temperature.** A judge should be as close to deterministic as the
   provider allows; temperature 0 is the default for a scorer. The field-reporter agent's
   critique node does exactly this — judging is not a place for creativity.
2. **Tighten the criteria.** Drift concentrates on *vague* criteria (Lesson 14): a
   checkable criterion ("names the cracked jar") is scored the same way every time; a
   vague one ("is engaging") is where the coin-flip lives. The trace tells you *which*
   criterion drifted — read its child spans — and that criterion is your rewrite target.

You will rarely drive drift to zero (the model is still a model), which is why Module 4
sets eval thresholds *with margin* for judge noise. But temperature-0 plus tight criteria
turns thrashing into the occasional wobble.

## What you should now believe

The critic is an LLM, so its verdict is a distribution, not a function — and drift is
that distribution leaking into your loop. You cannot see it in aggregates; you see it in
the trace, as one draft wearing two scores. Cool the judge and sharpen the criteria, and
read the trace to know which criterion to sharpen.

## Try it

In the Module 3 test's drift trace, make the two steps' `passedChecks` equal (`2` and
`2`) and watch `detectCriticDrift` return `[]` — no drift when the score is stable. Then
add a third step with the same draft and a third score and watch it still flag the one
draft. Stable score, stable loop.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG evaluation
using GPT-4 with better human alignment. In *Proceedings of the 2023 Conference on
Empirical Methods in Natural Language Processing* (pp. 2511–2522). Association for
Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z.,
Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging
LLM-as-a-judge with MT-Bench and Chatbot Arena. In *Advances in Neural Information
Processing Systems 36* (pp. 46595–46623). Curran Associates. https://arxiv.org/abs/2306.05685
