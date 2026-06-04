# Module 4 · Quiz · Self-check

Answer before expanding. These check whether you can build a *trustworthy* eval.

---

**1. State Module 4's belief and what "reuse" concretely means.**

<details><summary>Answer</summary>

"The runtime rubric is also the offline test." The eval calls the *same*
`scoreAgainstRubric` over the *same* rubric and `applyPassRule` the loop uses at runtime —
one definition of "good," read by both. No second, separately-coded scorer.
</details>

**2. Why is reuse only possible because Module 2 made the rubric data?**

<details><summary>Answer</summary>

Because the weights and pass rule live in data (not hard-coded in the node), the eval can apply
the *exact* same policy without re-implementing it. If the policy were in the node, the eval
would copy it and the copy would drift — and a passing eval would stop certifying the runtime loop.
</details>

**3. Why deliberately include a case the loop cannot pass (the `dead` ticket)?**

<details><summary>Answer</summary>

Hard cases are where the signal lives — they're the examples that *move* when you change the
writer, rubric, or model. A dataset of only easy cases reports 100% and can neither catch a
regression nor confirm an improvement.
</details>

**4. What two things does the custom evaluator return, and why the second?**

<details><summary>Answer</summary>

`passed` (the score) and `errored` (whether the score is a valid measurement). The second
detects the error-fallback signature so an infrastructure failure can't be averaged into the
metric — preventing the witus-triage "fake 8%" bug.
</details>

**5. Why must an eval fail loudly, and what's worse than a crash?**

<details><summary>Answer</summary>

So a poisoned run produces *no number* rather than a fake one. A silent fake number is worse than
a crash because someone will cite it (the witus-triage 8% was cited as if real). `assertNoInfraErrors`
throws instead of reporting a poisoned score.
</details>

**6. Why pairwise instead of comparing two separate pass rates?**

<details><summary>Answer</summary>

Comparing the two systems on the *same* input and counting wins is more informative (shows *where*
they differ) and more robust to judge noise than two absolute numbers — the MT-Bench/Arena
methodology. It also tells you when the loop's margin over single-shot is too thin to justify its cost.
</details>

**7. Why set the threshold below the expected pass rate, and what's the common mistake?**

<details><summary>Answer</summary>

Because an LLM judge is noisy, so the pass rate wobbles run to run; the gate needs margin to absorb
that. The common mistake is the 100% (or too-high) gate — it fails on good code whenever the judge
wobbles, so the team learns to ignore the eval, and a gate no one trusts catches nothing.
</details>

**8. Defend a ~10-example regression dataset. What does it buy and not buy?**

<details><summary>Answer</summary>

Buys: catches real regressions (which are cliffs across many examples, not subtle), via curation
over volume, cheap enough to run on *every* commit. Doesn't buy: a precise absolute quality number
(±10% resolution) or coverage of rare inputs — those you catch in production and add to the dataset
(it grows from misses).
</details>

---

**Score:** 7–8 → Module 5. 5–6 → re-skim Lessons 28, 30. ≤ 4 → do the lab; a trustworthy eval is
built, not memorized.
