# Video script · Module 2 · Lesson 14 · Failure mode 1 — vague criteria

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 2 · Lesson 14 · Failure mode 1 — vague criteria
- **Duration:** ~5 min
- **Objective:** the viewer can spot a vague criterion and rewrite it into a
  checkable, observable one.
- **Segments:** screencast (slides + editor), talking-head bookends.
- **Tag:** `course/lesson-14`.

## Block 2 — Pre-production

- `git checkout course/lesson-14`.
- Slide: the vague→checkable rewrite table.
- `rubric.ts` open at `supportReplyRubric` (to show the checkable phrasing).

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The first and most common way a rubric criterion fails: it asks a question the
> judge cannot answer the same way twice. A vague criterion has no observable
> referent in the text, so the LLM scores it by vibe.

**[Beat 2 · slide: the offenders · 0:30]**
> What does vague mean precisely? Two careful readers, or two runs of the same model,
> could reasonably disagree on pass or fail for the same draft. Is engaging. Sounds
> professional. Is high quality. Demonstrates empathy. None of these point at anything
> in the draft you can confirm. Engaging is a property of a reader's experience, not a
> fact about the text.

**[Beat 3 · slide: poisons the loop · 1:25]**
> And it poisons the loop. The router routes on passed. If a criterion is vague,
> passed becomes partly random. Three bad things: false passes, where a weak draft is
> waved through. False fails, where a good draft is rejected on a coin flip and burns
> a revision. And useless feedback: make it more engaging tells the writer nothing it
> can act on.

**[Beat 4 · slide: the rewrite table · 2:30]**
> The fix: name the observable. Could you highlight the words that make this pass?
> Sounds professional becomes uses no slang or all-caps. Demonstrates empathy becomes
> acknowledges the specific problem the customer reported. Which is exactly how the
> support-reply rubric is already written.

**[Beat 5 · editor: rubric · 3:25]**
> Acknowledges-issue: names the specific problem the customer reported. You can
> highlight the words that satisfy it. That is the difference between a criterion an
> LLM can score and one it can only guess at.

**[Beat 6 · talking-head · 4:00]**
> And here is a free detector: Module 2's judge must return evidence per criterion.
> If a criterion is checkable, the judge quotes the words that pass it. If it is
> vague, the evidence just restates the verdict, it seems professional. Evidence that
> paraphrases the criterion means the criterion is vague. A criterion the judge
> cannot ground is not a weak check. It is no check.

## Block 4 — Post-production

- Beat 2: list the four vague offenders; red-X each.
- Beat 4: build the rewrite table row-by-row (vague left, checkable right).
- Beat 5: highlight `acknowledges_issue` description in the editor.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** offenders slide.
- **Beat 3:** "poisons the loop" slide (false pass / false fail / useless feedback).
- **Beat 4:** rewrite-table slide.
- **Beat 5:** `rubric.ts` — highlight the checkable phrasing of `acknowledges_issue`.

(No optional steps in this lesson — no bonus footage.)
