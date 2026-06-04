# Module 5 · Lesson 37 · Cost–quality Pareto framing

> **Tag:** `course/lesson-37` · **Module 5: Production — keeping the loop honest** · ~5 min

## The model you are about to install

Every production knob you have turned in this module — `MAX_REVISIONS`, the critic model, loop vs.
single-shot — trades cost against quality. This final lesson gives you the framework that organizes
all of them: the **cost–quality Pareto frontier**, the set of configurations where you cannot get more
quality without paying more, or pay less without losing quality. By the end you can place every config
on one curve and pick a point on purpose.

## Configurations are points in cost–quality space

Each way you can run the loop is a point with two coordinates: how good it is, and what it costs
(`examples/support-reply-loop/production.ts`):

```ts
export interface ParetoPoint { label: string; quality: number; cost: number; }
```

For the support-reply loop you might have:

| Config | Quality (convergence) | Cost (per converged) |
|---|---|---|
| single-shot | 0.1 | 1 |
| loop, cap 1 | 0.9 | 2 |
| loop, cap 3 | 0.9 | 4 |

## The frontier: drop the dominated configs

A config is **dominated** when another is at least as good *and* at least as cheap (and strictly
better on one axis). Dominated configs are never worth running — something beats them on both axes.
The **Pareto frontier** is what is left:

```ts
export function paretoFrontier(points) {
  return points.filter((p) =>
    !points.some((q) => q !== p &&
      q.quality >= p.quality && q.cost <= p.cost &&
      (q.quality > p.quality || q.cost < p.cost)));
}
```

In the table above, **loop-cap-3 is dominated by loop-cap-1**: same 0.9 quality, double the cost.
The frontier is `single-shot` and `loop-cap-1` — and the Module 5 test asserts exactly that. The
insight is concrete: raising `MAX_REVISIONS` from 1 to 3 bought *no* quality here and doubled the
cost, so cap-3 is strictly wasteful. You would never have seen that without putting both configs on
the same curve.

## Choosing a point on the frontier

The frontier does not pick for you — it eliminates the configs that are strictly worse and leaves the
*real* choices, which are genuine trade-offs:

- **single-shot (0.1 quality, 1 cost)** — cheapest, but probably below your quality bar.
- **loop-cap-1 (0.9 quality, 2 cost)** — double the cost for 9× the quality. For support replies,
  obviously worth it.

Where you sit is a *product* decision, not an engineering one: a legal-document assistant lives at the
high-quality end and pays for it; an internal draft tool may sit cheap. The engineer's job is to
*compute the frontier* so the product decision is made with the trade-off visible, not guessed.

## The module, and the course, in one frame

This is where "reflection is a budget allocation, not a magic wand" lands completely. Reflection is not
on-or-off and not always-better — it is a *position on a cost–quality curve*, and the whole module gave
you the instruments to find that curve: convergence rate (quality), cost-per-converged-output (cost),
A/B and single-pass checks (which points exist), and the frontier (which points are real). You no longer
*hope* the loop is worth it; you place it on the curve and choose.

## The anti-pattern

> **Anti-pattern — Maxing one axis.** Tuning purely for quality (cap revisions high, biggest critic) or
> purely for cost (never loop), without looking at the frontier. You end up at a dominated point —
> paying for quality you did not need, or missing quality you could have afforded cheaply. Plot both
> axes; choose a non-dominated point that matches the product's bar.

## What you should now believe (module + course close)

Look back at Lesson 32: *reflection is a budget allocation, not a magic wand.* You now have the full
instrument panel — and the Pareto frontier is what unifies it. Every config is a point in cost–quality
space; the dominated ones are waste; the frontier is your real menu; and where you sit on it is a
deliberate product decision made with the trade-off in view. Reflection, finally, is something you
*allocate* — measured, bounded, judged, traced, evaluated, and priced.

This is the last module. The capstone takes the whole stack — primitive, termination, rubric, tracing,
eval, and these production guards — to a **brand-new domain** to prove the pattern transfers without the
notes.

## Try it

Add a fourth config to the Pareto test — `loop-cap-2` at quality 0.92, cost 3 — and recompute the
frontier. Does it join the frontier (a new non-dominated trade-off) or get dominated? Reason about it
before running, then check. Reading a frontier is the production skill this whole module built toward.

## References

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z.,
Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging
LLM-as-a-judge with MT-Bench and Chatbot Arena. In *Advances in Neural Information
Processing Systems 36* (pp. 46595–46623). Curran Associates. https://arxiv.org/abs/2306.05685

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/
