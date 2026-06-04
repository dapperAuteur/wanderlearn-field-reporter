# Module 5 · Quiz · Self-check

Answer before expanding. These check whether you can run a loop as a budget.

---

**1. State Module 5's belief, and the difference between an offline and an online eval.**

<details><summary>Answer</summary>

"Reflection is a budget allocation, not a magic wand." Offline eval answers "did this *change* make
the loop worse?" on a fixed dataset in CI; online eval answers "is the loop healthy *right now*?" on
live, open-ended traffic. Both share the rubric so "healthy" is consistent.
</details>

**2. Why is convergence rate the first production metric, and what does it NOT tell you?**

<details><summary>Answer</summary>

It's the loop's actual job measured (fraction of runs that resolved), it moves when reality shifts,
and it's comparable over time. It does *not* tell you *why* any single run escalated — it tells you
*when* to go open the traces (Module 3). Rate finds the *when*; trace finds the *why*.
</details>

**3. Define a runaway loop and why it's the most expensive failure.**

<details><summary>Answer</summary>

A run that escalated *and* hit the hard cap — it burned the full revision budget and resolved
nothing. It's the most expensive failure because it pays maximum cost for zero good output
(`escalated && revisions >= maxRevisions`).
</details>

**4. Why does the critic model dominate a loop's cost and quality?**

<details><summary>Answer</summary>

The critic runs far more than the writer — one critique call per criterion per revision (e.g. 8
critic calls to 2 writer calls). So the critic choice drives both the bill and the convergence more
than any other knob; A/B it on the same dataset/rubric and decide on quality-per-cost.
</details>

**5. Why measure cost-per-converged-output instead of average cost per run?**

<details><summary>Answer</summary>

Average-per-run spreads cost over all runs including failed ones, so a loop that escalates half its
runs looks half as expensive as it is. Dividing total cost by *resolved* runs makes the money spent
on failures visible; zero convergence ⇒ `Infinity`, which is honest.
</details>

**6. What is the single-pass-good-enough check, and why re-run it over time?**

<details><summary>Answer</summary>

Before looping, measure single-shot quality on a dataset; if it clears the bar with margin, ship
single-shot and skip the loop (the cheapest reflection is none). Re-run it because as models improve,
single-shot quality rises, so a loop justified last year may not be this year.
</details>

**7. Define a dominated config and the Pareto frontier.**

<details><summary>Answer</summary>

A config is dominated when another is at least as good in quality *and* at least as cheap (strictly
better on one axis) — never worth running. The Pareto frontier is the set of non-dominated configs:
your real menu of trade-offs. (e.g. loop-cap-3 dominated by loop-cap-1 — same quality, double cost.)
</details>

**8. Whose decision is *where on the frontier to sit*, and what's the engineer's job?**

<details><summary>Answer</summary>

It's a *product* decision (where the quality bar sits relative to cost — a legal assistant pays for
the high end; an internal draft tool sits cheap). The engineer's job is to *compute the frontier* so
the product decision is made with the trade-off visible, not guessed.
</details>

---

**Score:** 7–8 → capstone. 5–6 → re-skim Lessons 35, 37. ≤ 4 → do the lab; budget thinking is built
by pricing real runs.
