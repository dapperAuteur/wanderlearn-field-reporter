# Video script · Module 2 · Lesson 18 · Weights and pass rules as data, not in node code

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 2 · Lesson 18 · Weights and pass rules as data, not in node code
- **Duration:** ~5 min
- **Objective:** the viewer can change a loop's bar (blocking checks, pass threshold)
  by editing data, and explain why that enables Module 4's evals.
- **Segments:** screencast (editor + terminal), talking-head close (module wrap).
- **Tag:** `course/lesson-18`.

## Block 2 — Pre-production

- `git checkout course/lesson-18`; deps installed.
- `rubric.ts` open at `PassRule`, `applyPassRule`; test file open at the pass-rule block.
- Slide: "node applies policy; data IS the policy".

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> You have well-written, independent, grounded criteria. The last design decision is how
> their verdicts combine into a single pass. And that decision is data, not logic buried
> in the node.

**[Beat 2 · slide: the tempting if · 0:25]**
> A critique node is tempted to grow an if. If acknowledged and has-next-step and
> has-signoff, return passed true. Now every change to the bar means editing node code,
> re-reading control flow, re-testing the graph. And the same logic gets re-implemented
> when you reuse the rubric as an eval in Module 4, and the two copies drift.

**[Beat 3 · editor + terminal: weights · 1:15]**
> Weights as data. Each criterion carries a weight: one blocks, half is a nudge. Promoting
> states-timeline from a nudge to a blocker is a one-character data edit, and the test
> proves the outcome flips with no code change. Same verdicts, same node, different bar,
> because the weight is data.

**[Beat 4 · editor: PassRule · 2:20]**
> How weights combine is also a choice, so it is also data. All-blocking: every weight-one
> check must pass. Weighted-threshold: earned over total weight meets a threshold.
> Apply-pass-rule reads the rule and the rubric. It hard-codes neither.

**[Beat 5 · terminal: same verdicts, different policy · 3:00]**
> The test scores one partial reply and shows it fails all-blocking, it is missing a
> blocking check, yet passes weighted-threshold at zero point five. Same verdicts,
> different policy, zero code change. The bar is a dial you turn in data.

**[Beat 6 · slide: why it's load-bearing · 3:35]**
> Why does this matter for the rest of the course? Module 4: the offline regression test
> reuses this exact rubric and pass rule as its scorer. If the pass rule lived in the
> node, the eval would re-implement it and drift. This is what lets the runtime rubric is
> also the offline test be literally true. Module 5: tuning the threshold to trade quality
> against cost is a data change you can A/B and roll back, not a code deploy.

**[Beat 7 · talking-head · 4:20]**
> Module close. Look back at Lesson 13: the rubric is the lever. You now hold the whole
> lever, criteria, weights, and pass rule, as data the node merely reads. The loop's
> quality is something you edit, not something you hope for. And because the rubric is
> data, it can be both the runtime critic and the offline eval, which is Module 4. But
> first, Module 3 makes the loop visible, because a critic you cannot trace is a critic
> you cannot debug.

## Block 4 — Post-production

- Beat 2: red-flag the hard-coded `if` in the node.
- Beat 3: split-screen the weight edit and the flipped test result.
- Beat 5: zoom the all-blocking=false vs weighted-threshold=true assertions.
- Chapter markers at Beats 2, 3, 4, 6, 7.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `rubric.ts` weights + the "changing a weight flips the outcome" test;
  run it.
- **Beat 4:** `rubric.ts` — `PassRule` type and `applyPassRule` body.
- **Beat 5:** terminal — run the suite; point at the "pass rule is DATA" describe block.
- **Beat 6:** "load-bearing" slide (Module 4 reuse / Module 5 tuning).

## Bonus footage — Optional: retune the bar live

> Optional step from the lesson's Try it. Record ~45s.

**Pre-production:** `rubric.ts` open at `defaultPassRule`.

**VO (verbatim):**
> Optional. Change the default pass rule to weighted-threshold at zero point seven five
> and re-run the suite. Some assertions written for all-blocking will shift. Read which,
> and reason about whether zero point seven five is too strict for support replies. Then
> restore it. You just retuned the loop's bar without touching the graph.

**Shot list:** edit `defaultPassRule` to `{ kind: "weighted-threshold", threshold: 0.75 }`;
run the Module 2 test; show which assertions move; revert.
