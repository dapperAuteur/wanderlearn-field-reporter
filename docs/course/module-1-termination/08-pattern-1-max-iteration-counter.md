# Module 1 · Lesson 8 · Pattern 1 — the max-iteration counter (in code, not a prompt)

> **Tag:** `course/lesson-08` · **Module 1: Bounded termination** · ~5 min

## The model you are about to install

The first and most important termination pattern is a plain integer counter that
the *graph* increments and the *router* checks. It is unglamorous and it is the
one you must never skip. By the end of this lesson you can state exactly why the
counter belongs in code and never in the prompt.

## The pattern

You already wrote it in Module 0. Here it is again, named:

```ts
// in the write node — the graph increments the counter:
const revisionNumber = state.revisionNumber + 1;
return { draft, revisionNumber, history: [{ revisionNumber, draft }] };

// in the router — the graph checks the bound:
if (state.revisionNumber >= MAX_REVISIONS) return "flag_for_human";
```

Two halves: the **write node increments** a counter on every pass, and the
**router compares** it to a constant. Because the counter strictly increases and
the router exits at the bound, the loop halts in at most `MAX_REVISIONS` passes —
regardless of the rubric, the writer, or the model's mood. This is a *guarantee*,
not a tendency.

## The anti-pattern: counting in the prompt

Here is the version that looks equivalent and is not:

> **Anti-pattern — Prompt-counted termination.** Telling the model, in the prompt,
> "revise at most three times, then stop." It reads like a cap. It is not one.

Why it fails, concretely:

- **The model cannot reliably count its own turns.** It has no durable, trustworthy
  view of how many times the loop has run; "third revision" is a thing *you* know
  from state, not a thing the model knows from text.
- **It is one jailbreak / one confused completion from ignoring you.** A prompt
  instruction is a suggestion the sampler can override. A `>=` in code cannot be
  argued with.
- **It is invisible to your guards.** You cannot alert on, trace, or test a bound
  that lives inside a paragraph. A counter in state shows up in every trace and
  every test.

The cap is a *control-flow* decision, and control flow belongs in the graph, not in
the generator you are trying to control. Putting the safety bound inside the thing
it is supposed to bound is the category error this whole module exists to prevent.

## Choosing the bound

`MAX_REVISIONS` is a budget, so set it like one. Most reflection loops that are
going to converge do so within two or three revisions; past that, more passes
rarely help and the convergence and escalation patterns (Lessons 9–10) should be
catching the run anyway. Start at 3, measure (Module 4 gives you the eval to do it
honestly), and adjust. The point of Pattern 1 is not the exact number — it is that
*some* finite number is enforced in code.

## See it stop

The first Module 1 test drives the bounded loop with a writer that never passes but
always changes its draft, so convergence never fires and only the counter can stop
it:

```bash
npm run test -- tests/course/module-1-termination.test.ts
```

It asserts the run ends `escalated` at exactly `MAX_REVISIONS`. That is Pattern 1
doing its one job: a guaranteed bound, no matter what the model does.

## What you should now believe

The hard counter is the floor under every reflection loop. It is in code, it is
checked by the router, and it is non-negotiable. Every other pattern in this module
makes the loop *smarter* about stopping; the counter makes it *safe*. Never ship
without it.

## Try it

Set `MAX_REVISIONS` to 1 in `examples/support-reply-loop/graph.ts` and re-run the
Module 1 test. Watch the counter test's expected revision count change, and notice
the success test still passes (a one-revision win still wins). Put it back to 3.
You just tuned a budget by editing one constant — exactly as intended.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651
