# Video script · Module 6 · Lesson 42 · The transfer test — a third domain, without the notes

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 6 · Lesson 42 · The transfer test — a third domain, without the notes
- **Duration:** ~5 min
- **Objective:** the viewer sees the scorer carry to a third domain (commit messages) and understands the
  human transfer test that is the course's real exit criterion.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-42`.

## Block 2 — Pre-production

- `git checkout course/lesson-42`; deps installed.
- `module-6-capstone.test.ts` open at the transfer-test block.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The capstone proved the pattern transfers from support replies to legal clauses, but you watched it
> happen. The real test is whether you can do it cold, on a domain neither the course nor the capstone used.
> Let's run that test, in code, on a third domain: commit messages.

**[Beat 2 · editor: the transfer block · 0:35]**
> Here is a transfer block that touches none of the capstone's plain-language code. It writes a fresh rubric
> for commit messages, summary line, imperative mood, explains why, and scores drafts with the same
> score-against-rubric. The third domain reuses the scorer, the criterion type, the judge contract, and the
> pass rule, the same artifacts Modules two through six used, and they work immediately.

**[Beat 3 · terminal: it passes · 1:35]**
> Run it. A good commit message, fix null deref in auth refresh, the token cache returned undefined so
> refresh now guards it to prevent a crash, passes. A bad one, just the word stuff, fails. The only new
> things were a three-criterion rubric and a judge, written from Module 2's rules in a few lines. That is the
> pattern transferring with no scaffolding.

**[Beat 4 · slide: what it proves · 2:30]**
> What does this prove? The claim a Foundation course must earn: the learner ends with a durable mental model
> they can redeploy without the notes. The rubric craft applied to commit messages without re-reading Module
> 2. The scorer and pass rule carried over untouched. A good draft passed and a bad one failed. If the
> patterns had been secretly support-shaped, the commit rubric would not have plugged in. It did, because the
> machinery never knew what domain it was scoring.

**[Beat 5 · talking-head · 3:30]**
> The code shows the engine transfers. The course's real exit criterion is whether you can. So do the full
> version off the page: pick a fourth domain, release notes, error messages, meeting summaries. Write its
> rubric, name its central tension, build the loop by reusing route-with-all-patterns and score-against-
> rubric, run the eval and dashboard. If you can ship a working reflection loop on a domain this course never
> mentioned, the course did its job, and so did you.

## Block 4 — Post-production

- Beat 2: highlight the commitRubric + the reused `scoreAgainstRubric` call.
- Beat 3: zoom the good-passes / bad-fails assertions.
- Beat 5: "your fourth domain" checklist slide.
- Chapter markers at Beats 2, 3, 4, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** test file — the `commitRubric` + `commitJudge` + the `scoreAgainstRubric` calls.
- **Beat 3:** terminal — run the capstone test; point at the transfer describe block (good true, bad false).
- **Beat 5:** fourth-domain checklist slide.

(No optional steps in this lesson — no bonus footage.)
