# Module 2 · Lesson 15 · Failure mode 2 — overlapping criteria

> **Tag:** `course/lesson-15` · **Module 2: Critique design** · ~4 min

## The model you are about to install

The second failure mode is subtler than vagueness because each criterion looks fine
on its own. **Overlapping criteria** test the same underlying property more than
once, so a single defect is counted two or three times — silently distorting the
score and the feedback. By the end you can detect overlap and collapse it.

## What overlap looks like

Consider a rubric with these three:

- "Names the customer's problem."
- "Shows the customer they were understood."
- "Addresses the issue raised."

Read them again. They are three phrasings of *one* check: did the reply engage with
the actual problem? A draft that names the cracked blender passes all three; a draft
that does not, fails all three. The criteria are not independent — they *covary*.

## Why overlap is a real bug, not a cosmetic one

Overlap quietly breaks both halves of the critic:

1. **It distorts a weighted score.** If three of your five criteria are secretly the
   same check, "the customer's problem is named" is worth 60% of the score and
   everything else splits 40%. You did not decide that weighting; the redundancy did
   it for you, invisibly. The Pareto and threshold tuning in Module 5 will be built
   on a scale that lies.
2. **It triples the feedback.** When the draft fails the shared property, the writer
   gets three failing checks that all say the same thing. The revision over-corrects
   on that one axis and ignores the criteria that only appeared once.

Overlap is dangerous *precisely because each criterion passes the Lesson 14 test* —
every one is observable and checkable. The defect is not in any single criterion; it
is in the *relationship between* them. That makes it the easiest failure mode to
ship without noticing.

## The fix: criteria should be independent

A good rubric is a set of **independent** checks — each measures something the
others do not. The test for independence: *can you imagine a draft that passes this
criterion and fails that one, and vice versa?* If two criteria always pass together
and fail together, they are one criterion; merge them.

Apply it to the support-reply rubric:

- `acknowledges_issue` and `gives_next_step` are independent — a reply can name the
  problem (acknowledge) yet offer no action (no next step), and vice versa. ✓
- `gives_next_step` and `states_timeline` are *nearly* independent — you can give an
  action with no timeframe, or (rarely) a timeframe with no action. Kept separate
  deliberately, with the timeline as a 0.5 nudge so the near-overlap cannot
  double-count as two blocking checks. That weighting choice (Lesson 18) is how you
  manage residual overlap you cannot fully remove.

## Overlap vs. compound — not the same bug

Do not confuse this with the next lesson. **Overlap** is *two criteria testing one
property*. **Compound** (Lesson 16) is *one criterion testing two properties*. They
are mirror images: overlap over-counts, compound under-resolves. Both are fixed by
the same north star — *one criterion, one independent, observable property.*

## What you should now believe

A rubric is not just a list of good checks; it is a list of good checks that do not
secretly repeat each other. Independence is a property of the *whole rubric*, and you
earn it by checking, for every pair, whether a draft could split them.

## Try it

Take the support-reply rubric and add `"Engages with the customer's complaint."` as
a new criterion. By hand, score the STRONG and the weak reply from the tests against
both it and `acknowledges_issue`. They pass and fail together on every draft — that
is the overlap signature. Remove it. (No automated linter here: overlap needs the
imagine-a-splitting-draft judgment, which is the lesson.)

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG
evaluation using GPT-4 with better human alignment. In *Proceedings of the 2023
Conference on Empirical Methods in Natural Language Processing* (pp. 2511–2522).
Association for Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153
