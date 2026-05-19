# Lesson 3 — Turning a rubric into a LangSmith eval

> Part of the Wanderlearn Field Reporter curriculum.

## A rubric is also a regression test

In Lesson 2 the rubric was a *runtime* critic — it scored a draft inside the
reflection loop. The same rubric has a second job: an **offline evaluation**
that runs in CI. A reflection loop tells you whether *this* draft is good; an
eval tells you whether a prompt change, a model upgrade, or a refactor just made
*every* draft worse.

This lesson turns a rubric into a LangSmith eval, on a new domain: the quality
of **customer-support replies**. LangSmith is LangChain's tracing-and-evaluation
platform; an eval there is a dataset plus an evaluator, run over your agent
(LangChain, n.d.).

## Step 1 — a dataset

An eval needs fixed inputs and a notion of the expected outcome. Ten examples is
enough to start — you are catching regressions, not certifying absolute quality,
and ten well-chosen tickets surface the obvious breakages.

```ts
import { Client } from "langsmith";
const client = new Client();

const dataset = await client.createDataset("support-reply-quality");
await client.createExamples({
  datasetId: dataset.id,
  examples: [
    { inputs: { ticket: "I was charged twice this month." },
      outputs: { notes: "must acknowledge the double charge and state a refund step" } },
    { inputs: { ticket: "How do I export my data?" },
      outputs: { notes: "must give the concrete steps, not a bare link" } },
    // ...eight more, chosen to span the ticket types you actually see
  ],
});
```

The `outputs` here are not exact expected replies — support replies are
open-ended — but *notes on what a good reply must contain*. The evaluator, not a
string match, decides.

## Step 2 — a custom evaluator

A custom evaluator is a function: it receives the run's output and the example,
and returns a score. Reuse the rubric pattern from Lesson 2 — an LLM judge
applying concrete criteria.

```ts
async function rubricEvaluator({ run, example }) {
  const reply = run.outputs.reply;
  const verdict = await judge.withStructuredOutput(VerdictSchema).invoke(
    `Score this support reply. The reply must:
     - directly address the customer's specific problem
     - state a concrete next step the customer or team will take
     - keep a calm, non-defensive tone
     For this ticket, a good reply ${example.outputs.notes}.
     Reply:\n${reply}`,
  );
  return { key: "rubric_pass", score: verdict.passed ? 1 : 0,
           comment: verdict.feedback };
}
```

The criteria are the same kind you learned to write in Lesson 2 — observable,
independent, single-purpose. The `comment` carries the judge's evidence, so a
failed eval is debuggable.

## Step 3 — run the eval

```ts
import { evaluate } from "langsmith/evaluation";

const results = await evaluate(
  (inputs) => runSupportAgent(inputs.ticket),
  { data: "support-reply-quality", evaluators: [rubricEvaluator] },
);
```

LangSmith runs the agent over all ten examples, applies the evaluator to each,
and records the scores against the dataset — every run comparable to the last,
each one a trace you can open and inspect.

## Step 4 — gate CI on it

The point is to catch regressions automatically. Compute the average score and
fail the build below a threshold:

```ts
const scores = results.results.map((r) => r.evaluationResults.results[0].score);
const avg = scores.reduce((s, n) => s + n, 0) / scores.length;
if (avg < 0.8) {
  throw new Error(`Support-reply quality regressed: ${avg.toFixed(2)} < 0.80`);
}
```

Wire that into a test the CI runner executes — guarded so it only runs when an
API key is present, since it makes real model calls.

## Setting the threshold

An LLM-judge eval is **noisy**: the same reply can score 1 on one run and 0 on
the next, because the judge is itself a sampled model (Zheng et al., 2023). Two
defences. First, pin the judge model and use temperature 0 — drift in the judge
looks exactly like drift in your agent. Second, set the threshold with margin:
if a healthy suite averages 0.95, gate at 0.80, not 0.94, or noise alone will
fail green builds. The eval is a smoke alarm, not a micrometer.

## Why ten examples is enough — to start

A ten-example set will not tell you your agent is 92% good. It will tell you
when a change drops three of those ten — and that is the failure you actually
need to catch before it ships. Grow the dataset every time a real bug slips
past it: add the example that would have caught it. The set becomes a precise
record of every way the agent has been wrong.

## Try it

1. Create a ten-example LangSmith dataset for a task you own.
2. Write one rubric evaluator, reusing Lesson 2's criteria style.
3. Run `evaluate`, then add the CI gate. Change a prompt and watch the score
   move.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z.,
Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023).
*Judging LLM-as-a-judge with MT-Bench and Chatbot Arena* (arXiv:2306.05685).
arXiv. https://arxiv.org/abs/2306.05685
