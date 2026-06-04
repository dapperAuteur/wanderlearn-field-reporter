# Video script · Module 3 · Lesson 25 · A worked real bug from production

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 3 · Lesson 25 · A worked real bug from production
- **Duration:** ~6 min
- **Objective:** the viewer can explain how a fail-soft node hides a total failure and how a
  trace recovers it — on a real shipped agent.
- **Segments:** screencast (editor + terminal), talking-head close (module wrap).
- **Tag:** `course/lesson-25`.

## Block 2 — Pre-production

- `git checkout course/lesson-25`; deps installed.
- `tracing.ts` open at `detectFailSoftMasking`; `module-3-tracing.test.ts` open at the
  fail-soft block.
- Slide: the `classify` fail-soft fallback; the real error span; the fake-8%-eval.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Everything so far we induced on purpose. This is a real bug, from a shipped agent, a sibling
> product in this same ecosystem, where the trace was the only thing that revealed it.

**[Beat 2 · slide: the symptom · 0:30]**
> The witus-triage agent classifies messages into a category with a confidence score. Early
> on, every classification came back identical: category other, confidence zero. Not some,
> every single one. And here is what makes this a Module 3 lesson: the runs did not error. The
> test suite stayed green. Nothing threw. By every signal a normal workflow looks at, the
> system was fine. It was completely broken.

**[Beat 3 · slide: the cause · 1:30]**
> The classify node is fail-soft, the posture we said is correct for keeping a graph moving.
> On any LLM error it returns an other, confidence-zero fallback so one bad input cannot crash
> the graph. That safety net was catching every call. And the output it produced, other and
> zero, is valid-looking, a real category, a real number. So the assertions saw well-formed
> data and passed. The fallback meant for one bad input was swallowing all of them. Because it
> failed soft, it failed invisibly.

**[Beat 4 · slide: the trace · 2:40]**
> The output said confidence zero. The trace said something completely different. The model-
> call span, the child span the output threw away, carried the real error: your credit balance
> is too low to access the Anthropic API. Not a code bug. An unfunded key. Every call rejected
> for billing, every rejection caught by the fallback, every fallback a clean-looking other.
> The output could not show this, because by the time the fallback ran, the error was gone. The
> trace shows it, because it records the model span including its error, before any fallback
> rewrites the result. [cite: McDonald, n.d.]

**[Beat 5 · editor + terminal: detectFailSoftMasking · 3:45]**
> You can reproduce the shape in our loop. A fail-soft judge that blanket-fails every criterion
> makes the loop escalate every ticket while looking unalarming. The diagnostic flags it: the
> writer produced two-plus distinct drafts, yet not a single criterion ever passed. The test
> asserts both halves: the output is just escalated, green and unalarming, and the trace shows
> even a known-strong draft scored zero. Output says escalated. Trace says the critic never
> worked.

**[Beat 6 · slide: the deeper lesson · 4:45]**
> The resolution is not to remove fail-soft. It is to make the soft failure loud where it
> matters. In the trace, the error must survive on the span, that is why you trace. And in the
> evals: this same bug poisoned witus-triage's accuracy eval, the fallback results folded into
> the score and reported a fake eight percent that was really an infrastructure failure. The
> fix, detect the error-fallback signature and fail the eval loudly, is exactly the bridge into
> Module 4. [cite: McDonald, n.d.]

**[Beat 7 · talking-head · 5:30]**
> Module close. Tracing makes bugs legible, not rarer. You have now seen it on a real agent. A
> fail-soft node, the thing that keeps your graph alive, can turn a billing-level failure into
> clean output that passes every test. The output cannot save you. The trace can. Trace your
> loops, make every soft failure loud in the trace and the eval. And that eval, the one this bug
> poisoned, is Module 4.

## Block 4 — Post-production

- Beat 2: "green tests, useless output" slide with the all-other/zero results.
- Beat 3: highlight the try/catch fallback returning `other` / `0`.
- Beat 4: reveal the real error string on the model span; lower-third citation.
- Beat 5: zoom the two test assertions (escalated + masking true).
- Beat 6: the fake-8% eval slide; lower-third citation.
- Chapter markers at Beats 2, 3, 4, 5, 6, 7.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** the `classify` fail-soft fallback snippet (slide).
- **Beat 4:** trace slide; the model span error string revealed.
- **Beat 5:** `tracing.ts` — `detectFailSoftMasking`; terminal run pointing at the fail-soft
  describe block (escalated + masking detected).
- **Beat 6:** the poisoned-eval slide (8% artifact).

## Bonus footage — Optional: find a real swallowed error in a LangSmith trace

> Optional. Requires a LangSmith account and a deliberately-broken run. Record ~75s.

**Pre-production:** unset/expire the model key so calls fail; a fail-soft judge; tracing on.

**VO (verbatim):**
> Optional, and the most useful five minutes you will spend. Break it on purpose: expire your
> model key so calls fail, keep the fail-soft judge, and turn tracing on. Run the loop. The
> output looks unalarming, it just escalates. Now open the trace in LangSmith, click the
> critique span, then the model-call span underneath. There is the real error, the one the
> fallback swallowed. This is the witus-triage bug, on your screen. Once you have seen a
> swallowed error surface on a span, you will never trust output-only again.

**Shot list:** expire the key; run a traced loop; show the green-looking escalated output; open
LangSmith; drill root → critique span → model span; reveal the auth/billing error on the span.
