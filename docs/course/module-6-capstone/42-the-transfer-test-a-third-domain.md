# Module 6 · Lesson 42 · The transfer test — a third domain, without the notes

> **Tag:** `course/lesson-42` · **Module 6: Capstone** · ~5 min

## The model you are about to install

The capstone proved the pattern transfers from support replies to legal clauses — but you watched it
happen. The real test is whether *you* can do it cold, on a domain neither the course nor the capstone
used. This lesson runs that test, in code, on a **third domain — commit messages** — using only the
generic scorer. By the end you have seen the pattern carry to a domain with no scaffolding written for it.

## The test: same engine, brand-new domain

The capstone test includes a transfer block that touches *none* of the capstone's plain-language code. It
writes a fresh rubric for commit messages and scores drafts with the same `scoreAgainstRubric`
(`tests/course/module-6-capstone.test.ts`):

```ts
const commitRubric: RubricCriterion[] = [
  { key: "summary_line",    description: "Starts with a concise summary line.",     weight: 1 },
  { key: "imperative_mood", description: "Uses imperative mood (Add/Fix/Remove).",  weight: 1 },
  { key: "explains_why",    description: "Says why the change was made.",           weight: 1 },
];

const goodCritique = await scoreAgainstRubric(commitJudge, "n/a", goodCommit, 0, commitRubric);
const badCritique  = await scoreAgainstRubric(commitJudge, "n/a", badCommit,  0, commitRubric);
expect(goodCritique.passed).toBe(true);   // "Fix null deref… to prevent a crash" passes
expect(badCritique.passed).toBe(false);   // "stuff" fails
```

The third domain reuses `scoreAgainstRubric`, `RubricCriterion`, the judge contract, and `applyPassRule`
— the same artifacts Modules 2–6 used — and they work immediately. The *only* new things are a
three-criterion rubric and a judge, written from the Module 2 rules in a few lines. That is the pattern
transferring with no scaffolding: a third domain, scored by the same engine, passing and failing the right
drafts.

## What the transfer test actually proves

It proves the claim a Foundation course must earn: the learner ends with a **durable mental model they
can redeploy without the notes** (the rubric-criterion at the heart of §3, F2). Concretely:

- The rubric craft (single, observable, independent, weighted criteria) applied to commit messages without
  re-reading Module 2.
- The scorer, pass rule, and judge contract carried over untouched.
- A good draft passed and a bad one failed — the loop's core promise, on domain three.

If the patterns had been secretly support-reply-shaped, the commit-message rubric would not have plugged
into `scoreAgainstRubric`, or the criteria would not have split good from bad. They did, because the
machinery never knew or cared what domain it was scoring.

## The human transfer test (for you)

The code shows the *engine* transfers; the course's real exit criterion is whether *you* can. So do the
full version, off the page: pick a fourth domain (release notes, API error messages, meeting summaries),
write its rubric (name its central tension, Lesson 39), build the loop by reusing `routeWithAllPatterns`
and `scoreAgainstRubric` (Lesson 40), and run the eval and dashboard (Lesson 41). If you can ship a working
reflection loop on a domain this course never mentioned, the course did its job — and so did you.

## What you should now believe

A pattern you can only apply to the domain you learned it on is a recipe, not a mental model. The transfer
test — commit messages in code, your own fourth domain by hand — is the proof that you hold the reflection
loop as a *transferable* tool: rubric, termination, scorer, eval, and production guards, redeployable to
any write → critique → revise task by writing a rubric and a dataset.

## Try it

Take the commit-message rubric and add a fourth criterion of your own (`references_issue`, weight 0.5).
Write a draft that satisfies it and one that does not, and score both with `scoreAgainstRubric`. You just
extended a third-domain rubric using the same craft — no course notes required. That is transfer.

## References

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U., Dziri, N., Prabhumoye,
S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S., Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine:
Iterative refinement with self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG evaluation using GPT-4 with
better human alignment. In *Proceedings of the 2023 Conference on Empirical Methods in Natural Language
Processing* (pp. 2511–2522). Association for Computational Linguistics.
https://doi.org/10.18653/v1/2023.emnlp-main.153
