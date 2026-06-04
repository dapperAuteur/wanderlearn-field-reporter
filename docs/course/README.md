# Foundation: Reflection-Loop Reliability

A methodical, paper-cited tour of **write → critique → revise** — the deepest
gap in the LangChain Academy Foundation track. No Foundation course teaches
reflection loops, self-critique, or bounded termination as a named topic. This
one does, taught on a rotating example domain so the pattern transfers and you
leave with a durable mental model you can redeploy without the notes.

> **Status:** 🟡 In progress. **Modules 0–1 shipped** (setup + bounded
> termination). Modules 2–6 are outlined below and land over the following weeks.

---

## Who this is for

You can build a LangGraph graph and call a chat model. You have *not* yet built
an agent that judges its own output, revises it, and knows when to stop. By the
end you will have done that — and know exactly why each piece is shaped the way
it is.

## The mental model, one line per module

| Module | Installs the belief |
|---|---|
| **0 · Reflection-loop primitive + setup** | "Reflection is a graph, not a prompt." |
| **1 · Bounded termination** | "The cap lives in code; counting is the graph's job." |
| **2 · Critique design** | "Writing checks an LLM can actually score is a craft." |
| **3 · Tracing reflection loops in LangSmith** | "Tracing makes bugs legible, not rarer." |
| **4 · Eval-driven reflection** | "The runtime rubric is also the offline test." |
| **5 · Production: keeping the loop honest** | "Reflection is a budget allocation, not a magic wand." |

Each module opens with *the model you are about to install* and closes with
*what you should now believe*. The final module refers back to the first.

## The rotating domain (why the pattern transfers)

A single thread-domain — **customer support-ticket replies** — runs across
Modules 0–4, so you watch the same loop accrue termination, a real rubric,
tracing, and evals without the domain changing under you. The **capstone**
(Module 6) switches to a brand-new domain — **rewriting dense legal clauses into
plain language** — so transfer is forced: if the patterns only worked on support
replies, the capstone exposes it.

Per-lesson `Try it` exercises rotate to still other domains (commit messages,
release notes, meeting summaries) at your discretion.

## Dual-track: TypeScript artifact, Python Rosetta stone

The runnable artifact is **TypeScript** (this repo), so every lesson points at a
real file you can open and a real loop you can run. **Python learners are
first-class**: Module 0 ships a Python setup track and a TypeScript ↔ Python
**translation table** — LangGraph models the same state-graph mental model in
both languages. You do not maintain a second codebase; you read the table and
map as you go. **No Docker and no LangGraph server are required** for any lesson.

## How the code is checkpointed

The runnable loop lives in [`examples/support-reply-loop/`](../../examples/support-reply-loop/).
Run it offline (no API key):

```bash
npx tsx examples/support-reply-loop/run.ts     # watch the loop converge
npm run test -- tests/course/module-0-loop.test.ts   # the success signal
```

Each lesson is pinned to a git tag (`course/lesson-NN`) so you can
`git checkout course/lesson-06` and run exactly the state of the repo that lesson
describes. Module checkpoints are tagged `course/module-N`.

## Course layout

```
docs/course/
  README.md                 ← you are here
  bibliography.md           ← the course-wide APA-7 reading list
  production/               ← course-wide video conventions
  module-0-setup/           ← lessons, lab, quiz, feedback, and per-module video/ scripts
  module-N-<slug>/          ← one directory per module (same shape)
```

## Reading list

This course is built on primary literature, not only vendor docs. The full
APA-7 bibliography is in [`bibliography.md`](./bibliography.md); the spine is
Self-Refine (Madaan et al., 2023), Reflexion (Shinn et al., 2023), G-Eval (Liu
et al., 2023), and MT-Bench (Zheng et al., 2023). Every lesson ends with its own
`## References`.

## Attribution

Repository scaffolding patterns are derived from
[`langchain-ai/new-langgraph-project`](https://github.com/langchain-ai/new-langgraph-project)
(MIT) and the LangSmith integration patterns from
[`langchain-ai/intro-to-langsmith`](https://github.com/langchain-ai/intro-to-langsmith)
(MIT). The reflection-loop curriculum, the rotating-domain pedagogy, and all
prose are original.
