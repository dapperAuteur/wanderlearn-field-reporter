# Module 2 · Lesson 17 · Evidence and suggestion per criterion

> **Tag:** `course/lesson-17` · **Module 2: Critique design** · ~5 min

## The model you are about to install

A criterion can be perfectly written and still produce a useless critic, if the
judge returns only a boolean. This lesson adds the two fields that make an LLM judge
trustworthy and a reflection loop able to improve: **evidence** (why this verdict)
and **suggestion** (how to fix it). By the end you can design a verdict schema that
forces the judge to ground and action every score.

## Why a bare boolean is not enough

Ask an LLM "does this reply name the customer's problem? true/false" and you get a
boolean with no accountability. You cannot tell whether it actually read the draft
or pattern-matched the question, and the writer gets a `false` with no idea what to
change. Two failures in one:

- **No grounding** → you cannot trust the verdict. LLM judges are more accurate and
  more self-consistent when required to explain against the text rather than emit a
  bare label (Liu et al., 2023).
- **No actionability** → the loop cannot improve. The writer revises against the
  critique; a verdict with no suggestion is a closed door.

## The verdict schema

Module 2 makes both fields mandatory and non-empty in the schema
(`examples/support-reply-loop/rubric.ts`):

```ts
export const CriterionVerdictSchema = z.object({
  key: z.string(),
  passed: z.boolean(),
  evidence: z.string().min(1),    // grounds the verdict IN the draft
  suggestion: z.string().min(1),  // a concrete fix if it failed
});
```

`z.string().min(1)` is doing real work: the judge *cannot* return an empty evidence
or suggestion, because `model.withStructuredOutput(CriterionVerdictSchema)` validates
against the schema and rejects a malformed verdict. The Module 2 test asserts exactly
this — an empty-evidence verdict throws on `parse`. The schema is the contract that
forces the judge to do its job.

## Evidence: grounding you can audit

Good evidence quotes or points at the draft: *"'cracked jar' appears in sentence
one"* — not *"it seems to acknowledge the issue."* The difference is auditability:
with grounded evidence you can read the critique and verify the verdict yourself,
which is what makes the critic trustworthy enough to route on. It is also your
vagueness detector from Lesson 14: when the evidence just restates the verdict, the
criterion was vague.

## Suggestion: the loop's fuel

The suggestion is what the writer actually consumes. `scoreAgainstRubric` collects
the failed criteria's suggestions into the feedback string:

```ts
const failed = verdicts.filter((v) => !v.passed);
const feedback = failed.map((v) => `- ${v.key}: ${v.suggestion}`).join("\n");
```

That feedback is handed to the writer on the next pass, which is precisely the
"verbal reinforcement" Reflexion describes — the critique conditions the next
attempt (Shinn et al., 2023). A good suggestion is specific and imperative —
*"add a sign-off naming the sender"* — not a restatement of the failure. Vague
suggestions produce vague revisions.

## The anti-pattern

> **Anti-pattern — The score-only critic.** A judge that returns pass/fail with no
> evidence and no suggestion. You cannot audit its verdicts (so you cannot trust the
> routing) and the writer cannot act on them (so the loop cannot improve). It looks
> like a critic and functions like a coin flip with extra steps. Require evidence and
> suggestion in the schema.

## What you should now believe

A verdict is three things, not one: a judgment, the grounds for it, and the fix.
Force all three in the schema and your critic becomes auditable *and* your loop
becomes improvable. The boolean is the least important field.

## Try it

In a copy of the fake judge from the Module 2 test, make `suggestion` return `""`
for a failed criterion and run the suite. Watch the schema-validation expectations —
and imagine that empty suggestion reaching the writer. Restore it to a specific,
imperative fix. You just felt why the schema requires it.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG
evaluation using GPT-4 with better human alignment. In *Proceedings of the 2023
Conference on Empirical Methods in Natural Language Processing* (pp. 2511–2522).
Association for Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S. (2023).
*Reflexion: Language agents with verbal reinforcement learning* (arXiv:2303.11366).
arXiv. https://arxiv.org/abs/2303.11366
