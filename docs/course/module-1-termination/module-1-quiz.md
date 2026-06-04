# Module 1 · Quiz · Self-check

Answer before expanding. These check the termination *policy*, not syntax.

---

**1. State Module 1's belief in one line, and why the cap cannot live in the prompt.**

<details><summary>Answer</summary>

"The cap lives in code; counting is the graph's job." A prompt instruction to "stop
after N" is a suggestion the sampler can ignore, the model cannot reliably count its
own turns, and the bound is invisible to alerts/traces/tests. A `>=` in the router
cannot be argued with.
</details>

**2. Name the three ways a reflection loop fails to terminate on its own.**

<details><summary>Answer</summary>

(a) An impossible rubric the writer can never satisfy; (b) a stalled writer emitting
the same draft each pass; (c) critic drift — a nondeterministic judge flip-flopping
pass/fail on the same draft.
</details>

**3. The counter already bounds the loop. Why add convergence detection?**

<details><summary>Answer</summary>

The counter stops a *runaway* but not a *stall*: a writer stuck on the same draft
still burns the full budget producing identical bad drafts. Convergence exits early
(at the first repeat) instead of paying for passes that cannot change the outcome.
</details>

**4. A converged-but-failing run routes to a human, not to `END`. Why?**

<details><summary>Answer</summary>

Convergence means "the loop is done trying," not "the answer is good." Those are
different facts. Ending unresolved at a plain `END` makes a gave-up draft
indistinguishable from a shipped one, so the gave-up draft gets shipped. Escalation
is a distinct terminal state carrying the outcome.
</details>

**5. In the composed router, why must `critique.passed` be checked before
`MAX_REVISIONS`?**

<details><summary>Answer</summary>

A draft that passes on the final allowed revision is a win, not an escalation. If the
cap is checked first, a good draft produced on the capped pass gets escalated.
Success must dominate the cascade.
</details>

**6. Convergence and the cap both route to a human. Why check convergence first?**

<details><summary>Answer</summary>

Same destination, but checking convergence first escalates at the stall (e.g.
revision 2) instead of grinding to the cap (revision 3) to reach the same human —
fewer wasted LLM calls and a truer recorded reason.
</details>

**7. What is `recursionLimit`, and why is it a backstop rather than a control?**

<details><summary>Answer</summary>

A LangGraph per-invocation step cap that *throws* a `GraphRecursionError` when
exceeded. It ends the run with an exception and no outcome — fine as a safety net,
wrong as primary termination. Set it generously above your own worst case; bound the
loop yourself in the router. A thrown recursion error in prod means a real bound was
missing.
</details>

**8. State the redeployable principle behind the composed router.**

<details><summary>Answer</summary>

When several termination conditions can be simultaneously true, termination is a
*priority-ordered list*, not an unordered set: succeed if you can, give up cheaply if
you must, never run unbounded. Wrong order yields a subtly wrong outcome no type
checker catches.
</details>

---

**Score:** 7–8 → Module 2. 5–6 → re-skim Lessons 8, 11. ≤ 4 → redo the lab Part C;
priority-order is felt, not memorized.
