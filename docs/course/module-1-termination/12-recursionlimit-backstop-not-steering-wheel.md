# Module 1 · Lesson 12 · `recursionLimit` — the backstop, not the steering wheel

> **Tag:** `course/lesson-12` · **Module 1: Bounded termination** · ~5 min

## The model you are about to install

LangGraph has its own built-in stop: `recursionLimit`, a cap on how many steps a
graph may take before it throws. It is real and it is useful — as a *backstop*.
This lesson draws the line between a backstop and a control: the patterns you just
built steer the loop; `recursionLimit` only catches it when steering failed. By the
end you can say exactly what each is for and never confuse them.

## What `recursionLimit` is

Every LangGraph invocation runs at most `recursionLimit` super-steps; exceed it and
the graph throws a `GraphRecursionError` instead of looping forever (LangChain,
n.d.). You set it per call:

```ts
await graph.invoke({ ticket }, { recursionLimit: 25 }); // default is 25
```

It is a framework-level guarantee that *no* graph — yours, or one you imported —
can hang the process indefinitely. That is a genuinely good safety net to have
underneath everything.

## Why it is a backstop, not a steering wheel

Drive the **uncapped** loop — the one with the counter and convergence removed —
with a writer that never passes:

```bash
npm run test -- tests/course/module-1-termination.test.ts
```

The final test asserts the invocation **throws** on `recursionLimit`. That throw is
the whole demonstration. Compare the two ways the loop can end:

| | Your patterns (counter / convergence / escalation) | `recursionLimit` |
|---|---|---|
| How it ends | a clean terminal state (`resolved` / `escalated`) | an exception |
| Carries an outcome | yes — downstream knows what happened | no — you get a stack trace |
| Lets you escalate gracefully | yes — `flag_for_human` with the diagnosis | no — the run is just dead |
| Tunable per *reason* | yes — different bounds for different exits | one blunt number |
| Meaning | "the loop did its job and stopped" | "you forgot to bound your loop" |

A `GraphRecursionError` in production is not the system working as designed; it is
the system telling you the design was missing. The patterns are the steering wheel
— they decide *where* the loop goes and end it *on purpose*. `recursionLimit` is the
seatbelt — it does nothing in a well-driven run and saves you from a crash in a
catastrophic one. You want both. You rely on the wheel.

## The anti-pattern

> **Anti-pattern — Steering with the seatbelt.** Relying on `recursionLimit`
> (often tuned down to a small number) as a loop's primary termination, with no
> counter or convergence in the graph. The loop "stops," so it looks bounded — but
> it stops by *throwing*, with no outcome, no escalation, and no way to tell a
> legitimately long run from a stuck one. Set `recursionLimit` generously as a
> backstop and bound the loop yourself in the router.

Set `recursionLimit` *above* the worst case your own patterns allow, so in a
healthy system it never fires — and when it does fire, you know immediately that a
real bound is missing.

## What you should now believe (module close)

Look back at Lesson 7's promise: *the cap lives in code; counting is the graph's
job.* You now have four ways to stop, composed in priority order, every one of them
a deliberate decision your graph makes — plus a framework backstop underneath, set
generously, that you never steer with. A reflection loop with this is *reliable*:
it terminates on every input, for a reason you chose, in a state you can read.

That reliability rests entirely on the router trusting the critic's `passed`
verdict. So the next question is unavoidable: **is the critic any good?** Module 2
is the craft of writing a rubric an LLM can actually score.

## Try it

Take the **bounded** loop (counter + convergence + escalation) and invoke it with
an absurdly low `recursionLimit: 2`. Confirm your own patterns still try to do their
job but the backstop now fires first — and notice how much *worse* the failure is
(an exception) than letting your patterns end the run. This is why the backstop is
set high: so your patterns, not the seatbelt, end the loop.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
