# Module 6 · Lesson 43 · Course close — the model you installed

> **Tag:** `course/lesson-43` · **Module 6: Capstone** · ~4 min

## Looking back at Lesson 1

The very first lesson made one promise: *reflection is a graph, not a prompt.* Everything since has
been earning that sentence. Stand at the end now and look back down the staircase — each module
installed one belief, and they stack into a single durable model of how to build a reliable
write → critique → revise loop.

## The model, in six beliefs

| Module | The belief you installed |
|---|---|
| **0** | Reflection is a graph, not a prompt — generation and judgment are separate nodes, joined by a cyclic edge. |
| **1** | The cap lives in code; counting is the graph's job — a loop must have a guaranteed, code-level exit. |
| **2** | Writing checks an LLM can actually score is a craft — the rubric, as data, is the lever. |
| **3** | Tracing makes bugs legible, not rarer — the trace recovers what the output throws away. |
| **4** | The runtime rubric is also the offline test — one standard steers at runtime and measures offline. |
| **5** | Reflection is a budget allocation, not a magic wand — it is a position on a cost–quality curve. |
| **Capstone** | You can redeploy the whole pattern, without the notes, on a domain you have never seen. |

Read that column top to bottom: it is not seven tricks, it is one method. A reflection loop is a
*cyclic graph* (0) with a *guaranteed exit* (1) steered by a *data rubric an LLM can score* (2),
made *legible by tracing* (3), *protected by an eval that reuses the rubric* (4), and *allocated as
a budget on a cost–quality curve* (5) — and because every piece is generic, the whole thing
*transfers* (capstone).

## What you can now do that you could not at Lesson 1

- Build a write → critique → revise loop as a typed LangGraph graph.
- Guarantee it terminates, with the cap in code and convergence/escalation composed in priority order.
- Write a rubric an LLM can score — single, observable, independent, weighted criteria — and lint it.
- Read a cyclic trace to diagnose wasted iterations, critic drift, non-convergence, and fail-soft masking.
- Reuse that rubric as an offline regression eval that fails loudly instead of lying.
- Put the loop on a dashboard — convergence, cost-per-converged-output — alert on runaways, and choose a
  point on the cost–quality Pareto frontier.
- Redeploy all of it to a new domain by writing a rubric and a dataset.

That last bullet is the one that matters. The capstone — running the entire stack on legal-clause
rewriting, and the transfer test scoring commit messages — is the proof you hold this as a *tool*, not a
tutorial you followed.

## The anti-pattern this whole course refutes

> **Anti-pattern — "Reflection is magic."** Treating a reflection loop as a sophisticated thing you add
> to make outputs better, on faith. The course's entire arc refutes it: reflection is a *bounded,
> judged, traced, evaluated, priced* graph, and sometimes (Lesson 36) the right amount of it is none.
> You do not believe in reflection loops now — you *measure* them.

## What you should now believe (course close)

Go back and reread Lesson 1's last line — *every hard question in this course is tractable precisely
because the loop is a graph you can inspect.* You have now inspected it node by node, bounded it, judged
it, traced it, evaluated it, priced it, and carried it to new ground. The mental model is installed. The
notes were scaffolding; take them down. You can build a reliable reflection loop, on any domain, from the
model in your head.

## Try it (the last one)

Pick a domain this course never named. Write its rubric, build the loop from the parts in
`examples/`, run the eval, read the dashboard, and ship it. If you can — and you can — you are done here.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U., Dziri, N., Prabhumoye,
S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S., Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine:
Iterative refinement with self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S. (2023). *Reflexion: Language
agents with verbal reinforcement learning* (arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
