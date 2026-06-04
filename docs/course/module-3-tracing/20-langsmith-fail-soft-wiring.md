# Module 3 · Lesson 20 · LangSmith fail-soft wiring

> **Tag:** `course/lesson-20` · **Module 3: Tracing reflection loops in LangSmith** · ~5 min

## The model you are about to install

Tracing is observability, and observability must never become a dependency. This
lesson wires LangSmith so that **the loop runs identically whether tracing is on or
off** — present keys light up the dashboards, absent keys change nothing. By the end
you can wire fail-soft tracing and explain why it is non-negotiable.

## The three env vars

LangSmith is configured by three environment variables (LangChain, n.d.):

- `LANGSMITH_API_KEY` — the account key that authorizes uploading traces.
- `LANGSMITH_PROJECT` — the project the traces are grouped under.
- `LANGSMITH_TRACING` — set to `"true"` to actually emit traces.

The course's config reads all three and decides, without ever throwing
(`examples/support-reply-loop/tracing.ts`):

```ts
export function tracingConfig(env = process.env): TracingConfig {
  return {
    enabled: env.LANGSMITH_TRACING === "true" && Boolean(env.LANGSMITH_API_KEY),
    project: env.LANGSMITH_PROJECT ?? "wanderlearn-foundation-course",
  };
}
```

Two deliberate choices. Tracing is enabled only when **both** the flag is `"true"`
**and** a key is present — a flag with no key cannot upload anything, so pretending it
is on would be a lie. And the project name has a **default**, so a missing
`LANGSMITH_PROJECT` is a harmless fallback, not a crash.

## Why fail-soft is non-negotiable

Make observability a hard dependency and you have built a system that goes down when
its *monitoring* goes down — the exact opposite of what monitoring is for. Concretely,
non-fail-soft tracing means:

- A developer who has not signed up for LangSmith cannot run the app at all. (Every
  lesson in this course would require an account. It does not.)
- A LangSmith outage, an expired key, or a network blip takes down *your* product.
- CI cannot run the suite without secrets.

So the rule: **the absence of tracing config is a normal state, not an error.** The
Module 3 test asserts exactly this — `tracingConfig({})` returns `enabled: false` and
does not throw, and the loop runs the same. This is the same fail-soft posture the
field-reporter agent in this repo takes: its `CLAUDE.md` states the app "must still
run if `LANGSMITH_API_KEY` is missing."

## A caution: fail-soft is also a foot-gun

Here is the tension this module turns on. Fail-soft is correct for *infrastructure*
(tracing, a flaky dependency) — but fail-soft applied to your *core logic* is how
bugs hide. A node that swallows an LLM error and returns a fallback keeps the graph
moving (good) **and** can silently catch every call while the system looks healthy
(catastrophic). Lesson 25 is a real production bug that was exactly this. Hold the
distinction: **fail soft on observability, fail loud on the work** — or at least make
the soft-failure visible *in the trace*.

## Turning it on (optional, not required for any lesson)

If you have a LangSmith account, set the three vars and runs upload automatically;
open the project and you will see the trace tree the next lessons read. If you do
not, everything still runs — the course's diagnostics work on a *local* trace the
loop records itself, so you learn to read the same signals offline. *(Optional setup
walkthrough: see this lesson's Bonus footage.)*

## What you should now believe

Observability is a luxury the system must survive without. Wire tracing so present
keys enrich and absent keys are silent, and never let a missing dashboard break a
running loop. But watch the mirror-image trap: the same fail-soft reflex that is right
for tracing is dangerous in your core nodes.

## Try it

Run the Module 3 test with and without `LANGSMITH_TRACING` set in your shell:
`npm run test -- tests/course/module-3-tracing.test.ts`. The result is identical —
that is fail-soft working. Then read `tracingConfig` and predict what
`tracingConfig({ LANGSMITH_TRACING: "true" })` (flag but no key) returns. Check
yourself against the test.

## References

LangChain. (n.d.). *LangSmith documentation*. https://docs.smith.langchain.com/
