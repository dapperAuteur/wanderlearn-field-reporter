# Module 5 · Lesson 34 · A/B testing critic models

> **Tag:** `course/lesson-34` · **Module 5: Production — keeping the loop honest** · ~5 min

## The model you are about to install

The critic is an LLM, and you have a choice of which LLM. A bigger critic model may judge more
accurately — but it costs more per call, and the loop calls the critic on *every* criterion of
*every* revision. This lesson uses an **A/B test** to decide whether a more expensive critic earns
its price. By the end you can compare two critic models on quality and weigh it against cost.

## Why the critic model is a real decision

In a reflection loop, the critic runs far more than the writer: one critique call per criterion
per revision. With a four-criterion rubric and two revisions, that is eight critic calls to one or
two writer calls. So the critic model dominates both the *cost* and the *quality* of the loop —
a better critic catches more real defects (raising convergence) but a pricier one multiplies your
bill faster than anything else. That makes "which critic model?" one of the highest-leverage
production decisions, and one you should *measure*, not guess.

## The A/B comparison

Run the same loop on the same dataset with two different judges (critic models) and compare the
pass rate each produces (`examples/support-reply-loop/production.ts`):

```ts
export function abCompare(a: EvalReport, b: EvalReport): ABResult {
  let winner = "tie";
  if (a.passRate > b.passRate) winner = "A";
  else if (b.passRate > a.passRate) winner = "B";
  return { aPassRate: a.passRate, bPassRate: b.passRate, winner };
}
```

The Module 5 test A/Bs a working critic against a broken one and asserts the working critic wins.
In production you would A/B two *real* critics — say a small fast model against a larger one — on a
slice of live traffic, holding the writer and rubric fixed so the only variable is the critic. This
is the same reuse-the-rubric discipline from Module 4: the comparison is fair because both critics
are scored against the *same* standard.

## Quality first, then weigh against cost

The A/B gives you the quality delta. The *decision* combines it with the cost delta:

- **Big quality win, modest cost increase** → upgrade the critic. The extra convergence pays for
  the extra calls.
- **Tiny quality win, large cost increase** → keep the cheaper critic. You are paying a lot for a
  little — the same logic as Module 4's pairwise margin, applied to the critic instead of the loop.
- **No quality difference** → always take the cheaper critic. A more expensive model that judges
  no better is pure waste.

The trap is A/B-ing on quality alone and "upgrading" to a critic that wins by 1% at triple the
cost. The metric that decides is quality-*per-cost*, which is exactly the Pareto framing in Lesson
37.

## The anti-pattern

> **Anti-pattern — Bigger-critic-is-better.** Defaulting to the largest available model for the
> critic because it "judges better," without A/B-ing the quality gain against the cost. Since the
> critic runs every criterion every revision, an over-sized critic is where loops quietly bleed
> money for marginal quality. Measure the delta; upgrade only when it pays.

## What you should now believe

The critic model is the loop's dominant cost-and-quality lever, because it runs far more than the
writer. Choose it with an A/B on the same dataset and the same rubric, then decide on
quality-per-cost — never on quality alone. A pricier critic earns its place only when the
convergence it buys is worth the calls it adds.

## Try it

In the Module 5 test, replace the broken `failSoftJudge` in the A/B with a *second good* judge (copy
`datasetJudge`, weaken one criterion's cue so it passes slightly fewer cases). Run `abCompare` and
read the small delta — then ask: if that second judge were *cheaper*, would the tiny quality loss be
worth it? That question is the lesson.

## References

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z.,
Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging
LLM-as-a-judge with MT-Bench and Chatbot Arena. In *Advances in Neural Information
Processing Systems 36* (pp. 46595–46623). Curran Associates. https://arxiv.org/abs/2306.05685

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/
