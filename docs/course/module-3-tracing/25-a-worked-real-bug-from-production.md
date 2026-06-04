# Module 3 · Lesson 25 · A worked real bug from production

> **Tag:** `course/lesson-25` · **Module 3: Tracing reflection loops in LangSmith** · ~6 min

## The model you are about to install

Everything so far has been failure modes we induced on purpose. This lesson is a **real
bug from a shipped agent** — a sibling product in this same ecosystem — where the trace
was the only thing that revealed it. It is the all-zeros trajectory from Lesson 24, in
the wild, and it teaches the module's hardest lesson: a fail-soft node can make a totally
broken system look completely healthy.

## The symptom: green tests, useless output

The `witus-triage-agent` is a LangGraph agent that classifies inbound messages into
categories with a confidence score. Early in its life, **every** classification came back
identical: `category: "other"`, `confidence: 0`. Not *some* — every single one. And here
is the part that makes this a Module 3 lesson and not a Module 1 one:

> The runs did not error. The test suite stayed green. (McDonald, n.d.)

Nothing threw. No exception, no stack trace, no failed assertion. By every signal a
normal debugging workflow looks at, the system was *fine*. It was completely broken.

## The cause: a fail-soft node catching everything

The `classify` node is **fail-soft** — exactly the posture Lesson 20 said is correct for
keeping a graph moving. On any LLM error it returns an `"other"` / `confidence: 0`
fallback so that one bad input cannot crash the whole graph:

```ts
// classify node, simplified — the fallback that hid the bug
try {
  return await model.withStructuredOutput(Schema).invoke(prompt);
} catch (err) {
  return { category: "other", confidence: 0, rationale: String(err) };
}
```

That safety net was silently catching *every* call. The output it produced —
`"other"` / `0` — is a **valid-looking result**: a real category, a real number. So the
output assertions saw well-formed data and passed. The fallback meant for *one* bad input
was swallowing *all* of them, and because it failed *soft*, it failed *invisibly*.

## The diagnosis: the trace carried the real error

The output said `confidence: 0`. The **trace** said something completely different. The
LangSmith model-call span — the child span under `classify`, the one the output threw
away — carried the actual error the fallback had swallowed:

> *"Your credit balance is too low to access the Anthropic API."* (McDonald, n.d.)

It was not a code bug at all. It was an **unfunded API key.** Every model call was being
rejected for billing, every rejection was caught by the fail-soft fallback, and every
fallback became a clean-looking `"other"` / `0`. The output could not show you this,
because by the time the fallback ran, the error was gone. The trace showed it because the
trace records the model-call span *including its error*, before any fallback rewrites the
result.

This is the module's thesis in one bug: **tracing makes bugs legible, not rarer.** The
trace did not prevent the unfunded key. It made an invisible, green-passing, total failure
*visible* in one click.

## The same bug, in our loop

You can reproduce the shape exactly in the support-reply loop. A fail-soft *judge* — one
that swallows an error and blanket-returns "fail" for every criterion — makes the loop
escalate every ticket while looking unalarming. The Module 3 code detects it
(`examples/support-reply-loop/tracing.ts`):

```ts
export function detectFailSoftMasking(trace: RunTrace): boolean {
  const distinctDrafts = new Set(trace.steps.map((s) => s.draft.trim())).size;
  const everPassedAnyCheck = trace.steps.some((s) => s.passedChecks > 0);
  return distinctDrafts >= 2 && !everPassedAnyCheck;   // tried real drafts, scored nothing, ever
}
```

The Module 3 test drives the loop with a fail-soft judge and asserts two things that
*together* are the whole lesson: the **output** is just `outcome: "escalated"` (green,
unalarming), and the **trace** shows that even a known-strong draft scored `0/4` — the
masked failure. Output says "escalated"; trace says "the critic never worked."

## The deeper lesson: fail-soft hides bugs, so make the soft failure loud *somewhere*

Lesson 20 told you fail-soft is correct for infrastructure. This bug is the cost of that
correctness: a fallback that keeps the graph moving also keeps the *failure* moving,
silently, into your output. The resolution is not to remove fail-soft — it is to make the
soft failure **visible where it matters**:

- **In the trace** — the error must survive on the span even when the fallback hides it
  from the output. (LangSmith does this for you; it is *why* you trace.)
- **In the evals** — this same bug poisoned `witus-triage`'s accuracy eval: the fallback
  results folded into the score and reported a fake **8%** that was really an
  infrastructure failure, not a measurement (McDonald, n.d.). The fix — detect the
  error-fallback signature (`confidence === 0` + an error in the rationale) and **fail the
  eval loudly** rather than score it — is exactly the bridge into Module 4.

## What you should now believe (module close)

Look back at Lesson 19: *tracing makes bugs legible, not rarer.* You have now seen it on a
real shipped agent. A fail-soft node — the very thing that keeps your graph alive — can
turn a total, billing-level failure into clean-looking output that passes every test. The
output cannot save you, because the fallback already erased the evidence. The trace can,
because it records what actually happened before the fallback rewrote it. Trace your
loops, and make every soft failure loud in the trace and in the eval.

And that eval — the one this bug poisoned — is Module 4: turning the runtime rubric into an
offline regression test that fails loudly instead of lying quietly.

## Try it

Run the Module 3 fail-soft test and read both assertions:
`npm run test -- tests/course/module-3-tracing.test.ts`. Then change `detectFailSoftMasking`
to also require that a *known-strong* draft was among the zero-scored ones, and reason about
whether that makes the detector stronger or more brittle. (It is the real tension: the more
you encode "should have passed," the more you must know the right answer — which is what an
eval dataset gives you. Module 4.)

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

McDonald, B. A. (n.d.). *WitUS triage agent* [Computer software]. Retrieved June 4, 2026,
from the repository `witus-triage-agent` (`README.md`, "A real bug, found in a trace";
`plans/01-fix-accuracy-eval.md`).
