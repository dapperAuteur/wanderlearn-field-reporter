# Video script · Module 4 · Lesson 26 · Rubric reuse — the runtime critic is the offline test

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 4 · Lesson 26 · Rubric reuse — the runtime critic is the offline test
- **Duration:** ~5 min
- **Objective:** the viewer can explain why reusing the runtime rubric as the eval (not a
  second scorer) is what makes the eval trustworthy.
- **Segments:** screencast (editor), talking-head bookends.
- **Tag:** `course/lesson-26`.

## Block 2 — Pre-production

- `git checkout course/lesson-26`; deps installed.
- `examples/support-reply-loop/eval.ts` open at `evaluateDraft`; `rubric.ts` open at
  `supportReplyRubric`/`applyPassRule`.
- Slide: "one rubric, two jobs".

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Module 4's belief: the runtime rubric is also the offline test. The rubric you wrote to
> steer the loop at runtime is the exact same artifact you use to measure the loop offline.
> Same criteria, same judge, same pass rule.

**[Beat 2 · slide: two jobs · 0:25]**
> The rubric does two jobs that look different and are the same check. Runtime, the critic:
> on every revision, score the draft and decide pass or revise. Offline, the eval: over a
> dataset, score each output and compute a pass rate. The temptation is to write the offline
> eval separately, a test that checks the output looks right. Resist it. The moment the eval's
> standard differs from the runtime critic, you are measuring something other than what the
> loop optimizes.

**[Beat 3 · editor: evaluateDraft · 1:25]**
> Here is the reuse. The evaluator does not define a new standard. It calls the same
> score-against-rubric over the same support-reply rubric the loop uses. The pass-fail is
> decided by the identical apply-pass-rule the router trusts at runtime. One definition of
> good, and both the loop and the eval read it.

**[Beat 4 · talking-head · 2:25]**
> And this is why Module 2 put weights and the pass rule in data, not in the node. Because the
> policy is data, the eval can apply the exact same policy without re-implementing it. Had the
> pass rule been hard-coded in the node, the eval would copy it, and the copy would drift, and
> one day the loop ships a draft your eval calls good that the runtime critic would have
> rejected. Reuse is only possible because the rubric is an artifact, not a code path.

**[Beat 5 · slide: anti-pattern · 3:30]**
> The anti-pattern: the second, separate scorer. An eval whose standard is hand-coded apart
> from the runtime rubric. It drifts, so a passing eval stops meaning a good loop. Reuse the
> rubric. Never re-implement it.

**[Beat 6 · talking-head · 4:05]**
> You do not write an eval for a reflection loop. You reuse the critic as one. One artifact,
> two jobs, one source of truth, and that is what makes the eval's number mean something. The
> rest of the module builds the machinery around that reused rubric.

## Block 4 — Post-production

- Beat 2: "one rubric → runtime critic / offline eval" diagram.
- Beat 3: highlight `scoreAgainstRubric` + `supportReplyRubric` shared by loop and eval.
- Beat 5: anti-pattern card.
- Chapter markers at Beats 2, 3, 4, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `eval.ts` `evaluateDraft`; jump to `rubric.ts` to show the same rubric/pass rule.
- **Beat 4:** show `applyPassRule` reading the data; emphasize "no second copy".
- **Beat 5:** anti-pattern card.

(No optional steps in this lesson — no bonus footage.)
