# Video script · Module 4 · Lesson 29 · Pairwise eval — single-shot vs the reflection loop

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 4 · Lesson 29 · Pairwise eval — single-shot vs the reflection loop
- **Duration:** ~5 min
- **Objective:** the viewer can run a pairwise eval to prove the loop beats single-shot, and
  recognize when the margin says not to loop.
- **Segments:** screencast (editor + terminal), talking-head bookends.
- **Tag:** `course/lesson-29`.

## Block 2 — Pre-production

- `git checkout course/lesson-29`; deps installed.
- `eval.ts` open at `pairwise`; test file open at the pairwise block.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> You have spent four modules building a reflection loop. This lesson asks the question you
> should have demanded at the start: does it actually beat just writing once? A pairwise eval
> answers it. Run two systems on the same dataset and compare them example by example.

**[Beat 2 · editor: pairwise · 0:35]**
> Why pairwise and not two separate numbers? Two isolated numbers hide where the difference is
> and are noisy with an LLM judge. Pairwise compares the two systems on each same input and
> counts wins, which is more informative and more robust. It is the methodology MT-Bench and
> Chatbot Arena use to rank models, because relative judgments on the same input beat absolute
> scores. The function joins the two runs by id and counts a-wins, b-wins, ties. [cite: Zheng et al., 2023]

**[Beat 3 · terminal: the result · 1:40]**
> The test runs both targets on the dataset. The loop, nine of ten. Single-shot, zero of ten.
> Pairwise: the loop wins nine cases and loses none. That is the empirical justification for the
> entire course. Write, critique, revise produces materially better replies than a single pass,
> on the same inputs, by the same rubric. Without this comparison, reflection is better is a
> belief. With it, it is a number.

**[Beat 4 · talking-head · 2:45]**
> But pairwise is not a victory lap. It is a decision tool, and sometimes it tells you to stop
> looping. If the loop wins one case out of ten, you are paying two to five times the calls for a
> ten percent gain, and the right call may be to ship single-shot. Module 5's is-single-pass-
> good-enough check is exactly this, run continuously. A thin margin is pairwise doing its most
> valuable job: stopping you from spending reflection's cost where reflection does not pay.

**[Beat 5 · talking-head · 3:45]**
> The anti-pattern: assuming the loop is worth it because the pattern is sophisticated, without
> ever comparing it to one pass. Always run the baseline. Let the comparison decide. The
> question is empirical, and pairwise answers it per example.

## Block 4 — Post-production

- Beat 2: highlight the join-by-id and the win counting; lower-third Zheng citation.
- Beat 3: zoom the `aWins >= 9` and `bWins === 0` assertions.
- Beat 4: "wide margin → loop; thin margin → baseline" slide.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `eval.ts` — `pairwise`.
- **Beat 3:** terminal — run the suite; point at the pairwise describe block (9 wins, 0 losses).
- **Beat 4:** decision-tool slide.

(No optional steps in this lesson — no bonus footage.)
