# Module 2 · Lesson 14 · Failure mode 1 — vague criteria

> **Tag:** `course/lesson-14` · **Module 2: Critique design** · ~5 min

## The model you are about to install

The first and most common way a rubric criterion fails: it asks a question the
judge cannot answer the same way twice. A **vague criterion** has no observable
referent in the text, so the LLM scores it by vibe — and a critic that scores by
vibe gives a reflection loop no usable signal. By the end you can spot a vague
criterion and rewrite it into a checkable one.

## What "vague" means precisely

A criterion is vague when **two careful readers (or two runs of the same model)
could reasonably disagree on pass/fail for the same draft.** The classic offenders:

- "Is engaging."
- "Sounds professional."
- "Is high quality."
- "Demonstrates empathy."

None of these point at anything *in the draft* you can confirm. "Engaging" is a
property of a reader's experience, not a fact about the text. So the judge has
nothing to ground a verdict on, and you get exactly what ungrounded LLM judgment
gives you: scores that wobble run to run on identical input (Liu et al., 2023).

## Why a vague criterion poisons the loop

A reflection loop routes on `critique.passed`. If a criterion is vague, `passed`
becomes partly random, and three bad things follow:

1. **False passes.** A weak draft gets waved through because the judge happened to
   feel generous, and the loop ships it.
2. **False fails / wasted revisions.** A good draft gets rejected on a coin-flip, so
   the loop burns a revision (and an LLM call) chasing a phantom defect.
3. **Useless feedback.** "Make it more engaging" tells the writer nothing it can
   act on, so the next draft changes at random rather than improving.

The termination patterns from Module 1 will still stop the loop — but they cannot
make a vibe-based critic *correct*. Garbage standard in, garbage loop out.

## The fix: name the observable

Rewrite every criterion so its pass/fail is decided by something you can point at
in the draft. The test: *could you highlight the words that make this pass?*

| Vague (unscoreable) | Checkable (observable) |
|---|---|
| "Sounds professional." | "Uses no slang or all-caps words." |
| "Is engaging." | "Opens with the customer's specific situation, not a generic greeting." |
| "Demonstrates empathy." | "Acknowledges the specific problem the customer reported." |
| "Is high quality." | *(split it — quality is many checks, see Lesson 16)* |

Notice the support-reply rubric was written this way already:
`acknowledges_issue` is "Names the specific problem the customer reported" — you can
highlight the words that satisfy it. That is the difference between a criterion an
LLM can score and one it can only guess at.

## The evidence test, built in

Module 2's judge must return **evidence** per criterion (Lesson 17). That
requirement is also a *vagueness detector*: if a criterion is checkable, the judge
can quote the words that pass or fail it; if it is vague, the "evidence" comes back
as a restatement of the verdict ("it seems professional"). When you see evidence
that just paraphrases the criterion, the criterion is vague — fix it.

## What you should now believe

A criterion the judge cannot ground is not a weak check; it is *no check* — a random
number wearing a rubric's clothes. Every criterion must name something observable in
the draft. If you cannot say what would make it pass, the LLM cannot either.

## Try it

Add a deliberately vague criterion to a copy of the rubric — `{ key: "is_friendly",
description: "Is friendly and warm.", weight: 1 }` — and run the compound-criteria
linter from Lesson 16 on it (`findCompoundCriteria`). It will flag the "and"; but
note that even the single-word version ("Is friendly") is *vague* in a way the
linter cannot catch. Vagueness is a judgment call the linter can only partly
automate — which is why this is a craft.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG
evaluation using GPT-4 with better human alignment. In *Proceedings of the 2023
Conference on Empirical Methods in Natural Language Processing* (pp. 2511–2522).
Association for Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li,
Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging
LLM-as-a-judge with MT-Bench and Chatbot Arena. In *Advances in Neural Information
Processing Systems 36* (pp. 46595–46623). Curran Associates. https://arxiv.org/abs/2306.05685
