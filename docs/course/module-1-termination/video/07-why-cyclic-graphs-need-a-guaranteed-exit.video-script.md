# Video script · Module 1 · Lesson 7 · Why cyclic graphs need a guaranteed exit

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 1 · Lesson 7 · Why cyclic graphs need a guaranteed exit
- **Duration:** ~4 min
- **Objective:** the viewer can name the three ways a reflection loop fails to
  terminate and explain why "the model will converge" is not termination.
- **Segments:** talking-head open, slides, brief editor peek at `buildUncappedReplyLoop`.
- **Tag:** `course/lesson-07`.

## Block 2 — Pre-production

- `git checkout course/lesson-07`; clean tree.
- Slide deck: the three non-termination failure modes; the "price tag" slide; the
  four-patterns roadmap.
- `examples/support-reply-loop/termination.ts` open, scrolled to `buildUncappedReplyLoop`.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Module 1's belief, up front: the cap lives in code, and counting is the graph's
> job. A reflection loop is a cycle. Write can route back to write forever. A cycle
> with no guaranteed exit is not a feature. It is an outage waiting for the wrong
> input.

**[Beat 2 · slide: three failure modes · 0:30]**
> Take the counter out of Module 0's loop and nothing decides when to stop. Three
> real ways it never terminates on its own. One, an impossible rubric the writer
> can never satisfy. Two, a stalled writer that emits the same draft every pass.
> Three, critic drift, where a nondeterministic judge flip-flops pass, fail, pass,
> fail on the same draft.

**[Beat 3 · slide: the price tag · 1:25]**
> And it does not crash politely. Every iteration is an LLM call, so a loop that
> should take three passes and instead runs two hundred costs two hundred passes of
> latency and tokens, per stuck request, across every user who hits that input. The
> first time most teams learn their loop was unbounded is a billing alert.

**[Beat 4 · slide: guaranteed exit · 2:10]**
> What does a guaranteed exit require? Some measure that strictly moves toward a
> bound every pass, and a stop at the bound. Your revision counter does exactly
> that: it increases by one each pass and the router exits at max revisions. Halts
> in at most that many steps, no matter what the model does.

**[Beat 5 · editor: buildUncappedReplyLoop · 2:45]**
> Here is the loop with the counter deliberately removed. Pass or revise, nothing
> else. Hold the question: what happens when the writer never passes? We answer it
> in Lesson 12 with the recursion-limit backstop.

**[Beat 6 · talking-head · 3:20]**
> So: a cyclic graph without a guaranteed, code-level exit is a bug, not a loop. The
> model will probably converge is not termination. It is hope. Next, the four ways
> to stop, starting with the counter.

## Block 4 — Post-production

- Lower-third on Beat 3 (cost framing).
- Animate the four-patterns roadmap on Beat 4 → carry as a recurring motif.
- Chapter markers at Beats 2, 3, 4, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** three-failure-mode slide; reveal each row as spoken.
- **Beat 3:** "price tag" slide; animate a counter spinning 3 → 200.
- **Beat 4:** guaranteed-exit slide; highlight `revisionNumber++` and `>= MAX`.
- **Beat 5:** editor — `termination.ts`, scroll to `buildUncappedReplyLoop`;
  cursor-highlight that it has no counter and no convergence check.

(No optional steps in this lesson — no bonus footage.)
