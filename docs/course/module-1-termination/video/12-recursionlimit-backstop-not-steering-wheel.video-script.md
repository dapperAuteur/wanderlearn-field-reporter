# Video script · Module 1 · Lesson 12 · `recursionLimit` — the backstop, not the steering wheel

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 1 · Lesson 12 · `recursionLimit` — the backstop, not the steering wheel
- **Duration:** ~5 min
- **Objective:** the viewer can distinguish a framework backstop from a control and
  set `recursionLimit` correctly.
- **Segments:** screencast (editor + terminal), talking-head close (module wrap).
- **Tag:** `course/lesson-12`.

## Block 2 — Pre-production

- `git checkout course/lesson-12`; clean tree; deps installed.
- `termination.ts` open at `buildUncappedReplyLoop`; test file open at the last test.
- Slide: the backstop-vs-steering comparison table.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> LangGraph has its own built-in stop: recursion-limit, a cap on how many steps a
> graph may take before it throws. Real, and useful, as a backstop. This lesson
> draws the line between a backstop and a control.

**[Beat 2 · editor: recursionLimit option · 0:25]**
> Every invocation runs at most recursion-limit super-steps; exceed it and the graph
> throws a graph-recursion-error instead of looping forever. You set it per call;
> the default is twenty-five. It is a framework guarantee that no graph, yours or one
> you imported, can hang the process indefinitely.

**[Beat 3 · terminal: the throw · 1:05]**
> Drive the uncapped loop, counter and convergence removed, with a writer that never
> passes. The final test asserts the invocation throws on recursion-limit. That
> throw is the whole demonstration.

**[Beat 4 · slide: comparison table · 1:45]**
> Compare the two ways the loop can end. Your patterns end in a clean terminal state,
> resolved or escalated, that carries an outcome, lets you escalate gracefully, and
> is tunable per reason. Recursion-limit ends in an exception, carries no outcome,
> kills the run, and is one blunt number. A graph-recursion-error in production is
> not the system working as designed. It is the system telling you the design was
> missing.

**[Beat 5 · talking-head · 2:45]**
> The patterns are the steering wheel: they decide where the loop goes and end it on
> purpose. Recursion-limit is the seatbelt: it does nothing in a well-driven run and
> saves you from a crash in a catastrophic one. You want both. You rely on the wheel.

**[Beat 6 · slide: anti-pattern · 3:15]**
> The anti-pattern: steering with the seatbelt. Relying on recursion-limit, often
> tuned down small, as the primary termination, with no counter or convergence. The
> loop stops, so it looks bounded, but it stops by throwing, with no outcome and no
> escalation. Set recursion-limit generously, above your own worst case, and bound
> the loop yourself in the router.

**[Beat 7 · talking-head · 3:55]**
> Module close. Look back at Lesson 7: the cap lives in code, counting is the graph's
> job. You now have four ways to stop, composed in priority order, every one a
> deliberate decision the graph makes, plus a generous backstop you never steer with.
> The loop is reliable. But all of it rests on trusting the critic's passed verdict.
> So the next question is unavoidable: is the critic any good? That is Module 2.

## Block 4 — Post-production

- Beat 2: highlight `{ recursionLimit: 25 }`.
- Beat 3: zoom the `rejects.toThrow()` assertion and the thrown error in output.
- Beat 4: build the comparison table row-by-row.
- Beat 6: anti-pattern card.
- Chapter markers at Beats 2, 3, 4, 6, 7.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `termination.ts` / a call site showing `invoke(state, { recursionLimit })`.
- **Beat 3:** terminal — `npm run test -- tests/course/module-1-termination.test.ts`;
  point at the "Pattern 4: recursionLimit" describe block; show it passing because
  the invoke threw.
- **Beat 4:** comparison-table slide.
- **Beat 6:** anti-pattern card.

## Bonus footage — Optional: watch the backstop fire on the bounded loop

> Optional step from the lesson's Try it. Record as a separate ~60s clip.

**Pre-production:** a scratch call invoking `buildBoundedReplyLoop` with a failing
writer and `{ recursionLimit: 2 }`.

**VO (verbatim):**
> Optional. Take the fully bounded loop, the one with all your patterns, and invoke
> it with an absurdly low recursion-limit of two. Your patterns still try to do their
> job, but the backstop now fires first, and notice how much worse the failure is, an
> exception instead of a clean escalation. This is exactly why you set the backstop
> high: so your patterns, not the seatbelt, end the loop.

**Shot list:** scratch file invoking `buildBoundedReplyLoop(failingWriter)` with
`{ recursionLimit: 2 }`; run it; show the thrown `GraphRecursionError`; then raise
`recursionLimit` to 25 and show the clean `escalated` outcome instead.
