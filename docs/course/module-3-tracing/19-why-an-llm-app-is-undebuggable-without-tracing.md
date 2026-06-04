# Module 3 · Lesson 19 · Why an LLM app is undebuggable without tracing

> **Tag:** `course/lesson-19` · **Module 3: Tracing reflection loops in LangSmith** · ~4 min

## The model you are about to install

Module 3's belief: **tracing makes bugs legible, not rarer.** A reflection loop
does not get fewer bugs because you add tracing — it gets *debuggable* bugs. By the
end of this module you can read a loop's behavior off a trace and name exactly which
of its failure modes you are looking at. This first lesson is about why you cannot do
that from the output alone.

## The output tells you almost nothing

Here is the whole problem in one observation: **a wrong answer and a right answer are
both just strings.** When your support-reply loop escalates a ticket, the final state
says `outcome: "escalated"` — and that is *all* it says. It does not tell you:

- Did the loop try three good revisions and genuinely run out of budget?
- Did the writer stall on the same draft and convergence catch it?
- Did the critic flip-flop on an unchanged draft until the cap fired?
- Did the *judge itself* silently error on every call, so nothing ever truly scored?

All four produce the same one-word outcome. From the output, they are
indistinguishable. You cannot fix a bug you cannot tell apart from three other bugs.

## Why traditional debugging fails here

The tools you reach for in normal code do not survive contact with an LLM loop:

- **A stack trace** points at the line that threw. But the most dangerous LLM bugs
  *do not throw* — a fail-soft node swallows the error and returns a plausible
  fallback (you will see exactly this in Lesson 25). No exception, no stack trace.
- **A debugger / breakpoints** assume deterministic re-execution. An LLM call is
  nondeterministic and slow; you cannot step through "why did the model say that"
  the way you step through a null-pointer.
- **`console.log`** drowns you. A loop is a cycle, so the same node logs three, five,
  ten times, and the logs from concurrent runs interleave. You get a haystack, not a
  needle.
- **Unit-test assertions on the output** pass while the system is quietly broken,
  because the output *shape* is right (`outcome` is a valid value) even when the
  process that produced it was wrong end to end.

## What a trace is

A **trace** is a structured record of every step a single run took, as a tree: the
graph invocation at the root, each node as a child span, each LLM call as a span
under that, each carrying its inputs, outputs, timing, token counts, and any error —
the standard span model of distributed tracing applied to an agent run (LangChain,
n.d.). Where a log is a flat stream you grep, a trace is a *tree you read*: it
preserves the structure of the run, so the cyclic write→critique→write becomes a
visible, navigable shape instead of repeated log lines.

That is the shift this module installs. You stop asking "what did it output" and
start asking "what did it *do*" — and the trace is the only artifact that answers the
second question.

## What you should now believe

You cannot debug a reflection loop from its output, because the output collapses four
distinct failures into one indistinguishable string, and your normal debugging tools
do not survive a nondeterministic, fail-soft, cyclic system. Tracing does not prevent
those failures; it makes them *legible*. The rest of the module is learning to read.

## Try it

For the last support reply your loop escalated (or any escalated run from the Module 1
tests), write down — without looking at any internal state — which of the four failure
modes above caused it. Notice you cannot. Hold that feeling; Lesson 22 onward removes
it, one diagnosis at a time.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/
