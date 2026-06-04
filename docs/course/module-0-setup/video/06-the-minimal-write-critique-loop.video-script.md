# Video script · Module 0 · Lesson 6 · The minimal write → critique loop with a stub critic

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 0 · Lesson 6 · The minimal write → critique loop with a stub critic
- **Duration:** ~6 min
- **Objective:** the viewer can read the whole loop in `graph.ts`, explain why the
  cap lives in the router, and run the test that proves convergence + termination.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-06`.

## Block 2 — Pre-production

- `git checkout course/lesson-06`; clean tree.
- `examples/support-reply-loop/graph.ts`, `run.ts`, and
  `tests/course/module-0-loop.test.ts` open in tabs.
- Editor ≥ 18 pt, terminal ≥ 16 pt, notifications OFF.
- Dependencies installed (`npm install` already done).

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Now we build the thing. By the end of this lesson the three checks from last time
> are a running graph: a write node, a critique node, a cyclic edge, and a cap. The
> critic is a deterministic stub, no LLM yet, because Module 0 is about the shape of
> the loop, and a stub lets the whole thing run offline with a real success signal.

**[Beat 2 · editor: state annotation · 0:35]**
> Start with state, the object that flows through the loop. The ticket, the current
> draft, the latest critique, a revision counter, and a history. Most channels are
> last-write-wins. The one exception is history, with a concat reducer that appends
> every draft instead of overwriting, so a finished run is fully auditable. Module 3
> builds on exactly that.

**[Beat 3 · editor: ReplyWriter type · 1:25]**
> Notice the graph does not hard-code how a draft is written. The writer is
> injected. In Module 0 it is a canned weak-to-strong function, so everything runs
> with no API key. The same graph runs with a real chat model by passing a
> model-backed writer. The loop does not care.

**[Beat 4 · editor: scoreReply · 2:00]**
> Here is the heart of the lesson, the stub critic. It judges the draft against the
> three checks from last time and returns pass or fail plus evidence per check. Two
> properties make it useful, and they are the same two an LLM critic needs. First,
> every check is concretely verifiable: names the customer's issue, you can confirm
> by reading; is empathetic, you cannot. Second, it produces evidence per check,
> which forces it to ground each verdict instead of rubber-stamping. [cite: Liu et al., 2023]

**[Beat 5 · editor: scoreReply regex · 2:55]**
> And a real stub is honest about being a stub. These are regex checks. They are
> brittle on purpose, so you feel exactly where a deterministic critic ends and an
> LLM-scored rubric must begin. That is Module 2.

**[Beat 6 · editor: routeAfterCritique · 3:20]**
> Close the loop with a conditional edge. After critique: if it passed, stop. If we
> hit max revisions, stop. Otherwise, write again. And when we write again, the
> write node reads the critique, so it revises with the feedback in scope rather
> than starting over. [cite: Shinn et al., 2023]

**[Beat 7 · editor: highlight the cap line · 4:00]**
> Look at this one line. If revision number is at or above max revisions, return
> end. That single line, in code, never in a prompt, is the entire reason this
> cyclic graph is guaranteed to terminate. Module 1 is nothing but a careful study
> of this line and its alternatives.

**[Beat 8 · terminal: run + test · 4:35]**
> Run it. Revision one fails all three checks. Revision two names the jar, promises
> a replacement, signs off, and the critic flips to passed. Now the hard signal:
> the test asserts both halves, that a weak-then-strong writer converges, and that
> a never-improving writer still terminates at the cap. Four passing tests.

**[Beat 9 · talking-head · 5:25]**
> Look back at Lesson 1's promise: reflection is a graph, not a prompt. You just
> built it. Generation and judgment are separate nodes, revision is a cyclic edge,
> and when-to-stop is a counter in the routing function. Every remaining module
> bolts onto this graph. You hold the primitive now. The rest is making it reliable.
> Do the lab, take the quiz, and I will see you in Module 1.

## Block 4 — Post-production

- Lower-third citations on Beats 4 and 6.
- Beat 7: full-screen zoom + highlight box on the `if (state.revisionNumber >=
  MAX_REVISIONS) return END;` line.
- Beat 8: zoom on "PASSED" and on "Tests 4 passed (4)".
- Chapter markers at Beats 2, 4, 6, 8, 9.
- Export 1080p/30, H.264, ~ −16 LUFS.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `graph.ts`, scroll to `SupportReplyStateAnnotation`; cursor-highlight
  the `history` reducer.
- **Beat 3:** scroll to the `ReplyWriter` type and `buildSupportReplyLoop(write)`
  signature; highlight `write` as the injected argument.
- **Beat 4:** scroll to `scoreReply`; highlight the three `checks` entries and the
  `evidence` fields.
- **Beat 5:** highlight the regex in `gives_a_concrete_next_step`.
- **Beat 6:** scroll to `routeAfterCritique`; step through the three branches.
- **Beat 7:** isolate and zoom the `MAX_REVISIONS` line.
- **Beat 8:** terminal — `npx tsx examples/support-reply-loop/run.ts` (show Revision
  1 → Revision 2 → PASSED), then `npm run test -- tests/course/module-0-loop.test.ts`
  (show "4 passed").

## Bonus footage — Optional: swap in a real chat model (Claude)

> Optional step. The code path ships commented out in `examples/support-reply-loop/run.ts`
> tagged "OPTIONAL (Lesson 06 · Bonus footage …)". Record as a separate ~90s clip.
> Requires an Anthropic API key (set off-camera).

**Pre-production:** `ANTHROPIC_API_KEY` exported in the shell; `run.ts` open at the
commented `llmWriter` block.

**VO (verbatim):**
> Optional, and it costs a few tokens. The loop runs with a real model by swapping
> the canned writer for a model-backed one. Uncomment the `llmWriter` in `run.ts`.
> It builds a revise-or-write instruction from the ticket and the critique, calls
> Claude, and returns the draft. Pass it to `buildSupportReplyLoop` instead of the
> canned writer. Now the writer is real, but notice the graph, the critic, and the
> cap are unchanged. That is the whole point of injecting the writer.

**Shot list:** uncomment the `import { ChatAnthropic }` and `llmWriter` block;
change `buildSupportReplyLoop(cannedWriter)` to `buildSupportReplyLoop(llmWriter)`;
run `npx tsx examples/support-reply-loop/run.ts`; show a model-written revision
flipping the critic to PASSED. Re-comment afterward so `main` stays offline.
Emphasize on screen: "Same graph. Same critic. Same cap."
