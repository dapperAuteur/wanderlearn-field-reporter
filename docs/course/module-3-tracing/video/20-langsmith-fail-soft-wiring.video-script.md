# Video script · Module 3 · Lesson 20 · LangSmith fail-soft wiring

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 3 · Lesson 20 · LangSmith fail-soft wiring
- **Duration:** ~5 min
- **Objective:** the viewer can wire fail-soft tracing (three env vars) and explain why
  observability must never be a dependency — and the mirror-image foot-gun.
- **Segments:** screencast (editor + terminal), talking-head bookends.
- **Tag:** `course/lesson-20`.

## Block 2 — Pre-production

- `git checkout course/lesson-20`; deps installed; LANGSMITH_* unset in the shell.
- `examples/support-reply-loop/tracing.ts` open at `tracingConfig`; test file open.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> Tracing is observability, and observability must never become a dependency. We wire
> LangSmith so the loop runs identically whether tracing is on or off.

**[Beat 2 · editor: tracingConfig · 0:25]**
> Three env vars. The API key authorizes uploads. The project groups the traces. And
> tracing-equals-true actually turns it on. Our config reads all three and decides without
> ever throwing. Two deliberate choices. Tracing is enabled only when the flag is true and
> a key is present, because a flag with no key cannot upload anything, so pretending it is
> on would be a lie. And the project name has a default, so a missing project is a harmless
> fallback, not a crash.

**[Beat 3 · slide: why fail-soft · 1:35]**
> Why is this non-negotiable? Make observability a hard dependency and you have built a
> system that goes down when its monitoring goes down. A developer with no LangSmith account
> could not run the app. A LangSmith outage would take down your product. CI could not run
> without secrets. So the rule: the absence of tracing config is a normal state, not an
> error.

**[Beat 4 · terminal: prove it · 2:35]**
> The test proves it. Tracing-config of an empty environment returns enabled false and does
> not throw. Run the suite with and without the vars set, identical result. That is
> fail-soft working.

**[Beat 5 · talking-head · 3:15]**
> Now the trap, and it is the heart of this module. Fail-soft is correct for infrastructure,
> tracing, a flaky dependency. But fail-soft applied to your core logic is how bugs hide. A
> node that swallows an LLM error and returns a fallback keeps the graph moving, good, and
> can silently catch every call while the system looks healthy, catastrophic. Lesson 25 is
> exactly that bug. Hold the distinction: fail soft on observability, fail loud on the work.

**[Beat 6 · talking-head · 4:05]**
> Observability is a luxury the system must survive without. Present keys enrich, absent
> keys are silent, and a missing dashboard never breaks a running loop. But watch the
> mirror-image trap in your core nodes.

## Block 4 — Post-production

- Beat 2: highlight the `&&` (flag AND key) and the `?? default` project.
- Beat 4: zoom the `enabled: false` assertion.
- Beat 5: split "fail soft: infra ✓ / core logic ✗".
- Chapter markers at Beats 2, 3, 5.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `tracing.ts` — `tracingConfig`; highlight the enable condition + default.
- **Beat 4:** terminal — `LANGSMITH_TRACING= npm run test -- tests/course/module-3-tracing.test.ts`,
  then with vars set; show identical pass.
- **Beat 5:** "fail soft where" slide.

## Bonus footage — Optional: provision LangSmith and watch a run upload

> Optional setup. Requires a LangSmith account (operator task 09). Record ~90s.

**Pre-production:** a LangSmith account; the three env vars ready to paste into `.env.local`.

**VO (verbatim):**
> Optional, and you never need it for a lesson. If you have a LangSmith account, copy the
> three vars into your env: the API key, a project name, and tracing equals true. Run the
> loop, then open the project in LangSmith. There is your run, uploaded automatically, the
> whole trace tree we are about to read. Nothing in the code changed. The keys just lit it up.

**Shot list:** paste `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`, `LANGSMITH_TRACING=true` into
`.env.local`; run `npx tsx examples/support-reply-loop/run.ts` (or a traced variant); open
smith.langchain.com, the project, and the new run; expand the trace tree. Emphasize:
"same code, keys just enrich it."
