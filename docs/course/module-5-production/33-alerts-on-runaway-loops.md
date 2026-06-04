# Module 5 · Lesson 33 · Alerts on runaway loops

> **Tag:** `course/lesson-33` · **Module 5: Production — keeping the loop honest** · ~4 min

## The model you are about to install

A metric you have to remember to look at is a metric you will miss at 3am. This lesson turns
the convergence and cost metrics into **alerts** — thresholds that page you when the loop
misbehaves — with special attention to the **runaway loop**, the failure that costs the most and
hides the longest. By the end you can wire alerts that fire on the right signals and stay quiet
otherwise.

## The runaway loop, defined and counted

Module 1 guaranteed the loop *terminates* — but terminating at the cap, unresolved, every time,
is its own pathology: the loop is burning the full revision budget on every run and resolving
none of them. That is a **runaway loop**, and it is the most expensive way a loop can fail (it
pays maximum cost for zero good output). Count it explicitly
(`examples/support-reply-loop/production.ts`):

```ts
runawayCount: records.filter(
  (r) => r.outcome === "escalated" && r.revisions >= maxRevisions,
).length,
```

A runaway run is one that escalated *and* hit the hard cap — distinct from a run that escalated
early by convergence detection (Module 1), which is the loop being efficient. The Module 5 test
drives the loop with a never-passing, always-changing writer and asserts every run is a runaway.

## Alerts: thresholds that page you

`checkAlerts` compares the metrics to thresholds and returns the alerts that fired:

```ts
export function checkAlerts(metrics, thresholds): Alert[] {
  const alerts = [];
  if (metrics.convergenceRate < thresholds.minConvergenceRate) alerts.push({ kind: "low-convergence", … });
  if (metrics.runawayCount > thresholds.maxRunawayCount)       alerts.push({ kind: "runaway", … });
  if (metrics.costPerConvergedOutput > thresholds.maxCostPerConvergedOutput) alerts.push({ kind: "cost", … });
  return alerts;
}
```

Three signals, three alerts. Note how they *interact*: when convergence hits zero, there are no
resolved runs, so cost-per-converged-output is `Infinity` — and the cost alert fires *too*. The
Module 5 test asserts all three fire on a fully-runaway loop. That is correct and informative: a
runaway loop is simultaneously not-converging, running away, and infinitely expensive per good
output. One pathology, three alarms, which is exactly the redundancy you want for the worst case.

## Alert on the rate, page on the trend

Two disciplines keep alerts useful rather than noisy:

1. **Alert on rates over a window, not single runs.** One escalation is normal; a *rate* of
   escalations over the last N runs is signal. Alerting per-run would page you constantly.
2. **Set thresholds with margin (Module 4 callback).** The same judge noise that made you set an
   eval threshold below 100% applies here: alert when convergence drops *clearly* below normal,
   not on every wobble, or the team mutes the pager — and a muted pager catches nothing.

## The anti-pattern

> **Anti-pattern — The dashboard nobody watches.** Computing convergence, runaway, and cost
> metrics but never wiring them to an alert. The metrics are perfect and the 3am regression runs
> for six hours because no one was looking. A metric without an alert is a metric you will miss
> exactly when it matters. Wire the alert.

## What you should now believe

The runaway loop — full budget, zero resolutions — is the most expensive failure, so count it
explicitly and alert on it. Turn every production metric into a threshold that pages you, alert on
rates over a window with margin for noise, and never ship a loop whose health lives only on a
dashboard someone has to remember to open.

## Try it

In the Module 5 test, lower `maxRunawayCount` to a large number (say 100) and watch the runaway
alert stop firing even on the runaway loop — then realize you just muted the most important alarm.
Restore it to 0. Threshold-setting is the whole craft: too loose and you miss the fire.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/
