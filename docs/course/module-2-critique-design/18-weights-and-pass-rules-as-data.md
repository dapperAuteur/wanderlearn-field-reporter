# Module 2 · Lesson 18 · Weights and pass rules as data, not in node code

> **Tag:** `course/lesson-18` · **Module 2: Critique design** · ~5 min

## The model you are about to install

You have well-written, independent, grounded criteria. The last design decision is
how their verdicts *combine* into a single pass — and that decision is **data**, not
logic buried in the node. By the end you can change a loop's bar (which checks block,
what threshold passes) without touching a line of node code, and you will see why
that separation is what makes Module 4's evals possible.

## Two things that must not live in the node

A critique node is tempted to grow an `if`:

```ts
// ✗ pass rule hard-coded in the node
if (acknowledged && hasNextStep && hasSignoff) return { passed: true };
```

Every change to the bar now means editing node code, re-reading the control flow,
and re-testing the graph. Worse, the *same* logic gets re-implemented when you reuse
the rubric offline as an eval (Module 4) — and the two copies drift. Both the
**weights** and the **pass rule** belong in data, beside the rubric.

## Weights as data

Each criterion already carries a weight: `1` blocks, `0.5` nudges. The weight is a
*policy* statement — "a missing next step should fail the reply; a missing timeline
should not, on its own." Promoting `states_timeline` from a nudge to a blocker is a
one-character data edit, and the Module 2 test proves the outcome flips with no code
change:

```ts
const noTimeline = /* verdicts where states_timeline failed */;
applyPassRule(noTimeline, supportReplyRubric, { kind: "all-blocking" });   // true  (0.5 nudge)
const stricter = supportReplyRubric.map(c =>
  c.key === "states_timeline" ? { ...c, weight: 1 } : c);                  // promote in DATA
applyPassRule(noTimeline, stricter, { kind: "all-blocking" });            // false (now blocks)
```

Same verdicts, same node, different bar — because the weight is data.

## The pass rule as data

*How* weights combine is itself a choice, so it is also data:

```ts
export type PassRule =
  | { kind: "all-blocking" }                               // every weight-1 check must pass
  | { kind: "weighted-threshold"; threshold: number };     // earned/total weight ≥ threshold
```

`applyPassRule` reads the rule and the rubric; it hard-codes neither:

```ts
applyPassRule(verdicts, rubric, { kind: "all-blocking" });                  // strict
applyPassRule(verdicts, rubric, { kind: "weighted-threshold", threshold: 0.5 }); // lenient
```

The Module 2 test scores one partial reply and shows it **fails** `all-blocking`
(it is missing a blocking check) yet **passes** `weighted-threshold` at 0.5 — same
verdicts, different policy, zero code change. That is the whole point: the bar is a
dial you turn in data.

## Why this separation is load-bearing for the rest of the course

- **Module 4 (evals).** The offline regression test reuses *this exact* rubric and
  pass rule as its scorer. If the pass rule lived in the node, the eval would have to
  re-implement it and the two would drift. Data-as-policy is what lets "the runtime
  rubric is also the offline test" be literally true.
- **Module 5 (production).** Tuning the threshold to trade quality against cost
  (fewer revisions) is a data change you can A/B and roll back — not a code deploy.

## The anti-pattern

> **Anti-pattern — Policy baked into the node.** Hard-coding which criteria block and
> what counts as a pass inside the critique node's control flow. It cannot be
> versioned or tuned without a code change, and it gets silently re-implemented (and
> desynced) the moment you reuse the rubric as an eval. Keep weights and the pass rule
> in data; let the node only *apply* them.

## What you should now believe (module close)

Look back at Lesson 13: *the rubric is the lever.* You now hold the whole lever —
criteria, weights, and the pass rule — as data the node merely reads. The critic is
auditable (evidence), improvable (suggestions), correct (no vague/overlap/compound
criteria), and tunable (data-driven weights and pass rule). The loop's quality is now
something you *edit*, not something you hope for.

And because the rubric is data, it can be two things at once: the runtime critic, and
the offline regression test. That double life is Module 4 — but first, Module 3 makes
the loop's behavior *visible*, because a critic you cannot trace is a critic you cannot
debug.

## Try it

Change `defaultPassRule` to `{ kind: "weighted-threshold", threshold: 0.75 }` and run
the Module 2 suite. Some assertions written for `all-blocking` will shift — read which,
and reason about whether 0.75 is too strict or too lenient for support replies. Restore
it. You just retuned the loop's bar without touching the graph.

## References

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG
evaluation using GPT-4 with better human alignment. In *Proceedings of the 2023
Conference on Empirical Methods in Natural Language Processing* (pp. 2511–2522).
Association for Computational Linguistics. https://doi.org/10.18653/v1/2023.emnlp-main.153

LangChain. (n.d.). *LangGraph documentation*. https://langchain-ai.github.io/langgraphjs/
