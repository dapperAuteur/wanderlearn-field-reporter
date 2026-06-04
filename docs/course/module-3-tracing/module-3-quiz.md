# Module 3 · Quiz · Self-check

Answer before expanding. These check whether you can *read* a loop, not recite features.

---

**1. State Module 3's belief, and why the output of a loop cannot debug it.**

<details><summary>Answer</summary>

"Tracing makes bugs legible, not rarer." The output collapses four distinct failures
(ran-out-of-budget, stall, drift, masked critic failure) into one indistinguishable
string like `escalated`. You cannot fix a bug you cannot tell apart from three others.
</details>

**2. Name the three normal debugging tools that fail on an LLM loop, and why.**

<details><summary>Answer</summary>

Stack traces (the worst bugs don't throw — fail-soft swallows the error); debuggers
(assume deterministic re-execution; LLM calls aren't); `console.log` (a cycle logs the
same node many times and concurrent runs interleave). Bonus: output assertions pass while
the system is quietly broken because the output *shape* is valid.
</details>

**3. Why must tracing be fail-soft, and what is the mirror-image trap?**

<details><summary>Answer</summary>

Fail-soft so a missing key / LangSmith outage / no-account dev never breaks a running
loop — observability must not be a dependency. The trap: the *same* fail-soft reflex,
applied to your core nodes, hides bugs (a swallowed error becomes clean output). Fail soft
on observability; fail loud on the work.
</details>

**4. In a cyclic trace, how do you read the revision count and the score trajectory?**

<details><summary>Answer</summary>

Revision count = number of `critique_reply` spans. Score trajectory = the `passedChecks`
read down those spans (e.g. `2/4 → 4/4` is improving; `2/4 → 2/4` is not).
</details>

**5. What does a wasted iteration look like in the trace, and what are its three causes?**

<details><summary>Answer</summary>

A `critique_reply` span whose score did not exceed the prior pass (flat trajectory).
Causes: non-actionable feedback (vague suggestion), the writer ignoring good feedback, or
a genuinely-hard criterion the model plateaus on. The trace shows the suggestion and the
next draft side by side, so you can tell which.
</details>

**6. What is critic drift, why is it invisible in aggregate, and the two levers against it?**

<details><summary>Answer</summary>

The same draft scored differently on different passes (the judge isn't a function).
Invisible in aggregate because average pass rates look fine — drift only shows per-run on
the *same* draft, which only the trace preserves. Levers: temperature 0 on the judge, and
tighten vague criteria (where drift concentrates).
</details>

**7. "The loop escalated." Why is that one outcome, and how do you triage it?**

<details><summary>Answer</summary>

It hides three causes with opposite fixes: climbing-but-capped (raise `MAX_REVISIONS`),
flat (fix writer/rubric — raising the cap just buys identical failing passes), or
all-zeros (upstream break — Lesson 25). Triage by the score trajectory in the trace.
</details>

**8. The witus-triage bug: what was the symptom, the cause, and how did the trace reveal it?**

<details><summary>Answer</summary>

Symptom: every classification came back `other` / `confidence 0`, runs didn't error, tests
stayed green. Cause: the fail-soft `classify` node caught *every* LLM call's error and
returned a valid-looking fallback — the real failure was an unfunded API key. The trace
revealed it because the model-call span carried the actual error ("credit balance too
low") that the fallback had erased from the output. It also poisoned the eval into a fake
8% — the bridge to Module 4.
</details>

---

**Score:** 7–8 → Module 4. 5–6 → re-skim Lessons 21, 25. ≤ 4 → do the lab; reading traces
is a skill you build by reading traces.
