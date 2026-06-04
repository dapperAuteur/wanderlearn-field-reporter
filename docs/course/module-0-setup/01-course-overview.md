# Module 0 · Lesson 1 · Course overview & "reflection is a graph, not a prompt"

> **Tag:** `course/lesson-01` · **Module 0: Reflection-loop primitive + setup** · ~4 min

## The model you are about to install

Here is the belief this whole course installs, stated up front so you can watch it
become true: **reflection is a graph, not a prompt.** When you want a language
model to improve its own work, the instinct is to write a longer prompt — "draft
this, then critique yourself, then revise." That packs generation and judgment
into one call, where they blur together and you cannot see, measure, or bound any
of it. The alternative is to make the loop a *structure*: separate nodes for
writing and critiquing, a cyclic edge between them, and a counter that decides
when to stop. That structure is a LangGraph graph, and everything else in this
course — termination, rubrics, tracing, evals, production guards — is something
you bolt onto that graph because it is a graph.

## What you will build

Across six modules you build one pattern, the **reflection loop**: an agent that
drafts an answer, critiques it against an explicit standard, and revises until the
draft passes or a cap is hit. You build it on a single running example so the
pieces visibly compose:

- **Module 0** — the minimal write → critique → revise loop with a stub critic.
- **Module 1** — bounded termination: how a cyclic graph is *guaranteed* to exit.
- **Module 2** — critique design: writing checks an LLM can actually score.
- **Module 3** — tracing the loop in LangSmith so its bugs become legible.
- **Module 4** — turning the runtime rubric into an offline regression eval.
- **Module 5** — keeping the loop honest in production (cost, convergence, alerts).
- **Capstone** — compose all six on a *new* domain, to prove the pattern transfers.

## The thread domain, and why it rotates

Modules 0–4 run on one domain: **customer support-ticket replies**. A draft reply
is easy to judge badly ("make it friendlier") and hard to judge well ("does it
name the customer's actual problem and tell them what happens next?"), which makes
it a perfect teacher for the craft of critique. Holding the domain fixed lets you
see the *loop* change — gaining termination, then a real rubric, then tracing —
without the example shifting under you.

Then the **capstone switches domains entirely**, to rewriting dense legal clauses
into plain language. If the patterns you learned only worked on support replies,
the capstone exposes it. That is the point: a Foundation course should leave you
able to redeploy the pattern *without* the notes, on a domain the course never
showed you (Madaan et al., 2023).

## Why a loop at all

A single model call returns a *plausible* answer, not its *best* one — plausible
is where next-token prediction stops. Across code generation, reasoning, and
writing, agents that critique and revise their own output measurably outperform
single-pass agents (Madaan et al., 2023; Shinn et al., 2023). The loop does not
make the model smarter; it gives the model a *target* and a second attempt at
hitting it. Lesson 5 makes this concrete on a real support reply; Lesson 6 builds
the loop you will extend for the rest of the course.

## What you should now believe

A reflection loop is a *shape* — write, critique, route, repeat — not a clever
sentence inside one prompt. Hold onto that. Every hard problem in the rest of the
course (When does it stop? Is the critic any good? Why did this run waste three
revisions?) is tractable precisely because the loop is a graph you can inspect
node by node.

## Try it

Before any code: write down, for a support reply you have personally received,
three checks a critic could score by *reading the text* — not "be polite," but
something verifiable. Keep the list. In Lesson 6 you will discover your loop is
only as good as exactly these checks.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
