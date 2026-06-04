# Module 1 · Lesson 7 · Why cyclic graphs need a guaranteed exit

> **Tag:** `course/lesson-07` · **Module 1: Bounded termination** · ~4 min

## The model you are about to install

Here is Module 1's belief, stated up front: **the cap lives in code; counting is
the graph's job.** A reflection loop is a *cycle* — `write` can route back to
`write` forever — and a cycle with no guaranteed exit is not a feature, it is an
outage waiting for the wrong input. This module gives the loop four ways to stop,
all of them in code, none of them in a prompt.

## A loop is a liability until it is bounded

In Module 0 you built `write → critique → revise`, and you already added one exit:
a max-revision counter. Take it out and look at what you have. The critic decides
whether to revise. The writer decides what the next draft is. Nothing decides when
to *stop* — so if the critic never passes the draft, the graph runs the cycle
again, and again, with no end.

This is not hypothetical. Three real ways a reflection loop fails to terminate on
its own:

1. **An impossible rubric.** A check the writer can never satisfy (a contradiction,
   or a standard the model simply cannot meet) means `passed` is never true.
2. **A stalled writer.** The writer stops responding to the critique and emits the
   same draft every pass — the critique keeps failing, the loop keeps spinning, and
   nothing changes.
3. **Critic drift.** A nondeterministic LLM critic flip-flops: pass, fail, pass,
   fail, on essentially the same draft, so the loop never settles.

## The failure mode has a price tag

An unbounded reflection loop does not crash politely. Each iteration is one or more
LLM calls, so a loop that should take three passes and instead runs two hundred
costs you two hundred passes of latency and tokens — per stuck request, across
every concurrent user who hits the same bad input. The first time most teams learn
their loop was unbounded is a billing alert or a timeout storm in production. The
guard you are about to build is cheap; its absence is not.

## What "guaranteed exit" actually requires

A cycle terminates if and only if some measure *strictly decreases toward a bound*
on every pass and the loop stops at the bound. The counter you wrote does exactly
this: `revisionNumber` increases by one each pass and the router exits at
`MAX_REVISIONS`, so the loop is guaranteed to halt in at most `MAX_REVISIONS`
steps no matter what the model does. That is the whole idea, and the rest of this
module is variations on it:

- **Pattern 1 — the counter** (Lesson 8): the hard, always-correct bound.
- **Pattern 2 — convergence** (Lesson 9): stop early when revising stops helping.
- **Pattern 3 — escalation** (Lesson 10): when you stop *unresolved*, hand to a
  human instead of shipping junk.
- **Composition** (Lesson 11): all three in one router, in priority order.
- **`recursionLimit`** (Lesson 12): the framework backstop, and why it is the
  seatbelt, not the steering wheel.

## What you should now believe

A cyclic graph without a guaranteed, code-level exit is a bug, not a loop. "The
model will probably converge" is not termination; it is hope. Counting is the
graph's job, and you are about to make the graph very good at it.

## Try it

Open `examples/support-reply-loop/termination.ts` and read
`buildUncappedReplyLoop` — the loop with the counter deliberately removed. Predict,
before Lesson 12, what happens when you drive it with a writer that never passes.
Then read the last test in `tests/course/module-1-termination.test.ts` and check
your prediction.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
