# Module 4 · Lesson 27 · Creating a dataset

> **Tag:** `course/lesson-27` · **Module 4: Eval-driven reflection** · ~5 min

## The model you are about to install

An eval needs something to run *on*: a **dataset** of representative inputs. This lesson
builds one — small, hand-picked, and including the hard cases on purpose — and shows how
the local array maps onto a LangSmith dataset. By the end you can assemble a dataset that
earns its keep.

## A dataset is inputs, curated

For a reflection loop, the dataset is just the inputs the loop runs on — for support
replies, a list of tickets (`examples/support-reply-loop/eval.ts`):

```ts
export const supportReplyDataset: EvalExample[] = [
  { id: "blender", ticket: "My blender arrived with a cracked jar and won't seal." },
  { id: "late",    ticket: "The delivery is three days late and I needed it for an event." },
  { id: "double-charge", ticket: "I was charged twice for the same subscription this month." },
  // … ten in all …
  { id: "dead",    ticket: "It will not turn on at all." },  // the deliberately hard case
];
```

Two design choices matter more than the count:

1. **Stable ids.** Each example has an `id`, so a result is traceable to its input and you
   can talk about "the `dead` case failing" rather than "example 10." Pairwise comparison
   (Lesson 29) joins two runs *by id*.
2. **Curated coverage, not random sampling.** These ten are chosen to span the kinds of
   tickets the loop must handle — a defect, a delay, a billing error, a bug, a promo
   failure — *and* to include at least one case the system struggles with on purpose.

## Include the hard cases deliberately

The `dead` ticket — "It will not turn on at all." — has no content word the reply can
grab onto to acknowledge the issue (no noun ≥ 5 letters; `firstKeyword` returns `""`). So
the loop *cannot* pass it. That is not a flaw in the dataset; it is the most valuable
example in it.

A dataset of only easy cases reports 100% and tells you nothing — every change still passes,
so the eval cannot catch a regression *or* confirm an improvement. The hard cases are where
the signal lives: they are the examples that *move* when you change the writer, the rubric,
or the model. Put your known-hard inputs in the dataset on purpose, and label them so a
failure on `dead` reads as "expected-hard," not "something broke."

## Mapping to LangSmith

In LangSmith, this same list becomes a **dataset**: you create it once (via the SDK's
`Client.createDataset` / `createExamples`, or by uploading runs you have already traced)
and then call `evaluate(target, { data: "support-replies", evaluators: [...] })` against it
(LangChain, n.d.). The shapes are identical to the local version — examples with inputs and
ids — so everything you learn here transfers directly. The local array keeps the course
offline; the LangSmith dataset adds a shared, versioned, UI-browsable home for the same
examples. *(Optional: upload this dataset to LangSmith — see this lesson's Bonus footage.)*

## Datasets grow from production (the virtuous loop)

The best examples are not invented — they are *captured*. Every time the loop escalates a
ticket in production (Module 1) or you find a bad output, that input is a candidate for the
dataset. Module 3's traces are the source: a run you diagnosed becomes a regression test so
that bug can never silently return. The dataset is a living record of every failure you have
already paid for once.

## What you should now believe

A dataset is a small, curated, id-stamped set of representative inputs that *deliberately*
includes the cases your system struggles with — because those are the only cases that carry
signal. Build it from real failures, keep it small enough to read, and the same list serves
both the offline array and the LangSmith dataset.

## Try it

Add an 11th example to `supportReplyDataset` that you expect the loop to *fail* — e.g. a
ticket with two unrelated problems in one message. Re-run the Module 4 suite and watch the
pass rate move. A dataset where adding a hard case changes the number is a dataset doing its
job.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z.,
Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging
LLM-as-a-judge with MT-Bench and Chatbot Arena. In *Advances in Neural Information
Processing Systems 36* (pp. 46595–46623). Curran Associates. https://arxiv.org/abs/2306.05685
