# Video script · Module 3 · Lesson 23 · Diagnosing critic drift

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 3 · Lesson 23 · Diagnosing critic drift
- **Duration:** ~4 min
- **Objective:** the viewer can detect critic drift in a trace and name the two levers that
  reduce it.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-23`.

## Block 2 — Pre-production

- `git checkout course/lesson-23`; deps installed.
- `tracing.ts` open at `detectCriticDrift`; test file open.
- Slide: same draft, two scores; the two levers.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Second trouble-shape: critic drift. The same draft scored differently on different passes.
> Because the critic is an LLM, and an LLM is nondeterministic, the judge can pass a draft,
> fail the identical draft a pass later, and never let the loop settle.

**[Beat 2 · slide: the shape · 0:30]**
> Drift is visible only because the trace keeps every pass. Two critique spans, identical
> draft, different passed-checks. Two-of-four, then three-of-four, same text. Same input,
> different verdict. The judge is not a function.

**[Beat 3 · editor + terminal: detectCriticDrift · 1:10]**
> The diagnostic groups steps by draft and flags any draft that got more than one distinct
> score. The test gives it the same draft scored two then three and asserts it returns that
> draft. In LangSmith you catch this when a loop revisits a draft it already saw, with a
> different result. The loop thrashing instead of converging.

**[Beat 4 · slide: why nasty · 1:55]**
> Drift is uniquely nasty. Convergence detection can misfire, the loop revises a draft that
> was fine last pass. The loop never settles deterministically, re-runs give different
> outcomes. And it hides in aggregate, average pass rates look fine, the drift is only
> visible per-run on the same draft, which only the trace preserves.

**[Beat 5 · slide: two levers · 2:40]**
> Two levers, straight from the LLM-judge literature. One, lower the judge's temperature.
> A scorer should be as deterministic as the provider allows, temperature zero by default,
> judging is not a place for creativity. Two, tighten the criteria. Drift concentrates on
> vague criteria, the coin-flip lives there. The trace tells you which criterion drifted,
> read its child spans, and that is your rewrite target. [cite: Liu et al., 2023]

**[Beat 6 · talking-head · 3:25]**
> The critic is an LLM, so its verdict is a distribution, not a function, and drift is that
> distribution leaking into your loop. You see it only in the trace, one draft wearing two
> scores. Cool the judge and sharpen the criteria. You will rarely hit zero, which is why
> Module 4 sets eval thresholds with margin for judge noise.

## Block 4 — Post-production

- Beat 2: highlight the identical draft text with two different score badges.
- Beat 3: zoom the group-by-draft logic and the assertion.
- Beat 5: two-levers slide; lower-third Liu et al. citation.
- Chapter markers at Beats 2, 3, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** same-draft-two-scores slide.
- **Beat 3:** `tracing.ts` — `detectCriticDrift`; terminal run pointing at the drift block.
- **Beat 5:** two-levers slide (temperature 0; tighten vague criteria).

(No optional steps in this lesson — no bonus footage.)
