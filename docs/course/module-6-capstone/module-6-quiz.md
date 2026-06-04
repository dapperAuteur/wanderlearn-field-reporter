# Module 6 · Quiz · Self-check (course capstone)

Answer before expanding. These check whether you hold the *whole* model.

---

**1. State the capstone's belief and why a new domain is essential to it.**

<details><summary>Answer</summary>

"You can redeploy the reflection-loop pattern, without the notes, on a domain you have never seen." A new
domain is essential because testing on the learned domain proves only recipe-following; transfer to an
unseen domain is the test of a durable mental model (F2).
</details>

**2. What is the *only* new code the capstone writes, and what does it reuse?**

<details><summary>Answer</summary>

New: a domain rubric, a corpus, and offline stand-ins (plus two thin node bodies). Reused unchanged: M1's
state + `routeWithAllPatterns`, M2's `scoreAgainstRubric`/`applyPassRule`, M4's `pairwise`/`meetsThreshold`/
`assertNoInfraErrors`, and M5's `computeMetrics`/`paretoFrontier`. The import list is the transfer proof.
</details>

**3. Why does the bounded router need zero changes for the new domain?**

<details><summary>Answer</summary>

Because Module 1 built it generic: `routeWithAllPatterns` reads only `critique.passed`, `revisionNumber`,
and the draft history — none domain-specific. So the cap, convergence detection, and escalation terminal
all carry over with no new code.
</details>

**4. What is the central tension the plain-language rubric encodes, and how?**

<details><summary>Answer</summary>

Fidelity vs. simplicity — making a clause readable tempts you to drop its hard parts, destroying its
meaning. The rubric makes both `preserves_obligation` and `plain_language` *blocking*, so a good rewrite
must satisfy both at once.
</details>

**5. Why does the `remittance` clause fail, and why is that the rubric working?**

<details><summary>Answer</summary>

It's legalese-saturated, so a naive rewrite keeps a legalese term ("pursuant") — passing fidelity but
failing `no_legalese`. The rubric *discriminating* this hard case from a genuinely plain rewrite is exactly
what a useful critic must do; the test asserts it fails.
</details>

**6. How does the eval/dashboard transfer to the new domain unchanged?**

<details><summary>Answer</summary>

The M4 helpers operate on an `EvalReport` and the M5 metrics on run records — neither reads a rubric. So a
thin domain wrapper over `scoreAgainstRubric` produces those shapes and the helpers run as-is. The only
domain input the cost model needs is `rubric.length`.
</details>

**7. What does the third-domain (commit-message) transfer test prove?**

<details><summary>Answer</summary>

That the rubric craft + scorer + pass rule carry to a domain in *neither* the course nor the capstone — a
fresh 3-criterion rubric plugs into the same `scoreAgainstRubric` and splits good commits from bad. The
machinery never knew what domain it scored, so the pattern is durable, not domain-shaped.
</details>

**8. Assemble the six module beliefs into one sentence describing a reflection loop.**

<details><summary>Answer</summary>

A reflection loop is a *cyclic graph* (M0) with a *guaranteed exit* (M1), steered by a *data rubric an LLM
can score* (M2), made *legible by tracing* (M3), *protected by an eval that reuses the rubric* (M4), and
*allocated as a budget on a cost–quality curve* (M5) — and because every piece is generic, it *transfers*.
</details>

---

**Score:** 7–8 → you've completed the course; go build one on your own domain. 5–6 → re-skim the module
READMEs. ≤ 4 → do the capstone lab; the model lives in your hands, not your memory.
