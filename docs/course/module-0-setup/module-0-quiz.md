# Module 0 · Quiz · Self-check

Answer before expanding each solution. These check the *mental model*, not
trivia.

---

**1. The course's one-line thesis is "reflection is a graph, not a prompt." What
concretely goes wrong when you make reflection a single prompt instead?**

<details><summary>Answer</summary>

Generation and judgment are crammed into one forward pass, where they compete and
the quality bar loses. You also lose the ability to see, measure, or bound the
loop — there is no separate critique to inspect, no counter to stop on, no node to
trace. The fix is structural: separate write/critique nodes, a cyclic edge, and a
cap.
</details>

**2. Why does a single model call return a "plausible, not good" support reply?**

<details><summary>Answer</summary>

Plausible is where next-token prediction stops. The model is trained to produce
text that *reads like* a support reply; nothing in that objective rewards actually
resolving the customer's problem. So you get fluent, on-topic, empty text (Ji et
al., 2023).
</details>

**3. Name the "prompt-harder" anti-pattern and its fix.**

<details><summary>Answer</summary>

Trying to close the plausible-to-good gap by piling requirements into the
generation prompt. It conflates generation and judgment, has no measurable success
signal, and degrades as requirements compete for attention. Fix: a second step
whose only job is to judge the first (Madaan et al., 2023).
</details>

**4. In the loop, where does the revision cap live, and where must it NOT live?**

<details><summary>Answer</summary>

It lives in code — the routing function `routeAfterCritique`, specifically
`if (state.revisionNumber >= MAX_REVISIONS) return END`. It must NOT live in a
prompt instruction ("revise at most 3 times"), which a model can ignore. The
counter is the graph's job.
</details>

**5. What two properties make the stub critic's checks useful, and which are
shared by a good LLM critic?**

<details><summary>Answer</summary>

(a) Every check is concretely verifiable by reading the text ("names the issue,"
not "is empathetic"); (b) it returns evidence per check, forcing grounded
judgments rather than rubber-stamping. Both carry over to LLM-scored rubrics
(Liu et al., 2023).
</details>

**6. Why does the `history` channel use a concat reducer when the others are
last-write-wins?**

<details><summary>Answer</summary>

So every revision is appended, not overwritten — the run stays fully auditable
(every draft is retained). Module 3's tracing builds on this.
</details>

**7. The writer is injected into `buildSupportReplyLoop(write)`. Why does that
matter?**

<details><summary>Answer</summary>

It decouples the loop's structure from *how* a draft is produced. The same graph,
critic, and cap run with a canned offline writer (tests, demo) or a real chat
model — only the injected writer changes. It is what lets Module 0 run with no API
key.
</details>

**8. Name the two places TypeScript and Python genuinely diverge for this loop.**

<details><summary>Answer</summary>

The schema library (Zod vs. Pydantic — both compile to JSON Schema, so the model
sees the same contract) and the async surface (Python offers sync + async; TS is
async throughout). Everything else is one-to-one.
</details>

---

**Score:** 7–8 solid → go to Module 1. 5–6 → re-skim Lessons 1, 5, 6. ≤ 4 → rerun
the lab; the model lives in your hands, not your memory.
