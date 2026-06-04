# Video script · Module 0 · Lesson 1 · Course overview

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.
> No em-dashes in on-screen text. `[cite: …]` = on-screen citation matching the
> lesson's `## References`.

## Block 1 — Header

- **Lesson:** Module 0 · Lesson 1 · Course overview & "reflection is a graph, not a prompt"
- **Duration:** ~4 min
- **Objective:** the viewer can state the course's one-line mental model, name the
  six modules, and explain why the domain rotates.
- **Segments:** talking-head intro (0:00–0:35), slides + title cards (0:35–3:30),
  talking-head outro (3:30–4:00).
- **Tag:** none (no code this lesson).

## Block 2 — Pre-production

- Slide deck: title card; the six-module table; the "thread domain → capstone"
  diagram (support reply → … → legal clause); the one-line-per-module table.
- Talking-head framing, 1080p, neutral background, lav or USB mic.
- No editor or terminal needed.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Welcome to Foundation: Reflection-Loop Reliability. Here is the one idea this
> whole course installs, and I want you to hear it before anything else.
> Reflection is a graph, not a prompt.

**[Beat 2 · slide: prompt vs graph · 0:20]**
> When you want a model to improve its own work, the instinct is to write a longer
> prompt: draft this, critique yourself, revise. That crams generation and
> judgment into one call, where you cannot see, measure, or bound any of it. The
> alternative is to make the loop a structure: a node that writes, a node that
> judges, a cyclic edge between them, and a counter that decides when to stop.
> That structure is a LangGraph graph.

**[Beat 3 · slide: six-module table · 0:55]**
> You build one pattern across six modules. Module 0, the minimal write, critique,
> revise loop. Module 1, bounded termination. Module 2, critique design. Module 3,
> tracing in LangSmith. Module 4, eval-driven reflection. Module 5, keeping the
> loop honest in production. Each module installs one belief, and the last module
> points back at the first.

**[Beat 4 · slide: thread-domain diagram · 1:45]**
> We build it all on one example: customer support-ticket replies. A support reply
> is easy to judge badly, "make it friendlier," and hard to judge well, "does it
> name the customer's actual problem and tell them what happens next." That makes
> it the perfect teacher for the craft of critique.

**[Beat 5 · slide: capstone switch · 2:25]**
> Then the capstone switches domains entirely, to rewriting dense legal clauses
> into plain language. If the patterns only worked on support replies, the
> capstone exposes it. That is the test of a Foundation course: you should be able
> to redeploy the pattern without the notes, on a domain we never showed you.
> [cite: Madaan et al., 2023]

**[Beat 6 · slide: "plausible vs good" · 2:55]**
> Why a loop at all? Because one model call gives you a plausible answer, not its
> best one. Plausible is where next-token prediction stops. Across writing,
> reasoning, and code, agents that critique and revise their own output beat
> single-pass agents. The loop does not make the model smarter. It gives the model
> a target and a second attempt at hitting it. [cite: Shinn et al., 2023]

**[Beat 7 · talking-head · 3:30]**
> So hold onto this: a reflection loop is a shape, write, critique, route, repeat,
> not a clever sentence inside one prompt. Every hard question in this course, when
> does it stop, is the critic any good, why did this run waste three revisions, is
> tractable precisely because the loop is a graph you can inspect. Next lesson, we
> get it running on your machine. See you there.

## Block 4 — Post-production

- Lower-thirds on Beats 5 and 6 for the two citations.
- Animate the six-module table row-by-row as each is named (Beat 3).
- Chapter markers at Beats 1, 3, 4, 6.
- Title card in/out; soft music bed under slides, ducked under VO.
- Export 1080p/30, H.264, ~ −16 LUFS.

## Block 5 — Screen-recording description (shot list)

This lesson is slides + talking-head; the "screen" is the deck.

- **Beat 1:** talking-head full frame.
- **Beat 2:** slide split "Prompt (one call, blurred)" vs "Graph (write→critique→
  route nodes)"; reveal the graph side on the word "structure."
- **Beat 3:** six-row table; highlight each row as it is spoken.
- **Beat 4:** diagram of a support-ticket → reply with three check-marks fading in.
- **Beat 5:** the thread-domain arrow extends from "support reply" to a distinct
  "legal clause → plain language" card; citation lower-third appears.
- **Beat 6:** "plausible → good" gap slide; citation lower-third.
- **Beat 7:** return to talking-head; end card with "Next: Getting set up."

(No optional steps in this lesson — no bonus footage.)
