# Wanderlearn Field Reporter

A [LangGraph](https://langchain-ai.github.io/langgraphjs/) agent that turns a raw
Wanderlearn capture — a location transcript, GPS, and photo references — into a
publishable lesson draft. The agent researches the location, drafts an
objectives-first outline, writes a cited lesson, then **self-critiques against a
rubric and revises** until the draft passes or hits a maximum revision count.

Part of the WitUS ecosystem; a sibling of
[Wanderlearn](https://wanderlearn.witus.online).

## Status — Day 6

**The full agent + operator UI + curriculum.** The agent runs the full
self-critique cycle:

```
research → outline → write → critique → (pass → image prompts | fail → revise | give up → human review)
```

`critique` scores the draft against the rubric in `src/agent/rubric.ts`. On a
failing score the graph loops back to `write` to revise; after `MAX_REVISIONS`
(3) failed attempts it routes to human review instead of looping forever.

The `research` node gathers material from three tools — Tavily web search
(capped at 5 calls per run by a node-level guard), Cloudinary photo metadata,
and the Wanderlearn course catalog — before the LLM synthesizes the facts.

The operator console lives at `/field-report`: submit a capture at
`/field-report/new`, then scrub a report's revision history in the side-by-side
viewer at `/field-report/:id`. Each run picks its LLM provider — Claude Sonnet
4.6 or Gemini 2.5 Flash — so draft quality can be compared. Full plan:
[`plans/PRD-3-wanderlearn-field-reporter.md`](plans/PRD-3-wanderlearn-field-reporter.md).

## Stack

Next.js 16 · TypeScript (strict) · Tailwind v4 · shadcn/ui ·
`@langchain/langgraph` · `@langchain/anthropic` + `@langchain/google-genai` ·
Drizzle ORM + Neon Postgres · LangSmith · Vitest · Node 20+.

## Quick start

```sh
# 1. Use Node 20+ (see .nvmrc)
nvm use

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
#    Fill in the values — .env.example documents where to get each key.
#    The agent needs ANTHROPIC_API_KEY; the rest are optional on Day 1.

# 4. Run the test suite (offline — the Day-1 test mocks the LLM)
npm test

# 5. Start the dev server
npm run dev
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` — strict, no `any` |
| `npm run lint` | ESLint |
| `npm test` | Vitest run |
| `npm run db:generate` | Generate the Drizzle migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations (needs `STORAGE_DATABASE_URL`) |

## Project layout

```
src/
  agent/
    rubric.ts     single source of truth for lesson quality (PRD §7)
    schemas.ts    Zod schemas + derived types for the agent state
    state.ts      LangGraph state (Annotation.Root)
    llm.ts        Claude Sonnet 4.6 model factory
    graph.ts      the agent graph; exports MAX_REVISIONS (default 3)
    nodes/        research · outline · write · critique ·
                  generateImagePrompts · flagForHumanReview
  db/schema.ts    Drizzle schema — field_reports, field_report_revisions
  lib/env.ts      lenient, validated environment access
  app/            Next.js app router
  components/     ecosystem site footer + shadcn/ui
tests/
  agent/critique.test.ts   Day-1 end-to-end graph wiring test
  fixtures/                placeholder MUCHO Museo del Chocolate capture
```

## Curriculum

Four code-along lessons on the LangGraph patterns behind this agent — each
taught on a different sample domain so the patterns transfer:

1. [Reflection loops](docs/lessons/01-reflection-loops.md)
2. [Writing rubrics an LLM can score](docs/lessons/02-writing-rubrics.md)
3. [Turning a rubric into a LangSmith eval](docs/lessons/03-langsmith-evals.md)
4. [Cyclic graphs without infinite loops](docs/lessons/04-termination.md)

## Environment

Every variable is documented in [`.env.example`](.env.example). LangSmith tracing
is on by default; the app runs fine without `LANGSMITH_API_KEY`.

## License

Private — © B4C LLC. An AwesomeWebStore.com brand.
