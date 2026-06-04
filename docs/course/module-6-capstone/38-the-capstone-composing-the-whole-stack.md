# Module 6 · Lesson 38 · The capstone — composing the whole stack on a new domain

> **Tag:** `course/lesson-38` · **Module 6: Capstone** · ~5 min

## The model you are about to install

The capstone's belief, and the whole course's test: **you can redeploy the reflection-loop
pattern without the notes, on a domain you have never seen.** Five modules built the stack on
customer-support replies. This module composes all of it — primitive, termination, rubric,
tracing, eval, production — on a *different* domain: rewriting dense legal clauses into plain
language. If the patterns only worked on support replies, the capstone exposes it. By the end you
can see the entire stack as one composed system on new ground.

## Why a new domain, deliberately

A course that taught reflection loops on one domain and tested you on the same domain would prove
only that you can follow a recipe. The point of a *Foundation* course is a durable mental model you
carry to new problems. So the capstone switches domains on purpose (Madaan et al., 2023, frame
transfer as the real test of a learned method): **legal clause → plain-language rewrite**, a task
with nothing in common with support replies except the shape of the loop.

The corpus is dense regulatory text — for example, a real public-domain clause from U.S. federal
plain-language materials:

> *"When the process of freeing a vehicle that has been stuck results in ruts or holes, the
> operator will fill the rut or hole created by such activity before removing the vehicle from the
> immediate area."*

The loop's job: turn that into something a person can read.

## The transfer is the import list

Here is the proof that the pattern transfers, and it is mechanical. Open
`examples/capstone-plain-language/index.ts` and read what it *imports*:

```ts
import { scoreAgainstRubric } from "../support-reply-loop/rubric";              // M2 — the scorer
import { routeWithAllPatterns, TerminatingReplyStateAnnotation } from "…/termination"; // M1 — the router
import { pairwise, meetsThreshold, assertNoInfraErrors } from "…/eval";          // M4 — the comparisons
import { computeMetrics, paretoFrontier } from "…/production";                   // M5 — the metrics
```

Everything *structural* is reused unchanged. The capstone writes only **domain data**: a new
rubric, a new corpus, and offline stand-ins. That is the entire deliverable, and it is the entire
point — **the machinery is domain-independent; only the rubric and the data are domain-specific.**
If you understood the five modules, you can build this capstone by writing a rubric and a dataset
and wiring the parts you already have.

## What composes, and where it came from

| Capstone piece | Reused from | Module |
|---|---|---|
| write → critique → revise cycle | the graph shape | 0 |
| bounded router (counter, convergence, escalation) | `routeWithAllPatterns` | 1 |
| rubric scorer + pass rule | `scoreAgainstRubric`, `applyPassRule` | 2 |
| trace diagnostics (run records) | the trace shape | 3 |
| pairwise, threshold, loud-fail | `pairwise`, `meetsThreshold`, `assertNoInfraErrors` | 4 |
| convergence, cost, Pareto | `computeMetrics`, `paretoFrontier` | 5 |
| **the rubric + the corpus** | **new — written for this domain** | — |

## What you should now believe

The capstone is not a seventh new idea — it is the six you already have, composed on new ground. The
fact that you can run the whole stack on legal-clause rewriting by writing only a rubric and a
dataset *is* the durable mental model the course set out to install. The next lessons build the new
rubric (39), compose the graph (40), run the eval and dashboard (41), push to a third domain (42),
and close the loop back to Module 0 (43).

## Try it

Run the capstone test: `npm run test -- tests/course/module-6-capstone.test.ts`. Note it imports
from `support-reply-loop` for everything structural and from `capstone-plain-language` only for the
domain data. Then open `examples/capstone-plain-language/index.ts` and count how many *new*
structural functions it defines. (Hint: it is the loop builder and thin wrappers — the engine is
imported.)

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U., Dziri, N.,
Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S., Yazdanbakhsh, A., & Clark, P.
(2023). *Self-Refine: Iterative refinement with self-feedback* (arXiv:2303.17651). arXiv.
https://arxiv.org/abs/2303.17651

Plain Language Action and Information Network. (n.d.). *Federal plain language guidelines*
[Public domain]. https://www.plainlanguage.gov/
