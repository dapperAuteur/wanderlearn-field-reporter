# Module 2 · Quiz · Self-check

Answer before expanding. These check the *craft*, not syntax.

---

**1. State Module 2's belief and why the rubric, not the prompt, is the lever.**

<details><summary>Answer</summary>

"Writing checks an LLM can actually score is a craft." The loop's structure (cycle,
router, termination) never improves a draft — the critic does, and the critic is
only as good as the rubric. So the rubric is the highest-leverage thing you can
edit, which is why it must be data: versionable, weightable, lintable, reusable.
</details>

**2. Define a vague criterion precisely, and give the one-question test for it.**

<details><summary>Answer</summary>

Vague = two careful readers (or two model runs) could reasonably disagree on
pass/fail for the *same* draft. Test: *could you highlight the words that make it
pass?* If not (e.g. "is engaging"), it is vague — rewrite to name an observable.
</details>

**3. Why is an overlapping pair of criteria a real bug, even when each is checkable?**

<details><summary>Answer</summary>

They covary, so one defect is counted multiple times: it silently distorts a
weighted score (the shared property gets outsized weight you never chose) and
multiplies the feedback (the writer over-corrects on that axis). The bug is in the
*relationship* between criteria, not in any one — which is why it ships unnoticed.
</details>

**4. Overlap vs. compound — state the difference in one sentence.**

<details><summary>Answer</summary>

Overlap = two criteria testing one property (over-counts); compound = one criterion
testing two properties (under-resolves). Same fix: one criterion, one independent,
observable property.
</details>

**5. Which failure mode can be linted automatically, and why only that one?**

<details><summary>Answer</summary>

Compound — it has a textual signature ("and"/"or"/commas), so `findCompoundCriteria`
catches the common case. Vague and overlap have no reliable textual signature; they
need the human judgments "could two readers disagree?" and "could a draft split
these?"
</details>

**6. Why must the judge return evidence and suggestion, not just a boolean?**

<details><summary>Answer</summary>

Evidence grounds the verdict so you can *audit* (and therefore trust) the routing;
suggestion gives the writer something to *act on* so the loop can improve. The schema
forces both with `z.string().min(1)`. A score-only critic is a coin flip with extra
steps.
</details>

**7. Where do weights and the pass rule live, and what breaks if they live in the
node?**

<details><summary>Answer</summary>

In data, beside the rubric; the node only *applies* them via `applyPassRule`. In the
node, the bar cannot be versioned/tuned without a code change, and it gets
re-implemented (and desynced) when the rubric is reused as a Module 4 eval.
</details>

**8. How can the same rubric be both the runtime critic and the offline test?**

<details><summary>Answer</summary>

Because the criteria, weights, and pass rule are data, the offline eval (Module 4)
scores with the *exact same* `applyPassRule` over the *exact same* rubric the loop
uses at runtime — no duplicated, drift-prone logic. "The runtime rubric is also the
offline test" is literal, not a slogan.
</details>

---

**Score:** 7–8 → Module 3. 5–6 → re-skim Lessons 14–16. ≤ 4 → do the lab; the craft
is in the diagnosing, not the definitions.
