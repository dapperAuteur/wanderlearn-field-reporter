# Wanderlearn Field Reporter

A [LangGraph](https://langchain-ai.github.io/langgraphjs/) agent that turns a raw
Wanderlearn capture — a location transcript, GPS, and photo references — into a
publishable lesson draft. The agent researches the location, drafts an
objectives-first outline, writes a cited lesson, then **self-critiques against a
rubric and revises** until the draft passes or hits a revision cap.

Part of the WitUS ecosystem; a sibling of
[Wanderlearn](https://wanderlearn.witus.online).

**Live:** <https://wanderlearn.field.reporter.witus.online>

**New here?** The in-app [`/help`](src/app/help/page.tsx) page onboards three
readers — visitors browsing reports, people creating lessons, and operators
running the app — without needing this README. This README is the deeper
engineering reference.

## The agent

```
research → outline → write → critique → ┬ pass     → image prompts
                       ▲                ├ fail     → revise (loop)
                       └────────────────┘ give up  → human review
```

`critique` scores the draft against the rubric in
[`src/agent/rubric.ts`](src/agent/rubric.ts) — the single source of truth for
lesson quality. A failing score loops back to `write`; after `MAX_REVISIONS` (3)
failed attempts the graph routes to human review instead of looping forever.

`research` gathers material from three tools — Tavily web search (capped at 5
calls per run by a node-level guard), Cloudinary photo metadata, and the
Wanderlearn course catalog — before the LLM synthesizes the facts.

Each run picks its LLM provider — Claude Sonnet 4.6 or Gemini 2.5 Flash — so
draft quality can be compared side by side.

## Operator console

`/field-report` lists every report. Submit a capture at `/field-report/new`,
then scrub a report's revision history in the side-by-side viewer at
`/field-report/:id` to see how each critique cycle changed the draft.

The read-only views — the report list and individual lessons — stay public so
visitors can browse the agent's work without signing in. The cost-incurring
paths (the capture form at `/field-report/new` and the `POST
/api/field-report/generate` endpoint) are single-user: the one address in
`ADMIN_EMAIL` signs in through an emailed magic link, a jose-signed JWT
session, a single-use token, Mailgun delivery, no password. The gate lives in
[`src/proxy.ts`](src/proxy.ts); the auth module is
[`src/lib/auth/`](src/lib/auth/).

Non-admins who reach the sign-in screen can join a waitlist instead of being
turned away; signups are reviewed in the `/admin` dashboard and forwarded to
WitUS Inbox. A persistent global navigation header ties the console together.

## Stack

Next.js 16 · TypeScript (strict) · Tailwind v4 · shadcn/ui ·
`@langchain/langgraph` · `@langchain/anthropic` + `@langchain/google-genai` ·
Drizzle ORM + Neon Postgres · LangSmith · Vitest · Node 20+.

## Quick start

```sh
nvm use                          # Node 20+ (see .nvmrc)
npm install
cp .env.example .env.local       # fill in keys — .env.example documents each one
npm test                         # offline; the suite mocks the LLM
npm run dev
```

The agent needs `ANTHROPIC_API_KEY` (or `GOOGLE_API_KEY`); every other key is
optional and its tool fails soft when absent.

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
    llm.ts        Claude / Gemini model factory
    graph.ts      the agent graph; exports MAX_REVISIONS (default 3)
    nodes/        research · outline · write · critique ·
                  generateImagePrompts · flagForHumanReview
    tools/        webSearch · cloudinaryMetadata · existingWanderlearnCourses
  db/schema.ts    Drizzle schema — field_reports, field_report_revisions
  lib/            env access, report queries, LangSmith + Cloudinary helpers
  app/            Next.js app router — operator console + API routes
tests/            Vitest suites; the LLM is mocked, so the suite runs offline
```

## Curriculum

Four code-along lessons on the LangGraph patterns behind this agent — each
taught on a different sample domain so the patterns transfer:

1. [Reflection loops](docs/lessons/01-reflection-loops.md)
2. [Writing rubrics an LLM can score](docs/lessons/02-writing-rubrics.md)
3. [Turning a rubric into a LangSmith eval](docs/lessons/03-langsmith-evals.md)
4. [Cyclic graphs without infinite loops](docs/lessons/04-termination.md)

## Environment

Every variable is documented in [`.env.example`](.env.example). LangSmith
tracing is on by default; the app runs fine without `LANGSMITH_API_KEY`.

## License

Private — © B4C LLC. An AwesomeWebStore.com brand.
