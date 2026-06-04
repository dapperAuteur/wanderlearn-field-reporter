# Module 3 · Lesson 24 · Diagnosing non-convergence

> **Tag:** `course/lesson-24` · **Module 3: Tracing reflection loops in LangSmith** · ~4 min

## The model you are about to install

The third trouble-shape: **non-convergence** — a run that never reached a passing draft
and exited by escalation or cap. Non-convergence is not itself a bug (Module 1 made it a
*designed* outcome), but a *rate* of non-convergence is a signal, and the trace tells you
whether the cause is the writer, the rubric, or the input. By the end you can triage a
non-converged run.

## The shape in the trace

Non-convergence is the simplest shape to spot — the terminal span is `flag_for_human`,
not `mark_resolved`:

```
write_reply / critique_reply   rev 1   2/4
write_reply / critique_reply   rev 2   2/4
write_reply / critique_reply   rev 3   2/4
flag_for_human                          ← never passed; escalated
```

The diagnostic is a one-liner because the outcome already carries it:

```ts
export function didNotConverge(trace: RunTrace): boolean {
  return trace.outcome === "escalated";
}
```

The Module 3 test asserts it is `true` for an escalated run and `false` for a resolved
one. The *interesting* work is not detecting non-convergence — it is reading the trace to
learn **why** this run did not converge, because the fix differs entirely by cause.

## Triage: three causes, three fixes

A non-converged trace falls into one of three shapes, and you tell them apart by the
score trajectory (the same `passedChecks` column from Lessons 22–23):

| Trace shape | Cause | Fix |
|---|---|---|
| Score climbs but ran out of passes (`1 → 2 → 3`, cap hit) | Loop needed more budget | Raise `MAX_REVISIONS` — it was converging, just slowly |
| Score flat the whole way (`2 → 2 → 2`) | Writer or rubric stuck (Lessons 22–23) | Fix the suggestions / the writer; do **not** just raise the cap |
| Score is `0/4` on every pass, even on good drafts | Something is broken upstream | Lesson 25 — the critic itself is failing |

This is the payoff of the whole module: "the loop escalated" is one outcome, but the
trace splits it into three causes with three *opposite* fixes. Raising `MAX_REVISIONS`
rescues the first case and **wastes money on the second** — and you can only tell which
you are in by reading the trajectory in the trace.

## Non-convergence rate is the real signal

A single escalation is fine — that is the loop being honest about a hard ticket. A
*rising rate* of escalations across many runs means something changed: a model
regression, a rubric edit that raised the bar, a shift in the inputs. That is why Module
5 puts non-convergence rate on a dashboard with an alert — the per-run trace tells you
the cause of *one* escalation; the aggregate tells you *when to go look.*

## The anti-pattern

> **Anti-pattern — Raising the cap to "fix" non-convergence.** Reflexively bumping
> `MAX_REVISIONS` whenever runs escalate. It rescues only the genuinely-slow case; for a
> flat-trajectory stall it just buys more identical failing passes at full price. Read the
> trajectory first: raise the cap only when the score was actually climbing.

## What you should now believe

Escalation is one outcome hiding three causes, and they demand opposite fixes — more
budget, a better writer/rubric, or an upstream repair. The score trajectory in the trace
is the triage tool. And the *rate* of non-convergence, not any single run, is what tells
you the system changed.

## Try it

Build three traces by hand (like the Module 3 test does): one climbing-then-capped, one
flat, one all-zeros. Run `didNotConverge` on each (all `true`) — then notice it cannot
tell them apart, which is the point: detection is trivial, triage is the skill, and triage
lives in the trajectory. Lesson 25 is the all-zeros case, in the wild.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S. (2023).
*Reflexion: Language agents with verbal reinforcement learning* (arXiv:2303.11366).
arXiv. https://arxiv.org/abs/2303.11366
