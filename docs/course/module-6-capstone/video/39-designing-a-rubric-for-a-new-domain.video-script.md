# Video script · Module 6 · Lesson 39 · Designing a rubric for a new domain

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 6 · Lesson 39 · Designing a rubric for a new domain
- **Duration:** ~5 min
- **Objective:** the viewer can design a new-domain rubric with single/observable/independent/weighted
  criteria and encode the domain's central tension.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-39`.

## Block 2 — Pre-production

- `git checkout course/lesson-39`; deps installed.
- `index.ts` open at `plainLanguageRubric`; test open at the `remittance` assertion.
- Slide: the fidelity-vs-simplicity tension.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The only genuinely domain-specific artifact in the capstone is the rubric, and writing it is where
> Module 2's craft transfers. Let's design one for legal-to-plain-language from scratch.

**[Beat 2 · editor: the rubric · 0:30]**
> Start from what good means here. Not friendly, not clear, those are vague. What can a reader verify?
> Four properties. Preserves-obligation, keeps the core action. Plain-language, short sentences. No-
> legalese, no shall or herein or pursuant. Direct-address, speaks to you. Each passes Module 2's tests:
> single not compound, observable not vague, independent not overlapping. And direct-address is a half-
> weight nudge, the three blockers define correctness.

**[Beat 3 · slide: the central tension · 2:00]**
> Here is the domain-specific design work: every domain has a central tension the rubric must encode. For
> plain language it is fidelity versus simplicity. The easiest way to make a clause readable is to drop its
> hard parts, which destroys its legal meaning. So preserves-obligation and plain-language are both
> blocking and deliberately in tension. A good rewrite must satisfy both at once, which is exactly the hard
> part. Encoding the tension is what makes the critic steer toward good.

**[Beat 4 · editor + terminal: the hard case · 3:15]**
> And the rubric must catch the hard case. The corpus includes a legalese-saturated clause: pursuant
> hereto, remittance shall be tendered forthwith. A naive rewrite can't make it plain without keeping a
> legalese term. The rubric catches it: a rewrite that echoes pursuant passes fidelity but fails no-
> legalese. The test asserts the remittance clause fails, proof the rubric discriminates.

**[Beat 5 · talking-head · 4:10]**
> Writing a rubric for a new domain is the same craft as Module 2, applied to a new good. Find the
> verifiable properties, keep them single and independent, weight the nudges below the blockers, and encode
> the central tension as two blocking criteria that pull against each other. The craft transfers. Only the
> criteria change.

## Block 4 — Post-production

- Beat 2: highlight each criterion; tag weights.
- Beat 3: fidelity-vs-simplicity tension diagram (two arrows pulling).
- Beat 4: zoom the `remittance` fail assertion.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `index.ts` `plainLanguageRubric`.
- **Beat 3:** tension slide.
- **Beat 4:** terminal — run the capstone test; point at the `remittance` → false assertion.

(No optional steps in this lesson — no bonus footage.)
