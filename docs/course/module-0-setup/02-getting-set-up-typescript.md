# Module 0 · Lesson 2 · Getting set up (TypeScript)

> **Tag:** `course/lesson-02` · **Module 0: Reflection-loop primitive + setup** · ~4 min

## The model you are about to install

The runnable artifact for this course is **TypeScript**, so every lesson can point
at a real file you open and a real loop you run. By the end of this lesson the
reflection loop runs on your machine — with **no API key, no Docker, and no
LangGraph server.**

## Prerequisites

- **Node 20+** (`node --version`).
- This repository, cloned.
- That is all. The first runnable lesson uses a deterministic *stub* critic and a
  canned writer, so nothing here calls a model or the network. You add a real
  chat model later (Lesson 6's bonus footage, then Module 2).

> **No Docker.** Some LangGraph tutorials reach for `langgraph up`, which builds a
> Docker image. This course never does. The loop is plain `@langchain/langgraph`
> run with `npx tsx` and exercised with `npm run test`. If you have wrestled with
> Docker Desktop on an older macOS, you can ignore it entirely here.

## Install and run

```bash
npm install
# watch the loop converge (offline, no key):
npx tsx examples/support-reply-loop/run.ts
# the success signal:
npm run test -- tests/course/module-0-loop.test.ts
```

The demo prints two revisions of a support reply and a final critique that has
flipped to `PASSED`. The test asserts the same thing deterministically — that is
the verifiable success signal you will rebuild yourself in this module's lab.

## What you are looking at

The loop lives in [`examples/support-reply-loop/`](../../../examples/support-reply-loop/):

- `graph.ts` — the `StateGraph`: a `write_reply` node, a `critique_reply` node, a
  conditional edge, and the `MAX_REVISIONS` cap. This is the whole pattern.
- `run.ts` — an offline entrypoint with a canned writer.

You will read `graph.ts` line by line in Lesson 6. For now, confirm it runs.

## Checkpoints by git tag

Each lesson is pinned to a tag so you can jump to the exact state it describes:

```bash
git tag --list 'course/*'
git checkout course/lesson-06   # the state of the repo at Lesson 6
git switch -                    # back to your branch
```

## Optional: a LangSmith key (not needed until Module 3)

Tracing enters in Module 3. If you want to set it up now, copy `.env.example` to
`.env.local` and add `LANGSMITH_API_KEY`. The loop runs fine without it — the app
is built to **fail soft** when the key is absent, a property Module 3 relies on.
*This step is optional — see this lesson's Bonus footage for the walkthrough.*

## What you should now believe

The course is real code you can run today, and the barrier to entry is Node and a
clone — not an API budget or a container runtime. Setup friction is where courses
lose people; this one has almost none.

## Try it

Run the test, then deliberately break it: open `examples/support-reply-loop/run.ts`
and make the revised draft as weak as the first. Re-run the demo and read which of
the three checks now fails. Put it back. You just used the success signal to catch
a regression — the entire premise of Module 4, two modules early.

## References

LangChain. (n.d.-a). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

LangChain. (n.d.-b). *LangSmith documentation*. https://docs.smith.langchain.com/
