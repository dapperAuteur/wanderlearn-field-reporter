# Module 0 · Lesson 3 · Getting set up (Python)

> **Tag:** `course/lesson-03` · **Module 0: Reflection-loop primitive + setup** · ~3 min

## The model you are about to install

LangChain Academy is usually taught in Python, and **Python learners are
first-class here.** This course's runnable artifact is TypeScript — one codebase,
so every lesson cites a real file — but LangGraph ships the *same* mental model in
both languages. This lesson is the bridge: a Python environment if you want one,
and (in Lesson 4) a translation table you can keep open as you go. There is no
second Python codebase to maintain, and **no Docker either way.**

## If you want a Python environment alongside

You do not need Python to take this course. But if you want to follow the
LangGraph Python docs in parallel, or prototype a node in Python first:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -U langgraph langchain-anthropic langsmith pydantic
```

That is the entire Python setup. No container, no server: a virtualenv and four
packages. Treat it as a Rosetta stone, not a fork — the loop you run, test, and
extend is the TypeScript one.

> **About `langgraph dev`.** The Python `langgraph-cli` ships an in-memory dev
> server (`pip install -U "langgraph-cli[inmem]"`, then `langgraph dev`) that
> opens LangGraph Studio in the browser — **no Docker required.** It is a lovely
> way to *visualize* a graph, and you are welcome to point it at a Python port of
> the loop. This course does not depend on it; Docker only enters with
> `langgraph up` (self-hosted deploy), which is out of scope.

## The same loop, sketched in Python

The graph you will read in Lesson 6 looks almost identical in Python — same nodes,
same conditional edge, same cap:

```python
from langgraph.graph import StateGraph, START, END

def write_reply(state): ...
def critique_reply(state): ...

def route_after_critique(state):
    if state["critique"]["passed"]:
        return END
    if state["revision_number"] >= MAX_REVISIONS:
        return END
    return "write_reply"

graph = (
    StateGraph(SupportReplyState)
    .add_node("write_reply", write_reply)
    .add_node("critique_reply", critique_reply)
    .add_edge(START, "write_reply")
    .add_edge("write_reply", "critique_reply")
    .add_conditional_edges("critique_reply", route_after_critique,
                           ["write_reply", END])
    .compile()
)
```

The shapes match because LangGraph models the same thing in both languages: a
typed state graph with reducers that merge writes and conditional edges that route
(LangChain, n.d.).

## What you should now believe

You are not locked out by language. The reflection-loop *pattern* is
language-independent; the two tracks differ only in surface syntax (Zod vs.
Pydantic, `addNode` vs. `add_node`), which Lesson 4 lays out side by side.

## Try it

Skim the LangGraph Python quickstart and find its `add_conditional_edges` call.
Note that the third argument — the list of reachable nodes — is the same idea you
just saw in TypeScript. Same graph, different spelling.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/

LangChain. (n.d.). *LangGraph CLI*. https://docs.langchain.com/langsmith/cli
