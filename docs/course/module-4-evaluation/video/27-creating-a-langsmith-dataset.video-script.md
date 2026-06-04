# Video script · Module 4 · Lesson 27 · Creating a dataset

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 4 · Lesson 27 · Creating a dataset
- **Duration:** ~5 min
- **Objective:** the viewer can assemble a small, curated, id-stamped dataset that
  deliberately includes hard cases, and map it to a LangSmith dataset.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-27`.

## Block 2 — Pre-production

- `git checkout course/lesson-27`; deps installed.
- `eval.ts` open at `supportReplyDataset` and `firstKeyword`.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> An eval needs something to run on: a dataset of representative inputs. For a reflection
> loop, that is just the inputs the loop runs on. For support replies, a list of tickets.

**[Beat 2 · editor: the dataset · 0:25]**
> Here are ten. Two design choices matter more than the count. Stable ids: each example has an
> id, so a result is traceable to its input and pairwise comparison joins two runs by id. And
> curated coverage, not random sampling: these span a defect, a delay, a billing error, a bug,
> a promo failure, and at least one case the system struggles with on purpose.

**[Beat 3 · editor: the dead case · 1:30]**
> That last one. The dead ticket: it will not turn on at all. It has no content word the reply
> can grab to acknowledge the issue, first-keyword returns empty. So the loop cannot pass it.
> That is not a flaw. It is the most valuable example in the set. A dataset of only easy cases
> reports a hundred percent and tells you nothing. The hard cases are where the signal lives,
> they are the examples that move when you change the writer, the rubric, or the model.

**[Beat 4 · slide: map to LangSmith · 2:35]**
> In LangSmith this same list becomes a dataset: create it once with the client, or upload runs
> you already traced, then call evaluate with data and evaluators against it. The shapes are
> identical, examples with inputs and ids, so everything here transfers. [cite: LangChain, n.d.]

**[Beat 5 · talking-head · 3:25]**
> And the best examples are not invented, they are captured. Every time the loop escalates in
> production, or you find a bad output, that input is a candidate for the dataset. Module 3's
> traces are the source. The dataset is a living record of every failure you have already paid
> for once. Small, curated, id-stamped, and deliberately including the cases you struggle with.

## Block 4 — Post-production

- Beat 2: highlight the `id` fields and the variety of ticket types.
- Beat 3: highlight the `dead` example; show `firstKeyword("It will not turn on at all.")` → `""`.
- Beat 4: LangSmith dataset mapping slide; lower-third citation.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `eval.ts` — scroll `supportReplyDataset`; highlight ids.
- **Beat 3:** terminal — `npx tsx -e` snippet printing `firstKeyword` for the dead vs blender ticket.
- **Beat 4:** LangSmith-dataset mapping slide.

## Bonus footage — Optional: upload the dataset and run evaluate() in LangSmith

> Optional. Requires a LangSmith account (operator task 09). Record ~90s.

**Pre-production:** LangSmith env vars set; a short script using the LangSmith SDK to create
the dataset + examples and call `evaluate`.

**VO (verbatim):**
> Optional, and the moment the offline array becomes a shared, versioned dataset. With your
> LangSmith key set, create a dataset, push the ten examples, then call evaluate with your
> target and an evaluator that wraps the rubric. Open LangSmith and there is the run: per-example
> scores, the aggregate, and every output one click from its trace. Same examples, same rubric,
> now with a UI and history.

**Shot list:** run a script calling `client.createDataset` + `createExamples` with the ten
tickets; call `evaluate(target, { data, evaluators })`; open smith.langchain.com → the dataset →
the experiment; show per-example pass/fail and the aggregate; click one example into its trace.
