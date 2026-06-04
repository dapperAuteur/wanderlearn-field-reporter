# Video script · Module 2 · Lesson 17 · Evidence and suggestion per criterion

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 2 · Lesson 17 · Evidence and suggestion per criterion
- **Duration:** ~5 min
- **Objective:** the viewer can design a verdict schema that forces the judge to
  ground and action every score.
- **Segments:** screencast (editor + terminal), talking-head bookends.
- **Tag:** `course/lesson-17`.

## Block 2 — Pre-production

- `git checkout course/lesson-17`; deps installed.
- `rubric.ts` open at `CriterionVerdictSchema` and the feedback assembly in
  `scoreAgainstRubric`; test file open at the schema block.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> A criterion can be perfectly written and still produce a useless critic, if the judge
> returns only a boolean. Two fields fix that: evidence, why this verdict, and
> suggestion, how to fix it.

**[Beat 2 · slide: bare boolean · 0:25]**
> Ask an LLM does this reply name the problem, true or false, and you get a boolean with
> no accountability. You cannot tell if it read the draft, and the writer gets a false
> with no idea what to change. No grounding, so you cannot trust the verdict. No
> actionability, so the loop cannot improve.

**[Beat 3 · editor: CriterionVerdictSchema · 1:15]**
> So Module 2 makes both mandatory and non-empty in the schema. Key, passed, evidence
> string min one, suggestion string min one. That min-one is doing real work: the judge
> cannot return empty evidence, because with-structured-output validates against the
> schema and rejects a malformed verdict.

**[Beat 4 · terminal: schema test · 2:05]**
> The test proves it: an empty-evidence verdict throws on parse. The schema is the
> contract that forces the judge to do its job.

**[Beat 5 · editor: evidence · 2:35]**
> Good evidence quotes the draft: cracked jar appears in sentence one, not it seems to
> acknowledge the issue. That auditability is what makes the critic trustworthy enough to
> route on. It is also your vagueness detector from Lesson 14: evidence that restates the
> verdict means the criterion was vague.

**[Beat 6 · editor: feedback assembly · 3:20]**
> The suggestion is the loop's fuel. Score-against-rubric collects the failed criteria's
> suggestions into the feedback string, handed to the writer next pass. That is exactly
> Reflexion's verbal reinforcement, the critique conditioning the next attempt. A good
> suggestion is specific and imperative, add a sign-off naming the sender, not a
> restatement of the failure.

**[Beat 7 · talking-head · 4:10]**
> The anti-pattern: the score-only critic, pass or fail with no evidence and no
> suggestion. You cannot audit it and the writer cannot act on it, a coin flip with extra
> steps. A verdict is three things: a judgment, the grounds for it, and the fix. The
> boolean is the least important field.

## Block 4 — Post-production

- Beat 3: highlight `z.string().min(1)` on both fields.
- Beat 4: zoom the `toThrow` assertion.
- Beat 6: highlight the `feedback` map in `scoreAgainstRubric`; lower-third Reflexion cite.
- Chapter markers at Beats 2, 3, 5, 6, 7.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `rubric.ts` — `CriterionVerdictSchema`; highlight the two `.min(1)` fields.
- **Beat 4:** terminal — run the suite; point at the schema describe block (empty-evidence throws).
- **Beat 5:** narrate over a verdict example (grounded vs restated evidence).
- **Beat 6:** `rubric.ts` — the `failed.map(... v.suggestion ...)` feedback assembly.

## Bonus footage — Optional: inspect a real judge's evidence

> Optional step (extends Lesson 13's real-judge path). Requires an API key. Record ~60s.

**Pre-production:** the `llmJudge` from Lesson 13's bonus; a scratch run printing verdicts.

**VO (verbatim):**
> Optional. With a real judge wired up, print the full verdicts, not just pass or fail.
> Read the evidence field on each: a good judge quotes the draft. If you see evidence that
> just restates the criterion, that is your signal the criterion is vague, or the judge is
> under-prompted. This is how you debug a critic in the wild, by reading its grounds.

**Shot list:** run the scratch script with `llmJudge`; pretty-print each
`CriterionVerdict`; highlight a grounded evidence string vs. a weak one; tie back to the
Lesson 14 vagueness detector.
