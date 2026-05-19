@AGENTS.md

# Wanderlearn Field Reporter

A LangGraph (LangChain JS) agent that turns a raw Wanderlearn capture — location
transcript, GPS, photo references — into a publishable lesson draft. The agent
researches the location, drafts an objectives-first outline, writes a cited
script, then self-critiques against a rubric and revises until the draft passes
or hits a max revision count. It is **shared infrastructure** in the WitUS
ecosystem and a sibling of Wanderlearn (the 360° place-based course product).

This repo is also a **portfolio piece** for LangChain hiring managers — the
reflection / self-critique loop and the `docs/lessons/` curriculum are meant to
be read by outside engineers. Keep the code legible.

---

## ⚠️ Ecosystem repo identity (don't confuse these)

This repo (`wanderlearn-field-reporter`, under `claude/lang-chain/`) is the
LangGraph **lesson-drafting agent**. It is **not** the Wanderlearn product app
(`gemini/wanderlearn/`), which owns the 360° captures, the course library, and
the public Wanderlearn site. This repo only drafts lessons *from* captures; the
operator reviews each draft and publishes it into Wanderlearn manually.

The site **brandanthonymcdonald.com** (BAM's personal portfolio) lives in
`/Users/bam/Code_NOiCloud/ai-builds/claude/bam-landing-page/` — **NOT**
`bam-portfolio`. A stray directory at
`/Users/bam/Code_NOiCloud/projects/bam-portfolio/` exists from a prior misplaced
`Write` call; it is not a real repo. When asked to work on the
brandanthonymcdonald.com codebase, target `bam-landing-page`.

---

## Branding — read before any UI change

Ecosystem branding is canonical at `gemini/witus/public/brand/` (README +
`footer-recipe.md`). This app uses the **`sky` accent** — Wanderlearn's ecosystem
accent per `gemini/witus/lib/products.ts` — on a slate surface. The ecosystem
footer (`src/components/site-footer.tsx`) carries the verbatim **Rise Wellness**
non-affiliation disclaimer; it must stay **byte-identical** — never paraphrase
it. Favicons are the WitUS brand package, variant `01-orbit`, copied into
`public/brand/witus/` and wired via `metadata.icons` in `src/app/layout.tsx`.

---

## Operator-task rule

Anytime work requires BAM to do something **outside the editor** — API key
generation, account signup, env-var setup, DNS, vendor dashboard configuration,
PR review/merge — create a task file under `./plans/user-tasks/`. No exceptions
for "small" steps. The index `./plans/user-tasks/00-descriptions.md` is the queue
BAM scans at session start; its table uses the columns
`# | Title | Scope | Blocks | Status`. Ecosystem-wide tasks live in the canonical
witus queue at `gemini/witus/plans/user-tasks/`. Full rule: `gemini/witus/CLAUDE.md`.

---

## Branch-hygiene rule

In force across every ecosystem repo. **Half 1** — Claude branches → commits →
pushes → stops; BAM merges. Never `git checkout main && git merge`, never
`git push --force`. Re-run `git branch --show-current` before *every* commit.
**Half 2** — BAM merges pushed branches between sessions; assume prior branches
are already merged into `main` at session start, and watch for the silent
fast-forward trap mid-session. **Half 3** — one concern per branch; consolidate
multiple branches into one `bundle/<slug>-YYYY-MM-DD` with `git merge --no-ff`
before handoff. Full rule: `gemini/witus/CLAUDE.md`.

---

## Citation rule

The `docs/lessons/` curriculum (Day 6) is teachable content — it uses **APA 7
in-line citations** (`(Author, Year)`) with a `## References` section per file.
The rule covers all curriculum / professional / business writing ecosystem-wide.
It does **not** apply to code comments, READMEs, `plans/user-tasks/*`, or
engineering notes. Full rule: `gemini/witus/CLAUDE.md`.

---

## Project specifics

- **Stack:** Next.js 16 (app router, `src/`), TypeScript strict, Tailwind v4,
  shadcn/ui, `@langchain/langgraph`, Drizzle ORM on `@neondatabase/serverless`,
  Vitest. Node 20+.
- **LLM:** Claude Sonnet 4.6 (`@langchain/anthropic`, model id
  `claude-sonnet-4-6`), built via the factory in `src/agent/llm.ts`.
- **The agent** is a cyclic reflection graph: research → outline → write →
  critique → (revise | done). The rubric in `src/agent/rubric.ts` is the single
  source of truth — the critique node scores against it; edit the rubric there,
  never in node code. `MAX_REVISIONS` (default 3) is exported from
  `src/agent/graph.ts`. Agent nodes are pure, fail-soft functions of state.
- **LangSmith** tracing is on by default but the app must still run if
  `LANGSMITH_API_KEY` is missing.
- **The `webSearch` tool** (Day 3) may never be called more than 5 times per
  agent run — enforced as a node-level guard, never a prompt instruction.
- **Build plan:** the PRD is `plans/PRD-3-wanderlearn-field-reporter.md`; the
  approved Day-1 plan is `~/.claude/plans/add-plans-dir-to-elegant-cascade.md`.

### Day status

- **Day 1:** scaffold + linear graph skeleton with a stub critique. Done.
- **Day 2 (current):** real critique node + cyclic write→critique edge +
  `MAX_REVISIONS` termination + `tests/agent/termination.test.ts`. Done.
- **Day 3:** `webSearch` (Tavily) and `cloudinaryMetadata` tools.
  `@langchain/community` was deferred from Day 1 — installing it alongside
  `@langchain/core` 1.x triggers an `ERESOLVE` peer conflict (it drags in the
  `langchain` meta-package + `@getzep/zep-cloud` with old `@langchain/core`
  ranges). When wiring Tavily, install `@langchain/tavily` (the current home of
  the Tavily tool) or `@langchain/community` with `--legacy-peer-deps`.
