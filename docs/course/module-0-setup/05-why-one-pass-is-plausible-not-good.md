# Module 0 · Lesson 5 · Why one pass is plausible, not good

> **Tag:** `course/lesson-05` · **Module 0: Reflection-loop primitive + setup** · ~5 min

## The model you are about to install

A first draft from a language model is *plausible*, not *good*, and the gap
between the two is exactly the gap a human writer closes by re-reading and fixing
what is weak. This lesson makes that gap concrete on a real support ticket, so
that in Lesson 6 the loop has something visible to close.

## A ticket, and a one-pass reply

Here is the thread domain for the next five modules — a customer support reply.
Take a real ticket:

> *"My blender arrived with a cracked jar and won't seal. I need it for a catering
> job this weekend."*

Ask a model, in a single call, to "write a friendly support reply," and you get
something like:

> *"Thanks so much for reaching out! We're really sorry to hear about your
> experience and we completely understand your frustration. Your satisfaction is
> our top priority and we're here to help. Please let us know if there's anything
> else we can do!"*

It is grammatical, warm, and **useless.** Read it against the ticket and notice
what is missing: it never names the cracked jar, never acknowledges the weekend
deadline, and — most damning — tells the customer *nothing about what happens
next.* There is no replacement, no timeline, no action. The model had no signal
about what a *good* support reply is, so it stopped at *plausible*: fluent,
on-topic, and empty.

## Why the model stops there

This is not a small or a careless model failing. Plausible is simply where
next-token prediction *ends*. A model trained to continue text will produce text
that reads like a support reply, because that is the most probable continuation of
"write a support reply." Nothing in that objective rewards *resolving the
customer's problem* — only *sounding like* a reply that might. Left ungrounded,
models produce fluent text that is confidently incomplete or wrong; this is a
well-documented failure mode of natural-language generation (Ji et al., 2023).

A longer, sterner prompt ("be specific! include a next step!") helps a little and
fails the same way: you are still asking one call to both *write* and *hold the
bar*, and when those compete inside a single forward pass, the bar loses. The
quality bar has to live *outside* the generator.

## The anti-pattern: "just prompt harder"

Name it, because you will be tempted by it for the rest of your career:

> **Anti-pattern — Prompt-harder.** Trying to close the plausible-to-good gap by
> piling requirements into the generation prompt. It conflates generation and
> judgment, has no measurable success signal, and degrades as you add
> requirements (each new clause competes with the others for the model's
> attention). The fix is structural, not textual: *a second step whose only job is
> to judge the first.*

Generation and judgment are different tasks, and a model is often a better critic
of a finished draft than a first-pass author of one — it is easier to notice that
a reply names no next step than to never omit one (Madaan et al., 2023). Reflexion
frames that judgment as "verbal reinforcement" that conditions the next attempt
(Shinn et al., 2023). Either way, the move is the same: externalize the bar.

## What "good" would look like

Hold the bad reply against three checks you can verify *by reading the text*:

1. Does it **name the specific issue** (the cracked jar, the broken seal)?
2. Does it give a **concrete next step** (a replacement, a timeline)?
3. Does it **close** properly (a sign-off, not a trailing pleasantry)?

The plausible reply fails all three. A good reply — "Hi, I'm sorry your blender
arrived with a cracked jar and won't seal. We'll ship a replacement today with
overnight delivery so you have it before the weekend, and email you tracking.
Best, …" — passes all three. The difference is not warmth or word count; it is
whether the reply *did the job*. Those three checks are the seed of a critic.

## What you should now believe

One pass gives you plausible. Good requires a *target* the generator does not hold
on its own, plus a second attempt at hitting it. That is a loop — and a loop needs
a thing that judges. In Lesson 6 you turn these three checks into a stub critic and
wire the cycle.

## Try it

Write the worst plausible-but-empty support reply you can for the blender ticket —
maximally warm, zero substance. Then score it against the three checks above by
hand. Keep both the reply and the scores; Lesson 6's stub critic should reproduce
your hand-scoring exactly.

## References

Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y. J.,
Madotto, A., & Fung, P. (2023). Survey of hallucination in natural language
generation. *ACM Computing Surveys, 55*(12), 1–38. https://doi.org/10.1145/3571730

Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U.,
Dziri, N., Prabhumoye, S., Yang, Y., Welleck, S., Majumder, B. P., Gupta, S.,
Yazdanbakhsh, A., & Clark, P. (2023). *Self-Refine: Iterative refinement with
self-feedback* (arXiv:2303.17651). arXiv. https://arxiv.org/abs/2303.17651

Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S.
(2023). *Reflexion: Language agents with verbal reinforcement learning*
(arXiv:2303.11366). arXiv. https://arxiv.org/abs/2303.11366
