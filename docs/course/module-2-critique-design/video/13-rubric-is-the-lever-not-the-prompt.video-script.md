# Video script · Module 2 · Lesson 13 · The rubric is the lever, not the prompt

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 2 · Lesson 13 · The rubric is the lever, not the prompt
- **Duration:** ~5 min
- **Objective:** the viewer can explain why the rubric (as data) is a loop's highest-
  leverage control surface and how the injected judge scores it.
- **Segments:** talking-head open, screencast (editor), talking-head close.
- **Tag:** `course/lesson-13`.

## Block 2 — Pre-production

- `git checkout course/lesson-13`; clean tree; deps installed.
- `examples/support-reply-loop/rubric.ts` open at `supportReplyRubric`, `RubricJudge`.
- `src/agent/rubric.ts` open for the cross-reference.
- Slide: "structure keeps it safe / rubric makes it good".

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Module 2's belief: writing checks an LLM can actually score is a craft. And the
> rubric, not the prompt, is the lever that controls a reflection loop's quality.

**[Beat 2 · slide · 0:20]**
> We have spent two modules on the loop's structure: the cycle, the router,
> termination. None of it improves a single draft. The draft improves because the
> critic tells the writer, specifically and correctly, what is wrong. So the
> highest-leverage thing you can edit is not the graph and not the generation
> prompt. It is the rubric the critic scores against.

**[Beat 3 · editor: supportReplyRubric · 1:10]**
> Here is the rubric as data. A plain array, each entry one check, each with a
> weight. Three things matter. It is data, separate from the node, so to change what
> good means you edit the data, never the code, exactly how this repo's field-reporter
> agent keeps its rubric in src slash agent slash rubric dot ts. Each entry is one
> check, not is it clear and complete and friendly. And each has a weight: blocking,
> or a nudge.

**[Beat 4 · editor: RubricJudge · 2:20]**
> The judge is injected, a function that scores one criterion against the draft. In
> production it is model dot with-structured-output. In the tests it is a
> deterministic fake, so the loop runs offline. Either way the node walks the rubric,
> asks the judge per criterion, and combines the verdicts in code. The LLM judges. It
> does not decide policy.

**[Beat 5 · slide: anti-pattern · 3:15]**
> The anti-pattern: the rubric in the prompt. Embedding the standard as prose, make
> sure it's clear, complete, and friendly. It cannot be versioned, weighted, linted,
> or reused as an eval, which Module 4 needs. And because it is prose, the model
> scores it inconsistently run to run. Promote the rubric to data and the LLM's job
> shrinks to one verifiable judgment at a time.

**[Beat 6 · talking-head · 4:10]**
> The rubric is the control surface of a reflection loop. Keep it as data, a list of
> single weighted checks, and the loop becomes tunable, testable, and reusable. Next
> three lessons: the three ways a criterion goes wrong, and how to fix each.

## Block 4 — Post-production

- Beat 3: highlight each rubric entry; callout "data, not in the node".
- Beat 4: highlight the injected `judge` argument.
- Beat 5: anti-pattern card.
- Chapter markers at Beats 2, 3, 4, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `rubric.ts` — `supportReplyRubric`; cursor down each entry; briefly
  open `src/agent/rubric.ts` to show the same data-not-code pattern in production.
- **Beat 4:** `rubric.ts` — `RubricJudge` type and the `judge(...)` call inside
  `scoreAgainstRubric`.
- **Beat 5:** anti-pattern slide.

## Bonus footage — Optional: a real LLM judge with `withStructuredOutput`

> Optional step (the production judge). Requires an API key (set off-camera). Record ~80s.

**Pre-production:** `ANTHROPIC_API_KEY` exported; a scratch `llmJudge` using
`new ChatAnthropic(...).withStructuredOutput(CriterionVerdictSchema)`.

**VO (verbatim):**
> Optional, and it costs a few tokens. Swap the fake judge for a real one: take a
> chat model, call with-structured-output passing the criterion-verdict schema, and
> prompt it to score one criterion with evidence and a suggestion. Pass it to
> build-rubric-reply-loop instead of the fake. Notice the schema does double duty:
> it shapes the model's output and rejects a verdict missing evidence. Same loop,
> same rubric, a real judge now.

**Shot list:** write `llmJudge` calling `model.withStructuredOutput(CriterionVerdictSchema)`
with a per-criterion prompt; pass to `buildRubricReplyLoop`; run a scratch script;
show real verdicts with evidence + suggestion; the loop converges. Keep `main` on the
fake judge for offline tests.
