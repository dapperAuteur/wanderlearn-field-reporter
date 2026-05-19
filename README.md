# Wanderlearn Field Reporter

A [LangGraph](https://langchain-ai.github.io/langgraphjs/) agent that turns a raw
Wanderlearn capture — a location transcript, GPS, and photo references — into a
publishable lesson draft. The agent researches the location, drafts an
objectives-first outline, writes a cited lesson, then **self-critiques against a
rubric and revises** until the draft passes or hits a maximum revision count.

Part of the WitUS ecosystem; a sibling of
[Wanderlearn](https://wanderlearn.witus.online).

## Status — Day 1

**Scaffold + agent skeleton.** The graph runs end to end as a *linear* pipeline:

```
research → outline → write → critique → generateImagePrompts
```

The Day-1 `critique` node is a stub that always passes — the real critique node
and the cyclic reflection loop land on Day 2. Full plan:
[`plans/PRD-3-wanderlearn-field-reporter.md`](plans/PRD-3-wanderlearn-field-reporter.md).

## Stack

Next.js 16 · TypeScript (strict) · Tailwind v4 · shadcn/ui ·
`@langchain/langgraph` · `@langchain/anthropic` (Claude Sonnet 4.6) ·
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
| `npm run db:migrate` | Apply migrations (needs `DATABASE_URL`) |

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

## Environment

Every variable is documented in [`.env.example`](.env.example). LangSmith tracing
is on by default; the app runs fine without `LANGSMITH_API_KEY`.

## License

Private — © B4C LLC. An AwesomeWebStore.com brand.
