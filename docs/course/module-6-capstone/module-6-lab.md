# Module 6 · Capstone lab · Ship a reflection loop on YOUR domain

> **Goal:** the real exit test of the course — build a working, measured reflection loop on a domain the
> course never named, reusing the engine and writing only a rubric and a dataset.
> **Success signal:** your loop converts most of your dataset, beats single-shot pairwise, clears a
> margin-aware threshold, and reports a convergence/cost dashboard — all green. Offline, no key.

Work from `course/lesson-43` (the full stack is available in `examples/`).

## Part A — Pick a domain and name its tension (required)

1. Choose a write → critique → revise domain **not** used in the course or capstone — e.g. release notes,
   API error messages, meeting summaries, product descriptions.
2. Write one sentence naming its **central tension** (Lesson 39) — the two good properties that pull
   against each other (e.g. for release notes: completeness vs. skimmability).

## Part B — Write the rubric (required)

1. Write a `RubricCriterion[]` for your domain: 3–4 criteria, each single, observable, independent, and
   weighted (the two sides of your tension are both *blocking*; nudges are 0.5).
2. Run `findCompoundCriteria` on it — it must return `[]`.
3. Write a deterministic judge (model it on `plainLanguageJudge` / `commitJudge`) that scores each
   criterion offline.

## Part C — Build the loop and the dataset (required)

1. Build the loop by reusing `TerminatingReplyStateAnnotation`, `routeWithAllPatterns`, and
   `scoreAgainstRubric` — copy `buildPlainLanguageLoop` and swap in your rubric. **Write no new router.**
2. Write a ~10-example dataset of inputs, including at least one deliberately hard case.
3. Write a `templated` (good) and an `echo`/`weak` (baseline) writer.

## Part D — Measure it (required)

Reuse the M4/M5 helpers unchanged:

1. `runEval`-style: loop vs single-shot pass rates.
2. `pairwise` → loop wins; `meetsThreshold(loop, 0.7)` → true, single → false.
3. `computeMetrics` over your run records → convergence rate + cost-per-converged-output.
4. `paretoFrontier` over three configs → identify the dominated one.
5. `assertNoInfraErrors` with a fail-soft judge → throws.

## Part E — Write the result (required)

In a short note, record: your domain, its tension, your rubric, the loop's pass rate vs single-shot, the
pairwise result, the convergence/cost numbers, and which Pareto point you'd ship. This note is the proof
you can redeploy the pattern without the notes.

## Self-check rubric

| Check | Pass condition |
|---|---|
| New domain | not used in the course/capstone; central tension named |
| Rubric | 3–4 single/observable/independent/weighted criteria; `findCompoundCriteria` → `[]` |
| Loop reused | router + scorer reused verbatim; no new termination code |
| Beats baseline | loop wins pairwise; clears 0.7; single-shot does not |
| Measured | convergence + cost-per-converged reported; Pareto dominated point identified |
| Loud-fail | a fail-soft judge makes `assertNoInfraErrors` throw |

All rows green → **you have completed the course.** You can build a reliable reflection loop on any domain.
