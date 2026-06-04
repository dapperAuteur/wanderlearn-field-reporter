# Module 0 · Lesson 4 · Python ↔ TypeScript translation table

> **Tag:** `course/lesson-04` · **Module 0: Reflection-loop primitive + setup** · ~3 min

## The model you are about to install

One table to keep open for the whole course. Every LangGraph concept you meet in
the TypeScript artifact has a one-to-one Python equivalent. Reflection loops are
*structurally* identical across the two languages; only the spelling changes. Once
you have internalized this table, a Python learner can take every TypeScript
lesson and a TypeScript learner can read the Python docs without friction.

## The table

| Concept | TypeScript (this course) | Python (LangGraph) |
|---|---|---|
| Graph builder | `new StateGraph(SupportReplyStateAnnotation)` | `StateGraph(SupportReplyState)` |
| State definition | `Annotation.Root({ … })` | `TypedDict` + `Annotated[…]` |
| A plain channel | `Annotation<string>` | a `TypedDict` field |
| Channel + reducer | `Annotation<T>({ reducer, default })` | `Annotated[T, reducer]` |
| Add a node | `.addNode("write_reply", fn)` | `.add_node("write_reply", fn)` |
| Plain edge | `.addEdge(START, "write_reply")` | `.add_edge(START, "write_reply")` |
| Conditional edge | `.addConditionalEdges(src, router, [..targets])` | `.add_conditional_edges(src, router, [..targets])` |
| Start / end sentinels | `START`, `END` | `START`, `END` |
| Compile | `.compile()` | `.compile()` |
| Run | `await graph.invoke(state)` | `graph.invoke(state)` / `await graph.ainvoke(state)` |
| Structured output (later) | `model.withStructuredOutput(Schema)` | `model.with_structured_output(Schema)` |
| Schema library (later) | **Zod** | **Pydantic** |
| Chat model (later) | `new ChatAnthropic({ model })` | `ChatAnthropic(model=…)` |
| Tracing (Module 3) | `LANGSMITH_API_KEY` env | `LANGSMITH_API_KEY` env |
| Evaluation (Module 4) | `evaluate(target, { data, evaluators })` | `evaluate(target, data=…, evaluators=…)` / `aevaluate(…)` |

## The two real divergences

Almost everything maps one-to-one. The two places the languages genuinely differ:

1. **Schema library.** TypeScript uses Zod; Python uses Pydantic. Both compile to
   JSON Schema, which is what `withStructuredOutput` / `with_structured_output`
   actually sends the model — so the model sees the same contract either way. This
   matters in Module 2, where the rubric becomes a typed schema.
2. **Async surface.** Python exposes both sync (`invoke`) and async (`ainvoke`,
   `aevaluate`) entrypoints; TypeScript is async throughout (`await graph.invoke`).

## What you should now believe

The reflection-loop pattern is language-independent. When a later lesson shows you
TypeScript, you can mechanically translate it to Python with this table — the
*graph* is the idea, and the idea is the same in both.

## Try it

Take the TypeScript router you saw in Lesson 3 and hand-translate it to Python
using only this table. Then check it against the Python sketch in Lesson 3. If
your translation matches, you have proven to yourself that the table is complete
for the loop primitive.

## References

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/
