# Video script · Module 6 · Lesson 40 · Composing the capstone graph

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 6 · Lesson 40 · Composing the capstone graph
- **Duration:** ~5 min
- **Objective:** the viewer sees how little new graph code a new domain needs — the state and router are
  reused, only two thin nodes and the rubric argument are new.
- **Segments:** screencast (editor), talking-head close.
- **Tag:** `course/lesson-40`.

## Block 2 — Pre-production

- `git checkout course/lesson-40`; deps installed.
- `index.ts` open at `buildPlainLanguageLoop`.
- Slide: reused (state, router, scorer) vs new (two nodes, rubric arg).

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> With the rubric written, the graph almost builds itself, because the graph is reused, not rewritten.
> Let's compose the capstone loop from parts you already have.

**[Beat 2 · editor: buildPlainLanguageLoop · 0:30]**
> Here is the whole capstone graph. Look at what is reused verbatim: the terminating-reply state from
> Module 1, with its history and escalation channels. Route-with-all-patterns, Module 1's success,
> convergence, cap, revise priority router. And score-against-rubric, Module 2's scorer. The termination
> guarantees, the convergence detection, the escalation terminal, all of it carries over for free.

**[Beat 3 · editor: what's new · 1:40]**
> What is new? Two node bodies, write-rewrite and critique-rewrite, and they are thin. They call the
> injected writer and the reused scorer, and critique-rewrite passes plain-language-rubric instead of the
> support rubric. That single argument is the entire domain-specific change in the graph.

**[Beat 4 · slide: why the router needs no changes · 2:45]**
> Why does the router need zero changes? Because Module 1 built it as a generic function. It reads only
> critique-dot-passed, the revision number, and the draft history, none of which is domain-specific. So the
> capstone inherits the hard cap, convergence detection, and the escalation terminal with no new code. A
> domain-coupled router would have forced you to re-derive all three. A generic one just works.

**[Beat 5 · talking-head · 3:45]**
> And the writer is still injected, as in every module. The offline stand-in produces a short direct
> rewrite. A real run injects a chat-model writer prompted to rewrite legalese. The graph does not change
> either way. Composing the capstone graph is mostly naming what you reuse. A new domain costs you a rubric
> and a dataset, not a new graph. That is the strongest evidence the pattern is durable.

## Block 4 — Post-production

- Beat 2: highlight the reused `TerminatingReplyStateAnnotation`, `routeWithAllPatterns`, `scoreAgainstRubric`.
- Beat 3: highlight the `plainLanguageRubric` argument as the only domain change.
- Beat 4: reused-vs-new slide.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `index.ts` `buildPlainLanguageLoop`; highlight the three reused imports in use.
- **Beat 3:** highlight the two node bodies + the rubric argument.
- **Beat 4:** reused-vs-new slide.

## Bonus footage — Optional: inject a real chat-model rewriter

> Optional. Requires an API key. Record ~75s.

**Pre-production:** `ANTHROPIC_API_KEY` set; a scratch `llmRewriter` using `ChatAnthropic`.

**VO (verbatim):**
> Optional, and it costs a few tokens. Swap the offline rewriter for a real one: a chat model prompted to
> rewrite this legal clause into plain language, addressing the reader as you, keeping the obligation. Pass
> it to build-plain-language-loop instead of the stand-in. Notice the graph, the router, the rubric, and
> the cap are unchanged. Only the injected writer is real now. Same engine, real model, new domain.

**Shot list:** write `llmRewriter` calling `model.invoke` with a plain-language prompt; pass to
`buildPlainLanguageLoop`; run a scratch script on the recovery clause; show a model-written plain rewrite
that passes the rubric. Re-comment to keep tests offline.
