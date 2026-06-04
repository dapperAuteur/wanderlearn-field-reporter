# Module 4 · Lesson 29 · Pairwise eval — single-shot vs the reflection loop

> **Tag:** `course/lesson-29` · **Module 4: Eval-driven reflection** · ~5 min

## The model you are about to install

You have spent four modules building a reflection loop. This lesson asks the question you
should have demanded at the start: **does it actually beat just writing once?** A **pairwise
eval** answers it — run two systems on the same dataset and compare them example by example.
By the end you can prove the loop earns its extra cost, and know when it does not.

## Why pairwise, not two separate numbers

You could run the loop, get 90%, run single-shot, get 10%, and call it done. But two
isolated numbers hide *where* the difference is and are noisy when an LLM judge is in the
loop. **Pairwise** compares the two systems on each *same* input and counts wins, which is
both more informative and more robust — it is the methodology MT-Bench and Chatbot Arena use
to rank models, because relative judgments on the same input are more reliable than absolute
scores (Zheng et al., 2023).

The comparison joins the two runs by example id (`examples/support-reply-loop/eval.ts`):

```ts
export function pairwise(a, b) {
  const byId = new Map(b.results.map((r) => [r.id, r.passed]));
  let aWins = 0, bWins = 0, ties = 0;
  for (const r of a.results) {
    const bPassed = byId.get(r.id);
    if (r.passed === bPassed) ties++;
    else if (r.passed) aWins++;
    else bWins++;
  }
  return { aWins, bWins, ties };
}
```

## The result: the loop earns its cost

The Module 4 test runs both targets on the dataset and compares:

```ts
const loop   = await runEval(dataset, loopTarget(templatedWriter, judge), judge);     // 9/10
const single = await runEval(dataset, singleShotTarget(weakWriter), judge);           //  0/10
const cmp = pairwise(loop, single);
expect(cmp.aWins).toBeGreaterThanOrEqual(9);   // loop wins ≥ 9 cases
expect(cmp.bWins).toBe(0);                       // single-shot wins none
```

The loop wins nine cases and loses none. That is the empirical justification for the entire
course: write→critique→revise produces materially better support replies than a single pass,
on the same inputs, measured by the same rubric. Without this comparison, "reflection is
better" is a belief; with it, it is a number.

## The honest other side: pairwise tells you when NOT to loop

Pairwise is not a victory lap — it is a *decision tool*, and sometimes it tells you to stop
looping. If the loop wins only one case out of ten over single-shot, you are paying 2–5× the
LLM calls for a 10% quality gain, and the right engineering call may be to ship single-shot.
Module 5's "is single-pass good enough?" check is exactly this comparison, run continuously.
A pairwise eval that shows a *small* margin is doing its most valuable job: stopping you from
spending reflection's cost where reflection does not pay.

## The anti-pattern

> **Anti-pattern — Assuming the loop is worth it.** Shipping a reflection loop because the
> pattern is sophisticated, without ever comparing it head-to-head against a single pass. The
> loop costs multiples of the calls; if the pairwise margin is thin, that cost buys little.
> Always run the baseline; let the comparison decide.

## What you should now believe

The question "is the loop better than one pass?" is empirical, and pairwise eval answers it on
the same inputs with the same rubric. A wide margin justifies the loop's cost; a thin one tells
you to ship the baseline. Never assume reflection is worth it — measure it, per example.

## Try it

In the Module 4 suite, change the loop target's writer to `weakWriter` (so the loop revises but
never improves) and re-run the pairwise test. Watch `aWins` collapse toward zero — the loop now
costs more than single-shot for no gain. That collapsed margin is exactly the signal that would
tell you, in production, to stop looping.

## References

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z.,
Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging
LLM-as-a-judge with MT-Bench and Chatbot Arena. In *Advances in Neural Information
Processing Systems 36* (pp. 46595–46623). Curran Associates. https://arxiv.org/abs/2306.05685

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651
