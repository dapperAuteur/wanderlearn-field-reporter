# Module 3 · Lesson 21 · What a trace tree shows for a cyclic graph

> **Tag:** `course/lesson-21` · **Module 3: Tracing reflection loops in LangSmith** · ~5 min

## The model you are about to install

A reflection loop is a *cycle*, and a cycle traces differently from a straight
pipeline: the same node appears many times, once per pass. This lesson teaches you to
read that shape — to look at a trace tree and immediately see how many revisions ran,
what each cost, and where the loop spent its time. By the end the cyclic trace is a
picture you can read at a glance.

## A linear trace vs. a cyclic trace

A linear chain traces as a tidy ladder — each node once, top to bottom. A reflection
loop traces as a *repeating* structure, because `write_reply → critique_reply` runs
again every time the router sends it back:

```
▾ buildTracedReplyLoop                         (root: the whole run)
  ▾ write_reply        rev 1                    draft #1
  ▾ critique_reply     rev 1   2/4 passed       ▾ judge: acknowledges_issue ✓
                                                ▾ judge: gives_next_step    ✗
                                                ▾ judge: states_timeline    ✗
                                                ▾ judge: has_signoff        ✓
  ▾ write_reply        rev 2                    draft #2  (revised w/ feedback)
  ▾ critique_reply     rev 2   4/4 passed
  ▾ mark_resolved
```

This is the local `RunTrace` the loop records (`examples/support-reply-loop/tracing.ts`),
and it is the same shape LangSmith draws — a tree of spans, one per node and one per LLM
call, nested by who called whom (LangChain, n.d.). LangGraph runs the loop as a series
of **super-steps**; each pass through `write → critique` is one iteration of the cycle,
and the trace shows them stacked in order.

## What the shape tells you at a glance

You learn to read four things off the tree without reading any text:

1. **Revision count = how many `critique_reply` spans there are.** Two spans, one
   revision. Six spans, the loop nearly hit the cap — a smell worth investigating.
2. **Where the time and tokens went.** Each span carries duration and token counts, so
   you can see that, say, the judge calls dominate cost — exactly the data Module 5 uses
   for cost-per-converged-output.
3. **The score trajectory.** Reading `passedChecks` down the `critique_reply` spans —
   `2/4 → 4/4` — shows the loop *improving*. A flat trajectory (`2/4 → 2/4 → 2/4`) shows
   it *not* improving, which is the next three lessons.
4. **The terminal node.** The last child — `mark_resolved` or `flag_for_human` — tells
   you *how* it ended, recovering the distinction Lesson 19 said the output throws away.

## The per-criterion spans matter

Because Module 2's judge scores one criterion at a time, each `critique_reply` span has
a child span *per criterion*, each with its own pass/fail, evidence, and (in LangSmith)
the model call that produced it. This is where the rubric craft pays off in debugging:
when a draft fails, you do not see "critique failed" — you see *which criterion* failed,
*with the judge's evidence*, in the trace. A compound criterion (Lesson 16) would
collapse those child spans into one ambiguous verdict; atomic criteria keep the trace
legible.

## The trace is the run's structure, preserved

The deep point: a log throws away structure (it is a flat stream), but a trace
*preserves* it. The cycle, the nesting of judge-calls inside a critique inside the run,
the order of revisions — all of it survives in the tree. That preserved structure is
what makes every diagnosis in the next lessons a matter of *reading a shape* rather than
*reconstructing a story from log fragments*.

## What you should now believe

A cyclic graph traces as a repeating, nested tree, and that tree is readable: revision
count, cost, score trajectory, and terminal state are all visible in its shape. You do
not parse a cyclic trace; you *look* at it. The next three lessons name the shapes that
mean trouble.

## Try it

Run `npx tsx examples/support-reply-loop/run.ts` mentally mapped onto the tree above:
two drafts, so two `critique_reply` spans, ending in resolution. Then look at the
Module 3 test's hand-built traces (the wasted-iteration one has three steps with
`passedChecks` `1 → 1 → 4`) and sketch the tree. Reading the shape is the skill.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/
