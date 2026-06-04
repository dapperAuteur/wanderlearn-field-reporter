# Video script · Module 2 · Lesson 16 · Failure mode 3 — coarse compound criteria

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 2 · Lesson 16 · Failure mode 3 — coarse compound criteria
- **Duration:** ~5 min
- **Objective:** the viewer can split a compound criterion into atoms and run the
  linter that catches compoundness automatically.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-16`.

## Block 2 — Pre-production

- `git checkout course/lesson-16`; deps installed.
- `rubric.ts` open at `findCompoundCriteria`; test file open at the linter block.
- Slide: the compound→atoms split.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The third failure mode is one criterion doing two jobs. A compound criterion bundles
> multiple checks into a single pass or fail, so its verdict cannot say which part
> failed.

**[Beat 2 · slide: the compound · 0:25]**
> Acknowledges the issue, and gives a next step, and ends politely. One key, one
> boolean, three questions. A draft that names the problem and signs off but offers no
> next step gets a single false. The writer cannot tell which of the three it missed, so
> its revision is a guess. Technically correct, operationally useless.

**[Beat 3 · slide: breaks the loop · 1:20]**
> It breaks the loop's feedback channel specifically. Lost localization: failed does not
> say where. Lost partial credit: a draft that fixed two of three still shows one false,
> so convergence detection may misfire because the verdict did not move. Lost weighting:
> you cannot weight has-a-signoff differently from gives-a-next-step if they are the same
> criterion.

**[Beat 4 · slide: the split · 2:15]**
> The fix: split every compound into its atoms, one check each. Acknowledges-issue.
> Gives-next-step. Has-signoff. The rubric should be three checks, not describe three
> checks while scoring as one.

**[Beat 5 · editor: findCompoundCriteria · 2:55]**
> And because compoundness has a textual signature, conjunctions and commas, you can lint
> for it. Here is the linter the Module 2 code ships. Filter criteria whose description
> matches and or or, or contains a comma. The support-reply rubric returns empty; a rubric
> with is professional and friendly returns the tone key.

**[Beat 6 · terminal: linter test · 3:40]**
> The test asserts both: the clean rubric stays clean, the compound one gets flagged.

**[Beat 7 · talking-head · 4:05]**
> One honest limit. The linter catches compound. It cannot catch vague or overlap, which
> have no reliable textual signature, they need human judgment. Automate the mechanical
> failure mode, reserve your attention for the two that need you. That boundary is why
> this module is a craft, not a checklist. One criterion, one question.

## Block 4 — Post-production

- Beat 2: highlight the two "and"s in the compound criterion.
- Beat 4: animate the compound splitting into three atomic rows.
- Beat 5: highlight the regex in `findCompoundCriteria`.
- Beat 6: zoom the linter assertions.
- Chapter markers at Beats 2, 4, 5, 7.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** compound-criterion slide.
- **Beat 4:** split slide.
- **Beat 5:** `rubric.ts` — `findCompoundCriteria`; highlight the conjunction regex.
- **Beat 6:** terminal — `npm run test -- tests/course/module-2-critique.test.ts`;
  point at the "compound-criteria linter" describe block passing.

(No optional steps in this lesson — no bonus footage.)
