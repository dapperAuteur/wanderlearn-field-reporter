# Module 2 · Lab · Diagnose and fix a broken rubric

> **Goal:** practice the craft — take a rubric riddled with all three failure modes,
> fix each, and prove the fixes with the linter and the pass-rule machinery.
> **Success signal:** `npm run test -- tests/course/module-2-critique.test.ts` green
> with your additions; `findCompoundCriteria` returns `[]` for your fixed rubric.
> Offline, no key.

Work on `course/lesson-18`. The code is `examples/support-reply-loop/rubric.ts`.

## The broken rubric (start here)

```ts
const brokenRubric: RubricCriterion[] = [
  { key: "quality",   description: "Is professional, clear, and high quality.", weight: 1 },
  { key: "empathy",   description: "Is empathetic and friendly.",               weight: 1 },
  { key: "understood",description: "Shows the customer they were understood.",  weight: 1 },
  { key: "acks",      description: "Names the customer's problem.",             weight: 1 },
];
```

## Part A — Find the compound criteria (required)

1. Run `findCompoundCriteria(brokenRubric)` (add it to a test). It flags `quality` and
   `empathy` (the "and"s).
2. Split each into atomic, observable checks (Lesson 16). `quality` is really several
   checks — pick the two that matter for a support reply and name them.

## Part B — Find the vague and overlapping criteria (required, by hand)

The linter cannot catch these — that is the lesson.

1. **Vague:** `empathy` ("Is empathetic") has no observable referent (Lesson 14).
   Rewrite it as something you can highlight in the draft.
2. **Overlap:** `understood` and `acks` covary — every draft passes or fails them
   together (Lesson 15). Prove it by scoring the STRONG and weak replies against both,
   then merge them into one.

## Part C — Add evidence/suggestion and a pass rule (required)

1. Write a fake judge for your fixed rubric (model it on the Module 2 test's
   `fakeJudge`) that returns grounded `evidence` and an imperative `suggestion`.
2. Score a partial reply with both `{ kind: "all-blocking" }` and
   `{ kind: "weighted-threshold", threshold: 0.6 }`; confirm they can disagree.
3. Make one of your checks a `0.5` nudge and show, via `applyPassRule`, that it cannot
   block on its own.

## Self-check rubric

| Check | Pass condition |
|---|---|
| Compound fixed | `findCompoundCriteria(yourRubric)` returns `[]` |
| Vague fixed | every description names something highlightable in the draft |
| Overlap fixed | no two criteria pass/fail together on every test draft |
| Verdicts complete | judge returns non-empty evidence + suggestion (schema parses) |
| Policy is data | a partial reply's pass differs under all-blocking vs weighted-threshold |

All rows green → you can diagnose and repair a rubric. On to Module 3 (tracing).
