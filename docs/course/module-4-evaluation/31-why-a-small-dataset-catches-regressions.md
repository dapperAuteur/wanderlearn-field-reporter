# Module 4 · Lesson 31 · Why a small (~10 example) dataset catches regressions

> **Tag:** `course/lesson-31` · **Module 4: Eval-driven reflection** · ~4 min

## The model you are about to install

The instinct is that a good eval needs hundreds of examples. For catching *regressions* in a
reflection loop, that instinct is wrong: a small, curated dataset — ten examples, deliberately
chosen — catches the regressions that matter and stays cheap enough to run on every change. By
the end you can defend a ten-example dataset and know what it does and does not buy you.

## What a regression eval is for

Be precise about the job. A regression eval is not trying to *measure absolute quality* to two
decimal places. It is trying to answer one question on every change: **did this make the loop
worse?** That is a *differential* question — you compare the new pass rate to the old one — and
differential questions need far fewer examples than absolute measurement, because you are
looking for a *drop*, not a precise level.

The Module 4 test demonstrates exactly this with ten examples:

```ts
const good      = await runEval(dataset, loopTarget(templatedWriter, judge), judge);  // ~0.9
const regressed = await runEval(dataset, loopTarget(weakWriter, judge), judge);       // ~0.0
expect(meetsThreshold(good, 0.7)).toBe(true);
expect(meetsThreshold(regressed, 0.7)).toBe(false);   // the regression is caught
```

Ten examples were enough to turn "someone broke the writer" into a red build.

## Why small works for regressions

1. **Real regressions are not subtle.** A broken prompt, a bad model swap, a rubric edit gone
   wrong — these tank the pass rate across *many* examples at once, not one. You do not need a
   big sample to see a cliff; ten examples show it plainly.
2. **Curation beats volume.** Ten examples chosen to span the failure modes (Lesson 27) carry
   more signal than a thousand random ones, most of which are easy and redundant. Each curated
   case tests something distinct.
3. **Cheap enough to run always.** A ten-example LLM-judged eval is a handful of calls — small
   enough to run on every commit. A thousand-example eval runs nightly at best, so regressions
   live for a day. **An eval you run on every change catches more than a big one you run rarely.**

## What a small dataset does NOT buy you

Be honest about the limits, so you do not over-claim:

- **Not a precise quality number.** Ten examples give you ±10% resolution at best; the pass rate
  is coarse (this is also why the threshold needs margin, Lesson 30). For "is it 87% or 91%
  good?" you need more data.
- **Not coverage of rare inputs.** A regression that only shows on a 1-in-500 input will not
  appear in ten examples. Those you catch in production (Module 5) and then *add to the dataset*
  — the dataset grows precisely along the failures it missed.

## The discipline: grow the dataset from misses

The ten examples are a starting point, not a ceiling. Every production failure that the eval
*didn't* catch becomes example eleven. Over time the dataset accretes exactly the cases that
matter — each one a regression test for a bug you have already paid for once. Small-but-growing,
curated-from-reality, run-on-every-change: that is the eval that actually protects a loop.

## The anti-pattern

> **Anti-pattern — The big eval you never run.** Building a thousand-example dataset that is so
> slow it runs nightly or by hand, so regressions live for hours before anyone sees red. A small
> eval on every commit catches more, sooner. Optimize for *frequency of running*, not size.

## What you should now believe (module close)

Look back at Lesson 26: *the runtime rubric is also the offline test.* You have now built the
whole eval around that reused rubric — a small curated dataset, an evaluator that fails loudly,
pairwise proof the loop beats one pass, and a margin-aware threshold. And the dataset is small on
purpose: regressions are cliffs, curation beats volume, and an eval you run on every change is
the one that protects you. Grow it from the failures production finds.

Module 5 takes this offline eval *online*: the same rubric watching convergence rate, cost, and
quality on live traffic — reflection as a budget you allocate, not a magic wand.

## Try it

Trim `supportReplyDataset` to its first three examples and re-run the regression test. Watch the
pass rate become coarse (0, 0.33, 0.67, 1.0) and reason about whether you could still set a
threshold with margin between "good" and "regressed." Restore the ten. You just felt the floor on
how small a dataset can go.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z.,
Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging
LLM-as-a-judge with MT-Bench and Chatbot Arena. In *Advances in Neural Information
Processing Systems 36* (pp. 46595–46623). Curran Associates. https://arxiv.org/abs/2306.05685
