# Module 6 · Lesson 39 · Designing a rubric for a new domain

> **Tag:** `course/lesson-39` · **Module 6: Capstone** · ~5 min

## The model you are about to install

The only genuinely domain-specific artifact in the capstone is the **rubric** — and writing it is
where Module 2's craft transfers. This lesson designs a rubric for legal-clause → plain-language
rewriting from scratch, applying the same rules (single, observable, independent, weighted criteria)
to a domain that has nothing to do with support replies. By the end you have *done* the transfer, not
just read about it.

## Start from what "good" means here

A good plain-language rewrite is not "friendly" or "clear" (those are vague — Lesson 14). Ask: what
can a reader *verify* in the rewritten text? Four checkable properties
(`examples/capstone-plain-language/index.ts`):

```ts
export const plainLanguageRubric: RubricCriterion[] = [
  { key: "preserves_obligation", description: "Keeps the core obligation or action of the original clause.", weight: 1 },
  { key: "plain_language",       description: "Uses short sentences a non-lawyer can read.",                  weight: 1 },
  { key: "no_legalese",          description: "Contains no legalese (shall, herein, pursuant, etc.).",        weight: 1 },
  { key: "direct_address",       description: "Addresses the reader directly as 'you'.",                      weight: 0.5 },
];
```

Each criterion passes Module 2's tests:

- **Single, not compound (Lesson 16).** "preserves the obligation" and "no legalese" are separate
  keys, not "faithful and readable." Run `findCompoundCriteria` on this rubric and it returns `[]`.
- **Observable, not vague (Lesson 14).** "no legalese" is checkable by scanning for a word list;
  "plain_language" is checkable by sentence length. Neither asks the judge to feel anything.
- **Independent, not overlapping (Lesson 15).** A rewrite can be faithful but still legalese-laden
  (`preserves_obligation` passes, `no_legalese` fails), or plain but unfaithful — so the criteria
  split real drafts apart.
- **Weighted as policy (Lesson 18).** `direct_address` is a 0.5 nudge: preferring "you" is good
  plain-language practice, but a rewrite that is faithful, short, and legalese-free should not *fail*
  merely for phrasing in the third person. The blocking checks are the three that define correctness.

## The domain-specific tension: fidelity vs. simplicity

Every domain has a central tension the rubric must encode, and naming it is the design work. For
plain language it is **fidelity vs. simplicity**: the easiest way to make a clause readable is to drop
its hard parts, which destroys its legal meaning. So `preserves_obligation` (fidelity) and
`plain_language` (simplicity) are *both* blocking and *deliberately in tension* — a good rewrite must
satisfy both at once, which is exactly the hard part of the task. A rubric that only rewarded
simplicity would pass a rewrite that lost the obligation; one that only rewarded fidelity would pass
the original. Encoding the tension is what makes the critic actually steer toward *good*.

(For support replies, the central tension was completeness vs. brevity; for commit messages it would
be informativeness vs. conciseness. Find your domain's tension and make both sides blocking.)

## The hard case the rubric must catch

The corpus includes a legalese-saturated clause — *"Pursuant hereto, remittance shall be tendered
forthwith."* — that a naive rewrite cannot make plain without either dropping the obligation or
keeping a legalese term. The rubric *catches* this: a rewrite that echoes "pursuant" passes fidelity
but fails `no_legalese`, so it does not slip through. A rubric that could not distinguish this case
from a genuinely plain rewrite would be useless, and the capstone test asserts the `remittance` clause
fails — proof the rubric discriminates.

## What you should now believe

Writing a rubric for a new domain is the same craft as Module 2, applied to a new "good": find the
verifiable properties, keep them single and independent, weight the nudges below the blockers, and —
the domain-specific move — encode the central tension as two blocking criteria that pull against each
other. The craft transfers; only the criteria change.

## Try it

Add a fifth criterion to `plainLanguageRubric` — `defines_terms` ("explains any technical term it
keeps"), weight 0.5 — and decide: blocking or nudge? Run `findCompoundCriteria` to confirm it is
atomic, then re-run the capstone test and see whether the pass rate moves. You just extended a
new-domain rubric using Module 2's rules.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG evaluation using GPT-4
with better human alignment. In *Proceedings of the 2023 Conference on Empirical Methods in Natural
Language Processing* (pp. 2511–2522). Association for Computational Linguistics.
https://doi.org/10.18653/v1/2023.emnlp-main.153

Plain Language Action and Information Network. (n.d.). *Federal plain language guidelines*
[Public domain]. https://www.plainlanguage.gov/
