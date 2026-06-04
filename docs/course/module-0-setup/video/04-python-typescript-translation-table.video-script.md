# Video script · Module 0 · Lesson 4 · Python ↔ TypeScript translation table

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 0 · Lesson 4 · Python ↔ TypeScript translation table
- **Duration:** ~3 min
- **Objective:** the viewer can mechanically translate the loop primitive between
  TypeScript and Python and name the two real divergences.
- **Segments:** screencast over the translation-table slide; talking-head outro.
- **Tag:** `course/lesson-04`.

## Block 2 — Pre-production

- Slide: the full translation table from the lesson (rendered large, legible).
- Slide: a "two divergences" card (Zod vs Pydantic; sync vs async).
- No terminal required.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> One table to keep open for the whole course. Every LangGraph concept in the
> TypeScript artifact has a one-to-one Python equivalent. Reflection loops are
> structurally identical across the two languages; only the spelling changes.

**[Beat 2 · slide: table top half · 0:20]**
> The graph builder, the state definition, adding nodes, plain edges, conditional
> edges, start and end sentinels, compile, invoke. Read down the table: `addNode`
> becomes `add_node`, `addConditionalEdges` becomes `add_conditional_edges`, and
> the start and end sentinels are spelled the same in both.

**[Beat 3 · slide: table bottom half · 1:10]**
> Further down are the things you meet in later modules: structured output, the
> schema library, the chat model, tracing, evaluation. Same idea, both languages.

**[Beat 4 · slide: two divergences · 1:40]**
> Almost everything maps one-to-one. Two places genuinely differ. One, the schema
> library: TypeScript uses Zod, Python uses Pydantic, but both compile to JSON
> Schema, which is what the model actually receives, so the contract is the same.
> Two, the async surface: Python offers sync and async entrypoints, TypeScript is
> async throughout.

**[Beat 5 · talking-head · 2:25]**
> That is it. When a later lesson shows you TypeScript, you can translate it to
> Python with this table alone, because the graph is the idea, and the idea is the
> same. Next module, we make the loop's termination bulletproof.

## Block 4 — Post-production

- Progressive row highlight as each concept is named (Beats 2, 3).
- Pin the "two divergences" card on screen through Beat 4.
- Chapter markers at Beats 2, 4.
- Export 1080p/30, H.264, ~ −16 LUFS.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** table slide, top rows; highlight `addNode`↔`add_node` and the two
  conditional-edge rows.
- **Beat 3:** scroll/transition to the lower rows (structured output → evaluation).
- **Beat 4:** "two divergences" card; underline "both compile to JSON Schema."

(No optional steps in this lesson — no bonus footage.)
