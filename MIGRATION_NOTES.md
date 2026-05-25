# Migration notes — `feat/llm-provider-swap` (field-reporter)

**Goal:** add five free LLM providers (Ollama local + four hosted free tiers)
to the field-reporter's chat-model factory so dev loops and the deployed
instance can run at $0 in the normal case, while Anthropic and Google stay
selectable as paid options. Mirrors the swap that landed in
`witus-triage-agent` and `centenarian-coach-multiagent` — but bigger here,
because wanderlearn had **no `/admin` model dashboard** before this branch.

## What's different from coach / triage

- **Per-run provider override stays.** `state.llmProvider` is the documented
  PRD §App. A feature — operators pick a provider per run to compare draft
  quality. Extended from 2 options (Claude/Gemini) to 7 with the same
  Free/Paid grouping the admin dashboard uses.
- **One model per provider, not per-role.** wanderlearn's nodes are all
  substantive generation work (research, outline, write, critique, image
  prompts). Coach and triage do per-role because their nodes have different
  latency/cost tradeoffs; the field reporter does not.
- **`/admin/models` is new.** Lives at a sub-route under the existing
  `/admin` (waitlist). A nav link bridges the two.

## Files changed / created

### Factory + dispatch
- `src/agent/llm-config.ts` *(new, zero imports)* —
  `FIELD_REPORTER_PROVIDERS` const tuple; `LlmProvider` derived from it;
  `PROVIDER_COST_CLASS`, `PROVIDER_LABELS`, `DEFAULT_MODELS` (one model id
  per provider).
- `src/agent/schemas.ts` — `LlmProviderSchema` is now
  `z.enum(FIELD_REPORTER_PROVIDERS)`; `LLM_PROVIDER_LABELS` re-exports the
  cost-class-aware labels from `llm-config`.
- `src/agent/llm.ts` — rewritten with an exhaustive `switch (provider)` over
  the seven-member union; new cases for Ollama / Mistral /
  Cerebras / OpenRouter / Together. `getChatModel` is now **async** because
  it reads the per-provider model id from `app_settings`. Adds an optional
  `provider` override to `ChatModelOptions` so the fallback chain can build
  models for specific providers regardless of stored settings.
- `src/agent/with-fallback.ts` *(new)* — `parseFallbackProviders()` +
  `buildChatModelWithFallback({ provider, ... })`. Driven by
  `FIELD_REPORTER_FALLBACK_PROVIDERS`. Returns the bare primary when the env
  var is empty — preserves the operator A/B comparison case.

### Call sites (5 nodes, all moved to the fallback variant)
- `src/agent/nodes/research.ts`
- `src/agent/nodes/outline.ts`
- `src/agent/nodes/write.ts`
- `src/agent/nodes/critique.ts`
- `src/agent/nodes/generateImagePrompts.ts`

Each call now reads
`(await buildChatModelWithFallback({...})).withStructuredOutput(...)`.

### API route
- `src/app/api/field-report/generate/route.ts` — when the request body omits
  `llmProvider`, the route reads `getStoredSettings()` to use the
  admin-stored default. Body-supplied `llmProvider` still wins (operator A/B).

### Settings + persistence
- `src/db/schema.ts` — adds the `appSettings` table (singleton row;
  `provider`, `models` jsonb keyed by provider, `temperature`, `maxTokens`,
  `tracingEnabled`, `updatedAt`).
- `src/db/migrations/0004_lyrical_doctor_spectrum.sql` *(new)* — generated
  by `npm run db:generate`. Applies on the next `npm run db:migrate`.
- `src/lib/settings.ts` *(new)* — `getStoredSettings`, `getSettings` (with
  10s cache + env override), `updateSettings`, `invalidateSettingsCache`,
  `providerOverride` (`FIELD_REPORTER_LLM_PROVIDER`), `resolveSettings`,
  `mergedModels`.

### Admin dashboard
- `src/app/admin/page.tsx` — adds a nav link "Model configuration →" pointing
  at the new sub-route. Existing waitlist page otherwise unchanged.
- `src/app/admin/models/page.tsx` *(new)* — server component, gates with
  `requireUser()`, computes `providerKeyPresent` from env, renders form.
- `src/app/admin/models/SettingsForm.tsx` *(new)* — client component with
  Free/Paid `<optgroup>` provider select, persistent amber-when-paid status
  banner, per-provider model dropdowns with the same Free/Paid coloring,
  custom-ID escape hatch, generation defaults, tracing toggle.
- `src/app/api/admin/settings/route.ts` *(new)* — GET/PUT, Zod schema
  derived from `FIELD_REPORTER_PROVIDERS`, `requireApiUser` gate.

### Capture form
- `src/app/field-report/new/page.tsx` — picker extended from 2 options to 7,
  Free/Paid `<optgroup>` grouping, with a small note linking to
  `/admin/models` so operators know where the default lives. Form default
  stays `anthropic` for now; pre-fill-from-admin-default is a future
  enhancement (would require restructuring the page from client-only to a
  server wrapper).

### Config + docs
- `src/lib/env.ts` — Zod schema gains the five new env vars
  (`CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`,
  `TOGETHER_API_KEY`, `OLLAMA_BASE_URL`) plus `FIELD_REPORTER_LLM_PROVIDER`
  and `FIELD_REPORTER_FALLBACK_PROVIDERS`.
- `.env.example` — reworked Free-vs-Paid block; all five key slots
  documented with signup URLs.
- `plans/user-tasks/06-provision-free-provider-keys.md` *(new)* — operator
  task for BAM: sign up, paste keys into `.env.local` and Vercel env,
  trigger deploy, apply migration 0004.

### Tests
- `tests/agent/llm.test.ts` *(new)* — 12 cases: per-provider dispatch,
  missing-key throws, per-call provider override, fallback parser.

### Dependencies
- Added: `@langchain/ollama`, `@langchain/openai`, `@langchain/mistralai`.
- Kept: `@langchain/anthropic`, `@langchain/google-genai`. Selectable in the
  capture form and `/admin/models` as the paid options.

## Verification (run before merge)

```bash
npm run typecheck   # green
npm run lint        # green
npm test            # offline suite, no API keys needed
```

## Per-provider eval re-runs

**Not measured.** The existing rubric (`src/agent/rubric.ts`) is the source
of truth for lesson quality; the `critique` node scores every draft against
it. A real per-provider comparison requires running the agent end to end on
each provider against the MUCHO Museo del Chocolate fixture (or a similar
acceptance set) with at least one passing run. That work is blocked on
operator task 06 (the keys) and is best done with the live demo on each
provider. Document the resulting pass rates per provider in the README or a
dedicated EVAL.md when they exist.

## Deployment shape

For the deployed instance, in Vercel env:

```
FIELD_REPORTER_LLM_PROVIDER=cerebras            # optional run-default
FIELD_REPORTER_FALLBACK_PROVIDERS=openrouter,anthropic
```

Cerebras handles normal traffic at $0; OpenRouter catches the daily quota
wall; Anthropic catches anything that gets past OpenRouter as the paid
emergency tier. In the normal case the deployed agent costs $0.

**Leave both env vars UNSET on dev workstations** — that preserves the
clean per-run A/B comparison the rubric scores can trust.

## Known issues + caveats

- **Llama 3.3 70B ≠ Claude Sonnet 4.6** on structured output and tool
  calling. The rubric will flag regressions, but expect the bounded
  termination guard (MAX_REVISIONS) to fire more often on open-weight
  models. That is the safety guard working — not a defect.
- **Cerebras daily ceiling** — a bursty session can hit the wall.
  Mitigated by the env-opt-in OpenRouter fallback.
- **Free-tier ToS — some providers train on submitted traffic.** Read each
  provider's terms before pointing the deployed agent at it.
- **Form default still "anthropic".** The admin run-default is informational
  in the capture form UI; the picker still pre-fills `anthropic`. Wiring
  the form to read the admin default would require a server wrapper around
  the client component — deferred.

## Stop conditions

None tripped. The 5 LLM call sites are migrated; the existing test suite is
unchanged; LangSmith tracing is unaffected. Branch pushed, not merged. BAM
merges after reviewing this file.

## Sibling work

- `witus-triage-agent` `feat/llm-provider-swap` — landed, three nodes,
  per-node model selection.
- `centenarian-coach-multiagent` `feat/llm-provider-swap` — landed, three
  roles, per-role model selection.
- `plans/self-hosted-langchain/02-blog-post-draft.md` (in the witus repo)
  — the blog post draft has `[METRIC: ...]` placeholders the per-provider
  re-runs across all three repos will fill.
