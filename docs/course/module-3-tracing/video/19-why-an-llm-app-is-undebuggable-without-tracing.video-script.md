# Video script · Module 3 · Lesson 19 · Why an LLM app is undebuggable without tracing

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 3 · Lesson 19 · Why an LLM app is undebuggable without tracing
- **Duration:** ~4 min
- **Objective:** the viewer can explain why a loop's output collapses four failures into
  one string and why normal debugging tools fail on a cyclic, fail-soft, nondeterministic system.
- **Segments:** talking-head open, slides, talking-head close.
- **Tag:** `course/lesson-19`.

## Block 2 — Pre-production

- Slides: "one outcome, four causes"; the four broken debugging tools; "log vs trace tree".
- Talking-head framing.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Module 3's belief: tracing makes bugs legible, not rarer. A loop does not get fewer
> bugs because you trace it. It gets debuggable ones. This lesson is why you cannot debug
> from the output.

**[Beat 2 · slide: one outcome, four causes · 0:25]**
> A wrong answer and a right answer are both just strings. When your loop escalates a
> ticket, the state says outcome escalated, and that is all it says. Did it try three good
> revisions and run out of budget? Did the writer stall? Did the critic flip-flop? Did the
> judge silently error on every call? All four produce the same one word. From the output,
> indistinguishable. You cannot fix a bug you cannot tell apart from three others.

**[Beat 3 · slide: four broken tools · 1:30]**
> And your normal tools do not survive. A stack trace points at the line that threw, but
> the worst LLM bugs do not throw, a fail-soft node swallows the error. A debugger assumes
> deterministic re-execution, an LLM call is not. Console-log drowns you, a cycle logs the
> same node five times and concurrent runs interleave. And unit assertions on the output
> pass while the system is quietly broken, because the output shape is right.

**[Beat 4 · slide: log vs trace · 2:45]**
> A trace is a structured record of every step a run took, as a tree. The graph at the
> root, each node a child span, each LLM call a span under that, carrying inputs, outputs,
> timing, tokens, and any error. A log is a flat stream you grep. A trace is a tree you
> read. The cycle becomes a visible shape instead of repeated lines. [cite: LangChain, n.d.]

**[Beat 5 · talking-head · 3:30]**
> So stop asking what did it output, and start asking what did it do. The trace is the only
> artifact that answers the second question. The rest of this module is learning to read it.

## Block 4 — Post-production

- Beat 2: animate four arrows collapsing into one "escalated" token.
- Beat 3: four-quadrant slide, red-X each tool.
- Beat 4: side-by-side flat log vs nested trace tree; lower-third citation.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** "one outcome, four causes" slide.
- **Beat 3:** four-broken-tools slide.
- **Beat 4:** log-vs-trace slide; the trace side animates into a tree.

(No optional steps in this lesson — no bonus footage.)
