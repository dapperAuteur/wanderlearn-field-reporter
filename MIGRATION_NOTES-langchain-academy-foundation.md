# MIGRATION_NOTES — LangChain Academy Foundation course

> Course-scoped handoff. The repo's existing `MIGRATION_NOTES.md` belongs to the
> unrelated `feat/llm-provider-swap` branch and is left untouched; this course work
> lives in its own file.

**Course:** Foundation: Reflection-Loop Reliability
**Shipped so far:** **Modules 0–5** — setup, bounded termination, critique design,
tracing, eval-driven reflection, and production. **Module 6 (capstone, new domain)** is the
only module remaining, outlined in `docs/course/README.md`.

### Module 5 — Production (branch `feat/langchain-academy-foundation-module-5`, off main)
- `docs/course/module-5-production/` — README, lessons `32`–`37`, `module-5-lab/quiz/feedback`,
  and `video/32…37-*.video-script.md`.
- `examples/support-reply-loop/production.ts` — `runCost` (per-iteration accounting),
  `runProduction` + `computeMetrics` (convergence rate, avg iterations, runaway count,
  cost-per-converged-output), `checkAlerts`, `singlePassGoodEnough`, `abCompare`, `paretoFrontier`.
- `tests/course/module-5-production.test.ts` — 7 tests, deterministic/offline: cost accounting,
  metrics, runaway alerts, the single-pass gate, A/B critic compare, and the Pareto frontier.
- Tag `course/module-5`. typecheck + lint + course tests (44 across M0–M5) green.

### Module 4 — Eval-driven reflection (branch `feat/langchain-academy-foundation-module-4`, off main)
- `docs/course/module-4-evaluation/` — README, lessons `26`–`31`, `module-4-lab/quiz/feedback`,
  and `video/26…31-*.video-script.md`.
- `examples/support-reply-loop/eval.ts` — reuses the runtime rubric as the eval: 10-example
  `supportReplyDataset`, `evaluateDraft` (wraps `scoreAgainstRubric`), `runEval`, `pairwise`,
  `meetsThreshold` (margin-aware), `assertNoInfraErrors` (loud-fail on the error-fallback
  signature — the witus-triage "fake 8%" guard), plus deterministic offline stand-ins.
- `tests/course/module-4-evaluation.test.ts` — 8 tests, deterministic/offline: rubric reuse,
  loop 9/10 vs single-shot 0/10, pairwise, margin threshold, a caught regression, and the
  loud-fail guard. Loop target uses Module 2's `buildRubricReplyLoop`.
- Tag `course/module-4`. typecheck + lint + course tests (37 across M0–M4) green.

### Module 3 — Tracing in LangSmith (branch `feat/langchain-academy-foundation-module-3`, off main)
- `docs/course/module-3-tracing/` — README, lessons `19`–`25` (7 lessons),
  `module-3-lab/quiz/feedback`, and `video/19…25-*.video-script.md`.
- `examples/support-reply-loop/tracing.ts` — fail-soft `tracingConfig`/`isTracingEnabled`
  (3 LangSmith env vars), `buildTracedReplyLoop` (records a local `RunTrace`), and
  diagnostics `findWastedIterations`, `detectCriticDrift`, `didNotConverge`,
  `detectFailSoftMasking`.
- `tests/course/module-3-tracing.test.ts` — 8 tests, deterministic/offline (no LangSmith
  account): fail-soft config, trace recording, each diagnosis, and the fail-soft-masking bug.
- **F5 = 5 lesson:** Lesson 25 is the REAL witus-triage "other / confidence 0" production
  bug (fail-soft `classify` node masking an unfunded-key error; the trace carried the real
  error; it also poisoned the eval into a fake 8%). Cited APA-7 as `McDonald (n.d.)` from the
  witus-triage repo README + `plans/01-fix-accuracy-eval.md`.
- Tag `course/module-3`. typecheck + lint + course tests (29 across M0–M3) green.

### Module 2 — Critique design (branch `feat/langchain-academy-foundation-module-2`, off Module 1)
- `docs/course/module-2-critique-design/` — README, lessons `13`–`18`,
  `module-2-lab/quiz/feedback`, and `video/13…18-*.video-script.md`.
- `examples/support-reply-loop/rubric.ts` — rubric as DATA; `CriterionVerdictSchema`
  (evidence + suggestion required, Zod); `applyPassRule` (all-blocking /
  weighted-threshold); `findCompoundCriteria` (failure-mode-3 linter);
  `buildRubricReplyLoop` (rubric critic in Module 1's bounded loop).
- `tests/course/module-2-critique.test.ts` — 10 tests, deterministic/offline (a fake
  judge stands in for the LLM): schema enforcement, pass-rule-as-data, weight changes,
  the linter, and loop integration.
- Tag `course/module-2`. typecheck + lint + course tests (21 across M0–M2) green.
- **Merge note:** branched off the Module 1 tip; Module 1 is already merged to `main`,
  so this applies cleanly on top.

### Module 1 — Bounded termination (branch `feat/langchain-academy-foundation-module-1`)
- `docs/course/module-1-termination/` — README, lessons `07`–`12`, `module-1-lab/quiz/feedback`,
  and `video/07…12-*.video-script.md`.
- `examples/support-reply-loop/termination.ts` — `buildBoundedReplyLoop` (counter +
  convergence + escalation composed in priority order), `buildUncappedReplyLoop`
  (the `recursionLimit` backstop demo), `hasConverged`.
- `tests/course/module-1-termination.test.ts` — 7 tests, deterministic/offline:
  each termination pattern isolated, plus the recursionLimit throw.
- Tag `course/module-1`. typecheck + lint + course tests (11) green.

---

### Module 0 (below) — pilot, branch `feat/langchain-academy-foundation-module-0` (merged)

---

## Files added per area (Module 0)

**Course scaffold (course-wide)**
- `docs/course/README.md` — 6-module spine, mental-model-per-module, rotating-domain
  story (support replies → legal-clause capstone), dual-track note, MIT-scaffold attribution.
- `docs/course/bibliography.md` — course-wide APA-7 reading list.
- `docs/course/production/video-script-format.md` — the 5-block script format +
  the optional-step → bonus-footage / commented-code rule.
- `docs/course/production/recording-stack.md` — gear/software spec (the STOP gate).

**Module 0 (`docs/course/module-0-setup/`)**
- `README.md` — module opener/closer + index.
- `01-course-overview.md` … `06-the-minimal-write-critique-loop.md` — six lessons.
- `module-0-lab.md`, `module-0-quiz.md`, `module-0-feedback.md`.
- `video/01…06-*.video-script.md` — six word-for-word video scripts.

**Runnable artifact + test**
- `examples/support-reply-loop/graph.ts`, `run.ts` — the minimal loop (stub critic,
  injected writer, MAX_REVISIONS cap). Offline: `npx tsx examples/support-reply-loop/run.ts`.
- `tests/course/module-0-loop.test.ts` — the F4 success signal (4 tests, no network).

**Operator tasks** (gitignored `plans/user-tasks/`, local handoff): `07-recording-stack`,
`08-video-host-signup`, `09-langsmith-team-tier`, `10-capstone-corpus-legal-clauses`;
index `00-descriptions.md` updated.

---

## Rubric self-scoring (Module 0 pilot — validates the mechanisms; full scores need all modules)

| # | Criterion | Pilot score | Evidence |
|---|---|---|---|
| F1 | Module/lesson spine | **4** | Module opens with "the model you install", closes with "what you should now believe"; lessons numbered + ordered with stated deps. 5 needs the full 6-module chain + final→first callback (outlined, not built). |
| F2 | Durable mental model | **4** | Pattern + "prompt-harder" anti-pattern named; thread-domain (support replies) set, capstone domain (legal clauses) committed. 5 needs the realized 2nd domain + transfer test at the capstone. |
| F3 | Foundation scale | **n/a (pilot)** | Module 0 ≈ 25 min of the 1.5–3 hr target; met at full 24-lesson scale by design. Not a stop condition — sequencing. |
| F4 | Hands-on + success signal | **5** | Runnable loop + deterministic vitest (4 green, no network) + per-lesson `Try it` + lab self-check rubric + `course/lesson-NN` checkpoints. |
| F5 | Anti-patterns named | **4** | "Prompt-harder" named with code-level failure + principle-level fix (L5); stub critic shows where brittle checks break. 5 needs a real diagnosed production bug (planned: witus-triage "other / 0 confidence" in Module 3). |
| F6 | APA-7 + primary lit | **5** | Every lesson has `## References` in APA-7; bibliography carries Self-Refine, Reflexion, G-Eval, MT-Bench, Ji et al., + LangGraph/LangSmith docs. |

No criterion is below 3 in pilot scope. No §3.1 deal-breaker violated (module spine ✅,
paper citations ✅, dual Python+TS ✅, capstone domain chosen ✅; F3 reached at full scale).

## Verification run this session

- `npm run typecheck` → clean.
- `npx eslint examples/support-reply-loop tests/course` → clean.
- `npm run test -- tests/course/module-0-loop.test.ts` → 4 passed.
- `npx tsx examples/support-reply-loop/run.ts` → loop converges (Rev 1 fails → Rev 2 PASSED), offline, no key.

## Known issue (pre-existing, NOT from this work)

`tests/agent/termination.test.ts` has 2 failing assertions. Confirmed pre-existing:
it fails identically on a clean `main`-equivalent tree (stash-verified), and this
branch touches nothing under `src/` or `tests/agent/`. Out of scope here; flag for a
separate fix on its own branch.

## Test-reader transfer test (F2)

Deferred to the capstone (Module 6): capstone domain (legal clause → plain language)
is new vs. Modules 0–4; a test-reader then applies the patterns to a third domain.
Not exercisable from the Module 0 pilot alone.

## Open items / blocked on operator tasks

- **Recording:** not started (kickoff STOP gate) — blocked on `plans/user-tasks/07-recording-stack.md`.
- **Video host:** `08-video-host-signup.md`.
- **LangSmith dashboards (Modules 3–5 + capstone):** `09-langsmith-team-tier.md` (not needed for Module 0).
- **Capstone corpus:** `10-capstone-corpus-legal-clauses.md`.
- **bam-landing-page PR:** NOT opened — the landing flips 🟡→🟢 only when the full
  course ships, not at the pilot. (Do NOT edit bam-landing-page from this branch.)
- **LangSmith project URL:** pending account (task 09).
- **Bundle branch:** not created — `bundle/langchain-academy-foundation-<date>`
  consolidates per-module branches once Modules 1+ exist (branch-hygiene Half 3).

## Docker question (BAM's blocker — resolved)

The course does **not** require Docker Desktop. The repo runs `@langchain/langgraph`
in-process; the course loop runs via `npx tsx` + `npm run test`. The optional
`langgraph dev` Studio path is in-memory and Docker-free; Docker only enters with
`langgraph up` (self-hosted, out of scope). macOS 13.7.8 + the unsupported Docker
Desktop 4.48 is therefore not a blocker. See `docs/course/production/recording-stack.md`.

## Handoff

Branch `feat/langchain-academy-foundation-module-0` pushed; tag `course/module-0` at
the runnable checkpoint. **Do NOT merge to main — BAM merges.**
