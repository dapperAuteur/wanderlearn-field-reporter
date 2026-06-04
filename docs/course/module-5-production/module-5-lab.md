# Module 5 · Lab · Put the loop on the cost–quality curve

> **Goal:** measure your loop's production economics, wire an alert, run the single-pass gate, and
> place three configs on a Pareto frontier — then choose a point on purpose.
> **Success signal:** `npm run test -- tests/course/module-5-production.test.ts` green with your
> additions; you can state where your loop should sit and why. Offline, no key.

Work on `course/lesson-37`. Code: `examples/support-reply-loop/production.ts`.

## Part A — Measure and alert (required)

1. Run `runProduction` + `computeMetrics` on the dataset with the good writer; record convergence
   rate, avg iterations, runaway count, and cost-per-converged-output.
2. Now run it with a writer that fails ~half the tickets and recompute. Wire `checkAlerts` with
   thresholds and assert the degraded run fires `low-convergence` (and maybe `cost`) while the good
   run stays quiet.
3. Write one sentence on what real event each alert would represent in production.

## Part B — The single-pass gate (required)

1. Run the single-shot baseline (`singleShotTarget`) with the **strong** writer and the **weak**
   writer; compute each pass rate.
2. Use `singlePassGoodEnough` at threshold 0.8 and confirm: weak → loop, strong → don't loop.
3. Raise the threshold to 0.95 and watch the strong single-shot flip to "loop." Write one sentence:
   what product would justify the 0.95 bar?

## Part C — A/B a critic, then build the Pareto frontier (required)

1. A/B two critics with `abCompare`: the good `datasetJudge` vs a slightly-weakened copy (drop one
   cue so it passes fewer cases). Read the quality delta.
2. Assemble `ParetoPoint`s for at least four configs — e.g. `single-shot`, `loop-cap-1`,
   `loop-cap-3`, and a hypothetical `loop-cap-2` (quality 0.92, cost 3). Use real `computeMetrics`
   numbers where you can; estimate the rest.
3. Run `paretoFrontier` and identify which configs are dominated. For each non-dominated point, say
   in one sentence which product would choose it.

## Part D — Choose, and defend (required)

Pick the point on your frontier you would ship for a *customer-facing* support tool, and the point
you would ship for an *internal draft assistant*. Justify each in one sentence in terms of where the
product's quality bar sits relative to cost.

## Self-check rubric

| Check | Pass condition |
|---|---|
| Metrics computed | convergence, iterations, runaway, cost-per-converged on good + degraded runs |
| Alert fires correctly | degraded run alerts; good run is quiet |
| Single-pass gate | weak → loop, strong → don't loop; you can flip it with the threshold |
| Frontier built | ≥ 4 configs placed; dominated ones identified |
| Choice defended | two product-specific points chosen with a one-sentence cost–quality rationale each |

All required rows green → you can run a reflection loop as a deliberate budget allocation. The capstone
(Module 6) takes the whole stack to a new domain.
