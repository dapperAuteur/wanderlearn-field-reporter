# Video script · Module 4 · Lesson 30 · Setting thresholds with margin for LLM-judge noise

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 4 · Lesson 30 · Setting thresholds with margin for LLM-judge noise
- **Duration:** ~4 min
- **Objective:** the viewer can set an eval gate below the expected pass rate by a measured
  margin, avoiding both the flaky 100% gate and the too-loose gate.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-30`.

## Block 2 — Pre-production

- `git checkout course/lesson-30`; deps installed.
- `eval.ts` open at `meetsThreshold`; test file open at the threshold block.
- Slide: expected vs threshold with the margin band; the two failure modes.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> An eval that gates CI needs a threshold: pass rate above X or the build fails. But the scorer
> is an LLM judge, and an LLM judge is noisy. A threshold of a hundred percent will fail your
> build on a good system the day the judge wobbles.

**[Beat 2 · slide: judge is a distribution · 0:30]**
> Module 3 named critic drift: the same draft can score differently across runs. Even at
> temperature zero, an LLM judge is not perfectly stable. So your pass rate is itself a noisy
> measurement. Run the same good system twice and you might get zero-point-nine-two and
> zero-point-eight-eight. The threshold has to live below that wobble.

**[Beat 3 · editor + terminal: meetsThreshold · 1:15]**
> The machinery is trivial: pass rate above the threshold. The number you pass it is the lesson.
> The test sets it at zero-point-seven, not one, for a system that scores about zero-point-nine.
> The good system clears it with room. The broken baseline cannot. The gap between expected
> nine-tenths and the seven-tenths gate is the margin, the room for judge noise so a good run on
> a bad judge-day does not redden CI.

**[Beat 4 · slide: two failure modes · 2:15]**
> Two ways to get it wrong. Threshold too high, no margin: set it at zero-point-nine-five for a
> zero-point-nine system and CI fails randomly on good code, the team learns to ignore the eval,
> a flaky gate is a disabled gate. That is the more common and more damaging mistake. Threshold
> too low: set it at zero-point-three and a real regression to zero-point-five sails through. The
> margin is a calibration, and the only honest way to set it is to measure the noise: run the eval
> several times on an unchanged good system, see the spread, put the threshold a clear step below
> the bottom of it.

**[Beat 5 · talking-head · 3:20]**
> An LLM-judged eval is a noisy instrument, so its gate must have slack, sized to the measured
> noise. High enough to catch a real regression, low enough to survive an ordinary judge-day. A
> threshold with no margin is a gate the team will learn to ignore.

## Block 4 — Post-production

- Beat 2: animate two runs of the same system landing at 0.92 and 0.88.
- Beat 3: highlight the `0.7` in the test vs the ~0.9 expected; draw the margin band.
- Beat 4: two-failure-modes slide.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `eval.ts` `meetsThreshold`; terminal run pointing at the threshold block
  (good clears 0.7, single-shot fails).
- **Beat 4:** the too-high / too-low slide.

(No optional steps in this lesson — no bonus footage.)
