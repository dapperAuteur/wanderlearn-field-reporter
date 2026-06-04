# Module 4 · Lesson 30 · Setting thresholds with margin for LLM-judge noise

> **Tag:** `course/lesson-30` · **Module 4: Eval-driven reflection** · ~4 min

## The model you are about to install

An eval that gates CI needs a **threshold**: pass rate ≥ X or the build fails. But the
scorer is an LLM judge, and an LLM judge is *noisy* — so a threshold of 100% will fail your
build on a good system the day the judge wobbles. This lesson is about setting the threshold
*below* the expected pass rate by enough to absorb that noise. By the end you can pick a
threshold that catches regressions without crying wolf.

## The judge is a distribution, not a function

Module 3 named critic drift: the same draft can score differently across runs because the
judge is nondeterministic. Even at temperature 0, an LLM judge is not perfectly stable across
inputs and versions. So your eval's pass rate is itself a *noisy measurement* — run the same
good system twice and you might get 0.92 and 0.88. A threshold has to live below that wobble.

## Threshold below expected, by a margin

The rule (`examples/support-reply-loop/eval.ts`):

```ts
export function meetsThreshold(report, threshold) {
  return report.passRate >= threshold;
}
```

The machinery is trivial; the *number you pass it* is the lesson. The Module 4 test sets it at
**0.7**, not 1.0, for a system that scores ~0.9:

```ts
expect(meetsThreshold(loop, 0.7)).toBe(true);    // good system clears it with room to spare
expect(meetsThreshold(single, 0.7)).toBe(false); // broken baseline cannot
```

The gap between the expected ~0.9 and the 0.7 gate is the **margin** — the room you leave for
judge noise so a good run on a bad judge-day does not redden CI. Set the threshold at
roughly *expected minus a few times the run-to-run wobble*: high enough that a real regression
drops below it, low enough that ordinary judge noise does not.

## The two ways to get the margin wrong

- **Threshold too high (no margin).** Set it at 0.95 for a 0.9 system and CI fails randomly on
  good code. The team learns to ignore the eval — a flaky gate is a disabled gate. This is the
  more common and more damaging mistake.
- **Threshold too low (too much margin).** Set it at 0.3 and a real regression to 0.5 sails
  through. The gate is green while the loop quietly degrades.

The margin is a calibration, and the only way to set it honestly is to *measure the noise*:
run the eval several times on an unchanged good system, see the spread, and put the threshold a
clear step below the bottom of it.

## Margin is also why the dataset must be big enough

A 3-example dataset makes every run 0%, 33%, 67%, or 100% — the pass rate jumps in huge steps,
so there is no room to set a meaningful threshold between "good" and "regressed." A slightly
larger dataset (Lesson 31) gives the pass rate finer resolution, which is what makes a margin
between expected and threshold *expressible* at all.

## The anti-pattern

> **Anti-pattern — The 100% gate.** Requiring a perfect pass rate from an LLM-judged eval. It
> fails on good systems whenever the judge wobbles, so the team disables or ignores it — and a
> gate no one trusts catches nothing. Set the threshold below expected, with margin sized to the
> measured noise.

## What you should now believe

An LLM-judged eval is a noisy instrument, so its gate must have slack. Set the threshold below
the expected pass rate by a margin you *measured*, not guessed — high enough to catch a real
regression, low enough to survive an ordinary judge-day. A threshold with no margin is a gate
the team will learn to ignore.

## Try it

Run the Module 4 suite a few times and note the loop's pass rate is stable here (the stand-ins
are deterministic) — then imagine the judge were a real LLM and the rate wobbled between 0.85
and 0.95. Which threshold survives that: 0.95, 0.8, or 0.5? Argue for one, then check it against
the test's choice of 0.7.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG evaluation
using GPT-4 with better human alignment. In *Proceedings of the 2023 Conference on
Empirical Methods in Natural Language Processing* (pp. 2511–2522). Association for
Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153
